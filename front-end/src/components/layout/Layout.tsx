import React, { ReactNode } from 'react';
import AppNavbar from '../common/AppNavBar.tsx';
import { Container } from 'react-bootstrap';
import Footer from './Footer.tsx';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <main className="d-flex flex-column min-vh-100">
            <AppNavbar />

            <Container className="flex-grow-1">
                {children}
            </Container>
            <Footer />
        </main>
    );
};

export default Layout;