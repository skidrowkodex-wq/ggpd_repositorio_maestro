import React, { useState, useMemo } from 'react';
import { 
  CorrespondenciaRecord, 
  DireccionTipo, 
  TipoDocumento, 
  EstadoTramite, 
  NivelConfidencialidad,
  PropositoDocumento 
} from '../types';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Calendar, 
  User, 
  Building, 
  ArrowRight,
  Shield,
  Clock,
  CheckCircle,
  Download,
  AlertCircle,
  Plus,
  Sparkles,
  Send,
  Truck,
  FileCheck2,
  SlidersHorizontal,
  X,
  Zap,
  FileCheck,
  BellRing
} from 'lucide-react';

interface RegistryTableProps {
  records: CorrespondenciaRecord[];
  onSelectRecord: (record: CorrespondenciaRecord) => void;
  onDerivarTarea: (record: CorrespondenciaRecord) => void;
  onOpenRadicacion: () => void;
  onOpenDraft?: (record: CorrespondenciaRecord) => void;
  onOpenBriefing?: (record: CorrespondenciaRecord) => void;
}

export const RegistryTable: React.FC<RegistryTableProps> = ({
  records,
  onSelectRecord,
  onDerivarTarea,
  onOpenRadicacion,
  onOpenDraft,
  onOpenBriefing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDireccion, setFilterDireccion] = useState<string>('ALL');
  const [filterProposito, setFilterProposito] = useState<string>('ALL');
  const [filterConfidencialidad, setFilterConfidencialidad] = useState<string>('ALL');
  const [filterEstado, setFilterEstado] = useState<string>('ALL');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFiltersCount = [
    filterDireccion !== 'ALL',
    filterProposito !== 'ALL',
    filterConfidencialidad !== 'ALL',
    filterEstado !== 'ALL'
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDireccion('ALL');
    setFilterProposito('ALL');
    setFilterConfidencialidad('ALL');
    setFilterEstado('ALL');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const matchSearch = 
        item.correlativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numeroDocumentoOrigen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remitenteInstitucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.remitenteNombre && item.remitenteNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.instruidoPor && item.instruidoPor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.destinatarioPrincipal.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDireccion = filterDireccion === 'ALL' || item.direccion === filterDireccion;
      const matchProposito = filterProposito === 'ALL' || item.proposito === filterProposito;
      const matchConf = filterConfidencialidad === 'ALL' || item.nivelConfidencialidad === filterConfidencialidad;
      const matchEstado = filterEstado === 'ALL' || item.estadoTramite === filterEstado;

      return matchSearch && matchDireccion && matchProposito && matchConf && matchEstado;
    });
  }, [records, searchTerm, filterDireccion, filterProposito, filterConfidencialidad, filterEstado]);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENTE_24H':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 animate-pulse">URGENTE 24H</span>;
      case 'ALTA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">ALTA</span>;
      case 'MEDIA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">MEDIA</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">BAJA</span>;
    }
  };

  const getPropositoBadge = (prop?: PropositoDocumento, instruidoPor?: string) => {
    switch (prop) {
      case 'INSTRUCCION_EJECUTIVA':
        return (
          <span 
            title={instruidoPor ? `Instrucción Superior de: ${instruidoPor}` : 'Instrucción Superior GGD / Ministerial'}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs animate-pulse cursor-help"
          >
            <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
            <span>⚡ INSTRUCCIÓN GGD</span>
          </span>
        );
      case 'EVALUACION_TECNICA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Search className="w-2.5 h-2.5" />
            <span>EVALUACIÓN SEN</span>
          </span>
        );
      case 'REVISION_CONFORMACION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <FileCheck className="w-2.5 h-2.5" />
            <span>REVISIÓN</span>
          </span>
        );
      case 'INFORMATIVO_NOTIFICACION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <BellRing className="w-2.5 h-2.5 text-slate-400" />
            <span>INFORMATIVO</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (s: EstadoTramite, oficio?: any) => {
    if (oficio?.estadoFirma === 'DESPACHADO_CON_ACUSE') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
          <Truck className="w-3 h-3" /> DESPACHADO
        </span>
      );
    }
    if (oficio?.estadoFirma === 'FIRMADO_FISICO') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 flex items-center gap-1">
          <FileCheck2 className="w-3 h-3" /> FIRMADO
        </span>
      );
    }
    if (oficio?.estadoFirma === 'PENDIENTE_FIRMA') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center gap-1">
          <Clock className="w-3 h-3" /> PENDIENTE FIRMA
        </span>
      );
    }

    switch (s) {
      case 'RADICADO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">RADICADO</span>;
      case 'EN_REVISION':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">EN REVISIÓN</span>;
      case 'ASIGNADO_CON_TAREA':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> CON TAREA</span>;
      case 'RESPONDIDO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">RESPONDIDO</span>;
      case 'ARCHIVADO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">ARCHIVADO</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800">{s}</span>;
    }
  };

  const getDirectionBadge = (d: DireccionTipo) => {
    switch (d) {
      case 'ENTRADA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">ENTRADA</span>;
      case 'SALIDA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">SALIDA</span>;
      case 'INTERNA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">INTERNA</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#072146] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por N° oficio, asunto, remitente o instrucción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions (Mobile Filter Toggle + Radicate) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                activeFiltersCount > 0 || showMobileFilters
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenRadicacion}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Radicar</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns (Visible always on >= md, collapsible on mobile) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2 ${showMobileFilters ? 'block' : 'hidden md:flex'}`}>
          {/* Propósito / Verbo Rector Filter */}
          <select
            value={filterProposito}
            onChange={(e) => setFilterProposito(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Todos los Propósitos</option>
            <option value="INSTRUCCION_EJECUTIVA">⚡ Instrucciones Ejecutivas GGD</option>
            <option value="EVALUACION_TECNICA">🔍 Evaluaciones Técnicas</option>
            <option value="REVISION_CONFORMACION">📑 Revisiones / Visto Bueno</option>
            <option value="INFORMATIVO_NOTIFICACION">📢 Para Conocimiento</option>
          </select>

          {/* Direccion */}
          <select
            value={filterDireccion}
            onChange={(e) => setFilterDireccion(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Todas las Direcciones</option>
            <option value="ENTRADA">Entrada (Recibida)</option>
            <option value="SALIDA">Salida (Emitida)</option>
            <option value="INTERNA">Interna</option>
          </select>

          {/* Confidencialidad */}
          <select
            value={filterConfidencialidad}
            onChange={(e) => setFilterConfidencialidad(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Toda Confidencialidad</option>
            <option value="ORDINARIO">Ordinario</option>
            <option value="CONFIDENCIAL">Confidencial</option>
            <option value="RESERVADO_DIRECTIVA">Reservado</option>
          </select>

          {/* Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="RADICADO">Radicado</option>
            <option value="EN_REVISION">En Revisión</option>
            <option value="ASIGNADO_CON_TAREA">Con Tarea SCMTP</option>
            <option value="RESPONDIDO">Respondido / Despachado</option>
            <option value="ARCHIVADO">Archivado</option>
          </select>

          {/* Reset Filters Shortcut */}
          {(activeFiltersCount > 0 || searchTerm) && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 MOBILE CARD VIEW (< md) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#072146] rounded-2xl border border-slate-200 dark:border-purple-900/40">
            No se encontraron correspondencias con los filtros aplicados.
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div 
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#072146] border border-slate-200 dark:border-purple-900/40 shadow-xs space-y-3"
            >
              {/* Card Header: Correlativo + Badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-300">
                      {item.correlativo}
                    </span>
                    {getPropositoBadge(item.proposito, item.instruidoPor)}
                  </div>
                  <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {item.numeroDocumentoOrigen}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(item.estadoTramite, item.oficioRespuestaDetalle)}
                  <div className="flex items-center gap-1">
                    {getDirectionBadge(item.direccion)}
                    {getPriorityBadge(item.prioridad)}
                  </div>
                </div>
              </div>

              {/* Remitente & Fecha */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Remitente</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.remitenteInstitucion}</span>
                  {item.remitenteNombre && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.remitenteNombre}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Fecha Recepción</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {item.fechaRecepcion}
                  </span>
                  {item.fechaLimiteRespuesta && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                      SLA: {item.fechaLimiteRespuesta}
                    </span>
                  )}
                </div>
              </div>

              {/* Asunto */}
              <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#041426] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">Asunto</span>
                <p className="line-clamp-2 font-medium">{item.asunto}</p>
                
                {item.instruidoPor && item.proposito === 'INSTRUCCION_EJECUTIVA' && (
                  <div className="mt-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Instruido por: {item.instruidoPor}</span>
                  </div>
                )}

                {/* Linked Tasks or Oficios */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {item.tareaScmtpTitulo && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>Tarea: {item.tareaScmtpId}</span>
                    </div>
                  )}
                  {item.oficioRespuestaDetalle && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                      <Send className="w-3 h-3" />
                      <span>Oficio: {item.oficioRespuestaDetalle.numeroOficio}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Mobile */}
              <div className="flex items-center justify-between pt-1 gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {onOpenBriefing && (
                    <button
                      onClick={() => onOpenBriefing(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold flex items-center gap-1"
                      title="Ficha 360°"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ficha 360°</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectRecord(item)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Detalles</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {onOpenDraft && (
                    <button
                      onClick={() => onOpenDraft(item)}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      title="Redactar Respuesta"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.pdfDriveUrl && (
                    <a
                      href={item.pdfDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
                      title="Ver PDF Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {!item.tareaScmtpId && item.estadoTramite !== 'RESPONDIDO' && item.estadoTramite !== 'ARCHIVADO' && (
                    <button
                      onClick={() => onDerivarTarea(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <span>+ SCMTP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP TABLE VIEW (>= md) */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white dark:bg-[#072146] rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#041426] border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Correlativo / Propósito</th>
                <th className="py-3.5 px-4">Documento Origen</th>
                <th className="py-3.5 px-4">Remitente / Institución</th>
                <th className="py-3.5 px-4">Asunto / Síntesis</th>
                <th className="py-3.5 px-4">Fecha Recepción</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron correspondencias con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    {/* Correlativo + Proposito + Direccion */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-purple-700 dark:text-purple-300">
                        {item.correlativo}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {getPropositoBadge(item.proposito, item.instruidoPor)}
                        {getDirectionBadge(item.direccion)}
                        {getPriorityBadge(item.prioridad)}
                      </div>
                    </td>

                    {/* Documento Origen */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                        {item.numeroDocumentoOrigen}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tipo: <span className="font-bold text-purple-600 dark:text-purple-400">{item.tipoDocumento}</span>
                      </div>
                      {item.nivelConfidencialidad !== 'ORDINARIO' && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          <Shield className="w-3 h-3" />
                          <span>{item.nivelConfidencialidad}</span>
                        </div>
                      )}
                    </td>

                    {/* Remitente */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.remitenteInstitucion}
                      </div>
                      {item.remitenteNombre && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.remitenteNombre}
                        </div>
                      )}
                      {item.instruidoPor && item.proposito === 'INSTRUCCION_EJECUTIVA' && (
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 truncate mt-0.5">
                          ⚡ {item.instruidoPor}
                        </div>
                      )}
                    </td>

                    {/* Asunto */}
                    <td className="py-3 px-4 max-w-[320px]">
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2" title={item.asunto}>
                        {item.asunto}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {item.tareaScmtpTitulo && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Tarea: {item.tareaScmtpId}</span>
                          </div>
                        )}
                        {item.oficioRespuestaDetalle && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                            <Send className="w-3 h-3" />
                            <span>Oficio: {item.oficioRespuestaDetalle.numeroOficio}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.fechaRecepcion}</span>
                      </div>
                      {item.fechaLimiteRespuesta && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                          SLA: {item.fechaLimiteRespuesta}
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.estadoTramite, item.oficioRespuestaDetalle)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Ficha 360 */}
                        {onOpenBriefing && (
                          <button
                            onClick={() => onOpenBriefing(item)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Ficha Ejecutiva 360° (Modo Reunión)"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}

                        {/* Ver Detalle */}
                        <button
                          onClick={() => onSelectRecord(item)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 transition-colors"
                          title="Ver Ficha y Auditoría"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Redactar / Ver Oficio Salida */}
                        {onOpenDraft && (
                          <button
                            onClick={() => onOpenDraft(item)}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                            title="Redactor Asistido de Oficio de Respuesta"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Ver PDF Drive */}
                        {item.pdfDriveUrl && (
                          <a
                            href={item.pdfDriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
                            title="Abrir PDF Digitalizado en Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Derivar Tarea SCMTP */}
                        {!item.tareaScmtpId && item.estadoTramite !== 'RESPONDIDO' && item.estadoTramite !== 'ARCHIVADO' && (
                          <button
                            onClick={() => onDerivarTarea(item)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                            title="Derivar requerimiento técnico a SCMTP"
                          >
                            <span>+ SCMTP</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-50 dark:bg-[#041426] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Mostrando {filteredRecords.length} de {records.length} registros radicados</span>
          <span className="font-mono text-[11px]">Norma ISO 15489 • Libro Oficial de Radicación</span>
        </div>
      </div>

      {/* Mobile Footer Status */}
      <div className="md:hidden p-3 text-center text-xs text-slate-400 font-mono">
        Mostrando {filteredRecords.length} de {records.length} correspondencias
      </div>
    </div>
  );
};
