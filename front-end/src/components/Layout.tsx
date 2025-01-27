import React from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppNavbar from './AppNavBar';
import { Container } from 'react-bootstrap';

const Layout: React.FC = ({ children }) => {
  return (
    <Container data-bs-theme="dark">
      <AppNavbar />
     
      {children}
      <ToastContainer position="bottom-right" />
    </Container>
  );
};

export default Layout;