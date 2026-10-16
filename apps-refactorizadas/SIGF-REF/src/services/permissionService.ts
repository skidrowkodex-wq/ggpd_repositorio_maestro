/**
 * SERVICIO DE PERMISOS POR ROL (RBAC SEN)
 * ------------------------------------------------------------------
 * Matriz rol × acción que controla qué botones / vistas ve cada perfil.
 *
 * Persistencia HÍBRIDA (ISO/IEC 27001):
 *   1. localStorage  -> caché local instantánea y modo offline.
 *   2. InsForge (REST)-> fuente de verdad sincronizada entre sesiones.
 *
 * Si la nube falla, la app opera con la caché local y reintenta al guardar.
 */

import { insforgeService, InsForgePermisoRow } from './insforgeService';

export type UserRoleKey = 'admin' | 'nacional' | 'gerente' | 'estado';

export type PermissionCategory = 'navegacion' | 'flota' | 'sistema';

export interface PermissionActionDef {
  id: string;
  label: string;
  description: string;
  category: PermissionCategory;
  /** Si es true, el rol admin SIEMPRE la tiene activa (evita bloqueo total). */
  adminAlways?: boolean;
}

export type PermissionMatrix = Record<UserRoleKey, Record<string, boolean>>;

export interface PermissionSyncResult {
  ok: boolean;
  synced: boolean;
  message: string;
}

const STORAGE_KEY_PERMISSIONS = 'corpoelec_flota_permissions_v1';

export const USER_ROLES: { key: UserRoleKey; label: string; description: string }[] = [
  { key: 'admin', label: 'Administrador', description: 'Control total del sistema (GGPD / Sistemas SEN).' },
  { key: 'nacional', label: 'Director Nacional', description: 'Supervisión nacional sobre todos los estados.' },
  { key: 'gerente', label: 'Gerente / Cuadro Mando', description: 'Métricas, KPIs y consolidación gerencial.' },
  { key: 'estado', label: 'Coordinador de Estado', description: 'Operación limitada a su entidad territorial.' }
];

/**
 * INVENTARIO DE ACCIONES CONTROLABLES (ids estables — no renombrar).
 */
export const PERMISSION_ACTIONS: PermissionActionDef[] = [
  // Navegación
  { id: 'tab_formulario', label: 'Formulario de Captura', description: 'Pestaña para registrar / editar fichas de vehículos.', category: 'navegacion' },
  { id: 'tab_consolidado', label: 'Consolidado de Flota', description: 'Pestaña con la tabla consolidada y filtros.', category: 'navegacion' },
  { id: 'tab_gerencia', label: 'Cuadro Mando Gerencial', description: 'Pestaña de métricas, KPIs y auditoría.', category: 'navegacion' },
  { id: 'tab_permisos', label: 'Control de Permisos', description: 'Página administrativa de esta matriz de permisos.', category: 'navegacion', adminAlways: true },

  // Flota
  { id: 'btn_import_excel', label: 'Cargar Excel / CSV a BD', description: 'Importar registros masivos de flota.', category: 'flota' },
  { id: 'btn_export_excel', label: 'Exportar Excel de Flota', description: 'Descargar la flota consolidada en .xlsx.', category: 'flota' },
  { id: 'btn_edit_vehiculo', label: 'Editar Vehículo', description: 'Modificar una ficha técnica existente.', category: 'flota' },
  { id: 'btn_delete_vehiculo', label: 'Eliminar Vehículo', description: 'Borrar un registro del parque automotor.', category: 'flota' },
  { id: 'btn_vaciar_bd', label: 'Vaciar Base de Datos', description: 'Eliminar toda la flota y reiniciar correlativos.', category: 'flota' },

  // Sistema
  { id: 'btn_users_mgmt', label: 'Gestión de Usuarios', description: 'Administrar perfiles y conexión de usuarios.', category: 'sistema' },
  { id: 'btn_backup', label: 'Respaldos / Puntos de Control', description: 'Crear y restaurar respaldos (SISFLOTA01).', category: 'sistema' },
  { id: 'btn_changepass', label: 'Cambiar Contraseña', description: 'Cambio de clave de la entidad actual.', category: 'sistema' },
  { id: 'btn_password_resets', label: 'Solicitudes de Reinicio de Clave', description: 'Bandeja administrativa de reinicios de clave.', category: 'sistema' },
  { id: 'btn_pg_manager', label: 'Gestor PostgreSQL', description: 'Esquema y migración a PostgreSQL / InsForge.', category: 'sistema' },
  { id: 'btn_theme', label: 'Modo Oscuro / Claro', description: 'Alternar el tema visual de la interfaz.', category: 'sistema' },
  { id: 'btn_audit_history', label: 'Ver Historial de Auditoría', description: 'Consulta trazable de eventos del sistema (COBIT MEA02).', category: 'sistema' },
  { id: 'btn_catalogs', label: 'Gestión de Catálogos Maestros', description: 'Administrar marcas, tipos, gerencias y centros.', category: 'sistema' }
];

