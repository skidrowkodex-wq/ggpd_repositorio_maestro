# -*- coding: utf-8 -*-
"""
Auditoria rigorosa: valores de familia del Excel vs catalogo core.cat_familias_materiales.

Clasificacion de cada valor del Excel:
  1. EXACTO      -> misma escritura (ignorando acentos/mayusculas/puntuacion)
  2. VARIANTE    -> mismas letras sin espacios (p.ej. EQUIPOSDESUBESTACIONES)
  3. EQUIVALENTE -> existe en BD pero con otro rotulo (regla semantica documentada)
  4. AUSENTE     -> no tiene equivalente en el catalogo de la BD  <-- hueco real
  5. INVALIDO    -> la celda ni siquiera es una familia (dato basura)
"""
import sys, os, re, json, unicodedata, urllib.request
from collections import Counter, defaultdict
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
SRC = os.path.join(ROOT, "TABLA_UNICA_MATERIALES_2026 - PRECIOS EURO.xlsx")


def deacc(s):
    s = unicodedata.normalize("NFD", str(s))
    return "".join(c for c in s if unicodedata.category(c) != "Mn").upper()


def norm(s):                       # normal "CABLES Y CONDUCTORES"
    return re.sub(r"\s+", " ", re.sub(r"[^A-Z0-9]+", " ", deacc(s))).strip()


def compact(s):                    # sin nada: "CABLESYCONDUCTORES"
    return re.sub(r"[^A-Z0-9]", "", deacc(s))


# ------------------------------------------------------------ equivalencias semanticas
# valores del Excel que NO son literalmente una familia BD pero si tienen equivalente
EQ = {
    "ESTRUCTURAS Y POSTES":            "POSTES",
    "ESTRUCTURASDESOPORTE":            "POSTES",
    "INTERRUPTORES Y SECCIONADORES":   "INTERRUPTORES",   # ver nota
    "TORNILLERIA Y HERRAJES":          "HERRAJES",
    "EQUIPO DE TIERRA":                "HERRAJES",
    "SISTEMADEPUESTAATIERRA":          "HERRAJES",
    "AISLADORES":                      "AISLADORES_Y_COPAS",
    "ALUMBRADO PUBLICO":               "MATERIALES_ALUMBRADO_PUBLICO",
    "LUMINARIAS Y BOMBILLOS":          "MATERIALES_ALUMBRADO_PUBLICO",
    "CINTAS AISLANTES":                "TEIPES_CINTAS_Y_OTROS_AISLANTES",
    "RECONECTADORES Y PROTECTORES":    "RECONECTADORES",
    "TRANSFORMADORES DISTRIBUCION":    "TRANSFORMADORES",
    "TRANSFORMADORES POTENCIA S E":    "TRANSFORMADORES",
    "TRANSFORMADORES DE MEDIDA":       "TRANSFORMADORES_DE_MEDIDA_TC_Y_TP",
    "TRANSFORMADORES_DE_MEDIDA":       "TRANSFORMADORES_DE_MEDIDA_TC_Y_TP",
    "MEDIDORES DE ENERGIA":            "TRANSFORMADORES_DE_MEDIDA_TC_Y_TP",
    "BATERIAS":                        "BANCO_DE_BATERIAS",
    "CONDENSADORES":                   "EQUIPOS_DE_SUB_ESTACIONES",
    "BANCODECONDESADORES":             "EQUIPOS_DE_SUB_ESTACIONES",
    "SERVICIOSAUXILIARES":             "EQUIPOS_DE_SUB_ESTACIONES",
    "TRAMO LINEA":                     "CABLES_Y_CONDUCTORES",
    "ACEITEDIELECTRICO":               "MATERIALES_VARIOS",
    "HERRAMIENTAS":                    "MATERIALES_VARIOS",
    "EQUIPOS DE SEGURIDAD":            "MATERIALES_VARIOS",
    "TUBERIAS Y ACCESORIOS":           "MATERIALES_VARIOS",
    "PINTURAS Y QUIMICOS":             "MATERIALES_VARIOS",
    "CANDADOS Y LLAVES":               "MATERIALES_VARIOS",
    "CAJAS Y GABINETES":               "MATERIALES_VARIOS",
    "SELLOS Y PRECINTOS":              "MATERIALES_VARIOS",
    "CONSTRUCCION":                    "MATERIALES_VARIOS",
    "REEMPLAZO DE PALILLOS":           "MATERIALES_VARIOS",
    "SIN FAMILIA NAC":                 "MATERIALES_VARIOS",
    "0":                               "\x00INVALIDO",
    "RECTIFICADOR VOLTAJE DE ENTRADA": "\x00INVALIDO",
}

# ------------------------------------------------------------ BD
cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m: cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def get(p):
    req = urllib.request.Request(cfg["INSFORGE_URL"] + p)
    req.add_header("apikey", cfg["INSFORGE_API_KEY"])
    req.add_header("Authorization", "Bearer " + cfg["INSFORGE_API_KEY"])
    return json.load(urllib.request.urlopen(req, timeout=60))


fams = get("/api/database/records/cat_familias_materiales?schema=core"
           "&select=codigo_familia,nombre_familia&limit=100")
por_compact = {compact(f["nombre_familia"]): f for f in fams}
por_compact.update({compact(f["codigo_familia"]): f for f in fams})
codigos = {f["codigo_familia"] for f in fams}
print(f"BD core.cat_familias_materiales: {len(fams)} familias\n")


