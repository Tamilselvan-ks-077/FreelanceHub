import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

export default function CookiesPolicyPage() {
  useEffect(() => {
    document.title = 'Cookies Policy | FreelanceHub';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container page-content mt-8 mb-16" style={{ maxWidth: '860px' }}>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
          <Cookie size={14} />
          <span>Cookie Notice & Transparency</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--forest-dark)' }}>
          Cookies & Tracking Policy
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Effective Date: October 1, 2026 | Last Updated: October 12, 2026
        </p>
      </div>

      <div className="prose space-y-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text strings placed on your browser when you visit websites. FreelanceHub uses cookies and local storage tokens to keep you logged in securely, prevent Cross-Site Request Forgery (CSRF), and remember your interface preferences.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            2. Detailed List of Cookies We Use
          </h2>
          <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border-default)' }}>
            <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app-alt)', borderBottom: '1px solid var(--border-default)' }}>
                  <th className="p-3 font-semibold">Cookie Name</th>
                  <th className="p-3 font-semibold">Classification</th>
                  <th className="p-3 font-semibold">Lifespan</th>
                  <th className="p-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3 font-mono text-xs font-semibold">sessionid</td>
                  <td className="p-3">Strictly Necessary</td>
                  <td className="p-3">14 days</td>
                  <td className="p-3">Secures authenticated user session and role-based permissions.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3 font-mono text-xs font-semibold">csrftoken</td>
                  <td className="p-3">Strictly Necessary</td>
                  <td className="p-3">1 year</td>
                  <td className="p-3">Protects against Cross-Site Request Forgery on form/API requests.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="p-3 font-mono text-xs font-semibold">fh_cookie_consent</td>
                  <td className="p-3">Functional / Consent</td>
                  <td className="p-3">1 year</td>
                  <td className="p-3">Stores your explicit preference for cookie consent banner choices.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs font-semibold">_fh_analytics (Optional)</td>
                  <td className="p-3">Analytics / Performance</td>
                  <td className="p-3">Session</td>
                  <td className="p-3">Aggregated page performance metrics. Never loaded without consent.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            3. Zero Non-Essential Tracking Without Prior Consent
          </h2>
          <p>
            In strict compliance with EU ePrivacy directives and India&apos;s DPDP Act, non-essential cookies and analytics scripts are completely blocked until you explicitly grant consent through our Cookie Consent Banner.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--forest-green)' }}>
            4. Managing Your Cookie Preferences
          </h2>
          <p className="mb-4">
            You can modify your browser settings to decline or delete cookies at any time. If you wish to reset your consent preferences on FreelanceHub right now:
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('fh_cookie_consent');
              window.location.reload();
            }}
            className="px-4 py-2 rounded text-sm font-semibold transition"
            style={{
              background: 'var(--bg-app-alt)',
              color: 'var(--forest-dark)',
              border: '1px solid var(--border-strong)',
              cursor: 'pointer'
            }}
          >
            Reset Cookie Consent Preferences
          </button>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 text-sm" style={{ borderColor: 'var(--border-default)' }}>
        <Link to="/privacy" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Privacy Policy</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/terms" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Terms & Conditions</Link>
        <span style={{ color: 'var(--text-light)' }}>•</span>
        <Link to="/refund" className="hover:underline font-medium" style={{ color: 'var(--terracotta)' }}>Refund Policy</Link>
      </div>
    </div>
  );
}
