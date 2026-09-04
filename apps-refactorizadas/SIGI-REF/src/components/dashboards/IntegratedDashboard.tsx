import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Database, Server, Zap, AlertTriangle, Layers } from 'lucide-react';

export const IntegratedDashboard: React.FC = () => {
  const { session } = useAuth();
  
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Consolidado Operativo */}
        <div className="rounded-3xl bg-white dark:bg-[#081224] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Flujo Consolidado SCTIS</span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white font-mono">—</h4>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Interrupciones Procesadas (Últimos 30 días) · Sin datos InsForge</p>
          </div>
        </div>

        {/* Card 2: Viáticos & Presupuesto */}
        <div className="rounded-3xl bg-white dark:bg-[#081224] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Control Planificación</span>
            <Database className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white font-mono">—</h4>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Presupuesto Ejecutado Viáticos · Sin datos InsForge</p>
          </div>
        </div>

        {/* Card 3: Indisponibilidades SCEIN */}
        <div className="rounded-3xl bg-white dark:bg-[#081224] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Equipos Críticos SCEIN</span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white font-mono">—</h4>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Equipos en Patio Indisponibles (TX/Int) · Sin datos InsForge</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-blue-50 dark:bg-[#0a1526] p-6 border border-blue-200 dark:border-[#00f2fe]/30 shadow-md">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
          <Server className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
          <span>Ecosistema de Nube Integrado</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
          El Portal SIGI consolida la lectura de esquemas remotos (`samc`, `sctis`, `scein`). Las bases de datos se sincronizan en tiempo real para generar estos indicadores bajo estándares ISO.
        </p>
      </div>
    </div>
  );
};
