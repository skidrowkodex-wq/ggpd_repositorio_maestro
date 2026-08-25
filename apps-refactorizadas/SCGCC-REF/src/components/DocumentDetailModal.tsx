import React from 'react';
import { CorrespondenciaRecord } from '../types';
import { 
  X, 
  FileText, 
  ExternalLink, 
  Calendar, 
  User, 
  Building, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Share2,
  Download
} from 'lucide-react';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CorrespondenciaRecord | null;
  onDerivar: (record: CorrespondenciaRecord) => void;
  onStatusChange: (recordId: string, newStatus: any) => void;
  onOpenDraft?: (record: CorrespondenciaRecord) => void;
  onOpenBriefing?: (record: CorrespondenciaRecord) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onDerivar,
  onStatusChange,
  onOpenDraft,
  onOpenBriefing
}) => {
  if (!isOpen || !record) return null;

  const oficio = record.oficioRespuestaDetalle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#072146] w-full max-w-3xl rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <FileText className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-400/30">
                  {record.correlativo}
                </span>
                {record.proposito === 'INSTRUCCION_EJECUTIVA' && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm animate-pulse">
                    ⚡ INSTRUCCIÓN GGD
                  </span>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/30">
                  {record.direccion}
                </span>
              </div>
              <h2 className="text-base font-extrabold mt-1">{record.numeroDocumentoOrigen}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Asunto */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Asunto Oficial
            </h3>
            <p className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#041426] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {record.asunto}
            </p>
          </div>

          {/* Sintesis if present */}
          {record.descripcionSintesis && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Síntesis / Alcance
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {record.descripcionSintesis}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Remitente:</span>
              <div className="font-bold text-slate-800 dark:text-slate-100">{record.remitenteInstitucion}</div>
              {record.remitenteNombre && <div className="text-slate-500">{record.remitenteNombre}</div>}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Destinatario:</span>
              <div className="font-bold text-slate-800 dark:text-slate-100">{record.destinatarioPrincipal}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Fechas:</span>
              <div className="text-slate-700 dark:text-slate-300">Emisión: <span className="font-mono font-bold">{record.fechaEmisionOrigen}</span></div>
              <div className="text-slate-700 dark:text-slate-300">Recepción: <span className="font-mono font-bold">{record.fechaRecepcion}</span></div>
              {record.fechaLimiteRespuesta && (
                <div className="text-amber-600 dark:text-amber-400 font-bold mt-1">
                  SLA Límite: {record.fechaLimiteRespuesta}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Seguridad & Prioridad:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {record.nivelConfidencialidad}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-700">
                  {record.prioridad}
                </span>
              </div>
            </div>
          </div>

          {/* SCMTP Linked Task if active */}
          {record.tareaScmtpTitulo && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Compromiso SCMTP Vinculado: {record.tareaScmtpId}</span>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {record.tareaScmtpTitulo} — Responsable: <strong>{record.responsableAsignado}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Oficio de Salida / Respuesta Formal si existe */}
          {oficio && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Oficio de Respuesta Formal: {oficio.numeroOficio}</span>
                </div>
                <span className="text-[10px] font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded">
                  {oficio.estadoFirma}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                "{oficio.cuerpoTexto}"
              </p>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>Firmante: <strong>{oficio.firmanteNombre}</strong></span>
                {oficio.nroGuiaAcuse && (
                  <span className="font-mono text-emerald-600 font-bold">Guía: {oficio.nroGuiaAcuse}</span>
                )}
              </div>
            </div>
          )}

          {/* Drive PDF Attachment Banner */}
          {record.pdfDriveUrl && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {record.pdfFileName || 'Expediente Digitalizado en Google Drive'}
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                    Data Lake Oficial GGPD
                  </div>
                </div>
              </div>
              <a
                href={record.pdfDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                <span>Abrir en Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* State Update Control */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Actualizar Estado del Trámite
            </label>
            <div className="flex flex-wrap gap-2">
              {['RADICADO', 'EN_REVISION', 'ASIGNADO_CON_TAREA', 'BORRADOR_RESPUESTA', 'PENDIENTE_FIRMA', 'DESPACHADO_CON_ACUSE', 'RESPONDIDO', 'ARCHIVADO'].map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange(record.id, st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    record.estadoTramite === st
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#041426] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] text-slate-400 font-mono">
            ID: {record.id} • Actualizado: {record.updatedAt}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenBriefing && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBriefing(record);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-sm"
              >
                Ficha 360°
              </button>
            )}

            {onOpenDraft && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDraft(record);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {oficio ? 'Editar Oficio Respuesta' : 'Redactar Respuesta'}
              </button>
            )}

            {!record.tareaScmtpId && (
              <button
                onClick={() => {
                  onClose();
                  onDerivar(record);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Derivar SCMTP
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
