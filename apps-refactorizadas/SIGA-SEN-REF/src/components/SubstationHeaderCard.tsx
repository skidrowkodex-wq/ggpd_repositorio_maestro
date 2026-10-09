import React from 'react';
import { SubestacionMaster, SubestacionEstructura } from '../types/sigad';
import { Zap, Activity, Layers, MapPin, Sparkles, RefreshCw, AlertTriangle, Truck } from 'lucide-react';

interface Props {
  subestacion: SubestacionMaster;
  circuitosCount: number;
  estructura: SubestacionEstructura | null;
  onGenerarCadafe: () => void;
}

export const SubstationHeaderCard: React.FC<Props> = ({
  subestacion,
  circuitosCount,
  estructura,
  onGenerarCadafe,
}) => {
  const tieneEstructura = estructura && estructura.bahias.length > 0;
  const totalComponentes = estructura 
    ? estructura.bahias.reduce((acc, b) => acc + b.componentes.length, 0)
    : 0;

  const falladosCount = estructura
    ? estructura.bahias.reduce((acc, b) => acc + b.componentes.filter(c => c.estado_operativo === 'INDISPONIBLE_FALLADO').length, 0)
    : 0;

  return (
    <div className="glass-panel p-5 mb-6 relative overflow-hidden">
      {/* Luz de fondo ambiental */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Información Principal */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/90 text-sky-800 dark:text-cyan-400 border border-sky-300 dark:border-sky-800/50 font-bold">
              {subestacion.codigo}
            </span>
            {subestacion.es_movil ? (
              <span className="badge badge-movil flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                SUBESTACIÓN MÓVIL PERMANENTE
              </span>
            ) : (
              <span className="badge badge-norma">
                {subestacion.tipo_instalacion || 'S/E DISTRIBUCIÓN FIJA'}
              </span>
            )}
            {falladosCount > 0 ? (
              <span className="badge badge-fallado flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {falladosCount} EQUIPO(S) INDISPONIBLE(S)
              </span>
            ) : (
              <span className="badge badge-operativo">
                100% OPERATIVA
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            S/E {subestacion.nombre_se}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
              {subestacion.estado} · {subestacion.region} {subestacion.municipio ? `(${subestacion.municipio})` : ''}
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>Atendida por: <strong className="text-slate-800 dark:text-slate-200">{subestacion.atendida_por || 'Distribución'}</strong></span>
          </div>
        </div>

        {/* Métricas Eléctricas Clave */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-panel-elevated p-3 min-w-[110px] text-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Tensión AT / MT</div>
            <div className="text-base font-extrabold text-sky-700 dark:text-cyan-300 font-mono mt-0.5">
              {subestacion.tension_entrada_kv || 115}/{subestacion.tension_secundaria_kv || 13.8} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">kV</span>
            </div>
          </div>

          <div className="glass-panel-elevated p-3 min-w-[110px] text-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Capacidad</div>
            <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {subestacion.capacidad_mva_instalada || 20} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">MVA</span>
            </div>
          </div>

          <div className="glass-panel-elevated p-3 min-w-[110px] text-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Circuitos (CT)</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {circuitosCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">salidas</span>
            </div>
          </div>

          <div className="glass-panel-elevated p-3 min-w-[110px] text-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Componentes</div>
            <div className="text-base font-extrabold text-sky-700 dark:text-sky-400 font-mono mt-0.5">
              {totalComponentes} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">activos</span>
            </div>
          </div>
        </div>

        {/* Acción Destacada: Auto-Generar Plantilla CADAFE */}
        <div className="w-full lg:w-auto flex flex-col gap-2 shrink-0">
          <button
            onClick={onGenerarCadafe}
            className="btn btn-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Sparkles className="w-4 h-4 text-white" />
            {tieneEstructura ? '⚡ Regenerar Esqueleto CADAFE' : '⚡ Auto-Generar Esqueleto CADAFE'}
          </button>
          {tieneEstructura && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center font-mono font-medium">
              ✓ Estructura de patio normalizada y viva
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
