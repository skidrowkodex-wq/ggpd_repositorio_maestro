# -*- coding: utf-8 -*-
"""
NAC_2026 ... PROYECCION_2024_2028.xlsx  ->  hoja LISTADO
Agrega:
   X (24) fam_mat_normalizado    -> codigo canonico de core.cat_familias_materiales
   Y (25) fam_mat_descripcion    -> nombre_familia canonico

Reglas:
  1) Si FAM trae prefijo 'FAM_' se elimina (nombre de pila).
  2) EXACTO  : compact(FAM) == compact(codigo_familia|nombre_familia)  de la BD
  3) EQ      : tabla de equivalencias documentada (52 rótulos legacy -> 21 codigos)
  4) SUBCADAENA: el codigo BD mas largo contenido (o que contenga) a FAM
  5) Si no hay mapeo valido -> se deja EN BLANCO y se documenta en 'FAMILIAS_PENDIENTES'
"""
import sys, os, re, json, unicodedata, urllib.request
from collections import Counter, defaultdict
from copy import copy
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
SRC = os.path.join(ROOT, "NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V03_PROYECCION_2024_2028.xlsx")
DST = os.path.join(ROOT, "NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V03_PROYECCION_2024_2028 - FAMILIA NORMALIZADO.xlsx")
EQ_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prop_familia2.json")


