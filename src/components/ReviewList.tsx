"use client";

import React, { useState, FormEvent } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslations } from "next-intl";
import HeroButton from "./HeroButton";

// Add Google Fonts import
import { Arvo, Bebas_Neue, Dancing_Script, Lobster } from "next/font/google";

// Initialize the fonts
const dancingScript = Dancing_Script({ subsets: ["latin"] });
const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

export interface Review {
  name: string;
  comment?: string;
  circleColor: string;
  circleFont: string;
  circleText: string;
  date?: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const t = useTranslations("WorkshopDetail");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Circle customization state
  const [circleColor, setCircleColor] = useState("#383838");
  const [circleFont, setCircleFont] = useState("Dancing Script");
  const [circleText, setCircleText] = useState("");
  const [comment, setComment] = useState("");

  // Sample words for different languages
  const sampleWords = [
    t("amazing"),
    t("great"),
    t("lovedIt"),
    t("fantastic"),
    t("perfect"),
    t("excellent"),
    t("wonderful"),
    t("superb"),
  ];

  // Open review modal
  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    document.body.style.overflow = "auto";
    setFormErrors({});
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

  // Handle review submission
  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmittingReview(true);

    // In a real app, you would call an API to submit the review
    setTimeout(() => {
      const reviewData = {
        circleColor,
        circleFont,
        circleText,
        comment,
      };

      console.log("Submitting review with data:", reviewData);

      // Add the new review to the list (in a real app, this would come from the API)
      const newReview: Review = {
        name: "You",
        circleColor,
        circleFont,
        circleText,
        comment,
        date: "Just now",
      };

      // Reset the form
      setCircleColor("#383838");
      setCircleFont("Dancing Script");
      setCircleText("");
      setComment("");
      setIsSubmittingReview(false);
      setFormErrors({});

      closeReviewModal();

      console.log("Review submitted successfully");
    }, 1000);
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

  // Circle component with cat ears
  const CircleWithEars = ({
    color,
    font,
    text,
  }: {
    color: string;
    font: string;
    text: string;
  }) => (
    <div className="relative w-32 h-32 mx-auto">
      {/* Simple cat circle with triangular ears */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base circle with shadow */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>

        {/* Left ear - wider triangle */}
        <polygon
          points="25,5 15,25 35,25"
          fill={color}
          stroke="#222"
          strokeWidth="1"
          transform="rotate(-30, 25, 25)"
        />

        {/* Right ear - matched to left ear style */}
        <polygon
          points="75,5 65,25 85,25"
          fill={color}
          stroke="#222"
          strokeWidth="1"
          transform="rotate(30, 75, 25)"
        />

        {/* Main circle */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill={color}
          stroke="#222"
          strokeWidth="1"
          filter="url(#shadow)"
        />

        {/* Text inside circle */}
        <text
          x="50"
          y="55"
          fontFamily={getFontFamily(font)}
          fontSize="14"
          textAnchor="middle"
          fill="white"
          fontWeight="bold"
          dominantBaseline="middle"
        >
          {text}
        </text>
      </svg>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-black">{t("reviews")}</h2>

      {/* Leave Review Button */}
      <HeroButton
        text={t("leaveReview")}
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
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeReviewModal}
          ></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-black">
                {t("leaveReview")}
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

            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              {/* Circle Preview */}
              <div className="mb-6">
                <CircleWithEars
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingReview}
                className={`w-full px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isSubmittingReview ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmittingReview ? t("submittingReview") : t("submitReview")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <CircleWithEars
                  color={review.circleColor}
                  font={review.circleFont}
                  text={review.circleText}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{review.name}</h4>
                  <span className="text-gray-500 text-sm">
                    {review.date || "2 days ago"}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="text-center">
          <button className="text-indigo-600 hover:text-indigo-800 font-medium">
            {t("loadMoreReviews")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
