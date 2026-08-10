import React, { useState } from 'react';
import { 
  Zap, 
  LogOut, 
  UserCheck, 
  Shield, 
  MapPin, 
  Database, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  FileSpreadsheet,
  Boxes,
  Wrench,
  ShieldCheck,
  Users,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { getStateName } from '../constants/states';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN_NACIONAL':
        return <span className="bg-sky-100 text-sky-800 dark:bg-sky-950/90 dark:text-sky-300 border border-sky-300 dark:border-sky-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">ADMIN NACIONAL</span>;
      case 'ANALISTA_ESTATAL':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/90 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">ANALISTA ESTATAL</span>;
      case 'AUDITOR':
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-950/90 dark:text-purple-300 border border-purple-300 dark:border-purple-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">AUDITOR ISO</span>;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: '1. Dashboard KPIs', shortLabel: 'KPIs', icon: LayoutDashboard },
    { id: 'ingestion', label: '2. Ingesta Excel (ISO 8000)', shortLabel: 'Ingesta', icon: FileSpreadsheet },
    { id: 'inventory', label: '3. Inventario Equipos', shortLabel: 'Inventario', icon: Boxes },
    { id: 'remediation', label: '4. Remediación Automática', shortLabel: 'Remediación', icon: Wrench },
    { id: 'audit', label: '5. Auditoría & Manuales', shortLabel: 'Auditoría', icon: ShieldCheck },
    ...(user?.role === 'ADMIN_NACIONAL' ? [{ id: 'users', label: '6. Gestión Usuarios', shortLabel: 'Usuarios', icon: Users }] : [])
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP BAR (< lg) */}
      <header className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition focus:outline-none"
            aria-label="Abrir menú de navegación"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-600 via-sky-500 to-red-600 flex items-center justify-center text-white font-black shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">SCEIN</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-cyan-300 font-mono border border-sky-200 dark:border-slate-700 font-bold">CORPOELEC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.state_code && (
            <span className="text-[11px] font-mono text-sky-800 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/80 border border-sky-200 dark:border-cyan-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
              <MapPin className="w-3 h-3" />
              {user.state_code}
            </span>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center transition"
            title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro Corporativo'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-sky-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold flex items-center gap-1 transition"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY (< lg) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between p-4 shadow-2xl z-10 animate-slideRight text-slate-900 dark:text-slate-100">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-600 via-sky-500 to-red-600 flex items-center justify-center text-white shadow-md">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">SCEIN</span>
                    <p className="text-[10px] text-sky-800 dark:text-slate-400 font-bold">CORPOELEC GGPD</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User profile card */}
              {user && (
                <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 rounded-xl p-3 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{user.full_name}</div>
                      <div className="text-[11px] text-sky-800 dark:text-sky-400 font-mono font-bold">@{user.username}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    {getRoleBadge(user.role)}
                    {user.state_code ? (
                      <span className="text-[10px] text-sky-800 dark:text-cyan-300 font-mono flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-bold">
                        <MapPin className="w-3 h-3" /> {getStateName(user.state_code)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-medium">
                        <Shield className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Cobertura Nacional
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <nav className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 mb-2">Navegación del Sistema</p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full px-3 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-800 to-sky-700 dark:from-sky-600 dark:to-cyan-600 text-white font-bold shadow-md shadow-sky-900/15'
                          : 'text-slate-700 hover:text-sky-900 hover:bg-sky-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout at bottom of drawer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-mono">
                <span>Esquema DB:</span>
                <span className="text-sky-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" /> scei
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP COLLAPSIBLE SIDEBAR (>= lg) */}
      <aside 
        className={`hidden lg:flex flex-col justify-between bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen transition-all duration-300 z-30 shrink-0 select-none shadow-sm ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Top Branding & Collapse Button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-600 via-sky-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/20 shrink-0">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">SCEIN</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-cyan-300 font-mono border border-sky-200 dark:border-slate-700 font-bold">GGPD</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">CORPOELEC Nacional</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-600 via-sky-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/20">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shrink-0"
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Summary */}
          {user && (
            <div className={`bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 rounded-xl p-2.5 transition-all shadow-sm ${isCollapsed ? 'text-center' : 'space-y-2'}`}>
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{user.full_name}</div>
                      <div className="text-[11px] text-sky-800 dark:text-sky-400 font-mono font-bold">@{user.username}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
                    {getRoleBadge(user.role)}
                    {user.state_code ? (
                      <span className="text-[10px] text-sky-800 dark:text-cyan-300 font-mono flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-bold">
                        <MapPin className="w-3 h-3" /> {getStateName(user.state_code)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-medium">
                        <Shield className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Nacional
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-400 flex items-center justify-center" title={`${user.full_name} (@${user.username})`}>
                  <UserCheck className="w-4 h-4" />
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 mb-2">Módulos del Sistema</p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-800 via-sky-700 to-sky-600 dark:from-sky-600 dark:to-cyan-600 text-white font-extrabold shadow-md shadow-sky-900/15 border border-sky-800/30 dark:border-transparent'
                      : 'text-slate-700 dark:text-slate-300 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-slate-800/70'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with DB Schema & Theme & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-mono">
                <span>Esquema DB:</span>
                <span className="text-sky-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" /> scei
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-600" />
                    <span>Modo Oscuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modo Claro Corporativo</span>
                  </>
                )}
              </button>

              <button
                onClick={logout}
                className="w-full py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center transition"
                title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro Corporativo'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-sky-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                onClick={logout}
                className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-xs font-semibold flex items-center justify-center transition"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

