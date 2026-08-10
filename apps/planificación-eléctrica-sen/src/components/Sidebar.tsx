import { LayoutDashboard, FolderKanban, Cpu, PieChart, Building2, Receipt, ShieldAlert, LucideIcon } from 'lucide-react';
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
}

export function Sidebar({ activeTab, setActiveTab, userRole = 'ADMINISTRADOR' }: SidebarProps) {
  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'prtsen', label: 'Proyectos PRTSEN (823)', icon: FolderKanban },
    { id: 'rds', label: 'Codificación RDS-PS', icon: Cpu, badge: 'IEC 81346' },
    { id: 'poa', label: 'POA & Presupuesto', icon: PieChart },
    { id: 'ggd', label: 'Convenios GGD Directos', icon: Building2, badge: 'Local' },
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

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Módulos del Sistema SAMC
        </p>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-corpo-blue text-white border-l-4 border-l-corpo-accent font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-corpo-accent' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-semibold border ${
                  isActive 
                    ? 'bg-corpo-dark/50 text-white border-corpo-dark'
                    : 'bg-corpo-accent/20 text-corpo-dark dark:bg-corpo-accent/10 dark:text-corpo-accent border-corpo-accent/50'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Rol Conectado:</span>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
              userRole === 'ADMINISTRADOR'
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                : userRole === 'ESPECIALISTA'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
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
    </aside>
  );
}

