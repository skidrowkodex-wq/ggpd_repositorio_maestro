#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD | SYNC MAESTRO DE CONOCIMIENTO A BCI (INSFORGE)
Escanea toda la documentación técnica .MD de apps/ y apps-refactorizadas/,
extrae el conocimiento formal (L1, L2, L3 RAG, L4 Grafo) y lo eleva de manera
estructurada e indexada a la Base de Conocimiento Inteligente en InsForge.

Alias: `insforge-base-conocimientos-automatizacion`
Host:  `jd3uejbz.ap-southeast.database.insforge.app`
"""

import json
import os
import re
import psycopg2
from psycopg2.extras import Json, execute_values

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "connection.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

DB_URI = config["connection_uri"]
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Mapeo exhaustivo de archivos .MD de conocimiento formal
KNOWLEDGE_DOCS = [
    # --- NORMATIVA ESTRATÉGICA SEN 2026 ---
    ("docs/analisis_metas_2026.md", "DOC-GGPD-2026-METAS-001", "Marco Lógico y Metrología de Metas SEN 2026", ["METAS", "CALIDAD_SERVICIO", "MANTENIMIENTO", "ISO_9001", "SEN_2026"]),
    ("docs/dictamen_gobernanza_software_distribucion_2026.md", "DOC-GGPD-2026-GOB-001", "Dictamen de Gobernanza de Software & Cierre de Canales Informales", ["GOBERNANZA", "COBIT_2019", "ISO_27001", "SEGURIDAD", "DESACOPLAMIENTO"]),
    ("docs/diagnostico_procesos_ggc_2026.md", "DOC-GGPD-2026-DIAG-PROC-001", "Diagnóstico Forense de Procesos y Deconstrucción de repo_ggc", ["DIAGNOSTICO", "AUDITORIA", "PATOLOGIAS", "RETRABAJO", "EX_OPERADORAS"]),
    ("docs/DISENO_TABLA_UNIFICADA_ACTIVOS.md", "DOC-GGPD-2026-ACTIVOS-001", "Diseño de Tabla Unificada de Activos de Distribución ISO 55000", ["ACTIVOS", "SUBESTACIONES", "CIRCUITOS", "ISO_55000", "ISO_8000"]),
    ("docs/CORPOELEC_AI_STUDIO_DESIGN_SYSTEM_PROMPT.md", "DOC-GGPD-2026-UIUX-001", "Sistema de Diseño Institucional CORPOELEC AI Studio", ["DISENO", "UI_UX", "PALETA_COLORES", "ESTANDAR_GRAFICO"]),
    ("docs/INF-STI-2026-008-V3_INFORME_TECNICO_ECONOMICO_SERVICIOS_CLOUD_ISO.md", "INF-STI-2026-008-V3", "Informe Técnico-Económico de Servicios Cloud e Infraestructura BaaS", ["INFRAESTRUCTURA", "CLOUD", "COSTOS", "INSFORGE", "VIBEHOST"]),
    ("docs/NAC_2026_GGPD_AUDITORIA_TECNICA_CONFORMIDAD_ISO_COBIT_V01.md", "NAC-2026-GGPD-AUD-ISO-01", "Auditoría de Conformidad ISO 8000, 27001 y COBIT 2019", ["AUDITORIA", "ISO_8000", "ISO_27001", "COBIT_2019", "GOBERNANZA"]),
    ("docs/NAC_2026_GGPD_ANALISIS_INTERCONEXION_SOLAPAMIENTOS_PROCESOS_V01.md", "NAC-2026-GGPD-SOLAP-01", "Análisis de Interconexión y Erradicación de Solapamientos", ["PROCESOS", "INTERCONEXION", "DESACOPLAMIENTO", "FLUJO_DATOS"]),
    ("docs/NAC_2026_GGPD_NORMA_GOBERNANZA_PUERTOS_SERVIDORES_V01.md", "NAC-2026-GGPD-PUERTOS-01", "Norma de Gobernanza de Puertos de Red y Servidores Locales", ["PUERTOS", "RED", "INFRAESTRUCTURA", "MICROSERVICIOS"]),

    # --- SCGCC (CORRESPONDENCIA CORPORATIVA) ---
    ("apps-refactorizadas/SCGCC-REF/docs/SCGCC_DOCTEC_v1_Arquitectura_Gobernanza.md", "GGPD-SCGCC-DOCTEC-2026-V01", "Manual Técnico y Arquitectura de Datos SCGCC", ["SCGCC", "CORRESPONDENCIA", "ISO_15489", "HASH_SHA256", "POSTGRESQL"]),
    ("apps-refactorizadas/SCGCC-REF/docs/SCGCC_DOCFUN_v1_Informe_Avance_Solicitantes.md", "GGPD-SCGCC-DOCFUN-2026-V01", "Informe Funcional Ejecutivo para Solicitantes SCGCC", ["SCGCC", "INFORME_EJECUTIVO", "CERO_PAPEL", "TRAMITES"]),
    ("apps-refactorizadas/SCGCC-REF/docs/GGPD_SCGCC_ESTUDIO_FACTIBILIDAD_EXPANSION_V01.md", "GGPD-SCGCC-ESTFAC-2026-V01", "Estudio de Factibilidad de Expansión SCGCC V2.0", ["SCGCC", "FACTIBILIDAD", "EXPANSION", "HOJA_RUTA"]),
    ("apps-refactorizadas/SCGCC-REF/docs/DOCUMENTACION_ISO_GGPD.md", "GGPD-SCGCC-ISO-INDEX", "Índice Maestro de Gobernanza y Calidad ISO SCGCC", ["SCGCC", "CALIDAD_ISO", "GOBERNANZA_DOCUMENTAL"]),

    # --- SCMTP (MINUTAS Y TAREAS SEN) ---
    ("apps-refactorizadas/SCMTP-REF/docs/MANUAL_TECNICO.md", "GGPD-SCMTP-DOCTEC-2026-V01", "Manual Técnico del Gestor de Tareas y Minutas SCMTP", ["SCMTP", "MINUTAS", "TAREAS", "WORKFLOW_72H", "POSTGRESQL"]),
    ("apps-refactorizadas/SCMTP-REF/docs/MANUAL_FUNCIONAL.md", "GGPD-SCMTP-DOCFUN-2026-V01", "Manual Funcional Operativo de Tareas y Minutas SCMTP", ["SCMTP", "MANUAL_USUARIO", "ROLES", "COMPROMISOS"]),
    ("apps-refactorizadas/SCMTP-REF/docs/INSTRUCTIVOS_OPERATIVOS_ISO.md", "GGPD-SCMTP-INST-ISO-01", "Instructivos Operativos ISO para Seguimiento de Compromisos", ["SCMTP", "INSTRUCTIVOS", "PROCEDIMIENTOS", "SEGUIMIENTO"]),

    # --- SCTIS (TIRAS DE INTERRUPCIÓN DE DISTRIBUCIÓN) ---
    ("apps-refactorizadas/SCTIS-REF/docs/SCTIS_DOCTEC_v1_Arquitectura_Flujos.md", "GGPD-SCTIS-DOCTEC-2026-V01", "Manual Técnico y Arquitectura de Flujos de Tiras SCTIS", ["SCTIS", "INTERRUPCIONES", "TIRAS_DESPACHO", "TTI", "FMI"]),
    ("apps-refactorizadas/SCTIS-REF/docs/SCTIS_DOCFUN_v1_Beneficios_Decision.md", "GGPD-SCTIS-DOCFUN-2026-V01", "Documento Funcional y Beneficios Operativos SCTIS", ["SCTIS", "BENEFICIOS", "INDICADORES_CONFIABILIDAD"]),
    ("apps-refactorizadas/SCTIS-REF/docs/SCTIS_INSTRUCTIVO_v1_Procedimiento_Estados.md", "GGPD-SCTIS-PROC-EST-01", "Procedimiento Operativo para Despachadores Estadales", ["SCTIS", "DESPACHO", "ESTADOS", "PROCEDIMIENTO_CARGA"]),

    # --- SCPPE (PLANIFICACIÓN ELÉCTRICA SEN & VIÁTICOS) ---
    ("apps-refactorizadas/SCPPE-REF/docs/DOCUMENTO_TECNICO_ISO.md", "GGPD-SCPPE-DOCTEC-2026-V01", "Manual Técnico y Modelo de Datos de Planificación SCPPE", ["SCPPE", "POA", "PRTSEN", "VIATICOS", "ARBOL_ORGANIZACIONAL"]),
    ("apps-refactorizadas/SCPPE-REF/docs/ISO_8000_METAS_FISICAS.md", "GGPD-SCPPE-ISO8000-METAS", "Gobernanza ISO 8000 de Metas Físicas y Presupuesto", ["SCPPE", "METAS_FISICAS", "PRESUPUESTO_POA", "CALIDAD_DATOS"]),
    ("apps-refactorizadas/SCPPE-REF/docs/INFORME_AUDITORIA_PRESUPUESTO.md", "GGPD-SCPPE-AUD-PRESUP", "Auditoría del Flujo Presupuestario y Asignaciones POA", ["SCPPE", "AUDITORIA", "PRESUPUESTO", "CONFORMIDAD"]),

    # --- SIGI (CONSOLA CENTRAL DE GESTIÓN & INGESTA DATA LAKE) ---
    ("apps/corpoelec-sigi-gestion-planificacion-distribucion/docs/NAC_2026_GGPD_MANUAL_SISTEMA_ARQUITECTURA_SIGI_V01.md", "GGPD-SIGI-DOCTEC-2026-V01", "Manual de Arquitectura del Sistema Central SIGI", ["SIGI", "TORRE_CONTROL", "BI", "DATA_LAKE", "ARQUITECTURA"]),
    ("apps/corpoelec-sigi-gestion-planificacion-distribucion/docs/NAC_2026_GGPD_PLAN_ESTRATEGICO_MODULO_INGESTA_CALIDAD_SIGI_V01.md", "GGPD-SIGI-INGESTA-01", "Plan Estratégico del Módulo de Ingesta y Calidad de Datos SIGI", ["SIGI", "INGESTA_DATOS", "CALIDAD_ISO8000", "GOOGLE_DRIVE"]),
    ("apps/corpoelec-sigi-gestion-planificacion-distribucion/docs/NAC_2026_GGPD_INFORME_ARQUITECTURA_GOBERNANZA_ACCESOS_SIGI_V01.md", "GGPD-SIGI-GOB-ACCESOS-01", "Informe de Gobernanza de Accesos y Matriz RBAC SIGI", ["SIGI", "RBAC", "MATRIZ_ACCESOS", "IAM", "SEGURIDAD"]),

    # --- SCEIN (EQUIPOS INDISPONIBLES) ---
    ("apps-refactorizadas/SCEIN-REF/README.md", "GGPD-SCEIN-README-2026", "Especificación del Sistema de Equipos Indisponibles SCEIN", ["SCEIN", "EQUIPOS_INDISPONIBLES", "SUBESTACIONES", "TRANSFORMADORES_POTENCIA"]),

    # --- WIKI & REGLAS MAESTRAS ---
    (".agents/wiki/INDEX.md", "WIKI-CENTRAL-GGPD", "Índice Maestro de la Base de Conocimiento Central", ["WIKI", "TAXONOMIA", "ARBOL_ORGANIZACIONAL", "NORMAS"]),
    (".agents/rules/industrial_grade_standard.md", "RULE-INDUSTRIAL-GRADE-001", "Regla de Grado Industrial SEN & Zona Segura Cifrada", ["ESTANDAR_SEGURIDAD", "ZONA_SEGURA", "LOGIN", "OWASP", "ISO_27001"])
]

def sync_rag_documents():
    print("\n📚 Sincronizando Documentos y Chunks RAG en `knowledge.mae_documentos_rag`...")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = False
    cur = conn.cursor()
    
    total_docs_processed = 0
    total_chunks_processed = 0
    
    for rel_path, doc_code, doc_title, tags in KNOWLEDGE_DOCS:
        full_path = os.path.join(BASE_DIR, rel_path)
        if not os.path.exists(full_path):
            print(f"   ⚠️ Archivo no encontrado: {rel_path}")
            continue
            
        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            
        if not content.strip():
            continue
            
        total_docs_processed += 1
        
        # Split by ## or ### to create coherent chunks
        sections = re.split(r'\n(?=##+ )', content)
        if len(sections) == 1 and len(content) > 3000:
            # Fallback split by paragraphs if no headers
            paragraphs = content.split('\n\n')
            sections = []
            buf = ""
            for p in paragraphs:
                if len(buf) + len(p) < 2500:
                    buf += p + "\n\n"
                else:
                    sections.append(buf.strip())
                    buf = p + "\n\n"
            if buf:
                sections.append(buf.strip())
                
        chunk_data_list = []
        for idx, sec in enumerate(sections):
            sec = sec.strip()
            if not sec:
                continue
                
            sec_lines = sec.split('\n')
            sec_title = sec_lines[0].replace('#', '').strip() if sec_lines else f"{doc_title} (Parte {idx+1})"
            chunk_id = f"chk_{doc_code.lower().replace('-', '_').replace('.', '_')}_{idx:03d}"
            
            # Clean summary
            clean_sec = re.sub(r'[\*\_#`]', '', sec)
            summary = (clean_sec[:220].replace('\n', ' ').strip() + "...") if len(clean_sec) > 220 else clean_sec
            
            chunk_data_list.append((
                chunk_id,
                doc_code,
                sec_title,
                idx,
                sec_title,
                sec,
                summary,
                tags
            ))
            
        # Batch upsert chunks
        upsert_query = """
        INSERT INTO knowledge.mae_documentos_rag (
            id, documento_origen, seccion, chunk_index, titulo, contenido, resumen, tags
        ) VALUES %s
        ON CONFLICT (id) DO UPDATE SET
            documento_origen = EXCLUDED.documento_origen,
            seccion = EXCLUDED.seccion,
            titulo = EXCLUDED.titulo,
            contenido = EXCLUDED.contenido,
            resumen = EXCLUDED.resumen,
            tags = EXCLUDED.tags,
            updated_at = NOW();
        """
        execute_values(cur, upsert_query, chunk_data_list)
        total_chunks_processed += len(chunk_data_list)
        print(f"   📄 [{doc_code}] {doc_title[:45]}... ➔ {len(chunk_data_list)} chunks indexados.")
        
    conn.commit()
    conn.close()
    print(f"✅ Total Documentos Procesados: {total_docs_processed}")
    print(f"✅ Total Chunks RAG Sembrados e Indexados con tsvector: {total_chunks_processed}")

def sync_atomic_facts():
    print("\n📦 Sincronizando Hechos Atómicos L1 Avanzados...")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = True
    cur = conn.cursor()
    
    advanced_facts = [
        ("fact_scgcc_spec", "ESPECIFICACION_APP", "scgcc_especificacion_tecnica", None, {
            "puerto": 3006,
            "esquema_db": "scgcc.*",
            "tablas_principales": ["mae_correspondencias", "mae_oficios_salida"],
            "vistas": ["v_scgcc_correspondencias_activas", "v_scgcc_kpi_slas"],
            "seguridad": "ISO 15489 + ISO 27001 + Hash SHA-256 + QR",
            "slas": {"URGENTE_24H": "24h", "ALTA": "48h", "MEDIA": "5 días hábiles"}
        }, "Especificación técnica y operativa completa del sistema SCGCC V1.0"),
        
        ("fact_scmtp_spec", "ESPECIFICACION_APP", "scmtp_especificacion_tecnica", None, {
            "puerto": 3003,
            "esquema_db": "scmtp.*",
            "tablas_principales": ["mae_minutas", "mae_compromisos_tareas", "mae_pendientes_area"],
            "vistas": ["v_scmtp_compromisos", "v_scmtp_minutas"],
            "workflow": "Ciclo de Compromisos 72h / Responsables Formales / Auditoría ISO 9001"
        }, "Especificación técnica y operativa completa del sistema SCMTP V2.0"),
        
        ("fact_scppe_spec", "ESPECIFICACION_APP", "scppe_especificacion_tecnica", None, {
            "puerto": 3004,
            "esquema_db": "scppe.*",
            "tablas_principales": ["mae_proyectos_especiales", "mae_poa_acciones", "mae_viaticos_control", "mae_proyectos_ggd"],
            "vistas": ["v_scppe_proyectos_prtsen", "v_scppe_poa_acciones", "samc_subestacion", "samc_circuito"],
            "obras_prtsen": 821,
            "subestaciones_rds": 871,
            "circuitos_rds": 4207,
            "integracion": "Árbol Organizacional core.dim_organizaciones"
        }, "Especificación técnica y operativa completa del sistema SCPPE V3.0"),
        
        ("fact_sctis_spec", "ESPECIFICACION_APP", "sctis_especificacion_tecnica", None, {
            "puerto": 3002,
            "esquema_db": "sctis.*",
            "tablas_principales": ["mae_interrupciones_tiras", "cat_despachadores", "cat_asset_alias"],
            "vistas": ["v_sctis_interrupciones_activas", "v_sctis_kpis_confiabilidad"],
            "indicadores": ["TTI (SAIDI)", "FMI (SAIFI)", "NDI", "DPI (CAIDI)", "RIND"]
        }, "Especificación técnica y operativa completa del sistema SCTIS V2.0"),
        
        ("fact_sigi_spec", "ESPECIFICACION_APP", "sigi_especificacion_tecnica", None, {
            "puerto": 3001,
            "esquema_db": "sigi.* + core.*",
            "tablas_principales": ["cat_procesos_ingesta", "ingesta_registros_dinamicos"],
            "rol": "Torre de Control Central, BI y visualizador estratégico",
            "integracion": "Ingesta desde Google Drive Data Lake con validación ISO 8000"
        }, "Especificación técnica y operativa completa de la Consola Central SIGI V3.0"),
        
        ("fact_scein_spec", "ESPECIFICACION_APP", "scein_especificacion_tecnica", None, {
            "puerto": 3005,
            "esquema_db": "scein.*",
            "tablas_principales": ["mae_equipos_indisponibles", "mae_documentos_institucionales", "mae_auditorias"],
            "rol": "Control de Equipos Críticos Indisponibles y Contingencia Subestaciones N-1"
        }, "Especificación técnica y operativa completa del sistema SCEIN V3.0")
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
    for r in advanced_facts:
        cur.execute(query, (r[0], r[1], r[2], r[3], Json(r[4]) if r[4] is not None else None, r[5]))
        
    conn.close()
    print(f"✅ {len(advanced_facts)} Especificaciones de Apps L1 registradas.")

def sync_codegraph_nodes():
    print("\n🌐 Sincronizando Nodos de Código L4 Enriquecidos...")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = True
    cur = conn.cursor()
    
    graph_nodes = [
        (
            "app_sigi", "SIGI-REF", "APPLICATION", "Consola Central de Gestión y Planificación",
            "apps-refactorizadas/SIGI-REF", 3001, "Torre de Control & BI Corporativo",
            ["core.*", "sigi.*", "sctis.*", "scmtp.*", "scein.*", "scppe.*", "scgcc.*"],
            ["sigi.cat_procesos_ingesta", "sigi.ingesta_registros_dinamicos"],
            ["SCGCC-REF", "SCMTP-REF", "SCPPE-REF", "SCEIN-REF", "SCTIS-REF"],
            {"framework": "React + Vite + Tailwind CSS", "insforge_sdk": "@insforge/sdk", "port": 3001}
        ),
        (
            "app_scgcc", "SCGCC-REF", "APPLICATION", "Gestión de Correspondencia Corporativa",
            "apps-refactorizadas/SCGCC-REF", 3006, "Radicación, Firmas y Despacho con Hash QR",
            ["core.dim_organizaciones", "core.mae_usuarios_sistema", "scgcc.*"],
            ["scgcc.mae_correspondencias", "scgcc.mae_oficios_salida"],
            ["SCMTP-REF"],
            {"framework": "React + Vite + Lucide Icons", "insforge_sdk": "@insforge/sdk", "port": 3006}
        ),
        (
            "app_scmtp", "SCMTP-REF", "APPLICATION", "Gestor de Tareas y Minutas SEN",
            "apps-refactorizadas/SCMTP-REF", 3003, "Workflow Táctico de Tareas y Minutas SEN",
            ["core.mae_usuarios_sistema", "core.dim_organizaciones", "scmtp.*"],
            ["scmtp.mae_minutas", "scmtp.mae_compromisos_tareas", "scmtp.mae_pendientes_area"],
            ["SCGCC-REF", "SIGI-REF"],
            {"framework": "React + Vite", "insforge_sdk": "InsForge REST Client", "port": 3003}
        ),
        (
            "app_scppe", "SCPPE-REF", "APPLICATION", "Planificación Eléctrica SEN & Viáticos",
            "apps-refactorizadas/SCPPE-REF", 3004, "Planificación SEN, POA 2026/2027 y PRTSEN (821 obras)",
            ["core.dim_organizaciones", "core.mae_subestaciones", "core.mae_circuitos", "scppe.*"],
            ["scppe.mae_poa_acciones", "scppe.mae_viaticos_control", "scppe.mae_proyectos_ggd"],
            ["SIGI-REF"],
            {"framework": "React + Vite + Tailwind CSS", "insforge_sdk": "@insforge/sdk", "port": 3004}
        ),
        (
            "app_scein", "SCEIN-REF", "APPLICATION", "Equipos Indisponibles de Subestaciones",
            "apps-refactorizadas/SCEIN-REF", 3005, "Equipos Indisponibles & Contingencia S/E N-1",
            ["core.mae_subestaciones", "scein.*"],
            ["scein.mae_equipos_indisponibles", "scein.mae_documentos_institucionales"],
            ["SIGI-REF"],
            {"framework": "Remix + React + Tailwind CSS", "insforge_sdk": "InsForge REST Client", "port": 3005}
        ),
        (
            "app_sctis", "SCTIS-REF", "APPLICATION", "Tiras de Interrupción de Distribución",
            "apps-refactorizadas/SCTIS-REF", 3002, "Ingesta Tiras & 1er Nivel (TTI/FMI)",
            ["core.mae_subestaciones", "core.mae_circuitos", "sctis.*"],
            ["sctis.mae_interrupciones_tiras"],
            ["SIGI-REF"],
            {"framework": "Python Flask / Jinja2 + Vite Frontend", "insforge_sdk": "psycopg2 / REST", "port": 3002}
        ),
        (
            "app_portal", "PORTAL-MAESTRO", "PORTAL", "Portal Unificado de Acceso Maestro",
            "index.html", 5000, "Lanzador Central de Microservicios GGPD",
            ["knowledge.mae_hechos_l1"],
            [],
            ["SIGI-REF", "SCTIS-REF", "SCMTP-REF", "SCPPE-REF", "SCEIN-REF", "SCGCC-REF"],
            {"framework": "Vanilla HTML5 + Modern CSS3 + Vite dev server", "port": 5000}
        )
    ]
    
    query = """
    INSERT INTO knowledge.mae_grafo_codigo (
        id, aplicacion, tipo_nodo, nombre_nodo, ruta_archivo, puerto, descripcion,
        lecturas_db, escrituras_db, enlaces_apps, dependencias_json
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (id) DO UPDATE SET
        tipo_nodo = EXCLUDED.tipo_nodo,
        nombre_nodo = EXCLUDED.nombre_nodo,
        ruta_archivo = EXCLUDED.ruta_archivo,
        puerto = EXCLUDED.puerto,
        descripcion = EXCLUDED.descripcion,
        lecturas_db = EXCLUDED.lecturas_db,
        escrituras_db = EXCLUDED.escrituras_db,
        enlaces_apps = EXCLUDED.enlaces_apps,
        dependencias_json = EXCLUDED.dependencias_json;
    """
    for n in graph_nodes:
        cur.execute(query, (
            n[0], n[1], n[2], n[3], n[4], n[5], n[6],
            n[7], n[8], n[9], Json(n[10])
        ))
    conn.close()
    print(f"✅ {len(graph_nodes)} Nodos del Grafo L4 enriquecidos y registrados.")

def show_summary():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    print("\n" + "=" * 70)
    print("🧠 RESUMEN DE ELEVACIÓN DE CONOCIMIENTO A GGPD-BCI")
    print(f"   Alias: {config['alias']}")
    print(f"   Host:  {config['host']}")
    print("=" * 70)
    
    cur.execute("SELECT count(*) FROM knowledge.mae_hechos_l1;")
    print(f"  🔹 Hechos Atómicos L1:            {cur.fetchone()[0]} especificaciones registradas")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_decisiones_l2;")
    print(f"  🔹 Decisiones y Dictámenes L2:    {cur.fetchone()[0]} directrices vigentes")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_documentos_rag;")
    print(f"  🔹 Chunks Documentales RAG L3:    {cur.fetchone()[0]} fragmentos indexados con tsvector")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_grafo_codigo;")
    print(f"  🔹 Nodos Grafo de Código L4:      {cur.fetchone()[0]} aplicaciones/sistemas")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_sesiones_handoff;")
    print(f"  🔹 Sesiones de Handoff L5:        {cur.fetchone()[0]} sesiones")
    print("=" * 70 + "\n")
    conn.close()

if __name__ == "__main__":
    sync_rag_documents()
    sync_atomic_facts()
    sync_codegraph_nodes()
    show_summary()
    print("🎉 ¡Elevación y Sincronización de Conocimiento Culminada Exitosamente!")
