import React, { useState, useEffect } from 'react';
import { 
  FolderSync, 
  CloudDownload, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  X, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Download,
  Database
} from 'lucide-react';
import { DriveFileItem, MinutaReunion, TareaCompromiso, PendienteArea } from '../types';

interface GoogleDriveSyncModalProps {
  importedMinutas: MinutaReunion[];
  onImportFromDrive: (minuta: MinutaReunion, compromisos: TareaCompromiso[], pendientes: PendienteArea[]) => void;
  onClose: () => void;
}

const DEFAULT_FOLDER_ID = '1QJhCCc5PwCARr41WePCfEHa_CrZslTZ6';
const ACCOUNT_EMAIL = 'bk.ggpd.corpoelec@gmail.com';

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  importedMinutas,
  onImportFromDrive,
  onClose,
}) => {
  const [folderId, setFolderId] = useState<string>(DEFAULT_FOLDER_ID);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingFileId, setSyncingFileId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDriveFiles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/drive/files?folderId=${encodeURIComponent(folderId)}`);
      const data = await res.json();
      if (data.success && data.files) {
        setFiles(data.files);
      } else {
        setErrorMsg('No se pudieron listar los archivos de Google Drive');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error de conexión con la API de Google Drive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveFiles();
  }, [folderId]);

  const handleSyncFile = async (file: DriveFileItem) => {
    setSyncingFileId(file.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/drive/sync-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.name,
        })
      });

      const data = await res.json();
      if (data.success && data.minuta) {
        onImportFromDrive(
          data.minuta,
          data.minuta.compromisos || [],
          data.minuta.pendientes || []
        );
        setSuccessMsg(`¡Minuta ${file.name} sincronizada e importada con éxito desde Google Drive!`);
      } else {
        setErrorMsg(data.error || 'Error al procesar el PDF de Google Drive');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error de conexión al sincronizar la minuta desde la nube');
    } finally {
      setSyncingFileId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3.5">
          <div className="flex items-center space-x-3 text-slate-900">
            <div className="p-2.5 bg-blue-100 text-[#002B49] rounded-xl border border-blue-200">
              <FolderSync className="w-6 h-6 text-[#002B49]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#002B49] text-base flex items-center space-x-2">
                <span>Sincronización Directa de Google Drive</span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Directorio en la nube: <strong className="text-slate-800 font-mono">{folderId}</strong> ({ACCOUNT_EMAIL})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Box */}
        <div className="bg-gradient-to-r from-blue-900 via-[#002B49] to-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Cuenta Institucional Conectada: {ACCOUNT_EMAIL}</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Las nuevas minutas PDF subidas a la carpeta de Google Drive son procesadas e incorporadas automáticamente con Inteligencia Artificial Gemini.
            </p>
          </div>

          <button
            onClick={fetchDriveFiles}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-white/20 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-xl text-xs font-medium flex items-center space-x-2">
            <X className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drive Files List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-[#002B49] text-xs uppercase tracking-wider">
              Minutas PDF Detectadas en el Directorio ({files.length})
            </h4>
            <a 
              href={`https://drive.google.com/drive/folders/${folderId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-700 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Abrir Carpeta en Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {loading ? (
            <div className="py-8 text-center space-y-2">
              <Loader2 className="w-7 h-7 text-[#002B49] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Consultando el directorio {folderId} en Google Drive...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs border border-dashed rounded-xl">
              No se encontraron archivos PDF nuevos en el directorio.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {files.map((file) => {
                const isImported = importedMinutas.some(m => 
                  m.nombreArchivo === file.name || m.driveFileId === file.id
                );
                const isSyncing = syncingFileId === file.id;

                return (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 text-[#E30613] rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-2">
                          <span>{file.name}</span>
                          {isImported && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sincronizado</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-3">
                          <span>Fecha creación: {file.createdTime ? new Date(file.createdTime).toLocaleDateString('es-VE') : 'Reciente'}</span>
                          <span>•</span>
                          <span>{file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'PDF'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSyncFile(file)}
                        disabled={isSyncing}
                        className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer text-xs shadow-xs ${
                          isImported 
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                            : 'bg-[#002B49] hover:bg-slate-900 text-white'
                        }`}
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sincronizando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{isImported ? 'Re-Sincronizar' : 'Sincronizar e Importar'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info on PDF Database Storage */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-[#002B49]">
            <Database className="w-4 h-4 text-[#002B49]" />
            <span>Almacenamiento e Integración con BD (Supabase / Postgres)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Las minutas sincronizadas desde Google Drive quedan respaldadas en la base de datos en formato binario/Base64 con su metadata. Puedes editarlas o descargarlas en cualquier momento en PDF desde las fichas de minuta.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Sincronizador
          </button>
        </div>

      </div>
    </div>
  );
};
