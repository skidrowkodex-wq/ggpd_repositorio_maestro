import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../lib/themeContext';
import { dataBackend } from '../lib/insforgeClient';
import {
  type LucideIcon,
  LogOut,
  Zap,
  User,
  Lock,
  Activity,
  Layers,
  MapPin,
  GitBranch,
  Sun,
  Moon,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Footer } from './Footer';

/** Pestañas funcionales de SIGA-SEN. */
export type SigaSenTab = 'activos' | 'generacion' | 'diagnostico' | 'atlas' | 'unifilar_activo';

interface TabDef {
  id: SigaSenTab;
  label: string;
  emoji: string;
  icon: LucideIcon;
  accent?: 'cyan';
  badge?: string;
}

const TABS: TabDef[] = [
  { id: 'activos', label: 'Nodos y Patios SEN', emoji: '⚡', icon: Layers },
  { id: 'generacion', label: 'Centrales de Generación', emoji: '🏭', icon: Zap },
  { id: 'diagnostico', label: 'Balance SEN & MVA/MVAr', emoji: '📊', icon: Activity },
  { id: 'atlas', label: 'Atlas Unifilar CND', emoji: '🗺️', icon: MapPin },
  { id: 'unifilar_activo', label: 'Diagrama Unifilar del Activo', emoji: '📐', icon: GitBranch, accent: 'cyan', badge: 'Nuevo' },
];

// Etiqueta del backend de datos activo (PostgreSQL local offline vs InsForge Cloud).
const BACKEND_TEXT =
  dataBackend.mode === 'local'
    ? 'POSTGRESQL LOCAL: cnd_sen_unifilar_2025 · ONLINE'
    : 'INSFORGE CLOUD: ggpd-data-maestra-0002 · ONLINE';

const BrandMark: React.FC<{ small?: boolean }> = ({ small }) => (
  <div
    className={`${small ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/25 shrink-0`}
  >
    <Zap className={`${small ? 'w-5 h-5' : 'w-6 h-6'} text-white fill-current`} />
  </div>
);

