import React, { useState } from 'react';
import { SYSTEM_APPS } from '../mockData/portalData';
import { AppItem } from '../types/sigi';
import { ExternalLink, Cpu, Zap, AlertTriangle, ClipboardList, Cloud, Bot, CloudCheck, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const AppLauncher: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredApps = SYSTEM_APPS.filter(app => {
    if (filterCategory === 'MAESTRA') return app.category === 'APLICACION_MAESTRA';
    if (filterCategory === 'NUBE') return app.category === 'NUBE_AUTOMATIZACION';
    return true;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="h-6 w-6 text-[#002b49] dark:text-[#00f2fe]" />;
      case 'Zap': return <Zap className="h-6 w-6 text-[#d97706] dark:text-[#ffd700]" />;
      case 'AlertTriangle': return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'ClipboardList': return <ClipboardList className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />;
      case 'FolderCloud': return <Cloud className="h-6 w-6 text-blue-600 dark:text-cyan-400" />;
      case 'Bot': return <Bot className="h-6 w-6 text-purple-700 dark:text-[#4facfe]" />;
      default: return <ExternalLink className="h-6 w-6 text-[#002b49] dark:text-[#00f2fe]" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CloudCheck className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eje 1: Portal de Aplicaciones y Recursos Nube</h2>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-2xl font-medium">
            Acceso directo y centralizado a los sistemas oficiales de la Gerencia Nacional de Gestión de Planificación de Distribución.
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-[#0a192f] p-1.5 border border-slate-300 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterCategory === 'ALL'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Todas ({SYSTEM_APPS.length})
          </button>
          <button
            onClick={() => setFilterCategory('MAESTRA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterCategory === 'MAESTRA'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Aplicaciones Maestras
          </button>
          <button
            onClick={() => setFilterCategory('NUBE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterCategory === 'NUBE'
                ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Recursos Nube
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app: AppItem) => (
          <div
            key={app.id}
            className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/50 shadow-sm hover:shadow-md transition-all"
          >
            <div>
              {/* Badge & Category */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-[#112240] border border-blue-200 dark:border-slate-700/80 shadow-xs">
                  {getIcon(app.iconName)}
                </div>
                {app.badgeText && (
                  <span className="rounded-full bg-blue-100 text-[#002b49] border border-blue-300 dark:bg-[#00f2fe]/10 dark:text-[#00f2fe] dark:border-[#00f2fe]/30 px-3 py-1 text-[10px] font-black">
                    {app.badgeText}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors flex items-center justify-between">
                <span>{app.name}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#002b49] dark:text-[#00f2fe]" />
              </h3>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {app.description}
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                {app.isCloud ? 'Servicio Nube' : 'App Vercel'}
              </span>
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs font-black text-[#002b49] dark:text-[#00f2fe] hover:underline"
              >
                <span>Ejecutar Aplicación</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Security Statement */}
      <div className="flex items-center space-x-3 rounded-2xl bg-white dark:bg-[#112240] p-4 text-xs text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm font-medium">
        <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>
          Todas las aplicaciones están enlazadas bajo el estándar de gobernanza <strong className="text-slate-900 dark:text-white">GGPD-SGM-INS-005 v3.0 ISO</strong> con autenticación integrada y Row-Level Security.
        </span>
      </div>

    </div>
  );
};
