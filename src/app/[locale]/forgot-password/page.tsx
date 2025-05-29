'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const t = useTranslations('Auth');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setIsSubmitted(true);
        // Redirect to verification page
        router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('enterEmailToReset') || "Enter your email address and we'll send you a verification code to reset your password."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9]"
                required
              />
            </div>

            <div>
              <HeroButton
                text={loading ? t('sending') : t('sendResetCode')}
                type="submit"
                disabled={loading}
                backgroundColor="#7471f9"
                textColor="white"
                className="w-full"
              />
            </div>
          </form>
        ) : (
          <div className="text-center mt-8">
            <p className="mb-4 text-green-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}