import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Mail, 
  ShieldCheck, 
  FileText,
  Building2,
  FileCheck2,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Layers,
  Menu,
  X,
  ChevronRight,
  Shield,
  Clock,
  User,
  Plus
} from 'lucide-react';

export type ActiveTabType = 'dashboard' | 'registro' | 'firmas' | 'briefing360' | 'plantillas';

interface NavbarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenRadicacionModal: () => void;
  pendingSignaturesCount?: number;
  onOpenQAModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  onOpenRadicacionModal,
  pendingSignaturesCount = 0,
  onOpenQAModal
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTabType,
      label: 'Tablero SLAs',
      shortLabel: 'SLAs',
      icon: LayoutDashboard,
      desc: 'Monitoreo de tiempos y metas',
      badge: null
    },
    {
      id: 'registro' as ActiveTabType,
      label: 'Libro de Radicación',
      shortLabel: 'Radicación',
      icon: BookOpen,
      desc: 'Entrada, Salida y Trazabilidad',
      badge: null
    },
    {
      id: 'firmas' as ActiveTabType,
      label: 'Bandeja de Firmas',
      shortLabel: 'Firmas',
      icon: FileCheck2,
      desc: 'Oficios, Dictámenes y Despacho',
      badge: pendingSignaturesCount > 0 ? pendingSignaturesCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 animate-pulse'
    },
    {
      id: 'briefing360' as ActiveTabType,
      label: 'Ficha 360°',
      shortLabel: 'Ficha 360°',
      icon: Sparkles,
      desc: 'Auditoría express < 3s',
      badge: '3 Seg',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
    },
    {
      id: 'plantillas' as ActiveTabType,
      label: 'Plantillas 2026',
      shortLabel: 'Plantillas',
      icon: Layers,
      desc: 'Formatos oficiales CORPOELEC',
      badge: null
    },
  ];

  const getUserInitials = (name?: string) => {
    if (!name) return 'US';
    const parts = name.replace(/^(Ing\.|Lic\.|Lcdo\.|Lcda\.|T\.S\.U\.|Dr\.|Dra\.)\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-md bg-white dark:bg-[#072146] border-b border-purple-200 dark:border-purple-900/40 transition-colors duration-200">
        {/* Top Technical Bar (GGPD Industrial Security Standard) */}
        <div className="w-full bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white text-[11px] font-mono h-7 px-3 sm:px-6 lg:px-8 flex items-center justify-between tracking-wide select-none">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-black whitespace-nowrap text-amber-300">🛡️ ZONA SEGURA DE GRADO INDUSTRIAL</span>
            <span className="hidden md:inline text-purple-300">|</span>
            <span className="hidden lg:inline text-purple-100 font-semibold truncate">CORPOELEC GGPD • SCGCC V1.0 • PROCESO GGPD-SEC-01</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-purple-200 shrink-0">
            <span className="hidden sm:inline font-bold text-emerald-300 whitespace-nowrap">ISO 27001 · ISO 8000 · OWASP</span>
            <span className="hidden md:inline text-purple-300">·</span>
            <span className="hidden md:inline whitespace-nowrap">ISO 15489</span>
            <span className="bg-purple-950/80 px-2 py-0.5 rounded text-white font-mono font-bold whitespace-nowrap border border-purple-400/30">PORT 3006</span>
          </div>
        </div>

        {/* Main Navbar Body - Full fluid width with safety padding */}
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* 1. Left Section: Mobile Hamburger + Brand & Logo Container */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile / Tablet Hamburger Drawer Button (< xl) on Left */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all relative shrink-0"
                aria-label="Abrir Menú de Navegación"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
                {pendingSignaturesCount > 0 && !isMobileMenuOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white dark:border-[#072146] rounded-full animate-ping" />
                )}
              </button>

              {/* Logo & Brand Title */}
              <div 
                className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0" 
                onClick={() => handleNavClick('dashboard')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                      SCGCC <span className="text-purple-600 dark:text-purple-400">V1.0</span>
                    </span>
                    <span className="hidden sm:inline-block text-[10px] bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-800 leading-none shrink-0">
                      Despacho GGP
                    </span>
                  </div>
                  <p className="hidden 2xl:block text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 whitespace-nowrap">
                    Seguimiento y Control de Correspondencia
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Desktop Navigation Links (>= xl) - Adaptive labels */}
            <nav className="hidden xl:flex items-center gap-1 shrink-0">
              {navItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap relative ${
                      isActive
                        ? item.id === 'briefing360'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs'
                          : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${item.id === 'briefing360' ? 'text-amber-500' : ''}`} />
                    <span className="hidden 2xl:inline">{item.label}</span>
                    <span className="2xl:hidden">{item.shortLabel}</span>
                    {item.badge && (
                      <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-purple-200 text-purple-800'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* 3. Right Header Actions & User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Quick Radication Action Button */}
              <button
                onClick={onOpenRadicacionModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden 2xl:inline">Radicar Entrada</span>
                <span className="2xl:hidden text-xs">Radicar</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Cambiar a Tema Claro Corporativo' : 'Cambiar a Modo Oscuro Azul SEN'}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                aria-label="Alternar Tema"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-purple-600" />
                )}
              </button>

              {/* QA / BD Governance Button (Admin & Supervisor) */}
              {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERVISOR' || user?.id === 'usr-blanca') && onOpenQAModal && (
                <button
                  onClick={onOpenQAModal}
                  title="Panel de Gobernanza de Datos & Sincronización QA (PostgreSQL)"
                  className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="hidden sm:inline">QA / BD</span>
                </button>
              )}

              {/* User Profile Pill & Logout (Desktop >= xl) */}
              {user && (
                <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-300 dark:border-purple-800 shrink-0 shadow-xs select-none">
                    {getUserInitials(user.nombre)}
                  </div>
                  <div className="text-right max-w-[100px] 2xl:max-w-[150px] truncate">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate" title={user.nombre}>
                      {user.nombre}
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate leading-tight mt-0.5" title={user.cargo}>
                      {user.cargo}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    title="Cerrar sesión"
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors shrink-0"
                    aria-label="Cerrar Sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 📱 COLLAPSIBLE LEFT DRAWER (Offcanvas Deslizante a la Izquierda) */}
      {/* ========================================================================= */}
      <div 
        className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop Overlay with Blur */}
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Left Slide-over Panel */}
        <div 
          className={`fixed inset-y-0 left-0 max-w-xs sm:max-w-sm w-full bg-white dark:bg-[#072146] border-r border-purple-200 dark:border-purple-900/60 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#041426]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    SCGCC <span className="text-purple-600 dark:text-purple-400">V1.0</span>
                  </span>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold font-mono">
                    PROCESO GGPD-SEC-01
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authenticated User Card in Drawer */}
            {user && (
              <div className="mt-3.5 p-2.5 rounded-xl bg-white dark:bg-[#072146] border border-purple-100 dark:border-purple-900/40 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-300 dark:border-purple-800">
                  {getUserInitials(user.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user.nombre}
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate">
                    {user.cargo}
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                  ONLINE
                </span>
              </div>
            )}
          </div>

          {/* Drawer Navigation Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Módulos del Sistema
            </div>

            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isActive
                      ? item.id === 'briefing360'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm'
                        : 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isActive 
                        ? item.id === 'briefing360' 
                          ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200' 
                          : 'bg-purple-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-950 group-hover:text-purple-600'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-purple-200 text-purple-800'}`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-purple-600 dark:text-purple-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                </button>
              );
            })}

            {/* Quick Action in Drawer */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRadicacionModal();
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Radicar Nueva Entrada Digital</span>
              </button>
            </div>

            {/* Technical Governance Info */}
            <div className="mt-4 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-[10px] font-mono text-purple-700 dark:text-purple-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gobernanza & Normativa GGPD</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-sans text-[10px]">
                Base de Datos PostgreSQL (Esquema <code className="text-purple-600 font-mono">scgcc</code>) • Trazabilidad ISO 15489 & Cripto SHA-256.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#041426]/50 space-y-2">
            {/* QA Governance Button in Drawer */}
            {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERVISOR' || user?.id === 'usr-blanca') && onOpenQAModal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenQAModal();
                }}
                className="w-full p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Panel QA & Control BD</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-purple-200 dark:bg-purple-900 px-1.5 py-0.5 rounded">PostgreSQL</span>
              </button>
            )}

            {/* Theme Toggle Selector Row */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#072146] border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>Modo Visual</span>
              </span>
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-300 hover:bg-slate-200 transition-colors"
              >
                {theme === 'dark' ? 'Azul SEN (Noche)' : 'Claro Corporativo'}
              </button>
            </div>

            {/* Logout Button */}
            {user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión Institucional</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
