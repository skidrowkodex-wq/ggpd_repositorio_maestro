import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileCode, 
  Server, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Users, 
  Truck
} from 'lucide-react';
import { VehicleRecord, MasterCatalogsState } from '../types/fleet';
import { postgresExportService } from '../services/postgresExportService';

interface PostgreSqlManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleRecord[];
  catalogs?: MasterCatalogsState;
  isDarkMode?: boolean;
}

export const PostgreSqlManagerModal: React.FC<PostgreSqlManagerModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  catalogs,
  isDarkMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'seed' | 'complete' | 'guide'>('schema');
  const [copied, setCopied] = useState(false);

  // Generar scripts bajo demanda memoizados
  const schemaSql = useMemo(() => {
    return postgresExportService.generatePostgreSqlSchema();
  }, []);

  const seedSql = useMemo(() => {
    return postgresExportService.generatePostgreSqlSeedData(vehicles, catalogs);
  }, [vehicles, catalogs]);

  const completeSql = useMemo(() => {
    return postgresExportService.generateCompleteSetupScript(vehicles, catalogs);
  }, [vehicles, catalogs]);

  const guideText = useMemo(() => {
    return postgresExportService.getDeploymentGuide();
  }, []);

  if (!isOpen) return null;

  const currentContent = {
    schema: schemaSql,
    seed: seedSql,
    complete: completeSql,
    guide: guideText
  }[activeTab];

  const currentFilename = {
    schema: 'corpoelec_flota_esquema.sql',
    seed: 'corpoelec_flota_datos.sql',
    complete: 'corpoelec_bd_completa_setup.sql',
    guide: 'guia_despliegue_postgresql.md'
  }[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    postgresExportService.downloadSqlFile(currentFilename, currentContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border-2 border-[#c9a227] overflow-hidden ${
          isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-4 bg-[#0b3d2e] text-white flex items-center justify-between border-b border-[#c9a227]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a5f47] border border-[#c9a227] flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
                  Gestión y Despliegue de Base de Datos PostgreSQL
                </h3>
                <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold bg-[#c9a227] text-[#0a1f17]">
                  SEN CORPOELEC
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-mono">
                Esquema DDL relacional, migración DML e instrucciones para montaje manual en servidores corporativos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Métricas / Datos Listos para Migrar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono shrink-0 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#c9a227]" />
            <span>Vehículos: <strong className="text-emerald-500">{vehicles.length}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c9a227]" />
            <span>Tablas / Vistas: <strong className="text-emerald-500">9 Tablas + 2 Vistas</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#c9a227]" />
            <span>Usuarios & Claves: <strong className="text-emerald-500">27 Cuentas SEN</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
            <span>Punto Control: <strong className="text-amber-500">SISFLOTA01</strong></span>
          </div>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className={`px-4 sm:px-6 pt-3 flex items-center justify-between gap-2 border-b overflow-x-auto shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'schema'
                  ? 'border-[#0b3d2e] text-[#0b3d2e] dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>1. Esquema DDL</span>
            </button>

            <button
              onClick={() => setActiveTab('seed')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'seed'
                  ? 'border-[#0b3d2e] text-[#0b3d2e] dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>2. Migración DML ({vehicles.length} Vehículos)</span>
            </button>

            <button
              onClick={() => setActiveTab('complete')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'complete'
                  ? 'border-[#0b3d2e] text-[#0b3d2e] dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>3. Paquete Completo (.sql)</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'border-[#0b3d2e] text-[#0b3d2e] dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>4. Guía de Montaje CLI</span>
            </button>
          </div>

          {/* Botones de acción rápida superiores */}
          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Copiar contenido de la pestaña activa al portapapeles"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0b3d2e] hover:bg-[#13382b] text-white text-xs font-bold border border-[#c9a227] shadow-xs transition-all cursor-pointer"
              title={`Descargar archivo ${currentFilename}`}
            >
              <Download className="w-3.5 h-3.5 text-[#c9a227]" />
              <span className="hidden sm:inline">Descargar</span>
              <span className="font-mono text-[11px]">.SQL</span>
            </button>
          </div>
        </div>

        {/* Visor de Código / Texto */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col bg-slate-950">
          <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400 border-b border-slate-800">
            <span>Archivo: <strong className="text-emerald-400">{currentFilename}</strong></span>
            <span>Compatible con: PostgreSQL 14, 15, 16</span>
          </div>

          <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-emerald-300/90 leading-relaxed rounded-xl bg-black/60 border border-slate-800 selection:bg-emerald-800 selection:text-white mt-2 max-h-[50vh]">
            <code>{currentContent}</code>
          </pre>
        </div>

        {/* Footer Modal con Comando Rápido */}
        <div className={`px-4 sm:px-6 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="text-xs flex items-center gap-2">
            <span className="text-[#c9a227] font-bold">⚡ Comando de ejecución directa:</span>
            <code className="px-2 py-1 rounded bg-black/80 text-amber-300 font-mono text-[11px] border border-slate-700 select-all">
              psql -U corpoelec_admin -d corpoelec_flota_db -f {currentFilename}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0b3d2e] hover:bg-[#13382b] text-white text-xs font-bold border border-[#c9a227] shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Guardar Archivo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
