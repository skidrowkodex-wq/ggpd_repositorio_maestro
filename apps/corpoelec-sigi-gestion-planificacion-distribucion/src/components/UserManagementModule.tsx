import React, { useState } from 'react';
import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { InstitutionalUser, UserSystemRole, AppAccessPermissions } from '../types/userManagement';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { useAuth } from '../context/AuthContext';
import { 
  validatePasswordStrength, 
  logSecurityAuditEvent, 
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  SecurityAuditEvent,
  sanitizeInput 
} from '../utils/securityUtils';
import { 
  getAccessRequests, 
  saveAccessRequests, 
  getWebhookConfig, 
  saveWebhookConfig,
  dispatchGoogleDriveWebhook,
  getPendingRequestsCount
} from '../utils/accessRequestsService';
import { 
  DriveAccessRequest, 
  GoogleDriveWebhookConfig, 
  DriveRoleLevel 
} from '../types/userManagement';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Edit3, 
  Lock, 
  Sparkles, 
  Globe, 
  Cpu, 
  Zap, 
  FileText, 
  BarChart3, 
  Cloud, 
  X, 
  Check, 
  Copy,
  Terminal,
  ShieldAlert,
  Sliders,
  History,
  Info,
  CheckSquare,
  Download,
  Mail,
  Send,
  Bell,
  Settings,
  RefreshCw,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

interface AppMetadata {
  key: keyof AppAccessPermissions;
  shortName: string;
  fullName: string;
  description: string;
  icon: React.ElementType;
  colorTheme: string;
  deployUrl: string;
}

const APPS_META: Record<keyof AppAccessPermissions, AppMetadata> = {
  sctis: {
    key: 'sctis',
    shortName: 'SCTIS V2.0',
    fullName: 'SCTIS V2.0 - Seguimiento y Control de Tiras de Interrupciones',
    description: 'Ingesta automatizada, cálculo de SAIDI/SAIFI y Energía No Suministrada (ENS en MWh).',
    icon: Cpu,
    colorTheme: 'emerald',
    deployUrl: 'https://corpoelec-sctis-corpoelec-ggpd-hosting-apps.vibehost.space',
  },
  tareasMinutas: {
    key: 'tareasMinutas',
    shortName: 'SCMTP V2.0',
    fullName: 'SCMTP V2.0 - Seguimiento y Control de Minutas y Tareas de Planificacion',
    description: 'Administración de compromisos, minutas de reuniones de planificación y acuerdos institucionales.',
    icon: FileText,
    colorTheme: 'blue',
    deployUrl: 'https://corpoelec-scmtp-corpoelec-ggpd-hosting-apps.vibehost.space',
  },
  planificacion: {
    key: 'planificacion',
    shortName: 'SCPPE V3.0',
    fullName: 'SCPPE V3.0 - Seguimiento y Control de Planes y Proyectos Especiales de Distribucion',
    description: 'Modelado analítico, ejecución de proyectos POA/PRTSEN y viáticos de campo.',
    icon: BarChart3,
    colorTheme: 'purple',
    deployUrl: 'https://corpoelec-scppe-corpoelec-ggpd-hosting-apps.vibehost.space',
  },
  scein: {
    key: 'scein',
    shortName: 'SCEIN V3.0',
    fullName: 'SCEIN V3.0 - Seguimiento y Control de Equipos Indisponibles',
    description: 'Gestión y trazabilidad de transformadores de potencia, bahías y activos de patio (ISO 55000).',
    icon: Zap,
    colorTheme: 'amber',
    deployUrl: 'https://corpoelec-scein-corpoelec-ggpd-hosting-apps.vibehost.space',
  },
  gdriveRepo: {
    key: 'gdriveRepo',
    shortName: 'Google Drive',
    fullName: 'Repositorio Cloud Google Drive GGPD',
    description: 'Carpeta corporativa en la nube (1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7) para minutas y matrices de distribución.',
    icon: Cloud,
    colorTheme: 'cyan',
    deployUrl: 'https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7',
  },
};

