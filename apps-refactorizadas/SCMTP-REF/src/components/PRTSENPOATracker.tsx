import React from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Layers, 
  Database, 
  Building2, 
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { TareaCompromiso } from '../types';

interface PRTSENPOATrackerProps {
  compromisos: TareaCompromiso[];
  onNavigateCompromisos: () => void;
}

export const PRTSENPOATracker: React.FC<PRTSENPOATrackerProps> = ({
  compromisos,
  onNavigateCompromisos,
}) => {
  // Filter PRTSEN / POA related commitments
  const prtsenTasks = compromisos.filter(c => 
    c.vinculacionOrigen.includes('Punto 4') || 
    c.vinculacionOrigen.includes('PRTSEN') ||
    c.vinculacionOrigen.includes('POA') ||
    c.compromiso.toLowerCase().includes('prtsen') ||
    c.compromiso.toLowerCase().includes('poa')
  );

  const proyectosAutogestionadosTasks = compromisos.filter(c =>
    c.vinculacionOrigen.includes('Punto 5') ||
    c.compromiso.toLowerCase().includes('autogestionado') ||
    c.compromiso.toLowerCase().includes('especiales')
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-md">
                PRTSEN & POA
              </span>
              <span className="text-slate-400 text-xs">Alineación Estratégica CORPOELEC</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Plan de Recuperación (PRTSEN) y Plan Operativo Anual (POA)
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Módulo de articulación entre los proyectos de recuperación y transformación del SEN con las acciones específicas del POA, garantizando el control de proyectos autogestionados en los estados.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 min-w-[220px]">
            <div className="text-slate-400 font-semibold">Responsable Principal</div>
            <div className="font-bold text-slate-100 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-red-400" />
              <span>Yván Cipirán / Walter Prato</span>
            </div>
            <div className="text-[11px] text-amber-400 font-mono pt-1 border-t border-slate-800">
              Inicio Cronograma: 15/08/2026
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Initiative 1: Vinculación PRTSEN - POA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Vincular Proyectos PRTSEN con Acciones POA</h3>
                <p className="text-xs text-slate-500">Punto 4 de Agenda de Minuta</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            Estructurar y vincular formalmente las metas operativas del Plan de Recuperación con los códigos presupuestarios y administrativos del Plan Operativo Anual (POA).
          </p>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">Compromisos Vinculados ({prtsenTasks.length})</h4>
            <div className="space-y-2">
              {prtsenTasks.map(t => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{t.responsable}</span>
                    <span className="text-red-600">Plazo: {t.plazoText}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{t.compromiso}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200/60">
                    <span>Estado: <strong>{t.estado}</strong></span>
                    <span className="font-bold text-slate-800">{t.avancePorcentaje}% realizado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Initiative 2: Proyectos Autogestionados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Proyectos Autogestionados Estadales</h3>
                <p className="text-xs text-slate-500">Punto 5 de Agenda de Minuta</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            Capturar y visibilizar obras ejecutadas por las gerencias regionales con mano de obra y recursos propios no reflejados previamente en el POA contractual.
          </p>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800">Compromisos de Gestión Especial ({proyectosAutogestionadosTasks.length})</h4>
            <div className="space-y-2">
              {proyectosAutogestionadosTasks.map(t => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{t.responsable}</span>
                    <span className="text-red-600">Plazo: {t.plazoText}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{t.compromiso}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200/60">
                    <span>Estado: <strong>{t.estado}</strong></span>
                    <span className="font-bold text-slate-800">{t.avancePorcentaje}% realizado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
