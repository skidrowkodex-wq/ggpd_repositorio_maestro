import React, { useState } from 'react';
import { ComponentePatio } from '../types/sigad';
import { useAuth } from '../lib/authContext';
import { CheckCircle2, RotateCcw, X, Sparkles, Wrench } from 'lucide-react';

interface Props {
  componente: ComponentePatio | null;
  onClose: () => void;
  onConfirm: (
    compId: string,
    detalles: {
      esNuevo: boolean;
      serial?: string;
      fabricante?: string;
      capacidadMva?: number;
      notas: string;
      registradoPor: string;
    }
  ) => void;
}

export const RestoreModal: React.FC<Props> = ({ componente, onClose, onConfirm }) => {
  const { user } = useAuth();
  const [esNuevo, setEsNuevo] = useState<boolean>(false);
  const [serial, setSerial] = useState<string>('');
  const [fabricante, setFabricante] = useState<string>('');
  const [capacidadMva, setCapacidadMva] = useState<string>(componente?.capacidad_mva?.toString() || '');
  const [notas, setNotas] = useState<string>('');

  if (!componente) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(componente.id, {
      esNuevo,
      serial: esNuevo ? serial.trim() : componente.serial,
      fabricante: esNuevo ? fabricante.trim() : componente.fabricante,
      capacidadMva: capacidadMva ? parseFloat(capacidadMva) : undefined,
      notas: notas.trim(),
      registradoPor: user?.full_name || 'Operador de Guardia',
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 border-emerald-500/40">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-emerald-950/60">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
            <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Restablecer Equipo a Servicio Activo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs">
            <div className="text-slate-600 dark:text-slate-400 font-mono">Equipo en recuperación:</div>
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
              [{componente.codigo_norma}] · {componente.nombre_equipo}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 font-mono">
              Serial actual: {componente.serial || 'Sin serial previo registrado'}
            </div>
          </div>

          {/* Tipo de Restablecimiento: Reparación vs Reemplazo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Normalización:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                !esNuevo 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-sky-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="tipoNorm"
                  checked={!esNuevo}
                  onChange={() => setEsNuevo(false)}
                  className="hidden"
                />
                <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Reparado en Sitio / Mantenimiento
              </label>

              <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-semibold transition-all ${
                esNuevo 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-sky-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="tipoNorm"
                  checked={esNuevo}
                  onChange={() => setEsNuevo(true)}
                  className="hidden"
                />
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                Sustitución por Activo Nuevo
              </label>
            </div>
          </div>

          {/* Campos si es Activo Nuevo */}
          {esNuevo && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-sky-950 space-y-3">
              <div className="text-xs font-bold text-sky-800 dark:text-cyan-300">
                Datos de Placa del Nuevo Equipo Instalado:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Nuevo Serial de Placa:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SN-TR-2026-X99"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Fabricante / Marca:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SIEMENS, PAUWELS, ABB"
                    value={fabricante}
                    onChange={(e) => setFabricante(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Capacidad (MVA o kVA si aplica):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej. 20 MVA"
                  value={capacidadMva}
                  onChange={(e) => setCapacidadMva(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
            </div>
          )}

          {/* Notas de energización */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas de Puesta en Servicio / Pruebas Realizadas:
            </label>
            <textarea
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Pruebas de aislamiento (Megger) satisfactorias, nivel de aceite verificado, energizado sin novedad..."
              className="form-input text-xs"
              required
            ></textarea>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-400 font-mono">
            ✓ Al guardar, el equipo volverá a <strong>EN SERVICIO</strong> en verde y se cerrará automáticamente el registro de indisponibilidad (SCEIN).
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-sky-950">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-success text-xs font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar y Restablecer a Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
