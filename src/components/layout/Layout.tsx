import React, { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer.tsx'; // Corrected import path if it was Footer.tsx
import '../../styles/dashboard.css';
import { useTheme } from '../../hooks/useTheme';

/**
 * @interface LayoutProps
 * Props for the Layout component.
 */
interface LayoutProps {
    /** The content to be rendered within the main layout area. */
    children: ReactNode;
}

/**
 * Layout is the main structural component for the application.
 * It orchestrates the display of the Sidebar, Header, Footer, and the main content area.
 * It adapts its structure for authentication pages (login, register) by rendering a simplified layout.
 * The layout also manages the expanded/collapsed state of the sidebar based on screen size and user interaction,
 * and applies the current theme to the main container.
 *
 * @param {LayoutProps} props - The props for the component.
 * @returns {React.ReactElement} The main layout structure of the application.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const location = useLocation();
    const { theme } = useTheme();

    // Check if current route is login or register
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // Check screen size on initial load and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarExpanded(false);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    // For login/register pages, use a simplified layout without sidebar and header
    if (isAuthPage) {
        return (
            <div className={`auth-container theme-${theme}`}>
                <div className="auth-content">
                    {children}
                </div>
                <ToastContainer position="bottom-right" theme={theme} />
            </div>
        );
    }

    // For all other pages, use the full dashboard layout
    return (
        <div className={`dashboard-container theme-${theme}`}>
            <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />

            <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                <Header toggleSidebar={toggleSidebar} />

                <div className="content-area">
                    {children}
                </div>

                <Footer />
            </div>

            <ToastContainer position="bottom-right" theme={theme} />
        </div>
    );
};

export default Layout;
