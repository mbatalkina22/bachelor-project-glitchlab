"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

const AddInstructorPage = () => {
  const t = useTranslations('Profile');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user, isAuthenticated, isInstructor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Redirect to regular profile if not an instructor
  useEffect(() => {
    if (isAuthenticated && !isInstructor) {
      router.push(`/${locale}/profile`);
    }
  }, [isAuthenticated, isInstructor, locale, router]);

  // New instructor data
  const [instructorData, setInstructorData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    website: '',
    linkedin: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInstructorData({
      ...instructorData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (instructorData.password !== instructorData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (instructorData.password.length < 6) {
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

      const response = await fetch('/api/instructors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: instructorData.name,
          surname: instructorData.surname,
          email: instructorData.email,
          password: instructorData.password,
          description: instructorData.description,
          website: instructorData.website,
          linkedin: instructorData.linkedin
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('failedToRegister'));
      }

      setSuccessMessage(t('instructorRegistered'));
      // Clear form
      setInstructorData({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
        description: '',
        website: '',
        linkedin: ''
      });
    } catch (err: any) {
      console.error('Error registering instructor:', err);
      setError(err.message || t('failedToRegister'));
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-secularone text-gray-900">{t('addNewInstructor')}</h2>
            <p className="text-gray-500 text-sm">{t('registerNewInstructor')}</p>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mx-6 mt-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-[#7471f9] text-[#7471f9]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('basicInformation')}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'about'
                    ? 'border-b-2 border-[#7471f9] text-[#7471f9]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('aboutInformation')}
              </button>
            </nav>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {activeTab === 'basic' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="name">
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={instructorData.name}
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
                      value={instructorData.surname}
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
                    value={instructorData.email}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t('emailForLogin')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="password">
                      {t('password')}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={instructorData.password}
                      onChange={handleInputChange}
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
                      value={instructorData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Link href={`/${locale}/profile/instructor`}>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-[#7471f9] bg-white border border-[#7471f9] rounded-full hover:bg-gray-50"
                    >
                      {t('cancel')}
                    </button>
                  </Link>
                  
                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#7471f9] rounded-full hover:bg-[#5a57c7]"
                  >
                    {t('nextAboutInfo')}
                  </button>
                </div>
              </>
            )}
            
            {activeTab === 'about' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="description">
                    {t('bioDescription')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={instructorData.description}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t('optionalAddLater')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="website">
                      {t('personalWebsite')}
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={instructorData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('optionalAddLater')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="linkedin">
                      {t('linkedinProfile')}
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={instructorData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourname"
                      className="w-full border-gray-300 rounded-md shadow-sm hover:shadow-md focus:shadow-md transition-shadow duration-300 focus:ring-[#7471f9] focus:border-[#7471f9] sm:text-sm text-black py-3 px-4 text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('optionalAddLater')}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className="px-4 py-2 text-sm font-medium text-[#7471f9] bg-white border border-[#7471f9] rounded-full hover:bg-gray-50"
                  >
                    {t('backToBasic')}
                  </button>
                  
                  <HeroButton
                    text={t('registerInstructor')}
                    backgroundColor="#7471f9"
                    textColor="white"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInstructorPage; 