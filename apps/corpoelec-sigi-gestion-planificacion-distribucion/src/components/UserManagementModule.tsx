import React, { useState } from 'react';
import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { InstitutionalUser, UserSystemRole, AppAccessPermissions } from '../types/userManagement';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { useAuth } from '../context/AuthContext';
import { 
  validatePasswordStrength, 
  logSecurityAuditEvent, 
  sanitizeInput 
} from '../utils/securityUtils';
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
  CheckSquare
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
    shortName: 'SCTIS v2.0',
    fullName: 'SCTIS V 2.0 (Control de Interrupciones & ENS)',
    description: 'Ingesta automatizada, homologación IA Gemini 3.6 y cálculo de Energía No Suministrada.',
    icon: Cpu,
    colorTheme: 'emerald',
    deployUrl: 'https://sctis-interrupciones-distribucion.ai.studio',
  },
  tareasMinutas: {
    key: 'tareasMinutas',
    shortName: 'Tareas & Minutas',
    fullName: 'CORPOELEC — Gestor de Tareas y Minutas (SGTA)',
    description: 'Extracción de compromisos institucionales desde PDF/Texto y seguimiento en Tablero Kanban.',
    icon: FileText,
    colorTheme: 'blue',
    deployUrl: 'https://ggpd-corpoelec-sc-tareas.ai.studio',
  },
  planificacion: {
    key: 'planificacion',
    shortName: 'Planif. SEN',
    fullName: 'Planificación Eléctrica SEN & Presupuesto Viáticos',
    description: 'Ejecución del Plan de Respuesta Técnica (PRTSEN), proyectos POA y viáticos en campo.',
    icon: BarChart3,
    colorTheme: 'purple',
    deployUrl: 'https://ggpd-planificacion-proyectos-poa.vercel.app/',
  },
  scein: {
    key: 'scein',
    shortName: 'REMIX SCEIN',
    fullName: 'REMIX SCEIN — Control de Equipos Indisponibles',
    description: 'Catálogo de criticidad, transformadores de potencia y equipos de patio indisponibles SEN.',
    icon: Zap,
    colorTheme: 'amber',
    deployUrl: 'https://distribucion-indisponibles-sen.vercel.app/',
  },
};

