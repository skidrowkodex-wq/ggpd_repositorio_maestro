#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ETL Consolidado SCTIS V1 — Carga de detalle PLANTILLA (xlsx de la Ing. Favio)
a InsForge (sctis.mae_interrupciones_tiras) vía la vista pública
v_sctis_tiras_interrupcion (trigger INSTEAD OF INSERT).

Reglas documentadas (V1):
- NDI por mes derivado de la columna Fecha (C02); Inicio (C07) corrupto en ~86%
  de las filas se conserva en raw_json y se omite.
- Estado 'REGION CAPITAL' -> DCA (Distrito Capital, MDM).
- Causa (C14): etiquetas categorícas exactas + reglas por subcadena sobre las
  22 categorías oficiales (core.cat_causas_interrupcion); sin emparejamiento ->
  OTRAS con el texto intacto en causa_nombre. QA (Ing. Favio) corrige.
- Duplicados: fingerprint SHA-256 del contenido normalizado completo; la primera
  aparición es la canónica, el resto es_duplicado=TRUE.
- Cero MOCK: únicamente datos reales del archivo.

Uso:
  python3 etl_cargar_consolidado.py --archivo <xlsx> --api-key <KEY> --host <URL> [--batch 2000] [--limite N] [--dry-run]

Salida: resumen (filas, duplicados, estados desconocidos, emparejamiento causa, tiempo).
"""
import argparse
import hashlib
import json
import re
import sys
import time
import unicodedata
from datetime import date, datetime, time as dtime, timedelta, timezone

import openpyxl
import requests

HOJA = "PLANTILLA"

# ---------------------------------------------------------------------------
# Catálogo oficial SEN (core.cat_causas_interrupcion) — 22 códigos
# ---------------------------------------------------------------------------
CAUSAS_OFICIALES = {
    "ACCIDENTAL", "APERTURA_EMERGENCIA", "ATMOSFERICA", "ATRIBUIBLE_COORD_PROT",
    "ATRIBUIBLE_MANTENIMIENTO", "BAJA_TENSION", "COMPONENTE_DANADO",
    "ERROR_OPERACIONES", "FALLA_EQUIPOS", "FALLA_LINEA_115KV", "MANIOBRA_MT",
    "OTRAS", "PAC", "POR_TERCEROS", "PROGRAMADA", "RACIONAMIENTO",
    "SIN_TENSION_SE", "SOBRECARGA", "SOBRECORRIENTE_FASE",
    "SOBRECORRIENTE_FASE_NEUTRO", "SOBRECORRIENTE_NEUTRO", "VEGETACION",
}

# Etiquetas normalizadas (UPPER, sin acentos, espacios colapsados) -> código
_CAUSA_EXACTA = {
    "COMPONENTE DANADO": "COMPONENTE_DANADO",
    "COMPONENTE DA?ADO": "COMPONENTE_DANADO",
    "COMPONENTE DAADO": "COMPONENTE_DANADO",
    "COMP. DANADO": "COMPONENTE_DANADO",
    "COMP._DANADO": "COMPONENTE_DANADO",
    "PUENTE ROTO MT": "COMPONENTE_DANADO",
    "PUENTE ROTO": "COMPONENTE_DANADO",
    "PUENTE SUELTO": "COMPONENTE_DANADO",
    "PUENTE ABIERTO": "COMPONENTE_DANADO",
    "LINEA ROTA": "COMPONENTE_DANADO",
    "LINEA ROTA MT": "COMPONENTE_DANADO",
    "DESCONOCIDA": "OTRAS",
    "FORTUITA": "OTRAS",
    "SIN OBSERVACION": "OTRAS",
    "NO DETERMINADA": "OTRAS",
    "EN INVESTIGACION": "OTRAS",
    "FALLA POR DETERMINAR": "OTRAS",
    "A CONSECUENCIA": "OTRAS",
    "MEDIDAS DE SEGURIDAD": "APERTURA_EMERGENCIA",
    "MEDIDAS DE SEG.": "APERTURA_EMERGENCIA",
    "MEDIDAS_DE_SEG.": "APERTURA_EMERGENCIA",
    "FALTA DE MANTENIMIENTO": "ATRIBUIBLE_MANTENIMIENTO",
    "FALTA_DE_MTTO": "ATRIBUIBLE_MANTENIMIENTO",
    "FALTA MANTENIMIENTO": "ATRIBUIBLE_MANTENIMIENTO",
    "FALTA DE MTTO.": "ATRIBUIBLE_MANTENIMIENTO",
    "FALTA_DE_MTTO.": "ATRIBUIBLE_MANTENIMIENTO",
    "MATENIMIENTO DEFICIENTE": "ATRIBUIBLE_MANTENIMIENTO",
    "MANTENIMIENTO DEFICIENTE": "ATRIBUIBLE_MANTENIMIENTO",
    "PRG.X MANT.CORRECTIVO": "ATRIBUIBLE_MANTENIMIENTO",
    "ATMOSFERICA": "ATMOSFERICA",
    "ATMOSFERICAS": "ATMOSFERICA",
    "LLUVIAS": "ATMOSFERICA",
    "LLUVIA": "ATMOSFERICA",
    "VEGETACION": "VEGETACION",
    "ACCIDENTAL": "ACCIDENTAL",
    "ACCIDENTE": "ACCIDENTAL",
    "FALLA EN EQUIPOS": "FALLA_EQUIPOS",
    "FALLA DE EQUIPO": "FALLA_EQUIPOS",
    "SOBRECARGA": "SOBRECARGA",
    "RACIONAMIENTO": "RACIONAMIENTO",
    "PAC": "PAC",
    "PROGRAMADAS": "PROGRAMADA",
    "PROGRAMADA": "PROGRAMADA",
    "PARADA PROGRAMADA": "PROGRAMADA",
    "AJUSTE INCORRECTO DE PROTECCIONES": "ATRIBUIBLE_COORD_PROT",
    "AJUSTE INCORRECTO DE PROTECCIONES": "ATRIBUIBLE_COORD_PROT",
    "APERTURA POR EMERGENCIA": "APERTURA_EMERGENCIA",
    "RESTRICCION OPERATIVA PROGRAMADA": "PROGRAMADA",
    "TRABAJO POR OPERACIONES": "MANIOBRA_MT",
    "TRABAJO DE OPERACIONES POR FALLA.": "MANIOBRA_MT",
    "MANIOBRA EN LINEA MT": "MANIOBRA_MT",
    "CORTE PROGRAMADO \"MANTENIMIENTO\"": "PROGRAMADA",
    "DETERIORADO X VIEJO": "ATRIBUIBLE_MANTENIMIENTO",
    "DEFECTO DE INSTALACION": "ATRIBUIBLE_MANTENIMIENTO",
    "POR INDUCCION EN LA LINEA": "ATRIBUIBLE_COORD_PROT",
    "CORTACORRIENTE DANADO": "COMPONENTE_DANADO",
    "FALLA EN LINEA": "COMPONENTE_DANADO",
}

# Reglas por subcadena (sobre texto normalizado) -> código. Se evalúan en orden.
_CAUSA_REGLA = [
    (("REMPLAZO", "REEMPLAZO", "CAMBIAR", "CAMBIO", "INSTALAR", "INSTALACION",
      "COLOCACION", "COLOCAR", "SUSTITUIR", "SUSTITUCION", "REPARAR", "REPARACION",
      "RECONECTADOR", "PUENTE", "CORTACORRIENTE", "CORTADOR", "SECCIONADOR",
      "AISLADOR", "CRUCETA", "POSTE", "LINEA ", "LINEAS", "CONDUCTOR", "ESTRIBO",
      "MALLA", "CABLE", "TX QUEMADO", "BANCO ", "PARARRAYO", "PORTAFUSIBLE",
      "FUSIBLE", "CORTE DE SERVICIO ELECTRICO"), "COMPONENTE_DANADO"),
    (("APERTURA POR EMERGENCIA", "POR EMERGENCIA", "DE EMERGENCIA", "EMERGENCIA",
      "MEDIDAS DE SEGURIDAD", "MEDIDAS DE SEG.", "POR SEGURIDAD", "SEGURIDAD"), "APERTURA_EMERGENCIA"),
    (("PICA Y PODA", "PODA", "ARBOL", "ARBOLES", "RAMA", "RAMAS", "VEGETACI", "VEGETACION",
      "DESPEJE DE VEGETACION", "CONTROL DE VEGETACION"), "VEGETACION"),
    (("LLUVIA", "TORMENTA", "HURACAN", "VIENTO", "RAYO", "RELAMPAGO", "ATMOSFERICA",
      "ATMOSFERICAS"), "ATMOSFERICA"),
    (("PRUEBA", "NO SE ENCONTRO FALLA", "NO SE ENCONTRO NADA", "SIN NOVEDAD",
      "REVISION", "REVICION", "COMANDO DE CIERRE", "FPROB" ), "ERROR_OPERACIONES"),
    (("FALTA DE MANTENIMIENTO", "FALTA_DE_MTTO", "MANTENIMIENTO DEFICIENTE",
      "MATENIMIENTO", "MTTO", "CORRECTIVO", "POR FALTA DE MANTENIMIENTO"), "ATRIBUIBLE_MANTENIMIENTO"),
    (("PROGRAMAD", "TRABAJOS A REALIZAR", "TRABAJO POR", "PLAN DE", "SOLICITUD", "CORTE DE SERVICIO", "PARA REALIZAR"), "PROGRAMADA"),
    (("SOBRECARGA", "POR SOBRECARGA"), "SOBRECARGA"),
    (("RACIONAMIENTO", "ADMINISTRACION DE CARGA", "ADMINISTRADO"), "RACIONAMIENTO"),
    (("FASE Y EN EL NEUTRO", "FASE Y NEUTRO", "EN EL NEUTRO", "FASE_NEUTRO",
      "50/51", "50N/51N"), "SOBRECORRIENTE_FASE_NEUTRO"),
    (("SOBRECORRIENTE", "SOBRE CORRIENTE", "SOBRE CORRIENTES"), "SOBRECORRIENTE_FASE"),
    (("AJUSTE INCORRECTO", "PROTECCIONES", "PROTECCION"), "ATRIBUIBLE_COORD_PROT"),
    (("ALTA TENSION", "115", "230", "400 KV", "TRANSMISION", "TERNA", "34.5"), "FALLA_LINEA_115KV"),
    (("BAJA TENSION", "EN BT", "RED SECUNDARIA"), "BAJA_TENSION"),
    (("SIN TENSION", "BARRAS"), "SIN_TENSION_SE"),
    (("TRANSFORMADOR", "TX ", "EQUIPO", "INTERRUPTOR", "PRUEBAS A TX", "RECONECTADOR"), "FALLA_EQUIPOS"),
    (("TERCEROS", "CHOCO", "CHOQUE", "GANDOLA", "VEHICULO", "AVE", "PALOMA", "ANIMAL",
      "ENJAMBRE", "ABEJAS", "NAILON", "COMETA", "BALON", "GLOBO", "LAMINA", "ZIN",
      "CARRETA", "ROBO"), "POR_TERCEROS"),
    (("MANIOBRA", "SECCIONA", "TRANSFERENCIA DE CARGA", "CERRAR", "ABRIR"), "MANIOBRA_MT"),
    (("DESCONOCIDA", "FORTUITA", "SIN OBSERVACION", "NO DETERMINADA", "EN INVESTIGACION",
      "FALLA POR DETERMINAR", "A CONSECUENCIA"), "OTRAS"),
]

# Estados fuente -> codigo_state (MDM); REGION CAPITAL -> DCA
_ESTADO_MAPA = {
    "AMAZONAS": "AMA", "ANZOATEGUI": "ANZ", "APURE": "APU", "ARAGUA": "ARA",
    "BARINAS": "BAR", "BOLIVAR": "BOL", "CARABOBO": "CAR", "COJEDES": "COJ",
    "DELTA AMACURO": "DEL", "FALCON": "FAL", "GUARICO": "GUA", "LA GUAIRA": "LGU",
    "LARA": "LAR", "MERIDA": "MER", "MIRANDA": "MIR", "MONAGAS": "MON",
    "NUEVA ESPARTA": "NES", "PORTUGUESA": "POR", "REGION CAPITAL": "DCA",
    "SUCRE": "SUC", "TACHIRA": "TAC", "TRUJILLO": "TRU", "YARACUY": "YAR", "ZULIA": "ZUL",
}

# Fecha considerada válida para NDI (años del ejercicio)
_ANIO_MIN = 2015
_ANIO_MAX = 2026


def norm(s):
    """UPPER, sin acentos, espacios colapsados."""
    if s is None:
        return ""
    t = unicodedata.normalize("NFD", "".join(c for c in str(s))).strip().upper()
    t = re.sub(r"\s+", " ", t)
    return t


def to_num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace(",", ".")
    if s in ("", "-", "N/A"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _parse_dt_text(s):
    s = s.strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d",
        "%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%d/%m/%Y",
        "%d-%m-%Y", "%d.%m.%Y",
    ):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def to_date(value):
    """Devuelve date o None (None si corrupto/fuera del rango)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        v = value.date()
    elif isinstance(value, date):
        v = value
    else:
        v = _parse_dt_text(str(value))
        if v is None:
            return None
        v = v.date()
    if v.year < _ANIO_MIN or v.year > _ANIO_MAX:
        return None
    return v


