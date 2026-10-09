import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// --- Rutas portables -------------------------------------------------------
// Antes fijas a '/home/skidrowkodex/Documentos/Repositorio_Maestro/...', lo que
// impedia ejecutar el builder en Windows. Se derivan de la ubicacion real del
// script para que la cadena ISO funcione en cualquier sistema operativo.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(SCRIPT_DIR, '..');
const DOCS_DIR = path.join(RAIZ, 'docs');
const QA_DIR = path.join(DOCS_DIR, 'despliegues_qa');
const SIGI_DOCS_DIR = path.join(
  RAIZ, 'apps', 'corpoelec-sigi-gestion-planificacion-distribucion', 'docs'
);

// Paleta institucional (GGPD-SGM-INS-005 v3.0 ISO)
const C_NAVY = '002B49';
const C_AZUL = '004488';
const C_TEXTO = '1E293B';
const C_BORDE = 'CBD5E1';

// --- Utilidades de tablas --------------------------------------------------
// Una fila separadora de Markdown es |:---|---:|  -> solo guiones, dos puntos
// y espacios. Antes se filtraba con `!l.includes('---')`, lo que descartaba de
// mas cualquier fila de datos que contuviera tres guiones juntos.
const RE_SEPARADOR = /^\|[\s:|-]+\|$/;

