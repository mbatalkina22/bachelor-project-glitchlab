"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<void>;
  registerInstructor: (instructorData: {
    name: string;
    email: string;
    password: string;
    surname?: string;
    description?: string;
    website?: string;
    linkedin?: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isInstructor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      }
      return data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
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
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUserData(token);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, avatar }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // After successful registration, log the user in
    await login(email, password);
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
  }) => {
    const response = await fetch('/api/auth/register-instructor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instructorData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Instructor registration failed');
    }

    // After successful instructor registration, log the user in
    await login(instructorData.email, instructorData.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  // Compute isAuthenticated based on whether user is set
  const isAuthenticated = !!user;

  // Compute isInstructor based on user role
  const isInstructor = user?.role === 'instructor';

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, registerInstructor, logout, refreshUser, isInstructor }}>
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