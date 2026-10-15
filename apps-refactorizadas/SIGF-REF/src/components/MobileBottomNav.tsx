import React from 'react';
import { ClipboardList, BarChart3, PieChart, Menu } from 'lucide-react';

type MobileTab = 'formulario' | 'consolidado' | 'gerencia' | 'permisos';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  totalRecords: number;
  userEmail: string;
  isDarkMode: boolean;
  onOpenMobileMenu: () => void;
  /** Verificación de permisos por rol. Si no se provee, todo está permitido. */
  can?: (actionId: string) => boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  totalRecords,
  isDarkMode,
  onOpenMobileMenu,
  can
}) => {
  const allow = (actionId: string) => (can ? can(actionId) : true);

  return (
    <nav
      aria-label="Navegación Móvil"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#c9a227] px-2 py-1 shadow-2xl transition-colors duration-200 select-none ${
        isDarkMode
          ? 'bg-[#071b14]/95 backdrop-blur-md text-slate-200'
          : 'bg-[#0b3d2e]/95 backdrop-blur-md text-white'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Tab 1: Formulario */}
        {allow('tab_formulario') && (
          <button
            onClick={() => onSelectTab('formulario')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] ${
              currentTab === 'formulario'
                ? 'text-[#c9a227] font-bold scale-105'
                : 'text-slate-300 hover:text-white opacity-85'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentTab === 'formulario' ? 'bg-white/10' : ''}`}>
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Captura</span>
          </button>
        )}

        {/* Tab 2: Consolidado */}
        {allow('tab_consolidado') && (
        <button
          onClick={() => onSelectTab('consolidado')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] ${
            currentTab === 'consolidado'
              ? 'text-[#c9a227] font-bold scale-105'
              : 'text-slate-300 hover:text-white opacity-85'
          }`}
        >
          <div className={`relative p-1 rounded-lg ${currentTab === 'consolidado' ? 'bg-white/10' : ''}`}>
            <BarChart3 className="w-5 h-5" />
            {totalRecords > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#c9a227] text-[#0a1f17] text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {totalRecords > 999 ? '999+' : totalRecords}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Flota</span>
        </button>
        )}

        {/* Tab 3: Cuadro de Mando Gerencial */}
        {allow('tab_gerencia') && (
        <button
          onClick={() => onSelectTab('gerencia')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] ${
            currentTab === 'gerencia'
              ? 'text-[#c9a227] font-bold scale-105'
              : 'text-slate-300 hover:text-white opacity-85'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentTab === 'gerencia' ? 'bg-white/10' : ''}`}>
            <PieChart className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Gerencia</span>
        </button>
        )}

        {/* Tab 4: Menú Lateral / Herramientas (incluye Control de Permisos para admin) */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer min-w-[64px] min-h-[48px] text-slate-300 hover:text-white opacity-85 active:scale-95"
          title="Abrir menú de herramientas y configuración"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Más</span>
        </button>
      </div>
    </nav>
  );
};
