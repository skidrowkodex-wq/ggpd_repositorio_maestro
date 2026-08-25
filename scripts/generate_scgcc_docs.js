import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function mdToWordHtml(mdContent, title) {
  let html = mdContent
    .replace(/^# (.*$)/gim, '<h1 style="color:#4c1d95; font-family:Calibri, Arial, sans-serif; font-size:22pt; margin-bottom:8pt; border-bottom:2px solid #6d28d9; padding-bottom:4pt;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#5b21b6; font-family:Calibri, Arial, sans-serif; font-size:16pt; margin-top:14pt; margin-bottom:6pt; border-bottom:1px solid #ddd6fe; padding-bottom:2pt;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#1E293B; font-family:Calibri, Arial, sans-serif; font-size:13pt; margin-top:10pt; margin-bottom:4pt;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="color:#475569; font-family:Calibri, Arial, sans-serif; font-size:11.5pt; margin-top:8pt; margin-bottom:2pt;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/---/gim, '<hr style="border:0; border-top:1px solid #CBD5E1; margin:15pt 0;" />');

  // Mermaid diagrams
  html = html.replace(/```mermaid([\s\S]*?)```/g, (match, p1) => {
    return `<div style="background-color:#F5F3FF; border:1.5px solid #8B5CF6; border-radius:4pt; padding:10pt; font-family:Consolas, monospace; font-size:9pt; color:#4C1D95; margin:10pt 0;">
      <strong style="color:#6D28D9; display:block; margin-bottom:4pt;">[DIAGRAMA DE FLUJO / PROCESO INSTITUCIONAL]</strong>
      <pre style="margin:0; font-family:Consolas, monospace; white-space:pre-wrap;">${p1.trim()}</pre>
    </div>`;
  });

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<div style="background-color:#F8FAFC; border:1px solid #CBD5E1; border-radius:4pt; padding:8pt; font-family:Consolas, Courier New, monospace; font-size:8.5pt; color:#1E293B; margin:8pt 0; white-space:pre-wrap;">$1</div>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code style="font-family:Consolas, Courier New, monospace; font-size:8.5pt; background-color:#EDE9FE; padding:1pt 3pt; color:#5B21B6; border-radius:2pt;">$1</code>');

  // Tables
  html = html.replace(/(?:\|[^\n]+\|\r?\n)+/g, (tableMatch) => {
    const lines = tableMatch.trim().split('\n');
    let tableHtml = '<table style="width:100%; border-collapse:collapse; margin:12pt 0; font-family:Calibri, Arial, sans-serif; font-size:9.5pt;">';
    
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
          tableHtml += `<th style="background-color:#5B21B6; color:#ffffff; font-weight:bold; padding:6pt 8pt; border:1px solid #4C1D95; text-align:left; font-size:9.5pt;">${cell}</th>`;
        } else {
          tableHtml += `<td style="padding:5pt 8pt; border:1px solid #E2E8F0; color:#1E293B; background-color:#FAFAFF; font-size:9pt; vertical-align:top;">${cell}</td>`;
        }
      });
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    return tableHtml;
  });

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
    if (/^\d+\.\s/.test(p)) {
      const items = p.split('\n').map(li => `<li style="margin-bottom:2pt; color:#1E293B; font-family:Calibri, Arial, sans-serif; font-size:10pt;">${li.replace(/^\d+\.\s+/, '')}</li>`).join('');
      return `<ol style="margin:4pt 0 8pt 18pt; padding:0;">${items}</ol>`;
    }
    return `<p style="font-family:Calibri, Arial, sans-serif; font-size:10.5pt; line-height:1.4; color:#1E293B; margin:3pt 0 6pt 0;">${p.replace(/\n/g, '<br/>')}</p>`;
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
  size: letter portrait;
  margin: 0.8in 0.8in 0.8in 0.8in;
  mso-page-orientation: portrait;
}
@page Section1 {
  size: 8.5in 11.0in;
  mso-page-orientation: portrait;
  margin: 0.8in 0.8in 0.8in 0.8in;
  mso-header-margin: 0.5in;
  mso-footer-margin: 0.5in;
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

const docsDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCGCC-REF/docs';

const docFiles = [
  'SCGCC_DOCFUN_v1_Informe_Avance_Solicitantes',
  'DOCUMENTACION_ISO_GGPD',
  'SCGCC_DOCTEC_v1_Arquitectura_Gobernanza'
];

for (const name of docFiles) {
  const mdPath = path.join(docsDir, `${name}.md`);
  const docPath = path.join(docsDir, `${name}.doc`);
  
  if (fs.existsSync(mdPath)) {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const docHtml = mdToWordHtml(mdContent, name);
    fs.writeFileSync(docPath, docHtml, 'utf-8');
    console.log(`Generated Word .doc: ${docPath}`);
    
    // Convert to .docx via libreoffice
    try {
      execSync(`libreoffice --headless --convert-to "docx:Office Open XML Text" --outdir "${docsDir}" "${docPath}"`, { stdio: 'inherit' });
      console.log(`Converted to native .docx: ${name}.docx`);
    } catch (e) {
      console.error(`Error converting ${name} to docx:`, e.message);
    }
  }
}
