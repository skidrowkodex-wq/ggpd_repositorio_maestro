import { VehicleRecord, MasterCatalogsState } from '../types/fleet';
import { SYSTEM_CHECKPOINT_SISFLOTA01, SystemCheckpoint } from '../data/systemCheckpoints';

export interface BackupVersion {
  id: string;
  timestamp: string;
  description: string;
  totalVehicles: number;
  vehicles: VehicleRecord[];
  catalogs?: MasterCatalogsState;
  isOfficialCheckpoint?: boolean;
  checkpointCode?: string;
}

const STORAGE_KEY_BACKUPS = 'corpoelec_flota_backups_history_v1';
const MAX_BACKUPS = 20;

export const backupService = {
  /**
   * Obtiene la referencia oficial del Punto de Control SISFLOTA01
   */
  getOfficialCheckpoint(): SystemCheckpoint {
    return SYSTEM_CHECKPOINT_SISFLOTA01;
  },

  /**
   * Obtiene la lista de respaldos incluyendo el Punto de Control SISFLOTA01
   */
  getBackups(): BackupVersion[] {
    const officialCheckpointBackup: BackupVersion = {
      id: 'SISFLOTA01',
      checkpointCode: 'SISFLOTA01',
      isOfficialCheckpoint: true,
      timestamp: SYSTEM_CHECKPOINT_SISFLOTA01.timestamp,
      description: 'Punto de Control Base Oficial SISFLOTA01 (Línea Base Certificada SEN)',
      totalVehicles: SYSTEM_CHECKPOINT_SISFLOTA01.totalVehicles,
      vehicles: SYSTEM_CHECKPOINT_SISFLOTA01.vehicles,
      catalogs: SYSTEM_CHECKPOINT_SISFLOTA01.catalogs
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY_BACKUPS);
      if (data) {
        const storedBackups: BackupVersion[] = JSON.parse(data);
        // Filtrar si ya estuviera duplicado y anteponer el Punto de Control Oficial
        const userBackups = storedBackups.filter(b => b.id !== 'SISFLOTA01');
        return [officialCheckpointBackup, ...userBackups];
      }
    } catch (e) {
      console.error('Error reading backups', e);
    }
    return [officialCheckpointBackup];
  },

  createBackup(vehicles: VehicleRecord[], description: string = 'Respaldo manual de usuario', catalogs?: MasterCatalogsState): BackupVersion {
    const newBackup: BackupVersion = {
      id: `bk-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      description,
      totalVehicles: vehicles.length,
      vehicles: JSON.parse(JSON.stringify(vehicles)),
      catalogs: catalogs ? JSON.parse(JSON.stringify(catalogs)) : undefined
    };

    try {
      const existing = this.getBackups().filter(b => !b.isOfficialCheckpoint);
      const updated = [newBackup, ...existing].slice(0, MAX_BACKUPS);
      localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving backup', e);
    }

    return newBackup;
  },

  restoreBackup(backupId: string): { vehicles: VehicleRecord[]; catalogs?: MasterCatalogsState } | null {
    if (backupId === 'SISFLOTA01') {
      return {
        vehicles: JSON.parse(JSON.stringify(SYSTEM_CHECKPOINT_SISFLOTA01.vehicles)),
        catalogs: JSON.parse(JSON.stringify(SYSTEM_CHECKPOINT_SISFLOTA01.catalogs))
      };
    }

    try {
      const backups = this.getBackups();
      const target = backups.find(b => b.id === backupId);
      if (target) {
        return {
          vehicles: target.vehicles,
          catalogs: target.catalogs
        };
      }
    } catch (e) {
      console.error('Error restoring backup', e);
    }
    return null;
  },

  /**
   * Descarga física del archivo JSON oficial de SISFLOTA01
   */
  exportCheckpointSISFLOTA01JSON(): void {
    try {
      const payload = {
        checkpoint: 'SISFLOTA01',
        title: SYSTEM_CHECKPOINT_SISFLOTA01.title,
        hash: SYSTEM_CHECKPOINT_SISFLOTA01.hash,
        timestamp: SYSTEM_CHECKPOINT_SISFLOTA01.timestamp,
        author: SYSTEM_CHECKPOINT_SISFLOTA01.author,
        description: SYSTEM_CHECKPOINT_SISFLOTA01.description,
        totalVehicles: SYSTEM_CHECKPOINT_SISFLOTA01.totalVehicles,
        vehicles: SYSTEM_CHECKPOINT_SISFLOTA01.vehicles,
        catalogs: SYSTEM_CHECKPOINT_SISFLOTA01.catalogs,
        users: SYSTEM_CHECKPOINT_SISFLOTA01.users
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SISFLOTA01_PUNTO_CONTROL_OFICIAL_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting SISFLOTA01 checkpoint', e);
    }
  },

  exportBackupsJSON(): void {
    try {
      const backups = this.getBackups();
      const blob = new Blob([JSON.stringify(backups, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `corpoelec_flota_respaldos_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting backups', e);
    }
  },

  clearBackups(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_BACKUPS);
    } catch (e) {
      console.error('Error clearing backups', e);
    }
  }
};