def norm(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
    return re.sub(r"\s+", " ", re.sub(r"[^A-Z0-9]+", " ", s)).strip()


def compact(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().upper()
    return re.sub(r"[^A-Z0-9]", "", s)


def quitar_prefijo_fam(v):
    """'FAM_HERRAJES' -> 'HERRAJES' (nombre de pila)."""
    if v is None: return ""
    t = str(v).strip()
    m = re.match(r"^\s*FAM[\s_\-\.]+(.+)$", t, flags=re.I)
    return m.group(1).strip() if m else t


# ------------------------------------------------------------------ BD
cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m: cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def get(p):
    r = urllib.request.Request(cfg["INSFORGE_URL"] + p)
    r.add_header("apikey", cfg["INSFORGE_API_KEY"])
    r.add_header("Authorization", "Bearer " + cfg["INSFORGE_API_KEY"])
    return json.load(urllib.request.urlopen(r, timeout=60))


fams = get("/api/database/records/cat_familias_materiales?schema=core"
           "&select=codigo_familia,nombre_familia&limit=100")
fams = {f["codigo_familia"]: f["nombre_familia"] for f in fams}
por_cmp = {}
for c, n in fams.items():
    por_cmp[compact(c)] = c
    por_cmp[compact(n)] = c
EQ = json.load(open(EQ_PATH, encoding="utf-8"))
print(f"BD: {len(fams)} familias | EQ: {len(EQ)} equivalencias")


def clasificar(valor_raw):
    base = quitar_prefijo_fam(valor_raw)
    if base == "":
        return "VACIO", None, ""
    ck, nk = compact(base), norm(base)
    if ck in por_cmp:
        return "EXACTO", por_cmp[ck], base
    if nk in EQ and EQ[nk] in fams:
        return "EQUIVALENTE", EQ[nk], base
    cand = [c for c in fams if compact(c) and (compact(c) in ck or (ck and ck in compact(c)))]
    if cand:
        return "SUBCADENA", max(cand, key=len), base
    return "SIN_MAPEO", None, base


# ------------------------------------------------------------------ LIBRO
wb = openpyxl.load_workbook(SRC)            # preserva estilos/formulas
ws = wb["LISTADO"]
hdr = [c.value for c in ws[1]]
i_fam, i_desc = hdr.index("FAM"), hdr.index("DESC")
NC1, NC2 = ws.max_column + 1, ws.max_column + 2
print(f"LISTADO: {ws.max_row} filas x {ws.max_column} cols -> nuevas {NC1}/{NC2}")

ws.cell(row=1, column=NC1, value="fam_mat_normalizado")
ws.cell(row=1, column=NC2, value="fam_mat_descripcion")
for c in (NC1, NC2):
    ws.cell(row=1, column=c)._style = copy(ws.cell(row=1, column=1)._style)

estad = Counter()
pendientes = []
por_fam = Counter()
filas_ok = 0

for r in range(2, ws.max_row + 1):
    fam_raw = ws.cell(row=r, column=i_fam + 1).value
    desc_raw = ws.cell(row=r, column=i_desc + 1).value
    cls, cod, base = clasificar(fam_raw)
    estad[cls] += 1

    if cod:
        filas_ok += 1
        por_fam[cod] += 1
        ws.cell(row=r, column=NC1, value=cod)
        ws.cell(row=r, column=NC2, value=fams[cod])
        if base != str(fam_raw).strip() and cls == "EXACTO" and base != str(fam_raw).strip():
            pass
    else:
        # sin familia canonica -> BLANCO + documento
        ws.cell(row=r, column=NC1, value=None)
        ws.cell(row=r, column=NC2, value=None)
        pendientes.append((r, fam_raw, desc_raw, cls))

    for c in (NC1, NC2):
        ws.cell(row=r, column=c)._style = copy(ws.cell(row=r, column=i_fam + 1)._style)

# ancho de columnas
ws.column_dimensions[openpyxl.utils.get_column_letter(NC1)].width = 36
ws.column_dimensions[openpyxl.utils.get_column_letter(NC2)].width = 36

print("Clasificacion:", dict(estad))
print(f"Filas con familia canonica: {filas_ok} | pendientes: {len(pendientes)}")

# ------------------------------------------------------------------ hoja pendientes
NP = "FAMILIAS_PENDIENTES"
if NP in wb.sheetnames:
    del wb[NP]
wp = wb.create_sheet(NP)
wp.append(["FILAS SIN FAMILIA CANONICA - hoja LISTADO"])
wp.append([f"Archivo origen: {os.path.basename(SRC)} | familias vigentes en BD: {len(fams)} (core.cat_familias_materiales)"])
wp.append([])
wp.append(["FILA", "FAM (origen)", "DESC (origen)", "MOTIVO"])
fill = PatternFill("solid", fgColor="1F4E79"); font = Font(bold=True, color="FFFFFF", size=10)
thin = Side(style="thin", color="BFBFBF")
for c in wp[4]:
    c.fill = fill; c.font = font
    c.alignment = Alignment(horizontal="center", vertical="center")
    c.border = Border(left=thin, right=thin, top=thin, bottom=thin)
motivo = {"SIN_MAPEO": "FAM sin equivalente en core.cat_familias_materiales",
          "VACIO": "Celda FAM vacia",
          "FILA_TOTAL": "Fila de subtotal / gran total (no es un material)"}
for fila, fam, desc, cls in pendientes:
    clave = "FILA_TOTAL" if cls == "FILA_TOTAL" else cls
    wp.append([fila, str(fam) if fam is not None else "", str(desc) if desc is not None else "",
               motivo.get(clave, clave)])
for row in wp.iter_rows(min_row=5, max_row=wp.max_row, max_col=4):
    for c in row:
        c.border = Border(left=thin, right=thin, top=thin, bottom=thin)
wp.column_dimensions["A"].width = 8
wp.column_dimensions["B"].width = 52
wp.column_dimensions["C"].width = 52
wp.column_dimensions["D"].width = 52
wp.freeze_panes = "A5"

# ------------------------------------------------------------------ resumen por familia
NR = "RESUMEN_FAM_NORMALIZADA"
if NR in wb.sheetnames:
    del wb[NR]
wr = wb.create_sheet(NR)
wr.append(["PROYECCION 2024-2028 | Materiales por familia normalizada"])
wr.append([f"Normalizacion aplicada sobre hoja LISTADO con {len(fams)} familias de core.cat_familias_materiales"])
wr.append([])
wr.append(["FAM_MAT_NORMALIZADO", "FAM_MAT_DESCRIPCION", "CANTIDAD MATERIALES", "% PARTICIPACION"])
for c in wr[4]:
    c.fill = fill; c.font = font
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = Border(left=thin, right=thin, top=thin, bottom=thin)
total = sum(por_fam.values())
for cod, n in sorted(por_fam.items(), key=lambda kv: -kv[1]):
    wr.append([cod, fams[cod], n, (n / total) if total else 0])
wr.append(["TOTAL", "", total, 1])
for row in wr.iter_rows(min_row=5, max_row=wr.max_row, max_col=4):
    for c in row:
        c.border = Border(left=thin, right=thin, top=thin, bottom=thin)
for c in wr[wr.max_row]:
    c.font = Font(bold=True); c.fill = PatternFill("solid", fgColor="DDEBF7")
for r in range(5, wr.max_row + 1):
    wr.cell(row=r, column=4).number_format = "0.0%"
wr.column_dimensions["A"].width = 38
wr.column_dimensions["B"].width = 38
wr.column_dimensions["C"].width = 22
wr.column_dimensions["D"].width = 18
wr.freeze_panes = "A5"
wr.append([])
wr.append(["NOTA: filas de subtotal/gran total y celdas FAM vacias o sin equivalente quedan en blanco en LISTADO (ver hoja FAMILIAS_PENDIENTES)."])

wb.save(DST)
wb.close()
print("\nGUARDADO:", DST)
print("Tamano:", f"{os.path.getsize(DST):,} bytes")
