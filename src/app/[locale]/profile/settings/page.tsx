"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import { useRouter } from 'next/navigation';

const ProfileSettingsPage = () => {
  const t = useTranslations('Settings');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
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

  // Ensure activeTab is valid
  useEffect(() => {
    if (activeTab === 'account') {
      setActiveTab('security');
    }
  }, [activeTab]);

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
        setUserData({
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar || "/images/avatar.jpg",
          emailNotifications: {
            workshops: true,
            changes: true
          }
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUserData({
      ...userData,
      emailNotifications: {
        ...userData.emailNotifications,
        [name]: checked
      }
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

      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
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
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
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
      console.error('Error updating password:', err);
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

      localStorage.removeItem('token');
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
      setIsLoading(false);
      setShowDeleteModal(false);
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
                    onClick={() => setActiveTab('profile')}
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
                    onClick={() => setActiveTab('notifications')}
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
                    onClick={() => setActiveTab('security')}
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
                <Link href="/profile" className="text-[#7471f9] hover:text-purple-800 text-sm font-medium flex items-center">
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{t('emailNotifications')}</h3>
                  <div className="space-y-4">
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
                      backgroundColor="#7471f9" // Updated purple color
                      textColor="white"
                      disabled={isLoading}
                    />
                  </div>
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
                      />
                    </div>
                    
                    <div className="pt-2">
                      <HeroButton
                        text={t('updatePassword')}
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
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <>
          <style jsx global>{keyframes}</style>
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
            style={modalAnimation}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              style={modalContentAnimation}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('deleteAccount')}</h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Icon icon="heroicons:x-mark" className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6">
                <div className="flex items-center text-red-600 mb-4">
                  <Icon icon="heroicons:exclamation-triangle" className="h-6 w-6 mr-2" />
                  <p className="font-medium">{t('deleteAccountWarning')}</p>
                </div>
                <p className="text-gray-600 text-sm">
                  This action cannot be undone. All your data, including profile information, reviews, and workshop registrations will be permanently deleted.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                      {t('deleting')}
                    </>
                  ) : (
                    t('deleteAccount')
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSettingsPage; 