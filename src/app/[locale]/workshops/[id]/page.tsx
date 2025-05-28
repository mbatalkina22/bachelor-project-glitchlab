"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import ScrollReveal from '@/components/ScrollReveal';
import WorkshopCard from '@/components/WorkshopCard';
import TestimonialCard from '@/components/TestimonialCard';
import ReviewList from '@/components/ReviewList';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import HeroButton from '@/components/HeroButton';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopStatus, getStatusColor } from '@/utils/workshopStatus';

interface InstructorDetails {
  _id: string;
  name: string;
  surname?: string;
  avatar?: string;
  description?: string;
}

// Interface for localized content
interface LocalizedContent {
  en: string;
  it: string;
  [key: string]: string; // Allow for other languages in the future
}

interface Workshop {
  _id: string;
  name: string;
  nameTranslations?: LocalizedContent; // Translations for the name
  description: string;
  descriptionTranslations?: LocalizedContent; // Translations for the description
  startDate: Date;
  endDate: Date;
  imageSrc: string;
  categories: string[];
  level: string;
  location: string;
  instructorIds?: string[];
  instructorDetails?: InstructorDetails;
  instructorDetailsList?: InstructorDetails[];
  capacity: number;
  registeredCount: number;
  badgeName?: string; // Optional property for badge name
  badgeNameTranslations?: LocalizedContent; // Translations for the badge name
  canceled?: boolean; // Added property for canceled workshops
}

const WorkshopDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;
  const locale = params.locale as string;
  const t = useTranslations('WorkshopDetail');
  const { user, isAuthenticated, isInstructor, refreshUser } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Update isRegistered whenever user data changes
  useEffect(() => {
    if (user && id) {
      const userWorkshops = user.registeredWorkshops || [];
      const registered = userWorkshops.includes(id);
      console.log('User registration status from context:', { id, isRegistered: registered, workshops: userWorkshops });
      setIsRegistered(registered);
    }
  }, [user, id]);

  const checkUserRegistration = async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Force a fresh request by adding a timestamp
      const userResponse = await fetch(`/api/user?t=${new Date().getTime()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userWorkshops = userData.registeredWorkshops || [];
        const isUserRegistered = userWorkshops.includes(id);
        console.log('User registration check:', { id, isRegistered: isUserRegistered, workshops: userWorkshops });
        setIsRegistered(isUserRegistered);
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
    }
  };

  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        setIsLoading(true);
        // Fetch workshop details
        const response = await fetch(`/api/workshops/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workshop details');
        }
        const data = await response.json();
        
        setWorkshop(data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching workshop:', error);
        setError('Failed to load workshop details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchWorkshopData();
    }
  }, [id]);
  
  // Effect to refetch workshop data when locale changes
  useEffect(() => {
    if (id) {
      fetchWorkshopData();
    }
  }, [locale, id]); // Added locale as a dependency to refresh data when language changes

  const fetchWorkshopData = async () => {
    try {
      setIsLoading(true);
      // Fetch workshop details
      const response = await fetch(`/api/workshops/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workshop details');
      }
      const data = await response.json();
      
      setWorkshop(data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching workshop:', error);
      setError('Failed to load workshop details. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!workshop?._id) {
        throw new Error('Workshop ID is missing');
      }

      const response = await fetch('/api/workshops/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workshopId: workshop._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for workshop');
      }

      // Update local state first
      setIsRegistered(true);
      
      // Update workshop count in the UI
      if (workshop) {
        setWorkshop({
          ...workshop,
          registeredCount: workshop.registeredCount + 1
        });
      }
      
      // Then refresh the user data in the context
      await refreshUser();
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register for workshop');
    }
  };

  const handleUnregister = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!workshop?._id) {
        throw new Error('Workshop ID is missing');
      }

      const response = await fetch('/api/workshops/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workshopId: workshop._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unregister from workshop');
      }

      // Update local state first
      setIsRegistered(false);
      
      // Update workshop count in the UI
      if (workshop && workshop.registeredCount > 0) {
        setWorkshop({
          ...workshop,
          registeredCount: workshop.registeredCount - 1
        });
      }
      
      // Then refresh the user data in the context
      await refreshUser();
    } catch (error: any) {
      console.error('Unregistration error:', error);
      alert(error.message || 'Failed to unregister from workshop');
    }
  };

  // Check if current user is an instructor for this workshop
  const isWorkshopInstructor = () => {
    if (!user || !workshop || !isInstructor) return false;
    
    // Check if user is in the instructorIds array
    return workshop.instructorIds?.some(id => id === user._id);
  };

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-circle" className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500">{error || 'Workshop not found'}</p>
          <button 
            onClick={() => router.push(`/${locale}/workshops`)}
            className="mt-4 px-4 py-2 bg-[#7471f9] text-white rounded-md hover:bg-[#5f5dd6]"
          >
            Back to Workshops
          </button>
        </div>
      </div>
    );
  }

  // Get localized content if available, otherwise fall back to default
  const localizedName = workshop.nameTranslations && workshop.nameTranslations[locale]
    ? workshop.nameTranslations[locale]
    : workshop.name;

  const localizedDescription = workshop.descriptionTranslations && workshop.descriptionTranslations[locale]
    ? workshop.descriptionTranslations[locale]
    : workshop.description;

  const localizedBadgeName = workshop.badgeNameTranslations && workshop.badgeNameTranslations[locale]
    ? workshop.badgeNameTranslations[locale]
    : (workshop.badgeName || `${localizedName} Badge`);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href={`/${locale}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
                  <Icon icon="heroicons:home" className="w-4 h-4 mr-2" />
                  {t('home')}
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <Icon icon="heroicons:chevron-right" className="w-4 h-4 text-gray-400" />
                  <Link href={`/${locale}/workshops`} className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-900 md:ml-2">
                    {t('workshops')}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <Icon icon="heroicons:chevron-right" className="w-4 h-4 text-gray-400" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 line-clamp-1">
                    {workshop.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Workshop Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="md:flex">
            {/* Workshop Image */}
            <div className="md:w-1/3 relative h-64 md:h-auto">
              <Image 
                src={workshop.imageSrc} 
                alt={workshop.name} 
                fill
                className={`object-cover ${workshop.canceled ? 'grayscale opacity-70' : ''}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/400x200?text=Workshop+Image";
                }}
              />
              <div className="absolute top-4 left-6">
                <span className={`${getStatusColor(getWorkshopStatus(workshop.startDate, workshop.endDate, workshop.canceled))} text-white px-4 py-2 rounded-full text-sm font-medium capitalize shadow-md`}>
                  {getWorkshopStatus(workshop.startDate, workshop.endDate, workshop.canceled)}
                </span>
              </div>
            </div>
            
            {/* Workshop Info */}
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-wrap gap-2">
                  {workshop.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
                      {category}
                    </span>
                  ))}
                </div>
                
                {/* Instructor Action Buttons - Now shown for all instructors, not just workshop instructors */}
                {isInstructor && (
                  <div className="flex flex-row gap-2">
                    <Link href={`/${locale}/workshops/edit/${workshop._id}`}>
                      <button 
                        className="bg-[#4CAF50] text-white p-2 rounded-full shadow-md hover:bg-[#3d8b40] transition-colors"
                        title={t('editWorkshop') || "Edit Workshop"}
                      >
                        <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black">{localizedName}</h1>
              
              {/* Show cancellation notice */}
              {workshop.canceled && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        {t('workshopCanceled') || "This workshop has been canceled"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {getWorkshopStatus(workshop.startDate, workshop.endDate) !== 'past' && (
                <div className="flex items-center mb-6">
                  <div className="flex items-center mr-6">
                    <Icon icon="heroicons:calendar" className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">{formatDate(workshop.startDate)}</span>
                  </div>
                  <div className="flex items-center mr-6">
                    <Icon icon="heroicons:clock" className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">{formatTime(workshop.startDate)} - {formatTime(workshop.endDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Icon icon="heroicons:map-pin" className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">{workshop.location}</span>
                  </div>
                </div>
              )}
              
              {/* Always show location if not shown above */}
              {getWorkshopStatus(workshop.startDate, workshop.endDate) === 'past' && (
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    <Icon icon="heroicons:map-pin" className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">{workshop.location}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-6 mb-6">
                {getWorkshopStatus(workshop.startDate, workshop.endDate) !== 'past' && (
                  <div className="flex items-center">
                    <Icon icon="heroicons:users" className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-gray-700">
                      {workshop.registeredCount}/{workshop.capacity} {t('registered')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Icon icon="heroicons:academic-cap" className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">
                    {t('requiredLevel')}: {workshop.level}
                  </span>
                </div>
              </div>

              {isInstructor && !workshop.canceled && (
                <Link href={`/${locale}/workshops/${workshop._id}/registered-users`}>
                  <HeroButton 
                    text={t('viewRegisteredUsers') || "View Registered Users"}
                    backgroundColor="#7471f9"
                    textColor="white"
                    className="w-full md:w-auto mb-4"
                  />
                </Link>
              )}

              {/* Show appropriate action buttons */}
              {workshop.canceled ? (
                // For canceled workshops, show a message that registration is not available
                <div className="bg-gray-100 p-3 rounded-md text-gray-700 inline-block">
                  <Icon icon="heroicons:no-symbol" className="w-5 h-5 inline mr-2 text-red-500" />
                  {t('registrationClosed') || "Registration is closed"}
                </div>
              ) : (
                // For active workshops, show registration/unregistration buttons
                getWorkshopStatus(workshop.startDate, workshop.endDate) !== 'past' && !isInstructor && (
                  isRegistered ? (
                    <HeroButton 
                      text={t('unregister')}
                      onClick={handleUnregister}
                      backgroundColor="#FF0000"
                      textColor="white"
                      className="w-full md:w-auto"
                    />
                  ) : (
                    workshop.registeredCount >= workshop.capacity ? (
                      <HeroButton 
                        text={t('fullWorkshop')}
                        onClick={() => {}}
                        backgroundColor="#9CA3AF"
                        textColor="white"
                        className="w-full md:w-auto cursor-not-allowed opacity-75"
                        disabled={true}
                      />
                    ) : (
                      <HeroButton 
                        text={t('register')}
                        onClick={handleRegister}
                        backgroundColor="#4f46e5"
                        textColor="white"
                        className="w-full md:w-auto"
                      />
                    )
                  )
                )
              )}
            </div>
          </div>
          
          {/* Description */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-black">{t('description')}</h2>
            <p className="text-gray-700 whitespace-pre-line">{localizedDescription}</p>
          </div>
          
          {/* Badge Section */}
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <ScrollReveal>
              <h2 className="text-xl font-semibold mb-4 text-black">{t('earnableBadge')}</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32 transform hover:scale-110 transition-transform duration-300 hover:rotate-3">
                  <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-indigo-100 shadow-xl bg-white">
                    <div className="absolute inset-0 bg-indigo-100 animate-pulse opacity-30"></div>
                    <Image 
                      src={"/images/badge.png"} 
                      alt="Workshop Badge" 
                      fill
                      className="object-cover p-1 relative z-10 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/200?text=Badge";
                      }}
                    />
                  </div>
                  {getWorkshopStatus(workshop.startDate, workshop.endDate) !== 'past' && (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-xs font-bold text-white px-2 py-1 rounded-full shadow-md">
                      NEW
                    </div>
                  )}
                </div>
                <div className={`${getWorkshopStatus(workshop.startDate, workshop.endDate) === 'past' ? 'text-left' : 'text-center md:text-left'} max-w-lg`}>
                  <h3 className="text-lg font-bold text-indigo-700 mb-2">
                    {/* Use badgeName if it exists, otherwise fallback to workshop name + Badge */}
                    {localizedBadgeName}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {getWorkshopStatus(workshop.startDate, workshop.endDate) === 'past' 
                      ? t('unlockBadge') 
                      : t('badgeDescription')}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Instructors Section */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-black mr-2">
                {workshop.instructorDetailsList && workshop.instructorDetailsList.length > 1 
                  ? t('instructors') 
                  : t('instructor')}
              </h2>
              <div className="relative group">
                <Icon 
                  icon="heroicons:information-circle" 
                  className="w-5 h-5 text-indigo-600 cursor-pointer hover:text-indigo-800" 
                />
                <div className="absolute left-0 top-full invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-indigo-50 border border-indigo-100 p-3 rounded shadow-md z-10 w-64">
                  <p className="text-gray-700 text-sm">
                    {t('instructorInfoTooltip')}{' '}
                    <Link href={`/${locale}/our-team`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                      {t('ourTeamPage')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {workshop.instructorDetailsList && workshop.instructorDetailsList.length > 0 ? (
                <>
                  {workshop.instructorDetailsList.map((instructor, index) => (
                    <div key={instructor._id || index} className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                        <Image 
                          src={instructor.avatar || "/images/avatar.jpg"} 
                          alt={(instructor.name || '') + ' ' + (instructor.surname || '')}
                          width={32}
                          height={32}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/avatar.jpg";
                          }}
                        />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">
                        {instructor.name || 'Instructor'} {instructor.surname || ""}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image 
                      src="/images/avatar.jpg" 
                      alt="Instructor"
                      width={32}
                      height={32}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">Instructor</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Reviews Section - Using ReviewList component with workshopId */}
        {getWorkshopStatus(workshop.startDate, workshop.endDate) === 'past' && (
          <div className="mb-12">
            <ReviewList workshopId={id} />
          </div>
        )}
        {getWorkshopStatus(workshop.startDate, workshop.endDate) !== 'past' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-black">{t("reviews")}</h2>
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <Icon icon="heroicons:lock-closed" className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-700 mb-1">{t("reviewsUnavailable")}</p>
              <p className="text-sm text-gray-500">{t("reviewsAvailableAfterWorkshop")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
