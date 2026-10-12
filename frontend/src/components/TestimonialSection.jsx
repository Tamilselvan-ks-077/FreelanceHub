import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileCode2, Scale } from 'lucide-react';
import './TestimonialSection.css';

const platformStandards = [
  {
    title: "Rigorous Technical Vetting",
    description: "Every engineer and designer undergoes manual portfolio evaluation, git commit history review, and real-world system architecture appraisal.",
    icon: FileCode2,
    tag: "Technical Mastery",
  },
  {
    title: "Secured Milestone Escrow",
    description: "Funds are protected during milestone execution. Payment is released only after you review and approve the submitted deliverables.",
    icon: Lock,
    tag: "Financial Protection",
  },
  {
    title: "Clear Intellectual Property Transfer",
    description: "Full commercial ownership of all developed source code, design systems, and documentation transfers to the client upon invoice settlement.",
    icon: Scale,
    tag: "Legal Certainty",
  },
];

export default function TestimonialSection() {
  return (
    <section id="standards" className="botanical-testimonial-section" aria-label="Platform standards">
      <div className="container">
        {/* Header */}
        <div className="testimonial-header">
          <div className="testimonial-category-badge">
            <ShieldCheck size={14} strokeWidth={1.5} className="testimonial-flower-icon" />
            <span>PLATFORM STANDARDS</span>
          </div>
          <h2 className="testimonial-title">
            Built for engineering integrity & <br />
            <span className="serif-italic">transparent delivery</span>.
          </h2>
          <p className="testimonial-subtitle">
            How FreelanceHub safeguards quality, dispute arbitration, and project milestones for both clients and craftsmen.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="testimonial-cards-grid">
          {platformStandards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="testimonial-card">
                <div className="testimonial-card-top">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <span className="testimonial-tag">{item.tag}</span>
                </div>

                <div className="quote-body" style={{ minHeight: 'auto', margin: '1rem 0' }}>
                  <h3 className="font-serif text-lg font-bold mb-2" style={{ color: 'var(--forest-dark)' }}>
                    {item.title}
                  </h3>
                  <p className="quote-text" style={{ fontSize: '0.88rem', fontStyle: 'normal' }}>
                    {item.description}
                  </p>
                </div>

                <div className="testimonial-author-row pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--success)' }}>
                    <CheckCircle2 size={14} /> Verified Guarantee
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
