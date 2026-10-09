# -*- coding: utf-8 -*-
"""Revisa si algun catalogo del MDM tiene codigos/valores con prefijo FAM_."""
import sys, os, re, json, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m:
        cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def get(path):
    r = urllib.request.Request(cfg["INSFORGE_URL"] + path)
    r.add_header("apikey", cfg["INSFORGE_API_KEY"])
    r.add_header("Authorization", "Bearer " + cfg["INSFORGE_API_KEY"])
    return json.load(urllib.request.urlopen(r, timeout=60))


tables = get("/api/database/tables?schema=core")
hall = 0
for t in tables:
    try:
        rows = get(f"/api/database/records/{t}?schema=core&limit=500")
    except Exception as e:
        print(f"  {t:<36} ERR {e}")
        continue
    cols = list(rows[0].keys()) if rows else []
    n = len(rows)
    famcols = [c for c in cols if "fam" in c.lower()]
    # buscar valores FAM_
    vals = set()
    for r in rows:
        for v in r.values():
            if isinstance(v, str) and v.strip().upper().startswith("FAM_"):
                vals.add(v)
                hall += 1
    flag = " <== FAM_" if vals else ""
    print(f"  {t:<36} filas={n:<5} cols_fam={famcols}{flag}")
    for v in sorted(vals)[:10]:
        print("        ", v)
print("\nValores FAM_ encontrados:", hall)
