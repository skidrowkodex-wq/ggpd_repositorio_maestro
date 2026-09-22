# -*- coding: utf-8 -*-
"""
Puente Flask -> motor de reportes NDI (InsForge).

Importa el generador canónico de `scripts/exportar_reportes_insforge.py`
(single source of truth) y expone helpers listos para las rutas admin:
  - resumen_ndi(): KPIs (tabulador, anual, matriz, pendientes, últimas fechas).
  - build_consolidado(corte): Workbook CONSOLIDADO (estilo Hoja1).
  - build_detalle(corte, anio, mes, estado): Workbook DETALLE PLANTILLA (34 cols).

Los datos se leen SIEMPRE de InsForge PostgreSQL (proyecto ggpd-data-maestra-0002)
vía REST; cero MOCK, cero SQLite.
"""
import io
import os
import sys
from datetime import datetime

from app.config import Config

_SCRIPTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "scripts"
)
if _SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, _SCRIPTS_DIR)

import exportar_reportes_insforge as gen  # noqa: E402  (single source of truth)

CORTE_DEFAULT = "2026-08-31"


def _client():
    host = Config.INSFORGE_URL
    key = Config.INSFORGE_API_KEY
    if not key or key == "tu_api_key_insforge_aqui":
        raise RuntimeError("INSFORGE_API_KEY no configurada (ver .env del app Flask SCTIS).")
    return gen.InsForge(host, key, retries=2, pagina=1000)


def resumen_ndi(corte=CORTE_DEFAULT):
    """Dict JSON-seriable con el estado del motor NDI para la UI admin."""
    ins = _client()
    kpi, anual, tab, rank = gen.cargar_kpis(ins)
    ult = gen.ultima_fecha_por_estado(ins)
    anio_act = sorted({r["anio"] for r in kpi})[-1] if kpi else int(corte[:4])

    total_bruto = sum(r.get("ndi_bruto_anual") or 0 for r in anual if r.get("anio") == anio_act)
    total_cons = sum(r.get("ndi_consolidado_anual") or 0 for r in anual if r.get("anio") == anio_act)
    tti_horas = sum(r.get("tti_horas_anual") or 0 for r in anual if r.get("anio") == anio_act)

    con_datos = {r["codigo_estado"] for r in anual if r.get("anio") == anio_act and (r.get("ndi_bruto_anual") or 0) > 0}
    pendientes = [{"codigo": c, "nombre": n} for (c, n) in gen.ESTADOS_MDM if c not in con_datos]

    kpi_list = []
    for r in sorted(kpi, key=lambda x: (x.get("codigo_estado") or "", x.get("mes_num") or 0)):
        kpi_list.append({
            "codigo_estado": r.get("codigo_estado"),
            "nombre_estado": r.get("nombre_estado"),
            "anio": r.get("anio"),
            "mes_num": r.get("mes_num"),
            "mes_nombre": gen.MES_ESPANOL.get(r.get("mes_nombre"), r.get("mes_nombre")),
            "ndi_bruto": r.get("ndi_bruto") or 0,
            "ndi_consolidado": r.get("ndi_consolidado") or 0,
            "tti_horas": round(r.get("tti_horas") or 0, 2),
            "eventos_con_duracion": r.get("eventos_con_duracion") or 0,
        })

    anual_list = []
    for r in sorted(anual, key=lambda x: (x.get("nombre_estado") or "").upper()):
        anual_list.append({
            "codigo_estado": r.get("codigo_estado"),
            "nombre_estado": r.get("nombre_estado"),
            "anio": r.get("anio"),
            "ndi_bruto": r.get("ndi_bruto_anual") or 0,
            "ndi_consolidado": r.get("ndi_consolidado_anual") or 0,
            "tti_horas": round(r.get("tti_horas_anual") or 0, 2),
            "dpi_horas": r.get("dpi_horas"),
            "tasa_consolidacion": round((r.get("tasa_consolidacion") or 0) * 100, 2),
            "ultima_fecha": ult.get(r.get("codigo_estado")),
        })

    tab_list = [{
        "anio": r.get("anio"),
        "mes_num": r.get("mes_num"),
        "mes_nombre": gen.MES_ESPANOL.get(r.get("mes_nombre"), r.get("mes_nombre")),
        "bruto": r.get("bruto") or 0,
        "consolidado": r.get("consolidado") or 0,
        "bruto_acumulado": r.get("bruto_acumulado") or 0,
        "consolidado_acumulado": r.get("consolidado_acumulado") or 0,
        "meta_anual": r.get("meta_anual") or gen.META_ANUAL,
        "pct_avance_meta": r.get("pct_avance_meta") or 0,
    } for r in sorted(tab, key=lambda x: (x.get("anio") or 0, x.get("mes_num") or 0))]

    rank_list = [{
        "codigo_estado": r.get("codigo_estado"),
        "nombre_estado": r.get("nombre_estado"),
        "subestacion_nombre": r.get("subestacion_nombre"),
        "circuito_codigo": r.get("circuito_codigo"),
        "ndi_bruto": r.get("ndi_bruto") or 0,
        "ndi_consolidado": r.get("ndi_consolidado") or 0,
        "kva_hora_total": round(r.get("kva_hora_total") or 0, 2),
        "duracion_horas_total": round(r.get("duracion_horas_total") or 0, 2),
        "posicion": r.get("posicion"),
    } for r in rank]

    return {
        "corte": corte,
        "emitido": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "meta_anual": gen.META_ANUAL,
        "total_bruto": total_bruto,
        "total_consolidado": total_cons,
        "tti_horas": round(tti_horas, 2),
        "dpi_horas": round(tti_horas / max(total_cons, 1), 2),
        "tasa_consolidacion": round(100.0 * total_cons / max(total_bruto, 1), 2),
        "pct_avance_meta": round(100.0 * total_cons / gen.META_ANUAL, 2),
        "estados_con_datos": len(con_datos),
        "pendientes": pendientes,
        "estados": [{"codigo": c, "nombre": n} for (c, n) in gen.ESTADOS_MDM],
        "meses": [{"num": n, "nombre": nombre} for (n, nombre) in gen.MES_ESPANOL.items()],
        "anio": anio_act,
        "kpi": kpi_list,
        "anual": anual_list,
        "tabulador": tab_list,
        "ranking": rank_list,
    }


def build_consolidado(corte=CORTE_DEFAULT):
    """Workbook CONSOLIDADO (BytesIO) listo para send_file."""
    ins = _client()
    kpi, anual, tab, rank = gen.cargar_kpis(ins)
    ult = gen.ultima_fecha_por_estado(ins)
    buf = io.BytesIO()
    gen.construir_consolidado(kpi, anual, tab, rank, ult, corte, buf)
    buf.seek(0)
    return buf, f"SCTIS_NDI_CONSOLIDADO_{corte}.xlsx"


def build_detalle(corte=CORTE_DEFAULT, anio=None, mes=None, estado=None, max_filas=120000):
    """Workbook DETALLE PLANTILLA (BytesIO) listo para send_file."""
    ins = _client()
    filtro_desc = f"anio={anio or 'TODOS'} mes={mes or 'TODOS'} estado={estado or 'TODOS'}"
    rows = gen.cargar_detalle(ins, anio=anio, mes=mes, estado=estado, max_filas=max_filas)
    buf = io.BytesIO()
    n = gen.construir_detalle(rows, corte, buf, filtro_desc)
    buf.seek(0)
    return buf, f"SCTIS_NDI_DETALLE_PLANTILLA_{corte}.xlsx", n