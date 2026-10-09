import React, { useState } from 'react';
import { ComponentePatio } from '../types/sigad';
import { useAuth } from '../lib/authContext';
import { AlertTriangle, ShieldAlert, X, Calendar, Droplets } from 'lucide-react';

interface Props {
  componente: ComponentePatio | null;
  onClose: () => void;
  onConfirm: (compId: string, causa: string, descripcion: string, registradoPor: string) => void;
}

const CAUSAS_OFICIALES_SEN = [
  'FALLA DE AISLAMIENTO / DIELÉCTRICO',
  'DESCARGA ATMOSFÉRICA / SOBRETENSIÓN',
  'CONTACTO CON VEGETACIÓN / ÁRBOL',
  'SOBRECARGA TÉRMICA / PUNTOS CALIENTES',
  'FUGA DE ACEITE O PRESIÓN SF6',
  'FALLA MECÁNICA DE MANDO / OPERACIÓN',
  'ANIMAL / FAUNA EN ELEMENTO ENERGIZADO',
  'VANDALISMO / HURTO DE COMPONENTES',
  'DISPARO INDEBIDO DE RELÉ / PROTECCIONES',
  'FIN DE VIDA ÚTIL / ENVEJECIMIENTO',
  'MANIOBRA OPERATIVA / ERROR HUMANO',
  'OTRAS CAUSAS POR INVESTIGAR',
];

export const FaultModal: React.FC<Props> = ({ componente, onClose, onConfirm }) => {
  const { user } = useAuth();
  const [causa, setCausa] = useState<string>(CAUSAS_OFICIALES_SEN[0]);
  const [descripcion, setDescripcion] = useState<string>('');
  const [fugaAceite, setFugaAceite] = useState<boolean>(false);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!componente) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const notas = `${descripcion}${fugaAceite ? ' [ALERTA: Fuga de aceite / dieléctrico reportada]' : ''}`;
    onConfirm(componente.id, causa, notas, user?.full_name || 'Operador de Guardia');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 border-rose-300 dark:border-rose-500/40 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-rose-200 dark:border-rose-950/60">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Declarar Avería / Indisponibilidad</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Ficha del Equipo Afectado */}
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs">
            <div className="text-slate-600 dark:text-slate-400 font-mono">Equipo a reportar:</div>
            <div className="text-sm font-bold text-rose-700 dark:text-rose-200 mt-0.5">
              [{componente.codigo_norma}] · {componente.nombre_equipo}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 font-mono">
              S/E: {componente.se_codigo} · Tensión: {componente.tension_kv} kV
            </div>
          </div>

          {/* Fecha del Evento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha y Hora del Evento:
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="form-input text-xs w-full"
            />
          </div>

          {/* Causa Normalizada SEN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Causa de la Interrupción / Daño (Catálogo Oficial SEN):
            </label>
            <select
              value={causa}
              onChange={(e) => setCausa(e.target.value)}
              className="form-select text-xs w-full"
            >
              {CAUSAS_OFICIALES_SEN.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Fuga de Aceite / Presión */}
          {(componente.tipo_elemento === 'TRANSFORMADOR_POTENCIA' || componente.tipo_elemento === 'DISYUNTOR_POTENCIA') && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-sky-950">
              <input
                type="checkbox"
                id="fuga"
                checked={fugaAceite}
                onChange={(e) => setFugaAceite(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300"
              />
              <label htmlFor="fuga" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                ¿Existe derrame / fuga activa de aceite o caída de presión de SF6?
              </label>
            </div>
          )}

          {/* Descripción Técnica de Campo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diagnóstico Preliminar de Campo / Observaciones:
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el síntoma visual, disparo de protección actuada o condición observada en patio..."
              className="form-input text-xs w-full"
              required
            ></textarea>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            ℹ️ Al confirmar, este equipo pasará a estado <strong>INDISPONIBLE</strong> en SIGAD y quedará registrado en la trazabilidad de SCEIN (ISO 55000).
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-sky-950">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs py-2 px-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-danger text-xs font-bold py-2 px-4 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              Confirmar y Declarar Indisponible
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
