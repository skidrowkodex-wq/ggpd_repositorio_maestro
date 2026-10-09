# -*- coding: utf-8 -*-
"""
Comparacion D_Materiales (CATALOGOS_SIGI_DETALLE.xls)
       vs  BD core.cat_items_materiales_precios (804)
       vs  carpeta materiales_sept_2026
"""
import sys, os, json, re, unicodedata, csv
from collections import OrderedDict, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
LEGACY = os.path.join(ROOT, "apps-refactorizadas", "SIGI-REF", "src", "data", "masterCatalogsLegacy.json")

import xlrd


def norm(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def leer_d_materiales(path):
    wb = xlrd.open_workbook(path, on_demand=True)
    ws = wb.sheet_by_name("D_Materiales")
    hdr = None
    filas = []
    for r in range(ws.nrows):
        row = [ws.cell_value(r, c) for c in range(ws.ncols)]
        if norm(row[0]) == "CATALOGO CODIGO":
            hdr = r
            continue
        if hdr is not None:
            if any(str(x).strip() for x in row):
                filas.append([str(x).strip() for x in row])
    wb.unload_sheet("D_Materiales")
    return filas


archivos = [
    ("RAIZ (5/10)", os.path.join(ROOT, "CATALOGOS_SIGI_DETALLE.xls")),
    ("data_reunion (2/10)", os.path.join(ROOT, "data_reunion", "CATALOGOS_SIGI_DETALLE.xls")),
]

datos = {}
for etiqueta, p in archivos:
    if os.path.exists(p):
        datos[etiqueta] = leer_d_materiales(p)

# ------------------------------------------------------------------ D_MATERIALES
d = datos["RAIZ (5/10)"]
por_cat = OrderedDict()
items_d = OrderedDict()      # norm -> (descripcion, codigo_item, catalogo)
familias_d = []
for cat_cod, cat_nom, cod_item, item, estado, cod_edo in d:
    por_cat.setdefault(cat_cod, {"nom": cat_nom, "n": 0, "activos": 0})
    por_cat[cat_cod]["n"] += 1
    if estado.upper() == "ACTIVO":
        por_cat[cat_cod]["activos"] += 1
    if cat_cod == "CAT_FAMILIAS_MATERIAL":
        familias_d.append(item)
    else:
        items_d.setdefault(norm(item), (item, cod_item, cat_cod))

print("=" * 95)
print("D_Materiales — CATALOGOS_SIGI_DETALLE.xls (raiz)")
print("=" * 95)
print(f"  Registros totales : {len(d)}")
print(f"  Catalogos         : {len(por_cat)}")
print(f"  Filas de FAMILIA  : {len(familias_d)}")
print(f"  Filas de ITEM     : {len(items_d)} (distintas por descripcion)")
print()
print(f"  {'CATALOGO':<34} {'nom':<34} {'filas':>5} {'act':>5}")
for k, v in por_cat.items():
    print(f"  {k:<34} {v['nom'][:34]:<34} {v['n']:>5} {v['activos']:>5}")

# ------------------------------------------------------------------ BD 804
with open(LEGACY, encoding="utf-8") as fh:
    legacy = json.load(fh)
precios = legacy["precios"]
items_bd = OrderedDict()
for p in precios:
    items_bd.setdefault(norm(p["descripcion"]), p)

print("\n" + "=" * 95)
print("COMPARACION  D_Materiales  vs  BD (804 = catalogo maestro de precios)")
print("=" * 95)
s_d, s_bd = set(items_d), set(items_bd)
solo_d = [items_d[k] for k in s_d - s_bd]
solo_bd = [items_bd[k] for k in s_bd - s_d]
comunes = s_d & s_bd
print(f"  D_Materiales items : {len(s_d)}")
print(f"  BD (precios 804)    : {len(s_bd)} descripciones unicas (804 filas)")
print(f"  EN COMUN           : {len(comunes)}")
print(f"  SOLO EN D_Materiales: {len(solo_d)}   -> D trae items que la BD NO tiene")
print(f"  SOLO EN LA BD       : {len(solo_bd)}   -> BD trae items que D NO tiene")

print("\n  --- SOLO EN D_Materiales (no estan en la BD) ---")
for it, cod, cat in sorted(solo_d, key=lambda x: (x[2], x[0])):
    print(f"    [{cat:<28}] {it[:70]}")

print(f"\n  --- SOLO EN LA BD (no estan en D_Materiales): {len(solo_bd)} ---")
for p in sorted(solo_bd, key=lambda x: norm(x["descripcion"])):
    print(f"    - {p['descripcion'][:80]}  | {p.get('unidad','')} | {p.get('precio_eur','')}")

# ------------------------------------------------------------------ vs CARPETA
F = os.path.join(ROOT, "materiales_sept_2026", "MATERIALES")
import openpyxl


def rows_xlsx(path, sheet):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    for r in wb[sheet].iter_rows(values_only=True):
        yield r
    wb.close()


def rows_xls(path, sheet):
    wb = xlrd.open_workbook(path, on_demand=True)
    ws = wb.sheet_by_name(sheet)
    for r in range(ws.nrows):
        yield [ws.cell_value(r, c) for c in range(ws.ncols)]
    wb.unload_sheet(sheet)


def find_col(header, *cands):
    h = [norm(c) for c in header]
    for cand in cands:
        cn = norm(cand)
        for i, v in enumerate(h):
            if v == cn: return i
    for cand in cands:
        cn = norm(cand)
        for i, v in enumerate(h):
            if cn and cn in v: return i
    return None


FUENTES = [
    ("SCEIN", "MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    ("SCEIN-NOINC", "MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    ("PTRSEN", "MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
    ("PTRSEN-NOINC", "MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
    ("PLAN", "MATERIALES REQUERIDOS DEL PLAN", os.path.join(F, "CONSOLIDADO DE MATERIALES Y HERRAMIENTAS 2025 AL 31122025.xlsx"), rows_xlsx),
    ("AN-PLAN26", "material_plan_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-EQ25", "equipos_indisponibles_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-EQ26", "equipos_indisponibles_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-RES25", "restricciones_operativas_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-RES26", "restricciones_operativas_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-ROT25", "material_alta_rotacion_2025", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), rows_xlsx),
    ("AN-ROT26", "material_alta_rotacion_2026", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), rows_xlsx),
]
CAND = ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL", "DESCRIPCION"]
RUIDO = re.compile(r"^[\d.,\s]*$")
union = OrderedDict()
for etiqueta, sheet, path, reader in FUENTES:
    if not os.path.exists(path): continue
    it = iter(reader(path, sheet))
    hdr, desc_i = None, None
    pre = []
    for i, row in enumerate(it):
        if i < 40:
            j = find_col(row, *CAND)
            if j is not None and len([c for c in row if c not in (None, "")]) >= 3:
                hdr, desc_i = row, j
                break
        pre.append(row)
    if desc_i is None:
        continue
    for row in list(pre) + [hdr] + list(it):
        if desc_i >= len(row): continue
        val = row[desc_i]
        if val in (None, ""): continue
        n = norm(val)
        if not n or RUIDO.match(str(val).strip()) or n in ("FAMILIA", "FAMILIA DE MATERIAL", "DESCRIPCION DEL MATERIAL"):
            continue
        union.setdefault(n, str(val).strip())

s_carp = set(union)
print("\n" + "=" * 95)
print("COMPARACION  D_Materiales / BD  vs  CARPETA materiales_sept_2026")
print("=" * 95)
print(f"  Carpeta (distintas)          : {len(s_carp)}")
print(f"  D_Materiales ∩ carpeta       : {len(s_d & s_carp)}   ({100*len(s_d & s_carp)/len(s_d):.1f}% de D)")
print(f"  BD ∩ carpeta                 : {len(s_bd & s_carp)}   ({100*len(s_bd & s_carp)/len(s_bd):.1f}% de BD)")
print(f"  Carpeta FUERA de D_Materiales: {len(s_carp - s_d)}")
print(f"  Carpeta FUERA de la BD       : {len(s_carp - s_bd)}")
print(f"  D_Materiales que NO usa la carpeta: {len(s_d - s_carp)}")

# ------------------------------------------------------------------ 3 vias
print("\n" + "=" * 95)
print("MATRIZ DE COBERTURA (3 vias)")
print("=" * 95)
solo_carp = s_carp - s_d - s_bd
todo3 = s_carp & s_d & s_bd
print(f"  En las 3 fuentes            : {len(todo3)}")
print(f"  Solo en la carpeta           : {len(solo_carp)}")
print(f"  D y BD, no carpeta           : {len((s_d & s_bd) - s_carp)}")
print(f"  D y carpeta, no BD           : {len((s_d & s_carp) - s_bd)}")
print(f"  BD y carpeta, no D           : {len((s_bd & s_carp) - s_d)}")
print(f"  Solo D                       : {len((s_d - s_bd) - s_carp)}")
print(f"  Solo BD                      : {len((s_bd - s_d) - s_carp)}")

# ------------------------------------------------------------------ CSV salida
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cruce_3_vias.csv")
with open(out, "w", newline="", encoding="utf-8-sig") as fh:
    w = csv.writer(fh)
    w.writerow(["descripcion_normalizada", "en_D_Materiales", "en_BD_804", "en_carpeta", "catalogo_D", "codigo_item_D"])
    for n in sorted(s_d | s_bd | s_carp):
        dd = items_d.get(n)
        w.writerow([n, "SI" if n in s_d else "", "SI" if n in s_bd else "", "SI" if n in s_carp else "",
                    dd[2] if dd else "", dd[1] if dd else ""])
print(f"\n  CSV detallado: {out}")

# ------------------------------------------------------------------ copia data_reunion
if "data_reunion (2/10)" in datos:
    e = datos["data_reunion (2/10)"]
    i_e = OrderedDict()
    for fila in e:
        if fila[0] != "CAT_FAMILIAS_MATERIAL":
            i_e.setdefault(norm(fila[3]), fila)
    print(f"\n  RAIZ vs data_reunion: {len(d)} vs {len(e)} filas | items {len(items_d)} vs {len(i_e)} | iguales: {len(set(items_d) & set(i_e))}")
