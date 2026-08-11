import React, { useState } from 'react';
import { INITIAL_DOCUMENTS } from '../mockData/portalData';
import { DocumentItem } from '../types/sigi';
import { useAuth } from '../context/AuthContext';
import { Cloud, Download, Lock, FileSpreadsheet, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export const DocumentViewer: React.FC = () => {
  const { session } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(INITIAL_DOCUMENTS[0]);

  const canDownload = selectedDoc.downloadAllowedRoles.includes(session.role);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#112240] dark:via-[#0a192f] dark:to-[#112240] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Eje 4: Visor Incrustado de Documentación Nube</h2>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Visualización integrada de archivos Google Drive / Repositorios con control granular de descargas por perfil.
          </p>
        </div>

        {/* User Download Privilege Badge */}
        <div className={`flex items-center space-x-2 rounded-xl px-3.5 py-2 border text-xs font-bold shadow-xs shrink-0 ${
          canDownload
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
            : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
        }`}>
          {canDownload ? <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" /> : <Lock className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />}
          <span>{canDownload ? 'Descarga Permitida (Rol Nivel 2/3)' : 'Modo Lectura Protegida'}</span>
        </div>
      </div>

      {/* Grid: Document List + Embed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document Selector List */}
        <div className="space-y-3 min-w-0">
          <h3 className="text-xs font-extrabold text-[#002b49] dark:text-slate-400 uppercase tracking-wider px-1">
            Catálogo de Documentos Institucionales
          </h3>

          {INITIAL_DOCUMENTS.map((doc: DocumentItem) => {
            const isSelected = selectedDoc.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all shadow-sm overflow-hidden ${
                  isSelected
                    ? 'border-[#002b49] bg-blue-50/90 dark:border-[#00f2fe] dark:bg-[#112240]'
                    : 'bg-white dark:bg-[#081427] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between min-w-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1 overflow-hidden">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800 text-[#002b49] dark:text-[#00f2fe] shrink-0">
                      {doc.fileType === 'spreadsheet' ? <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <FileText className="h-5 w-5 text-[#002b49] dark:text-[#00f2fe]" />}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <span className="text-[10px] font-mono font-bold text-[#002b49] dark:text-cyan-300 block truncate" title={doc.code}>
                        {doc.code}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/60 pt-2 font-medium">
                  <span className="truncate">Estado: <strong className="text-slate-900 dark:text-white">{doc.stateCode}</strong></span>
                  <span className="shrink-0 font-mono text-[10px] ml-2">{doc.updatedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Embedded Viewer Container */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#081224] p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 min-w-0 overflow-hidden">
          
          {/* Document Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 min-w-0">
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-[11px] font-mono font-bold text-[#002b49] dark:text-[#00f2fe] block truncate">{selectedDoc.code}</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{selectedDoc.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">Publicado por: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc.author}</span></p>
            </div>

            {/* Download Button */}
            {canDownload ? (
              <a
                href={selectedDoc.driveEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl bg-[#002b49] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#00b4d8] dark:text-[#0a192f] px-5 py-2.5 text-xs font-black shadow-md hover:scale-105 transition-all shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Archivo</span>
              </a>
            ) : (
              <button
                disabled
                className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700 shrink-0"
                title="Descarga restringida para su nivel de acceso"
              >
                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Descarga Bloqueada (Lectura)</span>
              </button>
            )}
          </div>

          {/* Embedded iFrame Viewer Canvas */}
          <div className="relative w-full h-[450px] rounded-2xl bg-slate-50 dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
            
            {/* Watermark for Operador / Read-only */}
            {!canDownload && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-15">
                <div className="rotate-[-25deg] text-center">
                  <span className="text-4xl sm:text-6xl font-black text-[#002b49] dark:text-[#00f2fe] uppercase tracking-widest block">
                    SOLO LECTURA
                  </span>
                  <span className="text-lg font-bold text-slate-800 dark:text-white block mt-2">
                    CORPOELEC GGPD — {session.userCode}
                  </span>
                </div>
              </div>
            )}

            {/* Simulating Document View Canvas */}
            <div className="w-full h-full p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-[#002b49] dark:text-[#00f2fe]">VISOR DOCUMENTAL INCRUSTADO - DRIVE CLOUD</span>
                <span className="text-[10px] text-slate-500 font-semibold">Documento Verificado ISO 27001</span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="bg-white dark:bg-[#112240] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Resumen de Contenido del Archivo Institucional</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    Este documento contiene los protocolos oficiales de gobierno de información, parámetros de deduplicación de activos para SCTIS v2.0 y directivas de migración de reportes operativos desde canales informales (WhatsApp) hacia la suite en la Nube.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#112240] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Estado Aplicable</span>
                    <p className="font-extrabold text-[#d97706] dark:text-[#ffd700] mt-0.5">{selectedDoc.stateCode}</p>
                  </div>
                  <div className="bg-white dark:bg-[#112240] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Nivel de Seguridad</span>
                    <p className="font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">Uso Interno Reservado</p>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <a
                    href={selectedDoc.driveEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs text-[#002b49] dark:text-[#00f2fe] font-black hover:underline"
                  >
                    <span>Abrir documento en ventana completa de Google Drive</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Notice */}
          <div className="text-center text-[10px] text-slate-500 font-semibold">
            Control de descargas administrado dinámicamente según la Directiva COBIT MEA02.
          </div>

        </div>

      </div>

    </div>
  );
};
