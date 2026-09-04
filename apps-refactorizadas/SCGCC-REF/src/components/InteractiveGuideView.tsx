import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Workflow, 
  Send, 
  Layers, 
  Building2, 
  Users, 
  FileCheck2, 
  Lock, 
  Info, 
  Printer, 
  Award,
  ChevronDown,
  ChevronUp,
  MessageSquareOff,
  Zap,
  HelpCircle,
  FolderLock
} from 'lucide-react';
import { ActiveTabType } from './Navbar';

interface InteractiveGuideViewProps {
  onNavigateToRadicacion: () => void;
  onNavigateToTab: (tab: ActiveTabType) => void;
}

export const InteractiveGuideView: React.FC<InteractiveGuideViewProps> = ({
  onNavigateToRadicacion,
  onNavigateToTab
}) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [selectedCase, setSelectedCase] = useState<number>(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Induction State with LocalStorage Persistence
  const [inductionSigned, setInductionSigned] = useState<boolean>(() => {
    const saved = localStorage.getItem(`scgcc_induction_${user?.username || 'generic'}`);
    return !!saved;
  });
  const [inductionTimestamp, setInductionTimestamp] = useState<string | null>(() => {
    const saved = localStorage.getItem(`scgcc_induction_${user?.username || 'generic'}`);
    return saved ? JSON.parse(saved).timestamp : null;
  });

  const handleSignInduction = () => {
    const record = {
      user: user?.nombre || 'Analista Operativo',
      username: user?.username || 'anon',
      cargo: user?.cargo || 'Especialista',
      timestamp: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }),
      isoStandard: 'ISO 9001:2015 (Cláusula 7.2 / 7.3) & ISACA COBIT 2019 (MEA02)',
      hashIntegridad: `IND-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`
    };
    localStorage.setItem(`scgcc_induction_${user?.username || 'generic'}`, JSON.stringify(record));
    setInductionSigned(true);
    setInductionTimestamp(record.timestamp);
  };

  const handlePrintGuide = () => {
    window.print();
  };

  const realWorldCases = [
    {
      id: 1,
      tag: 'PRIORIDAD CRÍTICA · 24H',
      tagColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      title: 'Caso A: "Memorándum Urgente pidiendo Transformadores de Contingencia"',
      subtitle: 'Ejemplo Real: Remisión de GGD para dos bancos 3x50 kVA en el Estado La Guaira.',
      origen: 'GGD-NR-0764-202608 (GGD) ➔ Ing. Carlos Reyes / Despacho GGPD',
      steps: [
        {
          num: '01',
          title: 'Radicación de Entrada en < 60 segundos',
          desc: 'Pulsa el botón "Radicar Entrada". Selecciona Tipo: MEMORÁNDUM, Nivel: CONFIDENCIAL, Prioridad: URGENTE_24H y Propósito: INSTRUCCIÓN EJECUTIVA.',
          tip: 'Marca la casilla "Requiere Respuesta Formal: SÍ" para que el semáforo SLA de 5 días hábiles se active de inmediato.'
        },
        {
          num: '02',
          title: 'Derivación y Enlace Directo a SCMTP',
          desc: 'En la fila del registro creado, pulsa "Derivar Tarea a SCMTP". Ingresa el título del compromiso técnico y asígnalo al especialista de área (ej. T.S.U. Josué Pacheco).',
          tip: 'Se genera automáticamente el código de compromiso T-2026-0027, blindando la responsabilidad técnica.'
        },
        {
          num: '03',
          title: 'Emisión del Oficio de Salida y Cierre con Acuse',
          desc: 'Una vez completada la evaluación técnica, ve a la "Bandeja de Firmas", redacta el oficio de pronunciamiento con el asistente IA y, al ser firmado, registra el Número de Guía de Despacho físico.',
          tip: 'El estado pasa automáticamente a "RESPONDIDO" y queda archivado en la bóveda inmutable.'
        }
      ],
      normativa: 'ISO 15489-1 (Trazabilidad de Registro) e ISO 9001 (Cumplimiento de SLA).'
    },
    {
      id: 2,
      tag: 'INFORMATIVO · ARCHIVO',
      tagColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      title: 'Caso B: "Circular de Talento Humano sobre Día No Laborable / Asueto"',
      subtitle: 'Ejemplo Real: Circular CGGTH-0004-07-2026 sobre cambio de día no laborable por convención colectiva.',
      origen: 'Gerencia General de Talento Humano ➔ Todo el Personal CORPOELEC',
      steps: [
        {
          num: '01',
          title: 'Radicar como Notificación General',
          desc: 'Crear registro seleccionando Tipo: CIRCULAR, Prioridad: MEDIA, Propósito: INFORMATIVO_NOTIFICACIÓN.',
          tip: 'Deja la opción "Requiere Respuesta" desmarcada (NO requiere oficio de salida).'
        },
        {
          num: '02',
          title: 'Cargar el Archivo Digital y Archivar',
          desc: 'Pega el enlace o nombre del archivo PDF oficial y cambia el estado del trámite a "ARCHIVADO".',
          tip: 'Queda indexado en el Libro de Radicación para que cualquier trabajador o auditor lo consulte en 1 segundo.'
        }
      ],
      normativa: 'ISO 15489 (Bóveda Centralizada de Documentos Institucionales).'
    },
    {
      id: 3,
      tag: 'EVALUACIÓN TÉCNICA · SEN',
      tagColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      title: 'Caso C: "Solicitud de Disminución de Demanda Contratada de Gran Usuario"',
      subtitle: 'Ejemplo Real: Memorándum GGD-NR-0752 remitiendo solicitud de gran usuario para adecuación de facturación.',
      origen: 'Gerencia General de Comercialización / GGD ➔ GGPD Planificación',
      steps: [
        {
          num: '01',
          title: 'Radicación con Propósito Técnico',
          desc: 'Radicar con Tipo: MEMORÁNDUM, Propósito: EVALUACIÓN TÉCNICA, Prioridad: ALTA. Asignar fecha límite conforme al SLA ministerial.',
          tip: 'Permite a los ingenieros de planificación verificar la carga en subestación antes de emitir dictamen.'
        },
        {
          num: '02',
          title: 'Redacción del Dictamen Técnico Institucional',
          desc: 'Al redactar la respuesta en el módulo de firmas, el Asistente IA estructura los antecedentes, cuerpo y conclusiones técnicas con sello oficial.',
          tip: 'Se incluye copia al Gerente General y a la División de Facturación.'
        }
      ],
      normativa: 'ISO 55000 (Gestión de Activos Eléctricos) e ISACA COBIT 2019 (Segregación de Funciones).'
    }
  ];

  const glossaryItems = [
    {
      term: 'Correlativo RAD-GGPD-2026-XXXX',
      plain: 'La cédula de identidad única de la carta. No se puede repetir ni borrar.',
      why: 'Garantiza que ningún oficio se "pierda" y sirve como referencia legal obligatoria ante auditorías.'
    },
    {
      term: 'Semáforo SLA (Acuerdo de Nivel de Servicio)',
      plain: 'El contador regresivo de días que quedan para dar respuesta formal antes de incurrir en mora.',
      why: 'Norma ISO 9001: erradica el silencio administrativo y optimiza la atención de contingencias eléctricas.'
    },
    {
      term: 'Derivación a SCMTP',
      plain: 'El puente que convierte una carta en una tarea de ingeniería para el equipo de especialistas.',
      why: 'Flujo Desacoplado DOC-GGPD-2026-GOB-001: la correspondencia no es una tarea; se transforma en un compromiso medible.'
    },
    {
      term: 'Guía de Despacho con Acuse',
      plain: 'El número de comprobante físico o digital que demuestra que el destinatario recibió el oficio.',
      why: 'Principio de No-Repudio (ISACA COBIT MEA02): impide que el destinatario alegue que nunca fue notificado.'
    },
    {
      term: 'Zona Segura Cifrada (ISO 27001)',
      plain: 'El blindaje tecnológico que asegura que cada cambio de estado queda auditado con nombre, fecha y hora.',
      why: 'Seguridad de la información de grado industrial: cero manipulación de fechas ni alteración de registros.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1600px] mx-auto">
      
      {/* 1. Header Banner Pedagógico Institucional */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-6 sm:p-8 lg:p-10 border border-purple-800/40 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-6 hidden md:block opacity-10">
          <GraduationCap className="w-64 h-64 text-purple-200" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ESTÁNDAR PEDAGÓGICO GGPD-EDU-01
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-mono font-bold">
              ISO 9001 · ISO 15489 · COBIT MEA02
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
              ⚡ TIEMPO DE LECTURA: 4 MINUTOS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Guía Operativa & Casos de Uso SEN <span className="text-purple-400">SCGCC V1.0</span>
          </h1>

          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed font-medium">
            Manual interactivo y pedagógico para analistas, secretarias y gerentes. Aprende en 4 minutos cómo registrar, derivar y responder la correspondencia institucional sin fricciones, sin pretextos de lectura y bajo estricto cumplimiento normativo.
          </p>

          {/* Quick Stats / Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col">
              <span className="text-[11px] font-mono text-purple-200 uppercase font-semibold">Cero WhatsApp</span>
              <span className="text-sm font-black text-amber-300 mt-0.5">Canal Legal Único</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col">
              <span className="text-[11px] font-mono text-purple-200 uppercase font-semibold">Radicación</span>
              <span className="text-sm font-black text-emerald-300 mt-0.5">&lt; 60 Segundos</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col">
              <span className="text-[11px] font-mono text-purple-200 uppercase font-semibold">Derivación</span>
              <span className="text-sm font-black text-purple-300 mt-0.5">Enlace a SCMTP</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col">
              <span className="text-[11px] font-mono text-purple-200 uppercase font-semibold">No-Repudio</span>
              <span className="text-sm font-black text-cyan-300 mt-0.5">Inducción Auditada</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Pills between Pedagogical Modules */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'intro', label: '1. El Porqué del Sistema', icon: MessageSquareOff },
          { id: 'flujo', label: '2. Anatomía del Trámite', icon: Workflow },
          { id: 'casos', label: '3. Casos de Uso de la Vida Real', icon: Zap },
          { id: 'glosario', label: '4. Glosario Técnico-Práctico', icon: BookOpen },
          { id: 'induccion', label: '5. Declaración de No-Repudio', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-600/30 scale-102'
                  : 'bg-white dark:bg-[#072146] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-purple-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: EL PORQUÉ DE SCGCC (Erradicación de WhatsApp y Desorden) */}
      {/* ========================================================================= */}
      {activeSection === 'intro' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Tarjeta: El Problema Tradicional */}
            <div className="p-6 sm:p-7 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold">
                  <MessageSquareOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-900 dark:text-rose-200">
                    El Riesgo del "Canal Informal" (WhatsApp / Correos Sueltos)
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-400 font-mono">
                    PATOLOGÍA ORGANIZACIONAL HISTÓRICA
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  ❌ <strong>Pérdida de Antecedentes:</strong> Si el Ministro o Gerente General pide una respuesta técnica por un grupo de WhatsApp, a los 5 días el chat se borra o se pierde en el teléfono.
                </p>
                <p>
                  ❌ <strong>Nadie se hace Responsable:</strong> No existe constancia de a qué ingeniero se le asignó ni cuántos días quedan para entregar el dictamen.
                </p>
                <p>
                  ❌ <strong>Vulnerabilidad Legal:</strong> Ante una inspección o auditoría del Estado, un mensaje de WhatsApp <em>no tiene validez probatoria de custodia</em>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-100/80 dark:bg-rose-900/40 text-[11px] font-mono text-rose-900 dark:text-rose-200 font-bold">
                ⚠️ DICTAMEN DOC-GGPD-2026-GOB-001: «Lo que no está radicado en SCGCC, no existe administrativamente para la GGPD».
              </div>
            </div>

            {/* Tarjeta: La Solución SCGCC */}
            <div className="p-6 sm:p-7 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                    La Solución Blindada: SCGCC V1.0
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                    ESTÁNDAR ISO 15489 / ISO 27001 / ISACA COBIT
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  ✅ <strong>Radicación Inmediata:</strong> Todo memo, oficio o circular recibe un código irrepetible (<code className="font-mono bg-purple-100 dark:bg-purple-950 px-1 py-0.5 rounded text-purple-700 dark:text-purple-300 font-bold">RAD-GGPD-2026-XXXX</code>) en menos de 1 minuto.
                </p>
                <p>
                  ✅ <strong>Control de Tiempos (SLA):</strong> El sistema avisa cuántos días faltan para responder, protegiendo a la gerencia de retrasos.
                </p>
                <p>
                  ✅ <strong>Puente Directo a Ingeniería:</strong> Con 1 clic se abre el compromiso en <strong>SCMTP</strong> para que el equipo de campo o proyectos ejecute el trabajo.
                </p>
                <p>
                  ✅ <strong>Redacción Asistida con IA:</strong> Genera oficios de respuesta formales en 3 segundos con formato institucional homologado.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-100/80 dark:bg-emerald-900/40 text-[11px] font-mono text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-between">
                <span>🛡️ CERTIFICACIÓN DE GRADO INDUSTRIAL SEN</span>
                <span className="text-xs">CERO PAPEL</span>
              </div>
            </div>

          </div>

          {/* Banner de Acción Rápida */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                ¿Listo para ver cómo funciona el ciclo completo de un documento?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pasa al Módulo 2 para conocer las 3 etapas del flujo operativo.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('flujo')}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-600/20 shrink-0"
            >
              <span>Ver Anatomía del Trámite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: ANATOMÍA DEL TRÁMITE (Las 3 Fases) */}
      {/* ========================================================================= */}
      {activeSection === 'flujo' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* FASE 1: RADICACIÓN */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/40 space-y-4 relative overflow-hidden shadow-xs hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">01</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  ENTRADA
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Radicación Inteligente
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El documento físico o digital ingresa al despacho. Se ingresan sus datos básicos (Nro. Origen, Remitente, Asunto) y el sistema asigna el correlativo oficial y calcula el semáforo SLA.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/40 text-[11px] font-mono space-y-1">
                <div className="text-purple-600 dark:text-purple-400 font-bold">Campos Clave:</div>
                <div className="text-slate-600 dark:text-slate-400">• Nro. Oficio Origen</div>
                <div className="text-slate-600 dark:text-slate-400">• Propósito & Prioridad</div>
                <div className="text-slate-600 dark:text-slate-400">• PDF Digital de Respaldo</div>
              </div>
            </div>

            {/* FASE 2: TRÁMITE Y SCMTP */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/40 space-y-4 relative overflow-hidden shadow-xs hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">02</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  PROCESAMIENTO
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Derivación Técnica
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Si la carta requiere un estudio, inspección en subestación o cálculo presupuestario, se deriva con un clic a <strong>SCMTP</strong> asignando un responsable con fecha límite.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/40 text-[11px] font-mono space-y-1">
                <div className="text-indigo-600 dark:text-indigo-400 font-bold">Conexión SCMTP:</div>
                <div className="text-slate-600 dark:text-slate-400">• Código T-2026-XXXX</div>
                <div className="text-slate-600 dark:text-slate-400">• Ingeniero Responsable</div>
                <div className="text-slate-600 dark:text-slate-400">• Seguimiento de Avance</div>
              </div>
            </div>

            {/* FASE 3: RESPUESTA Y DESPACHO */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/40 space-y-4 relative overflow-hidden shadow-xs hover:border-purple-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">03</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  SALIDA & ACUSE
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Firma & Despacho
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Se redacta el oficio de pronunciamiento (con asistencia IA), se envía a firma gerencial y se registra el comprobante de entrega (Nro. de Guía de Acuse). El trámite queda cerrado.
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/40 text-[11px] font-mono space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">Cierre Legal:</div>
                <div className="text-slate-600 dark:text-slate-400">• Número GGPD-OF-2026-XXXX</div>
                <div className="text-slate-600 dark:text-slate-400">• Nro. Guía de Entrega</div>
                <div className="text-slate-600 dark:text-slate-400">• Estado: RESPONDIDO</div>
              </div>
            </div>

          </div>

          {/* Visual Interactive Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToRadicacion}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Probar Formulario de Radicación Ahora</span>
            </button>
            <button
              onClick={() => onNavigateToTab('firmas')}
              className="px-5 py-2.5 rounded-2xl bg-white dark:bg-[#072146] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-purple-900/40 text-xs font-bold transition-all flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Ver Bandeja de Firmas en Vivo</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: CASOS DE USO DE LA VIDA REAL (Simulador Interactivo) */}
      {/* ========================================================================= */}
      {activeSection === 'casos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Selector de Casos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {realWorldCases.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(idx)}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-2 ${
                  selectedCase === idx
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 dark:border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-white dark:bg-[#072146] border-slate-200 dark:border-purple-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${c.tagColor}`}>
                    {c.tag}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {c.title}
                </h4>
              </button>
            ))}
          </div>

          {/* Tarjeta Detallada del Caso Seleccionado */}
          {realWorldCases[selectedCase] && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/40 space-y-6 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border mb-1.5 ${realWorldCases[selectedCase].tagColor}`}>
                    {realWorldCases[selectedCase].tag}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {realWorldCases[selectedCase].title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {realWorldCases[selectedCase].subtitle}
                  </p>
                </div>
                <div className="text-left sm:text-right font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                  {realWorldCases[selectedCase].origen}
                </div>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  ¿Qué debe hacer el analista paso a paso?
                </h4>
                
                <div className="space-y-3">
                  {realWorldCases[selectedCase].steps.map(step => (
                    <div key={step.num} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/30 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                        {step.num}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {step.title}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {step.desc}
                        </p>
                        <div className="text-[11px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-900/60 mt-1 inline-block">
                          💡 <strong>Consejo Práctico:</strong> {step.tip}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sello Normativo */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white text-xs font-mono flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sustento Normativo: <strong>{realWorldCases[selectedCase].normativa}</strong></span>
                </span>
                <span className="text-[10px] text-purple-200 hidden sm:inline">PROCESO GGPD-SEC-01</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 4: GLOSARIO TÉCNICO-PRÁCTICO (Traductor SEN) */}
      {/* ========================================================================= */}
      {activeSection === 'glosario' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#072146] border border-purple-200 dark:border-purple-900/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Glosario Rápido SEN: "Del Tecnicismo a la Realidad"
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Conceptos fundamentales explicados en cristiano para evitar confusiones en el día a día.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {glossaryItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-purple-900/40 space-y-2">
                  <div className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.term}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                    👉 {item.plain}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    <strong>¿Por qué es obligatorio?</strong> {item.why}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 5: DECLARACIÓN DE INDUCCIÓN Y NO-REPUDIO (ISO 9001 / COBIT) */}
      {/* ========================================================================= */}
      {activeSection === 'induccion' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#072146] to-purple-950 text-white border border-purple-800/40 shadow-xl space-y-6 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-amber-400 font-bold shadow-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
                    PRINCIPIO DE NO-REPUDIO OPERATIVO
                  </span>
                  <h3 className="text-lg font-black mt-0.5">
                    Constancia de Inducción & Capacitación Acreditada
                  </h3>
                </div>
              </div>

              {inductionSigned && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>INDUCCIÓN COMPLETADA</span>
                </span>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3 text-xs text-purple-100 leading-relaxed">
              <p className="font-semibold text-white">
                Declaración Institucional del Analista / Operador (ISO 9001:2015 Cláusula 7.2 / ISACA COBIT MEA02):
              </p>
              <blockquote className="italic border-l-2 border-purple-400 pl-3 text-purple-200">
                «Declaro formalmente haber revisado y comprendido la totalidad de los módulos de la Guía Operativa de SCGCC V1.0, incluyendo la anatomía de los 11 expedientes canónicos, el flujo de derivación a SCMTP, los tiempos de respuesta SLA y el protocolo de despacho con acuse. Reconozco que todo trámite de correspondencia de la GGPD debe gestionarse exclusivamente por este sistema institucional.»
              </blockquote>
            </div>

            {/* User Details & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs font-mono text-purple-200 space-y-1 w-full sm:w-auto">
                <div>Usuario: <strong>{user?.nombre || 'Usuario Conectado'}</strong> ({user?.username || 'usr'})</div>
                <div>Cargo: <strong>{user?.cargo || 'Especialista de Planificación'}</strong></div>
                {inductionTimestamp && (
                  <div className="text-emerald-300">Acreditado el: <strong>{inductionTimestamp}</strong></div>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handlePrintGuide}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Resumen</span>
                </button>

                {!inductionSigned ? (
                  <button
                    onClick={handleSignInduction}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Inducción & Aceptar</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2.5 rounded-xl bg-emerald-600/40 text-emerald-200 text-xs font-bold border border-emerald-500/40 cursor-default flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Conformidad Registrada</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
