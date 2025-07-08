"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icon } from '@iconify/react';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 space-y-3 max-w-sm sm:max-w-sm w-full sm:w-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }: { notification: NotificationData; onRemove: () => void }) {
  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconName = () => {
    switch (notification.type) {
      case 'success':
        return 'heroicons:check-circle';
      case 'error':
        return 'heroicons:x-circle';
      case 'warning':
        return 'heroicons:exclamation-triangle';
      case 'info':
        return 'heroicons:information-circle';
      default:
        return 'heroicons:bell';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`
      w-full border rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300 backdrop-blur-sm
      ${getNotificationStyles()}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon icon={getIconName()} className={`h-5 w-5 ${getIconColor()}`} />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold leading-5 break-words hyphens-auto">
            {notification.title}
          </p>
          <p className="mt-1 text-sm opacity-90 leading-5 break-words hyphens-auto">
            {notification.message}
          </p>
          {notification.action && (
            <div className="mt-3">
              <a
                href={notification.action.href}
                className="inline-flex text-sm font-medium text-current underline hover:no-underline transition-colors duration-200 break-words"
              >
                {notification.action.label}
              </a>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onRemove}
            className="inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded transition-colors duration-200"
            aria-label="Dismiss notification"
          >
            <Icon icon="heroicons:x-mark" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
