import React, { useState, useMemo } from 'react';
import { SubestacionMaster } from '../types/sigad';
import { catalogService } from '../services/catalogService';
import { Search, MapPin, Zap, Filter, CheckCircle2 } from 'lucide-react';

interface Props {
  selectedSe: SubestacionMaster | null;
  onSelectSe: (se: SubestacionMaster) => void;
}

export const SubstationSelector: React.FC<Props> = ({ selectedSe, onSelectSe }) => {
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const estados = useMemo(() => catalogService.getEstados(), []);

  const subestacionesFiltradas = useMemo(() => {
    let list = catalogService.getSubestaciones(estadoFiltro);
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(s => 
        s.nombre_se.toLowerCase().includes(q) || 
        s.codigo.toLowerCase().includes(q) ||
        (s.municipio && s.municipio.toLowerCase().includes(q))
      );
    }
    return list;
  }, [estadoFiltro, searchTerm]);

  return (
    <div className="glass-panel p-4 mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        {/* Selector de Estado */}
        <div className="flex items-center gap-2 min-w-[240px]">
          <Filter className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado:</span>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="form-select text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-950 font-medium text-slate-800 dark:text-slate-100 rounded-lg"
          >
            <option value="TODOS">TODOS LOS ESTADOS (24 + ESEQUIBA)</option>
            {estados.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>

        {/* Buscador de Subestación */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Código (ej. SE-TAC-0685) o Municipio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input text-xs pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-lg w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Contador / Resumen rápido */}
        <div className="text-right text-xs text-slate-500 dark:text-slate-400 font-mono hidden lg:block shrink-0">
          <span className="text-sky-700 dark:text-cyan-400 font-bold">{subestacionesFiltradas.length}</span> S/E coincidentes de 871
        </div>
      </div>

      {/* Selector directo / Select rápido si hay muchas */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-sky-950/60 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">Subestación Activa:</span>
        <select
          value={selectedSe?.codigo || ''}
          onChange={(e) => {
            const found = subestacionesFiltradas.find(s => s.codigo === e.target.value);
            if (found) onSelectSe(found);
          }}
          className="form-select text-xs py-2 px-3 bg-white dark:bg-slate-900 font-mono text-sky-800 dark:text-cyan-300 font-bold border border-slate-300 dark:border-sky-950 rounded-lg flex-1"
        >
          {subestacionesFiltradas.length === 0 ? (
            <option value="">No hay subestaciones para este filtro</option>
          ) : (
            subestacionesFiltradas.map(s => (
              <option key={s.codigo} value={s.codigo}>
                {s.codigo} · {s.nombre_se} [{s.estado}] {s.es_movil ? '⭐ [S/E MÓVIL]' : ''} ({s.tension_entrada_kv || 115}/{s.tension_secundaria_kv || 13.8} kV)
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};
