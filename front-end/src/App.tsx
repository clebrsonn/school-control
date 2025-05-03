import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './features/auth/contexts/AuthProvider';
import NotificationProvider from './features/notifications/contexts/NotificationProvider';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/Routes';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <NotificationProvider>
                        <Layout>
                            <AppRoutes/>
                        </Layout>
                    </NotificationProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
};

export default App;
