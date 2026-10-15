import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Sun, Moon, Users, History, Menu, Shield, KeyRound, Bell, ChevronDown, Database } from 'lucide-react';
import { getUserProfile } from '../data/defaultUsers';
import { passwordResetService } from '../services/passwordResetService';

interface TopHeaderProps {
  userEmail: string;
  onLogout?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUserManagement: () => void;
  onOpenBackupModal: () => void;
  onOpenChangePassword?: () => void;
  onOpenPasswordResets?: () => void;
  onOpenPostgreSql?: () => void;
  onOpenMobileMenu?: () => void;
  /** Verificación de permisos por rol. Si no se provee, todo está permitido. */
  can?: (actionId: string) => boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userEmail,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onOpenUserManagement,
  onOpenBackupModal,
  onOpenChangePassword,
  onOpenPasswordResets,
  onOpenPostgreSql,
  onOpenMobileMenu,
  can
}) => {
  const allow = (actionId: string) => (can ? can(actionId) : true);
  const userProfile = getUserProfile(userEmail);
  const [pendingResetsCount, setPendingResetsCount] = useState<number>(0);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCount = () => {
      setPendingResetsCount(passwordResetService.getPendingCount());
    };
    updateCount();
    const interval = setInterval(updateCount, 2500);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#0b3d2e] border-b-2 border-[#c9a227] shadow-md select-none">
      {/* Mobile & Desktop Main Top Bar */}
      <div className="px-2.5 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-2 text-white w-full max-w-full overflow-hidden">
        {/* Left: Mobile Menu Button & Brand Identification */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 overflow-hidden">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-1.5 sm:p-2 text-slate-200 hover:text-[#c9a227] hover:bg-white/10 rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center shrink-0"
              aria-label="Abrir Menú de Navegación"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Security Certification Stamp */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-emerald-200 font-mono">
            <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>ZONA SEGURA ISO 27001 · RBAC SEN</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 text-xs shrink-0">
          {/* Dark Mode Toggle */}
          {allow('btn_theme') && (
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-1 p-2 sm:px-2 sm:py-1.5 rounded-lg border border-[#c9a227]/50 transition-all cursor-pointer font-mono hover:brightness-110 min-h-[38px] sm:min-h-[40px] min-w-[38px] sm:min-w-[40px] justify-center"
            style={{
              background: isDarkMode ? '#13382b' : '#1a5f47',
              color: isDarkMode ? '#fbbf24' : '#ffffff'
            }}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Activar Modo Oscuro SEN"}
            aria-label="Cambiar modo de tema"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline text-[11px] font-semibold">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline text-[11px] font-semibold">Oscuro</span>
              </>
            )}
          </button>
          )}

          {/* Backup Shortcut (Desktop + Tablet) */}
          {allow('btn_backup') && (
          <button
            onClick={onOpenBackupModal}
            className="hidden sm:flex items-center gap-1.5 bg-[#1a5f47] hover:bg-[#13382b] px-2.5 py-1.5 rounded-lg border border-[#c9a227] transition-all cursor-pointer text-white font-bold text-[11px] shadow-xs min-h-[40px]"
            title="Sistema de respaldo automático y control de versiones"
          >
            <History className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Respaldos</span>
          </button>
          )}

          {/* User Management Shortcut (Desktop + Tablet) */}
          {allow('btn_users_mgmt') && (
          <button
            onClick={onOpenUserManagement}
            className="hidden sm:flex items-center gap-1.5 bg-[#1a5f47] hover:bg-[#13382b] px-2.5 py-1.5 rounded-lg border border-[#c9a227] transition-all cursor-pointer text-white font-bold text-[11px] shadow-xs min-h-[40px]"
            title="Gestionar roles y permisos"
          >
            <Users className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>{userProfile.role.toUpperCase()}</span>
          </button>
          )}

          {/* PostgreSQL Database Shortcut (Desktop + Tablet) */}
          {onOpenPostgreSql && allow('btn_pg_manager') && (
            <button
              onClick={onOpenPostgreSql}
              className="hidden lg:flex items-center gap-1.5 bg-[#1a5f47] hover:bg-[#13382b] px-2.5 py-1.5 rounded-lg border border-[#c9a227] transition-all cursor-pointer text-white font-bold text-[11px] shadow-xs min-h-[40px]"
              title="Esquema y Migración a Base de Datos PostgreSQL"
            >
              <Database className="w-3.5 h-3.5 text-[#c9a227]" />
              <span className="hidden xl:inline">PostgreSQL</span>
              <span className="xl:hidden">BD</span>
            </button>
          )}

          {/* Admin Password Reset Notifications (Solo para Administrador) */}
          {userProfile.role === 'admin' && allow('btn_password_resets') && onOpenPasswordResets && (
            <button
              onClick={onOpenPasswordResets}
              className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all cursor-pointer text-white font-bold text-[11px] shadow-xs min-h-[38px] sm:min-h-[40px] ${
                pendingResetsCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 border-amber-300 ring-2 ring-amber-400/50'
                  : 'hidden lg:flex bg-[#1a5f47] hover:bg-[#13382b] border-[#c9a227]'
              }`}
              title={pendingResetsCount > 0 ? `${pendingResetsCount} solicitud(es) de reinicio de clave pendientes` : "Bandeja de reinicio de claves"}
            >
              <Bell className={`w-3.5 h-3.5 ${pendingResetsCount > 0 ? 'text-amber-200 animate-bounce' : 'text-[#c9a227]'}`} />
              <span className="hidden sm:inline">Solicitudes</span>
              {pendingResetsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white text-slate-900 shadow-sm animate-pulse">
                  {pendingResetsCount}
                </span>
              )}
            </button>
          )}

          {/* Change Password Shortcut (Desktop + Tablet) */}
          {onOpenChangePassword && allow('btn_changepass') && (
            <button
              onClick={onOpenChangePassword}
              className="hidden sm:flex items-center gap-1.5 bg-[#1a5f47] hover:bg-[#13382b] px-2.5 py-1.5 rounded-lg border border-[#c9a227] transition-all cursor-pointer text-white font-bold text-[11px] shadow-xs min-h-[40px]"
              title="Cambiar contraseña de esta entidad"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#c9a227]" />
              <span className="hidden md:inline">Clave</span>
            </button>
          )}

          {/* User Profile Pill with Interactive Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#1a5f47] hover:bg-[#13382b] px-2 sm:px-2.5 py-1 rounded-lg border border-[#c9a227]/60 shadow-xs cursor-pointer min-h-[38px] sm:min-h-[40px] transition-all text-left"
              title="Ver cuenta, opciones y estado de sesión"
              aria-label="Perfil de usuario"
            >
              <span className="text-sm">{userProfile.avatar}</span>
              <span className="hidden md:inline font-mono text-[11px] truncate max-w-[120px]">
                {userProfile.nombre.split(' ')[0]}
              </span>
              {userProfile.estadoAsignado ? (
                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] bg-emerald-900 text-emerald-200 font-bold border border-emerald-500/40">
                  📍 {userProfile.estadoAsignado.toUpperCase()}
                </span>
              ) : (
                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-200 font-bold border border-blue-500/40">
                  🌐 NACIONAL
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-[#c9a227] transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu (Solo opciones de cuenta) */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border-2 border-[#c9a227] py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Info */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{userProfile.avatar}</span>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs truncate text-[#0b3d2e] dark:text-emerald-400">
                        {userProfile.nombre}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {userProfile.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                      ROL: {userProfile.role}
                    </span>
                    {userProfile.estadoAsignado ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        📍 {userProfile.estadoAsignado}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                        ÁMBITO NACIONAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="p-1 space-y-1">
                  {allow('btn_users_mgmt') && (
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onOpenUserManagement();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <Users className="w-4 h-4 text-[#c9a227]" />
                    <span>Gestión de Roles y Permisos</span>
                  </button>
                  )}

                  {onOpenChangePassword && allow('btn_changepass') && (
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenChangePassword();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <KeyRound className="w-4 h-4 text-[#c9a227]" />
                      <span>Cambiar Mi Contraseña</span>
                    </button>
                  )}

                  {onOpenPostgreSql && allow('btn_pg_manager') && (
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenPostgreSql();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left text-emerald-700 dark:text-emerald-400"
                    >
                      <Database className="w-4 h-4 text-[#c9a227]" />
                      <span>Base de Datos PostgreSQL</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Único Botón Canónico de Cierre de Sesión en el Sistema */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs border border-red-400 shadow-md transition-all cursor-pointer min-h-[38px] sm:min-h-[40px] shrink-0"
              title="Cerrar sesión segura del sistema SEN"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-white shrink-0" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden font-bold text-[11px]">Salir</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle Mobile Status Ticker (Informativo, sin botón duplicado) */}
      <div className="md:hidden px-3 py-1 bg-[#08281e] text-[10px] font-mono text-emerald-300 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-1 truncate">
          <span className="text-[#c9a227]">🛡️</span>
          <span className="truncate">ISO 27001 · {userProfile.estadoAsignado ? `Estado ${userProfile.estadoAsignado}` : 'Nacional'}</span>
        </div>
        <span className="text-[10px] text-emerald-400/80 font-semibold">{userProfile.role.toUpperCase()}</span>
      </div>
    </header>
  );
};
