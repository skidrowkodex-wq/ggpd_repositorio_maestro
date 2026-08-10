import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Lock, 
  CheckCircle2, 
  X, 
  Edit3, 
  Eye, 
  EyeOff, 
  FileCheck, 
  Activity, 
  AlertTriangle, 
  Database, 
  Search,
  RefreshCw,
  Download,
  Shield,
  Layers,
  UserCheck
} from 'lucide-react';
import { UserProfile, UserRole, IsoAuditLogEntry, IsoDataQualityMetric } from '../types';

interface UserManagementModalProps {
  currentProfile: UserProfile;
  usersList: UserProfile[];
  onUpdateUsersList: (users: UserProfile[]) => void;
  onSelectProfile?: (profile: UserProfile) => void;
  auditLogs: IsoAuditLogEntry[];
  qualityMetrics: IsoDataQualityMetric[];
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentProfile,
  usersList,
  onUpdateUsersList,
  onSelectProfile,
  auditLogs,
  qualityMetrics,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'quality'>('users');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Show passwords state
  const [showPasswords, setShowPasswords] = useState<boolean>(false);

  // User Edit / Add Form State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    role: UserRole;
    cargo: string;
    unidadOrganizativa: string;
    activo: boolean;
  }>({
    name: '',
    username: '',
    password: '',
    role: 'analista',
    cargo: 'Analista de Planificación',
    unidadOrganizativa: 'División de Planificación',
    activo: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Filter Users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'analista',
      cargo: 'Analista de Planificación',
      unidadOrganizativa: 'División de Planificación',
      activo: true,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleStartEdit = (user: UserProfile) => {
    setEditingUser(user);
    setIsCreating(false);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password || `${user.username.split('_')[1] || 'Corpoelec'}2026.`,
      role: user.role,
      cargo: user.cargo,
      unidadOrganizativa: user.unidadOrganizativa || 'Gerencia Gestión de Planificación',
      activo: user.activo,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  // Auto-generate username & password when typing name
  const handleNameChange = (nameVal: string) => {
    let updatedUsername = formData.username;
    let updatedPassword = formData.password;

    if (isCreating) {
      const parts = nameVal.trim().split(' ');
      if (parts.length >= 2) {
        const firstName = parts[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const lastName = parts[parts.length - 1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        updatedUsername = `${firstName.charAt(0)}_${lastName}`;
        
        const capLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        updatedPassword = `${capLastName}2026.`;
      }
    }

    setFormData({
      ...formData,
      name: nameVal,
      username: updatedUsername,
      password: updatedPassword,
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      setFormError('Por favor complete todos los campos obligatorios (Nombre, Usuario y Clave).');
      return;
    }

    // Password ISO 27001 validation rule (At least 8 chars)
    if (formData.password.length < 6) {
      setFormError('La contraseña debe cumplir con ISO 27001 (Mínimo 6 caracteres).');
      return;
    }

    const canUpload = formData.role === 'admin' || formData.role === 'supervisor';
    const canManage = formData.role === 'admin';

    if (isCreating) {
      // Check duplicate username
      if (usersList.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
        setFormError(`El nombre de usuario "${formData.username}" ya existe en el sistema.`);
        return;
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        cargo: formData.cargo,
        unidadOrganizativa: formData.unidadOrganizativa,
        activo: formData.activo,
        canUploadDocuments: canUpload,
        canManageUsers: canManage,
        canEditTaskStatus: true,
        lastLogin: new Date().toISOString(),
      };

      onUpdateUsersList([...usersList, newUser]);
      setFormSuccess(`Usuario @${newUser.username} creado exitosamente con credenciales ISO 27001.`);
      setIsCreating(false);
    } else if (editingUser) {
      const updatedList = usersList.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formData.name,
            username: formData.username,
            password: formData.password,
            role: formData.role,
            cargo: formData.cargo,
            unidadOrganizativa: formData.unidadOrganizativa,
            activo: formData.activo,
            canUploadDocuments: canUpload,
            canManageUsers: canManage,
          };
        }
        return u;
      });

      onUpdateUsersList(updatedList);
      setFormSuccess(`Perfil del usuario @${formData.username} actualizado correctamente.`);
      setEditingUser(null);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, activo: !u.activo };
      }
      return u;
    });
    onUpdateUsersList(updated);
  };

  const handleExportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AUDITORIA_ISO27001_SCTAP_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/20 text-[#E30613] rounded-xl border border-red-500/30">
              <ShieldCheck className="w-6 h-6 text-[#E30613]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-white text-lg">Módulo de Administración y Gobierno ISO</h2>
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  ISO 27001 / ISO 8000
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Gestión de identidades, control de accesos (RBAC), auditoría de seguridad y calidad de datos SCTAP CORPOELEC.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-5 pt-2 flex items-center space-x-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => { setActiveTab('users'); setIsCreating(false); setEditingUser(null); }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-white border-slate-200 text-[#002B49] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-[#002B49]" />
            <span>Directorio de Usuarios ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'bg-white border-slate-200 text-[#002B49] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Auditoría e Historial (ISO 27001)</span>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer flex items-center space-x-2 ${
              activeTab === 'quality'
                ? 'bg-white border-slate-200 text-[#002B49] shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Calidad de Datos (ISO 8000)</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              {/* Form Banner when Adding or Editing */}
              {(isCreating || editingUser) && (
                <form onSubmit={handleSaveUser} className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h3 className="font-extrabold text-[#002B49] text-sm flex items-center space-x-2">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span>{isCreating ? 'Registrar Nuevo Usuario en el Sistema' : `Editar Perfil: ${editingUser?.name}`}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setIsCreating(false); setEditingUser(null); }}
                      className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                    >
                      Cancelar
                    </button>
                  </div>

                  {formError && (
                    <div className="p-2.5 bg-red-100 border border-red-300 text-red-800 text-xs rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-xl font-bold">
                      {formSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ej: Walter Prato"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Usuario (Formato n_apellido) *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                        placeholder="ej: w_prato"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Contraseña (ISO 27001) *</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="ej: Prato2026."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Rol y Permisos de Carga *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="analista">Analista / Planificación (Lectura y Carga de Avances)</option>
                        <option value="supervisor">Supervisor (Aprobación y Carga de Minutas PDF)</option>
                        <option value="admin">Administrador Sistema (Acceso Total y Gestión de Usuarios)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Cargo Institucional</label>
                      <input
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        placeholder="Ej: Analista Senior"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Unidad Organizativa</label>
                      <input
                        type="text"
                        value={formData.unidadOrganizativa}
                        onChange={(e) => setFormData({ ...formData, unidadOrganizativa: e.target.value })}
                        placeholder="Ej: División de Planificación"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Usuario Activo en el Dominio CORPOELEC</span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#002B49] hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      {isCreating ? 'Guardar Nuevo Usuario' : 'Actualizar Perfil ISO'}
                    </button>
                  </div>
                </form>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por usuario o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                  >
                    <option value="all">Todos los Roles</option>
                    <option value="admin">Administradores</option>
                    <option value="supervisor">Supervisores</option>
                    <option value="analista">Planificación / Analistas</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswords ? 'Ocultar Claves' : 'Mostrar Claves ISO'}</span>
                  </button>

                  <button
                    onClick={handleStartCreate}
                    className="px-4 py-1.5 bg-[#E30613] hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Nuevo Usuario</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Usuario / Nombre</th>
                      <th className="p-3">Clave Asignada</th>
                      <th className="p-3">Rol & Privilegios</th>
                      <th className="p-3">Cargo Institucional</th>
                      <th className="p-3">Estado ISO</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span className="font-mono bg-slate-100 text-[#002B49] px-1.5 py-0.5 rounded border border-slate-300 font-extrabold text-[11px]">
                              @{usr.username}
                            </span>
                            <span>{usr.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{usr.unidadOrganizativa || 'Gerencia de Planificación'}</div>
                        </td>

                        <td className="p-3 font-mono text-slate-800">
                          {showPasswords ? (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-extrabold">
                              {usr.password || `${usr.username.split('_')[1] || 'Corpoelec'}2026.`}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">••••••••</span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                            usr.role === 'admin' 
                              ? 'bg-purple-100 text-purple-900 border-purple-200' 
                              : usr.role === 'supervisor'
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {usr.role === 'admin' ? 'Administrador' : usr.role === 'supervisor' ? 'Supervisor' : 'Planificación'}
                          </span>
                        </td>

                        <td className="p-3 text-slate-700 font-medium max-w-[200px] truncate">
                          {usr.cargo}
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() => handleToggleUserStatus(usr.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center space-x-1 cursor-pointer ${
                              usr.activo 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${usr.activo ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            <span>{usr.activo ? 'Activo' : 'Inactivo'}</span>
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {onSelectProfile && (
                              <button
                                onClick={() => {
                                  onSelectProfile(usr);
                                  onClose();
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                                title={`Iniciar sesión inmediatamente como @${usr.username}`}
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Iniciar Sesión</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEdit(usr)}
                              className="px-2 py-1 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                              title="Editar usuario"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ISO 27001 AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <h4 className="font-extrabold text-[#E30613] text-sm flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Registro de Trazabilidad ISO 27001 A.12.4</span>
                  </h4>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Registro inalterable de accesos, consultas a Google Drive, actualizaciones de estatus y cargas de minutas.
                  </p>
                </div>

                <button
                  onClick={handleExportAuditLogs}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Informe JSON ISO</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Marca de Tiempo (UTC)</th>
                      <th className="p-3">Usuario / Rol</th>
                      <th className="p-3">Acción Registrada</th>
                      <th className="p-3">Módulo Afectado</th>
                      <th className="p-3">Detalle / IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-600 text-[11px]">
                          {new Date(log.timestamp).toLocaleString('es-VE')}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 font-mono">@{log.usuario}</span>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">{log.rol}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{log.accion}</td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                            {log.modulo}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-[280px] truncate text-[11px]">
                          {log.detalles} <span className="text-slate-400 font-mono">({log.ipAcceso || '10.240.12.01'})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ISO 8000 DATA QUALITY */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900 via-[#002B49] to-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-extrabold text-sm">
                  <Database className="w-5 h-5" />
                  <span>Gobierno y Calidad de Datos ISO 8000-110 / ISO 8000-120</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Evaluación automatizada de las estructuras de minutas, compromisos y usuarios almacenados en la BD Supabase / PostgreSQL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {qualityMetrics.map((qm) => (
                  <div key={qm.codigo} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {qm.codigo} • {qm.norma}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{qm.estado}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{qm.nombre}</h4>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Cumplimiento:</span>
                        <span className="text-emerald-700">{qm.porcentajeCumplimiento}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${qm.porcentajeCumplimiento}%` }} 
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {qm.observacion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistema SCTAP CORPOELEC - Cumplimiento Normativo ISO 27001 / ISO 8000</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Módulo
          </button>
        </div>

      </div>
    </div>
  );
};
