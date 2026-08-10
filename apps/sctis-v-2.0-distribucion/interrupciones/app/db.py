import psycopg2
import psycopg2.extras
import sqlite3
import os
import re
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
            asset_type TEXT,
            state_code TEXT,
            parent_id INTEGER
        );
    """)
    _ensure_sqlite_column(cur, "common.assets", "asset_name_normalizado", "TEXT")

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

    # 6. audit.access_log & audit.operation_log
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

    # 7. sctis.configuracion
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.configuracion" (
            clave TEXT PRIMARY KEY,
            valor TEXT,
            descripcion TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 8. sctis.tarea_pendiente
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "sctis.tarea_pendiente" (
            tarea_id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            estado_codigo TEXT NOT NULL,
            tipo_tarea TEXT DEFAULT 'INCOMPLETOS_SANEAMIENTO',
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

    # 9. audit.submissions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "audit.submissions" (
            submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_code TEXT NOT NULL,
            ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
            ingested_by TEXT,
            row_count INTEGER DEFAULT 0,
            filename TEXT,
            status TEXT DEFAULT 'SUCCESS'
        );
    """)

    conn.commit()
    _sqlite_initialized = True


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
                logger.info(f"PostgreSQL host no disponible. Usando motor SQLite local.")
                _use_sqlite = True

        try:
            conn = sqlite3.connect(_sqlite_file_path)
            conn.row_factory = sqlite3.Row
            _init_sqlite_tables(conn)
        except (sqlite3.DatabaseError, sqlite3.OperationalError) as err:
            logger.error(f"Error en SQLite ({err}). Recreando archivo de base de datos...")
            _sqlite_initialized = False
            try:
                if os.path.exists(_sqlite_file_path):
                    os.remove(_sqlite_file_path)
            except Exception:
                pass
            conn = sqlite3.connect(_sqlite_file_path)
            conn.row_factory = sqlite3.Row
            _init_sqlite_tables(conn)

        g.db = conn
        g.db_type = 'sqlite'

    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def adapt_sql_for_sqlite(sql):
    # First unquote any schema.table references to prevent double quotes
    sql_adapted = re.sub(r'"(sctis|common|audit)\.([a-zA-Z0-9_]+)"', r'\1.\2', sql)
    # Quote schema dot table references in SQLite: sctis.user_profiles -> "sctis.user_profiles"
    sql_adapted = re.sub(r'\b(sctis|common|audit)\.([a-zA-Z0-9_]+)\b', r'"\1.\2"', sql_adapted)
    # Convert %s placeholders to ?
    sql_adapted = re.sub(r'%s', '?', sql_adapted)
    # Convert Postgres timestamps / functions
    sql_adapted = re.sub(r"timezone\('America/Caracas',\s*now\(\)\)", "CURRENT_TIMESTAMP", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r"\bNOW\(\)", "CURRENT_TIMESTAMP", sql_adapted, flags=re.IGNORECASE)
    sql_adapted = re.sub(r"\bILIKE\b", "LIKE", sql_adapted, flags=re.IGNORECASE)
    # Remove Postgres type casts (e.g. ::timestamp, ::text)
    sql_adapted = re.sub(r'::[a-zA-Z0-9_]+', '', sql_adapted)
    # Remove RETURNING clauses for SQLite compatibility if simple insert
    sql_adapted = re.sub(r'\s+RETURNING\s+[a-zA-Z0-9_,\s]+$', '', sql_adapted, flags=re.IGNORECASE)
    return sql_adapted


def query(sql, params=None, fetch=True):
    conn = get_db()
    db_type = getattr(g, 'db_type', 'postgres')

    if db_type == 'postgres':
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            if fetch and cur.description:
                rows = cur.fetchall()
                conn.commit()
                return rows
            conn.commit()
            return None
    else:
        adapted_sql = adapt_sql_for_sqlite(sql)
        cur = conn.cursor()
        cur.execute(adapted_sql, params or ())
        if fetch:
            rows = [dict(r) for r in cur.fetchall()]
            conn.commit()
            return rows
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

