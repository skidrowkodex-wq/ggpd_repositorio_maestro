import React, { useState } from 'react';
import { CorrespondenciaRecord } from '../types';
import { 
  X, 
  Sparkles, 
  Printer, 
  Search, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Building2, 
  User, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  Layers,
  FileCheck2,
  FileSearch,
  Send,
  CornerDownRight,
  HelpCircle,
  Folder,
  Eye,
  Link as LinkIcon
} from 'lucide-react';

interface ExecutiveBriefing360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CorrespondenciaRecord | null;
  allRecords: CorrespondenciaRecord[];
  onSelectRecord: (record: CorrespondenciaRecord) => void;
}

export const ExecutiveBriefing360Modal: React.FC<ExecutiveBriefing360ModalProps> = ({
  isOpen,
  onClose,
  record,
  allRecords,
  onSelectRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentRecord = record || allRecords[0];

  const searchResults = searchTerm.trim() 
    ? allRecords.filter(r => 
        r.correlativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.numeroDocumentoOrigen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.remitenteInstitucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destinatarioPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.asunto.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const isSalida = currentRecord?.direccion === 'SALIDA';
  const isEntrada = currentRecord?.direccion === 'ENTRADA';

  // 🔗 Motor de Vinculación Cruzada Bidireccional (Cross-Reference Engine)
  const antecedenteRecord = isSalida
    ? allRecords.find(r => 
        (currentRecord.oficioRespuestaRef && (r.correlativo === currentRecord.oficioRespuestaRef || r.numeroDocumentoOrigen === currentRecord.oficioRespuestaRef)) ||
        (r.oficioRespuestaDetalle && (r.oficioRespuestaDetalle.numeroOficio === currentRecord.numeroDocumentoOrigen || r.oficioRespuestaDetalle.correlativoOrigen === currentRecord.correlativo)) ||
        (r.oficioRespuestaRef === currentRecord.correlativo) ||
        (r.direccion === 'ENTRADA' && currentRecord.descripcionSintesis?.includes(r.numeroDocumentoOrigen))
      )
    : null;

  const salidaVinculadaRecord = isEntrada
    ? allRecords.find(r =>
        r.direccion === 'SALIDA' && (
          r.oficioRespuestaRef === currentRecord.correlativo ||
          r.numeroDocumentoOrigen === currentRecord.oficioRespuestaRef ||
          (currentRecord.oficioRespuestaDetalle && r.numeroDocumentoOrigen === currentRecord.oficioRespuestaDetalle.numeroOficio) ||
          r.asunto.toLowerCase().includes(currentRecord.numeroDocumentoOrigen.toLowerCase())
        )
      )
    : null;

  // Unificación de Oficio de Respuesta
  const unifiedOficio = currentRecord?.oficioRespuestaDetalle || antecedenteRecord?.oficioRespuestaDetalle || salidaVinculadaRecord?.oficioRespuestaDetalle || (isSalida ? {
    id: `of-${currentRecord.id}`,
    correspondenciaOrigenId: antecedenteRecord?.id || currentRecord.id,
    correlativoOrigen: antecedenteRecord?.correlativo || currentRecord.oficioRespuestaRef || currentRecord.correlativo,
    numeroOficio: currentRecord.numeroDocumentoOrigen,
    tipoDocumento: (currentRecord.tipoDocumento === 'MEMORANDUM' ? 'MEMORANDUM' : 'OFICIO') as any,
    destinatarioInstitucion: currentRecord.destinatarioPrincipal,
    destinatarioNombre: currentRecord.destinatarioPrincipal,
    destinatarioCargo: 'Autoridad Destinataria',
    asunto: currentRecord.asunto,
    referenciaAntecedente: antecedenteRecord?.numeroDocumentoOrigen || currentRecord.oficioRespuestaRef || 'Solicitud Previa',
    cuerpoTexto: currentRecord.descripcionSintesis || currentRecord.asunto,
    conclusionesTecnicas: 'Dictamen técnico emitido y despachado formalmente según requerimiento.',
    firmanteNombre: currentRecord.remitenteNombre || 'Ing. Carlos Reyes',
    firmanteCargo: currentRecord.remitenteCargo || 'Gerente Nacional de Planificación',
    redactadoPor: currentRecord.responsableAsignado || 'Especialista GGPD',
    estadoFirma: (currentRecord.estadoTramite === 'RESPONDIDO' || currentRecord.estadoTramite === 'ARCHIVADO') ? 'DESPACHADO_CON_ACUSE' : 'FIRMADO_FISICO',
    fechaCreacion: currentRecord.fechaEmisionOrigen,
    fechaFirma: currentRecord.fechaEmisionOrigen,
    fechaDespacho: currentRecord.fechaRecepcion || currentRecord.fechaEmisionOrigen,
    nroGuiaAcuse: currentRecord.medioEntrega || 'Despacho Oficial Digital',
    receptorAcuseNombre: currentRecord.destinatarioPrincipal
  } : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-[#072146] w-full max-w-5xl rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-sm">
                  Modo Reunión 360°
                </span>
                <span className="text-xs text-purple-200 font-medium hidden sm:inline">
                  Consulta Ejecutiva de Trazabilidad en 3 Segundos
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5">
                Ficha Ejecutiva Integral de Correspondencia & Despacho
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
            <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Instant Search Bar */}
        <div className="p-3 bg-purple-50 dark:bg-[#041426] border-b border-purple-200 dark:border-purple-900/40 flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Búsqueda instantánea en 3 seg: Escriba N° Oficio, Remitente o Asunto..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#072146] border border-purple-300 dark:border-purple-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Search Results Dropdown if active */}
        {searchResults.length > 0 && (
          <div className="bg-white dark:bg-[#072146] border-b border-purple-200 dark:border-purple-800 max-h-48 overflow-y-auto p-2 space-y-1 z-20">
            <div className="text-[10px] font-bold text-slate-400 uppercase px-2">
              Resultados coincidentes ({searchResults.length}):
            </div>
            {searchResults.map((sr) => (
              <div
                key={sr.id}
                onClick={() => {
                  onSelectRecord(sr);
                  setSearchTerm('');
                }}
                className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                    {sr.correlativo}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sr.numeroDocumentoOrigen}
                  </span>
                  <span className="text-slate-500 truncate max-w-md">
                    {sr.asunto}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-500" />
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">
          {currentRecord ? (
            <div className="space-y-6">
              
              {/* Executive Summary Card */}
              <div className="bg-slate-50 dark:bg-[#041426] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-purple-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-purple-900 text-white px-3 py-1 rounded-lg shadow-sm">
                      {currentRecord.correlativo}
                    </span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-sm ${
                      isSalida 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {isSalida ? '📤 OFICIO DE SALIDA (EMITIDO)' : '📥 ENTRADA (RECIBIDA)'}
                    </span>
                    {currentRecord.proposito === 'INSTRUCCION_EJECUTIVA' && (
                      <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm animate-pulse">
                        ⚡ INSTRUCCIÓN SUPERIOR: {currentRecord.instruidoPor || 'GGD'}
                      </span>
                    )}
                    <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-lg">
                      {currentRecord.tipoDocumento}
                    </span>
                    <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                      {currentRecord.nivelConfidencialidad}
                    </span>
                    <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-lg">
                      Prioridad: {currentRecord.prioridad}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2.5">
                    {currentRecord.numeroDocumentoOrigen} — {currentRecord.remitenteInstitucion}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
                    <strong>Asunto:</strong> {currentRecord.asunto}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 bg-white dark:bg-[#072146] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="text-slate-400">Estado de Trámite:</div>
                  <div className="text-sm font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    {currentRecord.estadoTramite}
                  </div>
                  {currentRecord.fechaLimiteRespuesta && (
                    <div className="text-[11px] text-amber-600 font-bold mt-1">
                      SLA: {currentRecord.fechaLimiteRespuesta}
                    </div>
                  )}
                </div>
              </div>

              {/* 🎯 PANEL EJECUTIVO DE DIRECTORIO: RESPUESTAS CLAVE EN 3 SEGUNDOS */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/10 via-indigo-900/15 to-purple-950/10 border-2 border-purple-400/40 dark:border-purple-600/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-200">
                      Respuestas Clave para la Gerencia (Preguntas de Directorio)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                    SÍNTESIS EJECUTIVA INMEDIATA
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Pregunta 1: ¿A quién se le respondió? */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/60 space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" />
                      1. ¿A quién se envió / respondió?
                    </span>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {unifiedOficio?.destinatarioNombre || currentRecord.destinatarioPrincipal}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {unifiedOficio?.destinatarioInstitucion || currentRecord.destinatarioPrincipal}
                    </div>
                  </div>

                  {/* Pregunta 2: ¿A qué requerimiento responde? */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/60 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <FileSearch className="w-3 h-3" />
                      2. ¿A qué requerimiento responde?
                    </span>
                    <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {antecedenteRecord?.numeroDocumentoOrigen || currentRecord.oficioRespuestaRef || 'Solicitud Inicial'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {antecedenteRecord?.remitenteInstitucion || 'Ente Solicitante / Despacho'}
                    </div>
                    {antecedenteRecord && (
                      <button
                        onClick={() => onSelectRecord(antecedenteRecord)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline pt-0.5"
                      >
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span>Ver Antecedente ({antecedenteRecord.correlativo})</span>
                      </button>
                    )}
                  </div>

                  {/* Pregunta 3: ¿Cuál fue el dictamen emitido? */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/60 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      3. Dictamen / Estatus de Respuesta
                    </span>
                    <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 line-clamp-2">
                      {currentRecord.descripcionSintesis || unifiedOficio?.conclusionesTecnicas || 'Respuesta Técnica Favorable'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">
                      Oficio: <span className="font-mono text-purple-600 dark:text-purple-300">{unifiedOficio?.numeroOficio || currentRecord.numeroDocumentoOrigen}</span>
                    </div>
                  </div>
                </div>

                {/* Banner de Enlace Cruzado si existe */}
                {antecedenteRecord && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CornerDownRight className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Documento emitido en respuesta formal a la <strong>Solicitud {antecedenteRecord.correlativo} ({antecedenteRecord.numeroDocumentoOrigen})</strong>.
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectRecord(antecedenteRecord)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                    >
                      Saltar a Solicitud Origen
                    </button>
                  </div>
                )}

                {salidaVinculadaRecord && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Esta solicitud fue atendida y cerrada mediante el <strong>Oficio de Salida {salidaVinculadaRecord.correlativo} ({salidaVinculadaRecord.numeroDocumentoOrigen})</strong>.
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectRecord(salidaVinculadaRecord)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                    >
                      Ver Oficio de Salida
                    </button>
                  </div>
                )}
              </div>

              {/* TIMELINE 360° ADAPTATIVO (4 ESTACIONES ESTRATÉGICAS) */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>
                    Timeline de Trazabilidad 360° {isSalida ? '(Antecedente ➔ Sustento ➔ Oficio Salida ➔ Despacho)' : '(Entrada ➔ SCMTP ➔ Respuesta ➔ Acuse)'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  
                  {/* Estación 1: Entrada / Antecedente */}
                  <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-[#072146] border border-purple-200 dark:border-purple-900/60 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded">
                        {isSalida ? '1. Solicitud Antecedente' : '1. Entrada Radicada'}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {isSalida 
                        ? (antecedenteRecord?.numeroDocumentoOrigen || currentRecord.oficioRespuestaRef || 'Solicitud Previa')
                        : currentRecord.numeroDocumentoOrigen}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Origen: <strong>{isSalida ? (antecedenteRecord?.remitenteInstitucion || 'Despacho Solicitante') : currentRecord.remitenteInstitucion}</strong></div>
                      <div>Emisión: <strong>{isSalida ? (antecedenteRecord?.fechaEmisionOrigen || currentRecord.fechaEmisionOrigen) : currentRecord.fechaEmisionOrigen}</strong></div>
                      <div>Vía: {isSalida ? (antecedenteRecord?.medioEntrega || 'Oficial') : (currentRecord.medioEntrega || 'Oficial')}</div>
                    </div>
                    {(currentRecord.pdfDriveUrl || antecedenteRecord?.pdfDriveUrl) && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={currentRecord.pdfDriveUrl || antecedenteRecord?.pdfDriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver PDF</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Estación 2: Operación SCMTP / Sustento Técnico */}
                  <div className={`p-4 rounded-xl border space-y-2 relative ${
                    (currentRecord.tareaScmtpTitulo || antecedenteRecord?.tareaScmtpTitulo || isSalida)
                      ? 'bg-emerald-50/70 dark:bg-[#072146] border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-[#041426] border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        (currentRecord.tareaScmtpTitulo || antecedenteRecord?.tareaScmtpTitulo || isSalida) 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-300 text-slate-700'
                      }`}>
                        {isSalida ? '2. Sustento Técnico' : '2. Operación SCMTP'}
                      </span>
                      {(currentRecord.tareaScmtpTitulo || antecedenteRecord?.tareaScmtpTitulo || isSalida) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {currentRecord.tareaScmtpId || antecedenteRecord?.tareaScmtpId || (isSalida ? 'Dictamen Técnico GGPD' : 'Sin Tarea Asignada')}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Elaborado por: <strong>{currentRecord.responsableAsignado || antecedenteRecord?.responsableAsignado || 'Ing. Josué Pacheco'}</strong></div>
                      <div>Cargo: {currentRecord.responsableCargo || antecedenteRecord?.responsableCargo || 'Especialista de Planificación'}</div>
                      <div className="text-emerald-700 dark:text-emerald-300 font-semibold truncate">
                        {currentRecord.tareaScmtpTitulo || antecedenteRecord?.tareaScmtpTitulo || 'Evaluación técnica concluida'}
                      </div>
                    </div>
                  </div>

                  {/* Estación 3: Oficio de Respuesta / Salida */}
                  <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-[#072146] border border-indigo-300 dark:border-indigo-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded">
                        {isSalida ? '3. Oficio de Salida' : '3. Respuesta Formal'}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {unifiedOficio?.numeroOficio || currentRecord.numeroDocumentoOrigen}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Firmante: <strong>{unifiedOficio?.firmanteNombre || currentRecord.remitenteNombre || 'Ing. Carlos Reyes'}</strong></div>
                      <div>Cargo: {unifiedOficio?.firmanteCargo || currentRecord.remitenteCargo || 'Gerente Nacional'}</div>
                      <div>Fecha Emisión: {unifiedOficio?.fechaFirma || currentRecord.fechaEmisionOrigen}</div>
                    </div>
                  </div>

                  {/* Estación 4: Despacho & Acuse */}
                  <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-[#072146] border border-teal-300 dark:border-teal-800 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-teal-600 text-white px-2 py-0.5 rounded">
                        {isSalida ? '4. Destino & Despacho' : '4. Despacho & Acuse'}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {unifiedOficio?.nroGuiaAcuse || currentRecord.medioEntrega || 'Despacho Oficial'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Destinatario: <strong>{unifiedOficio?.destinatarioNombre || currentRecord.destinatarioPrincipal}</strong></div>
                      <div>Vía: {currentRecord.medioEntrega || 'Despacho Oficial Digital'}</div>
                      <div className="text-teal-700 dark:text-teal-300 font-bold">✓ Expediente Despachado</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Dictamen y Extracto Oficial del Oficio de Salida */}
              {unifiedOficio && (
                <div className="p-5 bg-white dark:bg-[#072146] rounded-2xl border border-slate-200 dark:border-purple-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>Extracto del Oficio Oficial ({unifiedOficio.numeroOficio})</span>
                    </h4>
                    <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
                      Firmado por: {unifiedOficio.firmanteNombre}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line bg-slate-50 dark:bg-[#041426] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                    {unifiedOficio.cuerpoTexto}
                  </p>

                  {unifiedOficio.conclusionesTecnicas && (
                    <div className="text-xs bg-purple-50/50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <strong className="text-purple-900 dark:text-purple-200 block mb-1">
                        Dictamen Técnico y Conclusiones:
                      </strong>
                      <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line">
                        {unifiedOficio.conclusionesTecnicas}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Seleccione una correspondencia para visualizar su ficha ejecutiva.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#041426] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>CORPOELEC GGPD • Sistema SCGCC V1.0 • Control de Despacho</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://drive.google.com/drive/folders/1s5sOV__H7WbJRhsNHAqWgR8BIj0XHlI7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 hover:bg-purple-200 rounded-xl font-bold transition-colors"
            >
              <Folder className="w-3.5 h-3.5 text-purple-600" />
              <span>Bóveda Drive</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
