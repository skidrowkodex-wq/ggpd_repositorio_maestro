import React, { useState } from 'react';
import { ComponentePatio, EstadoOperativo } from '../types/sigad';
import { Sliders, X, Save, History, AlertCircle } from 'lucide-react';

interface Props {
  componente: ComponentePatio | null;
  onClose: () => void;
  onSave: (comp: ComponentePatio) => void;
}

export const ComponentModal: React.FC<Props> = ({ componente, onClose, onSave }) => {
  if (!componente) return null;

  const [form, setForm] = useState<ComponentePatio>({ ...componente });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const isTrafo = form.tipo_elemento === 'TRANSFORMADOR_POTENCIA' || form.tipo_elemento === 'TRANSFORMADOR_SSAA';
  const isBreaker = form.tipo_elemento === 'DISYUNTOR_POTENCIA' || form.tipo_elemento === 'RECONECTADOR';

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 border-sky-500/40">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-sky-950">
          <div className="flex items-center gap-2.5 text-sky-600 dark:text-cyan-400">
            <Sliders className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Ficha Técnica del Activo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Identificación */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-sky-950">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Código de Norma CADAFE</span>
              <div className="text-sm font-bold text-sky-700 dark:text-cyan-300 font-mono">{form.codigo_norma}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Subestación</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{form.se_codigo}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Técnico Oficial:</label>
            <input
              type="text"
              value={form.nombre_equipo}
              onChange={(e) => setForm({ ...form, nombre_equipo: e.target.value })}
              className="form-input text-xs"
              required
            />
          </div>

          {/* Estado Operativo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado Operativo en Patio:</label>
            <select
              value={form.estado_operativo}
              onChange={(e) => setForm({ ...form, estado_operativo: e.target.value as EstadoOperativo })}
              className="form-select text-xs font-semibold"
            >
              <option value="EN_SERVICIO">🟢 EN SERVICIO (OPERATIVO)</option>
              <option value="INDISPONIBLE_FALLADO">🔴 INDISPONIBLE / AVERIADO</option>
              <option value="EN_OBSERVACION">🟡 EN OBSERVACIÓN (ALERTA / ANOMALÍA)</option>
              <option value="NO_INSTALADO">⚪ NO INSTALADO / RETIRADO</option>
            </select>
          </div>

          {/* Parámetros Técnicos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Fabricante / Marca:</label>
              <input
                type="text"
                placeholder="Ej. SIEMENS, ABB, PAUWELS..."
                value={form.fabricante || ''}
                onChange={(e) => setForm({ ...form, fabricante: e.target.value })}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Serial de Placa:</label>
              <input
                type="text"
                placeholder="Serial troquelado..."
                value={form.serial || ''}
                onChange={(e) => setForm({ ...form, serial: e.target.value })}
                className="form-input text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Tensión (kV):</label>
              <input
                type="number"
                step="0.1"
                value={form.tension_kv || ''}
                onChange={(e) => setForm({ ...form, tension_kv: parseFloat(e.target.value) || 0 })}
                className="form-input text-xs font-mono"
              />
            </div>
            {isTrafo && (
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Capacidad (MVA):</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.capacidad_mva || ''}
                  onChange={(e) => setForm({ ...form, capacidad_mva: parseFloat(e.target.value) || undefined })}
                  className="form-input text-xs font-mono"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Año Instalación:</label>
              <input
                type="number"
                placeholder="Ej. 2018"
                value={form.anio_instalacion || ''}
                onChange={(e) => setForm({ ...form, anio_instalacion: parseInt(e.target.value) || undefined })}
                className="form-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Específicos para Transformador */}
          {isTrafo && (
            <div>
              <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Nivel de Aceite Dieléctrico:</label>
              <select
                value={form.nivel_aceite || 'NORMAL'}
                onChange={(e) => setForm({ ...form, nivel_aceite: e.target.value as any })}
                className="form-select text-xs"
              >
                <option value="NORMAL">NORMAL (Dentro de rango térmico)</option>
                <option value="BAJO">BAJO (Alerta de fuga o evaporación)</option>
                <option value="CRITICO">CRÍTICO (Riesgo inminente de disparo Buchholz)</option>
                <option value="N/A">N/A (Seco / No aplica)</option>
              </select>
            </div>
          )}

          {/* Específicos para Interruptor */}
          {isBreaker && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Tecnología de Corte:</label>
                <select
                  value={form.tecnologia_corte || 'SF6'}
                  onChange={(e) => setForm({ ...form, tecnologia_corte: e.target.value as any })}
                  className="form-select text-xs"
                >
                  <option value="SF6">SF6 (Hexafluoruro de azufre)</option>
                  <option value="VACIO">VACÍO (Celdas de vacío)</option>
                  <option value="ACEITE">ACEITE (OCB Gran Volumen)</option>
                  <option value="AIRE">AIRE (Soplado de aire)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-300 mb-1">Presión SF6 (bar):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej. 6.0 bar"
                  value={form.presion_sf6_bar || ''}
                  onChange={(e) => setForm({ ...form, presion_sf6_bar: parseFloat(e.target.value) || undefined })}
                  className="form-input text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Observaciones Técnicas de Patio:</label>
            <textarea
              rows={2}
              value={form.observaciones || ''}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Detalles sobre conexiones, puntos calientes, pintura, etc."
              className="form-input text-xs"
            ></textarea>
          </div>

          {/* Historial de Eventos */}
          {form.historial_eventos && form.historial_eventos.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-sky-950">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <History className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                Historial de Eventos Operativos ({form.historial_eventos.length})
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {form.historial_eventos.map((evt) => (
                  <div key={evt.id} className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-sky-950 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{evt.tipo_evento}</span>
                      <span className="font-mono text-[10px]">{new Date(evt.fecha_evento).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sky-700 dark:text-cyan-300 text-[10px] mt-0.5 font-medium">{evt.causa}</div>
                    <div className="text-slate-700 dark:text-slate-300 mt-1">{evt.descripcion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              className="btn btn-primary text-xs font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
