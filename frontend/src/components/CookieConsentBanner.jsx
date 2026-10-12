import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import Button from './ui/Button';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('fh_cookie_consent');
    if (!consent) {
      // Small timeout to allow initial render without layout shift
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('fh_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    }));
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: { analytics: true } }));
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('fh_cookie_consent', JSON.stringify({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    }));
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: { analytics: false } }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-5 rounded-xl shadow-xl border animate-in"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-strong)',
        boxShadow: '0 20px 40px rgba(28, 38, 31, 0.12)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg shrink-0" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
          <Cookie size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h4 className="font-serif text-base font-bold" style={{ color: 'var(--forest-dark)' }}>
            We respect your privacy
          </h4>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            We use strictly necessary cookies to keep you signed in securely and prevent CSRF attacks. Non-essential tracking scripts are blocked until you grant consent.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
        <Button
          variant="primary"
          size="sm"
          className="w-full sm:w-auto text-xs"
          onClick={handleAcceptAll}
        >
          Accept All
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto text-xs"
          onClick={handleEssentialOnly}
        >
          Essential Only
        </Button>
        <Link
          to="/cookies"
          className="text-xs underline ml-auto text-center py-1 font-medium transition hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          Policy Details
        </Link>
      </div>
    </aside>
  );
}
