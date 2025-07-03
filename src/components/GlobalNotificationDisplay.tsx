

import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, LightbulbIcon, XIcon } from './IconComponents'; // Assuming Lightbulb for info

const GlobalNotificationDisplay: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const { theme } = useTheme();

  if (notifications.length === 0) {
    return null;
  }

  const getIconAndColors = (type: 'success' | 'warning' | 'error' | 'info') => {
    const baseIconClass = "w-6 h-6";
    switch (type) {
      case 'success':
        return { 
          Icon: CheckCircleIcon, 
          iconColor: theme === 'light' ? 'text-emerald-500' : 'text-emerald-400',
          bgColor: theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-800/90',
          borderColor: theme === 'light' ? 'border-emerald-300' : 'border-emerald-700',
          textColor: theme === 'light' ? 'text-emerald-700' : 'text-emerald-200',
          closeButtonHoverColor: theme === 'light' ? 'hover:text-emerald-700' : 'hover:text-emerald-300',
        };
      case 'warning':
        return { 
          Icon: ExclamationTriangleIcon, 
          iconColor: theme === 'light' ? 'text-amber-500' : 'text-amber-400',
          bgColor: theme === 'light' ? 'bg-amber-50' : 'bg-amber-800/90',
          borderColor: theme === 'light' ? 'border-amber-300' : 'border-amber-700',
          textColor: theme === 'light' ? 'text-amber-700' : 'text-amber-200',
          closeButtonHoverColor: theme === 'light' ? 'hover:text-amber-700' : 'hover:text-amber-300',
        };
      case 'error':
        return { 
          Icon: XCircleIcon, 
          iconColor: theme === 'light' ? 'text-red-500' : 'text-red-400',
          bgColor: theme === 'light' ? 'bg-red-50' : 'bg-red-800/90',
          borderColor: theme === 'light' ? 'border-red-300' : 'border-red-700',
          textColor: theme === 'light' ? 'text-red-700' : 'text-red-200',
          closeButtonHoverColor: theme === 'light' ? 'hover:text-red-700' : 'hover:text-red-300',
        };
      case 'info':
      default:
        return { 
          Icon: LightbulbIcon, // Or a specific InfoIcon if you have one
          iconColor: theme === 'light' ? 'text-sky-500' : 'text-sky-400',
          bgColor: theme === 'light' ? 'bg-sky-50' : 'bg-sky-800/90',
          borderColor: theme === 'light' ? 'border-sky-300' : 'border-sky-700',
          textColor: theme === 'light' ? 'text-sky-700' : 'text-sky-200',
          closeButtonHoverColor: theme === 'light' ? 'hover:text-sky-700' : 'hover:text-sky-300',
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[100] w-full max-w-xs sm:max-w-sm space-y-3">
      {notifications.map(notification => {
        const { Icon, iconColor, bgColor, borderColor, textColor, closeButtonHoverColor } = getIconAndColors(notification.type);
        return (
          <div
            key={notification.id}
            role="alert"
            aria-live={notification.type === 'error' || notification.type === 'warning' ? 'assertive' : 'polite'}
            className={`flex items-start p-3.5 sm:p-4 rounded-lg shadow-xl border ${bgColor} ${borderColor} animate-fadeIn transition-all duration-300 ease-in-out`}
          >
            <div className={`flex-shrink-0 pt-0.5 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className={`ml-2.5 sm:ml-3 flex-1 text-sm font-medium ${textColor}`}>
              {notification.message}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`ml-2.5 sm:ml-3 -mr-1 -mt-1 p-1.5 rounded-md ${textColor} opacity-70 hover:opacity-100 ${closeButtonHoverColor} focus:outline-none focus:ring-1 ${theme === 'light' ? 'focus:ring-slate-400' : 'focus:ring-slate-500'} transition-colors`}
              aria-label="Close notification"
            >
              <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalNotificationDisplay;
