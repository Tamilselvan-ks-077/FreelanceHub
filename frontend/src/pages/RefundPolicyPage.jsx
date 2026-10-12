import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function RefundPolicyPage() {
  useEffect(() => {
    document.title = 'Refund & Cancellation Policy | FreelanceHub';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container page-content mt-8 mb-16" style={{ maxWidth: '860px' }}>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
          <RefreshCw size={14} />
          <span>Milestone Escrow Protection</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--forest-dark)' }}>
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Effective Date: October 1, 2026 | Last Updated: October 12, 2026
        </p>
      </div>

      <div className="prose space-y-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            1. Escrow Protection Overview
          </h2>
          <p>
            FreelanceHub employs a secure milestone workflow to protect both clients and artisans. Funds are processed upon invoice generation only after agreed project milestones or time windows are accepted.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            2. Cancellation Windows & Scenarios
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                <h3 className="font-semibold text-base" style={{ color: 'var(--forest-dark)' }}>Pending Bookings</h3>
              </div>
              <p className="text-sm">
                If a booking is still in <strong>&quot;Pending&quot;</strong> status and has not yet been accepted by the freelancer, the Client may cancel immediately with <strong>100% full refund</strong> and zero platform penalties.
              </p>
            </div>

            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} style={{ color: 'var(--warning)' }} />
                <h3 className="font-semibold text-base" style={{ color: 'var(--forest-dark)' }}>Accepted Milestones</h3>
              </div>
              <p className="text-sm">
                If work has commenced but deliverables fail to satisfy the documented specifications, parties may initiate mutual cancellation or arbitration through platform support.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            3. Dispute Resolution & Arbitration
          </h2>
          <p className="mb-3">
            In the event of a disagreement regarding milestone completion:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Direct Negotiation:</strong> Parties have 48 hours to communicate via the built-in studio messages to adjust deliverables.</li>
            <li><strong>Support Escalation:</strong> Either party can escalate the booking to <a href="mailto:support@freelancehub.io" className="underline font-medium">support@freelancehub.io</a> with relevant chat logs and repository diffs.</li>
            <li><strong>Final Adjudication:</strong> Our dispute arbitration team reviews submissions and issues a final, binding decision within 5 business days.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            4. Refund Processing Timeline
          </h2>
          <p>
            Approved refunds are credited back to the original method of payment (credit card, debit card, or bank transfer). Depending on your financial institution, refunds typically reflect within <strong>5 to 7 business days</strong>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: 'var(--border-default)' }}>
        <Link to="/privacy" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Privacy Policy</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/terms" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Terms & Conditions</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/cookies" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Cookie Policy</Link>
      </div>
    </div>
  );
}
