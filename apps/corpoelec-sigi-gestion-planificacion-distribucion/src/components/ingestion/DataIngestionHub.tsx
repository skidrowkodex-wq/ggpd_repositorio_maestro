import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Cloud, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  Sparkles,
  FileCheck,
  Building2,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Save,
  Database,
  RefreshCw,
  FileText
} from 'lucide-react';
import { ProcessDefinition, ValidationReport, IngestionSubmission } from '../../types/ingestion';
import { 
  getStoredProcesses, 
  syncProcessesFromSupabase,
  validateExcelContent, 
  exportRemediationExcel, 
  exportOfficialTemplateExcel,
  saveSubmissionRecord,
  getStoredSubmissions,
  validateManualRecord,
  triggerGoogleDriveProvisioning
} from '../../services/dataIngestionService';
import { getMasterCatalogs } from '../../services/instrumentAuditorService';
import { useAuth } from '../../context/AuthContext';
import { VENEZUELAN_STATES } from '../../mockData/portalData';

export const DataIngestionHub: React.FC = () => {
  const { session } = useAuth();
  const [processes, setProcesses] = useState<ProcessDefinition[]>(getStoredProcesses());
  
  // Estado y Proceso Seleccionado
  const [selectedProcessId, setSelectedProcessId] = useState<string>(processes[0]?.id || 'sctis');
  const [selectedStateCode, setSelectedStateCode] = useState<string>(
    session.stateCode && session.stateCode !== 'NAC' ? session.stateCode : 'DCA'
  );
  
  // Pestañas principales
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'history'>('upload');

  // Sincronización en la nube al montar el componente
  useEffect(() => {
    syncProcessesFromSupabase().then(procs => {
      if (procs && procs.length > 0) {
        setProcesses(procs);
      }
    });
  }, []);

  // Archivo y Validación (Modo Excel)
  const [dragActive, setDragActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<IngestionSubmission | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modo Manual (Formulario Web Directo)
  const [manualRecord, setManualRecord] = useState<Record<string, any>>({});
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});
  const [manualGridRecords, setManualGridRecords] = useState<Record<string, any>[]>([]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Historial de Cargas
  const [submissions, setSubmissions] = useState<IngestionSubmission[]>(getStoredSubmissions());

  const currentProcess = processes.find(p => p.id === selectedProcessId) || processes[0];
  const currentStateObj = VENEZUELAN_STATES.find((s: any) => s.code === selectedStateCode) || VENEZUELAN_STATES[0];

  // Inicializar campos del formulario manual al cambiar de proceso o estado
  useEffect(() => {
    const initial: Record<string, any> = {
      COD_ESTADO: selectedStateCode
    };
    currentProcess?.requiredColumns?.forEach(col => {
      if (col.name === 'COD_ESTADO') {
        initial[col.name] = selectedStateCode;
      } else {
        initial[col.name] = '';
      }
    });
    setManualRecord(initial);
    setManualErrors({});
  }, [selectedProcessId, selectedStateCode, currentProcess]);

  // Manejo de Archivo Excel
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setIsValidating(true);
    setSubmissionSuccess(null);
    try {
      const report = await validateExcelContent(file, currentProcess, selectedStateCode);
      setValidationReport(report);
    } catch (err: any) {
      alert(`Error al procesar el archivo Excel: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmIngestion = () => {
    if (!validationReport) return;

    const prefix = currentProcess.code.split('_')[1] || currentProcess.id.toUpperCase();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const normalizedName = `${prefix}_${selectedStateCode}_${todayStr}_SEM32_V01.xlsx`;
    const gdrivePath = `/GGPD_DATA_LAKE_OFICIAL/${selectedStateCode}_${currentStateObj.name.toUpperCase()}/${currentProcess.code}/2026/08_AGOSTO/`;

    const submission: IngestionSubmission = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      batchId: validationReport.batchId,
      processId: currentProcess.id,
      stateCode: selectedStateCode,
      uploadedBy: session.userCode || session.name || 'coordinador_estadal',
      timestamp: new Date().toISOString(),
      originalFileName: validationReport.fileName,
      normalizedFileName: normalizedName,
      gdriveFolderPath: gdrivePath,
      conformeCount: validationReport.validRowsCount,
      noConformeCount: validationReport.invalidRowsCount,
      status: validationReport.invalidRowsCount > 0 ? 'PARCIAL_CON_REMEDIACION' : 'EXITOSO',
      remediationTaskId: validationReport.invalidRowsCount > 0 ? `TASK-REM-${Date.now().toString().slice(-4)}` : undefined
    };

    saveSubmissionRecord(submission, validationReport.validRecords);
    setSubmissions(getStoredSubmissions());
    setSubmissionSuccess(submission);
  };

  const handleDownloadRemediation = () => {
    if (!validationReport || validationReport.invalidRecords.length === 0) return;
    exportRemediationExcel(validationReport.invalidRecords, currentProcess, selectedStateCode);
  };

  // Manejo de Formulario Manual (Fila por Fila)
  const handleManualFieldChange = (colName: string, value: any) => {
    setManualRecord(prev => ({ ...prev, [colName]: value }));
    if (manualErrors[colName]) {
      setManualErrors(prev => {
        const next = { ...prev };
        delete next[colName];
        return next;
      });
    }
  };

  const handleAddManualRow = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateManualRecord(manualRecord, currentProcess, selectedStateCode);

    if (!result.isValid) {
      const errMap: Record<string, string> = {};
      result.errors.forEach(msg => {
        const colMatch = currentProcess.requiredColumns.find(c => msg.includes(`'${c.name}'`));
        if (colMatch) {
          errMap[colMatch.name] = msg;
        } else {
          errMap['_global'] = msg;
        }
      });
      setManualErrors(errMap);
      return;
    }

    // Agregar fila limpia a la grilla
    setManualGridRecords(prev => [...prev, { ...manualRecord, _rowId: Date.now() }]);
    
    // Resetear valores conservando COD_ESTADO
    const resetValues: Record<string, any> = { COD_ESTADO: selectedStateCode };
    currentProcess.requiredColumns.forEach(col => {
      if (col.name !== 'COD_ESTADO') resetValues[col.name] = '';
    });
    setManualRecord(resetValues);
    setManualErrors({});
  };

  const handleRemoveManualRow = (rowId: number) => {
    setManualGridRecords(prev => prev.filter(r => r._rowId !== rowId));
  };

  const handleConfirmManualSubmission = async () => {
    if (manualGridRecords.length === 0) return;

    setIsSubmittingManual(true);
    const prefix = currentProcess.code.split('_')[1] || currentProcess.id.toUpperCase();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const normalizedName = `${prefix}_${selectedStateCode}_${todayStr}_WEB_MANUAL_V01.xlsx`;
    const gdrivePath = `/GGPD_DATA_LAKE_OFICIAL/${selectedStateCode}_${currentStateObj.name.toUpperCase()}/${currentProcess.code}/2026/08_AGOSTO/`;

    const submission: IngestionSubmission = {
      id: `SUB-WEB-${Date.now().toString().slice(-6)}`,
      batchId: `BATCH-${prefix}-${selectedStateCode}-${Date.now().toString().slice(-6)}`,
      processId: currentProcess.id,
      stateCode: selectedStateCode,
      uploadedBy: session.userCode || session.name || 'coordinador_estadal',
      timestamp: new Date().toISOString(),
      originalFileName: 'CARGA_DIRECTA_FORMULARIO_WEB',
      normalizedFileName: normalizedName,
      gdriveFolderPath: gdrivePath,
      conformeCount: manualGridRecords.length,
      noConformeCount: 0,
      status: 'EXITOSO'
    };

    saveSubmissionRecord(submission, manualGridRecords);
    setSubmissions(getStoredSubmissions());
    setSubmissionSuccess(submission);
    setManualGridRecords([]);
    setIsSubmittingManual(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Principal Institucional */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#002b49] via-[#072146] to-[#00385e] p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#00f2fe]/20 text-[#00f2fe] font-mono text-xs font-bold border border-[#00f2fe]/30">
                ADUANA DIGITAL GGPD
              </span>
              <span className="text-xs text-slate-300 font-medium">Validación ISO 8000-110 & Carga Multimodal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white flex items-center gap-2">
              <UploadCloud className="h-6 w-6 text-[#00f2fe]" />
              Módulo de Ingesta Inteligente & Calidad de Datos
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
              Directiva Zero-WhatsApp / Zero-Email. Ingeste datos operativos mediante planillas Excel o a través del formulario web reactivo con validación sintáctica en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportOfficialTemplateExcel(currentProcess)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
              title="Descargar plantilla oficial en formato .xlsx"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Plantilla {currentProcess.shortName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas: Excel vs Formulario Web vs Historial */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('upload'); setSubmissionSuccess(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'upload'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>1. Ingesta por Archivo Excel (.xlsx)</span>
        </button>

        <button
          onClick={() => { setActiveTab('manual'); setSubmissionSuccess(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'manual'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>2. Carga Manual (Formulario Web Directo)</span>
          {manualGridRecords.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold">
              {manualGridRecords.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('history'); setSubmissionSuccess(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'bg-[#002b49] text-white dark:bg-[#00f2fe] dark:text-[#060d1a] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>3. Historial de Cargas Estadal ({submissions.length})</span>
        </button>
      </div>

      {/* SECCIÓN COMÚN: SELECCIÓN DE PROCESO Y ESTADO */}
      {(activeTab === 'upload' || activeTab === 'manual') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#002b49] dark:text-[#00f2fe]" />
              Seleccione el Proceso a Cargar ({processes.length} Procesos Disponibles)
            </h3>

            {/* Selector de Estado para Administradores o Bloqueo Estadal */}
            <div className="flex items-center space-x-2">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Estado:</span>
              {session.role === 'VISOR_ESTADAL' ? (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-cyan-950 dark:text-cyan-300 font-bold font-mono text-xs border border-blue-200 dark:border-cyan-500/30">
                  {currentStateObj.name} ({currentStateObj.code}) [Bloqueo Estadal]
                </span>
              ) : (
                <select
                  value={selectedStateCode}
                  onChange={e => setSelectedStateCode(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {VENEZUELAN_STATES.map((s: any) => (
                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Cuadrícula de Selección de Proceso */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {processes.map(proc => {
              const isSelected = proc.id === selectedProcessId;
              return (
                <button
                  key={proc.id}
                  onClick={() => {
                    setSelectedProcessId(proc.id);
                    setValidationReport(null);
                    setSubmissionSuccess(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'border-[#002b49] dark:border-[#00f2fe] bg-blue-50/70 dark:bg-cyan-950/40 shadow-sm ring-2 ring-[#002b49]/20 dark:ring-[#00f2fe]/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400">
                        {proc.code.split('_')[1] || proc.code}
                      </span>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#002b49] dark:text-[#00f2fe]" />}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1 group-hover:text-[#002b49] dark:group-hover:text-[#00f2fe] transition-colors line-clamp-2">
                      {proc.shortName}
                    </h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
                    <span>{proc.frequency}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{proc.requiredColumns.length} cols</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PESTAÑA 1: INGESTA POR ARCHIVO EXCEL */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          
          {/* Área de Carga Drag & Drop */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Carga del Archivo Operativo ({currentProcess.name})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nomenclatura exigida: <code className="font-mono text-blue-700 dark:text-cyan-300 font-bold">{currentProcess.namingPattern}</code>
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span>Corte Oficial: Jueves 12:00 PM</span>
              </div>
            </div>

            {/* Zona de Arrastre */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                dragActive
                  ? 'border-[#002b49] dark:border-[#00f2fe] bg-blue-50/50 dark:bg-cyan-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-[#002b49] dark:hover:border-[#00f2fe] bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-cyan-950/80 text-[#002b49] dark:text-[#00f2fe] flex items-center justify-center shadow-xs">
                <UploadCloud className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Arrastre su archivo Excel (.xlsx, .csv) aquí o <span className="text-blue-600 dark:text-cyan-400 underline">explore su equipo</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  El motor validará automáticamente la nomenclatura, esquema y contenido fila por fila.
                </p>
              </div>

              {isValidating && (
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-cyan-400 animate-pulse">
                  <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>Inspeccionando registros bajo norma ISO 8000-110...</span>
                </div>
              )}
            </div>

          </div>

          {/* REPORTE DE RESULTADOS DE VALIDACIÓN (ISO 8000) */}
          {validationReport && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 animate-fadeIn">
              
              {/* Header del Reporte */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Dictamen de Calidad ISO 8000: {validationReport.fileName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Lote ID: {validationReport.batchId} | Tamaño: {(validationReport.fileSize / 1024).toFixed(1)} KB | Estado: {validationReport.stateCode}
                  </p>
                </div>

                {/* Score OTQR */}
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block leading-none">Índice OTQR</span>
                    <span className={`text-base font-black ${
                      validationReport.otqrScore >= 95 ? 'text-emerald-600 dark:text-emerald-400' :
                      validationReport.otqrScore >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {validationReport.otqrScore}%
                    </span>
                  </div>
                  <ShieldCheck className={`h-6 w-6 ${
                    validationReport.otqrScore >= 95 ? 'text-emerald-500' :
                    validationReport.otqrScore >= 80 ? 'text-amber-500' : 'text-red-500'
                  }`} />
                </div>
              </div>

              {/* Verificación de Nomenclatura */}
              <div className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                validationReport.nomenclatureValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200'
              }`}>
                {validationReport.nomenclatureValid ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <span className="font-bold block">
                    {validationReport.nomenclatureValid 
                      ? 'Nomenclatura ISO Conforme: El nombre del archivo cumple con la regla estándar.'
                      : 'Advertencia de Nomenclatura: El nombre del archivo no cumple estrictamente la norma institucional.'}
                  </span>
                  {!validationReport.nomenclatureValid && (
                    <div className="text-[11px]">
                      <p>Nombre Sugerido Normalizado: <code className="font-mono font-bold">{validationReport.suggestedName}</code></p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">El sistema lo renombrará automáticamente al guardar en Google Drive.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas de Segregación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 block">Total Filas Procesadas</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {validationReport.totalRows} Registros
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">Conformes (Candidatos Carga)</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                    {validationReport.validRowsCount} Registros ({validationReport.otqrScore}%)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40">
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 block">No Conformes (A Remediar)</span>
                  <span className="text-xl font-black text-red-700 dark:text-red-400 mt-1 block">
                    {validationReport.invalidRowsCount} Registros
                  </span>
                </div>
              </div>

              {/* Tabla de Errores Detectados */}
              {validationReport.invalidRecords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" />
                      Detalle de Inconsistencias a Subsanar ({validationReport.invalidRecords.length} filas)
                    </h4>
                    <button
                      onClick={handleDownloadRemediation}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Descargar Excel de Remediación</span>
                    </button>
                  </div>

                  <div className="border border-red-200 dark:border-red-900/60 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-red-100/70 dark:bg-red-950/80 text-red-900 dark:text-red-200 font-bold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Fila</th>
                          <th className="py-2 px-3">Errores Detectados</th>
                          <th className="py-2 px-3">Muestra del Registro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 dark:divide-red-900/40 text-slate-700 dark:text-slate-300">
                        {validationReport.invalidRecords.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-red-50/50 dark:hover:bg-red-950/30">
                            <td className="py-2 px-3 font-mono font-bold text-red-600 dark:text-red-400">#{inv.rowNumber}</td>
                            <td className="py-2 px-3 text-red-700 dark:text-red-300 font-semibold">
                              {inv.errors.join(' | ')}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                              {JSON.stringify(inv.data)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Acciones Finales de Confirmación */}
              {!submissionSuccess ? (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Al confirmar, los <strong className="text-emerald-600">{validationReport.validRowsCount} registros conformes</strong> se subirán al Data Lake en Google Drive y a Supabase ({currentProcess.targetApp}).
                  </p>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    {validationReport.invalidRowsCount > 0 && (
                      <button
                        onClick={handleDownloadRemediation}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Planilla de Errores (.xlsx)</span>
                      </button>
                    )}

                    <button
                      onClick={handleConfirmIngestion}
                      disabled={validationReport.validRowsCount === 0}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#072146] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#38bdf8] dark:text-[#060d1a] font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Cloud className="h-4 w-4" />
                      <span>Subir Conformes ({validationReport.validRowsCount})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>¡Carga Procesada Exitosamente en el Data Lake SEN & Base de Datos!</span>
                  </div>
                  <p>
                    Archivo normalizado: <code className="font-mono font-bold">{submissionSuccess.normalizedFileName}</code>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ruta en Google Drive: <code className="font-mono">{submissionSuccess.gdriveFolderPath}</code>
                  </p>
                  {submissionSuccess.remediationTaskId && (
                    <p className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Se ha generado la Tarea de Remediación <strong className="font-mono">{submissionSuccess.remediationTaskId}</strong> en SCMTP con SLA de 48 horas.
                    </p>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* PESTAÑA 2: CARGA MANUAL (FORMULARIO WEB DIRECTO) */}
      {activeTab === 'manual' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Tarjeta de Formulario Dinámico Reactivo */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-[#00f2fe]" />
                  Formulario Dinámico de Captura Directa — {currentProcess.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ingrese los datos campo por campo. Cada registro se validará según el esquema ISO 8000 antes de agregarse a la grilla de envío.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 font-mono text-xs font-bold border border-blue-200 dark:border-slate-700">
                {currentProcess.requiredColumns.length} Campos Requeridos
              </span>
            </div>

            {/* Formulario Dinámico Generado por Columnas */}
            <form onSubmit={handleAddManualRow} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProcess.requiredColumns.map(col => {
                  const isStateField = col.name === 'COD_ESTADO';
                  const isNumber = col.type === 'number';
                  const isDate = col.type === 'date' || col.name.includes('FECHA');
                  const errorMsg = manualErrors[col.name];

                  return (
                    <div key={col.name} className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>{col.name}</span>
                        {col.required && (
                          <span className="text-[10px] text-red-500 font-semibold">*Obligatorio</span>
                        )}
                      </label>

                      {isStateField ? (
                        <input
                          type="text"
                          value={selectedStateCode}
                          disabled
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                        />
                      ) : col.type === 'catalog' && col.masterCatalogId ? (
                        (() => {
                          const masterCatalogs = getMasterCatalogs();
                          const catObj = masterCatalogs.find(c => c.id === col.masterCatalogId);
                          return (
                            <select
                              value={manualRecord[col.name] ?? ''}
                              onChange={e => handleManualFieldChange(col.name, e.target.value)}
                              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold bg-blue-50/50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 transition-all ${
                                errorMsg 
                                  ? 'border-red-500 ring-2 ring-red-500/20' 
                                  : 'border-blue-300 dark:border-cyan-500/50 focus:border-[#002b49] dark:focus:border-[#00f2fe]'
                              }`}
                            >
                              <option value="">-- Seleccionar {catObj?.name || 'Opción'} --</option>
                              {catObj?.items.map(item => (
                                <option key={item.id} value={item.name}>
                                  {item.name} {item.stateCode ? `(${item.stateCode})` : ''}
                                </option>
                              ))}
                            </select>
                          );
                        })()
                      ) : (
                        <input
                          type={isNumber ? 'number' : isDate ? 'date' : 'text'}
                          step={isNumber ? 'any' : undefined}
                          value={manualRecord[col.name] ?? ''}
                          placeholder={col.sampleValue ? `Ej: ${col.sampleValue}` : col.description}
                          onChange={e => handleManualFieldChange(col.name, e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all ${
                            errorMsg 
                              ? 'border-red-500 ring-2 ring-red-500/20' 
                              : 'border-slate-200 dark:border-slate-700 focus:border-[#002b49] dark:focus:border-[#00f2fe] focus:ring-2 focus:ring-[#002b49]/10'
                          }`}
                        />
                      )}

                      <p className="text-[10px] text-slate-400 truncate" title={col.description}>
                        {col.description}
                      </p>

                      {errorMsg && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold animate-fadeIn">
                          {errorMsg}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {manualErrors['_global'] && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-bold">
                  {manualErrors['_global']}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const resetValues: Record<string, any> = { COD_ESTADO: selectedStateCode };
                    currentProcess.requiredColumns.forEach(col => {
                      if (col.name !== 'COD_ESTADO') resetValues[col.name] = '';
                    });
                    setManualRecord(resetValues);
                    setManualErrors({});
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Limpiar Campos
                </button>

                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#002b49] hover:bg-[#072146] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#38bdf8] dark:text-[#060d1a] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Registro a la Grilla</span>
                </button>
              </div>
            </form>
          </div>

          {/* Grilla de Registros Acumulados */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Grilla de Registros Preparados para Envío ({manualGridRecords.length} filas)
                </h3>
              </div>

              {manualGridRecords.length > 0 && (
                <button
                  onClick={() => setManualGridRecords([])}
                  className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                >
                  Vaciar Grilla
                </button>
              )}
            </div>

            {manualGridRecords.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">
                  Aún no hay registros en la grilla. Complete el formulario superior y presione 'Agregar Registro a la Grilla'.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        {currentProcess.requiredColumns.map(col => (
                          <th key={col.name} className="py-2.5 px-3 uppercase text-[11px] whitespace-nowrap">
                            {col.name}
                          </th>
                        ))}
                        <th className="py-2.5 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {manualGridRecords.map((rec, index) => (
                        <tr key={rec._rowId || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono font-bold text-slate-400">{index + 1}</td>
                          {currentProcess.requiredColumns.map(col => (
                            <td key={col.name} className="py-2 px-3 whitespace-nowrap font-medium">
                              {rec[col.name] !== undefined && rec[col.name] !== '' ? String(rec[col.name]) : '—'}
                            </td>
                          ))}
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleRemoveManualRow(rec._rowId)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                              title="Eliminar fila"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Botón de Confirmación y Envío Masivo */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Se generará el archivo normalizado <code className="font-mono font-bold text-slate-700 dark:text-slate-300">{currentProcess.code.split('_')[1]}_{selectedStateCode}_WEB_MANUAL_V01.xlsx</code> con {manualGridRecords.length} filas certificadas.
                  </div>

                  <button
                    onClick={handleConfirmManualSubmission}
                    disabled={isSubmittingManual || manualGridRecords.length === 0}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmittingManual ? 'Procesando Envío...' : `Confirmar y Subir ${manualGridRecords.length} Registros`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mensaje de Éxito de Carga Manual */}
            {submissionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 animate-fadeIn mt-4">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>¡Carga Manual Procesada Exitosamente en el Data Lake SEN & Base de Datos!</span>
                </div>
                <p>
                  Lote Registrado: <code className="font-mono font-bold">{submissionSuccess.batchId}</code>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Ruta en Google Drive: <code className="font-mono">{submissionSuccess.gdriveFolderPath}</code>
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* PESTAÑA 3: HISTORIAL DE CARGAS ESTADAL */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#00f2fe]" />
                Historial de Ingestas y Auditoría de Cargas ({submissions.length} envíos)
              </h3>
              <p className="text-xs text-slate-500">
                Registro unificado de cargas (archivos Excel y formularios web directos), conformidades y tareas de remediación.
              </p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No hay envíos registrados todavía. Realice una carga en la pestaña 'Ingesta por Archivo Excel' o 'Carga Manual'.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Lote ID</th>
                    <th className="py-2.5 px-3">Fecha/Hora</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Proceso</th>
                    <th className="py-2.5 px-3">Archivo / Origen</th>
                    <th className="py-2.5 px-3">Conformes</th>
                    <th className="py-2.5 px-3">Errores</th>
                    <th className="py-2.5 px-3">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-cyan-400">{sub.batchId}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(sub.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold">{sub.stateCode}</td>
                      <td className="py-2.5 px-3 uppercase font-semibold">{sub.processId}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] truncate max-w-xs" title={sub.normalizedFileName}>{sub.normalizedFileName}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{sub.conformeCount}</td>
                      <td className="py-2.5 px-3 font-bold text-red-600 dark:text-red-400">{sub.noConformeCount}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'EXITOSO' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
