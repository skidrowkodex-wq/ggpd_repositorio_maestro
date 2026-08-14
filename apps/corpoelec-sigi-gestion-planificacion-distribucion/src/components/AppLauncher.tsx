import React, { useState } from 'react';
import { SYSTEM_APPS } from '../mockData/portalData';
import { AppItem } from '../types/sigi';
import { useAuth } from '../context/AuthContext';
import { logSecurityAuditEvent } from '../utils/securityUtils';
import { createDriveAccessRequest } from '../utils/accessRequestsService';
import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { ExternalLink, Cpu, Zap, AlertTriangle, ClipboardList, Cloud, Bot, CloudCheck, ShieldCheck, ArrowUpRight, MapPin, BarChart3, Lock, CheckCircle2, ShieldAlert, Send, Check } from 'lucide-react';

interface AppLauncherProps {
  setActiveSection?: (sec: string) => void;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({ setActiveSection }) => {
  const { session } = useAuth();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [deniedModalApp, setDeniedModalApp] = useState<AppItem | null>(null);

  // Determine if logged-in user has permission for Google Drive
  const matchedUser = INITIAL_INSTITUTIONAL_USERS.find(u => 
    u.username.toLowerCase() === (session.name || '').toLowerCase() ||
    (session.userCode && u.username === session.userCode)
  );

  const isRoleAuthorized = session.role === 'ADMINISTRADOR' || session.role === 'GERENCIA';
  const hasDrivePermission = isRoleAuthorized || (matchedUser?.permissions?.gdriveRepo ?? false);
  const isAdmin = session.role === 'ADMINISTRADOR';

  // Request form state
  const [requestGoogleEmail, setRequestGoogleEmail] = useState<string>(matchedUser?.googleEmail || '');
  const [requestReason, setRequestReason] = useState<string>('');
  const [requestSentSuccess, setRequestSentSuccess] = useState<boolean>(false);

  const filteredApps = SYSTEM_APPS.filter(app => {
    if (filterCategory === 'MAESTRA') return app.category === 'APLICACION_MAESTRA';
    if (filterCategory === 'NUBE') return app.category === 'NUBE_AUTOMATIZACION';
    return true;
  });

  const handleAppLaunch = (app: AppItem, e: React.MouseEvent) => {
    // 1. Google Drive Card Permission Control
    if (app.id === 'gdrive-ggpd') {
      if (!hasDrivePermission) {
        e.preventDefault();
        setRequestGoogleEmail(matchedUser?.googleEmail || '');
        setRequestReason('');
        setRequestSentSuccess(false);
        setDeniedModalApp(app);
        
        // Log access attempt in ISO 27001 audit
        logSecurityAuditEvent({
          eventType: 'GDRIVE_ACCESS_DENIED',
          userId: session.userCode || 'usr-session',
          username: session.name || 'Usuario',
          fullName: session.name,
          targetApp: app.name,
          details: `Intento de acceso a carpeta Google Drive sin permiso asignado. Rol: ${session.role}`,
          stateCode: session.stateCode,
        });
        return;
      }

      // Log access success in ISO 27001 audit
      logSecurityAuditEvent({
        eventType: 'GDRIVE_ACCESS_SUCCESS',
        userId: session.userCode || 'usr-session',
        username: session.name || 'Usuario',
        fullName: session.name,
        targetApp: app.name,
        details: `Apertura autorizada de la carpeta corporativa Google Drive (1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7) desde Lanzador.`,
        stateCode: session.stateCode,
      });
      return;
    }

    // 2. Automations & Webhook Console Restriction (Strictly ADMINISTRADOR only)
    if (app.id === 'webhooks-nube') {
      if (!isAdmin) {
        e.preventDefault();
        setDeniedModalApp(app);
        
        logSecurityAuditEvent({
          eventType: 'PERMISSION_REVOKED',
          userId: session.userCode || 'usr-session',
          username: session.name || 'Usuario',
          fullName: session.name,
          targetApp: app.name,
          details: `Intento de acceso denegado a Consola de Automatizaciones Nube. Requiere rol ADMINISTRADOR. Rol actual: ${session.role}`,
          stateCode: session.stateCode,
        });
        return;
      }

      // If Administrator, jump directly to the Webhook & Requests module in SIGI
      if (setActiveSection) {
        e.preventDefault();
        setActiveSection('users');
        return;
      }
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      alert('Por favor describe el motivo o justificación de tu solicitud.');
      return;
    }

    createDriveAccessRequest({
      userId: session.userCode || matchedUser?.id || `usr-${Date.now()}`,
      username: session.name || 'usuario',
      fullName: matchedUser?.fullName || session.name || 'Usuario SIGI',
      email: matchedUser?.email || `${session.name}@corpoelec.gob.ve`,
      googleEmail: requestGoogleEmail.trim() || matchedUser?.googleEmail || `${session.name}@gmail.com`,
      role: session.role,
      stateCode: session.stateCode,
      reason: requestReason.trim(),
      requestedLevel: 'VIEWER',
    });

    setRequestSentSuccess(true);
    setTimeout(() => {
      setRequestSentSuccess(false);
      setDeniedModalApp(null);
    }, 2200);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="h-6 w-6 text-[#002b49] dark:text-[#00f2fe]" />;
      case 'Zap': return <Zap className="h-6 w-6 text-[#d97706] dark:text-[#ffd700]" />;
      case 'AlertTriangle': return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'ClipboardList': return <ClipboardList className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />;
      case 'FolderCloud': return <Cloud className="h-6 w-6 text-blue-600 dark:text-cyan-400" />;
      case 'Bot': return <Bot className="h-6 w-6 text-purple-700 dark:text-[#4facfe]" />;
      default: return <ExternalLink className="h-6 w-6 text-[#002b49] dark:text-[#00f2fe]" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Jump to Dashboards & Map Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col md:flex-row items-center justify-between gap-5 group hover:border-[#00f2fe]/80 transition-all duration-300">
        {/* Technical Dot Matrix */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

        {/* Stylized Right Watermark Chevrons */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
            <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-3xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#00f2fe]">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold">
                Eje 3 — Centro de Mando
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-mono font-bold flex items-center space-x-1">
                <span>✓</span>
                <span>Activos samc.activos_red</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Centro de Mando Unificado, Visor Mapa de Activos & Dashboards Nube
            </h3>
            
            {/* Pill Container with Chevron Glyphs */}
            <div className="rounded-2xl bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 p-2.5 sm:p-3 flex items-center space-x-2.5">
              <div className="flex items-center text-[#00f2fe] font-black text-xs tracking-tighter shrink-0 animate-pulse">
                <span>&gt;&gt;&gt;</span>
              </div>
              <p className="text-xs text-cyan-50 font-medium leading-snug">
                Accede al mapa de densidad por Estado (Subestaciones/Circuitos) y los tableros consolidados de SCTIS V2.0, SCEIN V3.0, SCPPE V3.0 y SCMTP V2.0.
              </p>
            </div>
          </div>
        </div>

        {setActiveSection && (
          <div className="relative z-10 shrink-0 w-full md:w-auto pt-2 md:pt-0">
            <button
              onClick={() => setActiveSection('dashboards')}
              className="w-full md:w-auto shrink-0 flex items-center justify-center space-x-2 rounded-2xl bg-white hover:bg-cyan-50 text-[#072146] font-black px-6 py-3.5 text-xs shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer active:scale-95 border border-white/40"
            >
              <BarChart3 className="h-4 w-4 text-[#002b49]" />
              <span>Ver Dashboards & Mapa de Activos 🗺️</span>
            </button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#00f2fe]/80 transition-all duration-300">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
            <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold flex items-center space-x-1.5">
              <CloudCheck className="h-4 w-4" />
              <span>Eje 1 · Catálogo Operacional</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Portal de Aplicaciones y Recursos Nube</h2>
          <p className="text-xs text-cyan-100/90 mt-1 max-w-2xl font-medium">
            Acceso directo y centralizado a los sistemas oficiales de la Gerencia Nacional de Gestión de Planificación de Distribución.
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-xs">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterCategory === 'ALL'
                ? 'bg-white text-[#072146] shadow-sm'
                : 'text-cyan-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Todas ({SYSTEM_APPS.length})
          </button>
          <button
            onClick={() => setFilterCategory('MAESTRA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterCategory === 'MAESTRA'
                ? 'bg-white text-[#072146] shadow-sm'
                : 'text-cyan-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Aplicaciones Maestras
          </button>
          <button
            onClick={() => setFilterCategory('NUBE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterCategory === 'NUBE'
                ? 'bg-white text-[#072146] shadow-sm'
                : 'text-cyan-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Recursos Nube
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app: AppItem) => {
          const isDriveCard = app.id === 'gdrive-ggpd';
          const isWebhookCard = app.id === 'webhooks-nube';
          
          let isAllowed = true;
          if (isDriveCard) {
            isAllowed = hasDrivePermission;
          } else if (isWebhookCard) {
            isAllowed = isAdmin;
          }

          const isRestricted = (isDriveCard && !hasDrivePermission) || (isWebhookCard && !isAdmin);

          return (
            <div
              key={app.id}
              className={`group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#0b172c] p-6 border transition-all ${
                isRestricted
                  ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-[#0c1626]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/50 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Badge & Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xs ${
                    isRestricted
                      ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-[#112240] border-blue-200 dark:border-slate-700/80'
                  }`}>
                    {isRestricted ? <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" /> : getIcon(app.iconName)}
                  </div>

                  {/* Badge Text */}
                  {isDriveCard ? (
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black border ${
                      hasDrivePermission
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                        : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                    }`}>
                      {hasDrivePermission ? '✓ Autorizado ISO' : '🔒 Requiere Permiso'}
                    </span>
                  ) : isWebhookCard ? (
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black border ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30'
                        : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                    }`}>
                      {isAdmin ? '👑 Admin Console' : '🔒 Solo Administrador'}
                    </span>
                  ) : app.badgeText ? (
                    <span className="rounded-full bg-blue-100 text-[#002b49] border border-blue-300 dark:bg-[#00f2fe]/10 dark:text-[#00f2fe] dark:border-[#00f2fe]/30 px-3 py-1 text-[10px] font-black">
                      {app.badgeText}
                    </span>
                  ) : null}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors flex items-center justify-between">
                  <span>{app.name}</span>
                  {isAllowed && (
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#002b49] dark:text-[#00f2fe]" />
                  )}
                </h3>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {app.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {isDriveCard ? 'Google Cloud Drive' : isWebhookCard ? 'Orquestación Nube' : app.isCloud ? 'Servicio Nube' : 'App Desplegada'}
                </span>

                {isAllowed ? (
                  <a
                    href={app.url}
                    onClick={(e) => handleAppLaunch(app, e)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs font-black text-[#002b49] dark:text-[#00f2fe] hover:underline cursor-pointer"
                  >
                    <span>{isDriveCard ? 'Abrir Repositorio' : isWebhookCard ? 'Abrir Consola Admin' : 'Ejecutar Aplicación'}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={(e) => handleAppLaunch(app, e)}
                    className="flex items-center space-x-1 text-xs font-black text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>{isWebhookCard ? 'Acceso Restringido' : 'Solicitar Acceso'}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Interactive Modal (Google Drive Request OR Admin-Only Webhook Block) */}
      {deniedModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-amber-300 dark:border-amber-500/40 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {deniedModalApp.id === 'webhooks-nube' ? <ShieldAlert className="h-6 w-6" /> : <Cloud className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {deniedModalApp.id === 'webhooks-nube' 
                      ? 'Consola Restringida a Administradores' 
                      : 'Solicitud de Acceso a Repositorio Google Drive'}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                    {deniedModalApp.id === 'webhooks-nube' 
                      ? 'ISO/IEC 27001 & ISACA COBIT 2019 Privilege Scoping' 
                      : 'Aprobación por Gerencia GGPD & ISO 27001'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setDeniedModalApp(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content for Webhook (Admin Only Notice) */}
            {deniedModalApp.id === 'webhooks-nube' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  La <strong>Consola de Automatizaciones Nube</strong> administra los endpoints de Google Apps Script, disparadores de sincronización de bases de datos, llaves de API y orquestación de bots.
                </p>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium space-y-1">
                  <p className="font-bold flex items-center space-x-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    <span>Control de Acceso Estricto (Role-Based Access Control)</span>
                  </p>
                  <p>Por directriz de gobernanza institucional, esta consola es de uso exclusivo para usuarios con rol <strong className="uppercase">ADMINISTRADOR</strong>.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p><strong>Usuario actual:</strong> {session.name} ({session.role}) [{session.stateCode}]</p>
                  <p><strong>Estado:</strong> <span className="text-red-600 font-bold">No Autorizado para Configuración de Webhooks</span></p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeniedModalApp(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black shadow-md cursor-pointer hover:scale-105 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            ) : requestSentSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-center space-y-2 animate-in zoom-in">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">¡Solicitud Enviada a Gerencia!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Tu petición ha sido registrada en la Bandeja de Aprobaciones. Al ser aprobada, recibirás la invitación automática de Google Drive en <strong>{requestGoogleEmail}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <p><strong>Usuario Solicitante:</strong> {session.name} ({session.role}) [{session.stateCode}]</p>
                  <p><strong>Repositorio Destino:</strong> Carpeta GGPD (1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7)</p>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Cuenta Google para Otorgamiento de Permisos (@gmail.com o asignada): *
                  </label>
                  <input
                    type="email"
                    required
                    value={requestGoogleEmail}
                    onChange={e => setRequestGoogleEmail(e.target.value)}
                    placeholder="tu.correo.google@gmail.com"
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-cyan-200 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    A esta cuenta de Google se le otorgará el acceso mediante <strong>bk.ggpd.corpoelec@gmail.com</strong>.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Motivo / Justificación Institucional de Acceso: *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={requestReason}
                    onChange={e => setRequestReason(e.target.value)}
                    placeholder="Ej. Requiero acceso para consultar los cronogramas de mantenimiento preventivo y minutas de distribución de mi zona."
                    className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeniedModalApp(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black shadow-md hover:scale-105 transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar Solicitud a Gerencia</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Security Statement */}
      <div className="flex items-center space-x-3 rounded-2xl bg-white dark:bg-[#112240] p-4 text-xs text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm font-medium">
        <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span>
          Todas las aplicaciones están enlazadas bajo el estándar de gobernanza <strong className="text-slate-900 dark:text-white">GGPD-SGM-INS-005 v3.0 ISO</strong> con autenticación integrada y Row-Level Security.
        </span>
      </div>

    </div>
  );
};