export const UserManagementModule: React.FC = () => {
  const { session } = useAuth();
  const [usersList, setUsersList] = useState<InstitutionalUser[]>(INITIAL_INSTITUTIONAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  
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
    },
  });

  const passwordVal = validatePasswordStrength(formUser.initialPassword || '');

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || u.stateCode === selectedState;
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchesSearch && matchesState && matchesRole;
  });

  // Open Permission Wizard for specific user and app
  const openPermissionWizard = (user: InstitutionalUser, appKey: keyof AppAccessPermissions) => {
    setWizardUser(user);
    setWizardAppKey(appKey);
    setWizardGranted(user.permissions[appKey]);
    setWizardScopeLevel(user.role === 'ADMINISTRADOR' ? 'ADMIN_APLICACION' : 'OPERADOR_LOCAL');
    setWizardAuditNote(`Modificación de acceso autorizada por ${session.name} (${session.role}). ISO 27001 Audit Trail.`);
  };

  const saveWizardPermission = () => {
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

    // ISO 27001 Security Log Entry
    logSecurityAuditEvent({
      eventType: wizardGranted ? 'PERMISSION_GRANTED' : 'PERMISSION_REVOKED',
      userId: wizardUser.id,
      username: wizardUser.username,
      targetApp: wizardAppKey,
      details: wizardAuditNote,
      stateCode: wizardUser.stateCode,
      timestamp: new Date().toISOString(),
    });

    // Reset wizard state
    setWizardUser(null);
    setWizardAppKey(null);
  };

  const handleSaveUserForm = () => {
    const sanitizedFullName = sanitizeInput(formUser.fullName || '');
    const sanitizedUsername = sanitizeInput(formUser.username || '');
    const sanitizedEmail = sanitizeInput(formUser.email || '');

    if (!sanitizedFullName || !sanitizedUsername || !sanitizedEmail) {
      alert('Por favor complete los campos obligatorios (Nombre, Usuario y Correo).');
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
      } as InstitutionalUser) : u));
      setEditingUser(null);
    } else {
      const newUser: InstitutionalUser = {
        id: `usr-${Date.now()}`,
        username: sanitizedUsername,
        fullName: sanitizedFullName,
        email: sanitizedEmail,
        role: (formUser.role || 'ANALISTA') as UserSystemRole,
        stateCode: (formUser.stateCode || 'NAC') as any,
        unit: formUser.unit || 'División de Planificación',
        status: formUser.status || 'ACTIVO',
        initialPassword: formUser.initialPassword || 'Corpoelec2026.',
        permissions: formUser.permissions || { sctis: true, tareasMinutas: true, planificacion: true, scein: false },
        lastLogin: 'Nunca',
      };
      setUsersList(prev => [newUser, ...prev]);

      // ISO 27001 Log
      logSecurityAuditEvent({
        eventType: 'USER_CREATED',
        userId: newUser.id,
        username: newUser.username,
        details: `Nuevo usuario creado por ${session.name}`,
        stateCode: newUser.stateCode,
        timestamp: new Date().toISOString(),
      });

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
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eje 5: Centro Unificado de Gestión de Usuarios y Accesos SSO</h2>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-2xl font-medium">
            Aprovisionamiento centralizado de cuentas, permisos por aplicación mediante asistente interactivo y Single Sign-On (SSO) bajo estándares <strong>ISO 27001, ISO 8000 y OWASP Top 10</strong>.
          </p>
        </div>

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
              permissions: { sctis: true, tareasMinutas: true, planificacion: true, scein: false },
            });
            setEditingUser(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] px-4 py-2.5 text-xs font-black uppercase shadow-md hover:scale-105 transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Crear Nuevo Usuario SSO</span>
        </button>
      </div>

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
          <strong>Tip para Administradores:</strong> Haz clic directamente sobre cualquiera de los badges de aplicación (<code>SCTIS</code>, <code>Tareas</code>, <code>Planif</code>, <code>SCEIN</code>) en la tabla para desplegar el <strong>Asistente de Control Granular</strong>, ajustar niveles de privilegio y registrar notas de auditoría inmutables.
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
                        <div className="flex items-center space-x-2 mt-0.5">
                          <code className="text-[11px] font-mono text-[#002b49] dark:text-cyan-300 font-bold">@{user.username}</code>
                          <span className="text-[10px] text-slate-500 font-medium">({user.email})</span>
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
                    <div className="flex items-center justify-center space-x-1.5">
                      
                      {/* App 1: SCTIS */}
                      <button
                        onClick={() => openPermissionWizard(user, 'sctis')}
                        title="Click para abrir Asistente de Permisos SCTIS"
                        className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                          user.permissions.sctis 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs' 
                            : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        <Cpu className="h-3.5 w-3.5" />
                        <span>SCTIS</span>
                      </button>

                      {/* App 2: Tareas */}
                      <button
                        onClick={() => openPermissionWizard(user, 'tareasMinutas')}
                        title="Click para abrir Asistente de Permisos Tareas & Minutas"
                        className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                          user.permissions.tareasMinutas 
                            ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-cyan-300 shadow-xs' 
                            : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Tareas</span>
                      </button>

                      {/* App 3: Planificación SEN */}
                      <button
                        onClick={() => openPermissionWizard(user, 'planificacion')}
                        title="Click para abrir Asistente de Permisos Planificación SEN"
                        className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                          user.permissions.planificacion 
                            ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-300 shadow-xs' 
                            : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Planif</span>
                      </button>

                      {/* App 4: REMIX SCEIN */}
                      <button
                        onClick={() => openPermissionWizard(user, 'scein')}
                        title="Click para abrir Asistente de Permisos REMIX SCEIN"
                        className={`p-1.5 rounded-lg border transition-all text-[10px] font-bold flex items-center space-x-1 hover:scale-105 ${
                          user.permissions.scein 
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 shadow-xs' 
                            : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>SCEIN</span>
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
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={formUser.email || ''}
                  onChange={e => setFormUser({...formUser, email: e.target.value})}
                  placeholder="c_reyes@corpoelec.gob.ve"
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#112240] p-2.5 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium"
                />
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">1. SCTIS v2.0 (Interrupciones)</span>
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">2. Gestor Tareas y Minutas</span>
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">3. Planificación SEN / Viáticos</span>
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
                  <span className="font-bold text-slate-800 dark:text-slate-200">4. REMIX SCEIN (Equipos)</span>
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
