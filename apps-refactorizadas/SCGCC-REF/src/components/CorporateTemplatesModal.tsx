import React from 'react';
import { PlantillaCorporativa } from '../types';
import { CORPORATE_TEMPLATES } from '../data/initialCorrespondencias';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  FileSpreadsheet, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export const CorporateTemplatesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Biblioteca de Formatos y Plantillas Corporativas 2026
            </h2>
            <p className="text-xs text-purple-200">
              Formatos oficiales estandarizados de CORPOELEC para redacción de oficios, memorándums y gestión de personal.
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CORPORATE_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white dark:bg-[#072146] rounded-2xl p-6 border border-slate-200 dark:border-purple-900/40 shadow-sm hover:shadow-lg hover:border-purple-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                  {tmpl.formato === 'DOCX' ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <FileSpreadsheet className="w-6 h-6" />
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {tmpl.formato} • {tmpl.tamanoKB} KB
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {tmpl.nombre}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Plantilla oficial con membrete actualizado, tipografía institucional y lineamientos de correspondencia 2026.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vigente 2026
              </span>
              <a
                href={tmpl.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all"
              >
                <span>Abrir Plantilla</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines Box */}
      <div className="bg-purple-50/60 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" />
          Directriz Institucional de Correspondencia (GGPD-SEC-01)
        </h4>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          Todo oficio o memorándum emitido por la Gerencia General de Gestión de Planificación debe generarse a partir de estas plantillas oficiales para mantener la identidad visual corporativa de CORPOELEC, el uso de las fuentes autorizadas (Arial / Calibri / Inter) y el registro correlativo inmutable en SCGCC.
        </p>
      </div>
    </div>
  );
};
