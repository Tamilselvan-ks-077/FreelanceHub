import React from 'react';
import './Button.css';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // primary, lime, purple, secondary, outline, ghost, dark, glass, danger
  size = 'md', // sm, md, lg, xl
  className = '',
  isLoading = false,
  icon: Icon,
  iconRight: IconRight,
  iconPosition,
  disabled,
  ...props
}) {
  const baseClass = 'ui-button';
  const variantClass = `ui-button-${variant}`;
  const sizeClass = `ui-button-${size}`;
  const disabledClass = disabled || isLoading ? 'ui-button-disabled' : '';

  const LeftIcon = iconPosition === 'right' ? null : Icon;
  const RightIcon = IconRight || (iconPosition === 'right' ? Icon : null);

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="spinner" size={16} />
      ) : LeftIcon ? (
        <LeftIcon className="btn-icon" size={size === 'lg' || size === 'xl' ? 20 : 16} />
      ) : null}
      {children && <span className="btn-text">{children}</span>}
      {RightIcon && !isLoading && (
        <RightIcon className="btn-icon-right" size={size === 'lg' || size === 'xl' ? 20 : 16} />
      )}
    </button>
  );
}
