import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function TermsConditionsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions | FreelanceHub';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container page-content mt-8 mb-16" style={{ maxWidth: '860px' }}>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
          <Scale size={14} />
          <span>Platform Agreement</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--forest-dark)' }}>
          Terms & Conditions
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Effective Date: October 1, 2026 | Last Updated: October 12, 2026
        </p>
      </div>

      <div className="prose space-y-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using FreelanceHub (the &quot;Platform&quot;), operated by FreelanceHub Technologies Private Limited, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must discontinue using our services immediately.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            2. User Roles & Account Eligibility
          </h2>
          <p className="mb-3">
            Users may register as either a <strong>Client</strong> (commissioning work) or an <strong>Artisan / Freelancer</strong> (providing specialized engineering, architecture, or design services).
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must be at least 18 years old to create an account and enter into binding legal contracts.</li>
            <li>You are responsible for maintaining the confidentiality of your credentials. Any actions under your account are your legal responsibility.</li>
            <li>Freelancers warrant that all technical experience, portfolio items, and certifications provided are accurate and authentic.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            3. Commissioning, Escrow & Invoicing
          </h2>
          <p className="mb-3">
            FreelanceHub operates on a secure milestone workflow to safeguard both clients and freelancers:
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Booking & Proposal Initiation</h3>
              <p className="text-sm">Clients submit detailed scope, start dates, and end dates. The freelancer reviews and accepts or rejects the engagement.</p>
            </div>
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Milestone Completion & Invoicing</h3>
              <p className="text-sm">Upon completion of agreed deliverables, an invoice is generated based on verified hours or project milestones.</p>
            </div>
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Payment Idempotency & Settlement</h3>
              <p className="text-sm">Payment transactions are protected by cryptographic idempotency keys to strictly avoid duplicate billing. Disbursements occur directly upon invoice settlement.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            4. Intellectual Property Rights
          </h2>
          <p>
            Unless explicitly agreed otherwise in a written contract between Client and Freelancer, <strong>100% ownership of intellectual property</strong> created for a commissioned project transfers unconditionally to the Client upon full settlement of the corresponding invoice. Freelancers retain ownership of their pre-existing background tools and frameworks.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            5. Prohibited Conduct & Community Standards
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>No circumvention of platform billing or fee avoidance.</li>
            <li>No harassment, abusive communication, or discriminatory behavior in direct studio chats.</li>
            <li>No submission of malicious code, unauthorized reverse engineering, or system load attacks.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            6. Limitation of Liability
          </h2>
          <p>
            FreelanceHub provides the marketplace infrastructure on an &quot;as is&quot; and &quot;as available&quot; basis. In no event shall FreelanceHub Technologies Private Limited be liable for indirect, punitive, or consequential damages resulting from user disputes, project delays, or third-party service interruptions.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: 'var(--border-default)' }}>
        <Link to="/privacy" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Privacy Policy</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/cookies" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Cookie Policy</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/refund" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Refund Policy</Link>
      </div>
    </div>
  );
}
