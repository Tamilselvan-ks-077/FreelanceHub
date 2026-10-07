import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ShieldCheck, Globe, Code, Share2, Leaf } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="botanical-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-block">
            <Link to="/" className="footer-logo">
              <svg className="footer-brand-icon" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.2 2.2C13.6 2.2 13.9 2.5 13.8 2.9L12.2 8.5H18.2C18.7 8.5 19 9 18.7 9.4L9.8 21.4C9.4 21.9 8.7 21.7 8.9 21.1L10.6 14.5H4.8C4.3 14.5 4 14 4.3 13.6L12.3 2.6C12.5 2.3 12.8 2.2 13.2 2.2Z"/>
              </svg>
              <span className="footer-brand-title">FreelanceHub</span>
            </Link>

            <p className="footer-brand-desc">
              An intentional, artisanal marketplace for verified engineering craftsmen, AI researchers, and editorial designers.
            </p>

            <div className="footer-social-row">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="GitHub">
                <Code size={18} strokeWidth={1.5} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Social">
                <Share2 size={18} strokeWidth={1.5} />
              </a>
              <a href="https://freelancehub.io" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Website">
                <Globe size={18} strokeWidth={1.5} />
              </a>
              <a href="mailto:support@freelancehub.io" className="social-icon-btn" aria-label="Email">
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="footer-links-column">
            <h4 className="footer-column-heading">Ecosystem</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Artisan Directory</Link></li>
              <li><a href="#features">The Standard</a></li>
              <li><a href="#how-it-works">The Process</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><Link to="/signup">Join Sanctuary</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-column-heading">For Ventures</h4>
            <ul className="footer-links-list">
              <li><Link to="/signup">Commission Project</Link></li>
              <li><Link to="/">Search Craftsmen</Link></li>
              <li><Link to="/signup">Milestone Escrow</Link></li>
              <li><Link to="/dashboard">Ventures Portal</Link></li>
              <li><Link to="/login">Direct Invoicing</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-column-heading">For Artisans</h4>
            <ul className="footer-links-list">
              <li><Link to="/signup">Apply as Master</Link></li>
              <li><Link to="/profile/edit">Portfolio Showcase</Link></li>
              <li><Link to="/messages">Studio Messages</Link></li>
              <li><Link to="/dashboard">Earnings Ledger</Link></li>
              <li><Link to="/dashboard">Milestones</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {currentYear} FreelanceHub Inc. Crafted with organic elegance and intentionality.
          </div>
          <div className="footer-legal-links">
            <span className="footer-secure-tag">
              <ShieldCheck size={14} strokeWidth={1.5} color="#8C9A84" /> 256-bit Encrypted Escrow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
