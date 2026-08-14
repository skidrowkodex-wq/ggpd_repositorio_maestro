import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StateSelector } from './StateSelector';
import { SigiAcronymModal } from './SigiAcronymModal';
import { LogOut, Lock, Sun, Moon, Menu, ChevronRight, HelpCircle, Info } from 'lucide-react';

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
  const [isSigiModalOpen, setIsSigiModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#070f1e]/95 backdrop-blur-xl transition-colors shadow-2xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex h-15 sm:h-16 items-center justify-between gap-3">
            
            {/* Left: Branding & Identifier */}
            <div className="flex items-center space-x-2.5 sm:space-x-3.5">
              
              {/* Hamburger Button for Mobile Drawer */}
              {session.authenticated && (
                <button
                  onClick={onOpenMobileMenu}
                  className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Abrir Menú Lateral"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}

              {/* Main Corporate Entity & Portal Identity */}
              <div 
                className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group" 
                onClick={() => setActiveSection(session.role === 'VISOR_ESTADAL' ? 'dashboards' : 'apps')}
              >
                {/* Official CORPOELEC Logo Card */}
                <div className="h-9 sm:h-10 px-2.5 py-1 rounded-xl bg-white border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#002b49] dark:group-hover:border-[#00f2fe]/60 transition-colors">
                  <img 
                    src="/images/corpoelec_logo.jpg" 
                    alt="CORPOELEC" 
                    className="h-6 sm:h-7 w-auto object-contain"
                  />
                </div>

                {/* Vertical Separator */}
                <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700/80" />

                {/* SIGI Brand & Title */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSigiModalOpen(true);
                    }}
                    title="Haga clic para ver el significado y propósito del SIGI"
                    className="flex h-8 sm:h-8.5 px-2.5 items-center justify-center rounded-lg bg-[#002b49] text-white hover:bg-[#072146] dark:bg-[#00f2fe] dark:text-[#060d1a] dark:hover:bg-cyan-300 shadow-xs font-black text-xs tracking-wider shrink-0 transition-transform active:scale-95 group/sigibtn cursor-pointer"
                  >
                    <span>SIGI</span>
                    <Info className="h-3 w-3 ml-1 opacity-70 group-hover/sigibtn:opacity-100" />
                  </button>

                  <div>
                    <div className="flex items-center space-x-1.5 leading-none">
                      <span className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Planificación de Distribución
                      </span>
                      <span className="rounded bg-blue-50 text-blue-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 px-1 py-0.2 text-[8px] sm:text-[9px] font-mono font-bold">
                        GGPD
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSigiModalOpen(true);
                      }}
                      className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-[#002b49] dark:hover:text-[#00f2fe] font-medium mt-0.5 hidden xs:flex items-center space-x-1 transition-colors text-left"
                      title="Ver desglose institucional del Sistema Integrado de Gestión de la Información"
                    >
                      <span className="underline decoration-dotted decoration-slate-400">Sistema Integrado de Gestión de la Información</span>
                      <HelpCircle className="h-2.5 w-2.5 opacity-60 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          {/* Right Controls: State Selector, Theme Toggle & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
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
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-2xs"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-[#002b49]" />
                  <span className="hidden md:inline text-[11px]">Azul SEN</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">Blanco Corp</span>
                </>
              )}
            </button>

            {/* Auth Action */}
            {session.authenticated ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 font-mono text-[11px]">
                  {session.role}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/40 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors shadow-2xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl bg-[#002b49] hover:bg-[#003961] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#38bdf8] dark:text-[#060d1a] px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase shadow-xs hover:shadow-sm active:scale-95 transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Ingreso</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>

    {/* Dedicated SIGI Explanation Modal */}
    <SigiAcronymModal 
      isOpen={isSigiModalOpen} 
      onClose={() => setIsSigiModalOpen(false)} 
    />
  </>
  );
};
