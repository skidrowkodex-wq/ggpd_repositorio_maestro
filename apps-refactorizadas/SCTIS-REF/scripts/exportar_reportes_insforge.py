#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
F2/F3 — Exportadores de Reportes NDI SCTIS v2.0 (QA Ing. Favio).

Lee las vistas KPI del motor NDI (InsForge PostgreSQL, proyecto
ggpd-data-maestra-0002) vía REST (esquema public):

    v_sctis_kpi_ndi            -> NDI estado/mes (bruto + consolidado + TTI)
    v_sctis_kpi_ndi_anual      -> NDI anual por estado + DPI + tasa consolidación
    v_sctis_kpi_ndi_tabulador  -> tabulador nacional mensual vs Meta 150.347
    v_sctis_ranking_circuitos  -> Top-10 circuitos por estado
    v_sctis_tiras_interrupcion -> detalle PLANTILLA (34 columnas idénticas)

Genera dos libros (cero MOCK, datos reales):
  1) SCTIS_NDI_CONSOLIDADO_<corte>.xlsx
     Hoja CONSOLIDADO (estilo Hoja1) con los bloques acordados con la Ing. Favio:
       BLOQUE 1 · PENDIENTES POR TIRAS
       BLOQUE 2 · ESTADO | NDI | ÚLTIMA FECHA
       BLOQUE 3 · MATRIZ ESTATUS (NDI bruto estado x mes)
       BLOQUE 4 · TABULADOR MES | NDI | META | % AVANCE
     Hojas complementarias: TABULADOR NDI, MATRIZ BRUTO, MATRIZ CONSOLIDADO,
                            RANKING CIRCUITOS, DETALLE ESTADO-MES.
  2) SCTIS_NDI_DETALLE_PLANTILLA_<corte>.xlsx
     Hoja PLANTILLA con 34 columnas reproducidas del raw_json (fiel a la fuente)
     + hoja AUDITORÍA (id, fingerprint, es_duplicado, es_eliminado, calidad_score).

Regla documentada: DOC-GGPD-2026-METAS-001 · NDI Bruto = COUNT(*) NO eliminado;
NDI Consolidado = COUNT(DISTINCT (estado, SE, circuito, fecha)); Meta anual 150.347.
Procedimiento de QA (match >= 98%) en docs/SCTIS_METODO_CALCULO_NDI_V01.md §7.

Uso:
  python3 exportar_reportes_insforge.py \
      --api-key <KEY> --host <URL> \
      [--corte 2026-08-31] [--salida docs/reportes_qa] \
      [--tipo todos|consolidado|detalle] \
      [--anio 2026] [--mes 8] [--estado ANZ] \
      [--pagina 1000] [--retries 3]
