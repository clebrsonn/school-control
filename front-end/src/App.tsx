import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import Layout from '@components/Layout';
import AppRoutes from '@routes/Routes';
import AuthProvider from "./config/context/AuthProvider";

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