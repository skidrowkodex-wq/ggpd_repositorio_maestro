import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-sky-950/80 bg-white dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 py-6 text-xs transition-colors">
      <div className="app-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold text-xs">
            ⚡
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              CORPOELEC — GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
            </div>
            <div className="text-[11px] text-slate-500">
              Repositorio Maestro SEN · SIGAD v1.0 (Sistema Integrado de Gestión de Activos de Distribución)
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            ISO 55000 (Activos)
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            ISO 8000-110 (Datos)
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            ISO 27001 (Cifrado)
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            ISACA COBIT 2019
          </span>
        </div>
      </div>

      <div className="app-container mt-3 pt-3 border-t border-slate-200 dark:border-sky-950/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
        <div>
          © 2026 CORPORACIÓN ELÉCTRICA NACIONAL S.A. · TODOS LOS DERECHOS RESERVADOS.
        </div>
        <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Ingeniería Asistida por Inteligencia Artificial (Google Antigravity / Gemini)</span>
        </div>
      </div>
    </footer>
  );
};
