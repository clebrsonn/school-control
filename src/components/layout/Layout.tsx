import React, { ReactNode, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer.tsx';
// import '../../styles/dashboard.css'; // Removed as styles are migrated
import { useTheme } from '../../hooks/useTheme'; // This hook likely toggles 'dark' class on <html>

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const location = useLocation();
    const { theme } = useTheme(); // Used for ToastContainer theme, Shadcn handles main theme via html class

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    useEffect(() => {
        const handleResize = () => {
            // Use Tailwind responsive classes primarily, but this can be a fallback or for specific logic
            if (window.innerWidth < 768) { // md breakpoint in Tailwind
                setSidebarExpanded(false);
            } else {
                setSidebarExpanded(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    if (isAuthPage) {
        // Auth pages: Centered content area
        return (
            // Removed theme-${theme} as Shadcn/UI uses class="dark" on <html>
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <div className="w-full max-w-md"> {/* Adjust max-width as needed */}
                    {children}
                </div>
                <ToastContainer position="bottom-right" theme={theme} />
            </div>
        );
    }

    // Main dashboard layout
    return (
        // Removed theme-${theme}
        <div className="flex min-h-screen bg-background">
            <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />

            {/* Main content area: flex-grow, flex column, dynamic margin for sidebar */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
                    sidebarExpanded ? 'ml-64' : 'ml-20' // Adjust ml based on Sidebar expanded/collapsed width
                } md:ml-${sidebarExpanded ? '64' : '20'}`} // Example responsive margins, Sidebar will define its width
            >
                <Header toggleSidebar={toggleSidebar} />

                {/* Content Area: flex-grow for remaining space, padding, overflow for scroll */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>

                <Footer />
            </div>

            <ToastContainer position="bottom-right" theme={theme} />
        </div>
    );
};

export default Layout;
