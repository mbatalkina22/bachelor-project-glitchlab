"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';
import { useAuth } from '@/context/AuthContext';

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
}

const ProfilePage = () => {
  const t = useTranslations('Profile');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const [registeredWorkshops, setRegisteredWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegisteredWorkshops = async () => {
      if (!user?.registeredWorkshops?.length) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/workshops/batch?ids=${user.registeredWorkshops.join(',')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch registered workshops');
        }
        const data = await response.json();
        setRegisteredWorkshops(data.workshops);
      } catch (error) {
        console.error('Error fetching registered workshops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegisteredWorkshops();
  }, [user]);

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
          <div className="border-t border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('overview')}
              </button>
              <button
                onClick={() => setActiveTab('workshops')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'workshops'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('workshops')}
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'badges'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('badges')}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('reviews')}
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Content will be added here */}
            </div>
          )}

          {/* Workshops Tab */}
          {activeTab === 'workshops' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">{t('registeredWorkshops')}</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
                </div>
              ) : registeredWorkshops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredWorkshops.map((workshop, index) => (
                    <ScrollReveal key={workshop._id} className={`delay-${(index % 3 + 1) * 100}`}>
                      <WorkshopCard 
                        id={workshop._id}
                        title={workshop.name}
                        description={workshop.description}
                        date={workshop.date}
                        time={workshop.time}
                        imageSrc={workshop.imageSrc}
                        delay={`delay-${(index % 3 + 1) * 100}`}
                        bgColor={["#c3c2fc", "#f8c5f4", "#fee487"][index % 3]}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon icon="heroicons:face-frown" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noWorkshopsYet')}</h3>
                  <p className="text-gray-500 mb-4">{t('noWorkshopsMessage')}</p>
                  <Link href="/workshops">
                    <HeroButton
                      text={t('exploreWorkshops')}
                      backgroundColor="#7471f9"
                      textColor="white"
                    />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Rest of the tabs... */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 