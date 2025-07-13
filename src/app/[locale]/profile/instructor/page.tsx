"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import WorkshopCard from '@/components/WorkshopCard';
import ScrollReveal from '@/components/ScrollReveal';
import { useAuth } from '@/context/AuthContext';
import withEmailVerification from '@/components/withEmailVerification';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

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
  bgColor?: string;
  canceled?: boolean;
}

const InstructorProfilePage = () => {
  const t = useTranslations('Profile');
  const { user, isAuthenticated, isInstructor } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const router = useRouter();
  
  // Get tab from URL or default to 'about'
  const tabFromUrl = searchParams.get('tab') || 'about';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [pastWorkshops, setPastWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to handle tab change and update URL
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tab);
    
    // Use router.replace to update URL without adding to history
    router.replace(`/${locale}/profile/instructor?${newSearchParams.toString()}`, { scroll: false });
  }, [locale, router, searchParams]);

  // Ensure activeTab is valid and sync with URL
  useEffect(() => {
    const validTabs = ['about', 'upcoming', 'past'];
    const currentTab = searchParams.get('tab') || 'about';
    
    if (!validTabs.includes(currentTab)) {
      // If invalid tab, redirect to about tab
      handleTabChange('about');
    } else if (currentTab !== activeTab) {
      // Sync state with URL if they differ
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab, handleTabChange]);

  // Redirect to regular profile if not an instructor
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      router.push(`/${locale}/profile`);
    }
  }, [isAuthenticated, isInstructor, locale, router]);

  const fetchInstructorWorkshops = async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    try {
      // This would need to be implemented on the backend
      const response = await fetch(`/api/workshops/instructor/${user._id}`);
      if (!response.ok) {
        throw new Error(t('failedToFetchWorkshops'));
      }
      const data = await response.json();
      
      // Convert string dates to Date objects and ensure bgColor and canceled are included
      const workshopsWithDates = data.workshops.map((workshop: any) => {
        return {
          ...workshop,
          startDate: new Date(workshop.startDate),
          endDate: new Date(workshop.endDate),
          // Explicitly handle bgColor and canceled properties
          bgColor: workshop.bgColor || null,
          canceled: workshop.canceled || false
        };
      });
      
      // Split workshops into upcoming and past (canceled workshops are treated as past)
      const now = new Date();
      const upcoming = workshopsWithDates.filter((w: Workshop) => !w.canceled && new Date(w.startDate) > now);
      const past = workshopsWithDates.filter((w: Workshop) => w.canceled || new Date(w.startDate) <= now);
      
      // Sort upcoming workshops by start date (earliest first)
      const sortedUpcoming = upcoming.sort((a: Workshop, b: Workshop) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      // Sort past workshops by start date (most recent first)
      const sortedPast = past.sort((a: Workshop, b: Workshop) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      
      setUpcomingWorkshops(sortedUpcoming);
      setPastWorkshops(sortedPast);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorWorkshops();
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

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructor Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
          <div className="px-6 py-4 md:px-8 md:py-6 flex flex-col md:flex-row">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-4 md:mb-0">
              <div className="relative h-32 w-32 md:h-36 md:w-36 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                <Image
                  src={user.avatar || "/images/default-avatar.png"}
                  alt={user.name || t('instructor')}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/default-avatar.png";
                  }}
                />
              </div>
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || t('instructor')} {user.surname || ""}
                </h1>
                <p className="text-gray-500">{user.email || t('noEmailProvided')}</p>
                <p className="text-[#7471f9] font-medium">{t('instructor')}</p>
              </div>
            </div>
            <div className="flex-grow"></div>
            <div className="flex flex-col md:flex-row md:items-end items-center space-y-2 md:space-y-0 md:space-x-3 mt-4 md:mt-0">
              <Link href={`/${locale}/profile/instructor/settings`}>
                <HeroButton
                  text={t('editProfile')}
                  backgroundColor="#7471f9"
                  textColor="white"
                />
              </Link>
              <Link href={`/${locale}/profile/instructor/add-instructor`}>
                <HeroButton
                  text={t('addNewInstructor')}
                  backgroundColor="white"
                  textColor="#7471f9"
                  className="border border-[#7471f9]"
                />
              </Link>
            </div>
          </div>
          
          {/* Profile Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('about')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'about'
                    ? 'border-b-2 border-[#7471f9] text-[#7471f9]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('aboutMe')}
              </button>
              <button
                onClick={() => handleTabChange('upcoming')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-[#7471f9] text-[#7471f9]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('upcomingWorkshops')}
              </button>
              <button
                onClick={() => handleTabChange('past')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'past'
                    ? 'border-b-2 border-[#7471f9] text-[#7471f9]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('pastWorkshops')}
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {/* About Me Tab */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">{t('aboutMe')}</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('bio')}</h3>
                  <p className="text-gray-700">
                    {user.description || t('notSpecified')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('website')}</h3>
                    {user.website ? (
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#7471f9] hover:text-[#5a57c7] flex items-center"
                      >
                        <Icon icon="heroicons:globe-alt" className="w-5 h-5 mr-2" />
                        {user.website}
                      </a>
                    ) : (
                      <p className="text-gray-500 italic flex items-center">
                        <Icon icon="heroicons:globe-alt" className="w-5 h-5 mr-2 text-gray-400" />
                        {t('notProvided')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('linkedinProfile')}</h3>
                    {user.linkedin ? (
                      <a 
                        href={user.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#7471f9] hover:text-[#5a57c7] flex items-center"
                      >
                        <Icon icon="mdi:linkedin" className="w-5 h-5 mr-2" />
                        {t('linkedinProfile')}
                      </a>
                    ) : (
                      <p className="text-gray-500 italic flex items-center">
                        <Icon icon="mdi:linkedin" className="w-5 h-5 mr-2 text-gray-400" />
                        {t('notProvided')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Workshops Tab */}
          {activeTab === 'upcoming' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">{t('upcomingWorkshops')}</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
                </div>
              ) : upcomingWorkshops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingWorkshops.map((workshop, index) => (
                    <ScrollReveal key={workshop._id} className={`delay-${(index % 3 + 1) * 100}`}>
                      <WorkshopCard 
                        id={workshop._id}
                        title={workshop.name}
                        description={workshop.description}
                        startDate={new Date(workshop.startDate)}
                        endDate={new Date(workshop.endDate)}
                        imageSrc={workshop.imageSrc}
                        delay={`delay-${(index % 3 + 1) * 100}`}
                        bgColor={workshop.bgColor || ["#c3c2fc", "#f8c5f4", "#fee487"][index % 3]}
                        isInstructing={true}
                        canceled={workshop.canceled || false}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon icon="heroicons:calendar" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noUpcomingWorkshops')}</h3>
                  <p className="text-gray-500 mb-4">{t('noUpcomingWorkshopsMessage')}</p>
                </div>
              )}
            </div>
          )}

          {/* Past Workshops Tab */}
          {activeTab === 'past' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">{t('pastWorkshops')}</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
                </div>
              ) : pastWorkshops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastWorkshops.map((workshop, index) => (
                    <ScrollReveal key={workshop._id} className={`delay-${(index % 3 + 1) * 100}`}>
                      <WorkshopCard 
                        id={workshop._id}
                        title={workshop.name}
                        description={workshop.description}
                        startDate={new Date(workshop.startDate)}
                        endDate={new Date(workshop.endDate)}
                        imageSrc={workshop.imageSrc}
                        delay={`delay-${(index % 3 + 1) * 100}`}
                        bgColor={workshop.bgColor}
                        isInstructing={true}
                        canceled={workshop.canceled || false}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon icon="heroicons:archive-box" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noPastWorkshops')}</h3>
                  <p className="text-gray-500 mb-4">{t('noPastWorkshopsMessage')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the component wrapped with email verification protection
export default withEmailVerification(InstructorProfilePage);