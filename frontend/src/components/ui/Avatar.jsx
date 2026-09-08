import React from 'react';
import './Avatar.css';
import { User } from 'lucide-react';

export default function Avatar({ src, alt, fallback, size = 'md', className = '' }) {
  const sizeClass = `ui-avatar-${size}`;

  return (
    <div className={`ui-avatar ${sizeClass} ${className}`}>
      {src ? (
        <img src={src} alt={alt || ''} className="ui-avatar-img" />
      ) : fallback ? (
        <span className="ui-avatar-fallback">{fallback}</span>
      ) : (
        <span className="ui-avatar-fallback">
          <User size={size === 'sm' ? 14 : size === 'lg' ? 24 : 18} />
        </span>
      )}
    </div>
  );
}
