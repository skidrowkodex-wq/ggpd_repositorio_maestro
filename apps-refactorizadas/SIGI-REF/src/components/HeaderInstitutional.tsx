import React from 'react';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { MppeeLogo } from './logos/MppeeLogo';

export const HeaderInstitutional: React.FC = () => {
  return (
    <div className="w-full bg-slate-100/90 dark:bg-[#040914] text-slate-800 dark:text-slate-200 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors">
      
      {/* 1. Tricolor Banner Ribbon */}
      <div className="tribanda-venezuela" />

      {/* 2. Unified Institutional & Live Status Bar */}
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 py-1 sm:py-2 flex items-center justify-between gap-2 text-xs">
        
        {/* Left: Official MPPEE Identity */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="h-4 sm:h-7 md:h-8 flex items-center">
            <MppeeLogo className="h-4 sm:h-6.5 md:h-8 w-auto max-w-[110px] sm:max-w-[190px] md:max-w-[300px]" />
          </div>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden md:inline text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400">
            Gobierno Bolivariano de Venezuela
          </span>
        </div>

        {/* Right: Live Telemetry, Security & AI Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          {/* Live Frequency Telemetry */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 text-[9px] sm:text-[10px] font-mono font-bold">
            <Activity className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>60.00 Hz</span>
            <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 text-[9px]">SEN ESTABLE</span>
          </div>

          {/* Security Industrial Safe Zone Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-amber-600 dark:text-amber-300">🛡️ ZONA SEGURA</span>
            <span className="hidden xl:inline text-slate-400">·</span>
            <span className="hidden xl:inline">GRADO INDUSTRIAL</span>
            <span className="hidden lg:inline text-slate-400">·</span>
            <span className="hidden lg:inline text-[9px]">ISO 27001 / ISO 8000 / OWASP</span>
          </div>

          {/* AI Co-Development Badge */}
          <div className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200/70 dark:border-purple-500/30 text-[9px] sm:text-[10px] font-bold shadow-2xs">
            <Sparkles className="h-2 sm:h-2.5 w-2 sm:w-2.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden xs:inline">Gemini AI & Antigravity</span>
            <span className="xs:hidden">IA</span>
          </div>

        </div>

      </div>

    </div>
  );
};
