import React from 'react';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Container} from 'react-bootstrap';
import AppNavbar from "./AppNavBar.tsx";

const Layout: React.FC = ({children}) => {
    return (
        <>
            <AppNavbar/>

            <Container>

                {children}
                <ToastContainer position="bottom-right"/>
            </Container>
        </>
    );
};

export default Layout;