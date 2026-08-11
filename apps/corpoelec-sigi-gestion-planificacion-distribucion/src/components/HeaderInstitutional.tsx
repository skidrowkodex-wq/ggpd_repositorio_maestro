import React from 'react';
import { Cpu, ShieldCheck, Sparkles, Activity, CloudCheck, Lock, Award } from 'lucide-react';

export const HeaderInstitutional: React.FC = () => {
  return (
    <div className="w-full bg-[#002b49] dark:bg-[#040914] text-slate-100 border-b border-blue-900/50 dark:border-[#00f2fe]/20 transition-colors">
      
      {/* 1. Tricolor Banner Ribbon */}
      <div className="tribanda-venezuela" />

      {/* 2. Official Government & Ministry Bar */}
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-blue-900/60 dark:border-slate-800/80 text-[11px]">
        <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-200">
          <span className="uppercase text-[#ffd700] tracking-wider font-black">Gobierno Bolivariano de Venezuela</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200">Ministerio del Poder Popular para la Energía Eléctrica (MPPEE)</span>
          <span className="text-slate-400">|</span>
          <span className="text-cyan-300 dark:text-[#00f2fe] font-bold tracking-wide">CORPOELEC</span>
        </div>

        {/* AI Co-Development Badge */}
        <div className="flex items-center space-x-2 rounded-full bg-purple-900/60 dark:bg-purple-950/50 px-3 py-0.5 border border-purple-400/40 shadow-sm">
          <Sparkles className="h-3 w-3 text-purple-300 dark:text-purple-400 animate-pulse" />
          <span className="text-[10px] font-extrabold text-purple-200 dark:text-gradient-ai">
            Co-Desarrollo IA: Google Antigravity & Gemini 3.6 Flash Pro
          </span>
        </div>
      </div>

      {/* 3. Industrial Telemetry & Security Certifications Bar */}
      <div className="bg-[#001f35] dark:bg-[#081326] px-4 py-1.5 sm:px-6 border-b border-blue-900/60 dark:border-slate-800 text-[10px] font-mono transition-colors">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-slate-200">
          
          {/* Frequency & Voltage Ranges */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 rounded px-2 py-0.5 bg-emerald-900/60 dark:bg-emerald-950/60 text-emerald-300 dark:text-emerald-400 border border-emerald-500/40 font-bold">
              <Activity className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>FRECUENCIA SEN: 60.00 Hz</span>
            </span>

            <span className="hidden md:inline text-slate-500">|</span>

            {/* Voltage Level Color Chips */}
            <div className="hidden lg:flex items-center space-x-1 font-bold">
              <span className="text-slate-300 mr-1">RANGOS SEN:</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] voltage-765kv">765kV</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] voltage-400kv">400kV</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] voltage-230kv">230kV</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] voltage-115kv">115kV</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] voltage-34kv">34.5kV</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] voltage-13kv">13.8kV</span>
            </div>
          </div>

          {/* Zona Segura & Institutional Certifications Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center space-x-1 rounded-full bg-emerald-900/80 dark:bg-emerald-950/80 px-2.5 py-0.5 text-emerald-200 dark:text-emerald-300 border border-emerald-400/50 font-bold">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>ZONA SEGURA CIFRADA</span>
            </span>

            <span className="flex items-center space-x-1 rounded bg-cyan-950/60 dark:bg-[#00f2fe]/10 px-2 py-0.5 text-cyan-300 dark:text-[#00f2fe] border border-cyan-500/40 dark:border-[#00f2fe]/30 font-bold">
              <Award className="h-3 w-3" />
              <span>ISO 27001 · ISO 8000 · ISACA COBIT 2019</span>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
