import React from 'react';

interface MppeeLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  height?: number | string;
}

export const MppeeLogo: React.FC<MppeeLogoProps> = ({ 
  className = "h-8 w-auto", 
  variant = 'auto' 
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg 
        viewBox="0 0 440 95" 
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Side: Venezuelan Waving Ribbon Flag */}
        <g transform="translate(4, 2)">
          {/* Yellow Ribbon with 3D Wave Depth */}
          <path d="M 5,22 C 22,12 48,10 65,18 C 78,24 92,20 102,15 L 102,27 C 88,32 75,34 62,28 C 45,20 25,22 5,32 Z" fill="#F7C000" />
          <path d="M 5,22 C 22,12 48,10 65,18 C 78,24 92,20 102,15 L 102,18 C 92,23 78,27 65,21 C 48,13 22,15 5,25 Z" fill="#FFD700" opacity="0.9" />

          {/* Blue Ribbon with Curve */}
          <path d="M 5,32 C 25,22 45,20 62,28 C 75,34 88,32 102,27 L 102,39 C 88,44 75,46 62,40 C 45,32 25,34 5,44 Z" fill="#002B66" />
          
          {/* 8 Stars Arc in Blue Ribbon */}
          <g fill="#FFFFFF">
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(16, 25)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(28, 23)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(40, 22)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(52, 23)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(64, 25)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(76, 28)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(88, 32)" />
            <polygon points="26,29 27.2,32 30.5,32 27.8,34 28.8,37 26,35 23.2,37 24.2,34 21.5,32 24.8,32" transform="scale(0.55) translate(100, 36)" />
          </g>

          {/* Red Ribbon with Wave */}
          <path d="M 5,44 C 25,34 45,32 62,40 C 75,46 88,44 102,39 L 102,51 C 88,56 75,58 62,52 C 45,44 25,46 5,56 Z" fill="#CF142B" />
          <path d="M 5,48 C 25,38 45,36 62,44 C 75,50 88,48 102,43 L 102,51 C 88,56 75,58 62,52 C 45,44 25,46 5,56 Z" fill="#990000" opacity="0.4" />

          {/* Text: República Bolivariana de Venezuela */}
          <text 
            x="53" 
            y="69" 
            fontFamily="'Inter', 'Outfit', sans-serif" 
            fontSize="6.5" 
            fontWeight="700" 
            className="fill-[#00247D] dark:fill-blue-200" 
            textAnchor="middle" 
            letterSpacing="0.2"
          >
            REPÚBLICA BOLIVARIANA DE
          </text>
          <text 
            x="53" 
            y="81" 
            fontFamily="'Outfit', 'Inter', sans-serif" 
            fontSize="11" 
            fontWeight="900" 
            className="fill-[#00247D] dark:fill-blue-100" 
            textAnchor="middle" 
            letterSpacing="0.4"
          >
            VENEZUELA
          </text>
        </g>

        {/* Vertical Divider Line */}
        <line 
          x1="120" 
          y1="12" 
          x2="120" 
          y2="82" 
          className="stroke-[#7B8CA3] dark:stroke-[#00f2fe]/40" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />

        {/* Right Side: Ministerio del Poder Popular para la ENERGÍA ELÉCTRICA */}
        <g transform="translate(132, 0)">
          <text 
            x="0" 
            y="38" 
            fontFamily="'Inter', 'Helvetica Neue', sans-serif" 
            fontSize="16.5" 
            fontWeight="600" 
            className="fill-[#203a63] dark:fill-slate-200" 
            letterSpacing="-0.2"
          >
            Ministerio del Poder Popular para la
          </text>
          <text 
            x="0" 
            y="72" 
            fontFamily="'Outfit', 'Inter', 'Helvetica Neue', sans-serif" 
            fontSize="30" 
            fontWeight="900" 
            className="fill-[#1C355E] dark:fill-[#00f2fe]" 
            letterSpacing="-0.5"
          >
            ENERGÍA ELÉCTRICA
          </text>
        </g>
      </svg>
    </div>
  );
};
