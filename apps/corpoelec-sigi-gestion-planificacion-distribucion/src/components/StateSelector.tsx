import React from 'react';
import { useAuth } from '../context/AuthContext';
import { VENEZUELAN_STATES } from '../mockData/portalData';
import { StateCode } from '../types/sigi';
import { MapPin } from 'lucide-react';

export const StateSelector: React.FC = () => {
  const { session, setStateCode } = useAuth();

  return (
    <div className="flex items-center space-x-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#081427] px-2.5 py-1 text-xs font-mono">
      <MapPin className="h-3.5 w-3.5 text-[#d97706] dark:text-[#ffd700]" />
      <select
        value={session.stateCode}
        onChange={(e) => setStateCode(e.target.value as StateCode)}
        className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
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
