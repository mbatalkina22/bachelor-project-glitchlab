"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import WorkshopCard from "@/components/WorkshopCard";
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react";
import { useTranslations } from 'next-intl';

const FeaturedWorkshops = () => {
  const router = useRouter();
  const t = useTranslations('FeaturedWorkshops');
  const workshops = [
    {
      title: "UX Design Fundamentals",
      description: "Learn the basics of user experience design in this hands-on workshop.",
      date: "June 15, 2023",
      time: "2:00 PM - 5:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-100"
    },
    {
      title: "Advanced JavaScript Patterns",
      description: "Dive deep into advanced JavaScript patterns and techniques.",
      date: "June 22, 2023",
      time: "10:00 AM - 3:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-200"
    },
    {
      title: "Data Visualization with D3.js",
      description: "Create stunning data visualizations using the D3.js library.",
      date: "July 5, 2023",
      time: "1:00 PM - 4:30 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-300"
    },
    {
      title: "React Performance Optimization",
      description: "Learn techniques to optimize your React applications for better performance.",
      date: "July 12, 2023",
      time: "9:00 AM - 12:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-100"
    },
    {
      title: "Introduction to Machine Learning",
      description: "Get started with machine learning concepts and practical applications.",
      date: "July 18, 2023",
      time: "1:00 PM - 5:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-200"
    },
    {
      title: "Responsive Web Design",
      description: "Create websites that look great on any device using modern CSS techniques.",
      date: "July 25, 2023",
      time: "10:00 AM - 2:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-300"
    }
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const pageCount = Math.ceil(workshops.length / itemsPerPage);

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < pageCount - 1 ? prev + 1 : prev));
  };

  const visibleWorkshops = workshops.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-black">{t('title')}</h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleWorkshops.map((workshop, index) => (
            <ScrollReveal key={`${currentPage}-${index}`} className={workshop.delay}>
              <WorkshopCard {...workshop} />
            </ScrollReveal>
          ))}
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
        
        <div className="text-center mt-12">
          <button onClick={() => router.push('/workshops')} className="bg-black hover:bg-transparent hover:text-black hover:border hover:border-black text-white py-3 px-6 rounded-full transition-colors text-lg font-medium">
            {t('viewAllButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedWorkshops; 