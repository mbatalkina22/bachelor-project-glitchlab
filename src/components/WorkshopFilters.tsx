import React from 'react';
import { useTranslations } from 'next-intl';

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
  handleDateChange
}) => {
  const t = useTranslations('WorkshopsPage');

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

  return (
    <div className="lg:w-1/6 pl-2 lg:pl-0 pr-2 h-full lg:sticky lg:top-20 self-start">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

      {/* Status Filter */}
      <div className="filter-group mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {['all', 'future', 'ongoing', 'past'].map((status) => (
            <button
              key={status}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                isValueSelected(statusFilter, status) ? 'bg-[#7471f9] text-white border-[#7471f9]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]'
              }`}
              onClick={() => handleFilterClick('status', status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Age Filter */}
      <div className="filter-group mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Age</h3>
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {['all', '6-8', '9-11', '12-13', '14-16', '16+'].map((age) => (
            <button
              key={age}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                isValueSelected(ageFilter, age) ? 'bg-[#7471f9] text-white border-[#7471f9]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]'
              }`}
              onClick={() => handleFilterClick('age', age)}
            >
              {age === 'all' ? 'All Ages' : age}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level Filter */}
      <div className="filter-group mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Skill Level</h3>
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {['all', 'beginner', 'intermediate', 'advanced'].map((skill) => (
            <button
              key={skill}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                isValueSelected(skillFilter, skill) ? 'bg-[#7471f9] text-white border-[#7471f9]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]'
              }`}
              onClick={() => handleFilterClick('skill', skill)}
            >
              {skill.charAt(0).toUpperCase() + skill.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="filter-group mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {['all', 'in-class', 'out-of-class'].map((location) => (
            <button
              key={location}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                isValueSelected(locationFilter, location) ? 'bg-[#7471f9] text-white border-[#7471f9]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]'
              }`}
              onClick={() => handleFilterClick('location', location)}
            >
              {location === 'all' ? 'All' : 
               location === 'in-class' ? 'In Class' : 'Out Class'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-group mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
          {['all', 'design', 'test', 'prototype'].map((category) => (
            <button
              key={category}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                isValueSelected(categoryFilter, category) ? 'bg-[#7471f9] text-white border-[#7471f9]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]'
              }`}
              onClick={() => handleFilterClick('category', category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Type Filter */}
      <div className="filter-group mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Tech Type</h3>
        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
          {['all', 'plug', 'unplug'].map((tech) => (
            <button
              key={tech}
              className={`px-2.5 py-1 text-xs rounded-full border ${
                isValueSelected(techFilter, tech) ? 'bg-[#7471f9] text-white border-[#7471f9]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#7471f9]'
              }`}
              onClick={() => handleFilterClick('tech', tech)}
            >
              {tech === 'all' ? 'All' : tech.charAt(0).toUpperCase() + tech.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopFilters;