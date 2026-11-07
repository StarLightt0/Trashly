import React from 'react';

/**
 * BrandLogo Component
 * Renders the official Trashly logo with support for light and dark backgrounds.
 * 
 * @param {'dark' | 'light'} variant - 'dark' for light backgrounds (dark text), 'light' for dark backgrounds (white text)
 * @param {'sm' | 'md' | 'lg' | 'xl'} size - predefined sizes
 * @param {string} className - extra Tailwind classes
 * @param {string} alt - image alt text
 */
export default function BrandLogo({ 
  variant = 'dark', 
  size = 'md', 
  className = '',
  alt = 'Trashly' 
}) {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
    xl: 'h-12 sm:h-14'
  };

  const src = variant === 'light' ? '/trashly-logo-light.png' : '/trashly-logo.png';
  const sizeClass = sizeClasses[size] || size;

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} w-auto object-contain select-none transition-transform ${className}`}
      loading="eager"
    />
  );
}
