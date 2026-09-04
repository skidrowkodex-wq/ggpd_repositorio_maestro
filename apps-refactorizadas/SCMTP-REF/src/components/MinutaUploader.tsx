import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  X,
  Target,
  Users,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { MinutaReunion, TareaCompromiso, PendienteArea, UserProfile } from '../types';

interface MinutaUploaderProps {
  onImportMinuta: (minuta: MinutaReunion, compromisos: TareaCompromiso[], pendientes: PendienteArea[]) => void;
  onClose: () => void;
  currentProfile?: UserProfile;
}

export const MinutaUploader: React.FC<MinutaUploaderProps> = ({
  onImportMinuta,
  onClose,
  currentProfile,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    minuta: MinutaReunion;
    compromisos: TareaCompromiso[];
    pendientes: PendienteArea[];
  } | null>(null);

  const [dragActive, setDragActive] = useState(false);

  // File drop/selection handler
  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    setExtractedData(null);

    try {
      const fileName = file.name;
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type || 'application/pdf';

        const response = await fetch('/api/parse-minuta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64File: base64Data,
            mimeType,
            fileName,
          }),
        });

        const resData = await response.json();

        if (!resData.success || !resData.minuta) {
          throw new Error(resData.error || resData.details || 'Error procesando la minuta');
        }

        const rawMinuta = resData.minuta;

        // Construct Minuta object
        const newMinuta: MinutaReunion = {
          id: `minuta-${Date.now()}`,
          numero: rawMinuta.numero || 'S/N',
          fecha: rawMinuta.fecha || 'Sin fecha',
          fechaISO: rawMinuta.fechaISO || new Date().toISOString().split('T')[0],
          hora: rawMinuta.hora || '10:00 a.m.',
          lugar: rawMinuta.lugar || 'CARACAS',
          coordinador: rawMinuta.coordinador || 'ADRIAN CORREA',
          unidadOrganizativa: rawMinuta.unidadOrganizativa || 'GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN',
          objetivo: rawMinuta.objetivo || '',
          participantes: rawMinuta.participantes || [],
          compromisosCount: (rawMinuta.compromisos || []).length,
          pendientesCount: (rawMinuta.pendientes || []).length,
          proximaFechaSeguimiento: rawMinuta.proximaFechaSeguimiento || '14/08/2026',
          elaboradoPor: rawMinuta.elaboradoPor || 'IA Gemini Google',
          nombreArchivo: fileName,
        };

        // Construct Compromisos array
        const newCompromisos: TareaCompromiso[] = (rawMinuta.compromisos || []).map((c: any, index: number) => ({
          id: `comp-ai-${Date.now()}-${index}`,
          minutaNumero: newMinuta.numero,
          minutaFecha: newMinuta.fecha,
          responsable: c.responsable || 'Gerencia de Planificación',
          compromiso: c.compromiso,
          plazoText: c.plazoText || 'Pendiente',
          plazoFechaISO: c.plazoFechaISO || '2026-08-30',
          vinculacionOrigen: c.vinculacionOrigen || 'Reunión Operativa',
          estado: 'En Proceso',
          prioridad: (c.prioridad as any) || 'Alta',
          avancePorcentaje: 0,
          areaGestion: c.areaGestion || 'Automatización',
          observaciones: c.observaciones || '',
          historialAvances: [
            {
              id: `h-ai-${Date.now()}-${index}`,
              fecha: new Date().toISOString().split('T')[0],
              nota: 'Compromiso extraído automáticamente desde la minuta con IA.',
              porcentaje: 0,
              usuario: currentProfile ? currentProfile.name : 'Procesador IA Gemini',
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // Construct Pendientes array
        const newPendientes: PendienteArea[] = (rawMinuta.pendientes || []).map((p: any, index: number) => ({
          id: `pend-ai-${Date.now()}-${index}`,
          area: p.area || 'General',
          pendiente: p.pendiente,
          dependeDe: p.dependeDe || 'Gerencia',
          estado: 'Pendiente',
          observacion: p.observacion || '',
        }));

        setExtractedData({
          minuta: newMinuta,
          compromisos: newCompromisos,
          pendientes: newPendientes,
        });

        setLoading(false);
      };

      reader.onerror = () => {
        throw new Error('Error al leer el archivo en el navegador');
      };

      reader.readAsDataURL(file);

    } catch (err: any) {
      console.error('Error en extracción:', err);
      setErrorMsg(err.message || 'Ocurrió un error al procesar el archivo con la IA Gemini');
      setLoading(false);
    }
  };

  // Confirm and Import
  const handleConfirmImport = () => {
    if (!extractedData) return;
    onImportMinuta(extractedData.minuta, extractedData.compromisos, extractedData.pendientes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <div className="p-2.5 bg-red-50 text-[#E30613] rounded-xl border border-red-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#002B49] text-base">Cargar Minuta de Reunión CORPOELEC (IA Gemini)</h3>
              <p className="text-xs text-slate-500 font-normal">
                Lectura automática y generación instantánea de tareas y compromisos asignados
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Badge Notice */}
        {currentProfile && (
          <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Shield className="w-4 h-4 text-[#002B49]" />
              <span>Perfil Activo de Carga: <strong>{currentProfile.name}</strong> ({currentProfile.cargo})</span>
            </div>
            <span className="bg-[#002B49] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {currentProfile.role}
            </span>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        {!extractedData && !loading && (
          <div className="space-y-4">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center space-y-3 transition-colors cursor-pointer ${
                dragActive ? 'border-[#E30613] bg-red-50/50' : 'border-slate-300 hover:border-[#002B49] bg-slate-50/50'
              }`}
            >
              <div className="p-3.5 bg-red-100 text-[#E30613] rounded-full w-12 h-12 mx-auto flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  Arrastra tu archivo PDF o Minuta aquí
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  El sistema detectará la fecha incorporada en el nombre (ej. MINUTA_20260629_26-0002.pdf) e incorporará las tareas al histórico.
                </p>
              </div>

              <label className="inline-block bg-[#002B49] hover:bg-slate-900 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs">
                Seleccionar Archivo PDF
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#E30613] flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#E30613] animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-[#002B49] text-sm">Analizando Minuta CORPOELEC con IA Gemini...</h4>
              <p className="text-xs text-slate-500 mt-1">
                Extrayendo número de minuta, fecha en nombre, coordinadores, compromisos por responsable y pendientes por área...
              </p>
            </div>
          </div>
        )}

        {/* Preview Extracted Data */}
        {extractedData && (
          <div className="space-y-4">
            
            <div className="bg-[#002B49] text-white p-4.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="bg-[#E30613] font-black text-[11px] px-2.5 py-0.5 rounded uppercase">
                  Minuta #{extractedData.minuta.numero}
                </span>
                <span className="text-cyan-300 text-xs font-bold">
                  Fecha: {extractedData.minuta.fecha}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-white">
                {extractedData.minuta.unidadOrganizativa}
              </h4>

              <p className="text-xs text-slate-200 line-clamp-2">
                {extractedData.minuta.objetivo}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="font-black text-lg">{extractedData.compromisos.length}</div>
                <div className="text-[11px] text-emerald-800 font-bold">Compromisos de Reunión Extraídos</div>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900">
                <div className="font-black text-lg">{extractedData.pendientes.length}</div>
                <div className="text-[11px] text-amber-800 font-bold">Pendientes por Área Clasificados</div>
              </div>
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <button
                onClick={() => setExtractedData(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cargar Otro Archivo
              </button>

              <button
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-[#E30613] hover:bg-red-700 text-white rounded-xl font-extrabold text-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Importar Minuta al Sistema</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

