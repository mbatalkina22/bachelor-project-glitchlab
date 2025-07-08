"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import HeroButton from '@/components/HeroButton';

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifyEmail, resendVerificationCode, user, needsVerification, pendingUser } = useAuth();
  const router = useRouter();
  const t = useTranslations('Auth');

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

  // Handle verify button click
  const handleVerify = async () => {
    setError('');
    setLoading(true);
    
    try {
      const code = verificationCode.join('');
      if (code.length !== 6) {
        throw new Error(t('enterFullCode'));
      }
      
      await verifyEmail(code);
      
      // Check for redirect after verification
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        // Clear the redirect path and redirect to the stored path
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push('/profile');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('verificationFailed');
      setError(errorMessage);
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
      await resendVerificationCode();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('resendFailed');
      setError(errorMessage);
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

  // Update condition to check for either user OR pendingUser
  if ((!user && !pendingUser) || !needsVerification) {
    return null; // Don't render anything if not needed
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('verifyEmail')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('verificationCodeSent')} <span className="font-medium">{user?.email || pendingUser?.email}</span>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="mt-8">
          <div className="flex flex-col space-y-4">
            <label htmlFor="code-0" className="text-sm font-medium text-gray-700">
              {t('enterVerificationCode')}
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
                text={loading ? t('verifying') : t('verifyEmail')}
                onClick={handleVerify}
                disabled={loading}
                backgroundColor="#7471f9"
                textColor="white"
                className="w-full"
              />
            </div>
            
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resendDisabled}
                className="text-sm text-[#7471f9] hover:text-[#6361e4] disabled:text-gray-400"
              >
                {resendDisabled 
                  ? `${t('resendIn')} ${countdown}s` 
                  : t('resendCode')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}