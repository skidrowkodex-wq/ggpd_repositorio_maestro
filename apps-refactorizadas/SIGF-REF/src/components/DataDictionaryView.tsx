import React, { useState, useMemo } from 'react';
import { FLEET_COLUMNS, VALIDATION_RULES_LIST } from '../data/schemaDefinition';
import { Search, Filter, Database, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const DataDictionaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [showCatalogOnly, setShowCatalogOnly] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(FLEET_COLUMNS.map(c => c.categoria_logica));
    return ['TODAS', ...Array.from(set)];
  }, []);

  const filteredColumns = useMemo(() => {
    return FLEET_COLUMNS.filter(col => {
      const matchCategory = selectedCategory === 'TODAS' || col.categoria_logica === selectedCategory;
      const matchCatalog = !showCatalogOnly || Boolean(col.catalogo_sugerido);
      
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        col.columna_excel.toLowerCase().includes(term) ||
        col.titulo.toLowerCase().includes(term) ||
        col.campo.toLowerCase().includes(term) ||
        col.descripcion.toLowerCase().includes(term) ||
        (col.catalogo_sugerido && col.catalogo_sugerido.toLowerCase().includes(term));

      return matchCategory && matchCatalog && matchSearch;
    });
  }, [searchTerm, selectedCategory, showCatalogOnly]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Diccionario Oficial de Datos · FLOTA.xlsx</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Estructura Completa de las 45 Columnas (A : AS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Especificación técnica, tipo de dato, regla de integridad y asignación a catálogos maestros.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Total Columnas: <strong>45</strong></span>
            <span>·</span>
            <span>Rango: <strong>A1:AS1</strong></span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por columna (ej. B, AD), título o descripción..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none pr-2 py-1 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'TODAS' ? 'Todas las Categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCatalogOnly(!showCatalogOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                showCatalogOnly
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Solo Candidatos a Catálogo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Columns Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">N°</th>
                <th className="py-3 px-3 w-16 text-center">Excel</th>
                <th className="py-3 px-4">Título Oficial en Hoja</th>
                <th className="py-3 px-3">Campo BD</th>
                <th className="py-3 px-3">Tipo Dato</th>
                <th className="py-3 px-3 text-center">Requerido</th>
                <th className="py-3 px-4">Catálogo / Dominio de Valores</th>
                <th className="py-3 px-4 min-w-[220px]">Descripción & Regla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredColumns.map((col) => {
                const isCatalog = Boolean(col.catalogo_sugerido);
                const isPk = col.unico;
                const isComponent = col.categoria_logica === 'Componentes Mecánicos';

                return (
                  <tr key={col.orden} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-500 tabular-nums">
                      {col.orden}
                    </td>

                    {/* Excel column */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {col.columna_excel}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{col.titulo}</div>
                      <div className="text-[11px] text-slate-500">{col.categoria_logica}</div>
                    </td>

                    {/* DB Field Name */}
                    <td className="py-3 px-3">
                      <code className="font-mono text-blue-700 bg-blue-50/60 px-1.5 py-0.5 rounded text-[11px]">
                        {col.campo}
                      </code>
                    </td>

                    {/* Data Type */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-600 text-[11px]">
                        {col.tipo_dato}
                      </span>
                    </td>

                    {/* Required / PK */}
                    <td className="py-3 px-3 text-center">
                      {isPk ? (
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          PK ÚNICO
                        </span>
                      ) : col.obligatorio ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          OBLIGATORIO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Opcional
                        </span>
                      )}
                    </td>

                    {/* Master Catalog / Domain */}
                    <td className="py-3 px-4">
                      {isCatalog ? (
                        <div className="inline-flex items-center gap-1.5 text-blue-700 font-medium">
                          <Database className="w-3.5 h-3.5 shrink-0" />
                          <span>{col.catalogo_sugerido}</span>
                        </div>
                      ) : col.valores_sugeridos ? (
                        <div className="text-slate-600 font-mono text-[11px] max-w-[200px] truncate" title={col.valores_sugeridos.join(', ')}>
                          {col.valores_sugeridos.join(' · ')}
                        </div>
                      ) : col.ejemplo ? (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Ej: {col.ejemplo}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Texto libre</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">
                      {col.descripcion}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredColumns.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No se encontraron columnas que coincidan con los criterios de búsqueda.
          </div>
        )}
      </div>

      {/* Validation Rules Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Reglas de Validación y Consistencia de la Hoja Oficial
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Reglas que el sistema ejecuta automáticamente durante la ingesta masiva y en el formulario de captura.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VALIDATION_RULES_LIST.map((rule) => (
            <div key={rule.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-700">{rule.id}</span>
                <span className="text-[11px] font-mono text-slate-500">{rule.tipo}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1">{rule.titulo}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rule.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
