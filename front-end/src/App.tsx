import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './features/auth/contexts/AuthProvider';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/Routes';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>

                <Layout>
                    <AppRoutes/>
                </Layout>
            </AuthProvider>
        </Router>

    );
};

export default App;