import React from 'react';
import { SubestacionMaster, SubestacionEstructura } from '../types/sigad';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  BatteryCharging, 
  Droplets, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';

interface Props {
  subestacion: SubestacionMaster;
  estructura: SubestacionEstructura | null;
}

export const DiagnosticsKpiPanel: React.FC<Props> = ({ subestacion, estructura }) => {
  if (!estructura || estructura.bahias.length === 0) {
    return (
      <div className="glass-panel p-10 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-sky-950">
        <Activity className="w-10 h-10 text-sky-600 dark:text-cyan-400 mx-auto mb-2 opacity-50" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sin Datos de Diagnóstico</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">Genere la estructura de bahías para visualizar las métricas de salud técnica de la subestación.</p>
      </div>
    );
  }

  const allComponents = estructura.bahias.flatMap(b => b.componentes);
  const total = allComponents.length;
  const enServicio = allComponents.filter(c => c.estado_operativo === 'EN_SERVICIO').length;
  const indisponibles = allComponents.filter(c => c.estado_operativo === 'INDISPONIBLE_FALLADO').length;
  const enObservacion = allComponents.filter(c => c.estado_operativo === 'EN_OBSERVACION').length;
  
  const saludPct = total > 0 ? Math.round((enServicio / total) * 100) : 100;

  // Analítica específica de Transformadores
  const trafos = allComponents.filter(c => c.tipo_elemento === 'TRANSFORMADOR_POTENCIA');
  const trafosCriticos = trafos.filter(t => t.estado_operativo === 'INDISPONIBLE_FALLADO' || t.nivel_aceite === 'CRITICO');

  // Analítica de Baterías
  const bateria = allComponents.find(c => c.tipo_elemento === 'BANCO_BATERIAS_DC');

  return (
    <div className="space-y-6">
      {/* Tarjetas Principales de Salud */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-sky-950 shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Índice de Salud (HI)</div>
            <div className={`text-2xl font-black mt-1 font-mono ${
              saludPct >= 90 ? 'text-emerald-600 dark:text-emerald-400' : saludPct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {saludPct}%
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Conforme ISO 55000</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-sky-950 shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Equipos en Servicio</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {enServicio} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ {total}</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Operatividad normal</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-sky-950 shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Indisponibles (SCEIN)</div>
            <div className={`text-2xl font-black mt-1 font-mono ${indisponibles > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              {indisponibles}
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400/80 mt-0.5">Requieren restitución</div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            indisponibles > 0 ? 'bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-sky-950 shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">En Observación</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {enObservacion}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">Mantenimiento preventivo</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Diagnóstico Profundo por Subsistemas Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transformadores de Potencia */}
        <div className="glass-panel p-5 space-y-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-sky-950 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-sky-950 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              Estado de Transformadores de Potencia ({trafos.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {trafosCriticos.length === 0 ? '🟢 ESTABLES' : '🔴 ATENCIÓN'}
            </span>
          </div>

          <div className="space-y-3">
            {trafos.map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-sky-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono text-sky-700 dark:text-cyan-400 font-bold">{t.codigo_norma}</span>
                    <span>{t.nombre_equipo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {t.serial ? `Serial: ${t.serial}` : 'Serial no registrado'} · {t.capacidad_mva ? `${t.capacidad_mva} MVA` : 'Capacidad por verificar'}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`badge text-[10px] ${
                    t.estado_operativo === 'EN_SERVICIO' ? 'badge-operativo' : 'badge-fallado'
                  }`}>
                    {t.estado_operativo}
                  </span>
                  {t.nivel_aceite && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      Aceite: <strong className={t.nivel_aceite === 'CRITICO' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}>{t.nivel_aceite}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios Auxiliares Vitales (SSAA) */}
        <div className="glass-panel p-5 space-y-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-sky-950 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-sky-950 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Servicios Auxiliares (Sistemas Vitales DC)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {bateria?.estado_operativo === 'EN_SERVICIO' ? '🟢 OPERATIVO' : '🔴 ALERTA DC'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-sky-950 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Banco de Baterías 125 Vcc</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Alimentación de bobinas de disparo y relés de protección
                </div>
              </div>
              <span className={`badge text-[10px] ${
                bateria?.estado_operativo === 'EN_SERVICIO' ? 'badge-operativo' : 'badge-fallado'
              }`}>
                {bateria?.estado_operativo || 'NO INSTALADO'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-sky-950/60 text-xs text-slate-700 dark:text-slate-300">
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">Principio Operativo ISO 55000:</div>
              Una subestación con banco de baterías fuera de servicio pierde la capacidad de disparo ante fallas severas en alimentadores, incrementando el riesgo de daño catastrófico en el transformador de potencia.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
