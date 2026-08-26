#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD / INSFORGE AI MEMORY DEPLOYER & SYNC
Despliega y sincroniza la Base de Conocimiento y Memoria de IA en la base de datos
dedicada de InsForge: `insforge-base-conocimientos-automatizacion`.

Base de datos:
postgresql://postgres:***REMOVED***@jd3uejbz.ap-southeast.database.insforge.app:5432/insforge?sslmode=require
"""

import json
import os
import re
import psycopg2
from psycopg2.extras import Json

DB_URI = "postgresql://postgres:***REMOVED***@jd3uejbz.ap-southeast.database.insforge.app:5432/insforge?sslmode=require"

SCHEMA_DDL = """
-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. ESQUEMA DEDICADO DE CONOCIMIENTO
CREATE SCHEMA IF NOT EXISTS knowledge;

-- 3. TABLA DE HECHOS ATÓMICOS L1
CREATE TABLE IF NOT EXISTS knowledge.mae_hechos_l1 (
    id VARCHAR(100) PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    clave VARCHAR(100) NOT NULL,
    valor_texto TEXT,
    valor_json JSONB,
    descripcion TEXT,
    vigente BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE DECISIONES ARQUITECTURALES Y DICTÁMENES L2
CREATE TABLE IF NOT EXISTS knowledge.mae_decisiones_l2 (
    id VARCHAR(100) PRIMARY KEY,
    codigo_documento VARCHAR(50),
    titulo TEXT NOT NULL,
    escenario TEXT NOT NULL,
    decision TEXT NOT NULL,
    justificacion_normativa TEXT,
    impacto_sistemas TEXT[],
    fecha_decision DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(30) DEFAULT 'APROBADO_VIGENTE',
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE DOCUMENTOS Y CHUNKS RAG L3
CREATE TABLE IF NOT EXISTS knowledge.mae_documentos_rag (
    id VARCHAR(100) PRIMARY KEY,
    documento_origen VARCHAR(255) NOT NULL,
    seccion VARCHAR(255) NOT NULL,
    chunk_index INT DEFAULT 0,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT,
    tags TEXT[],
    tsv_contenido TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_rag_tsv ON knowledge.mae_documentos_rag USING gin (tsv_contenido);
CREATE INDEX IF NOT EXISTS idx_doc_rag_doc ON knowledge.mae_documentos_rag (documento_origen);

-- Función y Trigger para actualización automática de tsvector
CREATE OR REPLACE FUNCTION knowledge.fn_update_doc_tsv()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tsv_contenido := to_tsvector('spanish', coalesce(NEW.titulo, '') || ' ' || coalesce(NEW.contenido, '') || ' ' || coalesce(NEW.resumen, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doc_rag_tsv ON knowledge.mae_documentos_rag;
CREATE TRIGGER trg_doc_rag_tsv
BEFORE INSERT OR UPDATE ON knowledge.mae_documentos_rag
FOR EACH ROW EXECUTE FUNCTION knowledge.fn_update_doc_tsv();

-- 6. TABLA DE GRAFO DE CÓDIGO Y DEPENDENCIAS L4
CREATE TABLE IF NOT EXISTS knowledge.mae_grafo_codigo (
    id VARCHAR(100) PRIMARY KEY,
    aplicacion VARCHAR(50) NOT NULL,
    tipo_nodo VARCHAR(50) NOT NULL,
    nombre_nodo VARCHAR(200) NOT NULL,
    ruta_archivo TEXT,
    puerto INT,
    descripcion TEXT,
    dependencias_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE SESIONES DE HANDOFF Y CONTINUIDAD L5
CREATE TABLE IF NOT EXISTS knowledge.mae_sesiones_handoff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_sesion TIMESTAMPTZ DEFAULT NOW(),
    version_repositorio VARCHAR(50),
    resumen_ejecutivo TEXT NOT NULL,
    tareas_completadas JSONB NOT NULL DEFAULT '[]'::jsonb,
    proximas_acciones JSONB NOT NULL DEFAULT '[]'::jsonb,
    agente_emisor VARCHAR(100) DEFAULT 'Antigravity IDE 2.0 (Gemini 3.7 Flash)',
    commit_sha VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VISTAS SEMÁNTICAS PÚBLICAS
CREATE OR REPLACE VIEW public.v_knowledge_hechos_activos AS
SELECT id, categoria, clave, valor_texto, valor_json, descripcion
FROM knowledge.mae_hechos_l1
WHERE vigente = TRUE;

CREATE OR REPLACE VIEW public.v_knowledge_decisiones_activas AS
SELECT id, codigo_documento, titulo, escenario, decision, justificacion_normativa, impacto_sistemas, fecha_decision
FROM knowledge.mae_decisiones_l2
WHERE estado = 'APROBADO_VIGENTE'
ORDER BY fecha_decision DESC;

CREATE OR REPLACE VIEW public.v_knowledge_grafo_resumen AS
SELECT aplicacion, tipo_nodo, count(*) as total_elementos
FROM knowledge.mae_grafo_codigo
GROUP BY aplicacion, tipo_nodo
ORDER BY aplicacion, tipo_nodo;
"""

def init_database():
    print("🔌 Conectando a InsForge PostgreSQL (insforge-base-conocimientos-automatizacion)...")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("🔨 Creando esquemas, extensiones y tablas...")
    cur.execute(SCHEMA_DDL)
    print("✅ Esquema `knowledge` y vistas semánticas creadas exitosamente.")
    
    conn.close()

def seed_l1_facts():
    print("\n📦 Sembrando Hechos Atómicos L1...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    # Load memory_hub.json
    memory_path = os.path.join(os.path.dirname(__file__), "..", ".agents", "memory", "memory_hub.json")
    with open(memory_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    facts = data.get("memory_layers", {}).get("L1_ATOMIC_FACTS", {})
    
    records = [
        ("fact_ports", "INFRAESTRUCTURA", "puertos_aplicaciones", None, facts.get("ports"), "Puertos de red locales asignados a las 6 aplicaciones y portal"),
        ("fact_urls", "PRODUCCION", "urls_vibehost_produccion", None, facts.get("production_urls"), "URLs públicas de producción desplegadas en VibeHost"),
        ("fact_schemas", "BASE_DATOS", "esquemas_db_insforge", None, {"schemas": facts.get("database_schemas")}, "Esquemas canónicos desacoplados en InsForge PostgreSQL"),
        ("fact_targets_2026", "METAS_SEN", "metas_nacionales_2026", None, facts.get("targets_2026"), "Metas numéricas 2026 oficiales de 1er y 2do Nivel (DOC-GGPD-2026-METAS-001)"),
        ("fact_assets_subestaciones", "ACTIVOS_SEN", "subestaciones_normalizadas", "871", {"total": 871, "schema": "core.mae_subestaciones"}, "Parque nacional unificado de Subestaciones eléctricas"),
        ("fact_assets_circuitos", "ACTIVOS_SEN", "circuitos_normalizados", "4207", {"total": 4207, "schema": "core.mae_circuitos"}, "Total de circuitos de distribución de media tensión (13.8kV / 34.5kV)"),
        ("fact_hardware_profile", "HARDWARE", "perfil_computo_local", "Dell Latitude 3110 (3.7 GB RAM)", {"zero_ram_daemon": True}, "Especificación de hardware para evitar sobrecarga local")
    ]
    
    query = """
    INSERT INTO knowledge.mae_hechos_l1 (id, categoria, clave, valor_texto, valor_json, descripcion, vigente)
    VALUES (%s, %s, %s, %s, %s, %s, TRUE)
    ON CONFLICT (id) DO UPDATE SET
        valor_texto = EXCLUDED.valor_texto,
        valor_json = EXCLUDED.valor_json,
        descripcion = EXCLUDED.descripcion,
        updated_at = NOW();
    """
    
    for r in records:
        cur.execute(query, (r[0], r[1], r[2], r[3], Json(r[4]) if r[4] is not None else None, r[5]))
    
    conn.commit()
    conn.close()
    print(f"✅ {len(records)} Hechos Atómicos L1 registrados.")

def seed_l2_decisions():
    print("\n📦 Sembrando Decisiones Arquitecturales y Dictámenes L2...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    decisions = [
        (
            "dec_diag_proc_001",
            "DOC-GGPD-2026-DIAG-PROC-001",
            "Diagnóstico Forense de Procesos & Deconstrucción de repo_ggc",
            "Auditoría sobre 1,400 archivos y 285 carpetas heredadas con sesgo de ex-operadoras y datos fragmentados.",
            "Erradicar el sesgo histórico de ex-operadoras (EDELCA, CADAFE, ELECAR, ENELVEN, ENELBAR) y consolidar el inventario unificado en `core.mae_subestaciones` (871) y `core.mae_circuitos` (4,207). Desacoplar las 6 aplicaciones del Repositorio Maestro.",
            "ISO 8000-110 (Calidad de Datos Maestros), ISO 55000 (Gestión de Activos)",
            ["SIGI", "SCTIS", "SCMTP", "SCPPE", "SCEIN", "SCGCC"],
            "2026-08-26"
        ),
        (
            "dec_metas_2026_001",
            "DOC-GGPD-2026-METAS-001",
            "Marco Lógico y Metrología de Metas SEN 2026",
            "Confusión histórica entre indicadores de calidad de servicio (efectos en el usuario) y acciones de mantenimiento preventivo (causas operativas).",
            "Separación matemática estricta: 1er Nivel (Confiabilidad: TTI <= 42.79 h, FMI <= 42.49 int, NDI <= 150,347 fallas, DPI <= 1.01 h) vs 2do Nivel (Mantenimiento: AP=60,808 lum, PP=64,162 km, SE=415 SEs, MT=965 circuitos, BT=7,114 sectores). Fórmula de criticidad MIMT Pareto 60%.",
            "ISO 9001 (Control de Gestión), Memorandos GGP-M-001 al 024",
            ["SIGI", "SCTIS", "SCPPE", "SCMTP"],
            "2026-08-25"
        ),
        (
            "dec_gob_software_001",
            "DOC-GGPD-2026-GOB-001",
            "Dictamen Técnico de Gobernanza de Software y Cierre de Canales Informales",
            "Propuestas de construir una 'Super-App' gerencial monolítica y uso extendido de WhatsApp para reportes operativos críticos.",
            "Prohibición taxativa de la 'Super-App'. Segregación de dominios de control bajo ISACA COBIT 2019. Cierre de canales informales: 'Lo que no está en InsForge PostgreSQL, NO EXISTE'. Flujo desacoplado y trazable: SIGI (Torre BI) -> SCMTP (Workflow 72h) -> SCGCC (Oficios/Memorandos con Hash QR).",
            "ISACA COBIT 2019 (MEA02), ISO 27001:2022 (A.8.12 Prevención Fuga de Datos), ISO 15489",
            ["SIGI", "SCMTP", "SCGCC"],
            "2026-08-26"
        ),
        (
            "dec_insforge_unification",
            "DOC-GGPD-2026-MIGR-001",
            "Migración Completa de Supabase a InsForge BaaS & VibeHost",
            "Fragmentación en Supabase y múltiples endpoints aislados con mock data.",
            "Desconexión total de Supabase. Conexión 100% nativa de las 6 aplicaciones al BaaS InsForge PostgreSQL (ggpd-data-maestra-0002) y despliegue automatizado a VibeHost con estatus HEALTHY.",
            "ISO/IEC 27001 (RLS y Cifrado), OWASP ASVS v4.0 Level 2",
            ["SIGI", "SCTIS", "SCMTP", "SCPPE", "SCEIN", "SCGCC"],
            "2026-08-24"
        ),
        (
            "dec_login_standard",
            "DOC-GGPD-2026-SEC-001",
            "Estándar Unificado de Zona Segura de Grado Industrial SEN",
            "Diseños heterogéneos de pantallas de autenticación con tarjetas rígidas y vulnerabilidades UX.",
            "Homologación de Login Convencional Limpio con Pill pulsante esmeralda 'ZONA SEGURA CIFRADA · ISO 27001 · OWASP ASVS', Sello SEN 2026 y barra técnica superior en todas las 6 apps.",
            "OWASP ASVS v4.0 Level 2, ISO/IEC 27001:2022",
            ["SIGI", "SCTIS", "SCMTP", "SCPPE", "SCEIN", "SCGCC"],
            "2026-08-23"
        )
    ]
    
    query = """
    INSERT INTO knowledge.mae_decisiones_l2 (
        id, codigo_documento, titulo, escenario, decision, justificacion_normativa,
        impacto_sistemas, fecha_decision, estado
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'APROBADO_VIGENTE')
    ON CONFLICT (id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        escenario = EXCLUDED.escenario,
        decision = EXCLUDED.decision,
        justificacion_normativa = EXCLUDED.justificacion_normativa,
        impacto_sistemas = EXCLUDED.impacto_sistemas,
        updated_at = NOW();
    """
    
    for d in decisions:
        cur.execute(query, d)
        
    conn.commit()
    conn.close()
    print(f"✅ {len(decisions)} Decisiones Arquitecturales L2 sembradas.")

def seed_l3_documents():
    print("\n📦 Sembrando Documentos y Chunks RAG L3...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    docs_to_ingest = [
        ("docs/analisis_metas_2026.md", "DOC-GGPD-2026-METAS-001", ["METAS", "CALIDAD_SERVICIO", "MANTENIMIENTO", "ISO_9001"]),
        ("docs/dictamen_gobernanza_software_distribucion_2026.md", "DOC-GGPD-2026-GOB-001", ["GOBERNANZA", "COBIT_2019", "SEGURIDAD", "DESACOPLAMIENTO"]),
        ("docs/diagnostico_procesos_ggc_2026.md", "DOC-GGPD-2026-DIAG-PROC-001", ["DIAGNOSTICO", "AUDITORIA", "REPO_GGC", "PATOLOGIAS"]),
        (".agents/wiki/INDEX.md", "WIKI-CENTRAL-GGPD", ["WIKI", "TAXONOMIA", "ARBOL_ORGANIZACIONAL", "NORMAS"]),
    ]
    
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    total_chunks = 0
    
    for rel_path, doc_code, tags in docs_to_ingest:
        full_path = os.path.join(base_dir, rel_path)
        if not os.path.exists(full_path):
            print(f"⚠️ Archivo no encontrado: {rel_path}")
            continue
            
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Split into sections based on ## or ###
        sections = re.split(r'\n(?=##+ )', content)
        for idx, sec in enumerate(sections):
            sec_lines = sec.strip().split('\n')
            title = sec_lines[0].replace('#', '').strip() if sec_lines else f"Sección {idx+1}"
            chunk_id = f"chunk_{doc_code.lower().replace('-', '_')}_{idx:03d}"
            
            # Simple summary from first 200 chars
            summary = sec[:250].replace('\n', ' ').strip() + "..."
            
            query = """
            INSERT INTO knowledge.mae_documentos_rag (
                id, documento_origen, seccion, chunk_index, titulo, contenido, resumen, tags
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                titulo = EXCLUDED.titulo,
                contenido = EXCLUDED.contenido,
                resumen = EXCLUDED.resumen,
                tags = EXCLUDED.tags,
                updated_at = NOW();
            """
            cur.execute(query, (chunk_id, doc_code, title, idx, title, sec, summary, tags))
            total_chunks += 1
            
    conn.commit()
    conn.close()
    print(f"✅ {total_chunks} Chunks Documentales RAG L3 sembrados con indexación `tsvector` en español.")

def seed_l4_codegraph():
    print("\n📦 Sembrando Grafo de Código y Taxonomía L4...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    codegraph_path = os.path.join(os.path.dirname(__file__), "..", ".agents", "memory", "codegraph.json")
    if os.path.exists(codegraph_path):
        with open(codegraph_path, "r", encoding="utf-8") as f:
            cg_data = json.load(f)
            
        nodes = cg_data.get("nodes", [])
        for n in nodes:
            cur.execute("""
            INSERT INTO knowledge.mae_grafo_codigo (id, aplicacion, tipo_nodo, nombre_nodo, ruta_archivo, puerto, descripcion, dependencias_json)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nombre_nodo = EXCLUDED.nombre_nodo,
                ruta_archivo = EXCLUDED.ruta_archivo,
                puerto = EXCLUDED.puerto,
                descripcion = EXCLUDED.descripcion,
                dependencias_json = EXCLUDED.dependencias_json;
            """, (
                n.get("id"),
                n.get("app", "CORE"),
                n.get("type", "COMPONENT"),
                n.get("name", n.get("id")),
                n.get("path"),
                n.get("port"),
                n.get("description"),
                Json(n.get("dependencies", []))
            ))
        print(f"✅ {len(nodes)} Nodos del Grafo de Código L4 sembrados.")
    else:
        print("ℹ️ Creando nodos básicos de las 6 aplicaciones...")
        apps_nodes = [
            ("app_sigi", "SIGI-REF", "APPLICATION", "Consola Central de Gestión y Planificación", "apps-refactorizadas/SIGI-REF", 3001, "Torre de Control y BI"),
            ("app_sctis", "SCTIS-REF", "APPLICATION", "Tiras de Interrupción de Distribución", "apps-refactorizadas/SCTIS-REF", 3002, "Registro y Despacho de Fallas"),
            ("app_scmtp", "SCMTP-REF", "APPLICATION", "Gestor de Tareas y Minutas SEN", "apps-refactorizadas/SCMTP-REF", 3003, "Seguimiento de Compromisos y Tareas Operativas"),
            ("app_scppe", "SCPPE-REF", "APPLICATION", "Planificación Eléctrica SEN & Viáticos", "apps-refactorizadas/SCPPE-REF", 3004, "Formulación POA, PRTSEN y Viáticos"),
            ("app_scein", "SCEIN-REF", "APPLICATION", "Equipos Indisponibles de Subestaciones", "apps-refactorizadas/SCEIN-REF", 3005, "Control de Transformadores y Equipos Críticos"),
            ("app_scgcc", "SCGCC-REF", "APPLICATION", "Gestión de Correspondencia Corporativa", "apps-refactorizadas/SCGCC-REF", 3006, "Radicación, Firmas y Despacho con Hash QR"),
            ("app_portal", "PORTAL-MAESTRO", "PORTAL", "Portal Unificado de Acceso Maestro", "index.html", 5000, "Lanzador Central de Aplicaciones GGPD")
        ]
        for a in apps_nodes:
            cur.execute("""
            INSERT INTO knowledge.mae_grafo_codigo (id, aplicacion, tipo_nodo, nombre_nodo, ruta_archivo, puerto, descripcion)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
            """, a)
        print(f"✅ {len(apps_nodes)} Aplicaciones maestras registradas en Grafo L4.")
        
    conn.commit()
    conn.close()

def seed_l5_handoff():
    print("\n📦 Sincronizando Handoff y Continuidad L5...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    cur.execute("""
    INSERT INTO knowledge.mae_sesiones_handoff (
        version_repositorio, resumen_ejecutivo, tareas_completadas, proximas_acciones, agente_emisor, commit_sha
    ) VALUES (
        'v2.6.0',
        'Conexión y formalización de la Base de Conocimiento y Memoria de IA en instancia dedicada InsForge (insforge-base-conocimientos-automatizacion). Despliegue de esquema knowledge.* con hechos L1, decisiones L2, RAG L3 y grafo L4.',
        %s,
        %s,
        'Antigravity IDE 2.0 (Google Gemini 3.7 Flash)',
        'c8584c0'
    );
    """, (
        Json([
            "Diagnóstico Forense DOC-GGPD-2026-DIAG-PROC-001 culminado",
            "Metas 2026 DOC-GGPD-2026-METAS-001 formalizado",
            "Gobernanza DOC-GGPD-2026-GOB-001 formalizado",
            "Despliegue de las 6 aplicaciones a VibeHost verificado HEALTHY",
            "Creación y siembra de Base de Conocimiento en InsForge jd3uejbz"
        ]),
        Json([
            "Conectar agentes e IAs al endpoint de memoria InsForge",
            "Implementar búsqueda semántica con embeddings en knowledge.mae_documentos_rag",
            "Crear micro-herramienta CLI agy-knowledge para consultas ultra-rápidas"
        ])
    ))
    
    conn.commit()
    conn.close()
    print("✅ Sesión de Handoff L5 registrada.")

def verify_summary():
    print("\n📊 Resumen de la Base de Conocimiento en InsForge:")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    cur.execute("SELECT count(*) FROM knowledge.mae_hechos_l1;")
    print(f" - Hechos Atómicos L1: {cur.fetchone()[0]}")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_decisiones_l2;")
    print(f" - Decisiones Arquitecturales L2: {cur.fetchone()[0]}")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_documentos_rag;")
    print(f" - Chunks Documentales RAG L3: {cur.fetchone()[0]}")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_grafo_codigo;")
    print(f" - Nodos del Grafo de Código L4: {cur.fetchone()[0]}")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_sesiones_handoff;")
    print(f" - Sesiones de Handoff L5: {cur.fetchone()[0]}")
    
    conn.close()

if __name__ == "__main__":
    init_database()
    seed_l1_facts()
    seed_l2_decisions()
    seed_l3_documents()
    seed_l4_codegraph()
    seed_l5_handoff()
    verify_summary()
    print("\n🎉 ¡Base de Conocimiento de IA desplegada y sincronizada exitosamente en InsForge!")
