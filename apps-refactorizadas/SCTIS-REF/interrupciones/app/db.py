import psycopg2
import psycopg2.extras
import sqlite3
import os
import re
import json
import logging
from flask import g
from werkzeug.security import generate_password_hash
from app.config import Config

logger = logging.getLogger(__name__)

_use_sqlite = False
_sqlite_initialized = False
_sqlite_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'sctis_data.sqlite'))


def _ensure_sqlite_column(cur, table, col, col_type):
    cur.execute(f'PRAGMA table_info("{table}")')
    existing_cols = [r[1] for r in cur.fetchall()]
    if col not in existing_cols:
        cur.execute(f'ALTER TABLE "{table}" ADD COLUMN {col} {col_type}')


def _init_sqlite_tables(conn):
    global _sqlite_initialized
    if _sqlite_initialized:
        return
    cur = conn.cursor()

    # 1. user_roles
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.user_roles" (
            role_id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_code TEXT NOT NULL UNIQUE,
            role_name TEXT NOT NULL,
            description TEXT,
            priority INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_by TEXT
        );
    """)

    # 2. user_profiles
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.user_profiles" (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            email TEXT,
            full_name TEXT,
            role_id INTEGER NOT NULL REFERENCES "sctis.user_roles"(role_id),
            estado_codigo TEXT,
            estado_nombre TEXT,
            is_active INTEGER DEFAULT 1,
            last_login TEXT,
            password_changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            failed_attempts INTEGER DEFAULT 0,
            locked_until TEXT,
            firebase_uid TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_by TEXT
        );
    """)

    # Populate roles
    roles = [
        ('admin', 'Administrador', 'Acceso total al sistema', 100),
        ('editor', 'Editor', 'Puede crear y editar registros', 50),
        ('viewer', 'Consultor', 'Solo lectura de datos', 10),
        ('importer', 'Importador', 'Puede importar archivos Excel', 30)
    ]
    for r_code, r_name, r_desc, r_prio in roles:
        cur.execute('INSERT OR IGNORE INTO "sctis.user_roles" (role_code, role_name, description, priority) VALUES (?, ?, ?, ?)', (r_code, r_name, r_desc, r_prio))

    # Populate default users
    admin_role = cur.execute('SELECT role_id FROM "sctis.user_roles" WHERE role_code = "admin"').fetchone()
    admin_role_id = admin_role[0] if admin_role else 1

    users = [
        ('c_favio', generate_password_hash('Favio2026.'), 'Catherina Favio', admin_role_id),
        ('ggpd_admin', generate_password_hash('Lunes35.'), 'Administrador GgPD', admin_role_id),
        ('fullstack001', generate_password_hash('Lunes35.'), 'Full Stack Operator', admin_role_id),
        ('admin', generate_password_hash('password'), 'Administrador Sistema', admin_role_id),
    ]
    for u_name, u_hash, u_full, r_id in users:
        cur.execute('INSERT OR IGNORE INTO "sctis.user_profiles" (username, password_hash, full_name, role_id, is_active) VALUES (?, ?, ?, ?, 1)', (u_name, u_hash, u_full, r_id))

    # 3. causa & sub_causa & despachador & tipo_operacion
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.causa" (
            causa_id INTEGER PRIMARY KEY AUTOINCREMENT,
            causa_codigo TEXT NOT NULL UNIQUE,
            causa_nombre TEXT NOT NULL,
            descripcion TEXT,
            activo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT DEFAULT 'system',
            updated_by TEXT DEFAULT 'system'
        );
    """)

    causas_default = [
        ('MAN_MT', 'MANIOBRA EN LINEA MT', 'Maniobra operativa en línea de media tensión'),
        ('SC_FASE', 'SOBRECORRIENTE EN FASE', 'Disparo por sobrecorriente en fase'),
        ('SC_NEUTRO', 'SOBRECORRIENTE EN EL NEUTRO', 'Disparo por sobrecorriente en neutro'),
        ('PAC', 'PAC (Plan Administración de Carga)', 'Interrupción programada por PAC'),
        ('SIN_TENS_SE', 'SIN TENSION S/E 115 KV', 'Falta de tensión en subestación 115 kV'),
        ('SC_FN', 'SOBRECORRIENTE EN FASE Y NEUTRO', 'Disparo por sobrecorriente en fase y neutro'),
        ('FALLA_TIERRA', 'FALLA A TIERRA', 'Disparo por falla a tierra'),
        ('DANO_CABLE', 'DAÑO EN CABLE', 'Daño o rotura en conductor/cable de potencia'),
        ('DANO_POSTE', 'DAÑO EN POSTE', 'Poste chocado, fracturado o caído'),
        ('DANO_TRANSF', 'DAÑO EN TRANSFORMADOR', 'Avería en transformador de distribución/potencia'),
        ('ROBO_MAT', 'ROBO DE MATERIAL', 'Hurtos o sustracción de conductor/equipos'),
        ('OBRA_VIA', 'OBRA EN LA VIA', 'Interferencia por trabajos u obras viales'),
        ('CAIDA_ARBOL', 'CAIDA DE ARBOL', 'Caída de árbol o vegetación sobre la línea'),
        ('DESLIZ', 'DESLIZAMIENTO', 'Deslizamiento de tierra o deslave'),
        ('TORMENTA', 'HURACAN / TORMENTA', 'Condiciones atmosféricas extremas'),
        ('OTROS', 'OTROS', 'Otras causas no clasificadas')
    ]
    for c_code, c_name, c_desc in causas_default:
        cur.execute('INSERT OR IGNORE INTO "sctis.causa" (causa_codigo, causa_nombre, descripcion) VALUES (?, ?, ?)', (c_code, c_name, c_desc))

    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.sub_causa" (
            sub_causa_id INTEGER PRIMARY KEY AUTOINCREMENT,
            causa_id INTEGER REFERENCES "sctis.causa"(causa_id),
            sub_causa_codigo TEXT NOT NULL UNIQUE,
            sub_causa_nombre TEXT NOT NULL,
            descripcion TEXT,
            activo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT DEFAULT 'system',
            updated_by TEXT DEFAULT 'system'
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.despachador" (
            despachador_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_completo TEXT NOT NULL,
            cargo TEXT,
            activo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT DEFAULT 'system',
            updated_by TEXT DEFAULT 'system'
        );
    """)

    # 4. tira_interrupcion
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.tira_interrupcion" (
            tira_id INTEGER PRIMARY KEY AUTOINCREMENT,
            estado_codigo TEXT NOT NULL,
            subestacion_id INTEGER,
            circuito_id INTEGER,
            fecha_falla TEXT NOT NULL,
            sistema TEXT DEFAULT 'DISTRIBUCION',
            subestacion TEXT,
            circuito TEXT,
            jefatura TEXT,
            fecha_inicio TEXT,
            fecha_fin TEXT,
            causa TEXT,
            sub_causa TEXT,
            causa_id INTEGER,
            sub_causa_id INTEGER,
            observacion TEXT,
            r_ins TEXT,
            t_sc REAL,
            n_sc INTEGER,
            cto_bar TEXT,
            despachador TEXT,
            despachador_id INTEGER,
            racion INTEGER,
            mw REAL,
            kva REAL,
            duracion TEXT,
            horas REAL,
            duracion_calculada TEXT,
            horas_calculadas REAL,
            diferencia_horas REAL,
            estado_calculo TEXT,
            kva_x_h REAL,
            tti_cto REAL,
            mes TEXT,
            sectores TEXT,
            ciudad TEXT,
            activo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT DEFAULT 'system',
            updated_by TEXT DEFAULT 'system'
        );
    """)
    _ensure_sqlite_column(cur, "sctis.tira_interrupcion", "duracion_calculada", "TEXT")
    _ensure_sqlite_column(cur, "sctis.tira_interrupcion", "horas_calculadas", "REAL")
    _ensure_sqlite_column(cur, "sctis.tira_interrupcion", "diferencia_horas", "REAL")
    _ensure_sqlite_column(cur, "sctis.tira_interrupcion", "estado_calculo", "TEXT")
    _ensure_sqlite_column(cur, "sctis.tira_interrupcion", "es_excepcion_admin", "INTEGER DEFAULT 0")
    _ensure_sqlite_column(cur, "sctis.tira_interrupcion", "audit_id", "INTEGER")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.audit_admin_carga_excepcional" (
            audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            estado_codigo TEXT NOT NULL,
            filename TEXT,
            token TEXT,
            total_registros INTEGER DEFAULT 0,
            registros_incompletos INTEGER DEFAULT 0,
            declaracion_no_repudio TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.audit_descarga_datos" (
            download_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            formato TEXT NOT NULL,
            filtros_json TEXT,
            total_registros INTEGER DEFAULT 0,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 5. common.states & common.assets
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "common.states" (
            state_code TEXT PRIMARY KEY,
            state_name TEXT NOT NULL
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "common.assets" (
            asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_code TEXT,
            asset_name TEXT NOT NULL,
            asset_name_normalizado TEXT,
            asset_type TEXT NOT NULL,
            asset_subtype TEXT DEFAULT 'DISTRIBUCION',
            state_code TEXT,
            parent_id INTEGER,
            parent_asset_id INTEGER,
            voltage_kv REAL,
            classification TEXT DEFAULT 'INTERNO',
            source_process TEXT DEFAULT 'sctis_seed',
            status TEXT DEFAULT 'OPERATIVO',
            is_active INTEGER DEFAULT 1,
            elemento_tipo TEXT,
            elemento_codigo TEXT,
            created_by TEXT DEFAULT 'system',
            updated_by TEXT DEFAULT 'system',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    _ensure_sqlite_column(cur, "common.assets", "asset_name_normalizado", "TEXT")
    _ensure_sqlite_column(cur, "common.assets", "asset_subtype", "TEXT DEFAULT 'DISTRIBUCION'")
    _ensure_sqlite_column(cur, "common.assets", "parent_asset_id", "INTEGER")
    _ensure_sqlite_column(cur, "common.assets", "voltage_kv", "REAL")
    _ensure_sqlite_column(cur, "common.assets", "classification", "TEXT DEFAULT 'INTERNO'")
    _ensure_sqlite_column(cur, "common.assets", "source_process", "TEXT DEFAULT 'sctis_seed'")
    _ensure_sqlite_column(cur, "common.assets", "status", "TEXT DEFAULT 'OPERATIVO'")
    _ensure_sqlite_column(cur, "common.assets", "is_active", "INTEGER DEFAULT 1")
    _ensure_sqlite_column(cur, "common.assets", "elemento_tipo", "TEXT")
    _ensure_sqlite_column(cur, "common.assets", "elemento_codigo", "TEXT")

    # 6. sctis.asset_alias
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.asset_alias" (
            alias_id INTEGER PRIMARY KEY AUTOINCREMENT,
            estado_codigo TEXT NOT NULL,
            asset_type TEXT NOT NULL,
            alias_nombre TEXT NOT NULL,
            se_referencia TEXT DEFAULT '',
            asset_id INTEGER,
            usuario TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(estado_codigo, asset_type, alias_nombre, se_referencia)
        );
    """)

    # 7. sctis.asset_request
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.asset_request" (
            request_id INTEGER PRIMARY KEY AUTOINCREMENT,
            estado_codigo TEXT NOT NULL,
            asset_type TEXT NOT NULL,
            nombre_reportado TEXT NOT NULL,
            nombre_normalizado TEXT,
            se_referencia TEXT DEFAULT '',
            se_request_id INTEGER,
            voltage_kv REAL,
            filas_afectadas INTEGER DEFAULT 1,
            clasificacion TEXT,
            sugerencia_alias INTEGER,
            estado_request TEXT DEFAULT 'PENDIENTE',
            asset_creado_id INTEGER,
            submission_id INTEGER,
            requested_by TEXT,
            decided_by TEXT,
            decided_at TEXT,
            comentario TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(estado_codigo, asset_type, nombre_reportado, se_referencia)
        );
    """)

    # 8. sctis.formato_catalogo
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.formato_catalogo" (
            formato_id INTEGER PRIMARY KEY AUTOINCREMENT,
            formato_codigo TEXT NOT NULL UNIQUE,
            formato_nombre TEXT NOT NULL,
            estado_codigo TEXT,
            header_keywords TEXT,
            header_row INTEGER DEFAULT 1,
            data_start_row INTEGER DEFAULT 2,
            mapeo_columnas TEXT,
            reglas TEXT,
            campos_faltantes TEXT,
            activo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Seed initial formato_catalogo
    if True:
        catalog_formats = [
            (
                'F328', 'Formato F328 - Sistema Eléctrico', None,
                json.dumps(['NUM F328', 'FECHA INICIO', 'HORA INICIO', 'S/E', 'CIRCUITO', 'T.ASIG.', 'T.REP.', 'T.TOTAL', 'MVAMIN', 'REGION']),
                1, 2,
                json.dumps({
                    "S/E": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "BARRA / CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "FECHA INICIO": {"target": "fecha_inicio", "tipo": "fecha"},
                    "HORA INICIO": {"target": "hora_inicio", "tipo": "hora"},
                    "FECHA REP.": {"target": "fecha_fin", "tipo": "fecha"},
                    "HORA REP.": {"target": "hora_fin", "tipo": "hora"},
                    "T. REP.": {"target": "horas", "tipo": "duracion_a_horas"},
                    "T.TOTAL": {"target": "horas", "tipo": "duracion_a_horas"},
                    "MVAMIN REP.": {"target": "kva", "tipo": "mvamin_a_kva"},
                    "KVA PROM": {"target": "kva", "tipo": "numerico"},
                    "REGION": {"target": "sectores", "tipo": "texto"},
                    "ESTADO": {"target": "ciudad", "tipo": "texto"},
                    "MUNICIPIO": {"target": "sectores", "tipo": "texto"}
                }),
                json.dumps({
                    "sistema": "default=DISTRIBUCION",
                    "causa": "default=SIN CAUSA - F328",
                    "sub_causa": "default=NULL",
                    "observacion": "default=Formato F328 - sin observaciones",
                    "fecha_falla": "derivar_de_fecha_inicio"
                }),
                json.dumps(['causa', 'sub_causa', 'observacion'])
            ),
            (
                'TIRAS', 'Formato TIRAS Estándar', None,
                json.dumps(['FECHA', 'SISTEMA', 'S/E', 'CIRCUITO', 'CAUSA', 'SUB CAUSA', 'OBSERVACION', 'KVA']),
                1, 2,
                json.dumps({
                    "S/E": {"target": "subestacion", "tipo": "texto"},
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "FECHA INI": {"target": "fecha_inicio", "tipo": "fecha_hora"},
                    "FECHA FIN": {"target": "fecha_fin", "tipo": "fecha_hora"},
                    "SISTEMA": {"target": "sistema", "tipo": "texto"},
                    "CAUSA": {"target": "causa", "tipo": "texto"},
                    "SUB CAUSA": {"target": "sub_causa", "tipo": "texto"},
                    "OBSERVACION": {"target": "observacion", "tipo": "texto"},
                    "KVA": {"target": "kva", "tipo": "numerico"},
                    "DISTRITO": {"target": "ciudad", "tipo": "texto"},
                    "JEFATURA": {"target": "jefatura", "tipo": "texto"},
                    "C. SERVICIO": {"target": "jefatura", "tipo": "texto"},
                    "SECTORES": {"target": "sectores", "tipo": "texto"},
                    "CIUDAD": {"target": "ciudad", "tipo": "texto"},
                    "T. hh:mm: ss": {"target": "horas", "tipo": "duracion_a_horas"},
                    "T.HORAS": {"target": "horas", "tipo": "numerico"}
                }),
                json.dumps({"fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps([])
            ),
            (
                'AMAZONAS', 'Formato Tiras Amazonas', 'AMA',
                json.dumps(['CIRCUITO', 'DISTRITO', 'JEFATURA', 'FECHA INI', 'FECHA FIN', 'CAUSA', 'SUB CAUSA']),
                1, 2,
                json.dumps({
                    "S/E": {"target": "subestacion", "tipo": "texto"},
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "DISTRITO": {"target": "ciudad", "tipo": "texto"},
                    "JEFATURA": {"target": "jefatura", "tipo": "texto"},
                    "FECHA INI": {"target": "fecha_inicio", "tipo": "fecha_hora"},
                    "FECHA FIN": {"target": "fecha_fin", "tipo": "fecha_hora"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha_hora"},
                    "CAUSA": {"target": "causa", "tipo": "texto"},
                    "SUB CAUSA": {"target": "sub_causa", "tipo": "texto"},
                    "OBSERVACION": {"target": "observacion", "tipo": "texto"},
                    "KVA": {"target": "kva", "tipo": "numerico"}
                }),
                json.dumps({"sistema": "default=DISTRIBUCION", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps([])
            ),
            (
                'ANZOATEGUI', 'Formato Anzoátegui / Nesparta', None,
                json.dumps(['NRO. REGISTRO', 'CIRCUITOS', 'SUB ESTACION', 'FECHA DE APERTURA', 'MOTIVO DEL EVENTO', 'CAUSA DE LA FALLA']),
                1, 2,
                json.dumps({
                    "CIRCUITOS": {"target": "circuito", "tipo": "texto"},
                    "SUB ESTACION": {"target": "subestacion", "tipo": "texto"},
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "NOMBRE DEL CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "NO CIRCUITO": {"target": None, "tipo": "ignore"},
                    "FECHA DE APERTURA (DD/MM/AAAA HH:MI:SS)": {"target": "fecha_inicio", "tipo": "fecha_hora"},
                    "FECHA DE APERTURA": {"target": "fecha_inicio", "tipo": "fecha_hora"},
                    "MOTIVO DEL EVENTO": {"target": None, "tipo": "ignore"},
                    "SISTEMA": {"target": "sistema", "tipo": "texto"},
                    "DESCRIPCIÓN": {"target": "observacion", "tipo": "texto"},
                    "NOTA DE CIERRE": {"target": None, "tipo": "ignore"},
                    "CAUSA DE LA FALLA": {"target": "causa", "tipo": "texto"},
                    "CLASE DE EQUIPOS": {"target": None, "tipo": "ignore"},
                    "CONSECUENCIAS": {"target": None, "tipo": "ignore"},
                    "HORAS DE DURACIÓN": {"target": "horas", "tipo": "duracion_a_horas"},
                    "POBLACIÓN": {"target": "sectores", "tipo": "texto"},
                    "MES": {"target": "mes", "tipo": "texto"}
                }),
                json.dumps({"jefatura": "default=NULL", "senal": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['jefatura', 'senal'])
            ),
            (
                'CARABOBO', 'Formato Carabobo', None,
                json.dumps(['ESTADO', 'FECHA', 'SISTEMA', 'SUBESTACION', 'CIRCUITO', 'AMPERIOS', 'INICIO', 'FIN', 'DURACION']),
                2, 3,
                json.dumps({
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "CENTRO DE SERVICIO": {"target": "jefatura", "tipo": "texto"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "INICIO": {"target": "hora_inicio", "tipo": "hora"},
                    "FIN": {"target": "hora_fin", "tipo": "hora"},
                    "DURACION": {"target": "horas", "tipo": "duracion_a_horas"},
                    "AMPERIOS": {"target": None, "tipo": "ignore"},
                    "INS R": {"target": None, "tipo": "ignore"},
                    "INS S": {"target": None, "tipo": "ignore"},
                    "INS T": {"target": None, "tipo": "ignore"},
                    "INS N": {"target": None, "tipo": "ignore"}
                }),
                json.dumps({"sistema": "default=DISTRIBUCION", "causa": "default=NULL", "sub_causa": "default=NULL", "observacion": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['causa', 'sub_causa', 'observacion', 'senal', 'tti_cto'])
            ),
            (
                'CAPITAL', 'Formato Capital', None,
                json.dumps(['FECHA INICIO', 'SISTEMA', 'SUBESTACION', 'GENERADOR_SUBESTACION CIRCUITO', 'DURACION', 'KVA INTERRUMP']),
                2, 3,
                json.dumps({
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "GENERADOR_SUBESTACION CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "FECHA INICIO": {"target": "fecha_inicio", "tipo": "fecha"},
                    "HORA": {"target": "hora_inicio", "tipo": "hora"},
                    "SISTEMA": {"target": "sistema", "tipo": "texto"},
                    "DURACION": {"target": "horas", "tipo": "duracion_a_horas"},
                    "KVA INTERRUMP": {"target": "kva", "tipo": "numerico"},
                    "MVAMIN": {"target": None, "tipo": "ignore"},
                    "DESCRIPCION CAUSA": {"target": "causa", "tipo": "texto"},
                    "DESCRIPCION MATERIAL": {"target": "observacion", "tipo": "texto"},
                    "REGION": {"target": "sectores", "tipo": "texto"},
                    "ESTADO": {"target": "ciudad", "tipo": "texto"},
                    "SECTOR AFECTADO": {"target": "sectores", "tipo": "texto"}
                }),
                json.dumps({"sub_causa": "default=NULL", "senal": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['sub_causa', 'senal'])
            ),
            (
                'GUARICO_1', 'Formato Guárico (Variante 1)', None,
                json.dumps(['FECHA', 'CS DE SERVICIO', 'SUBESTACIÓN', 'CIRCUITO', 'TIPO DE RED', 'CARGA (KVA)', 'HORA DE APERTURA', 'HORA DE CIERRE']),
                2, 3,
                json.dumps({
                    "SUBESTACIÓN": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "CS DE SERVICIO": {"target": "jefatura", "tipo": "texto"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "HORA DE APERTURA": {"target": "hora_inicio", "tipo": "hora"},
                    "HORA DE CIERRE": {"target": "hora_fin", "tipo": "hora"},
                    "TIEMPO INTERRUPCIÓN": {"target": "horas", "tipo": "duracion_a_horas"},
                    "DURACION EN MIN": {"target": "horas", "tipo": "minutos_a_horas"},
                    "CARGA (KVA)": {"target": "kva", "tipo": "numerico"}
                }),
                json.dumps({"sistema": "default=DISTRIBUCION", "causa": "default=NULL", "sub_causa": "default=NULL", "observacion": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['causa', 'sub_causa', 'observacion', 'sectores', 'ciudad'])
            ),
            (
                'GUARICO_2', 'Formato Guárico (Variante 2)', None,
                json.dumps(['FECHA', 'SUBESTACIÓN', 'CIRCUITO', 'NOMENCLATURA', 'NIVEL TENSIÓN', 'HORA DE APERTURA', 'HORA DE CIERRE']),
                2, 3,
                json.dumps({
                    "SUBESTACIÓN": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "NOMENCLATURA": {"target": None, "tipo": "ignore"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "HORA DE APERTURA": {"target": "hora_inicio", "tipo": "hora"},
                    "HORA DE CIERRE": {"target": "hora_fin", "tipo": "hora"},
                    "TIEMPO INTERRUPCIÓN": {"target": "horas", "tipo": "duracion_a_horas"},
                    "NIVEL TENSIÓN (KV)": {"target": None, "tipo": "ignore"},
                    "CARGA (MW)": {"target": "kva", "tipo": "mw_a_kva"}
                }),
                json.dumps({"sistema": "default=DISTRIBUCION", "causa": "default=NULL", "sub_causa": "default=NULL", "observacion": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['causa', 'sub_causa', 'observacion', 'sectores', 'ciudad'])
            ),
            (
                'YARACUY', 'Formato Yaracuy', None,
                json.dumps(['MES', 'FECHA', 'CENTRO DE SERVICIO', 'SUB-ESTACION', 'CIRCUITO', 'DURACION', 'CAUSA']),
                2, 3,
                json.dumps({
                    "SUB-ESTACION": {"target": "subestacion", "tipo": "texto"},
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "CENTRO DE SERVICIO": {"target": "jefatura", "tipo": "texto"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "MES": {"target": "mes", "tipo": "texto"},
                    "DURACION": {"target": "horas", "tipo": "duracion_a_horas"},
                    "CARGA (A)": {"target": None, "tipo": "ignore"},
                    "CAUSA": {"target": "causa", "tipo": "texto"},
                    "(SUB-CAUSA)": {"target": "sub_causa", "tipo": "texto"},
                    "KV CIRCUITO": {"target": None, "tipo": "ignore"},
                    "TTI (F)": {"target": "tti_cto", "tipo": "numerico"},
                    "KVA-INTERR": {"target": "kva", "tipo": "numerico"},
                    "MUNICIPIO (INDICADOR)": {"target": "sectores", "tipo": "texto"}
                }),
                json.dumps({"observacion": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['observacion', 'ciudad'])
            ),
            (
                'ZULIA', 'Formato Zulia', None,
                json.dumps(['SUBESTACION', 'CIRCUITO', 'NOMENCLATURA', 'TENSION', 'CARGA', 'FECHA DE', 'HORA DE', 'TIEMPO', 'MWH']),
                1, 2,
                json.dumps({
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "NOMENCLATURA": {"target": None, "tipo": "ignore"},
                    "TENSION": {"target": None, "tipo": "ignore"},
                    "CARGA": {"target": "kva", "tipo": "numerico"},
                    "FECHA DE APERTURA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "HORA DE APERTURA": {"target": "hora_inicio", "tipo": "hora"},
                    "FECHA DE CIERRE": {"target": "fecha_fin", "tipo": "fecha"},
                    "HORA DE CIERRE": {"target": "hora_fin", "tipo": "hora"},
                    "TIEMPO": {"target": "horas", "tipo": "duracion_a_horas"},
                    "MWH (TTI)": {"target": "tti_cto", "tipo": "numerico"},
                    "TIPO": {"target": None, "tipo": "ignore"},
                    "OBSERVACION": {"target": "observacion", "tipo": "texto"},
                    "TIPO DE FALLA": {"target": "causa", "tipo": "texto"}
                }),
                json.dumps({"sistema": "default=DISTRIBUCION", "sub_causa": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['sub_causa', 'sectores', 'ciudad'])
            ),
            (
                'MIRANDA_TUY', 'Formato Miranda Tuy Barlovento', None,
                json.dumps(['S/E', 'CIRCUITO', 'NIVEL DE TENSION', 'SISTEMA', 'HORA INICIO', 'DURACION', 'CAUSA']),
                2, 3,
                json.dumps({
                    "S/E": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "SISTEMA": {"target": "sistema", "tipo": "texto"},
                    "HORA INICIO": {"target": "hora_inicio", "tipo": "hora"},
                    "HORA FINAL": {"target": "hora_fin", "tipo": "hora"},
                    "DURACION": {"target": "horas", "tipo": "duracion_a_horas"},
                    "DURACIÓN T-HORAS": {"target": "horas", "tipo": "numerico"},
                    "KVA PROM": {"target": "kva", "tipo": "numerico"},
                    "TTI": {"target": "tti_cto", "tipo": "numerico"},
                    "SEÑAL": {"target": "senal", "tipo": "texto"},
                    "CAUSA": {"target": "causa", "tipo": "texto"},
                    "SUB-CAUSA": {"target": "sub_causa", "tipo": "texto"},
                    "CARGA (MW)": {"target": "kva", "tipo": "mw_a_kva"},
                    "SECTORES": {"target": "sectores", "tipo": "texto"},
                    "CIUDAD": {"target": "ciudad", "tipo": "texto"},
                    "RACIÓN (AMP)": {"target": None, "tipo": "ignore"},
                    "NIVEL DE TENSION": {"target": None, "tipo": "ignore"}
                }),
                json.dumps({"jefatura": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps([])
            ),
            (
                'LARA', 'Formato Lara', None,
                json.dumps(['ID EVENTO', 'CENTRO DE SERVICIO', 'SUBESTACION', 'CIRCUITO', 'KVA INTERRUPIDOS', 'FECHA', 'DURACION', 'CAUSA DE LA FALLA']),
                4, 5,
                json.dumps({
                    "SUBESTACION": {"target": "subestacion", "tipo": "texto"},
                    "CIRCUITO": {"target": "circuito", "tipo": "texto"},
                    "CENTRO DE SERVICIO": {"target": "jefatura", "tipo": "texto"},
                    "RESPONSABLE": {"target": "sistema", "tipo": "texto"},
                    "FECHA": {"target": "fecha_inicio", "tipo": "fecha"},
                    "HORA": {"target": "hora_inicio", "tipo": "hora"},
                    "DURACION": {"target": "horas", "tipo": "duracion_a_horas"},
                    "TIEMPO EN SEGUNDOS": {"target": None, "tipo": "ignore"},
                    "KVA INTERRUPIDOS": {"target": "kva", "tipo": "numerico"},
                    "CAUSA DE LA FALLA": {"target": "causa", "tipo": "texto"},
                    "KV": {"target": None, "tipo": "ignore"},
                    "KVA*SEGUNDOS": {"target": None, "tipo": "ignore"},
                    "MES": {"target": "mes", "tipo": "texto"}
                }),
                json.dumps({"sub_causa": "default=NULL", "observacion": "default=NULL", "fecha_falla": "derivar_de_fecha_inicio"}),
                json.dumps(['sub_causa', 'observacion', 'senal', 'sectores', 'ciudad'])
            )
        ]
        cur.executemany("""
            INSERT OR REPLACE INTO "sctis.formato_catalogo"
                (formato_codigo, formato_nombre, estado_codigo, header_keywords, header_row, data_start_row, mapeo_columnas, reglas, campos_faltantes, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, catalog_formats)

    # 9. sctis.record_quality_scores & duplicate groups
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.record_quality_scores" (
            score_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tira_id INTEGER,
            estado_codigo TEXT,
            score_total REAL,
            detalles_json TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.duplicate_groups" (
            group_id INTEGER PRIMARY KEY AUTOINCREMENT,
            estado_codigo TEXT,
            total_duplicados INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.duplicate_members" (
            member_id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER REFERENCES "sctis.duplicate_groups"(group_id),
            tira_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    states = [
        ('ZUL', 'ZULIA'), ('CAR', 'CARABOBO'), ('MIR', 'MIRANDA'), ('ARA', 'ARAGUA'),
        ('ANZ', 'ANZOATEGUI'), ('LAR', 'LARA'), ('TAC', 'TACHIRA'), ('BOL', 'BOLIVAR'),
        ('FAL', 'FALCON'), ('DCA', 'DISTRITO CAPITAL'), ('SUC', 'SUCRE'), ('MON', 'MONAGAS'),
        ('POR', 'PORTUGUESA'), ('BAR', 'BARINAS'), ('MER', 'MERIDA'), ('TRU', 'TRUJILLO'),
        ('YAR', 'YARACUY'), ('GUA', 'GUARICO'), ('COJ', 'COJEDES'), ('NEV', 'NUEVA ESPARTA'),
        ('DEL', 'DELTA AMACURO'), ('AMA', 'AMAZONAS'), ('APU', 'APURE'), ('VAR', 'LA GUAIRA')
    ]
    for s_code, s_name in states:
        cur.execute('INSERT OR IGNORE INTO "common.states" (state_code, state_name) VALUES (?, ?)', (s_code, s_name))

    # Seed initial assets for key states including Amazonas
    sample_substations = [
        ('AMA', 'PUERTO AYACUCHO 115 KV', 'Puerto Ayacucho', 115.0, [
            'CENTRO', 'AEROPUERTO', 'SUR', 'SAN ENRIQUE', 'CATANIAPO', 'HIDROLOGICA', 'MONTE CARMELO'
        ]),
        ('AMA', 'SANARIAPO', 'Sanariapo', 13.8, ['SANARIAPO PUEBLO', 'EJE CARRETERO']),
        ('AMA', 'ATABAPO', 'San Fernando de Atabapo', 13.8, ['ATABAPO CENTRO', 'GUASARE']),
        ('BOL', 'MACAGUA', 'Macagua', 115.0, ['ALTA VISTA', 'UNARE', 'GUAYANA']),
        ('DCA', 'SANTA ROSA', 'Santa Rosa', 115.0, ['BELLAS ARTES', 'CENTRO', 'AV BARALT']),
        ('MIR', 'GUATIRE', 'Guatire', 115.0, ['CASTILLEJO', 'VILLA HEROICA', 'INTERCOMUNAL']),
        ('CAR', 'GUACARA', 'Guacara', 115.0, ['ZONA INDUSTRIAL', 'YAGUA', 'CIUDAD ALIANZA']),
        ('ZUL', 'MARACAIBO', 'Maracaibo', 115.0, ['5 DE JULIO', 'DELICIAS', 'BELLA VISTA']),
    ]
    for st_c, se_name, se_norm, volt, ctos in sample_substations:
        cur.execute("""
            INSERT OR IGNORE INTO "common.assets"
                (asset_code, asset_name, asset_name_normalizado, asset_type, asset_subtype, state_code, voltage_kv, is_active)
            VALUES (?, ?, ?, 'SUBSTATION', 'DISTRIBUCION', ?, ?, 1)
        """, (se_name, se_name, se_norm, st_c, volt))
        cur.execute('SELECT asset_id FROM "common.assets" WHERE asset_name = ? AND state_code = ? AND asset_type = "SUBSTATION"', (se_name, st_c))
        se_row = cur.fetchone()
        if se_row:
            se_id = se_row[0]
            for cto in ctos:
                cto_code = f"{se_name} :: {cto}"
                cur.execute("""
                    INSERT OR IGNORE INTO "common.assets"
                        (asset_code, asset_name, asset_name_normalizado, asset_type, state_code, parent_id, parent_asset_id, elemento_tipo, is_active)
                    VALUES (?, ?, ?, 'CIRCUITO', ?, ?, ?, 'CTO', 1)
                """, (cto_code, cto, cto, st_c, se_id, se_id))

    # 10. audit.access_log & audit.operation_log
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "audit.access_log" (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            schema_name TEXT,
            table_name TEXT,
            operation TEXT,
            row_count INTEGER,
            result TEXT,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 11. sctis.configuracion
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.configuracion" (
            clave TEXT PRIMARY KEY,
            valor TEXT,
            descripcion TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 12. sctis.tarea_pendiente
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.tarea_pendiente" (
            tarea_id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            estado_codigo TEXT NOT NULL,
            tipo_tarea TEXT DEFAULT 'INCOMPLETOS_SANEAMIENTO',
            submission_id INTEGER,
            descripcion TEXT,
            registros_total INTEGER DEFAULT 0,
            registros_ok INTEGER DEFAULT 0,
            registros_rechazados INTEGER DEFAULT 0,
            archivo_correccion TEXT,
            estado_tarea TEXT DEFAULT 'PENDIENTE',
            horas_limite INTEGER DEFAULT 72,
            alerta_enviada INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT
        );
    """)
    _ensure_sqlite_column(cur, "sctis.tarea_pendiente", "submission_id", "INTEGER")

    # 13. audit.submissions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "audit.submissions" (
            submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_code TEXT,
            state_code TEXT NOT NULL,
            source_filename TEXT,
            source_sheet TEXT,
            sheet_names TEXT,
            row_count INTEGER DEFAULT 0,
            accepted_count INTEGER DEFAULT 0,
            rejected_count INTEGER DEFAULT 0,
            validation_status TEXT DEFAULT 'SUCCESS',
            formato_codigo TEXT,
            ingested_by TEXT,
            ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
            correction_file TEXT,
            notes TEXT,
            filename TEXT,
            status TEXT DEFAULT 'SUCCESS'
        );
    """)
    _ensure_sqlite_column(cur, "audit.submissions", "process_code", "TEXT")
    _ensure_sqlite_column(cur, "audit.submissions", "source_filename", "TEXT")
    _ensure_sqlite_column(cur, "audit.submissions", "source_sheet", "TEXT")
    _ensure_sqlite_column(cur, "audit.submissions", "sheet_names", "TEXT")
    _ensure_sqlite_column(cur, "audit.submissions", "accepted_count", "INTEGER DEFAULT 0")
    _ensure_sqlite_column(cur, "audit.submissions", "rejected_count", "INTEGER DEFAULT 0")
    _ensure_sqlite_column(cur, "audit.submissions", "validation_status", "TEXT DEFAULT 'SUCCESS'")
    _ensure_sqlite_column(cur, "audit.submissions", "formato_codigo", "TEXT")
    _ensure_sqlite_column(cur, "audit.submissions", "correction_file", "TEXT")
    _ensure_sqlite_column(cur, "audit.submissions", "notes", "TEXT")

    conn.commit()
    _sqlite_initialized = True


