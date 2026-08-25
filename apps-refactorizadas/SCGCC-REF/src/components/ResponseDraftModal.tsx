import React, { useState, useEffect } from 'react';
import { CorrespondenciaRecord, OficioRespuesta, EstadoFirma } from '../types';
import { useAuth } from '../lib/authContext';
import { 
  X, 
  Sparkles, 
  FileText, 
  Send, 
  Download, 
  Printer, 
  CheckCircle2, 
  Building2, 
  User, 
  Calendar, 
  AlertCircle,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface ResponseDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CorrespondenciaRecord | null;
  onSaveDraft: (correspondenciaId: string, oficio: OficioRespuesta) => void;
}

export const ResponseDraftModal: React.FC<ResponseDraftModalProps> = ({
  isOpen,
  onClose,
  record,
  onSaveDraft
}) => {
  const { user } = useAuth();

  // Form State
  const [numeroOficio, setNumeroOficio] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'OFICIO' | 'MEMORANDUM' | 'PUNTO_DE_CUENTA'>('OFICIO');
  const [destinatarioInstitucion, setDestinatarioInstitucion] = useState('');
  const [destinatarioNombre, setDestinatarioNombre] = useState('');
  const [destinatarioCargo, setDestinatarioCargo] = useState('');
  const [asunto, setAsunto] = useState('');
  const [referenciaAntecedente, setReferenciaAntecedente] = useState('');
  const [cuerpoTexto, setCuerpoTexto] = useState('');
  const [conclusionesTecnicas, setConclusionesTecnicas] = useState('');
  const [firmanteNombre, setFirmanteNombre] = useState('Ing. Adrián Correa');
  const [firmanteCargo, setFirmanteCargo] = useState('Gerente General de Distribución');
  const [copias, setCopias] = useState('Ing. Carlos Reyes (Gerente Nacional de Planificación) • Archivo');
  const [anexos, setAnexos] = useState('Informe Técnico de Factibilidad • Matriz de Validación');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Initialize or reload from record
  useEffect(() => {
    if (record) {
      if (record.oficioRespuestaDetalle) {
        const off = record.oficioRespuestaDetalle;
        setNumeroOficio(off.numeroOficio);
        setTipoDocumento(off.tipoDocumento);
        setDestinatarioInstitucion(off.destinatarioInstitucion);
        setDestinatarioNombre(off.destinatarioNombre);
        setDestinatarioCargo(off.destinatarioCargo);
        setAsunto(off.asunto);
        setReferenciaAntecedente(off.referenciaAntecedente);
        setCuerpoTexto(off.cuerpoTexto);
        setConclusionesTecnicas(off.conclusionesTecnicas || '');
        setFirmanteNombre(off.firmanteNombre);
        setFirmanteCargo(off.firmanteCargo);
        setCopias(off.copias || '');
        setAnexos(off.anexos || '');
      } else {
        // Auto-generate starting draft based on incoming record
        const nextOficioNum = `GGPD-OF-2026-${String(Math.floor(Math.random() * 800) + 100).padStart(4, '0')}`;
        setNumeroOficio(nextOficioNum);
        setTipoDocumento('OFICIO');
        setDestinatarioInstitucion(record.remitenteInstitucion);
        setDestinatarioNombre(record.remitenteNombre || 'Autoridad Correspondiente');
        setDestinatarioCargo(record.remitenteCargo || 'Despacho');
        setAsunto(`Respuesta a Requerimiento: ${record.asunto}`);
        setReferenciaAntecedente(`${record.numeroDocumentoOrigen} (${record.correlativo})`);
        
        setCuerpoTexto(
          `Por medio de la presente, tengo a bien dirigirme a usted con la finalidad de dar oportuna respuesta a la comunicación de la referencia, mediante la cual remite solicitud institucional para la atención del requerimiento en materia de redes y servicios de distribución eléctrica.\n\nAl respecto, cumplo con informarle que la Gerencia General de Planificación de Distribución (GGPD), a través de su equipo técnico y de ingeniería, ha realizado el análisis técnico de rigor, procediendo con la debida articulación operativa y verificación en campo.`
        );

        setConclusionesTecnicas(
          record.tareaScmtpTitulo 
            ? `1. Se dio apertura al compromiso operativo SCMTP: ${record.tareaScmtpId || 'T-2026'} (${record.tareaScmtpTitulo}).\n2. Las coordinaciones operativas han emitido dictamen favorable bajo los estándares normativos CADAFE y normativas de confiabilidad del SEN.`
            : `1. Requerimiento evaluado y categorizado conforme a las prioridades del Plan de Contingencia SEN 2026.\n2. Se remite la presente para los fines consiguientes y prosecución administrativa.`
        );

        setFirmanteNombre('Ing. Adrián Correa');
        setFirmanteCargo('Gerente General de Distribución');
        setCopias('Ing. Carlos Reyes (Gerente Nacional de Planificación) • Archivo Central GGPD');
        setAnexos('Ficha Técnica de Evaluación • Constancia de Compromiso');
      }
      setSavedSuccess(false);
      setPreviewMode(false);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // AI Assistant generator
  const handleAIAssist = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setCuerpoTexto(
        `Por medio de la presente, en atención a su comunicación ${record.numeroDocumentoOrigen} de fecha ${record.fechaEmisionOrigen}, vinculada al expediente de radicación ${record.correlativo}, cumplo con informarle que la Gerencia General de Distribución (GGPD) ha culminado la evaluación técnica y de factibilidad integral.\n\nEn virtud de las atribuciones conferidas y tras la revisión efectuada por los especialistas de planificación, se emite el presente pronunciamiento formal ratificando la viabilidad del requerimiento e instruyendo las acciones de despliegue correspondientes de acuerdo con los planes operativos vigentes.`
      );
      if (record.tareaScmtpTitulo) {
        setConclusionesTecnicas(
          `1. Compromiso SCMTP ${record.tareaScmtpId || 'T-2026'} ejecutado bajo supervisión de ${record.responsableAsignado || 'Especialista GGPD'}.\n2. Se garantiza la observancia estricta de las normas de calidad y confiabilidad del SEN.\n3. Se solicita la remisión del acuse respectivo a los fines del cierre formal del trámite.`
        );
      }
      setIsGeneratingAI(false);
    }, 600);
  };

  const handleSave = (targetState: EstadoFirma = 'PENDIENTE_FIRMA') => {
    const updatedOficio: OficioRespuesta = {
      id: record.oficioRespuestaDetalle?.id || `of-resp-${Date.now()}`,
      correspondenciaOrigenId: record.id,
      correlativoOrigen: record.correlativo,
      numeroOficio: numeroOficio || 'GGPD-OF-2026-0000',
      tipoDocumento,
      destinatarioInstitucion,
      destinatarioNombre,
      destinatarioCargo,
      asunto,
      referenciaAntecedente,
      cuerpoTexto,
      conclusionesTecnicas,
      firmanteNombre,
      firmanteCargo,
      redactadoPor: user?.nombre || 'Analista de Planificación',
      estadoFirma: targetState,
      fechaCreacion: record.oficioRespuestaDetalle?.fechaCreacion || new Date().toISOString().split('T')[0],
      copias,
      anexos
    };

    onSaveDraft(record.id, updatedOficio);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-[#072146] w-full max-w-5xl rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-900/60 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <FileCheck className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase bg-purple-500/30 px-2 py-0.5 rounded-full">
                  Fase 2 • Redactor Asistido de Oficios
                </span>
                <span className="text-xs font-mono bg-purple-950/80 text-purple-200 px-2 py-0.5 rounded border border-purple-400/30">
                  Ref: {record.correlativo}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5">
                Generador de Oficio Formal de Respuesta GGPD 2026
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                previewMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{previewMode ? 'Modo Edición' : 'Vista Previa Oficial'}</span>
            </button>

            <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">
          {savedSuccess ? (
            <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                ¡Oficio de Respuesta Registrado Exitosamente!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                El documento ha sido enviado a la <strong>Bandeja de Firmas del Gerente General (Ing. Adrián Correa)</strong>.
              </p>
            </div>
          ) : previewMode ? (
            /* OFFICIAL INSTITUTIONAL PREVIEW */
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-inner border border-slate-300 font-serif max-w-3xl mx-auto space-y-6">
              
              {/* Membrete Oficial */}
              <div className="border-b-2 border-purple-900 pb-4 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-black tracking-wider text-purple-900 uppercase">
                    REPÚBLICA BOLIVARIANA DE VENEZUELA
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 uppercase">
                    MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">
                    CORPORACIÓN ELÉCTRICA NACIONAL (CORPOELEC)
                  </div>
                  <div className="text-[10px] text-purple-700 font-mono font-bold mt-1">
                    GERENCIA GENERAL DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                    {numeroOficio || 'GGPD-OF-2026-XXXX'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-1">
                    Caracas, {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Encabezado Protocolar */}
              <div className="text-xs space-y-1 pt-2">
                <div><strong>Ciudadano(a):</strong></div>
                <div className="font-bold text-sm text-slate-900">{destinatarioNombre}</div>
                <div className="text-slate-700">{destinatarioCargo}</div>
                <div className="font-semibold text-purple-900">{destinatarioInstitucion}</div>
                <div className="text-[11px] text-slate-500 italic mt-2">
                  <strong>Referencia / Antecedente:</strong> {referenciaAntecedente}
                </div>
              </div>

              {/* Asunto */}
              <div className="bg-slate-100 p-2.5 rounded text-xs font-sans">
                <strong>ASUNTO:</strong> {asunto}
              </div>

              {/* Cuerpo del Documento */}
              <div className="text-xs leading-relaxed text-justify space-y-4 whitespace-pre-line text-slate-800">
                {cuerpoTexto}
              </div>

              {/* Conclusiones / Puntos */}
              {conclusionesTecnicas && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-900 uppercase font-sans mb-1">
                    Conclusiones & Dictamen Técnico:
                  </div>
                  <div className="text-xs leading-relaxed text-justify whitespace-pre-line bg-purple-50/50 p-3 rounded border border-purple-100 text-slate-800">
                    {conclusionesTecnicas}
                  </div>
                </div>
              )}

              {/* Despedida Protocolar */}
              <div className="text-xs pt-4 text-slate-800">
                Sin otro particular al cual hacer referencia, reiterando nuestro compromiso con la estabilidad del Sistema Eléctrico Nacional (SEN), se suscribe.
              </div>

              {/* Firma Gerencial */}
              <div className="pt-10 text-center">
                <div className="inline-block border-t border-slate-700 pt-2 min-w-[280px]">
                  <div className="text-xs font-bold uppercase text-slate-900">
                    {firmanteNombre}
                  </div>
                  <div className="text-[11px] text-slate-700 font-sans">
                    {firmanteCargo}
                  </div>
                  <div className="text-[9px] text-purple-800 font-mono mt-0.5">
                    CORPOELEC • GGPD
                  </div>
                </div>
              </div>

              {/* Pie de Copias & Anexos */}
              <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-500 font-sans flex justify-between">
                <div>
                  <strong>C.c.:</strong> {copias}
                  <br />
                  <strong>Anexos:</strong> {anexos}
                </div>
                <div className="text-right">
                  <strong>Elaborado por:</strong> {user?.nombre || 'Analista GGPD'}
                  <br />
                  <strong>Código de Seguridad:</strong> ISO-15489-CORPO-2026
                </div>
              </div>

            </div>
          ) : (
            /* FORM EDITOR */
            <div className="space-y-5">
              {/* Context Bar */}
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-purple-900 dark:text-purple-200">
                    Documento de Entrada:
                  </span>{' '}
                  <span className="font-mono text-purple-700 dark:text-purple-300 font-semibold">
                    {record.numeroDocumentoOrigen}
                  </span>{' '}
                  <span className="text-slate-500">({record.remitenteInstitucion})</span>
                </div>

                {/* AI Button */}
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span>{isGeneratingAI ? 'Redactando con IA...' : 'Asistente IA: Redactar Respuesta'}</span>
                </button>
              </div>

              {/* Grid 1: N° Oficio, Tipo, Destinatario */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Número de Oficio Salida
                  </label>
                  <input
                    type="text"
                    value={numeroOficio}
                    onChange={(e) => setNumeroOficio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-purple-700 dark:text-purple-300"
                    placeholder="GGPD-OF-2026-0045"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="OFICIO">OFICIO FORMAL GGPD</option>
                    <option value="MEMORANDUM">MEMORÁNDUM INTERNO</option>
                    <option value="PUNTO_DE_CUENTA">PUNTO DE CUENTA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Referencia / Antecedente
                  </label>
                  <input
                    type="text"
                    value={referenciaAntecedente}
                    onChange={(e) => setReferenciaAntecedente(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Grid 2: Destinatario Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Institución Destinataria
                  </label>
                  <input
                    type="text"
                    value={destinatarioInstitucion}
                    onChange={(e) => setDestinatarioInstitucion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nombre del Destinatario
                  </label>
                  <input
                    type="text"
                    value={destinatarioNombre}
                    onChange={(e) => setDestinatarioNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Cargo del Destinatario
                  </label>
                  <input
                    type="text"
                    value={destinatarioCargo}
                    onChange={(e) => setDestinatarioCargo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Asunto Formal
                </label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Cuerpo del Oficio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Cuerpo del Documento (Fundamentación Técnica y Exposición de Motivos)
                </label>
                <textarea
                  rows={6}
                  value={cuerpoTexto}
                  onChange={(e) => setCuerpoTexto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono"
                />
              </div>

              {/* Conclusiones Técnicas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Dictamen & Conclusiones Técnicas
                </label>
                <textarea
                  rows={3}
                  value={conclusionesTecnicas}
                  onChange={(e) => setConclusionesTecnicas(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono"
                />
              </div>

              {/* Grid 3: Firmante, Copias, Anexos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Autoridad Firmante
                  </label>
                  <select
                    value={firmanteNombre}
                    onChange={(e) => {
                      setFirmanteNombre(e.target.value);
                      if (e.target.value.includes('Adrián Correa')) {
                        setFirmanteCargo('Gerente General de Distribución');
                      } else {
                        setFirmanteCargo('Gerente General de Gestión de Planificación');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Ing. Adrián Correa">Ing. Adrián Correa (Gerente General de Distribución)</option>
                    <option value="Ing. Carlos Reyes">Ing. Carlos Reyes (Gerente General de Planificación)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Con Copia a (C.c.)
                  </label>
                  <input
                    type="text"
                    value={copias}
                    onChange={(e) => setCopias(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Anexos Adjuntos
                  </label>
                  <input
                    type="text"
                    value={anexos}
                    onChange={(e) => setAnexos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#041426] border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#041426] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Plantilla Normalizada CORPOELEC 2026</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {previewMode && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave('BORRADOR_REVISION')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              Guardar Borrador
            </button>

            <button
              type="button"
              onClick={() => handleSave('PENDIENTE_FIRMA')}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar a Bandeja de Firmas</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
