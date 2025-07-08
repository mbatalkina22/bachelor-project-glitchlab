"use client";

import React, { useState, useEffect } from 'react';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';
import WorkshopFilters from '@/components/WorkshopFilters';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import HeroButton from '@/components/HeroButton';

interface Workshop {
    _id: string;
    name: string;
    nameTranslations?: {
        en: string;
        it: string;
    };
    description: string;
    descriptionTranslations?: {
        en: string;
        it: string;
    };
    startDate: Date;
    endDate: Date;
    imageSrc: string;
    categories: string[];
    level: string;
    language?: string;
    location: string;
    instructor: string;
    instructorIds?: string[]; // Adding instructorIds property
    delay?: string;
    bgColor?: string;
    canceled?: boolean;
}

const WorkshopsPage = () => {
    const t = useTranslations('WorkshopsPage');
    const { user } = useAuth();
    const params = useParams();
    const [filter, setFilter] = useState('all');
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states - converted to string arrays for multiple selection
    const [ageFilter, setAgeFilter] = useState<string[]>(['all']);
    const [skillFilter, setSkillFilter] = useState<string[]>(['all']);
    const [locationFilter, setLocationFilter] = useState<string[]>(['all']);
    const [categoryFilter, setCategoryFilter] = useState<string[]>(['all']);
    const [techFilter, setTechFilter] = useState<string[]>(['all']);
    const [statusFilter, setStatusFilter] = useState<string[]>(['all']);
    const [languageFilter, setLanguageFilter] = useState<string[]>(['all']);

    // Filter option counts for checking if all options are selected
    const filterCounts = {
        age: 5, // '6-8', '9-11', '12-13', '14-16', '16+'
        skill: 3, // 'beginner', 'intermediate', 'advanced'
        location: 2, // 'in-class', 'out-of-class'
        category: 3, // 'design', 'test', 'prototype'
        tech: 2, // 'plug', 'unplug'
        status: 3, // 'future', 'ongoing', 'past'
        language: 2, // 'en', 'it'
    };

    const fetchWorkshops = async () => {
        try {
            setIsLoading(true);
            // Add a cache-busting query parameter
            const response = await fetch(`/api/workshops?t=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch workshops');
            }
            
            const data = await response.json();
            
            // Add UI specific properties without modifying the database bgColor
            const workshopsWithUIProps = data.map((workshop: Workshop, index: number) => ({
                ...workshop,
                id: workshop._id,
                title: workshop.name,
                delay: `delay-${(index % 3 + 1) * 100}`,
                // Use the stored bgColor from database, or default to white if not present
                bgColor: workshop.bgColor || "#ffffff"
            }));
            
            setWorkshops(workshopsWithUIProps);
            console.log('Fetched workshops:', workshopsWithUIProps.length);
        } catch (err) {
            console.error('Error fetching workshops:', err);
            setError('Failed to load workshops. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, []);
    
    // Helper function to check if all filters are set to 'all'
    const isFilterSetToAll = (filterArray: string[]) => {
        return filterArray.length === 1 && filterArray[0] === 'all';
    };

    // Filter and sort workshops based on multiple selected filters
    const filteredWorkshops = workshops.filter(workshop => {
        // Category filter with multiple selections (design, test, prototype)
        const matchesCategory = isFilterSetToAll(categoryFilter) || 
                              (workshop.categories && workshop.categories.some(cat => 
                                categoryFilter.includes(cat) && ["design", "test", "prototype"].includes(cat)));
        
        // Location filter with multiple selections (in-class, out-of-class)
        const matchesLocation = isFilterSetToAll(locationFilter) || 
                              (workshop.categories && workshop.categories.some(loc => 
                                locationFilter.includes(loc) && ["in-class", "out-of-class"].includes(loc)));
        
        // Tech type filter with multiple selections (plug, unplug)
        const matchesTech = isFilterSetToAll(techFilter) || 
                          (workshop.categories && workshop.categories.some(tech => 
                            techFilter.includes(tech) && ["plug", "unplug"].includes(tech)));
        
        // Age filter with multiple selections
        const matchesAge = isFilterSetToAll(ageFilter) || 
                          (workshop.categories && workshop.categories.some(age => 
                            ageFilter.includes(age) && ["6-8", "9-11", "12-13", "14-16", "16+"].includes(age)));
        
        // Skill level filter with multiple selections
        const matchesLevel = isFilterSetToAll(skillFilter) || skillFilter.includes(workshop.level.toLowerCase());
        
        // Language filter with multiple selections
        const matchesLanguage = isFilterSetToAll(languageFilter) || 
                               (workshop.language && languageFilter.includes(workshop.language));
        
        // Status filter (future, ongoing, past) - canceled workshops are treated as past
        const now = new Date();
        const startDate = new Date(workshop.startDate);
        const endDate = new Date(workshop.endDate);
        
        let status = 'past';
        if (!workshop.canceled) {
            if (startDate > now) {
                status = 'future';
            } else if (startDate <= now && endDate >= now) {
                status = 'ongoing';
            }
        }
        // If canceled, status remains 'past'
        
        const matchesStatus = isFilterSetToAll(statusFilter) || statusFilter.includes(status);
        
        return matchesCategory && matchesLocation && matchesTech && matchesAge && matchesLevel && matchesLanguage && matchesStatus;
    }).sort((a, b) => {
        // Sort workshops to display past and canceled workshops at the end
        const now = new Date();
        const startDateA = new Date(a.startDate);
        const endDateA = new Date(a.endDate);
        const startDateB = new Date(b.startDate);
        const endDateB = new Date(b.endDate);
        
        // Determine status for each workshop (canceled workshops are treated like past)
        let statusA = 'past';
        if (!a.canceled) {
            if (startDateA > now) {
                statusA = 'future';
            } else if (startDateA <= now && endDateA >= now) {
                statusA = 'ongoing';
            }
        }
        // If canceled, statusA remains 'past'
        
        let statusB = 'past';
        if (!b.canceled) {
            if (startDateB > now) {
                statusB = 'future';
            } else if (startDateB <= now && endDateB >= now) {
                statusB = 'ongoing';
            }
        }
        // If canceled, statusB remains 'past'
        
        // Sort order: future/ongoing workshops first, then past/canceled workshops
        if (statusA === 'past' && statusB !== 'past') {
            return 1; // A (past/canceled) comes after B (not past)
        }
        if (statusA !== 'past' && statusB === 'past') {
            return -1; // A (not past) comes before B (past/canceled)
        }
        
        // Within the same status group, sort by start date
        // For future/ongoing: earliest first
        // For past/canceled: most recent first (latest past workshops first)
        if (statusA === 'past' && statusB === 'past') {
            return startDateB.getTime() - startDateA.getTime(); // Descending for past/canceled (most recent first)
        } else {
            return startDateA.getTime() - startDateB.getTime(); // Ascending for future/ongoing (earliest first)
        }
    });

    const handleFilterChange = (filterType: string, value: string) => {
        switch(filterType) {
            case 'age':
                updateFilterArray(setAgeFilter, value, filterType);
                break;
            case 'skill':
                updateFilterArray(setSkillFilter, value, filterType);
                break;
            case 'location':
                updateSingleSelectFilter(setLocationFilter, value);
                break;
            case 'category':
                updateFilterArray(setCategoryFilter, value, filterType);
                break;
            case 'tech':
                updateSingleSelectFilter(setTechFilter, value);
                break;
            case 'status':
                updateFilterArray(setStatusFilter, value, filterType);
                break;
            case 'language':
                updateSingleSelectFilter(setLanguageFilter, value);
                break;
            default:
                break;
        }
    };

    // Helper function to update filter arrays
    const updateFilterArray = (
        setterFunction: React.Dispatch<React.SetStateAction<string[]>>,
        value: string,
        filterType: string
    ) => {
        setterFunction(prevState => {
            // If "all" is selected
            if (value === 'all') {
                return ['all'];
            }
            
            // If the current filter already includes the value, remove it
            if (prevState.includes(value)) {
                const newState = prevState.filter(item => item !== value);
                // If removing the last non-all value, set back to "all"
                return newState.length === 0 ? ['all'] : newState;
            } 
            // Otherwise add the value and ensure "all" is removed
            else {
                const newState = prevState.filter(item => item !== 'all');
                const updatedState = [...newState, value];

                // If all options are selected, switch back to "all"
                const totalOptions = filterCounts[filterType as keyof typeof filterCounts] || 0;
                if (updatedState.length === totalOptions) {
                    return ['all'];
                }

                return updatedState;
            }
        });
    };

    // Helper function for single-select filters (language, location, tech)
    const updateSingleSelectFilter = (
        setterFunction: React.Dispatch<React.SetStateAction<string[]>>,
        value: string
    ) => {
        setterFunction(prevState => {
            // If "all" is selected
            if (value === 'all') {
                return ['all'];
            }
            
            // If the current filter already includes this value, remove it and go back to "all"
            if (prevState.includes(value)) {
                return ['all'];
            } 
            // Otherwise, replace the current selection with the new value
            else {
                return [value];
            }
        });
    };

    // Function to reset all filters to their default values
    const resetFilters = () => {
        setAgeFilter(['all']);
        setSkillFilter(['all']);
        setLocationFilter(['all']);
        setCategoryFilter(['all']);
        setTechFilter(['all']);
        setStatusFilter(['all']);
        setLanguageFilter(['all']);
    };

    if (isLoading) {
        return (
            <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
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

    return (
        <div className="pt-16 min-h-screen bg-gray-50">
            {/* Main Content Container - No padding */}
            <div className="py-8">
                {/* Flex container for sidebar and content */}
                <div className="flex gap-8">
                    {/* Left Sidebar - Filters - Slightly bigger padding from edge */}
                    <div className="flex-shrink-0 pl-4">
                        <WorkshopFilters 
                            ageFilter={ageFilter}
                            skillFilter={skillFilter}
                            locationFilter={locationFilter}
                            categoryFilter={categoryFilter}
                            techFilter={techFilter}
                            statusFilter={statusFilter}
                            languageFilter={languageFilter}
                            handleFilterChange={handleFilterChange}
                            resetFilters={resetFilters}
                        />
                    </div>
                    
                    {/* Right Content Area */}
                    <div className="flex-1 min-w-0 pr-8">
                        {/* Header with results count and create button */}
                        <div className="flex justify-between items-center mb-6">
                            {/* Results Count */}
                            <p className="text-gray-600">
                                {t('showing')} {filteredWorkshops.length} {t('of')} {workshops.length} {t('workshops')}
                            </p>
                            
                            {/* Create button for instructors - Original simple version */}
                             {/* Create button for instructors */}
                             {user && user.role === 'instructor' && (
                                <Link 
                                    href={`/${params.locale}/workshops/create`}
                                    className="flex items-center mt-2 sm:mt-0"
                                >
                                    <HeroButton className="flex items-center">
                                        <Icon icon="heroicons:plus" className="h-5 w-5" /> 
                                    </HeroButton>
                                </Link>
                            )}
                        </div>

                        {/* Workshop Cards Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredWorkshops.length > 0 ? (
                                filteredWorkshops.map((workshop, index) => (
                                    <ScrollReveal key={workshop._id} className={workshop.delay}>
                                        <WorkshopCard 
                                            id={workshop._id}
                                            title={workshop.name}
                                            nameTranslations={workshop.nameTranslations}
                                            description={workshop.description}
                                            descriptionTranslations={workshop.descriptionTranslations}
                                            startDate={new Date(workshop.startDate)}
                                            endDate={new Date(workshop.endDate)}
                                            imageSrc={workshop.imageSrc}
                                            delay={workshop.delay || ""}
                                            bgColor={workshop.bgColor}
                                            isRegistered={user?.registeredWorkshops?.includes(workshop._id) || false}
                                            isInstructing={workshop.instructorIds?.includes(user?._id || '') || false}
                                            canceled={workshop.canceled || false}
                                        />
                                    </ScrollReveal>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <Icon icon="heroicons:face-frown" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noWorkshopsFound')}</h3>
                                    <p className="text-gray-500">{t('tryAdjusting')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopsPage;