# -*- coding: utf-8 -*-
"""
Segunda pasada:
 A) Depurar "fuera de catalogo" (ruido: numeros sueltos, cabeceras repetidas).
 B) Aportes de la carpeta para asignar codigo_familia a los 804 items del catalogo.
 C) Elementos de la carpeta que podrian AMPLIAR el catalogo (¿tienen precio?).
"""
import os, sys, json, re, unicodedata
from collections import defaultdict, OrderedDict

sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
F = os.path.join(ROOT, "materiales_sept_2026", "MATERIALES")
LEGACY = os.path.join(ROOT, "apps-refactorizadas", "SIGI-REF", "src", "data", "masterCatalogsLegacy.json")

import openpyxl, xlrd


def norm(s):
    if s is None:
        return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
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


def find_col(header, *cands):
    h = [norm(c) for c in header]
    for cand in cands:
        cn = norm(cand)
        for i, v in enumerate(h):
            if v == cn:
                return i
    for cand in cands:
        cn = norm(cand)
        for i, v in enumerate(h):
            if cn and cn in v:
                return i
    return None


def scan(path, sheet, reader, cands, max_scan=40):
    """-> (header, filas[(desc,fam,precio,cant)]) localizando cabecera."""
    it = iter(reader(path, sheet))
    header = None
    desc_i = None
    pre = []
    for i, row in enumerate(it):
        if i < max_scan:
            j = find_col(row, *cands)
            if j is not None and len([c for c in row if c not in (None, "")]) >= 3:
                header, desc_i = row, j
                break
        pre.append(row)
    if desc_i is None:
        return None, None
    fam_i = find_col(header, "FAMILIA DE MATERIAL", "FAMILIAS", "FAMILIA")
    pre_i = find_col(header, "PRECIO UNITARIO", "PRECIO UNITARIO (EUROS)", "PRECIO")
    can_i = find_col(header, "CANTIDAD SOLICITADA", "CANTIDAD", "TOTAL ANUAL")
    todo = list(pre) + [header] + list(it)
    out = []
    for row in todo:
        if desc_i >= len(row):
            continue
        d = row[desc_i]
        if d in (None, ""):
            continue
        g = lambda ix: (row[ix] if ix is not None and ix < len(row) and row[ix] is not None else "")
        out.append((str(d).strip(),
                    str(g(fam_i)).strip() if fam_i is not None else "",
                    g(pre_i), g(can_i)))
    return header, out


# --------------------------------------------------------------- CATALOGO 804
with open(LEGACY, encoding="utf-8") as fh:
    legacy = json.load(fh)
catalog = legacy["precios"]
cat_norm = OrderedDict()
for p in catalog:
    cat_norm.setdefault(norm(p["descripcion"]), p)
fam_por_desc = {}
for fam, items in legacy["materiales"]["items_por_familia"].items():
    for it in items:
        fam_por_desc.setdefault(norm(it), fam)
fams_legacy = [str(x) for x in legacy["materiales"]["familias"]]
FAM_CANON = {norm(f): f for f in fams_legacy}

# synonym / typo map declarado en la carpeta -> canon
SINONIMOS = {
    "ALUMBRADO PUBLICO": "MATERIALES ALUMBRADO PUBLICO",
    "MATERIALES ALUMBRADO PUBLICO": "MATERIALES ALUMBRADO PUBLICO",
    "EQUIPOS DE SUB ESTRACIONES": "EQUIPOS DE SUB ESTACIONES",
    "EQUIPOSDESUBESTACIONES": "EQUIPOS DE SUB ESTACIONES",
    "EQUIPOS DE SUBESTACIONES": "EQUIPOS DE SUB ESTACIONES",
    "EQUIPOS DE SUB ESTACIONES": "EQUIPOS DE SUB ESTACIONES",
    "TRANSFORMADORESDEPOTENCIA": "TRANSFORMADORES",
    "TRANSFORMADORDEPOTENCIA": "TRANSFORMADORES",
    "TRANSFORMADORES DE POTENCIA": "TRANSFORMADORES",
    "TRANSFORMADORES DE DISTRIBUCION": "TRANSFORMADORES",
    "TRANSFORMADORES DE MEDIDA": "TRANSFORMADORES DE MEDIDA (TC Y TP)",
    "TRANSFORMADORES DE CORRIENTE": "TRANSFORMADORES DE MEDIDA (TC Y TP)",
    "TRANSFORMADORES DE TENSION": "TRANSFORMADORES DE MEDIDA (TC Y TP)",
    "CABLES Y CONDUCTOTES": "CABLES Y CONDUCTORES",
    "LINEAS CABLES O CONDUCTORES": "CABLES Y CONDUCTORES",
    "BATERIAS": "BANCO DE BATERIAS",
    "CORTACORRIENTE": "CORTACORRIENTES",
    "RECONECTADOR": "RECONECTADORES",
    "RECONECTADOR 15 5 KV": "RECONECTADORES",
    "RECONECTADOR DE POTENCIA": "RECONECTADORES",
    "AISLAMIENTO": "AISLADORES Y COPAS",
    "AISLADOR AVERIADO": "AISLADORES Y COPAS",
    "CONDUCTOR AVERIADO": "CABLES Y CONDUCTORES",
    "EQUIPO DE TIERRA": "HERRAJES",
}


def canon_de_fam_declarada(raw):
    n = norm(raw)
    if not n or n in ("FAMILIA", "FAMILIA DE MATERIAL", "DESCRIPCION DEL MATERIAL"):
        return None
    if n in FAM_CANON:
        return FAM_CANON[n]
    if n in SINONIMOS:
        return FAM_CANON.get(norm(SINONIMOS[n]))
    # contiene la familia canon?
    for k, v in FAM_CANON.items():
        if k and k in n:
            return v
    return None


# ------------------------------------------------------- HOJAS DE LA CARPETA
FUENTES = [
    ("SCEIN", "MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    ("SCEIN-NOINC", "MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    ("PTRSEN", "MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
    ("PTRSEN-NOINC", "MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
    ("PLAN", "MATERIALES REQUERIDOS DEL PLAN", os.path.join(F, "CONSOLIDADO DE MATERIALES Y HERRAMIENTAS 2025 AL 31122025.xlsx"), rows_xlsx),
    ("AN-PLAN26", "material_plan_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-PLAN25", "material_plan_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-EQ25", "equipos_indisponibles_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-EQ26", "equipos_indisponibles_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-RES25", "restricciones_operativas_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-RES26", "restricciones_operativas_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("AN-ROT25", "material_alta_rotacion_2025", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), rows_xlsx),
    ("AN-ROT26", "material_alta_rotacion_2026", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), rows_xlsx),
]
CAND = ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL", "DESCRIPCION"]

union = OrderedDict()          # norm -> {ej, fams:set, con_precio:bool, fuentes:set}
RUIDO = re.compile(r"^[\d.,\s]*$")
for etiqueta, sheet, path, reader in FUENTES:
    if not os.path.exists(path):
        continue
    try:
        hdr, rows = scan(path, sheet, reader, CAND)
    except Exception as e:
        print("!", etiqueta, sheet, type(e).__name__, e)
        continue
    if hdr is None:
        print("!", "sin cabecera", etiqueta, sheet)
        continue
    for d, fam, precio, cant in rows:
        n = norm(d)
        if not n or RUIDO.match(d.strip()) or n in ("FAMILIA", "FAMILIA DE MATERIAL", "DESCRIPCION DEL MATERIAL", "DESCRIPCION"):
            continue
        u = union.setdefault(n, {"ej": d, "fams": set(), "con_precio": False, "fuentes": set()})
        u["fuentes"].add(etiqueta)
        if fam:
            c = canon_de_fam_declarada(fam)
            if c:
                u["fams"].add(c)
        try:
            if precio not in (None, "") and float(str(precio).replace(",", ".")) > 0:
                u["con_precio"] = True
        except Exception:
            pass

fuera = [(n, v) for n, v in union.items() if n not in cat_norm]
dentro = [(n, v) for n, v in union.items() if n in cat_norm]

print("=" * 95)
print(f"UNION DE LA CARPETA (depurada): {len(union)} descripciones distintas")
print(f"   EN CATALOGO    : {len(dentro)}  ({100*len(dentro)/len(union):.1f}%)")
print(f"   FUERA CATALOGO : {len(fuera)}  ({100*len(fuera)/len(union):.1f}%)")
con_precio_fuera = [v for _, v in fuera if v["con_precio"]]
print(f"   FUERA Y CON PRECIO > 0 EN LA FUENTE: {len(con_precio_fuera)}  (ampliacion factible)")
con_fam_fuera = [v for _, v in fuera if v["fams"]]
print(f"   FUERA PERO CON FAMILIA CANONICA DECLARADA: {len(con_fam_fuera)}")
print("=" * 95)

# ------------------------------------------------- B) APORTES PARA EL MDM (804)
paso_a = []    # familia desde items_por_familia (legacy)
paso_b = []    # familia desde carpeta
paso_c = []    # sigue sin familia
for n, p in cat_norm.items():
    if n in fam_por_desc:
        c = canon_de_fam_declarada(fam_por_desc[n]) or fam_por_desc[n]
        paso_a.append((p, c))
    else:
        u = union.get(n)
        if u and u["fams"]:
            paso_b.append((p, sorted(u["fams"])))
        else:
            paso_c.append(p)

print("\n" + "=" * 95)
print("APORTES PARA ASIGNAR codigo_familia A LOS 804 ITEMS DEL CATALOGO")
print("=" * 95)
print(f"  PASO A - familia desde items_por_familia (legacy JSON)      : {len(paso_a):>4}  ({100*len(paso_a)/len(cat_norm):.1f}%)")
print(f"  PASO B - familia aportada por la CARPETA (declarada)        : {len(paso_b):>4}  ({100*len(paso_b)/len(cat_norm):.1f}%)")
print(f"  PASO C - SIGUEN SIN FAMILIA tras ambos cruces              : {len(paso_c):>4}  ({100*len(paso_c)/len(cat_norm):.1f}%)")
print(f"  >>> TOTAL ASIGNABLES: {len(paso_a)+len(paso_b)} / {len(cat_norm)}  ({100*(len(paso_a)+len(paso_b))/len(cat_norm):.1f}%)")

print("\n  --- PASO B: items + familia aportada por la carpeta (primeros 30) ---")
for p, fams in paso_b[:30]:
    print(f"    {p['descripcion'][:62]:<62} -> {' / '.join(fams)}")

print(f"\n  --- PASO C: {len(paso_c)} items sin familia (todos) ---")
for p in paso_c:
    print(f"    - {p['descripcion'][:78]}")

# ------------------------------------------------- C) AMPLIACION DEL CATALOGO
print("\n" + "=" * 95)
print("AMPLIACION POTENCIAL DEL CATALOGO (elementos de la carpeta ausentes en el)")
print("=" * 95)
fam_de_fuera = defaultdict(list)
for n, v in fuera:
    for f in v["fams"]:
        fam_de_fuera[f].append(v["ej"])
    if not v["fams"]:
        fam_de_fuera["(sin familia declarada)"].append(v["ej"])
print(f"  {'FAMILIA':<38} {'N° elems':>8}  {'con precio':>10}")
for f, elems in sorted(fam_de_fuera.items(), key=lambda x: -len(x[1])):
    cp = sum(1 for e in elems if union[norm(e)]["con_precio"])
    print(f"  {f[:38]:<38} {len(elems):>8}  {cp:>10}")
print(f"\n  TOTAL elems fuera: {len(fuera)}")
