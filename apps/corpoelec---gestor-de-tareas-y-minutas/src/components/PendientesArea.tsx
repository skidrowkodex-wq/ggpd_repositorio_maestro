import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  User, 
  Building2, 
  Plus, 
  X,
  AlertTriangle,
  FolderTree,
  ShieldCheck
} from 'lucide-react';
import { PendienteArea, TaskStatus, UserProfile } from '../types';

interface PendientesAreaProps {
  pendientes: PendienteArea[];
  onUpdatePendiente: (updated: PendienteArea) => void;
  onConvertToCompromiso: (pendiente: PendienteArea) => void;
  currentProfile?: UserProfile;
}

export const PendientesArea: React.FC<PendientesAreaProps> = ({
  pendientes,
  onUpdatePendiente,
  onConvertToCompromiso,
  currentProfile,
}) => {
  const isElevatedUser = currentProfile?.role === 'admin' || currentProfile?.role === 'supervisor';

  // Group pendientes by Area
  const groupedByArea = React.useMemo(() => {
    const map = new Map<string, PendienteArea[]>();
    pendientes.forEach(p => {
      const area = p.area || 'General';
      if (!map.has(area)) {
        map.set(area, []);
      }
      map.get(area)!.push(p);
    });
    return Array.from(map.entries());
  }, [pendientes]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#E30613]" />
            <h2 className="text-base font-extrabold text-[#002B49]">
              Pendientes Clasificados por Área de Gestión
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Asuntos estratégicos y prerrequisitos estructurales extraídos de las Minutas de Reunión o ingresados por la Gerencia GGPD que requieren atención y decisión institucional.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold">
            {pendientes.length} Pendientes Registrados
          </div>
        </div>
      </div>

      {/* ISO Governance Audit Banner */}
      <div className="bg-blue-950/90 border border-cyan-500/30 text-cyan-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-extrabold text-cyan-300">
              Gobernanza de Calidad ISO 9001 / Control de Atribuciones:
            </p>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Para garantizar trazabilidad completa, la creación o conversión de tareas desde este módulo está restringida a <strong>Supervisores y Administradores</strong> (Gerencia GGPD). Toda asignación directa genera una traza de auditoría inmutable vinculada al usuario emisor.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-400/30 shrink-0">
          Control ISO 27001 RBAC
        </span>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groupedByArea.map(([areaName, areaPendientes]) => (
          <div 
            key={areaName}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Area Header */}
              <div className="bg-[#002B49] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">{areaName}</span>
                </div>
                <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 font-bold">
                  {areaPendientes.length}
                </span>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-3.5 divide-y divide-slate-100">
                {areaPendientes.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                    
                    <p className="font-semibold text-slate-900 leading-snug">
                      {item.pendiente}
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="text-slate-500 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-600">Depende de:</span>
                        <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {item.dependeDe}
                        </span>
                      </div>

                      {item.observacion && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          {item.observacion}
                        </p>
                      )}
                    </div>

                    {/* Status & Convert button */}
                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={item.estado}
                        onChange={(e) => {
                          onUpdatePendiente({
                            ...item,
                            estado: e.target.value as TaskStatus,
                          });
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.estado === 'Completado' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          item.estado === 'En Proceso' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completado</option>
                      </select>

                      {isElevatedUser && (
                        <button
                          onClick={() => onConvertToCompromiso(item)}
                          className="text-[11px] font-bold text-white bg-[#002B49] hover:bg-cyan-900 px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-xs border border-cyan-500/30"
                          title="Convertir a tarea asignada directa con aprobación de supervisión (ISO Auditable)"
                        >
                          <Plus className="w-3 h-3 text-cyan-300" />
                          <span>+ Crear Tarea (Supervisor)</span>
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
