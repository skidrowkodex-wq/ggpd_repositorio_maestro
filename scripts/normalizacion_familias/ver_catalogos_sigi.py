# -*- coding: utf-8 -*-
import sys, os, json, re, unicodedata
sys.stdout.reconfigure(encoding='utf-8')

import xlrd

def norm(s):
    if s is None: return ""
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").upper()
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

PATH = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\innov\OneDrive\Documents\Repositorio_Maestro\CATALOGOS_SIGI_DETALLE.xls"
wb = xlrd.open_workbook(PATH, on_demand=True)
print("ARCHIVO:", os.path.basename(PATH))
print("HOJAS:")
for n in wb.sheet_names():
    ws = wb.sheet_by_name(n)
    print(f"  - {n!r}  {ws.nrows}x{ws.ncols}")
    wb.unload_sheet(n)

print("\n" + "=" * 100)
for n in wb.sheet_names():
    ws = wb.sheet_by_name(n)
    print(f"\n### HOJA {n!r} ({ws.nrows}x{ws.ncols}) — primeras 8 filas x 12 cols")
    for r in range(min(8, ws.nrows)):
        vals = [str(ws.cell_value(r, c))[:34] for c in range(min(12, ws.ncols))]
        print("   ", " | ".join(vals))
    wb.unload_sheet(n)
