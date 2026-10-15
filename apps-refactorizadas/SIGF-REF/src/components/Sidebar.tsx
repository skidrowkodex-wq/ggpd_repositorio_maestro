import React, { useState } from 'react';
import { 
  ClipboardList, 
  BarChart3, 
  PieChart, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Shield, 
  X,
  Users,
  History,
  Sun,
  Moon,
  KeyRound,
  Database,
  Lock
} from 'lucide-react';
import { getUserProfile } from '../data/defaultUsers';

type SidebarTab = 'formulario' | 'consolidado' | 'gerencia' | 'permisos';

interface SidebarProps {
  currentTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  totalRecords: number;
  userEmail: string;
  isDarkMode: boolean;
  onExportExcel: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenUserManagement?: () => void;
  onOpenBackupModal?: () => void;
  onOpenChangePassword?: () => void;
  onOpenPostgreSql?: () => void;
  onToggleDarkMode?: () => void;
  /** Verificación de permisos por rol. Si no se provee, todo está permitido. */
  can?: (actionId: string) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  totalRecords,
  userEmail,
  isDarkMode,
  onExportExcel,
  mobileOpen = false,
  onCloseMobile,
  onOpenUserManagement,
  onOpenBackupModal,
  onOpenChangePassword,
  onOpenPostgreSql,
  onToggleDarkMode,
  can
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userProfile = getUserProfile(userEmail);
  const allow = (actionId: string) => (can ? can(actionId) : true);

  const handleSelectTabMobile = (tab: SidebarTab) => {
    onSelectTab(tab);
    onCloseMobile?.();
  };

