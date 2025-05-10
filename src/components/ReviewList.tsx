"use client";

import React, { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslations } from "next-intl";
import HeroButton from "./HeroButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Add Google Fonts import
import { Arvo, Bebas_Neue, Dancing_Script, Lobster } from "next/font/google";

// Initialize the fonts
const dancingScript = Dancing_Script({ subsets: ["latin"] });
const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

export interface Review {
  _id?: string;
  user?: string;
  workshop?: string;
  userName: string;
  circleColor: string;
  circleFont: string;
  circleText: string;
  comment?: string;
  createdAt?: string;
  date?: string; // For backward compatibility
}

interface ReviewListProps {
  workshopId: string;
  initialReviews?: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ workshopId, initialReviews = [] }) => {
  const t = useTranslations("WorkshopDetail");
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const reviewSectionRef = React.useRef<HTMLDivElement>(null);
  
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 3; // Number of reviews to fetch per request

  // Circle customization state
  const [circleColor, setCircleColor] = useState("#383838");
  const [circleFont, setCircleFont] = useState("Dancing Script");
  const [circleText, setCircleText] = useState("");
  const [comment, setComment] = useState("");

  // Sample words for different languages
  const sampleWords = [
    t("inspiring"),
    t("boring"),
    t("fun"),
    t("creative"),
    t("confusing")
  ];

  // Fetch reviews for the workshop
  useEffect(() => {
    const fetchReviews = async () => {
      if (!workshopId) return;
      
      try {
        const response = await fetch(`/api/reviews?workshopId=${workshopId}&limit=${LIMIT}&offset=0`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched reviews:", data); // Debug log
          
          // Make sure we're working with the reviews array from the response
          if (!Array.isArray(data.reviews)) {
            console.error("Expected reviews array in response, got:", data);
            return;
          }
          
          // Sort reviews so that the user's review appears at the top
          const sortedReviews = data.reviews.sort((a: Review, b: Review) => {
            if (a.user === user?._id) return -1;
            if (b.user === user?._id) return 1;
            return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
          });
          
          setReviews(sortedReviews);
          setOffset(data.reviews.length); // Set offset for next page
          setHasMore(data.pagination.hasMore);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    
    setOffset(0); // Reset offset when workshopId changes
    fetchReviews();
  }, [workshopId, user?._id]);

  // Check if user has already reviewed the workshop
  useEffect(() => {
    const checkUserReview = async () => {
      if (!isAuthenticated || !workshopId) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`/api/reviews/check?workshopId=${workshopId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setHasReviewed(data.hasReviewed);
          if (data.hasReviewed && data.review) {
            setUserReview(data.review);
          }
        }
      } catch (error) {
        console.error("Error checking review status:", error);
      }
    };
    
    checkUserReview();
  }, [isAuthenticated, workshopId]);

  // Load more reviews
  const handleLoadMore = async () => {
    if (!workshopId || isLoadingMore) return;
    
    setIsLoadingMore(true);
    console.log(`Loading more reviews - current offset: ${offset}, limit: ${LIMIT}`);
    
    try {
      const response = await fetch(`/api/reviews?workshopId=${workshopId}&limit=${LIMIT}&offset=${offset}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded more reviews:", data); // Debug log
        
        if (!Array.isArray(data.reviews)) {
          console.error("Expected reviews array in response, got:", data);
          setIsLoadingMore(false);
          return;
        }
        
        if (data.reviews.length === 0) {
          setHasMore(false);
          setIsLoadingMore(false);
          return;
        }
        
        // Update reviews state by appending new reviews
        setReviews(prevReviews => [
          ...prevReviews, 
          ...data.reviews.filter((newReview: Review) => 
            !prevReviews.some(existingReview => existingReview._id === newReview._id)
          )
        ]);
        
        // Update pagination state
        setOffset(prev => prev + data.reviews.length);
        console.log(`New offset after loading more: ${offset + data.reviews.length}, has more: ${data.pagination.hasMore}`);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error("Error loading more reviews:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Open review modal in create mode
  const openReviewModal = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsEditMode(false);
    setEditingReviewId(null);
    
    // Reset form
    setCircleColor("#383838");
    setCircleFont("Dancing Script");
    setCircleText("");
    setComment("");
    
    setIsReviewModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  
  // Open review modal in edit mode
  const openEditReviewModal = (review: Review) => {
    if (!review._id) return;
    
    setIsEditMode(true);
    setEditingReviewId(review._id);
    
    // Pre-fill form with review data
    setCircleColor(review.circleColor);
    setCircleFont(review.circleFont);
    setCircleText(review.circleText);
    setComment(review.comment || "");
    
    setIsReviewModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    document.body.style.overflow = "auto";
    setFormErrors({});
    setMessage(null);
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (reviewId: string) => {
    setDeletingReviewId(reviewId);
    setIsDeleteModalOpen(true);
  };
  
  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeletingReviewId(null);
    setIsDeleteModalOpen(false);
    setIsDeleting(false);
  };

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!circleText) {
      errors.circleText = t("pleaseSelectWord");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle review submission (create or update)
  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !isAuthenticated) {
      return;
    }

    setIsSubmittingReview(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const reviewData = {
        workshop: workshopId,
        circleColor,
        circleFont,
        circleText,
        comment,
      };

      let response;
      let responseData: any;
      
      if (isEditMode && editingReviewId) {
        // Update existing review
        response = await fetch(`/api/reviews/${editingReviewId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        });
        
        responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to update review');
        }
        
        console.log("Updated review:", responseData); // Debug log
        
        // Update the review in the list
        const updatedReviews = reviews.map(review => 
          review._id === editingReviewId ? responseData : review
        );
        
        setReviews(updatedReviews);
        setUserReview(responseData);
        
        setMessage({
          text: t('reviewUpdated'),
          type: 'success'
        });
      } else {
        // Create new review
        response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reviewData)
        });

        responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to submit review');
        }
        
        console.log("Created review:", responseData); // Debug log

        // Add the new review to the list
        setReviews([responseData, ...reviews]);
        setHasReviewed(true);
        setUserReview(responseData);
        
        setMessage({
          text: t('reviewSubmitted'),
          type: 'success'
        });
      }
      
      // Reset the form
      setCircleColor("#383838");
      setCircleFont("Dancing Script");
      setCircleText("");
      setComment("");
      
      setTimeout(() => {
        closeReviewModal();
      }, 2000);
    } catch (error: any) {
      console.error("Review submission error:", error);
      setMessage({
        text: error.message || 'Failed to submit review',
        type: 'error'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  // Handle review deletion
  const handleDeleteReview = async () => {
    if (!deletingReviewId || !isAuthenticated) return;
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/reviews/${deletingReviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete review');
      }
      
      // Remove the review from the list
      setReviews(prevReviews => 
        prevReviews.filter(review => review._id !== deletingReviewId)
      );
      
      // If this was the user's review, update state
      if (userReview?._id === deletingReviewId) {
        setHasReviewed(false);
        setUserReview(null);
      }
      
      closeDeleteModal();
    } catch (error: any) {
      console.error("Review deletion error:", error);
      alert(error.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to get the font family based on the selection
  const getFontFamily = (fontName: string) => {
    switch (fontName) {
      case "Dancing Script":
        return dancingScript.style.fontFamily;
      case "Lobster":
        return lobster.style.fontFamily;
      case "Arvo":
        return arvo.style.fontFamily;
      case "Bebas Neue":
        return bebasNeue.style.fontFamily;
      default:
        return dancingScript.style.fontFamily;
    }
  };

  // Completely revised Stamp component with direct color application
  const Stamp = ({
    color,
    font,
    text,
  }: {
    color: string;
    font: string;
    text: string;
  }) => {
    return (
      <div className="relative w-32 h-32 mx-auto">
        <div className="relative w-full h-full">
          {/* Force re-render by using color as key */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 66.73 69.75"
            className="absolute inset-0 w-full h-full"
            style={{ filter: `drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))` }}
            key={color} // Add key to force re-render when color changes
          >
            <g id="Layer_2" data-name="Layer 2">
              <g id="Layer_3" data-name="Layer 3">
                {/* Apply color directly to fill attribute for each path */}
                <path fill={color} d="M38.54,5.1A30.11,30.11,0,0,1,61.75,24.72h4.87l.06-.44-1.94-2V19.44l-2.22-1.73-.44-2.77-2.45-1.38-.84-2.68-2.63-1L54.92,7.36l-2.75-.59L50.58,4.45l-2.8-.17L45.86,2.22l-2.8.25L40.85.73l-2.73.66L35.68,0,33.07,1.06,30.45,0,28,1.48,25.29.86,23.12,2.64l-2.81-.2L18.43,4.53l-2.8.22L14.07,7.1l-2.73.64-1.19,2.54-2.61,1L6.74,14,4.32,15.43l-.39,2.79L1.74,20l0,2.81L0,24.72H5A30.12,30.12,0,0,1,38.54,5.1Z"/>
                <path fill={color} d="M61.68,45A30.11,30.11,0,0,1,5.05,45H.11l-.06.44L2,47.5l0,2.81L4.22,52l.44,2.77,2.45,1.38L8,58.87l2.63,1,1.23,2.53,2.75.59,1.59,2.32,2.8.17,1.92,2.06,2.8-.25L25.88,69l2.73-.66,2.44,1.39,2.6-1.06,2.63,1,2.41-1.43,2.75.62,2.17-1.78,2.81.2,1.88-2.09L51.1,65l1.55-2.35L55.39,62l1.19-2.55,2.61-1,.79-2.7,2.43-1.41.39-2.79L65,49.77,65,47,66.73,45Z"/>
                <path fill={color} d="M22.23,6.8,25,4.12,7.38.68A4,4,0,0,0,2.73,5.1l1.1,19.69L5.65,23A30.11,30.11,0,0,1,22.23,6.8Z"/>
                <path fill={color} d="M63.48,4.57A4,4,0,0,0,58.76.24L41.24,4,44,6.61a30.14,30.14,0,0,1,16.86,16l1.84,1.75Z"/>
                <path fill={color} d="M37.63,10.3a24.87,24.87,0,0,0-27,14.42h2.21a22.83,22.83,0,0,1,41,0h2.22a25.68,25.68,0,0,0-2.4-4.23A24.69,24.69,0,0,0,37.63,10.3Z"/>
                <path fill={color} d="M29.44,57.28A22.8,22.8,0,0,1,13,45H10.74A24.82,24.82,0,0,0,29.1,59.25a25.2,25.2,0,0,0,4.32.37A24.87,24.87,0,0,0,56,45H53.78A22.87,22.87,0,0,1,29.44,57.28Z"/>
                <path fill={color} d="M45.35,51.83a20.84,20.84,0,0,1-29-5.07c-.39-.56-.76-1.14-1.09-1.73H13a22.84,22.84,0,0,0,40.82,0H51.49A20.77,20.77,0,0,1,45.35,51.83Z"/>
                <path fill={color} d="M33.35,13.93a21,21,0,0,1,3.6.31,20.73,20.73,0,0,1,13.47,8.55,21.28,21.28,0,0,1,1.19,1.93h2.26a22.83,22.83,0,0,0-41,0h2.27A20.9,20.9,0,0,1,33.35,13.93Z"/>
                <path fill={color} d="M42.4,45.07a.47.47,0,0,0-.54.13l-.81.91-1.22,0a.47.47,0,0,0-.46.31.47.47,0,0,0,.13.53l.91.82,0,1.22a.49.49,0,0,0,.31.46.5.5,0,0,0,.54-.13l.81-.91,1.22,0a.49.49,0,0,0,.33-.85l-.91-.81,0-1.22A.48.48,0,0,0,42.4,45.07Z"/>
                <path fill={color} d="M34.22,48.07a.46.46,0,0,0-.54.13l-.82.91-1.22,0a.48.48,0,0,0-.33.84l.92.82,0,1.22a.49.49,0,0,0,.31.46.49.49,0,0,0,.54-.13l.81-.91,1.23,0a.49.49,0,0,0,.33-.85l-.92-.81,0-1.22A.47.47,0,0,0,34.22,48.07Z"/>
                <path fill={color} d="M26,45.07a.47.47,0,0,0-.54.13l-.81.91-1.22,0a.47.47,0,0,0-.46.31.45.45,0,0,0,.13.53l.91.82L24,49a.47.47,0,0,0,.31.46.5.5,0,0,0,.54-.13l.81-.91,1.22,0a.49.49,0,0,0,.46-.31.5.5,0,0,0-.13-.54l-.91-.81,0-1.22A.48.48,0,0,0,26,45.07Z"/>
                <path fill={color} d="M24.05,24.28a.49.49,0,0,0,.54-.13l.81-.92,1.23,0a.48.48,0,0,0,.33-.84L26,21.59l0-1.22a.49.49,0,0,0-.85-.33l-.81.92-1.23,0a.49.49,0,0,0-.33.85l.92.81,0,1.23A.47.47,0,0,0,24.05,24.28Z"/>
                <path fill={color} d="M32.24,21.28a.5.5,0,0,0,.54-.13l.81-.92,1.22,0a.47.47,0,0,0,.46-.3.46.46,0,0,0-.13-.54l-.91-.82,0-1.22a.48.48,0,0,0-.31-.46.5.5,0,0,0-.54.13l-.81.92-1.22,0a.49.49,0,0,0-.46.31.49.49,0,0,0,.13.54l.91.81,0,1.23A.5.5,0,0,0,32.24,21.28Z"/>
                <path fill={color} d="M40.43,24.28a.48.48,0,0,0,.53-.13l.82-.92,1.22,0a.48.48,0,0,0,.46-.3.49.49,0,0,0-.13-.54l-.91-.82,0-1.22a.49.49,0,0,0-.85-.33l-.81.92-1.22,0a.48.48,0,0,0-.46.31.47.47,0,0,0,.12.54l.92.81,0,1.23A.48.48,0,0,0,40.43,24.28Z"/>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Text positioned in center */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <span 
            style={{ 
              fontFamily: getFontFamily(font),
              color: color,
              fontSize: '20px',
              textAlign: 'center'
            }}
            className="font-bold px-2"
          >
            {text}
          </span>
        </div>
      </div>
    );
  };

  // Handle scrolling to the review section when hash is 'reviews'
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the URL has the hash fragment '#reviews'
      if (window.location.hash === '#reviews' && reviewSectionRef.current) {
        // Small delay to ensure proper scrolling after page load
        setTimeout(() => {
          reviewSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 500);
      }
    }
  }, []);

  // Handle scrolling to the review section when hash is 'reviews'
  useEffect(() => {
    // Function to handle scrolling
    const scrollToReviews = () => {
      if (reviewSectionRef.current) {
        // Add some extra offset to account for header/navigation
        const yOffset = -80; 
        const element = reviewSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
        
        console.log('Scrolling to reviews section');
      }
    };
    
    // Check if we should scroll (based on hash)
    if (typeof window !== 'undefined' && window.location.hash === '#reviews') {
      // Try immediately
      scrollToReviews();
      
      // Also try after a delay to ensure content is loaded
      setTimeout(scrollToReviews, 500);
      
      // And also try after images and other resources might have loaded
      window.addEventListener('load', scrollToReviews);
      
      return () => {
        window.removeEventListener('load', scrollToReviews);
      };
    }
  }, [reviews]); // Re-run when reviews change to ensure we scroll after content loads

  return (
    <div ref={reviewSectionRef} id="reviews">
      <h2 className="text-2xl font-bold mb-6 text-black">{t("reviews")}</h2>

      {/* Leave Review Button */}
      {hasReviewed ? (
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Icon
              icon="heroicons:check-circle"
              className="w-5 h-5 text-green-500 mr-2"
            />
            <p className="text-green-700">{t("youHaveReviewed")}</p>
          </div>
        </div>
      ) : (
        <HeroButton
          text={t("leaveReview")}
          onClick={openReviewModal}
          backgroundColor="#7471f9"
          textColor="white"
          className="mb-6"
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeReviewModal}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-black">
                {isEditMode ? t("editReview") : t("leaveReview")}
              </h3>
              <button
                onClick={closeReviewModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Icon
                  icon="heroicons:x-mark"
                  className="w-6 h-6 text-gray-500"
                />
              </button>
            </div>

            {message && (
              <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p>{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              {/* Circle Preview */}
              <div className="mb-6">
                <Stamp
                  color={circleColor}
                  font={circleFont}
                  text={circleText || t("previewText")}
                />
              </div>

              {/* Circle Customization */}
              <div className="space-y-4">
                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {t("circleColor")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#383838",
                      "#7471f9",
                      "#f39aec",
                      "#fdcb2a",
                      "#5dfdcf",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          circleColor === color
                            ? "border-gray-900 scale-110"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCircleColor(color)}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {t("circleFont")}
                  </label>
                  <select
                    value={circleFont}
                    onChange={(e) => setCircleFont(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  >
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Lobster">Lobster</option>
                    <option value="Arvo">Arvo</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                  </select>
                </div>

                {/* Word Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {t("chooseWord")} *
                  </label>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {sampleWords.map((word) => (
                      <button
                        key={word}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          circleText === word
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                            : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setCircleText(word)}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                  {formErrors.circleText && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.circleText}
                    </p>
                  )}
                </div>

                {/* Optional Comment */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    {t("comment")} ({t("optional")})
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder={t("enterComment")}
                  />
                </div>
              </div>
              <HeroButton
                text={isSubmittingReview 
                  ? t("submittingReview") 
                  : isEditMode ? t("updateReview") : t("submitReview")}
                onClick={() => handleSubmitReview(new Event('submit') as unknown as FormEvent)}
                backgroundColor="#7471f9"
                textColor="white"
                disabled={isSubmittingReview}
                className="w-full"
              />
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDeleteModal}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 z-10">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <Icon
                    icon="heroicons:exclamation-triangle"
                    className="w-6 h-6 text-red-600"
                  />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                {t("confirmDeleteReview")}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {t("deleteReviewConfirmation")}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
                    isDeleting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleting ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">{t("noReviewsYet")}</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div
              key={review._id || index}
              className={`bg-white rounded-lg shadow-sm p-4 border ${review.user === user?._id ? 'border-indigo-100 bg-indigo-50' : 'border-gray-100'}`}
            >
              {/* Review content */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <Stamp
                    color={review.circleColor}
                    font={review.circleFont}
                    text={review.circleText}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {review.user === user?._id ? `${t("you")} (${review.userName})` : review.userName}
                    </h4>
                    <span className="text-gray-500 text-sm">
                      {review.date || (review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "2 days ago")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              </div>
              
              {/* Edit/Delete buttons inside the review card */}
              {review.user === user?._id && review._id && (
                <div className="flex space-x-2 mt-3 border-t pt-3 justify-end">
                  <button
                    onClick={() => openEditReviewModal(review)}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    <Icon icon="heroicons:pencil-square" className="w-4 h-4 mr-1" />
                    {t("editReview")}
                  </button>
                  <button
                    onClick={() => openDeleteModal(review._id as string)}
                    className="flex items-center text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Icon icon="heroicons:trash" className="w-4 h-4 mr-1" />
                    {t("deleteReview")}
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {reviews.length > 0 && hasMore && (
          <div className="text-center mt-4">
            <button 
              className={`text-indigo-600 hover:text-indigo-800 font-medium ${isLoadingMore ? 'opacity-70 cursor-wait' : ''}`}
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? t("loadingMoreReviews") : t("loadMoreReviews")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
