import React from 'react';
import { VehicleRecord } from '../types/fleet';
import { COMPONENT_FIELDS } from '../services/validationService';
import { FLEET_COLUMNS } from '../data/schemaDefinition';
import { adaptCorpoelecRegion } from '../services/regionAdapter';
import { X, Car, Wrench, ShieldCheck, UserCheck, Calendar, FileText, CheckCircle, AlertTriangle, Download, Edit } from 'lucide-react';
import { exportVehiclePDF } from '../services/pdfService';

interface VehicleDetailModalProps {
  vehicle: VehicleRecord | null;
  onClose: () => void;
  onEdit: (vehicle: VehicleRecord) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onEdit
}) => {
  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border-0 sm:border border-slate-200 sm:rounded-xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0b3d2e] border border-[#c9a227] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Car className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                  {vehicle.numero_vehiculo}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  vehicle.estado === 'ACTIVO'
                    ? 'bg-emerald-100 text-emerald-800'
                    : vehicle.estado === 'EN MANTENIMIENTO'
                    ? 'bg-amber-100 text-amber-800'
                    : vehicle.estado === 'RECUPERADO'
                    ? 'bg-emerald-50 text-[#0b3d2e] border border-[#0b3d2e]/30'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {vehicle.estado}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] sm:text-xs truncate">
                {vehicle.marca_vehiculo} · {vehicle.tipo_vehiculo} {vehicle.certificar_tipo_vehiculo ? `(${vehicle.certificar_tipo_vehiculo})` : ''}
              </p>
            </div>
          </div>

          {/* Desktop Action Buttons & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportVehiclePDF(vehicle)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0b3d2e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs min-h-[38px]"
              title="Descargar Ficha Técnica en PDF con Registro Fotográfico"
            >
              <Download className="w-3.5 h-3.5 text-[#0b3d2e]" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={() => onEdit(vehicle)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg transition-colors cursor-pointer min-h-[38px]"
            >
              <Edit className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Editar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {/* Section 1: Identification & Location */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-700" />
              <span>1. Identificación, Territorio y Ubicación Institucional</span>
            </h3>

            {/* Sub-panel territorial */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Correlativo Único</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{vehicle.correlativo_carga || vehicle.numero_vehiculo}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Región Adaptada SEN</span>
                <span className="font-bold text-[#0b3d2e] text-xs">
                  {adaptCorpoelecRegion(vehicle.estado_venezuela || vehicle.region || '')?.nombre || 'Región Central'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Estado Geográfico</span>
                <span className="font-bold text-slate-800 text-xs">{vehicle.estado_venezuela || 'No especificado'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700">
              <div>
                <span className="text-slate-500 text-[11px] block">Placa:</span>
                <span className="font-mono font-bold">{vehicle.placa || 'SIN PLACA'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Modelo Específico:</span>
                <span className="font-medium">{vehicle.modelo_vehiculo || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Año / Condición:</span>
                <span className="font-bold text-slate-900">{vehicle.condicion_actual || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Mantenimiento Preventivo:</span>
                <span className={`font-mono font-bold ${
                  vehicle.mantenimiento_preventivo === 'AL DIA' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {vehicle.mantenimiento_preventivo || 'PENDIENTE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
              <div>
                <span className="text-slate-500 text-[11px] block">Unidad Asignada:</span>
                <span className="font-semibold text-slate-900">{vehicle.unidad_asignada || 'Sin unidad asignada'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Centro de Servicios:</span>
                <span className="font-medium text-slate-700">{vehicle.centro_servicios || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: 21 Mechanical Components */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>2. Matriz de Inspección: 21 Componentes</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Total Reparaciones Requeridas: <strong>{vehicle.cant_total_reparaciones ?? 0}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {COMPONENT_FIELDS.map((field) => {
                const colDef = FLEET_COLUMNS.find(c => c.campo === field)!;
                const val = (vehicle[field] as string) || 'BUENO';
                let bgClass = 'bg-slate-50 border-slate-200 text-slate-700';
                if (val === 'BUENO') bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                if (val === 'REGULAR') bgClass = 'bg-amber-50 border-amber-300 text-amber-800 font-semibold';
                if (val === 'MALO') bgClass = 'bg-red-50 border-red-300 text-red-800 font-bold';
                if (val === 'N/A') bgClass = 'bg-slate-100 border-slate-200 text-slate-500';

                return (
                  <div key={field} className={`p-2 rounded-lg border text-center ${bgClass}`}>
                    <div className="text-[10px] text-slate-500 truncate" title={colDef.titulo}>
                      {colDef.titulo}
                    </div>
                    <div className="text-xs font-mono mt-0.5">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3 & 4 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 3: Insumos & Cauchos */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Insumos y Repuestos Demandados
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cantidad de Cauchos:</span>
                  <span className="font-mono font-bold">{vehicle.cant_cauchos ?? 0} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Medida de Cauchos:</span>
                  <span className="font-medium">{vehicle.medidas_caucho || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Baterías Requeridas:</span>
                  <span className="font-mono font-bold">{vehicle.cantidad_baterias ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Características Batería:</span>
                  <span className="font-medium truncate max-w-[200px]" title={vehicle.caracteristicas_bateria}>
                    {vehicle.caracteristicas_bateria || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prioridad recuperación:</span>
                  <span className="font-mono font-bold text-blue-700">{vehicle.prioridad_recuperacion || 'MEDIA'}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Recovery & Gerencias */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Recuperación y Gerencias
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehículo Recuperado:</span>
                  <span className="font-bold">{vehicle.vehiculo_recuperado || 'NO'}</span>
                </div>
                {vehicle.vehiculo_recuperado === 'SI' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha Recuperación:</span>
                    <span className="font-mono">{vehicle.fecha_recuperacion || '—'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Gerencia de Origen:</span>
                  <span className="font-medium truncate max-w-[200px]" title={vehicle.gerencia_origen}>
                    {vehicle.gerencia_origen || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Devuelto a Origen:</span>
                  <span className="font-bold">{vehicle.vehiculo_otra_gerencia_devuelto || 'NO'}</span>
                </div>
                {vehicle.vehiculo_otra_gerencia_devuelto === 'SI' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha de Entrega:</span>
                    <span className="font-mono">{vehicle.fecha_entrega_gerencia_origen || '—'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Custodian */}
          <div className="border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Personal Responsable Asignado</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{vehicle.nombre_personal_responsable || 'No asignado'}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  C.I: {vehicle.cedula_personal_responsable || '—'} · Tel: {vehicle.telefono_personal_responsable || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Observaciones */}
          {vehicle.observacion && (
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
              <span className="font-semibold text-amber-900 block mb-0.5">Observaciones Técnicas:</span>
              <p className="text-amber-800 leading-relaxed text-xs">{vehicle.observacion}</p>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="sm:hidden p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportVehiclePDF(vehicle)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-[#0b3d2e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0b3d2e]" />
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-[#0b3d2e] hover:bg-[#1a5f47] border border-[#c9a227] rounded-lg min-h-[44px] cursor-pointer"
          >
            <Edit className="w-4 h-4 text-[#c9a227]" />
            <span>Editar Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