def clasificar(valor):
    c, n = compact(valor), norm(valor)
    if c in por_compact:
        return "EXACTO", por_compact[c]["codigo_familia"]
    if n in EQ:
        cod = EQ[n]
        return ("INVALIDO", cod) if cod.startswith("\x00") else ("EQUIVALENTE", cod)
    # subcadena: tomar el nombre BD MAS LARGO que encaje
    mejores = [f for f in fams
               if compact(f["nombre_familia"]) in c or c in compact(f["nombre_familia"])]
    if mejores:
        f = max(mejores, key=lambda x: len(x["codigo_familia"]))
        return "EQUIVALENTE", f["codigo_familia"]
    return "AUSENTE", None


# ------------------------------------------------------------ recorrer el libro
wb = openpyxl.load_workbook(SRC, data_only=True)
cols = []
for sn in wb.sheetnames:
    hdr = [c.value for c in wb[sn][1]]
    for i, h in enumerate(hdr):
        if h and "FAMILIA" in str(h).upper():
            cols.append((sn, i, str(h)))

resumen = defaultdict(lambda: Counter())      # clasificacion -> Counter
ausentes = defaultdict(Counter)               # valor -> {hoja: n}
equiv = {}                                    # valor -> codigo
usados, invalidos = set(), defaultdict(Counter)
detalle_col = {}

for sn, i, h in cols:
    ws = wb[sn]
    c = Counter()
    for row in ws.iter_rows(min_row=2, values_only=True):
        if i >= len(row): continue
        v = row[i]
        if v in (None, ""): continue
        v = str(v).strip()
        cls, cod = clasificar(v)
        c[(cls, v)] += 1
        resumen[cls][v] += n if False else 1
        if cls == "AUSENTE":
            ausentes[v][sn] += 1
        elif cls == "EQUIVALENTE":
            equiv[v] = cod; usados.add(cod)
        elif cls in ("EXACTO",):
            usados.add(cod)
        else:
            invalidos[v][sn] += 1
    detalle_col[(sn, h)] = c
wb.close()

# recuento correcto por clasificacion (unico global)
g_cls = defaultdict(Counter)
for (sn, h), c in detalle_col.items():
    for (cls, v), n in c.items():
        g_cls[cls][v] += n

print("=" * 100)
print("A) CUADRO GENERAL  (valores distintos por clasificacion, agregado de las 9 columnas)")
print("=" * 100)
for cls, label in [("EXACTO", "EXACTO     - literalmente en el catalogo de la BD"),
                   ("EQUIVALENTE", "EQUIVALENTE - en BD con otro rotulo (regla documentada)"),
                   ("INVALIDO", "INVALIDO   - la celda no contiene una familia"),
                   ("AUSENTE", "AUSENTE    - SIN equivalente en la BD")]:
    vals = g_cls.get(cls, {})
    filas = sum(vals.values())
    print(f"\n  {label}")
    print(f"    valores distintos: {len(vals):<3} filas afectadas: {filas}")
    for v, n in sorted(vals.items(), key=lambda x: -x[1]):
        extra = ""
        if cls == "EQUIVALENTE": extra = f"  ->  {equiv.get(v,)}"
        print(f"       {n:>5}  {v[:60]!r}{extra}")
        if cls == "EQUIVALENTE": usados.add(equiv.get(v))
        if cls == "EXACTO":
            _, cod = clasificar(v); usados.add(cod)

print("\n" + "=" * 100)
print("B) HUECOS REALES: valores del Excel SIN EQUIVALENTE en core.cat_familias_materiales")
print("=" * 100)
if ausentes:
    for v, hojas in sorted(ausentes.items(), key=lambda x: -sum(x[1].values())):
        print(f"   {sum(hojas.values()):>5} filas  {v!r}")
        print(f"            hojas: {', '.join(f'{k} x{n}' for k, n in hojas.items())}")
else:
    print("   (ninguno)")

print("\n" + "=" * 100)
print("C) DATOS INVALIDOS en columnas de familia")
print("=" * 100)
if invalidos:
    for v, hojas in sorted(invalidos.items(), key=lambda x: -sum(x[1].values())):
        print(f"   {sum(hojas.values()):>5} filas  {v[:70]!r}   hojas: {dict(hojas)}")
else:
    print("   (ninguno)")

print("\n" + "=" * 100)
print("D) INVERSO: familias de la BD que NUNCA aparecen en el Excel")
print("=" * 100)
no_usadas = [f for f in fams if f["codigo_familia"] not in usados]
for f in no_usadas:
    print(f"   {f['codigo_familia']:<40} {f['nombre_familia']}")
if not no_usadas:
    print("   (ninguna: las 21 familias de la BD estan representadas)")
print(f"\n   Familias BD representadas: {len(fams) - len(no_usadas)} / {len(fams)}")

print("\n" + "=" * 100)
print("E) MAPA DE EQUIVALENCIAS USADO (Excel -> BD)")
print("=" * 100)
for v in sorted({v for v in equiv} | {v for v in g_cls.get("EXACTO", {})}):
    cls, cod = clasificar(v)
    marca = "=" if cls == "EXACTO" else "~"
    print(f"   {marca} {v[:45]:<45} -> {cod}")

json.dump({"ausentes": {v: dict(h) for v, h in ausentes.items()},
           "equiv": equiv,
           "invalidos": {v: dict(h) for v, h in invalidos.items()}},
          open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "auditoria_familias.json"), "w"),
          ensure_ascii=False, indent=1)