// Titulos Markdown de nivel 1 a 6.
const RE_HEADING = /^(\#{1,6})\s+(.*)$/;

// Divide una fila de tabla en celdas ignorando los pipes que esten dentro de
// un tramo de codigo en linea (`a | b`), que son literales y no separadores.
function splitRowCells(line) {
  const celdas = [];
  let actual = '';
  let enCodigo = false;
  for (const ch of line) {
    if (ch === '`') enCodigo = !enCodigo;
    if (ch === '|' && !enCodigo) { celdas.push(actual); actual = ''; continue; }
    actual += ch;
  }
  celdas.push(actual);
  // Descarta el vacio inicial y final que deja el pipe de borde.
  if (celdas.length > 1 && celdas[0].trim() === '' && celdas[celdas.length - 1].trim() === '') {
    celdas.shift();
    celdas.pop();
  }
  return celdas.map(c => c.trim());
}

// Extrae el nivel de sangria de un item de lista (2 espacios = 1 nivel).
function nivelDeSangria(linea) {
  const m = linea.match(/^([ \t]*)/)[1];
  return Math.min(3, Math.floor(m.replace(/\t/g, '  ').length / 2));
}

function parseMarkdownToDocx(mdContent, docTitle) {
  const lines = mdContent.split('\n');
  const docElements = [];

  let inTable = false;
  let tableLines = [];
  let inCodeBlock = false;
  let codeLines = [];
  // Lineas de cita (> ) consecutivas; se unen en un solo parrafo para que un
  // texto envuelto entre lineas no se lea como dos notas distintas.
  let quoteLines = [];
  // Parrafo en curso. En Markdown un parrafo son varias lineas seguidas sin
  // linea en blanco; el parser era por linea, lo que rompia la negrita que
  // abre en una linea y cierra en otra (16 pares de '**' literales visibles)
  // y fragmentaba cada parrafo en un bloque por linea fisica.
  let paraBuffer = [];

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    docElements.push(
      new Paragraph({
        spacing: { before: 60, after: 80 },
        children: parseInlineFormatting(paraBuffer.join(' '), false)
      })
    );
    paraBuffer = [];
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    docElements.push(
      new Paragraph({
        spacing: { before: 140, after: 140 },
        indent: { left: 360 },
        border: {
          left: { style: BorderStyle.SINGLE, size: 18, color: C_NAVY, space: 10 }
        },
        shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
        children: parseInlineFormatting(quoteLines.join(' '), false)
      })
    );
    docElements.push(new Paragraph({ spacing: { after: 60 } }));
    quoteLines = [];
  };

  const flushTable = () => {
    if (tableLines.length === 0) return;

    // Descarta solo las filas separadoras |---|---|
    const validRows = tableLines.filter(l => !RE_SEPARADOR.test(l.trim()));
    if (validRows.length === 0) {
      tableLines = [];
      return;
    }

    // Determine number of columns
    const firstRowCells = splitRowCells(validRows[0]);
    const colCount = firstRowCells.length || 1;

    const rows = validRows.map((rowLine, rowIndex) => {
      const isHeader = rowIndex === 0;
      const rawCells = splitRowCells(rowLine);

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
    // Un Paragraph por linea. Antes se unia todo con '\n' en un unico TextRun:
    // docx v9 no convierte '\n' en <w:br/>, lo emite literal dentro de <w:t>, y
    // los diagramas ASCII se renderizaban colapsados en una sola linea.
    // Verificado con sonda: 0 elementos <w:br/> y 1 salto literal en el XML.
    const children = codeLines.map(
      line =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: 'Consolas',
              size: 18, // 9pt
              color: 'E2E8F0'
            })
          ]
        })
    );
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
                children: children
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

    // Citas: se acumulan y se vacian al primer elemento que no sea "> ".
    const esCita = line.trim().startsWith('>');
    if (!esCita && quoteLines.length > 0) flushQuote();
    if (esCita) {
      quoteLines.push(line.trim().replace(/^>\s?/, ''));
      continue;
    }

    // Cualquier linea que no sea texto plano cierra el parrafo en curso.
    const s = line.trim();
    const esTextoPlano =
      s !== '' &&
      !esCita &&
      !s.startsWith('|') &&
      !RE_HEADING.test(s) &&
      s !== '---' &&
      !/^[-*]\s+/.test(s) &&
      !/^\d+\.\s+/.test(s);
    if (!esTextoPlano) flushPara();

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

    // Headings. Todos pasan por parseInlineFormatting con su escala de color
    // y tamano, de modo que el codigo en linea y la negrita se rendericen
    // tambien dentro de los titulos.
    const h = line.match(RE_HEADING);
    if (h) {
      const nivel = h[1].length;
      const ESCALA = {
        1: { heading: HeadingLevel.HEADING_1, size: 32, color: C_NAVY, before: 240, after: 120 },
        2: { heading: HeadingLevel.HEADING_2, size: 26, color: C_AZUL, before: 200, after: 100 },
        3: { heading: HeadingLevel.HEADING_3, size: 22, color: C_TEXTO, before: 160, after: 80 },
        4: { heading: HeadingLevel.HEADING_4, size: 20, color: '334155', before: 120, after: 60 },
        5: { heading: HeadingLevel.HEADING_5, size: 19, color: '334155', before: 100, after: 60 },
        6: { heading: HeadingLevel.HEADING_6, size: 18, color: '475569', before: 100, after: 60 }
      };
      const e = ESCALA[nivel];
      docElements.push(
        new Paragraph({
          heading: e.heading,
          spacing: { before: e.before, after: e.after },
          children: parseInlineFormatting(h[2], false, {
            bold: true,
            size: e.size,
            color: e.color
          })
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

    // Listas con viñeta, anidadas segun su sangria
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const nivel = nivelDeSangria(line);
      const itemText = line.trim().replace(/^[\*\-]\s+/, '');
      docElements.push(
        new Paragraph({
          bullet: { level: nivel },
          spacing: { before: 40, after: 40 },
          children: parseInlineFormatting(itemText, false)
        })
      );
      continue;
    }

    // Listas numeradas (1. 2. 3.). Antes caian como parrafo normal y perdian
    // la sangria. Se conserva el numero literal del .md para que el texto del
    // .docx siga siendo buscable y auditable contra el original.
    const mNum = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (mNum) {
      const nivel = nivelDeSangria(line);
      docElements.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 400 + nivel * 340 },
          children: parseInlineFormatting(`${mNum[2]}. ${mNum[3]}`, false)
        })
      );
      continue;
    }

    // Parrafo normal: se acumula y se vacia al primer elemento de otro tipo.
    paraBuffer.push(line.trim());
  }

  if (inTable) flushTable();
  if (inCodeBlock) flushCode();
  flushQuote();
  flushPara();

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

