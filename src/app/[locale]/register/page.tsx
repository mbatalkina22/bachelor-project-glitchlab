"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import HeroButton from '@/components/HeroButton';

const AVATARS = [
  '/images/avatar.jpg',
  '/images/avatar2.jpg',
  '/images/avatar3.jpg',
  '/images/avatar4.jpg',
  '/images/avatar5.jpg',
  '/images/avatar6.jpg',
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLanguage, setEmailLanguage] = useState('en');
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const { register } = useAuth();

  // Handle redirect parameter
  useEffect(() => {
    const redirectParam = searchParams?.get('redirect');
    if (redirectParam) {
      localStorage.setItem('redirectAfterLogin', redirectParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }
    
    // Check password length
    if (password.length < 8) {
      setError(t('passwordTooShort') || 'Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);

    try {
      const result = await register(name, email, password, selectedAvatar, emailLanguage);
      
      if (result.needsVerification) {
        // Redirect to verification page if email verification is required
        // Note: The verification page will handle the workshop redirect after verification
        router.push('/verify-email');
      } else {
        // Check for redirect after registration
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          // Clear the redirect path and redirect to the stored path
          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          // Otherwise go to home page
          router.push('/');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('createAccount')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                {t('fullName')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
                placeholder={t('fullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('emailAddress')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
                placeholder={t('emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                {t('confirmPassword') || 'Confirm Password'}
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
                placeholder={t('confirmPassword') || 'Confirm Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectAvatar')}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative w-20 h-20 rounded-full overflow-hidden border-2 ${
                    selectedAvatar === avatar ? 'border-[#7471f9]' : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={avatar}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="email-language" className="block text-sm font-medium text-gray-700 mb-2">
              {t('emailLanguage') || 'Preferred Email Language'}
            </label>
            <select
              id="email-language"
              name="email-language"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
              value={emailLanguage}
              onChange={(e) => setEmailLanguage(e.target.value)}
            >
              <option value="en">{t('languageEnglish')}</option>
              <option value="it">{t('languageItalian')}</option>
            </select>
          </div>

          <div>
            <HeroButton
              text={loading ? t('creatingAccount') : t('createAccount')}
              backgroundColor="#7471f9"
              textColor="white"
              className="w-full"
            />
          </div>

          <div className="text-sm text-center">
            <Link
              href={searchParams?.get('redirect') ? `/login?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : "/login"}
              className="font-medium text-[#7471f9] hover:underline"
            >
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}