  const navContent = (isMobileView = false) => (
    <div className="flex flex-col h-full">
      {/* Header del Menú */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        {(!isCollapsed || isMobileView) ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center text-lg font-black text-[#c9a227] shrink-0 shadow-inner">
              ⚡
            </div>
            <div className="truncate">
              <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>CORPOELEC</span>
                <span className="text-[#c9a227]">GGPD</span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">Flota Vehicular SEN</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-10 h-10 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center text-lg font-black text-[#c9a227] shadow-inner">
            ⚡
          </div>
        )}

        {isMobileView ? (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navegación Principal */}
      <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        {(!isCollapsed || isMobileView) && (
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#c9a227] uppercase">
            Módulos Operativos SEN
          </div>
        )}

        {allow('tab_formulario') && (
          <button
            onClick={() => handleSelectTabMobile('formulario')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group min-h-[48px] ${
              currentTab === 'formulario'
                ? 'bg-[#1a5f47] text-white shadow-md border border-[#c9a227]'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Formulario de Captura A4"
          >
            <ClipboardList className={`w-5 h-5 shrink-0 ${currentTab === 'formulario' ? 'text-[#c9a227]' : 'text-slate-400 group-hover:text-white'}`} />
            {(!isCollapsed || isMobileView) && <span className="truncate">Formulario de Captura</span>}
          </button>
        )}

        {allow('tab_consolidado') && (
        <button
          onClick={() => handleSelectTabMobile('consolidado')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group min-h-[48px] ${
            currentTab === 'consolidado'
              ? 'bg-[#1a5f47] text-white shadow-md border border-[#c9a227]'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Consolidado de Base de Datos"
        >
          <div className="flex items-center gap-3 truncate">
            <BarChart3 className={`w-5 h-5 shrink-0 ${currentTab === 'consolidado' ? 'text-[#c9a227]' : 'text-slate-400 group-hover:text-white'}`} />
            {(!isCollapsed || isMobileView) && <span className="truncate">Consolidado Flota</span>}
          </div>
          {(!isCollapsed || isMobileView) && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded bg-[#c9a227] text-[#0a1f17] shrink-0 tabular-nums">
              {totalRecords}
            </span>
          )}
        </button>
        )}

        {allow('tab_gerencia') && (
        <button
          onClick={() => handleSelectTabMobile('gerencia')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group min-h-[48px] ${
            currentTab === 'gerencia'
              ? 'bg-[#1a5f47] text-white shadow-md border border-[#c9a227]'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Cuadro de Mando Gerencial"
        >
          <PieChart className={`w-5 h-5 shrink-0 ${currentTab === 'gerencia' ? 'text-[#c9a227]' : 'text-slate-400 group-hover:text-white'}`} />
          {(!isCollapsed || isMobileView) && <span className="truncate">Cuadro Mando Gerencial</span>}
        </button>
        )}

        {/* Pestaña Administrativa: Control de Permisos por Rol */}
        {allow('tab_permisos') && (
        <button
          onClick={() => handleSelectTabMobile('permisos')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group min-h-[48px] ${
            currentTab === 'permisos'
              ? 'bg-[#c9a227] text-[#0b3d2e] shadow-md border border-[#c9a227]'
              : 'text-amber-200 hover:bg-white/10 hover:text-white'
          }`}
          title="Control de Permisos por Rol"
        >
          <Lock className={`w-5 h-5 shrink-0 ${currentTab === 'permisos' ? 'text-[#0b3d2e]' : 'text-[#c9a227]'}`} />
          {(!isCollapsed || isMobileView) && <span className="truncate">Control de Permisos</span>}
        </button>
        )}

        {/* Acciones Móviles Especiales */}
        {isMobileView && (
          <div className="pt-4 mt-2 border-t border-white/10 space-y-2">
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-[#c9a227] uppercase">
              Herramientas de Sistema
            </div>

            {onOpenBackupModal && allow('btn_backup') && (
              <button
                onClick={() => {
                  onCloseMobile?.();
                  onOpenBackupModal();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors min-h-[44px]"
              >
                <History className="w-4 h-4 text-[#c9a227]" />
                <span>Puntos de Control (SISFLOTA01)</span>
              </button>
            )}

            {onOpenUserManagement && allow('btn_users_mgmt') && (
              <button
                onClick={() => {
                  onCloseMobile?.();
                  onOpenUserManagement();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors min-h-[44px]"
              >
                <Users className="w-4 h-4 text-[#c9a227]" />
                <span>Usuarios ({userProfile.role.toUpperCase()})</span>
              </button>
            )}

            {onOpenChangePassword && allow('btn_changepass') && (
              <button
                onClick={() => {
                  onOpenChangePassword();
                  onCloseMobile?.();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors min-h-[44px]"
              >
                <KeyRound className="w-4 h-4 text-[#c9a227]" />
                <span>Cambiar Contraseña</span>
              </button>
            )}

            {onOpenPostgreSql && allow('btn_pg_manager') && (
              <button
                onClick={() => {
                  onCloseMobile?.();
                  onOpenPostgreSql();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors min-h-[44px]"
              >
                <Database className="w-4 h-4 text-[#c9a227]" />
                <span>Base de Datos PostgreSQL</span>
              </button>
            )}

            {onToggleDarkMode && allow('btn_theme') && (
              <button
                onClick={() => {
                  onToggleDarkMode();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors min-h-[44px]"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-300" />}
                <span>{isDarkMode ? 'Cambiar a Modo Claro' : 'Activar Modo Oscuro'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Acciones Rápidas Inferiores en Sidebar */}
      {(!isCollapsed || isMobileView) && (
        <div className="p-3 m-3 rounded-xl bg-white/5 border border-white/10 space-y-2 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Zona Segura ISO 27001</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            Ámbito: <strong className="text-white">{userProfile.estadoAsignado || 'Nacional / Todos'}</strong>
          </p>
          {allow('btn_export_excel') && (
          <button
            onClick={() => {
              onExportExcel();
              if (isMobileView) onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#c9a227] hover:bg-[#d4af37] text-[#0b3d2e] rounded-lg text-xs font-black transition-all shadow-xs cursor-pointer min-h-[42px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel Flota</span>
          </button>
          )}
        </div>
      )}

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-white/10 text-center text-[10px] text-slate-400 font-mono shrink-0">
        {(!isCollapsed || isMobileView) ? 'GGPD · CORPOELEC 2026' : 'SEN'}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside 
        className={`hidden md:flex relative flex-col transition-all duration-300 border-r select-none shrink-0 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          isDarkMode 
            ? 'bg-[#0b241c] border-[#1a5f47] text-slate-100' 
            : 'bg-[#0b3d2e] border-[#c9a227]/40 text-white'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div 
            className={`relative flex-1 max-w-[300px] w-full flex flex-col shadow-2xl transition-transform ${
              isDarkMode 
                ? 'bg-[#0b241c] border-r border-[#1a5f47] text-slate-100' 
                : 'bg-[#0b3d2e] border-r border-[#c9a227]/40 text-white'
            }`}
          >
            {navContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
