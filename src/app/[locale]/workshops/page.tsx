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
    description: string;
    startDate: Date;
    endDate: Date;
    imageSrc: string;
    categories: string[];
    level: string;
    location: string;
    instructor: string;
    delay?: string;
    bgColor?: string;
}

const WorkshopsPage = () => {
    const t = useTranslations('WorkshopsPage');
    const { user } = useAuth();
    const params = useParams();
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filter option counts for checking if all options are selected
    const filterCounts = {
        age: 5, // '6-8', '9-11', '12-13', '14-16', '16+'
        skill: 3, // 'beginner', 'intermediate', 'advanced'
        location: 2, // 'in-class', 'out-of-class'
        category: 3, // 'design', 'test', 'prototype'
        tech: 2, // 'plug', 'unplug'
        status: 3, // 'future', 'ongoing', 'past'
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
            
            // Add UI specific properties without modifying the bgColor
            const workshopsWithUIProps = data.map((workshop: Workshop, index: number) => ({
                ...workshop,
                id: workshop._id,
                title: workshop.name,
                delay: `delay-${(index % 3 + 1) * 100}`,
                bgColor: getBgColor(index)
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
    
    // Function to rotate through background colors
    const getBgColor = (index: number) => {
        const colors = ["#c3c2fc", "#f8c5f4", "#fee487", "#aef9e1"];
        return colors[index % colors.length];
    };

    // Helper function to check if all filters are set to 'all'
    const isFilterSetToAll = (filterArray: string[]) => {
        return filterArray.length === 1 && filterArray[0] === 'all';
    };

    // Filter workshops based on search term and multiple selected filters
    const filteredWorkshops = workshops.filter(workshop => {
        const matchesSearch = workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category filter with multiple selections
        const matchesCategory = isFilterSetToAll(categoryFilter) || 
                              (workshop.categories && workshop.categories.some(cat => categoryFilter.includes(cat)));
        
        // Location filter with multiple selections
        const matchesLocation = isFilterSetToAll(locationFilter) || locationFilter.includes(workshop.location);
        
        // Skill level filter with multiple selections
        const matchesLevel = isFilterSetToAll(skillFilter) || skillFilter.includes(workshop.level);
        
        return matchesSearch && matchesCategory && matchesLocation && matchesLevel;
    });

    // Empty filter handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        switch(filterType) {
            case 'age':
                updateFilterArray(setAgeFilter, value, filterType);
                break;
            case 'skill':
                updateFilterArray(setSkillFilter, value, filterType);
                break;
            case 'location':
                updateFilterArray(setLocationFilter, value, filterType);
                break;
            case 'category':
                updateFilterArray(setCategoryFilter, value, filterType);
                break;
            case 'tech':
                updateFilterArray(setTechFilter, value, filterType);
                break;
            case 'status':
                updateFilterArray(setStatusFilter, value, filterType);
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
            {/* Main Content Container */}
            <div className="mx-auto px-2 sm:px-4 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-1 min-h-screen">
                    {/* Filters component */}
                    <WorkshopFilters 
                        ageFilter={ageFilter}
                        skillFilter={skillFilter}
                        locationFilter={locationFilter}
                        categoryFilter={categoryFilter}
                        techFilter={techFilter}
                        statusFilter={statusFilter}
                        handleFilterChange={handleFilterChange}
                    />

                    {/* Content area - right side */}
                    <div className="lg:w-[88%] pl-0 lg:pl-3 lg:border-l border-gray-200">
                        {/* Search bar and refresh button at the top */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-full max-w-4xl flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon icon="heroicons:magnifying-glass" className="h-5 w-5 text-gray-600" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t('searchPlaceholder') || "Search workshops..."}
                                    className="block w-full pl-10 pr-5 py-2 border border-gray-300 rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7471f9] focus:border-[#7471f9]"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                {user && user.role === 'instructor' && (
                                    <Link 
                                        href={`/${params.locale}/workshops/create`}
                                        className="ml-4 flex items-center"
                                    >
                                        <HeroButton className="flex items-center">
                                            <Icon icon="heroicons:plus" className="h-5 w-5" /> 
                                        </HeroButton>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="mb-6 text-center">
                            <p className="text-gray-600">
                                {t('showing')} {filteredWorkshops.length} {t('of')} {workshops.length} {t('workshops')}
                            </p>
                        </div>

                        {/* Workshop Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mx-2 mb-10">
                            {filteredWorkshops.length > 0 ? (
                                filteredWorkshops.map((workshop, index) => (
                                    <ScrollReveal key={workshop._id} className={workshop.delay}>
                                        <WorkshopCard 
                                            id={workshop._id}
                                            title={workshop.name}
                                            description={workshop.description}
                                            startDate={new Date(workshop.startDate)}
                                            endDate={new Date(workshop.endDate)}
                                            imageSrc={workshop.imageSrc}
                                            delay={workshop.delay || ""}
                                            bgColor={workshop.bgColor}
                                            isRegistered={user?.registeredWorkshops?.includes(workshop._id) || false}
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