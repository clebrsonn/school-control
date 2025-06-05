import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSidebarViewModel } from './viewmodels/useSidebarViewModel';
import {
    FaBars,
    FaChalkboardTeacher,
    FaCreditCard,
    FaFileInvoice,
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
const Sidebar: React.FC<SidebarProps> = ({ expanded, toggleSidebar }: SidebarProps): React.ReactElement => {
    const vm = useSidebarViewModel();
    const iconMap: Record<string, React.ElementType> = {
        FaHome,
        FaUsers,
        FaUserGraduate,
        FaCreditCard,
        FaChalkboardTeacher,
        FaPercentage,
        FaFileInvoice
    };

    return (
        <nav 
            className={`sidebar bg-dark text-white ${expanded ? 'expanded' : 'collapsed'}`} 
            aria-label={vm.t('layout.sidebar.ariaLabel')}
            role="navigation"
        >
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
                {expanded && <h5 className="m-0">{vm.t('layout.sidebar.brand')}</h5>}
                <button
                    className="btn btn-link text-white p-0"
                    onClick={toggleSidebar}
                    aria-label={expanded ? vm.t('layout.sidebar.toggleCollapseAriaLabel') : vm.t('layout.sidebar.toggleExpandAriaLabel')}
                >
                    <FaBars />
                </button>
            </div>

            <Nav className="flex-column" as="ul">
                {vm.navItems.map(item => {
                    const Icon = iconMap[item.icon];
                    return (
                        <Nav.Item as="li" key={item.path}>
                            <Link
                                to={item.path}
                                className={`nav-link py-3 ${vm.isActive(item.path) ? 'active' : ''}`}
                                aria-current={vm.isActive(item.path) ? 'page' : undefined}
                                title={expanded ? undefined : vm.t(item.labelKey)}
                            >
                                <Icon className="me-2" aria-hidden="true" />
                                {expanded && <span>{vm.t(item.labelKey)}</span>}
                            </Link>
                        </Nav.Item>
                    );
                })}
            </Nav>
            <div className="mt-auto p-3 border-top">
                <button 
                    className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
                    onClick={vm.logout}
                    aria-label={vm.t('layout.sidebar.logoutAriaLabel')}
                >
                    <FaSignOutAlt className="me-2" aria-hidden="true" />
                    {expanded && <span>{vm.t('layout.sidebar.logoutButton')}</span>}
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;

