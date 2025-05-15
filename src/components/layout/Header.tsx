import React from 'react';
import { Badge, Button, Container, Dropdown, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaUser } from 'react-icons/fa';
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import { useNotifications } from '../../features/notifications/contexts/NotificationProvider';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                <h6 className="mb-0">Notificações</h6>
                {unreadCount > 0 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-decoration-none p-0" 
                    onClick={() => markAllAsRead()}
                  >
                    <small>Marcar todas como lidas</small>
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <Dropdown.Item disabled>Não há notificações</Dropdown.Item>
              ) : (
                <>
                  {notifications?.slice(0, 5).map(notification => (
                    <Dropdown.Item 
                      key={notification.id} 
                      className={`border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-2">
                          {!notification.isRead ? (
                            <Badge bg="primary" className="rounded-circle p-1" />
                          ) : (
                            <Badge bg="secondary" className="rounded-circle p-1 opacity-25" />
                          )}
                        </div>
                        <div>
                          <div className="fw-bold">{notification.title}</div>
                          <small className="text-muted">{notification.message}</small>
                          <div>
                            <small className="text-muted">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </Dropdown.Item>
                  ))}

                  <Dropdown.Item as={Link} to="/notifications" className="text-center">
                    <small>Ver todas as notificações</small>
                  </Dropdown.Item>
                </>
              )}
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
                  <span className="ms-2 d-none d-md-inline">{user.username || user.email}</span>
                )}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/profile">Perfil</Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings">Configurações</Dropdown.Item>
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
