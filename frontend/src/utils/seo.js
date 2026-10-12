/**
 * Dynamic SEO and Metadata Manager
 * Updates document.title, meta description, and canonical link
 */
export function setPageMeta({
  title = 'FreelanceHub — Verified Engineering & Design Talent',
  description = 'Directly connect with top verified engineers, AI architects, and editorial UI/UX designers with milestone escrow protection.',
  canonicalUrl,
}) {
  if (typeof document === 'undefined') return;

  // Title
  document.title = title;

  // Meta description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', description);

  // Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl || window.location.href.split('?')[0]);
}
