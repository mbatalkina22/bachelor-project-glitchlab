"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';

interface RegisteredUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  badges?: {
    workshopId: string;
    name: string;
  }[];
}

interface WorkshopDetails {
  name: string;
  registeredCount: number;
  capacity: number;
}

const RegisteredUsersPage = () => {
  const params = useParams();
  const router = useRouter();
  const { locale, id: workshopId } = params;
  const t = useTranslations('WorkshopDetail');
  const { isAuthenticated, isInstructor } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [workshop, setWorkshop] = useState<WorkshopDetails | null>(null);
  const [awarding, setAwarding] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper function to check if user already has a badge
  const userHasBadge = (user: RegisteredUser) => {
    return user.badges?.some(badge => badge.workshopId === workshopId as string);
  };

  // Redirect if not an instructor
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      router.push(`/${locale}/workshops/${workshopId}`);
    }
  }, [isAuthenticated, isInstructor, router, locale, workshopId]);

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`/api/workshops/registered-users?workshopId=${workshopId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch registered users');
        }

        const data = await response.json();
        setUsers(data.users);
        setWorkshop(data.workshop);
      } catch (error: any) {
        console.error('Error fetching registered users:', error);
        setError(error.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    if (workshopId && isAuthenticated && isInstructor) {
      fetchRegisteredUsers();
    }
  }, [workshopId, isAuthenticated, isInstructor]);

  // Handle removing a user from the workshop
  const handleRemoveUser = async (userId: string, userName: string) => {
    // Don't allow removing users who have already been awarded a badge
    const user = users.find(u => u._id === userId);
    if (user && userHasBadge(user)) {
      setError("Cannot remove a user who has been awarded a badge");
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }
    
    try {
      // Show loading state for this specific user
      setRemoving(prev => ({ ...prev, [userId]: true }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/workshops/remove-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          workshopId: workshopId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove user');
      }

      // Remove user from the list
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      
      // Update workshop count
      if (workshop) {
        setWorkshop({
          ...workshop,
          registeredCount: Math.max(0, workshop.registeredCount - 1)
        });
      }

      // Show success message
      setSuccessMessage(`${userName} has been removed from the workshop`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (error: any) {
      console.error('Error removing user:', error);
      setError(error.message || 'Failed to remove user');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      // Clear loading state for this specific user
      setRemoving(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle awarding a badge to a user
  const handleAwardBadge = async (userId: string) => {
    try {
      // Show loading state for this specific user
      setAwarding(prev => ({ ...prev, [userId]: true }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/badges/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          workshopId: workshopId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to award badge');
      }

      const data = await response.json();
      
      // Update the user in the local state to show they now have the badge
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user._id === userId) {
            const badges = user.badges || [];
            return {
              ...user,
              badges: [...badges, {
                workshopId: workshopId as string,
                name: data.badge.name
              }]
            };
          }
          return user;
        })
      );

      // Show success message
      setSuccessMessage(`Badge awarded to ${users.find(u => u._id === userId)?.name}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

    } catch (error: any) {
      console.error('Error awarding badge:', error);
      setError(error.message || 'Failed to award badge');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      // Clear loading state for this specific user
      setAwarding(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('pleaseLogin')}</h1>
          <Link href={`/${locale}/login`} className="px-4 py-2 bg-[#7471f9] text-white rounded-md hover:bg-[#5f5dd6]">
            {t('login')}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7471f9]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center flex-col">
                <Icon icon="heroicons:exclamation-circle" className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <Link 
                  href={`/${locale}/workshops/${workshopId}`}
                  className="px-4 py-2 bg-[#7471f9] text-white rounded-md hover:bg-[#5f5dd6]"
                >
                  {t('backToWorkshop')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/workshops/${workshopId}`}
            className="flex items-center text-[#7471f9] hover:text-[#5f5dd6]"
          >
            <Icon icon="heroicons:arrow-left" className="w-5 h-5 mr-1" />
            {t('backToWorkshop')}
          </Link>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
            <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
            <Icon icon="heroicons:exclamation-circle" className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-secularone text-gray-900">
              {t('registeredUsers')} - {workshop?.name}
            </h2>
            <p className="text-gray-500 text-sm">
              {t('totalRegistered')}: {workshop?.registeredCount}/{workshop?.capacity}
            </p>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="heroicons:users" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noRegisteredUsers')}</h3>
                <p className="text-gray-500">{t('noRegisteredUsersMessage')}</p>
              </div>
            ) : (
              <>
                {/* Mobile Layout - Cards */}
                <div className="block md:hidden space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative">
                      {/* Remove button - top right corner */}
                      {!userHasBadge(user) && (
                        <button
                          onClick={() => handleRemoveUser(user._id, user.name)}
                          disabled={removing[user._id]}
                          className="absolute top-2 right-2 inline-flex items-center justify-center p-1 text-xs leading-4 font-medium text-gray-500 hover:text-red-600 focus:outline-none transition ease-in-out duration-150 disabled:opacity-50"
                          title="Remove user from workshop"
                        >
                          {removing[user._id] ? (
                            <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
                          ) : (
                            <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Avatar */}
                        <div className="relative h-20 w-20">
                          <Image 
                            src={user.avatar || "/images/default-avatar.png"} 
                            alt={user.name}
                            className="rounded-full"
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/default-avatar.png";
                            }}
                          />
                        </div>
                        
                        {/* Name */}
                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                        
                        {/* Email */}
                        <p className="text-sm text-gray-600">{user.email}</p>
                        
                        {/* Buttons */}
                        <div className="flex items-center justify-center w-full">
                          {userHasBadge(user) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
                              Badge Awarded
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAwardBadge(user._id)}
                              disabled={awarding[user._id]}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-full text-white bg-[#7471f9] hover:bg-[#5f5dd6] focus:outline-none focus:border-[#5f5dd6] focus:shadow-outline-indigo active:bg-[#5f5dd6] transition ease-in-out duration-150 disabled:opacity-50"
                            >
                              {awarding[user._id] ? (
                                <>
                                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-1 animate-spin" />
                                  Awarding...
                                </>
                              ) : (
                                <>
                                  <Icon icon="heroicons:gift" className="w-4 h-4 mr-1" />
                                  Award Badge
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Layout - Table */}
                <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('user')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('email')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image 
                                src={user.avatar || "/images/default-avatar.png"} 
                                alt={user.name}
                                className="rounded-full"
                                fill
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/default-avatar.png";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {userHasBadge(user) ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
                                Badge Awarded
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleAwardBadge(user._id)}
                                  disabled={awarding[user._id]}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-full text-white bg-[#7471f9] hover:bg-[#5f5dd6] focus:outline-none focus:border-[#5f5dd6] focus:shadow-outline-indigo active:bg-[#5f5dd6] transition ease-in-out duration-150 disabled:opacity-50"
                                >
                                  {awarding[user._id] ? (
                                  <>
                                    <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-1 animate-spin" />
                                    Awarding...
                                  </>
                                  ) : (
                                  <>
                                    <Icon icon="heroicons:gift" className="w-4 h-4 mr-1" />
                                    Award Badge
                                  </>
                                  )}
                                </button>
                                
                                {/* Remove button - moved to right side after award button */}
                                <button
                                  onClick={() => handleRemoveUser(user._id, user.name)}
                                  disabled={removing[user._id]}
                                  className="inline-flex items-center justify-center p-1 text-xs leading-4 font-medium text-gray-500 hover:text-red-600 focus:outline-none transition ease-in-out duration-150 disabled:opacity-50"
                                  title="Remove user from workshop"
                                >
                                  {removing[user._id] ? (
                                    <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredUsersPage;