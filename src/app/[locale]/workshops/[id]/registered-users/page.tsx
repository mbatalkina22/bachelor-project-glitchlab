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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('user')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('email')}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredUsersPage;