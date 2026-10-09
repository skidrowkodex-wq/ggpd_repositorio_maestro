# -*- coding: utf-8 -*-
"""
Cruce: elementos de materiales_sept_2026  vs  catalogo maestro de 804 items.
Responde: ¿el catalogo (core.cat_items_materiales_precios) incluye los elementos de la carpeta?
"""
import os, sys, json, re, unicodedata
from collections import defaultdict, OrderedDict

sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
BASE = os.path.join(ROOT, "materiales_sept_2026")
LEGACY = os.path.join(ROOT, "apps-refactorizadas", "SIGI-REF", "src", "data", "masterCatalogsLegacy.json")

import openpyxl, xlrd


def norm(s):
    if s is None:
        return ""
    s = str(s)
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.upper()
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def rows_xlsx(path, sheet):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb[sheet]
    for r in ws.iter_rows(values_only=True):
        yield r
    wb.close()


def rows_xls(path, sheet):
    wb = xlrd.open_workbook(path, on_demand=True)
    ws = wb.sheet_by_name(sheet)
    for r in range(ws.nrows):
        yield [ws.cell_value(r, c) for c in range(ws.ncols)]
    wb.unload_sheet(sheet)


def find_col(header, *candidates):
    """Devuelve indice de columna cuyo valor normalizado coincide (o contiene) un candidato."""
    h = [norm(c) for c in header]
    for cand in candidates:
        cn = norm(cand)
        for i, v in enumerate(h):
            if v == cn:
                return i
    for cand in candidates:
        cn = norm(cand)
        for i, v in enumerate(h):
            if cn and cn in v:
                return i
    return None


def extract(path, sheet, reader, desc_candidates, max_scan=40):
    """Localiza la cabecera y extrae las descripciones de la columna indicada."""
    it = iter(reader(path, sheet))
    desc_i = None
    header = None
    hdr_row = -1
    pre = []          # filas previas a la cabecera (descartadas)
    i = -1
    for i, row in enumerate(it):
        if i < max_scan:
            j = find_col(row, *desc_candidates)
            if j is not None and len([c for c in row if c not in (None, "")]) >= 3:
                desc_i, header, hdr_row = j, row, i
                break
        pre.append(row)
    if desc_i is None:
        return None

    fam_i = find_col(header, "FAMILIA DE MATERIAL", "FAMILIAS", "FAMILIA")

    def pack(row):
        if desc_i >= len(row):
            return None
        d = row[desc_i]
        if d in (None, ""):
            return None
        fam = ""
        if fam_i is not None and fam_i != desc_i and fam_i < len(row) and row[fam_i] is not None:
            fam = str(row[fam_i]).strip()
        return (str(d).strip(), fam)

    out = []
    for row in pre:
        v = pack(row)
        if v:
            out.append(v)
    v = pack(header)
    if v:
        out.append(v)
    for row in it:                       # continúa con el MISMO iterador
        v = pack(row)
        if v:
            out.append(v)
    return {"header": [str(c) for c in header], "col": desc_i, "fam_col": fam_i, "rows": out}


# ---------------------------------------------------------------- CATALOGO 804
with open(LEGACY, encoding="utf-8") as fh:
    legacy = json.load(fh)

catalog = legacy["precios"]                      # 804 items (descripcion, unidad, precio_eur)
cat_norm = {}
for p in catalog:
    cat_norm.setdefault(norm(p["descripcion"]), p)
fam_por_desc = {}
for fam, items in legacy["materiales"]["items_por_familia"].items():
    for it in items:
        fam_por_desc.setdefault(norm(it), fam)

print("=" * 90)
print("CATALOGO MAESTRO:", len(catalog), "items |", len(cat_norm), "descripciones normalizadas unicas")
print("=" * 90)

# ------------------------------------------------------- FUENTES DE LA CARPETA
F = os.path.join(BASE, "MATERIALES")
FUENTES = [
    ("SCEIN / EQUIPOS INDISPONIBLES", "MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL"]),
    ("SCEIN / MAT NO INCLUIDOS EN LISTA", "MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL"]),
    ("PTRSEN / MATERIAL POR ACTIVIDAD", "MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), "xls",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL"]),
    ("PTRSEN / MAT NO INCLUIDOS EN LISTA", "MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), "xls",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL"]),
    ("PLAN / MATERIALES REQUERIDOS", "MATERIALES REQUERIDOS DEL PLAN", os.path.join(F, "CONSOLIDADO DE MATERIALES Y HERRAMIENTAS 2025 AL 31122025.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL", "DESCRIPCION"]),
    ("ANALISIS / material_plan", "material_plan_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL"]),
    ("ANALISIS / material_plan", "material_plan_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL"]),
    ("ANALISIS / equipos_indisponibles", "equipos_indisponibles_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL"]),
    ("ANALISIS / equipos_indisponibles", "equipos_indisponibles_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL"]),
    ("ANALISIS / restricciones_operativas", "restricciones_operativas_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL"]),
    ("ANALISIS / restricciones_operativas", "restricciones_operativas_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION DEL MATERIAL"]),
    ("ANALISIS / alta_rotacion", "material_alta_rotacion_2025", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION"]),
    ("ANALISIS / alta_rotacion", "material_alta_rotacion_2026", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), "xlsx",
     ["DESCRIPCION"]),
]

union = {}          # norm -> {"ejemplos":[], "fuentes":set}
por_fuente = OrderedDict()
fallos = []

