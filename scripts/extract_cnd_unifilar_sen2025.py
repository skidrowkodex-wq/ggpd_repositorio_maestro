#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
========================================================================================
CORPOELEC - Gerencia General de Planificación de Distribución (GGPD)
Pipeline de Extracción Vectorial y Creación de BD Paralela Aislada
Documento Fuente: CND Mayo 2025 - Sistema Eléctrico Nacional (SEN) Unifilar Nacional
Archivo: docs/Unifilar SEN 2025/SEN_2025_MayoUNIFILARNACIONAL.pdf
Destino: database/cnd_sen_unifilar_2025.sqlite (100% Aislado - Cero Contaminación core.*)
========================================================================================
"""

import os
import sys
import math
import re
import json
import sqlite3
import datetime
import unicodedata
from collections import defaultdict, Counter

try:
    import pymupdf as fitz
except ImportError:
    import fitz


# ========================================================================================
# CONFIGURACIÓN Y CONSTANTES
# ========================================================================================

PDF_PATH = os.path.join("docs", "Unifilar SEN 2025", "SEN_2025_MayoUNIFILARNACIONAL.pdf")
DB_PATH = os.path.join("database", "cnd_sen_unifilar_2025.sqlite")
SQL_DUMP_PATH = os.path.join("database", "cnd_sen_unifilar_2025.sql")
JSON_EXPORT_PATH = os.path.join("database", "cnd_sen_unifilar_2025.json")

# Mapa Canónico de Tensiones CND (según Leyenda del Plano a y=2800..3100)
# (R, G, B) en escala 0.0 - 1.0
COLOR_KV_MAP = [
    {
        "codigo": "765KV",
        "tension_kv": 765.0,
        "nombre": "Sistema 765 kV",
        "color_hex": "#FFA100",
        "rgb_target": (1.0, 0.63, 0.0),
        "grosor_nominal": 3.0,
        "descripcion": "Troncal Extra Alta Tensión (EAT) Caroní - Centro (Guri a La Horqueta / La Arenosa)",
    },
    {
        "codigo": "400KV",
        "tension_kv": 400.0,
        "nombre": "Sistema 400 kV",
        "color_hex": "#00C700",
        "rgb_target": (0.0, 0.78, 0.0),
        "alt_rgb": (0.0, 1.0, 0.0),
        "grosor_nominal": 1.5,
        "descripcion": "Anillo de Transmisión Troncal Nacional (Guri, Guayana B, Planta Centro, Yaracuy, etc.)",
    },
    {
        "codigo": "230KV",
        "tension_kv": 230.0,
        "nombre": "Sistema 230 kV",
        "color_hex": "#FF0000",
        "rgb_target": (1.0, 0.0, 0.0),
        "grosor_nominal": 1.2,
        "descripcion": "Red Troncal de Transmisión y Alimentación Regional",
    },
    {
        "codigo": "138KV",
        "tension_kv": 138.0,
        "nombre": "Sistema 138 kV",
        "color_hex": "#FF00FF",
        "rgb_target": (1.0, 0.0, 1.0),
        "grosor_nominal": 1.2,
        "descripcion": "Subtransmisión Regional (Sistemas Andinos y Específicos)",
    },
    {
        "codigo": "115KV",
        "tension_kv": 115.0,
        "nombre": "Sistema 115 kV",
        "color_hex": "#0000FF",
        "rgb_target": (0.0, 0.0, 1.0),
        "grosor_nominal": 1.2,
        "descripcion": "Red Principal de Subtransmisión y Entrega a Distribución",
    },
    {
        "codigo": "69KV",
        "tension_kv": 69.0,
        "nombre": "Sistema 69 kV",
        "color_hex": "#000000",
        "rgb_target": (0.0, 0.0, 0.0),
        "grosor_nominal": 1.2,
        "descripcion": "Subtransmisión Secundaria / Conexiones Especiales",
    },
]

# Reglas de exclusión para no confundir rótulos institucionales con subestaciones
EXCLUDE_SUBSTATION_TOKENS = {
    "SISTEMA", "AISLADA", "OPERANDO", "REVISADO", "APROBADO", "ACTUALIZADO", "DIBUJO",
    "CENTRO NACIONAL", "DESPACHO", "CIRCUITO", "INDUCTOR", "CAPACITOR", "CABLE",
    "SUBTERRANEO", "SUBMARINO", "SUBLACUSTRE", "LINEA", "LINEAS", "PUNTA", "COMPENSADOR",
    "ALCASA ALUMINIO", "FMO FERROMINERA", "SIDOR SIDER", "SIZUCA", "PEQUIVEN",
    "HIDROCAPITAL", "HIDROLAGO", "HIDROLARA", "HIDROCENTRO", "INVENCEM", "SIDETUR",
    "CAVIM", "UNICON", "IVIC", "IAFE", "FNC", "BAMARI", "SIVENSA", "SINCOR",
    "TAEJ", "BITOR", "HEVENSA", "CEM", "POLAR", "BRIQVEN", "COMSINAC", "BRIQCAR",
    "VENALUM", "COMSIGUA", "CADECA", "FERROVEN", "SURAL", "CORPOVEN",
    "ING.", "MAYO", "2025", "S.A.", "C.A.", "ESCALA", "HOJA", "MVAR", "MVA", "MW", "KV"
}


# ========================================================================================
# UTILIDADES Y HELPERS DE PARSEO
# ========================================================================================

def normalize_text(text: str) -> str:
    """Elimina dobles espacios y normaliza saltos de línea."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def strip_accents(text: str) -> str:
    """Elimina tildes para comparaciones estables."""
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join([c for c in nfkd if not unicodedata.combining(c)])


