# -*- coding: utf-8 -*-
"""Busca columnas/valores con prefijo FAM_ en el MDM (InsForge core)."""
import sys, os, re, json, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

ROOT = r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro"
cfg = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8", errors="ignore"):
    m = re.match(r"\s*([A-Za-z0-9_]+)\s*=\s*(.*)$", line)
    if m:
        cfg[m.group(1)] = m.group(2).strip().strip('"').strip("'")


def req(path, method="GET", payload=None):
    r = urllib.request.Request(cfg["INSFORGE_URL"] + path, method=method)
    r.add_header("apikey", cfg["INSFORGE_API_KEY"])
    r.add_header("Authorization", "Bearer " + cfg["INSFORGE_API_KEY"])
    r.add_header("Content-Type", "application/json")
    data = json.dumps(payload).encode() if payload is not None else None
    return json.load(urllib.request.urlopen(r, data=data, timeout=60))


# 1) listar tablas del schema core
for p in ["/api/database/tables?schema=core",
          "/api/database/tables",
          "/api/database/schema?schema=core"]:
    try:
        r = req(p)
        print("OK", p, "->", json.dumps(r, ensure_ascii=False)[:2500])
        break
    except Exception as e:
        print("ERR", p, e)