def to_dt_caracas(value):
    """Datetime con tz Caracas (-04:00) o None si corrupto/fuera de rango."""
    if value is None:
        return None
    if isinstance(value, datetime):
        v = value
    elif isinstance(value, date):
        v = datetime.combine(value, dtime(0, 0))
    else:
        v = _parse_dt_text(str(value))
        if v is None:
            return None
    if v.year < _ANIO_MIN or v.year > _ANIO_MAX:
        return None
    if v.tzinfo is None:
        v = v.replace(tzinfo=timezone(timedelta(hours=-4)))
    return v.isoformat()

def to_time_seconds(value):
    """Duracion HH:MM:SS -> segundos; timedelta -> segundos; numeric -> segundos (asumido HH.MM ya normalizado aparte)."""
    if value is None:
        return None
    if isinstance(value, timedelta):
        return value.total_seconds()
    if isinstance(value, dtime):
        return value.hour * 3600 + value.minute * 60 + value.second
    s = str(value).strip()
    m = re.match(r"^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$", s)
    if m:
        h, mi, se = int(m.group(1)), int(m.group(2)), int(m.group(3) or 0)
        return h * 3600 + mi * 60 + se
    return None


def classify_causa(raw):
    """Devuelve (codigo, matched). Determinístico V1."""
    n = norm(raw)
    if not n:
        return "OTRAS", ""
    exact = _CAUSA_EXACTA.get(n)
    if exact:
        return exact, n
    nospace = "".join(n.split(" "))
    for key, code in _CAUSA_EXACTA.items():
        if "".join(key.split(" ")) == nospace:
            return code, nospace
    for tokens, code in _CAUSA_REGLA:
        for tok in tokens:
            if tok in n:
                return code, n
    return "OTRAS", n


