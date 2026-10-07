import React from 'react';
import { ShieldCheck, Zap, Lock, MessageSquare, Compass, Leaf, Sparkles } from 'lucide-react';
import './FeatureSection.css';

const features = [
  {
    num: '01',
    title: 'Vetted Artisanal Craft',
    description: 'Top 1% software engineers, AI researchers, and editorial UI/UX designers verified through rigorous hands-on technical reviews.',
    icon: ShieldCheck,
  },
  {
    num: '02',
    title: 'Harmonious Matching',
    description: 'Intelligently aligns your venture’s philosophy and requirements with available master talent in under 24 hours.',
    icon: Zap,
  },
  {
    num: '03',
    title: 'Milestone Escrow',
    description: 'Guaranteed funds disbursed only when deliverables bloom to perfection, complete with transparent invoice records.',
    icon: Lock,
  },
  {
    num: '04',
    title: 'Direct Living Studio Chat',
    description: 'Encrypted communication, continuous file exchange, and fluid contract milestone adjustments within a serene workspace.',
    icon: MessageSquare,
  },
];

export default function FeatureSection() {
  return (
    <section id="features" className="botanical-feature-section">
      <div className="container">
        {/* Forest Feature Panel */}
        <div className="botanical-feature-panel">
          <div className="feature-panel-header">
            <div className="feature-category-badge">
              <Leaf size={14} strokeWidth={1.5} className="feature-leaf-icon" />
              <span>THE BOTANICAL STANDARD</span>
            </div>
            <h2 className="feature-panel-title">
              Crafted for ventures seeking <br />
              <span className="serif-italic">enduring excellence</span> & speed.
            </h2>
            <p className="feature-panel-subtitle">
              Eliminate recruiting noise. Every interaction is designed with organic intentionality so you can build with master craftsmen effortlessly.
            </p>
          </div>

          {/* Staggered Organic 4-Card Grid */}
          <div className="feature-cards-grid">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={feat.num} className={`feature-card ${index % 2 === 1 ? 'stagger-card' : ''}`}>
                  <div className="feature-card-top">
                    <span className="feature-num">{feat.num}</span>
                    <div className="feature-icon-wrapper">
                      <Icon size={20} strokeWidth={1.5} className="feature-icon" />
                    </div>
                  </div>
                  <h3 className="feature-card-heading">{feat.title}</h3>
                  <p className="feature-card-desc">{feat.description}</p>
                  <div className="feature-card-accent-line" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
