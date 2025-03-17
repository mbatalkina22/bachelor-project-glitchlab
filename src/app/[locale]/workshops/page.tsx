"use client";

import React, { useState, useEffect } from 'react';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

const WorkshopsPage = () => {
    const t = useTranslations('WorkshopsPage');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    // Sample workshop data
    const workshops = [
        {
            id: "1",
            title: "UX Design Fundamentals",
            description: "Learn the basics of user experience design in this hands-on workshop. You'll discover essential UX principles and how to apply them to your projects.",
            date: "June 15, 2023",
            time: "2:00 PM - 5:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-100",
            category: "design"
        },
        {
            id: "2",
            title: "Advanced JavaScript Patterns",
            description: "Dive deep into advanced JavaScript patterns and techniques. Perfect for developers looking to enhance their JS skills.",
            date: "June 22, 2023",
            time: "10:00 AM - 3:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-200",
            category: "coding"
        },
        {
            id: "3",
            title: "Data Visualization with D3.js",
            description: "Create stunning data visualizations using the D3.js library. Learn how to transform your data into interactive and insightful visualizations.",
            date: "July 5, 2023",
            time: "1:00 PM - 4:30 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-300",
            category: "coding"
        },
        {
            id: "4",
            title: "React Performance Optimization",
            description: "Learn techniques to optimize your React applications for better performance. Discover common bottlenecks and how to resolve them.",
            date: "July 12, 2023",
            time: "9:00 AM - 12:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-100",
            category: "coding"
        },
        {
            id: "5",
            title: "Introduction to Machine Learning",
            description: "Get started with machine learning concepts and practical applications. This workshop covers the basics of ML algorithms and implementation.",
            date: "July 18, 2023",
            time: "1:00 PM - 5:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-200",
            category: "data"
        },
        {
            id: "6",
            title: "Responsive Web Design",
            description: "Create websites that look great on any device using modern CSS techniques. Learn about flexbox, grid, and responsive design principles.",
            date: "July 25, 2023",
            time: "10:00 AM - 2:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-300",
            category: "design"
        },
        {
            id: "7",
            title: "User Research Methods",
            description: "Master essential user research methods to inform your product decisions. Learn how to conduct interviews, surveys, and usability tests.",
            date: "August 2, 2023",
            time: "1:00 PM - 4:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-100",
            category: "design"
        },
        {
            id: "8",
            title: "Advanced CSS Animations",
            description: "Take your web animations to the next level with advanced CSS techniques. Create engaging interactions without JavaScript.",
            date: "August 8, 2023",
            time: "9:00 AM - 12:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-200",
            category: "design"
        },
        {
            id: "9",
            title: "Testing for Frontend Developers",
            description: "Learn how to write effective tests for your frontend applications. Cover unit, integration, and end-to-end testing strategies.",
            date: "August 15, 2023",
            time: "10:00 AM - 3:00 PM",
            imageSrc: "/images/workshop.jpg",
            delay: "delay-300",
            category: "testing"
        }
    ];

    // Filter workshops based on search term and category
    const filteredWorkshops = workshops.filter(workshop => {
        const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filter === 'all' || workshop.category === filter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="pt-16 min-h-screen">
            {/* Filter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-grow max-w-3xl">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="heroicons:magnifying-glass" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 whitespace-nowrap">{t('filterBy')}</span>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black rounded-md"
                            >
                                <option value="all">{t('allCategories')}</option>
                                <option value="design">{t('design')}</option>
                                <option value="coding">{t('coding')}</option>
                                <option value="data">{t('data')}</option>
                                <option value="testing">{t('testing')}</option>
                            </select>
                        </div>
                    </div>
                </div> */}

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {t('showing')} {filteredWorkshops.length} {t('of')} {workshops.length} {t('workshops')}
                    </p>
                </div>

                {/* Workshop Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {filteredWorkshops.length > 0 ? (
                        filteredWorkshops.map((workshop, index) => (
                            <ScrollReveal key={index} className={workshop.delay}>
                                <WorkshopCard {...workshop} />
                            </ScrollReveal>
                        ))
                    ) : (
                        <div className="col-span-3 py-12 text-center">
                            <Icon icon="heroicons:face-frown" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noWorkshopsFound')}</h3>
                            <p className="text-gray-500">{t('tryAdjusting')}</p>
                        </div>
                    )}
                </div>
            </div>
         </div>
    );
};

export default WorkshopsPage; 