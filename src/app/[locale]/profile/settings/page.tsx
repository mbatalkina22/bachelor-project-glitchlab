"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

const ProfileSettingsPage = () => {
  const t = useTranslations('Settings');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { logout } = useAuth();
  
  // Get tab from URL or default to 'profile'
  const tabFromUrl = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Animation style for modal
  const modalAnimation = {
    animation: 'fadeIn 0.3s ease-out',
  };

  const modalContentAnimation = {
    animation: 'scaleIn 0.3s ease-out',
  };

  // CSS keyframes for animations
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  // Predefined avatar options
  const avatarOptions = [
    "/images/avatar.jpg",
    "/images/avatar2.jpg",
    "/images/avatar3.jpg",
    "/images/avatar4.jpg",
    "/images/avatar5.jpg",
    "/images/avatar6.jpg",
  ];

  // User data state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "/images/avatar.jpg",
    emailLanguage: "en",
    emailNotifications: {
      workshops: true,
      changes: true
    }
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Function to handle tab change and update URL
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tab);
    
    // Use router.replace to update URL without adding to history
    router.replace(`/${locale}/profile/settings?${newSearchParams.toString()}`, { scroll: false });
  }, [locale, router, searchParams]);

  // Ensure activeTab is valid and sync with URL
  useEffect(() => {
    const validTabs = ['profile', 'notifications', 'security'];
    const currentTab = searchParams.get('tab') || 'profile';
    
    if (!validTabs.includes(currentTab)) {
      // If invalid tab, redirect to profile tab
      handleTabChange('profile');
    } else if (currentTab !== activeTab) {
      // Sync state with URL if they differ
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab, locale, router, handleTabChange]);

  // Remove the old useEffect that was checking for 'account' tab
  // useEffect(() => {
  //   if (activeTab === 'account') {
  //     setActiveTab('security');
  //   }
  // }, [activeTab]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        // Set initial user data without notification preferences
        setUserData({
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar || "/images/avatar.jpg",
          emailLanguage: data.user.emailLanguage || "en",
          emailNotifications: {
            workshops: true,
            changes: true
          }
        });
        
        // Fetch notification preferences separately
        fetchNotificationPreferences(token);
        
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Extract fetchNotificationPreferences as a separate function
  const fetchNotificationPreferences = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/notification-preferences', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      
      setUserData(prev => ({
        ...prev,
        emailNotifications: data.emailNotifications || {
          workshops: true,
          changes: true
        }
      }));
    } catch (error) {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUserData(prev => {
      const newData = {
        ...prev,
        emailNotifications: {
          ...prev.emailNotifications,
          [name]: checked
        }
      };
      return newData;
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleAvatarChange = (avatar: string) => {
    setUserData({
      ...userData,
      avatar
    });
    setShowAvatarSelector(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccessMessage(t('profileUpdatedSuccess'));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      // Check if it's a duplicate email error and use translation
      if (err.message && err.message.includes('already being used by another account')) {
        setError(t('emailAlreadyExists'));
      } else {
        setError(err.message || t('failedToUpdateProfile'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      setSuccessMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Use logout function to properly clear all authentication state
      logout();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }


      // Update notification preferences
      const notificationResponse = await fetch('/api/users/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailNotifications: userData.emailNotifications
        })
      });

      if (!notificationResponse.ok) {
        const errorData = await notificationResponse.json();
        throw new Error(errorData.error || 'Failed to update notification preferences');
      }

      const responseData = await notificationResponse.json();

      // Update email language
      const emailLanguageResponse = await fetch('/api/users/email-language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailLanguage: userData.emailLanguage
        })
      });

      if (!emailLanguageResponse.ok) {
        const errorData = await emailLanguageResponse.json();
        throw new Error(errorData.error || 'Failed to update email language');
      }

      setSuccessMessage(t('preferencesUpdated'));
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-secularone text-gray-900 mb-4">{t('settings')}</h2>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile' 
                        ? 'bg-purple-50 text-[#7471f9]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon="heroicons:user" className="mr-3 h-5 w-5 text-current" />
                    {t('profileInfo')}
                  </button>
                  <button
                    onClick={() => handleTabChange('notifications')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications' 
                        ? 'bg-purple-50 text-[#7471f9]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon="heroicons:bell" className="mr-3 h-5 w-5 text-current" />
                    {t('notifications')}
                  </button>
                  <button
                    onClick={() => handleTabChange('security')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'security' 
                        ? 'bg-purple-50 text-[#7471f9]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon="heroicons:lock-closed" className="mr-3 h-5 w-5 text-current" />
                    {t('security')}
                  </button>
                </nav>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <Link href="/profile" className="text-[#7471f9] hover:text-[#5a57c7] text-sm font-medium flex items-center">
                  <Icon icon="heroicons:arrow-left" className="mr-2 h-4 w-4" />
                  {t('backToProfile')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}
            
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-secularone text-gray-900">{t('profileInfo')}</h2>
                  <p className="text-gray-500 text-sm">{t('profileInfoDesc')}</p>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {t('profilePicture')}
                    </label>
                    <div className="flex items-center">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={userData.avatar}
                          alt={userData.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/default-avatar.png";
                          }}
                        />
                      </div>
                      <div className="ml-5">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                          >
                            {t('changeAvatar')}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {t('selectFromAvailable')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Avatar Selector */}
                    {showAvatarSelector && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">{t('selectAvatar')}</h4>
                        <div className="flex flex-wrap gap-4">
                          {avatarOptions.map((avatar, index) => (
                            <button
                              key={index}
                              type="button"
                              className={`relative h-16 w-16 rounded-full overflow-hidden ${
                                userData.avatar === avatar ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:opacity-80'
                              }`}
                              onClick={() => handleAvatarChange(avatar)}
                            >
                              <Image
                                src={avatar}
                                alt={`Avatar option ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/default-avatar.png";
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="name">
                        {t('fullName')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="email">
                        {t('emailAddress')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <HeroButton
                      text={t('saveChanges')}
                      type="submit"
                      backgroundColor="#7471f9" // Updated purple color
                      textColor="white"
                      disabled={isLoading}
                    />
                  </div>
                </form>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-secularone text-gray-900">{t('notifications')}</h2>
                  <p className="text-gray-500 text-sm">{t('notificationsDesc')}</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleNotificationsSubmit}>
                    <div className="space-y-8">
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="email-language">
                          {t('emailLanguage')}
                        </label>
                        <p className="text-gray-500 text-xs mb-2">
                          {t('emailLanguageDesc')}
                        </p>
                        <div className="relative">
                          <select
                            id="email-language"
                            name="email-language"
                            value={userData.emailLanguage || 'en'}
                            onChange={(e) => setUserData({
                              ...userData,
                              emailLanguage: e.target.value
                            })}
                            className="appearance-none w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base bg-white pr-10"
                          >
                            <option value="en">English</option>
                            <option value="it">Italian</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <Icon icon="heroicons:chevron-down" className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {t('emailNotifications')}
                        </label>
                        <div className="space-y-4 mt-2">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="workshops"
                                name="workshops"
                                type="checkbox"
                                checked={userData.emailNotifications.workshops}
                                onChange={handleNotificationChange}
                                className="focus:ring-[#7471f9] h-4 w-4 text-[#7471f9] border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3">
                              <label htmlFor="workshops" className="text-sm font-medium text-gray-900">
                                {t('workshopNotifications')}
                              </label>
                              <p className="text-gray-500 text-xs">
                                {t('workshopNotificationsDesc')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="changes"
                                name="changes"
                                type="checkbox"
                                checked={userData.emailNotifications.changes}
                                onChange={handleNotificationChange}
                                className="focus:ring-[#7471f9] h-4 w-4 text-[#7471f9] border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3">
                              <label htmlFor="changes" className="text-sm font-medium text-gray-900">
                                {t('changeNotifications')}
                              </label>
                              <p className="text-gray-500 text-xs">
                                {t('changeNotificationsDesc')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <HeroButton
                            text={t('savePreferences')}
                            type="submit"
                            backgroundColor="#7471f9"
                            textColor="white"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-secularone text-gray-900">{t('security')}</h2>
                  <p className="text-gray-500 text-sm">{t('securityDesc')}</p>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#2f2f2f] mb-6">{t('changePassword')}</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="currentPassword">
                        {t('currentPassword')}
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="newPassword">
                        {t('newPassword')}
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                        required
                        minLength={8}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="confirmPassword">
                        {t('confirmPassword')}
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                        required
                        minLength={8}
                      />
                    </div>
                    
                    <div className="pt-2 flex justify-end">
                      <HeroButton
                        text={t('updatePassword')}
                        type="submit"
                        backgroundColor="#7471f9" // Updated purple color
                        textColor="white"
                        disabled={isLoading}
                      />
                    </div>
                  </form>

                  <div className="mt-12 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-red-700 mb-2">{t('dangerZone')}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('deleteAccountWarning')}
                    </p>
                    <div className="flex justify-end">
                      <HeroButton
                        text={t('deleteAccount')}
                        backgroundColor="#b91c1c" // Red-700 in hex
                        textColor="white"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isLoading}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title={t('deleteAccount')}
        message={t('deleteAccountWarning') + " This action cannot be undone. All your data, including profile information, reviews, and workshop registrations will be permanently deleted."}
        confirmText={t('deleteAccount')}
        cancelText={t('cancel')}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isProcessing={isLoading}
        processingText={t('deleting')}
        iconName="heroicons:exclamation-triangle"
        iconColor="text-red-600"
      />
    </div>
  );
};

export default ProfileSettingsPage;