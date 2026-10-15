import React, { useState } from 'react';
import { Shield, User, Globe, MapPin, Building2, CheckCircle2, Lock, X, Search, Sparkles, KeyRound, ShieldAlert } from 'lucide-react';
import { PREDEFINED_SYSTEM_USERS, SystemUser, UserRole } from '../data/defaultUsers';
import { ChangePasswordModal } from './ChangePasswordModal';
import { AdminPasswordResetModal } from './AdminPasswordResetModal';
import { passwordResetService } from '../services/passwordResetService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  onSwitchUser: (email: string, estadoAsignado?: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onSwitchUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [passwordChangeUser, setPasswordChangeUser] = useState<string | null>(null);
  const [isAdminResetsOpen, setIsAdminResetsOpen] = useState(false);
  const pendingResetsCount = passwordResetService.getPendingCount();

  if (!isOpen) return null;

  const filteredUsers = PREDEFINED_SYSTEM_USERS.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.estadoAsignado && u.estadoAsignado.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-300">ADMINISTRADOR (Total)</span>;
      case 'nacional':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 border border-blue-300">NACIONAL (Ámbito País)</span>;
      case 'gerente':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800 border border-purple-300">GERENTE (Métricas y Exportación)</span>;
      case 'estado':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">ESTADO (Restringido)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#c9a227] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0b3d2e] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b-2 border-[#c9a227] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              👥
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight text-white">
                Módulo de Gestión de Usuarios y Permisos SEN
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium hidden sm:block">
                Control de acceso basado en roles (RBAC) · 24 Estados Geográficos, Nacional, Administrador y Gerente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar de filtros */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3d2e]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Botón de Solicitudes de Reinicio */}
            <button
              onClick={() => setIsAdminResetsOpen(true)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                pendingResetsCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/60 animate-pulse'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
              title="Ver solicitudes de reinicio de clave de estados"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#0b3d2e]" />
              <span>Solicitudes ({pendingResetsCount})</span>
            </button>

            <span className="text-xs font-bold text-slate-700 whitespace-nowrap ml-1">Rol:</span>
            {(['all', 'admin', 'nacional', 'gerente', 'estado'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer uppercase ${
                  roleFilter === r
                    ? 'bg-[#0b3d2e] text-white shadow-xs border border-[#c9a227]'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {r === 'all' ? 'Todos' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de Reglas de Acceso */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-xs text-amber-900 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex items-start gap-2">
            <span className="text-red-700 font-bold">🛡️ Admin:</span>
            <span>Acceso total, catálogos, vaciar base y gestión.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-700 font-bold">🌐 Nacional:</span>
            <span>Visualiza y gestiona flota de los 24 estados.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-700 font-bold">📊 Gerente:</span>
            <span>Métricas ejecutivas, KPIs y exportación de consolidados.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">📍 Estado:</span>
            <span>Acceso restringido exclusivamente a su estado asignado.</span>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Directorio de Usuarios Autorizados ({filteredUsers.length} perfiles)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.map((u) => {
              const isCurrent = u.email.toLowerCase() === currentUserEmail.toLowerCase();
              return (
                <div
                  key={u.email}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isCurrent
                      ? 'border-[#0b3d2e] bg-emerald-50/50 shadow-md ring-2 ring-[#0b3d2e]/20'
                      : 'border-slate-200 bg-white hover:border-[#c9a227] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-lg shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">{u.nombre}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[9px] font-black rounded bg-[#0b3d2e] text-white animate-pulse">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <div>{getRoleBadge(u.role)}</div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="font-medium text-slate-800">{u.cargo}</div>
                    {u.estadoAsignado && (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ámbito Restringido: Estado {u.estadoAsignado}</span>
                      </div>
                    )}
                    {u.role === 'nacional' && (
                      <div className="text-blue-800 font-bold">🌐 Ámbito: Todos los Estados (Nacional)</div>
                    )}
                    {u.role === 'admin' && (
                      <div className="text-red-800 font-bold">🛡️ Ámbito: Control Total e Ingesta</div>
                    )}
                    {u.role === 'gerente' && (
                      <div className="text-purple-800 font-bold">📊 Ámbito: Cuadro de Mando Gerencial y Reportes</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">ID SEN: {u.email.split('@')[0].toUpperCase()}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPasswordChangeUser(u.email)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0b3d2e] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-300"
                        title={`Cambiar o restablecer clave institucional para ${u.nombre}`}
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#c9a227]" />
                        <span>Clave</span>
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            if (u.estadoAsignado) {
                              localStorage.setItem('sen_user_state', u.estadoAsignado);
                            }
                            onSwitchUser(u.email, u.estadoAsignado);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#c9a227]" />
                          <span>Conectar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Cambio de Clave */}
        {passwordChangeUser && (
          <ChangePasswordModal
            isOpen={Boolean(passwordChangeUser)}
            onClose={() => setPasswordChangeUser(null)}
            currentUserEmail={passwordChangeUser}
          />
        )}

        {/* Modal de Solicitudes de Reinicio de Clave (Admin) */}
        {isAdminResetsOpen && (
          <AdminPasswordResetModal
            isOpen={isAdminResetsOpen}
            onClose={() => setIsAdminResetsOpen(false)}
            adminUserEmail={currentUserEmail}
          />
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            💡 Consejo: Puedes cambiar de usuario instantáneamente para probar las restricciones de visualización de cada estado.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#0b3d2e] text-white rounded-lg hover:bg-[#1a5f47] transition-colors cursor-pointer"
          >
            Entendido / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
