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
  languageFilter: string[] | string;
  typeFilter?: string[] | string;
  selectedDate?: Date | null;
  handleFilterChange: (filterType: string, value: string) => void;
  handleDateChange?: (date: Date | null) => void;
  resetFilters: () => void;
}

const WorkshopFilters: React.FC<WorkshopFiltersProps> = ({
  ageFilter,
  skillFilter,
  locationFilter,
  categoryFilter,
  techFilter,
  statusFilter,
  languageFilter,
  typeFilter,
  selectedDate,
  handleFilterChange,
  handleDateChange,
  resetFilters
}) => {
  const t = useTranslations('WorkshopsPage');
  
  // State to track which filter sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status']));
  
  // State to track if filters panel is open on mobile
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    getActiveCount(techFilter) +
    getActiveCount(languageFilter);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Filter sections configuration
  const filterSections = [
    {
      key: 'status',
      title: t('status') || 'Status',
      icon: 'heroicons:clock',
      options: ['all', 'future', 'ongoing', 'past'],
      filterValue: statusFilter,
      getLabel: (option: string) => option === 'all' ? t('all') || 'All' : t(option) || option.charAt(0).toUpperCase() + option.slice(1)
    },
    {
      key: 'category',
      title: t('category') || 'Category',
      icon: 'heroicons:tag',
      options: ['all', 'design', 'test', 'prototype'],
      filterValue: categoryFilter,
      getLabel: (option: string) => option === 'all' ? t('all') || 'All' : t(option) || option.charAt(0).toUpperCase() + option.slice(1)
    },
    {
      key: 'skill',
      title: t('skillLevel') || 'Skill Level',
      icon: 'heroicons:academic-cap',
      options: ['all', 'beginner', 'intermediate', 'advanced'],
      filterValue: skillFilter,
      getLabel: (option: string) => {
        if (option === 'all') return t('all') || 'All';
        try {
          const translated = t(option);
          // If translation contains namespace, it failed - use fallback
          if (translated && !translated.includes('WorkshopsPage.')) {
            return translated;
          }
          // Manual fallback for skill levels
          const skillMap: { [key: string]: string } = {
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced'
          };
          return skillMap[option] || option.charAt(0).toUpperCase() + option.slice(1);
        } catch (error) {
          return option.charAt(0).toUpperCase() + option.slice(1);
        }
      }
    },
    {
      key: 'age',
      title: t('age') || 'Age',
      icon: 'heroicons:user-group',
      options: ['all', '6-8', '9-11', '12-13', '14-16', '16+'],
      filterValue: ageFilter,
      getLabel: (option: string) => option === 'all' ? t('allAges') || 'All Ages' : option
    },
    {
      key: 'location',
      title: t('location') || 'Location',
      icon: 'heroicons:map-pin',
      options: ['all', 'in-class', 'out-of-class'],
      filterValue: locationFilter,
      getLabel: (option: string) => {
        if (option === 'all') return t('all') || 'All';
        if (option === 'in-class') return t('inClass') || 'In Class';
        if (option === 'out-of-class') return t('outClass') || 'Out Class';
        return option;
      }
    },
    {
      key: 'tech',
      title: t('techType') || 'Tech Type',
      icon: 'heroicons:device-phone-mobile',
      options: ['all', 'plug', 'unplug'],
      filterValue: techFilter,
      getLabel: (option: string) => option === 'all' ? t('all') || 'All' : t(option) || option.charAt(0).toUpperCase() + option.slice(1)
    },
    {
      key: 'language',
      title: t('language') || 'Language',
      icon: 'heroicons:language',
      options: ['all', 'en', 'it'],
      filterValue: languageFilter,
      getLabel: (option: string) => {
        if (option === 'all') return t('all') || 'All';
        if (option === 'en') return t('languageEnglish') || 'English';
        if (option === 'it') return t('languageItalian') || 'Italian';
        return option;
      }
    }
  ];

  return (
    <div className="w-full lg:w-72">
      {/* Mobile: Collapsible filters toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Icon icon="heroicons:adjustments-horizontal" className="w-5 h-5 mr-3 text-gray-600" />
            <span className="font-medium text-gray-900">{t('filters') || "Filters"}</span>
            {totalActiveFilters > 0 && (
              <span className="ml-2 bg-[#7471f9] text-white text-xs py-1 px-2 rounded-full">
                {totalActiveFilters}
              </span>
            )}
          </div>
          <Icon 
            icon={isFiltersOpen ? "heroicons:chevron-up" : "heroicons:chevron-down"} 
            className="w-5 h-5 text-gray-500" 
          />
        </button>
      </div>

      {/* Filters panel - hidden on mobile when collapsed */}
      <div className={`
        ${isFiltersOpen ? 'block' : 'hidden'} lg:block
        bg-white rounded-lg shadow-sm border border-gray-100 h-fit lg:sticky lg:top-20
      `}>
        {/* Filter header - Desktop only */}
        <div className="hidden lg:block p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Icon icon="heroicons:adjustments-horizontal" className="w-4 h-4 mr-2" />
              {t('filters') || "Filters"}
            </h3>
            {totalActiveFilters > 0 && (
              <button 
                onClick={resetFilters}
                className="text-xs text-[#7471f9] hover:text-[#5f5dd6] flex items-center px-2 py-1 rounded-md hover:bg-gray-50"
                title={t('resetFilters') || "Reset all filters"}
              >
                <Icon icon="heroicons:arrow-path" className="w-3 h-3 mr-1" />
                <span>{t('reset') || 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile header with reset button */}
        <div className="lg:hidden p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('filters') || "Filters"}
            </h3>
            {totalActiveFilters > 0 && (
              <button 
                onClick={resetFilters}
                className="text-sm text-[#7471f9] hover:text-[#5f5dd6] flex items-center px-3 py-1.5 rounded-md hover:bg-gray-50"
                title={t('resetFilters') || "Reset all filters"}
              >
                <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-1" />
                {t('reset') || 'Reset'}
              </button>
            )}
          </div>
        </div>
        
        {/* Filter sections - Mobile optimized */}
        <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
          {filterSections.map((section) => (
            <div key={section.key} className="mb-3">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.key)}
                className="flex items-center justify-between w-full p-2.5 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Icon icon={section.icon} className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm">{section.title}</span>
                  {getActiveCount(section.filterValue) > 0 && (
                    <span className="ml-2 bg-[#7471f9] text-white text-xs py-0.5 px-1.5 rounded-full">
                      {getActiveCount(section.filterValue)}
                    </span>
                  )}
                </div>
                <Icon 
                  icon={expandedSections.has(section.key) ? "heroicons:chevron-up" : "heroicons:chevron-down"} 
                  className="w-4 h-4 text-gray-500" 
                />
              </button>
              
              {/* Section content */}
              {expandedSections.has(section.key) && (
                <div className="mt-2 pl-1">
                  {/* Mobile: Use a responsive grid for filter options */}
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {section.options.map((option) => {
                      const isSelected = isValueSelected(section.filterValue, option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleFilterClick(section.key, option)}
                          className={`
                            px-3 py-2 text-xs lg:text-sm rounded-lg transition-all duration-200 font-medium text-center lg:text-left
                            ${isSelected 
                              ? 'bg-[#7471f9] text-white shadow-sm transform scale-105' 
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }
                          `}
                        >
                          {section.getLabel(option)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopFilters;