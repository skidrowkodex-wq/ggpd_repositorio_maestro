import React, { useState, useEffect } from 'react';
import { 
  DocumentIngestType, 
  EquipmentRecord, 
  MaterialLine, 
  PlanExecutionLine, 
  ISO8000Report, 
  IngestWindowStatus 
} from '../../types';
import { useAuth } from '../../lib/authContext';
import { 
  parseExcelWorkbook, 
  generateSampleExcel, 
  getSubmissionWindowStatus,
  ParseResult 
} from '../../lib/excel-parser';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Info,
  Download,
  Database,
  Calendar,
  Layers,
  FileText,
  Clock,
  AlertCircle,
  X,
  FileCheck2
} from 'lucide-react';

interface ExcelIngestionTabProps {
  onIngestSuccess: () => void;
}

export const ExcelIngestionTab: React.FC<ExcelIngestionTabProps> = ({ onIngestSuccess }) => {
  const { user } = useAuth();
  
  // Selected or active upload mode
  const [activeCardType, setActiveCardType] = useState<DocumentIngestType>('LEV');
  
  const [fileName, setFileName] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  
  // Window Submission State
  const windowInfo = getSubmissionWindowStatus();
  
  // Modal for Extemporaneous Justification
  const [showExtemporaneousModal, setShowExtemporaneousModal] = useState<boolean>(false);
  const [delayReasonInput, setDelayReasonInput] = useState<string>('');
  const [delayReasonError, setDelayReasonError] = useState<string>('');

  const handleFileUpload = (file: File, forcedType?: DocumentIngestType) => {
    setFileName(file.name);
    setIsProcessing(true);
    setSaveSuccessMsg('');
    setParsedResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseExcelWorkbook(file, buffer, forcedType);
        setParsedResult(result);
        if (forcedType) {
          setActiveCardType(forcedType);
        } else {
          setActiveCardType(result.docType);
        }
      } catch (err: any) {
        alert('Error al leer el archivo Excel: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInitiateSave = () => {
    if (!parsedResult || parsedResult.equipmentRecords.length === 0) return;

    if (windowInfo.isExtemporaneous) {
      setDelayReasonInput('');
      setDelayReasonError('');
      setShowExtemporaneousModal(true);
    } else {
      executeSaveDatabase('');
    }
  };

  const executeSaveDatabase = async (reasonText: string) => {
    if (!parsedResult) return;
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const res = await fetch('/api/equipment/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          records: parsedResult.equipmentRecords,
          docType: parsedResult.docType,
          windowStatus: windowInfo.status,
          delayReason: reasonText
        })
      });
      const data = await res.json();

      if (data.success) {
        setSaveSuccessMsg(
          `¡Ingesta masiva de Plantilla ${parsedResult.docType === 'LEV' ? 'LEV_EI_SE (Levantamiento)' : 'PLA_EI_SE (Plan de Acción)'} exitosa! Se guardaron ${data.imported_count} registros en Supabase Cloud (esquema scei).`
        );
        setShowExtemporaneousModal(false);
        onIngestSuccess();
      } else {
        alert('Error en la ingesta: ' + data.error);
      }
    } catch (err: any) {
      alert('Error de conexión al guardar los datos: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmExtemporaneousModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayReasonInput.trim() || delayReasonInput.trim().length < 10) {
      setDelayReasonError('Debe ingresar un motivo explicativo de al menos 10 caracteres para justificar la carga fuera de ventana.');
      return;
    }
    executeSaveDatabase(delayReasonInput.trim());
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Submission Window Alert Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Ingesta Dual y Multi-Plantilla (LEV_EI_SE & PLA_EI_SE)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Módulo normativo de procesamiento masivo con auto-detección bajo norma <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs">GGPD-SGM-INS-005</code> e ISO 8000.
          </p>
        </div>

        {/* Window Indicator */}
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs shadow-sm ${
          windowInfo.status === 'EN_TIEMPO' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : windowInfo.status === 'PRORROGA_JUEVES'
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        }`}>
          <Clock className={`w-5 h-5 shrink-0 ${
            windowInfo.status === 'EN_TIEMPO' ? 'text-emerald-600 dark:text-emerald-400' :
            windowInfo.status === 'PRORROGA_JUEVES' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          }`} />
          <div>
            <div className="font-bold uppercase tracking-wide flex items-center gap-1.5">
              <span>Hoy: {windowInfo.dayName}</span>
              <span className="opacity-60">•</span>
              <span>Ventana: {windowInfo.status.replace('_', ' ')}</span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">{windowInfo.message}</p>
          </div>
        </div>
      </div>

      {/* Dual Template Cards & Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: LEV_EI_SE */}
        <div className={`p-6 rounded-2xl border transition-all relative ${
          activeCardType === 'LEV'
            ? 'bg-white dark:bg-slate-900 border-emerald-500/80 shadow-lg ring-2 ring-emerald-500/20'
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Plantilla 1</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">LEV_EI_SE (Levantamiento)</h3>
              </div>
            </div>

            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Pestaña 1 & 2
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Reporte de equipos fuera de servicio directo en subestaciones y materiales requeridos vinculados por secuencia.
          </p>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 mb-5">
            <p className="font-mono text-slate-800 dark:text-slate-300 font-semibold">[GEOGRAFÍA]_[AÑO]_GGPD_LEV_EI_SE_[VERSIÓN].xlsx</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">Ejemplo: <code className="text-emerald-600 dark:text-emerald-400">TAC_2026_GGPD_LEV_EI_SE_V01.xlsx</code></p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'LEV');
                  }
                }}
              />
              <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <Upload className="w-4 h-4" />
                <span>Cargar LEV_EI_SE</span>
              </div>
            </label>

            <button
              type="button"
              onClick={() => generateSampleExcel('LEV')}
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Descargar Plantilla Oficial LEV_EI_SE"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Ejemplo</span>
            </button>
          </div>
        </div>

        {/* Card 2: PLA_EI_SE */}
        <div className={`p-6 rounded-2xl border transition-all relative ${
          activeCardType === 'PLA'
            ? 'bg-white dark:bg-slate-900 border-sky-500/80 shadow-lg ring-2 ring-sky-500/20'
            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 block">Plantilla 2</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">PLA_EI_SE (Plan de Acción)</h3>
              </div>
            </div>

            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Plan & Presupuesto
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Planificación presupuestaria en Euros (€), metas de sustitución, cronograma de inicio/fin y responsable.
          </p>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 mb-5">
            <p className="font-mono text-slate-800 dark:text-slate-300 font-semibold">[GEOGRAFÍA]_[AÑO]_GGPD_PLA_EI_SE_[VERSIÓN].xlsx</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">Ejemplo: <code className="text-sky-600 dark:text-sky-400">TAC_2026_GGPD_PLA_EI_SE_V01.xlsx</code></p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'PLA');
                  }
                }}
              />
              <div className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition">
                <Upload className="w-4 h-4" />
                <span>Cargar PLA_EI_SE</span>
              </div>
            </label>

            <button
              type="button"
              onClick={() => generateSampleExcel('PLA')}
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Descargar Plantilla Oficial PLA_EI_SE"
            >
              <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Ejemplo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Detection Universal Dropzone Banner */}
      <div className="bg-slate-100 dark:bg-slate-900/90 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500/80 rounded-2xl p-6 text-center transition-all group">
        <input
          type="file"
          id="excel-file-autodetect"
          accept=".xlsx, .xls"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <label htmlFor="excel-file-autodetect" className="cursor-pointer space-y-3 block">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Carga General con Auto-Detección Normativa Automática
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              El motor identificará si el archivo pertenece a <span className="font-semibold text-emerald-600 dark:text-emerald-400">LEV_EI_SE</span> o <span className="font-semibold text-sky-600 dark:text-sky-400">PLA_EI_SE</span> analizando el nombre y las pestañas internas.
            </p>
          </div>

          {fileName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
              <FileCheck2 className="w-4 h-4" />
              <span>Seleccionado: {fileName}</span>
            </div>
          )}
        </label>
      </div>

      {/* Processing Spinner */}
      {isProcessing && (
        <div className="p-8 text-center space-y-3 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Auto-detectando formato e inspeccionando calidad ISO 8000...
          </p>
        </div>
      )}

      {/* Quality Report Card */}
      {parsedResult && !isProcessing && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header Report */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${
                parsedResult.report.score_pct >= 85 
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : parsedResult.report.score_pct >= 70
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}>
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Informe de Calidad ISO 8000: Plantilla {parsedResult.docType === 'LEV' ? 'LEV_EI_SE (Levantamiento)' : 'PLA_EI_SE (Plan de Acción)'}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs font-mono border ${
                    parsedResult.docType === 'LEV'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                  }`}>
                    {parsedResult.docType}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>Archivo: <code className="font-mono font-semibold">{parsedResult.fileName}</code></span>
                  <span>•</span>
                  <span className={parsedResult.report.filename_status === 'VALIDO' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                    Nomenclatura: {parsedResult.report.filename_status}
                  </span>
                </p>
              </div>
            </div>

            {/* Quality Grade Badge */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Grado Calidad</span>
                <span className={`text-2xl font-black font-mono ${
                  parsedResult.report.grade === 'A+' || parsedResult.report.grade === 'A' ? 'text-emerald-500' :
                  parsedResult.report.grade === 'B' ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {parsedResult.report.grade}
                </span>
              </div>

              <div className="text-right">
                <span className={`text-3xl font-black font-mono ${
                  parsedResult.report.score_pct >= 85 ? 'text-emerald-500' :
                  parsedResult.report.score_pct >= 70 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {parsedResult.report.score_pct}%
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Conformidad Global</p>
              </div>
            </div>
          </div>

          {/* Sub-scores (Completitud, Consistencia, Catálogo) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">1. Completitud (40%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{parsedResult.report.completitud_pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${parsedResult.report.completitud_pct}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">2. Consistencia (40%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{parsedResult.report.consistencia_pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 transition-all" style={{ width: `${parsedResult.report.consistencia_pct}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">3. Catálogo SEN (20%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{parsedResult.report.catalogo_pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${parsedResult.report.catalogo_pct}%` }} />
              </div>
            </div>
          </div>

          {/* Counts metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block">Registros Procesados</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{parsedResult.report.total_rows}</span>
            </div>
            
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-emerald-700 dark:text-emerald-400 block">
                {parsedResult.docType === 'LEV' ? 'Pestaña Materiales' : 'Líneas de Plan'}
              </span>
              <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                {parsedResult.docType === 'LEV' ? parsedResult.report.materials_count : parsedResult.report.plan_lines_count}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
              <span className="text-rose-700 dark:text-rose-400 block">Filas Inconsistentes</span>
              <span className="text-lg font-bold text-rose-800 dark:text-rose-300 font-mono">{parsedResult.report.invalid_rows}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
              <span className="text-amber-700 dark:text-amber-400 block">Duplicados</span>
              <span className="text-lg font-bold text-amber-800 dark:text-amber-300 font-mono">{parsedResult.report.duplicates_count}</span>
            </div>
          </div>

          {/* Issues table */}
          {parsedResult.report.issues.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Detalle de Inconsistencias Detectadas ({parsedResult.report.issues.length}):</span>
              </h4>

              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-400 sticky top-0 border-b border-slate-300 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5 font-semibold">Fila</th>
                      <th className="p-2.5 font-semibold">Eje ISO 8000</th>
                      <th className="p-2.5 font-semibold">Campo</th>
                      <th className="p-2.5 font-semibold">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {parsedResult.report.issues.map((issue, idx) => (
                      <tr key={idx} className="hover:bg-slate-100 dark:hover:bg-slate-900/50">
                        <td className="p-2.5 font-mono text-slate-500 dark:text-slate-400">#{issue.row_number}</td>
                        <td className="p-2.5 font-semibold text-sky-600 dark:text-sky-400">{issue.axis}</td>
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-300">{issue.field}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300">{issue.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% de conformidad ISO 8000. Todos los campos de la plantilla cumplen con las reglas normativas.</span>
            </div>
          )}

          {/* Success Notification */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{saveSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          {user?.role === 'AUDITOR' ? (
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>El rol AUDITOR puede revisar la calidad pero no tiene autorizaciones para escribir registros en la base de datos.</span>
            </div>
          ) : (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleInitiateSave}
                disabled={isSaving || parsedResult.equipmentRecords.length === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando en Supabase (esquema scei)...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Confirmar Ingesta en BD ({parsedResult.equipmentRecords.length} Registros)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Extemporaneous Justification Modal */}
      {showExtemporaneousModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Carga Extemporánea ({windowInfo.dayName})</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Norma PMP - Justificación de Retraso Obligatoria</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExtemporaneousModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <p className="font-semibold">⚠️ Atención Analista:</p>
              <p>
                La entrega ordinaria está fijada para los días <strong className="text-emerald-700 dark:text-emerald-300">Miércoles</strong> (con prórroga los Jueves). Debido a que la carga actual se ejecuta en día <strong>{windowInfo.dayName}</strong>, debe fundamentar el motivo técnico u operacional del retraso para la auditoría institucional.
              </p>
            </div>

            <form onSubmit={handleConfirmExtemporaneousModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Motivo de Retraso Operacional / Justificación Extemporánea *
                </label>
                <textarea
                  rows={4}
                  value={delayReasonInput}
                  onChange={(e) => {
                    setDelayReasonInput(e.target.value);
                    if (delayReasonError) setDelayReasonError('');
                  }}
                  placeholder="Ejemplo: Retraso en la recolección de firmas físicas en subestación por fallas de conectividad en zona sur. Autorización emitida por Coordinación Regional."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  required
                />
                {delayReasonError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">{delayReasonError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExtemporaneousModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registrando con Justificación...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Confirmar e Ingestar con Justificación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
