import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/contexts/AuthProvider.tsx';
import { useLocation } from 'react-router-dom';

export function useSidebarViewModel() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  const navItems = [
    { path: '/', icon: 'FaHome', labelKey: 'layout.sidebar.nav.dashboard' },
    { path: '/parents', icon: 'FaUsers', labelKey: 'layout.sidebar.nav.parents' },
    { path: '/students', icon: 'FaUserGraduate', labelKey: 'layout.sidebar.nav.students' },
    { path: '/payments', icon: 'FaCreditCard', labelKey: 'layout.sidebar.nav.payments' },
    { path: '/classes', icon: 'FaChalkboardTeacher', labelKey: 'layout.sidebar.nav.classes' },
    { path: '/discounts', icon: 'FaPercentage', labelKey: 'layout.sidebar.nav.discounts' },
    { path: '/expenses', icon: 'FaFileInvoice', labelKey: 'layout.sidebar.nav.expenses' },
  ];

  return {
    t,
    logout,
    isActive,
    navItems,
  };
}

