import React from 'react';

/**
 * Input Component with validation states
 * @component
 * @example
 * <Input type="email" placeholder="Enter email" error="Invalid email" />
 */
const Input = React.forwardRef(
  (
    {
      type = 'text',
      placeholder = '',
      error = null,
      disabled = false,
      label = null,
      hint = null,
      icon: Icon = null,
      iconPosition = 'left',
      className = '',
      id = null,
      autoComplete = null,
      name = '',
      ...props
    },
    ref
  ) => {
    // Generate id from name if not provided
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine autocomplete based on type and name
    const getAutoComplete = () => {
      if (autoComplete) return autoComplete;
      if (type === 'email') return 'email';
      if (type === 'password') return 'current-password';
      if (name === 'confirmPassword') return 'new-password';
      if (name === 'name') return 'name';
      return 'off';
    };

    const baseStyles = 'w-full px-4 py-2 rounded-lg border transition-smooth focus-ring font-medium';
    const normalStyles = 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400';
    const errorStyles = 'border-error-500 bg-error-50 dark:bg-error-950/20 focus:ring-error-500';
    const disabledStyles = 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            name={name}
            autoComplete={getAutoComplete()}
            className={`
              ${baseStyles}
              ${error ? errorStyles : normalStyles}
              ${disabled ? disabledStyles : ''}
              ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon size={20} />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error-600 dark:text-error-400 mt-1 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
