
"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import WorkshopCard from "@/components/WorkshopCard";
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react";
import { useTranslations } from 'next-intl';
import HeroButton from "@/components/HeroButton";
import { useParams } from "next/navigation";

interface Workshop {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  imageSrc: string;
  categories: string[];
  level: string;
  location: string;
  instructorId: string;
  delay?: string;
  bgColor?: string;
  canceled?: boolean;
}

const FeaturedWorkshops = () => {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";
  const t = useTranslations('FeaturedWorkshops');
  
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 3;
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState(0);

  const fetchWorkshops = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Add cache-busting query parameter and explicit credentials
      const response = await fetch(`/api/workshops?t=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch workshops: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      // Get today's date
      const today = new Date();
      
      // Filter out canceled workshops and workshops with past dates
      const activeWorkshops = data.filter((workshop: Workshop) => {
        // Ensure startDate is properly parsed
        const startDate = workshop.startDate ? new Date(workshop.startDate) : null;
        // Skip any workshops with invalid dates
        if (!startDate || isNaN(startDate.getTime())) return false;
        return !workshop.canceled && startDate >= today;
      });
      
      // Sort the remaining workshops by date (closest to today first)
      const sortedWorkshops = activeWorkshops.sort((a: Workshop, b: Workshop) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Take the first 6 (closest upcoming workshops)
      const upcomingWorkshops = sortedWorkshops.slice(0, 6).map((workshop: Workshop, index: number) => ({
        ...workshop,
        id: workshop._id,
        title: workshop.name,
        delay: `delay-${(index % 3 + 1) * 100}`,
        bgColor: getBgColor(index)
      }));
      
      setWorkshops(upcomingWorkshops);
      setRetryCount(0); // Reset retry counter on success
    } catch (err) {
      setError('Failed to load workshops');
      
      // Retry logic for fetch failures
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchWorkshops();
        }, 1000); // Wait 1 second before retrying
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch workshops when component mounts and is ready
  useEffect(() => {
    if (mounted) {
      fetchWorkshops();
    }
  }, [mounted]);
  
  // Function to rotate through background colors
  const getBgColor = (index: number) => {
    const colors = ["#c3c2fc", "#f8c5f4", "#fee487", "#aef9e1"];
    return colors[index % colors.length];
  };

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

  if (!mounted) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <Icon icon="heroicons:exclamation-circle" className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchWorkshops}
            className="mt-4 px-4 py-2 bg-[#7471f9] text-white rounded-md hover:bg-[#5f5dd6]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-secularone mb-6 text-black">{t('title')}</h2>
          <p className="text-gray-500 mb-8">No upcoming workshops available at the moment.</p>
          <div className="flex justify-center">
            <HeroButton 
              text={t('viewAllButton')}
              href={`/${locale}/workshops`}
              backgroundColor="#7471f9"
              textColor="white"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-center items-center mb-12">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-secularone text-black">{t('title')}</h2>
          </ScrollReveal>
        </div>
        
        {/* Horizontal scrollable container */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide snap-x snap-mandatory px-4 md:px-0">
            {workshops.map((workshop, index) => (
              <div key={workshop._id} className="flex-shrink-0 w-[calc(100vw-2rem)] sm:w-80 md:w-96 snap-center">
                <ScrollReveal className={workshop.delay}>
                  <WorkshopCard
                    id={workshop._id}
                    title={workshop.name}
                    description={workshop.description}
                    startDate={new Date(workshop.startDate)}
                    endDate={new Date(workshop.endDate)}
                    imageSrc={workshop.imageSrc}
                    delay={workshop.delay || ""}
                    bgColor={workshop.bgColor}
                  />
                </ScrollReveal>
              </div>
            ))}
          </div>
          
          {/* Scroll indicator hint */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center text-gray-500 text-sm">
              <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-1" />
              <span>{t('scrollHint')}</span>
              <Icon icon="heroicons:arrow-right" className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
        
        {/* Pagination Controls - removed since we're using horizontal scroll */}
        {/* <div className="flex justify-center items-center mt-12 space-x-4">
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
        </div> */}
        
        <div className="text-center mt-12">
          <HeroButton 
            text={t('viewAllButton')}
            href={`/${locale}/workshops`}
            backgroundColor="#7471f9"
            textColor="white"
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturedWorkshops;