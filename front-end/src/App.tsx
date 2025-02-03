import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from '@components/Layout';
import AppRoutes from '@routes/Routes';
import AppNavbar from '@components/AppNavBar';

const App: React.FC = () => {
  return (
    <Router>
      <AppNavbar />

      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
};

export default App;