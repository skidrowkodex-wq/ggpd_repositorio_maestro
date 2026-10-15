export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  action: 'CREAR_VEHICULO' | 'EDITAR_VEHICULO' | 'ELIMINAR_VEHICULO' | 'IMPORTAR_EXCEL' | 'RESTAURAR_RESPALDO' | 'VACIAR_BASE' | 'CAMBIO_CLAVE' | 'CAMBIO_PERMISOS';
  details: string;
}

const STORAGE_KEY_AUDIT = 'corpoelec_flota_audit_logs_v1';
const MAX_AUDIT_LOGS = 100;

export const auditService = {
  getLogs(): AuditLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading audit logs', e);
    }
    return [
      {
        id: 'aud-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
        userEmail: 'bk.ggpd.corpoelec@gmail.com',
        action: 'CREAR_VEHICULO',
        details: 'Registro inicial de vehículo N° 0001 (TOYOTA HILUX) en Capital'
      },
      {
        id: 'aud-2',
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        userEmail: 'gerente.operaciones@corpoelec.gob.ve',
        action: 'EDITAR_VEHICULO',
        details: 'Actualización de componentes mecánicos para vehículo N° 0002'
      }
    ];
  },

  logAction(userEmail: string, action: AuditLogEntry['action'], details: string) {
    try {
      const current = this.getLogs();
      const newEntry: AuditLogEntry = {
        id: 'aud-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString(),
        userEmail,
        action,
        details
      };
      const updated = [newEntry, ...current].slice(0, MAX_AUDIT_LOGS);
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving audit log', e);
    }
  },

  getLogsForVehicle(vehicleNumber: string): AuditLogEntry[] {
    const all = this.getLogs();
    const num = (vehicleNumber || '').trim().toUpperCase();
    if (!num) return [];
    return all.filter(l => {
      const d = (l.details || '').toUpperCase();
      return d.includes(num) || d.includes(`N° ${num}`) || d.includes(`VEHÍCULO ${num}`);
    });
  },

  clearLogs() {
    localStorage.removeItem(STORAGE_KEY_AUDIT);
  }
};
