import React from 'react';

/**
 * Avatar Component with image and fallback initials
 * @component
 * @example
 * <Avatar src="/avatar.jpg" alt="User" initials="JD" size="lg" />
 */
const Avatar = React.forwardRef(
  (
    {
      src = null,
      alt = 'Avatar',
      initials = '?',
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const baseStyles = 'rounded-full flex-center font-semibold';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${sizes[size]} ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full flex-center bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full font-bold">
            {initials}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
