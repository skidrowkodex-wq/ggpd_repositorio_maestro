import React, { useState, useEffect } from 'react';
import { SubestacionMaster, CircuitoMaster, SubestacionEstructura } from '../types/sigad';
import { OpcionesEstructuraCadafe } from '../services/cadafeTemplateEngine';
import { 
  Sparkles, 
  X, 
  Settings2, 
  Zap, 
  Layers, 
  Cpu, 
  CheckSquare, 
  Square, 
  Info,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

interface Props {
  subestacion: SubestacionMaster;
  circuitos: CircuitoMaster[];
  estructuraActual: SubestacionEstructura | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (opciones: OpcionesEstructuraCadafe) => void;
}

export const RegenerateCadafeModal: React.FC<Props> = ({
  subestacion,
  circuitos,
  estructuraActual,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  // Detección de valores por defecto inteligentes
  const defaultTrafos = estructuraActual?.bahias.filter(b => b.tipo_bahia === 'TRANSFORMACION_AT').length || 
    (subestacion.es_movil ? 1 : circuitos.length > 6 ? 2 : 1);

  const defaultKvIn = subestacion.tension_entrada_kv || subestacion.tension_alimentador_kv || 115;
  const defaultKvOut = subestacion.tension_secundaria_kv || (circuitos.length > 0 ? circuitos[0].nivel_tension_kv : 13.8);

  const [numTrafos, setNumTrafos] = useState<number>(defaultTrafos);
  const [tensionKvIn, setTensionKvIn] = useState<number>(defaultKvIn);
  const [tensionKvOut, setTensionKvOut] = useState<number>(defaultKvOut);
  const [capacidadMva, setCapacidadMva] = useState<number>(subestacion.capacidad_mva_instalada || 20);
  const [esquemaBarras, setEsquemaBarras] = useState<'SIMPLE_BARRA' | 'TRANSFERENCIA' | 'DOBLE_BARRA'>('SIMPLE_BARRA');
  const [incluirSsaa, setIncluirSsaa] = useState<boolean>(true);
  const [incluirInfra, setIncluirInfra] = useState<boolean>(true);
  const [preservarExistentes, setPreservarExistentes] = useState<boolean>(Boolean(estructuraActual));

  // Estado de Circuitos Mapeados y Confirmados por el Estado
  // Inicialmente todos los circuitos que vienen de la BD están seleccionados (confirmados)
  const [confirmedCircs, setConfirmedCircs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    circuitos.forEach(c => {
      init[c.codigo] = true;
    });
    return init;
  });

  // Lista de circuitos adicionales que el ingeniero desee agregar manualmente
  const [circuitosManuales, setCircuitosManuales] = useState<Array<{ id: string; codigo: string; nombre: string; tension: number }>>([]);
  const [nuevoManualNombre, setNuevoManualNombre] = useState('');
  const [nuevoManualTension, setNuevoManualTension] = useState(defaultKvOut);
  const [mostrarAddManual, setMostrarAddManual] = useState(false);

  // Sincronizar si cambian los circuitos entrantes
  useEffect(() => {
    const init: Record<string, boolean> = {};
    circuitos.forEach(c => {
      init[c.codigo] = true;
    });
    setConfirmedCircs(init);
  }, [circuitos]);

  const toggleCircuito = (codigo: string) => {
    setConfirmedCircs(prev => ({ ...prev, [codigo]: !prev[codigo] }));
  };

  const selectAllCircuits = (select: boolean) => {
    const updated: Record<string, boolean> = {};
    circuitos.forEach(c => {
      updated[c.codigo] = select;
    });
    setConfirmedCircs(updated);
  };

  const handleAddManualCircuito = () => {
    if (!nuevoManualNombre.trim()) return;
    const seq = circuitos.length + circuitosManuales.length + 1;
    const cleanNombre = nuevoManualNombre.trim().toUpperCase();
    const cod = `CT-${subestacion.codigo.replace('SE-', '')}-${String(seq).padStart(2, '0')}`;

    setCircuitosManuales(prev => [
      ...prev,
      {
        id: `man-${Date.now()}`,
        codigo: cod,
        nombre: cleanNombre,
        tension: nuevoManualTension,
      }
    ]);

    setNuevoManualNombre('');
    setMostrarAddManual(false);
  };

  const handleRemoveManualCircuito = (id: string) => {
    setCircuitosManuales(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Filtrar los circuitos de la base de datos confirmados por el usuario
    const seleccionadosDeBd = circuitos.filter(c => confirmedCircs[c.codigo] !== false);

    // 2. Integrar los circuitos manuales confirmados si los hubiere
    const manualesComoCirc: CircuitoMaster[] = circuitosManuales.map(m => ({
      codigo: m.codigo,
      nombre_circuito: m.nombre,
      circuito: m.nombre,
      se_codigo: subestacion.codigo,
      estado: subestacion.estado,
      region: subestacion.region,
      nivel_tension_kv: m.tension,
      longitud_km: 0,
    }));

    const todosLosConfirmados = [...seleccionadosDeBd, ...manualesComoCirc];

    // 3. Extraer componentes previos para preservación si aplica
    const componentesPrevios = estructuraActual ? estructuraActual.bahias.flatMap(b => b.componentes) : [];

    onConfirm({
      numTransformadores: numTrafos,
      tensionPrimariaKv: tensionKvIn,
      tensionSecundariaKv: tensionKvOut,
      capacidadMvaPorTrafo: capacidadMva,
      circuitosSeleccionados: todosLosConfirmados,
      numCircuitosSalida: todosLosConfirmados.length,
      esquemaBarras,
      incluirSsaa,
      incluirInfra,
      preservarExistentes,
      componentesPrevios,
    });

    onClose();
  };

  const totalSeleccionados = circuitos.filter(c => confirmedCircs[c.codigo] !== false).length + circuitosManuales.length;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl border-slate-300 dark:border-sky-500/50 bg-white dark:bg-slate-900">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-sky-950 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Generador de Esqueleto CADAFE (Norma NS-P-105)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-800">
                  CERO MOCK
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                S/E <span className="text-sky-700 dark:text-cyan-300 font-bold">{subestacion.nombre_se}</span> ({subestacion.codigo}) · {subestacion.estado}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* SECCIÓN A: TRANSFORMADORES DE POTENCIA Y TENSIONES */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-sky-950 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              Transformación de Potencia de Alta Tensión (AT/MT)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cantidad de Transformadores de Potencia:
                </label>
                <select
                  value={numTrafos}
                  onChange={(e) => setNumTrafos(Number(e.target.value))}
                  className="form-select text-xs font-bold text-sky-700 dark:text-cyan-300 w-full"
                >
                  <option value={1}>1 Transformador (TR-1)</option>
                  <option value={2}>2 Transformadores (TR-1 y TR-2)</option>
                  <option value={3}>3 Transformadores (TR-1, TR-2 y TR-3)</option>
                  <option value={4}>4 Transformadores (TR-1 a TR-4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Capacidad Nominal por Unidad:
                </label>
                <select
                  value={capacidadMva}
                  onChange={(e) => setCapacidadMva(Number(e.target.value))}
                  className="form-select text-xs font-bold text-emerald-700 dark:text-emerald-400 w-full"
                >
                  <option value={10}>10 MVA</option>
                  <option value={16}>16 MVA</option>
                  <option value={20}>20 MVA (Estándar 115/13.8)</option>
                  <option value={25}>25 MVA</option>
                  <option value={30}>30 MVA</option>
                  <option value={36}>36 MVA (Estándar OA/FA)</option>
                  <option value={40}>40 MVA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tensión Primaria (Entrada AT):
                </label>
                <select
                  value={tensionKvIn}
                  onChange={(e) => setTensionKvIn(Number(e.target.value))}
                  className="form-select text-xs"
                >
                  <option value={230}>230 kV (Muy Alta Tensión)</option>
                  <option value={115}>115 kV (Subtransmisión Estándar)</option>
                  <option value={69}>69 kV (CADAFE Región Central/Andes)</option>
                  <option value={34.5}>34.5 kV (Alta Tensión Rural/Industrial)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tensión Secundaria (Distribución MT):
                </label>
                <select
                  value={tensionKvOut}
                  onChange={(e) => setTensionKvOut(Number(e.target.value))}
                  className="form-select text-xs"
                >
                  <option value={13.8}>13.8 kV (Distribución Primaria Estándar)</option>
                  <option value={34.5}>34.5 kV (Sub-red de Distribución)</option>
                  <option value={24}>24 kV (Redes Especiales)</option>
                  <option value={4.16}>4.16 kV (Media Tensión Antigua)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN B: CONFIRMACIÓN Y VALIDACIÓN DE CIRCUITOS DE DISTRIBUCIÓN */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-sky-950 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Circuitos Mapeados en BD Central (core.mae_circuitos)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-800">
                  {totalSeleccionados} confirmados para generar
                </span>
              </div>

              {circuitos.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => selectAllCircuits(true)}
                    className="text-sky-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Seleccionar Todos
                  </button>
                  <span className="text-slate-400 dark:text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => selectAllCircuits(false)}
                    className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Deseleccionar
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              El estado valida cuáles alimentadores de la BD central operan efectivamente en esta subestación. 
              Para cada circuito confirmado se creará su bahía con interruptor/reconectador de cabecera, seccionador y pararrayos normativos.
            </p>

            {/* Listado de Circuitos Reales con Checkbox */}
            {circuitos.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-sky-950/80 rounded-lg p-2 bg-white dark:bg-slate-950/60">
                {circuitos.map((c) => {
                  const isChecked = confirmedCircs[c.codigo] !== false;
                  return (
                    <div
                      key={c.codigo}
                      onClick={() => toggleCircuito(c.codigo)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isChecked 
                          ? 'bg-sky-100 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800/60 text-slate-900 dark:text-slate-100' 
                          : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>{c.nombre_circuito || c.circuito}</span>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-normal">
                              ({c.codigo})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-slate-900 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-900">
                          {c.nivel_tension_kv || 13.8} kV
                        </span>
                        {c.tipo_red && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-800">
                            {c.tipo_red}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  No hay circuitos mapeados para esta subestación en la base de datos central. 
                  Puede incorporar las salidas manualmente con el botón de abajo.
                </div>
              </div>
            )}

            {/* Circuitos Manuales Agregados */}
            {circuitosManuales.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-sky-700 dark:text-cyan-400">Salidas Adicionales Incorporadas:</div>
                {circuitosManuales.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-sky-50 dark:bg-cyan-950/30 border border-sky-200 dark:border-cyan-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                      <span className="font-bold text-slate-900 dark:text-white">{m.nombre}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">({m.codigo})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-sky-700 dark:text-cyan-300">{m.tension} kV</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveManualCircuito(m.id)}
                        className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para incorporar salida manual adicional */}
            {!mostrarAddManual ? (
              <button
                type="button"
                onClick={() => setMostrarAddManual(true)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1.5 pt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Agregar salida de circuito adicional no registrada en BD
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-sky-900/60 space-y-2 mt-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Nueva Salida de Circuito:</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. CIRCUITO PUEBLO)"
                    value={nuevoManualNombre}
                    onChange={(e) => setNuevoManualNombre(e.target.value)}
                    className="form-input text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="kV"
                      value={nuevoManualTension}
                      onChange={(e) => setNuevoManualTension(Number(e.target.value))}
                      className="form-input text-xs font-mono w-24"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualCircuito}
                      className="btn btn-primary py-2 px-3 text-xs font-bold shrink-0"
                    >
                      Añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setMostrarAddManual(false)}
                      className="btn btn-secondary py-2 px-2 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN C: ESQUEMA DE BARRAS Y SERVICIOS AUXILIARES */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-sky-950 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Barraje y Sistemas Vitales
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Esquema Topológico de Barras MT:
              </label>
              <select
                value={esquemaBarras}
                onChange={(e) => setEsquemaBarras(e.target.value as any)}
                className="form-select text-xs w-full"
              >
                <option value="SIMPLE_BARRA">Simple Barra Colectora MT (B1)</option>
                <option value="DOBLE_BARRA">Doble Barra Seccionable (B1, B2 + D-ACOP)</option>
                <option value="TRANSFERENCIA">Barra Principal + Barra Transferencia (B1, B-TRANSF, D-TRANSF)</option>
              </select>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-sky-950">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={incluirSsaa}
                  onChange={(e) => setIncluirSsaa(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 border-slate-300"
                />
                <span>
                  <strong>Servicios Auxiliares (SSAA):</strong> Banco Baterías 125Vdc, Rectificador, Trafo MT/BT y Grupo Diésel.
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={incluirInfra}
                  onChange={(e) => setIncluirInfra(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 border-slate-300"
                />
                <span>
                  <strong>Infraestructura Civil de Patio:</strong> Malla PAT (IEEE 80), Manto de Grava y Cercado Perimetral.
                </span>
              </label>

              {estructuraActual && (
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-sky-700 hover:text-sky-800 dark:text-cyan-300 dark:hover:text-cyan-200 pt-2 border-t border-slate-200 dark:border-sky-950">
                  <input
                    type="checkbox"
                    checked={preservarExistentes}
                    onChange={(e) => setPreservarExistentes(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 border-slate-300"
                  />
                  <span>
                    <strong>Preservar Datos de Placa Existentes:</strong> Conservar seriales troquelados, marcas y estados operativos previamente ingresados.
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Botones del Modal */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-sky-950">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Total salidas a generar: <strong className="text-slate-900 dark:text-white">{totalSeleccionados}</strong> bahías
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary py-2.5 px-4 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25"
              >
                <Sparkles className="w-4 h-4 text-white fill-current" />
                {estructuraActual ? 'Aplicar y Regenerar Esqueleto' : 'Generar Esqueleto CADAFE'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