def _sqlite_array_length(val, dim=1):
    if val is None:
        return 0
    if isinstance(val, (list, tuple)):
        return len(val)
    if isinstance(val, str):
        val = val.strip()
        if val.startswith('[') and val.endswith(']'):
            try:
                parsed = json.loads(val)
                if isinstance(parsed, list):
                    return len(parsed)
            except Exception:
                pass
        if val.startswith('{') and val.endswith('}'):
            items = val[1:-1].split(',')
            return len([i for i in items if i.strip()])
        return len(val.split(','))
    return 1


def _sqlite_split_part(string, delimiter, position):
    if string is None:
        return None
    try:
        parts = str(string).split(delimiter)
        pos = int(position)
        if 1 <= pos <= len(parts):
            return parts[pos - 1]
    except Exception:
        pass
    return ''


def _sqlite_date_part(part, date_val):
    if not date_val:
        return None
    try:
        dt_str = str(date_val)
        part = str(part).lower()
        if part in ('year', 'y'):
            return int(dt_str[:4])
        elif part in ('month', 'mon'):
            return int(dt_str[5:7])
        elif part in ('day', 'd'):
            return int(dt_str[8:10])
        elif part in ('hour', 'h'):
            return int(dt_str[11:13]) if len(dt_str) >= 13 else 0
        elif part in ('minute', 'm', 'min'):
            return int(dt_str[14:16]) if len(dt_str) >= 16 else 0
    except Exception:
        pass
    return 0


def _create_sqlite_connection():
    conn = sqlite3.connect(_sqlite_file_path, timeout=60.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=DELETE;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=60000;")

    # Register custom PostgreSQL compatibility functions in SQLite
    conn.create_function("array_length", 1, lambda v: _sqlite_array_length(v, 1))
    conn.create_function("array_length", 2, _sqlite_array_length)
    conn.create_function("split_part", 3, _sqlite_split_part)
    conn.create_function("date_part", 2, _sqlite_date_part)
    conn.create_function("greatest", -1, lambda *args: max([a for a in args if a is not None], default=None))
    conn.create_function("least", -1, lambda *args: min([a for a in args if a is not None], default=None))
    conn.create_function("concat", -1, lambda *args: "".join([str(a) for a in args if a is not None]))

    # Quick integrity validation
    cur = conn.cursor()
    cur.execute("PRAGMA quick_check;")
    res = cur.fetchone()
    if res and res[0] != 'ok':
        raise sqlite3.DatabaseError(f"Integrity check failed: {res[0]}")
    return conn


def _clean_sqlite_files():
    for ext in ['', '-wal', '-shm', '-journal']:
        fpath = _sqlite_file_path + ext
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
            except Exception as e:
                logger.warning(f"No se pudo eliminar {fpath}: {e}")


def get_db():
    global _use_sqlite, _sqlite_initialized
    if 'db' not in g:
        if not _use_sqlite:
            try:
                g.db = psycopg2.connect(Config.db_dsn(), connect_timeout=3)
                g.db.autocommit = False
                g.db_type = 'postgres'
                return g.db
            except Exception as err:
                logger.info("PostgreSQL host no disponible. Usando motor SQLite local.")
                _use_sqlite = True

        conn = None
        try:
            conn = _create_sqlite_connection()
            _init_sqlite_tables(conn)
        except (sqlite3.DatabaseError, sqlite3.OperationalError) as err:
            logger.error(f"Error en SQLite ({err}). Recreando archivo de base de datos...")
            _sqlite_initialized = False
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass
            _clean_sqlite_files()
            conn = _create_sqlite_connection()
            _init_sqlite_tables(conn)

        g.db = conn
        g.db_type = 'sqlite'

    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        try:
            if e is not None:
                db.rollback()
            else:
                db.commit()
        except Exception:
            pass
        try:
            db.close()
        except Exception:
            pass


def adapt_sql_for_sqlite(sql):
    # First unquote any schema.table references to prevent double quotes
    sql_adapted = re.sub(r'"(sctis|common|audit)\.([a-zA-Z0-9_]+)"', r'\1.\2', sql)
    # Quote schema dot table references in SQLite: sctis.user_profiles -> "sctis.user_profiles"
    sql_adapted = re.sub(r'\b(sctis|common|audit)\.([a-zA-Z0-9_]+)\b', r'"\1.\2"', sql_adapted)
    # Convert %s placeholders to ?
    sql_adapted = re.sub(r'%s', '?', sql_adapted)
    # Convert Postgres timestamps / functions
    sql_adapted = re.sub(r"timezone\('America/Caracas',\s*now\(\)\)", "CURRENT_TIMESTAMP", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r"\bnow\(\)", "CURRENT_TIMESTAMP", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r"\bILIKE\b", "LIKE", sql_adapted, flags=re.IGNORECASE)
    # Convert PostgreSQL IS NOT DISTINCT FROM / IS DISTINCT FROM
    sql_adapted = re.sub(r'\bIS\s+NOT\s+DISTINCT\s+FROM\b', 'IS', sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r'\bIS\s+DISTINCT\s+FROM\b', 'IS NOT', sql_adapted, flags=re.IGNORECASE)
    # Convert EXTRACT functions
    sql_adapted = re.sub(r'EXTRACT\s*\(\s*YEAR\s+FROM\s+([a-zA-Z0-9_\.]+)\s*\)', r"strftime('%Y', \1)", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r'EXTRACT\s*\(\s*HOUR\s+FROM\s+([a-zA-Z0-9_\.]+)\s*\)', r"CAST(strftime('%H', \1) AS INTEGER)", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r'EXTRACT\s*\(\s*MONTH\s+FROM\s+([a-zA-Z0-9_\.]+)\s*\)', r"CAST(strftime('%m', \1) AS INTEGER)", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r'EXTRACT\s*\(\s*DAY\s+FROM\s+([a-zA-Z0-9_\.]+)\s*\)', r"CAST(strftime('%d', \1) AS INTEGER)", sql_adapted, flags=re.IGNORECASE)
    # Remove Postgres type casts (e.g. ::timestamp, ::text, ::jsonb)
    sql_adapted = re.sub(r'::[a-zA-Z0-9_]+', '', sql_adapted)
    return sql_adapted


def commit_db():
    """Ejecuta commit explícito de la conexión activa."""
    if 'db' in g and g.db:
        try:
            g.db.commit()
        except Exception as e:
            logger.warning(f"Error en commit_db: {e}")


def query(sql, params=None, fetch=True, commit=True):
    conn = get_db()
    db_type = getattr(g, 'db_type', 'postgres')

    if db_type == 'postgres':
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            if fetch and cur.description:
                rows = cur.fetchall()
                if commit:
                    conn.commit()
                return rows
            if commit:
                conn.commit()
            return None
    else:
        adapted_sql = adapt_sql_for_sqlite(sql)
        cur = conn.cursor()
        cur.execute(adapted_sql, params or ())
        if fetch:
            rows = [dict(r) for r in cur.fetchall()]
            if commit:
                conn.commit()
            return rows
        if commit:
            conn.commit()
        return None


def query_one(sql, params=None):
    conn = get_db()
    db_type = getattr(g, 'db_type', 'postgres')

    if db_type == 'postgres':
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            row = cur.fetchone()
            conn.commit()
            return row
    else:
        adapted_sql = adapt_sql_for_sqlite(sql)
        cur = conn.cursor()
        cur.execute(adapted_sql, params or ())
        row = cur.fetchone()
        conn.commit()
        return dict(row) if row else None

