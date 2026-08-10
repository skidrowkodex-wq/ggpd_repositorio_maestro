import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { EquipmentRecord, EquipmentStatus, EquipmentPriority } from '../../types';
import { VENEZUELAN_STATES, getStateName, VOLTAGE_LEVELS_KV } from '../../constants/states';
import { useAuth } from '../../lib/authContext';
import { 
  ListFilter, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Save, 
  Euro, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  MapPin
} from 'lucide-react';

interface InventoryTabProps {
  records: EquipmentRecord[];
  loading: boolean;
  onRefreshNeeded: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ records, loading, onRefreshNeeded }) => {
  const { user, canEditState } = useAuth();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<EquipmentRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered Logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Global Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSub = r.substation_name.toLowerCase().includes(term);
        const matchesNom = r.equipment_nomenclator.toLowerCase().includes(term);
        const matchesElem = r.element_type.toLowerCase().includes(term);
        const matchesComp = (r.component_code || '').toLowerCase().includes(term);
        if (!matchesSub && !matchesNom && !matchesElem && !matchesComp) return false;
      }

      // State Filter
      if (selectedState && r.state_code !== selectedState) return false;

      // Status Filter
      if (selectedStatus && r.status !== selectedStatus) return false;

      // Priority Filter
      if (selectedPriority && r.priority !== selectedPriority) return false;

      // Voltage Filter
      if (selectedVoltage && r.voltage_in_kv !== Number(selectedVoltage)) return false;

      return true;
    });
  }, [records, searchTerm, selectedState, selectedStatus, selectedPriority, selectedVoltage]);

  // Paginated records
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Handle Save Edit
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/equipment/${editingRecord.record_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord)
      });
      const data = await res.json();

      if (data.success) {
        setEditingRecord(null);
        onRefreshNeeded();
      } else {
        alert('Error al guardar: ' + (data.error || 'Error desconocido'));
      }
    } catch (err: any) {
      alert('Error de conexión al actualizar el registro.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredRecords.map((r, idx) => ({
      'Secuencia': r.legacy_seq || idx + 1,
      'Región': r.region_code,
      'Estado': r.state_code,
      'Subestación': r.substation_name,
      'Tensión (kV)': r.voltage_in_kv,
      'Componente': r.component_code,
      'Tipo de Elemento': r.element_type,
      'Especificación Técnica': r.technical_specs || '',
      'Acción Operativa': r.operational_action,
      'Nomenclatura': r.equipment_nomenclator,
      'Estatus': r.status,
      'Prioridad': r.priority,
      'Presupuesto EUR': r.total_budget_eur,
      'Avance %': r.progress_pct,
      'Notas de Ejecución': r.execution_notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos_SCEIN_CORPOELEC');
    XLSX.writeFile(wb, `Inventario_Equipos_SCEIN_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export to CSV ISO 8000
  const handleExportCSV = () => {
    const headers = ['Secuencia,Región,Estado,Subestación,Tensión_kV,Componente,Elemento,Nomenclatura,Estatus,Prioridad,Presupuesto_EUR,Avance_Pct'];
    const rows = filteredRecords.map((r, idx) => 
      `${r.legacy_seq || idx + 1},"${r.region_code}","${r.state_code}","${r.substation_name}",${r.voltage_in_kv},"${r.component_code}","${r.element_type}","${r.equipment_nomenclator}","${r.status}","${r.priority}",${r.total_budget_eur},${r.progress_pct}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO8000_Equipos_SCEIN_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'RESUELTO':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-full text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> RESUELTO</span>;
      case 'EN EJECUCIÓN':
        return <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 px-2.5 py-1 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> EN EJECUCIÓN</span>;
      case 'PENDIENTE':
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 rounded-full text-xs font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> PENDIENTE</span>;
    }
  };

  const getPriorityBadge = (priority: EquipmentPriority) => {
    switch (priority) {
      case 'ALTA':
        return <span className="text-rose-700 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded">ALTA</span>;
      case 'MEDIA':
        return <span className="text-amber-700 dark:text-amber-400 font-medium text-xs bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded">MEDIA</span>;
      case 'BAJA':
        return <span className="text-slate-700 dark:text-slate-400 font-normal text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">BAJA</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Exports */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ListFilter className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>Inventario de Equipos y Edición en Tiempo Real</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Consulta avanzada, filtrado multinivel y actualización directa de estatus y presupuestos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 transition shadow-sm"
            title="Exportar archivo Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-cyan-400 flex items-center gap-2 transition shadow-sm"
            title="Exportar norma ISO 8000 (.csv)"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV ISO 8000</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Global Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por subestación, nomenclatura, elemento..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              disabled={user?.role === 'ANALISTA_ESTATAL' && !!user.state_code}
            >
              <option value="">Todos los Estados</option>
              {VENEZUELAN_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="">Todos los Estatus</option>
              <option value="RESUELTO">RESUELTO</option>
              <option value="EN EJECUCIÓN">EN EJECUCIÓN</option>
              <option value="PENDIENTE">PENDIENTE</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="">Todas las Prioridades</option>
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {(searchTerm || selectedState || selectedStatus || selectedPriority || selectedVoltage) && (
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
            <span>Mostrando {filteredRecords.length} de {records.length} registros filtrados</span>
            <button
              onClick={() => {
                setSearchTerm('');
                if (user?.role !== 'ANALISTA_ESTATAL') setSelectedState('');
                setSelectedStatus('');
                setSelectedPriority('');
                setSelectedVoltage('');
                setCurrentPage(1);
              }}
              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 dark:text-sky-400" />
            <p>Cargando lista de equipos indisponibles...</p>
          </div>
        ) : paginatedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Subestación / Nivel kV</th>
                  <th className="p-3.5">Elemento / Componente</th>
                  <th className="p-3.5">Nomenclatura</th>
                  <th className="p-3.5">Estatus Operativo</th>
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Avance</th>
                  <th className="p-3.5">Presupuesto (€)</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {paginatedRecords.map((r) => {
                  const editable = canEditState(r.state_code);

                  return (
                    <tr key={r.record_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      {/* Estado */}
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                          {r.state_code}
                        </span>
                      </td>

                      {/* Subestación y Tensión */}
                      <td className="p-3.5 space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{r.substation_name}</div>
                        <div className="text-[11px] font-mono text-sky-700 dark:text-cyan-400 flex items-center gap-1 font-bold">
                          <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          {r.voltage_in_kv} kV
                        </div>
                      </td>

                      {/* Elemento / Componente */}
                      <td className="p-3.5 space-y-0.5 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{r.element_type}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{r.operational_action}</div>
                      </td>

                      {/* Nomenclatura */}
                      <td className="p-3.5 font-mono text-slate-900 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-950/40 px-2 py-1 rounded">
                        {r.equipment_nomenclator}
                      </td>

                      {/* Estatus */}
                      <td className="p-3.5">
                        {getStatusBadge(r.status)}
                      </td>

                      {/* Prioridad */}
                      <td className="p-3.5">
                        {getPriorityBadge(r.priority)}
                      </td>

                      {/* Avance */}
                      <td className="p-3.5 font-mono font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${r.progress_pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                              style={{ width: `${r.progress_pct}%` }}
                            ></div>
                          </div>
                          <span>{r.progress_pct}%</span>
                        </div>
                      </td>

                      {/* Presupuesto EUR */}
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                        € {(Number(r.total_budget_eur) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Acción Editar */}
                      <td className="p-3.5 text-right">
                        {editable ? (
                          <button
                            onClick={() => setEditingRecord({ ...r })}
                            className="px-3 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold flex items-center gap-1 transition ml-auto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Solo lectura</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No se encontraron equipos que coincidan con los filtros seleccionados.
          </div>
        )}

        {/* Pagination Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Página {currentPage} de {totalPages}</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">{currentPage}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <Edit3 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Actualizar Registro de Equipo</span>
              </div>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="text-slate-600 dark:text-slate-400">Nomenclatura: <strong className="text-sky-700 dark:text-cyan-300 font-mono">{editingRecord.equipment_nomenclator}</strong></div>
                <div className="text-slate-600 dark:text-slate-400">Subestación: <strong className="text-slate-800 dark:text-slate-200">{editingRecord.substation_name} ({editingRecord.state_code})</strong></div>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Estatus Operativo</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as EquipmentStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="EN EJECUCIÓN">EN EJECUCIÓN</option>
                  <option value="RESUELTO">RESUELTO</option>
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Prioridad</label>
                <select
                  value={editingRecord.priority}
                  onChange={(e) => setEditingRecord({ ...editingRecord, priority: e.target.value as EquipmentPriority })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="ALTA">ALTA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="BAJA">BAJA</option>
                </select>
              </div>

              {/* Progress & Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Porcentaje Avance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingRecord.progress_pct}
                    onChange={(e) => setEditingRecord({ ...editingRecord, progress_pct: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Presupuesto (€ EUR)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editingRecord.total_budget_eur}
                    onChange={(e) => setEditingRecord({ ...editingRecord, total_budget_eur: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Notas de Ejecución / Diagnóstico</label>
                <textarea
                  rows={3}
                  value={editingRecord.execution_notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, execution_notes: e.target.value })}
                  placeholder="Detalles sobre refacciones, estado técnico o avances..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-700 dark:from-sky-600 dark:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-sky-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
