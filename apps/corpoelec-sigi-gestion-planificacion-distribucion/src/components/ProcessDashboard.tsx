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
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-[#d97706] dark:text-[#ffd700]" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eje 3: Dashboards de Procesos y Gestión Nube</h2>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Centro de Mando Unificado para las aplicaciones del Repositorio Maestro en el estado: <strong className="text-[#002b49] dark:text-[#ffd700]">{currentStateObj.name} ({currentStateObj.code})</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-xl bg-emerald-100 dark:bg-[#081427] px-3.5 py-1.5 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 shadow-xs">
          <CloudCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
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