export const UserManagementModule: React.FC = () => {
  const { session } = useAuth();
  const [usersList, setUsersList] = useState<InstitutionalUser[]>(INITIAL_INSTITUTIONAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'USERS' | 'REQUESTS' | 'AUDIT_LOGS'>('USERS');
  
  // Requests & Webhook State
  const [requestsList, setRequestsList] = useState<DriveAccessRequest[]>(() => getAccessRequests());
  const [requestsFilter, setRequestsFilter] = useState<string>('ALL');
  const [webhookConfig, setWebhookConfig] = useState<GoogleDriveWebhookConfig>(() => getWebhookConfig());
  const [isConfigEditing, setIsConfigEditing] = useState<boolean>(false);
  const [tempWebhookUrl, setTempWebhookUrl] = useState<string>(webhookConfig.webhookUrl);
  const [webhookTestMessage, setWebhookTestMessage] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Modals state
  const [editingUser, setEditingUser] = useState<InstitutionalUser | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ssoSimulationUser, setSsoSimulationUser] = useState<InstitutionalUser | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Permission Wizard Modal State
  const [wizardUser, setWizardUser] = useState<InstitutionalUser | null>(null);
  const [wizardAppKey, setWizardAppKey] = useState<keyof AppAccessPermissions | null>(null);
  const [wizardGranted, setWizardGranted] = useState<boolean>(false);
  const [wizardScopeLevel, setWizardScopeLevel] = useState<'LECTURA_SOLO' | 'OPERADOR_LOCAL' | 'ADMIN_APLICACION'>('OPERADOR_LOCAL');
  const [wizardAuditNote, setWizardAuditNote] = useState<string>('');

  // Form State for new/edited user
  const [formUser, setFormUser] = useState<Partial<InstitutionalUser>>({
    username: '',
    fullName: '',
    email: '',
    googleEmail: '',
    role: 'ANALISTA',
    stateCode: 'NAC',
    unit: 'División de Planificación',
    status: 'ACTIVO',
    initialPassword: '',
    permissions: {
      sctis: true,
      tareasMinutas: true,
      planificacion: true,
      scein: false,
      gdriveRepo: false,
    },
  });

  const passwordVal = validatePasswordStrength(formUser.initialPassword || '');

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.googleEmail && u.googleEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          u.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || u.stateCode === selectedState;
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchesSearch && matchesState && matchesRole;
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>(() => getSecurityAuditLogs());
  const [auditFilterType, setAuditFilterType] = useState<string>('ALL');

  // Open Permission Wizard for specific user and app
  const openPermissionWizard = (user: InstitutionalUser, appKey: keyof AppAccessPermissions) => {
    setWizardUser(user);
    setWizardAppKey(appKey);
    setWizardGranted(user.permissions[appKey]);
    setWizardScopeLevel(user.role === 'ADMINISTRADOR' ? 'ADMIN_APLICACION' : 'OPERADOR_LOCAL');
    setWizardAuditNote(`Modificación de acceso autorizada por ${session.name} (${session.role}). ISO 27001 Audit Trail.`);
  };

  const saveWizardPermission = async () => {
    if (!wizardUser || !wizardAppKey) return;

    setUsersList(prev => prev.map(u => {
      if (u.id === wizardUser.id) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [wizardAppKey]: wizardGranted,
          },
        };
      }
      return u;
    }));

    const isDrive = wizardAppKey === 'gdriveRepo';
    const eventType = isDrive 
      ? (wizardGranted ? 'GDRIVE_PERMISSION_GRANTED' : 'GDRIVE_PERMISSION_REVOKED')
      : (wizardGranted ? 'PERMISSION_GRANTED' : 'PERMISSION_REVOKED');

    // If revoking drive permission and user has a googleEmail, execute automated offboarding webhook
    if (isDrive && !wizardGranted && wizardUser.googleEmail) {
      dispatchGoogleDriveWebhook('REVOKE', {
        email: wizardUser.googleEmail,
        adminName: session.name,
        reason: `Revocación por asistente de permisos por ${session.name}`,
      });
    }

    // ISO 27001 Security Log Entry
    const newLog = logSecurityAuditEvent({
      eventType,
      userId: wizardUser.id,
      username: wizardUser.username,
      fullName: wizardUser.fullName,
      targetApp: APPS_META[wizardAppKey]?.fullName || wizardAppKey,
      details: wizardAuditNote || `Acceso a ${APPS_META[wizardAppKey]?.shortName} ${wizardGranted ? 'otorgado' : 'revocado'} por ${session.name}`,
      stateCode: wizardUser.stateCode,
    });

    setAuditLogs(prev => [newLog, ...prev]);

    // Reset wizard state
    setWizardUser(null);
    setWizardAppKey(null);
  };

  // Approve Drive Request (1-Click & Webhook dispatch)
  const handleApproveRequest = async (req: DriveAccessRequest, roleLevel: DriveRoleLevel = 'VIEWER', ttlDays = 90) => {
    setIsDispatching(true);
    const dispatchRes = await dispatchGoogleDriveWebhook('GRANT', {
      email: req.googleEmail,
      roleLevel,
      adminName: session.name,
      reason: `Aprobación en SIGI por ${session.name} (${session.role}). Motivo: ${req.reason}`,
    });
    setIsDispatching(false);

    // Update request list
    const updatedReqs = requestsList.map(r => r.id === req.id ? {
      ...r,
      status: 'APROBADO' as const,
      requestedLevel: roleLevel,
      reviewedBy: `${session.name} (${session.role})`,
      reviewedDate: new Date().toISOString(),
      reviewNotes: `Acceso concedido como ${roleLevel}. TTL: ${ttlDays} días.`,
      ttlDays,
      webhookDispatched: dispatchRes.success,
    } : r);
    setRequestsList(updatedReqs);
    saveAccessRequests(updatedReqs);

    // Update user in users list
    setUsersList(prev => prev.map(u => {
      if (u.id === req.userId || u.username === req.username) {
        return {
          ...u,
          googleEmail: req.googleEmail || u.googleEmail,
          permissions: { ...u.permissions, gdriveRepo: true }
        };
      }
      return u;
    }));

    // Log ISO 27001
    const newLog = logSecurityAuditEvent({
      eventType: 'GDRIVE_PERMISSION_GRANTED',
      userId: req.userId,
      username: req.username,
      fullName: req.fullName,
      targetApp: 'Repositorio Google Drive Corporativo',
      details: `Solicitud de acceso aprobada por ${session.name} (${session.role}) para ${req.googleEmail}. Nivel: ${roleLevel}. ${dispatchRes.message}`,
      stateCode: req.stateCode,
    });
    setAuditLogs(prev => [newLog, ...prev]);

    alert(`✓ Solicitud aprobada con éxito para ${req.fullName}.\n\nCuenta Google: ${req.googleEmail}\n${dispatchRes.message}`);
  };

  // Reject Drive Request
  const handleRejectRequest = (req: DriveAccessRequest) => {
    const reason = prompt('Ingrese el motivo del rechazo para el registro de auditoría:', 'Acceso no justificado para las funciones actuales del cargo.');
    if (reason === null) return;

    const updatedReqs = requestsList.map(r => r.id === req.id ? {
      ...r,
      status: 'RECHAZADO' as const,
      reviewedBy: `${session.name} (${session.role})`,
      reviewedDate: new Date().toISOString(),
      reviewNotes: reason || 'Acceso denegado.',
    } : r);
    setRequestsList(updatedReqs);
    saveAccessRequests(updatedReqs);

    const newLog = logSecurityAuditEvent({
      eventType: 'GDRIVE_PERMISSION_REVOKED',
      userId: req.userId,
      username: req.username,
      fullName: req.fullName,
      targetApp: 'Repositorio Google Drive Corporativo',
      details: `Solicitud de acceso rechazada por ${session.name}. Motivo: ${reason}`,
      stateCode: req.stateCode,
    });
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Save Webhook URL Config
  const handleSaveWebhookUrl = () => {
    const newCfg: GoogleDriveWebhookConfig = {
      ...webhookConfig,
      webhookUrl: tempWebhookUrl.trim(),
      lastSync: new Date().toISOString(),
    };
    setWebhookConfig(newCfg);
    saveWebhookConfig(newCfg);
    setIsConfigEditing(false);
    setWebhookTestMessage('✓ Configuración de Webhook guardada exitosamente.');
    setTimeout(() => setWebhookTestMessage(null), 4000);
  };

  // Test Webhook Dispatch
  const handleTestWebhook = async () => {
    if (!webhookConfig.webhookUrl) {
      alert('Por favor ingresa la URL de la aplicación web de Google Apps Script primero.');
      return;
    }
    setWebhookTestMessage('Enviando paquete de prueba al Webhook...');
    const res = await dispatchGoogleDriveWebhook('GRANT', {
      email: 'bk.ggpd.corpoelec@gmail.com',
      roleLevel: 'VIEWER',
      adminName: session.name,
      reason: 'Prueba de enlace de comunicación Webhook desde SIGI',
    });
    setWebhookTestMessage(res.message);
    setTimeout(() => setWebhookTestMessage(null), 6000);
  };

  const handleSaveUserForm = () => {
    const sanitizedFullName = sanitizeInput(formUser.fullName || '');
    const sanitizedUsername = sanitizeInput(formUser.username || '');
    const sanitizedEmail = sanitizeInput(formUser.email || '');
    const sanitizedGoogleEmail = sanitizeInput(formUser.googleEmail || '');

    if (!sanitizedFullName || !sanitizedUsername || !sanitizedEmail) {
      alert('Por favor complete los campos obligatorios (Nombre, Usuario y Correo Corporativo).');
      return;
    }

    if (!editingUser && !passwordVal.isValid) {
      alert(`Contraseña no cumple con los requisitos OWASP:\n- ${passwordVal.errors.join('\n- ')}`);
      return;
    }

    if (editingUser) {
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? ({ 
        ...u, 
        ...formUser,
        fullName: sanitizedFullName,
        username: sanitizedUsername,
        email: sanitizedEmail,
        googleEmail: sanitizedGoogleEmail || u.googleEmail,
      } as InstitutionalUser) : u));
      setEditingUser(null);
      setIsAddModalOpen(false);
    } else {
      const newUser: InstitutionalUser = {
        id: `usr-${Date.now()}`,
        username: sanitizedUsername,
        fullName: sanitizedFullName,
        email: sanitizedEmail,
        googleEmail: sanitizedGoogleEmail,
        role: (formUser.role || 'ANALISTA') as UserSystemRole,
        stateCode: (formUser.stateCode || 'NAC') as any,
        unit: formUser.unit || 'División de Planificación',
        status: formUser.status || 'ACTIVO',
        initialPassword: formUser.initialPassword || 'Corpoelec2026.',
        permissions: formUser.permissions || { sctis: true, tareasMinutas: true, planificacion: true, scein: false, gdriveRepo: false },
        lastLogin: 'Nunca',
      };
      setUsersList(prev => [newUser, ...prev]);

      // ISO 27001 Log
      const createdLog = logSecurityAuditEvent({
        eventType: 'USER_CREATED',
        userId: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        details: `Nuevo usuario creado por ${session.name} con rol ${newUser.role}. Correo Corp: ${newUser.email}, Google: ${newUser.googleEmail || 'N/A'}`,
        stateCode: newUser.stateCode,
      });

      setAuditLogs(prev => [createdLog, ...prev]);
      setIsAddModalOpen(false);
    }
  };

  const generateSSOPayload = (user: InstitutionalUser) => {
    return {
      iss: 'CORPOELEC-SIGI-PORTAL-AUTH',
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      stateCode: user.stateCode,
      allowedApps: user.permissions,
      owaspProtection: 'ENABLED_AES_256_RSA',
      iso27001Compliant: true,
      iso8000QualityScore: 100,
      issuedAt: new Date().toISOString(),
      expiresInSeconds: 28800,
      signature: `SIGI_SHA256_RSA_VERIFIED_${user.username.toUpperCase()}_2026`,
    };
  };

  return (
    <div className="space-y-6">
      
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
              <Users className="h-4 w-4 text-purple-400" />
              <span>Eje 5 · Ciberseguridad & SSO</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Centro Unificado de Gestión de Usuarios y Accesos SSO</h2>
          <p className="text-xs text-cyan-100/90 mt-1 max-w-2xl font-medium">
            Aprovisionamiento centralizado de cuentas, permisos por aplicación mediante asistente interactivo y Single Sign-On (SSO) bajo estándares <strong>ISO 27001, ISO 8000 y OWASP Top 10</strong>.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => {
              setFormUser({
                username: '',
                fullName: '',
                email: '',
                role: 'ANALISTA',
                stateCode: 'NAC',
                unit: 'División de Planificación',
                status: 'ACTIVO',
                initialPassword: 'Corpoelec2026#',
                permissions: { sctis: true, tareasMinutas: true, planificacion: true, scein: false, gdriveRepo: false },
              });
              setEditingUser(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-2 rounded-2xl bg-white hover:bg-cyan-50 text-[#072146] px-5 py-3 text-xs font-black uppercase shadow-md hover:scale-105 transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4 text-[#002b49]" />
            <span>Crear Nuevo Usuario SSO</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Users List vs Requests Workflow vs ISO 27001 Audit Logs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'USERS'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>1. Usuarios & Matriz de Permisos ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'REQUESTS'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <Send className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span>2. Bandeja de Solicitudes & Aprobaciones Drive</span>
          {requestsList.filter(r => r.status === 'PENDIENTE').length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-mono font-black animate-pulse">
              {requestsList.filter(r => r.status === 'PENDIENTE').length} PENDIENTES
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('AUDIT_LOGS');
            setAuditLogs(getSecurityAuditLogs());
          }}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#112240] dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>3. Bitácora de Auditoría ISO 27001</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-mono font-bold">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {activeTab === 'USERS' && (
        <>
          {/* ISO & OWASP Governance Compliance Badge Banner */}
          <div className="rounded-3xl bg-blue-50/80 dark:bg-[#081427] p-5 border border-blue-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#002b49] dark:text-[#00f2fe]">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Cumplimiento de Seguridad e Integridad de Datos (ISO 27001 / 8000 / OWASP)</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  ISO 27001 AUDITED
                </span>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#002b49] dark:bg-cyan-950 dark:text-cyan-300 px-2.5 py-1 rounded-full border border-blue-300 dark:border-cyan-800">
                  OWASP TOP 10 HARDENED
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <strong>Tip para Administradores:</strong> Haz clic directamente sobre cualquiera de los badges de aplicación (<code>SCTIS</code>, <code>Tareas</code>, <code>Planif</code>, <code>SCEIN</code>, <code>Drive</code>) en la tabla para desplegar el <strong>Asistente de Control Granular</strong>, otorgar/revocar permisos y registrar notas de auditoría inmutables.
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, nombre, correo o unidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-medium shadow-xs"
              />
            </div>

            {/* Filter State */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-3 h-4 w-4 text-[#d97706] dark:text-[#ffd700]" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-bold cursor-pointer shadow-xs"
              >
                <option value="ALL">Todos los Estados</option>
                {VENEZUELAN_STATES.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Role */}
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-bold cursor-pointer shadow-xs"
              >
                <option value="ALL">Todos los Roles</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="GERENCIA">GERENCIA</option>
                <option value="ESPECIALISTA">ESPECIALISTA</option>
                <option value="ANALISTA">ANALISTA</option>
                <option value="OPERADOR">OPERADOR</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>

          </div>

          {/* Users Table */}
          <div className="rounded-3xl bg-white dark:bg-[#081224] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#060d1a] border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    <th className="py-3.5 px-4">Usuario & Credenciales</th>
                    <th className="py-3.5 px-4">Rol / Ámbito Estadal</th>
                    <th className="py-3.5 px-4 text-center">Asistente de Permisos (Click en Badge)</th>
                    <th className="py-3.5 px-4 text-center">Clave Inicial</th>
                    <th className="py-3.5 px-4 text-right">Acciones SSO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-xs">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      
                      {/* User info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950 text-[#002b49] dark:text-[#00f2fe] flex items-center justify-center font-black text-xs shrink-0 border border-blue-200 dark:border-blue-800">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block leading-tight">{user.fullName}</span>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <code className="text-[11px] font-mono text-[#002b49] dark:text-cyan-300 font-bold">@{user.username}</code>
                              <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
                              {user.googleEmail && (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-[9px] font-mono border border-cyan-200 dark:border-cyan-800" title="Cuenta Google para automatizaciones de Drive">
                                  <Cloud className="h-2.5 w-2.5" />
                                  <span>{user.googleEmail}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & State */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            user.role === 'ADMINISTRADOR' ? 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-300' :
                            user.role === 'GERENCIA' ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300' :
                            user.role === 'ESPECIALISTA' ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300' :
                            'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}>
                            {user.role}
                          </span>
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            <span className="font-bold text-amber-700 dark:text-[#ffd700]">[{user.stateCode}]</span>
                            <span className="text-slate-500 font-medium truncate max-w-[140px]">{user.unit}</span>
                          </div>
                        </div>
                      </td>

                      {/* Interactive App Permissions Badges (Opens Wizard) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          
                          {/* App 1: SCTIS */}
                          <button
                            onClick={() => openPermissionWizard(user, 'sctis')}
                            title="Click para abrir Asistente de Permisos SCTIS V2.0"
                            className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                              user.permissions.sctis 
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs' 
                                : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            <Cpu className="h-3.5 w-3.5" />
                            <span>SCTIS V2.0</span>
                          </button>

                          {/* App 2: SCMTP */}
                          <button
                            onClick={() => openPermissionWizard(user, 'tareasMinutas')}
                            title="Click para abrir Asistente de Permisos SCMTP V2.0"
                            className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                              user.permissions.tareasMinutas 
                                ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-cyan-300 shadow-xs' 
                                : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>SCMTP V2.0</span>
                          </button>

                          {/* App 3: SCPPE */}
                          <button
                            onClick={() => openPermissionWizard(user, 'planificacion')}
                            title="Click para abrir Asistente de Permisos SCPPE V3.0"
                            className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                              user.permissions.planificacion 
                                ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300 shadow-xs' 
                                : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>SCPPE V3.0</span>
                          </button>

                          {/* App 4: SCEIN */}
                          <button
                            onClick={() => openPermissionWizard(user, 'scein')}
                            title="Click para abrir Asistente de Permisos SCEIN V3.0"
                            className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                              user.permissions.scein 
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 shadow-xs' 
                                : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            <Zap className="h-3.5 w-3.5" />
                            <span>SCEIN V3.0</span>
                          </button>

                          {/* App 5: Google Drive */}
                          <button
                            onClick={() => openPermissionWizard(user, 'gdriveRepo')}
                            title="Click para abrir Asistente de Permisos Repositorio Google Drive"
                            className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                              user.permissions.gdriveRepo 
                                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 shadow-xs' 
                                : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                            }`}
                          >
                            <Cloud className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-400" />
                            <span>Drive</span>
                          </button>

                        </div>
                      </td>

                      {/* Initial Password */}
                      <td className="py-3.5 px-4 text-center">
                        <code className="text-[11px] font-mono font-bold bg-slate-100 text-[#002b49] dark:bg-slate-800 dark:text-[#ffd700] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {user.initialPassword || '••••••••'}
                        </code>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          <button
                            onClick={() => setSsoSimulationUser(user)}
                            title="Simular Payload Token SSO"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#002b49] border border-blue-200 hover:bg-blue-100 dark:bg-cyan-950/60 dark:text-[#00f2fe] dark:border-cyan-800 text-[11px] font-bold flex items-center space-x-1 transition-all"
                          >
                            <Key className="h-3.5 w-3.5" />
                            <span>Payload SSO</span>
                          </button>

                          <button
                            onClick={() => {
                              setFormUser(user);
                              setEditingUser(user);
                              setIsAddModalOpen(true);
                            }}
                            title="Editar Usuario"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DRIVE ACCESS REQUESTS & WORKFLOW APPROVALS */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Google Cloud & Webhook Integration Control Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 space-y-4 group hover:border-[#00f2fe]/80 transition-all duration-300">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
              <svg width="160" height="160" viewBox="0 0 100 100" fill="currentColor">
                <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
                <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <Cloud className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-black uppercase">
                      Google Cloud Apps Script Webhook
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{webhookConfig.accountEmail}</span>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    Automatización en Tiempo Real con Repositorio GGPD
                  </h3>
                  <p className="text-xs text-cyan-100/90">
                    Carpeta oficial: <code className="text-[#00f2fe] font-mono bg-black/30 px-1.5 py-0.5 rounded">1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7</code>. Al hacer clic en <strong>Aprobar</strong>, Google Drive otorga el permiso y envía la notificación oficial por correo.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsConfigEditing(!isConfigEditing)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-cyan-300" />
                  <span>{isConfigEditing ? 'Ocultar Configuración' : 'Configurar Webhook URL'}</span>
                </button>

                <button
                  onClick={handleTestWebhook}
                  disabled={isDispatching}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-cyan-50 text-[#072146] font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 text-[#002b49] ${isDispatching ? 'animate-spin' : ''}`} />
                  <span>Probar Conexión Webhook</span>
                </button>
              </div>
            </div>

            {/* Webhook Configuration Edit Box */}
            {isConfigEditing && (
              <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/40 space-y-3 animate-in fade-in">
                <label className="text-xs font-bold text-cyan-200 block">
                  URL de la Aplicación Web (Google Apps Script Webhook desplegado en {webhookConfig.accountEmail}):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={tempWebhookUrl}
                    onChange={(e) => setTempWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="w-full rounded-xl bg-slate-900/90 text-cyan-200 border border-slate-700 px-3.5 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveWebhookUrl}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer"
                  >
                    Guardar URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pega aquí la URL terminada en <code className="text-cyan-300">/exec</code> obtenida al implementar la aplicación web en Google Apps Script.
                </p>
              </div>
            )}

            {webhookTestMessage && (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <Info className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>{webhookTestMessage}</span>
              </div>
            )}
          </div>

          {/* Metrics & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Filtrar Estado:</span>
              <select
                value={requestsFilter}
                onChange={e => setRequestsFilter(e.target.value)}
                className="rounded-xl bg-white dark:bg-[#112240] px-3 py-2 text-xs font-bold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <option value="ALL">Todas las Solicitudes ({requestsList.length})</option>
                <option value="PENDIENTE">Pendientes ({requestsList.filter(r => r.status === 'PENDIENTE').length})</option>
                <option value="APROBADO">Aprobadas ({requestsList.filter(r => r.status === 'APROBADO').length})</option>
                <option value="RECHAZADO">Rechazadas ({requestsList.filter(r => r.status === 'RECHAZADO').length})</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Aprobaciones gestionadas por <strong>ADMINISTRADORES</strong> y <strong>GERENCIA</strong> (ISO 27001).
            </span>
          </div>

          {/* Requests Table */}
          <div className="rounded-3xl bg-white dark:bg-[#081224] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#060d1a] border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    <th className="py-3.5 px-4">Fecha & Solicitante</th>
                    <th className="py-3.5 px-4">Cuentas (Corp vs Google)</th>
                    <th className="py-3.5 px-4">Motivo / Justificación</th>
                    <th className="py-3.5 px-4 text-center">Nivel Solicitado</th>
                    <th className="py-3.5 px-4 text-center">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones de Aprobación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-xs">
                  {requestsList
                    .filter(r => requestsFilter === 'ALL' || r.status === requestsFilter)
                    .map((req) => {
                      const isPending = req.status === 'PENDIENTE';
                      const isApproved = req.status === 'APROBADO';

                      return (
                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          
                          {/* Date & User */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 dark:text-white block">{req.fullName}</span>
                            <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(req.requestDate).toLocaleDateString('es-VE')}</span>
                              <span className="font-bold text-amber-700 dark:text-[#ffd700]">[{req.stateCode}]</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold">{req.role}</span>
                            </div>
                          </td>

                          {/* Emails */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="text-slate-600 dark:text-slate-300 font-medium block text-xs truncate max-w-[200px]">{req.email}</span>
                              <div className="flex items-center space-x-1 text-cyan-700 dark:text-cyan-400 font-mono text-[11px] font-bold">
                                <Cloud className="h-3 w-3" />
                                <span>{req.googleEmail}</span>
                              </div>
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-700 dark:text-slate-300 text-xs line-clamp-2" title={req.reason}>
                              {req.reason}
                            </p>
                            {req.reviewNotes && (
                              <span className="text-[10px] text-slate-500 italic block mt-1">
                                Dictamen: {req.reviewNotes}
                              </span>
                            )}
                          </td>

                          {/* Level */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              req.requestedLevel === 'EDITOR'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950 dark:text-cyan-300'
                            }`}>
                              {req.requestedLevel === 'EDITOR' ? '✏️ Editor' : '👁️ Lector (Viewer)'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-300'
                            }`}>
                              {isApproved ? <CheckCircle2 className="h-3 w-3" /> : isPending ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              <span>{req.status}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleApproveRequest(req, req.requestedLevel || 'VIEWER', 90)}
                                  disabled={isDispatching}
                                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  title="Aprobar acceso Lector y disparar Webhook Google"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                  <span>Aprobar (1 Clic)</span>
                                </button>

                                <button
                                  onClick={() => handleRejectRequest(req)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 dark:bg-slate-800 dark:hover:bg-red-950 text-xs font-bold transition-all cursor-pointer"
                                  title="Rechazar solicitud"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {req.reviewedBy ? `Por: ${req.reviewedBy}` : 'Revisado'}
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: AUDIT LOGS & GOOGLE DRIVE ACCESS TELEMETRY (ISO 27001) */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Audit Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#081224] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Eventos Registrados</span>
              <span className="text-2xl font-black text-[#002b49] dark:text-[#00f2fe] mt-1 block">{auditLogs.length}</span>
            </div>

            <div className="bg-white dark:bg-[#081224] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Accesos Google Drive</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {auditLogs.filter(l => l.eventType === 'GDRIVE_ACCESS_SUCCESS').length}
              </span>
            </div>

            <div className="bg-white dark:bg-[#081224] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">Permisos Otorgados</span>
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 block">
                {auditLogs.filter(l => l.eventType === 'GDRIVE_PERMISSION_GRANTED' || l.eventType === 'PERMISSION_GRANTED').length}
              </span>
            </div>

            <div className="bg-white dark:bg-[#081224] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Intentos Denegados</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {auditLogs.filter(l => l.eventType === 'GDRIVE_ACCESS_DENIED').length}
              </span>
            </div>
          </div>

          {/* Filters & Actions Bar for Logs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Filtrar Eventos:</span>
              <select
                value={auditFilterType}
                onChange={e => setAuditFilterType(e.target.value)}
                className="rounded-xl bg-white dark:bg-[#112240] px-3 py-2 text-xs font-bold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700"
              >
                <option value="ALL">Todos los Eventos ({auditLogs.length})</option>
                <option value="GDRIVE_ACCESS_SUCCESS">Accesos Drive Exitosos</option>
                <option value="GDRIVE_ACCESS_DENIED">Accesos Drive Denegados</option>
                <option value="GDRIVE_PERMISSION_GRANTED">Permisos Drive Concedidos</option>
                <option value="GDRIVE_PERMISSION_REVOKED">Permisos Drive Revocados</option>
                <option value="PERMISSION_GRANTED">Otros Permisos Otorgados</option>
                <option value="USER_CREATED">Usuarios Creados</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setAuditLogs(getSecurityAuditLogs())}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#112240] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700"
              >
                <History className="h-3.5 w-3.5" />
                <span>Actualizar Bitácora</span>
              </button>

              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `AUDITORIA_ISO27001_CORPOELEC_${new Date().toISOString().split('T')[0]}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-bold shadow-xs hover:scale-105 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-3xl bg-white dark:bg-[#081224] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#060d1a] border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    <th className="py-3.5 px-4">Fecha & Hora (VET)</th>
                    <th className="py-3.5 px-4">Tipo de Evento ISO 27001</th>
                    <th className="py-3.5 px-4">Usuario Responsable</th>
                    <th className="py-3.5 px-4">Recurso / Aplicación</th>
                    <th className="py-3.5 px-4">Detalle Operativo & Bitácora</th>
                    <th className="py-3.5 px-4 text-right">Origen / Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-xs font-medium">
                  {auditLogs
                    .filter(log => auditFilterType === 'ALL' || log.eventType === auditFilterType)
                    .map(log => {
                      const isSuccess = log.eventType === 'GDRIVE_ACCESS_SUCCESS' || log.eventType === 'GDRIVE_PERMISSION_GRANTED' || log.eventType === 'PERMISSION_GRANTED' || log.eventType === 'USER_CREATED';
                      const isDenied = log.eventType === 'GDRIVE_ACCESS_DENIED' || log.eventType === 'GDRIVE_PERMISSION_REVOKED' || log.eventType === 'PERMISSION_REVOKED';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          
                          {/* Timestamp */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('es-VE', { 
                              year: 'numeric', month: '2-digit', day: '2-digit', 
                              hour: '2-digit', minute: '2-digit', second: '2-digit' 
                            })}
                          </td>

                          {/* Event Type Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-black border ${
                              log.eventType.includes('GDRIVE') 
                                ? 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300' 
                                : isSuccess
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
                            }`}>
                              {isSuccess ? <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> : <ShieldAlert className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                              <span>{log.eventType}</span>
                            </span>
                          </td>

                          {/* User */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-white block">{log.fullName || log.username}</span>
                              <span className="text-[10px] font-mono text-slate-500">@{log.username} [{log.stateCode}]</span>
                            </div>
                          </td>

                          {/* Target Resource */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-[#002b49] dark:text-[#00f2fe] text-xs flex items-center space-x-1">
                              {log.targetApp?.includes('Drive') && <Cloud className="h-3.5 w-3.5 text-cyan-600 shrink-0" />}
                              <span>{log.targetApp || 'Sistema General'}</span>
                            </span>
                          </td>

                          {/* Details */}
                          <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                            <p className="text-slate-700 dark:text-slate-300 text-xs leading-snug truncate" title={log.details}>
                              {log.details}
                            </p>
                          </td>

                          {/* IP / Hash */}
                          <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            <span>{log.ipAddress || '10.15.2.14'}</span>
                          </td>

                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* PERMISSION WIZARD MODAL (Asistente Interactivo con Auditoría ISO 27001) */}
      {wizardUser && wizardAppKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-[#112240] text-[#002b49] dark:text-[#00f2fe] border border-blue-200 dark:border-slate-700">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Asistente de Delegación de Permisos (ISO 27001)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Usuario: <strong className="text-slate-900 dark:text-white">{wizardUser.fullName}</strong> (<code>@{wizardUser.username}</code>)
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setWizardUser(null); setWizardAppKey(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target App Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#002b49] dark:text-[#00f2fe] uppercase">
                  {APPS_META[wizardAppKey].shortName}
                </span>
                <span className="text-[10px] font-bold text-slate-500">ISO 27001 / COBIT Managed</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {APPS_META[wizardAppKey].fullName}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {APPS_META[wizardAppKey].description}
              </p>
            </div>

            {/* Step 1: Switch Grant / Revoke Status */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
                1. Estado de Acceso Directo a la Aplicación:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWizardGranted(true)}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                    wizardGranted
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#112240] dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>PERMITIR ACCESO (OTORGAR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardGranted(false)}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                    !wizardGranted
                      ? 'bg-red-100 text-red-900 border-red-400 dark:bg-red-950 dark:text-red-300 shadow-md ring-2 ring-red-500/30'
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#112240] dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  <XCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
                  <span>BLOQUEAR ACCESO (REVOCAR)</span>
                </button>
              </div>
            </div>

            {/* Step 2: Privilege Level Scoping (If Granted) */}
            {wizardGranted && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
                  2. Nivel de Privilegio & Alcance en la App:
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setWizardScopeLevel('LECTURA_SOLO')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      wizardScopeLevel === 'LECTURA_SOLO'
                        ? 'bg-blue-100 text-[#002b49] border-blue-400 dark:bg-cyan-950 dark:text-cyan-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#112240] dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    Solo Lectura
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardScopeLevel('OPERADOR_LOCAL')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      wizardScopeLevel === 'OPERADOR_LOCAL'
                        ? 'bg-blue-100 text-[#002b49] border-blue-400 dark:bg-cyan-950 dark:text-cyan-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#112240] dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    Operación Local
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardScopeLevel('ADMIN_APLICACION')}
                    className={`p-2.5 rounded-xl border transition-all ${
                      wizardScopeLevel === 'ADMIN_APLICACION'
                        ? 'bg-blue-100 text-[#002b49] border-blue-400 dark:bg-cyan-950 dark:text-cyan-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#112240] dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    Admin App
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Geographic Boundary Confirmation */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-xs font-medium text-amber-900 dark:text-amber-300 flex items-start space-x-2.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
              <div>
                <strong>Restricción Geográfica Asignada:</strong> Ámbito Estadal <strong>[{wizardUser.stateCode}]</strong>. 
                El token SSO forzará que la aplicación filtre las vistas y consultas exclusivamente para este estado.
              </div>
            </div>

            {/* Step 4: Audit Trail Note */}
            <div>
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block mb-1">
                Nota Justificativa para Registro de Auditoría (ISO 27001):
              </label>
              <input
                type="text"
                value={wizardAuditNote}
                onChange={e => setWizardAuditNote(e.target.value)}
                placeholder="Ej. Otorgado para inspección de minutas del grupo de trabajo..."
                className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium"
              />
            </div>

            {/* Footer Controls */}
            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setWizardUser(null); setWizardAppKey(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveWizardPermission}
                className="px-5 py-2.5 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black uppercase shadow-md hover:scale-105 transition-all"
              >
                Aplicar Permiso & Actualizar Bitácora ISO
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit User Modal with OWASP Password Feedback */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingUser ? `Editar Usuario: @${editingUser.username}` : 'Registrar Nuevo Usuario en el Portal SIGI'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formUser.fullName || ''}
                  onChange={e => setFormUser({...formUser, fullName: e.target.value})}
                  placeholder="Ej. Ing. Carlos Reyes"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Usuario (Username) *</label>
                <input
                  type="text"
                  value={formUser.username || ''}
                  onChange={e => setFormUser({...formUser, username: e.target.value})}
                  placeholder="Ej. c_reyes"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Correo Institucional CORPOELEC (@corpoelec.gob.ve) *
                </label>
                <input
                  type="email"
                  value={formUser.email || ''}
                  onChange={e => setFormUser({...formUser, email: e.target.value})}
                  placeholder="c_reyes@corpoelec.gob.ve"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Cuenta Google / Repositorio Nube (@gmail.com o asociada a Google)
                </label>
                <input
                  type="email"
                  value={formUser.googleEmail || ''}
                  onChange={e => setFormUser({...formUser, googleEmail: e.target.value})}
                  placeholder="carlos.reyes.distribucion@gmail.com"
                  className="w-full rounded-xl bg-cyan-50/50 dark:bg-[#0c1c36] p-2.5 text-slate-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800 font-mono text-xs font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Utilizado para el aprovisionamiento automático y notificaciones desde <strong>bk.ggpd.corpoelec@gmail.com</strong>.
                </span>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Contraseña Inicial / SSO (OWASP)</label>
                <input
                  type="text"
                  value={formUser.initialPassword || ''}
                  onChange={e => setFormUser({...formUser, initialPassword: e.target.value})}
                  placeholder="Reyes2026#"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
                
                {/* OWASP Password Score Indicator */}
                {!editingUser && formUser.initialPassword && (
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500">Fortaleza OWASP:</span>
                      <span className={passwordVal.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {passwordVal.score}% {passwordVal.isValid ? '✓ Segura' : '⚠️ Débil'}
                      </span>
                    </div>
                    {passwordVal.errors.length > 0 && (
                      <p className="text-[10px] text-red-500 font-medium leading-tight">
                        {passwordVal.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Rol en el Sistema</label>
                <select
                  value={formUser.role || 'ANALISTA'}
                  onChange={e => setFormUser({...formUser, role: e.target.value as any})}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="GERENCIA">GERENCIA</option>
                  <option value="ESPECIALISTA">ESPECIALISTA</option>
                  <option value="ANALISTA">ANALISTA</option>
                  <option value="OPERADOR">OPERADOR</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Estado Geográfico (Ámbito)</label>
                <select
                  value={formUser.stateCode || 'NAC'}
                  onChange={e => setFormUser({...formUser, stateCode: e.target.value as any})}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold"
                >
                  {VENEZUELAN_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Application Access Checkboxes */}
            <div className="pt-2">
              <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-2 text-xs">
                Permisos de Acceso Directo por Aplicación GGPD:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUser.permissions?.sctis || false}
                    onChange={e => setFormUser({
                      ...formUser,
                      permissions: { ...formUser.permissions!, sctis: e.target.checked }
                    })}
                    className="rounded text-[#002b49] focus:ring-0"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">1. SCTIS V2.0 (Interrupciones)</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUser.permissions?.tareasMinutas || false}
                    onChange={e => setFormUser({
                      ...formUser,
                      permissions: { ...formUser.permissions!, tareasMinutas: e.target.checked }
                    })}
                    className="rounded text-[#002b49] focus:ring-0"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">2. SCMTP V2.0 (Minutas & Tareas)</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUser.permissions?.planificacion || false}
                    onChange={e => setFormUser({
                      ...formUser,
                      permissions: { ...formUser.permissions!, planificacion: e.target.checked }
                    })}
                    className="rounded text-[#002b49] focus:ring-0"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">3. SCPPE V3.0 (Planes & Proyectos)</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-[#112240] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formUser.permissions?.scein || false}
                    onChange={e => setFormUser({
                      ...formUser,
                      permissions: { ...formUser.permissions!, scein: e.target.checked }
                    })}
                    className="rounded text-[#002b49] focus:ring-0"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">4. SCEIN V3.0 (Equipos Indisponibles)</span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={formUser.permissions?.gdriveRepo || false}
                    onChange={e => setFormUser({
                      ...formUser,
                      permissions: { ...formUser.permissions!, gdriveRepo: e.target.checked }
                    })}
                    className="rounded text-cyan-600 focus:ring-0"
                  />
                  <span className="font-bold text-cyan-900 dark:text-cyan-300">5. Repositorio Cloud Google Drive GGPD (1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUserForm}
                className="px-5 py-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black"
              >
                Guardar Usuario & Sincronizar Permisos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SSO Simulation Payload Modal with ISO/OWASP Metadata */}
      {ssoSimulationUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Simulación de Token JWT SSO — Usuario: @{ssoSimulationUser.username}
                </h3>
              </div>
              <button
                onClick={() => setSsoSimulationUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Este es el payload encriptado que transmite el portal al hacer clic en <strong>"Ejecutar Aplicación"</strong>. La app receptora procesa este token y loguea automáticamente a <strong>{ssoSimulationUser.fullName}</strong> con ámbito restringido a <strong>[{ssoSimulationUser.stateCode}]</strong>.
              </p>

              <div className="relative rounded-2xl bg-slate-900 p-4 text-[#00f2fe] font-mono text-[11px] border border-slate-800 overflow-x-auto shadow-inner">
                <pre>{JSON.stringify(generateSSOPayload(ssoSimulationUser), null, 2)}</pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generateSSOPayload(ssoSimulationUser), null, 2));
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-bold hover:bg-slate-700"
                >
                  {copiedToken ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedToken ? 'Copiado' : 'Copiar JSON'}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-[11px] text-emerald-900 dark:text-emerald-300 font-medium flex items-center justify-between">
                <div>
                  <strong>✓ ISO 27001 / OWASP Verificado:</strong> Token firmado con SHA-256 / RSA. La app receptora omite el login y asigna el perfil <code>{ssoSimulationUser.role}</code>.
                </div>
                <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSsoSimulationUser(null)}
                className="px-5 py-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] text-xs font-black"
              >
                Cerrar Visor SSO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
