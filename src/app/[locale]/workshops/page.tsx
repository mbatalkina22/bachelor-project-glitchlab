"use client";

import React, { useState, useEffect } from 'react';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';
import WorkshopFilters from '@/components/WorkshopFilters';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Workshop {
    _id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    imageSrc: string;
    badgeImageSrc: string;
    categories: string[];
    level: string;
    location: string;
    instructor: string;
    delay?: string;
    bgColor?: string;
}

const WorkshopsPage = () => {
    const t = useTranslations('WorkshopsPage');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states
    const [ageFilter, setAgeFilter] = useState('all');
    const [skillFilter, setSkillFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const [techFilter, setTechFilter] = useState('all');

    const fetchWorkshops = async () => {
        try {
            setIsLoading(true);
            // Add a cache-busting query parameter
            const response = await fetch(`/api/workshops?t=${new Date().getTime()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch workshops');
            }
            
            const data = await response.json();
            
            // Add UI specific properties
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

    // Filter workshops based on search term and category
    const filteredWorkshops = workshops.filter(workshop => {
        const matchesSearch = workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || (workshop.categories && workshop.categories.includes(categoryFilter));
        const matchesLocation = locationFilter === 'all' || workshop.location === locationFilter;
        const matchesLevel = skillFilter === 'all' || workshop.level === skillFilter;
        
        return matchesSearch && matchesCategory && matchesLocation && matchesLevel;
    });

    // Empty filter handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        switch(filterType) {
            case 'age':
                setAgeFilter(value);
                break;
            case 'skill':
                setSkillFilter(value);
                break;
            case 'location':
                setLocationFilter(value);
                break;
            case 'category':
                setCategoryFilter(value);
                break;
            case 'time':
                setTimeFilter(value);
                break;
            case 'tech':
                setTechFilter(value);
                break;
            default:
                break;
        }
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
                        timeFilter={timeFilter}
                        techFilter={techFilter}
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
                                <button 
                                    onClick={fetchWorkshops} 
                                    className="ml-3 p-2 bg-[#7471f9] text-white rounded-full hover:bg-[#5f5dd6] focus:outline-none"
                                    title="Refresh workshops"
                                >
                                    <Icon icon="heroicons:arrow-path" className="h-5 w-5" />
                                </button>
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
                                            date={workshop.date}
                                            time={workshop.time}
                                            imageSrc={workshop.imageSrc}
                                            delay={workshop.delay || ""}
                                            bgColor={workshop.bgColor}
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