import React, { useState } from 'react';
import { INITIAL_MINUTAS, VENEZUELAN_STATES } from '../mockData/portalData';
import { MinutaItem, StateCode } from '../types/sigi';
import { useAuth } from '../context/AuthContext';
import { FileText, Search, Filter, Calendar, MapPin, CheckCircle2, ExternalLink, Plus, Eye, Lock, X } from 'lucide-react';

export const MinutarioSection: React.FC = () => {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>(session.stateCode !== 'NAC' ? session.stateCode : 'ALL');
  const [selectedMinuta, setSelectedMinuta] = useState<MinutaItem | null>(null);

  const filteredMinutas = INITIAL_MINUTAS.filter(min => {
    const matchesSearch = min.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          min.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (min.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || min.stateCode === selectedState || min.stateCode === 'NAC';
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eje 2: Minutario e Historial de Reuniones Institucionales</h2>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Registro auditable de minutas, acuerdos y compromisos operativos de planificación por estado geográfico.
          </p>
        </div>

        {/* Action Button (Role Aware) */}
        {['ANALISTA', 'GERENCIA'].includes(session.role) && (
          <button
            onClick={() => alert('Función de registro de minutas activada. Redirigiendo a formulario en la Nube...')}
            className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] px-4 py-2.5 text-xs font-black uppercase shadow-md hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Nueva Minuta</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, título o acuerdos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-medium shadow-xs"
          />
        </div>

        {/* Filter State */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 h-4 w-4 text-[#d97706] dark:text-[#ffd700]" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#112240] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:outline-none font-bold cursor-pointer shadow-xs"
          >
            <option value="ALL" className="bg-white dark:bg-[#0a192f]">Todos los Estados</option>
            {VENEZUELAN_STATES.map(s => (
              <option key={s.code} value={s.code} className="bg-white dark:bg-[#0a192f]">
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Minutas List */}
      <div className="space-y-4">
        {filteredMinutas.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-[#081427] p-10 text-center text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800 shadow-sm">
            No se encontraron minutas registradas para el criterio de búsqueda seleccionado.
          </div>
        ) : (
          filteredMinutas.map((min: MinutaItem) => (
            <div
              key={min.id}
              className="rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-slate-800 hover:border-[#002b49] dark:hover:border-[#00f2fe]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-blue-100 text-[#002b49] border border-blue-300 dark:bg-[#00f2fe]/10 dark:text-[#00f2fe] dark:border-[#00f2fe]/30 px-2 py-0.5 text-[10px] font-mono font-black">
                    {min.code}
                  </span>
                  <span className="flex items-center space-x-1 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#ffd700]/10 dark:text-[#ffd700] dark:border-[#ffd700]/30 px-2 py-0.5 text-[10px] font-bold">
                    <MapPin className="h-3 w-3" />
                    <span>{min.stateCode}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>{min.date}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {min.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {min.summary}
                </p>

                {/* Key Agreements List */}
                <div className="space-y-1 pt-2">
                  {(min.keyAgreements || min.agreements || []).map((agreement: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe] shrink-0 mt-0.5" />
                      <span>{agreement}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Button */}
              <div className="shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMinuta(min)}
                  className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-[#112240] px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-[#002b49] dark:hover:border-[#00f2fe] transition-all shadow-xs"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalle</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Minuta Detail Modal */}
      {selectedMinuta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0b172c] p-6 border border-slate-200 dark:border-[#00f2fe]/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#002b49] dark:text-[#00f2fe]">{selectedMinuta.code}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMinuta.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMinuta(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <p><strong className="text-slate-900 dark:text-white">Resumen Ejecutivo:</strong> {selectedMinuta.summary}</p>
              <div className="bg-slate-50 dark:bg-[#112240] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-extrabold text-[#d97706] dark:text-[#ffd700]">Acuerdos Institucionales Registrados:</h4>
                <ul className="space-y-1">
                  {(selectedMinuta.keyAgreements || selectedMinuta.agreements || []).map((ag: string, i: number) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-[#002b49] dark:text-[#00f2fe] shrink-0 mt-0.5" />
                      <span>{ag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold">
                Visualización auditable por la Gerencia de Planificación
              </span>
              <a
                href={selectedMinuta.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#0a192f] px-4 py-2 text-xs font-black"
              >
                <span>Abrir en Google Drive</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
