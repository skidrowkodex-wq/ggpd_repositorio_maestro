import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Sparkles, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Share2, 
  Copy, 
  Loader2,
  BookOpen,
  FolderDown,
  Layers
} from 'lucide-react';
import { UserProfile, MinutaReunion, TareaCompromiso } from '../types';

interface IsoDocsExporterModalProps {
  currentProfile: UserProfile;
  activeMinuta?: MinutaReunion | null;
  compromisos?: TareaCompromiso[];
  onClose: () => void;
}

export const IsoDocsExporterModal: React.FC<IsoDocsExporterModalProps> = ({
  currentProfile,
  activeMinuta,
  compromisos = [],
  onClose,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'operativo' | 'admin' | 'tecnico' | 'reporte'>('operativo');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate dynamic text for minutas/compromisos report
  const generateReporteContent = () => {
    const totalCompromisos = compromisos.length;
    const concluidos = compromisos.filter(c => c.estado === 'Concluido').length;
    const enProceso = compromisos.filter(c => c.estado === 'En Proceso').length;
    const noIniciados = compromisos.filter(c => c.estado === 'No Iniciado').length;

    let text = `DOCUMENTO DE REPORTE Y SEGUIMIENTO OPERATIVO BAJO NORMA ISO 9001
CÓDIGO: GGPD-SGM-REP-004 | VERSIÓN: v2.0 ISO
GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC
APROBADO POR: Ing. Adrian Correa (Gerente de Gestión de Planificación de Distribución)
FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-VE')}

================================================================================
REPORTE CONSOLIDADO DE MINUTA Y COMPROMISOS OPERATIVOS GGPD
================================================================================

1. INFORMACIÓN DE LA MINUTA ACTIVA
--------------------------------------------------------------------------------
- Número Correlativo: ${activeMinuta ? `#${activeMinuta.numero}` : 'Consolidado General (Todas las Minutas)'}
- Fecha de la Reunion: ${activeMinuta ? activeMinuta.fecha : 'Múltiples'}
- Coordinador: ${activeMinuta ? activeMinuta.coordinador : 'Ing. Adrian Correa'}
- Unidad Organizativa: Gerencia de Gestión de Planificación de Distribución
- Objetivo: ${activeMinuta ? activeMinuta.objetivo : 'Seguimiento integral de proyectos y compromisos de la GGPD'}

2. RESUMEN DE CUMPLIMIENTO OPERATIVO
--------------------------------------------------------------------------------
- Total de Compromisos Registrados: ${totalCompromisos}
- Tareas Concluidas: ${concluidos} (${totalCompromisos > 0 ? Math.round((concluidos / totalCompromisos) * 100) : 0}%)
- Tareas En Proceso: ${enProceso} (${totalCompromisos > 0 ? Math.round((enProceso / totalCompromisos) * 100) : 0}%)
- Tareas No Iniciadas: ${noIniciados} (${totalCompromisos > 0 ? Math.round((noIniciados / totalCompromisos) * 100) : 0}%)

3. TABLA DETALLADA DE COMPROMISOS
--------------------------------------------------------------------------------
`;

    if (compromisos.length === 0) {
      text += `No hay compromisos registrados en la vista actual.\n`;
    } else {
      compromisos.forEach((c, idx) => {
        text += `\n[${idx + 1}] COMPROMISO ID: ${c.id}\n`;
        text += `    - Descripción: ${c.compromiso}\n`;
        text += `    - Responsable: ${c.responsable}\n`;
        text += `    - Estado: ${c.estado.toUpperCase()}\n`;
        text += `    - Prioridad: ${c.prioridad}\n`;
        text += `    - Área de Gestión: ${c.areaGestion || 'General'}\n`;
        text += `    - Fecha Límite: ${c.plazoText || 'Sin fecha'}\n`;
        if (c.observaciones) {
          text += `    - Observaciones: ${c.observaciones}\n`;
        }
      });
    }

    text += `\n--------------------------------------------------------------------------------\n`;
    text += `Documento generado automáticamente por el Sistema de Seguimiento GGPD CORPOELEC.\n`;
    text += `Emisión controlada para uso oficial de la Gerencia de Gestión de Planificación de Distribución.\n`;

    return text;
  };

  const docData = {
    operativo: {
      code: 'GGPD-SGM-IO-001',
      title: 'INSTRUCTIVO OPERATIVO',
      subtitle: 'PROCEDIMIENTO DE CARGA DE MINUTAS IA, SEGUIMIENTO DE COMPROMISOS Y GESTIÓN DE PENDIENTES',
      system: 'Sistema de Seguimiento de Minutas y Proyectos Operativos PRTSEN / POA',
      version: 'v2.0 ISO',
      jefeUnidad: 'Ingeniero Adrian Correa — Gerente de Gestión de Planificación de Distribución',
      content: `DOCUMENTO CONTROLADO BAJO NORMA ISO 9001:2015 / ISO 27001
CÓDIGO: GGPD-SGM-IO-001 | VERSIÓN: v2.0 ISO
GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC
APROBADO POR: Ing. Adrian Correa (Gerente de Gestión de Planificación de Distribución)

================================================================================
INSTRUCTIVO OPERATIVO: CARGA DE MINUTAS IA Y SEGUIMIENTO DE COMPROMISOS
================================================================================

1. PROPÓSITO Y ALCANCE
--------------------------------------------------------------------------------
Este instructivo operativo establece el procedimiento normalizado para el procesamiento inteligente de minutas de reunión en formato PDF, la extracción asistida por Inteligencia Artificial (Gemini 3.6 Flash), la asignación de responsables, el control de compromisos y la gestión de tareas pendientes por áreas organizativas de la GGPD.

Aplica a todo el personal técnico, analistas, coordinadores y gerentes adscritos a la Gerencia de Gestión de Planificación de Distribución de CORPOELEC.

2. REQUISITOS PREVIOS Y CREDENCIALES
--------------------------------------------------------------------------------
- Cuenta de usuario autenticada en el Sistema de Gestión de Minutas.
- Permisos asignados según el Rol de Usuario (RBAC) conforme a la matriz ISO 27001.
- Documento de minuta de reunión digitalizado en PDF, imagen o transcripción de texto.
- Conexión autorizada al directorio corporativo de Google Drive (bk.ggpd.corpoelec@gmail.com).

3. PROCEDIMIENTO PASO A PASO
--------------------------------------------------------------------------------
Paso 1 — Carga de la Minuta con IA:
  - Haga clic en el botón "Cargar Minuta IA" en el menú principal o barra lateral.
  - Arrastre o seleccione el archivo PDF (ej: MINUTA_20260730_26-0004.pdf) o explore el directorio sincronizado de Google Drive.
  - El motor analítico de Gemini procesará el documento en segundos, extrayendo automáticamente:
    * Número correlativo y fecha de la minuta.
    * Participantes y asistencias.
    * Tabla de compromisos asignados con responsable, descripción y fecha límite.
    * Lista de pendientes clasificados por área (Database, Automatización, Tecnología, etc.).

Paso 2 — Validación y Confirmación de Datos Extraídos:
  - Verifique en la pantalla de previsualización que los datos parseados coinciden fielmente con el documento original.
  - Edite o ajuste cualquier responsable o fecha si fuese necesario.
  - Haga clic en "Guardar y Registrar Minuta". El sistema consolidará automáticamente los compromisos en la base de datos central.

Paso 3 — Monitoreo de Compromisos y Cambio de Estado:
  - Ingrese al módulo "Compromisos Asignados" o "Flujo Kanban".
  - Actualice el estado de avance (No Iniciado, En Proceso, Concluido, Cancelado).
  - Registre observaciones de avance técnico para mantener la trazabilidad de auditoría.

4. BUENAS PRÁCTICAS Y CONTROLES DE CALIDAD ISO 8000
--------------------------------------------------------------------------------
- Asigne siempre un único responsable principal por compromiso para evitar ambigüedades.
- Verifique las fechas ISO (YYYY-MM-DD) para garantizar alertas tempranas de vencimiento.
- Realice revisiones semanales de la pestaña "Pendientes por Área" en las reuniones de seguimiento de la GGPD.

---
Elaborado por: Coordinación de Automatización y Sistemas GGPD
Aprobado por: Ing. Adrian Correa — Gerente de Gestión de Planificación de Distribución`
    },
    admin: {
      code: 'GGPD-SGM-IA-002',
      title: 'INSTRUCTIVO ISO PARA ADMINISTRADORES Y GOBIERNO DE DATOS',
      subtitle: 'GUÍA DE ADMINISTRACIÓN DE USUARIOS, CONTROL DE ACCESO RBAC Y AUDITORÍA DE CALIDAD',
      system: 'Sistema de Seguimiento de Minutas y Proyectos Operativos PRTSEN / POA',
      version: 'v2.0 ISO',
      jefeUnidad: 'Ingeniero Adrian Correa — Gerente de Gestión de Planificación de Distribución',
      content: `DOCUMENTO CONTROLADO BAJO NORMA ISO 27001:2022 / ISO 8000-110
CÓDIGO: GGPD-SGM-IA-002 | VERSIÓN: v2.0 ISO
GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC
APROBADO POR: Ing. Adrian Correa (Gerente de Gestión de Planificación de Distribución)

================================================================================
INSTRUCTIVO ISO DE ADMINISTRACIÓN, SEGURIDAD RBAC Y GOBIERNO DE DATOS
================================================================================

1. PROPÓSITO Y ALCANCE
--------------------------------------------------------------------------------
Definir los lineamientos de administración del sistema, creación y mantenimiento de usuarios, asignación de roles y permisos (RBAC), control de auditoría de eventos y evaluación de la calidad de datos (Scoring ISO 8000) en el Sistema de Gestión de Minutas y Proyectos Operativos de la GGPD.

2. MATRIZ DE ROLES Y PERMISOS (ISO 27001 RBAC)
--------------------------------------------------------------------------------
- Administrador Sistema (admin): Acceso total, gestión de usuarios, auditoría, configuración de sincronización Drive/Supabase y cierre de compromisos.
- Gerente / Coordinador (gerente): Lectura de resúmenes ejecutivos KGI/KPI, visualización de minutas, aprobación de compromisos y asignación de prioridades.
- Analista de Planificación (analista): Carga de minutas IA, actualización de estados de compromisos propios y registro de observaciones de avance.
- Visualizador / Auditor (auditor): Acceso en modo lectura para revisiones de cumplimiento de metas POA / PRTSEN.

3. PROCEDIMIENTO DE GESTIÓN DE USUARIOS
--------------------------------------------------------------------------------
- Para registrar un nuevo usuario en la plataforma, ingrese a "Gestión Usuarios ISO".
- Complete los datos requeridos: Nombre Completo, Usuario Corporativo, Correo ELECTRÓNICO, Rol Asignado y Área de Gestión.
- El sistema aplicará la política de cambio rápido de perfil simulado para auditorías e inspección de vistas de roles.

4. GOBIERNO DE DATOS Y TRAZABILIDAD (ISO 8000)
--------------------------------------------------------------------------------
- Todo evento de creación, actualización o cambio de estado genera un registro inmutable en el Log de Auditoría ISO.
- Se evalúa automáticamente la integridad referencial, consistencia de fechas y porcentaje de avance de tareas.

---
Elaborado por: Administración de Sistemas y Gobierno de Datos GGPD
Aprobado por: Ing. Adrian Correa — Gerente de Gestión de Planificación de Distribución`
    },
    tecnico: {
      code: 'GGPD-SGM-DT-003',
      title: 'DOCUMENTO TÉCNICO Y ARQUITECTURA DE SOFTWARE',
      subtitle: 'ARQUITECTURA FULL-STACK, MOTOR DE IA GEMINI 3.6 FLASH E INTEGRACIÓN DE SERVICIOS',
      system: 'Sistema de Seguimiento de Minutas y Proyectos Operativos PRTSEN / POA',
      version: 'v2.0 ISO',
      jefeUnidad: 'Ingeniero Adrian Correa — Gerente de Gestión de Planificación de Distribución',
      content: `DOCUMENTO CONTROLADO BAJO NORMA ISO/IEC 25010 / ISO 27001
CÓDIGO: GGPD-SGM-DT-003 | VERSIÓN: v2.0 ISO
GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC
APROBADO POR: Ing. Adrian Correa (Gerente de Gestión de Planificación de Distribución)

================================================================================
DOCUMENTO TÉCNICO: ARQUITECTURA DE SOFTWARE Y COMPONENTES DE IA
================================================================================

1. ARQUITECTURA GENERAL DEL SISTEMA
--------------------------------------------------------------------------------
El sistema utiliza una arquitectura Full-Stack moderna basada en Node.js Express + TypeScript en el servidor, acoplado con React 19, Tailwind CSS y Motion en el cliente web.

Capa de Presentación (Frontend):
  - React 19 con componentes modulares tipados en TypeScript.
  - Diseño responsivo adaptativo con Tailwind CSS y barra lateral colapsable.
  - Visualización de datos con Recharts (Dashboards KGI / KPI v2.0 PM).

Capa de Servicios y Servidor (Backend API):
  - Servidor Express con endpoints REST securizados.
  - Procesamiento analítico de archivos PDF / Imágenes mediante @google/genai SDK.
  - Conexión vía Google Drive API v3 para sincronización directa con bk.ggpd.corpoelec@gmail.com.

2. MOTOR DE INTELIGENCIA ARTIFICIAL (GEMINI 3.6 FLASH)
--------------------------------------------------------------------------------
El motor de parsing utiliza Gemini 3.6 Flash configurado con esquemas JSON estructurados (Structured JSON Output).
Extrae de manera no estructurada a estructurada:
  - Objetos complejas con arreglos de compromisos y participantes.
  - Inferencia de fechas ISO y fechas relativas.

3. MODELO DE DATOS Y ESTRUCTURA DE COMPROMISOS
--------------------------------------------------------------------------------
- MinutaReunion: Identificador, número, fecha, lugar, coordinador, compromisos, pendientes.
- CompromisoReunion: ID, responsable, descripción del compromiso, estado, plazo, área.

---
Elaborado por: Desarrollo de Software y Automatización GGPD
Aprobado por: Ing. Adrian Correa — Gerente de Gestión de Planificación de Distribución`
    },
    reporte: {
      code: 'GGPD-SGM-REP-004',
      title: 'REPORTE CONSOLIDADO DE COMPROMISOS',
      subtitle: 'INFORME DE CUMPLIMIENTO OPERATIVO Y MINUTAS CORPOELEC',
      system: 'Sistema de Seguimiento de Minutas y Proyectos Operativos PRTSEN / POA',
      version: 'v2.0 ISO',
      jefeUnidad: 'Ingeniero Adrian Correa — Gerente de Gestión de Planificación de Distribución',
      content: generateReporteContent()
    }
  };

  const currentDoc = docData[activeDocTab];

  // Direct client-side HTML .doc file generator and downloader
  const handleDownloadDirectDoc = () => {
    setIsGenerating(true);
    setStatusMessage('Generando documento .doc descargable...');

    try {
      const docHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${currentDoc.code} - ${currentDoc.title}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #0f172a; margin: 40px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 2px solid #002B49; }
    .header-table td { padding: 12px; border: 1px solid #002B49; }
    .logo-cell { width: 22%; text-align: center; background-color: #002B49; color: #ffffff; font-weight: bold; font-size: 15pt; }
    .title-cell { width: 78%; text-align: center; background-color: #f8fafc; }
    .doc-code { font-size: 14pt; font-weight: bold; color: #002B49; margin: 0; }
    .doc-title { font-size: 12pt; font-weight: bold; color: #E30613; margin: 4px 0 0 0; }
    .meta-box { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 14px; margin-bottom: 25px; font-size: 10pt; border-radius: 4px; }
    .meta-line { margin: 4px 0; }
    .content-box { font-family: 'Courier New', monospace; font-size: 10pt; white-space: pre-wrap; background-color: #fafafa; border: 1px solid #e2e8f0; padding: 20px; line-height: 1.5; }
    .footer { margin-top: 40px; border-top: 2px solid #002B49; padding-top: 12px; font-size: 9pt; color: #64748b; text-align: center; }
  </style>
</head>
<body>

  <table class="header-table">
    <tr>
      <td class="logo-cell">
        CORPOELEC<br/><span style="font-size: 9pt; color: #38bdf8;">GGPD</span>
      </td>
      <td class="title-cell">
        <p class="doc-code">${currentDoc.code}</p>
        <p class="doc-title">${currentDoc.title}</p>
        <p style="font-size: 9pt; color: #475569; margin: 4px 0 0 0;">${currentDoc.subtitle}</p>
      </td>
    </tr>
  </table>

  <div class="meta-box">
    <div class="meta-line"><strong>Sistema:</strong> ${currentDoc.system}</div>
    <div class="meta-line"><strong>Versión:</strong> ${currentDoc.version}</div>
    <div class="meta-line"><strong>Aprobado por:</strong> ${currentDoc.jefeUnidad}</div>
    <div class="meta-line"><strong>Fecha de Descarga:</strong> ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE')}</div>
    <div class="meta-line"><strong>Generado por:</strong> ${currentProfile.name} (@${currentProfile.username})</div>
  </div>

  <div class="content-box">
${currentDoc.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </div>

  <div class="footer">
    <p>Documento oficial emitido por el Sistema de Seguimiento de Minutas y Proyectos Operativos CORPOELEC - GGPD.</p>
    <p>Formato compatible con Microsoft Word y Google Docs.</p>
  </div>

</body>
</html>`;

      const blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = currentDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.href = url;
      link.download = `${currentDoc.code}_${safeTitle}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage('¡Documento .doc descargado con éxito!');
    } catch (err) {
      console.error('Error al descargar archivo .doc:', err);
      setStatusMessage('Error al generar la descarga.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save on server storage and trigger direct download
  const handleSaveToServerAndDownload = async () => {
    setIsGenerating(true);
    setStatusMessage('Guardando en el proyecto y preparando descarga...');

    try {
      const response = await fetch('/api/docs/download-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docCode: currentDoc.code,
          title: currentDoc.title,
          subtitle: currentDoc.subtitle,
          system: currentDoc.system,
          version: currentDoc.version,
          jefeUnidad: currentDoc.jefeUnidad,
          content: currentDoc.content
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeTitle = currentDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        link.href = url;
        link.download = `${currentDoc.code}_${safeTitle}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setStatusMessage('¡Documento guardado en /data/docs/ y descargado!');
      } else {
        handleDownloadDirectDoc();
      }
    } catch (err) {
      console.error('Error al llamar servidor:', err);
      handleDownloadDirectDoc();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportToGoogleDocs = async () => {
    setIsGenerating(true);
    setStatusMessage('Abriendo en Google Docs...');
    try {
      const res = await fetch('/api/export-google-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docKey: activeDocTab,
          docInfo: currentDoc,
          userEmail: currentProfile.email || 'bk.ggpd.corpoelec@gmail.com'
        }),
      });

      const data = await res.json();
      if (data.documentUrl) {
        window.open(data.documentUrl, '_blank');
      } else {
        const simulatedUrl = `https://docs.google.com/document/d/create?title=${encodeURIComponent(currentDoc.code + ' ' + currentDoc.title)}`;
        window.open(simulatedUrl, '_blank');
      }
    } catch (err) {
      const simulatedUrl = `https://docs.google.com/document/d/create?title=${encodeURIComponent(currentDoc.code + ' ' + currentDoc.title)}`;
      window.open(simulatedUrl, '_blank');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full text-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 bg-[#001D33] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Generador y Descargador de Documentos .DOC (ISO)</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-400/30">
                  Normativa ISO 9001 / 27001
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Documentos oficiales descargables en formato .DOC (Word / Google Docs)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveDocTab('operativo')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
              activeDocTab === 'operativo'
                ? 'bg-slate-900 text-cyan-400 border-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Instructivo Operativo</span>
          </button>

          <button
            onClick={() => setActiveDocTab('admin')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
              activeDocTab === 'admin'
                ? 'bg-slate-900 text-purple-400 border-purple-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Instructivo ISO Admin</span>
          </button>

          <button
            onClick={() => setActiveDocTab('tecnico')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
              activeDocTab === 'tecnico'
                ? 'bg-slate-900 text-emerald-400 border-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Documento Técnico</span>
          </button>

          <button
            onClick={() => setActiveDocTab('reporte')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 shrink-0 ${
              activeDocTab === 'reporte'
                ? 'bg-slate-900 text-amber-400 border-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Reporte Compromisos (.doc)</span>
          </button>
        </div>

        {/* Status Notification Banner if any */}
        {statusMessage && (
          <div className="bg-cyan-950/60 border-b border-cyan-800/60 text-cyan-200 text-xs px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage('')} className="text-cyan-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Document Meta Header info */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-cyan-300 text-sm">{currentDoc.code}</span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-white">{currentDoc.title}</span>
            </div>
            <p className="text-[11px] text-slate-400">{currentDoc.subtitle}</p>
          </div>
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Gerencia Responsable</div>
            <div className="text-[11px] font-bold text-amber-300">Ing. Adrian Correa (Gerente GGPD)</div>
          </div>
        </div>

        {/* Preview Content Area */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/80 leading-relaxed whitespace-pre-wrap select-text scrollbar-thin scrollbar-thumb-slate-800">
          {currentDoc.content}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#001D33] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Almacenamiento Local en Proyecto (`/data/docs`) • Formato .DOC</span>
          </div>

          <div className="flex flex-wrap items-center space-x-2.5 w-full sm:w-auto justify-end gap-y-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 border border-slate-700"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleExportToGoogleDocs}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 border border-slate-700"
              title="Abrir plantilla en Google Docs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Docs</span>
            </button>

            <button
              onClick={handleSaveToServerAndDownload}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
              title="Guardar en carpeta /data/docs/ del proyecto y descargar"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FolderDown className="w-4 h-4 text-emerald-200" />
              )}
              <span>Descargar .DOC (Guardar en Proyecto)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
