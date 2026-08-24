import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  MessageSquare, 
  Calendar, 
  User, 
  Target, 
  Layers, 
  LayoutGrid, 
  List,
  Check,
  X,
  History,
  Send,
  Sparkles,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { TareaCompromiso, TaskStatus, PriorityLevel, FilterState, UserProfile } from '../types';

interface CompromisosListProps {
  compromisos: TareaCompromiso[];
  onUpdateTask: (updatedTask: TareaCompromiso) => void;
  onAddTask: (newTask: TareaCompromiso) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  currentProfile?: UserProfile;
}

export const CompromisosList: React.FC<CompromisosListProps> = ({
  compromisos,
  onUpdateTask,
  onAddTask,
  filterState,
  setFilterState,
  currentProfile,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedTaskForAvance, setSelectedTaskForAvance] = useState<TareaCompromiso | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TareaCompromiso | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Avance Form State
  const [avanceNota, setAvanceNota] = useState('');
  const [avancePorcentaje, setAvancePorcentaje] = useState(50);
  const [avanceUsuario, setAvanceUsuario] = useState('Analista de Planificación');

  // New Task Form State
  const [newResponsable, setNewResponsable] = useState('');
  const [newCompromiso, setNewCompromiso] = useState('');
  const [newPlazoText, setNewPlazoText] = useState('');
  const [newVinculacion, setNewVinculacion] = useState('Punto 2 (Automatización)');
  const [newPrioridad, setNewPrioridad] = useState<PriorityLevel>('Alta');
  const [newArea, setNewArea] = useState('Automatización');

  // Filter lists options
  const responsablesList = Array.from(new Set(compromisos.map(c => c.responsable))).filter(Boolean);
  const vinculacionesList = Array.from(new Set(compromisos.map(c => c.vinculacionOrigen))).filter(Boolean);

  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const parseMonthYearStr = (dateStr: string | undefined) => {
    if (!dateStr) return 'Sin Fecha';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const y = parts[2].trim();
        if (m >= 1 && m <= 12) return `${MONTH_NAMES_ES[m - 1]} ${y}`;
      }
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        const y = parts[0];
        if (m >= 1 && m <= 12) return `${MONTH_NAMES_ES[m - 1]} ${y}`;
      }
    }
    return dateStr;
  };

  const mesesEmisionList = Array.from(new Set(compromisos.map(c => parseMonthYearStr(c.minutaFecha)))).filter(Boolean);

  // Filtered compromisos
  const filteredCompromisos = compromisos.filter(c => {
    const matchesSearch = filterState.searchQuery === '' ||
      c.compromiso.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
      c.responsable.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
      c.vinculacionOrigen.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
      (c.minutaNumero && c.minutaNumero.toLowerCase().includes(filterState.searchQuery.toLowerCase()));

    const matchesResponsable = filterState.responsable === '' || c.responsable === filterState.responsable;
    const matchesEstado = filterState.estado === '' || c.estado === filterState.estado;
    const matchesVinculacion = filterState.vinculacion === '' || c.vinculacionOrigen === filterState.vinculacion;
    const matchesPrioridad = filterState.prioridad === '' || c.prioridad === filterState.prioridad;
    const matchesMes = !filterState.mesEmision || parseMonthYearStr(c.minutaFecha) === filterState.mesEmision;

    return matchesSearch && matchesResponsable && matchesEstado && matchesVinculacion && matchesPrioridad && matchesMes;
  });

  // Handle Adding Avance
  const handleSaveAvance = () => {
    if (!selectedTaskForAvance || !avanceNota.trim()) return;

    const newHistorialItem = {
      id: `h-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      nota: avanceNota,
      porcentaje: Number(avancePorcentaje),
      usuario: avanceUsuario || 'Analista',
    };

    const newStatus: TaskStatus = 
      Number(avancePorcentaje) === 100 
        ? 'Completado' 
        : Number(avancePorcentaje) > 0 
        ? 'En Proceso' 
        : 'Pendiente';

    const updated: TareaCompromiso = {
      ...selectedTaskForAvance,
      avancePorcentaje: Number(avancePorcentaje),
      estado: newStatus,
      historialAvances: [newHistorialItem, ...(selectedTaskForAvance.historialAvances || [])],
      updatedAt: new Date().toISOString(),
    };

    onUpdateTask(updated);
    setSelectedTaskForAvance(null);
    setAvanceNota('');
  };

  // Handle Adding New Custom Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponsable.trim() || !newCompromiso.trim()) return;

    const newTask: TareaCompromiso = {
      id: `comp-${Date.now()}`,
      minutaNumero: '26-0004',
      minutaFecha: '30/07/2026',
      responsable: newResponsable,
      compromiso: newCompromiso,
      plazoText: newPlazoText || 'A determinar',
      plazoFechaISO: new Date().toISOString().split('T')[0],
      vinculacionOrigen: newVinculacion,
      estado: 'En Proceso',
      prioridad: newPrioridad,
      avancePorcentaje: 10,
      areaGestion: newArea,
      historialAvances: [
        {
          id: `h-${Date.now()}`,
          fecha: new Date().toISOString().split('T')[0],
          nota: 'Tarea registrada manualmente.',
          porcentaje: 10,
          usuario: 'Coordinador',
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setShowAddModal(false);
    setNewResponsable('');
    setNewCompromiso('');
    setNewPlazoText('');
  };

  return (
    <div className="space-y-5">
      
      {/* Role-based restriction banner */}
      {currentProfile && currentProfile.role !== 'admin' && currentProfile.role !== 'supervisor' && (
        <div className="bg-blue-900/90 border border-cyan-500/40 text-cyan-100 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="text-xs">
              <strong>Vista Personal Asignada:</strong> Como <strong>{currentProfile.name}</strong> (@{currentProfile.username}), solo estás visualizando los compromisos bajo tu responsabilidad.
            </span>
          </div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-400/30 shrink-0">
            Rol: {currentProfile.role.toUpperCase()}
          </span>
        </div>
      )}

      {/* Top Controls & Filter Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Buscar compromiso, responsable, minuta #..."
              className="w-full bg-slate-50 text-xs text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] placeholder-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-[#002B49] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista Tabla"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-colors ${
                  viewMode === 'cards' ? 'bg-[#002B49] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#002B49] hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Nuevo Compromiso</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* Responsable Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Responsable</label>
            <select
              value={filterState.responsable}
              onChange={(e) => setFilterState(prev => ({ ...prev, responsable: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-[#E30613]"
            >
              <option value="">Todos ({responsablesList.length})</option>
              {responsablesList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Mes / Año Emisión Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mes / Año Emisión</label>
            <select
              value={filterState.mesEmision || ''}
              onChange={(e) => setFilterState(prev => ({ ...prev, mesEmision: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-[#E30613]"
            >
              <option value="">Todos los Meses</option>
              {mesesEmisionList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Estado Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Estado</label>
            <select
              value={filterState.estado}
              onChange={(e) => setFilterState(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-[#E30613]"
            >
              <option value="">Todos los Estados</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completado">Completado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
            </select>
          </div>

          {/* Vinculación Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Origen Agenda</label>
            <select
              value={filterState.vinculacion}
              onChange={(e) => setFilterState(prev => ({ ...prev, vinculacion: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-[#E30613] truncate"
            >
              <option value="">Todos los Puntos</option>
              {vinculacionesList.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Prioridad Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Prioridad</label>
            <select
              value={filterState.prioridad}
              onChange={(e) => setFilterState(prev => ({ ...prev, prioridad: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-[#E30613]"
            >
              <option value="">Todas las Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

        </div>

        {/* Clear filters badge if active */}
        {(filterState.searchQuery || filterState.responsable || filterState.estado || filterState.vinculacion || filterState.prioridad || filterState.mesEmision) && (
          <div className="flex items-center justify-between text-xs bg-red-50/80 p-2.5 rounded-xl border border-red-200 text-red-900">
            <span className="font-medium">Filtros activos ({filteredCompromisos.length} de {compromisos.length} compromisos visibles)</span>
            <button
              onClick={() => setFilterState({ searchQuery: '', responsable: '', estado: '', vinculacion: '', prioridad: '', mesEmision: '' })}
              className="text-[#E30613] font-extrabold underline hover:text-red-800 cursor-pointer text-xs"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}

      </div>

      {/* Main Content Area */}
      {filteredCompromisos.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-base">No se encontraron compromisos</h3>
          <p className="text-xs text-slate-500">Prueba cambiando los términos de búsqueda o los filtros aplicados.</p>
        </div>
      ) : viewMode === 'table' ? (
        
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#002B49] text-white uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
                  <th className="p-3.5 pl-4">Minuta / Responsable</th>
                  <th className="p-3.5 min-w-[280px]">Compromiso / Tarea Asignada</th>
                  <th className="p-3.5">Origen / Agenda</th>
                  <th className="p-3.5">Plazo</th>
                  <th className="p-3.5">Avance %</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompromisos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Responsable & Minuta */}
                    <td className="p-3.5 pl-4 font-bold text-slate-900 whitespace-nowrap align-top space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-800">
                        <User className="w-3.5 h-3.5 text-[#002B49]" />
                        <span>{item.responsable}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="bg-slate-900 text-cyan-300 text-[10px] px-2 py-0.2 rounded font-mono font-bold">
                          #{item.minutaNumero}
                        </span>
                        {item.prioridad && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                            item.prioridad === 'Alta' ? 'bg-red-50 text-[#E30613] border-red-200' :
                            item.prioridad === 'Media' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            Prioridad {item.prioridad}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Compromiso Text */}
                    <td className="p-3.5 text-slate-800 font-medium leading-relaxed align-top">
                      <p>{item.compromiso}</p>
                      {item.observaciones && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {item.observaciones}
                        </p>
                      )}
                    </td>

                    {/* Origen */}
                    <td className="p-3.5 align-top whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 inline-block">
                        {item.vinculacionOrigen}
                      </span>
                    </td>

                    {/* Plazo */}
                    <td className="p-3.5 align-top whitespace-nowrap font-extrabold text-[#E30613]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-[#E30613]" />
                        <span>{item.plazoText}</span>
                      </div>
                    </td>

                    {/* Avance % Control */}
                    <td className="p-3.5 align-top min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-800">{item.avancePorcentaje}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={item.avancePorcentaje}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updatedStatus: TaskStatus = val === 100 ? 'Completado' : val > 0 ? 'En Proceso' : 'Pendiente';
                            onUpdateTask({
                              ...item,
                              avancePorcentaje: val,
                              estado: updatedStatus,
                              updatedAt: new Date().toISOString()
                            });
                          }}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                        />
                      </div>
                    </td>

                    {/* Estado Dropdown */}
                    <td className="p-3.5 align-top whitespace-nowrap">
                      <select
                        value={item.estado}
                        onChange={(e) => {
                          const newSt = e.target.value as TaskStatus;
                          const newPct = newSt === 'Completado' ? 100 : item.avancePorcentaje;
                          onUpdateTask({
                            ...item,
                            estado: newSt,
                            avancePorcentaje: newPct,
                            updatedAt: new Date().toISOString()
                          });
                        }}
                        className={`text-[11px] font-extrabold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.estado === 'Completado' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          item.estado === 'En Proceso' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          item.estado === 'En Revisión' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="En Revisión">En Revisión</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-4 align-top text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => {
                          setSelectedTaskForAvance(item);
                          setAvancePorcentaje(item.avancePorcentaje || 50);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-[#002B49] text-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer text-xs font-bold inline-flex items-center space-x-1"
                        title="Reportar Avance"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Avance</span>
                      </button>

                      <button
                        onClick={() => setSelectedTaskDetail(item)}
                        className="p-1.5 bg-slate-100 hover:bg-[#002B49] text-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer text-xs font-bold inline-flex items-center space-x-1"
                        title="Ver Historial"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompromisos.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                
                {/* Header Badge Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="bg-[#002B49] text-white px-2 py-0.5 rounded font-bold text-[10px]">
                      #{item.minutaNumero}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200 text-[10px]">
                      {item.vinculacionOrigen}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                    item.estado === 'Completado' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    item.estado === 'En Proceso' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {item.estado}
                  </span>
                </div>

                {/* Compromise text */}
                <p className="text-xs font-bold text-slate-900 leading-relaxed">
                  {item.compromiso}
                </p>

                {/* Responsible & Deadline */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>{item.responsable}</span>
                    </span>
                    <span className="text-[#E30613] flex items-center space-x-1 font-extrabold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.plazoText}</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Progress & Action Bottom Row */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Avance</span>
                  <span className="font-extrabold text-slate-900">{item.avancePorcentaje}%</span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      item.avancePorcentaje >= 100 ? 'bg-emerald-500' : 'bg-[#E30613]'
                    }`}
                    style={{ width: `${item.avancePorcentaje}%` }}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedTaskForAvance(item);
                      setAvancePorcentaje(item.avancePorcentaje || 50);
                    }}
                    className="w-full bg-[#002B49] hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Reportar Avance</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL: Reportar Avance / Actualizar Tarea */}
      {selectedTaskForAvance && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <MessageSquare className="w-5 h-5 text-[#E30613]" />
                <span>Reportar Avance de Compromiso</span>
              </div>
              <button 
                onClick={() => setSelectedTaskForAvance(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-500">
                Minuta #{selectedTaskForAvance.minutaNumero} • {selectedTaskForAvance.responsable}
              </div>
              <div className="font-bold text-slate-900">{selectedTaskForAvance.compromiso}</div>
            </div>

            {/* Form inputs */}
            <div className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Reportante</label>
                <input
                  type="text"
                  value={avanceUsuario}
                  onChange={(e) => setAvanceUsuario(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#E30613]"
                  placeholder="Ej. Yván Cipirán / Analista"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Porcentaje de Cumplimiento Actual ({avancePorcentaje}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={avancePorcentaje}
                  onChange={(e) => setAvancePorcentaje(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observación o Detalle del Avance</label>
                <textarea
                  value={avanceNota}
                  onChange={(e) => setAvanceNota(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#E30613]"
                  placeholder="Describa la actividad realizada, avances técnicos, documentos generados o avances de automatización..."
                />
              </div>

            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                onClick={() => setSelectedTaskForAvance(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAvance}
                disabled={!avanceNota.trim()}
                className="px-4 py-2 bg-[#E30613] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Guardar Reporte</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Historial y Detalles */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <History className="w-5 h-5 text-[#E30613]" />
                <span>Historial de Avances y Trazabilidad</span>
              </div>
              <button 
                onClick={() => setSelectedTaskDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">{selectedTaskDetail.compromiso}</div>
                <div className="text-slate-500 flex items-center space-x-3 pt-1">
                  <span><strong>Minuta:</strong> #{selectedTaskDetail.minutaNumero}</span>
                  <span><strong>Responsable:</strong> {selectedTaskDetail.responsable}</span>
                  <span><strong>Plazo:</strong> {selectedTaskDetail.plazoText}</span>
                </div>
              </div>

              <h4 className="font-extrabold text-slate-800 text-xs pt-2 uppercase tracking-wider">Registro Cronológico de Avances</h4>

              <div className="space-y-2">
                {(!selectedTaskDetail.historialAvances || selectedTaskDetail.historialAvances.length === 0) ? (
                  <p className="text-slate-500 italic py-3 text-center">No hay reportes de avance registrados aún para este compromiso.</p>
                ) : (
                  selectedTaskDetail.historialAvances.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 font-bold">
                        <span>{h.usuario} • {h.fecha}</span>
                        <span className="bg-[#002B49] text-white px-2 py-0.5 rounded font-mono text-[10px]">
                          {h.porcentaje}% avance
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{h.nota}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="px-4 py-2 bg-[#002B49] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Crear Nuevo Compromiso */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTask} className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <Plus className="w-5 h-5 text-[#E30613]" />
                <span>Agregar Nuevo Compromiso de Minuta</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsable Asignado *</label>
                <input
                  type="text"
                  required
                  value={newResponsable}
                  onChange={(e) => setNewResponsable(e.target.value)}
                  placeholder="Ej. Yván Cipirán / Gerencia de Planificación"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#E30613]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Compromiso / Tarea *</label>
                <textarea
                  required
                  rows={3}
                  value={newCompromiso}
                  onChange={(e) => setNewCompromiso(e.target.value)}
                  placeholder="Detalle de la instrucción o compromiso asumido..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#E30613]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plazo o Fecha Límite</label>
                  <input
                    type="text"
                    value={newPlazoText}
                    onChange={(e) => setNewPlazoText(e.target.value)}
                    placeholder="Ej. 15/08/2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Origen / Vinculación Agenda</label>
                  <select
                    value={newVinculacion}
                    onChange={(e) => setNewVinculacion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-[#E30613]"
                  >
                    <option value="Punto 1 (Calidad de datos)">Punto 1 (Calidad de datos)</option>
                    <option value="Punto 2 (Automatización)">Punto 2 (Automatización)</option>
                    <option value="Punto 3 (Normalización)">Punto 3 (Normalización)</option>
                    <option value="Punto 4 (POA)">Punto 4 (POA/PRTSEN)</option>
                    <option value="Punto 5 (Operatividad)">Punto 5 (Operatividad)</option>
                    <option value="Punto 6 (Tecnología)">Punto 6 (Tecnología)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#002B49] hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Crear Compromiso</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
