import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
  getSnapshot,
  refrescarTasas,
  suscribir,
  type EstadoTasas,
  type TasaRegistro,
} from '../services/tasaCambioService';

const fmtBs = (n: number) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtFechaHora = (iso: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const ETIQUETA_ESTADO: Record<EstadoTasas, { texto: string; clase: string }> = {
  VIVO: {
    texto: 'EN VIVO',
    clase: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  },
  PARCIAL: {
    texto: 'PARCIAL',
    clase: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  },
  RESPALDO: {
    texto: 'RESPALDO',
    clase: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
  CARGANDO: {
    texto: 'CARGANDO',
    clase: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
};

function FilaTasa({ registro }: { registro: TasaRegistro }) {
  const esParalelo = registro.fuente === 'paralelo';
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 w-9">{registro.moneda}</span>
        <span
          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
            esParalelo
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
          }`}
          title={esParalelo ? 'Fuente NO institucional (mercado)' : 'Referencia oficial (BCV)'}
        >
          {registro.fuente}
        </span>
      </div>
      <div className="text-right min-w-0">
        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          Bs. {fmtBs(registro.promedio)}
        </div>
        <div className="text-[9px] text-slate-400 dark:text-slate-500">
          valor {registro.fechaValor} · {registro.origen}
        </div>
      </div>
    </div>
  );
}

export function TasaCambioPill() {
  const [snapshot, setSnapshot] = useState(getSnapshot);
  const [expanded, setExpanded] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => suscribir(setSnapshot), []);

  const oficialUsd = snapshot.registros.find((r) => r.moneda === 'USD' && r.fuente === 'oficial');
  const estado = ETIQUETA_ESTADO[snapshot.estado];

  const refrescar = async () => {
    setCargando(true);
    try {
      await refrescarTasas(true);
    } finally {
      setCargando(false);
    }
  };

  const ordenadas: TasaRegistro[] = [
    ...snapshot.registros.filter((r) => r.moneda === 'USD'),
    ...snapshot.registros.filter((r) => r.moneda === 'EUR'),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold shadow-2xs hover:border-corpo-blue/60 transition-colors"
        title="Tasa de cambio oficial y paralelo (ve.dolarapi.com)"
      >
        <TrendingUp className="w-3.5 h-3.5 text-corpo-blue dark:text-blue-400 shrink-0" />
        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
          {oficialUsd ? `Bs. ${fmtBs(oficialUsd.promedio)}` : 'Tasa s/d'}
        </span>
        <span className="hidden xl:inline text-slate-400 dark:text-slate-500">/ USD BCV</span>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${estado.clase}`}>
          {estado.texto}
        </span>
      </button>

      {expanded && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-corpo-blue dark:text-blue-400" />
              <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                Tasa de cambio (Bs.)
              </span>
            </div>
            <button
              type="button"
              onClick={refrescar}
              disabled={cargando}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-corpo-blue disabled:opacity-50"
              title="Recapturar desde ve.dolarapi.com"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="pt-1">
            {ordenadas.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Sin datos disponibles.
              </p>
            ) : (
              ordenadas.map((r) => <FilaTasa key={`${r.moneda}-${r.fuente}`} registro={r} />)
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                {snapshot.estado === 'VIVO' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
                Última captura
              </span>
              <span className="font-mono">{fmtFechaHora(snapshot.actualizadoEl)}</span>
            </div>
            <p className="flex items-start gap-1 leading-relaxed">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                Fuente <strong>paralelo</strong>: referencia de mercado, <strong>no institucional</strong>.
                Origen <strong>API</strong> (vivo) · <strong>CACHE</strong> (última conocida) ·{' '}
                <strong>RESPALDO</strong> (semilla local). Trazabilidad ISO 8000-110.
              </span>
            </p>
            {snapshot.error && (
              <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {snapshot.error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