"""
import argparse
import json
import sys
import time
from datetime import datetime

import openpyxl
import requests
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------
META_ANUAL = 150347  # DOC-GGPD-2026-METAS-001

# Nombres oficiales MDM de los 24 estados (para detectar pendientes de carga)
ESTADOS_MDM = [
    ("AMA", "AMAZONAS"), ("ANZ", "ANZOATEGUI"), ("APU", "APURE"),
    ("ARA", "ARAGUA"), ("BAR", "BARINAS"), ("BOL", "BOLIVAR"),
    ("CAR", "CARABOBO"), ("COJ", "COJEDES"), ("DEL", "DELTA AMACURO"),
    ("DCA", "DISTRITO CAPITAL"), ("FAL", "FALCON"), ("GUA", "GUARICO"),
    ("LGU", "LA GUAIRA"), ("LAR", "LARA"), ("MER", "MERIDA"),
    ("MIR", "MIRANDA"), ("MON", "MONAGAS"), ("NES", "NUEVA ESPARTA"),
    ("POR", "PORTUGUESA"), ("SUC", "SUCRE"), ("TAC", "TACHIRA"),
    ("TRU", "TRUJILLO"), ("YAR", "YARACUY"), ("ZUL", "ZULIA"),
]

# PostgREST devuelve el nombre del mes en la locale del servidor (inglés)
MES_ESPANOL = {
    "January": "ENERO", "February": "FEBRERO", "March": "MARZO",
    "April": "ABRIL", "May": "MAYO", "June": "JUNIO",
    "July": "JULIO", "August": "AGOSTO", "September": "SEPTIEMBRE",
    "October": "OCTUBRE", "November": "NOVIEMBRE", "December": "DICIEMBRE",
}
MESES_CORTO = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

# Orden de salida del Detalle PLANTILLA (34 columnas): 31 campos crudos + separador + fórmula
DETALLE_HEADERS = [
    ("A", "Estado"), ("B", "Fecha"), ("C", "Sistema"), ("D", "Distrito"),
    ("E", "Subestacion"), ("F", "Circuito"), ("G", "Inicio"), ("H", "Duración"),
    ("I", "Carga"), ("J", "Frec"), ("K", "Dur (Hora)"), ("L", "TTI"),
    ("M", "Señal"), ("N", "Causa"), ("O", "(Sub-Causa)"), ("P", "Observaciones"),
    ("Q", "Sectores"), ("R", "Ciudad"), ("S", "kVa Instalados"), ("T", "Duracion_F"),
    ("U", "Circuito Estado"), ("V", "Kva Hora"), ("W", "kVA_Int_F"), ("X", "Dia "),
    ("Y", "Mes"), ("Z", "Año"), ("AA", "Dia Semana"), ("AB", "Mes_Nombre"),
    ("AC", "Elimuna Espacio"), ("AD", "Causa Falla"), ("AE", "Fecha_F"),
]
RAW_KEYS = [
    "estado", "fecha_raw", "sistema_raw", "distrito_raw", "subestacion_raw",
    "circuito_raw", "inicio_raw", "duracion_raw", "carga_raw", "frec_raw",
    "dur_hora_raw", "tti_raw", "senal_raw", "causa_raw", "subcausa_raw",
    "observaciones_raw", "sectores_raw", "ciudad_raw", "kva_instalados_raw",
    "duracion_f_raw", "circuito_estado_raw", "kva_hora_raw", "kva_int_f_raw",
    "dia_raw", "mes_raw", "anio_raw", "dia_semana_raw", "mes_nombre_raw",
    "elimina_espacio_raw", "causa_falla_raw", "fecha_f_raw",
]

# Estilos
TITULO_FONT = Font(name="Calibri", bold=True, size=16, color="1F4E79")
SUB_FONT = Font(name="Calibri", bold=True, size=12, color="1F4E79")
SEC_FONT = Font(name="Calibri", bold=True, size=11, color="FFFFFF")
SEC_FILL = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
HDR_FONT = Font(name="Calibri", bold=True, size=10, color="FFFFFF")
HDR_FILL = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
BODY_FONT = Font(name="Calibri", size=10)
BOLD_FONT = Font(name="Calibri", bold=True, size=10)
BLOCK_FILL = PatternFill(start_color="FFE699", end_color="FFE699", fill_type="solid")
DUP_FILL = PatternFill(start_color="FCE4EC", end_color="FCE4EC", fill_type="solid")
THIN = Side(style="thin", color="B0B0B0")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(horizontal="left", vertical="center", wrap_text=True)
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)


# ---------------------------------------------------------------------------
# Cliente REST
# ---------------------------------------------------------------------------
class InsForge:
    def __init__(self, host, api_key, retries=3, pagina=1000):
        self.base = f"{host}/api/database/records"
        self.headers = {
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
        }
        self.retries = retries
        self.pagina = pagina
        self.requested = 0

    def _get(self, endpoint, params=None, timeout=180):
        for intento in range(self.retries + 1):
            try:
                r = requests.get(f"{self.base}/{endpoint}", params=params, headers=self.headers, timeout=timeout)
                if r.status_code < 400:
                    self.requested += 1
                    return r.json()
                body = r.text[:300]
            except requests.RequestException as e:
                body = str(e)
            if intento < self.retries:
                time.sleep(2 * (intento + 1))
                continue
            sys.exit(f"[reportes] ERROR GET {endpoint}?{params}: HTTP/ERR -> {body}")

    def rows(self, endpoint, select="*", order=None, filtros=None, limit=None):
        """Lista paginada sobre una vista REST."""
        params = {"select": select, "limit": self.pagina}
        if order:
            params["order"] = order
        if filtros:
            params.update(filtros)
        acum = []
        offset = 0
        while True:
            p = dict(params, offset=offset)
            if limit is not None:
                p["limit"] = min(self.pagina, max(limit - len(acum), 1))
            batch = self._get(endpoint, p)
            if not isinstance(batch, list):
                sys.exit(f"[reportes] respuesta no-listada de {endpoint}: {str(batch)[:200]}")
            acum.extend(batch)
            if limit is not None and len(acum) >= limit:
                break
            if len(batch) < min(self.pagina, p["limit"]):
                break
            offset += len(batch)
        return acum


# ---------------------------------------------------------------------------
# Carga de datos
# ---------------------------------------------------------------------------
def cargar_kpis(ins):
    kpi = ins.rows("v_sctis_kpi_ndi", order="anio.asc,mes_num.asc,codigo_estado.asc")
    anual = ins.rows("v_sctis_kpi_ndi_anual", order="nombre_estado.asc")
    tab = ins.rows("v_sctis_kpi_ndi_tabulador", order="anio.asc,mes_num.asc")
    rank = ins.rows("v_sctis_ranking_circuitos", order="codigo_estado.asc,posicion.asc")
    return kpi, anual, tab, rank


def ultima_fecha_por_estado(ins):
    """Máxima fecha_NDI por estado (24 llamadas ligeras)."""
    out = {}
    for (cod, _nombre) in ESTADOS_MDM:
        r = ins.rows(
            "v_sctis_tiras_interrupcion",
            select="codigo_estado,fecha,es_eliminado",
            filtros={"codigo_estado": f"eq.{cod}", "es_eliminado": "eq.false"},
            order="fecha.desc",
            limit=1,
        )
        out[cod] = r[0]["fecha"] if r else None
    return out


def cargar_detalle(ins, anio=None, mes=None, estado=None, max_filas=None):
    filtros = {}
    if anio:
        filtros["anio_num"] = f"eq.{int(anio)}"
    if mes:
        filtros["mes_num"] = f"eq.{int(mes)}"
    if estado:
        filtros["codigo_estado"] = f"eq.{estado}"
    rows = ins.rows(
        "v_sctis_tiras_interrupcion",
        select="id,codigo_estado,nombre_estado,fecha,fecha_apertura,calidad_score,"
               "causa_codigo,causa_nombre,fingerprint,es_duplicado,es_eliminado,"
               "linea_origen,fuente_archivo,raw_json",
        order="linea_origen.asc",
        filtros=filtros,
        limit=max_filas,
    )
    return rows


def parse_raw(raw):
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            return {}
    return {}


def campo_raw(raw, key):
    v = raw.get(key)
    if v is None or str(v).strip() == "" or str(v).strip() == "None":
        return ""
    return v


# ---------------------------------------------------------------------------
# Escritura: Consolidado (estilo Hoja1)
# ---------------------------------------------------------------------------
def _seccion(ws, fila, texto, span):
    ws.cell(row=fila, column=1, value=texto).font = SEC_FONT
    for c in range(1, span + 1):
        ws.cell(row=fila, column=c).fill = SEC_FILL
    ws.cell(row=fila, column=1).alignment = Alignment(horizontal="left", vertical="center")
    return fila + 1


def _encabezado_tabla(ws, fila, headers, span):
    for i, h in enumerate(headers, 1):
        cell = ws.cell(row=fila, column=i, value=h)
        cell.font = HDR_FONT
        cell.fill = HDR_FILL
        cell.alignment = CENTER
        cell.border = BORDER
    return fila + 1


def _celda(ws, fila, col, val, bold=False, center=False, fill=None):
    cell = ws.cell(row=fila, column=col, value=val)
    cell.font = BOLD_FONT if bold else BODY_FONT
    cell.alignment = CENTER if center else WRAP
    cell.border = BORDER
    if fill:
        cell.fill = fill
    return cell


def _fecha_str(v):
    return str(v)[:10] if v else "SIN CARGA"


def construir_consolidado(kpi, anual, tab, rank, ultima_fecha, corte, salida):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "CONSOLIDADO"
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 18
    ws.column_dimensions["B"].width = 13
    ws.column_dimensions["C"].width = 15
    for col in "DEFGHIJKL":
        ws.column_dimensions[col].width = 14
    ws.column_dimensions["M"].width = 16

    fila = 1
    ws.cell(row=fila, column=1, value="CORPOELEC — GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)").font = TITULO_FONT
    fila += 1
    ws.cell(row=fila, column=1, value="SCTIS v2.0 · CONSOLIDADO NDI — INDICADOR DE CALIDAD DE SERVICIO SEN").font = SUB_FONT
    fila += 1
    ws.cell(row=fila, column=1, value=(
        f"Corte: {corte} · Emitido: {datetime.now():%d/%m/%Y %H:%M} · "
        "Fuente: InsForge (ggpd-data-maestra-0002) · Regla: NDI V01 · "
        "Zona Segura: ISO/IEC 27001 · OWASP ASVS")).font = BODY_FONT
    fila += 2

    # ---- BLOQUE 1 · PENDIENTES POR TIRAS ----
    fila = _seccion(ws, fila, "BLOQUE 1 · PENDIENTES POR TIRAS (canales sin carga en el corte)", 12)
    anio_kpi = sorted({r["anio"] for r in kpi})
    anio_act = anio_kpi[-1] if anio_kpi else int(corte[:4])
    con_datos = {r["codigo_estado"] for r in anual if r.get("anio") == anio_act and (r.get("ndi_bruto_anual") or 0) > 0}
    fila = _encabezado_tabla(ws, fila, ["ESTADO", "CÓDIGO", "NDI BRUTO", "NDI CONSOLIDADO", "ÚLTIMA FECHA", "ESTATUS"], 6)
    pendientes = [par for par in ESTADOS_MDM if par[0] not in con_datos]
    if pendientes:
        for cod, nombre in pendientes:
            _celda(ws, fila, 1, nombre, center=False)
            _celda(ws, fila, 2, cod, center=True)
            _celda(ws, fila, 3, 0, center=True)
            _celda(ws, fila, 4, 0, center=True)
            _celda(ws, fila, 5, "SIN CARGA", center=True, fill=BLOCK_FILL)
            _celda(ws, fila, 6, "PENDIENTE POR TIRAS", center=True, fill=BLOCK_FILL)
            fila += 1
    else:
        _celda(ws, fila, 1, "NINGUNO — los 24 estados cuentan con carga en el corte", center=False)
        fila += 1
    fila += 1

    # ---- BLOQUE 2 · ESTADO | NDI | ÚLTIMA FECHA ----
    fila = _seccion(ws, fila, "BLOQUE 2 · ESTADO | NDI | ÚLTIMA FECHA", 12)
    fila = _encabezado_tabla(
        ws, fila,
        ["ESTADO", "CÓD", "NDI BRUTO", "NDI CONS.", "TTI (h)", "DPI (h/ev)", "TASA CONS.", "ÚLTIMA FECHA", "ESTATUS"],
        9)
    orden = sorted(anual, key=lambda r: (r.get("nombre_estado") or r.get("codigo_estado") or "").upper())
    total_bruto = total_cons = 0
    for r in orden:
        cod = r["codigo_estado"]
        bruto = r.get("ndi_bruto_anual") or 0
        cons = r.get("ndi_consolidado_anual") or 0
        total_bruto += bruto
        total_cons += cons
        ult = _fecha_str(ultima_fecha.get(cod))
        estatus = f"→ NDI {cons:,}".replace(",", ".") if ult == "SIN CARGA" else "OK"
        _celda(ws, fila, 1, r.get("nombre_estado") or cod, center=False)
        _celda(ws, fila, 2, cod, center=True)
        _celda(ws, fila, 3, bruto, center=True)
        _celda(ws, fila, 4, cons, center=True)
        _celda(ws, fila, 5, round(r.get("tti_horas_anual") or 0, 2), center=True)
        _celda(ws, fila, 6, r.get("dpi_horas") if r.get("dpi_horas") is not None else 0, center=True)
        _celda(ws, fila, 7, round((r.get("tasa_consolidacion") or 0) * 100, 2), center=True)
        _celda(ws, fila, 8, ult, center=True, fill=BLOCK_FILL if ult == "SIN CARGA" else None)
        _celda(ws, fila, 9, estatus, center=True)
        fila += 1
    _celda(ws, fila, 1, "TOTAL NACIONAL", bold=True)
    _celda(ws, fila, 2, "", bold=True)
    _celda(ws, fila, 3, total_bruto, bold=True, center=True)
    _celda(ws, fila, 4, total_cons, bold=True, center=True)
    _celda(ws, fila, 5, "", bold=True, center=True)
    _celda(ws, fila, 6, "", bold=True, center=True)
    _celda(ws, fila, 7, round(100.0 * total_cons / max(total_bruto, 1), 2), bold=True, center=True)
    _celda(ws, fila, 8, f"% avance meta: {round(100.0 * total_cons / META_ANUAL, 2)}%", bold=True, center=False,
           fill=BLOCK_FILL)
    _celda(ws, fila, 9, "", bold=True, center=True)
    fila += 2

    # ---- BLOQUE 3 · MATRIZ ESTATUS ----
    fila = _seccion(ws, fila, "BLOQUE 3 · MATRIZ ESTATUS — NDI BRUTO POR ESTADO Y MES", 14)
    meses = sorted({(r["mes_num"], MES_ESPANOL.get(r["mes_nombre"], r["mes_nombre"])) for r in kpi})
    fila = _encabezado_tabla(ws, fila, ["ESTADO", "CÓD"] + [m[1][:3] for m in meses] + ["TOTAL"], 2 + len(meses))
    kpi_por_estado = {}
    for r in kpi:
        kpi_por_estado.setdefault(r["codigo_estado"], {})[r["mes_num"]] = r.get("ndi_bruto") or 0
    totales_mes = [0] * len(meses)
    grand_total = 0
    orden_est = sorted(kpi_por_estado.keys(), key=lambda c: c)
    for cod in orden_est:
        fila_bruto = sum(kpi_por_estado[cod].values())
        grand_total += fila_bruto
        _celda(ws, fila, 1, cod, center=False)
        _celda(ws, fila, 2, "", center=True)
        for i, (mes_num, _nom) in enumerate(meses):
            v = kpi_por_estado[cod].get(mes_num, 0)
            totales_mes[i] += v
            _celda(ws, fila, 3 + i, v, center=True)
        _celda(ws, fila, 2 + len(meses), fila_bruto, bold=True, center=True)
        fila += 1
    _celda(ws, fila, 1, "TOTAL", bold=True)
    _celda(ws, fila, 2, "", bold=True)
    for i, t in enumerate(totales_mes):
        _celda(ws, fila, 3 + i, t, bold=True, center=True)
    _celda(ws, fila, 2 + len(meses), grand_total, bold=True, center=True, fill=BLOCK_FILL)
    fila += 2

    # ---- BLOQUE 4 · TABULADOR NACIONAL ----
    fila = _seccion(ws, fila, "BLOQUE 4 · TABULADOR MES | NDI | META | % AVANCE (Meta anual 150.347)", 12)
    fila = _encabezado_tabla(
        ws, fila,
        ["MES", "NDI BRUTO", "NDI CONS.", "BRUTO ACUM.", "CONS. ACUM.", "META ANUAL", "% AVANCE"],
        7)
    t_bruto = t_cons = 0
    for r in tab:
        t_bruto += r.get("bruto") or 0
        t_cons += r.get("consolidado") or 0
        _celda(ws, fila, 1, MES_ESPANOL.get(r.get("mes_nombre"), r.get("mes_nombre")), center=False)
        _celda(ws, fila, 2, r.get("bruto") or 0, center=True)
        _celda(ws, fila, 3, r.get("consolidado") or 0, center=True)
        _celda(ws, fila, 4, r.get("bruto_acumulado") or 0, center=True)
        _celda(ws, fila, 5, r.get("consolidado_acumulado") or 0, center=True)
        _celda(ws, fila, 6, r.get("meta_anual") or META_ANUAL, center=True)
        _celda(ws, fila, 7, r.get("pct_avance_meta") or 0, center=True)
        fila += 1
    _celda(ws, fila, 1, "TOTAL", bold=True)
    _celda(ws, fila, 2, t_bruto, bold=True, center=True)
    _celda(ws, fila, 3, t_cons, bold=True, center=True)
    _celda(ws, fila, 4, "", bold=True, center=True)
    _celda(ws, fila, 5, "", bold=True, center=True)
    _celda(ws, fila, 6, META_ANUAL, bold=True, center=True)
    _celda(ws, fila, 7, round(100.0 * t_cons / META_ANUAL, 2), bold=True, center=True, fill=BLOCK_FILL)
    fila += 2
    ws.cell(row=fila, column=1, value=(
        "Δ V01 vs publicado (79.343) = +453 · Procedimiento QA (match ≥98%): drena, contrasta y "
        "ajusta con es_duplicado/es_eliminado (nunca se borran filas).")).font = BODY_FONT

    # ---- Hoja: TABULADOR NDI ----
    ws_tab = wb.create_sheet("TABULADOR NDI")
    ws_tab.append(["MES", "NDI BRUTO", "NDI CONS.", "BRUTO ACUM.", "CONS. ACUM.", "META ANUAL", "% AVANCE"])
    for r in tab:
        ws_tab.append([
            MES_ESPANOL.get(r.get("mes_nombre"), r.get("mes_nombre")),
            r.get("bruto") or 0, r.get("consolidado") or 0,
            r.get("bruto_acumulado") or 0, r.get("consolidado_acumulado") or 0,
            r.get("meta_anual") or META_ANUAL, r.get("pct_avance_meta") or 0,
        ])

    # ---- Hoja: MATRIZ BRUTO / CONSOLIDADO ----
    def _matriz(sheet, campo):
        sheet.append(["ESTADO", "CÓD"] + [mc for (_mn, mc) in meses] + ["TOTAL"])
        for cod in orden_est:
            fila_vals = kpi_por_estado[cod]
            sheet.append([cod, ""] + [fila_vals.get(mn, 0) for (mn, _x) in meses] + [sum(fila_vals.values())])
        sheet.append(["TOTAL", ""] + totales_mes + [grand_total])

    _matriz(wb.create_sheet("MATRIZ BRUTO"), "ndi_bruto")
    kpi_cons = {}
    for r in kpi:
        kpi_cons.setdefault(r["codigo_estado"], {})[r["mes_num"]] = r.get("ndi_consolidado") or 0
    ws_mc = wb.create_sheet("MATRIZ CONSOLIDADO")
    ws_mc.append(["ESTADO", "CÓD"] + [mc for (_mn, mc) in meses] + ["TOTAL"])
    for cod in orden_est:
        fila_vals = kpi_cons[cod]
        ws_mc.append([cod, ""] + [fila_vals.get(mn, 0) for (mn, _x) in meses] + [sum(fila_vals.values())])

    # ---- Hoja: RANKING CIRCUITOS ----
    ws_rk = wb.create_sheet("RANKING CIRCUITOS")
    ws_rk.append(["ESTADO", "SUBESTACIÓN", "CIRCUITO", "NDI BRUTO", "NDI CONS.", "KVA·h TOTAL", "DURACIÓN h"])
    for r in rank:
        ws_rk.append([
            r.get("nombre_estado") or r.get("codigo_estado"),
            r.get("subestacion_nombre") or "", r.get("circuito_codigo") or "",
            r.get("ndi_bruto") or 0, r.get("ndi_consolidado") or 0,
            round(r.get("kva_hora_total") or 0, 2), round(r.get("duracion_horas_total") or 0, 2),
        ])

    # ---- Hoja: DETALLE ESTADO-MES ----
    ws_det = wb.create_sheet("DETALLE ESTADO-MES")
    ws_det.append(["ESTADO", "CÓD", "AÑO", "MES", "NDI BRUTO", "NDI CONS.", "TTI (h)", "EVENTOS CON DURACIÓN"])
    for r in sorted(kpi, key=lambda x: (x.get("codigo_estado"), x.get("mes_num"))):
        ws_det.append([
            r.get("nombre_estado") or r.get("codigo_estado"), r.get("codigo_estado"),
            r.get("anio"), MES_ESPANOL.get(r.get("mes_nombre"), r.get("mes_nombre")),
            r.get("ndi_bruto") or 0, r.get("ndi_consolidado") or 0,
            round(r.get("tti_horas") or 0, 2), r.get("eventos_con_duracion") or 0,
        ])

    wb.save(salida)
    print(f"[reportes] Consolidado -> {salida}")
    return {
        "anio": anio_act,
        "total_bruto": total_bruto,
        "total_consolidado": total_cons,
        "pct_avance": round(100.0 * total_cons / META_ANUAL, 2),
        "estados_con_datos": len(con_datos),
        "pendientes": [cod for cod, _n in pendientes],
    }


# ---------------------------------------------------------------------------
# Escritura: Detalle PLANTILLA (34 columnas idénticas)
# ---------------------------------------------------------------------------
def construir_detalle(rows, corte, salida, filtro_desc):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "PLANTILLA"
    ws.sheet_view.showGridLines = False

    # Cabecera fiel a la fuente (34 celdas, col AH = fórmula)
    for i, (_let, h) in enumerate(DETALLE_HEADERS, 1):
        cell = ws.cell(row=1, column=i, value=h)
        cell.font = HDR_FONT
        cell.fill = HDR_FILL
        cell.alignment = CENTER
        cell.border = BORDER
        ws.column_dimensions[get_column_letter(i)].width = 18
    sep = ws.cell(row=1, column=32, value="-")
    sep.font = HDR_FONT
    sep.fill = HDR_FILL
    sep.alignment = CENTER
    sep.border = BORDER
    ws.column_dimensions["AF"].width = 4
    ws.column_dimensions["AG"].width = 4
    ws.cell(row=1, column=34, value="=1/60").font = HDR_FONT
    ws.cell(row=1, column=34).fill = HDR_FILL
    ws.cell(row=1, column=34).alignment = CENTER
    ws.cell(row=1, column=34).border = BORDER
    ws.column_dimensions["AH"].width = 6
    ws.freeze_panes = "A2"

    for fila_off, r in enumerate(rows, 2):
        raw = parse_raw(r.get("raw_json"))
        for i, key in enumerate(RAW_KEYS, 1):
            val = campo_raw(raw, key)
            cell = ws.cell(row=fila_off, column=i, value=val)
            cell.font = BODY_FONT
            cell.alignment = WRAP
            cell.border = BORDER
        ws.cell(row=fila_off, column=32, value="-").border = BORDER
        ws.cell(row=fila_off, column=34, value="=1/60").border = BORDER

    # Hoja AUDITORÍA (trazabilidad por fila, sin alterar el contrato PLANTILLA)
    ws_aud = wb.create_sheet("AUDITORÍA")
    ws_aud.append([
        "id", "LINEA ORIGEN", "ESTADO", "FECHA", "CAUSA CODIGO", "CAUSA NOMBRE",
        "CALIDAD SCORE", "ES DUPLICADO", "ES ELIMINADO", "FINGERPRINT", "FUENTE ARCHIVO",
    ])
    for r in rows:
        ws_aud.append([
            r.get("id"), r.get("linea_origen"), r.get("codigo_estado"), r.get("fecha"),
            r.get("causa_codigo"), (r.get("causa_nombre") or "")[:80],
            r.get("calidad_score"), r.get("es_duplicado"), r.get("es_eliminado"),
            r.get("fingerprint"), r.get("fuente_archivo"),
        ])

    # Hoja INSTRUCTIVO QA
    ws_in = wb.create_sheet("INSTRUCTIVO")
    ws_in.cell(row=1, column=1, value="EXPORTACIÓN DE DETALLE PLANTILLA — QA NDI (Ing. Favio)").font = SUB_FONT
    notas = [
        f"Corte: {corte} · Emitido: {datetime.now():%d/%m/%Y %H:%M} · Filtros: {filtro_desc}",
        f"Filas exportadas (fiel a la fuente, desde raw_json): {len(rows)}",
        "La hoja PLANTILLA reproduce las 34 columnas del archivo original (C01–C34).",
        "La columna AH es el factor =1/60 (formato del origen).",
        "Duplicados (fingerprint) y eliminados QA se reportan en la hoja AUDITORÍA, jamás se borran filas.",
        "Match esperado: NDI Bruto = 101.305 (ene–ago) · NDI Consolidado = 79.786 · % avance = 53,07%.",
    ]
    for i, n in enumerate(notas, 3):
        ws_in.cell(row=i, column=1, value=n).font = BODY_FONT
        ws_in.column_dimensions["A"].width = 120

    wb.save(salida)
    print(f"[reportes] Detalle -> {salida}")
    return len(rows)


# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api-key", required=True)
    ap.add_argument("--host", required=True)
    ap.add_argument("--corte", default="2026-08-31")
    ap.add_argument("--salida", default="docs/reportes_qa")
    ap.add_argument("--tipo", default="todos", choices=["todos", "consolidado", "detalle"])
    ap.add_argument("--anio", type=int, default=None)
    ap.add_argument("--mes", type=int, default=None)
    ap.add_argument("--estado", default=None)
    ap.add_argument("--pagina", type=int, default=1000)
    ap.add_argument("--retries", type=int, default=3)
    ap.add_argument("--max-filas", type=int, default=250000)
    args = ap.parse_args()

    import os
    os.makedirs(args.salida, exist_ok=True)
    ins = InsForge(args.host, args.api_key, retries=args.retries, pagina=args.pagina)

    if args.tipo in ("todos", "consolidado"):
        kpi, anual, tab, rank = cargar_kpis(ins)
        ult = ultima_fecha_por_estado(ins)
        ruta_cons = os.path.join(args.salida, f"SCTIS_NDI_CONSOLIDADO_{args.corte}.xlsx")
        resumen = construir_consolidado(kpi, anual, tab, rank, ult, args.corte, ruta_cons)
        print(f"[reportes] RESUMEN: bruto={resumen['total_bruto']:,} cons={resumen['total_consolidado']:,} "
              f"avance={resumen['pct_avance']}% estados_con_datos={resumen['estados_con_datos']} "
              f"pendientes={resumen['pendientes']}".replace(",", "."))

    if args.tipo in ("todos", "detalle"):
        filtro_desc = f"anio={args.anio or 'TODOS'} mes={args.mes or 'TODOS'} estado={args.estado or 'TODOS'}"
        print(f"[reportes] leyendo detalle ({filtro_desc}) ...", flush=True)
        rows = cargar_detalle(ins, anio=args.anio, mes=args.mes, estado=args.estado, max_filas=args.max_filas)
        ruta_det = os.path.join(args.salida, f"SCTIS_NDI_DETALLE_PLANTILLA_{args.corte}.xlsx")
        n = construir_detalle(rows, args.corte, ruta_det, filtro_desc)
        print(f"[reportes] detalle: {n} filas · requests REST: {ins.requested}")

    print("[reportes] COMPLETO")


if __name__ == "__main__":
    main()