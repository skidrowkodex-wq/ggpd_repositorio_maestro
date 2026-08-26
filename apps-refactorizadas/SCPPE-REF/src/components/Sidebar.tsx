import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Cpu, 
  PieChart, 
  Building2, 
  Receipt, 
  ShieldAlert, 
  LucideIcon,
  X 
} from 'lucide-react';
import { RolUsuario } from '../types';

export type TabType = 'dashboard' | 'prtsen' | 'rds' | 'poa' | 'ggd' | 'viaticos' | 'auditoria';

interface NavItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
}

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole?: RolUsuario;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole = 'ADMINISTRADOR',
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'prtsen', label: 'Proyectos PRTSEN', icon: FolderKanban },
    { id: 'rds', label: 'Codificación RDS-PS', icon: Cpu, badge: 'IEC 81346' },
    { id: 'poa', label: 'POA & Presupuesto', icon: PieChart },
    { id: 'ggd', label: 'Convenios GGD Directos', icon: Building2 },
    { id: 'viaticos', label: 'Control de Viáticos', icon: Receipt },
    { id: 'auditoria', label: 'Auditoría ISO 27001', icon: ShieldAlert, adminOnly: true },
  ];

  // Filter for ANALISTA: hide adminOnly panels like ISO 27001 Audit log administration
  const navItems = allNavItems.filter((item) => {
    if (userRole === 'ANALISTA' && item.adminOnly) {
      return false;
    }
    return true;
  });

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors w-64 select-none">
      
      {/* Header del Sidebar Móvil con botón cerrar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Módulos del Sistema SAMC
        </p>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navegación Principal */}
      <nav className="p-2.5 sm:p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-corpo-blue text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  isActive 
                    ? 'bg-corpo-dark text-amber-300 border-corpo-dark'
                    : 'bg-corpo-accent/20 text-corpo-dark dark:bg-corpo-accent/10 dark:text-corpo-accent border-corpo-accent/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer del Sidebar con Auditoría y Esquema */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/50 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Rol Conectado:</span>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
              userRole === 'ADMINISTRADOR'
                ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                : userRole === 'ESPECIALISTA'
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
            }`}
          >
            {userRole}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Esquema BD:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">samc / maestro</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Versión Escritorio Pinned (Visible a partir de lg:) */}
      <aside className="hidden lg:flex shrink-0 min-h-[calc(100vh-3.5rem)]">
        {sidebarContent}
      </aside>

      {/* Versión Drawer Móvil / Tablet (Visible en pantallas < lg cuando isMobileOpen es true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop con blur */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Contenido Drawer */}
          <div className="relative z-50 shadow-2xl h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
