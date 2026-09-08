import React from 'react';
import './Button.css';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  className = '',
  isLoading = false,
  icon: Icon,
  disabled,
  ...props
}) {
  const baseClass = 'ui-button';
  const variantClass = `ui-button-${variant}`;
  const sizeClass = `ui-button-${size}`;
  const disabledClass = disabled || isLoading ? 'ui-button-disabled' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="spinner" size={16} />
      ) : Icon ? (
        <Icon className="btn-icon" size={18} />
      ) : null}
      <span className="btn-text">{children}</span>
    </button>
  );
}
