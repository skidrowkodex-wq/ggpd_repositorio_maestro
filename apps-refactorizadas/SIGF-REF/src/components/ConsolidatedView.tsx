import React, { useState, useMemo } from 'react';
import { VehicleRecord } from '../types/fleet';
import { COMPONENT_FIELDS } from '../services/validationService';
import { FLEET_COLUMNS } from '../data/schemaDefinition';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { 
  adaptCorpoelecRegion, 
  adaptVehicleLocation, 
  computeCorpoelecRegionalSummary 
} from '../services/regionAdapter';
import { exportFleetToExcel, downloadEmptyTemplate } from '../services/excelService';
import { exportVehiclePDF } from '../services/pdfService';
import { 
  BarChart3, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Wrench, 
  BatteryCharging, 
  Layers, 
  Car,
  CheckCircle2,
  AlertTriangle,
  Download,
  MapPin,
  Building2,
  Globe,
  LayoutGrid,
  List
} from 'lucide-react';

interface ConsolidatedViewProps {
  vehicles: VehicleRecord[];
  onSelectVehicle: (vehicle: VehicleRecord) => void;
  onEditVehicle: (vehicle: VehicleRecord) => void;
  onDeleteVehicle: (id: string, numero: string) => void;
  onGoToForm: () => void;
  onOpenImportModal: () => void;
  onClearDatabase?: () => void;
  /** Verificación de permisos por rol. Si no se provee, todo está permitido. */
  can?: (actionId: string) => boolean;
}

