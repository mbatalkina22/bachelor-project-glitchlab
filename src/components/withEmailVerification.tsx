"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Higher-order component that redirects unverified users to the verification page
 */
export default function withEmailVerification<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function VerificationWrapper(props: P) {
    const { user, loading, needsVerification } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Wait until auth state is loaded
      if (!loading) {
        // If user needs verification, redirect to verification page
        if (user && needsVerification) {
          router.push('/verify-email');
        }
      }
    }, [user, loading, needsVerification, router]);

    // If still loading or needs verification, don't render the protected component
    if (loading || (user && needsVerification)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    // Otherwise render the protected component
    return <Component {...props} />;
  };
}