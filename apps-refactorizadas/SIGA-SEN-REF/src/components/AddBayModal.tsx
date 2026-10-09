import React, { useState } from 'react';
import { TipoBahia } from '../types/sigad';
import { Layers, X, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  seCodigo: string;
  defaultTensionKv: number;
  onClose: () => void;
  onAdd: (bahia: { nombre_bahia: string; tipo_bahia: TipoBahia; tension_kv: number }) => void;
}

export const AddBayModal: React.FC<Props> = ({
  isOpen,
  seCodigo,
  defaultTensionKv,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoBahia>('CIRCUITO_SALIDA');
  const [tension, setTension] = useState(defaultTensionKv || 13.8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onAdd({
      nombre_bahia: nombre.trim(),
      tipo_bahia: tipo,
      tension_kv: tension,
    });
    setNombre('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md border-slate-300 dark:border-sky-500/50 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-sky-950 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-sky-700 dark:text-cyan-400 font-bold text-sm">
            <Layers className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            <span className="text-slate-900 dark:text-white">Agregar Nueva Bahía al Patio</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Bahía / Función:
            </label>
            <select
              value={tipo}
              onChange={(e) => {
                const newTipo = e.target.value as TipoBahia;
                setTipo(newTipo);
                if (newTipo === 'TRANSFORMACION_AT') setTension(115);
                else if (newTipo === 'CIRCUITO_SALIDA' || newTipo === 'BARRAS_MT') setTension(13.8);
                else if (newTipo === 'SERVICIOS_AUXILIARES') setTension(0.125);
                else setTension(0);
              }}
              className="form-select text-xs font-semibold"
            >
              <option value="CIRCUITO_SALIDA">⚡ Bahía de Circuito de Salida (Alimentador MT)</option>
              <option value="TRANSFORMACION_AT">⚡ Bahía de Transformación de Alta Tensión (TR)</option>
              <option value="BARRAS_MT">⚡ Bahía de Barras de Distribución MT</option>
              <option value="SERVICIOS_AUXILIARES">🔋 Servicios Auxiliares (SSAA - DC / AC)</option>
              <option value="INFRAESTRUCTURA_CIVIL">🏗️ Infraestructura Civil / Malla de Tierra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Oficial de la Bahía:
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Bahía de Circuito CANOABO, Bahía TR-2..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nivel de Tensión (kV):
            </label>
            <input
              type="number"
              step="any"
              required
              value={tension}
              onChange={(e) => setTension(Number(e.target.value))}
              className="form-input text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-sky-950">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline py-2 px-3 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Crear Bahía
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
