"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import TestimonialCard from "@/components/TestimonialCard";
import { Icon } from "@iconify/react";
import { useTranslations } from 'next-intl';

const Testimonials = () => {
  const t = useTranslations('Testimonials');
  const testimonials = [
    { 
      name: "Sarah Johnson", 
      quote: "The workshops offered here have significantly improved my design skills.", 
      rating: 5, 
      avatarSrc: "/images/avatar.jpg", 
      delay: "delay-100",
      circleText: "Inspiring",
      circleColor: "#7471f9",
      circleFont: "Dancing Script",
      workshopId: "1",
      workshopName: "UI/UX Design Workshop"
    },
    { 
      name: "Michael Chen", 
      quote: "I've attended three JavaScript workshops so far, and each one has been excellent.", 
      rating: 5, 
      avatarSrc: "/images/avatar2.jpg", 
      delay: "delay-200",
      circleText: "Amazing",
      circleColor: "#f39aec",
      circleFont: "Lobster",
      workshopId: "2",
      workshopName: "Advanced JavaScript"
    },
    { 
      name: "Emily Rodriguez", 
      quote: "The product management workshop exceeded my expectations.", 
      rating: 4, 
      avatarSrc: "/images/avatar3.jpg", 
      delay: "delay-300",
      circleText: "Creative",
      circleColor: "#fdcb2a",
      circleFont: "Arvo",
      workshopId: "3",
      workshopName: "Product Management Essentials"
    },
    { 
      name: "David Kim", 
      quote: "The data visualization workshop was exactly what I needed.", 
      rating: 5, 
      avatarSrc: "/images/avatar4.jpg", 
      delay: "delay-100",
      circleText: "Fun",
      circleColor: "#5dfdcf",
      circleFont: "Bebas Neue",
      workshopId: "4",
      workshopName: "Data Visualization Techniques"
    },
    { 
      name: "Jessica Martinez", 
      quote: "I was hesitant about taking an online workshop, but it exceeded my expectations.", 
      rating: 4, 
      avatarSrc: "/images/avatar5.jpg", 
      delay: "delay-200",
      circleText: "Practical",
      circleColor: "#7471f9",
      circleFont: "Dancing Script",
      workshopId: "5",
      workshopName: "Remote Team Collaboration"
    },
    { 
      name: "Robert Wilson", 
      quote: "The advanced JavaScript workshop helped me level up my skills significantly.", 
      rating: 5, 
      avatarSrc: "/images/avatar6.jpg", 
      delay: "delay-300",
      circleText: "Insightful",
      circleColor: "#f39aec",
      circleFont: "Lobster",
      workshopId: "2",
      workshopName: "Advanced JavaScript"
    }
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const pageCount = Math.ceil(testimonials.length / itemsPerPage);

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < pageCount - 1 ? prev + 1 : prev));
  };

  const visibleTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-secularone mb-12 text-center text-black">{t('title')}</h2>
        </ScrollReveal>
        
        <div className="relative">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
              {visibleTestimonials.map((testimonial, index) => {
                const isCenter = index === 1;
                return (
                  <ScrollReveal 
                    key={`${currentPage}-${index}`} 
                    className={testimonial.delay}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isCenter 
                          ? "transform scale-105 z-10 md:mt-0" 
                          : "transform scale-95 md:mt-4"
                      }`}
                    >
                      <TestimonialCard {...testimonial} />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 space-x-4">
            <button 
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`p-2 rounded-full ${currentPage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
              aria-label="Previous page"
            >
              <Icon icon="heroicons:chevron-left" className="w-6 h-6" />
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPage === index ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              disabled={currentPage === pageCount - 1}
              className={`p-2 rounded-full ${currentPage === pageCount - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
              aria-label="Next page"
            >
              <Icon icon="heroicons:chevron-right" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