const ALL_ACTION_IDS = PERMISSION_ACTIONS.map(a => a.id);

function buildRole(overrides: Partial<Record<string, boolean>> = {}): Record<string, boolean> {
  const role: Record<string, boolean> = {};
  ALL_ACTION_IDS.forEach(id => {
    role[id] = overrides[id] !== undefined ? Boolean(overrides[id]) : true;
  });
  // Acciones admin-only apagadas salvo que se indiquen
  return role;
}

/**
 * VALORES POR DEFECTO — replican EXACTAMENTE el comportamiento actual de la app
 * (no rompe nada al activar el sistema de permisos).
 *
 * Excepción consciente (integridad de datos maestros, ISO 8000-110):
 * `btn_catalogs` (edición de marcas, tipos, gerencias, centros de servicios y
 * regiones) queda restringido por defecto al `admin`. Esas listas alimentan el
 * formulario de captura y el validador de importación, por lo que su
 * parametrización centralizada evita divergencias entre territorios. Antes de
 * cablearse la vista era una acción "huérfana" (sin UI) habilitada en todos los
 * roles; al exponerse se restringe al nivel central. Un administrador puede
 * habilitarla por rol desde la página "Control de Permisos" si la operación
 * territorial lo requiere.
 */
export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  admin: buildRole(), // admin: todas activas
  nacional: buildRole({
    tab_permisos: false,
    btn_password_resets: false,
    btn_vaciar_bd: false,
    btn_catalogs: false
  }),
  gerente: buildRole({
    tab_formulario: false, // comportamiento actual: gerente no ve el formulario
    tab_permisos: false,
    btn_password_resets: false,
    btn_vaciar_bd: false,
    btn_catalogs: false
  }),
  estado: buildRole({
    tab_permisos: false,
    btn_password_resets: false,
    btn_vaciar_bd: false,
    btn_catalogs: false
  })
};

/** Asegura que un rol admin nunca quede sin las acciones críticas. */
function normalizeMatrix(raw: Partial<PermissionMatrix> | null | undefined): PermissionMatrix {
  const result = {} as PermissionMatrix;
  USER_ROLES.forEach(({ key }) => {
    const source = raw?.[key] || {};
    const role: Record<string, boolean> = {};
    ALL_ACTION_IDS.forEach(id => {
      const def = DEFAULT_PERMISSIONS[key][id];
      role[id] = typeof source[id] === 'boolean' ? source[id] : def;
    });
    // El admin conserva siempre las acciones adminAlways y el total del sistema.
    if (key === 'admin') {
      PERMISSION_ACTIONS.forEach(a => {
        if (a.adminAlways) role[a.id] = true;
      });
      role.tab_permisos = true;
    }
    result[key] = role;
  });
  return result;
}

type Listener = (matrix: PermissionMatrix) => void;
const listeners = new Set<Listener>();

function notify(matrix: PermissionMatrix) {
  listeners.forEach(fn => {
    try {
      fn(matrix);
    } catch (e) {
      console.error('permissionService listener error', e);
    }
  });
}

function readLocal(): PermissionMatrix | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
    if (saved) return normalizeMatrix(JSON.parse(saved));
  } catch (e) {
    console.error('Error leyendo permisos locales', e);
  }
  return null;
}

function writeLocal(matrix: PermissionMatrix) {
  try {
    localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(matrix));
  } catch (e) {
    console.error('Error guardando permisos locales', e);
  }
}

