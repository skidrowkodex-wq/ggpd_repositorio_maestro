import React, { useState } from 'react';
import { 
  Info, 
  X, 
  Layers, 
  Database, 
  ShieldCheck, 
  Network, 
  Cpu, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface SigiAcronymModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SigiAcronymModal: React.FC<SigiAcronymModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md animate-fadeIn">
      
      <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-white dark:bg-[#071326] border border-slate-200 dark:border-[#00f2fe]/40 shadow-2xl transition-all max-h-[92vh] flex flex-col">
        
        {/* Top Header with Industrial Gradient */}
        <div className="relative bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 border-b border-blue-900/60 dark:border-[#00f2fe]/30 shrink-0">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
          
          {/* Stylized Right Watermark */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
            <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
              <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
            </svg>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl text-cyan-200 hover:text-white hover:bg-white/10 transition-colors z-20"
            title="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>Identidad Institucional & Arquitectura Estratégica</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¿Qué es el <span className="text-[#00f2fe]">SIGI</span>?
            </h2>
            <p className="text-sm font-semibold text-cyan-100/90">
              Sistema Integrado de Gestión de la Información
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar text-slate-700 dark:text-slate-200">
          
          {/* Acronym Breakdown Cards (S - I - G - I) */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#002b49] dark:text-[#00f2fe] mb-3 flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Desglose Semántico de las Siglas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* S */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0b1b33] border border-blue-200 dark:border-blue-800/60 shadow-xs flex items-start space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                  S
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Sistema</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Ecosistema unificado de ingeniería y software que interconecta aplicaciones especializadas, bases de datos PostgreSQL y salas situacionales.
                  </p>
                </div>
              </div>

              {/* I */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-[#0b1b33] border border-cyan-200 dark:border-cyan-800/60 shadow-xs flex items-start space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-cyan-600 text-white dark:bg-cyan-400 dark:text-[#060d1a] font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                  I
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Integrado</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Consolidación en tiempo real de telemetría (SCTIS), proyectos de inversión (SCEIN), caracterización de activos y minutario técnico sin silos.
                  </p>
                </div>
              </div>

              {/* G */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-[#0b1b33] border border-amber-200 dark:border-amber-800/60 shadow-xs flex items-start space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-600 text-white dark:bg-amber-400 dark:text-[#060d1a] font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                  G
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Gestión</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Gobierno corporativo y operativo para la toma de decisiones basada en indicadores KGI/KPI (SAIDI, SAIFI, ENS, cumplimiento de obras).
                  </p>
                </div>
              </div>

              {/* I */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-[#0b1b33] border border-purple-200 dark:border-purple-800/60 shadow-xs flex items-start space-x-3.5">
                <div className="h-10 w-10 rounded-xl bg-purple-600 text-white dark:bg-purple-400 dark:text-[#060d1a] font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                  I
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Información</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Soberanía y aseguramiento de datos auditables bajo norma <strong>ISO 8000-110</strong> y ciberseguridad <strong>ISO 27001</strong> eliminando canales informales.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Strategic Importance for CORPOELEC & SEN */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-[#09182f] dark:to-[#0c1f3c] border border-slate-200 dark:border-blue-900/50 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#002b49] dark:text-[#ffd700] flex items-center space-x-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Importancia Estratégica para el Sistema Eléctrico Nacional (SEN)</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              El <strong>SIGI</strong> constituye la columna vertebral de inteligencia territorial de la <strong>Gerencia General de Planificación de Distribución (GGPD)</strong> adscrita al <strong>MPPEE</strong>. Permite transformar datos dispersos de subestaciones, circuitos y cuadrillas operativas en tableros de control predictivo en tiempo real para 25 entidades territoriales (incluida la Guayana Esequiba).
            </p>

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-[#060e1c] border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Soberanía del Dato</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Directiva <em>Zero-WhatsApp</em>: Toda la información técnica circula por canales oficiales cifrados.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#060e1c] border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-blue-700 dark:text-cyan-400 text-xs font-bold font-mono">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Confiabilidad Real</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Medición exacta de SAIDI/SAIFI y despacho de carga para mitigar interrupciones críticas.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#060e1c] border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-purple-700 dark:text-purple-400 text-xs font-bold font-mono">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>IA Co-Pilot</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Modelos predictivos con Gemini 3.6 Flash y Google Antigravity para priorización de mantenimiento.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#060d1a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
            CORPOELEC · GGPD · República Bolivariana de Venezuela
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#002b49] text-white hover:bg-[#003961] dark:bg-white dark:text-[#072146] dark:hover:bg-cyan-50 text-xs font-black uppercase shadow-md transition-all cursor-pointer"
          >
            Entendido, Continuar
          </button>
        </div>

      </div>

    </div>
  );
};
