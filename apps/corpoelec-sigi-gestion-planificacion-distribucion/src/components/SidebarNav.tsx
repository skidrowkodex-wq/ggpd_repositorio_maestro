import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StateSelector } from './StateSelector';
import { 
  LayoutGrid, 
  FileText, 
  BarChart3, 
  Cloud, 
  Users,
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldCheck, 
  MapPin, 
  User, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface SidebarNavProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { session, logout, theme, toggleTheme } = useAuth();

  const navItems = [
    { id: 'apps', label: '1. Lanzador de Apps', icon: LayoutGrid, desc: '4 Apps Maestras GGPD' },
    { id: 'minutas', label: '2. Minutario Técnico', icon: FileText, desc: 'Acuerdos e Inventarios' },
    { id: 'dashboards', label: '3. Dashboards Procesos', icon: BarChart3, desc: 'Indicadores ISO/SAP' },
    { id: 'drive', label: '4. Visor Google Drive', icon: Cloud, desc: 'Documentos Nube' },
    { id: 'usuarios', label: '5. Gestión Usuarios SSO', icon: Users, desc: 'Directorio & Permisos' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container (Desktop Sidebar / Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#060d1a]/95 backdrop-blur-xl transition-all duration-300 shadow-xl ${
          // Mobile Drawer Behavior
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${
          // Desktop Collapsed Behavior
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-br dark:from-[#00f2fe] dark:to-[#ffd700] dark:text-[#0a192f] font-black text-sm shadow-md">
              SIGI
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">CORPOELEC</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">GGPD Planificación</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expandir Menú Lateral" : "Colapsar Menú Lateral"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* State Selector & User Status Info */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-[#081427] border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Estado Asignado</span>
              <span className="font-mono font-bold text-[#002b49] dark:text-[#ffd700]">{session.stateCode}</span>
            </div>
            <StateSelector />
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileOpen(false);
                }}
                title={item.label}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-2xl transition-all group font-bold text-xs ${
                  isActive
                    ? 'bg-[#002b49] text-white dark:bg-[#00f2fe]/20 dark:text-[#00f2fe] shadow-md'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${
                  isActive ? 'text-white dark:text-[#00f2fe]' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                }`} />
                
                {(!isCollapsed || isMobileOpen) && (
                  <div className="text-left truncate">
                    <span className="block truncate leading-tight font-extrabold">{item.label}</span>
                    <span className={`text-[10px] font-semibold block truncate ${
                      isActive ? 'text-blue-100 dark:text-[#00f2fe]/80' : 'text-slate-600 dark:text-slate-300'
                    }`}>{item.desc}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#081427] text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${
              isCollapsed && !isMobileOpen ? 'justify-center' : ''
            }`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4 text-[#002b49] shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>Azul SEN (Modo Oscuro)</span>}
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>Blanco Corporativo</span>}
              </>
            )}
          </button>

          {/* User Profile & Logout */}
          <div className={`flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#081427] ${
            isCollapsed && !isMobileOpen ? 'flex-col gap-2' : ''
          }`}>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center space-x-2 truncate">
                <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-300 dark:border-emerald-500/40">
                  {session.role[0]}
                </div>
                <div className="truncate text-left">
                  <span className="text-xs font-black text-slate-900 dark:text-white block truncate">{session.role}</span>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold block">✓ ISO 27001</span>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
