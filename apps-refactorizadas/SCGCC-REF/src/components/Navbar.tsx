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
  Plus,
  GraduationCap,
  ChevronDown
} from 'lucide-react';

export type ActiveTabType = 'dashboard' | 'registro' | 'firmas' | 'briefing360' | 'plantillas' | 'guia';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close mobile drawer and user menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isUserMenuOpen]);

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
    setIsUserMenuOpen(false);
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
    {
      id: 'guia' as ActiveTabType,
      label: 'Guía Pedagógica SEN',
      shortLabel: 'Guía SEN',
      icon: GraduationCap,
      desc: 'Casos reales e inducción no-repudio',
      badge: 'Norma',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
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
        <div className="w-full bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white text-[11px] font-mono h-7 px-3 sm:px-4 lg:px-6 flex items-center justify-between tracking-wide select-none overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-black whitespace-nowrap text-amber-300 text-[10px] sm:text-[11px]">🛡️ ZONA SEGURA</span>
            <span className="hidden sm:inline text-purple-300">|</span>
            <span className="hidden md:inline text-purple-100 font-semibold truncate text-[10px] sm:text-[11px]">CORPOELEC GGPD • SCGCC V1.0</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-purple-200 shrink-0">
            <span className="hidden lg:inline font-bold text-emerald-300 whitespace-nowrap">ISO 27001 · OWASP</span>
            
            {/* QA / BD Governance Button in Top Technical Bar */}
            {(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPERVISOR' || user?.id === 'usr-blanca') && onOpenQAModal && (
              <button
                onClick={onOpenQAModal}
                title="Panel de Gobernanza de Datos & Sincronización QA (PostgreSQL)"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 text-[9px] sm:text-[10px] font-mono font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>QA / BD</span>
              </button>
            )}

            <span className="bg-purple-950/80 px-1.5 py-0.5 rounded text-white font-mono font-bold whitespace-nowrap border border-purple-400/30 text-[9px] sm:text-[10px]">PORT 3006</span>
          </div>
        </div>

        {/* Main Navbar Body - Fluid responsive container with no horizontal overflow */}
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2">
            
            {/* 1. Left Section: Mobile Hamburger + Brand & Logo Container */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Mobile / Tablet Hamburger Drawer Button (< xl) on Left */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all relative shrink-0"
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
                className="flex items-center gap-2 cursor-pointer group select-none shrink-0" 
                onClick={() => handleNavClick('dashboard')}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                      SCGCC <span className="text-purple-600 dark:text-purple-400">V1.0</span>
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-purple-600 dark:text-purple-400 font-bold leading-tight mt-0.5 whitespace-nowrap">
                    Despacho GGPD • Correspondencia
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Desktop Navigation Links (>= xl) - Ultra Compact & Fluid */}
            <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 flex-1 justify-center max-w-fit px-1">
              {navItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2 2xl:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1 whitespace-nowrap relative ${
                      isActive
                        ? item.id === 'briefing360'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs'
                          : item.id === 'guia'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs'
                          : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${item.id === 'briefing360' ? 'text-amber-500' : item.id === 'guia' ? 'text-emerald-500' : ''}`} />
                    <span className="hidden 2xl:inline">{item.label}</span>
                    <span className="2xl:hidden">{item.shortLabel}</span>
                    {item.badge && (
                      <span className={`ml-0.5 px-1 py-0.2 rounded-full text-[9px] font-bold ${item.badgeColor || 'bg-purple-200 text-purple-800'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* 3. Right Header Actions & User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Quick Radication Action Button */}
              <button
                onClick={onOpenRadicacionModal}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-xs">Radicar</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Modo Oscuro'}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                aria-label="Alternar Tema"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-purple-600" />
                )}
              </button>

              {/* User Profile Pill & Dropdown (Desktop >= xl) */}
              {user && (
                <div id="user-menu-container" className="hidden xl:relative xl:flex items-center pl-2 border-l border-slate-200 dark:border-slate-700 shrink-0">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-purple-900/60 group cursor-pointer"
                    aria-label="Abrir Perfil de Usuario"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs select-none group-hover:scale-105 transition-transform">
                      {getUserInitials(user.nombre)}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] 2xl:max-w-[160px] truncate">
                      {user.nombre}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-transform ${isUserMenuOpen ? 'rotate-180 text-purple-600' : ''}`} />
                  </button>

                  {/* Dropdown Menu Modal Popover */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/80 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fadeIn">
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                          {getUserInitials(user.nombre)}
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                            {user.nombre}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 truncate">
                            @{user.username}
                          </div>
                          <div className="inline-block px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[9px] font-mono font-bold uppercase mt-1">
                            {user.rol || 'USUARIO'}
                          </div>
                        </div>
                      </div>

                      {/* Cargo Institucional Completo */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/40 space-y-1.5 text-[11px]">
                        <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                          Cargo Institucional
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                          {user.cargo || 'Funcionario Corporativo'}
                        </div>
                        {user.dependencia && (
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium leading-tight pt-0.5">
                            {user.dependencia}
                          </div>
                        )}
                      </div>

                      {/* Security badge */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sesión Auditada ISO 27001</span>
                      </div>

                      {/* Prominent Clear Logout Button */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>Cerrar Sesión Institucional</span>
                      </button>
                    </div>
                  )}
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
