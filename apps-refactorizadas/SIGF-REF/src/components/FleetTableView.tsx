import React, { useState, useMemo } from 'react';
import { VehicleRecord } from '../types/fleet';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { adaptVehicleLocation } from '../services/regionAdapter';
import { exportFleetToExcel, downloadEmptyTemplate } from '../services/excelService';
import { exportVehiclePDF } from '../services/pdfService';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  LayoutGrid,
  List
} from 'lucide-react';

interface FleetTableViewProps {
  vehicles: VehicleRecord[];
  onSelectVehicle: (vehicle: VehicleRecord) => void;
  onEditVehicle: (vehicle: VehicleRecord) => void;
  onDeleteVehicle: (id: string, numero: string) => void;
  onNewVehicle: () => void;
  onOpenImportModal: () => void;
}

export const FleetTableView: React.FC<FleetTableViewProps> = ({
  vehicles,
  onSelectVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onNewVehicle,
  onOpenImportModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [conditionFilter, setConditionFilter] = useState('TODAS');
  const [regionFilter, setRegionFilter] = useState('TODAS');
  const [mobileViewStyle, setMobileViewStyle] = useState<'cards' | 'table'>('cards');

  // Metrics
  const stats = useMemo(() => {
    const total = vehicles.length;
    const activos = vehicles.filter(v => v.estado === 'ACTIVO').length;
    const enMantenimiento = vehicles.filter(v => v.estado === 'EN MANTENIMIENTO').length;
    const fueraServicio = vehicles.filter(v => v.estado === 'FUERA DE SERVICIO').length;
    const recuperados = vehicles.filter(v => v.vehiculo_recuperado === 'SI' || v.estado === 'RECUPERADO').length;

    const totalCauchosDemandados = vehicles.reduce((sum, v) => sum + (Number(v.cant_cauchos) || 0), 0);
    const totalBateriasDemandadas = vehicles.reduce((sum, v) => sum + (Number(v.cantidad_baterias) || 0), 0);

    return {
      total,
      activos,
      enMantenimiento,
      fueraServicio,
      recuperados,
      totalCauchosDemandados,
      totalBateriasDemandadas
    };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchStatus = statusFilter === 'TODOS' || v.estado === statusFilter;
      const matchCond = conditionFilter === 'TODAS' || v.condicion_actual === conditionFilter;
      
      const loc = adaptVehicleLocation(v);
      const matchRegion = regionFilter === 'TODAS' || 
        loc.region === regionFilter || 
        v.region === regionFilter;

      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term ||
        v.numero_vehiculo.toLowerCase().includes(term) ||
        (v.correlativo_carga && v.correlativo_carga.toLowerCase().includes(term)) ||
        (loc.region && loc.region.toLowerCase().includes(term)) ||
        (v.region && v.region.toLowerCase().includes(term)) ||
        (v.estado_venezuela && v.estado_venezuela.toLowerCase().includes(term)) ||
        v.marca_vehiculo.toLowerCase().includes(term) ||
        v.tipo_vehiculo.toLowerCase().includes(term) ||
        (v.unidad_asignada && v.unidad_asignada.toLowerCase().includes(term)) ||
        (v.centro_servicios && v.centro_servicios.toLowerCase().includes(term)) ||
        (v.nombre_personal_responsable && v.nombre_personal_responsable.toLowerCase().includes(term)) ||
        (v.cedula_personal_responsable && v.cedula_personal_responsable.toLowerCase().includes(term));

      return matchStatus && matchCond && matchRegion && matchSearch;
    });
  }, [vehicles, searchTerm, statusFilter, conditionFilter, regionFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Flota</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Vehículos registrados</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-emerald-700 font-medium">Activos Operativos</div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">{stats.activos}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {stats.total > 0 ? `${Math.round((stats.activos / stats.total) * 100)}% de disponibilidad` : '0%'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-amber-700 font-medium">En Mantenimiento</div>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1 tabular-nums">{stats.enMantenimiento}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">En talleres / patio</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-amber-800 font-medium">Fuera de Servicio</div>
          <div className="text-xl font-bold font-mono text-amber-900 mt-1 tabular-nums">{stats.fueraServicio}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Inoperativos</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-blue-700 font-medium">Recuperados</div>
          <div className="text-xl font-bold font-mono text-blue-800 mt-1 tabular-nums">{stats.recuperados}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Jornadas técnicas</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-700 font-medium">Cauchos Demandados</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{stats.totalCauchosDemandados}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unidades de reemplazo</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header / Action Strip */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Inventario y Control Operativo de Flota
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualización compatible 1:1 con el formato oficial <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">FLOTA.xlsx (Cols A:AS)</code>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Excel / CSV</span>
            </button>

            <button
              onClick={() => exportFleetToExcel(vehicles)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors whitespace-nowrap"
              title="Descargar libro con las 45 columnas exactas"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar FLOTA.xlsx</span>
            </button>

            <button
              onClick={() => downloadEmptyTemplate()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Descargar plantilla Excel limpia con encabezados A:AS"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plantilla Oficial</span>
            </button>

            <button
              onClick={onNewVehicle}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Unidad</span>
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por N° Vehículo, Marca, Unidad, Responsable o Cédula..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="EN MANTENIMIENTO">EN MANTENIMIENTO</option>
                <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                <option value="RECUPERADO">RECUPERADO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">Condición:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="TODAS">Todas las Condiciones</option>
                <option value="BUENO">BUENO</option>
                <option value="REGULAR">REGULAR</option>
                <option value="MALO">MALO</option>
                <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
              </select>
            </div>

             <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
               <span className="text-slate-500 font-medium">Región:</span>
               <select
                 value={regionFilter}
                 onChange={(e) => setRegionFilter(e.target.value)}
                 className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[180px] uppercase font-mono"
               >
                 <option value="TODAS" className="bg-white text-slate-900">TODAS LAS REGIONES</option>
                 {VENEZUELA_REGIONS.map(r => (
                   <option key={r.id} value={r.nombre} className="bg-white text-slate-900 uppercase">
                     {r.nombre.toUpperCase()}
                   </option>
                 ))}
               </select>
             </div>

             {/* Selector de Vista en Celulares (Tarjetas vs Tabla) */}
             <div className="flex md:hidden items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold ml-auto">
               <button
                 type="button"
                 onClick={() => setMobileViewStyle('cards')}
                 className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                   mobileViewStyle === 'cards'
                     ? 'bg-white text-[#0b3d2e] shadow-xs font-bold'
                     : 'text-slate-600 hover:text-slate-900'
                 }`}
                 title="Vista Tarjetas (Óptima para móviles)"
               >
                 <LayoutGrid className="w-3.5 h-3.5" />
                 <span>Fichas</span>
               </button>
               <button
                 type="button"
                 onClick={() => setMobileViewStyle('table')}
                 className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                   mobileViewStyle === 'table'
                     ? 'bg-white text-[#0b3d2e] shadow-xs font-bold'
                     : 'text-slate-600 hover:text-slate-900'
                 }`}
                 title="Vista Tabla Completa"
               >
                 <List className="w-3.5 h-3.5" />
                 <span>Tabla</span>
               </button>
             </div>
          </div>
        </div>

        {/* 1. Vista de Tarjetas Táctiles Optimizada para Celulares / Móviles */}
        {mobileViewStyle === 'cards' && (
          <div className="md:hidden divide-y divide-slate-100">
            {filteredVehicles.map((vehicle) => {
              const compFields = [
                vehicle.pastillas, vehicle.bandas, vehicle.bomba_freno, vehicle.disco,
                vehicle.plato, vehicle.collarin, vehicle.bombin_superior, vehicle.bombin_inferior,
                vehicle.bateria, vehicle.bobina, vehicle.bujias, vehicle.cauchos,
                vehicle.correas_motor, vehicle.luces_delanteras, vehicle.parabrisas,
                vehicle.tren_delantero, vehicle.ballesta, vehicle.crucetas,
                vehicle.amortiguadores, vehicle.radiador, vehicle.motor
              ];
              const countMalo = compFields.filter(c => c === 'MALO').length;
              const countReg = compFields.filter(c => c === 'REGULAR').length;
              const countBueno = compFields.filter(c => c === 'BUENO').length;

              return (
                <div key={vehicle.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{vehicle.numero_vehiculo}</span>
                        {vehicle.placa && (
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                            {vehicle.placa}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        {vehicle.marca_vehiculo} {vehicle.modelo_vehiculo ? `· ${vehicle.modelo_vehiculo}` : ''} ({vehicle.tipo_vehiculo || 'Vehículo'})
                      </div>
                    </div>

                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      vehicle.estado === 'ACTIVO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : vehicle.estado === 'EN MANTENIMIENTO'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : vehicle.estado === 'RECUPERADO'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {vehicle.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Ubicación</span>
                      <span className="font-medium text-slate-800 text-[11px] truncate block">
                        {vehicle.estado_venezuela || vehicle.region || 'No especificada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Mantenimiento</span>
                      <span className={`font-mono text-[11px] font-semibold block ${
                        vehicle.mantenimiento_preventivo === 'AL DIA'
                          ? 'text-emerald-700'
                          : vehicle.mantenimiento_preventivo === 'VENCIDO'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}>
                        {vehicle.mantenimiento_preventivo || 'PENDIENTE'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Diagnóstico</span>
                      <span className="font-mono text-[11px] text-slate-700 block">
                        {countBueno}B {countReg > 0 ? `· ${countReg}R` : ''} {countMalo > 0 ? `· ${countMalo}M` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Condición</span>
                      <span className="text-slate-800 font-semibold text-[11px] block">
                        {vehicle.condicion_actual || '—'}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Custodio / Responsable</span>
                      <span className="text-slate-800 text-[11px] font-medium block truncate">
                        {vehicle.nombre_personal_responsable || 'Sin custodio asignado'}
                        {vehicle.telefono_personal_responsable ? ` · Tel: ${vehicle.telefono_personal_responsable}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectVehicle(vehicle)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[42px]"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ficha 360°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportVehiclePDF(vehicle)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#0b3d2e] border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[42px]"
                      title="Descargar Reporte Técnico en PDF"
                    >
                      <Download className="w-4 h-4 text-[#0b3d2e]" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditVehicle(vehicle)}
                      className="p-2 text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 rounded-lg border border-slate-200 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                      title="Editar Registro"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteVehicle(vehicle.id, vehicle.numero_vehiculo)}
                      className="p-2 text-slate-400 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                      title="Eliminar Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Vehicles Table (Desktop Siempre / Móvil opcional al alternar) */}
        <div className={`${mobileViewStyle === 'cards' ? 'hidden md:block' : 'block'} overflow-x-auto`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">N° Vehículo (Col B)</th>
                <th className="py-3 px-4">Marca & Tipo</th>
                <th className="py-3 px-4">Unidad Asignada & CS</th>
                <th className="py-3 px-3 text-center">Estado (Col A)</th>
                <th className="py-3 px-3 text-center">Condición (Col G)</th>
                <th className="py-3 px-3 text-center">21 Componentes</th>
                <th className="py-3 px-4">Personal Responsable</th>
                <th className="py-3 px-4 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => {
                // Compute bad/regular mechanical components
                const componentValues = [
                  vehicle.pastillas, vehicle.bandas, vehicle.bomba_freno, vehicle.disco,
                  vehicle.plato, vehicle.collarin, vehicle.bombin_superior, vehicle.bombin_inferior,
                  vehicle.bateria, vehicle.bobina, vehicle.bujias, vehicle.cauchos,
                  vehicle.correas_motor, vehicle.luces_delanteras, vehicle.parabrisas,
                  vehicle.tren_delantero, vehicle.ballesta, vehicle.crucetas,
                  vehicle.amortiguadores, vehicle.radiador, vehicle.motor
                ];

                const countMalo = componentValues.filter(v => v === 'MALO').length;
                const countReg = componentValues.filter(v => v === 'REGULAR').length;
                const countBueno = componentValues.filter(v => v === 'BUENO').length;

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Vehicle Number */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {vehicle.numero_vehiculo}
                      </div>
                      {vehicle.prioridad_recuperacion && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Prioridad: {vehicle.prioridad_recuperacion}
                        </div>
                      )}
                    </td>

                    {/* Brand & Type */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{vehicle.marca_vehiculo}</div>
                      <div className="text-slate-500 text-[11px]">{vehicle.tipo_vehiculo}</div>
                    </td>

                    {/* Unidad Asignada (Libre) & Centro de Servicios (FK Estado) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 shrink-0">
                          UNIDAD
                        </span>
                        <span className="text-slate-800 font-medium truncate max-w-[160px]" title={vehicle.unidad_asignada}>
                          {vehicle.unidad_asignada || 'Sin asignar (Libre)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold text-purple-800 bg-purple-50 px-1 py-0.2 rounded border border-purple-200 shrink-0">
                          CS
                        </span>
                        <span className="text-[11px] text-slate-600 truncate max-w-[160px]" title={vehicle.centro_servicios}>
                          {vehicle.centro_servicios || '—'}
                        </span>
                      </div>
                    </td>

                    {/* General Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        vehicle.estado === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : vehicle.estado === 'EN MANTENIMIENTO'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : vehicle.estado === 'RECUPERADO'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {vehicle.estado}
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                        vehicle.condicion_actual === 'BUENO'
                          ? 'text-emerald-700'
                          : vehicle.condicion_actual === 'REGULAR'
                          ? 'text-amber-700'
                          : 'text-amber-700'
                      }`}>
                        {vehicle.condicion_actual}
                      </span>
                    </td>

                    {/* 21 Component Diagnosis Pill */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                        {countMalo > 0 && (
                          <span className="text-amber-700 font-bold" title={`${countMalo} componentes en estado MALO`}>
                            {countMalo}M
                          </span>
                        )}
                        {countReg > 0 && (
                          <span className="text-amber-700 font-bold" title={`${countReg} componentes en estado REGULAR`}>
                            {countReg}R
                          </span>
                        )}
                        <span className="text-emerald-700" title={`${countBueno} componentes en estado BUENO`}>
                          {countBueno}B
                        </span>
                      </div>
                    </td>

                    {/* Responsible Person */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {vehicle.nombre_personal_responsable || 'Sin custodio'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {vehicle.cedula_personal_responsable || '—'} {vehicle.telefono_personal_responsable ? `· ${vehicle.telefono_personal_responsable}` : ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectVehicle(vehicle)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Ver Ficha Técnica 360°"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportVehiclePDF(vehicle)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          title="Descargar Reporte Técnico PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditVehicle(vehicle)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                          title="Editar Registro"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteVehicle(vehicle.id, vehicle.numero_vehiculo)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-xs">
            No se encontraron unidades registradas con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};
