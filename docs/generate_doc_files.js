import fs from 'fs';
import path from 'path';

function mdToWordHtml(mdContent, title) {
  let html = mdContent
    .replace(/^# (.*$)/gim, '<h1 style="color:#003366; font-family:Calibri, Arial, sans-serif; font-size:22pt; margin-bottom:8pt; border-bottom:2px solid #003366; padding-bottom:4pt;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#004488; font-family:Calibri, Arial, sans-serif; font-size:16pt; margin-top:14pt; margin-bottom:6pt;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#1E293B; font-family:Calibri, Arial, sans-serif; font-size:13pt; margin-top:10pt; margin-bottom:4pt;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="color:#334155; font-family:Calibri, Arial, sans-serif; font-size:11.5pt; margin-top:8pt; margin-bottom:2pt;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/---/gim, '<hr style="border:0; border-top:1px solid #CBD5E1; margin:15pt 0;" />');

  // Tables
  html = html.replace(/(?:\|[^\n]+\|\r?\n)+/g, (tableMatch) => {
    const lines = tableMatch.trim().split('\n');
    let tableHtml = '<table style="width:100%; border-collapse:collapse; margin:10pt 0; font-family:Calibri, Arial, sans-serif; font-size:9.5pt;">';
    
    let isHeader = true;
    for (const line of lines) {
      if (line.includes('---')) {
        isHeader = false;
        continue;
      }
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.length === 0) continue;

      tableHtml += '<tr>';
      cells.forEach(cell => {
        if (isHeader) {
          tableHtml += `<th style="background-color:#003366; color:#ffffff; font-weight:bold; padding:5pt 7pt; border:1px solid #003366; text-align:left; font-size:9.5pt;">${cell}</th>`;
        } else {
          tableHtml += `<td style="padding:4.5pt 7pt; border:1px solid #CBD5E1; color:#1E293B; background-color:#FAFCFF; font-size:9pt; vertical-align:top;">${cell}</td>`;
        }
      });
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    return tableHtml;
  });

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<div style="background-color:#F4F6F8; border:1px solid #CBD5E1; padding:8pt; font-family:Consolas, Courier New, monospace; font-size:8.5pt; color:#1E293B; margin:8pt 0; white-space:pre-wrap;">$1</div>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="font-family:Consolas, Courier New, monospace; font-size:8.5pt; background-color:#E2E8F0; padding:1pt 3pt; color:#0F172A; border-radius:2pt;">$1</code>');

  // Paragraphs & lists
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<table') || p.startsWith('<div') || p.startsWith('<hr')) {
      return p;
    }
    if (p.startsWith('* ') || p.startsWith('- ')) {
      const items = p.split('\n').map(li => `<li style="margin-bottom:2pt; color:#1E293B; font-family:Calibri, Arial, sans-serif; font-size:10pt;">${li.replace(/^[\*\-]\s+/, '')}</li>`).join('');
      return `<ul style="margin:4pt 0 8pt 18pt; padding:0;">${items}</ul>`;
    }
    return `<p style="font-family:Calibri, Arial, sans-serif; font-size:10.5pt; line-height:1.35; color:#1E293B; margin:3pt 0 6pt 0;">${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${title}</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
@page {
  size: letter landscape;
  margin: 0.6in 0.7in 0.6in 0.7in;
  mso-page-orientation: landscape;
}
@page Section1 {
  size: 11.0in 8.5in;
  mso-page-orientation: landscape;
  margin: 0.6in 0.7in 0.6in 0.7in;
  mso-header-margin: 0.4in;
  mso-footer-margin: 0.4in;
  mso-paper-source: 0;
}
div.Section1 {
  page: Section1;
}
body {
  font-family: Calibri, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #FFFFFF;
}
</style>
</head>
<body>
<div class="Section1">
${html}
</div>
</body>
</html>`;
}

const docsDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/docs';
const qaDir = path.join(docsDir, 'despliegues_qa');

const allFiles = [
  { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_ESTATUS_CUATRO_APLICACIONES_V01' },
  { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_TECNICA_GOBERNANZA_BD_V01' },
  { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_FUNCIONAL_GOBIERNO_DATOS_V01' },
  { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_TECNICA_CONFORMIDAD_ISO_COBIT_V01' },
  { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_FUNCIONAL_MATRIZ_GOBERNANZA_V01' },
  { dir: docsDir, name: 'NAC_2026_GGPD_NORMA_GOBERNANZA_PUERTOS_SERVIDORES_V01' },
  { dir: docsDir, name: 'NAC_2026_GGPD_MANUAL_SISTEMA_ARQUITECTURA_SIGI_V01' },
  { dir: docsDir, name: 'CORPOELEC_AI_STUDIO_DESIGN_SYSTEM_PROMPT' },
  { dir: qaDir, name: 'NAC_2026_GGPD_INVENTARIO_ARQUITECTURA_RUTAS_DESPLIEGUE_V01' },
  { dir: qaDir, name: 'NAC_2026_GGPD_RESUMEN_EJECUTIVO_DESPLIEGUE_USUARIOS_QA_V01' },
  { dir: qaDir, name: 'NAC_2026_GGPD_MATRIZ_25_CUENTAS_VISOR_ESTADAL_SIGI_V01' },
];

for (const { dir, name } of allFiles) {
  const mdPath = path.join(dir, `${name}.md`);
  const docPath = path.join(dir, `${name}.doc`);
  if (fs.existsSync(mdPath)) {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const docHtml = mdToWordHtml(mdContent, name);
    fs.writeFileSync(docPath, docHtml, 'utf-8');
    console.log(`Generated Word .doc: ${docPath}`);
  }
}
