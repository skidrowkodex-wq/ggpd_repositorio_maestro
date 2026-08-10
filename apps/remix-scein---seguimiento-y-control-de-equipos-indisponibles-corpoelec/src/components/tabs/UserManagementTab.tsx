import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { VENEZUELAN_STATES, getStateName } from '../../constants/states';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Lock, 
  Key, 
  MapPin, 
  UserCheck
} from 'lucide-react';

export const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.username) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingUser,
          password: passwordInput
        })
      });
      const data = await res.json();

      if (data.success) {
        setEditingUser(null);
        setPasswordInput('');
        fetchUsers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Error guardando usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario @${name}?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (e) {
      alert('Error al eliminar usuario.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>Gestión de Usuarios del Sistema (Exclusivo ADMIN_NACIONAL)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Administración de cuentas de acceso, asignación de roles RBAC y jurisdicción estatal.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser({
              username: '',
              email: '',
              full_name: '',
              role: 'ANALISTA_ESTATAL',
              state_code: 'TA',
              is_active: true
            });
            setPasswordInput('');
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 dark:text-sky-400" />
            <p>Cargando lista de usuarios del sistema...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Usuario / Nombre</th>
                  <th className="p-3.5">Correo Electrónico</th>
                  <th className="p-3.5">Rol RBAC</th>
                  <th className="p-3.5">Jurisdicción Estatal</th>
                  <th className="p-3.5">Estado Cuenta</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        {u.full_name}
                      </div>
                      <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">@{u.username}</div>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {u.email || 'N/A'}
                    </td>

                    <td className="p-3.5 font-semibold">
                      {u.role === 'ADMIN_NACIONAL' && (
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800">
                          ADMIN NACIONAL
                        </span>
                      )}
                      {u.role === 'ANALISTA_ESTATAL' && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                          ANALISTA ESTATAL
                        </span>
                      )}
                      {u.role === 'AUDITOR' && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                          AUDITOR ISO
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {u.state_code ? (
                        <span className="flex items-center gap-1 text-sky-800 dark:text-cyan-300 font-mono">
                          <MapPin className="w-3.5 h-3.5" />
                          {getStateName(u.state_code)} ({u.state_code})
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">Todos los Estados (Nacional)</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                        </span>
                      ) : (
                        <span className="text-rose-700 dark:text-rose-400 font-semibold text-[11px]">Inactiva</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser({ ...u });
                          setPasswordInput('');
                        }}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 transition"
                        title="Editar usuario"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {u.username !== 'ggpd_admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="p-1.5 rounded bg-rose-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-400 transition"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No se encontraron usuarios registrados.
          </div>
        )}
      </div>

      {/* User Create/Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <UserCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>{editingUser.id ? 'Editar Usuario' : 'Crear Usuario'}</span>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  value={editingUser.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  placeholder="ej: j_perez"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  placeholder="Ing. Juan Pérez"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="juan.perez@corpoelec.gob.ve"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Rol RBAC</label>
                  <select
                    value={editingUser.role || 'ANALISTA_ESTATAL'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ADMIN_NACIONAL">ADMIN_NACIONAL</option>
                    <option value="ANALISTA_ESTATAL">ANALISTA_ESTATAL</option>
                    <option value="AUDITOR">AUDITOR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Estado Asignado</label>
                  <select
                    value={editingUser.state_code || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, state_code: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Nacional (Todos)</option>
                    {VENEZUELAN_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  {editingUser.id ? 'Contraseña (Dejar vacío para no cambiar)' : 'Contraseña de Acceso'}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Guardar Usuario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
