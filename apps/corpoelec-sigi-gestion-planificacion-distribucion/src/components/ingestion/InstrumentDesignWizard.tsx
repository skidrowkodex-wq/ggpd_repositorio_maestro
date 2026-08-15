import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  Database, 
  Layers, 
  ListOrdered, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  RefreshCw, 
  X,
  FileCheck,
  Bot,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  ColumnDefinition, 
  ProcessDefinition, 
  ProcessCategory, 
  ProcessFrequency, 
  DesignAuditReport, 
  MasterCatalog 
} from '../../types/ingestion';
import { 
  auditInstrumentColumns, 
  getMasterCatalogs, 
  requestGeminiDesignReview 
} from '../../services/instrumentAuditorService';
import { 
  saveProcessDefinition, 
  getStoredProcesses, 
  triggerGoogleDriveProvisioning 
} from '../../services/dataIngestionService';

interface InstrumentDesignWizardProps {
  onClose: () => void;
  onProcessSaved: (newProcess: ProcessDefinition) => void;
  initialProcess?: ProcessDefinition | null;
}

export const InstrumentDesignWizard: React.FC<InstrumentDesignWizardProps> = ({
  onClose,
  onProcessSaved,
  initialProcess
}) => {
  const masterCatalogs = getMasterCatalogs();
  const existingProcesses = getStoredProcesses();

  // Paso del Wizard: 1 (Origen) -> 2 (Auditoría) -> 3 (Ajuste / Esquema) -> 4 (Certificación)
  const [currentStep, setCurrentStep] = useState<number>(initialProcess ? 2 : 1);
  const [inputMode, setInputMode] = useState<'excel' | 'scratch' | 'redesign'>(
    initialProcess ? 'redesign' : 'excel'
  );

  // Metadatos del Proceso
  const [code, setCode] = useState(initialProcess?.code || '');
  const [name, setName] = useState(initialProcess?.name || '');
  const [shortName, setShortName] = useState(initialProcess?.shortName || '');
  const [description, setDescription] = useState(initialProcess?.description || '');
  const [category, setCategory] = useState<ProcessCategory>(initialProcess?.category || 'MANTENIMIENTO_CONTROL');
  const [frequency, setFrequency] = useState<ProcessFrequency>(initialProcess?.frequency || 'SEMANAL');

  // Columnas bajo análisis
  const [columns, setColumns] = useState<ColumnDefinition[]>(
    initialProcess?.requiredColumns || [
      { name: 'COD_ESTADO', type: 'string', description: 'Código del Estado', required: true, sampleValue: 'DCA' },
      { name: 'SUBESTACION', type: 'string', description: 'Nombre de la Subestación', required: true, sampleValue: 'S/E CHACAO' },
      { name: 'TP1_KVA', type: 'number', description: 'Potencia TP 1', required: false, sampleValue: '36' },
      { name: 'TP2_KVA', type: 'number', description: 'Potencia TP 2', required: false, sampleValue: '36' },
      { name: 'TOTAL_AFECTADOS', type: 'number', description: 'Total equipos afectados', required: false, sampleValue: '2' },
      { name: 'FECHA', type: 'date', description: 'Fecha de inspección', required: true, sampleValue: '2026-08-15' }
    ]
  );

  // Archivo Excel Drag & Drop
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reporte de Auditoría y Dictamen IA
  const [auditReport, setAuditReport] = useState<DesignAuditReport | null>(null);
  const [aiReviewText, setAiReviewText] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Autocalcular el código sugerido al iniciar
  useEffect(() => {
    if (!initialProcess && !code) {
      const nextNum = existingProcesses.length + 1;
      const numStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
      setCode(`${numStr}_SCNUEVO`);
    }
  }, [existingProcesses, initialProcess, code]);

  // Ejecutar auditoría cada vez que se llega al paso 2
  useEffect(() => {
    if (currentStep === 2 && columns.length > 0) {
      const report = auditInstrumentColumns(columns);
      setAuditReport(report);
    }
  }, [currentStep, columns]);

  // Manejador de Carga de Excel Borrador
  const handleExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processDraftExcel(e.dataTransfer.files[0]);
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processDraftExcel(e.target.files[0]);
    }
  };

  const processDraftExcel = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      if (rows.length > 0) {
        const detectedHeaders = Object.keys(rows[0]);
        const extractedColumns: ColumnDefinition[] = detectedHeaders.map(header => {
          const clean = header.trim().toUpperCase().replace(/\s+/g, '_');
          const sample = rows[0][header] ? String(rows[0][header]) : '';
          const isNum = !isNaN(Number(sample)) && sample !== '';
          const isDate = clean.includes('FECHA') || clean.includes('DATE');

          return {
            name: clean,
            type: isDate ? 'date' : isNum ? 'number' : 'string',
            description: `Columna detectada '${header}'`,
            required: true,
            sampleValue: sample || 'EJEMPLO'
          };
        });

        setColumns(extractedColumns);
        setName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
        setShortName(file.name.slice(0, 15).toUpperCase());
        setCurrentStep(2); // Avanzar a auditoría
      } else {
        alert('El archivo Excel seleccionado no contiene filas o encabezados detectables.');
      }
    } catch (err: any) {
      alert(`Error al leer archivo Excel: ${err.message}`);
    }
  };

  const handleRequestAIReview = async () => {
    if (!auditReport) return;
    setIsLoadingAI(true);
    try {
      const review = await requestGeminiDesignReview(columns, auditReport);
      setAiReviewText(review);
    } catch (e: any) {
      setAiReviewText(`Error consultando IA: ${e.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApplyRefactoring = () => {
    if (auditReport && auditReport.refactoredColumns) {
      setColumns(auditReport.refactoredColumns);
      setCurrentStep(3); // Pasar al editor de esquema
    }
  };

  const handleAddCustomColumn = () => {
    setColumns(prev => [
      ...prev,
      {
        name: `CAMPO_${prev.length + 1}`,
        type: 'string',
        description: 'Descripción del campo',
        required: true,
        sampleValue: 'VALOR'
      }
    ]);
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateColumn = (idx: number, field: keyof ColumnDefinition, val: any) => {
    setColumns(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleFinalSaveAndProvision = async () => {
    if (!code || !name || !shortName) {
      alert('Por favor complete los nombres y código del proceso.');
      return;
    }

    const cleanCode = code.toUpperCase().startsWith('0') 
      ? code.toUpperCase() 
      : `0${existingProcesses.length + 1}_${code.toUpperCase().replace(/\s+/g, '_')}`;
    const cleanPrefix = cleanCode.split('_')[1] || cleanCode;

    const newProc: ProcessDefinition = {
      id: cleanPrefix.toLowerCase(),
      code: cleanCode,
      name,
      shortName,
      description: description || `Proceso normalizado para ${name}.`,
      category,
      targetApp: 'Módulo Dinámico SIGI',
      frequency,
      namingPattern: `${cleanPrefix}_[ESTADO]_[YYYYMMDD]_V01.xlsx`,
      icon: 'Layers',
      color: '#00f2fe',
      createdAt: new Date().toISOString(),
      isDynamic: true,
      provisionedStatesCount: 25,
      version: initialProcess?.version ? `V0${Number(initialProcess.version.replace('V0', '')) + 1}` : 'V01',
      requiredColumns: columns
    };

    saveProcessDefinition(newProc);

    // Disparar Webhook a Google Drive
    setIsProvisioning(true);
    await triggerGoogleDriveProvisioning('PROVISION_NEW_PROCESS', { 
      code: newProc.code, 
      name: newProc.shortName.toUpperCase().replace(/\s+/g, '_') 
    });
    setIsProvisioning(false);

    onProcessSaved(newProc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* HEADER DEL WIZARD */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#002b49] via-[#072146] to-[#0a3560] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-400/20 text-[#00f2fe] flex items-center justify-center border border-cyan-400/30">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-mono text-[10px] font-bold">
                  ASISTENTE WIZARD ISO 8000
                </span>
                <span className="text-xs text-slate-300 font-medium">Diseño, Diagnóstico & Normalización SEN</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                {initialProcess ? `Rediseñar / Evolucionar: ${initialProcess.name}` : 'Creación Asistida de Nuevo Proceso e Instrumento'}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BARRA DE PROGRESO DE 4 PASOS */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`}>
            <span className="h-6 w-6 rounded-full flex items-center justify-center border border-current text-[11px]">1</span>
            <span>Origen</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`}>
            <span className="h-6 w-6 rounded-full flex items-center justify-center border border-current text-[11px]">2</span>
            <span>Auditoría & Diagnóstico</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
          <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`}>
            <span className="h-6 w-6 rounded-full flex items-center justify-center border border-current text-[11px]">3</span>
            <span>Esquema & Catálogos</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
          <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`}>
            <span className="h-6 w-6 rounded-full flex items-center justify-center border border-current text-[11px]">4</span>
            <span>Certificación</span>
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE DEL WIZARD */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* PASO 1: ORIGEN DEL INSTRUMENTO                                            */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-lg mx-auto">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ¿Cómo desea iniciar el diseño del nuevo instrumento?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Seleccione si cuenta con una plantilla borrador en Excel o si prefiere construirlo paso a paso desde cero con asistencia metodológica.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opción A: Subir Excel */}
                <div 
                  onClick={() => setInputMode('excel')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    inputMode === 'excel'
                      ? 'border-[#002b49] dark:border-[#00f2fe] bg-blue-50/50 dark:bg-cyan-950/30 ring-2 ring-[#002b49]/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tengo un Excel Borrador (.xlsx)</h4>
                      <p className="text-xs text-slate-500">Cargue el archivo que hoy usan y el asistente auditará sus columnas.</p>
                    </div>
                  </div>

                  {inputMode === 'excel' && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleExcelDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleExcelFileChange} 
                        className="hidden" 
                      />
                      <UploadCloud className="h-6 w-6 text-blue-600 dark:text-cyan-400 mx-auto" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mt-1">
                        Arrastre su Excel aquí o haga clic para explorar
                      </span>
                    </div>
                  )}
                </div>

                {/* Opción B: Crear desde cero */}
                <div 
                  onClick={() => setInputMode('scratch')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    inputMode === 'scratch'
                      ? 'border-[#002b49] dark:border-[#00f2fe] bg-blue-50/50 dark:bg-cyan-950/30 ring-2 ring-[#002b49]/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Construir Nuevo desde Cero</h4>
                      <p className="text-xs text-slate-500">Diseñe el instrumento campo a campo con sugerencias de Catálogos Maestros.</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    💡 Recomendado para nuevos procesos (ej. Diagnóstico de Subestaciones, Termografía, Inspección de Líneas).
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#072146] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#38bdf8] dark:text-[#060d1a] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Continuar a Auditoría</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: AUDITORÍA Y DIAGNÓSTICO ISO 8000                                 */}
          {/* ========================================================================= */}
          {currentStep === 2 && auditReport && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Tarjeta de Resumen del Dictamen */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                auditReport.status === 'CONFORME'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : auditReport.status === 'REQUIERE_AJUSTES'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-500/40 text-red-900 dark:text-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg border ${
                    auditReport.status === 'CONFORME' ? 'bg-emerald-500 text-white' :
                    auditReport.status === 'REQUIERE_AJUSTES' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {auditReport.score}%
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                      Índice de Madurez & Normalización ISO 8000
                    </span>
                    <h3 className="text-base font-black">
                      {auditReport.status === 'CONFORME' ? '🟢 Diseño de Instrumento Óptimo' :
                       auditReport.status === 'REQUIERE_AJUSTES' ? '🟡 Apto pero Requiere Ajustes / Catálogos' :
                       '🔴 Diseño No Factible (Requiere Refactorización 1NF/3NF)'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleRequestAIReview}
                  disabled={isLoadingAI}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Bot className={`h-4 w-4 text-purple-500 ${isLoadingAI ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAI ? 'Consultando Gemini...' : 'Dictamen Explicativo IA'}</span>
                </button>
              </div>

              {/* Dictamen IA (Si se activó) */}
              {aiReviewText && (
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center space-x-2 font-bold text-sm text-purple-700 dark:text-purple-300">
                    <Sparkles className="h-4 w-4" />
                    <span>Dictamen Pedagógico de Google Gemini IA:</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-sans text-[11.5px]">
                    {aiReviewText}
                  </p>
                </div>
              )}

              {/* Lista de Hallazgos Detectados */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                  Hallazgos Detectados en la Estructura ({auditReport.findings.length})
                </h4>

                {auditReport.findings.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === 'CRITICAL_1NF' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                        f.severity === 'WARNING_3NF' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-blue-100 text-blue-700 dark:bg-cyan-950 dark:text-cyan-300'
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {f.affectedColumns.join(', ')}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{f.title}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{f.description}</p>
                    <p className="text-[11px] text-blue-700 dark:text-cyan-300 font-medium">💡 {f.suggestedAction}</p>
                  </div>
                ))}
              </div>

              {/* Botones de Navegación */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>

                <button
                  onClick={handleApplyRefactoring}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Aplicar Correcciones y Editar Esquema</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: ESQUEMA NORMALIZADO Y VINCULACIÓN DE CATÁLOGOS                   */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Metadatos Básicos del Proceso */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Código de Proceso Normalizado (Auto-secuencia) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nombre Oficial del Proceso *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Diagnóstico de Subestaciones"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Etiqueta Corta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. SC Diagnóstico SE"
                    value={shortName}
                    onChange={e => setShortName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Constructor de Columnas con Soporte de Catálogos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Columnas Normalizadas Certificadas ({columns.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Vincule los campos a Catálogos Maestros para generar listas desplegables automáticas en Excel y Web.
                    </p>
                  </div>

                  <button
                    onClick={handleAddCustomColumn}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-cyan-950 dark:text-cyan-300 text-xs font-bold border border-blue-200 dark:border-cyan-500/30 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar Campo</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {columns.map((col, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex flex-col sm:flex-row items-center gap-2 text-xs"
                    >
                      <input
                        type="text"
                        value={col.name}
                        placeholder="NOMBRE_CAMPO"
                        onChange={e => handleUpdateColumn(idx, 'name', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                        className="w-full sm:w-1/4 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono font-bold"
                      />

                      <select
                        value={col.type}
                        onChange={e => handleUpdateColumn(idx, 'type', e.target.value)}
                        className="w-full sm:w-32 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-bold"
                      >
                        <option value="string">Texto</option>
                        <option value="number">Numérico</option>
                        <option value="date">Fecha</option>
                        <option value="boolean">Booleano</option>
                        <option value="catalog">⭐ Catálogo Maestro</option>
                      </select>

                      {col.type === 'catalog' ? (
                        <select
                          value={col.masterCatalogId || ''}
                          onChange={e => handleUpdateColumn(idx, 'masterCatalogId', e.target.value)}
                          className="w-full sm:flex-1 px-2 py-1.5 rounded-lg border border-blue-300 dark:border-cyan-500/50 bg-blue-50/50 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-200 font-bold"
                        >
                          <option value="">-- Seleccionar Catálogo --</option>
                          {masterCatalogs.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.itemsCount} opciones)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={col.description}
                          placeholder="Descripción del dato..."
                          onChange={e => handleUpdateColumn(idx, 'description', e.target.value)}
                          className="w-full sm:flex-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                        />
                      )}

                      <button
                        onClick={() => handleRemoveColumn(idx)}
                        disabled={columns.length <= 1}
                        className="p-1.5 rounded text-slate-400 hover:text-red-500 disabled:opacity-20 cursor-pointer"
                        title="Eliminar columna"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de Navegación */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#072146] text-white dark:bg-gradient-to-r dark:from-[#00f2fe] dark:to-[#38bdf8] dark:text-[#060d1a] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Revisión Final</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 4: CERTIFICACIÓN Y APROVISIONAMIENTO EN 25 ESTADOS                   */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Resumen de Certificación del Proceso: {code} — {name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CÓDIGO OFICIAL</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-300">{code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">FRECUENCIA DE CORTE</span>
                    <span className="font-bold">{frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">COLUMNAS CERTIFICADAS</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{columns.length} Columnas</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ESTADOS A APROVISIONAR</span>
                    <span className="font-bold text-blue-600 dark:text-cyan-300">25 Entidades</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-cyan-950/30 border border-blue-200 dark:border-cyan-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-blue-900 dark:text-cyan-200">Acciones que se ejecutarán automáticamente al confirmar:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>Creación de subcarpetas en Google Drive para los 25 Estados y en <code className="font-mono font-bold">00_PLANTILLAS_OFICIALES</code>.</li>
                    <li>Sincronización en la base de datos Supabase (<code className="font-mono">sigi.cat_procesos_ingesta</code>).</li>
                    <li>Generación de la Plantilla Excel descargable (.xlsx) con validación de datos.</li>
                    <li>Activación inmediata del Formulario Web en el Módulo de Carga.</li>
                  </ul>
                </div>
              </div>

              {/* Botones Finales */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>

                <button
                  onClick={handleFinalSaveAndProvision}
                  disabled={isProvisioning}
                  className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${isProvisioning ? 'animate-spin' : ''}`} />
                  <span>{isProvisioning ? 'Aprovisionando en 25 Estados...' : '✨ Certificar & Aprovisionar en 25 Estados'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
