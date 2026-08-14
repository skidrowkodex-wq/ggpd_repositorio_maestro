import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppLauncher } from './AppLauncher';
import { MinutarioSection } from './MinutarioSection';
import { ProcessDashboard } from './ProcessDashboard';
import { DocumentViewer } from './DocumentViewer';
import { UserManagementModule } from './UserManagementModule';
import { SupabaseStatusWidget } from './SupabaseStatusWidget';
import { FloatingSecurityWidget } from './FloatingSecurityWidget';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { MapPin, LayoutGrid, FileText, BarChart3, Cloud, Users } from 'lucide-react';

interface DashboardPortalProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const DashboardPortal: React.FC<DashboardPortalProps> = ({ activeSection, setActiveSection }) => {
  const { session, setStateCode } = useAuth();
  const currentStateObj = VENEZUELAN_STATES.find(s => s.code === session.stateCode) || VENEZUELAN_STATES[0];

  const isAdminOrGerencia = session.role === 'GERENCIA' || session.role === 'ADMINISTRADOR';
  const isVisorEstadal = session.role === 'VISOR_ESTADAL';

  return (
    <div className="space-y-8 py-6">
      
      {/* Top Banner: User Role & Assigned State Header */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bienvenido(a),</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{session.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                isVisorEstadal 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
              }`}>
                Rol: {session.role === 'VISOR_ESTADAL' ? 'VISOR ESTADAL (KGI/KPI)' : session.role}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isVisorEstadal ? 'Coordinación Estadal de Planificación' : 'Sistema Integrado de Información'} — <span className="text-gradient">{currentStateObj.name}</span>
            </h1>
            {isVisorEstadal && (
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Modo Sala Situacional Activo: Monitoreo continuo de KGI/KPI, densidad de red y acuerdos territoriales.
              </p>
            )}
          </div>

          {/* Quick State Selector Box */}
          <div className="flex items-center space-x-3 rounded-2xl bg-slate-50 dark:bg-[#0a192f] p-3 border border-slate-300 dark:border-[#00f2fe]/40 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-[#ffd700]/10 text-amber-700 dark:text-[#ffd700]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {isVisorEstadal ? 'Ámbito Territorial Fijo' : 'Estado Geográfico Asignado'}
              </div>
              {isVisorEstadal ? (
                <div className="text-sm font-black text-[#002b49] dark:text-[#ffd700] flex items-center space-x-1.5">
                  <span>[{session.stateCode}] {currentStateObj.name}</span>
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 px-1.5 py-0.2 rounded font-mono text-amber-900 dark:text-amber-200">Fijo</span>
                </div>
              ) : (
                <select
                  value={session.stateCode}
                  onChange={(e) => setStateCode(e.target.value as any)}
                  className="bg-transparent text-sm font-black text-[#002b49] dark:text-[#ffd700] outline-none cursor-pointer pr-2"
                >
                  {VENEZUELAN_STATES.map(s => (
                    <option key={s.code} value={s.code} className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-slate-200">
                      {s.code} - {s.name} ({s.circuitsCount} CTs)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          
          {/* Tab 1: Dashboards KGI/KPI */}
          <button
            onClick={() => setActiveSection('dashboards')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeSection === 'dashboards'
                ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md ring-2 ring-amber-400'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{isVisorEstadal ? '1. Tableros KGI/KPI & Mapa 🗺️' : '3. Dashboards & Mapa Activos 🗺️'}</span>
          </button>

          {/* Tab 2: Minutario */}
          <button
            onClick={() => setActiveSection('minutas')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
              activeSection === 'minutas'
                ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white dark:border-slate-700'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{isVisorEstadal ? '2. Minutario y Acuerdos' : '2. Minutario'}</span>
          </button>

          {/* Regular Modules for Admin/Analista */}
          {!isVisorEstadal && (
            <>
              <button
                onClick={() => setActiveSection('apps')}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                  activeSection === 'apps'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white dark:border-slate-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>1. Lanzador Nube</span>
              </button>

              <button
                onClick={() => setActiveSection('drive')}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                  activeSection === 'drive'
                    ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 dark:bg-[#112240] dark:text-slate-300 dark:hover:text-white dark:border-slate-700'
                }`}
              >
                <Cloud className="h-4 w-4" />
                <span>4. Visor Drive</span>
              </button>

              {isAdminOrGerencia && (
                <button
                  onClick={() => setActiveSection('usuarios')}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                    activeSection === 'usuarios'
                      ? 'bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] shadow-md'
                      : 'bg-blue-50 text-[#002b49] border border-blue-300 hover:bg-blue-100 dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:text-white dark:border-cyan-800'
                  }`}
                >
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>5. Gestión Usuarios SSO</span>
                </button>
              )}
            </>
          )}

        </div>

      </div>

      {/* Supabase PostgreSQL Database Telemetry & Connection Diagnostic Widget */}
      <SupabaseStatusWidget />

      {/* Render Active Section */}
      <main>
        {activeSection === 'apps' && <AppLauncher setActiveSection={setActiveSection} />}
        {activeSection === 'minutas' && <MinutarioSection />}
        {activeSection === 'dashboards' && <ProcessDashboard />}
        {activeSection === 'drive' && <DocumentViewer />}
        {activeSection === 'usuarios' && <UserManagementModule />}
      </main>

      {/* FLOATING COMPLIANCE SHIELD WIDGET (ISO 27001 / ISO 8000 / OWASP) */}
      <FloatingSecurityWidget />

    </div>
  );
};
