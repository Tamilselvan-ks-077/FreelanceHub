import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Globe, Code, Share2, MapPin, Building } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="botanical-footer" aria-label="Site footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand & Business Info */}
          <div className="footer-brand-block">
            <Link to="/" className="footer-logo">
              <svg className="footer-brand-icon" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.2 2.2C13.6 2.2 13.9 2.5 13.8 2.9L12.2 8.5H18.2C18.7 8.5 19 9 18.7 9.4L9.8 21.4C9.4 21.9 8.7 21.7 8.9 21.1L10.6 14.5H4.8C4.3 14.5 4 14 4.3 13.6L12.3 2.6C12.5 2.3 12.8 2.2 13.2 2.2Z"/>
              </svg>
              <span className="footer-brand-title">FreelanceHub</span>
            </Link>

            <p className="footer-brand-desc">
              Curated marketplace connecting founders and enterprises directly with verified software engineers, AI architects, and editorial designers.
            </p>

            <div className="text-xs space-y-1.5 pt-2" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-1.5">
                <Building size={14} />
                <span>FreelanceHub Technologies Private Limited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>108 Botanical Garden Road, Bengaluru, KA 560004</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={14} />
                <span>support@freelancehub.io | grievance@freelancehub.io</span>
              </div>
            </div>

            <div className="footer-social-row mt-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="GitHub">
                <Code size={18} strokeWidth={1.5} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Twitter">
                <Share2 size={18} strokeWidth={1.5} />
              </a>
              <a href="https://freelancehub.io" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Website">
                <Globe size={18} strokeWidth={1.5} />
              </a>
              <a href="mailto:support@freelancehub.io" className="social-icon-btn" aria-label="Email Support">
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Nav Column: Marketplace */}
          <div className="footer-links-column">
            <h4 className="footer-column-heading">Marketplace</h4>
            <ul className="footer-links-list">
              <li><Link to="/#talent-directory">Find Talent</Link></li>
              <li><Link to="/signup">Apply as Freelancer</Link></li>
              <li><Link to="/#how-it-works">How It Works</Link></li>
              <li><Link to="/signup">Hire Engineers</Link></li>
              <li><Link to="/dashboard">Client Portal</Link></li>
            </ul>
          </div>

          {/* Nav Column: Workspace */}
          <div className="footer-links-column">
            <h4 className="footer-column-heading">Workspace</h4>
            <ul className="footer-links-list">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/messages">Studio Messages</Link></li>
              <li><Link to="/profile/edit">Edit Profile</Link></li>
              <li><Link to="/notifications">Notifications</Link></li>
              <li><Link to="/login">Sign In</Link></li>
            </ul>
          </div>

          {/* Nav Column: Legal & Compliance */}
          <div className="footer-links-column">
            <h4 className="footer-column-heading">Trust & Legal</h4>
            <ul className="footer-links-list">
              <li><Link to="/privacy">Privacy Policy (DPDP & GDPR)</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/cookies">Cookies & Tracking</Link></li>
              <li><Link to="/refund">Refund & Escrow Policy</Link></li>
              <li><a href="mailto:grievance@freelancehub.io">Grievance Officer</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {currentYear} FreelanceHub Technologies Private Limited. All rights reserved.
          </div>
          <div className="footer-legal-links flex items-center gap-4 text-xs">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <Link to="/cookies" className="hover:underline">Cookies</Link>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <Link to="/refund" className="hover:underline">Refunds</Link>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span className="footer-secure-tag inline-flex items-center gap-1">
              <ShieldCheck size={14} strokeWidth={1.5} color="#8C9A84" /> 256-bit Escrow Security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
