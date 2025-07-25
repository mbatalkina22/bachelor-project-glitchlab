"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import HeroButton from '@/components/HeroButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const { login, needsVerification } = useAuth();

  // Get the redirect path if it exists
  const redirectPath = searchParams?.get('redirect') || localStorage.getItem('redirectAfterLogin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // Check for redirect after login
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      
      // If auth context has needsVerification flag set, redirect to verification page
      if (needsVerification || localStorage.getItem('needsVerification') === 'true') {
        router.push('/verify-email');
      } else if (redirectPath) {
        // Clear the redirect path and redirect to the stored path
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
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
            {t('signInToAccount')}
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
              <label htmlFor="email-address" className="sr-only">
                {t('emailAddress')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-t-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
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
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-b-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] focus:z-10 sm:text-sm"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-[#7471f9] hover:underline"
              >
                {t('forgotPasswordLink')}
              </Link>
            </div>
          </div>

          <div>
            <HeroButton
              text={loading ? t('signingIn') : t('signIn')}
              type="submit"
              backgroundColor="#7471f9"
              textColor="white"
              className="w-full"
            />
          </div>

          <div className="text-sm text-center">
            <Link
              href={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : "/register"}
              className="font-medium text-[#7471f9] hover:underline"
            >
              {t('dontHaveAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}