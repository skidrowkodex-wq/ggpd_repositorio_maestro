import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  PageOrientation,
  ShadingType,
  TableLayoutType
} from 'docx';

function parseMarkdownToDocx(mdContent, docTitle) {
  const lines = mdContent.split('\n');
  const docElements = [];

  let inTable = false;
  let tableLines = [];
  let inCodeBlock = false;
  let codeLines = [];

  const flushTable = () => {
    if (tableLines.length === 0) return;

    // Filter out separator lines like |---|---|
    const validRows = tableLines.filter(l => !l.includes('---'));
    if (validRows.length === 0) {
      tableLines = [];
      return;
    }

    // Determine number of columns
    const firstRowCells = validRows[0].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    const colCount = firstRowCells.length || 1;

    const rows = validRows.map((rowLine, rowIndex) => {
      const isHeader = rowIndex === 0;
      const rawCells = rowLine.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      // Pad cells if mismatched
      while (rawCells.length < colCount) rawCells.push('');

      const tableCells = rawCells.slice(0, colCount).map(cellText => {
        // Parse bold inside cell
        const runs = parseInlineFormatting(cellText, isHeader);

        return new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { before: 80, after: 80 },
              children: runs
            })
          ],
          shading: {
            type: ShadingType.CLEAR,
            fill: isHeader ? '002B49' : (rowIndex % 2 === 0 ? 'F8FAFC' : 'FFFFFF')
          },
          margins: {
            top: 120,
            bottom: 120,
            left: 140,
            right: 140
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
          }
        });
      });

      return new TableRow({
        children: tableCells,
        tableHeader: isHeader,
        cantSplit: true
      });
    });

    const docxTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows,
      layout: TableLayoutType.AUTOFIT
    });

    docElements.push(docxTable);
    docElements.push(new Paragraph({ spacing: { after: 180 } }));
    tableLines = [];
  };

  const flushCode = () => {
    if (codeLines.length === 0) return;
    const text = codeLines.join('\n');
    docElements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: '00F2FE' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: '00F2FE' },
                  left: { style: BorderStyle.SINGLE, size: 16, color: '00F2FE' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: '00F2FE' }
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: text,
                        font: 'Consolas',
                        size: 18, // 9pt
                        color: 'E2E8F0'
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );
    docElements.push(new Paragraph({ spacing: { after: 160 } }));
    codeLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode();
      } else {
        if (inTable) { inTable = false; flushTable(); }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableLines.push(line);
      continue;
    } else if (inTable) {
      inTable = false;
      flushTable();
    }

    // Empty lines
    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      docElements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: line.replace(/^#\s+/, ''),
              bold: true,
              size: 32, // 16pt
              font: 'Calibri',
              color: '002B49'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('## ')) {
      docElements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: line.replace(/^##\s+/, ''),
              bold: true,
              size: 26, // 13pt
              font: 'Calibri',
              color: '004488'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('### ')) {
      docElements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: line.replace(/^###\s+/, ''),
              bold: true,
              size: 22, // 11pt
              font: 'Calibri',
              color: '1E293B'
            })
          ]
        })
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      docElements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({
              text: line.replace(/^####\s+/, ''),
              bold: true,
              size: 20, // 10pt
              font: 'Calibri',
              color: '334155'
            })
          ]
        })
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      docElements.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: {
            bottom: { color: 'CBD5E1', space: 1, style: BorderStyle.SINGLE, size: 6 }
          }
        })
      );
      continue;
    }

    // List items
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const itemText = line.trim().replace(/^[\*\-]\s+/, '');
      docElements.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
          children: parseInlineFormatting(itemText, false)
        })
      );
      continue;
    }

    // Normal paragraph
    docElements.push(
      new Paragraph({
        spacing: { before: 60, after: 80 },
        children: parseInlineFormatting(line, false)
      })
    );
  }

  if (inTable) flushTable();
  if (inCodeBlock) flushCode();

  // Create native ISO document with Landscape layout and Running Headers & Footers
  const doc = new Document({
    title: docTitle,
    description: 'Documento Oficial CORPOELEC - GGPD bajo norma GGPD-SGM-INS-005 (v3.0 ISO)',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 21, // 10.5pt
            color: '1E293B'
          },
          paragraph: {
            spacing: { line: 276 } // 1.15 line spacing
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 15840, // 11 inches in dxa (1440 * 11)
              height: 12240 // 8.5 inches in dxa (1440 * 8.5)
            },
            margin: {
              top: 864,    // 0.6 in
              bottom: 864, // 0.6 in
              left: 1008,  // 0.7 in
              right: 1008  // 0.7 in
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '002B49' } },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'CORPOELEC · ', bold: true, color: '002B49', size: 18 }),
                              new TextRun({ text: 'Gerencia General de Planificación de Distribución (GGPD)', color: '475569', size: 18 })
                            ]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '002B49' } },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({ text: 'NORMA GGPD-SGM-INS-005 (v3.0 ISO)', bold: true, color: '004488', size: 16 })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' } },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: 'CONFIDENCIAL · Cumplimiento ISO/IEC 27001:2022 & COBIT 2019 · República Bolivariana de Venezuela', size: 16, color: '64748B' })
                            ]
                          })
                        ]
                      }),
                      new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' } },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              new TextRun({ text: 'Página ', size: 16, color: '64748B' }),
                              new TextRun({ children: [PageNumber.CURRENT], size: 16, bold: true, color: '002B49' }),
                              new TextRun({ text: ' de ', size: 16, color: '64748B' }),
                              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, bold: true, color: '002B49' })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        },
        children: docElements
      }
    ]
  });

  return doc;
}

