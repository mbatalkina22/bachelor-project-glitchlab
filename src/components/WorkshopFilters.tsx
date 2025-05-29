import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';

interface WorkshopFiltersProps {
  ageFilter: string[] | string;
  skillFilter: string[] | string;
  locationFilter: string[] | string;
  categoryFilter: string[] | string;
  techFilter: string[] | string;
  statusFilter: string[] | string;
  typeFilter?: string[] | string;
  selectedDate?: Date | null;
  handleFilterChange: (filterType: string, value: string) => void;
  handleDateChange?: (date: Date | null) => void;
  resetFilters: () => void; // Add reset function prop
}

const WorkshopFilters: React.FC<WorkshopFiltersProps> = ({
  ageFilter,
  skillFilter,
  locationFilter,
  categoryFilter,
  techFilter,
  statusFilter,
  typeFilter,
  selectedDate,
  handleFilterChange,
  handleDateChange,
  resetFilters
}) => {
  const t = useTranslations('WorkshopsPage');
  // State to control overall filter panel visibility
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // State to track which filter type is currently active
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Helper function to check if a value is selected in array or string comparison
  const isValueSelected = (filterValue: string[] | string, value: string) => {
    if (Array.isArray(filterValue)) {
      return filterValue.includes(value);
    }
    return filterValue === value;
  };

  // Helper function to handle filter button clicks
  const handleFilterClick = (filterType: string, value: string) => {
    handleFilterChange(filterType, value);
  };

  // Get count of active filters per section
  const getActiveCount = (filterValue: string[] | string) => {
    if (Array.isArray(filterValue) && !filterValue.includes('all')) {
      return filterValue.length;
    }
    return 0;
  };
  
  // Total active filters
  const totalActiveFilters = 
    getActiveCount(statusFilter) + 
    getActiveCount(ageFilter) + 
    getActiveCount(skillFilter) + 
    getActiveCount(locationFilter) + 
    getActiveCount(categoryFilter) + 
    getActiveCount(techFilter);
    
  // Function to toggle filter panel visibility
  const toggleFiltersPanel = () => {
    setFiltersVisible(!filtersVisible);
    // Reset active filter when closing
    if (filtersVisible) {
      setActiveFilter(null);
    }
  };

  // Toggle which filter type is displayed
  const toggleFilterType = (filterType: string) => {
    if (activeFilter === filterType) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterType);
    }
  };

  // Handle reset button click
  const handleReset = () => {
    resetFilters();
    setActiveFilter(null);
  };

  return (
    <div className="w-full">
      {/* Filter header with toggle button and reset button */}
      <div className="flex items-center mb-3">
        <button 
          onClick={toggleFiltersPanel}
          className="inline-flex items-center justify-between bg-white p-3 px-5 rounded-full shadow-sm border border-gray-100 text-base mr-2"
        >
          <span className="flex items-center text-gray-800 font-medium">
            <Icon icon="heroicons:adjustments-horizontal" className="w-5 h-5 mr-2" />
            {t('filters') || "Filters"}
            {totalActiveFilters > 0 && (
              <span className="ml-2 bg-[#7471f9] text-white text-xs py-0.5 px-2 rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </span>
          <Icon icon={filtersVisible ? "heroicons:chevron-up" : "heroicons:chevron-down"} className="w-4 h-4 text-gray-500 ml-3" />
        </button>
        
        {/* Reset button - only visible if there are active filters */}
        {totalActiveFilters > 0 && (
          <button 
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 px-4 rounded-full shadow-sm border border-gray-100 flex items-center"
            title={t('resetFilters') || "Reset all filters"}
          >
            <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Filter panel - hidden by default, shown when toggled */}
      {filtersVisible && (
        <div className="mb-4">
          {/* Filter type buttons in a horizontal row */}
          <div className="flex flex-wrap gap-2 mb-3 bg-white p-3 rounded-lg shadow-sm">
            <button
              onClick={() => toggleFilterType('status')}
              className={`px-4 py-2 rounded-full text-sm flex items-center ${
                activeFilter === 'status' ? 'bg-[#7471f9] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon icon="heroicons:clock" className="w-4 h-4 mr-2" />
              {t('status') || "Status"}
              {getActiveCount(statusFilter) > 0 && (
                <span className="ml-2 bg-white text-[#7471f9] text-xs py-0.5 px-1.5 rounded-full">
                  {getActiveCount(statusFilter)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => toggleFilterType('age')}
              className={`px-4 py-2 rounded-full text-sm flex items-center ${
                activeFilter === 'age' ? 'bg-[#7471f9] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon icon="heroicons:user-group" className="w-4 h-4 mr-2" />
              {t('age') || "Age"}
              {getActiveCount(ageFilter) > 0 && (
                <span className="ml-2 bg-white text-[#7471f9] text-xs py-0.5 px-1.5 rounded-full">
                  {getActiveCount(ageFilter)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => toggleFilterType('skill')}
              className={`px-4 py-2 rounded-full text-sm flex items-center ${
                activeFilter === 'skill' ? 'bg-[#7471f9] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon icon="heroicons:academic-cap" className="w-4 h-4 mr-2" />
              {t('skillLevel') || "Skill Level"}
              {getActiveCount(skillFilter) > 0 && (
                <span className="ml-2 bg-white text-[#7471f9] text-xs py-0.5 px-1.5 rounded-full">
                  {getActiveCount(skillFilter)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => toggleFilterType('location')}
              className={`px-4 py-2 rounded-full text-sm flex items-center ${
                activeFilter === 'location' ? 'bg-[#7471f9] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-2" />
              {t('location') || "Location"}
              {getActiveCount(locationFilter) > 0 && (
                <span className="ml-2 bg-white text-[#7471f9] text-xs py-0.5 px-1.5 rounded-full">
                  {getActiveCount(locationFilter)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => toggleFilterType('category')}
              className={`px-4 py-2 rounded-full text-sm flex items-center ${
                activeFilter === 'category' ? 'bg-[#7471f9] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon icon="heroicons:tag" className="w-4 h-4 mr-2" />
              {t('category') || "Category"}
              {getActiveCount(categoryFilter) > 0 && (
                <span className="ml-2 bg-white text-[#7471f9] text-xs py-0.5 px-1.5 rounded-full">
                  {getActiveCount(categoryFilter)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => toggleFilterType('tech')}
              className={`px-4 py-2 rounded-full text-sm flex items-center ${
                activeFilter === 'tech' ? 'bg-[#7471f9] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-2" />
              {t('techType') || "Tech Type"}
              {getActiveCount(techFilter) > 0 && (
                <span className="ml-2 bg-white text-[#7471f9] text-xs py-0.5 px-1.5 rounded-full">
                  {getActiveCount(techFilter)}
                </span>
              )}
            </button>
          </div>
          
          {/* Active filter options displayed horizontally */}
          {activeFilter && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {/* Status Filter Options */}
              {activeFilter === 'status' && (
                <div className="flex flex-wrap gap-2">
                  {['all', 'future', 'ongoing', 'past'].map((status) => (
                    <button
                      key={status}
                      className={`px-4 py-2 text-sm rounded-full transition-all ${
                        isValueSelected(statusFilter, status) 
                          ? 'bg-[#7471f9] text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFilterClick('status', status)}
                    >
                      {status === 'all' ? t('all') || 'All' : t(status) || status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Age Filter Options */}
              {activeFilter === 'age' && (
                <div className="flex flex-wrap gap-2">
                  {['all', '6-8', '9-11', '12-13', '14-16', '16+'].map((age) => (
                    <button
                      key={age}
                      className={`px-4 py-2 text-sm rounded-full transition-all ${
                        isValueSelected(ageFilter, age) 
                          ? 'bg-[#7471f9] text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFilterClick('age', age)}
                    >
                      {age === 'all' ? t('allAges') || 'All Ages' : age}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Skill Level Filter Options */}
              {activeFilter === 'skill' && (
                <div className="flex flex-wrap gap-2">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((skill) => (
                    <button
                      key={skill}
                      className={`px-4 py-2 text-sm rounded-full transition-all ${
                        isValueSelected(skillFilter, skill) 
                          ? 'bg-[#7471f9] text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFilterClick('skill', skill)}
                    >
                      {skill === 'all' ? t('all') || 'All' : t(skill) || skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Location Filter Options */}
              {activeFilter === 'location' && (
                <div className="flex flex-wrap gap-2">
                  {['all', 'in-class', 'out-of-class'].map((location) => (
                    <button
                      key={location}
                      className={`px-4 py-2 text-sm rounded-full transition-all ${
                        isValueSelected(locationFilter, location) 
                          ? 'bg-[#7471f9] text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFilterClick('location', location)}
                    >
                      {location === 'all' ? t('all') || 'All' : 
                       location === 'in-class' ? t('inClass') || 'In Class' : t('outClass') || 'Out Class'}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Category Filter Options */}
              {activeFilter === 'category' && (
                <div className="flex flex-wrap gap-2">
                  {['all', 'design', 'test', 'prototype'].map((category) => (
                    <button
                      key={category}
                      className={`px-4 py-2 text-sm rounded-full transition-all ${
                        isValueSelected(categoryFilter, category) 
                          ? 'bg-[#7471f9] text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFilterClick('category', category)}
                    >
                      {category === 'all' ? t('all') || 'All' : t(category) || category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Tech Type Filter Options */}
              {activeFilter === 'tech' && (
                <div className="flex flex-wrap gap-2">
                  {['all', 'plug', 'unplug'].map((tech) => (
                    <button
                      key={tech}
                      className={`px-4 py-2 text-sm rounded-full transition-all ${
                        isValueSelected(techFilter, tech) 
                          ? 'bg-[#7471f9] text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFilterClick('tech', tech)}
                    >
                      {tech === 'all' ? t('all') || 'All' : t(tech) || tech.charAt(0).toUpperCase() + tech.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkshopFilters;