import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './features/auth/contexts/AuthProvider';
import NotificationProvider from './features/notifications/contexts/NotificationProvider';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/Routes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './hooks/useTheme';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <NotificationProvider>
                        <ThemeProvider>
                            <Layout>
                                <AppRoutes/>
                            </Layout>
                        </ThemeProvider>
                    </NotificationProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
};

export default App;
