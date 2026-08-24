import React from 'react';

interface CorpoelecLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtext?: boolean;
  style?: React.CSSProperties;
}

export const CorpoelecLogo: React.FC<CorpoelecLogoProps> = ({ 
  className = "h-4 sm:h-5 w-auto", 
  style,
}) => {
  return (
    <img 
      src="/images/corpoelec-logo.png" 
      alt="CORPOELEC - Corporación Eléctrica Nacional" 
      className={`object-contain select-none max-h-full max-w-full block ${className}`}
      style={{
        maxHeight: '100%',
        maxWidth: '100%',
        height: 'auto',
        width: 'auto',
        display: 'inline-block',
        ...style
      }}
    />
  );
};

