import React from 'react';
import { Badge, Button, Container, Dropdown, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaMoon, FaSun, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useHeaderViewModel } from './viewmodels/useHeaderViewModel';

/**
 * @interface HeaderProps
 * Props for the Header component.
 */
interface HeaderProps {
    /**
     * Callback function to toggle the visibility of the sidebar.
     */
    toggleSidebar: () => void;
}

/**
 * Header component renders the top navigation bar of the application.
 * It includes a sidebar toggle for mobile, the application brand, theme switcher,
 * notification dropdown, and user profile dropdown with a logout option.
 *
 * @param {HeaderProps} props - The props for the component.
 * @returns {React.ReactElement} The Header component.
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const vm = useHeaderViewModel();

    return (
        <header>
            <Navbar bg="white" className="border-bottom shadow-sm" as="nav" role="navigation"
                    aria-label={vm.t('layout.header.ariaLabel')}>
                <Container fluid className="px-4">
                    <button
                        className="btn btn-link text-dark d-md-none"
                        onClick={toggleSidebar}
                        aria-label={vm.t('layout.header.toggleSidebarAriaLabel')}
                    >
                        <FaBars />
                    </button>

                    <Navbar.Brand className="d-none d-md-block fw-bold text-primary" tabIndex={0}
                                  aria-label={vm.t('layout.header.brandAriaLabel')}>
                        {vm.t('layout.header.brandText')}
                    </Navbar.Brand>

                    <div className="ms-auto d-flex align-items-center">
                        {/* Theme toggle button */}
                        <button
                            className="btn btn-link text-dark me-2"
                            onClick={vm.toggleTheme}
                            aria-label={vm.theme === 'dark' ? vm.t('layout.header.themeToggle.activateLightAria') : vm.t('layout.header.themeToggle.activateDarkAria')}
                            title={vm.theme === 'dark' ? vm.t('layout.header.themeToggle.activateLightAria') : vm.t('layout.header.themeToggle.activateDarkAria')}
                            style={{ fontSize: 20 }}
                        >
                            {vm.theme === 'dark' ? <FaSun /> : <FaMoon />}
                        </button>

                        {/* Notifications Dropdown */}
                        <Dropdown align="end" className="me-3">
                            <Dropdown.Toggle variant="link" className="nav-link p-0 text-dark position-relative"
                                             aria-label={vm.t('layout.header.notifications.ariaLabel')}
                                             id="dropdown-notifications">
                                <FaBell aria-hidden="true" />
                                {vm.unreadCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        role="status"
                                        aria-label={vm.t('layout.header.notifications.unreadBadgeAriaLabel', { count: vm.unreadCount })}
                                    >
                    {vm.unreadCount > 99 ? '99+' : vm.unreadCount}
                  </span>
                                )}
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}
                                           aria-labelledby="dropdown-notifications">
                                <div
                                    className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                    <h6 className="mb-0">{vm.t('layout.header.notifications.title')}</h6>
                                    {vm.unreadCount > 0 && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-decoration-none p-0"
                                            onClick={() => vm.markAllAsRead()}
                                        >
                                            <small>{vm.t('layout.header.notifications.markAllAsRead')}</small>
                                        </Button>
                                    )}
                                </div>
                                {vm.notifications.length === 0 ? (
                                    <Dropdown.Item
                                        disabled>{vm.t('layout.header.notifications.noNotifications')}</Dropdown.Item>
                                ) : (
                                    <>
                                        {vm.notifications?.slice(0, 5).map(notificationItem => (
                                            <Dropdown.Item
                                                key={notificationItem.id}
                                                className={`border-bottom ${!notificationItem.isRead ? 'bg-light' : ''}`}
                                                onClick={() => vm.markAsRead(notificationItem.id)}
                                                aria-current={!notificationItem.isRead ? 'true' : undefined}
                                            >
                                                <div className="d-flex align-items-start">
                                                    <div className="me-2">
                                                        {!notificationItem.isRead ? (
                                                            <Badge bg="primary" className="rounded-circle p-1" />
                                                        ) : (
                                                            <Badge bg="secondary"
                                                                   className="rounded-circle p-1 opacity-25" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{notificationItem.title}</div>
                                                        <small className="text-muted">{notificationItem.message}</small>
                                                        <div>
                                                            <small className="text-muted">
                                                                {vm.formatDateLocalized(notificationItem.createdAt)}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Dropdown.Item>
                                        ))}
                                        <Dropdown.Item as={Link} to="/notifications" className="text-center">
                                            <small>{vm.t('layout.header.notifications.viewAll')}</small>
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>

                        {/* User Profile Dropdown */}
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="nav-link p-0 text-dark d-flex align-items-center"
                                             aria-label={vm.t('layout.header.userMenu.ariaLabel')} id="dropdown-user">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                        style={{ width: '32px', height: '32px' }}>
                                        <FaUser aria-hidden="true" />
                                    </div>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu aria-labelledby="dropdown-user">
                                <Dropdown.ItemText>
                                    <span
                                        className="fw-bold">{vm.user?.username || vm.t('layout.header.userMenu.defaultUserName')}</span>
                                    <br />
                                    <small className="text-muted">{vm.user?.email}</small>
                                </Dropdown.ItemText>
                                <Dropdown.Divider />
                                <Dropdown.Item as={Link}
                                               to="/profile">{vm.t('layout.header.userMenu.profile')}</Dropdown.Item>
                                <Dropdown.Item
                                    onClick={vm.logout}>{vm.t('layout.header.userMenu.logout')}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
