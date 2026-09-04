import React, { useState, useEffect } from 'react';
import { DocumentItem } from '../types/sigi';
import { useAuth } from '../context/AuthContext';
import { logSecurityAuditEvent } from '../utils/securityUtils';
import { INITIAL_INSTITUTIONAL_USERS } from '../mockData/usersCatalog';
import { fetchDocumentsFromInsForge } from '../services/documentsService';
import { Cloud, Download, Lock, FileSpreadsheet, FileText, CheckCircle2, ExternalLink, FolderGit2, Inbox, Loader2 } from 'lucide-react';

export const DocumentViewer: React.FC = () => {
  const { session } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDocumentsFromInsForge()
      .then((docs) => {
        if (cancelled) return;
        setDocuments(docs);
        setSelectedDoc(docs.length > 0 ? docs[0] : null);
      })
      .catch(() => {
        if (cancelled) return;
        setDocuments([]);
        setSelectedDoc(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canDownload = selectedDoc ? selectedDoc.downloadAllowedRoles.includes(session.role) : false;

  const matchedUser = INITIAL_INSTITUTIONAL_USERS.find(u => 
    u.username.toLowerCase() === (session.name || '').toLowerCase() ||
    (session.userCode && u.username === session.userCode)
  );
  const isRoleAuthorized = session.role === 'ADMINISTRADOR' || session.role === 'GERENCIA';
  const hasDrivePermission = isRoleAuthorized || (matchedUser?.permissions?.gdriveRepo ?? false);

  const handleOpenDriveFolder = () => {
    logSecurityAuditEvent({
      eventType: 'GDRIVE_ACCESS_SUCCESS',
      userId: session.userCode || 'usr-session',
      username: session.name || 'Usuario',
      fullName: session.name,
      targetApp: 'Repositorio Google Drive Corporativo',
      details: 'Apertura de la carpeta raíz Google Drive desde el Visor de Documentos (Eje 4).',
      stateCode: session.stateCode,
    });
    window.open('https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#00f2fe]/80 transition-all duration-300">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
            <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold flex items-center space-x-1.5">
              <Cloud className="h-4 w-4 text-emerald-400" />
              <span>Eje 4 · Repositorio & Documentación</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Visor Incrustado de Documentación Nube</h2>
          <p className="text-xs text-cyan-100/90 mt-1 font-medium">
            Visualización integrada de archivos Google Drive / Repositorios con control granular de descargas por perfil.
          </p>
        </div>

        {/* User Actions & Privilege Badge */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {hasDrivePermission ? (
            <button
              onClick={handleOpenDriveFolder}
              className="flex items-center space-x-1.5 rounded-2xl px-4 py-2.5 bg-white hover:bg-cyan-50 text-[#072146] text-xs font-black shadow-md hover:scale-105 transition-all"
            >
              <Cloud className="h-4 w-4 text-[#002b49]" />
              <span>Carpeta Raíz Drive (Nube)</span>
              <ExternalLink className="h-3.5 w-3.5 ml-0.5 text-[#002b49]" />
            </button>
          ) : (
            <span className="flex items-center space-x-1.5 rounded-2xl px-3.5 py-2 bg-white/10 text-cyan-200 border border-white/20 text-xs font-mono font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>Drive Restringido</span>
            </span>
          )}

          <div className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 border text-xs font-mono font-bold shadow-xs shrink-0 ${
            canDownload
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
          }`}>
            {canDownload ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <Lock className="h-4 w-4 text-amber-400 shrink-0" />}
            <span>{canDownload ? 'Descarga Permitida (Rol Nivel 2/3)' : 'Modo Lectura Protegida'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Document List + Embed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document Selector List */}
        <div className="space-y-3 min-w-0">
          <h3 className="text-xs font-extrabold text-[#002b49] dark:text-slate-400 uppercase tracking-wider px-1">
            Catálogo de Documentos Institucionales
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081427] text-slate-500 dark:text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#002b49] dark:text-[#00f2fe]" />
              <span className="mt-3 text-xs font-bold">Cargando documentos desde InsForge...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081427] text-slate-500 dark:text-slate-400">
              <Inbox className="h-8 w-8 text-[#002b49] dark:text-[#00f2fe]" />
              <span className="mt-3 text-xs font-bold">No hay documentos institucionales</span>
              <span className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                La biblioteca se poblará cuando existan registros en InsForge (institutional_documents / technical_documents).
              </span>
            </div>
          ) : (
            documents.map((doc: DocumentItem) => {
              const isSelected = selectedDoc?.id === doc.id;
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
                    <span className="truncate">Categoría: <strong className="text-slate-900 dark:text-white">{doc.category || 'General'}</strong></span>
                    <span className="shrink-0 font-mono text-[10px] ml-2">{doc.updatedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Embedded Viewer Container */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#081224] p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 min-w-0 overflow-hidden">
          
          {!selectedDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
              <Inbox className="h-10 w-10 text-[#002b49] dark:text-[#00f2fe]" />
              <span className="mt-3 text-sm font-bold">No hay documento seleccionado</span>
              <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">Seleccione un documento del catálogo para visualizarlo.</span>
            </div>
          ) : (
          <>
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
          </>
          )}

        </div>

      </div>

    </div>
  );
};
