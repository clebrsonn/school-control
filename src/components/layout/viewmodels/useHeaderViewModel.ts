import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/contexts/AuthProvider.tsx';
import { useNotifications } from '../../../features/notifications/contexts/NotificationProvider.tsx';
import { useTheme } from '../../../hooks/useTheme.tsx';

export function useHeaderViewModel() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    t,
    i18n,
    user,
    logout,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    theme,
    toggleTheme,
    formatDate,
  };
}

