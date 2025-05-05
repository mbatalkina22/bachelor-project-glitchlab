"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';
import { useAuth } from '@/context/AuthContext';

const ProfilePage = () => {
  const t = useTranslations('Profile');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('notLoggedIn')}</h1>
          <Link href="/login">
            <HeroButton
              text={t('login')}
              backgroundColor="#7471f9"
              textColor="white"
            />
          </Link>
        </div>
      </div>
    );
  }

  // Mock badges earned by the user
  const badges = [
    {
      id: "1",
      name: "UX Fundamentals Badge",
      image: "/images/badge.png",
      date: "June 20, 2023",
      description: "Completed the UX Design Fundamentals workshop"
    },
    {
      id: "2",
      name: "JavaScript Expert",
      image: "/images/badge.png",
      date: "July 25, 2023",
      description: "Completed the Advanced JavaScript Patterns workshop"
    },
    {
      id: "3",
      name: "Data Viz Master",
      image: "/images/badge.png",
      date: "August 10, 2023",
      description: "Completed the Data Visualization with D3.js workshop"
    }
  ];

  // Mock attended workshops
  const attendedWorkshops = [
    {
      id: "1",
      title: "UX Design Fundamentals",
      description: "Learn the basics of user experience design in this hands-on workshop.",
      date: "June 15, 2023",
      time: "2:00 PM - 5:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-100",
      bgColor: "#c3c2fc"
    },
    {
      id: "2",
      title: "Advanced JavaScript Patterns",
      description: "Dive deep into advanced JavaScript patterns and techniques.",
      date: "June 22, 2023",
      time: "10:00 AM - 3:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-200",
      bgColor: "#f8c5f4"
    },
    {
      id: "3",
      title: "Data Visualization with D3.js",
      description: "Create stunning data visualizations using the D3.js library.",
      date: "July 5, 2023",
      time: "1:00 PM - 4:30 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-300",
      bgColor: "#fee487"
    }
  ];

  // Mock reviews left by the user
  const userReviews = [
    {
      id: "1",
      workshopTitle: "UX Design Fundamentals",
      workshopId: "1",
      content: "This workshop was amazing! I learned so much about UX design principles and how to apply them.",
      rating: 5,
      date: "June 20, 2023"
    },
    {
      id: "2",
      workshopTitle: "Advanced JavaScript Patterns",
      workshopId: "2",
      content: "The instructor was very knowledgeable. The content was advanced as promised and very practical.",
      rating: 4,
      date: "June 25, 2023"
    },
    {
      id: "3",
      workshopTitle: "Data Visualization with D3.js",
      workshopId: "3",
      content: "Great introduction to D3. Would have liked more examples, but overall a solid workshop.",
      rating: 4,
      date: "July 8, 2023"
    }
  ];

  // Upcoming workshops
  const upcomingWorkshops = [
    {
      id: "4",
      title: "React Performance Optimization",
      description: "Learn techniques to optimize your React applications for better performance.",
      date: "August 15, 2023",
      time: "9:00 AM - 12:00 PM",
      imageSrc: "/images/workshop.jpg",
      delay: "delay-100",
      bgColor: "#aef9e1"
    }
  ];

  // Render star rating component
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Icon 
            key={i}
            icon={i < rating ? "heroicons:star-solid" : "heroicons:star"} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
          <div className="px-6 py-4 md:px-8 md:py-6 flex flex-col md:flex-row">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-4 md:mb-0">
              <div className="relative h-32 w-32 md:h-36 md:w-36 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                <Image
                  src={user.avatar || "/images/default-avatar.png"}
                  alt={user.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/default-avatar.png";
                  }}
                />
              </div>
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex-grow"></div>
            <div className="flex flex-col md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-3 mt-4 md:mt-0">
              <Link href="/profile/settings">
                <HeroButton
                  text={t('editProfile')}
                  backgroundColor="white"
                  textColor="black"
                />
              </Link>
            </div>
          </div>
          
          {/* Profile Navigation Tabs */}
          <div className="px-6 border-t border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`mr-8 py-4 font-medium text-sm border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                {t('overview')}
              </button>
              <button
                onClick={() => setActiveTab('workshops')}
                className={`mr-8 py-4 font-medium text-sm border-b-2 ${
                  activeTab === 'workshops'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                {t('workshops')}
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`mr-8 py-4 font-medium text-sm border-b-2 ${
                  activeTab === 'badges'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                {t('badges')}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`mr-8 py-4 font-medium text-sm border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                {t('reviews')}
              </button>
            </nav>
          </div>
        </div>
        
        {/*Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Content will be added here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 