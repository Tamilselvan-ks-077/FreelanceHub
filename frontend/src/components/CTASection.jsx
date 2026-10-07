import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { ArrowRight, Sparkles, ShieldCheck, Leaf } from 'lucide-react';
import './CTASection.css';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="botanical-cta-section">
      <div className="container">
        <div className="botanical-cta-card">
          <div className="cta-ambient-botanical" />
          
          <div className="cta-content-wrapper">
            <div className="cta-top-badge">
              <Leaf size={14} strokeWidth={1.5} className="text-sage-light" />
              <span>COMMENCE YOUR ODYSSEY</span>
            </div>

            <h2 className="cta-headline">
              Ready to create something <br />
              <span className="serif-italic">truly timeless</span>?
            </h2>

            <p className="cta-description">
              Collaborate with top 1% verified software engineers, AI architects, and editorial designers. Elevate your project with milestone escrow and effortless harmony.
            </p>

            <div className="cta-button-group">
              <Button
                variant="lime" /* Terracotta styling in tokens */
                size="xl"
                iconRight={ArrowRight}
                onClick={() => navigate('/signup')}
                className="cta-primary-btn"
              >
                Begin Collaboration
              </Button>
              <Button
                variant="outline-light"
                size="xl"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="cta-secondary-btn"
              >
                Explore The Process
              </Button>
            </div>

            <div className="cta-features-badges">
              <span className="cta-pill"><ShieldCheck size={14} strokeWidth={1.5} color="#A8B5A1" /> 100% Vetted Artisans</span>
              <span className="cta-pill-dot">•</span>
              <span className="cta-pill"><ShieldCheck size={14} strokeWidth={1.5} color="#A8B5A1" /> Milestone Escrow</span>
              <span className="cta-pill-dot">•</span>
              <span className="cta-pill"><ShieldCheck size={14} strokeWidth={1.5} color="#A8B5A1" /> Direct Living Chat</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
