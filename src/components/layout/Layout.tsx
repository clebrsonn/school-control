import React, { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer.tsx';
import '../../styles/dashboard.css';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const location = useLocation();

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
            <div className="auth-container">
                <div className="auth-content">
                    {children}
                </div>
                <ToastContainer />
            </div>
        );
    }

    // For all other pages, use the full dashboard layout
    return (
        <div className="dashboard-container">
            <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />

            <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                <Header toggleSidebar={toggleSidebar} />

                <div className="content-area">
                    {children}
                </div>

                <Footer />
            </div>

            <ToastContainer />
        </div>
    );
};

export default Layout;
