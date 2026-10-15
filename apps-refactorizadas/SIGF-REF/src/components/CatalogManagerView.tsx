import React, { useState, useMemo } from 'react';
import { MasterCatalogsState, MasterCatalogItem } from '../types/fleet';
import { VENEZUELA_REGIONS, VENEZUELA_STATES } from '../data/venezuelaRegions';
import { getStatesForRegion } from '../services/regionAdapter';
import { Database, Plus, Trash2, CheckCircle, Upload, Download, Search, Info, Link2, MapPin } from 'lucide-react';

interface CatalogManagerViewProps {
  catalogs: MasterCatalogsState;
  onUpdateCatalogs: (newCatalogs: MasterCatalogsState) => void;
}

type CatalogKey = keyof MasterCatalogsState;

const CATALOG_CONFIGS: { key: CatalogKey; label: string; colExcel: string; colCampo: string; desc: string }[] = [
  { key: 'marcas', label: 'Marcas de Vehículo', colExcel: 'Col C', colCampo: 'marca_vehiculo', desc: 'Fabricantes autorizados del parque automotor (TOYOTA, FORD, etc.)' },
  { key: 'tipos_vehiculo', label: 'Tipos de Vehículo', colExcel: 'Col D', colCampo: 'tipo_vehiculo', desc: 'Tipologías operativas (CAMIONETA, CAMIÓN CESTA, MOTO, etc.)' },
  { key: 'gerencias', label: 'Gerencias de Origen', colExcel: 'Col AK', colCampo: 'gerencia_origen', desc: 'Gerencias de adscripción patrimonial (GGPD, Distribución, Transmisión, etc.)' },
  { key: 'centros_servicios', label: 'Centros de Servicios', colExcel: 'Col F', colCampo: 'centro_servicios', desc: 'Centros de servicio determinados directamente por el Estado (FK: estado_id -> cat_estados)' },
  { key: 'unidades_asignadas', label: 'Unidades Asignadas (Libres)', colExcel: 'Col E', colCampo: 'unidad_asignada', desc: 'Cuadrillas y áreas de adscripción operativas libres, desacopladas del Centro de Servicios' },
  { key: 'medidas_cauchos', label: 'Medidas de Cauchos', colExcel: 'Col AF', colCampo: 'medidas_caucho', desc: 'Dimensiones estandarizadas de neumáticos (265/70R16, 7.50R16, etc.)' },
  { key: 'caracteristicas_baterias', label: 'Características de Baterías', colExcel: 'Col AH', colCampo: 'caracteristicas_bateria', desc: 'Amperaje y tamaño de grupo BCI para acumuladores eléctricos' },
  { key: 'regiones', label: 'Regiones CORPOELEC', colExcel: 'SEN Territorial', colCampo: 'region', desc: 'Tabla Única de Regiones y Gerencias Territoriales CORPOELEC (Capital, Guayana, Central, Occidente, Andes, Llanos, Oriente, etc.)' }
];

