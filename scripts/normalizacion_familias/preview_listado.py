# -*- coding: utf-8 -*-
"""Vista previa: 40 valores de FAM de la hoja LISTADO -> 21 familias de la BD."""
import sys, os, re, json, unicodedata, urllib.request
from collections import Counter, defaultdict
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
SRC = os.path.join(ROOT, "NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V03_PROYECCION_2024_2028.xlsx")
EQ_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prop_familia2.json")


def norm(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
    return re.sub(r"\s+", " ", re.sub(r"[^A-Z0-9]+", " ", s)).strip()


def compact(s):
    return re.sub(r"[^A-Z0-9]", "", unicodedata.normalize("NFD", str(s))
                  .encode("ascii", "ignore").decode().upper()) if s is not None else ""


cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m: cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def get(p):
    req = urllib.request.Request(cfg["INSFORGE_URL"] + p)
    req.add_header("apikey", cfg["INSFORGE_API_KEY"]); req.add_header("Authorization", "Bearer " + cfg["INSFORGE_API_KEY"])
    return json.load(urllib.request.urlopen(req, timeout=60))


fams = get("/api/database/records/cat_familias_materiales?schema=core&select=codigo_familia,nombre_familia&limit=100")
cod_bd = {f["codigo_familia"] for f in fams}
cmp_bd = {}
for f in fams:
    cmp_bd[compact(f["codigo_familia"])] = f["codigo_familia"]
    cmp_bd[compact(f["nombre_familia"])] = f["codigo_familia"]

EQ = json.load(open(EQ_PATH, encoding="utf-8"))   # FAMILIA2 -> codigo (52 claves normalizadas)

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb["LISTADO"]
cnt = Counter(); desc_por_fam = defaultdict(list); n = 0
for row in ws.iter_rows(min_row=2, values_only=True):
    if all(v in (None, "") for v in row): continue
    n += 1
    f, d = row[0], row[1]
    cnt["" if f in (None, "") else str(f).strip()] += 1
    if f not in (None, "") and d not in (None, "") and len(desc_por_fam[str(f).strip()]) < 2:
        desc_por_fam[str(f).strip()].append(str(d)[:44])
wb.close()

print(f"Filas de datos LISTADO: {n} | FAM distintos: {len(cnt)}\n")
print(f"{'FAM':<46} {'N':>4}  {'CLASE':<16} -> MAPEO")
print("-" * 118)
clases = Counter()
for k, v in cnt.most_common():
    nk, ck = norm(k), compact(k)
    if ck == "":
        cls, cod = "VACIO", None
    elif ck in cmp_bd:
        cls, cod = "EXACTO", cmp_bd[ck]
    elif nk in EQ and EQ[nk] in cod_bd:
        cls, cod = "EQUIVALENTE", EQ[nk]
    else:
        # subcadena mas larga
        cand = [c for c in cod_bd if compact(c) and (compact(c) in ck or ck in compact(c))]
        cls, cod = ("SUBCADENA", max(cand, key=len)) if cand else ("AUSENTE", None)
    clases[cls] += 1
    mark = "OK " if cls in ("EXACTO",) else ("~ " if cls in ("EQUIVALENTE", "SUBCADENA") else "!! ")
    ej = "; ".join(desc_por_fam.get(k, []))
    print(f"{mark}{k[:45]:<46} {v:>4}  {cls:<16} -> {cod or '---':<38} {ej[:40]}")

print("\nResumen de clases:", dict(clases))
tot_ok = sum(v for k, v in cnt.items())
print(f"Filas cubiertas por alguna familia valida: ", end="")
s = 0
for k, v in cnt.items():
    nk, ck = norm(k), compact(k)
    if ck and (ck in cmp_bd or (nk in EQ and EQ[nk] in cod_bd)):
        s += v
print(f"{s} / {n}")

print("\n21 familias de la BD:")
for f in sorted(fams, key=lambda x: x["codigo_familia"]):
    print("   ", f["codigo_familia"])