/** Convierte la matriz a filas planas para InsForge. */
function matrixToRows(matrix: PermissionMatrix, updatedBy: string): Array<Omit<InsForgePermisoRow, 'id' | 'actualizado_en'>> {
  const rows: Array<Omit<InsForgePermisoRow, 'id' | 'actualizado_en'>> = [];
  USER_ROLES.forEach(({ key }) => {
    ALL_ACTION_IDS.forEach(actionId => {
      rows.push({
        rol: key,
        accion: actionId,
        habilitado: Boolean(matrix[key][actionId]),
        actualizado_por: updatedBy || null
      });
    });
  });
  return rows;
}

/** Reconstruye la matriz desde filas de InsForge (parcial). */
function rowsToMatrix(rows: InsForgePermisoRow[], base: PermissionMatrix | null): PermissionMatrix {
  const seed: PermissionMatrix = normalizeMatrix(base);
  const partial: Partial<PermissionMatrix> = {};
  rows.forEach(r => {
    const rol = r.rol as UserRoleKey;
    if (!USER_ROLES.some(u => u.key === rol)) return;
    if (partial[rol] === undefined) partial[rol] = { ...seed[rol] };
    if (ALL_ACTION_IDS.includes(r.accion)) {
      partial[rol]![r.accion] = Boolean(r.habilitado);
    }
  });
  return normalizeMatrix({ ...seed, ...partial });
}

export const permissionService = {
  getActions(): PermissionActionDef[] {
    return PERMISSION_ACTIONS;
  },

  /** Matriz local actual (caché) o defaults. */
  getMatrix(): PermissionMatrix {
    return readLocal() || normalizeMatrix(DEFAULT_PERMISSIONS);
  },

  getDefaultMatrix(): PermissionMatrix {
    return normalizeMatrix(DEFAULT_PERMISSIONS);
  },

  /** ¿El rol tiene habilitada la acción? */
  canForMatrix(matrix: PermissionMatrix, role: UserRoleKey | string, actionId: string): boolean {
    const roleKey = (role as UserRoleKey);
    const roleMatrix = matrix[roleKey];
    if (!roleMatrix) return false;
    return Boolean(roleMatrix[actionId]);
  },

  /** Guarda la matriz en caché local y notifica a la UI. */
  setLocalMatrix(matrix: PermissionMatrix): PermissionMatrix {
    const normalized = normalizeMatrix(matrix);
    writeLocal(normalized);
    notify(normalized);
    return normalized;
  },

  /**
   * Guarda la matriz: SIEMPRE local; intenta sincronizar con InsForge.
   * Nunca lanza error — devuelve el resultado de sincronización.
   */
  async saveMatrix(matrix: PermissionMatrix, updatedBy: string): Promise<PermissionSyncResult> {
    const normalized = normalizeMatrix(matrix);
    writeLocal(normalized);
    notify(normalized);

    if (!insforgeService.isConfigured()) {
      return { ok: true, synced: false, message: 'Guardado localmente (InsForge no configurado).' };
    }

    try {
      const roles = USER_ROLES.map(u => u.key);
      await insforgeService.pushPermisos(matrixToRows(normalized, updatedBy), roles);
      return { ok: true, synced: true, message: 'Permisos guardados y sincronizados con InsForge.' };
    } catch (e) {
      console.warn('No se pudo sincronizar permisos con InsForge', e);
      return {
        ok: true,
        synced: false,
        message: 'Guardado localmente. Sin conexión con InsForge: se sincronizará al reintentar.'
      };
    }
  },

  /**
   * Descarga la matriz desde InsForge y actualiza la caché local.
   * Devuelve null si no hay datos o la nube no responde.
   */
  async syncFromCloud(): Promise<PermissionMatrix | null> {
    if (!insforgeService.isConfigured()) return null;
    try {
      const rows = await insforgeService.fetchPermisos();
      if (!Array.isArray(rows) || rows.length === 0) return null;
      const merged = rowsToMatrix(rows, readLocal());
      writeLocal(merged);
      notify(merged);
      return merged;
    } catch (e) {
      console.warn('No se pudo leer permisos desde InsForge', e);
      return null;
    }
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
