import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from '../ChatGPT Image Aug 16, 2025, 12_58_19 AM.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-32 w-32',
    md: 'h-40 w-40', 
    lg: 'h-48 w-48',
    xl: 'h-56 w-56'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        <ImageWithFallback
          src={logoImage}
          alt="Imtehaan Logo" 
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  );
}