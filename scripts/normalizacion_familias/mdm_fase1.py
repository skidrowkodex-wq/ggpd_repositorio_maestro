# -*- coding: utf-8 -*-
"""
FASE 1 (solo lectura): construye el mapeo descripcion -> codigo_familia para los 804 items.
Fuentes: A) D_Materiales (CATALOGOS_SIGI_DETALLE.xls)  B) materiales_sept_2026  C) regla de patron.
Guarda mdm_familias_mapping.json con [{id, descripcion, familia, origen}] y NO escribe en la BD.
"""
import os, sys, json, re, unicodedata, urllib.request, urllib.parse, urllib.error
from collections import OrderedDict, defaultdict

sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
OUT = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(ROOT, "materiales_sept_2026", "MATERIALES")

import xlrd, openpyxl


def norm(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


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


# ------------------------------------------------------------------ CONFIG BD
cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m:
        cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")
HOST, KEY = cfg["INSFORGE_URL"], cfg["INSFORGE_API_KEY"]


def api(method, path, body=None):
    req = urllib.request.Request(HOST + path, method=method)
    req.add_header("apikey", KEY)
    req.add_header("Authorization", "Bearer " + KEY)
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode("utf-8")
    else:
        data = None
    try:
        with urllib.request.urlopen(req, data, timeout=60) as r:
            txt = r.read().decode("utf-8")
            return r.status, (json.loads(txt) if txt else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")[:400]


# ------------------------------------------------------------------ 1. BD
st, filas = api("GET", "/api/database/records/cat_items_materiales_precios?schema=core"
                        "&select=id,descripcion_item,codigo_familia,unidad_medida,precio_referencia_eur&limit=2000")
if st != 200:
    print("ERROR GET BD:", st, filas); sys.exit(1)
print(f"BD: {len(filas)} filas leidas")

st, fams = api("GET", "/api/database/records/cat_familias_materiales?schema=core&select=codigo_familia,nombre_familia&limit=100")
if st != 200:
    print("ERROR GET familias:", st, fams); sys.exit(1)
CODIGOS = {f["codigo_familia"] for f in fams}
NOM2COD = {norm(f["nombre_familia"]): f["codigo_familia"] for f in fams}
print(f"BD: {len(CODIGOS)} familias canonicas")

# ------------------------------------------------------------------ 2. FUENTE A: D_Materiales
wb = xlrd.open_workbook(os.path.join(ROOT, "CATALOGOS_SIGI_DETALLE.xls"))
ws = wb.sheet_by_name("D_Materiales")
d_map = OrderedDict()          # norm desc -> (familia_cod, catalogo_nombre)
hdr = False
SIN_A = defaultdict(int)
for r in range(ws.nrows):
    row = [str(ws.cell_value(r, c)).strip() for c in range(ws.ncols)]
    if norm(row[0]) == "CATALOGO CODIGO":
        hdr = True; continue
    if not hdr or not any(row): continue
    cat_cod, cat_nom, cod_item, item, estado, _ = row[:6]
    if cat_cod == "CAT_FAM" or estado.upper() != "ACTIVO":
        continue
    familia = cat_nom
    if familia.lower().startswith("materiales:"):
        familia = familia.split(":", 1)[1].strip()
    cod = NOM2COD.get(norm(familia))
    if cod is None:
        # sinonimos legacy -> canonica
        sin = {"EQUIPOSDESUBESTACIONES": "EQUIPOS_DE_SUB_ESTACIONES",
               "TRANSFORMADORESDEPOTENCIA": "TRANSFORMADORES",
               "ACEITEDIELECTRICO": "MATERIALES_VARIOS"}
        cod = NOM2COD.get(norm(sin.get(norm(familia), familia)))
    if cod is None:
        SIN_A[familia] += 1
        continue
    d_map.setdefault(norm(item), cod)
print(f"\nA) D_Materiales      : {len(d_map)} items mapeados" + (f" | SIN MAPEO: {dict(SIN_A)}" if SIN_A else ""))

# ------------------------------------------------------------------ 3. FUENTE B: carpeta
FUENTES = [
    ("MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    ("MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E 2025 AL 311225 AVANCE.xlsx"), rows_xlsx),
    ("MATERIAL  POR ACTIVIDAD", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
    ("MAT. NO INCLUIDOS EN LIST", os.path.join(F, "CONSOLIDADO DE RESTRICCIONES OPERATIVAS DE CTOS 2025 AL 311225 AVANCE.xls"), rows_xls),
    ("MATERIALES REQUERIDOS DEL PLAN", os.path.join(F, "CONSOLIDADO DE MATERIALES Y HERRAMIENTAS 2025 AL 31122025.xlsx"), rows_xlsx),
    ("material_plan_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("material_plan_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("equipos_indisponibles_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("equipos_indisponibles_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("restricciones_operativas_2025", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("restricciones_operativas_2026", os.path.join(F, "ANALISIS", "Tabla materiales alta rotacion-2.xlsx"), rows_xlsx),
    ("material_alta_rotacion_2025", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), rows_xlsx),
    ("material_alta_rotacion_2026", os.path.join(F, "ANALISIS", "material_alta_rotacion-2.xlsx"), rows_xlsx),
]
CAND = ["DESCRIPCION DEL MATERIAL", "DESCRIPCIÓN DEL MATERIAL", "DESCRIPCION"]
SINONIMOS = {
    "ALUMBRADO PUBLICO": "MATERIALES ALUMBRADO PUBLICO",
    "EQUIPOS DE SUB ESTRACIONES": "EQUIPOS DE SUB ESTACIONES",
    "EQUIPOSDESUBESTACIONES": "EQUIPOS DE SUB ESTACIONES",
    "EQUIPOS DE SUBESTACIONES": "EQUIPOS DE SUB ESTACIONES",
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
    "ACEITE DIELECTRICO": "MATERIALES VARIOS",
}


def canon_fam(raw):
    n = norm(raw)
    if not n or n in ("FAMILIA", "FAMILIA DE MATERIAL", "DESCRIPCION DEL MATERIAL", "DESCRIPCION"):
        return None
    if n in NOM2COD: return NOM2COD[n]
    s = SINONIMOS.get(n, n)
    if norm(s) in NOM2COD: return NOM2COD[norm(s)]
    for k in NOM2COD:
        if k and k in n: return NOM2COD[k]
    return None


b_map = {}                      # norm desc -> {fam: conteo}
vistos = set()
for sheet, path, reader in FUENTES:
    if not os.path.exists(path): continue
    it = iter(reader(path, sheet))
    hdr_row, desc_i, pre = None, None, []
    for i, row in enumerate(it):
        if i < 40:
            j = find_col(row, *CAND)
            if j is not None and len([c for c in row if c not in (None, "")]) >= 3:
                hdr_row, desc_i = row, j; break
        pre.append(row)
    if desc_i is None: continue
    fam_i = find_col(hdr_row, "FAMILIA DE MATERIAL", "FAMILIAS", "FAMILIA")
    for row in list(pre) + [hdr_row] + list(it):
        if desc_i >= len(row): continue
        d = row[desc_i]
        if d in (None, ""): continue
        n = norm(d)
        if not n or re.match(r"^[\d.,\s]*$", str(d).strip()): continue
        fam = ""
        if fam_i is not None and fam_i < len(row) and row[fam_i] is not None:
            fam = str(row[fam_i]).strip()
        c = canon_fam(fam)
        if c:
            b_map.setdefault(n, defaultdict(int))[c] += 1

print(f"B) carpeta           : {len(b_map)} descripciones con familia declarada")

# ------------------------------------------------------------------ 4. FUENTE C: regla de patron
REGLA_TRX = re.compile(r"^(TDI|TDP|TDPOELCO|TDPOENEL|TRF|TRANSF)\b")


def regla(desc_norm):
    if REGLA_TRX.match(desc_norm):
        return NOM2COD.get(norm("TRANSFORMADORES"))
    return None


# ------------------------------------------------------------------ 5. APLICAR A LOS 804
mapeo = []
origenes = defaultdict(int)
pendientes = []
for f in filas:
    n = norm(f["descripcion_item"])
    fam, origen = None, None
    if n in d_map:
        fam, origen = d_map[n], "A_D_MATERIALES"
    elif n in b_map:
        fam = max(b_map[n].items(), key=lambda kv: kv[1])[0]
        origen = "B_CARPETA"
    else:
        fam = regla(n)
        origen = "C_REGLA_TRX" if fam else None
    if not fam or fam not in CODIGOS:
        pendientes.append(f["descripcion_item"])
        origenes["SIN_FAMILIA"] += 1
        fam = None
    else:
        origenes[origen] += 1
    mapeo.append({"id": f["id"], "descripcion": f["descripcion_item"],
                  "familia": fam, "origen": origen,
                  "actual": f.get("codigo_familia")})

print("\n" + "=" * 95)
print("MAPEO FINAL PARA LOS 804 ITEMS")
print("=" * 95)
for k in sorted(origenes):
    print(f"  {k:<18}: {origenes[k]:>4}")
print(f"  {'TOTAL':<18}: {len(mapeo):>4}")

dist = defaultdict(int)
for m in mapeo:
    dist[m["familia"] or "(SIN FAMILIA)"] += 1
print("\n  DISTRIBUCION POR FAMILIA:")
for k, v in sorted(dist.items(), key=lambda x: -x[1]):
    print(f"    {v:>4}  {k}")

if pendientes:
    print(f"\n  !!! SIN FAMILIA ({len(pendientes)}):")
    for p in pendientes:
        print("     -", p)

# items asignados por regla (auditoria)
regla_items = [m["descripcion"] for m in mapeo if m["origen"] == "C_REGLA_TRX"]
print(f"\n  ASIGNADOS POR REGLA ({len(regla_items)}):")
for x in regla_items:
    print("     -", x)

# conflictos A vs B
conf = 0
for m in mapeo:
    n = norm(m["descripcion"])
    if m["origen"] == "A_D_MATERIALES" and n in b_map and m["familia"] not in b_map[n]:
        conf += 1
print(f"\n  Conflictos A vs B (D_Materiales vs carpeta): {conf}")

out = os.path.join(OUT, "mdm_familias_mapping.json")
with open(out, "w", encoding="utf-8") as fh:
    json.dump(mapeo, fh, ensure_ascii=False, indent=1)
print(f"\n  Mapping guardado: {out}")
ya_tienen = sum(1 for m in mapeo if m["actual"])
print(f"  Items que YA tenian codigo_familia en BD: {ya_tienen}")
