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
            <span className="hero-badge-text">CURATED ARTISANAL TALENT NETWORK</span>
            <Leaf size={14} strokeWidth={1.5} className="hero-badge-leaf" />
          </div>

          <h1 className="hero-main-title">
            Cultivate your <br />
            <span className="serif-italic">next breakthrough</span> <br />
            with master minds.
          </h1>

          <p className="hero-lead-text">
            Connect directly with the top 1% of vetted software craftsmen, AI architects, and editorial UI/UX designers—empowering high-growth ventures to flourish without friction.
          </p>

          <div className="hero-actions-row">
            <Button
              variant="lime" /* styled as terracotta in botanical tokens */
              size="lg"
              iconRight={ArrowRight}
              onClick={onExploreClick}
              className="hero-primary-cta"
            >
              Explore Artisans
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={Compass}
              onClick={onExploreClick}
              className="hero-secondary-cta"
            >
              Browse Directory
            </Button>
          </div>

          {/* Social Proof Botanical Trust Bar */}
          <div className="hero-trust-bar">
            <div className="trust-avatars-stack">
              <div className="mini-avatar av-1">AR</div>
              <div className="mini-avatar av-2">SL</div>
              <div className="mini-avatar av-3">EM</div>
              <div className="mini-avatar av-4">VK</div>
            </div>
            <div className="trust-meta">
              <div className="trust-stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} strokeWidth={1.5} fill="#C78539" color="#C78539" />
                ))}
                <span className="trust-score">4.98 / 5.0</span>
              </div>
              <p className="trust-sub">Trusted by 2,500+ founders, design studios & venture leaders</p>
            </div>
          </div>
        </div>

        {/* Right Column: Roman Arch Visual Showcase Card */}
        <div className="hero-showcase-col animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="arch-showcase-container">
            {/* Architectural Arch Frame */}
            <div className="showcase-arch-frame">
              <div className="arch-image-wrap">
                <img src={heroImg} alt="Master Craftsman" className="arch-hero-img" />
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