def color_distance(c1, c2):
    """Calcula distancia Euclidiana entre dos tuplas RGB (0..1)."""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))


def match_voltage(color, width):
    """Determina el nivel de tensión de un trazo a partir de su color RGB y grosor."""
    if not color:
        return COLOR_KV_MAP[-1]  # Por defecto 69 kV / Negro
    
    rgb = (round(color[0], 2), round(color[1], 2), round(color[2], 2))
    
    # 765 kV: Naranja característico (1.0, 0.63, 0.0)
    if rgb[0] > 0.85 and 0.45 <= rgb[1] <= 0.75 and rgb[2] < 0.2:
        return COLOR_KV_MAP[0]
    
    # 400 kV: Verde (0.0, 0.78, 0.0) o (0.0, 1.0, 0.0)
    if rgb[0] < 0.2 and rgb[1] >= 0.65 and rgb[2] < 0.2:
        return COLOR_KV_MAP[1]
    
    # 230 kV: Rojo puro (1.0, 0.0, 0.0)
    if rgb[0] >= 0.85 and rgb[1] < 0.2 and rgb[2] < 0.2:
        return COLOR_KV_MAP[2]
    
    # 138 kV: Magenta (1.0, 0.0, 1.0)
    if rgb[0] >= 0.8 and rgb[1] < 0.2 and rgb[2] >= 0.8:
        return COLOR_KV_MAP[3]
    
    # 115 kV: Azul puro (0.0, 0.0, 1.0)
    if rgb[0] < 0.2 and rgb[1] < 0.2 and rgb[2] >= 0.8:
        return COLOR_KV_MAP[4]
    
    # 69 kV / Común: Negro
    if rgb[0] < 0.2 and rgb[1] < 0.2 and rgb[2] < 0.2:
        return COLOR_KV_MAP[5]
    
    # Búsqueda por mínima distancia euclidiana
    best_match = min(COLOR_KV_MAP, key=lambda kv: color_distance(rgb, kv["rgb_target"]))
    return best_match


def assign_quadrant(cx, cy, max_w=5669.25, max_h=3146.25):
    """Determina la región geográfica mural del SEN según coordenadas."""
    rel_x = cx / max_w
    rel_y = cy / max_h
    
    # Zulia / Occidente Norte
    if rel_x < 0.25 and rel_y < 0.45:
        return "Occidente / Zulia"
    # Andes / Suroeste
    elif rel_x < 0.28 and rel_y >= 0.45:
        return "Suroeste / Andes"
    # Centro-Occidente (Lara, Portuguesa, Yaracuy)
    elif 0.25 <= rel_x < 0.45 and rel_y < 0.65:
        return "Centro-Occidente"
    # Los Llanos
    elif 0.28 <= rel_x < 0.55 and rel_y >= 0.65:
        return "Llanos Centrales / Apure"
    # Región Central / Capital
    elif 0.45 <= rel_x < 0.65 and rel_y < 0.60:
        return "Región Central / Capital"
    # Oriente (Anzoátegui, Monagas, Sucre, Nueva Esparta)
    elif rel_x >= 0.65 and rel_y < 0.65:
        return "Oriente"
    # Guayana / Sur (Caroní, Guri, Bolívar, Amazonas, Frontera Brasil)
    else:
        return "Guayana / Sur"


# ========================================================================================
# PARSEO DE EQUIPOS ESPECÍFICOS
# ========================================================================================

def parse_transformers(text):
    """Extrae unidades, potencia unitaria y total en MVA."""
    results = []
    # Pattern: 3 x 1500 MVA, 1 x 450 MVA, 2 x 187,5 MVA, 20 MVA, etc.
    pat = re.compile(r'(?:(?:U\s*[\d\w\s,-]+)?\s*(\d+)\s*[xX]\s*)?(\d+(?:[.,]\d+)?)\s*MVA\b', re.IGNORECASE)
    for line in text.split('\n'):
        if 'MVAR' in line.upper():
            continue
        for m in pat.finditer(line):
            qty = int(m.group(1)) if m.group(1) else 1
            unit_val = float(m.group(2).replace(',', '.'))
            results.append({
                'raw': m.group(0).strip(),
                'qty': qty,
                'unit_mva': unit_val,
                'total_mva': qty * unit_val
            })
    return results


def parse_reactive(text):
    """Extrae bancos de compensación reactiva en MVAr e infiere tipo (Inductor/Capacitor)."""
    results = []
    pat = re.compile(r'(?:(\d+)\s*[xX]\s*)?(\d+(?:[.,]\d+)?)\s*MVAr\b', re.IGNORECASE)
    tipo = "NO_DETERMINADO"
    t_up = text.upper()
    if "INDUCTOR" in t_up or "REACT" in t_up:
        tipo = "INDUCTOR"
    elif "CAPACIT" in t_up:
        tipo = "CAPACITOR"

    for line in text.split('\n'):
        for m in pat.finditer(line):
            qty = int(m.group(1)) if m.group(1) else 1
            unit_val = float(m.group(2).replace(',', '.'))
            results.append({
                'raw': m.group(0).strip(),
                'tipo': tipo,
                'qty': qty,
                'unit_mvar': unit_val,
                'total_mvar': qty * unit_val
            })
    return results


