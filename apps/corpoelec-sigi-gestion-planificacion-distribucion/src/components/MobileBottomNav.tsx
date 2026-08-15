import React from 'react';
import { LayoutGrid, FileText, BarChart3, Cloud, Users, UploadCloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeSection, setActiveSection }) => {
  const { session } = useAuth();

  if (!session.authenticated) return null;
  const isVisorEstadal = session.role === 'VISOR_ESTADAL';

  const rawItems = [
    { id: 'apps', label: 'Apps', icon: LayoutGrid, hideForVisor: true },
    { id: 'ingesta', label: 'Carga ⚡', icon: UploadCloud, hideForVisor: false },
    { id: 'minutas', label: 'Minutas', icon: FileText, hideForVisor: false },
    { id: 'dashboards', label: 'Tableros', icon: BarChart3, hideForVisor: false },
    { id: 'drive', label: 'Drive', icon: Cloud, hideForVisor: true },
    { id: 'usuarios', label: 'Usuarios', icon: Users, hideForVisor: true },
  ];

  const items = rawItems.filter(item => !isVisorEstadal || !item.hideForVisor);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#060d1a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#002b49] dark:text-[#00f2fe] font-black scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
