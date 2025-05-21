import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import {
    FaBars,
    FaChalkboardTeacher,
    FaCreditCard,
    FaHome,
    FaPercentage,
    FaSignOutAlt,
    FaUserGraduate,
    FaUsers
} from 'react-icons/fa';

interface SidebarProps {
    expanded: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className={`sidebar bg-dark text-white ${expanded ? 'expanded' : 'collapsed'}`} aria-label="Menu lateral"
             role="navigation">
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
                {expanded && <h5 className="m-0">School Control</h5>}
                <button
                    className="btn btn-link text-white p-0"
                    onClick={toggleSidebar}
                    aria-label={expanded ? 'Recolher menu lateral' : 'Expandir menu lateral'}
                >
                    <FaBars />
                </button>
            </div>

            <Nav className="flex-column" as="ul">
                <Nav.Item as="li">
                    <Link
                        to="/"
                        className={`nav-link py-3 ${isActive('/') ? 'active' : ''}`}
                        aria-current={isActive('/') ? 'page' : undefined}
                    >
                        <FaHome className="me-2" aria-hidden="true" />
                        {expanded && <span>Dashboard</span>}
                    </Link>
                </Nav.Item>

                <Nav.Item as="li">
                    <Link
                        to="/parents"
                        className={`nav-link py-3 ${isActive('/parents') ? 'active' : ''}`}
                        aria-current={isActive('/parents') ? 'page' : undefined}
                    >
                        <FaUsers className="me-2" aria-hidden="true" />
                        {expanded && <span>Responsáveis</span>}
                    </Link>
                </Nav.Item>

                <Nav.Item as="li">
                    <Link
                        to="/students"
                        className={`nav-link py-3 ${isActive('/students') ? 'active' : ''}`}
                        aria-current={isActive('/students') ? 'page' : undefined}
                    >
                        <FaUserGraduate className="me-2" aria-hidden="true" />
                        {expanded && <span>Estudantes</span>}
                    </Link>
                </Nav.Item>

                <Nav.Item as="li">
                    <Link
                        to="/payments"
                        className={`nav-link py-3 ${isActive('/payments') ? 'active' : ''}`}
                        aria-current={isActive('/payments') ? 'page' : undefined}
                    >
                        <FaCreditCard className="me-2" aria-hidden="true" />
                        {expanded && <span>Pagamentos</span>}
                    </Link>
                </Nav.Item>

                <Nav.Item as="li">
                    <Link
                        to="/classes"
                        className={`nav-link py-3 ${isActive('/classes') ? 'active' : ''}`}
                        aria-current={isActive('/classes') ? 'page' : undefined}
                    >
                        <FaChalkboardTeacher className="me-2" aria-hidden="true" />
                        {expanded && <span>Turmas</span>}
                    </Link>
                </Nav.Item>

                <Nav.Item as="li">
                    <Link
                        to="/discounts"
                        className={`nav-link py-3 ${isActive('/discounts') ? 'active' : ''}`}
                        aria-current={isActive('/discounts') ? 'page' : undefined}
                    >
                        <FaPercentage className="me-2" aria-hidden="true" />
                        {expanded && <span>Descontos</span>}
                    </Link>
                </Nav.Item>
            </Nav>
            <div className="mt-auto p-3 border-top">
                <button className="btn btn-outline-light w-100" onClick={logout} aria-label="Sair">
                    <FaSignOutAlt className="me-2" aria-hidden="true" />
                    {expanded && <span>Sair</span>}
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;

