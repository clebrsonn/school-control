import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/contexts/AuthProvider.tsx';
import { useNotifications } from '../../../features/notifications/contexts/NotificationProvider.tsx';
import { useTheme } from '../../../hooks/useTheme.tsx';
import { formatDateLocalized } from '../../../utils/dateUtils.ts';

export function useHeaderViewModel() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

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
    formatDateLocalized,
  };
}

