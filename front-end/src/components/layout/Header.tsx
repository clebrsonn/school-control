import React from 'react';
import { Container, Dropdown, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaUser } from 'react-icons/fa';
import { useAuth } from '../../features/auth/contexts/AuthProvider';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="white" className="border-bottom shadow-sm">
      <Container fluid className="px-4">
        <button
          className="btn btn-link text-dark d-md-none"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
        
        <Navbar.Brand className="d-none d-md-block">
          School Control Dashboard
        </Navbar.Brand>
        
        <div className="ms-auto d-flex align-items-center">
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle variant="link" className="nav-link p-0 text-dark">
              <FaBell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                0
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Não há notificações</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="nav-link p-0 text-dark d-flex align-items-center">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                     style={{ width: '32px', height: '32px' }}>
                  <FaUser />
                </div>
                {user && (
                  <span className="ms-2 d-none d-md-inline">{user.name || user.email}</span>
                )}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Perfil</Dropdown.Item>
              <Dropdown.Item>Configurações</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>Sair</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;