#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - GGPD
Generador del Catálogo Maestro Seed para SIGA-SEN v1.0
Origen: database/cnd_sen_unifilar_2025.sqlite
Destino: apps-refactorizadas/SIGA-SEN-REF/src/data/sigaSenSeed.json
========================================================================================
"""

import os
import sqlite3
import json

SQLITE_PATH = os.path.join("database", "cnd_sen_unifilar_2025.sqlite")
SEED_PATH = os.path.join("apps-refactorizadas", "SIGA-SEN-REF", "src", "data", "sigaSenSeed.json")


def generate_seed():
    print(f"Conectando a {SQLITE_PATH} ...")
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Niveles de tensión
    cursor.execute("SELECT * FROM cnd_niveles_tension ORDER BY tension_kv DESC;")
    niveles = [dict(r) for r in cursor.fetchall()]

    # 2. Subestaciones
    cursor.execute("""
    SELECT * FROM cnd_subestaciones
    ORDER BY 
        CASE clasificacion 
            WHEN 'CENTRAL_GENERACION' THEN 1 
            WHEN 'SUBESTACION_TRANSMISION' THEN 2 
            WHEN 'INTERCONEXION_INTERNACIONAL' THEN 3 
            ELSE 4 
        END,
        tension_maxima_kv DESC NULLS LAST,
        capacidad_total_mw DESC,
        capacidad_total_mva DESC,
        nombre_normalizado ASC;
    """)
    se_rows = cursor.fetchall()

    subestaciones = []
    for se in se_rows:
        se_id = se["id"]
        
        # Barras de esta S/E
        cursor.execute("SELECT * FROM cnd_barras WHERE subestacion_id = ? ORDER BY tension_kv DESC;", (se_id,))
        barras = [dict(b) for b in cursor.fetchall()]

        # Transformadores de esta S/E
        cursor.execute("SELECT * FROM cnd_transformadores WHERE subestacion_id = ? ORDER BY mva_total DESC;", (se_id,))
        trxs = [dict(t) for t in cursor.fetchall()]

        # Generadores de esta S/E
        cursor.execute("SELECT * FROM cnd_generacion WHERE subestacion_id = ? ORDER BY mw_total DESC;", (se_id,))
        gens = [dict(g) for g in cursor.fetchall()]

        # Compensación reactiva
        cursor.execute("SELECT * FROM cnd_compensacion_reactiva WHERE subestacion_id = ? ORDER BY mvar_total DESC;", (se_id,))
        reacts = [dict(r) for r in cursor.fetchall()]

        slug_code = "CND-" + "".join(c if c.isalnum() else "-" for c in se["nombre_normalizado"]).strip("-")
        slug_code = "-".join(part for part in slug_code.split("-") if part)

        subestaciones.append({
            "id": se["id"],
            "codigo": slug_code,
            "nombre_cnd": se["nombre_cnd"],
            "nombre_norm": se["nombre_normalizado"],
            "clasificacion": se["clasificacion"],
            "cuadrante": se["cuadrante_mural"],
            "coord_x": round(se["coord_x"], 1),
            "coord_y": round(se["coord_y"], 1),
            "bbox": [round(se["bbox_x0"] or 0, 1), round(se["bbox_y0"] or 0, 1), round(se["bbox_x1"] or 0, 1), round(se["bbox_y1"] or 0, 1)],
            "tension_max_kv": se["tension_maxima_kv"],
            "tension_min_kv": se["tension_minima_kv"],
            "tensiones_lista": se["niveles_tension_lista"] or "S/D",
            "total_barras": se["total_barras"],
            "total_transformadores": se["total_transformadores"],
            "total_generadores": se["total_generadores"],
            "total_reactivos": se["total_reactivos"],
            "capacidad_mva": round(se["capacidad_total_mva"] or 0, 1),
            "capacidad_mw": round(se["capacidad_total_mw"] or 0, 1),
            "capacidad_mvar": round(se["capacidad_total_mvar"] or 0, 1),
            "barras": [
                {
                    "id": b["id"],
                    "codigo_tension": b["codigo_tension"],
                    "tension_kv": b["tension_kv"],
                    "color_hex": b["color_hex"],
                    "grosor": b["grosor_pt"],
                    "orientacion": b["orientacion"],
                    "longitud": b["longitud_pt"],
                    "x0": round(b["x0"], 1), "y0": round(b["y0"], 1),
                    "x1": round(b["x1"], 1), "y1": round(b["y1"], 1),
                    "cx": round(b["centro_x"], 1), "cy": round(b["centro_y"], 1)
                }
                for b in barras
            ],
            "transformadores": [
                {
                    "id": t["id"],
                    "raw": t["etiqueta_cruda"],
                    "qty": t["unidades_count"],
                    "unit_mva": t["mva_unitario"],
                    "total_mva": t["mva_total"],
                    "cx": round(t["coord_x"], 1),
                    "cy": round(t["coord_y"], 1)
                }
                for t in trxs
            ],
            "generacion": [
                {
                    "id": g["id"],
                    "raw": g["etiqueta_cruda"],
                    "tag": g["detalle_maquinas"],
                    "qty": g["unidades_count"],
                    "unit_mw": g["mw_unitario"],
                    "total_mw": g["mw_total"],
                    "fuente": g["tipo_fuente"],
                    "cx": round(g["coord_x"], 1),
                    "cy": round(g["coord_y"], 1)
                }
                for g in gens
            ],
            "reactivos": [
                {
                    "id": r["id"],
                    "raw": r["etiqueta_cruda"],
                    "tipo": r["tipo_equipo"],
                    "qty": r["unidades_count"],
                    "unit_mvar": r["mvar_unitario"],
                    "total_mvar": r["mvar_total"],
                    "cx": round(r["coord_x"], 1),
                    "cy": round(r["coord_y"], 1)
                }
                for r in reacts
            ]
        })

    # 3. Líneas de Transmisión principales
    cursor.execute("""
    SELECT codigo_tension, tension_kv, color_hex, grosor_pt, x0, y0, x1, y1, longitud_aprox,
           nodo_cercano_1, nodo_cercano_2
    FROM cnd_lineas_tramos
    ORDER BY tension_kv DESC;
    """)
    lineas = [
        {
            "kv_code": r["codigo_tension"],
            "kv": r["tension_kv"],
            "color": r["color_hex"],
            "grosor": r["grosor_pt"],
            "x0": round(r["x0"], 1), "y0": round(r["y0"], 1),
            "x1": round(r["x1"], 1), "y1": round(r["y1"], 1),
            "len": round(r["longitud_aprox"], 1),
            "origen": r["nodo_cercano_1"],
            "destino": r["nodo_cercano_2"]
        }
        for r in cursor.fetchall()
    ]

    # 4. Clientes industriales
    cursor.execute("SELECT * FROM cnd_clientes_industriales ORDER BY sigla ASC;")
    clientes = [dict(c) for c in cursor.fetchall()]

    seed_payload = {
        "metadata": {
            "sistema": "SIGA-SEN v1.0",
            "titulo": "Sistema Integrado de Gestión de Activos del SEN",
            "fuente_oficial": "Centro Nacional de Despacho (CND) - Mayo 2025",
            "certificacion": "Grado Industrial SEN 2026 · Zona Segura Cifrada · ISO 27001",
            "dimensiones_mural": [5669.25, 3146.25]
        },
        "estadisticas": {
            "total_nodos": len(subestaciones),
            "centrales_generacion": sum(1 for s in subestaciones if s["clasificacion"] == "CENTRAL_GENERACION"),
            "subestaciones_transmision": sum(1 for s in subestaciones if s["clasificacion"] == "SUBESTACION_TRANSMISION"),
            "potencia_instalada_mw": round(sum(s["capacidad_mw"] for s in subestaciones), 1),
            "capacidad_transformacion_mva": round(sum(s["capacidad_mva"] for s in subestaciones), 1),
            "compensacion_reactiva_mvar": round(sum(s["capacidad_mvar"] for s in subestaciones), 1),
            "total_barras": sum(s["total_barras"] for s in subestaciones),
            "total_lineas": len(lineas)
        },
        "niveles_tension": niveles,
        "clientes_industriales": clientes,
        "subestaciones": subestaciones,
        "lineas": lineas
    }

    os.makedirs(os.path.dirname(SEED_PATH), exist_ok=True)
    with open(SEED_PATH, "w", encoding="utf-8") as f_out:
        json.dump(seed_payload, f_out, ensure_ascii=False, indent=2)

    print(f"Catálogo Seed generado con éxito: {SEED_PATH} ({os.path.getsize(SEED_PATH) / (1024 * 1024):.2f} MB)")
    conn.close()


if __name__ == "__main__":
    generate_seed()
