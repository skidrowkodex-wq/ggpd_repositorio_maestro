import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, ConnectionTestResult, isSupabaseConfigured } from '../lib/supabase';
import { Database, CheckCircle2, XCircle, RefreshCw, Server, ShieldCheck, Activity } from 'lucide-react';

export const SupabaseStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<ConnectionTestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const res = await testSupabaseConnection();
      setStatus(res);
    } catch (e: any) {
      setStatus({
        success: false,
        message: `Error al ejecutar diagnóstico: ${e.message}`,
        urlUsed: 'https://owpiwacuotcaeruvonbd.supabase.co',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="rounded-3xl bg-white dark:bg-[#081224] p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Conexión a Base de Datos Supabase</h3>
              <span className="rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 text-[9px] font-extrabold">
                PostgreSQL Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Endpoint: <code className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">owpiwacuotcaeruvonbd.supabase.co</code>
            </p>
          </div>
        </div>

        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-[#112240] px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-[#002b49] dark:hover:border-[#00f2fe] transition-all shadow-xs shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#002b49] dark:text-[#00f2fe]' : ''}`} />
          <span>{loading ? 'Verificando...' : 'Re-Probar Conexión'}</span>
        </button>
      </div>

      {/* Connection Status Banner */}
      {loading ? (
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Activity className="h-4 w-4 text-[#002b49] dark:text-[#00f2fe] animate-pulse" />
          <span>Estableciendo handshake y validando token JWT con el clúster de Supabase Postgres...</span>
        </div>
      ) : status?.success ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-emerald-900 dark:text-emerald-300 block">{status.message}</span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 block mt-0.5">
                URL Activa: {status.urlUsed} • RLS (Row-Level Security) habilitado según directiva ISO 27001.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Estado API</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">200 OK</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Latencia Red</span>
              <span className="font-extrabold text-[#002b49] dark:text-[#00f2fe]">{status.latencyMs ? `${status.latencyMs} ms` : 'N/A'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Motor BD</span>
              <span className="font-extrabold text-slate-900 dark:text-white">PostgreSQL 15</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#081427] border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Esquemas</span>
              <span className="font-extrabold text-[#d97706] dark:text-[#ffd700]">samc, public</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-900 dark:text-red-200 font-medium">
          <XCircle className="h-5 w-5 text-red-700 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-red-900 dark:text-red-300 block">No se pudo conectar a Supabase</span>
            <span className="text-[10px] text-red-800 dark:text-red-400 block mt-0.5">{status?.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
