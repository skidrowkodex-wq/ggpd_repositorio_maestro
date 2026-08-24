#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD / INSFORGE-BK UNIFIED IAM DEPLOYER
Despliega la tabla maestra `core.mae_usuarios_sistema`, la vista semántica `public.v_usuarios_sistema`
y siembra el catálogo oficial de 37 usuarios normalizados en InsForge (ggpd-data-maestra-0002).
"""

import subprocess

DDL_SQL = """
-- 1. Crear tabla canónica de usuarios del sistema
CREATE TABLE IF NOT EXISTS core.mae_usuarios_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    google_email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    role_code VARCHAR(30) NOT NULL,            -- 'ADMINISTRADOR', 'GERENCIA', 'ESPECIALISTA', 'ANALISTA', 'OPERADOR', 'AUDITOR', 'VISOR_ESTADAL'
    estado_codigo VARCHAR(3) REFERENCES core.dim_estados(codigo_estado),
    unidad_organizativa VARCHAR(150),
    cargo VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVO',       -- 'ACTIVO', 'SUSPENDIDO', 'EN_REVISION'
    
    -- Matriz Booleana Granular de Acceso a Aplicaciones (SSO Matrix)
    permiso_sigi BOOLEAN DEFAULT TRUE,
    permiso_sctis BOOLEAN DEFAULT FALSE,
    permiso_scein BOOLEAN DEFAULT FALSE,
    permiso_scppe BOOLEAN DEFAULT FALSE,
    permiso_scmtp BOOLEAN DEFAULT FALSE,
    permiso_gdrive BOOLEAN DEFAULT FALSE,
    
    ultimo_acceso TIMESTAMPTZ,
    creado_por VARCHAR(50) DEFAULT 'SISTEMA',
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda ultrarrápida
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON core.mae_usuarios_sistema(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON core.mae_usuarios_sistema(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON core.mae_usuarios_sistema(role_code);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON core.mae_usuarios_sistema(estado_codigo);

-- 2. Crear vista semántica en esquema public
CREATE OR REPLACE VIEW public.v_usuarios_sistema AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.email,
    u.google_email,
    u.role_code,
    u.estado_codigo,
    e.nombre_estado,
    e.codigo_region,
    u.unidad_organizativa,
    u.cargo,
    u.status,
    u.permiso_sigi,
    u.permiso_sctis,
    u.permiso_scein,
    u.permiso_scppe,
    u.permiso_scmtp,
    u.permiso_gdrive,
    u.ultimo_acceso,
    u.fecha_creacion,
    u.ultima_actualizacion
FROM core.mae_usuarios_sistema u
LEFT JOIN core.dim_estados e ON e.codigo_estado = u.estado_codigo;
"""

USERS_DATA = [
    # --- ADMINISTRADORES Y ESPECIALISTAS NACIONALES ---
    {
        "username": "admin.ggpd",
        "full_name": "Administrador General GGPD",
        "email": "admin.ggpd@corpoelec.gob.ve",
        "google_email": "bk.ggpd.corpoelec@gmail.com",
        "password_hash": "admin2026!.",
        "role_code": "ADMINISTRADOR",
        "estado_codigo": None,
        "unidad": "Gerencia General de Planificación de Distribución",
        "cargo": "Administrador de Sistemas",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "yvan.cipiran",
        "full_name": "Yván M. Cipiran N.",
        "email": "yvan.cipiran@corpoelec.gob.ve",
        "google_email": "yvan.cipiran.ggpd@gmail.com",
        "password_hash": "Cipiran2026!.",
        "role_code": "ADMINISTRADOR",
        "estado_codigo": None,
        "unidad": "Equipo de Automatización e Ingeniería de Productos con IA",
        "cargo": "Líder de Arquitectura e Inteligencia Artificial",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "josue.pacheco",
        "full_name": "T.S.U. Josué Pacheco",
        "email": "j.pacheco@corpoelec.gob.ve",
        "google_email": "josue.pacheco.ggpd@gmail.com",
        "password_hash": "Pacheco2026!.",
        "role_code": "ADMINISTRADOR",
        "estado_codigo": None,
        "unidad": "Equipo de Automatización e Ingeniería de Productos con IA",
        "cargo": "Ingeniero de Automatización y Desarrollo",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "adrian.correa",
        "full_name": "Ing. Adrián Correa",
        "email": "a.correa@corpoelec.gob.ve",
        "google_email": "adrian.correa.ggpd@gmail.com",
        "password_hash": "Correa2026!.",
        "role_code": "GERENCIA",
        "estado_codigo": None,
        "unidad": "Gerencia General de Planificación de Distribución (GGPD)",
        "cargo": "Gerente General de Planificación de Distribución",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "catherina.favio",
        "full_name": "Catherina Favio",
        "email": "c.favio@corpoelec.gob.ve",
        "google_email": "catherina.favio.ggpd@gmail.com",
        "password_hash": "Favio2026!.",
        "role_code": "GERENCIA",
        "estado_codigo": None,
        "unidad": "División de Planificación de Distribución",
        "cargo": "Jefe de División de Planificación",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "jorge.jimenez",
        "full_name": "Ing. Jorge Jiménez",
        "email": "j.jimenez@corpoelec.gob.ve",
        "google_email": "jorge.jimenez.sen@gmail.com",
        "password_hash": "Jimenez2026!.",
        "role_code": "GERENCIA",
        "estado_codigo": None,
        "unidad": "Gerencia de Operaciones del SEN",
        "cargo": "Gerente de Operaciones",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "walter.prato",
        "full_name": "Walter Prato",
        "email": "w.prato@corpoelec.gob.ve",
        "google_email": "walter.prato.miranda@gmail.com",
        "password_hash": "Prato2026!.",
        "role_code": "ESPECIALISTA",
        "estado_codigo": "MIR",
        "unidad": "División de Planificación",
        "cargo": "Especialista de Planificación",
        "sigi": True, "sctis": False, "scein": False, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "jaime.bencomo",
        "full_name": "Jaime Bencomo",
        "email": "j.bencomo@corpoelec.gob.ve",
        "google_email": "jaime.bencomo.carabobo@gmail.com",
        "password_hash": "Bencomo2026!.",
        "role_code": "ESPECIALISTA",
        "estado_codigo": "CAR",
        "unidad": "Redes de Distribución / PRTSEN",
        "cargo": "Especialista de Redes",
        "sigi": True, "sctis": True, "scein": False, "scppe": True, "scmtp": True, "gdrive": True
    },
    {
        "username": "blanca.gonzalez",
        "full_name": "Blanca González",
        "email": "b.gonzalez@corpoelec.gob.ve",
        "google_email": "blanca.gonzalez.asistencia@gmail.com",
        "password_hash": "Gonzalez2026!.",
        "role_code": "ANALISTA",
        "estado_codigo": None,
        "unidad": "Asistencia de Gerencia General",
        "cargo": "Analista de Gestión",
        "sigi": True, "sctis": False, "scein": False, "scppe": False, "scmtp": True, "gdrive": False
    },
    {
        "username": "diana.rivero",
        "full_name": "Diana Rivero",
        "email": "d.rivero@corpoelec.gob.ve",
        "google_email": "diana.rivero.analisis@gmail.com",
        "password_hash": "Rivero2026!.",
        "role_code": "ANALISTA",
        "estado_codigo": None,
        "unidad": "Planificación y Control de Gestión",
        "cargo": "Analista de Estadísticas y Reportes",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": False
    },
    {
        "username": "carlos.mendoza",
        "full_name": "Carlos Mendoza",
        "email": "c.mendoza@corpoelec.gob.ve",
        "google_email": "carlos.mendoza.operador@gmail.com",
        "password_hash": "Mendoza2026!.",
        "role_code": "OPERADOR",
        "estado_codigo": "DCA",
        "unidad": "Centro de Despacho Capital",
        "cargo": "Operador de Despacho",
        "sigi": True, "sctis": True, "scein": False, "scppe": False, "scmtp": False, "gdrive": False
    },
    {
        "username": "marina.torres",
        "full_name": "Marina Torres",
        "email": "m.torres@corpoelec.gob.ve",
        "google_email": "marina.torres.auditoria@gmail.com",
        "password_hash": "Torres2026!.",
        "role_code": "AUDITOR",
        "estado_codigo": None,
        "unidad": "Unidad de Auditoría Interna y Cumplimiento Normativo",
        "cargo": "Auditora Líder ISO 27001 / COBIT",
        "sigi": True, "sctis": True, "scein": True, "scppe": True, "scmtp": True, "gdrive": True
    },

    # --- 25 COORDINACIONES ESTADALES (VISOR_ESTADAL) ---
    {"username": "distribucion.amazonas", "full_name": "Coordinación de Distribución Amazonas", "email": "distribucion.amazonas@corpoelec.gob.ve", "password_hash": "Amazonas2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "AMA"},
    {"username": "distribucion.anzoategui", "full_name": "Coordinación de Distribución Anzoátegui", "email": "distribucion.anzoategui@corpoelec.gob.ve", "password_hash": "Anzoategui2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "ANZ"},
    {"username": "distribucion.apure", "full_name": "Coordinación de Distribución Apure", "email": "distribucion.apure@corpoelec.gob.ve", "password_hash": "Apure2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "APU"},
    {"username": "distribucion.aragua", "full_name": "Coordinación de Distribución Aragua", "email": "distribucion.aragua@corpoelec.gob.ve", "password_hash": "Aragua2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "ARA"},
    {"username": "distribucion.barinas", "full_name": "Coordinación de Distribución Barinas", "email": "distribucion.barinas@corpoelec.gob.ve", "password_hash": "Barinas2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "BAR"},
    {"username": "distribucion.bolivar", "full_name": "Coordinación de Distribución Bolívar", "email": "distribucion.bolivar@corpoelec.gob.ve", "password_hash": "Bolivar2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "BOL"},
    {"username": "distribucion.carabobo", "full_name": "Coordinación de Distribución Carabobo", "email": "distribucion.carabobo@corpoelec.gob.ve", "password_hash": "Carabobo2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "CAR"},
    {"username": "distribucion.cojedes", "full_name": "Coordinación de Distribución Cojedes", "email": "distribucion.cojedes@corpoelec.gob.ve", "password_hash": "Cojedes2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "COJ"},
    {"username": "distribucion.deltaamacuro", "full_name": "Coordinación de Distribución Delta Amacuro", "email": "distribucion.deltaamacuro@corpoelec.gob.ve", "password_hash": "DeltaAmacuro2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "DEL"},
    {"username": "distribucion.distritocapital", "full_name": "Coordinación de Distribución Distrito Capital", "email": "distribucion.distritocapital@corpoelec.gob.ve", "password_hash": "Capital2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "DCA"},
    {"username": "distribucion.falcon", "full_name": "Coordinación de Distribución Falcón", "email": "distribucion.falcon@corpoelec.gob.ve", "password_hash": "Falcon2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "FAL"},
    {"username": "distribucion.guarico", "full_name": "Coordinación de Distribución Guárico", "email": "distribucion.guarico@corpoelec.gob.ve", "password_hash": "Guarico2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "GUA"},
    {"username": "distribucion.lara", "full_name": "Coordinación de Distribución Lara", "email": "distribucion.lara@corpoelec.gob.ve", "password_hash": "Lara2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "LAR"},
    {"username": "distribucion.merida", "full_name": "Coordinación de Distribución Mérida", "email": "distribucion.merida@corpoelec.gob.ve", "password_hash": "Merida2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "MER"},
    {"username": "distribucion.miranda", "full_name": "Coordinación de Distribución Miranda", "email": "distribucion.miranda@corpoelec.gob.ve", "password_hash": "Miranda2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "MIR"},
    {"username": "distribucion.monagas", "full_name": "Coordinación de Distribución Monagas", "email": "distribucion.monagas@corpoelec.gob.ve", "password_hash": "Monagas2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "MON"},
    {"username": "distribucion.nuevaesparta", "full_name": "Coordinación de Distribución Nueva Esparta", "email": "distribucion.nuevaesparta@corpoelec.gob.ve", "password_hash": "NuevaEsparta2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "NES"},
    {"username": "distribucion.portuguesa", "full_name": "Coordinación de Distribución Portuguesa", "email": "distribucion.portuguesa@corpoelec.gob.ve", "password_hash": "Portuguesa2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "POR"},
    {"username": "distribucion.sucre", "full_name": "Coordinación de Distribución Sucre", "email": "distribucion.sucre@corpoelec.gob.ve", "password_hash": "Sucre2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "SUC"},
    {"username": "distribucion.tachira", "full_name": "Coordinación de Distribución Táchira", "email": "distribucion.tachira@corpoelec.gob.ve", "password_hash": "Tachira2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "TAC"},
    {"username": "distribucion.trujillo", "full_name": "Coordinación de Distribución Trujillo", "email": "distribucion.trujillo@corpoelec.gob.ve", "password_hash": "Trujillo2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "TRU"},
    {"username": "distribucion.laguaira", "full_name": "Coordinación de Distribución La Guaira", "email": "distribucion.laguaira@corpoelec.gob.ve", "password_hash": "LaGuaira2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "LGU"},
    {"username": "distribucion.yaracuy", "full_name": "Coordinación de Distribución Yaracuy", "email": "distribucion.yaracuy@corpoelec.gob.ve", "password_hash": "Yaracuy2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "YAR"},
    {"username": "distribucion.zulia", "full_name": "Coordinación de Distribución Zulia", "email": "distribucion.zulia@corpoelec.gob.ve", "password_hash": "Zulia2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "ZUL"},
    {"username": "distribucion.esequibo", "full_name": "Coordinación de Distribución Guayana Esequiba", "email": "distribucion.esequibo@corpoelec.gob.ve", "password_hash": "Esequibo2026!.", "role_code": "VISOR_ESTADAL", "estado_codigo": "GEQ"}
]

def run_query(sql):
    res = subprocess.run(['npx', '@insforge/cli', 'db', 'query', sql], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"❌ Error ejecutando SQL: {res.stderr}")
        return False
    print(res.stdout)
    return True

def main():
    print("================================================================================")
    print("⚡ DESPLEGANDO MOTOR UNIFICADO IAM EN INSFORGE (insforge-bk)")
    print("================================================================================")
    
    print("\n1. Creando tablas y vistas en InsForge...")
    if not run_query(DDL_SQL):
        return

    print("\n2. Preparando inserción / UPSERT de los 37 usuarios normalizados...")
    insert_statements = []
    for u in USERS_DATA:
        google_email = f"'{u.get('google_email')}'" if u.get('google_email') else "NULL"
        estado_codigo = f"'{u['estado_codigo']}'" if u.get('estado_codigo') else "NULL"
        unidad = f"'{u.get('unidad', 'Coordinación Estadal de Distribución')}'"
        cargo = f"'{u.get('cargo', 'Coordinador Estadal de Distribución')}'"
        
        sigi = "TRUE" if u.get('sigi', True) else "FALSE"
        sctis = "TRUE" if u.get('sctis', False) else "FALSE"
        scein = "TRUE" if u.get('scein', False) else "FALSE"
        scppe = "TRUE" if u.get('scppe', False) else "FALSE"
        scmtp = "TRUE" if u.get('scmtp', False) else "FALSE"
        gdrive = "TRUE" if u.get('gdrive', False) else "FALSE"
        
        sql = f"""
        INSERT INTO core.mae_usuarios_sistema (
            username, full_name, email, google_email, password_hash,
            role_code, estado_codigo, unidad_organizativa, cargo, status,
            permiso_sigi, permiso_sctis, permiso_scein, permiso_scppe, permiso_scmtp, permiso_gdrive
        ) VALUES (
            '{u['username']}', '{u['full_name']}', '{u['email']}', {google_email}, '{u['password_hash']}',
            '{u['role_code']}', {estado_codigo}, {unidad}, {cargo}, 'ACTIVO',
            {sigi}, {sctis}, {scein}, {scppe}, {scmtp}, {gdrive}
        )
        ON CONFLICT (username) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            google_email = EXCLUDED.google_email,
            password_hash = EXCLUDED.password_hash,
            role_code = EXCLUDED.role_code,
            estado_codigo = EXCLUDED.estado_codigo,
            unidad_organizativa = EXCLUDED.unidad_organizativa,
            cargo = EXCLUDED.cargo,
            permiso_sigi = EXCLUDED.permiso_sigi,
            permiso_sctis = EXCLUDED.permiso_sctis,
            permiso_scein = EXCLUDED.permiso_scein,
            permiso_scppe = EXCLUDED.permiso_scppe,
            permiso_scmtp = EXCLUDED.permiso_scmtp,
            permiso_gdrive = EXCLUDED.permiso_gdrive,
            ultima_actualizacion = NOW();
        """
        insert_statements.append(sql.strip())
        
    full_batch_sql = "\n".join(insert_statements)
    
    print(f"Ejecutando lote de {len(insert_statements)} usuarios...")
    if run_query(full_batch_sql):
        print("✅ 37 usuarios normalizados sembrados exitosamente en InsForge.")
        
    print("\n3. Verificando conteo total en InsForge...")
    run_query("SELECT role_code, count(*) FROM core.mae_usuarios_sistema GROUP BY role_code ORDER BY count(*) DESC;")

if __name__ == "__main__":
    main()
