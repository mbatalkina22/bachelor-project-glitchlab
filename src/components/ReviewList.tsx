"use client";

import React, { useState, FormEvent } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import ScrollReveal from '@/components/ScrollReveal';
import { useTranslations } from 'next-intl';
import HeroButton from "./HeroButton";

export interface Review {
  name: string;
  quote: string;
  rating: number;
  avatarSrc: string;
  delay: string;
  date?: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const t = useTranslations('WorkshopDetail');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Additional statistical questions
  const [workshopDifficulty, setWorkshopDifficulty] = useState('');
  const [recommendationLevel, setRecommendationLevel] = useState('');
  const [attendanceReason, setAttendanceReason] = useState('');

  // Handle star rating selection
  const handleRatingChange = (rating: number) => {
    setReviewRating(rating);
    if (formErrors.rating) {
      const newErrors = {...formErrors};
      delete newErrors.rating;
      setFormErrors(newErrors);
    }
  };

  // Handle review text change
  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value);
    if (formErrors.reviewText && e.target.value.trim() !== '') {
      const newErrors = {...formErrors};
      delete newErrors.reviewText;
      setFormErrors(newErrors);
    }
  };

  // Handle difficulty selection
  const handleDifficultyChange = (difficulty: string) => {
    setWorkshopDifficulty(difficulty);
    if (formErrors.workshopDifficulty) {
      const newErrors = {...formErrors};
      delete newErrors.workshopDifficulty;
      setFormErrors(newErrors);
    }
  };

  // Handle recommendation level selection
  const handleRecommendationChange = (level: string) => {
    setRecommendationLevel(level);
    if (formErrors.recommendationLevel) {
      const newErrors = {...formErrors};
      delete newErrors.recommendationLevel;
      setFormErrors(newErrors);
    }
  };

  // Handle attendance reason selection
  const handleAttendanceReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAttendanceReason(e.target.value);
    if (formErrors.attendanceReason && e.target.value !== '') {
      const newErrors = {...formErrors};
      delete newErrors.attendanceReason;
      setFormErrors(newErrors);
    }
  };

  // Open review modal
  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    // Prevent scrolling of body when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Close review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    // Re-enable scrolling of body
    document.body.style.overflow = 'auto';
    // Reset form errors
    setFormErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (reviewRating === 0) {
      errors.rating = t('pleaseSelectRating');
    }
    
    if (reviewText.trim() === '') {
      errors.reviewText = t('pleaseEnterReview');
    }
    
    if (!workshopDifficulty) {
      errors.workshopDifficulty = t('pleaseSelectOption');
    }
    
    if (!recommendationLevel) {
      errors.recommendationLevel = t('pleaseSelectOption');
    }
    
    if (!attendanceReason) {
      errors.attendanceReason = t('pleaseSelectOption');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle review submission
  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmittingReview(true);

    // In a real app, you would call an API to submit the review
    setTimeout(() => {
      // Collect all review data (including statistical questions)
      const reviewData = {
        text: reviewText,
        rating: reviewRating,
        statistics: {
          difficulty: workshopDifficulty,
          recommendationLevel: recommendationLevel,
          attendanceReason: attendanceReason
        }
      };
      
      console.log('Submitting review with data:', reviewData);
      
      // Add the new review to the list (in a real app, this would come from the API)
      const newReview: Review = {
        name: "You", // In a real app, this would be the user's name
        quote: reviewText,
        rating: reviewRating,
        avatarSrc: "/images/avatar.jpg", // In a real app, this would be the user's avatar
        delay: "delay-0",
        date: "Just now"
      };

      // Reset the form
      setReviewRating(0);
      setReviewText('');
      setWorkshopDifficulty('');
      setRecommendationLevel('');
      setAttendanceReason('');
      setIsSubmittingReview(false);
      setFormErrors({});

      // Show success message within the UI and close modal
      closeReviewModal();
      
      // For now, we'll just log this to the console
      console.log('Review submitted successfully');
    }, 1000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-black">{t('reviews')}</h2>
      
      {/* Leave Review Button */}
      <HeroButton
        text={t('leaveReview')}
        onClick={openReviewModal}
        backgroundColor="#4f46e5"
        textColor="white"
        hoverBackgroundColor="#4338ca"
        hoverTextColor="white"
        padding="mb-6 px-4 py-2"
      />
      
      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={closeReviewModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 z-10">
            {/* Modal Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-black">{t('leaveReview')}</h3>
              <button 
                onClick={closeReviewModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Icon icon="heroicons:x-mark" className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('rating')} *</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-colors w-8 h-8"
                      onClick={() => handleRatingChange(star)}
                    >
                      {star <= reviewRating ? (
                        <Icon 
                          icon="heroicons-solid:star" 
                          className="w-full h-full text-yellow-400" 
                        />
                      ) : (
                        <Icon 
                          icon="heroicons:star" 
                          className="w-full h-full text-gray-300 hover:text-yellow-400" 
                        />
                      )}
                    </button>
                  ))}
                </div>
                {formErrors.rating && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>
                )}
              </div>
              
              {/* Review Text */}
              <div>
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('yourReview')} *
                </label>
                <textarea
                  id="review"
                  rows={4}
                  value={reviewText}
                  onChange={handleReviewTextChange}
                  className={`w-full px-3 py-2 border ${formErrors.reviewText ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black`}
                  placeholder={t('shareYourExperience')}
                ></textarea>
                {formErrors.reviewText && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.reviewText}</p>
                )}
              </div>
              
              {/* Statistical Questions */}
              <div className={`space-y-4 border ${Object.keys(formErrors).some(key => ['workshopDifficulty', 'recommendationLevel', 'attendanceReason'].includes(key)) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-md p-4`}>
                <h4 className="font-medium text-gray-700">{t('additionalFeedback')} *</h4>
                <p className="text-sm text-gray-500 mb-3">{t('statisticalOnly')}</p>
                
                {/* Workshop Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('workshopDifficulty')} *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'tooEasy', label: t('tooEasy') },
                      { key: 'justRight', label: t('justRight') },
                      { key: 'challenging', label: t('challenging') },
                      { key: 'tooDifficult', label: t('tooDifficult') }
                    ].map((level) => (
                      <button
                        key={level.key}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          workshopDifficulty === level.key
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleDifficultyChange(level.key)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.workshopDifficulty && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.workshopDifficulty}</p>
                  )}
                </div>
                
                {/* Recommendation Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('recommendationLevel')} *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'definitely', label: t('definitely') },
                      { key: 'probably', label: t('probably') },
                      { key: 'notSure', label: t('notSure') },
                      { key: 'probablyNot', label: t('probablyNot') },
                      { key: 'definitelyNot', label: t('definitelyNot') }
                    ].map((level) => (
                      <button
                        key={level.key}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          recommendationLevel === level.key
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleRecommendationChange(level.key)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.recommendationLevel && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.recommendationLevel}</p>
                  )}
                </div>
                
                {/* Attendance Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('attendanceReason')} *
                  </label>
                  <select
                    className={`w-full px-3 py-2 border ${formErrors.attendanceReason ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    value={attendanceReason}
                    onChange={handleAttendanceReasonChange}
                  >
                    <option value="">{t('selectOption')}</option>
                    <option value="professionalDevelopment">{t('professionalDevelopment')}</option>
                    <option value="personalInterest">{t('personalInterest')}</option>
                    <option value="academicRequirement">{t('academicRequirement')}</option>
                    <option value="careerChange">{t('careerChange')}</option>
                    <option value="networking">{t('networking')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                  {formErrors.attendanceReason && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.attendanceReason}</p>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingReview}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isSubmittingReview ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmittingReview 
                  ? t('submittingReview')
                  : t('submitReview')}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Existing Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src={review.avatarSrc} 
                    alt={review.name} 
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/100?text=Avatar";
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{review.name}</h4>
                  <span className="text-gray-500 text-sm">{review.date || '2 days ago'}</span>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i}
                      icon={i < review.rating ? "heroicons-solid:star" : "heroicons:star"}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700">{review.quote}</p>
                <div className="mt-3 flex items-center text-sm">
                  <button className="text-gray-500 hover:text-gray-700 mr-4 flex items-center">
                    <Icon icon="heroicons:hand-thumb-up" className="w-4 h-4 mr-1" />
                    <span>Helpful (3)</span>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 flex items-center">
                    <Icon icon="heroicons:flag" className="w-4 h-4 mr-1" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center">
          <button className="text-indigo-600 hover:text-indigo-800 font-medium">
            {t('loadMoreReviews')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
