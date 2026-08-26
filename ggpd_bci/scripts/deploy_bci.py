#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD | DEPLOYER MAESTRO GGPD-BCI
Despliega y siembra la Base de Conocimiento Inteligente en InsForge
Alias: `insforge-base-conocimientos-automatizacion`
"""

import json
import os
import re
import sys
import psycopg2
from psycopg2.extras import Json

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "connection.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

DB_URI = config["connection_uri"]
SCHEMA_SQL_PATH = os.path.join(os.path.dirname(__file__), "..", "sql", "01_schema_knowledge.sql")

def init_schema():
    print("🔌 [1/6] Conectando a InsForge PostgreSQL (jd3uejbz)...")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = True
    cur = conn.cursor()
    
    with open(SCHEMA_SQL_PATH, "r", encoding="utf-8") as f:
        ddl = f.read()
        
    print("🔨 [2/6] Ejecutando DDL de esquema `knowledge` y extensiones...")
    cur.execute(ddl)
    
    # Ensure migrations / new columns if table existed prior
    cur.execute("""
    ALTER TABLE knowledge.mae_grafo_codigo 
        ADD COLUMN IF NOT EXISTS lecturas_db TEXT[],
        ADD COLUMN IF NOT EXISTS escrituras_db TEXT[],
        ADD COLUMN IF NOT EXISTS enlaces_apps TEXT[];
    """)
    print("   ✅ Extensiones, esquema `knowledge` y vistas semánticas verificadas.")
    conn.close()

def seed_l1_facts():
    print("\n📦 [3/6] Sembrando Hechos Atómicos L1...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    memory_path = os.path.join(os.path.dirname(__file__), "..", "..", ".agents", "memory", "memory_hub.json")
    if os.path.exists(memory_path):
        with open(memory_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        facts = data.get("memory_layers", {}).get("L1_ATOMIC_FACTS", {})
    else:
        facts = {}
    
    records = [
        ("fact_ports", "INFRAESTRUCTURA", "puertos_aplicaciones", None, facts.get("ports", {
            "SIGI_REF": 3001, "SCTIS_REF": 3002, "SCMTP_REF": 3003,
            "SCPPE_REF": 3004, "SCEIN_REF": 3005, "SCGCC_REF": 3006, "PORTAL_MAESTRO": 5000
        }), "Puertos de red locales asignados a las 6 aplicaciones y portal maestro"),
        ("fact_urls", "PRODUCCION", "urls_vibehost_produccion", None, facts.get("production_urls", {
            "SIGI": "https://corpoelec-sigi-corpoelec-ggpd-hosting-apps.vibehost.space",
            "SCTIS": "https://corpoelec-sctis-corpoelec-ggpd-hosting-apps.vibehost.space",
            "SCMTP": "https://corpoelec-scmtp-corpoelec-ggpd-hosting-apps.vibehost.space",
            "SCPPE": "https://corpoelec-scppe-corpoelec-ggpd-hosting-apps.vibehost.space",
            "SCEIN": "https://corpoelec-scein-corpoelec-ggpd-hosting-apps.vibehost.space",
            "SCGCC": "https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space"
        }), "URLs públicas de producción desplegadas en VibeHost (Estatus HEALTHY)"),
        ("fact_schemas", "BASE_DATOS", "esquemas_db_insforge", None, {"schemas": [
            "core (dim_regiones, dim_estados, cat_niveles_tension, mae_usuarios_sistema, mae_subestaciones, mae_circuitos, dim_organizaciones)",
            "sigi (cat_procesos_ingesta, ingesta_registros_dinamicos)",
            "scmtp (mae_minutas, mae_compromisos_tareas, mae_pendientes_area)",
            "scppe (mae_proyectos_especiales, mae_poa_acciones, mae_viaticos_control, mae_proyectos_ggd)",
            "scein (mae_equipos_indisponibles, mae_documentos_institucionales, mae_auditorias)",
            "sctis (cat_despachadores, cat_asset_alias, mae_interrupciones_tiras)",
            "scgcc (mae_correspondencias, mae_oficios_salida)"
        ]}, "Esquemas canónicos desacoplados en InsForge PostgreSQL transaccional"),
        ("fact_targets_2026", "METAS_SEN", "metas_nacionales_2026", None, facts.get("targets_2026", {
            "TTI": "42.79 hrs/ano", "FMI": "42.49 int/cte/ano", "NDI": "150,347 fallas",
            "DPI": "1.01 hrs/evento", "AP": "60,808 luminarias", "PP": "64,162 km",
            "SE": "415 subestaciones", "MT_MIMT": "965 circuitos", "BT": "7,114 sectores"
        }), "Metas numéricas 2026 oficiales de 1er y 2do Nivel (DOC-GGPD-2026-METAS-001)"),
        ("fact_assets_subestaciones", "ACTIVOS_SEN", "subestaciones_normalizadas", "871", {"total": 871, "schema": "core.mae_subestaciones"}, "Parque nacional unificado de Subestaciones eléctricas"),
        ("fact_assets_circuitos", "ACTIVOS_SEN", "circuitos_normalizados", "4207", {"total": 4207, "schema": "core.mae_circuitos"}, "Total de circuitos de distribución de media tensión"),
        ("fact_hardware_profile", "HARDWARE", "perfil_computo_local", "Dell Latitude 3110 (3.7 GB RAM)", {"zero_ram_daemon": True}, "Especificación de hardware para cero consumo de RAM local"),
        ("fact_leadership", "ORGANIZACION", "liderazgo_institucional", "GGD / GGPD", {
            "GGD": "Ing. Adrián Correa (Gerente General de Distribución)",
            "GGPD": "Ing. Carlos H. Reyes A. (Gerente General de Planificación)",
            "Liderazgo_Tecnico": "Yván M. Cipirán / Josué Pacheco (Equipo de Automatización e IA)"
        }, "Estructura de liderazgo directivo y técnico de Distribución")
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
    print(f"   ✅ {len(records)} Hechos Atómicos L1 registrados.")

def seed_l2_decisions():
    print("\n📦 [4/6] Sembrando Decisiones Arquitecturales L2...")
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
            "dec_bci_architecture",
            "DOC-GGPD-2026-BCI-001",
            "Despliegue de la Base de Conocimiento Inteligente (BCI) en Proyecto Dedicado",
            "Necesidad de memoria persistente multi-agente, reducción de consumo de tokens y optimización de productos de IA para CORPOELEC sin sobrecargar hardware local.",
            "Creación del proyecto dedicado en InsForge (jd3uejbz) bajo el alias `insforge-base-conocimientos-automatizacion` con esquema `knowledge.*`, soporte RAG multilingüe `tsvector` y pgvector HNSW.",
            "ISO/IEC 27001 (Segregación de Ambientes), ISO 8000 (Semántica Corporativa)",
            ["TODAS_LAS_APPS", "AGENTES_IA", "ANTIGRAVITY_IDE"],
            "2026-08-26"
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
    print(f"   ✅ {len(decisions)} Decisiones Arquitecturales L2 registradas.")

def seed_l3_documents():
    print("\n📦 [5/6] Sembrando Documentos y Chunks RAG L3...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    docs_to_ingest = [
        ("docs/analisis_metas_2026.md", "DOC-GGPD-2026-METAS-001", ["METAS", "CALIDAD_SERVICIO", "MANTENIMIENTO", "ISO_9001"]),
        ("docs/dictamen_gobernanza_software_distribucion_2026.md", "DOC-GGPD-2026-GOB-001", ["GOBERNANZA", "COBIT_2019", "SEGURIDAD", "DESACOPLAMIENTO"]),
        ("docs/diagnostico_procesos_ggc_2026.md", "DOC-GGPD-2026-DIAG-PROC-001", ["DIAGNOSTICO", "AUDITORIA", "REPO_GGC", "PATOLOGIAS"]),
        (".agents/wiki/INDEX.md", "WIKI-CENTRAL-GGPD", ["WIKI", "TAXONOMIA", "ARBOL_ORGANIZACIONAL", "NORMAS"]),
    ]
    
    base_dir = os.path.join(os.path.dirname(__file__), "..", "..")
    total_chunks = 0
    
    for rel_path, doc_code, tags in docs_to_ingest:
        full_path = os.path.join(base_dir, rel_path)
        if not os.path.exists(full_path):
            print(f"   ⚠️ Archivo no encontrado: {rel_path}")
            continue
            
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        sections = re.split(r'\n(?=##+ )', content)
        for idx, sec in enumerate(sections):
            sec_lines = sec.strip().split('\n')
            title = sec_lines[0].replace('#', '').strip() if sec_lines else f"Sección {idx+1}"
            chunk_id = f"chunk_{doc_code.lower().replace('-', '_')}_{idx:03d}"
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
    print(f"   ✅ {total_chunks} Chunks Documentales RAG L3 sembrados.")

def seed_l4_codegraph():
    print("\n📦 [6/6] Sembrando Grafo de Código L4 y Sesión L5...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    codegraph_path = os.path.join(os.path.dirname(__file__), "..", "..", ".agents", "memory", "codegraph.json")
    if os.path.exists(codegraph_path):
        with open(codegraph_path, "r", encoding="utf-8") as f:
            cg_data = json.load(f)
            
        nodes_obj = cg_data.get("nodes", {})
        count = 0
        for node_id, node_info in nodes_obj.items():
            app_name = node_id
            tipo_nodo = node_info.get("type", "COMPONENT")
            puerto = node_info.get("port")
            role = node_info.get("role", "")
            reads = node_info.get("reads_from", [])
            writes = node_info.get("writes_to", [])
            links = node_info.get("links_to", []) or node_info.get("dependents", [])
            
            cur.execute("""
            INSERT INTO knowledge.mae_grafo_codigo (
                id, aplicacion, tipo_nodo, nombre_nodo, puerto, descripcion,
                lecturas_db, escrituras_db, enlaces_apps, dependencias_json
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                tipo_nodo = EXCLUDED.tipo_nodo,
                puerto = EXCLUDED.puerto,
                descripcion = EXCLUDED.descripcion,
                lecturas_db = EXCLUDED.lecturas_db,
                escrituras_db = EXCLUDED.escrituras_db,
                enlaces_apps = EXCLUDED.enlaces_apps,
                dependencias_json = EXCLUDED.dependencias_json;
            """, (
                node_id,
                app_name,
                tipo_nodo,
                f"{app_name} — {role}",
                puerto,
                role,
                reads,
                writes,
                links,
                Json(node_info)
            ))
            count += 1
        print(f"   ✅ {count} Nodos del Grafo de Código L4 registrados.")
    
    # Handoff L5
    cur.execute("""
    INSERT INTO knowledge.mae_sesiones_handoff (
        version_repositorio, resumen_ejecutivo, tareas_completadas, proximas_acciones, agente_emisor, commit_sha
    ) VALUES (
        'v2.6.0',
        'Establecimiento formal del subdirectorio ggpd_bci como piedra angular de la Base de Conocimientos Inteligente para automatizaciones e IAs de CORPOELEC GGPD en InsForge.',
        %s,
        %s,
        'Antigravity IDE 2.0 (Google Gemini 3.7 Flash)',
        'c8584c0'
    );
    """, (
        Json([
            "Creación del subdirectorio maestro ggpd_bci",
            "Configuración del alias insforge-base-conocimientos-automatizacion",
            "Despliegue del esquema canónico knowledge.*",
            "Siembra de las 5 capas: Hechos L1, Decisiones L2, RAG L3, Grafo L4 y Handoff L5"
        ]),
        Json([
            "Integrar herramientas CLI de consulta para agentes",
            "Proveer endpoints de RAG semántico para asistentes de las aplicaciones",
            "Actualizar handoff.md con la formalización del nuevo subsistema BCI"
        ])
    ))
    
    conn.commit()
    conn.close()
    print("   ✅ Sesión de Handoff L5 registrada.")

def print_summary():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    print("\n" + "="*70)
    print("📊 RESUMEN EJECUTIVO GGPD-BCI EN INSFORGE (jd3uejbz):")
    print("="*70)
    
    cur.execute("SELECT count(*) FROM knowledge.mae_hechos_l1;")
    print(f"  🔹 Hechos Atómicos L1:            {cur.fetchone()[0]} registros")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_decisiones_l2;")
    print(f"  🔹 Decisiones y Dictámenes L2:    {cur.fetchone()[0]} directrices")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_documentos_rag;")
    print(f"  🔹 Chunks Documentales RAG L3:    {cur.fetchone()[0]} fragmentos indexados")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_grafo_codigo;")
    print(f"  🔹 Nodos Grafo de Código L4:      {cur.fetchone()[0]} aplicaciones/esquemas")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_sesiones_handoff;")
    print(f"  🔹 Sesiones de Handoff L5:        {cur.fetchone()[0]} sesiones")
    
    print("="*70)
    conn.close()

if __name__ == "__main__":
    init_schema()
    seed_l1_facts()
    seed_l2_decisions()
    seed_l3_documents()
    seed_l4_codegraph()
    print_summary()
    print("🎉 ¡Base de Conocimiento Inteligente GGPD-BCI Desplegada con Éxito!")
