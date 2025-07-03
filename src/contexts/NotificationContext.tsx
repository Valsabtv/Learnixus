
import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType, duration: number = 5000) => {
    const id = crypto.randomUUID();
    setNotifications(prevNotifications => [...prevNotifications, { id, message, type, duration }]);
    
    if (type !== 'error') { // Errors might need manual dismissal or longer duration
        setTimeout(() => {
        removeNotification(id);
        }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
