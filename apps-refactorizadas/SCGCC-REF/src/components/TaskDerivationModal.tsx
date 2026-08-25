import React, { useState } from 'react';
import { CorrespondenciaRecord } from '../types';
import { 
  X, 
  CheckCircle2, 
  Layers, 
  User, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  Shield
} from 'lucide-react';

interface TaskDerivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CorrespondenciaRecord | null;
  onDeriveTask: (correspondenciaId: string, taskTitle: string, assignee: string, deadline: string) => void;
}

export const TaskDerivationModal: React.FC<TaskDerivationModalProps> = ({
  isOpen,
  onClose,
  record,
  onDeriveTask
}) => {
  if (!isOpen || !record) return null;

  const [taskTitle, setTaskTitle] = useState(
    `Atención Requerimiento: ${record.numeroDocumentoOrigen} — ${record.asunto.slice(0, 60)}`
  );
  const [assignee, setAssignee] = useState('Ing. Josué Pacheco');
  const [assigneeRole, setAssigneeRole] = useState('Especialista Técnico');
  const [deadline, setDeadline] = useState(
    record.fechaLimiteRespuesta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState(record.prioridad);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDeriveTask(record.id, taskTitle, assignee, deadline);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#072146] w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-900/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Derivar Tarea Operativa a SCMTP V2.0</h2>
              <p className="text-xs text-emerald-100 font-mono">
                Origen: {record.correlativo} | {record.numeroDocumentoOrigen}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              {record.asunto}
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Remitente: <span className="font-semibold text-slate-700 dark:text-slate-300">{record.remitenteInstitucion}</span>
            </div>

            {record.proposito === 'INSTRUCCION_EJECUTIVA' && (
              <div className="mt-2 p-2.5 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-lg text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400">⚡</span>
                <span>Instrucción Superior: {record.instruidoPor || 'GGD'} (Prioridad Máxima en SCMTP)</span>
              </div>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Título del Compromiso / Tarea en SCMTP
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Assignee Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Especialista / Responsable
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="Ing. Josué Pacheco">T.S.U. Josué Pacheco (Planificación)</option>
                <option value="Ing. Yván Cipiran">Ing. Yván Cipiran (Automatización)</option>
                <option value="Ing. Carlos Reyes">Ing. Carlos Reyes (Gerencia GGP)</option>
                <option value="Lcdo. Rodolfo Labrador">Lcdo. Rodolfo Labrador (Logística)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Fecha Límite de Entrega
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Privacy Segregation Notice */}
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2">
            <Shield className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <span>
              <strong>Segregación ISO 27001:</strong> La tarea en SCMTP heredará el título operativo y plazo de entrega. Los documentos confidenciales anexos permanecerán custodiados en SCGCC.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 active:scale-95"
            >
              <span>Crear Compromiso en SCMTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
