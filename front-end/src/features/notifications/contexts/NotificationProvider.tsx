import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { INotification } from '@hyteck/shared';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../services/NotificationService';
import { useAuth } from '../../auth/contexts/AuthProvider';
import notification from '../../../components/common/Notification';

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        getNotifications(),
        getUnreadNotificationsCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      notification('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const updatedNotification = await markNotificationAsRead(id);
      
      // Update the notifications list
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === id ? updatedNotification : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err: any) {
      notification('Failed to mark notification as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update all notifications to read
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({
          ...notif,
          isRead: true
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      notification('All notifications marked as read', 'success');
    } catch (err: any) {
      notification('Failed to mark all notifications as read', 'error');
    }
  };

  // Fetch notifications when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        error, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;