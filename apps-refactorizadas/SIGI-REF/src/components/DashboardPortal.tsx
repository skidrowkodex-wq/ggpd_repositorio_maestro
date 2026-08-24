import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppLauncher } from './AppLauncher';
import { MinutarioSection } from './MinutarioSection';
import { ProcessDashboard } from './ProcessDashboard';
import { DocumentViewer } from './DocumentViewer';
import { UserManagementModule } from './UserManagementModule';
import { SupabaseStatusWidget } from './SupabaseStatusWidget';
import { FloatingSecurityWidget } from './FloatingSecurityWidget';
import { DataIngestionHub } from './ingestion/DataIngestionHub';
import { ProcessDirectoryManager } from './ingestion/ProcessDirectoryManager';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { MapPin, LayoutGrid, FileText, BarChart3, Cloud, Users, UploadCloud, FolderTree } from 'lucide-react';

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
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 group hover:border-[#00f2fe]/80 transition-all duration-300">
        {/* Technical Dot Matrix */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

        {/* Stylized Right Watermark Chevrons */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
            <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-cyan-200">Bienvenido(a),</span>
              <span className="text-sm font-black text-white">{session.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-black border ${
                isVisorEstadal 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              }`}>
                Rol: {session.role === 'VISOR_ESTADAL' ? 'VISOR ESTADAL (KGI/KPI)' : session.role}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isVisorEstadal ? 'Coordinación Estadal de Planificación' : 'Sistema Integrado de Información'} — <span className="text-[#00f2fe]">{currentStateObj.name}</span>
            </h1>
            {isVisorEstadal && (
              <p className="text-xs text-amber-200 font-medium">
                Modo Sala Situacional Activo: Monitoreo continuo de KGI/KPI, densidad de red y acuerdos territoriales.
              </p>
            )}
          </div>

          {/* Quick State Selector Box */}
          <div className="flex items-center space-x-3 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/20 shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/30">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-extrabold text-cyan-200 uppercase tracking-wider">
                {isVisorEstadal ? 'Ámbito Territorial Fijo' : 'Estado Geográfico Asignado'}
              </div>
              {isVisorEstadal ? (
                <div className="text-sm font-black text-white flex items-center space-x-1.5">
                  <span>[{session.stateCode}] {currentStateObj.name}</span>
                  <span className="text-[10px] bg-amber-400/30 px-1.5 py-0.2 rounded font-mono text-amber-200">Fijo</span>
                </div>
              ) : (
                <select
                  value={session.stateCode}
                  onChange={(e) => setStateCode(e.target.value as any)}
                  className="bg-transparent text-sm font-black text-white outline-none cursor-pointer pr-2"
                >
                  {VENEZUELAN_STATES.map(s => (
                    <option key={s.code} value={s.code} className="bg-[#072146] text-white">
                      {s.code} - {s.name} ({s.circuitsCount} CTs)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

        </div>

        {/* Section Navigation Tabs */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          
          {/* Tab 1: Lanzador Nube (For Admin/Specialist) */}
          {!isVisorEstadal && (
            <button
              onClick={() => setActiveSection('apps')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                activeSection === 'apps'
                  ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                  : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
              }`}
            >
              <LayoutGrid className="h-4 w-4 text-sky-300" />
              <span>1. Lanzador Nube</span>
            </button>
          )}

          {/* Tab 2: Módulo de Ingesta & Calidad (For Everyone, including Visor Estadal) */}
          <button
            onClick={() => setActiveSection('ingesta')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
              activeSection === 'ingesta'
                ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
            }`}
          >
            <UploadCloud className="h-4 w-4 text-[#00f2fe]" />
            <span>{isVisorEstadal ? '1. Módulo de Carga (ISO 8000) ⚡' : '2. Módulo de Carga ⚡'}</span>
          </button>

          {/* Tab 3: Minutario */}
          <button
            onClick={() => setActiveSection('minutas')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
              activeSection === 'minutas'
                ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
            }`}
          >
            <FileText className="h-4 w-4 text-cyan-300" />
            <span>{isVisorEstadal ? '2. Minutario y Acuerdos' : '3. Minutario'}</span>
          </button>

          {/* Tab 4: Dashboards KGI/KPI */}
          <button
            onClick={() => setActiveSection('dashboards')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
              activeSection === 'dashboards'
                ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <span>{isVisorEstadal ? '3. Tableros KGI/KPI & Mapa 🗺️' : '4. Dashboards & Mapa 🗺️'}</span>
          </button>

          {/* Tab 5: Procesos & Data Lake Nube (Admin/Gerencia/Especialista) */}
          {!isVisorEstadal && (
            <button
              onClick={() => setActiveSection('procesos_drive')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                activeSection === 'procesos_drive'
                  ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                  : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
              }`}
            >
              <FolderTree className="h-4 w-4 text-teal-300" />
              <span>5. Procesos & Data Lake</span>
            </button>
          )}

          {/* Tab 6: Visor Drive */}
          {!isVisorEstadal && (
            <button
              onClick={() => setActiveSection('drive')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                activeSection === 'drive'
                  ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                  : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
              }`}
            >
              <Cloud className="h-4 w-4 text-emerald-400" />
              <span>6. Visor Drive</span>
            </button>
          )}

          {/* Tab 7: Usuarios */}
          {isAdminOrGerencia && (
            <button
              onClick={() => setActiveSection('usuarios')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                activeSection === 'usuarios'
                  ? 'bg-white text-[#072146] shadow-md ring-2 ring-[#00f2fe]'
                  : 'bg-white/10 text-cyan-100 border border-white/20 hover:bg-white/20'
              }`}
            >
              <Users className="h-4 w-4 text-purple-300" />
              <span>7. Gestión Usuarios SSO</span>
            </button>
          )}

        </div>

      </div>

      {/* Supabase PostgreSQL Database Telemetry & Connection Diagnostic Widget */}
      <SupabaseStatusWidget />

      {/* Render Active Section */}
      <main>
        {activeSection === 'apps' && <AppLauncher setActiveSection={setActiveSection} />}
        {activeSection === 'ingesta' && <DataIngestionHub />}
        {activeSection === 'minutas' && <MinutarioSection />}
        {activeSection === 'dashboards' && <ProcessDashboard />}
        {activeSection === 'procesos_drive' && <ProcessDirectoryManager />}
        {activeSection === 'drive' && <DocumentViewer />}
        {activeSection === 'usuarios' && <UserManagementModule />}
      </main>

      {/* FLOATING COMPLIANCE SHIELD WIDGET (ISO 27001 / ISO 8000 / OWASP) */}
      <FloatingSecurityWidget />

    </div>
  );
};
