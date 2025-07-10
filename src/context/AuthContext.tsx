"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  registeredWorkshops: string[];
  role: string;
  surname?: string;
  description?: string;
  website?: string;
  linkedin?: string;
  isVerified?: boolean;
  emailLanguage?: string;
  badges?: Array<{
    id: string;
    workshopId: string;
    name: string;
    image: string;
    date: Date;
    description: string;
  }>;
}

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  emailLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  pendingUser: PendingUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: string, emailLanguage?: string) => Promise<{ needsVerification: boolean }>;
  registerInstructor: (instructorData: {
    name: string;
    email: string;
    password: string;
    surname?: string;
    description?: string;
    website?: string;
    linkedin?: string;
    avatar?: string;
    emailLanguage?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isInstructor: boolean;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  needsVerification: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract locale from pathname (format is /[locale]/page)
  const getCurrentLocale = (): string => {
    if (!pathname) return 'en';
    const parts = pathname.split('/');
    return parts.length > 1 && parts[1] ? parts[1] : 'en';
  };

  const fetchUserData = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      const data = await res.json();
      
      if (data.user) {
        setUser(data.user);
        setPendingUser(null);
        setNeedsVerification(false);
        localStorage.removeItem('needsVerification');
      }
      return data.user;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('needsVerification');
      return null;
    }
  };

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      fetchUserData(token)
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    
    // Check for needsVerification in localStorage
    const verificationNeeded = localStorage.getItem('needsVerification') === 'true';
    setNeedsVerification(verificationNeeded);
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUserData(token);
    }
  };

  const login = async (email: string, password: string) => {
    const locale = getCurrentLocale();
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, locale }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    setPendingUser(null);
    setNeedsVerification(false);
    localStorage.removeItem('needsVerification');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    avatar?: string,
    emailLanguage?: string
  ) => {    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        avatar,
        emailLanguage
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Store token and pending user data
    localStorage.setItem('token', data.token);
    setUser(null); // No user yet until verification
    setPendingUser(data.pendingUser);
    
    // Set verification flag since all registrations require verification
    setNeedsVerification(true);
    localStorage.setItem('needsVerification', 'true');
    
    return { needsVerification: true };
  };

  const registerInstructor = async (instructorData: {
    name: string;
    email: string;
    password: string;
    surname?: string;
    description?: string;
    website?: string;
    linkedin?: string;
    avatar?: string;
    emailLanguage?: string;
  }) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        ...instructorData, 
        role: 'instructor'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Instructor registration failed');
    }

    // Store token and pending user data
    localStorage.setItem('token', data.token);
    setUser(null); // No user yet until verification
    setPendingUser(data.pendingUser);
    
    // Set verification flag since all registrations require verification
    setNeedsVerification(true);
    localStorage.setItem('needsVerification', 'true');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('needsVerification');
    localStorage.removeItem('redirectAfterLogin'); // Clear any stored redirect
    setUser(null);
    setPendingUser(null);
    setNeedsVerification(false);
    
    // Redirect to home page
    const locale = getCurrentLocale();
    router.push(`/${locale}`);
  };

  const verifyEmail = async (code: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verificationCode: code, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Email verification failed');
    }

    // Update token with the new one that doesn't have verification flags
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    // Clear verification flag
    setNeedsVerification(false);
    localStorage.removeItem('needsVerification');
    
    // Fetch the newly created user data
    await refreshUser();
    
    return data;
  };

  const resendVerificationCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const locale = getCurrentLocale();
    
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, locale }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend verification code');
    }
    
    return data;
  };

  const isInstructor = user?.role === 'instructor';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      pendingUser,
      loading,
      isAuthenticated,
      login,
      register,
      registerInstructor,
      logout,
      refreshUser,
      isInstructor,
      verifyEmail,
      resendVerificationCode,
      needsVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}