import React from 'react';

/**
 * Badge Component for status indicators
 * @component
 * @example
 * <Badge variant="success">Active</Badge>
 */
const Badge = React.forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50',
      primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-300',
      success: 'bg-success-100 dark:bg-success-900/30 text-success-900 dark:text-success-300',
      warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-900 dark:text-warning-300',
      error: 'bg-error-100 dark:bg-error-900/30 text-error-900 dark:text-error-300',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs font-semibold rounded',
      md: 'px-3 py-1.5 text-sm font-semibold rounded-md',
      lg: 'px-4 py-2 text-base font-semibold rounded-lg',
    };

    return (
      <span
        ref={ref}
        className={`inline-block ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
