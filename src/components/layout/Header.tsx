import React from 'react';
import { Badge, Button, Container, Dropdown, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaMoon, FaSun, FaUser } from 'react-icons/fa';
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import { useNotifications } from '../../features/notifications/contexts/NotificationProvider';
import { useTheme } from '../../hooks/useTheme';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <Navbar bg="white" className="border-bottom shadow-sm" as="nav" role="navigation" aria-label="Barra superior">
        <Container fluid className="px-4">
          <button
            className="btn btn-link text-dark d-md-none"
            onClick={toggleSidebar}
            aria-label="Abrir menu lateral"
          >
            <FaBars />
          </button>

          <Navbar.Brand className="d-none d-md-block fw-bold text-primary" tabIndex={0} aria-label="School Control Dashboard">
            School Control Dashboard
          </Navbar.Brand>

          <div className="ms-auto d-flex align-items-center">
            {/* Botão de alternância de tema */}
            <button
              className="btn btn-link text-dark me-2"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
              style={{ fontSize: 20 }}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>

            <Dropdown align="end" className="me-3">
              <Dropdown.Toggle variant="link" className="nav-link p-0 text-dark position-relative" aria-label="Notificações" id="dropdown-notifications">
                <FaBell aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" role="status" aria-label={`Você tem ${unreadCount} notificações não lidas`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }} aria-labelledby="dropdown-notifications">
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
                        aria-current={!notification.isRead ? 'true' : undefined}
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
              <Dropdown.Toggle variant="link" className="nav-link p-0 text-dark d-flex align-items-center" aria-label="Usuário" id="dropdown-user">
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                       style={{ width: '32px', height: '32px' }}>
                    <FaUser aria-hidden="true" />
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu aria-labelledby="dropdown-user">
                <Dropdown.ItemText>
                  <span className="fw-bold">{user?.name || 'Usuário'}</span>
                  <br />
                  <small className="text-muted">{user?.email}</small>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/profile">Perfil</Dropdown.Item>
                <Dropdown.Item onClick={logout}>Sair</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
