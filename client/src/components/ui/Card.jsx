import React from 'react';

/**
 * Card Component with glassmorphism effects
 * @component
 * @example
 * <Card variant="glass" blur="md"><p>Content</p></Card>
 */
const Card = React.forwardRef(
  (
    {
      children,
      variant = 'glass',
      blur = 'md',
      padding = 'md',
      className = '',
      hoverable = false,
      ...props
    },
    ref
  ) => {
    const variants = {
      glass: 'glass-effect',
      'glass-sm': 'glass-effect-sm',
      'glass-lg': 'glass-effect-lg',
      solid: 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
      'solid-subtle': 'bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    const hoverStyles = hoverable ? 'hover:shadow-lg hover:scale-105 transition-smooth cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
