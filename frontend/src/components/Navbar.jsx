import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { Menu, X, Bell, MessageSquare, LayoutDashboard, Settings, LogOut, ShieldCheck, Sparkles, ArrowRight, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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

  const scrollToSection = (id) => {
    closeMenu();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="navbar-container container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <svg className="brand-logo-icon" viewBox="0 0 24 24" fill="currentColor" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.2 2.2C13.6 2.2 13.9 2.5 13.8 2.9L12.2 8.5H18.2C18.7 8.5 19 9 18.7 9.4L9.8 21.4C9.4 21.9 8.7 21.7 8.9 21.1L10.6 14.5H4.8C4.3 14.5 4 14 4.3 13.6L12.3 2.6C12.5 2.3 12.8 2.2 13.2 2.2Z"/>
          </svg>
          <span className="brand-title">FreelanceHub</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
            Explore Talent
          </Link>
          {!user ? (
            <>
              <button 
                type="button" 
                className="nav-link nav-link-btn" 
                onClick={() => scrollToSection('features')}
              >
                Features
              </button>
              <button 
                type="button" 
                className="nav-link nav-link-btn" 
                onClick={() => scrollToSection('how-it-works')}
              >
                How It Works
              </button>
              <button 
                type="button" 
                className="nav-link nav-link-btn" 
                onClick={() => scrollToSection('testimonials')}
              >
                Testimonials
              </button>
            </>
          ) : (
            <>
              <div className="nav-link-separator" />
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>
                <LayoutDashboard size={15} className="mr-1 inline" /> Dashboard
              </Link>
              <Link to="/messages" className={`nav-link ${isActive('/messages')}`} onClick={closeMenu}>
                <MessageSquare size={15} className="mr-1 inline" /> Messages
                {user.unread_messages > 0 && (
                  <span className="nav-badge-count">{user.unread_messages}</span>
                )}
              </Link>
              {user.is_staff && (
                <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard')}`} onClick={closeMenu}>
                  <ShieldCheck size={15} className="mr-1 inline" /> Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right CTA / Auth Action Buttons */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-logged-in-group">
              <Link 
                to="/notifications" 
                className="notification-bell-btn" 
                onClick={closeMenu}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {user.unread_notifications > 0 && <span className="notification-indicator" />}
              </Link>

              <Link to="/profile/edit" className="user-profile-chip" onClick={closeMenu}>
                <Avatar 
                  src={user.avatar || user.avatar_url} 
                  fallback={(user.full_name || user.username || 'U')[0].toUpperCase()} 
                  size="sm" 
                />
                <span className="user-chip-name">{user.full_name || user.username}</span>
              </Link>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                icon={LogOut}
                className="logout-nav-btn"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="guest-action-group">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { navigate('/login'); closeMenu(); }}
              >
                Log In
              </Button>
              <Button 
                variant="lime" 
                size="sm" 
                iconRight={ArrowRight}
                onClick={() => { navigate('/signup'); closeMenu(); }}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div 
          className="mobile-drawer-backdrop" 
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-drawer-inner">
          <Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={closeMenu}>
            Explore Talent
          </Link>
          <button 
            type="button" 
            className="mobile-nav-link mobile-nav-btn-link" 
            onClick={() => scrollToSection('features')}
          >
            Features & USP
          </button>
          <button 
            type="button" 
            className="mobile-nav-link mobile-nav-btn-link" 
            onClick={() => scrollToSection('how-it-works')}
          >
            How It Works
          </button>
          <button 
            type="button" 
            className="mobile-nav-link mobile-nav-btn-link" 
            onClick={() => scrollToSection('testimonials')}
          >
            Testimonials
          </button>

          {user ? (
            <>
              <div className="mobile-drawer-divider" />
              <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/messages" className={`mobile-nav-link ${isActive('/messages')}`} onClick={closeMenu}>
                <MessageSquare size={18} /> Messages
                {user.unread_messages > 0 && (
                  <Badge variant="purple" className="ml-2">{user.unread_messages}</Badge>
                )}
              </Link>
              <Link to="/notifications" className={`mobile-nav-link ${isActive('/notifications')}`} onClick={closeMenu}>
                <Bell size={18} /> Notifications
                {user.unread_notifications > 0 && (
                  <span className="mobile-drawer-badge">●</span>
                )}
              </Link>
              <Link to="/profile/edit" className={`mobile-nav-link ${isActive('/profile/edit')}`} onClick={closeMenu}>
                <User size={18} /> Edit Profile
              </Link>
              {user.is_staff && (
                <Link to="/admin-dashboard" className={`mobile-nav-link ${isActive('/admin-dashboard')}`} onClick={closeMenu}>
                  <ShieldCheck size={18} /> Admin Dashboard
                </Link>
              )}
              <div className="mobile-drawer-divider" />
              <Button variant="danger" size="md" onClick={handleLogout} icon={LogOut} className="w-full">
                Logout
              </Button>
            </>
          ) : (
            <div className="mobile-auth-actions">
              <Button variant="secondary" size="lg" onClick={() => { navigate('/login'); closeMenu(); }} className="w-full">
                Log In
              </Button>
              <Button variant="lime" size="lg" onClick={() => { navigate('/signup'); closeMenu(); }} className="w-full">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
