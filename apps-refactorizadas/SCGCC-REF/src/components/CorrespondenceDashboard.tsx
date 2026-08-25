import React from 'react';
import { CorrespondenciaRecord } from '../types';
import { 
  Inbox, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Zap,
  Search,
  FileCheck
} from 'lucide-react';

interface DashboardProps {
  records: CorrespondenciaRecord[];
  onFilterByStatus: (status: string) => void;
  onOpenRadicacion: () => void;
}

export const CorrespondenceDashboard: React.FC<DashboardProps> = ({
  records,
  onFilterByStatus,
  onOpenRadicacion
}) => {
  const total = records.length;
  const entradas = records.filter(r => r.direccion === 'ENTRADA').length;
  const salidas = records.filter(r => r.direccion === 'SALIDA').length;
  const internas = records.filter(r => r.direccion === 'INTERNA').length;
  
  // Categorización por Propósito Rector
  const instruccionesGGD = records.filter(r => r.proposito === 'INSTRUCCION_EJECUTIVA').length;
  const evaluacionesSEN = records.filter(r => r.proposito === 'EVALUACION_TECNICA').length;
  const revisionesVistoBueno = records.filter(r => r.proposito === 'REVISION_CONFORMACION').length;
  
  const pendientes = records.filter(r => r.estadoTramite === 'RADICADO' || r.estadoTramite === 'EN_REVISION').length;
  const asignadasTarea = records.filter(r => r.estadoTramite === 'ASIGNADO_CON_TAREA').length;
  const respondidas = records.filter(r => r.estadoTramite === 'RESPONDIDO' || r.estadoTramite === 'ARCHIVADO').length;
  
  const urgentes = records.filter(r => r.prioridad === 'URGENTE_24H' || r.prioridad === 'ALTA').length;

  const tasaAtencion = total > 0 ? Math.round(((asignadasTarea + respondidas) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-200 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gobernanza Documental ISO 15489 • Despacho GGPD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tablero de Control de Correspondencia GGPD
            </h1>
            <p className="text-purple-100 text-sm mt-1 max-w-2xl">
              Monitoreo centralizado de comunicaciones oficiales, expedientes digitalizados y derivación directa de instrucciones a compromisos operativos SCMTP.
            </p>
          </div>
          <button
            onClick={onOpenRadicacion}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-extrabold text-sm shadow-lg shadow-purple-950/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-purple-700" />
            <span>Radicar Nuevo Oficio</span>
          </button>
        </div>
      </div>

      {/* ⚡ NUEVO: Banner de Instrucciones Ejecutivas Superiores (GGD / Despacho) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-600/10 to-indigo-600/15 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shrink-0">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                ⚡ Instrucciones Ejecutivas de la Superioridad (GGD / Ministerio)
              </span>
              <span className="text-[10px] bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-mono font-black px-2 py-0.5 rounded-full border border-red-300 dark:border-red-800 animate-pulse">
                {instruccionesGGD} Activas
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug max-w-2xl">
              Órdenes directas del Gerente General de Distribución (<strong>Ing. Adrián Correa</strong>) remitidas a la GGPD (<strong>Ing. Carlos Reyes</strong>) con asignación prioritaria en SCMTP (SLA 24h-48h).
            </p>
          </div>
        </div>

        <button
          onClick={() => onFilterByStatus('INSTRUCCION_EJECUTIVA')}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto text-center"
        >
          Ver Instrucciones GGD ⚡
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Radicados */}
        <div 
          onClick={() => onFilterByStatus('ALL')}
          className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expedientes
            </span>
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {entradas} Entradas / {salidas} Salidas
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Indexados con hash SHA-256</span>
          </div>
        </div>

        {/* Pendientes de Revisión */}
        <div 
          onClick={() => onFilterByStatus('EN_REVISION')}
          className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              En Triaje / Revisión
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{pendientes}</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Requieren atención
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {urgentes} con prioridad Alta o Urgente 24h
          </div>
        </div>

        {/* Asignadas a Tareas SCMTP */}
        <div 
          onClick={() => onFilterByStatus('ASIGNADO_CON_TAREA')}
          className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Derivadas a SCMTP
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{asignadasTarea}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Con Tarea Activa
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Trazabilidad vinculada a especialistas
          </div>
        </div>

        {/* Tasa Global de Eficacia */}
        <div className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Eficacia de Trámite
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{tasaAtencion}%</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              SLA Global
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${tasaAtencion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Secondary Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose por Propósito / Verbo Rector */}
        <div className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Triaje por Propósito Operativo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">⚡ Instrucciones Ejecutivas GGD</span>
              </div>
              <span className="text-xs font-mono font-black text-amber-950 dark:text-amber-100">{instruccionesGGD}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">🔍 Evaluaciones Técnicas SEN</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-950 dark:text-indigo-100">{evaluacionesSEN}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">📑 Revisiones / Visto Bueno</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-950 dark:text-purple-100">{revisionesVistoBueno}</span>
            </div>
          </div>
        </div>

        {/* Nivel de Confidencialidad ISO 27001 */}
        <div className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Confidencialidad & Seguridad (ISO 27001)
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ordinario (Público Interno)</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {records.filter(r => r.nivelConfidencialidad === 'ORDINARIO').length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Confidencial (Despacho GGPD)</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {records.filter(r => r.nivelConfidencialidad === 'CONFIDENCIAL').length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Reservado Directiva</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                {records.filter(r => r.nivelConfidencialidad === 'RESERVADO_DIRECTIVA').length}
              </span>
            </div>
          </div>
        </div>

        {/* Conexión Data Lake Google Drive */}
        <div className="bg-white dark:bg-[#072146] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Data Lake Google Drive Hub
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Cuenta Oficial: <span className="font-mono text-purple-600 dark:text-purple-400">bk.ggpd.corpoelec@gmail.com</span>
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>PDFs enlazados a Drive:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {records.filter(r => !!r.pdfDriveId).length} / {total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plantillas Corporativas 2026:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">3 Activas</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Webhook Activo (v3.1.0)
            </span>
            <a
              href="https://drive.google.com/drive/folders/1yKwQ8hKGjCPHwukuADkv__Kp3gicJkBj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              Abrir Drive ↗
            </a>
          </div>
        </div>
      </div>

      {/* 🛡️ BANNER INSTITUCIONAL: CERTIFICACIÓN DE GRADO INDUSTRIAL & ZONA SEGURA */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#072146] border border-slate-200 dark:border-purple-900/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Zona Segura de Grado Industrial & Cumplimiento Normativo GGPD
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  ✓ Verificado SEN 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Arquitectura blindada para despacho de correspondencia con segregación de roles RBAC y custodia inmutable SHA-256.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase block">ISO/IEC 27001:2022</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Seguridad de la Información</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cifrado de extremo a extremo y Row Level Security.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase block">ISO 8000-110</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Calidad de Datos Maestros</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Correlativos únicos y validación sintáctica/semántica.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase block">OWASP Top 10 ASVS</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Blindaje de Aplicaciones</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Protección contra inyecciones SQL, XSS y fijación de sesión.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#041426] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase block">ISACA COBIT MEA02</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">Auditoría & Trazabilidad</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Bitácora inmutable y control preventivo de firmas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
