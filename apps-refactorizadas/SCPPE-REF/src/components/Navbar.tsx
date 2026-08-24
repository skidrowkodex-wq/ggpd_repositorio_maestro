import { ShieldCheck, Database, CheckCircle2, AlertCircle, UserCheck, LogOut, LogIn, Sun, Moon } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({ currentUser, onOpenLogin, onLogout, darkMode, onToggleDarkMode }: NavbarProps) {
  return (
    <header className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-slate-900 dark:text-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Franja de Identidad Corporativa CORPOELEC / MPPEE (Rojo, Azul, Amarillo) */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="h-full w-1/3 bg-corpo-red" />
        <div className="h-full w-1/3 bg-corpo-blue" />
        <div className="h-full w-1/3 bg-corpo-accent" />
      </div>

      <div className="flex items-center gap-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-corpo-blue border-2 border-corpo-accent flex items-center justify-center text-corpo-accent font-black text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                Planificación Eléctrica SEN
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm bg-corpo-red text-white shadow-sm font-mono">
                CORPOELEC
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-300">MPPEE</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>GGPD (POA & PRTSEN)</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-corpo-accent font-mono text-[11px] font-semibold bg-corpo-accent/10 px-1 rounded-sm">IEC 81346</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ISO 27001 / ISO 8000 AUDITADO</span>
        </div>

        <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border ${
          isSupabaseConfigured 
            ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' 
            : 'bg-amber-950/40 border-amber-500/30 text-corpo-accent'
        }`}>
          {isSupabaseConfigured ? (
            <>
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Supabase Conectado</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-corpo-accent" />
              <span>Supabase: Llaves Pendientes</span>
            </>
          )}
        </div>

        {/* Switch Tema Claro / Oscuro (Colores Corporativos) */}
        <button
          onClick={onToggleDarkMode}
          className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 font-semibold text-xs transition-all ${
            darkMode
              ? 'bg-slate-800 border-slate-700 text-corpo-accent hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title={darkMode ? 'Cambiar a Tema Claro (Predeterminado)' : 'Cambiar a Modo Oscuro'}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-corpo-accent" />
              <span className="hidden sm:inline">Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">Modo Oscuro</span>
            </>
          )}
        </button>

        {/* User Info & Auth */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{currentUser.nombre}</span>
                <div className="flex items-center justify-end gap-1">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-sm font-semibold ${
                      currentUser.rol === 'ADMINISTRADOR'
                        ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 border dark:border-purple-800'
                        : currentUser.rol === 'ESPECIALISTA'
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 border dark:border-indigo-800'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 border dark:border-emerald-800'
                    }`}
                  >
                    {currentUser.rol}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">(@{currentUser.username})</span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-md bg-corpo-blue/10 border border-corpo-blue/40 flex items-center justify-center text-corpo-blue dark:bg-corpo-blue/30 dark:text-blue-300 font-bold text-xs">
                {currentUser.nombre.charAt(0)}
              </div>

              <button
                onClick={onOpenLogin}
                className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Cambiar Usuario / Iniciar Sesión"
              >
                <UserCheck className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-md bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/60 text-corpo-red dark:text-red-400 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-md bg-corpo-blue hover:bg-corpo-dark text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


