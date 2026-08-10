import React, { useState, useEffect } from 'react';
import { AuditLog, TechDocument } from '../../types';
import { useAuth } from '../../lib/authContext';
import { jsPDF } from 'jspdf';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  RefreshCw, 
  User, 
  Clock, 
  BookOpen, 
  Lock, 
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Edit3,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileCode,
  Tag
} from 'lucide-react';

export const AuditTab: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [documents, setDocuments] = useState<TechDocument[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [activeSubtab, setActiveSubtab] = useState<'logs' | 'docs'>('docs');

  // Reader Modal State
  const [viewingDoc, setViewingDoc] = useState<TechDocument | null>(null);

  // Editor Modal State
  const [editingDoc, setEditingDoc] = useState<TechDocument | null>(null);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [docFormData, setDocFormData] = useState({
    id: '',
    code: '',
    title: '',
    category: 'NORMATIVO' as 'NORMATIVO' | 'TÉCNICO' | 'OPERATIVO',
    version: '1.0.0',
    summary: '',
    content: ''
  });
  const [savingDoc, setSavingDoc] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchDocuments();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      }
    } catch (e) {
      console.error('Error al cargar logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDocuments(data.data);
      }
    } catch (e) {
      console.error('Error al cargar documentos:', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSaveMessage(null);
    setDocFormData({
      id: '',
      code: `DOC-GGPD-00${documents.length + 1}`,
      title: '',
      category: 'NORMATIVO',
      version: '1.0.0',
      summary: '',
      content: `# NUEVO DOCUMENTO TÉCNICO NORMATIVO\n**Código:** DOC-GGPD-00${documents.length + 1} | **Versión:** 1.0.0\n**Emisor:** Gerencia General de Programación y Despacho\n\n---\n\n### 1. OBJETIVO Y ALCANCE\nEscriba aquí los detalles del instructivo u orden técnica...`
    });
    setIsCreatingDoc(true);
    setEditingDoc(null);
  };

  const handleOpenEditModal = (doc: TechDocument) => {
    setSaveMessage(null);
    setDocFormData({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      category: doc.category,
      version: doc.version,
      summary: doc.summary,
      content: doc.content
    });
    setEditingDoc(doc);
    setIsCreatingDoc(false);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDoc(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docFormData)
      });

      const data = await res.json();

      if (data.success) {
        setSaveMessage({ type: 'success', text: data.message || 'Documento guardado exitosamente.' });
        fetchDocuments();
        fetchLogs();
        setTimeout(() => {
          setEditingDoc(null);
          setIsCreatingDoc(false);
        }, 1200);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar el documento.' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSavingDoc(false);
    }
  };

  const downloadDocument = (doc: TechDocument) => {
    const textContent = `================================================================================
CORPOELEC - CORPORACIÓN ELÉCTRICA NACIONAL
GERENCIA GENERAL DE PROGRAMACIÓN Y DESPACHO (GGPD)
SISTEMA DE CONTROL DE EQUIPOS INDISPONIBLES NACIONAL (SCEIN)
================================================================================
TÍTULO: ${doc.title}
CÓDIGO: ${doc.code} | VERSIÓN: ${doc.version} | CATEGORÍA: ${doc.category}
EMISOR / AUTOR: ${doc.author}
ÚLTIMA ACTUALIZACIÓN: ${new Date(doc.updated_at).toLocaleString('es-ES')}
================================================================================

RESUMEN EJECUTIVO:
${doc.summary}

--------------------------------------------------------------------------------
CONTENIDO OFICIAL DEL DOCUMENTO:
--------------------------------------------------------------------------------

${doc.content}

================================================================================
Documento descargado desde SCEIN v1.0.0 — Cumplimiento ISO 8000 / ISO 27001
================================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_v${doc.version}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadDocumentPDF = (doc: TechDocument) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297
      const margin = 15;
      const contentWidth = pageWidth - margin * 2; // 180

      let currentY = margin;

      // Header Banner (CORPOELEC Sky Blue Box)
      pdf.setFillColor(240, 249, 255); // Sky 50
      pdf.rect(margin, currentY, contentWidth, 22, 'F');
      pdf.setDrawColor(2, 132, 199); // Sky 600
      pdf.setLineWidth(0.8);
      pdf.line(margin, currentY + 22, margin + contentWidth, currentY + 22);

      // Header Text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(2, 132, 199);
      pdf.text('CORPOELEC • CORPORACIÓN ELÉCTRICA NACIONAL', margin + 4, currentY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text('GERENCIA GENERAL DE PROGRAMACIÓN Y DESPACHO (GGPD) • SCEIN v1.0.0', margin + 4, currentY + 15);

      currentY += 28;

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(15, 23, 42);
      const titleLines = pdf.splitTextToSize(doc.title, contentWidth);
      pdf.text(titleLines, margin, currentY);
      currentY += titleLines.length * 6 + 4;

      // Metadata Box
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'FD');

      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(2, 132, 199);
      pdf.text(`CÓDIGO: ${doc.code}`, margin + 4, currentY + 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      pdf.text(`VERSIÓN: ${doc.version}   |   CATEGORÍA: ${doc.category}`, margin + 65, currentY + 6);
      pdf.text(`EMISOR / AUTOR: ${doc.author}`, margin + 4, currentY + 13);
      pdf.text(`FECHA: ${new Date(doc.updated_at).toLocaleDateString('es-ES')}`, margin + 115, currentY + 13);

      currentY += 24;

      // Executive Summary Box
      if (doc.summary) {
        pdf.setFillColor(240, 249, 255);
        pdf.setDrawColor(2, 132, 199);
        pdf.setLineWidth(0.5);

        const summaryTextLines = pdf.splitTextToSize(`RESUMEN EJECUTIVO: ${doc.summary}`, contentWidth - 8);
        const summaryBoxHeight = summaryTextLines.length * 4.5 + 6;

        pdf.roundedRect(margin, currentY, contentWidth, summaryBoxHeight, 1.5, 1.5, 'FD');
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8.5);
        pdf.setTextColor(3, 105, 161);
        pdf.text(summaryTextLines, margin + 4, currentY + 5);

        currentY += summaryBoxHeight + 6;
      }

      // Content Heading
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('CONTENIDO OFICIAL DEL INSTRUCTIVO / MANUAL NORMATIVO:', margin, currentY);
      currentY += 6;

      // Body Content
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 41, 59);

      const bodyLines = pdf.splitTextToSize(doc.content, contentWidth);
      const lineHeight = 4.2;

      for (let i = 0; i < bodyLines.length; i++) {
        if (currentY + lineHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = margin + 10;

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(71, 85, 105);
          pdf.text(`${doc.code} — ${doc.title} (v${doc.version})`, margin, currentY - 4);
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(0.2);
          pdf.line(margin, currentY - 2, margin + contentWidth, currentY - 2);

          pdf.setFont('courier', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(30, 41, 59);
        }

        pdf.text(bodyLines[i], margin, currentY);
        currentY += lineHeight;
      }

      // Signatures
      if (currentY + 35 > pageHeight - 20) {
        pdf.addPage();
        currentY = margin + 10;
      } else {
        currentY += 10;
      }

      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 12;

      // Left signature
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(15, 23, 42);
      pdf.line(margin + 10, currentY + 12, margin + 75, currentY + 12);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Ing. Adrian Correa', margin + 22, currentY + 17);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Gerente GGPD / Product Owner', margin + 18, currentY + 21);

      // Right signature
      pdf.line(margin + 105, currentY + 12, margin + 170, currentY + 12);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Yvan Cipiran', margin + 125, currentY + 17);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Ingeniería de Productos AI / PM', margin + 112, currentY + 21);

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(148, 163, 184);
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.2);
        pdf.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);
        pdf.text('CORPOELEC GGPD • Sistema SCEIN v1.0.0 — Cumplimiento ISO 8000 / ISO 27001', margin, pageHeight - 7);
        pdf.text(`Página ${i} de ${totalPages}`, margin + contentWidth - 22, pageHeight - 7);
      }

      pdf.save(`${doc.code}_v${doc.version}.pdf`);
    } catch (e) {
      console.error('Error generando el PDF:', e);
      alert('Error al generar el documento PDF. Por favor reintente.');
    }
  };

  const printDocument = (doc: TechDocument) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.code} - ${doc.title}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              padding: 20px; 
              color: #0f172a; 
              line-height: 1.6;
              background-color: #ffffff;
            }
            .header-banner { 
              border-bottom: 3px solid #0284c7; 
              padding-bottom: 15px; 
              margin-bottom: 25px; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo-title {
              font-size: 18px; 
              font-weight: 800; 
              color: #0369a1; 
              letter-spacing: -0.5px;
            }
            .logo-sub {
              font-size: 11px;
              color: #475569;
              font-weight: 600;
              text-transform: uppercase;
            }
            .doc-title { 
              font-size: 18px; 
              font-weight: 800; 
              color: #0f172a;
              margin-top: 15px; 
              margin-bottom: 8px;
            }
            .meta-box { 
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 12px 16px;
              font-size: 12px; 
              color: #334155; 
              margin-bottom: 20px;
            }
            .badge { 
              background: #0284c7; 
              color: #ffffff; 
              padding: 3px 8px; 
              border-radius: 4px; 
              font-weight: 700; 
              font-size: 10px;
            }
            .summary-box {
              background: #f0f9ff;
              border-left: 4px solid #0284c7;
              padding: 12px 16px;
              font-size: 12px;
              color: #0369a1;
              margin-bottom: 20px;
              font-style: italic;
            }
            .content { 
              white-space: pre-wrap; 
              font-size: 12px; 
              font-family: 'Courier New', Courier, monospace; 
              background: #ffffff; 
              padding: 15px 0; 
              line-height: 1.7;
            }
            .signatures {
              margin-top: 50px;
              border-top: 1px solid #cbd5e1;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              page-break-inside: avoid;
            }
            .sig-box {
              text-align: center;
              width: 45%;
            }
            .sig-line {
              border-top: 1px solid #0f172a;
              margin-top: 40px;
              margin-bottom: 5px;
            }
            .footer { 
              margin-top: 40px; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 10px; 
              font-size: 10px; 
              color: #94a3b8; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="logo-title">CORPOELEC — GGPD</div>
              <div class="logo-sub">República Bolivariana de Venezuela • MPPEE</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${doc.category}</span>
              <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-top: 4px;">SCEIN v1.0.0</div>
            </div>
          </div>

          <div class="doc-title">${doc.title}</div>

          <div class="meta-box">
            <strong>Código Oficial:</strong> ${doc.code} &nbsp;|&nbsp; 
            <strong>Versión:</strong> ${doc.version} &nbsp;|&nbsp; 
            <strong>Autor:</strong> ${doc.author}<br>
            <strong>Fecha de Emisión / Actualización:</strong> ${new Date(doc.updated_at).toLocaleString('es-ES')}
          </div>

          <div class="summary-box">
            <strong>Resumen Ejecutivo:</strong> ${doc.summary}
          </div>

          <div class="content">${doc.content}</div>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-line"></div>
              <strong>Ing. Adrian Correa</strong><br>
              Gerente de Gestión de Planificación de Distribución (GGPD)<br>
              <em>Product Owner / Aprobado</em>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <strong>Yvan Cipiran</strong><br>
              Desarrollo e Ingeniería de Productos de IA<br>
              <em>Elaborado / Project Manager</em>
            </div>
          </div>

          <div class="footer">
            Sistema de Control de Equipos Indisponibles Nacional (SCEIN) • Documento Oficial de Control Normativo
          </div>

          <script>
            window.onload = function() { 
              setTimeout(function() {
                window.print(); 
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'NORMATIVO':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 font-bold text-[10px]">NORMATIVO</span>;
      case 'TÉCNICO':
        return <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 font-bold text-[10px]">TÉCNICO</span>;
      case 'OPERATIVO':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 font-bold text-[10px]">OPERATIVO</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px]">{category}</span>;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.username.toLowerCase().includes(term) ||
      log.action_type.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  const filteredDocs = documents.filter(doc => {
    // If state user (ANALISTA_ESTATAL), show only state user manual and general operational/normative manuals
    if (user?.role === 'ANALISTA_ESTATAL') {
      const isEstadalDoc = doc.code.includes('EST_') || 
                           doc.code.includes('MANUAL_CARGA_ESTATAL') || 
                           doc.title.toLowerCase().includes('estadal') || 
                           doc.code === 'NAC_2026_GGPD_MANUAL_TECNICO_SCEIN_V01';
      if (!isEstadalDoc) return false;
    }

    if (!docSearchTerm) return true;
    const term = docSearchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(term) ||
      doc.code.toLowerCase().includes(term) ||
      doc.category.toLowerCase().includes(term) ||
      doc.summary.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>
              {user?.role === 'ANALISTA_ESTATAL' 
                ? 'Manuales Operativos de Carga Estadal & Gobernanza de Datos' 
                : 'Auditoría de Seguridad (ISO 27001) & Documentación Técnica'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {user?.role === 'ANALISTA_ESTATAL'
              ? `Manuales de usuario e instructivos de carga oficial para Analistas Estadales (${user.state_code || 'TA'}).`
              : 'Registro de trazabilidad inmutable, logs de seguridad y manuales normativos institucionales CORPOELEC GGPD.'}
          </p>
        </div>

        {/* Subtabs Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
          {user?.role !== 'ANALISTA_ESTATAL' && (
            <button
              onClick={() => setActiveSubtab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubtab === 'logs' ? 'bg-purple-600 text-white dark:bg-purple-900/60 dark:text-purple-300 dark:border dark:border-purple-700/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Logs de Seguridad ({logs.length})
            </button>
          )}
          <button
            onClick={() => setActiveSubtab('docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubtab === 'docs' ? 'bg-purple-600 text-white dark:bg-purple-900/60 dark:text-purple-300 dark:border dark:border-purple-700/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Instructivos & Manuales ({filteredDocs.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LOGS DE SEGURIDAD */}
      {activeSubtab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuario, acción, detalle de auditoría..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={fetchLogs}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar Logs</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {loadingLogs ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                Cargando registros de trazabilidad ISO 27001...
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Fecha / Hora</th>
                      <th className="p-3.5">Usuario</th>
                      <th className="p-3.5">Tipo de Acción</th>
                      <th className="p-3.5">Detalles del Evento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            {new Date(log.created_at).toLocaleString('es-ES')}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-200">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            {log.username}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-semibold">
                            {log.action_type}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                No hay eventos registrados que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: INSTRUCTIVOS Y MANUALES */}
      {activeSubtab === 'docs' && (
        <div className="space-y-6">
          {/* Estadal Banner */}
          {user?.role === 'ANALISTA_ESTATAL' && (
            <div className="bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-100 dark:bg-sky-900/80 rounded-xl border border-sky-300 dark:border-sky-700/80 text-sky-700 dark:text-sky-300 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-sky-900 dark:text-sky-200 uppercase tracking-wider flex items-center gap-2">
                    <span>Manual del Usuario Estadal</span>
                    <span className="bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 px-2 py-0.5 rounded text-[10px] font-mono">
                      Estado {user.state_code || 'TA'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Instrucciones para la preparación de archivos con nomenclatura oficial (<span className="font-mono text-sky-700 dark:text-sky-300 font-bold">GGPD-SGM-INS-005</span>), carga masiva Excel, ventana de entregas y remediación en cuarentena.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top bar with Search and Admin New Document Button */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={docSearchTerm}
                onChange={(e) => setDocSearchTerm(e.target.value)}
                placeholder="Buscar por título, código o categoría de documento..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={fetchDocuments}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualizar</span>
              </button>

              {user?.role === 'ADMIN_NACIONAL' && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Instructivo / Manual</span>
                </button>
              )}
            </div>
          </div>

          {/* Document Cards List */}
          {loadingDocs ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              Cargando catálogo oficial de instructivos y manuales normativos...
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between gap-4 transition group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800/80 px-2 py-0.5 rounded">
                          {doc.code}
                        </span>
                        {getCategoryBadge(doc.category)}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">v{doc.version}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Autor: <strong className="text-slate-700 dark:text-slate-300">{doc.author}</strong></span>
                      <span>{new Date(doc.updated_at).toLocaleDateString('es-ES')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/80 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Leer</span>
                      </button>

                      <button
                        onClick={() => downloadDocumentPDF(doc)}
                        className="py-2 px-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold flex items-center gap-1 transition"
                        title="Descargar Manual Oficial en Formato PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => downloadDocument(doc)}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 transition"
                        title="Descargar Manual en Texto Plano (TXT)"
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>TXT</span>
                      </button>

                      {user?.role === 'ADMIN_NACIONAL' && (
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition"
                          title="Editar / Actualizar Manual"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl">
              No se encontraron documentos técnicos con el criterio de búsqueda.
            </div>
          )}
        </div>
      )}

      {/* FULL DOCUMENT READER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded">
                    {viewingDoc.code}
                  </span>
                  {getCategoryBadge(viewingDoc.category)}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">v{viewingDoc.version}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{viewingDoc.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDocumentPDF(viewingDoc)}
                  className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  title="Descargar Manual Oficial en Formato PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <button
                  onClick={() => downloadDocument(viewingDoc)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition"
                  title="Descargar Manual en Formato Texto TXT"
                >
                  <FileCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar TXT</span>
                  <span className="sm:hidden">TXT</span>
                </button>

                <button
                  onClick={() => printDocument(viewingDoc)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  title="Imprimir / Vista Previa de Impresión"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Reader */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/60">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200">
                <p className="font-bold text-purple-700 dark:text-purple-300 mb-1">Resumen del Documento:</p>
                {viewingDoc.summary}
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-300 text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                {viewingDoc.content}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Autor: <strong className="text-slate-800 dark:text-slate-200">{viewingDoc.author}</strong></span>
              <span>Última modificación: <strong className="text-slate-800 dark:text-slate-200">{new Date(viewingDoc.updated_at).toLocaleString('es-ES')}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT / CREATE DOCUMENT MODAL */}
      {(editingDoc || isCreatingDoc) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>{isCreatingDoc ? 'Crear Nuevo Instructivo / Manual' : `Editar Documento: ${editingDoc?.code}`}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setIsCreatingDoc(false);
                }}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDocument} className="p-6 overflow-y-auto space-y-4 flex-1 bg-white dark:bg-slate-900">
              {saveMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  saveMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{saveMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Código Oficial</label>
                  <input
                    type="text"
                    required
                    value={docFormData.code}
                    onChange={(e) => setDocFormData({ ...docFormData, code: e.target.value })}
                    placeholder="ej. DOC-GGPD-004"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Categoría</label>
                  <select
                    value={docFormData.category}
                    onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="NORMATIVO">NORMATIVO</option>
                    <option value="TÉCNICO">TÉCNICO</option>
                    <option value="OPERATIVO">OPERATIVO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Versión</label>
                  <input
                    type="text"
                    required
                    value={docFormData.version}
                    onChange={(e) => setDocFormData({ ...docFormData, version: e.target.value })}
                    placeholder="ej. 2.4.0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Título Institucional del Documento</label>
                <input
                  type="text"
                  required
                  value={docFormData.title}
                  onChange={(e) => setDocFormData({ ...docFormData, title: e.target.value })}
                  placeholder="ej. Instructivo de Seguridad para Subestaciones 230kV"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Resumen Ejecutivo</label>
                <textarea
                  rows={2}
                  value={docFormData.summary}
                  onChange={(e) => setDocFormData({ ...docFormData, summary: e.target.value })}
                  placeholder="Breve resumen del propósito del documento..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Contenido Completo del Documento (Texto / Markdown)</label>
                <textarea
                  rows={10}
                  required
                  value={docFormData.content}
                  onChange={(e) => setDocFormData({ ...docFormData, content: e.target.value })}
                  placeholder="Escriba aquí el contenido completo del manual..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setIsCreatingDoc(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50 transition"
                >
                  {savingDoc ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{savingDoc ? 'Guardando...' : 'Guardar y Publicar Documento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
