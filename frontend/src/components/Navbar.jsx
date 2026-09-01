import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">◆</span>
          <span className="brand-text">FreelanceHub</span>
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span></span><span></span><span></span>
          </span>
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
            Explore
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/messages" className={isActive('/messages')} onClick={() => setMenuOpen(false)}>
                Messages
                {user.unread_messages > 0 && <span className="nav-badge">{user.unread_messages}</span>}
              </Link>
              <Link to="/notifications" className={isActive('/notifications')} onClick={() => setMenuOpen(false)}>
                Notifications
                {user.unread_notifications > 0 && <span className="nav-badge">{user.unread_notifications}</span>}
              </Link>

              {user.is_staff && (
                <>
                  <div className="nav-separator" />
                  <Link to="/admin-dashboard" className={isActive('/admin-dashboard')} onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                </>
              )}

              <div className="nav-separator" />

              <Link to="/profile/edit" className={isActive('/profile/edit')} onClick={() => setMenuOpen(false)}>
                <span className="nav-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="avatar" />
                  ) : (
                    <span className="avatar avatar-placeholder">{(user.full_name || user.username)[0].toUpperCase()}</span>
                  )}
                </span>
                {user.full_name || user.username}
              </Link>

              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
