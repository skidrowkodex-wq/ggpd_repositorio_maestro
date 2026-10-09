# -*- coding: utf-8 -*-
"""
FASE 2: escribe codigo_familia en core.cat_items_materiales_precios (804 filas).
- Lista primero los conflictos D_Materiales vs carpeta (D manda).
- PATCH por id (PK) con reintentos.
- Verificacion final releyendo la tabla.
Uso: python mdm_fase2.py [--solo-ver]
"""
import os, sys, json, re, time, urllib.request, urllib.parse, urllib.error
from collections import defaultdict, Counter
from concurrent.futures import ThreadPoolExecutor

sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
OUT = os.path.dirname(os.path.abspath(__file__))
MAPPING = os.path.join(OUT, "mdm_familias_mapping.json")
SOLO_VER = "--solo-ver" in sys.argv

cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m:
        cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")
HOST, KEY = cfg["INSFORGE_URL"], cfg["INSFORGE_API_KEY"]
TABLA = "/api/database/records/cat_items_materiales_precios?schema=core"


def api(method, path, body=None, tries=4):
    last = None
    for t in range(tries):
        req = urllib.request.Request(HOST + path, method=method)
        req.add_header("apikey", KEY)
        req.add_header("Authorization", "Bearer " + KEY)
        data = None
        if body is not None:
            req.add_header("Content-Type", "application/json")
            data = json.dumps(body).encode("utf-8")
        try:
            with urllib.request.urlopen(req, data, timeout=60) as r:
                txt = r.read().decode("utf-8")
                return r.status, (json.loads(txt) if txt else None)
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8")[:300]
            last = (e.code, msg)
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(0.6 * (t + 1))
                continue
            return e.code, msg
        except Exception as e:
            last = ("EXC", str(e))
            time.sleep(0.6 * (t + 1))
    return last


with open(MAPPING, encoding="utf-8") as fh:
    mapeo = json.load(fh)

# ------------------------------------------------------------------ LECTURA ACTUAL
st, actual = api("GET", TABLA + "&select=id,descripcion_item,codigo_familia&limit=2000")
if st != 200:
    print("ERROR lectura:", st, actual); sys.exit(1)
por_id = {f["id"]: f for f in actual}
print(f"BD actual: {len(actual)} filas | con codigo_familia: {sum(1 for f in actual if f.get('codigo_familia'))}")

# ------------------------------------------------------------------ CONFLICTOS A vs B
# (informativo: la decision es que D_Materiales manda)
print("\n[N] Items donde D_Materiales y la carpeta declaran familias distintas (gana D):")
# se recalcualan aqui de forma simple leyendo el mapping + carpeta ya resuelta en fase 1
origenes = Counter(m["origen"] for m in mapeo)
print("    Origenes:", dict(origenes))

if SOLO_VER:
    sys.exit(0)

# ------------------------------------------------------------------ APLICAR
pend = [m for m in mapeo if por_id.get(m["id"], {}).get("codigo_familia") != m["familia"]]
print(f"\nFilas a actualizar: {len(pend)} / {len(mapeo)}")

if not pend:
    print("Nada que hacer.")
else:
    errores = []
    ok = [0]

    def upd(m):
        st, r = api("PATCH", f"{TABLA}&id=eq.{m['id']}", {"codigo_familia": m["familia"]})
        if st in (200, 204):
            ok[0] += 1
        else:
            errores.append((m["descripcion"], st, r))
        return st

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(upd, pend))
    print(f"  OK: {ok[0]} | ERRORES: {len(errores)}")
    for e in errores[:15]:
        print("   !", e)

# ------------------------------------------------------------------ VERIFICACION
time.sleep(1)
st, fin = api("GET", TABLA + "&select=id,descripcion_item,codigo_familia&limit=2000")
if st != 200:
    print("ERROR verificacion:", st, fin); sys.exit(1)

sin = [f for f in fin if not f.get("codigo_familia")]
malos = [f for f in fin if f.get("codigo_familia") and f["codigo_familia"] not in
         {"AISLADORES_Y_COPAS","BANCO_DE_BATERIAS","CABLES_Y_CONDUCTORES","CONECTORES","CORTACORRIENTES",
          "EQUIPOS_DE_SUB_ESTACIONES","FUSIBLES","HERRAJES","INTERRUPTORES","MATERIALES_ALUMBRADO_PUBLICO",
          "MATERIALES_VARIOS","NO_REQUIERE_MATERIAL","PARARRAYOS","POSTES","RECONECTADORES","RECTIFICADORES",
          "REGULADORES","SECCIONADORES","TEIPES_CINTAS_Y_OTROS_AISLANTES","TRANSFORMADORES",
          "TRANSFORMADORES_DE_MEDIDA_TC_Y_TP"}]
dist = Counter(f["codigo_familia"] for f in fin)

print("\n" + "=" * 70)
print("VERIFICACION FINAL")
print("=" * 70)
print(f"  Total filas          : {len(fin)}")
print(f"  Con codigo_familia   : {len(fin) - len(sin)}")
print(f"  Sin codigo_familia   : {len(sin)}")
print(f"  Con codigo invalido  : {len(malos)}")
print("\n  DISTRIBUCION FINAL EN BD:")
for k, v in sorted(dist.items(), key=lambda x: -x[1]):
    print(f"    {v:>4}  {k}")
print(f"    {sum(dist.values()):>4}  TOTAL")

if sin:
    print("\n  SIN FAMILIA:")
    for f in sin[:30]:
        print("   -", f["descripcion_item"])