def parse_generators(text):
    """Extrae bloques de generación turbomotriz en MW."""
    results = []
    # Pattern: U 7-18  12 x 212 MW, U 1-12 12 x 180 MW, 1 x 400 MW, etc.
    pat = re.compile(r'(?:(?:(U\s*[\d\w\s,-]+)\s+)?(\d+)\s*[xX]\s*)?(\d+(?:[.,]\d+)?)\s*MW\b', re.IGNORECASE)
    for line in text.split('\n'):
        for m in pat.finditer(line):
            machines_tag = m.group(1).strip() if m.group(1) else ""
            qty = int(m.group(2)) if m.group(2) else 1
            unit_val = float(m.group(3).replace(',', '.'))
            results.append({
                'raw': line.strip(),
                'machines_tag': machines_tag,
                'qty': qty,
                'unit_mw': unit_val,
                'total_mw': qty * unit_val
            })
    return results


# ========================================================================================
# CREACIÓN DE BASE DE DATOS Y ESQUEMA RELACIONAL
# ========================================================================================

def init_database(conn):
    """Crea todas las tablas e índices del modelo aislado CND 2025."""
    cursor = conn.cursor()
    
    # 1. Metadatos del Documento
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        emisor TEXT NOT NULL,
        autor_dibujo TEXT,
        revisado_por TEXT,
        aprobado_por TEXT,
        fecha_emision TEXT,
        software_origen TEXT,
        ancho_pt REAL,
        alto_pt REAL,
        ancho_mm REAL,
        alto_mm REAL,
        total_bloques_texto INTEGER,
        total_geometrias INTEGER,
        fecha_extraccion TEXT
    );
    """)

    # 2. Niveles de Tensión Canónicos CND
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_niveles_tension (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_tension TEXT UNIQUE NOT NULL,
        tension_kv REAL NOT NULL,
        nombre_sistema TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        color_rgb TEXT NOT NULL,
        grosor_nominal_pt REAL,
        descripcion TEXT
    );
    """)

    # 3. Clientes Industriales y Organismos (Glosario CND)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_clientes_industriales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sigla TEXT UNIQUE NOT NULL,
        nombre_completo TEXT NOT NULL,
        sector_categoria TEXT
    );
    """)

    # 4. Subestaciones y Nodos del SEN
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_subestaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_cnd TEXT NOT NULL,
        nombre_normalizado TEXT NOT NULL,
        coord_x REAL NOT NULL,
        coord_y REAL NOT NULL,
        bbox_x0 REAL,
        bbox_y0 REAL,
        bbox_x1 REAL,
        bbox_y1 REAL,
        cuadrante_mural TEXT,
        clasificacion TEXT,
        tension_maxima_kv REAL,
        tension_minima_kv REAL,
        niveles_tension_lista TEXT,
        total_patios INTEGER DEFAULT 0,
        total_barras INTEGER DEFAULT 0,
        total_transformadores INTEGER DEFAULT 0,
        total_generadores INTEGER DEFAULT 0,
        total_reactivos INTEGER DEFAULT 0,
        capacidad_total_mva REAL DEFAULT 0,
        capacidad_total_mw REAL DEFAULT 0,
        capacidad_total_mvar REAL DEFAULT 0
    );
    """)

    # 5. Barras de Subestación (Barrajes Vectoriales)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_barras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subestacion_id INTEGER,
        subestacion_nombre TEXT,
        codigo_tension TEXT NOT NULL,
        tension_kv REAL NOT NULL,
        color_hex TEXT NOT NULL,
        grosor_pt REAL NOT NULL,
        orientacion TEXT,
        longitud_pt REAL,
        x0 REAL NOT NULL,
        y0 REAL NOT NULL,
        x1 REAL NOT NULL,
        y1 REAL NOT NULL,
        centro_x REAL NOT NULL,
        centro_y REAL NOT NULL,
        distancia_subestacion REAL,
        FOREIGN KEY(subestacion_id) REFERENCES cnd_subestaciones(id)
    );
    """)

    # 6. Transformadores de Potencia
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_transformadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subestacion_id INTEGER,
        subestacion_nombre TEXT,
        etiqueta_cruda TEXT,
        unidades_count INTEGER,
        mva_unitario REAL,
        mva_total REAL,
        coord_x REAL NOT NULL,
        coord_y REAL NOT NULL,
        distancia_subestacion REAL,
        FOREIGN KEY(subestacion_id) REFERENCES cnd_subestaciones(id)
    );
    """)

    # 7. Compensación Reactiva (Inductores y Capacitores)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_compensacion_reactiva (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subestacion_id INTEGER,
        subestacion_nombre TEXT,
        etiqueta_cruda TEXT,
        tipo_equipo TEXT,
        unidades_count INTEGER,
        mvar_unitario REAL,
        mvar_total REAL,
        coord_x REAL NOT NULL,
        coord_y REAL NOT NULL,
        distancia_subestacion REAL,
        FOREIGN KEY(subestacion_id) REFERENCES cnd_subestaciones(id)
    );
    """)

    # 8. Unidades de Generación (Plantas Hidro/Termo)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_generacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subestacion_id INTEGER,
        planta_nombre TEXT,
        etiqueta_cruda TEXT,
        detalle_maquinas TEXT,
        unidades_count INTEGER,
        mw_unitario REAL,
        mw_total REAL,
        tipo_fuente TEXT,
        coord_x REAL NOT NULL,
        coord_y REAL NOT NULL,
        distancia_subestacion REAL,
        FOREIGN KEY(subestacion_id) REFERENCES cnd_subestaciones(id)
    );
    """)

    # 9. Tramos y Líneas de Transmisión
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_lineas_tramos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_tension TEXT NOT NULL,
        tension_kv REAL NOT NULL,
        color_hex TEXT NOT NULL,
        grosor_pt REAL NOT NULL,
        tipo_geometria TEXT,
        x0 REAL NOT NULL,
        y0 REAL NOT NULL,
        x1 REAL NOT NULL,
        y1 REAL NOT NULL,
        longitud_aprox REAL,
        nodo_cercano_1 TEXT,
        distancia_nodo_1 REAL,
        nodo_cercano_2 TEXT,
        distancia_nodo_2 REAL
    );
    """)

    # 10. Rótulos Completos (Para Reconstrucción SVG / Software Autónomo)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cnd_rotulos_texto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        texto TEXT NOT NULL,
        x0 REAL NOT NULL,
        y0 REAL NOT NULL,
        x1 REAL NOT NULL,
        y1 REAL NOT NULL,
        centro_x REAL NOT NULL,
        centro_y REAL NOT NULL,
        fuente_nombre TEXT,
        fuente_tamano REAL,
        categoria TEXT
    );
    """)

    # Índices para búsqueda ultrarrápida
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_se_nombre ON cnd_subestaciones(nombre_normalizado);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_barras_se ON cnd_barras(subestacion_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_barras_kv ON cnd_barras(tension_kv);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trx_se ON cnd_transformadores(subestacion_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_react_se ON cnd_compensacion_reactiva(subestacion_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_gen_se ON cnd_generacion(subestacion_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_lineas_kv ON cnd_lineas_tramos(tension_kv);")

    conn.commit()


# ========================================================================================
# PIPELINE PRINCIPAL DE EXTRACCIÓN
# ========================================================================================

def run_extraction_pipeline():
    print("=" * 80)
    print("INICIANDO PIPELINE DE EXTRACCIÓN VECTORIAL CND SEN MAYO 2025")
    print("=" * 80)

    if not os.path.exists(PDF_PATH):
        print(f"ERROR CRÍTICO: No se localizó el archivo fuente en: {PDF_PATH}")
        sys.exit(1)

    print(f"Abriendo plano vectorial: {PDF_PATH} ...")
    doc = fitz.open(PDF_PATH)
    page = doc[0]
    rect = page.rect
    width_pt, height_pt = rect.width, rect.height
    width_mm = width_pt * 0.352778
    height_mm = height_pt * 0.352778

    print(f"Dimensiones Murales: {width_pt:.2f} x {height_pt:.2f} pt ({width_mm:.1f} x {height_mm:.1f} mm)")

    # Crear o reiniciar BD SQLite
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print(f"Base de datos previa eliminada para regeneración limpia: {DB_PATH}")
        except Exception as e:
            print(f"Aviso al limpiar BD: {e}")

    conn = sqlite3.connect(DB_PATH)
    init_database(conn)
    cursor = conn.cursor()

    # ------------------------------------------------------------------------------------
    # 1. Insertar Metadatos y Niveles de Tensión
    # ------------------------------------------------------------------------------------
    print("\n[Paso 1/7] Registrando metadatos institucionales y niveles de tensión...")
    cursor.execute("""
    INSERT INTO cnd_metadata (
        titulo, emisor, autor_dibujo, revisado_por, aprobado_por,
        fecha_emision, software_origen, ancho_pt, alto_pt, ancho_mm, alto_mm,
        total_bloques_texto, total_geometrias, fecha_extraccion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "Sistema Eléctrico Nacional Venezolano",
        "Centro Nacional de Despacho (CND - Despacho Nacional)",
        "Ing. Marco Ferreira",
        "Ing. Ulises Bellorín",
        "Ing. Darwin Briceño",
        "Mayo 2025",
        "Microsoft Visio 2019 / PDF 1.7 Vectorial",
        width_pt, height_pt, width_mm, height_mm,
        len(page.get_text("blocks")), len(page.get_drawings()),
        datetime.datetime.now().isoformat()
    ))

    for kv in COLOR_KV_MAP:
        cursor.execute("""
        INSERT INTO cnd_niveles_tension (
            codigo_tension, tension_kv, nombre_sistema, color_hex, color_rgb,
            grosor_nominal_pt, descripcion
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            kv["codigo"], kv["tension_kv"], kv["nombre"], kv["color_hex"],
            str(kv["rgb_target"]), kv["grosor_nominal"], kv["descripcion"]
        ))
    conn.commit()

    # ------------------------------------------------------------------------------------
    # 2. Extraer Glosario de Clientes Industriales
    # ------------------------------------------------------------------------------------
    print("[Paso 2/7] Extrayendo glosario de clientes industriales y organismos...")
    blocks = page.get_text("blocks")
    industrial_clients = []
    pat_acronym = re.compile(r'^([A-Z0-9\.\s-]{2,15})\s+([A-Z\u00C0-\u017F].+)$')

    for b in blocks:
        txt = b[4].strip()
        if "Sider" in txt or "Aluminio" in txt or "Ferrominera" in txt or "Hidrol" in txt:
            for line in txt.split('\n'):
                line = line.strip()
                m = pat_acronym.match(line)
                if m:
                    sigla = m.group(1).strip()
                    nombre = m.group(2).strip()
                    if len(sigla) <= 15 and not sigla.startswith("SISTEMA"):
                        categoria = "INDUSTRIAL"
                        if "HIDRO" in sigla:
                            categoria = "AGUA_POTABLE"
                        elif "METRO" in sigla or "IAFE" in sigla:
                            categoria = "TRANSPORTE"
                        elif "IVIC" in sigla or "BAMARI" in sigla or "CAVIM" in sigla:
                            categoria = "ESTATAL_DEFENSA"
                        elif "PDVSA" in sigla or "SINCOR" in sigla or "BITOR" in sigla or "TAEJ" in sigla:
                            categoria = "PETROLERO"
                        industrial_clients.append((sigla, nombre, categoria))

    for sigla, nombre, cat in set(industrial_clients):
        cursor.execute("""
        INSERT OR IGNORE INTO cnd_clientes_industriales (sigla, nombre_completo, sector_categoria)
        VALUES (?, ?, ?)
        """, (sigla, nombre, cat))
    conn.commit()
    print(f"  -> {len(set(industrial_clients))} Clientes y organismos registrados.")

    # ------------------------------------------------------------------------------------
    # 3. Extraer Barras de Subestación y Tramos de Líneas
    # ------------------------------------------------------------------------------------
    print("\n[Paso 3/7] Procesando 4.144 trazos vectoriales (Barras de Patio y Líneas)...")
    drawings = page.get_drawings()
    raw_barras = []
    line_segments = []

    for d in drawings:
        w = d.get('width', 0)
        rect = d.get('rect')
        col = d.get('color')
        if not rect or not w:
            continue

        rw, rh = rect.width, rect.height
        kv_info = match_voltage(col, w)

        # Barras de subestación: grosor >= 2.0 pt y forma lineal alargada
        if w >= 2.0:
            if (rw >= 14 and rh <= 10) or (rh >= 14 and rw <= 10):
                orient = "H" if rw > rh else "V"
                length = max(rw, rh)
                cx = (rect.x0 + rect.x1) / 2
                cy = (rect.y0 + rect.y1) / 2
                raw_barras.append({
                    "kv_info": kv_info,
                    "grosor": round(w, 2),
                    "orient": orient,
                    "length": round(length, 2),
                    "rect": rect,
                    "cx": cx,
                    "cy": cy
                })
        # Líneas de interconexión y tramos: grosor entre 0.9 y 1.9 pt
        elif 0.9 <= w <= 1.9:
            length = math.hypot(rw, rh)
            if length > 10:
                line_segments.append({
                    "kv_info": kv_info,
                    "grosor": round(w, 2),
                    "rect": rect,
                    "length": round(length, 2),
                    "cx": (rect.x0 + rect.x1) / 2,
                    "cy": (rect.y0 + rect.y1) / 2
                })

    print(f"  -> {len(raw_barras)} Barras de patio identificadas.")
    print(f"  -> {len(line_segments)} Tramos de líneas de interconexión detectados.")

    # ------------------------------------------------------------------------------------
    # 4. Clasificar Textos y Rótulos (Nodos S/E, MVA, MW, MVAr)
    # ------------------------------------------------------------------------------------
    print("\n[Paso 4/7] Clasificando 1.027 bloques de texto con coordenadas exactas...")
    substation_candidates = []
    raw_transformers = []
    raw_reactives = []
    raw_generators = []
    all_labels = []

    for b in blocks:
        raw_txt = b[4].strip()
        if not raw_txt:
            continue

        x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        txt_clean = normalize_text(raw_txt)

        # Rótulo general
        cat = "TEXTO_GENERAL"

        # Detección de MVA (Transformadores)
        if "MVA" in raw_txt and "MVAR" not in raw_txt.upper():
            trxs = parse_transformers(raw_txt)
            if trxs:
                cat = "EQUIPO_MVA"
                for t in trxs:
                    raw_transformers.append({
                        "raw": t["raw"],
                        "qty": t["qty"],
                        "unit_mva": t["unit_mva"],
                        "total_mva": t["total_mva"],
                        "cx": cx,
                        "cy": cy
                    })

        # Detección de MVAr (Reactores / Capacitores)
        elif "MVAR" in raw_txt.upper():
            comps = parse_reactive(raw_txt)
            if comps:
                cat = "REACTIVO_MVAR"
                for c in comps:
                    raw_reactives.append({
                        "raw": c["raw"],
                        "tipo": c["tipo"],
                        "qty": c["qty"],
                        "unit_mvar": c["unit_mvar"],
                        "total_mvar": c["total_mvar"],
                        "cx": cx,
                        "cy": cy
                    })

        # Detección de MW (Generación)
        elif "MW" in raw_txt:
            gens = parse_generators(raw_txt)
            if gens:
                cat = "GENERACION_MW"
                for g in gens:
                    raw_generators.append({
                        "raw": g["raw"],
                        "tag": g["machines_tag"],
                        "qty": g["qty"],
                        "unit_mw": g["unit_mw"],
                        "total_mw": g["total_mw"],
                        "cx": cx,
                        "cy": cy
                    })

        # Detección de Nodos / Subestaciones
        else:
            # Exclusión de palabras institucionales o leyendas
            is_excluded = False
            for token in EXCLUDE_SUBSTATION_TOKENS:
                if token in txt_clean.upper():
                    is_excluded = True
                    break

            if not is_excluded:
                # Validar si es mayúscula y longitud adecuada
                lines = [normalize_text(l) for l in raw_txt.split('\n') if normalize_text(l)]
                full_name = " ".join(lines)
                if len(full_name) >= 3 and full_name.isupper() and not re.match(r'^\d+$', full_name):
                    # Si no es un número y tiene longitud coherente
                    if len(full_name) < 40 and not any(c in full_name for c in ['=', '<', '>', '{', '}']):
                        cat = "SUBESTACION"
                        substation_candidates.append({
                            "nombre_cnd": full_name,
                            "raw": raw_txt,
                            "x0": x0, "y0": y0, "x1": x1, "y1": y1,
                            "cx": cx, "cy": cy
                        })

        all_labels.append((raw_txt, x0, y0, x1, y1, cx, cy, "Calibri", 10.0, cat))

    print(f"  -> {len(substation_candidates)} Rótulos de subestación detectados.")
    print(f"  -> {len(raw_transformers)} Bancos de transformación MVA procesados.")
    print(f"  -> {len(raw_reactives)} Bancos de reactivos MVAr extraídos.")
    print(f"  -> {len(raw_generators)} Grupos turbomotores MW catalogados.")

    # Guardar rótulos completos
    cursor.executemany("""
    INSERT INTO cnd_rotulos_texto (
        texto, x0, y0, x1, y1, centro_x, centro_y, fuente_nombre, fuente_tamano, categoria
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, all_labels)
    conn.commit()

    # ------------------------------------------------------------------------------------
    # 5. Agrupación Espacial y Consolidación de Subestaciones
    # ------------------------------------------------------------------------------------
    print("\n[Paso 5/7] Ejecutando algoritmo de agrupamiento espacial (Clustering de Patios)...")

    # Unificar rótulos idénticos o patios de una misma S/E (ej. LA ARENOSA 765, 400, 230, 115)
    se_clusters = defaultdict(list)
    for sc in substation_candidates:
        norm_name = strip_accents(sc["nombre_cnd"]).strip()
        norm_name = re.sub(r'^(HACIA\s+)', '', norm_name)  # Normalizar prefijo "HACIA"
        norm_name = norm_name.strip()
        se_clusters[norm_name].append(sc)

    # Fusionar 'PLANTA [X]' con '[X]' si están a menos de 180 pt de distancia en el plano
    # Ejemplo: 'PLANTA CARUACHI' con 'CARUACHI', 'PLANTA GURI' con 'GURI'
    clusters_to_merge = {}
    for name_norm, c_list in list(se_clusters.items()):
        if name_norm.startswith("PLANTA "):
            base_name = name_norm.replace("PLANTA ", "").strip()
            candidates = [k for k in se_clusters.keys() if (k == base_name or k.startswith(base_name)) and k != name_norm]
            p_cx = sum(item["cx"] for item in c_list) / len(c_list)
            p_cy = sum(item["cy"] for item in c_list) / len(c_list)
            for cand in candidates:
                cand_list = se_clusters[cand]
                c_cx = sum(item["cx"] for item in cand_list) / len(cand_list)
                c_cy = sum(item["cy"] for item in cand_list) / len(cand_list)
                if math.hypot(p_cx - c_cx, p_cy - c_cy) < 180:
                    clusters_to_merge[name_norm] = cand
                    break

    for plant_name, target_name in clusters_to_merge.items():
        se_clusters[target_name].extend(se_clusters[plant_name])
        del se_clusters[plant_name]
    print(f"  -> {len(clusters_to_merge)} Centrales fusionadas con sus patios de subestación adyacentes.")

    consolidated_substations = []
    substation_db_map = {}  # nombre_norm -> id_db

    for name_norm, c_list in sorted(se_clusters.items()):
        # Centroide ponderado del conjunto de patios
        avg_cx = sum(item["cx"] for item in c_list) / len(c_list)
        avg_cy = sum(item["cy"] for item in c_list) / len(c_list)
        min_x0 = min(item["x0"] for item in c_list)
        min_y0 = min(item["y0"] for item in c_list)
        max_x1 = max(item["x1"] for item in c_list)
        max_y1 = max(item["y1"] for item in c_list)

        cuadrante = assign_quadrant(avg_cx, avg_cy, width_pt, height_pt)
        clasificacion = "SUBESTACION_TRANSMISION"
        if "PLANTA" in name_norm or "CENTRAL" in name_norm or "GURI" in name_norm or "CARUACHI" in name_norm or "MACAGUA" in name_norm:
            clasificacion = "CENTRAL_GENERACION"
        elif "COLOMBIA" in name_norm or "BRASIL" in name_norm:
            clasificacion = "INTERCONEXION_INTERNACIONAL"

        cursor.execute("""
        INSERT INTO cnd_subestaciones (
            nombre_cnd, nombre_normalizado, coord_x, coord_y,
            bbox_x0, bbox_y0, bbox_x1, bbox_y1,
            cuadrante_mural, clasificacion, total_patios
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c_list[0]["nombre_cnd"], name_norm, avg_cx, avg_cy,
            min_x0, min_y0, max_x1, max_y1,
            cuadrante, clasificacion, len(c_list)
        ))
        se_id = cursor.lastrowid
        substation_db_map[name_norm] = {
            "id": se_id,
            "nombre": name_norm,
            "cx": avg_cx,
            "cy": avg_cy,
            "c_list": c_list,
            "barras": [],
            "trxs": [],
            "reacts": [],
            "gens": []
        }

    conn.commit()
    print(f"  -> {len(substation_db_map)} Nodos de Subestación únicos consolidados en el SEN.")

    # ------------------------------------------------------------------------------------
    # 6. Asociación Espacial de Barras, Transformadores, Reactivos y Generadores
    # ------------------------------------------------------------------------------------
    print("\n[Paso 6/7] Asociando barras, transformadores y generadores por proximidad euclidiana...")

    # Función para encontrar la subestación más cercana
    def find_nearest_substation(x, y, max_dist=250.0):
        best_se = None
        min_d = float('inf')
        for s_info in substation_db_map.values():
            # Comparar contra cada patio individual para máxima precisión
            for p in s_info["c_list"]:
                d = math.hypot(p["cx"] - x, p["cy"] - y)
                if d < min_d:
                    min_d = d
                    best_se = s_info
        if min_d <= max_dist:
            return best_se, min_d
        return None, min_d

    # A) Asociar Barras
    for b in raw_barras:
        se_match, dist = find_nearest_substation(b["cx"], b["cy"], max_dist=180.0)
        se_id = se_match["id"] if se_match else None
        se_name = se_match["nombre"] if se_match else None
        if se_match:
            se_match["barras"].append(b)

        cursor.execute("""
        INSERT INTO cnd_barras (
            subestacion_id, subestacion_nombre, codigo_tension, tension_kv,
            color_hex, grosor_pt, orientacion, longitud_pt,
            x0, y0, x1, y1, centro_x, centro_y, distancia_subestacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            se_id, se_name, b["kv_info"]["codigo"], b["kv_info"]["tension_kv"],
            b["kv_info"]["color_hex"], b["grosor"], b["orient"], b["length"],
            b["rect"].x0, b["rect"].y0, b["rect"].x1, b["rect"].y1,
            b["cx"], b["cy"], dist if se_match else None
        ))

    # B) Asociar Transformadores
    for t in raw_transformers:
        se_match, dist = find_nearest_substation(t["cx"], t["cy"], max_dist=200.0)
        se_id = se_match["id"] if se_match else None
        se_name = se_match["nombre"] if se_match else None
        if se_match:
            se_match["trxs"].append(t)

        cursor.execute("""
        INSERT INTO cnd_transformadores (
            subestacion_id, subestacion_nombre, etiqueta_cruda, unidades_count,
            mva_unitario, mva_total, coord_x, coord_y, distancia_subestacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            se_id, se_name, t["raw"], t["qty"], t["unit_mva"], t["total_mva"],
            t["cx"], t["cy"], dist if se_match else None
        ))

    # C) Asociar Compensación Reactiva
    for r in raw_reactives:
        se_match, dist = find_nearest_substation(r["cx"], r["cy"], max_dist=200.0)
        se_id = se_match["id"] if se_match else None
        se_name = se_match["nombre"] if se_match else None
        if se_match:
            se_match["reacts"].append(r)

        cursor.execute("""
        INSERT INTO cnd_compensacion_reactiva (
            subestacion_id, subestacion_nombre, etiqueta_cruda, tipo_equipo,
            unidades_count, mvar_unitario, mvar_total, coord_x, coord_y, distancia_subestacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            se_id, se_name, r["raw"], r["tipo"], r["qty"], r["unit_mvar"], r["total_mvar"],
            r["cx"], r["cy"], dist if se_match else None
        ))

    # D) Asociar Generación
    for g in raw_generators:
        se_match, dist = find_nearest_substation(g["cx"], g["cy"], max_dist=220.0)
        se_id = se_match["id"] if se_match else None
        se_name = se_match["nombre"] if se_match else None
        fuente = "HIDROELECTRICA" if any(h in (se_name or "") for h in ["GURI", "CARUACHI", "MACAGUA", "PAEZ", "CURUPAO"]) else "TERMOELECTRICA"
        if se_match:
            se_match["gens"].append(g)

        cursor.execute("""
        INSERT INTO cnd_generacion (
            subestacion_id, planta_nombre, etiqueta_cruda, detalle_maquinas,
            unidades_count, mw_unitario, mw_total, tipo_fuente, coord_x, coord_y, distancia_subestacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            se_id, se_name, g["raw"], g["tag"], g["qty"], g["unit_mw"], g["total_mw"],
            fuente, g["cx"], g["cy"], dist if se_match else None
        ))

    # E) Registrar Líneas de Transmisión con nodos extremos
    for line in line_segments:
        se1, d1 = find_nearest_substation(line["rect"].x0, line["rect"].y0, max_dist=120.0)
        se2, d2 = find_nearest_substation(line["rect"].x1, line["rect"].y1, max_dist=120.0)
        cursor.execute("""
        INSERT INTO cnd_lineas_tramos (
            codigo_tension, tension_kv, color_hex, grosor_pt, tipo_geometria,
            x0, y0, x1, y1, longitud_aprox,
            nodo_cercano_1, distancia_nodo_1, nodo_cercano_2, distancia_nodo_2
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            line["kv_info"]["codigo"], line["kv_info"]["tension_kv"], line["kv_info"]["color_hex"],
            line["grosor"], "linea", line["rect"].x0, line["rect"].y0, line["rect"].x1, line["rect"].y1,
            line["length"],
            se1["nombre"] if se1 else None, d1 if se1 else None,
            se2["nombre"] if se2 else None, d2 if se2 else None
        ))

    conn.commit()

    # ------------------------------------------------------------------------------------
    # 7. Actualizar Totales y Métricas por Subestación
    # ------------------------------------------------------------------------------------
    print("\n[Paso 7/7] Consolidando potencias y niveles de tensión en cada subestación...")
    for s_info in substation_db_map.values():
        barras = s_info["barras"]
        trxs = s_info["trxs"]
        reacts = s_info["reacts"]
        gens = s_info["gens"]

        kvs = sorted(list(set(b["kv_info"]["tension_kv"] for b in barras)), reverse=True)
        max_kv = kvs[0] if kvs else None
        min_kv = kvs[-1] if kvs else None
        kvs_str = ", ".join(f"{int(k) if k.is_integer() else k} kV" for k in kvs) if kvs else None

        tot_mva = sum(t["total_mva"] for t in trxs)
        tot_mvar = sum(r["total_mvar"] for r in reacts)
        tot_mw = sum(g["total_mw"] for g in gens)

        cursor.execute("""
        UPDATE cnd_subestaciones
        SET total_barras = ?,
            total_transformadores = ?,
            total_generadores = ?,
            total_reactivos = ?,
            capacidad_total_mva = ?,
            capacidad_total_mw = ?,
            capacidad_total_mvar = ?,
            tension_maxima_kv = ?,
            tension_minima_kv = ?,
            niveles_tension_lista = ?
        WHERE id = ?
        """, (
            len(barras), len(trxs), len(gens), len(reacts),
            tot_mva, tot_mw, tot_mvar, max_kv, min_kv, kvs_str,
            s_info["id"]
        ))

    conn.commit()

    # ------------------------------------------------------------------------------------
    # EXPORTACIÓN SQL Y JSON
    # ------------------------------------------------------------------------------------
    print("\nGenerando exportaciones adicionales...")

    # Export SQL Dump
    with open(SQL_DUMP_PATH, "w", encoding="utf-8") as f_sql:
        for line in conn.iterdump():
            f_sql.write(f"{line}\n")
    print(f"  -> Dump SQL generado: {SQL_DUMP_PATH} ({os.path.getsize(SQL_DUMP_PATH) / 1024:.1f} KB)")

    # Export JSON compacto para Visor Web
    cursor.execute("""
    SELECT id, nombre_normalizado, coord_x, coord_y, cuadrante_mural, clasificacion,
           tension_maxima_kv, tension_minima_kv, niveles_tension_lista,
           total_barras, total_transformadores, total_generadores,
           capacidad_total_mva, capacidad_total_mw, capacidad_total_mvar
    FROM cnd_subestaciones
    ORDER BY tension_maxima_kv DESC NULLS LAST, nombre_normalizado ASC
    """)
    se_rows = cursor.fetchall()

    export_data = {
        "metadata": {
            "titulo": "Sistema Eléctrico Nacional Venezolano - CND Mayo 2025",
            "autores": "Ing. Marco Ferreira, Ing. Ulises Bellorín, Ing. Darwin Briceño",
            "dimensiones_pt": [width_pt, height_pt],
            "dimensiones_mm": [width_mm, height_mm],
            "fecha_extraccion": datetime.datetime.now().isoformat()
        },
        "niveles_tension": COLOR_KV_MAP,
        "total_subestaciones": len(se_rows),
        "subestaciones": [
            {
                "id": r[0],
                "nombre": r[1],
                "x": round(r[2], 1),
                "y": round(r[3], 1),
                "cuadrante": r[4],
                "clasificacion": r[5],
                "max_kv": r[6],
                "min_kv": r[7],
                "tensiones": r[8],
                "barras": r[9],
                "transformadores": r[10],
                "generadores": r[11],
                "mva": r[12],
                "mw": r[13],
                "mvar": r[14]
            }
            for r in se_rows
        ]
    }

    with open(JSON_EXPORT_PATH, "w", encoding="utf-8") as f_json:
        json.dump(export_data, f_json, ensure_ascii=False, indent=2)
    print(f"  -> Export JSON para Visor Web generado: {JSON_EXPORT_PATH} ({os.path.getsize(JSON_EXPORT_PATH) / 1024:.1f} KB)")

    # ------------------------------------------------------------------------------------
    # AUDITORÍA DE RESULTADOS
    # ------------------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print("RESUMEN DE AUDITORÍA Y CALIDAD DE DATOS (ISO 8000)")
    print("=" * 80)

    cursor.execute("SELECT COUNT(*) FROM cnd_subestaciones;")
    cnt_se = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM cnd_barras;")
    cnt_barras = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM cnd_transformadores;")
    cnt_trx = cursor.fetchone()[0]
    cursor.execute("SELECT SUM(mva_total) FROM cnd_transformadores;")
    sum_mva = cursor.fetchone()[0] or 0.0
    cursor.execute("SELECT COUNT(*) FROM cnd_generacion;")
    cnt_gen = cursor.fetchone()[0]
    cursor.execute("SELECT SUM(mw_total) FROM cnd_generacion;")
    sum_mw = cursor.fetchone()[0] or 0.0
    cursor.execute("SELECT COUNT(*) FROM cnd_compensacion_reactiva;")
    cnt_react = cursor.fetchone()[0]
    cursor.execute("SELECT SUM(mvar_total) FROM cnd_compensacion_reactiva;")
    sum_mvar = cursor.fetchone()[0] or 0.0
    cursor.execute("SELECT COUNT(*) FROM cnd_lineas_tramos;")
    cnt_lines = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM cnd_clientes_industriales;")
    cnt_ind = cursor.fetchone()[0]

    if sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print(f"* Total Subestaciones Consolidadas:       {cnt_se} nodos")
    print(f"* Total Barras de Subestacion:             {cnt_barras} tramos")
    print(f"* Total Bancos de Transformacion:          {cnt_trx} bancos  (Total: {sum_mva:,.1f} MVA)")
    print(f"* Total Grupos de Generacion Turbomotriz:  {cnt_gen} bloques (Total: {sum_mw:,.1f} MW)")
    print(f"* Total Bancos de Compensacion Reactiva:   {cnt_react} bancos (Total: {sum_mvar:,.1f} MVAr)")
    print(f"* Total Tramos de Lineas de Interconexion: {cnt_lines} tramos")
    print(f"* Glosario Clientes Industriales / Org.:   {cnt_ind} empresas")
    print(f"* Base de Datos SQLite:                   {DB_PATH} ({os.path.getsize(DB_PATH) / 1024:.1f} KB)")
    print("=" * 80)
    print("EXTRACCION VECTORIAL COMPLETADA CON EXITO Y 100% AISLADA.")
    print("=" * 80)

    conn.close()


if __name__ == "__main__":
    run_extraction_pipeline()