function parseInlineFormatting(text, isHeader = false) {
  const runs = [];
  // Tokenize bold **text** and inline code `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      runs.push(
        new TextRun({
          text: inner,
          bold: true,
          color: isHeader ? 'FFFFFF' : '002B49',
          size: isHeader ? 19 : 20,
          font: 'Calibri'
        })
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      runs.push(
        new TextRun({
          text: ` ${inner} `,
          font: 'Consolas',
          size: 18,
          color: isHeader ? '00F2FE' : '0F172A',
          bold: isHeader
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: part,
          color: isHeader ? 'FFFFFF' : '1E293B',
          size: isHeader ? 19 : 20,
          bold: isHeader,
          font: 'Calibri'
        })
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: text, color: isHeader ? 'FFFFFF' : '1E293B' })];
}

async function buildAllNativeDocx() {
  const docsDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/docs';
  const qaDir = path.join(docsDir, 'despliegues_qa');
  const sigiDocsDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/apps/corpoelec-sigi-gestion-planificacion-distribucion/docs';

  const files = [
    { dir: docsDir, name: 'NAC_2026_GGPD_MANUAL_SISTEMA_ARQUITECTURA_SIGI_V01' },
    { dir: docsDir, name: 'CORPOELEC_AI_STUDIO_DESIGN_SYSTEM_PROMPT' },
    { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_ESTATUS_CUATRO_APLICACIONES_V01' },
    { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_TECNICA_GOBERNANZA_BD_V01' },
    { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_FUNCIONAL_GOBIERNO_DATOS_V01' },
    { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_TECNICA_CONFORMIDAD_ISO_COBIT_V01' },
    { dir: docsDir, name: 'NAC_2026_GGPD_AUDITORIA_FUNCIONAL_MATRIZ_GOBERNANZA_V01' },
    { dir: docsDir, name: 'NAC_2026_GGPD_NORMA_GOBERNANZA_PUERTOS_SERVIDORES_V01' },
    { dir: qaDir, name: 'NAC_2026_GGPD_INVENTARIO_ARQUITECTURA_RUTAS_DESPLIEGUE_V01' },
    { dir: qaDir, name: 'NAC_2026_GGPD_RESUMEN_EJECUTIVO_DESPLIEGUE_USUARIOS_QA_V01' },
    { dir: qaDir, name: 'NAC_2026_GGPD_MATRIZ_25_CUENTAS_VISOR_ESTADAL_SIGI_V01' },
  ];

  for (const { dir, name } of files) {
    const mdPath = path.join(dir, `${name}.md`);
    const docxPath = path.join(dir, `${name}.docx`);

    if (fs.existsSync(mdPath)) {
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const doc = parseMarkdownToDocx(mdContent, name);
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(docxPath, buffer);
      console.log(`✓ Generado DOCX nativo ISO: ${docxPath}`);

      // Also copy to sigi docs folder if relevant
      const sigiDocxPath = path.join(sigiDocsDir, `${name}.docx`);
      fs.writeFileSync(sigiDocxPath, buffer);
    }
  }

  console.log('Todos los documentos DOCX nativos han sido generados exitosamente.');
}

buildAllNativeDocx().catch(console.error);
