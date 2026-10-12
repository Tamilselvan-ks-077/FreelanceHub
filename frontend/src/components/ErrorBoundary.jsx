import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './ui/Button';
import { logClientError } from '../utils/analytics';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logClientError(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-app)' }}>
          <div
            className="max-w-md w-full p-8 rounded-xl border text-center shadow-lg"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
            >
              <AlertTriangle size={28} strokeWidth={1.5} />
            </div>

            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--forest-dark)' }}>
              Something went wrong
            </h2>

            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              An unexpected error occurred while displaying this page. Our technical team has been notified.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="md" icon={RefreshCw} onClick={this.handleReload}>
                Reload Page
              </Button>
              <Button variant="secondary" size="md" icon={Home} onClick={this.handleGoHome}>
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
