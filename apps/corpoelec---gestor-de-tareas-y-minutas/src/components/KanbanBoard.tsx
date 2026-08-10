import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  Flame,
  Check,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { TareaCompromiso, TaskStatus, UserProfile } from '../types';

interface KanbanBoardProps {
  compromisos: TareaCompromiso[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, newPct: number) => void;
  currentProfile?: UserProfile;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; bg: string; border: string }[] = [
  { id: 'Pendiente', title: 'Pendiente', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'En Proceso', title: 'En Proceso Operativo', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'En Revisión', title: 'En Revisión / Validación', color: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'Completado', title: 'Completado / Certificado', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  compromisos,
  onUpdateTaskStatus,
  currentProfile,
}) => {
  return (
    <div className="space-y-4">
      {/* Role-based restriction banner */}
      {currentProfile && currentProfile.role !== 'admin' && currentProfile.role !== 'supervisor' && (
        <div className="bg-blue-900/90 border border-cyan-500/40 text-cyan-100 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="text-xs">
              <strong>Kanban Personal:</strong> Como <strong>{currentProfile.name}</strong> (@{currentProfile.username}), estás gestionando únicamente los compromisos asignados a tu usuario.
            </span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-400/30 shrink-0">
            Rol: {currentProfile.role.toUpperCase()}
          </span>
        </div>
      )}

      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#002B49]">Tablero Kanban de Flujo Operativo CORPOELEC</h2>
          <p className="text-xs text-slate-500">Visualiza y gestiona el flujo de trabajo de los compromisos de minuta en tiempo real</p>
        </div>
        <div className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Total: <strong className="text-[#002B49]">{compromisos.length} tareas en flujo</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = compromisos.filter(c => c.estado === col.id);

          return (
            <div 
              key={col.id} 
              className="bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs ${col.bg} ${col.border}`}>
                <span className={`font-black text-xs ${col.color}`}>
                  {col.title}
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full bg-white border ${col.border} ${col.color}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks in Column */}
              <div className="space-y-3">
                {colTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                    Sin tareas en este estado
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5 hover:shadow-md transition-all group"
                    >
                      {/* Badge Row */}
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-1">
                          <span className="bg-[#002B49] text-white font-bold px-2 py-0.5 rounded">
                            #{task.minutaNumero}
                          </span>
                          <span className="bg-slate-100 font-bold text-slate-700 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[120px]">
                            {task.vinculacionOrigen}
                          </span>
                        </div>

                        {task.prioridad === 'Alta' && (
                          <span className="bg-red-50 text-[#E30613] font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5 border border-red-200">
                            <Flame className="w-3 h-3 text-[#E30613] fill-current" />
                            <span>Alta</span>
                          </span>
                        )}
                      </div>

                      {/* Compromise text */}
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {task.compromiso}
                      </p>

                      {/* Responsable & Due Date */}
                      <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-slate-800 font-bold">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-[#002B49]" />
                            <span>{task.responsable}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="flex items-center space-x-1 text-[#E30613] font-extrabold">
                            <Calendar className="w-3 h-3" />
                            <span>Plazo: {task.plazoText}</span>
                          </span>
                          <span className="font-extrabold text-slate-900">{task.avancePorcentaje}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full ${task.avancePorcentaje === 100 ? 'bg-emerald-500' : 'bg-[#E30613]'}`}
                          style={{ width: `${task.avancePorcentaje}%` }}
                        />
                      </div>

                      {/* Move Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        {col.id !== 'Pendiente' ? (
                          <button
                            onClick={() => {
                              const prevStatus: TaskStatus = 
                                col.id === 'Completado' ? 'En Revisión' :
                                col.id === 'En Revisión' ? 'En Proceso' : 'Pendiente';
                              onUpdateTaskStatus(task.id, prevStatus, task.avancePorcentaje);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Mover a estado anterior"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : <div />}

                        {col.id !== 'Completado' && (
                          <button
                            onClick={() => {
                              const nextStatus: TaskStatus = 
                                col.id === 'Pendiente' ? 'En Proceso' :
                                col.id === 'En Proceso' ? 'En Revisión' : 'Completado';
                              const nextPct = nextStatus === 'Completado' ? 100 : Math.max(task.avancePorcentaje, 50);
                              onUpdateTaskStatus(task.id, nextStatus, nextPct);
                            }}
                            className="text-[11px] font-bold text-slate-800 hover:text-[#E30613] bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <span>Avanzar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
