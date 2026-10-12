import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Building, MapPin } from 'lucide-react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | FreelanceHub';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container page-content mt-8 mb-16" style={{ maxWidth: '860px' }}>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
          <ShieldCheck size={14} />
          <span>DPDP Act 2023 & GDPR Compliant</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--forest-dark)' }}>
          Privacy Policy
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Effective Date: October 1, 2026 | Last Updated: October 12, 2026
        </p>
      </div>

      <div className="prose space-y-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            1. Commitment to Privacy
          </h2>
          <p>
            FreelanceHub Technologies Private Limited (&quot;FreelanceHub&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is dedicated to protecting your personal data and respecting your privacy rights. This Privacy Policy details our data collection practices, storage standards, and your statutory rights under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, and applicable international privacy frameworks.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            2. Data We Collect (Data Minimization Principle)
          </h2>
          <p className="mb-4">
            We adhere strictly to data minimization standards: we collect only information that is strictly necessary to authenticate your identity, facilitate direct communications, and fulfill escrow contractual obligations.
          </p>
          <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border-default)' }}>
            <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app-alt)', borderBottom: '1px solid var(--border-default)' }}>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Collected Fields</th>
                  <th className="p-3 font-semibold">Legal Basis & Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3 font-medium">Account & Identity</td>
                  <td className="p-3">Username, Email, Full Name, Role</td>
                  <td className="p-3">Contract execution & authentication</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3 font-medium">Freelancer Profile</td>
                  <td className="p-3">Bio, Hourly Rate, Skills, Portfolio Links, Location</td>
                  <td className="p-3">Explicit consent & marketplace discovery</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3 font-medium">Bookings & Invoicing</td>
                  <td className="p-3">Project dates, milestone descriptions, payment status</td>
                  <td className="p-3">Fulfillment of contractual milestones</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Technical & Session</td>
                  <td className="p-3">Strictly necessary session cookies (CSRF token, auth session)</td>
                  <td className="p-3">Platform security & forgery prevention</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            3. How We Process & Protect Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Zero Sale of Personal Data:</strong> We never sell, rent, or trade your personal information to third-party data brokers or advertisers.</li>
            <li><strong>Strong Encryption:</strong> All communications occur over encrypted TLS/HTTPS connections. Passwords are protected using salted cryptographic hashes (PBKDF2/Argon2).</li>
            <li><strong>Access Controls:</strong> Access to sensitive financial records is limited to authorized personnel requiring it for dispute adjudication and regulatory accounting.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            4. Your Rights Under DPDP Act & GDPR
          </h2>
          <p className="mb-3">
            As a Data Principal / Data Subject, you have the following irrevocable rights:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Right to Access & Portability</h3>
              <p className="text-xs">Request a copy of all personal records we hold regarding your profile and booking history.</p>
            </div>
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Right to Correction & Erasure</h3>
              <p className="text-xs">Update outdated information or request complete deletion of your account and profile data.</p>
            </div>
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Right to Withdraw Consent</h3>
              <p className="text-xs">Revoke consent for optional features at any time without affecting past lawful processing.</p>
            </div>
            <div className="p-4 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--forest-dark)' }}>Right to Grievance Redressal</h3>
              <p className="text-xs">Submit formal inquiries or privacy disputes to our appointed Grievance Officer for prompt resolution.</p>
            </div>
          </div>
        </section>

        <section className="p-6 rounded border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-app-alt)' }}>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            5. Data Fiduciary & Grievance Officer Details
          </h2>
          <p className="text-sm mb-4">
            In compliance with Section 10 of the Digital Personal Data Protection Act, 2023, the details of our designated Grievance Redressal Officer are as follows:
          </p>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-muted" />
              <span><strong>Entity:</strong> FreelanceHub Technologies Private Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-muted" />
              <span><strong>Registered Address:</strong> 108 Botanical Garden Road, Bengaluru, Karnataka 560004, India</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted" />
              <span><strong>Grievance Email:</strong> <a href="mailto:grievance@freelancehub.io" className="underline">grievance@freelancehub.io</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted" />
              <span><strong>Support Email:</strong> <a href="mailto:support@freelancehub.io" className="underline">support@freelancehub.io</a></span>
            </div>
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            All grievances will be acknowledged within 24 hours and resolved within 15 business days.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: 'var(--border-default)' }}>
        <Link to="/terms" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Terms & Conditions</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/cookies" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Cookie Policy</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/refund" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Refund Policy</Link>
      </div>
    </div>
  );
}