export const ConsolidatedView: React.FC<ConsolidatedViewProps> = ({
  vehicles,
  onSelectVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onGoToForm,
  onOpenImportModal,
  onClearDatabase,
  can
}) => {
  const allow = (actionId: string) => (can ? can(actionId) : true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [conditionFilter, setConditionFilter] = useState('TODAS');
  const [gerenciaFilter, setGerenciaFilter] = useState('TODAS');
  const [regionFilter, setRegionFilter] = useState('TODAS');
  const [activeSubTab, setActiveSubTab] = useState<'tabla' | 'resumen_territorial' | 'resumen_componentes' | 'resumen_gerencias'>('tabla');

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [maintenanceFilter, setMaintenanceFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODAS');
  const [recoveredFilter, setRecoveredFilter] = useState('TODOS');
  const [mobileViewStyle, setMobileViewStyle] = useState<'cards' | 'table'>('cards');

  // 1. Consolidated High-Level Metrics
  const summaryMetrics = useMemo(() => {
    const total = vehicles.length;
    const activos = vehicles.filter(v => v.estado === 'ACTIVO').length;
    const enMantenimiento = vehicles.filter(v => v.estado === 'EN MANTENIMIENTO').length;
    const fueraServicio = vehicles.filter(v => v.estado === 'FUERA DE SERVICIO').length;
    const recuperados = vehicles.filter(v => v.vehiculo_recuperado === 'SI' || v.estado === 'RECUPERADO').length;

    const totalCauchos = vehicles.reduce((acc, v) => acc + (Number(v.cant_cauchos) || 0), 0);
    const totalBaterias = vehicles.reduce((acc, v) => acc + (Number(v.cantidad_baterias) || 0), 0);
    const totalReparaciones = vehicles.reduce((acc, v) => acc + (Number(v.cant_total_reparaciones) || 0), 0);

    const disponibilidadPct = total > 0 ? Math.round((activos / total) * 100) : 0;

    return {
      total,
      activos,
      enMantenimiento,
      fueraServicio,
      recuperados,
      totalCauchos,
      totalBaterias,
      totalReparaciones,
      disponibilidadPct
    };
  }, [vehicles]);

  // 2. Consolidated Analysis of the 21 Mechanical Components
  const componentFaultSummary = useMemo(() => {
    const statsMap: { [key: string]: { titulo: string; columna: string; malo: number; regular: number; bueno: number } } = {};

    COMPONENT_FIELDS.forEach(field => {
      const colDef = FLEET_COLUMNS.find(c => c.campo === field)!;
      statsMap[field] = {
        titulo: colDef.titulo,
        columna: colDef.columna_excel,
        malo: 0,
        regular: 0,
        bueno: 0
      };
    });

    vehicles.forEach(v => {
      COMPONENT_FIELDS.forEach(field => {
        const val = (v[field] as string || '').toUpperCase();
        if (val === 'MALO') statsMap[field].malo++;
        else if (val === 'REGULAR') statsMap[field].regular++;
        else if (val === 'BUENO') statsMap[field].bueno++;
      });
    });

    // Sort by highest defects (malo + regular)
    return Object.values(statsMap).sort((a, b) => (b.malo + b.regular) - (a.malo + a.regular));
  }, [vehicles]);

  // 3. Consolidated Grouping by Gerencia
  const gerenciaSummary = useMemo(() => {
    const map = new Map<string, { total: number; activos: number; mantenimiento: number; fueraServicio: number }>();

    vehicles.forEach(v => {
      const g = v.gerencia_origen || 'Sin Gerencia Asignada';
      if (!map.has(g)) {
        map.set(g, { total: 0, activos: 0, mantenimiento: 0, fueraServicio: 0 });
      }
      const data = map.get(g)!;
      data.total++;
      if (v.estado === 'ACTIVO') data.activos++;
      else if (v.estado === 'EN MANTENIMIENTO') data.mantenimiento++;
      else if (v.estado === 'FUERA DE SERVICIO') data.fueraServicio++;
    });

    return Array.from(map.entries()).map(([gerencia, stats]) => ({
      gerencia,
      ...stats
    })).sort((a, b) => b.total - a.total);
  }, [vehicles]);

  // 4. Consolidated Grouping by Venezuelan Region & State (including Guayana Esequiba)
  const territorialSummary = useMemo(() => {
    const map = new Map<string, { region: string; total: number; activos: number; mantenimiento: number; fueraServicio: number }>();

    vehicles.forEach(v => {
      const stateName = v.estado_venezuela || 'Sin Definir';
      const regionName = v.region || 'Sin Definir';
      if (!map.has(stateName)) {
        map.set(stateName, { region: regionName, total: 0, activos: 0, mantenimiento: 0, fueraServicio: 0 });
      }
      const item = map.get(stateName)!;
      item.total++;
      if (v.estado === 'ACTIVO') item.activos++;
      else if (v.estado === 'EN MANTENIMIENTO') item.mantenimiento++;
      else if (v.estado === 'FUERA DE SERVICIO') item.fueraServicio++;
    });

    return Array.from(map.entries()).map(([estado, data]) => ({
      estado,
      ...data
    })).sort((a, b) => b.total - a.total);
  }, [vehicles]);

  // Unique Gerencias for Filter
  const uniqueGerencias = useMemo(() => {
    const list = vehicles.map(v => v.gerencia_origen).filter(Boolean);
    return ['TODAS', ...Array.from(new Set(list))];
  }, [vehicles]);

  // Official CORPOELEC Regions for Filter (all official regions available)
  const uniqueRegions = useMemo(() => {
    const officialNames = VENEZUELA_REGIONS.map(r => r.nombre);
    return ['TODAS', ...officialNames];
  }, []);

  // Official CORPOELEC Regional Summary
  const corpoelecRegionalSummary = useMemo(() => {
    return computeCorpoelecRegionalSummary(vehicles);
  }, [vehicles]);

  // 5. Filtered Database Records
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchStatus = statusFilter === 'TODOS' || v.estado === statusFilter;
      const matchCond = conditionFilter === 'TODAS' || v.condicion_actual === conditionFilter;
      const matchGerencia = gerenciaFilter === 'TODAS' || v.gerencia_origen === gerenciaFilter;
      
      const loc = adaptVehicleLocation(v);
      const matchRegion = regionFilter === 'TODAS' || 
        loc.region === regionFilter || 
        v.region === regionFilter;

      const matchMaintenance = maintenanceFilter === 'TODOS' || v.mantenimiento_preventivo === maintenanceFilter;
      const matchPriority = priorityFilter === 'TODAS' || v.prioridad_recuperacion === priorityFilter;
      const matchRecovered = recoveredFilter === 'TODOS' || v.vehiculo_recuperado === recoveredFilter;

      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term ||
        v.numero_vehiculo.toLowerCase().includes(term) ||
        (v.correlativo_carga && v.correlativo_carga.toLowerCase().includes(term)) ||
        (v.estado_venezuela && v.estado_venezuela.toLowerCase().includes(term)) ||
        (loc.region && loc.region.toLowerCase().includes(term)) ||
        (v.region && v.region.toLowerCase().includes(term)) ||
        v.marca_vehiculo.toLowerCase().includes(term) ||
        v.tipo_vehiculo.toLowerCase().includes(term) ||
        (v.unidad_asignada && v.unidad_asignada.toLowerCase().includes(term)) ||
        (v.centro_servicios && v.centro_servicios.toLowerCase().includes(term)) ||
        (v.nombre_personal_responsable && v.nombre_personal_responsable.toLowerCase().includes(term)) ||
        (v.cedula_personal_responsable && v.cedula_personal_responsable.toLowerCase().includes(term));

      return matchStatus && matchCond && matchGerencia && matchRegion && matchMaintenance && matchPriority && matchRecovered && matchSearch;
    });
  }, [vehicles, searchTerm, statusFilter, conditionFilter, gerenciaFilter, regionFilter, maintenanceFilter, priorityFilter, recoveredFilter]);

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Consolidated Banner */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-[#0b3d2e] rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b3d2e] uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4 text-[#c9a227]" />
              <span>Consolidado General de Base de Datos SEN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Reporte Consolidado de Flota Vehicular
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Resumen estadístico del parque automotor, requerimientos de insumos y registros capturados según estándar CORPOELEC GGPD.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full lg:w-auto">
            {allow('btn_import_excel') && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0b3d2e] bg-[#f8f9fa] hover:bg-[#1a5f47]/10 rounded-lg transition-colors border border-[#0b3d2e]/30 cursor-pointer text-center"
            >
              <Upload className="w-3.5 h-3.5 text-[#0b3d2e] shrink-0" />
              <span>Cargar Excel<span className="hidden sm:inline"> a BD</span></span>
            </button>
            )}

            {allow('btn_export_excel') && (
            <button
              onClick={() => exportFleetToExcel(vehicles)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-xs cursor-pointer hover:brightness-110 text-center"
              style={{
                background: 'linear-gradient(135deg, #1a5f47 0%, #0b3d2e 100%)',
                border: '1px solid #c9a227'
              }}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#c9a227] shrink-0" />
              <span>Exportar FLOTA.xlsx<span className="hidden sm:inline"> (45 Cols)</span></span>
            </button>
            )}

            {allow('tab_formulario') && (
            <button
              onClick={onGoToForm}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-xs cursor-pointer hover:brightness-110 text-center"
              style={{
                background: 'linear-gradient(135deg, #0b3d2e 0%, #1a5f47 100%)',
                border: '1px solid #c9a227'
              }}
            >
              <Plus className="w-4 h-4 text-[#c9a227] shrink-0" />
              <span>Nuevo Registro</span>
            </button>
            )}

            {onClearDatabase && allow('btn_vaciar_bd') && (
              <button
                onClick={onClearDatabase}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300 cursor-pointer text-center"
                title="Vaciar base de datos y reiniciar correlativos a 0001"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Vaciar BD<span className="hidden sm:inline"> y Reiniciar</span></span>
              </button>
            )}
          </div>
        </div>

        {/* High-Level Consolidated KPI Grid */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] text-slate-500 font-semibold">Total Vehículos</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1 tabular-nums">{summaryMetrics.total}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">En base de datos</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <div className="text-[11px] text-emerald-800 font-bold">Activos</div>
            <div className="text-xl font-black font-mono text-emerald-900 mt-1 tabular-nums">{summaryMetrics.activos}</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{summaryMetrics.disponibilidadPct}% disponibilidad</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <div className="text-[11px] text-amber-800 font-bold">En Mantenimiento</div>
            <div className="text-xl font-black font-mono text-amber-900 mt-1 tabular-nums">{summaryMetrics.enMantenimiento}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">En talleres / patio</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <div className="text-[11px] text-amber-900 font-bold">Fuera de Servicio</div>
            <div className="text-xl font-black font-mono text-amber-950 mt-1 tabular-nums">{summaryMetrics.fueraServicio}</div>
            <div className="text-[10px] text-amber-800 mt-0.5">Inoperativos</div>
          </div>

          <div className="bg-emerald-50/40 border border-[#0b3d2e]/30 rounded-lg p-3">
            <div className="text-[11px] text-[#0b3d2e] font-bold">Recuperados</div>
            <div className="text-xl font-black font-mono text-[#0b3d2e] mt-1 tabular-nums">{summaryMetrics.recuperados}</div>
            <div className="text-[10px] text-[#1a5f47] mt-0.5">Reincorporados</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] text-slate-600 font-semibold">Cauchos Demandados</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1 tabular-nums">{summaryMetrics.totalCauchos}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Suma consolidada</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] text-slate-600 font-semibold">Baterías Requeridas</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1 tabular-nums">{summaryMetrics.totalBaterias}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Acumuladores</div>
          </div>
        </div>

        {/* Sub-Tabs for Consolidated Views */}
        <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('tabla')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'tabla'
                ? 'bg-[#0b3d2e] text-white border border-[#c9a227] shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Base de Datos Consolidada (Tabla)
          </button>
          <button
            onClick={() => setActiveSubTab('resumen_territorial')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'resumen_territorial'
                ? 'bg-[#0b3d2e] text-white border border-[#c9a227] shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Distribución Territorial (Venezuela y Esequibo)
          </button>
          <button
            onClick={() => setActiveSubTab('resumen_componentes')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'resumen_componentes'
                ? 'bg-[#0b3d2e] text-white border border-[#c9a227] shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Consolidado Mecánico (21 Componentes)
          </button>
          <button
            onClick={() => setActiveSubTab('resumen_gerencias')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'resumen_gerencias'
                ? 'bg-[#0b3d2e] text-white border border-[#c9a227] shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Consolidado por Gerencias de Origen
          </button>
        </div>
      </div>

      {/* VIEW 1: Consolidated Table */}
      {activeSubTab === 'tabla' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por N° Vehículo, Marca, Tipo, Unidad o Cédula..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-500 font-medium">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="EN MANTENIMIENTO">EN MANTENIMIENTO</option>
                  <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                  <option value="RECUPERADO">RECUPERADO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-500 font-medium">Condición:</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas</option>
                  <option value="BUENO">BUENO</option>
                  <option value="REGULAR">REGULAR</option>
                  <option value="MALO">MALO</option>
                  <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                </select>
              </div>

              {uniqueGerencias.length > 2 && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-500 font-medium">Gerencia:</span>
                  <select
                    value={gerenciaFilter}
                    onChange={(e) => setGerenciaFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[160px] truncate"
                  >
                    {uniqueGerencias.map(g => (
                      <option key={g} value={g}>{g === 'TODAS' ? 'Todas las Gerencias' : g}</option>
                    ))}
                  </select>
                </div>
              )}

              {uniqueRegions.length > 2 && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-500 font-medium">Región:</span>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[150px] truncate"
                  >
                    {uniqueRegions.map(r => (
                      <option key={r} value={r}>{r === 'TODAS' ? 'Todas las Regiones' : r}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowAdvancedFilters(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border cursor-pointer ${
                  showAdvancedFilters
                    ? 'bg-[#0b3d2e] text-white border-[#c9a227]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Avanzado</span>
              </button>

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

          {/* Advanced Filter Panel Drawer */}
          {showAdvancedFilters && (
            <div className="p-4 bg-slate-100 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mantenimiento Preventivo:</label>
                <select
                  value={maintenanceFilter}
                  onChange={(e) => setMaintenanceFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="AL DIA">AL DÍA</option>
                  <option value="VENCIDO">VENCIDO</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="NO APLICA">NO APLICA</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Prioridad de Recuperación:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="TODAS">Todas las Prioridades</option>
                  <option value="ALTA">ALTA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="BAJA">BAJA</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehículo Recuperado:</label>
                <select
                  value={recoveredFilter}
                  onChange={(e) => setRecoveredFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="SI">SÍ</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setMaintenanceFilter('TODOS');
                    setPriorityFilter('TODAS');
                    setRecoveredFilter('TODOS');
                    setSearchTerm('');
                    setStatusFilter('TODOS');
                    setConditionFilter('TODAS');
                    setGerenciaFilter('TODAS');
                    setRegionFilter('TODAS');
                  }}
                  className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          {/* 1. Vista de Tarjetas Táctiles Optimizada para Celulares / Móviles */}
          {mobileViewStyle === 'cards' && (
            <div className="md:hidden divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => {
                const compValues = [
                  vehicle.pastillas, vehicle.bandas, vehicle.bomba_freno, vehicle.disco,
                  vehicle.plato, vehicle.collarin, vehicle.bombin_superior, vehicle.bombin_inferior,
                  vehicle.bateria, vehicle.bobina, vehicle.bujias, vehicle.cauchos,
                  vehicle.correas_motor, vehicle.luces_delanteras, vehicle.parabrisas,
                  vehicle.tren_delantero, vehicle.ballesta, vehicle.crucetas,
                  vehicle.amortiguadores, vehicle.radiador, vehicle.motor
                ];
                const malos = compValues.filter(c => c === 'MALO').length;
                const regulares = compValues.filter(c => c === 'REGULAR').length;
                const buenos = compValues.filter(c => c === 'BUENO').length;

                return (
                  <div key={vehicle.id} className="p-4 space-y-3 bg-white">
                    {/* Header: N° Vehiculo, Placa y Estatus */}
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

                    {/* Ficha de Detalles Compacta */}
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
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">21 Componentes</span>
                        <span className="font-mono text-[11px] text-slate-700 block">
                          {buenos}B {regulares > 0 ? `· ${regulares}R` : ''} {malos > 0 ? `· ${malos}M` : ''}
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

                    {/* Botones Táctiles de Acción Móvil (Mínimo 42px touch target) */}
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

                      {allow('btn_edit_vehiculo') && (
                      <button
                        type="button"
                        onClick={() => onEditVehicle(vehicle)}
                        className="p-2 text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 rounded-lg border border-slate-200 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                        title="Editar Registro"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      )}

                      {onDeleteVehicle && allow('btn_delete_vehiculo') && (
                        <button
                          type="button"
                          onClick={() => onDeleteVehicle(vehicle.id, vehicle.numero_vehiculo)}
                          className="p-2 text-slate-400 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                          title="Eliminar Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Tabla Desplazable (Desktop Siempre / Móvil opcional al alternar) */}
          <div className={`${mobileViewStyle === 'cards' ? 'hidden md:block' : 'block'} overflow-x-auto`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">N° Vehículo & Correlativo</th>
                  <th className="py-3 px-4">Marca & Tipo</th>
                  <th className="py-3 px-4">Unidad Asignada & CS</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-center">Condición</th>
                  <th className="py-3 px-3 text-center">21 Componentes</th>
                  <th className="py-3 px-4">Personal Responsable</th>
                  <th className="py-3 px-4 text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => {
                  const compValues = [
                    vehicle.pastillas, vehicle.bandas, vehicle.bomba_freno, vehicle.disco,
                    vehicle.plato, vehicle.collarin, vehicle.bombin_superior, vehicle.bombin_inferior,
                    vehicle.bateria, vehicle.bobina, vehicle.bujias, vehicle.cauchos,
                    vehicle.correas_motor, vehicle.luces_delanteras, vehicle.parabrisas,
                    vehicle.tren_delantero, vehicle.ballesta, vehicle.crucetas,
                    vehicle.amortiguadores, vehicle.radiador, vehicle.motor
                  ];

                  const malos = compValues.filter(c => c === 'MALO').length;
                  const regulares = compValues.filter(c => c === 'REGULAR').length;
                  const buenos = compValues.filter(c => c === 'BUENO').length;

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-sm">{vehicle.numero_vehiculo}</span>
                          {vehicle.estado_venezuela && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              vehicle.estado_venezuela === 'Guayana Esequiba'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`} title={`Estado: ${vehicle.estado_venezuela} (${vehicle.region || ''})`}>
                              {vehicle.estado_venezuela === 'Guayana Esequiba' ? 'ESQ' : vehicle.estado_venezuela.substring(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                          <span>{vehicle.estado_venezuela || 'Venezuela'}</span>
                          {vehicle.region && <span>({vehicle.region})</span>}
                          {vehicle.prioridad_recuperacion && <span>· Prioridad: {vehicle.prioridad_recuperacion}</span>}
                        </div>
                      </td>

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

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                          {malos > 0 && (
                            <span className="text-amber-700 font-bold" title={`${malos} componentes en estado MALO`}>
                              {malos}M
                            </span>
                          )}
                          {regulares > 0 && (
                            <span className="text-amber-700 font-bold" title={`${regulares} componentes en estado REGULAR`}>
                              {regulares}R
                            </span>
                          )}
                          <span className="text-emerald-700" title={`${buenos} componentes en estado BUENO`}>
                            {buenos}B
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {vehicle.nombre_personal_responsable || 'Sin custodio'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {vehicle.cedula_personal_responsable || '—'} {vehicle.telefono_personal_responsable ? `· ${vehicle.telefono_personal_responsable}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectVehicle(vehicle)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Ver Ficha Técnica Consolidada"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportVehiclePDF(vehicle)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Descargar Reporte Técnico PDF con Historial"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {allow('btn_edit_vehiculo') && (
                          <button
                            onClick={() => onEditVehicle(vehicle)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                            title="Editar en el Formulario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          )}
                          {allow('btn_delete_vehiculo') && (
                          <button
                            onClick={() => onDeleteVehicle(vehicle.id, vehicle.numero_vehiculo)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Eliminar de la Base de Datos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          )}
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
              No se encontraron registros con los filtros seleccionados.
            </div>
          )}
        </div>
      )}

      {/* VIEW: Consolidated Territorial Distribution (Regiones CORPOELEC & Estados) */}
      {activeSubTab === 'resumen_territorial' && (
        <div className="space-y-6">
          {/* 1. Header & Context */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0b3d2e]" />
                <h2 className="text-base font-bold text-slate-900">
                  Tabla Única y Distribución Territorial por Regiones CORPOELEC
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Estructura operativa adaptada del Sistema Eléctrico Nacional (SEN) agrupando las 9 Regiones Estratégicas y las 25 entidades territoriales.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg font-bold">
                ★ Territorio Guayana Esequiba [ESQ] Integrado
              </span>
            </div>
          </div>

          {/* 2. Tarjetas de Mando por Región CORPOELEC */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {corpoelecRegionalSummary.map((item) => {
              const reg = item.region;
              const isSelected = regionFilter === reg.nombre;
              const isEsequiboRegion = reg.id === 'reg-guayana';

              return (
                <div 
                  key={reg.id}
                  className={`border rounded-xl p-4 transition-all duration-200 bg-white ${
                    isSelected 
                      ? 'border-[#0b3d2e] ring-2 ring-[#0b3d2e]/20 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Top Bar: Code and Title */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {reg.codigo}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {reg.nombre}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]" title={reg.gerencia}>
                        {reg.gerencia || 'Gerencia Regional'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setRegionFilter(isSelected ? 'TODAS' : reg.nombre);
                        if (!isSelected) setActiveSubTab('tabla');
                      }}
                      className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                        isSelected 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={isSelected ? 'Quitar filtro de región' : 'Filtrar flota de esta región'}
                    >
                      {isSelected ? 'Limpiar Filtro' : 'Filtrar Flota'}
                    </button>
                  </div>

                  {/* Operational Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 my-3 text-center">
                    <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                      <div className="text-[10px] text-slate-500">Total</div>
                      <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{item.total}</div>
                    </div>
                    <div className="bg-emerald-50/60 rounded-lg p-1.5 border border-emerald-100">
                      <div className="text-[10px] text-emerald-700 font-medium">Activos</div>
                      <div className="text-sm font-bold font-mono text-emerald-800 mt-0.5">{item.activos}</div>
                    </div>
                    <div className="bg-amber-50/60 rounded-lg p-1.5 border border-amber-100">
                      <div className="text-[10px] text-amber-700 font-medium">Mant.</div>
                      <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">{item.enMantenimiento}</div>
                    </div>
                    <div className="bg-amber-50/60 rounded-lg p-1.5 border border-amber-100">
                      <div className="text-[10px] text-amber-700 font-medium">Inop.</div>
                      <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">{item.fueraServicio}</div>
                    </div>
                  </div>

                  {/* Availability Progress Bar */}
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Disponibilidad Operativa</span>
                      <span className={`font-mono font-bold ${
                        item.disponibilidadPct >= 70 ? 'text-emerald-700' : item.disponibilidadPct >= 40 ? 'text-amber-700' : 'text-slate-500'
                      }`}>
                        {item.total > 0 ? `${item.disponibilidadPct}%` : 'S/D'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          item.disponibilidadPct >= 70 ? 'bg-emerald-600' : item.disponibilidadPct >= 40 ? 'bg-amber-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.disponibilidadPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Assigned States Tag Strip */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Estados:</span>
                    {reg.estados.map(st => (
                      <span 
                        key={st}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          st === 'Guayana Esequiba'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {st}
                      </span>
                    ))}
                  </div>

                  {reg.sedePrincipal && (
                    <div className="text-[10px] text-slate-400 mt-2 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{reg.sedePrincipal}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Tabla Consolidada Comparativa de las Regiones CORPOELEC */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Resumen Consolidado por Regiones SEN (Tabla Maestra)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparativa de flota vehicular asignada por cada Gerencia Regional CORPOELEC.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Región CORPOELEC</th>
                    <th className="py-3 px-4">Cód. SEN</th>
                    <th className="py-3 px-4">Gerencia Regional Asignada</th>
                    <th className="py-3 px-3 text-center">Total Activos</th>
                    <th className="py-3 px-3 text-center">Activos</th>
                    <th className="py-3 px-3 text-center">En Mantenimiento</th>
                    <th className="py-3 px-3 text-center">Fuera de Servicio</th>
                    <th className="py-3 px-3 text-center">Disponibilidad %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {corpoelecRegionalSummary.map((item) => {
                    const reg = item.region;
                    const pct = item.disponibilidadPct;

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {reg.nombre}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                          <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {reg.codigo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {reg.gerencia || 'Gerencia Regional'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 tabular-nums">
                          {item.total}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700 tabular-nums font-semibold">
                          {item.activos}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums font-semibold">
                          {item.enMantenimiento}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums font-semibold">
                          {item.fueraServicio}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                          <span className={item.total === 0 ? 'text-slate-400' : pct >= 70 ? 'text-emerald-700' : pct >= 40 ? 'text-amber-700' : 'text-amber-700'}>
                            {item.total > 0 ? `${pct}%` : '0%'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Desglose Territorial Detallado por Entidad Federal */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Desglose Detallado por Estados y Territorios (24 Estados + Guayana Esequiba)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inventario registrado actualmente por cada entidad federal y su correspondencia con la Región SEN.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Estado / Territorio</th>
                    <th className="py-3 px-4">Región CORPOELEC</th>
                    <th className="py-3 px-3 text-center">Total Activos</th>
                    <th className="py-3 px-3 text-center">Activos</th>
                    <th className="py-3 px-3 text-center">En Mantenimiento</th>
                    <th className="py-3 px-3 text-center">Fuera de Servicio</th>
                    <th className="py-3 px-3 text-center">Disponibilidad %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {territorialSummary.map((t) => {
                    const pct = t.total > 0 ? Math.round((t.activos / t.total) * 100) : 0;
                    const isEsequibo = t.estado === 'Guayana Esequiba';

                    return (
                      <tr key={t.estado} className={`hover:bg-slate-50 ${isEsequibo ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <span>{t.estado}</span>
                          {isEsequibo && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold border border-amber-300">
                              ESQ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {t.region}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 tabular-nums">
                          {t.total}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700 tabular-nums font-semibold">
                          {t.activos}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums font-semibold">
                          {t.mantenimiento}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums font-semibold">
                          {t.fueraServicio}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                          <span className={pct >= 70 ? 'text-emerald-700' : pct >= 40 ? 'text-amber-700' : 'text-amber-700'}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Consolidated Fault Analysis of the 21 Components */}
      {activeSubTab === 'resumen_componentes' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Consolidado de Requerimientos Mecánicos (21 Componentes Evaluados)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifica los componentes críticos con mayor volumen de piezas en estado MALO o REGULAR en toda la flota.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {componentFaultSummary.map((item) => {
              const totalDefects = item.malo + item.regular;
              const hasCritical = item.malo > 0;

              return (
                <div key={item.titulo} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{item.titulo}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Col {item.columna}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                    <div className="flex-1 bg-white p-1.5 rounded border border-slate-200 text-center">
                      <span className="text-[10px] text-amber-600 block">MALO</span>
                      <strong className="text-amber-700 font-bold">{item.malo}</strong>
                    </div>
                    <div className="flex-1 bg-white p-1.5 rounded border border-slate-200 text-center">
                      <span className="text-[10px] text-amber-600 block">REGULAR</span>
                      <strong className="text-amber-700 font-bold">{item.regular}</strong>
                    </div>
                    <div className="flex-1 bg-white p-1.5 rounded border border-slate-200 text-center">
                      <span className="text-[10px] text-emerald-600 block">BUENO</span>
                      <strong className="text-emerald-700 font-bold">{item.bueno}</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Afectación total:</span>
                    <strong className={totalDefects > 0 ? 'text-amber-700' : 'text-slate-400'}>
                      {totalDefects} unidades
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Consolidated Distribution by Gerencias */}
      {activeSubTab === 'resumen_gerencias' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Consolidado de Flota por Gerencia de Origen
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribución patrimonial y operatividad por dependencia corporativa.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Gerencia de Origen</th>
                  <th className="py-3 px-3 text-center">Total Unidades</th>
                  <th className="py-3 px-3 text-center">Activos</th>
                  <th className="py-3 px-3 text-center">En Mantenimiento</th>
                  <th className="py-3 px-3 text-center">Fuera de Servicio</th>
                  <th className="py-3 px-3 text-center">Disponibilidad %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gerenciaSummary.map((g) => {
                  const pct = g.total > 0 ? Math.round((g.activos / g.total) * 100) : 0;
                  return (
                    <tr key={g.gerencia} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {g.gerencia}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 tabular-nums">
                        {g.total}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-700 tabular-nums font-semibold">
                        {g.activos}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums font-semibold">
                        {g.mantenimiento}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700 tabular-nums font-semibold">
                        {g.fueraServicio}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                        <span className={pct >= 70 ? 'text-emerald-700' : pct >= 40 ? 'text-amber-700' : 'text-amber-700'}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
