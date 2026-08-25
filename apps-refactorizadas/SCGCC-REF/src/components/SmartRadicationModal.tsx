import React, { useState } from 'react';
import { 
  CorrespondenciaRecord, 
  DireccionTipo, 
  TipoDocumento, 
  NivelConfidencialidad, 
  Prioridad,
  PropositoDocumento 
} from '../types';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Check, 
  FileText, 
  AlertCircle,
  ShieldCheck,
  Calendar,
  Building,
  User,
  ArrowRight,
  Zap,
  Search,
  FileCheck,
  BellRing
} from 'lucide-react';

interface RadicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRadicar: (newRecord: CorrespondenciaRecord) => void;
  nextCorrelativo: string;
}

export const SmartRadicationModal: React.FC<RadicationModalProps> = ({
  isOpen,
  onClose,
  onRadicar,
  nextCorrelativo
}) => {
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [analyzingWithAI, setAnalyzingWithAI] = useState<boolean>(false);
  const [aiExtracted, setAiExtracted] = useState<boolean>(false);

  // Form Fields
  const [direccion, setDireccion] = useState<DireccionTipo>('ENTRADA');
  const [proposito, setProposito] = useState<PropositoDocumento>('EVALUACION_TECNICA');
  const [instruidoPor, setInstruidoPor] = useState<string>('Ing. Adrián Correa - Gerente General de Distribución (GGD)');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('MEMORANDUM');
  const [numeroDocumentoOrigen, setNumeroDocumentoOrigen] = useState('');
  const [remitenteInstitucion, setRemitenteInstitucion] = useState('');
  const [remitenteNombre, setRemitenteNombre] = useState('');
  const [destinatarioPrincipal, setDestinatarioPrincipal] = useState('Ing. Carlos Reyes (Gerente General Gestión de Planificación)');
  const [asunto, setAsunto] = useState('');
  const [descripcionSintesis, setDescripcionSintesis] = useState('');
  const [nivelConfidencialidad, setNivelConfidencialidad] = useState<NivelConfidencialidad>('ORDINARIO');
  const [prioridad, setPrioridad] = useState<Prioridad>('ALTA');
  const [fechaEmisionOrigen, setFechaEmisionOrigen] = useState(new Date().toISOString().split('T')[0]);
  const [fechaRecepcion, setFechaRecepcion] = useState(new Date().toISOString().split('T')[0]);
  const [fechaLimiteRespuesta, setFechaLimiteRespuesta] = useState('');
  const [requiereRespuesta, setRequiereRespuesta] = useState(true);
  const [medioEntrega, setMedioEntrega] = useState('Correo Electrónico Institucional');

  if (!isOpen) return null;

  const handleSelectProposito = (prop: PropositoDocumento) => {
    setProposito(prop);
    const d = new Date();
    if (prop === 'INSTRUCCION_EJECUTIVA') {
      setPrioridad('URGENTE_24H');
      setRequiereRespuesta(true);
      d.setDate(d.getDate() + 2); // 48h SLA
      setFechaLimiteRespuesta(d.toISOString().split('T')[0]);
      if (!instruidoPor) {
        setInstruidoPor('Ing. Adrián Correa - Gerente General de Distribución (GGD)');
      }
    } else if (prop === 'EVALUACION_TECNICA') {
      setPrioridad('ALTA');
      setRequiereRespuesta(true);
      d.setDate(d.getDate() + 5); // 5 días SLA
      setFechaLimiteRespuesta(d.toISOString().split('T')[0]);
    } else if (prop === 'REVISION_CONFORMACION') {
      setPrioridad('MEDIA');
      setRequiereRespuesta(true);
      d.setDate(d.getDate() + 3); // 3 días SLA
      setFechaLimiteRespuesta(d.toISOString().split('T')[0]);
    } else {
      setPrioridad('BAJA');
      setRequiereRespuesta(false);
      setFechaLimiteRespuesta('');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileSelected(file);
    setAnalyzingWithAI(true);

    // Simulación del motor de extracción Gemini OCR / Text Parser
    setTimeout(() => {
      const fileName = file.name.toUpperCase();
      
      // Heurísticas de extracción inteligente
      if (fileName.includes('GGD') || fileName.includes('DISTRIBUCION')) {
        setDireccion('ENTRADA');
        setRemitenteInstitucion('Gerencia General de Distribución (GGD)');
        setRemitenteNombre('Ing. Adrián Correa');
        setNumeroDocumentoOrigen(fileName.replace('.PDF', '').slice(0, 25));
        setAsunto('Instrucción Operativa: Evaluación y Despacho de Requerimientos SEN');
        setTipoDocumento('MEMORANDUM');
        handleSelectProposito('INSTRUCCION_EJECUTIVA');
      } else if (fileName.includes('TTHH') || fileName.includes('TALENTO')) {
        setDireccion('ENTRADA');
        setRemitenteInstitucion('Gerencia General de Talento Humano (CGGTH)');
        setRemitenteNombre('Lic. Yelitza Tovar');
        setNumeroDocumentoOrigen('CGGTH-0005-08-2026');
        setAsunto('Notificación de Proceso de Gestión de Personal y Asistencia');
        setTipoDocumento('CIRCULAR');
        setNivelConfidencialidad('CONFIDENCIAL');
        handleSelectProposito('INFORMATIVO_NOTIFICACION');
      } else {
        setNumeroDocumentoOrigen(fileName.replace('.PDF', '').replace(/[^a-zA-Z0-9_-]/g, '_'));
        setAsunto('Documento Oficial Remitido a Planificación');
      }

      setAnalyzingWithAI(false);
      setAiExtracted(true);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: CorrespondenciaRecord = {
      id: `corresp-${Date.now()}`,
      correlativo: nextCorrelativo,
      direccion,
      proposito,
      instruidoPor: proposito === 'INSTRUCCION_EJECUTIVA' ? instruidoPor : undefined,
      tipoDocumento,
      numeroDocumentoOrigen: numeroDocumentoOrigen || `DOC-${Date.now()}`,
      remitenteInstitucion,
      remitenteNombre,
      destinatarioPrincipal,
      asunto,
      descripcionSintesis,
      nivelConfidencialidad,
      prioridad,
      fechaEmisionOrigen,
      fechaRecepcion,
      fechaLimiteRespuesta: fechaLimiteRespuesta || undefined,
      estadoTramite: 'RADICADO',
      medioEntrega,
      requiereRespuesta,
      pdfFileName: fileSelected ? fileSelected.name : undefined,
      pdfDriveUrl: 'https://drive.google.com/drive/folders/1yKwQ8hKGjCPHwukuADkv__Kp3gicJkBj',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onRadicar(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#072146] w-full max-w-4xl rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Radicación Digital Inteligente (SCGCC)</h2>
              <p className="text-xs text-purple-200 font-mono">
                Correlativo Asignado: <span className="font-bold text-white bg-purple-900/60 px-2 py-0.5 rounded">{nextCorrelativo}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* AI Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
              fileSelected
                ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-purple-300 dark:border-purple-800 hover:border-purple-500 bg-purple-50/30 dark:bg-purple-950/10'
            }`}
          >
            {analyzingWithAI ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300 font-mono">
                  Gemini Flash AI: Extrayendo campos y analizando contenido del oficio...
                </p>
              </div>
            ) : fileSelected ? (
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{fileSelected.name}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ✓ Análisis OCR & Metadatos completado
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setFileSelected(null); setAiExtracted(false); }}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-9 h-9 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Arrastra aquí el PDF u Oficio Digital escaneado
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  El sistema detectará automáticamente el número de oficio, remitente, fechas y sugerirá la prioridad.
                </p>
                <label className="mt-3 inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl cursor-pointer hover:bg-purple-200 transition-colors">
                  Seleccionar desde la computadora
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx" onChange={handleFileInput} />
                </label>
              </div>
            )}
          </div>

          {/* ⚡ NUEVO: SELECCIÓN DE PROPÓSITO OPERATIVO / VERBO RECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Propósito Operativo & Verbo Rector de la Comunicación</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                Matriz de Triaje GGPD / ISO 15489
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Instrucción Ejecutiva */}
              <div
                onClick={() => handleSelectProposito('INSTRUCCION_EJECUTIVA')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  proposito === 'INSTRUCCION_EJECUTIVA'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-400/20'
                    : 'border-slate-200 dark:border-purple-900/40 hover:border-amber-400 bg-slate-50/50 dark:bg-[#041426]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded">
                    SLA: 24h-48h
                  </span>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-2 leading-tight">
                  ⚡ Instrucción Ejecutiva
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Orden directa de la GGD o Despacho Ministerial. Prioridad perentoria.
                </p>
              </div>

              {/* 2. Evaluación Técnica */}
              <div
                onClick={() => handleSelectProposito('EVALUACION_TECNICA')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  proposito === 'EVALUACION_TECNICA'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-400/20'
                    : 'border-slate-200 dark:border-purple-900/40 hover:border-indigo-400 bg-slate-50/50 dark:bg-[#041426]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                    <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    SLA: 5 Días
                  </span>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-2 leading-tight">
                  🔍 Evaluación Técnica
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Estudios de carga, balances, proyectos y factibilidad SEN.
                </p>
              </div>

              {/* 3. Revisión / Conformación */}
              <div
                onClick={() => handleSelectProposito('REVISION_CONFORMACION')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  proposito === 'REVISION_CONFORMACION'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-400/20'
                    : 'border-slate-200 dark:border-purple-900/40 hover:border-purple-400 bg-slate-50/50 dark:bg-[#041426]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                    <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded">
                    SLA: 3 Días
                  </span>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-2 leading-tight">
                  📑 Revisión / Visto Bueno
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Validación de minutas, contratos e informes institucionales.
                </p>
              </div>

              {/* 4. Notificación / Para Conocimiento */}
              <div
                onClick={() => handleSelectProposito('INFORMATIVO_NOTIFICACION')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  proposito === 'INFORMATIVO_NOTIFICACION'
                    ? 'border-slate-500 bg-slate-100 dark:bg-slate-800/80 shadow-md ring-2 ring-slate-400/20'
                    : 'border-slate-200 dark:border-purple-900/40 hover:border-slate-400 bg-slate-50/50 dark:bg-[#041426]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <BellRing className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    Archivo
                  </span>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-2 leading-tight">
                  📢 Para Conocimiento
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Circulares, notificaciones y comunicaciones de archivo pasivo.
                </p>
              </div>
            </div>

            {/* Campo Condicional: Autoridad Emisora de la Instrucción */}
            {proposito === 'INSTRUCCION_EJECUTIVA' && (
              <div className="mt-3 p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Autoridad Superior que emite la Instrucción</span>
                </label>
                <input
                  type="text"
                  required
                  value={instruidoPor}
                  onChange={(e) => setInstruidoPor(e.target.value)}
                  placeholder="ej: Ing. Adrián Correa - Gerente General de Distribución (GGD)"
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#072146] border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                  ⚡ Esta orden se resaltará como prioridad ejecutiva en el Tablero de Planificación y la Bandeja de Despacho.
                </p>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dirección */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Dirección del Documento
              </label>
              <select
                value={direccion}
                onChange={(e) => setDireccion(e.target.value as DireccionTipo)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="ENTRADA">Entrada (Recibida por GGPD)</option>
                <option value="SALIDA">Salida (Emitida por GGPD)</option>
                <option value="INTERNA">Interna (Inter-divisiones GGPD)</option>
              </select>
            </div>

            {/* Tipo Documento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Tipo de Documento
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="MEMORANDUM">Memorándum</option>
                <option value="OFICIO">Oficio</option>
                <option value="CIRCULAR">Circular</option>
                <option value="PUNTO_DE_CUENTA">Punto de Cuenta</option>
                <option value="INFORME_TECNICO">Informe Técnico</option>
                <option value="SOLICITUD_1X10">Solicitud 1x10</option>
              </select>
            </div>

            {/* Nro Documento Origen */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                N° de Oficio / Documento Físico
              </label>
              <input
                type="text"
                required
                value={numeroDocumentoOrigen}
                onChange={(e) => setNumeroDocumentoOrigen(e.target.value)}
                placeholder="ej: GGD-NR-0815-2026"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white"
              />
            </div>

            {/* Remitente Institución */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Remitente: Institución / Gerencia Emisora
              </label>
              <input
                type="text"
                required
                value={remitenteInstitucion}
                onChange={(e) => setRemitenteInstitucion(e.target.value)}
                placeholder="ej: Gerencia General de Distribución (GGD)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Remitente Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Firmante / Persona Emisora
              </label>
              <input
                type="text"
                value={remitenteNombre}
                onChange={(e) => setRemitenteNombre(e.target.value)}
                placeholder="ej: Ing. Adrián Correa"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Destinatario */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Destinatario Principal
              </label>
              <input
                type="text"
                required
                value={destinatarioPrincipal}
                onChange={(e) => setDestinatarioPrincipal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Asunto */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Asunto Oficial
              </label>
              <textarea
                required
                rows={2}
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Descripción concisa y oficial del oficio..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Confidencialidad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Confidencialidad (ISO 27001)
              </label>
              <select
                value={nivelConfidencialidad}
                onChange={(e) => setNivelConfidencialidad(e.target.value as NivelConfidencialidad)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="ORDINARIO">Ordinario (General)</option>
                <option value="CONFIDENCIAL">Confidencial (Despacho GGPD)</option>
                <option value="RESERVADO_DIRECTIVA">Reservado Directiva</option>
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Prioridad)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE_24H">Urgente 24 Horas</option>
              </select>
            </div>

            {/* Fecha Límite SLA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Fecha Límite / SLA Respuesta
              </label>
              <input
                type="date"
                value={fechaLimiteRespuesta}
                onChange={(e) => setFechaLimiteRespuesta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-purple-900/60">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqResp"
                checked={requiereRespuesta}
                onChange={(e) => setRequiereRespuesta(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <label htmlFor="reqResp" className="text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                Requiere emitir Oficio / Respuesta Formal
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Radicar Oficialmente</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
