import React from 'react';
import { Search, MessageSquare, ShieldCheck, ArrowRight, Sparkles, Feather } from 'lucide-react';
import './HowItWorksSection.css';

const steps = [
  {
    step: '01',
    title: 'Discover Artisanal Masters',
    description: 'Explore verified specialists by technical discipline, philosophy, availability, and authentic peer reviews.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Harmonize & Scope Milestones',
    description: 'Converse in the live studio, define deliverable milestones, and structure transparent engagement terms.',
    icon: MessageSquare,
  },
  {
    step: '03',
    title: 'Fund Escrow & Blossom',
    description: 'Secure funds into escrow with full confidence. Payouts are disbursed upon your review and satisfaction.',
    icon: ShieldCheck,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="botanical-how-it-works-section">
      <div className="container">
        <div className="how-it-works-header">
          <div className="hiw-badge">
            <Feather size={14} strokeWidth={1.5} className="hiw-feather-icon" />
            <span>INTENTIONAL PROCESS</span>
          </div>
          <h2 className="hiw-title">
            From vision to fruition in <br />
            <span className="serif-italic">effortless harmony</span>.
          </h2>
          <p className="hiw-subtitle">
            A serene, streamlined workflow crafted to eliminate recruiting friction and ignite immediate creative momentum.
          </p>
        </div>

        <div className="hiw-steps-grid">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="hiw-step-card">
                <div className="hiw-step-top">
                  <span className="hiw-step-num">{s.step}</span>
                  <div className="hiw-icon-box">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="hiw-step-heading">{s.title}</h3>
                <p className="hiw-step-desc">{s.description}</p>
                {idx < steps.length - 1 && (
                  <div className="hiw-arrow-indicator">
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
