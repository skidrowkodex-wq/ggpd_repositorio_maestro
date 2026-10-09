import React from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { LogOut, Zap, User, Lock, Activity, Layers, MapPin, GitBranch, Sun, Moon } from 'lucide-react';

export type SigaSenTab = 'activos' | 'generacion' | 'diagnostico' | 'atlas' | 'unifilar_activo';

export const Navbar: React.FC<{ 
  activeTab: SigaSenTab; 
  setActiveTab: (t: SigaSenTab) => void 
}> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-300 dark:border-sky-950/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 transition-colors shadow-xs">
      {/* Barra Técnica Superior Normativa */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-sky-900/30 text-xs text-slate-700 dark:text-sky-400 transition-colors">
        <div className="app-container py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold tracking-wider text-slate-900 dark:text-sky-300">
              <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              ZONA SEGURA DE GRADO INDUSTRIAL SEN · CND 2025
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">ISO 55000 · ISO 8000 · ISO 27001 · PORT 3008</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>POSTGRESQL LOCAL: cnd_sen_unifilar_2025 · ONLINE</span>
          </div>
        </div>
      </div>

      {/* Navbar Principal */}
      <div className="app-container py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/25">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">SIGA-SEN</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                v1.0 NACIONAL CND
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistema Integrado de Gestión de Activos del SEN (Generación · Transmisión · Subestaciones)
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-300 dark:border-sky-950">
          <button
            onClick={() => setActiveTab('activos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'activos'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ⚡ Nodos y Patios SEN
          </button>
          <button
            onClick={() => setActiveTab('generacion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'generacion'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            🏭 Centrales de Generación
          </button>
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostico'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            📊 Balance SEN & MVA/MVAr
          </button>
          <button
            onClick={() => setActiveTab('atlas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'atlas'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            🗺️ Atlas Unifilar CND
          </button>
          <button
            onClick={() => setActiveTab('unifilar_activo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'unifilar_activo'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 text-white shadow-md font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            📐 Diagrama Unifilar del Activo
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-600 text-white font-black uppercase">
              Nuevo
            </span>
          </button>
        </nav>

        {/* Perfil de Usuario y Toggle de Tema */}
        <div className="flex items-center gap-2.5">
          {/* Botón de Modo Claro / Modo Oscuro SEN */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer bg-white hover:bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-xs"
            title={theme === 'light' ? 'Cambiar a Modo Oscuro (Azul SEN)' : 'Cambiar a Modo Claro Corporativo (Predeterminado SEN)'}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline font-mono text-[11px]">Modo Oscuro</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-mono text-[11px]">Modo Claro</span>
              </>
            )}
          </button>

          {user && (
            <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-sky-900/40">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.full_name}</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono leading-tight">
                  {user.role} · CND NACIONAL
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title="Cerrar Sesión Segura"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
