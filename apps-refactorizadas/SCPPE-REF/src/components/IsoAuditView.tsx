import { useEffect, useState } from 'react';
import { AuditLog } from '../types';
import { getAuditLogs } from '../services/supabaseService';
import { ShieldAlert, Database, Lock, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export function IsoAuditView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromSupabase, setIsFromSupabase] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getAuditLogs();
    setLogs(res.data);
    setIsFromSupabase(res.isFromSupabase);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Auditoría de Datos ISO 8000 / ISO 27001
            </h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isFromSupabase 
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {isFromSupabase ? 'En vivo InsForge PostgreSQL' : 'Vista Conectada'}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Trazabilidad de cambios, Triggers de Auditoría Automáticos y Políticas Row Level Security (RLS) en InsForge.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors self-start md:self-auto flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar InsForge</span>
        </button>
      </div>

      {/* Tarjetas de Seguridad y Calidad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-red-700 dark:text-corpo-blue">
            <span className="text-xs font-bold uppercase">ISO 27001 Seguridad</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">Políticas RLS Activas</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Habilitadas en los esquemas core, scppe, sigi, scgcc de InsForge.</p>
        </div>

        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase">ISO 8000 Calidad</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">Campos Estándar</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">`created_at`, `updated_at`, `version` y `activo` en todas las tablas.</p>
        </div>

        <div className="p-4 industrial-card space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-sky-700 dark:text-cyan-400">
            <span className="text-xs font-bold uppercase">Espejo InsForge</span>
            <Database className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">Cloud BaaS</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Instancia ggpd-data-maestra-0002 con alta disponibilidad.</p>
        </div>
      </div>

      {/* Bitácora de Cambios / Audit Logs */}
      <div className="p-5 industrial-card space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Bitácora de Trazabilidad y Eventos Auditados</h3>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-corpo-red dark:text-corpo-blue" />
            <span className="font-medium">Cargando logs de auditoría desde InsForge...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.accion === 'UPDATE'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-corpo-accent border border-amber-300 dark:border-amber-800'
                          : log.accion === 'INSERT'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {log.accion}
                    </span>
                    <span className="font-mono text-xs font-bold text-red-700 dark:text-indigo-300">
                      {log.esquema}.{log.tabla}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {log.cumplimiento_iso}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{log.fecha}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-bold">• {log.usuario}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
                  {log.detalles}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
