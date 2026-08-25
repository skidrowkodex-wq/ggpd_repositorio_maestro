import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  FileSpreadsheet,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchLiveCorrespondencias, INSFORGE_URL } from '../services/insforgeService';
import { CorrespondenciaRecord } from '../types';

interface AdminQAModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordsCount: number;
  onSyncWithDB: (records: CorrespondenciaRecord[]) => void;
  onResetToCanonical: () => void;
}

export const AdminQAModal: React.FC<AdminQAModalProps> = ({
  isOpen,
  onClose,
  recordsCount,
  onSyncWithDB,
  onResetToCanonical
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  if (!isOpen) return null;

  const handleTestAndSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Conectando con InsForge PostgreSQL...');
    
    const result = await fetchLiveCorrespondencias();
    setIsSyncing(false);
    setLatency(result.latencyMs);

    if (result.success && result.data) {
      setDbStatus('SUCCESS');
      setSyncMessage(`✓ Sincronización exitosa: ${result.data.length} expedientes cargados desde PostgreSQL.`);
      onSyncWithDB(result.data);
    } else {
      setDbStatus('ERROR');
      setSyncMessage(`❌ Error de sincronización: ${result.error}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Confirmar restablecimiento de la base de datos a los 11 registros oficiales canónicos?')) {
      onResetToCanonical();
      setSyncMessage('✓ Base de datos restablecida a los 11 registros canónicos oficiales.');
      setDbStatus('SUCCESS');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#072146] w-full max-w-2xl rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                  MODO QA & ADMINISTRADOR
                </span>
                <span className="text-xs text-purple-200 font-mono">
                  ISO 8000 / ISO 15489
                </span>
              </div>
              <h2 className="text-base font-black mt-0.5">Gestión de Calidad (QA) & Base de Datos</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Server Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Motor de Base de Datos InsForge BaaS
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                CONECTADO • PostgreSQL
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Proyecto ID</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">ggpd-data-maestra</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Esquema / Vista</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">scgcc / v_activas</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Expedientes en Memoria</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{recordsCount} Registros</span>
              </div>
            </div>

            {latency !== null && (
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Latencia de consulta: <strong>{latency} ms</strong></span>
              </div>
            )}
          </div>

          {/* Sync Result Feedback */}
          {syncMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              dbStatus === 'SUCCESS'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : dbStatus === 'ERROR'
                ? 'bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                : 'bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
            }`}>
              {dbStatus === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : dbStatus === 'ERROR' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <Activity className="w-4 h-4 text-purple-600 shrink-0 animate-spin" />
              )}
              <span>{syncMessage}</span>
            </div>
          )}

          {/* QA Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Acciones de Control & Pruebas QA
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sincronizar con BD */}
              <button
                onClick={handleTestAndSync}
                disabled={isSyncing}
                className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-purple-600 group-hover:rotate-180 transition-transform ${isSyncing ? 'animate-spin' : ''}`} />
                    Sincronizar BD en Vivo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Descarga los registros en tiempo real desde la vista `v_scgcc_correspondencias_activas`.
                </p>
              </button>

              {/* Resetear Data Canónica */}
              <button
                onClick={handleReset}
                className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    Restaurar Data Oficial
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Limpia modificaciones de prueba y restablece los 11 expedientes canónicos de producción.
                </p>
              </button>
            </div>
          </div>

          {/* Compliance Info */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#041426] border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Gobernanza Institucional GGPD</span>
            </div>
            <p className="text-[11px]">
              Los registros generados durante las pruebas QA quedan firmados con sello digital, correlativo institucional `RAD-GGPD-2026-XXXX` y custodia SHA-256 según norma ISO 15489.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#041426] border-t border-slate-200 dark:border-purple-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Cerrar Panel QA
          </button>
        </div>

      </div>
    </div>
  );
};
