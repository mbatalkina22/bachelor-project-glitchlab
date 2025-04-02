"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';

const ProfileSettingsPage = () => {
  const t = useTranslations('Settings');
  const [activeTab, setActiveTab] = useState('profile');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Predefined avatar options
  const avatarOptions = [
    "/images/avatar.jpg",
    "/images/avatar2.jpg",
    "/images/avatar3.jpg",
    "/images/avatar4.jpg",
    "/images/avatar5.jpg",
    "/images/avatar6.jpg",
    
  ];

  // Mock user data - this would come from an API/auth provider in a real app
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/images/avatar.jpg",
    bio: "UX/UI designer and developer with a passion for creating user-friendly interfaces.",
    location: "New York, USA",
    phone: "+1 (555) 123-4567",
    socialLinks: {
      twitter: "https://twitter.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe"
    },
    emailNotifications: {
      workshops: true,
      reviews: true,
      updates: false
    },
    language: "en"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSocialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      socialLinks: {
        ...userData.socialLinks,
        [name]: value
      }
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserData({
      ...userData,
      language: e.target.value
    });
  };

  const handleAvatarChange = (avatar: string) => {
    setUserData({
      ...userData,
      avatar
    });
    setShowAvatarSelector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the updated user data to an API
    alert('Profile updated successfully!');
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings')}</h2>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon="heroicons:user" className="mr-3 h-5 w-5 text-current" />
                    {t('profileInfo')}
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'account' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon="heroicons:cog-6-tooth" className="mr-3 h-5 w-5 text-current" />
                    {t('accountSettings')}
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'notifications' 
                        ? 'bg-indigo-50 text-indigo-600' 
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
                        ? 'bg-indigo-50 text-indigo-600' 
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
                <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                  <Icon icon="heroicons:arrow-left" className="mr-2 h-4 w-4" />
                  {t('backToProfile')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{t('profileInfo')}</h2>
                  <p className="text-gray-500 text-sm">{t('profileInfoDesc')}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
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
                            target.src = "https://via.placeholder.com/80?text=User";
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
                                  target.src = "https://via.placeholder.com/64?text=Avatar";
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
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="location">
                        {t('location')}
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={userData.location}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="phone">
                        {t('phone')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="bio">
                      {t('bio')}
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={userData.bio}
                      onChange={handleInputChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('bioDesc')}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('socialProfiles')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Icon icon="mdi:twitter" className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                          type="url"
                          name="twitter"
                          placeholder="https://twitter.com/username"
                          value={userData.socialLinks.twitter}
                          onChange={handleSocialInputChange}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <Icon icon="mdi:linkedin" className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                          type="url"
                          name="linkedin"
                          placeholder="https://linkedin.com/in/username"
                          value={userData.socialLinks.linkedin}
                          onChange={handleSocialInputChange}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <Icon icon="mdi:github" className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                          type="url"
                          name="github"
                          placeholder="https://github.com/username"
                          value={userData.socialLinks.github}
                          onChange={handleSocialInputChange}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <HeroButton
                      text={t('saveChanges')}
                      backgroundColor="#4f46e5"
                      textColor="white"
                    />
                  </div>
                </form>
              </div>
            )}
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{t('accountSettings')}</h2>
                  <p className="text-gray-500 text-sm">{t('accountSettingsDesc')}</p>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{t('language')}</h3>
                    <select
                      value={userData.language}
                      onChange={handleLanguageChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-red-700 mb-2">{t('dangerZone')}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('deleteAccountWarning')}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      {t('deleteAccount')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{t('notifications')}</h2>
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
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
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
                          id="reviews"
                          name="reviews"
                          type="checkbox"
                          checked={userData.emailNotifications.reviews}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="reviews" className="text-sm font-medium text-gray-900">
                          {t('reviewNotifications')}
                        </label>
                        <p className="text-gray-500 text-xs">
                          {t('reviewNotificationsDesc')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="updates"
                          name="updates"
                          type="checkbox"
                          checked={userData.emailNotifications.updates}
                          onChange={handleNotificationChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="updates" className="text-sm font-medium text-gray-900">
                          {t('updateNotifications')}
                        </label>
                        <p className="text-gray-500 text-xs">
                          {t('updateNotificationsDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <HeroButton
                      text={t('savePreferences')}
                      backgroundColor="#4f46e5"
                      textColor="white"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{t('security')}</h2>
                  <p className="text-gray-500 text-sm">{t('securityDesc')}</p>
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">{t('changePassword')}</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="current-password">
                        {t('currentPassword')}
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        name="current-password"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="new-password">
                        {t('newPassword')}
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        name="new-password"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="confirm-password">
                        {t('confirmPassword')}
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        name="confirm-password"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <HeroButton
                        text={t('updatePassword')}
                        backgroundColor="#4f46e5"
                        textColor="white"
                      />
                    </div>
                  </form>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">{t('sessionHistory')}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Chrome on Windows</p>
                          <p className="text-xs text-gray-500">New York, USA • {t('currentSession')}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('active')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Safari on MacOS</p>
                          <p className="text-xs text-gray-500">San Francisco, USA • 2 days ago</p>
                        </div>
                        <button className="text-xs text-red-600 hover:text-red-800 font-medium">
                          {t('revoke')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage; 