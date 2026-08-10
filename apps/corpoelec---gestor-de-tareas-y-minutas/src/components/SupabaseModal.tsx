import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Code,
  Lock
} from 'lucide-react';
import { SupabaseConfig } from '../types';
import { saveSupabaseConfig, testSupabaseConnection, SUPABASE_SQL_SCHEMA, resetSupabaseClient } from '../lib/supabase';

interface SupabaseModalProps {
  config: SupabaseConfig;
  onUpdateConfig: (newConfig: SupabaseConfig) => void;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [serviceRoleKey, setServiceRoleKey] = useState(config.serviceRoleKey || '');
  
  const [activeTab, setActiveTab] = useState<'config' | 'schema'>('config');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Test and save Supabase config
  const handleTestAndSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa tanto la URL como la Anon Key de Supabase.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const isConnected = await testSupabaseConnection(url.trim(), anonKey.trim());
    resetSupabaseClient();

    const updatedConfig: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      serviceRoleKey: serviceRoleKey.trim(),
      isConnected,
    };

    saveSupabaseConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    setTesting(false);

    if (isConnected) {
      setTestResult({
        success: true,
        message: '¡Conexión exitosa a tu proyecto Supabase!'
      });
    } else {
      setTestResult({
        success: false,
        message: 'No se pudo conectar a Supabase. Verifica la URL y la Anon Key.'
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Conexión a Base de Datos Supabase</h3>
              <p className="text-xs text-slate-500 font-normal">
                Configura tu proyecto Supabase para persistencia y sincronización de tareas en tiempo real
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'config' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Credenciales Supabase
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'schema' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Script SQL Tablas</span>
          </button>
        </div>

        {/* Credentials Form */}
        {activeTab === 'config' ? (
          <div className="space-y-4 text-xs">
            
            {config.isConnected && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Supabase está conectado y activo</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
                  Sincronizado
                </span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase URL *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase ANON Key (Public API Key) *
              </label>
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Service Role Key (Opcional para permisos administrativos)
              </label>
              <input
                type="password"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
                testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t">
              <span className="text-slate-400 text-[11px]">
                Mientras no configures Supabase, la app usará estado reactivo local con la minuta precargada.
              </span>

              <button
                onClick={handleTestAndSave}
                disabled={testing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>Guardar y Probar Conexión</span>
              </button>
            </div>

          </div>
        ) : (
          /* Schema SQL Tab */
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Ejecuta este código SQL en el editor de Supabase para crear las tablas necesarias:
              </span>

              <button
                onClick={handleCopySql}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto text-[11px] font-mono border border-slate-800 max-h-72">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
