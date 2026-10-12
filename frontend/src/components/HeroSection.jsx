import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Search, ArrowRight, ShieldCheck, Sparkles, Star, Zap, CheckCircle2, Leaf, Compass } from 'lucide-react';
import heroImg from '../assets/hero.png';
import './HeroSection.css';

export default function HeroSection({ onExploreClick }) {
  const navigate = useNavigate();

  return (
    <section className="botanical-hero-section">
      {/* Decorative Organic Ambient Shapes */}
      <div className="hero-ambient-leaf-bg" />
      <div className="hero-ambient-clay-bg" />

      <div className="container hero-layout-grid">
        {/* Left Column: Headline & Editorial Narrative */}
        <div className="hero-copy-col animate-in">
          <div className="hero-badge-pill">
            <span className="botanical-pill-dot" />
            <span className="hero-badge-text">CURATED TALENT MARKETPLACE</span>
            <Leaf size={14} strokeWidth={1.5} className="hero-badge-leaf" />
          </div>

          <h1 className="hero-main-title">
            Hire verified <br />
            <span className="serif-italic">software craftsmen</span> <br />
            and product designers.
          </h1>

          <p className="hero-lead-text">
            Directly connect with vetted software engineers, systems architects, and UI/UX designers. Collaborate with clear milestone escrow protection and zero agency markup.
          </p>

          <div className="hero-actions-row">
            <Button
              variant="lime"
              size="lg"
              iconRight={ArrowRight}
              onClick={onExploreClick}
              className="hero-primary-cta"
            >
              Explore Directory
            </Button>
          </div>

          {/* Core Verified Guarantees */}
          <div className="hero-trust-bar">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} strokeWidth={1.5} style={{ color: 'var(--success)' }} />
                <span>Milestone Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: 'var(--sage-green)' }} />
                <span>Verified Technical Experience</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={16} strokeWidth={1.5} style={{ color: 'var(--terracotta)' }} />
                <span>Direct Invoicing & Chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roman Arch Visual Showcase Card */}
        <div className="hero-showcase-col animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="arch-showcase-container">
            {/* Architectural Arch Frame */}
            <div className="showcase-arch-frame">
              <div className="arch-image-wrap">
                <img src={heroImg} alt="Alex Rivera - Principal Full-Stack and AI Architect Profile" className="arch-hero-img" />
                <div className="arch-image-overlay" />
              </div>

              {/* Floating Profile Badge */}
              <div className="arch-profile-card">
                <div className="arch-profile-header">
                  <div>
                    <div className="arch-name-row">
                      <h4 className="arch-profile-name">Alex Rivera</h4>
                      <Badge variant="lime" className="arch-rate-badge">$95/hr</Badge>
                    </div>
                    <p className="arch-profile-title">Principal Full-Stack & AI Architect</p>
                  </div>
                </div>

                <div className="arch-skills-list">
                  <span className="botanical-tag">React 19</span>
                  <span className="botanical-tag">Python / Django</span>
                  <span className="botanical-tag">PostgreSQL</span>
                  <span className="botanical-tag">LLM Architecture</span>
                </div>

                <div className="arch-metric-row">
                  <div className="arch-metric-item">
                    <span className="metric-val">100%</span>
                    <span className="metric-label">Job Success</span>
                  </div>
                  <div className="arch-metric-divider" />
                  <div className="arch-metric-item">
                    <span className="metric-val">48</span>
                    <span className="metric-label">Vetted Reviews</span>
                  </div>
                  <div className="arch-metric-divider" />
                  <div className="arch-metric-item">
                    <span className="metric-val text-terracotta">Available</span>
                    <span className="metric-label">Direct Booking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organic Floating Accent Badges */}
            <div className="floating-botanical-badge badge-top-right floating-anim">
              <div className="badge-icon-wrap sage-icon-bg">
                <Zap size={16} strokeWidth={1.5} />
              </div>
              <div className="badge-text-wrap">
                <span className="badge-heading">&lt; 24h Curated Match</span>
                <span className="badge-sub">Direct contract initiation</span>
              </div>
            </div>

            <div className="floating-botanical-badge badge-bottom-left floating-anim" style={{ animationDelay: '3s' }}>
              <div className="badge-icon-wrap terra-icon-bg">
                <ShieldCheck size={16} strokeWidth={1.5} />
              </div>
              <div className="badge-text-wrap">
                <span className="badge-heading">Milestone Escrow</span>
                <span className="badge-sub">Secured payouts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
