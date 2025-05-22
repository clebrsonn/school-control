import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import {
    FaBars,
    FaChalkboardTeacher,
    FaCreditCard,
    FaHome,
    FaPercentage,
    FaSignOutAlt,
    FaUserGraduate,
    FaUsers
} from 'react-icons/fa';

/**
 * @interface SidebarProps
 * Props for the Sidebar component.
 */
interface SidebarProps {
    /** Indicates whether the sidebar is currently expanded or collapsed. */
    expanded: boolean;
    /** Callback function to toggle the expanded/collapsed state of the sidebar. */
    toggleSidebar: () => void;
}

/**
 * Sidebar component provides the main navigation for the application.
 * It can be expanded or collapsed and displays navigation links with icons.
 * The links' active state is determined by the current route.
 *
 * @param {SidebarProps} props - The props for the component.
 * @returns {React.ReactElement} The Sidebar navigation component.
 */
const Sidebar: React.FC<SidebarProps> = ({ expanded, toggleSidebar }) => {
    const { logout } = useAuth(); // user from useAuth is not used here, can be removed if not needed for roles/permissions later
    const location = useLocation();
    const { t } = useTranslation(); // Initialize useTranslation

    /**
     * Checks if a given path is the currently active route.
     * @param {string} path - The path to check.
     * @returns {boolean} True if the path is active, false otherwise.
     */
    const isActive = (path: string): boolean => location.pathname === path;

    // Navigation items definition
    const navItems = [
        { path: "/", icon: FaHome, labelKey: "layout.sidebar.nav.dashboard" },
        { path: "/parents", icon: FaUsers, labelKey: "layout.sidebar.nav.parents" },
        { path: "/students", icon: FaUserGraduate, labelKey: "layout.sidebar.nav.students" },
        { path: "/payments", icon: FaCreditCard, labelKey: "layout.sidebar.nav.payments" },
        { path: "/classes", icon: FaChalkboardTeacher, labelKey: "layout.sidebar.nav.classes" },
        { path: "/discounts", icon: FaPercentage, labelKey: "layout.sidebar.nav.discounts" },
    ];

    return (
        <nav 
            className={`sidebar bg-dark text-white ${expanded ? 'expanded' : 'collapsed'}`} 
            aria-label={t('layout.sidebar.ariaLabel')}
            role="navigation"
        >
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
                {expanded && <h5 className="m-0">{t('layout.sidebar.brand')}</h5>}
                <button
                    className="btn btn-link text-white p-0"
                    onClick={toggleSidebar}
                    aria-label={expanded ? t('layout.sidebar.toggleCollapseAriaLabel') : t('layout.sidebar.toggleExpandAriaLabel')}
                >
                    <FaBars />
                </button>
            </div>

            <Nav className="flex-column" as="ul">
                {navItems.map(item => (
                    <Nav.Item as="li" key={item.path}>
                        <Link
                            to={item.path}
                            className={`nav-link py-3 ${isActive(item.path) ? 'active' : ''}`}
                            aria-current={isActive(item.path) ? 'page' : undefined}
                            title={expanded ? undefined : t(item.labelKey)} // Show full title on hover when collapsed
                        >
                            <item.icon className="me-2" aria-hidden="true" />
                            {expanded && <span>{t(item.labelKey)}</span>}
                        </Link>
                    </Nav.Item>
                ))}
            </Nav>
            <div className="mt-auto p-3 border-top">
                <button 
                    className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center" // Centered content
                    onClick={logout} 
                    aria-label={t('layout.sidebar.logoutAriaLabel')}
                >
                    <FaSignOutAlt className="me-2" aria-hidden="true" />
                    {expanded && <span>{t('layout.sidebar.logoutButton')}</span>}
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;

