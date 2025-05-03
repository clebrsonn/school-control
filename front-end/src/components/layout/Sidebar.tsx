import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/contexts/AuthProvider';
import {
  FaBars,
  FaChalkboardTeacher,
  FaCreditCard,
  FaHome,
  FaMoneyBillWave,
  FaPercentage,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserGraduate,
  FaUserPlus,
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
    <div className={`sidebar bg-dark text-white ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
        {expanded && <h5 className="m-0">School Control</h5>}
        <button 
          className="btn btn-link text-white p-0" 
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
      </div>
      
      <Nav className="flex-column">
        <Nav.Item>
          <Link 
            to="/" 
            className={`nav-link py-3 ${isActive('/') ? 'active' : ''}`}
          >
            <FaHome className="me-2" />
            {expanded && <span>Dashboard</span>}
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/parents" 
            className={`nav-link py-3 ${isActive('/parents') ? 'active' : ''}`}
          >
            <FaUsers className="me-2" />
            {expanded && <span>Responsáveis</span>}
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/students" 
            className={`nav-link py-3 ${isActive('/students') ? 'active' : ''}`}
          >
            <FaUserGraduate className="me-2" />
            {expanded && <span>Estudantes</span>}
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/payments" 
            className={`nav-link py-3 ${isActive('/payments') ? 'active' : ''}`}
          >
            <FaCreditCard className="me-2" />
            {expanded && <span>Pagamentos</span>}
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/classes" 
            className={`nav-link py-3 ${isActive('/classes') ? 'active' : ''}`}
          >
            <FaChalkboardTeacher className="me-2" />
            {expanded && <span>Turmas</span>}
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/discounts" 
            className={`nav-link py-3 ${isActive('/discounts') ? 'active' : ''}`}
          >
            <FaPercentage className="me-2" />
            {expanded && <span>Descontos</span>}
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link 
            to="/expenses" 
            className={`nav-link py-3 ${isActive('/expenses') ? 'active' : ''}`}
          >
            <FaMoneyBillWave className="me-2" />
            {expanded && <span>Despesas</span>}
          </Link>
        </Nav.Item>
      </Nav>
      
      <div className="mt-auto p-3">
        {user ? (
          <Nav.Link onClick={logout} className="d-flex align-items-center">
            <FaSignOutAlt className="me-2" />
            {expanded && <span>Logout</span>}
          </Nav.Link>
        ) : (
          <>
            <Nav.Item>
              <Link to="/login" className="nav-link d-flex align-items-center">
                <FaSignInAlt className="me-2" />
                {expanded && <span>Login</span>}
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/register" className="nav-link d-flex align-items-center">
                <FaUserPlus className="me-2" />
                {expanded && <span>Register</span>}
              </Link>
            </Nav.Item>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;