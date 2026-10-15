import React, { useState } from 'react';
import { backupService, BackupVersion } from '../services/backupService';
import { VehicleRecord, MasterCatalogsState } from '../types/fleet';
import { History, ShieldCheck, Download, RotateCcw, Trash2, X, Plus, Shield, Award, CheckCircle2 } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleRecord[];
  catalogs: MasterCatalogsState;
  onRestore: (vehicles: VehicleRecord[], catalogs?: MasterCatalogsState) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  catalogs,
  onRestore
}) => {
  const [backups, setBackups] = useState<BackupVersion[]>(() => backupService.getBackups());
  const [manualNote, setManualNote] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const officialCheckpoint = backupService.getOfficialCheckpoint();

  const handleCreateManualBackup = () => {
    backupService.createBackup(vehicles, manualNote.trim() || 'Respaldo manual de usuario', catalogs);
    setBackups(backupService.getBackups());
    setManualNote('');
    setSuccessMsg('¡Respaldo manual creado exitosamente!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleRestoreCheckpointSISFLOTA01 = () => {
    if (window.confirm(
      '⚠️ ¿CONFIRMAR RESTABLECIMIENTO A SISFLOTA01?\n\n' +
      'Se restaurará el sistema a la Línea Base Oficial "SISFLOTA01" (2026-10-14 03:17:30).\n' +
      'Esto restablecerá los catálogos maestros originales, las unidades base de flota y las credenciales estandarizadas de seguridad.'
    )) {
      const restored = backupService.restoreBackup('SISFLOTA01');
      if (restored) {
        onRestore(restored.vehicles, restored.catalogs);
        setSuccessMsg('✅ ¡Sistema restablecido exitosamente al Punto de Control Oficial SISFLOTA01!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    }
  };

  const handleRestore = (bk: BackupVersion) => {
    if (bk.id === 'SISFLOTA01') {
      handleRestoreCheckpointSISFLOTA01();
      return;
    }

    if (window.confirm(`¿Está seguro de restaurar el respaldo del "${bk.timestamp}" (${bk.description})? Se reemplazarán los datos actuales.`)) {
      const restored = backupService.restoreBackup(bk.id);
      if (restored) {
        onRestore(restored.vehicles, restored.catalogs);
        setSuccessMsg('¡Base de datos restaurada exitosamente desde el respaldo!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Desea eliminar los respaldos manuales secundarios? El Punto de Control Oficial SISFLOTA01 se mantendrá protegido.')) {
      backupService.clearBackups();
      setBackups(backupService.getBackups());
      setSuccessMsg('Respaldos secundarios limpiados. SISFLOTA01 permanece protegido.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border-2 border-[#c9a227]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0b3d2e] text-white shrink-0 border-b border-[#c9a227]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#c9a227]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">Puntos de Control y Control de Versiones SEN</h2>
              <p className="text-[10px] text-emerald-200 font-mono">Línea Base Oficial: SISFLOTA01</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TARJETA DESTACADA: PUNTO DE CONTROL OFICIAL SISFLOTA01 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/10 via-amber-500/10 to-emerald-900/20 border-2 border-[#c9a227] shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0b3d2e] border border-[#c9a227] flex items-center justify-center text-white shadow-inner shrink-0">
                  <Award className="w-5 h-5 text-[#c9a227]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-[#0b3d2e] text-[#c9a227] border border-[#c9a227] font-mono">
                      PUNTO DE CONTROL: SISFLOTA01
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> LÍNEA BASE CERTIFICADA
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {officialCheckpoint.title}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                  Fecha: {officialCheckpoint.timestamp}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[200px]" title={officialCheckpoint.hash}>
                  Hash: {officialCheckpoint.hash}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {officialCheckpoint.description}
            </p>

            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                Estado: <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Protegido</span> · {officialCheckpoint.totalVehicles} unidades base · 19 marcas · 44 modelos
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => backupService.exportCheckpointSISFLOTA01JSON()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors cursor-pointer min-h-[40px]"
                  title="Descargar archivo físico SISFLOTA01.json"
                >
                  <Download className="w-3.5 h-3.5 text-[#c9a227]" />
                  <span>Descargar SISFLOTA01.json</span>
                </button>

                <button
                  type="button"
                  onClick={handleRestoreCheckpointSISFLOTA01}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-[#0b3d2e] hover:bg-[#13382b] border border-[#c9a227] rounded-lg shadow-sm transition-all cursor-pointer hover:brightness-110 min-h-[40px]"
                  title="Restablecer el sistema al Punto de Control SISFLOTA01"
                >
                  <RotateCcw className="w-4 h-4 text-[#c9a227]" />
                  <span>Restablecer a SISFLOTA01</span>
                </button>
              </div>
            </div>
          </div>

          {/* Creador de Respaldos Secundarios Manuales */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Crear Respaldo Adicional / Instantánea Temporal</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Nota del respaldo (ej. Antes de nueva carga masiva)..."
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-700 text-slate-900 dark:text-slate-100 min-h-[40px]"
              />
              <button
                type="button"
                onClick={handleCreateManualBackup}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1a5f47] hover:bg-[#0b3d2e] rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[40px]"
              >
                <Plus className="w-4 h-4 text-[#c9a227]" />
                <span>Guardar Instantánea</span>
              </button>
            </div>
          </div>

          {/* Lista de Versiones Registradas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Historial de Versiones y Respaldos ({backups.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => backupService.exportBackupsJSON()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[36px]"
                  title="Exportar todo el historial en un archivo JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Todo JSON</span>
                </button>
                {backups.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer min-h-[36px]"
                    title="Eliminar únicamente respaldos manuales secundarios"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Secundarios</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {backups.map((bk) => {
                const isCheckpoint = bk.id === 'SISFLOTA01';
                return (
                  <div 
                    key={bk.id} 
                    className={`p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isCheckpoint
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-2 border-[#c9a227]'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCheckpoint && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0b3d2e] text-[#c9a227] border border-[#c9a227]">
                            OFICIAL: SISFLOTA01
                          </span>
                        )}
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{bk.description}</span>
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-semibold">
                          {bk.totalVehicles} unidades
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{bk.timestamp}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestore(bk)}
                      className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer min-h-[40px] shrink-0 ${
                        isCheckpoint
                          ? 'bg-[#0b3d2e] hover:bg-[#1a5f47] text-white border border-[#c9a227]'
                          : 'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isCheckpoint ? 'Restablecer a SISFLOTA01' : 'Restaurar'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            🛡️ Certificación de Resguardo SEN · Punto de Control Activo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer min-h-[40px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
