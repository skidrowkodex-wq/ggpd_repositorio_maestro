import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  LogOut, 
  LogIn, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Lock, 
  Zap 
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({ 
  currentUser, 
  onOpenLogin, 
  onLogout, 
  darkMode, 
  onToggleDarkMode,
  onToggleMobileMenu,
  isMobileMenuOpen 
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors shadow-xs select-none">
      {/* Franja de Identidad Corporativa CORPOELEC / MPPEE (Rojo, Azul, Amarillo) */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-corpo-red" />
        <div className="h-full w-1/3 bg-corpo-blue" />
        <div className="h-full w-1/3 bg-corpo-accent" />
      </div>

      <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full">
        
        {/* ================================================================= */}
        {/* SECCIÓN IZQUIERDA: MENÚ MÓVIL + IDENTIDAD CORPORATIVA            */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Botón Hamburguesa Móvil (Visible solo en pantallas < lg) */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={isMobileMenuOpen ? 'Cerrar Menú' : 'Abrir Menú de Navegación'}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo ⚡ SEN */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-corpo-blue to-slate-900 border border-corpo-blue/50 flex items-center justify-center text-amber-400 font-black text-base sm:text-lg shadow-xs shrink-0">
            ⚡
          </div>

          {/* Títulos y Subtítulos */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base tracking-tight truncate">
                Planificación Eléctrica SEN
              </h1>
              <span className="shrink-0 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-corpo-red text-white shadow-2xs font-mono">
                CORPOELEC
              </span>
            </div>
            
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="font-semibold text-slate-700 dark:text-slate-300">MPPEE</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="truncate">GGPD (POA & PRTSEN)</span>
              <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
              <span className="hidden md:inline text-corpo-accent font-mono text-[10px] font-semibold bg-corpo-accent/10 dark:bg-corpo-accent/20 px-1 rounded">
                IEC 81346
              </span>
            </p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN CENTRAL: SELLOS DE CERTIFICACIÓN & BACKEND INSFORGE       */}
        {/* ================================================================= */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Pill Sello Industrial ISO / Zona Segura */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-600/40 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-amber-600 dark:text-amber-300 font-semibold">🛡️ ZONA SEGURA</span>
            <span className="hidden xl:inline text-slate-400">·</span>
            <span className="hidden xl:inline">GRADO INDUSTRIAL</span>
            <span className="hidden 2xl:inline text-slate-400">·</span>
            <span className="hidden 2xl:inline text-[9px] text-slate-500 dark:text-slate-400">ISO 27001 · PORT 3004</span>
          </div>

          {/* Pill Conexión InsForge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold shadow-2xs ${
            isSupabaseConfigured 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300' 
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300'
          }`}>
            {isSupabaseConfigured ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden lg:inline">InsForge BaaS Conectado</span>
                <span className="lg:hidden">InsForge</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Modo Local</span>
              </>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECCIÓN DERECHA: TEMA + PERFIL DE USUARIO Y CONTROLES            */}
        {/* ================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Switch Modo Claro / Oscuro */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title={darkMode ? 'Cambiar a Tema Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden xl:inline text-[11px]">Tema Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden xl:inline text-[11px]">Modo Oscuro</span>
              </>
            )}
          </button>

          {/* Perfil de Usuario y Acciones */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2.5 border-l border-slate-200 dark:border-slate-800">
              
              {/* Info de Nombre y Rol (Oculto en pantallas muy pequeñas) */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-tight truncate max-w-[120px] md:max-w-[160px]">
                  {currentUser.nombre}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      currentUser.rol === 'ADMINISTRADOR'
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        : currentUser.rol === 'ESPECIALISTA'
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {currentUser.rol}
                  </span>
                  <span className="hidden md:inline text-[9px] text-slate-400 font-mono">
                    (@{currentUser.username})
                  </span>
                </div>
              </div>

              {/* Avatar Cuadrado con Inicial */}
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-corpo-blue/10 dark:bg-corpo-blue/30 border border-corpo-blue/30 dark:border-corpo-blue/50 flex items-center justify-center text-corpo-blue dark:text-blue-300 font-bold text-xs shrink-0 shadow-2xs"
                title={`${currentUser.nombre} (${currentUser.rol})`}
              >
                {currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* Botón Cambiar Usuario / Relogin */}
              <button
                type="button"
                onClick={onOpenLogin}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Cambiar Usuario"
              >
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Botón Salir */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/60 text-corpo-red dark:text-red-400 transition-colors"
                title="Cerrar Sesión Segura"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-lg bg-corpo-blue hover:bg-corpo-dark text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
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
