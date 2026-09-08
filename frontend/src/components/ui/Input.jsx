import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`ui-input-wrapper ${wrapperClassName}`}>
      {label && <label className="ui-input-label">{label}</label>}
      <div className="ui-input-container">
        {Icon && <Icon className="ui-input-icon" size={18} />}
        <input
          ref={ref}
          className={`ui-input ${Icon ? 'with-icon' : ''} ${error ? 'has-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={`ui-input-helper ${error ? 'error-text' : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
