import React from 'react';
import { Star, Quote, ShieldCheck, Flower2 } from 'lucide-react';
import './TestimonialSection.css';

const testimonials = [
  {
    quote: "FreelanceHub paired our studio with an exceptional React/Django craftsman within hours. We launched our flagship platform two weeks ahead of schedule in complete tranquility.",
    name: "Marcus Vance",
    role: "Co-Founder, Botanica Labs",
    avatar: "MV",
    rating: 5,
    tag: "Full-Stack Architecture",
  },
  {
    quote: "The caliber of talent here is artisanal. Every engineer has verified technical mastery, aesthetic intuition, and communicates with intentional clarity.",
    name: "Elena Rostova",
    role: "Design Lead, Atelier Studio",
    avatar: "ER",
    rating: 5,
    tag: "Editorial Design System",
  },
  {
    quote: "Milestone escrow protection gave our leadership unwavering peace of mind. Transparent invoices, direct studio chat, and flawless execution.",
    name: "David Chen",
    role: "Managing Director, Solis Media",
    avatar: "DC",
    rating: 5,
    tag: "AI Engine & Infrastructure",
  },
];

export default function TestimonialSection() {
  return (
    <section id="testimonials" className="botanical-testimonial-section">
      <div className="container">
        {/* Header */}
        <div className="testimonial-header">
          <div className="testimonial-category-badge">
            <Flower2 size={14} strokeWidth={1.5} className="testimonial-flower-icon" />
            <span>AUTHENTIC TESTIMONIALS</span>
          </div>
          <h2 className="testimonial-title">
            Treasured by visionary leaders & <br />
            <span className="serif-italic">creative founders</span>.
          </h2>
          <p className="testimonial-subtitle">
            Discover how pioneering teams cultivate extraordinary outcomes alongside verified FreelanceHub master craftsmen.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="testimonial-cards-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-card-top">
                <div className="stars-row">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={15} strokeWidth={1.5} fill="#C78539" color="#C78539" />
                  ))}
                </div>
                <span className="testimonial-tag">{t.tag}</span>
              </div>

              <div className="quote-body">
                <Quote size={28} strokeWidth={1.5} className="quote-icon" />
                <p className="quote-text">“{t.quote}”</p>
              </div>

              <div className="testimonial-author-row">
                <div className="author-avatar">{t.avatar}</div>
                <div className="author-info">
                  <div className="author-name">
                    {t.name} <ShieldCheck size={14} strokeWidth={1.5} className="author-verified" />
                  </div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
