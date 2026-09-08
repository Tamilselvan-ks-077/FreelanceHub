import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { Menu, X, Bell, MessageSquare, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} glass`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon-wrapper">
            <span className="brand-icon">✧</span>
          </div>
          <span className="brand-text">FreelanceHub</span>
        </Link>

        <button 
          className="nav-mobile-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-content ${menuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
              Explore
            </Link>
            
            {user && (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/messages" className={`nav-link ${isActive('/messages')}`} onClick={closeMenu}>
                  Messages
                  {user.unread_messages > 0 && (
                    <Badge variant="primary" className="ml-2">{user.unread_messages}</Badge>
                  )}
                </Link>
                {user.is_staff && (
                  <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard')}`} onClick={closeMenu}>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/notifications" className="nav-icon-link" onClick={closeMenu}>
                  <Bell size={20} />
                  {user.unread_notifications > 0 && <span className="notification-dot"></span>}
                </Link>
                
                <div className="nav-divider"></div>
                
                <div className="user-profile-menu">
                  <Link to="/profile/edit" className="user-profile-link" onClick={closeMenu}>
                    <Avatar 
                      src={user.avatar} 
                      fallback={(user.full_name || user.username)[0].toUpperCase()} 
                      size="sm" 
                    />
                    <span className="user-name">{user.full_name || user.username}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} icon={LogOut}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => { navigate('/login'); closeMenu(); }}>
                  Log in
                </Button>
                <Button variant="primary" onClick={() => { navigate('/signup'); closeMenu(); }}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