def fingerprint(payload_fields):
    """SHA-256 del contenido normalizado completo (sin metadatos de archivo)."""
    canonical = json.dumps(payload_fields, sort_keys=True, ensure_ascii=False, default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def calidad_score(row_fields):
    s = 100
    if not row_fields.get("inicio"):
        s -= 20
    if not row_fields.get("fecha"):
        s -= 10
    if not row_fields.get("carga_kva"):
        s -= 10
    if not row_fields.get("circuito_codigo"):
        s -= 10
    if not row_fields.get("causa_codigo") or row_fields["causa_codigo"] == "OTRAS":
        s -= 10
    return max(s, 0)


def carga_detalle(ws, fuente, limite=None):
    """Itera filas PLANTILLA -> dict preparado para la vista."""
    filas = []
    seen = set()
    stats = {"duplicados": 0, "estados_desconocidos": {}, "inicio_ok": 0, "causa_no_otras": 0, "totales": 0, "sin_fecha": 0}
    for idx, r in enumerate(ws.iter_rows()):
        if idx == 0:
            continue
        v = [c.value for c in r]
        estado_raw = str(v[0]).strip().upper() if v[0] is not None else ""
        if not estado_raw:
            continue
        stats["totales"] += 1
        codigo_estado = _ESTADO_MAPA.get(estado_raw)
        if not codigo_estado:
            stats["estados_desconocidos"][estado_raw] = stats["estados_desconocidos"].get(estado_raw, 0) + 1

        fecha02 = to_date(v[1])
        inicio01 = to_dt_caracas(v[6])
        if inicio01:
            stats["inicio_ok"] += 1
        fecha_final = fecha02 or (datetime.fromisoformat(inicio01).date() if inicio01 else None)
        if fecha_final is None:
            try:
                dia_c, mes_c, anio_c = int(v[23]), int(v[24]), int(v[25])
                if _ANIO_MIN <= anio_c <= _ANIO_MAX and 1 <= mes_c <= 12 and 1 <= dia_c <= 31:
                    fecha_final = date(anio_c, mes_c, dia_c)
            except (TypeError, ValueError):
                pass
        if fecha_final is None:
            stats["sin_fecha"] += 1

        dur_hora = to_num(v[10])
        duracion_time_s = to_time_seconds(v[7])
        if dur_hora is None and duracion_time_s is not None:
            dur_hora = duracion_time_s / 3600.0
        duracion_min = round(dur_hora * 60, 0) if dur_hora is not None else (round(duracion_time_s / 60, 0) if duracion_time_s else None)
        carga_kva = to_num(v[8])
        kva_int_f = to_num(v[22])
        kva_hora = to_num(v[21])

        causa_raw = v[13]
        causa_codigo, causa_match = classify_causa(causa_raw)
        senal_raw = v[12]
        dur_secs = duracion_time_s or (dur_hora * 3600 if dur_hora is not None else None)

        campos = {
            "codigo_estado": codigo_estado,
            "subestacion_nombre": str(v[4]).strip() if v[4] is not None else None,
            "circuito_codigo": str(v[5]).strip() if v[5] is not None else None,
            "fecha_apertura": inicio01 or (fecha_final.isoformat() + "T00:00:00-04:00" if fecha_final else None),
            "fecha_cierre": None,
            "duracion_minutos": duracion_min,
            "mw_interrumpidos": round(carga_kva / 1000.0, 4) if carga_kva is not None else None,
            "causa_codigo": causa_codigo,
            "subcausa_codigo": None,
            "despachador": None,
            "observaciones": str(v[15]).strip() if v[15] is not None else None,
            "calidad_score": 0,
            "fecha": fecha_final.isoformat() if fecha_final else None,
            "sistema": str(v[2]).strip() if v[2] is not None else None,
            "distrito": str(v[3]).strip() if v[3] is not None else None,
            "inicio": inicio01,
            "carga_kva": carga_kva,
            "frec": to_num(v[9]),
            "dur_hora": dur_hora,
            "tti": to_num(v[11]),
            "senal": str(senal_raw).strip() if senal_raw is not None else None,
            "causa_nombre": str(causa_raw).strip()[:220] if causa_raw is not None else None,
            "subcausa_nombre": str(v[14]).strip()[:220] if v[14] is not None else None,
            "sectores": str(v[16]).strip() if v[16] is not None else None,
            "ciudad": str(v[17]).strip() if v[17] is not None else None,
            "kva_instalados": to_num(v[18]),
            "circuito_estado": str(v[20]).strip() if v[20] is not None else None,
            "kva_hora": kva_hora,
            "kva_int_f": kva_int_f,
            "dia_num": int(v[23]) if isinstance(v[23], (int, float)) else None,
            "mes_num": int(v[24]) if isinstance(v[24], (int, float)) else None,
            "anio_num": int(v[25]) if isinstance(v[25], (int, float)) else None,
            "dia_semana": str(v[26]).strip()[:20] if v[26] is not None else None,
            "mes_nombre": str(v[27]).strip()[:20] if v[27] is not None else None,
            "elimina_espacio": str(v[28]).strip()[:20] if v[28] is not None else None,
            "causa_falla": str(v[29]).strip()[:220] if len(v) > 29 and v[29] is not None else None,
            "fecha_f": to_date(v[30]).isoformat() if len(v) > 30 else None,
            "col32": str(v[31]).strip()[:20] if len(v) > 31 and v[31] is not None else None,
        }
        raw_json = {
            "estado": str(v[0]).strip(),
            "fecha_raw": str(v[1]),
            "sistema_raw": str(v[2]),
            "distrito_raw": str(v[3]),
            "subestacion_raw": str(v[4]),
            "circuito_raw": str(v[5]),
            "inicio_raw": str(v[6]),
            "duracion_raw": str(v[7]),
            "carga_raw": str(v[8]),
            "frec_raw": str(v[9]),
            "dur_hora_raw": str(v[10]),
            "tti_raw": str(v[11]),
            "senal_raw": str(v[12]),
            "causa_raw": str(v[13]),
            "subcausa_raw": str(v[14]),
            "observaciones_raw": str(v[15]),
            "sectores_raw": str(v[16]),
            "ciudad_raw": str(v[17]),
            "kva_instalados_raw": str(v[18]),
            "duracion_f_raw": str(v[19]),
            "circuito_estado_raw": str(v[20]),
            "kva_hora_raw": str(v[21]),
            "kva_int_f_raw": str(v[22]),
            "dia_raw": str(v[23]),
            "mes_raw": str(v[24]),
            "anio_raw": str(v[25]),
            "dia_semana_raw": str(v[26]),
            "mes_nombre_raw": str(v[27]),
            "elimina_espacio_raw": str(v[28]),
            "causa_falla_raw": str(v[29]) if len(v) > 29 else None,
            "fecha_f_raw": str(v[30]) if len(v) > 30 else None,
            "clasificador_causa": causa_match,
        }
        campos["raw_json"] = json.dumps(raw_json, ensure_ascii=False)
        campos["fingerprint"] = fingerprint({k: campos[k] for k in campos})
        campos["fuente_archivo"] = fuente
        campos["linea_origen"] = idx + 1
        campos["es_duplicado"] = False
        campos["es_eliminado"] = False
        campos["calidad_score"] = calidad_score(campos)
        if causa_codigo != "OTRAS":
            stats["causa_no_otras"] += 1
        if campos["fingerprint"] in seen:
            campos["es_duplicado"] = True
            stats["duplicados"] += 1
        else:
            seen.add(campos["fingerprint"])
        filas.append(campos)
        if limite and len(filas) >= limite:
            break
    return filas, stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--archivo", required=True)
    ap.add_argument("--api-key", required=True)
    ap.add_argument("--host", required=True)
    ap.add_argument("--hoja", default=HOJA)
    ap.add_argument("--batch", type=int, default=300)
    ap.add_argument("--limite", type=int, default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--retries", type=int, default=3)
    args = ap.parse_args()

    origen = args.archivo.split("/")[-1]
    print(f"[ETL] leyendo {args.archivo} (hoja {args.hoja}) ...", flush=True)
    t0 = time.time()
    wb = openpyxl.load_workbook(args.archivo, read_only=True, data_only=False)
    ws = wb[args.hoja]
    filas, stats = carga_detalle(ws, origen, args.limite)
    wb.close()

    print(f"[ETL] filas: {stats['totales']}  -> payload lista {len(filas)} duplicados {stats['duplicados']}")
    if stats["estados_desconocidos"]:
        print(f"[ETL] ESTADOS DESCONOCIDOS (no mapeados): {stats['estados_desconocidos']}")
    pct_inicio = round(100.0 * stats["inicio_ok"] / max(len(filas), 1), 1)
    pct_causa = round(100.0 * stats["causa_no_otras"] / max(len(filas), 1), 1)
    print(f"[ETL] inicio OK: {stats['inicio_ok']} ({pct_inicio}%) | causa tipificada (>OTRAS): {pct_causa}% | sin_fecha: {stats['sin_fecha']}")

    if args.dry_run:
        print("[ETL] dry-run: sin escritura. Ejemplo (2 filas):")
        for f in filas[:2]:
            print("   ", {k: (str(v)[:60] if v is not None else None) for k, v in f.items() if k not in ("raw_json",)})
        return

    url = f"{args.host}/api/database/records/v_sctis_tiras_interrupcion"
    headers = {"apikey": args.api_key, "Authorization": f"Bearer {args.api_key}", "Content-Type": "application/json"}
    ok = 0
    for i in range(0, len(filas), args.batch):
        chunk = filas[i:i + args.batch]
        intento = 0
        while True:
            try:
                resp = requests.post(url, json=chunk, headers=headers, timeout=600)
                if resp.status_code >= 400:
                    if intento < args.retries:
                        intento += 1
                        print(f"    [ETL] HTTP {resp.status_code} batch {i // args.batch + 1}, reintento {intento} ...", flush=True)
                        time.sleep(2 * intento)
                        continue
                    body = resp.text[:800]
                    sys.exit(f"[ETL] ERROR batch {i // args.batch + 1}: HTTP {resp.status_code} -> {body}")
                break
            except requests.RequestException as e:
                if intento < args.retries:
                    intento += 1
                    print(f"    [ETL] {type(e).__name__} batch {i // args.batch + 1}, reintento {intento} ...", flush=True)
                    time.sleep(2 * intento)
                    continue
                sys.exit(f"[ETL] ERROR batch {i // args.batch + 1}: {e}")
        ok += len(chunk)
        print(f"[ETL] {ok}/{len(filas)} filas (batch {i // args.batch + 1}, {round(time.time() - t0, 1)}s)", flush=True)
    print(f"[ETL] COMPLETO: {ok} filas en {round(time.time() - t0, 1)}s")


if __name__ == "__main__":
    main()