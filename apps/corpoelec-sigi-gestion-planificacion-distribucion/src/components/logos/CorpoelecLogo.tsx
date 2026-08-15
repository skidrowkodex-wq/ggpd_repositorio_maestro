import React from 'react';

interface CorpoelecLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtext?: boolean;
}

export const CorpoelecLogo: React.FC<CorpoelecLogoProps> = ({ 
  className = "h-4 sm:h-5 w-auto", 
}) => {
  return (
    <img 
      src="/images/corpoelec-logo.png" 
      alt="CORPOELEC - Corporación Eléctrica Nacional" 
      className={`object-contain select-none scale-x-[1.05] origin-center ${className}`}
    />
  );
};
