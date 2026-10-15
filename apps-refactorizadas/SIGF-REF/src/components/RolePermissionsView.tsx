import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  Loader2,
  Navigation,
  Car,
  Settings2,
  Lock,
  Info
} from 'lucide-react';
import {
  permissionService,
  PERMISSION_ACTIONS,
  USER_ROLES,
  UserRoleKey,
  PermissionMatrix,
  PermissionCategory
} from '../services/permissionService';
import { auditService } from '../services/auditService';

interface RolePermissionsViewProps {
  currentUserEmail: string;
  isDarkMode: boolean;
}

type SyncState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; synced: boolean; message: string };

const CATEGORY_META: Record<PermissionCategory, { label: string; icon: React.ReactNode; hint: string }> = {
  navegacion: {
    label: 'Navegación (Pestañas)',
    icon: <Navigation className="w-4 h-4 text-[#c9a227]" />,
    hint: 'Controla qué módulos aparecen en el menú lateral y en la barra móvil.'
  },
  flota: {
    label: 'Operación de Flota',
    icon: <Car className="w-4 h-4 text-[#c9a227]" />,
    hint: 'Acciones sobre el parque automotor: importar, exportar, editar, eliminar y vaciar.'
  },
  sistema: {
    label: 'Herramientas de Sistema',
    icon: <Settings2 className="w-4 h-4 text-[#c9a227]" />,
    hint: 'Seguridad, respaldos, auditoría y administración.'
  }
};

const CATEGORY_ORDER: PermissionCategory[] = ['navegacion', 'flota', 'sistema'];

