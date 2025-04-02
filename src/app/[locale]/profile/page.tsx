"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';

const ProfilePage = () => {
  const t = useTranslations('Profile');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/images/avatar.jpg",
    joinDate: "January 2023",
    bio: "UX/UI designer and developer with a passion for creating user-friendly interfaces.",
    location: "New York, USA",
    socialLinks: {
      twitter: "https://twitter.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe"
    }
  };

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
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/150?text=User";
                  }}
                />
              </div>
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-gray-500 text-sm mt-1">
                  <Icon icon="heroicons:map-pin" className="inline-block w-4 h-4 mr-1" />
                  {user.location}
                </p>
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
              {/* About Section */}
               <div className="col-span-1 md:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('about')}</h2>
                  <p className="text-gray-700">{user.bio}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('socialProfiles')}</h3>
                    <div className="flex space-x-4">
                      {user.socialLinks.twitter && (
                        <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400">
                          <Icon icon="mdi:twitter" className="w-6 h-6" />
                        </a>
                      )}
                      {user.socialLinks.linkedin && (
                        <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
                          <Icon icon="mdi:linkedin" className="w-6 h-6" />
                        </a>
                      )}
                      {user.socialLinks.github && (
                        <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                          <Icon icon="mdi:github" className="w-6 h-6" />
                        </a>
                      )}
                    </div>
                  </div> 
                </div> 
                
                {/* Upcoming Workshops */}
                {upcomingWorkshops.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('upcomingWorkshops')}</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {upcomingWorkshops.map((workshop) => (
                        <ScrollReveal key={workshop.id} className={workshop.delay}>
                          <WorkshopCard {...workshop} />
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="col-span-1">
                {/* Recent Badges */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{t('recentBadges')}</h2>
                    <Link href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('badges');
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {t('viewAllBadges')}
                    </Link>
                  </div>
                  {badges.slice(0, 3).map((badge) => (
                    <div key={badge.id} className="flex items-center mb-4 last:mb-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
                        <Image
                          src={badge.image}
                          alt={badge.name}
                          width={48}
                          height={48}
                          className="object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/48?text=Badge";
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-sm">{badge.name}</h3>
                        <p className="text-gray-500 text-xs">{badge.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Recent Reviews */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{t('recentReviews')}</h2>
                    <Link href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('reviews');
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {t('viewAllReviews')}
                    </Link>
                  </div>
                  {userReviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0">
                      <Link href={`/workshops/${review.workshopId}`} className="font-medium text-sm hover:text-indigo-600">
                        {review.workshopTitle}
                      </Link>
                      <div className="flex items-center my-1">
                        {renderStarRating(review.rating)}
                        <span className="ml-2 text-xs text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Workshops Tab */}
          {activeTab === 'workshops' && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('attendedWorkshops')}</h2>
                {attendedWorkshops.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attendedWorkshops.map((workshop) => (
                      <ScrollReveal key={workshop.id} className={workshop.delay}>
                        <WorkshopCard {...workshop} />
                      </ScrollReveal>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon icon="heroicons:calendar" className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noWorkshopsYet')}</h3>
                    <p className="text-gray-500 mb-4">{t('noWorkshopsMessage')}</p>
                    <Link href="/workshops">
                      <HeroButton
                        text={t('exploreWorkshops')}
                        backgroundColor="#4f46e5"
                        textColor="white"
                      />
                    </Link>
                  </div>
                )}
              </div>
              
              {upcomingWorkshops.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('upcomingWorkshops')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingWorkshops.map((workshop) => (
                      <ScrollReveal key={workshop.id} className={workshop.delay}>
                        <WorkshopCard {...workshop} />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('earnedBadges')}</h2>
              {badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0 mb-4">
                        <Image
                          src={badge.image}
                          alt={badge.name}
                          width={96}
                          height={96}
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/96?text=Badge";
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
                      <p className="text-gray-500 text-sm mb-3">{badge.date}</p>
                      <p className="text-gray-700 text-sm">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="heroicons:trophy" className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noBadgesYet')}</h3>
                  <p className="text-gray-500 mb-4">{t('noBadgesMessage')}</p>
                  <Link href="/workshops">
                    <HeroButton
                      text={t('exploreWorkshops')}
                      backgroundColor="#4f46e5"
                      textColor="white"
                    />
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('yourReviews')}</h2>
              {userReviews.length > 0 ? (
                <div className="space-y-6">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <Link 
                          href={`/workshops/${review.workshopId}`} 
                          className="text-lg font-medium hover:text-indigo-600"
                        >
                          {review.workshopTitle}
                        </Link>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="mb-3">
                        {renderStarRating(review.rating)}
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                      <div className="mt-3 flex space-x-2">
                        <button 
                          className="text-gray-500 hover:text-indigo-600 text-sm font-medium flex items-center"
                        >
                          <Icon icon="heroicons:pencil-square" className="w-4 h-4 mr-1" />
                          {t('editReview')}
                        </button>
                        <button 
                          className="text-gray-500 hover:text-red-600 text-sm font-medium flex items-center"
                        >
                          <Icon icon="heroicons:trash" className="w-4 h-4 mr-1" />
                          {t('deleteReview')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="heroicons:chat-bubble-left-right" className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noReviewsYet')}</h3>
                  <p className="text-gray-500 mb-4">{t('noReviewsMessage')}</p>
                  <Link href="/workshops">
                    <HeroButton
                      text={t('exploreWorkshops')}
                      backgroundColor="#4f46e5"
                      textColor="white"
                    />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 