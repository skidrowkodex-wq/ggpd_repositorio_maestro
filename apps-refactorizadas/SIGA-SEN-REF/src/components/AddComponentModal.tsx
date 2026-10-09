import React, { useState } from 'react';
import { TipoElementoPatio, BahiaPatio, ComponentePatio } from '../types/sigad';
import { Plus, X, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  bahia: BahiaPatio | null;
  onClose: () => void;
  onAdd: (componente: ComponentePatio) => void;
}

export const AddComponentModal: React.FC<Props> = ({
  isOpen,
  bahia,
  onClose,
  onAdd,
}) => {
  if (!isOpen || !bahia) return null;

  const [codigoNorma, setCodigoNorma] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [tipoElemento, setTipoElemento] = useState<TipoElementoPatio>('DISYUNTOR_POTENCIA');
  const [tensionKv, setTensionKv] = useState(bahia.tension_kv);
  const [fabricante, setFabricante] = useState('');
  const [serial, setSerial] = useState('');
  const [capacidadMva, setCapacidadMva] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoNorma.trim() || !nombreEquipo.trim()) return;

    const newComp: ComponentePatio = {
      id: `comp-${bahia.se_codigo}-${Date.now()}`,
      bahia_id: bahia.id,
      se_codigo: bahia.se_codigo,
      codigo_norma: codigoNorma.trim().toUpperCase(),
      nombre_equipo: nombreEquipo.trim(),
      tipo_elemento: tipoElemento,
      estado_operativo: 'EN_SERVICIO',
      tension_kv: tensionKv,
      fabricante: fabricante.trim() || '',
      serial: serial.trim() || '',
      capacidad_mva: capacidadMva || undefined,
      observaciones: '',
    };

    onAdd(newComp);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg border-slate-300 dark:border-sky-500/50 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-sky-950 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-sky-700 dark:text-cyan-400 font-bold text-sm">
            <Cpu className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            <span className="text-slate-900 dark:text-white">Agregar Equipo a la {bahia.nombre_bahia}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código Norma CADAFE:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. D2, S2, TR-2, TC-3..."
                value={codigoNorma}
                onChange={(e) => setCodigoNorma(e.target.value)}
                className="form-input text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Activo / Equipo:
              </label>
              <select
                value={tipoElemento}
                onChange={(e) => setTipoElemento(e.target.value as TipoElementoPatio)}
                className="form-select text-xs font-semibold"
              >
                <option value="TRANSFORMADOR_POTENCIA">Transformador de Potencia</option>
                <option value="DISYUNTOR_POTENCIA">Interruptor de Potencia (Disyuntor)</option>
                <option value="RECONECTADOR">Reconectador de Distribución</option>
                <option value="SECCIONADOR">Seccionador</option>
                <option value="TRANSFORMADOR_CORRIENTE_TC">Transformador de Corriente (TC)</option>
                <option value="TRANSFORMADOR_POTENCIAL_TP">Transformador de Potencial (TP)</option>
                <option value="PARARRAYOS">Pararrayos</option>
                <option value="JUEGO_BARRAS">Juego de Barras Colectoras</option>
                <option value="BANCO_CONDENSADORES">Banco de Condensadores</option>
                <option value="BANCO_BATERIAS_DC">Banco de Baterías DC</option>
                <option value="RECTIFICADOR_CARGADOR">Rectificador / Cargador</option>
                <option value="TRANSFORMADOR_SSAA">Transformador de SSAA</option>
                <option value="PLANTA_EMERGENCIA">Planta de Emergencia (Grupo Diésel)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Oficial del Equipo:
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Interruptor de Salida D-2, Transformador de Potencia TR-2..."
              value={nombreEquipo}
              onChange={(e) => setNombreEquipo(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fabricante / Marca:</label>
              <input
                type="text"
                placeholder="Ej. ABB, SIEMENS, GE..."
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Serial Troquelado:</label>
              <input
                type="text"
                placeholder="Serial de placa..."
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="form-input text-xs font-mono"
              />
            </div>
          </div>

          {tipoElemento === 'TRANSFORMADOR_POTENCIA' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacidad (MVA):</label>
              <input
                type="number"
                step="any"
                placeholder="Ej. 20 MVA"
                value={capacidadMva || ''}
                onChange={(e) => setCapacidadMva(Number(e.target.value) || undefined)}
                className="form-input text-xs font-mono"
              />
            </div>
          )}

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
              Agregar Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
