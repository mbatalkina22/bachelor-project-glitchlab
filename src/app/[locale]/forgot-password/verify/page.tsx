'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';

export default function VerifyPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = verify code, 2 = set new password
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Handle input change for verification code
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
    }
  };

  // Handle keydown event for backspace to move to previous input
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError(t('enterFullCode') || 'Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    // Here we only verify the code exists, not actually resetting password yet
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code,
          // Sending a temporary password that won't be used
          password: 'temporary-verification-only'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(t('codeVerified'));
        setStep(2); // Move to password reset step
      } else {
        setError(data.message || t('invalidCode'));
      }
    } catch (error) {
      setError(t('serverError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset form submitted');
    
    // Validate password and confirmation
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    
    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Sending password reset request with:', { 
        email, 
        code: verificationCode.join(''),
        passwordLength: password.length 
      });
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode.join(''), 
          password 
        }),
      });

      console.log('Password reset response status:', response.status);
      const data = await response.json();
      console.log('Password reset response data:', data);

      if (data.success) {
        setMessage(t('passwordResetSuccess') || 'Password reset successfully! Redirecting to login...');
        // Redirect to login after 2 seconds with locale
        setTimeout(() => {
          router.push(`/${searchParams.get('locale') || 'en'}/login`);
        }, 2000);
      } else {
        setError(data.message || t('resetFailed') || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(t('serverError') || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend button click
  const handleResend = async () => {
    setError('');
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setMessage(t('resendSuccess') || 'Verification code resent');
      } else {
        throw new Error(t('resendFailed') || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.message || t('resendFailed') || 'Failed to resend code');
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? t('verifyCode') : t('resetPassword')}
          </h2>
          {step === 1 && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('verificationCodeSent')} <span className="font-medium">{email}</span>
            </p>
          )}
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

        {step === 1 ? (
          <div className="mt-8">
            <form onSubmit={handleVerifyCode} className="flex flex-col space-y-4">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] text-black"
                  required
                  readOnly={!!searchParams.get('email')}
                />
              </div>
              
              <label htmlFor="code-0" className="text-sm font-medium text-gray-700">
                {t('verificationCode')}
              </label>
              
              <div className="flex justify-between space-x-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="block w-12 h-12 text-center text-xl font-semibold text-black border border-gray-300 rounded-md shadow-sm focus:border-[#7471f9] focus:ring-[#7471f9]"
                  />
                ))}
              </div>
              
              <div className="pt-2">
                <HeroButton
                  text={loading ? t('verifying') : t('verifyCode')}
                  type="submit"
                  disabled={loading}
                  backgroundColor="#7471f9"
                  textColor="white"
                  className="w-full"
                />
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendDisabled}
                  className="text-sm text-[#7471f9] hover:text-[#6361e4] disabled:text-gray-400"
                >
                  {resendDisabled 
                    ? `${t('resendIn') || 'Resend in'} ${countdown}s` 
                    : t('resendCode') || 'Resend code'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-8">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPassword')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] text-black"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#7471f9] focus:border-[#7471f9] text-black"
                  required
                  minLength={8}
                />
              </div>

              <div className="pt-2">
                <HeroButton
                  text={loading ? t('resetting') : t('resetPassword')}
                  type="submit"
                  disabled={loading}
                  backgroundColor="#7471f9"
                  textColor="white"
                  className="w-full"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}