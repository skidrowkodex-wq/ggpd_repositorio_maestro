import React from 'react';

interface CorpoelecLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  showSubtext?: boolean;
}

export const CorpoelecLogo: React.FC<CorpoelecLogoProps> = ({ 
  className = "h-8 w-auto", 
  variant = 'auto',
  showSubtext = true
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 280 64" 
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for Electric Arc Symbol */}
          <linearGradient id="corpoRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E53935" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>
          <linearGradient id="corpoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003366" />
            <stop offset="100%" stopColor="#001833" />
          </linearGradient>
          <linearGradient id="corpoCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#00c0f9" />
          </linearGradient>
        </defs>

        {/* 1. Dynamic Energy Spark / Lightning Arc Icon */}
        <g transform="translate(6, 4)">
          {/* Base Red Dynamic Crescent Wave */}
          <path 
            d="M 12,52 C 2,42 0,26 8,14 C 12,8 20,4 28,2 C 22,10 20,22 24,32 C 26,38 30,44 38,48 C 28,52 18,54 12,52 Z" 
            fill="url(#corpoRedGrad)" 
          />
          {/* Inner Electric Energy Lightning Flash */}
          <path 
            d="M 28,2 L 18,24 L 28,24 L 14,54 L 38,28 L 26,28 Z" 
            fill="#FFD700" 
            filter="drop-shadow(0px 0px 1.5px rgba(255,215,0,0.8))"
          />
          {/* Blue Orbiting Power Wing */}
          <path 
            d="M 22,6 C 34,2 46,8 50,20 C 52,28 48,38 42,46 C 44,38 44,28 38,20 C 34,14 28,10 22,6 Z" 
            className="fill-[#002b49] dark:fill-[#00f2fe]"
          />
        </g>

        {/* 2. Official Typography: CORPOELEC */}
        <g transform="translate(64, 0)">
          <text 
            x="0" 
            y="36" 
            fontFamily="'Outfit', 'Montserrat', 'Inter', sans-serif" 
            fontSize="30" 
            fontWeight="900" 
            letterSpacing="0.5"
            className="fill-[#002b49] dark:fill-white transition-colors"
          >
            CORPOELEC
          </text>

          {/* Subtitle: Corporación Eléctrica Nacional */}
          {showSubtext && (
            <text 
              x="1" 
              y="52" 
              fontFamily="'Inter', sans-serif" 
              fontSize="7.5" 
              fontWeight="700" 
              letterSpacing="1.2"
              className="fill-[#5A6E85] dark:fill-[#00f2fe]/90 uppercase tracking-widest"
            >
              Corporación Eléctrica Nacional
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};