// `base` permite reutilizar el parser fuera del cuerpo del texto: por ejemplo
// los titulos, que antes imprimian el markdown crudo (`origen_dato` con
// backticks visibles) porque solo hacian un replace del prefijo.
function parseInlineFormatting(text, isHeader = false, base = null) {
  const runs = [];
  // Tokeniza **negrita**, *cursiva* y `codigo`. El orden importa: la negrita
  // se prueba primero porque `**` comparte el asterisco con la cursiva.
  const regex = /(\*\*.*?\*\*|\*[^*\n]+?\*|`.*?`)/g;
  const parts = text.split(regex);

  const estilo = (extra) =>
    Object.assign(
      {
        color: isHeader ? 'FFFFFF' : C_TEXTO,
        size: isHeader ? 19 : 20,
        font: 'Calibri',
        bold: isHeader
      },
      base || {},
      extra || {}
    );

  let pos = 0;
  for (const part of parts) {
    if (!part) continue;
    // Posicion real del fragmento dentro del texto original, para poder mirar
    // los caracteres vecinos al decide el relleno.
    const idx = text.indexOf(part, pos);
    pos = idx + part.length;

    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      const colorBold = base && base.color ? base.color : (isHeader ? 'FFFFFF' : C_NAVY);
      // Negrita que envuelve codigo en linea: **`5170`**. La alternancia del
      // regex se come el tramo entero como negrita y dejaba los backticks
      // visibles en el documento. Se resuelve recursivamente.
      if (inner.includes('`')) {
        runs.push(
          ...parseInlineFormatting(inner, false, {
            ...(base || {}),
            bold: true,
            color: colorBold
          })
        );
      } else {
        runs.push(
          new TextRun(
            estilo({
              text: inner,
              bold: true,
              color: colorBold
            })
          )
        );
      }
    } else if (part.startsWith('*') && part.endsWith('*')) {
      // Cursiva de un asterisco. Antes se imprimia literally "*rechaza*".
      runs.push(
        new TextRun(
          estilo({
            text: part.slice(1, -1),
            italics: true,
            bold: false
          })
        )
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      // Relleno con espacios solo cuando el tramo va suelto en la frase y no
      // pegado a otro caracter. Antes se rellenaba siempre y producia
      // "CT-AMA-00001 ." con un espacio espurio, y en "S1`...`S14" separaba
      // los dos tramos. Regla: se rellena si el vecino es espacio o alfanumerico.
      const antes = idx > 0 ? text[idx - 1] : ' ';
      const despues = idx + part.length < text.length ? text[idx + part.length] : ' ';
      const ALFA = /[A-Za-z0-9\u00C0-\u017F]/;
      const pegadoAtras = despues !== ' ' && !ALFA.test(despues);
      const pegadoAdelante = antes !== ' ' && !ALFA.test(antes);
      const relleno = pegadoAtras || pegadoAdelante ? '' : ' ';
      // En un titulo el codigo en linea se mantiene monoespaciado pero con el
      // tamano del propio titulo, para no romper la jerarquia visual.
      runs.push(
        new TextRun(
          estilo({
            text: base ? inner : `${relleno}${inner}${relleno}`,
            font: 'Consolas',
            size: base && base.size ? base.size - 4 : 18,
            color: base && base.color ? base.color : (isHeader ? '00F2FE' : '0F172A'),
            bold: isHeader || !!(base && base.bold)
          })
        )
      );
    } else {
      runs.push(new TextRun(estilo({ text: part })));
    }
  }

  return runs.length > 0
    ? runs
    : [new TextRun({ text: text, color: isHeader ? 'FFFFFF' : C_TEXTO })];
}

