"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/utils/cloudinaryClient';

const InstructorSettingsPage = () => {
  const t = useTranslations('Settings');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, isInstructor, logout } = useAuth();
  
  // Get tab from URL or default to 'profile'
  const tabFromUrl = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add state for temporary image file storage
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Function to handle tab change and update URL
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Update URL with new tab parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tab);
    
    // Use router.replace to update URL without adding to history
    router.replace(`/${locale}/profile/instructor/settings?${newSearchParams.toString()}`, { scroll: false });
  }, [locale, router, searchParams]);

  // Ensure activeTab is valid and sync with URL
  useEffect(() => {
    const validTabs = ['profile', 'about', 'security'];
    const currentTab = searchParams.get('tab') || 'profile';
    
    if (!validTabs.includes(currentTab)) {
      // If invalid tab, redirect to profile tab
      handleTabChange('profile');
    } else if (currentTab !== activeTab) {
      // Sync state with URL if they differ
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab, locale, router, handleTabChange]);

  // Redirect to regular profile if not an instructor
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      router.push(`/${locale}/profile/settings`);
    }
  }, [isAuthenticated, isInstructor, router, locale]);

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

  // User data state
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    email: "",
    avatar: "/images/default-avatar.png",
    description: "",
    website: "",
    linkedin: ""
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push(`/${locale}/login`);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(t('failedToFetchUserData'));
        }

        const data = await response.json();
        setUserData({
          name: data.user.name || "",
          surname: data.user.surname || "",
          email: data.user.email || "",
          avatar: data.user.avatar || "/images/default-avatar.png",
          description: data.user.description || "",
          website: data.user.website || "",
          linkedin: data.user.linkedin || ""
        });
      } catch (err) {
        setError(t('failedToLoadUserData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, locale, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.includes('image/')) {
        setError(t('invalidFileType'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('fileTooLarge'));
        return;
      }
      
      setError('');
      
      // Store the file reference but don't upload yet
      setSelectedImageFile(file);
      
      // Display preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageUrl(objectUrl);
      
      // Update UI to show the preview
      setUserData({
        ...userData,
        avatar: objectUrl
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      // If there's a selected image file, upload it to Cloudinary now
      let avatarUrl = userData.avatar;
      
      if (selectedImageFile) {
        try {
          // Upload the image to Cloudinary using direct upload (no Base64)
          avatarUrl = await uploadImage(selectedImageFile, 'instructors');
        } catch (imageError) {
          throw new Error(t('failedToUploadImage'));
        }
      }

      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          avatar: avatarUrl, // Use the Cloudinary URL if a new image was uploaded
          description: userData.description,
          website: userData.website,
          linkedin: userData.linkedin
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('failedToUpdateProfile'));
      }

      // Reset selected image file state
      setSelectedImageFile(null);
      
      // Update user data with the Cloudinary URL
      setUserData({
        ...userData,
        avatar: avatarUrl
      });

      setSuccessMessage(t('profileUpdatedSuccess'));
    } catch (err: any) {
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

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: userData.description,
          website: userData.website,
          linkedin: userData.linkedin
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('failedToUpdateProfile'));
      }

      setSuccessMessage(t('profileUpdatedSuccess'));
    } catch (err: any) {
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

    if (passwordData.newPassword.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/${locale}/login`);
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
        throw new Error(errorData.error || t('failedToUpdatePassword'));
      }

      setSuccessMessage(t('passwordUpdatedSuccess'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || t('failedToUpdatePassword'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/${locale}/login`);
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
        throw new Error(errorData.error || t('failedToDeleteAccount'));
      }

      // Use logout function to properly clear all authentication state
      logout();
    } catch (err: any) {
      setError(err.message || t('failedToDeleteAccount'));
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Preview image before upload
  useEffect(() => {
    if (selectedImageFile) {
      const objectUrl = URL.createObjectURL(selectedImageFile);
      setPreviewImageUrl(objectUrl);

      // Clean up the URL object after component unmount
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewImageUrl(null);
    }
  }, [selectedImageFile]);

  if (!user || !isInstructor) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('loading')}</h1>
        </div>
      </div>
    );
  }

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
                    onClick={() => handleTabChange('about')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'about' 
                        ? 'bg-purple-50 text-[#7471f9]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon="heroicons:information-circle" className="mr-3 h-5 w-5 text-current" />
                    {t('about')}
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
                <Link href={`/${locale}/profile/instructor`} className="text-[#7471f9] hover:text-[#5a57c7] text-sm font-medium flex items-center">
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
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <button
                            type="button"
                            className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                            onClick={triggerFileInput}
                          >
                            {t('changePhoto')}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {t('photoFormats')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="name">
                        {t('firstName')}
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
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="surname">
                        {t('lastName')}
                      </label>
                      <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={userData.surname}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
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
                  
                  <div className="flex justify-end">
                    <HeroButton
                      text={t('saveChanges')}
                      type="submit"
                      backgroundColor="#7471f9"
                      textColor="white"
                      disabled={isLoading}
                    />
                  </div>
                </form>
              </div>
            )}
            
            {/* About Me Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-secularone text-gray-900">{t('about')}</h2>
                  <p className="text-gray-500 text-sm">{t('bioDesc')}</p>
                </div>
                <form onSubmit={handleAboutSubmit} className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="description">
                      {t('bio')}
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={userData.description}
                      onChange={handleInputChange}
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="website">
                        {t('website')}
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={userData.website}
                        onChange={handleInputChange}
                        placeholder={t('websitePlaceholder')}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="linkedin">
                        {t('linkedinProfile')}
                      </label>
                      <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        value={userData.linkedin}
                        onChange={handleInputChange}
                        placeholder={t('linkedinPlaceholder')}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <HeroButton
                      text={t('saveChanges')}
                      type="submit"
                      backgroundColor="#7471f9"
                      textColor="white"
                      disabled={isLoading}
                    />
                  </div>
                </form>
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
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
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
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
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
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <HeroButton
                        text={t('updatePassword')}
                        type="submit"
                        backgroundColor="#7471f9"
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
                      backgroundColor="#b91c1c"
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
                  {t('deleteAccountDescription')}
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

export default InstructorSettingsPage;