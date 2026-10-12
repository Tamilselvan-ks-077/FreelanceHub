/**
 * Privacy-preserving Analytics & Error Tracking Pipeline
 * Compliant with DPDP Act & GDPR: non-essential tracking is strictly disabled
 * until explicit user consent is confirmed.
 */

export function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem('fh_cookie_consent');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed.analytics);
  } catch (e) {
    return false;
  }
}

export function trackPageView(path) {
  if (!hasAnalyticsConsent()) return;
  // If Google Analytics / Plausible / PostHog is loaded, send pageview
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', { u: path });
  } else if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', { page_path: path });
  }
}

export function trackEvent(eventName, properties = {}) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: properties });
  } else if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

export function logClientError(error, errorInfo = {}) {
  // Error reporting (e.g. Sentry or server logger pipeline)
  console.error('[FreelanceHub Error Monitor]', error, errorInfo);
  // Send non-identifying crash telemetry to health monitor if available
}
