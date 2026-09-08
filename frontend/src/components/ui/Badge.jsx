import React from 'react';
import './Badge.css';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variantClass = `ui-badge-${variant}`;
  
  return (
    <span className={`ui-badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
