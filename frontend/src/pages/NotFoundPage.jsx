import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - Page Not Found | FreelanceHub';
  }, []);

  return (
    <div className="container page-content flex items-center justify-center min-h-[60vh] py-16">
      <div className="text-center max-w-lg mx-auto p-8 rounded-xl border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
          <Compass size={32} strokeWidth={1.5} />
        </div>

        <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded" style={{ background: 'var(--bg-app-alt)', color: 'var(--text-muted)' }}>
          Error 404
        </span>

        <h1 className="font-serif text-3xl font-bold mt-4 mb-3" style={{ color: 'var(--forest-dark)' }}>
          Page Not Found
        </h1>

        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The path you requested could not be located. It may have been moved, renamed, or is temporarily unavailable in our directory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Return to Home
            </Button>
          </Link>
          <Link to="/#talent-directory">
            <Button variant="secondary" size="md" icon={Search}>
              Browse Artisans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