async function buildAllNativeDocx() {
  // Sin argumentos reconstruye el registro historico. Con argumentos genera
  // el .docx de cada .md indicado:
  //   node docs/build_native_iso_docx.js data_reunion/ALGO.md [--out docs/]
  const argv = process.argv.slice(2);
  let destino = null;
  const pedidos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') { destino = argv[++i]; continue; }
    pedidos.push(argv[i]);
  }

  if (pedidos.length > 0) {
    let ok = 0;
    for (const p of pedidos) {
      const mdPath = path.resolve(process.cwd(), p);
      if (!fs.existsSync(mdPath)) {
        console.error(`x NO ENCONTRADO: ${mdPath}`);
        continue;
      }
      const nombre = path.basename(mdPath, path.extname(mdPath));
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const doc = parseMarkdownToDocx(mdContent, nombre);
      const buffer = await Packer.toBuffer(doc);
      const docxPath = path.join(destino ? path.resolve(process.cwd(), destino) : path.dirname(mdPath), `${nombre}.docx`);
      fs.writeFileSync(docxPath, buffer);
      console.log(`v Generado DOCX nativo ISO: ${docxPath}`);
      ok++;
    }
    console.log(`${ok} documento(s) generado(s).`);
    return;
  }

  const files = [
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_PRESENTACION_EJECUTIVA_SIGI_DATA_LAKE_ISO8000_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_MANUAL_ASISTENTE_WIZARD_AUDITORIA_INSTRUMENTOS_ISO8000_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_AUDITORIA_SISTEMICA_INSTRUMENTOS_OPERATIVOS_LEGACY_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_ANALISIS_INTERCONEXION_SOLAPAMIENTOS_PROCESOS_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_GUIA_DESPLIEGUE_DATA_LAKE_GOOGLE_DRIVE_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_PLAN_ESTRATEGICO_MODULO_INGESTA_CALIDAD_SIGI_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_MANUAL_SISTEMA_ARQUITECTURA_SIGI_V01' },
    { dir: DOCS_DIR, name: 'CORPOELEC_AI_STUDIO_DESIGN_SYSTEM_PROMPT' },

    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_AUDITORIA_ESTATUS_CUATRO_APLICACIONES_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_AUDITORIA_TECNICA_GOBERNANZA_BD_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_AUDITORIA_FUNCIONAL_GOBIERNO_DATOS_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_AUDITORIA_TECNICA_CONFORMIDAD_ISO_COBIT_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_AUDITORIA_FUNCIONAL_MATRIZ_GOBERNANZA_V01' },
    { dir: DOCS_DIR, name: 'NAC_2026_GGPD_NORMA_GOBERNANZA_PUERTOS_SERVIDORES_V01' },
    { dir: QA_DIR, name: 'NAC_2026_GGPD_INVENTARIO_ARQUITECTURA_RUTAS_DESPLIEGUE_V01' },
    { dir: QA_DIR, name: 'NAC_2026_GGPD_RESUMEN_EJECUTIVO_DESPLIEGUE_USUARIOS_QA_V01' },
    { dir: QA_DIR, name: 'NAC_2026_GGPD_MATRIZ_25_CUENTAS_VISOR_ESTADAL_SIGI_V01' },
    { dir: DOCS_DIR, name: 'INF-STI-2026-008-V3_INFORME_TECNICO_ECONOMICO_SERVICIOS_CLOUD_ISO' },
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

      // Copia al folder de SIGI, solo si existe en esta maquina (antes fallaba
      // en cualquier entorno donde no estuviera clonado `apps/`).
      if (fs.existsSync(SIGI_DOCS_DIR)) {
        fs.writeFileSync(path.join(SIGI_DOCS_DIR, `${name}.docx`), buffer);
      }
    }
  }

  console.log('Todos los documentos DOCX nativos han sido generados exitosamente.');
}

buildAllNativeDocx().catch((e) => {
  console.error(e);
  process.exit(1);
});
