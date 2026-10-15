import React, { useState } from 'react';
import { VehicleRecord, IngestionValidationResult } from '../types/fleet';
import { parseExcelOrCsvFile, downloadEmptyTemplate } from '../services/excelService';
import { validateBatchRecords } from '../services/validationService';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ImportModalProps {
  existingVehicles: VehicleRecord[];
  onImportSuccess: (newVehicles: VehicleRecord[]) => void;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  existingVehicles,
  onImportSuccess,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<IngestionValidationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);
    setParseError(null);
    setValidationResult(null);

    try {
      const records = await parseExcelOrCsvFile(file);
      if (records.length === 0) {
        setParseError('El archivo no contiene filas de datos válidas después del encabezado.');
        setIsProcessing(false);
        return;
      }

      const valResult = validateBatchRecords(records, existingVehicles);
      setValidationResult(valResult);
    } catch (err: any) {
      setParseError(`Error al procesar el archivo: ${err?.message || 'Formato no compatible'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = (onlyValid: boolean = false) => {
    if (!validationResult) return;

    // Filter valid rows or all
    const validRowsToInsert: VehicleRecord[] = [];
    const existingVehicleNums = new Set(existingVehicles.map(v => v.numero_vehiculo.toUpperCase()));

    validationResult.registros_procesados.forEach((row, idx) => {
      const fila = idx + 2;
      const rowErrors = validationResult.errores.filter(e => e.fila === fila && e.tipo === 'error');

      if (rowErrors.length === 0 || !onlyValid) {
        // Build valid vehicle record with fallbacks
        const rec: VehicleRecord = {
          id: `veh-import-${Date.now()}-${idx}`,
          estado: (row.estado as any) || 'ACTIVO',
          numero_vehiculo: (row.numero_vehiculo || `S-NUM-${idx + 1}`).trim().toUpperCase(),
          marca_vehiculo: row.marca_vehiculo || 'TOYOTA',
          tipo_vehiculo: row.tipo_vehiculo || 'CAMIONETA',
          unidad_asignada: row.unidad_asignada || '',
          centro_servicios: row.centro_servicios || '',
          condicion_actual: (row.condicion_actual as any) || 'BUENO',
          mantenimiento_preventivo: (row.mantenimiento_preventivo as any) || 'AL DIA',

          pastillas: (row.pastillas as any) || 'BUENO',
          bandas: (row.bandas as any) || 'BUENO',
          bomba_freno: (row.bomba_freno as any) || 'BUENO',
          disco: (row.disco as any) || 'BUENO',
          plato: (row.plato as any) || 'BUENO',
          collarin: (row.collarin as any) || 'BUENO',
          bombin_superior: (row.bombin_superior as any) || 'BUENO',
          bombin_inferior: (row.bombin_inferior as any) || 'BUENO',
          bateria: (row.bateria as any) || 'BUENO',
          bobina: (row.bobina as any) || 'BUENO',
          bujias: (row.bujias as any) || 'BUENO',
          cauchos: (row.cauchos as any) || 'BUENO',
          correas_motor: (row.correas_motor as any) || 'BUENO',
          luces_delanteras: (row.luces_delanteras as any) || 'BUENO',
          parabrisas: (row.parabrisas as any) || 'BUENO',
          tren_delantero: (row.tren_delantero as any) || 'BUENO',
          ballesta: (row.ballesta as any) || 'BUENO',
          crucetas: (row.crucetas as any) || 'BUENO',
          amortiguadores: (row.amortiguadores as any) || 'BUENO',
          radiador: (row.radiador as any) || 'BUENO',
          motor: (row.motor as any) || 'BUENO',

          cant_total_reparaciones: Number(row.cant_total_reparaciones) || 0,
          cant_cauchos: Number(row.cant_cauchos) || 0,
          medidas_caucho: row.medidas_caucho || '',
          cantidad_baterias: Number(row.cantidad_baterias) || 1,
          caracteristicas_bateria: row.caracteristicas_bateria || '',

          vehiculo_recuperado: (row.vehiculo_recuperado as any) || 'NO',
          fecha_recuperacion: row.fecha_recuperacion || '',
          gerencia_origen: row.gerencia_origen || '',
          vehiculo_otra_gerencia_devuelto: (row.vehiculo_otra_gerencia_devuelto as any) || 'NO',
          fecha_entrega_gerencia_origen: row.fecha_entrega_gerencia_origen || '',

          observacion: row.observacion || '',
          certificar_tipo_vehiculo: row.certificar_tipo_vehiculo || '',
          prioridad_recuperacion: (row.prioridad_recuperacion as any) || 'MEDIA',

          nombre_personal_responsable: row.nombre_personal_responsable || '',
          cedula_personal_responsable: row.cedula_personal_responsable || '',
          telefono_personal_responsable: row.telefono_personal_responsable || '',
          fecha_registro: new Date().toISOString().split('T')[0]
        };

        validRowsToInsert.push(rec);
      }
    });

    onImportSuccess(validRowsToInsert);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border-0 sm:border border-slate-200 sm:rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Ingesta de Archivos (FLOTA.xlsx / CSV)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
                Verificación estructural contra las 45 columnas (A:AS) y reglas de integridad.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* File Picker Zone */}
          {!validationResult && (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="font-semibold text-sm text-slate-900">
                Arrastra tu archivo Excel o haz clic para examinar
              </div>
              <div className="text-slate-500 mt-1">
                Soporta formato .xlsx (hoja FLOTA) o archivos .csv
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs">
                {isProcessing ? 'Analizando estructura...' : 'Seleccionar archivo local'}
              </div>
            </div>
          )}

          {parseError && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de lectura:</strong> {parseError}
              </div>
            </div>
          )}

          {/* Validation Report View */}
          {validationResult && (
            <div className="space-y-5">
              {/* Report Summary Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Filas Procesadas</div>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {validationResult.total_filas}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <div className="text-emerald-700 text-[11px] font-medium">Filas Válidas</div>
                  <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
                    {validationResult.filas_validas}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="text-slate-700 text-[11px] font-medium">Con Observaciones</div>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {validationResult.filas_con_errores}
                  </div>
                </div>
              </div>

              {/* Errors & Warnings List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                  <span>Diagnóstico Detallado por Fila y Columna</span>
                  <span className="font-mono text-slate-500 font-normal">
                    {validationResult.errores.length} observaciones detectadas
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {validationResult.errores.length === 0 ? (
                    <div className="p-6 text-center text-emerald-700 font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>¡Estructura 100% válida! Todos los registros cumplen con las 45 columnas y tipos de datos.</span>
                    </div>
                  ) : (
                    validationResult.errores.map((err, i) => (
                      <div key={i} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">
                              Fila {err.fila} · {err.vehiculo}
                            </span>
                            <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-[10px] text-slate-600">
                              Col {err.columna_excel} ({err.campo})
                            </span>
                          </div>
                          <div className="text-slate-600">{err.mensaje}</div>
                        </div>

                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          err.tipo === 'error' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {err.tipo === 'error' ? 'AVISO' : 'ADVERTENCIA'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Download Official Template Link */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-200">
            <span className="text-blue-900">
              ¿Necesitas la plantilla vacía con los encabezados exactos A:AS?
            </span>
            <button
              onClick={() => downloadEmptyTemplate()}
              className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold underline text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla Oficial</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setValidationResult(null);
              setSelectedFile(null);
            }}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            {validationResult ? 'Cargar otro archivo' : 'Cerrar'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            {validationResult && (
              <>
                {validationResult.filas_validas > 0 && (
                  <button
                    onClick={() => handleConfirmImport(true)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm cursor-pointer hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #0b3d2e 0%, #1a5f47 100%)',
                      border: '1px solid #c9a227'
                    }}
                  >
                    <span>Importar {validationResult.filas_validas} Registros Válidos</span>
                    <ArrowRight className="w-4 h-4 text-[#c9a227]" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