export const RolePermissionsView: React.FC<RolePermissionsViewProps> = ({ currentUserEmail, isDarkMode }) => {
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => permissionService.getMatrix());
  const [savedMatrix, setSavedMatrix] = useState<PermissionMatrix>(() => permissionService.getMatrix());
  const [sync, setSync] = useState<SyncState>({ kind: 'idle' });

  useEffect(() => {
    const unsub = permissionService.subscribe(next => {
      setMatrix(next);
      setSavedMatrix(next);
    });
    return () => {
      unsub();
    };
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(matrix) !== JSON.stringify(savedMatrix),
    [matrix, savedMatrix]
  );

  const toggle = (role: UserRoleKey, actionId: string) => {
    // El admin nunca puede perder el acceso al panel de permisos.
    if (role === 'admin' && actionId === 'tab_permisos') return;
    setMatrix(prev => ({
      ...prev,
      [role]: { ...prev[role], [actionId]: !prev[role][actionId] }
    }));
  };

  const toggleColumn = (role: UserRoleKey, value: boolean) => {
    if (role === 'admin') return; // la columna admin permanece fija (control total)
    setMatrix(prev => {
      const nextRole: Record<string, boolean> = { ...prev[role] };
      PERMISSION_ACTIONS.forEach(a => {
        nextRole[a.id] = value;
      });
      return { ...prev, [role]: nextRole };
    });
  };

  const handleSave = async () => {
    setSync({ kind: 'saving' });
    const result = await permissionService.saveMatrix(matrix, currentUserEmail);
    auditService.logAction(
      currentUserEmail,
      'CAMBIO_PERMISOS',
      `Actualización de matriz de permisos por rol (${result.synced ? 'sincronizado InsForge' : 'solo local'})`
    );
    setSavedMatrix(permissionService.getMatrix());
    setSync({ kind: 'saved', synced: result.synced, message: result.message });
    setTimeout(() => setSync(prev => (prev.kind === 'saved' ? { kind: 'idle' } : prev)), 6000);
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restaurar la matriz de permisos a los valores por defecto del sistema?')) {
      setMatrix(permissionService.getDefaultMatrix());
    }
  };

  const restoreFromCloud = async () => {
    setSync({ kind: 'saving' });
    const cloud = await permissionService.syncFromCloud();
    if (cloud) {
      setMatrix(cloud);
      setSavedMatrix(cloud);
      setSync({ kind: 'saved', synced: true, message: 'Matriz recuperada desde InsForge.' });
    } else {
      setSync({ kind: 'saved', synced: false, message: 'No se pudo leer InsForge (sin datos o sin conexión).' });
    }
    setTimeout(() => setSync(prev => (prev.kind === 'saved' ? { kind: 'idle' } : prev)), 6000);
  };

  const applyTemplate = (template: 'lectura' | 'operador' | 'restringido') => {
    setMatrix(prev => {
      const next: PermissionMatrix = JSON.parse(JSON.stringify(prev));
      const setAll = (role: UserRoleKey, value: boolean) => {
        if (role === 'admin') return;
        PERMISSION_ACTIONS.forEach(a => {
          next[role][a.id] = value;
        });
        next[role].tab_permisos = false;
        next[role].btn_password_resets = false;
        next[role].btn_vaciar_bd = false;
      };
      if (template === 'lectura') {
        // Solo consulta: ver consolidado/gerencia y exportar
        setAll('estado', false);
        next.estado.tab_consolidado = true;
        next.estado.btn_export_excel = true;
      } else if (template === 'operador') {
        // Operador de campo: formulario + consolidado + edición
        setAll('estado', false);
        next.estado.tab_formulario = true;
        next.estado.tab_consolidado = true;
        next.estado.btn_edit_vehiculo = true;
        next.estado.btn_export_excel = true;
      } else {
        // Restringido: solo formulario de captura
        setAll('estado', false);
        next.estado.tab_formulario = true;
      }
      return next;
    });
  };

  const cardBase = isDarkMode
    ? 'bg-[#0d241b] border-white/10 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const rowHover = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50';
  const divider = isDarkMode ? 'border-white/10' : 'border-slate-100';

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className={`rounded-2xl border shadow-sm p-5 ${cardBase}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0b3d2e] border border-[#c9a227] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Control de Permisos por Rol
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#c9a227] text-[#0b3d2e]">
                  Solo Administrador
                </span>
              </h2>
              <p className={`text-xs mt-1 ${subText}`}>
                Defina qué botones y módulos ve cada perfil. Los cambios aplican a <strong>todos los usuarios</strong> del rol seleccionado.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={restoreFromCloud}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isDarkMode ? 'border-white/15 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'
              }`}
              title="Recuperar la matriz guardada en InsForge"
            >
              <Cloud className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Recuperar de InsForge</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isDarkMode ? 'border-white/15 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'
              }`}
              title="Restaurar los valores por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Valores por defecto</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || sync.kind === 'saving'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-white transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1a5f47 0%, #0b3d2e 100%)', border: '1px solid #c9a227' }}
            >
              {sync.kind === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-[#c9a227]" />}
              <span>{sync.kind === 'saving' ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </div>

        {/* Barra de estado de sincronización */}
        {sync.kind === 'saved' && (
          <div
            className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${
              sync.synced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
            }`}
          >
            {sync.synced ? <Cloud className="w-4 h-4 shrink-0" /> : <CloudOff className="w-4 h-4 shrink-0" />}
            <span>{sync.message}</span>
          </div>
        )}

        {isDirty && sync.kind !== 'saving' && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Hay cambios sin guardar.</span>
          </div>
        )}

        {/* Plantillas rápidas */}
        <div className={`mt-4 pt-4 border-t ${divider} flex flex-wrap items-center gap-2`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${subText}`}>Plantillas rápidas (rol Estado):</span>
          <button onClick={() => applyTemplate('operador')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-[#0b3d2e]/30 text-[#0b3d2e] hover:bg-[#0b3d2e]/10 dark:text-emerald-300 dark:border-emerald-700 cursor-pointer">
            Operador de Campo
          </button>
          <button onClick={() => applyTemplate('lectura')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-[#0b3d2e]/30 text-[#0b3d2e] hover:bg-[#0b3d2e]/10 dark:text-emerald-300 dark:border-emerald-700 cursor-pointer">
            Solo Consulta
          </button>
          <button onClick={() => applyTemplate('restringido')} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-[#0b3d2e]/30 text-[#0b3d2e] hover:bg-[#0b3d2e]/10 dark:text-emerald-300 dark:border-emerald-700 cursor-pointer">
            Restringido
          </button>
        </div>
      </div>

      {/* Matriz */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBase}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[720px]">
            <thead>
              <tr className={`border-b ${divider}`}>
                <th className={`text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider ${subText}`}>
                  Botón / Acción
                </th>
                {USER_ROLES.map(role => (
                  <th key={role.key} className="px-3 py-3 text-center align-bottom">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-black uppercase tracking-wider">{role.label}</span>
                      <span className={`text-[10px] font-normal ${subText}`}>{role.key}</span>
                      {role.key === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#c9a227]" title="El administrador conserva el control total">
                          <Lock className="w-3 h-3" /> BLOQUEADO
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleColumn(role.key, true)}
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer"
                            title={`Activar todo para ${role.label}`}
                          >
                            Todo
                          </button>
                          <button
                            onClick={() => toggleColumn(role.key, false)}
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 cursor-pointer"
                            title={`Desactivar todo para ${role.label}`}
                          >
                            Nada
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ORDER.map(category => {
                const actions = PERMISSION_ACTIONS.filter(a => a.category === category);
                if (actions.length === 0) return null;
                const meta = CATEGORY_META[category];
                return (
                  <React.Fragment key={category}>
                    <tr className={isDarkMode ? 'bg-white/5' : 'bg-slate-50'}>
                      <td colSpan={USER_ROLES.length + 1} className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {meta.icon}
                          <span className="text-[11px] font-black uppercase tracking-wider">{meta.label}</span>
                          <span className={`text-[10px] font-normal hidden md:inline ${subText}`}>— {meta.hint}</span>
                        </div>
                      </td>
                    </tr>
                    {actions.map((action, idx) => (
                      <tr key={action.id} className={`border-b ${divider} ${rowHover} ${idx % 2 === 0 ? '' : isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-50/40'}`}>
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-xs">{action.label}</div>
                          <div className={`text-[11px] ${subText}`}>{action.description}</div>
                          <div className={`text-[10px] font-mono mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{action.id}</div>
                        </td>
                        {USER_ROLES.map(role => {
                          const checked = matrix[role.key]?.[action.id] ?? false;
                          const locked = role.key === 'admin';
                          return (
                            <td key={role.key} className="px-3 py-2.5 text-center">
                              <label className={`inline-flex items-center justify-center ${locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-[#1a5f47] cursor-pointer disabled:cursor-not-allowed"
                                  checked={checked}
                                  disabled={locked}
                                  onChange={() => toggle(role.key, action.id)}
                                  aria-label={`${action.label} para ${role.label}`}
                                />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`px-4 py-3 border-t ${divider} flex items-center gap-2 ${subText}`}>
          <Info className="w-3.5 h-3.5 shrink-0 text-[#c9a227]" />
          <p className="text-[11px]">
            El rol <strong>Administrador</strong> conserva siempre el control total (columna bloqueada) conforme a ISO/IEC 27001.
            Cada cambio se registra en el historial de auditoría (ISACA COBIT 2019 · MEA02).
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className={`rounded-2xl border shadow-sm p-4 ${cardBase}`}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-black uppercase tracking-wider">Resumen de acciones habilitadas</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {USER_ROLES.map(role => {
            const total = PERMISSION_ACTIONS.length;
            const active = PERMISSION_ACTIONS.filter(a => matrix[role.key]?.[a.id]).length;
            const pct = Math.round((active / total) * 100);
            return (
              <div key={role.key} className={`rounded-xl border p-3 ${divider}`}>
                <div className="text-[11px] font-bold uppercase tracking-wider">{role.label}</div>
                <div className="text-xl font-black text-[#0b3d2e] dark:text-emerald-300 mt-1">
                  {active}<span className={`text-xs font-semibold ${subText}`}>/{total}</span>
                </div>
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <div className="h-full bg-gradient-to-r from-[#1a5f47] to-[#c9a227]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
