import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {useAuth} from "../config/context/AuthProvider.tsx";

export default function AppNavbar() {
  const { user, logout } = useAuth();

  return (
    <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
      <Container >
        <Navbar.Brand href="/">School Control Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/parents">Responsáveis</Nav.Link>
            <Nav.Link href="/students">Estudentes</Nav.Link>
            <Nav.Link href="/payments">Pagamentos</Nav.Link>
            <Nav.Link href="/classes">Turmas</Nav.Link>
            <Nav.Link href="/discounts">Descontos</Nav.Link>
            <Nav.Link href="/expenses">Despesas</Nav.Link>
          </Nav>
          <Nav className="navbar">
              {user ? (
                  <Nav.Link onClick={logout}>Logout</Nav.Link>
              ) : (
                  <>
                    <Nav.Link href="/login">Login</Nav.Link>
                    <Nav.Link href="/register">Register</Nav.Link>
                  </>
              )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}