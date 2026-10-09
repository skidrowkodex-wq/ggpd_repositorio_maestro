import React, { useState } from 'react';
import { BahiaPatio, ComponentePatio, SubestacionEstructura } from '../types/sigad';
import { 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Eye,
  BatteryCharging,
  Cpu,
  Layers,
  Trash2,
  Plus
} from 'lucide-react';
import { AddBayModal } from './AddBayModal';
import { AddComponentModal } from './AddComponentModal';

interface Props {
  estructura: SubestacionEstructura;
  onSelectComponent: (comp: ComponentePatio) => void;
  onOpenFaultModal: (comp: ComponentePatio) => void;
  onOpenRestoreModal: (comp: ComponentePatio) => void;
  onAddBay: (bahia: { nombre_bahia: string; tipo_bahia: any; tension_kv: number }) => void;
  onDeleteBay: (bahiaId: string) => void;
  onAddComponent: (comp: ComponentePatio) => void;
  onDeleteComponent: (compId: string) => void;
}

export const BaysTreeView: React.FC<Props> = ({
  estructura,
  onSelectComponent,
  onOpenFaultModal,
  onOpenRestoreModal,
  onAddBay,
  onDeleteBay,
  onAddComponent,
  onDeleteComponent,
}) => {
  // Estado para colapsar/expandir bahías
  const [expandedBays, setExpandedBays] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    estructura.bahias.forEach(b => { init[b.id] = true; });
    return init;
  });

  // Modales de adición
  const [isAddBayOpen, setIsAddBayOpen] = useState(false);
  const [selectedBayToAddComp, setSelectedBayToAddComp] = useState<BahiaPatio | null>(null);

  const toggleBay = (bayId: string) => {
    setExpandedBays(prev => ({ ...prev, [bayId]: !prev[bayId] }));
  };

  const getBayIcon = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFORMACION_AT': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'BARRAS_MT': return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'CIRCUITO_SALIDA': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'SERVICIOS_AUXILIARES': return <BatteryCharging className="w-4 h-4 text-purple-400" />;
      default: return <Sliders className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleDeleteBay = (e: React.MouseEvent, bay: BahiaPatio) => {
    e.stopPropagation();
    if (window.confirm(`¿Confirma eliminar la bahía "${bay.nombre_bahia}" y todos sus ${bay.componentes.length} equipos?`)) {
      onDeleteBay(bay.id);
    }
  };

  const handleDeleteComponent = (e: React.MouseEvent, comp: ComponentePatio) => {
    e.stopPropagation();
    if (window.confirm(`¿Confirma eliminar el equipo "${comp.codigo_norma} · ${comp.nombre_equipo}"?`)) {
      onDeleteComponent(comp.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas del Árbol */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-sky-950/60">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            Árbol de Bahías y Equipos de Patio (Norma CADAFE NS-P-105)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {estructura.bahias.length} Bahías · {estructura.bahias.reduce((a, b) => a + b.componentes.length, 0)} Componentes Registrados
          </span>
        </div>

        <button
          onClick={() => setIsAddBayOpen(true)}
          className="btn btn-outline py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          + Agregar Bahía al Patio
        </button>
      </div>

      {/* Renderizado de Bahías */}
      {estructura.bahias.map((bahia) => {
        const isExpanded = expandedBays[bahia.id] !== false;
        const fallados = bahia.componentes.filter(c => c.estado_operativo === 'INDISPONIBLE_FALLADO').length;

        return (
          <div key={bahia.id} className="glass-panel overflow-hidden border border-slate-200 dark:border-sky-950/80 bg-white dark:bg-slate-900/90 shadow-sm">
            {/* Cabecera de la Bahía (Acordeón) */}
            <div
              onClick={() => toggleBay(bahia.id)}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800/60 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200 dark:border-sky-950/50"
            >
              <div className="flex items-center gap-3">
                <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" type="button">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2">
                  {getBayIcon(bahia.tipo_bahia)}
                  <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {bahia.nombre_bahia}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {fallados > 0 && (
                  <span className="badge badge-fallado text-[10px] py-0.5 px-2">
                    {fallados} FALLA
                  </span>
                )}
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {bahia.componentes.length} equipos
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-sky-800/40 font-bold">
                  {bahia.tension_kv} kV
                </span>

                {/* Acciones directas sobre la Bahía */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBayToAddComp(bahia);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700/80 text-sky-600 dark:text-cyan-400 transition-colors"
                  title="Agregar equipo a esta bahía"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteBay(e, bahia)}
                  className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Eliminar esta bahía"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Listado de Componentes de la Bahía */}
            {isExpanded && (
              <div className="divide-y divide-slate-100 dark:divide-sky-950/40 bg-white dark:bg-slate-950/40">
                {bahia.componentes.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No hay equipos en esta bahía. Pulse{' '}
                    <button
                      type="button"
                      onClick={() => setSelectedBayToAddComp(bahia)}
                      className="text-sky-600 dark:text-cyan-400 font-bold hover:underline"
                    >
                      + Agregar Equipo
                    </button>{' '}
                    para incorporar disyuntores, seccionadores o transformadores.
                  </div>
                ) : (
                  bahia.componentes.map((comp) => {
                    const isFallado = comp.estado_operativo === 'INDISPONIBLE_FALLADO';
                    const isObservacion = comp.estado_operativo === 'EN_OBSERVACION';

                    return (
                      <div
                        key={comp.id}
                        className={`p-3 px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                          isFallado ? 'bg-rose-50 dark:bg-rose-950/15' : ''
                        }`}
                      >
                        {/* Código de Norma y Nombre */}
                        <div className="flex items-center gap-3 min-w-[260px]">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-cyan-400 border border-sky-300 dark:border-sky-800/60 font-bold shrink-0">
                            {comp.codigo_norma}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {comp.nombre_equipo}
                              {comp.alarma_activa && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {comp.fabricante ? `${comp.fabricante} ` : ''}
                              {comp.serial ? `· Serial: ${comp.serial} ` : ''}
                              {comp.capacidad_mva ? `· ${comp.capacidad_mva} MVA` : ''}
                            </div>
                          </div>
                        </div>

                        {/* Estado y Observaciones */}
                        <div className="flex items-center gap-3">
                          {isFallado ? (
                            <span className="badge badge-fallado text-[10px]">
                              <AlertTriangle className="w-3 h-3" />
                              INDISPONIBLE (SCEIN)
                            </span>
                          ) : isObservacion ? (
                            <span className="badge badge-observacion text-[10px]">
                              <Clock className="w-3 h-3" />
                              EN OBSERVACIÓN
                            </span>
                          ) : (
                            <span className="badge badge-operativo text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              EN SERVICIO
                            </span>
                          )}

                          {comp.nivel_aceite && comp.nivel_aceite !== 'N/A' && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              comp.nivel_aceite === 'CRITICO' 
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' 
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}>
                              Aceite: {comp.nivel_aceite}
                            </span>
                          )}
                        </div>

                        {/* Botones de Maniobra y Cambio de Estado */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {isFallado ? (
                            <button
                              onClick={() => onOpenRestoreModal(comp)}
                              className="btn btn-success text-xs py-1 px-2.5 font-bold flex items-center gap-1 shadow-sm"
                              title="Restablecer a Operativo y Cerrar Indisponibilidad"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restablecer
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenFaultModal(comp)}
                              className="btn btn-danger text-xs py-1 px-2.5 font-bold flex items-center gap-1"
                              title="Declarar Avería / Indisponibilidad"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Declarar Falla
                            </button>
                          )}

                          <button
                            onClick={() => onSelectComponent(comp)}
                            className="btn btn-secondary text-xs py-1 px-2.5 font-medium flex items-center gap-1"
                            title="Ficha Técnica y Detalles del Activo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detalles
                          </button>

                          <button
                            onClick={(e) => handleDeleteComponent(e, comp)}
                            className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Eliminar este equipo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal para Agregar Bahía */}
      <AddBayModal
        isOpen={isAddBayOpen}
        seCodigo={estructura.se_codigo}
        defaultTensionKv={estructura.bahias[0]?.tension_kv || 13.8}
        onClose={() => setIsAddBayOpen(false)}
        onAdd={onAddBay}
      />

      {/* Modal para Agregar Componente a Bahía */}
      <AddComponentModal
        isOpen={Boolean(selectedBayToAddComp)}
        bahia={selectedBayToAddComp}
        onClose={() => setSelectedBayToAddComp(null)}
        onAdd={onAddComponent}
      />
    </div>
  );
};
