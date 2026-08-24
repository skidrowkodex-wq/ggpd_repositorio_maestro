import React from 'react';
import { useAuth } from '../context/AuthContext';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { StateCode } from '../types/sigi';
import { MapPin, Lock } from 'lucide-react';

export const StateSelector: React.FC = () => {
  const { session, setStateCode } = useAuth();
  const isVisorEstadal = session.role === 'VISOR_ESTADAL';
  const currentState = VENEZUELAN_STATES.find(s => s.code === session.stateCode);

  if (isVisorEstadal) {
    return (
      <div 
        className="flex items-center justify-between rounded-xl border border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-mono text-amber-900 dark:text-amber-200"
        title="Ámbito Territorial Fijo para Sala Situacional / Coordinación Estadal"
      >
        <div className="flex items-center space-x-1.5 truncate">
          <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold truncate text-[11px]">
            [{session.stateCode}] {currentState?.name || session.stateName}
          </span>
        </div>
        <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#081427] px-2.5 py-1 text-xs font-mono">
      <MapPin className="h-3.5 w-3.5 text-[#d97706] dark:text-[#ffd700]" />
      <select
        value={session.stateCode}
        onChange={(e) => setStateCode(e.target.value as StateCode)}
        className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer w-full truncate"
      >
        {VENEZUELAN_STATES.map((st) => (
          <option key={st.code} value={st.code} className="bg-white dark:bg-[#081427] text-slate-900 dark:text-white">
            [{st.code}] {st.name}
          </option>
        ))}
      </select>
    </div>
  );
};
