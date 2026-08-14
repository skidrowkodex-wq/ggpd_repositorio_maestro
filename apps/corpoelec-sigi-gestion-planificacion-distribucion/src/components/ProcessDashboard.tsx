import React, { useState } from 'react';
import { DASHBOARD_REGISTRY } from './dashboards/DashboardRegistry';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { useAuth } from '../context/AuthContext';
import { BarChart3, CloudCheck } from 'lucide-react';

export const ProcessDashboard: React.FC = () => {
  const { session } = useAuth();
  const currentStateObj = VENEZUELAN_STATES.find(s => s.code === session.stateCode) || VENEZUELAN_STATES[0];
  const [activeDashboardId, setActiveDashboardId] = useState<string>(DASHBOARD_REGISTRY[0].id);

  // Encontrar el componente activo
  const ActiveDashboardConfig = DASHBOARD_REGISTRY.find(d => d.id === activeDashboardId) || DASHBOARD_REGISTRY[0];
  const ActiveDashboardComponent = ActiveDashboardConfig.component;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-[#00f2fe]/80 transition-all duration-300">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
            <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold flex items-center space-x-1.5">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              <span>Eje 3 · Centro de Mando Operacional</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Dashboards de Procesos y Gestión Nube</h2>
          <p className="text-xs text-cyan-100/90 mt-1 font-medium">
            Centro de Mando Unificado para las aplicaciones del Repositorio Maestro en: <strong className="text-[#00f2fe] font-black">{currentStateObj.name} ({currentStateObj.code})</strong>
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-2 rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-emerald-300 shadow-xs">
          <CloudCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold font-mono">ECOSISTEMA INTEGRADO</span>
        </div>
      </div>

      {/* Dynamic Tabs Navigation (Plug & Play) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {DASHBOARD_REGISTRY.map((dash) => {
          const Icon = dash.icon;
          const isActive = activeDashboardId === dash.id;
          return (
            <button
              key={dash.id}
              onClick={() => setActiveDashboardId(dash.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl transition-all font-black text-xs whitespace-nowrap border-b-2 ${
                isActive
                  ? 'bg-slate-100 dark:bg-[#112240] text-slate-900 dark:text-white border-[#002b49] dark:border-[#00f2fe]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-[#0a1526]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{dash.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Dashboard Component */}
      <div className="pt-2">
        <ActiveDashboardComponent />
      </div>

    </div>
  );
};
