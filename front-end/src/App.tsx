import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from '@components/Layout';
import AppRoutes from '@routes/Routes';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
};

export default App;