export const CatalogManagerView: React.FC<CatalogManagerViewProps> = ({ catalogs, onUpdateCatalogs }) => {
  const [activeCatalogKey, setActiveCatalogKey] = useState<CatalogKey>('marcas');
  const [searchFilter, setSearchFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [selectedStateFk, setSelectedStateFk] = useState('bol');
  const [selectedTipoCs, setSelectedTipoCs] = useState('Atención Técnica y Distribución');
  const [newItemName, setNewItemName] = useState('');
  const [newItemExtra, setNewItemExtra] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeConfig = CATALOG_CONFIGS.find(c => c.key === activeCatalogKey)!;
  const currentItems = catalogs[activeCatalogKey] || [];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const exists = currentItems.some(
      item => item.nombre.trim().toUpperCase() === newItemName.trim().toUpperCase()
    );

    if (exists) {
      alert(`El ítem "${newItemName.trim()}" ya existe en este catálogo.`);
      return;
    }

    const isCs = activeCatalogKey === 'centros_servicios';
    const stateObj = isCs ? (VENEZUELA_STATES.find(s => s.id === selectedStateFk) || VENEZUELA_STATES[0]) : undefined;
    const regObj = isCs && stateObj ? VENEZUELA_REGIONS.find(r => r.id === stateObj.region_id) : undefined;

    const newItem: MasterCatalogItem = {
      id: `${activeCatalogKey}-${Date.now()}`,
      nombre: newItemName.trim().toUpperCase(),
      adicional: newItemExtra.trim() || undefined,
      activo: true,
      region_id: isCs && stateObj ? stateObj.region_id : undefined,
      region_nombre: isCs ? regObj?.nombre : undefined,
      estado_id: isCs && stateObj ? stateObj.id : undefined,
      estado_nombre: isCs && stateObj ? stateObj.nombre : undefined,
      tipo: isCs ? selectedTipoCs : undefined
    };

    const updated = {
      ...catalogs,
      [activeCatalogKey]: [...currentItems, newItem]
    };

    onUpdateCatalogs(updated);
    setNewItemName('');
    setNewItemExtra('');
    showToast(`Ítem "${newItem.nombre}" agregado con éxito.`);
  };

  const handleDeleteItem = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar "${nombre}" del catálogo de ${activeConfig.label}?`)) {
      const updated = {
        ...catalogs,
        [activeCatalogKey]: currentItems.filter(item => item.id !== id)
      };
      onUpdateCatalogs(updated);
      showToast(`Ítem "${nombre}" eliminado.`);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = {
      ...catalogs,
      [activeCatalogKey]: currentItems.map(item =>
        item.id === id ? { ...item, activo: !item.activo } : item
      )
    };
    onUpdateCatalogs(updated);
  };

  const handleProcessBulkImport = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let addedCount = 0;
    const existingNames = new Set(currentItems.map(i => i.nombre.toUpperCase()));
    const newItems: MasterCatalogItem[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[;,]/);
      const name = parts[0].trim().toUpperCase();
      const extra = parts[1] ? parts[1].trim() : undefined;

      if (name && !existingNames.has(name)) {
        existingNames.add(name);
        newItems.push({
          id: `${activeCatalogKey}-bulk-${Date.now()}-${idx}`,
          nombre: name,
          adicional: extra,
          activo: true
        });
        addedCount++;
      }
    });

    const updated = {
      ...catalogs,
      [activeCatalogKey]: [...currentItems, ...newItems]
    };

    onUpdateCatalogs(updated);
    setBulkInput('');
    setShowBulkModal(false);
    showToast(`Se importaron ${addedCount} nuevos ítems en ${activeConfig.label}.`);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'catalogos_maestros_corpoelec.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredItems = currentItems.filter(item => {
    const term = searchFilter.toLowerCase().trim();
    if (activeCatalogKey === 'centros_servicios') {
      if (regionFilter) {
        const matchReg = item.region_id === regionFilter || item.region_nombre === regionFilter;
        if (!matchReg) return false;
      }
      if (stateFilter) {
        const matchState = item.estado_id === stateFilter || 
          item.estado_nombre?.toLowerCase() === stateFilter.toLowerCase() ||
          VENEZUELA_STATES.find(s => s.id === stateFilter)?.nombre.toLowerCase() === item.estado_nombre?.toLowerCase();
        if (!matchState) return false;
      }
    }
    if (!term) return true;
    return (
      item.nombre.toLowerCase().includes(term) ||
      (item.adicional && item.adicional.toLowerCase().includes(term)) ||
      (item.estado_nombre && item.estado_nombre.toLowerCase().includes(term)) ||
      (item.region_nombre && item.region_nombre.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Módulo de Parametrización Dinámica</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Gestor de Catálogos Maestros de Flota
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Aquí puedes cargar y ajustar las listas oficiales para alimentar el formulario y optimizar la ingesta de datos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pegar / Carga Masiva</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Catálogos JSON</span>
            </button>
          </div>
        </div>

        {/* Catalog Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex gap-2 overflow-x-auto pb-1">
          {CATALOG_CONFIGS.map(cfg => {
            const count = (catalogs[cfg.key] || []).length;
            const isSelected = activeCatalogKey === cfg.key;
            return (
              <button
                key={cfg.key}
                onClick={() => {
                  setActiveCatalogKey(cfg.key);
                  setSearchFilter('');
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cfg.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded tabular-nums ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Catalog Details & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Add New Item & Info */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Agregar Elemento a {activeConfig.label}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {activeConfig.desc} ({activeConfig.colExcel}).
            </p>

            <form onSubmit={handleAddItem} className="space-y-3">
              {activeCatalogKey === 'centros_servicios' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Estado / Entidad Federal *
                    </label>
                    <select
                      value={selectedStateFk}
                      onChange={(e) => setSelectedStateFk(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:border-blue-600 font-medium uppercase"
                    >
                      {VENEZUELA_STATES.map(s => (
                        <option key={s.id} value={s.id} className="bg-white text-slate-900 uppercase">
                          {s.nombre.toUpperCase()} [{s.codigo}] · {s.region.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Región asociada */}
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md text-[11px]">
                    <div className="text-emerald-800 font-medium flex items-center justify-between">
                      <span>Región CORPOELEC:</span>
                      <span className="font-mono text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase">
                        {VENEZUELA_STATES.find(s => s.id === selectedStateFk)?.region}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tipo Operativo del Centro
                    </label>
                    <select
                      value={selectedTipoCs}
                      onChange={(e) => setSelectedTipoCs(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:border-purple-600 uppercase font-medium"
                    >
                      <option value="Atención Técnica y Distribución" className="bg-white text-slate-900">ATENCIÓN TÉCNICA Y DISTRIBUCIÓN</option>
                      <option value="Base Operativa y Flota Pesada" className="bg-white text-slate-900">BASE OPERATIVA Y FLOTA PESADA</option>
                      <option value="Sede Corporativa Central" className="bg-white text-slate-900">SEDE CORPORATIVA CENTRAL</option>
                      <option value="Base Mayor Mantenimiento Automotriz" className="bg-white text-slate-900">BASE MAYOR MANTENIMIENTO AUTOMOTRIZ</option>
                      <option value="Atención Comercial y Averías" className="bg-white text-slate-900">ATENCIÓN COMERCIAL Y AVERÍAS</option>
                      <option value="Subestación y Transmisión" className="bg-white text-slate-900">SUBESTACIÓN Y TRANSMISIÓN</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre / Valor Oficial *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={activeCatalogKey === 'centros_servicios' ? 'Ej. CS PUERTO ORDAZ - CARONÍ' : 'Ej. TOYOTA, DISTRIBUCIÓN, etc.'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nota / Detalle Adicional (Opcional)
                </label>
                <input
                  type="text"
                  value={newItemExtra}
                  onChange={(e) => setNewItemExtra(e.target.value)}
                  placeholder="Ej. Cuadrillas 4x4, Sede Central, etc."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Catálogo</span>
              </button>
            </form>
          </div>

          {/* Catalog Impact Box */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong>Vínculo con el Formulario:</strong> Todo elemento activo aquí estará disponible de inmediato en las opciones de la columna <strong>{activeConfig.colExcel} ({activeConfig.colCampo})</strong> en el formulario y en el validador de importación.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Catalog List Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Buscar en ${activeConfig.label}...`}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            {activeCatalogKey === 'centros_servicios' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="">Todos los Estados (Filtrar por Estado)</option>
                  {VENEZUELA_STATES.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} [{s.codigo}]</option>
                  ))}
                </select>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-purple-600"
                >
                  <option value="">Todas las Regiones</option>
                  {VENEZUELA_REGIONS.map(r => (
                    <option key={r.id} value={r.nombre}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="text-xs text-slate-500 font-mono">
              Total: <strong>{filteredItems.length}</strong> ítems
            </div>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-4">Valor Normalizado</th>
                  {activeCatalogKey === 'centros_servicios' && (
                    <>
                      <th className="py-2.5 px-3">Región [PK]</th>
                      <th className="py-2.5 px-3">Estado [FK]</th>
                    </>
                  )}
                  <th className="py-2.5 px-4">{activeCatalogKey === 'centros_servicios' ? 'Tipo / Detalle' : 'Detalle / Especificación'}</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-center w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                      {item.nombre}
                    </td>
                    {activeCatalogKey === 'centros_servicios' && (
                      <>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            {item.region_nombre || 'Región SEN'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                            {item.estado_nombre || 'Estado'}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-4 text-slate-500">
                      {item.tipo ? `${item.tipo}${item.adicional ? ` · ${item.adicional}` : ''}` : (item.adicional || '—')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          item.activo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {item.activo ? 'ACTIVO' : 'INACTIVO'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id, item.nombre)}
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No se encontraron elementos en este catálogo.
            </div>
          )}
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Carga Masiva: {activeConfig.label}
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Cerrar ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pega aquí la lista de valores (uno por línea). También puedes incluir una nota separada por coma o punto y coma (ej. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">TOYOTA; Fabricante Japón</code>).
            </p>

            <textarea
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={`VALOR_1\nVALOR_2; Detalle adicional\nVALOR_3`}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessBulkImport}
                disabled={!bulkInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
              >
                Procesar e Incorporar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
