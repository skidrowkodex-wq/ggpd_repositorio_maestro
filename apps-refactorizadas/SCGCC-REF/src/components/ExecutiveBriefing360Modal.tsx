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
  FileSearch
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
        r.asunto.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const oficio = currentRecord?.oficioRespuestaDetalle;

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
                <span className="text-xs font-mono font-bold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
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
                    {currentRecord.proposito === 'INSTRUCCION_EJECUTIVA' && (
                      <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm animate-pulse">
                        ⚡ INSTRUCCIÓN SUPERIOR: {currentRecord.instruidoPor || 'GGD'}
                      </span>
                    )}
                    <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-lg">
                      {currentRecord.tipoDocumento}
                    </span>
                    <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                      Confidencialidad: {currentRecord.nivelConfidencialidad}
                    </span>
                    <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-lg">
                      Prioridad: {currentRecord.prioridad}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
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

              {/* TIMELINE 360° — 4 ESTACIONES ESTRATÉGICAS */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Timeline de Trazabilidad 360° (Entrada $\rightarrow$ SCMTP $\rightarrow$ Respuesta $\rightarrow$ Acuse)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  
                  {/* Estación 1: Entrada */}
                  <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-[#072146] border border-purple-200 dark:border-purple-900/60 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded">
                        1. Entrada
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Radicación Digital
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>Emisión: <strong>{currentRecord.fechaEmisionOrigen}</strong></div>
                      <div>Recepción: <strong>{currentRecord.fechaRecepcion}</strong></div>
                      <div>Vía: {currentRecord.medioEntrega || 'Oficial'}</div>
                    </div>
                    {currentRecord.pdfDriveUrl && (
                      <a
                        href={currentRecord.pdfDriveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline pt-1"
                      >
                        <span>Ver PDF Entrada</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Estación 2: Operación SCMTP */}
                  <div className={`p-4 rounded-xl border space-y-2 relative ${
                    currentRecord.tareaScmtpTitulo
                      ? 'bg-emerald-50/70 dark:bg-[#072146] border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-[#041426] border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        currentRecord.tareaScmtpTitulo ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        2. Operación SCMTP
                      </span>
                      {currentRecord.tareaScmtpTitulo ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {currentRecord.tareaScmtpId || 'Sin Tarea Asignada'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      {currentRecord.tareaScmtpTitulo ? (
                        <>
                          <div className="font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                            {currentRecord.tareaScmtpTitulo}
                          </div>
                          <div>Asignado: <strong>{currentRecord.responsableAsignado}</strong></div>
                          <div>Cargo: {currentRecord.responsableCargo}</div>
                        </>
                      ) : (
                        <div className="italic text-slate-400 py-1">
                          Trámite de carácter informativo o resuelto directamente.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estación 3: Oficio de Respuesta */}
                  <div className={`p-4 rounded-xl border space-y-2 relative ${
                    oficio
                      ? 'bg-indigo-50/70 dark:bg-[#072146] border-indigo-300 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-[#041426] border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        oficio ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        3. Respuesta Formal
                      </span>
                      {oficio ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {oficio?.numeroOficio || 'En Elaboración'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      {oficio ? (
                        <>
                          <div>Firmante: <strong>{oficio.firmanteNombre}</strong></div>
                          <div>Estado: <span className="font-bold text-indigo-700 dark:text-indigo-300">{oficio.estadoFirma}</span></div>
                          <div>Fecha: {oficio.fechaCreacion}</div>
                        </>
                      ) : (
                        <div className="italic text-slate-400 py-1">
                          Pendiente de redacción de oficio formal.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estación 4: Despacho & Acuse */}
                  <div className={`p-4 rounded-xl border space-y-2 relative ${
                    oficio?.estadoFirma === 'DESPACHADO_CON_ACUSE'
                      ? 'bg-teal-50/70 dark:bg-[#072146] border-teal-300 dark:border-teal-800'
                      : 'bg-slate-50 dark:bg-[#041426] border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        oficio?.estadoFirma === 'DESPACHADO_CON_ACUSE' ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        4. Despacho & Acuse
                      </span>
                      {oficio?.estadoFirma === 'DESPACHADO_CON_ACUSE' ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Truck className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {oficio?.nroGuiaAcuse || 'Sin Despachar'}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      {oficio?.estadoFirma === 'DESPACHADO_CON_ACUSE' ? (
                        <>
                          <div>Receptor: <strong>{oficio.receptorAcuseNombre}</strong></div>
                          <div>Fecha Entrega: {oficio.fechaDespacho}</div>
                          <div className="text-teal-700 dark:text-teal-300 font-bold">✓ Expediente Cerrado</div>
                        </>
                      ) : (
                        <div className="italic text-slate-400 py-1">
                          Acuse de recibo en espera de retorno y digitalización.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Dictamen y Texto Formal if present */}
              {oficio && (
                <div className="p-5 bg-white dark:bg-[#072146] rounded-2xl border border-slate-200 dark:border-purple-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Extracto del Oficio Oficial de Salida ({oficio.numeroOficio})
                    </h4>
                    <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
                      Firmado por: {oficio.firmanteNombre}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line bg-slate-50 dark:bg-[#041426] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                    {oficio.cuerpoTexto}
                  </p>

                  {oficio.conclusionesTecnicas && (
                    <div className="text-xs bg-purple-50/50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40">
                      <strong className="text-purple-900 dark:text-purple-200 block mb-1">
                        Dictamen Técnico:
                      </strong>
                      <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line">
                        {oficio.conclusionesTecnicas}
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
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
