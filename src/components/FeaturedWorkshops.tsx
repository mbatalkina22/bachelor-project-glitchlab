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
  const itemsPerPage = 3;

  const fetchWorkshops = async () => {
    try {
      setIsLoading(true);
      // Add cache-busting query parameter
      const response = await fetch(`/api/workshops?t=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workshops');
      }
      
      const data = await response.json();
      console.log('Fetched featured workshops:', data.length);
      
      // Add UI specific properties and limit to 6 workshops for featured section
      const featuredWorkshops = data.slice(0, 6).map((workshop: Workshop, index: number) => ({
        ...workshop,
        id: workshop._id,
        title: workshop.name,
        delay: `delay-${(index % 3 + 1) * 100}`,
        bgColor: getBgColor(index)
      }));
      
      setWorkshops(featuredWorkshops);
    } catch (err) {
      console.error('Error fetching workshops:', err);
      setError('Failed to load workshops');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkshops();
  }, []);
  
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
          <p className="text-gray-500 mb-8">No workshops available at the moment.</p>
          <div className="flex justify-center space-x-4">
            <HeroButton 
              text={t('viewAllButton')}
              href={`/${locale}/workshops`}
              backgroundColor="#7471f9"
              textColor="white"
            />
            <button 
              onClick={fetchWorkshops}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 flex items-center"
            >
              <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex-1 flex justify-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-secularone text-black">{t('title')}</h2>
            </ScrollReveal>
          </div>
          <button 
            onClick={fetchWorkshops}
            className="p-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 flex items-center focus:outline-none"
            title="Refresh workshops"
          >
            <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleWorkshops.map((workshop, index) => (
            <ScrollReveal key={`${currentPage}-${index}`} className={workshop.delay}>
              <WorkshopCard
                key={workshop._id}
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