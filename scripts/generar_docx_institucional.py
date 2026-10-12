# -*- coding: utf-8 -*-
"""
Generador institucional Markdown -> DOCX (GGPD CORPOELEC)
Replica el formato predefinido de los documentos oficiales:
cabecera institucional centrada, títulos NAVY #002B49, subsecciones CYAN #0072CE,
tablas con encabezado NAVY (texto blanco) y filas alternadas, bloques de codigo Consolas,
vinetas y parrafos Calibri 10.5.

Uso:
    python scripts/generar_docx_institucional.py <archivo.md> [<archivo.md> ...]
"""

import os
import re
import sys
import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

NAVY = RGBColor(0, 43, 73)        # #002B49
CYAN = RGBColor(0, 114, 206)      # #0072CE
DARK = RGBColor(30, 41, 59)       # #1E293B
GREY = RGBColor(100, 116, 139)    # #64748B
WHITE = RGBColor(255, 255, 255)

LINK_RE = re.compile(r'\[([^\]]+)\]\([^)]*\)')


def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def set_cell_margins(cell, top=50, bottom=50, left=90, right=90):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement('w:%s' % m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def clean(text):
    """Elimina sintaxis de enlaces markdown y escapes básicos."""
    return LINK_RE.sub(r'\1', text)


INLINE_RE = re.compile(r'(\*\*.+?\*\*|`[^`]+`|\*[^*\n]+?\*)')


def add_inline(p, text, base_size=10.5, fallback_color=None):
    for t in INLINE_RE.split(text):
        if not t:
            continue
        if t.startswith('**') and t.endswith('**') and len(t) > 4:
            r = p.add_run(t[2:-2])
            r.font.bold = True
        elif t.startswith('`') and t.endswith('`') and len(t) > 2:
            r = p.add_run(t[1:-1])
            r.font.name = 'Consolas'
            r.font.size = Pt(max(8.5, base_size - 1.5))
        elif t.startswith('*') and t.endswith('*') and len(t) > 2:
            r = p.add_run(t[1:-1])
            r.font.italic = True
        else:
            r = p.add_run(t)
        r.font.size = Pt(base_size)
        if fallback_color is not None:
            r.font.color.rgb = fallback_color
    return p


def add_heading(doc, text, level):
    h = doc.add_heading(level=min(level, 4))
    h.paragraph_format.space_before = Pt(10 if level == 1 else 6)
    h.paragraph_format.space_after = Pt(4)
    r = h.add_run(clean(text))
    r.font.bold = True
    r.font.name = 'Calibri'
    if level == 1:
        r.font.size = Pt(13)
        r.font.color.rgb = NAVY
    elif level == 2:
        r.font.size = Pt(11.5)
        r.font.color.rgb = CYAN
    else:
        r.font.size = Pt(10.5)
        r.font.color.rgb = NAVY
    return h


def is_table_sep(line):
    return bool(re.match(r'^\|[\s:\-|]+\|$', line))


def add_table(doc, rows):
    header = [clean(c.strip()) for c in rows[0].strip().strip('|').split('|')]
    data = []
    for r_ in rows[1:]:
        cells = [clean(c.strip()) for c in r_.strip().strip('|').split('|')]
        data.append(cells)
    ncols = max(len(header), max((len(r_) for r_ in data), default=1))
    tbl = doc.add_table(rows=1 + len(data), cols=ncols)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False

    for j in range(ncols):
        val = header[j] if j < len(header) else ''
        cell = tbl.cell(0, j)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        add_inline(p, val or ' ', base_size=9)
        for r_ in p.runs:
            r_.font.bold = True
            r_.font.color.rgb = WHITE
            r_.font.size = Pt(9)
        set_cell_background(cell, '002B49')
        set_cell_margins(cell)

    for i, row_vals in enumerate(data, start=1):
        for j in range(ncols):
            val = row_vals[j] if j < len(row_vals) else ''
            cell = tbl.cell(i, j)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            add_inline(p, val or ' ', base_size=9)
            for r_ in p.runs:
                r_.font.size = Pt(9)
            set_cell_background(cell, 'F8FAFC' if i % 2 == 0 else 'FFFFFF')
            set_cell_margins(cell)

    width = Inches(6.8 / ncols)
    for row in tbl.rows:
        for c in row.cells:
            c.width = width
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return tbl


def add_code_block(doc, lines):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    txt = '\n'.join(lines)
    r = p.add_run(txt)
    r.font.name = 'Consolas'
    r.font.size = Pt(8)
    r.font.color.rgb = GREY


def create_document(md_path):
    with open(md_path, encoding='utf-8') as fh:
        lines = [ln.rstrip('\n') for ln in fh]

    doc = docx.Document()
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    st = doc.styles['Normal']
    st.font.name = 'Calibri'
    st.font.size = Pt(10.5)
    st.font.color.rgb = DARK

    # Cabecera institucional
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    r_inst = p_inst.add_run(
        "REPÚBLICA BOLIVARIANA DE VENEZUELA\n"
        "MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE)\n"
        "CORPORACIÓN ELÉCTRICA NACIONAL, S.A. (CORPOELEC)\n"
        "GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)"
    )
    r_inst.font.name = 'Calibri'
    r_inst.font.size = Pt(9.5)
    r_inst.font.bold = True
    r_inst.font.color.rgb = NAVY
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Descartar la cabecera institucional del markdown (REPÚBLICA/MINISTERIO/
    # CORPORACIÓN/GERENCIA) y su separador, aunque use '#' o '##'
    inst_re = re.compile(r'^#{1,3}\s+(REPÚBLICA BOLIVARIANA|MINISTERIO DEL PODER|CORPORACIÓN ELÉCTRICA|GERENCIA GENERAL)')
    i = 0
    while i < len(lines) and inst_re.match(lines[i]):
        i += 1
    if i < len(lines) and lines[i].strip() == '---':
        i += 1

    in_code = False
    code_buf = []
    table_buf = []

    def flush_table():
        if table_buf:
            add_table(doc, table_buf)
            table_buf.clear()

    while i < len(lines):
        ln = lines[i]
        stripped = ln.strip()

        if in_code:
            if stripped.startswith('```'):
                add_code_block(doc, code_buf)
                code_buf = []
                in_code = False
                i += 1
                continue
            code_buf.append(ln)
            i += 1
            continue

        if stripped.startswith('```'):
            flush_table()
            in_code = True
            i += 1
            continue

        if stripped.startswith('|'):
            table_buf.append(ln)
            i += 1
            continue
        else:
            flush_table()

        if not stripped:
            i += 1
            continue

        if stripped == '---':
            i += 1
            continue

        if stripped.startswith('#### '):
            add_heading(doc, stripped[5:], 3)
        elif stripped.startswith('### '):
            add_heading(doc, stripped[4:], 2)
        elif stripped.startswith('## '):
            add_heading(doc, stripped[3:], 1)
        elif re.match(r'^(?:-|\*)\s', stripped):
            indent = len(ln) - len(ln.lstrip())
            bp = doc.add_paragraph(style='List Bullet')
            bp.paragraph_format.space_after = Pt(3)
            if indent:
                bp.paragraph_format.left_indent = Inches(0.25 + indent * 0.18)
            add_inline(bp, clean(stripped[2:]))
        elif stripped.startswith('>'):
            qp = doc.add_paragraph()
            qp.paragraph_format.left_indent = Inches(0.3)
            qp.paragraph_format.space_after = Pt(4)
            add_inline(qp, clean(stripped.lstrip('>').strip()), fallback_color=GREY)
            for r_ in qp.runs:
                r_.font.italic = True
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            add_inline(p, clean(stripped))
        i += 1

    flush_table()
    if code_buf:
        add_code_block(doc, code_buf)

    out_path = os.path.splitext(md_path)[0] + '.docx'
    doc.save(out_path)
    return out_path


if __name__ == '__main__':
    targets = sys.argv[1:]
    for t in targets:
        if not os.path.exists(t):
            print('NO EXISTE:', t)
            continue
        out = create_document(t)
        print('OK ->', out)