for etiqueta, sheet, path, kind, cands in FUENTES:
    if not os.path.exists(path):
        fallos.append(f"NO EXISTE: {path}")
        continue
    reader = rows_xlsx if kind == "xlsx" else rows_xls
    try:
        res = extract(path, sheet, reader, cands)
    except Exception as e:
        fallos.append(f"ERROR {etiqueta} [{sheet}]: {type(e).__name__}: {e}")
        continue
    if res is None:
        fallos.append(f"SIN COLUMNA DESCRIPCION: {etiqueta} [{sheet}]")
        continue
    desc = [r[0] for r in res["rows"]]
    distintas = set(norm(d) for d in desc if norm(d))
    en_cat = sum(1 for d in distintas if d in cat_norm)
    por_fuente[f"{etiqueta} :: {sheet}"] = {
        "filas": len(desc),
        "distintas": len(distintas),
        "en_catalogo": en_cat,
        "fuera_catalogo": len(distintas) - en_cat,
        "cabecera": res["header"][:12],
    }
    for d, fam in res["rows"]:
        n = norm(d)
        if not n:
            continue
        u = union.setdefault(n, {"ej": d, "f": set(), "fam_declarada": ""})
        u["f"].add(etiqueta)
        if not u["fam_declarada"] and fam:
            u["fam_declarada"] = fam

print("\n--- COBERTURA POR FUENTE (descripciones distintas vs catalogo 804) ---")
for k, v in por_fuente.items():
    pct = (100 * v["en_catalogo"] / v["distintas"]) if v["distintas"] else 0
    print(f"{v['distintas']:>6} distintas | {v['en_catalogo']:>5} en cat ({pct:5.1f}%) | {v['fuera_catalogo']:>5} FUERA | {v['filas']:>6} filas | {k}")

fuera = sorted([(k, v) for k, v in union.items() if k not in cat_norm], key=lambda x: x[0])
dentro = [k for k in union if k in cat_norm]

print("\n" + "=" * 90)
print(f"UNION DE LA CARPETA : {len(union)} descripciones distintas")
print(f"  EN EL CATALOGO    : {len(dentro)}  ({100*len(dentro)/len(union):.1f}%)")
print(f"  FUERA DEL CATALOGO: {len(fuera)}  ({100*len(fuera)/len(union):.1f}%)")
print("=" * 90)

print("\n--- ELEMENTOS DE LA CARPETA QUE NO ESTAN EN EL CATALOGO (hasta 70) ---")
for n, (orig, v) in enumerate(fuera[:70], 1):
    famd = v.get("fam_declarada", "") or "-"
    print(f"{n:>3}. {orig[:64]:<64} | fam.fuente={famd[:26]:<26} | {sorted(v['f'])[0][:28]}")

# catalogo -> carpeta
solo_cat = [p for p in catalog if norm(p["descripcion"]) not in union]
print(f"\n--- ITEMS DEL CATALOGO QUE NO APARECEN EN NINGUNA HOJA DE LA CARPETA: {len(solo_cat)} ---")
for p in solo_cat[:30]:
    print("   -", p["descripcion"][:80])

if fallos:
    print("\n--- PROBLEMAS ---")
    for f in fallos:
        print("  !", f)

# ------------------------------------------------- PRECIOS EMBEBIDOS vs 804
print("\n--- HOJAS PRECIOS EMBEBIDAS EN LOS CONSOLIDADOS vs CATALOGO 804 ---")
for archivo, lector in [
    (os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    (os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
]:
    try:
        vals = []
        for i, row in enumerate(lector(archivo, "PRECIOS")):
            if i == 0:
                continue
            if row and row[0] not in (None, ""):
                vals.append(norm(row[0]))
        s_emb = set(vals)
        s_cat = set(cat_norm)
        print(f"  {os.path.basename(archivo)[:55]}")
        print(f"     embebidas={len(vals)} ({len(s_emb)} distintas) | iguales al catalogo: {len(s_emb & s_cat)} | solo embebidas: {len(s_emb - s_cat)} | solo catalogo: {len(s_cat - s_emb)}")
    except Exception as e:
        print("  !", os.path.basename(archivo), type(e).__name__, e)

# ------------------------------------------------- FAMILIAS DECLARADAS EN LA CARPETA
print("\n--- FAMILIAS DECLARADAS EN LAS HOJAS DE LA CARPETA vs LAS 21 DEL CATALOGO ---")
fams_legacy = [str(x) for x in legacy["materiales"]["familias"]]
set_legacy = {norm(f): f for f in fams_legacy}

conteo_fam = defaultdict(int)
for n, v in union.items():
    f = v.get("fam_declarada", "")
    if f:
        conteo_fam[norm(f)] += 1

print(f"  Familias distintas declaradas en la carpeta: {len(conteo_fam)}  (catalogo tiene {len(fams_legacy)})")
en_catalogo_f = []
fuera_catalogo_f = []
for k, c in sorted(conteo_fam.items(), key=lambda x: -x[1]):
    if k in set_legacy:
        en_catalogo_f.append((set_legacy[k], c))
    else:
        fuera_catalogo_f.append((k, c))

print(f"\n  QUE EXISTEN EN EL CATALOGO ({len(en_catalogo_f)}):")
for f, c in en_catalogo_f:
    print(f"    {c:>5} elems | {f}")

print(f"\n  DECLARADAS EN LA CARPETA PERO SIN FAMILIA EQUIVALENTE ({len(fuera_catalogo_f)}):")
for f, c in fuera_catalogo_f:
    print(f"    {c:>5} elems | {f}")

usadas = {k for k, _ in en_catalogo_f}
print(f"\n  FAMILIAS DEL CATALOGO SIN USO EN LA CARPETA ({len([f for f in fams_legacy if norm(f) not in usadas])}):")
for f in fams_legacy:
    if norm(f) not in usadas:
        print(f"    - {f}")
