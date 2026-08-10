import React from 'react';
import { 
  BarChart2, 
  CheckSquare, 
  Kanban, 
  AlertTriangle, 
  RefreshCw, 
  Target, 
  Upload, 
  FileText, 
  FolderSync, 
  Shield, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut, 
  Zap,
  Sparkles,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { SupabaseConfig, UserProfile } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalCompromisos: number;
  totalMinutasCount: number;
  currentProfile: UserProfile;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenUploader: () => void;
  onOpenMinutaHistory: () => void;
  onOpenDriveSync: () => void;
  onOpenUserManagement?: () => void;
  onOpenRoleSelector: () => void;
  onLogout?: () => void;
  onOpenIsoDocsExporter?: () => void;
  onOpenEmailReportConfig?: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  activeTab,
  setActiveTab,
  totalCompromisos,
  totalMinutasCount,
  currentProfile,
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenUploader,
  onOpenMinutaHistory,
  onOpenDriveSync,
  onOpenUserManagement,
  onOpenRoleSelector,
  onLogout,
  onOpenIsoDocsExporter,
  onOpenEmailReportConfig,
  isMobileOpen,
  setIsMobileOpen
}) => {

  const isElevatedUser = currentProfile?.role === 'admin' || currentProfile?.role === 'supervisor';

  const rawNavItems = [
    {
      id: 'dashboard',
      label: 'Resumen Ejecutivo',
      icon: BarChart2,
      badge: null
    },
    {
      id: 'compromisos',
      label: 'Compromisos Asignados',
      icon: CheckSquare,
      badge: totalCompromisos
    },
    {
      id: 'kanban',
      label: 'Flujo Kanban',
      icon: Kanban,
      badge: null
    },
    {
      id: 'pendientes',
      label: 'Pendientes por Área',
      icon: AlertTriangle,
      badge: null,
      adminOnly: true
    },
    {
      id: 'prtsen_poa',
      label: 'Alineación PRTSEN / POA',
      icon: RefreshCw,
      badge: null
    },
    {
      id: 'strategic_kpi',
      label: 'KGI / KPI v2.0 PM',
      icon: Target,
      badge: 'v2.0'
    },
  ];

  const navItems = rawNavItems.filter(item => !item.adminOnly || isElevatedUser);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-[#001D33] border-r border-slate-800 text-slate-200 flex flex-col justify-between transition-all duration-300 shadow-2xl ${
          // Mobile state
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop collapsed vs expanded state
          isCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-[#E30613] p-2 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="leading-tight transition-opacity duration-200">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-wider text-white">CORPOELEC</span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-400/30">
                    GGPD
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Gestión Planificación
                </p>
              </div>
            )}
          </div>

          {/* Desktop Toggle Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation & Actions */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Main Navigation Section */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 px-3 mb-2">
                Navegación Principal
              </h3>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E30613] text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {/* Badges */}
                    {(!isCollapsed || isMobileOpen) && item.badge !== null && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : typeof item.badge === 'number'
                            ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                            : 'bg-blue-600 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Action Modules Section */}
          <div className="pt-2 border-t border-slate-800/80">
            {(!isCollapsed || isMobileOpen) && (
              <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 px-3 mb-2">
                Herramientas & Módulos
              </h3>
            )}
            
            <div className="space-y-1">
              {/* Load Minuta IA */}
              <button
                onClick={() => {
                  onOpenUploader();
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                title="Cargar Minuta IA (PDF / Imagen / Texto)"
                className={`w-full flex items-center space-x-3 px-3 py-2.5 bg-gradient-to-r from-[#E30613] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center' : ''
                }`}
              >
                <Upload className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span>Cargar Minuta IA</span>}
              </button>

              {/* Minutas History */}
              <button
                onClick={() => {
                  onOpenMinutaHistory();
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                title="Histórico de Minutas Registradas"
                className={`w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span>Histórico Minutas</span>}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
                    {totalMinutasCount}
                  </span>
                )}
              </button>

              {/* Drive Sync */}
              <button
                onClick={() => {
                  onOpenDriveSync();
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                title="Sincronizar Google Drive (bk.ggpd.corpoelec)"
                className={`w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                  isCollapsed && !isMobileOpen ? 'justify-center' : ''
                }`}
              >
                <FolderSync className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
                {(!isCollapsed || isMobileOpen) && <span>Drive Sync</span>}
              </button>

              {/* Notificaciones & Drive Scheduled Reports (Solo Administradores y Supervisores) */}
              {isElevatedUser && onOpenEmailReportConfig && (
                <button
                  onClick={() => {
                    onOpenEmailReportConfig();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  title="Notificaciones Parametrizadas por Correo y Reporte Automático en Google Drive (Solo Admin/Supervisor)"
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-emerald-300 hover:text-white hover:bg-emerald-950/80 border border-emerald-800/50 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    isCollapsed && !isMobileOpen ? 'justify-center' : ''
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span>Correos & Drive Auto</span>}
                </button>
              )}

              {/* ISO Admin Users */}
              {(currentProfile.canManageUsers || currentProfile.role === 'admin') && onOpenUserManagement && (
                <button
                  onClick={() => {
                    onOpenUserManagement();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  title="Gestión de Usuarios, Permisos RBAC y Gobierno ISO 27001 / ISO 8000"
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-purple-300 hover:text-white hover:bg-purple-950/80 border border-purple-900/50 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    isCollapsed && !isMobileOpen ? 'justify-center' : ''
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span>Gestión Usuarios ISO</span>}
                </button>
              )}

              {/* ISO Google Docs Generator Button */}
              {onOpenIsoDocsExporter && (
                <button
                  onClick={() => {
                    onOpenIsoDocsExporter();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  title="Generador de Documentación ISO en Google Docs"
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-cyan-300 hover:text-white hover:bg-cyan-950/80 border border-cyan-800/50 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    isCollapsed && !isMobileOpen ? 'justify-center' : ''
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span>Documentos ISO (Docs)</span>}
                </button>
              )}

              {/* Supabase connection status */}
              <button
                onClick={() => {
                  onOpenSupabaseModal();
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                title="Estado de Conexión a Base de Datos"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  supabaseConfig.isConnected 
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 hover:bg-emerald-900/60' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <Database className={`w-4 h-4 shrink-0 ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {(!isCollapsed || isMobileOpen) && <span>Base de Datos</span>}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                  <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                )}
              </button>
            </div>
          </div>

        </div>

        {/* User Profile & Logout Bottom Box */}
        <div className="p-3 border-t border-slate-800/80 bg-[#001729]">
          <div className={`flex items-center justify-between ${isCollapsed && !isMobileOpen ? 'flex-col gap-2' : ''}`}>
            
            {/* User Info Button */}
            <button
              onClick={() => {
                onOpenRoleSelector();
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              title="Clic para cambiar de perfil"
              className="flex items-center space-x-2.5 text-left hover:bg-slate-800/80 p-1.5 rounded-xl transition-colors cursor-pointer overflow-hidden flex-1"
            >
              <div className="w-8 h-8 bg-red-600/20 text-[#E30613] rounded-xl flex items-center justify-center shrink-0 border border-red-500/30">
                <User className="w-4 h-4" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{currentProfile.name}</div>
                  <div className="text-[10px] text-cyan-300/80 font-medium uppercase truncate">
                    @{currentProfile.username} ({currentProfile.role})
                  </div>
                </div>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (isMobileOpen) setIsMobileOpen(false);
                if (onLogout) {
                  onLogout();
                } else {
                  onOpenRoleSelector();
                }
              }}
              title="Cerrar Sesión Definitiva"
              className="p-2 text-red-400 hover:text-white hover:bg-[#E30613] rounded-xl transition-all cursor-pointer shrink-0 border border-red-900/50"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

          {/* ISO Security Standards Compliance Footer */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>ISO 27001 / ISO 9001</span>
              </span>
              <span className="text-slate-400 font-medium">Entorno Segurado</span>
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
