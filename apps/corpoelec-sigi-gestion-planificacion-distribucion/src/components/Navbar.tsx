import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StateSelector } from './StateSelector';
import { ShieldCheck, LogOut, Lock, Sun, Moon, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuthModal,
  activeSection,
  setActiveSection,
  onOpenMobileMenu,
  isSidebarCollapsed,
}) => {
  const { session, logout, theme, toggleTheme } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#060d1a]/95 backdrop-blur-xl transition-colors">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Menu Trigger & Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Hamburger Button for Mobile & Sidebar Drawer */}
            {session.authenticated && (
              <button
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Abrir Menú Lateral"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Logo & Branding */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer" 
              onClick={() => setActiveSection('apps')}
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-br dark:from-[#00f2fe] dark:to-[#ffd700] dark:text-[#0a192f] shadow-md font-black text-xs sm:text-sm shrink-0">
                SIGI
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">CORPOELEC</span>
                  <span className="rounded bg-[#002b49] text-white dark:bg-[#00f2fe]/20 dark:text-[#00f2fe] px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold">
                    GGPD
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none hidden xs:block">
                  Planificación de Distribución
                </p>
              </div>
            </div>

          </div>

          {/* Right Controls: State Selector, Theme Toggle & Auth */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* State Selector (Desktop/Tablet) */}
            {session.authenticated && (
              <div className="hidden sm:block">
                <StateSelector />
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Cambiar a tema ${theme === 'light' ? 'oscuro (Azul SEN)' : 'claro (Blanco Corporativo)'}`}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-[#002b49]" />
                  <span className="hidden md:inline">Azul SEN</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden md:inline">Blanco Corp</span>
                </>
              )}
            </button>

            {/* Auth Action */}
            {session.authenticated ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="hidden sm:inline text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-mono">
                  {session.role}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 rounded-xl bg-red-50 dark:bg-red-950/40 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#ffd700] dark:text-[#0a192f] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Ingreso</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