const NormativeBar: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-sky-900/30 text-slate-700 dark:text-sky-400 transition-colors">
    <div
      className={`app-container py-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 ${compact ? 'text-[10px]' : 'text-xs'}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-slate-900 dark:text-sky-300 truncate">
          <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
          {compact ? 'ZONA SEGURA SEN · CND 2025' : 'ZONA SEGURA DE GRADO INDUSTRIAL SEN · CND 2025'}
        </span>
        <span className="hidden sm:inline text-slate-400 dark:text-slate-600">|</span>
        <span className="hidden sm:inline text-slate-600 dark:text-slate-400 font-mono text-[11px]">
          ISO 55000 · ISO 8000 · ISO 27001 · PORT 3008
        </span>
      </div>
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono text-[10px] sm:text-[11px] min-w-0">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span className="truncate">{BACKEND_TEXT}</span>
      </div>
    </div>
  </div>
);

interface AppShellProps {
  activeTab: SigaSenTab;
  setActiveTab: (t: SigaSenTab) => void;
  children: React.ReactNode;
}

/**
 * Estructura (chrome) de SIGA-SEN.
 *  - Escritorio / TV / monitor / tablet  (≥ 1024px): rail lateral colapsable.
 *  - Teléfono / tablet estrecha (< 1024px): barra superior + drawer off-canvas.
 * Nivel 0 (blindaje anti-rotura) + Nivel 1 (sala/tablet) del plan responsive.
 */
export const AppShell: React.FC<AppShellProps> = ({ activeTab, setActiveTab, children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cerrar el drawer con Escape y bloquear el scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  const selectTab = (t: SigaSenTab) => {
    setActiveTab(t);
    setDrawerOpen(false);
  };

  // Botón de navegación reutilizado por el rail lateral y por el drawer.
  const renderNavItem = (t: TabDef, collapsedView: boolean) => {
    const Icon = t.icon;
    const isActive = activeTab === t.id;
    const isCyan = t.accent === 'cyan';
    const activeCls = isCyan
      ? 'bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white font-bold shadow-md shadow-cyan-500/20'
      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-md shadow-amber-500/20';
    const idleCls =
      'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white';
    return (
      <button
        key={t.id}
        onClick={() => selectTab(t.id)}
        title={collapsedView ? `${t.emoji} ${t.label}` : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={`group w-full flex items-center rounded-xl transition-all cursor-pointer touch-target ${
          collapsedView ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
        } ${isActive ? activeCls : idleCls}`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${!isActive && isCyan ? 'text-cyan-600 dark:text-cyan-400' : ''}`} />
        {!collapsedView && (
          <span className="flex items-center gap-1.5 min-w-0 text-left text-sm leading-tight">
            <span className="truncate">
              {t.emoji} {t.label}
            </span>
            {t.badge && (
              <span className="shrink-0 text-[9px] px-1 py-0.5 rounded bg-cyan-600 text-white font-black uppercase">
                {t.badge}
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  const userInitial = (user?.full_name || 'S').trim().charAt(0).toUpperCase();

  const themeButton = (collapsedView: boolean) => (
    <button
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a Modo Oscuro (Azul SEN)' : 'Cambiar a Modo Claro Corporativo'}
      className={`flex items-center rounded-xl text-xs font-semibold border transition-all cursor-pointer bg-white hover:bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-xs touch-target ${
        collapsedView ? 'w-full justify-center py-2.5' : 'w-full gap-2 px-3 py-2.5'
      }`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4 text-sky-600 shrink-0" />
          {!collapsedView && <span className="font-mono text-[11px]">Modo Oscuro</span>}
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          {!collapsedView && <span className="font-mono text-[11px]">Modo Claro</span>}
        </>
      )}
    </button>
  );

  const footerActions = (collapsedView: boolean) => (
    <div className="mt-auto border-t border-slate-200 dark:border-sky-950/60 p-3 space-y-2">
      {!collapsedView && (
        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 leading-tight px-1">
          ISO 55000 · ISO 8000 · ISO 27001
          <br />
          OWASP ASVS L2 · ISACA COBIT 2019
        </p>
      )}
      {themeButton(collapsedView)}

      {user && !collapsedView && (
        <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-300 dark:border-sky-900/40">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
              {user.full_name}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono leading-tight truncate">
              {user.role} · CND NACIONAL
            </div>
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 ${collapsedView ? 'flex-col' : ''}`}>
        <button
          onClick={logout}
          title="Cerrar Sesión Segura"
          className={`flex items-center justify-center gap-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer touch-target ${
            collapsedView ? 'w-full py-2.5' : 'flex-1 px-3 py-2.5'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsedView && <span className="text-xs font-semibold">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );

  const brandBlock = (collapsedView: boolean) =>
    collapsedView ? (
      <div className="h-20 flex items-center justify-center border-b border-slate-200 dark:border-sky-950/60">
        <BrandMark />
      </div>
    ) : (
      <div className="h-20 px-4 flex items-center gap-3 border-b border-slate-200 dark:border-sky-950/60 min-w-0">
        <BrandMark />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">SIGA-SEN</span>
          </div>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
            v1.0 NACIONAL CND
          </span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors">
      {/* ------------------------------------------------------------------ */}
      {/* RAIL LATERAL — escritorio / TV / monitor / tablet (≥ 1024px)        */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Navegación principal"
        className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:self-start bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-r border-slate-300 dark:border-sky-950/60 transition-[width] duration-300 ${
          collapsed ? 'lg:w-20 lg:basis-20 lg:min-w-0' : 'lg:w-72 lg:basis-72 lg:min-w-0'
        }`}
      >
        {brandBlock(collapsed)}
        <nav className="flex-1 overflow-y-auto thin-scroll p-3 space-y-1.5" aria-label="Pestañas">
          {TABS.map((t) => renderNavItem(t, collapsed))}
        </nav>
        {footerActions(collapsed)}
        {/* Botón de colapso del rail */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          className="flex items-center justify-center gap-2 py-2.5 border-t border-slate-200 dark:border-sky-950/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer touch-target"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-[11px] font-semibold">Colapsar menú</span>}
        </button>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* COLUMNA DE CONTENIDO                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra superior móvil / tablet estrecha (< 1024px) */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-slate-300 dark:border-sky-950/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs">
          <NormativeBar compact />
          <div className="app-container py-2.5 flex items-center justify-between gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={drawerOpen}
              className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer touch-target flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <BrandMark small />
              <div className="min-w-0">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">SIGA-SEN</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Gestión de Activos del SEN · CND</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer touch-target flex items-center justify-center"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-sky-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
              {user && (
                <div
                  title={`${user.full_name} · ${user.role}`}
                  className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold border border-amber-500/40"
                >
                  {userInitial}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Barra técnica normativa — escritorio (≥ 1024px) */}
        <div className="hidden lg:block sticky top-0 z-30">
          <NormativeBar />
        </div>

        <main className="flex-1 app-container py-6">{children}</main>

        <Footer />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DRAWER OFF-CANVAS — teléfono / tablet estrecha (< 1024px)           */}
      {/* ------------------------------------------------------------------ */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-backdrop-in"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-slate-950 border-r border-slate-300 dark:border-sky-950/60 shadow-2xl flex flex-col animate-drawer-in">
            <div className="h-20 px-4 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-sky-950/60">
              <div className="flex items-center gap-3 min-w-0">
                <BrandMark />
                <div className="min-w-0">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">SIGA-SEN</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Sistema Integrado de Gestión de Activos del SEN</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer touch-target flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto thin-scroll p-3 space-y-1.5" aria-label="Pestañas">
              {TABS.map((t) => renderNavItem(t, false))}
            </nav>

            {footerActions(false)}
          </aside>
        </div>
      )}
    </div>
  );
};
