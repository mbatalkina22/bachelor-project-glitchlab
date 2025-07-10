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
import { Arvo, Bebas_Neue, Dancing_Script, Lobster } from "next/font/google";
import { getWorkshopReviewsUrl } from '@/utils/navigation';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

// Initialize the fonts
const dancingScript = Dancing_Script({ subsets: ["latin"] });
const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

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

interface UserReview {
  _id: string;
  user: string;
  workshop: string;
  workshopName: string;
  userName: string;
  circleColor: string;
  circleFont: string;
  circleText: string;
  comment?: string;
  createdAt: string;
}

// Add new Badge interface
interface Badge {
  id: string;
  workshopId: string;
  name: string;
  image: string;
  date: Date;
  description: string;
}

// Add notification interface
interface UserNotification {
  _id: string;
  type: 'workshop_removal' | 'badge_awarded' | 'workshop_update' | 'general';
  title: string;
  message: string;
  workshopId?: string;
  workshopName?: string;
  read: boolean;
  createdAt: Date;
  action?: {
    label: string;
    href: string;
  };
}

const ProfilePage = () => {
  const t = useTranslations('Profile');
  const { user, isAuthenticated, isInstructor } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const router = useRouter();
  
  // Get tab from URL or default to 'workshops'
  const tabFromUrl = searchParams.get('tab') || 'workshops';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  const [registeredWorkshops, setRegisteredWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Function to handle tab change and update URL
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tab);
    
    // Use router.replace to update URL without adding to history
    router.replace(`/${locale}/profile?${newSearchParams.toString()}`, { scroll: false });
  }, [locale, router, searchParams]);

  // Ensure activeTab is valid and sync with URL
  useEffect(() => {
    const validTabs = ['workshops', 'badges', 'reviews'];
    const currentTab = searchParams.get('tab') || 'workshops';
    
    if (!validTabs.includes(currentTab)) {
      // If invalid tab, redirect to workshops tab
      handleTabChange('workshops');
    } else if (currentTab !== activeTab) {
      // Sync state with URL if they differ
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab, handleTabChange]);

  // Redirect to instructor profile if user is an instructor
  useEffect(() => {
    if (isAuthenticated && isInstructor) {
      router.push(`/${locale}/profile/instructor`);
    }
  }, [isAuthenticated, isInstructor, locale, router]);

  const fetchRegisteredWorkshops = async () => {
    if (!user?.registeredWorkshops?.length) {
      setIsLoading(false);
      setRegisteredWorkshops([]);
      return;
    }

    try {
      const response = await fetch(`/api/workshops/batch?ids=${user.registeredWorkshops.join(',')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch registered workshops');
      }
      const data = await response.json();
      
      // Convert string dates to Date objects and log the workshop data
      const workshopsWithDates = data.workshops.map((workshop: any) => {
        return {
          ...workshop,
          startDate: new Date(workshop.startDate),
          endDate: new Date(workshop.endDate),
          // Make sure bgColor and canceled are explicitly included
          bgColor: workshop.bgColor || null,
          canceled: workshop.canceled || false
        };
      });
      
      // Sort workshops to display past and canceled workshops at the end
      const sortedWorkshops = workshopsWithDates.sort((a: any, b: any) => {
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
      
      setRegisteredWorkshops(sortedWorkshops);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the font family based on the selection
  const getFontFamily = (fontName: string) => {
    switch (fontName) {
      case "Dancing Script":
        return dancingScript.style.fontFamily;
      case "Lobster":
        return lobster.style.fontFamily;
      case "Arvo":
        return arvo.style.fontFamily;
      case "Bebas Neue":
        return bebasNeue.style.fontFamily;
      default:
        return dancingScript.style.fontFamily;
    }
  };

  // Review stamp component
  const Stamp = ({
    color,
    font,
    text,
  }: {
    color: string;
    font: string;
    text: string;
  }) => {
    return (
      <div className="relative w-20 h-20 mx-auto">
        <div className="relative w-full h-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 66.73 69.75"
            className="absolute inset-0 w-full h-full"
            style={{ filter: `drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3))` }}
            key={color}
          >
            <g id="Layer_2" data-name="Layer 2">
              <g id="Layer_3" data-name="Layer 3">
                <path fill={color} d="M38.54,5.1A30.11,30.11,0,0,1,61.75,24.72h4.87l.06-.44-1.94-2V19.44l-2.22-1.73-.44-2.77-2.45-1.38-.84-2.68-2.63-1L54.92,7.36l-2.75-.59L50.58,4.45l-2.8-.17L45.86,2.22l-2.8.25L40.85.73l-2.73.66L35.68,0,33.07,1.06,30.45,0,28,1.48,25.29.86,23.12,2.64l-2.81-.2L18.43,4.53l-2.8.22L14.07,7.1l-2.73.64-1.19,2.54-2.61,1L6.74,14,4.32,15.43l-.39,2.79L1.74,20l0,2.81L0,24.72H5A30.12,30.12,0,0,1,38.54,5.1Z"/>
                <path fill={color} d="M61.68,45A30.11,30.11,0,0,1,5.05,45H.11l-.06.44L2,47.5l0,2.81L4.22,52l.44,2.77,2.45,1.38L8,58.87l2.63,1,1.23,2.53,2.75.59,1.59,2.32,2.8.17,1.92,2.06,2.8-.25L25.88,69l2.73-.66,2.44,1.39,2.6-1.06,2.63,1,2.41-1.43,2.75.62,2.17-1.78,2.81.2,1.88-2.09L51.1,65l1.55-2.35L55.39,62l1.19-2.55,2.61-1,.79-2.7,2.43-1.41.39-2.79L65,49.77,65,47,66.73,45Z"/>
                <path fill={color} d="M22.23,6.8,25,4.12,7.38.68A4,4,0,0,0,2.73,5.1l1.1,19.69L5.65,23A30.11,30.11,0,0,1,22.23,6.8Z"/>
                <path fill={color} d="M63.48,4.57A4,4,0,0,0,58.76.24L41.24,4,44,6.61a30.14,30.14,0,0,1,16.86,16l1.84,1.75Z"/>
                <path fill={color} d="M37.63,10.3a24.87,24.87,0,0,0-27,14.42h2.21a22.83,22.83,0,0,1,41,0h2.22a25.68,25.68,0,0,0-2.4-4.23A24.69,24.69,0,0,0,37.63,10.3Z"/>
                <path fill={color} d="M29.44,57.28A22.8,22.8,0,0,1,13,45H10.74A24.82,24.82,0,0,0,29.1,59.25a25.2,25.2,0,0,0,4.32.37A24.87,24.87,0,0,0,56,45H53.78A22.87,22.87,0,0,1,29.44,57.28Z"/>
                <path fill={color} d="M45.35,51.83a20.84,20.84,0,0,1-29-5.07c-.39-.56-.76-1.14-1.09-1.73H13a22.84,22.84,0,0,0,40.82,0H51.49A20.77,20.77,0,0,1,45.35,51.83Z"/>
                <path fill={color} d="M33.35,13.93a21,21,0,0,1,3.6.31,20.73,20.73,0,0,1,13.47,8.55,21.28,21.28,0,0,1,1.19,1.93h2.26a22.83,22.83,0,0,0-41,0h2.27A20.9,20.9,0,0,1,33.35,13.93Z"/>
                <path fill={color} d="M42.4,45.07a.47.47,0,0,0-.54.13l-.81.91-1.22,0a.47.47,0,0,0-.46.31.47.47,0,0,0,.13.53l.91.82,0,1.22a.49.49,0,0,0,.31.46.5.5,0,0,0,.54-.13l.81-.91,1.22,0a.49.49,0,0,0,.33-.85l-.91-.81,0-1.22A.48.48,0,0,0,42.4,45.07Z"/>
                <path fill={color} d="M34.22,48.07a.46.46,0,0,0-.54.13l-.82.91-1.22,0a.48.48,0,0,0-.33.84l.92.82,0,1.22a.49.49,0,0,0,.31.46.49.49,0,0,0,.54-.13l.81-.91,1.23,0a.49.49,0,0,0,.33-.85l-.92-.81,0-1.22A.47.47,0,0,0,34.22,48.07Z"/>
                <path fill={color} d="M26,45.07a.47.47,0,0,0-.54.13l-.81.91-1.22,0a.47.47,0,0,0-.46.31.45.45,0,0,0,.13.53l.91.82L24,49a.47.47,0,0,0,.31.46.5.5,0,0,0,.54-.13l.81-.91,1.22,0a.49.49,0,0,0,.46-.31.5.5,0,0,0-.13-.54l-.91-.81,0-1.22A.48.48,0,0,0,26,45.07Z"/>
                <path fill={color} d="M24.05,24.28a.49.49,0,0,0,.54-.13l.81-.92,1.23,0a.48.48,0,0,0,.33-.84L26,21.59l0-1.22a.49.49,0,0,0-.85-.33l-.81.92-1.23,0a.49.49,0,0,0-.33.85l.92.81,0,1.23A.47.47,0,0,0,24.05,24.28Z"/>
                <path fill={color} d="M32.24,21.28a.5.5,0,0,0,.54-.13l.81-.92,1.22,0a.47.47,0,0,0,.46-.3.46.46,0,0,0-.13-.54l-.91-.82,0-1.22a.48.48,0,0,0-.31-.46.5.5,0,0,0-.54.13l-.81.92-1.22,0a.49.49,0,0,0-.46.31.49.49,0,0,0,.13.54l.91.81,0,1.23A.5.5,0,0,0,32.24,21.28Z"/>
                <path fill={color} d="M40.43,24.28a.48.48,0,0,0,.53-.13l.82-.92,1.22,0a.48.48,0,0,0,.46-.3.49.49,0,0,0-.13-.54l-.91-.82,0-1.22a.49.49,0,0,0-.85-.33l-.81.92-1.22,0a.48.48,0,0,0-.46.31.47.47,0,0,0,.12.54l.92.81,0,1.23A.48.48,0,0,0,40.43,24.28Z"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <span 
            style={{ 
              fontFamily: getFontFamily(font),
              color: color,
              fontSize: '14px',
              textAlign: 'center'
            }}
            className="font-bold px-1"
          >
            {text}
          </span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchRegisteredWorkshops();
  }, [user]);  // This will refetch workshops whenever the user object changes

  // Fetch user's reviews
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingReviews(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('/api/reviews/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserReviews(data.reviews);
        }
      } catch (error) {
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchUserReviews();
  }, [isAuthenticated]);

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setIsLoadingNotifications(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingNotifications(false);
        return;
      }

      const response = await fetch('/api/users/removal-notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      const notificationsWithDates = data.notifications.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt)
      }));

      setNotifications(notificationsWithDates);
      
      // Show unread notifications automatically
      const unreadNotifications = notificationsWithDates.filter((n: UserNotification) => !n.read);
      if (unreadNotifications.length > 0) {
        setShowNotifications(true);
      }
    } catch (error) {
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/removal-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/removal-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setShowNotifications(false);
      }
    } catch (error) {
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      fetchRegisteredWorkshops();
      fetchNotifications();
    }
  }, [isAuthenticated, isInstructor]);

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

  // Get earned badges from user data
  const userBadges: Badge[] = user.badges || [];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
          <div className="px-6 py-4 md:px-8 md:py-6 flex flex-col md:flex-row">
            <div className="flex flex-col items-center md:flex-row md:items-end -mt-16 mb-4 md:mb-0 w-full md:w-auto">
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
            <div className="flex flex-col items-center md:flex-row md:items-end space-y-2 md:space-y-0 md:space-x-3 mt-4 md:mt-0">
              <Link href="/profile/settings">
                <HeroButton
                  text={t('editProfile')}
                  backgroundColor="#7471f9"
                  textColor="white"
                />
              </Link>
            </div>
          </div>
          
          {/* Profile Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex justify-center sm:justify-start -mb-px">
              <button
                onClick={() => handleTabChange('workshops')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'workshops'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('workshops')}
              </button>
              <button
                onClick={() => handleTabChange('badges')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'badges'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('badges')}
              </button>
              <button
                onClick={() => handleTabChange('reviews')}
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

        {/* Notification Banner */}
        {!isLoadingNotifications && notifications.length > 0 && showNotifications && (
          <div className="mb-6">
            {notifications
              .filter(notification => !notification.read)
              .slice(0, 3) // Show only the 3 most recent unread notifications
              .map((notification) => (
                <div key={notification._id} className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Icon 
                          icon={notification.type === 'workshop_removal' ? 'heroicons:exclamation-triangle' : 'heroicons:information-circle'} 
                          className="h-5 w-5 text-yellow-400 mt-0.5"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-yellow-800">
                            {t(notification.title)}
                          </h3>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {t('newNotification')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-yellow-700">
                          {t(notification.message, { workshopName: notification.workshopName || '' })}
                        </p>
                        <div className="mt-3 flex items-center space-x-4">
                          {notification.action && (
                            <Link 
                              href={notification.action.href}
                              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                            >
                              {t(notification.action.label)}
                            </Link>
                          )}
                          <button
                            onClick={() => markNotificationAsRead(notification._id)}
                            className="text-sm font-medium text-yellow-600 hover:text-yellow-800"
                          >
                            {t('markAsRead')}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => markNotificationAsRead(notification._id)}
                        className="rounded-md text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <span className="sr-only">Close</span>
                        <Icon icon="heroicons:x-mark" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {/* Show "Mark all as read" button if there are multiple unread notifications */}
            {notifications.filter(n => !n.read).length > 1 && (
              <div className="text-right">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                >
                  {t('markAllAsRead')}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
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
                        startDate={new Date(workshop.startDate)}
                        endDate={new Date(workshop.endDate)}
                        imageSrc={workshop.imageSrc}
                        delay={`delay-${(index % 3 + 1) * 100}`}
                        bgColor={workshop.bgColor || ["#c3c2fc", "#f8c5f4", "#fee487"][index % 3]}
                        isRegistered={true}
                        canceled={workshop.canceled || false}
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

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">{t('earnedBadges')}</h2>
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBadges.map((badge) => (
                    <ScrollReveal key={badge.id}>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                        <div className="flex flex-col items-center">
                          <div className="relative w-32 h-32 transform hover:scale-110 transition-transform duration-300 hover:rotate-3 mb-4">
                            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-indigo-100 shadow-xl bg-white">
                              <div className="absolute inset-0 bg-indigo-100 animate-pulse opacity-30"></div>
                              <Image 
                                src={badge.image} 
                                alt={badge.name} 
                                fill
                                className="object-cover p-1 relative z-10 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://via.placeholder.com/200?text=Badge";
                                }}
                              />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-indigo-700 mb-2">{badge.name}</h3>
                          <Link 
                            href={`/${locale}/workshops/${badge.workshopId}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm mb-2 text-center inline-flex items-center font-medium transition-colors"
                          >
                            <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 mr-1" />
                            {t('viewWorkshop') || 'View Workshop'}
                          </Link>
                          <p className="text-gray-500 text-xs">{new Date(badge.date).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon icon="heroicons:academic-cap" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">{t('noBadgesYet')}</p>
                  <p className="text-gray-400 mb-6">{t('noBadgesMessage')}</p>
                  <Link href={`/${locale}/workshops`}>
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

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#2f2f2f]">{t('yourReviews')}</h2>
              
              {isLoadingReviews ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
                </div>
              ) : userReviews.length > 0 ? (
                <div className="space-y-4">
                  {userReviews.map((review) => (
                    <div key={review._id} className="bg-indigo-50 rounded-lg shadow-sm p-4 border border-indigo-100">
                      {/* Review content */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                          <Stamp
                            color={review.circleColor || '#7471f9'}
                            font={review.circleFont || 'Arvo'}
                            text={review.circleText || '★'}
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                            <h4 className="font-medium text-gray-900 text-center sm:text-left">
                              {review.workshopName}
                            </h4>
                            <span className="text-gray-500 text-sm text-center sm:text-right">
                              {new Date(review.createdAt).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-center sm:text-left">{review.comment}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Edit/Delete buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3 border-t pt-3 justify-center sm:justify-end">
                        <Link href={`/${locale}/workshops/${review.workshop}`} className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors">
                          <Icon icon="heroicons:eye" className="w-4 h-4 mr-1" />
                          {t('viewWorkshop')}
                        </Link>
                        <Link href={getWorkshopReviewsUrl(review.workshop, locale)} className="flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors">
                          <Icon icon="heroicons:pencil-square" className="w-4 h-4 mr-1" />
                          {t('editReview')}
                        </Link>
                        <Link href={getWorkshopReviewsUrl(review.workshop, locale)} className="flex items-center justify-center text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-50 transition-colors">
                          <Icon icon="heroicons:trash" className="w-4 h-4 mr-1" />
                          {t('deleteReview')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon icon="heroicons:chat-bubble-left-right" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noReviewsYet')}</h3>
                  <p className="text-gray-500 mb-4">{t('noReviewsMessage')}</p>
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
        </div>
      </div>
    </div>
  );
};

// Export the component wrapped with email verification protection
export default withEmailVerification(ProfilePage);