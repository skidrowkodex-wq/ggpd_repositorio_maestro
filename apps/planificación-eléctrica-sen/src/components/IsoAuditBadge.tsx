import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileCheck2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface IsoAuditBadgeProps {
  onGoToAudit?: () => void;
}

export function IsoAuditBadge({ onGoToAudit }: IsoAuditBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {/* Popover Expandido de Detalles ISO */}
      {expanded && (
        <div className="mb-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-md p-4 shadow-2xl backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-600/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Certificación de Seguridad & Calidad</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">CORPOELEC • GGPD Sistema Seguro</p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* ISO 27001 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-indigo-700 dark:text-corpo-blue font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>ISO/IEC 27001 (Seguridad SGSI)</span>
                </span>
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 font-mono border border-indigo-300 dark:border-indigo-800 font-semibold">
                  ACTIVO
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Control de acceso RBAC, token SSL/TLS y registro inmutable de auditoría para todas las operaciones (INSERT, UPDATE, DELETE) en esquema <code className="font-mono text-indigo-700 dark:text-indigo-300">samc</code>.
              </p>
            </div>

            {/* ISO 8000 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>ISO 8000 (Calidad de Datos)</span>
                </span>
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-300 dark:border-emerald-800 font-semibold">
                  NORMATIVO
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Codificación industrial estandarizada RDS-PS (IEC 81346-10), validación de metas físicas y trazabilidad de partidas presupuestarias POA/PRTSEN.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Trazabilidad Auditable 100%</span>
            </span>
            {onGoToAudit && (
              <button
                onClick={() => {
                  setExpanded(false);
                  onGoToAudit();
                }}
                className="text-red-700 dark:text-corpo-blue hover:underline font-bold flex items-center gap-1 text-[11px]"
              >
                <span>Ver Bitácora ISO</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botón / Badge Flotante Principal */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-md bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700/80 shadow-2xl backdrop-blur-md transition-all hover:border-emerald-500/50 group"
      >
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-slate-800 dark:text-slate-100 font-mono text-[11px] font-bold">ISO 27001 & 8000</span>
          <span className="hidden sm:inline text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/60 font-bold">
            AUDITABLE
          </span>
        </div>

        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
    </div>
  );
}
