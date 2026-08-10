import React from 'react';
import { 
  FileText, 
  Search, 
  Upload, 
  ChevronDown, 
  Menu, 
  User, 
  LogOut, 
  Layers,
  ShieldCheck
} from 'lucide-react';
import { MinutaReunion, UserProfile } from '../types';

interface NavbarProps {
  onOpenUploader: () => void;
  onOpenMinutaHistory: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeMinuta: MinutaReunion | null;
  totalMinutasCount: number;
  totalCompromisos: number;
  currentProfile: UserProfile;
  onOpenRoleSelector: () => void;
  onLogout?: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUploader,
  onOpenMinutaHistory,
  searchQuery,
  setSearchQuery,
  activeMinuta,
  totalMinutasCount,
  totalCompromisos,
  currentProfile,
  onOpenRoleSelector,
  onLogout,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="bg-[#002B49] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left Side: Mobile Menu Button + Active Minuta Selector */}
          <div className="flex items-center space-x-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-900 rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Minuta Selection Selector Button */}
            <button
              onClick={onOpenMinutaHistory}
              className="bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs transition-all shadow-xs group cursor-pointer shrink min-w-0"
              title="Seleccionar Minuta de Trabajo Activa"
            >
              <FileText className="w-4 h-4 text-[#E30613] shrink-0" />
              <div className="text-left min-w-0 hidden sm:block">
                <div className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">
                  Minuta Activa ({totalMinutasCount})
                </div>
                <div className="font-bold text-white flex items-center space-x-1.5 truncate">
                  <span className="truncate">
                    {activeMinuta ? `#${activeMinuta.numero} (${activeMinuta.fecha})` : 'Consolidado General (Todas)'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
                </div>
              </div>
              <span className="bg-[#E30613] text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0">
                {totalCompromisos}
              </span>
            </button>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por responsable, compromiso u observaciones..."
                className="w-full bg-slate-900/90 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Right Side: ISO Compliance Badge + Quick Action + Active User Profile & Logout */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* ISO Security Compliance Pill */}
            <div 
              className="hidden xl:flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-xs"
              title="Sistema Certificado Cumpliendo Estándares ISO 27001 (Seguridad), ISO 9001 (Calidad) e ISO 8000 (Datos)"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Entorno Seguro ISO 27001/9001</span>
            </div>

            {/* Quick Upload Button */}
            <button
              onClick={onOpenUploader}
              className="hidden lg:flex items-center space-x-1.5 bg-[#E30613] hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ring-1 ring-red-500/30 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Minuta IA</span>
            </button>

            {/* Active Profile Pill */}
            <button
              onClick={onOpenRoleSelector}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer shadow-xs group shrink-0"
              title="Perfil Activo - Clic para cambiar de usuario"
            >
              <div className="p-1 bg-red-600/20 text-[#E30613] rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  Perfil Activo
                </div>
                <div className="text-[11px] font-bold text-slate-200 flex items-center space-x-1">
                  <span className="truncate max-w-[100px]">{currentProfile.name}</span>
                  <span className="bg-red-500/20 text-red-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-red-500/30 uppercase">
                    {currentProfile.role}
                  </span>
                </div>
              </div>
            </button>

            {/* Dedicated Logout / Switch User Button */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  onOpenRoleSelector();
                }
              }}
              className="flex items-center space-x-1.5 bg-red-950/80 hover:bg-[#E30613] text-red-200 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-bold border border-red-800/80 hover:border-red-600 transition-all cursor-pointer shadow-xs shrink-0"
              title="Cerrar Sesión Definitiva"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400 hover:text-white" />
              <span className="hidden xl:inline">Cerrar Sesión</span>
            </button>

          </div>

        </div>

        {/* Mobile Search input row on small screens */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar compromiso o responsable..."
              className="w-full bg-slate-900/90 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 placeholder-slate-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
