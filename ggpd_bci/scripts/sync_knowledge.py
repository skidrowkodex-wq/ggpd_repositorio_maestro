#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD | SYNC MAESTRO DE CONOCIMIENTO A BCI (INSFORGE)
Escanea toda la documentación técnica .MD de apps/ y apps-refactorizadas/,
extrae el conocimiento formal (L1, L2, L3 RAG, L4 Grafo) y lo clasifica bajo la
Taxonomía Multi-Proceso Medular SEN (G, T, D, C y Transversal).

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

# Mapeo exhaustivo de archivos .MD de conocimiento formal con Taxonomía SEN
KNOWLEDGE_DOCS = [
    # --- NORMATIVA ESTRATÉGICA SEN 2026 ---
    (
        "docs/analisis_metas_2026.md", "DOC-GGPD-2026-METAS-001", 
        "Marco Lógico y Metrología de Metas SEN 2026", 
        ["METAS", "CALIDAD_SERVICIO", "MANTENIMIENTO", "ISO_9001", "SEN_2026"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSMISION", "COMERCIALIZACION"], "CALIDAD_SERVICIO_Y_METAS"
    ),
    (
        "docs/dictamen_gobernanza_software_distribucion_2026.md", "DOC-GGPD-2026-GOB-001", 
        "Dictamen de Gobernanza de Software & Cierre de Canales Informales", 
        ["GOBERNANZA", "COBIT_2019", "ISO_27001", "SEGURIDAD", "DESACOPLAMIENTO"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "GOBERNANZA_TI_Y_SOFTWARE"
    ),
    (
        "docs/diagnostico_procesos_ggc_2026.md", "DOC-GGPD-2026-DIAG-PROC-001", 
        "Diagnóstico Forense de Procesos y Deconstrucción de repo_ggc", 
        ["DIAGNOSTICO", "AUDITORIA", "PATOLOGIAS", "RETRABAJO", "EX_OPERADORAS"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION"], "DIAGNOSTICO_ORGANIZACIONAL"
    ),
    (
        "docs/DISENO_TABLA_UNIFICADA_ACTIVOS.md", "DOC-GGPD-2026-ACTIVOS-001", 
        "Diseño de Tabla Unificada de Activos de Distribución ISO 55000", 
        ["ACTIVOS", "SUBESTACIONES", "CIRCUITOS", "ISO_55000", "ISO_8000"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSMISION"], "GESTION_ACTIVOS_ISO55000"
    ),
    (
        "docs/CORPOELEC_AI_STUDIO_DESIGN_SYSTEM_PROMPT.md", "DOC-GGPD-2026-UIUX-001", 
        "Sistema de Diseño Institucional CORPOELEC AI Studio", 
        ["DISENO", "UI_UX", "PALETA_COLORES", "ESTANDAR_GRAFICO"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "ESTANDAR_UIUX"
    ),
    (
        "docs/INF-STI-2026-008-V3_INFORME_TECNICO_ECONOMICO_SERVICIOS_CLOUD_ISO.md", "INF-STI-2026-008-V3", 
        "Informe Técnico-Económico de Servicios Cloud e Infraestructura BaaS", 
        ["INFRAESTRUCTURA", "CLOUD", "COSTOS", "INSFORGE", "VIBEHOST"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "INFRAESTRUCTURA_CLOUD"
    ),
    (
        "docs/NAC_2026_GGPD_AUDITORIA_TECNICA_CONFORMIDAD_ISO_COBIT_V01.md", "NAC-2026-GGPD-AUD-ISO-01", 
        "Auditoría de Conformidad ISO 8000, 27001 y COBIT 2019", 
        ["AUDITORIA", "ISO_8000", "ISO_27001", "COBIT_2019", "GOBERNANZA"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "AUDITORIA_NORMATIVA"
    ),
    (
        "docs/NAC_2026_GGPD_ANALISIS_INTERCONEXION_SOLAPAMIENTOS_PROCESOS_V01.md", "NAC-2026-GGPD-SOLAP-01", 
        "Análisis de Interconexión y Erradicación de Solapamientos", 
        ["PROCESOS", "INTERCONEXION", "DESACOPLAMIENTO", "FLUJO_DATOS"],
        "DISTRIBUCION", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION"], "INTERFASES_OPERACIONALES"
    ),
    (
        "docs/NAC_2026_GGPD_NORMA_GOBERNANZA_PUERTOS_SERVIDORES_V01.md", "NAC-2026-GGPD-PUERTOS-01", 
        "Norma de Gobernanza de Puertos de Red y Servidores Locales", 
        ["PUERTOS", "RED", "INFRAESTRUCTURA", "MICROSERVICIOS"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "REDES_E_INFRAESTRUCTURA"
    ),

    # --- SCGCC (CORRESPONDENCIA CORPORATIVA) ---
    (
        "apps-refactorizadas/SCGCC-REF/docs/SCGCC_DOCTEC_v1_Arquitectura_Gobernanza.md", "GGPD-SCGCC-DOCTEC-2026-V01", 
        "Manual Técnico y Arquitectura de Datos SCGCC", 
        ["SCGCC", "CORRESPONDENCIA", "ISO_15489", "HASH_SHA256", "POSTGRESQL"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "CORRESPONDENCIA_Y_TRAMITES"
    ),
    (
        "apps-refactorizadas/SCGCC-REF/docs/SCGCC_DOCFUN_v1_Informe_Avance_Solicitantes.md", "GGPD-SCGCC-DOCFUN-2026-V01", 
        "Informe Funcional Ejecutivo para Solicitantes SCGCC", 
        ["SCGCC", "INFORME_EJECUTIVO", "CERO_PAPEL", "TRAMITES"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION"], "TRAMITES_INSTITUCIONALES"
    ),
    (
        "apps-refactorizadas/SCGCC-REF/docs/GGPD_SCGCC_ESTUDIO_FACTIBILIDAD_EXPANSION_V01.md", "GGPD-SCGCC-ESTFAC-2026-V01", 
        "Estudio de Factibilidad de Expansión SCGCC V2.0", 
        ["SCGCC", "FACTIBILIDAD", "EXPANSION", "HOJA_RUTA"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "EXPANSION_SISTEMAS"
    ),
    (
        "apps-refactorizadas/SCGCC-REF/docs/DOCUMENTACION_ISO_GGPD.md", "GGPD-SCGCC-ISO-INDEX", 
        "Índice Maestro de Gobernanza y Calidad ISO SCGCC", 
        ["SCGCC", "CALIDAD_ISO", "GOBERNANZA_DOCUMENTAL"],
        "TRANSVERSAL", ["DISTRIBUCION", "TRANSVERSAL"], "CALIDAD_DOCUMENTAL"
    ),

    # --- SCMTP (MINUTAS Y TAREAS SEN) ---
    (
        "apps-refactorizadas/SCMTP-REF/docs/MANUAL_TECNICO.md", "GGPD-SCMTP-DOCTEC-2026-V01", 
        "Manual Técnico del Gestor de Tareas y Minutas SCMTP", 
        ["SCMTP", "MINUTAS", "TAREAS", "WORKFLOW_72H", "POSTGRESQL"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSMISION", "COMERCIALIZACION"], "SEGUIMIENTO_COMPROMISOS"
    ),
    (
        "apps-refactorizadas/SCMTP-REF/docs/MANUAL_FUNCIONAL.md", "GGPD-SCMTP-DOCFUN-2026-V01", 
        "Manual Funcional Operativo de Tareas y Minutas SCMTP", 
        ["SCMTP", "MANUAL_USUARIO", "ROLES", "COMPROMISOS"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSVERSAL"], "OPERACION_MINUTAS"
    ),
    (
        "apps-refactorizadas/SCMTP-REF/docs/INSTRUCTIVOS_OPERATIVOS_ISO.md", "GGPD-SCMTP-INST-ISO-01", 
        "Instructivos Operativos ISO para Seguimiento de Compromisos", 
        ["SCMTP", "INSTRUCTIVOS", "PROCEDIMIENTOS", "SEGUIMIENTO"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSVERSAL"], "INSTRUCTIVOS_OPERATIVOS"
    ),

    # --- SCTIS (TIRAS DE INTERRUPCIÓN DE DISTRIBUCIÓN) ---
    (
        "apps-refactorizadas/SCTIS-REF/docs/SCTIS_DOCTEC_v1_Arquitectura_Flujos.md", "GGPD-SCTIS-DOCTEC-2026-V01", 
        "Manual Técnico y Arquitectura de Flujos de Tiras SCTIS", 
        ["SCTIS", "INTERRUPCIONES", "TIRAS_DESPACHO", "TTI", "FMI"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSMISION"], "DESPACHO_E_INTERRUPCIONES"
    ),
    (
        "apps-refactorizadas/SCTIS-REF/docs/SCTIS_DOCFUN_v1_Beneficios_Decision.md", "GGPD-SCTIS-DOCFUN-2026-V01", 
        "Documento Funcional y Beneficios Operativos SCTIS", 
        ["SCTIS", "BENEFICIOS", "INDICADORES_CONFIABILIDAD"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSMISION"], "INDICADORES_CONFIABILIDAD"
    ),
    (
        "apps-refactorizadas/SCTIS-REF/docs/SCTIS_INSTRUCTIVO_v1_Procedimiento_Estados.md", "GGPD-SCTIS-PROC-EST-01", 
        "Procedimiento Operativo para Despachadores Estadales", 
        ["SCTIS", "DESPACHO", "ESTADOS", "PROCEDIMIENTO_CARGA"],
        "DISTRIBUCION", ["DISTRIBUCION"], "DESPACHO_ESTADAL"
    ),

    # --- SCPPE (PLANIFICACIÓN ELÉCTRICA SEN & VIÁTICOS) ---
    (
        "apps-refactorizadas/SCPPE-REF/docs/DOCUMENTO_TECNICO_ISO.md", "GGPD-SCPPE-DOCTEC-2026-V01", 
        "Manual Técnico y Modelo de Datos de Planificación SCPPE", 
        ["SCPPE", "POA", "PRTSEN", "VIATICOS", "ARBOL_ORGANIZACIONAL"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSVERSAL"], "PLANIFICACION_PRESUPUESTO_POA"
    ),
    (
        "apps-refactorizadas/SCPPE-REF/docs/ISO_8000_METAS_FISICAS.md", "GGPD-SCPPE-ISO8000-METAS", 
        "Gobernanza ISO 8000 de Metas Físicas y Presupuesto", 
        ["SCPPE", "METAS_FISICAS", "PRESUPUESTO_POA", "CALIDAD_DATOS"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSVERSAL"], "METAS_FISICAS_POA"
    ),
    (
        "apps-refactorizadas/SCPPE-REF/docs/INFORME_AUDITORIA_PRESUPUESTO.md", "GGPD-SCPPE-AUD-PRESUP", 
        "Auditoría del Flujo Presupuestario y Asignaciones POA", 
        ["SCPPE", "AUDITORIA", "PRESUPUESTO", "CONFORMIDAD"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSVERSAL"], "AUDITORIA_FINANCIERA_POA"
    ),

    # --- SIGI (CONSOLA CENTRAL DE GESTIÓN & INGESTA DATA LAKE) ---
    (
        "apps/corpoelec-sigi-gestion-planificacion-distribucion/docs/NAC_2026_GGPD_MANUAL_SISTEMA_ARQUITECTURA_SIGI_V01.md", "GGPD-SIGI-DOCTEC-2026-V01", 
        "Manual de Arquitectura del Sistema Central SIGI", 
        ["SIGI", "TORRE_CONTROL", "BI", "DATA_LAKE", "ARQUITECTURA"],
        "DISTRIBUCION", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "TORRE_CONTROL_BI"
    ),
    (
        "apps/corpoelec-sigi-gestion-planificacion-distribucion/docs/NAC_2026_GGPD_PLAN_ESTRATEGICO_MODULO_INGESTA_CALIDAD_SIGI_V01.md", "GGPD-SIGI-INGESTA-01", 
        "Plan Estratégico del Módulo de Ingesta y Calidad de Datos SIGI", 
        ["SIGI", "INGESTA_DATOS", "CALIDAD_ISO8000", "GOOGLE_DRIVE"],
        "DISTRIBUCION", ["DISTRIBUCION", "COMERCIALIZACION"], "INGESTA_DATA_LAKE"
    ),
    (
        "apps/corpoelec-sigi-gestion-planificacion-distribucion/docs/NAC_2026_GGPD_INFORME_ARQUITECTURA_GOBERNANZA_ACCESOS_SIGI_V01.md", "GGPD-SIGI-GOB-ACCESOS-01", 
        "Informe de Gobernanza de Accesos y Matriz RBAC SIGI", 
        ["SIGI", "RBAC", "MATRIZ_ACCESOS", "IAM", "SEGURIDAD"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "MATRIZ_RBAC_IAM"
    ),

    # --- SCEIN (EQUIPOS INDISPONIBLES) ---
    (
        "apps-refactorizadas/SCEIN-REF/README.md", "GGPD-SCEIN-README-2026", 
        "Especificación del Sistema de Equipos Indisponibles SCEIN", 
        ["SCEIN", "EQUIPOS_INDISPONIBLES", "SUBESTACIONES", "TRANSFORMADORES_POTENCIA"],
        "DISTRIBUCION", ["DISTRIBUCION", "TRANSMISION"], "MANTENIMIENTO_EQUIPOS_POTENCIA"
    ),

    # --- WIKI & REGLAS MAESTRAS ---
    (
        ".agents/wiki/INDEX.md", "WIKI-CENTRAL-GGPD", 
        "Índice Maestro de la Base de Conocimiento Central", 
        ["WIKI", "TAXONOMIA", "ARBOL_ORGANIZACIONAL", "NORMAS"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "TAXONOMIA_CENTRAL"
    ),
    (
        ".agents/rules/industrial_grade_standard.md", "RULE-INDUSTRIAL-GRADE-001", 
        "Regla de Grado Industrial SEN & Zona Segura Cifrada", 
        ["ESTANDAR_SEGURIDAD", "ZONA_SEGURA", "LOGIN", "OWASP", "ISO_27001"],
        "TRANSVERSAL", ["DISTRIBUCION", "COMERCIALIZACION", "TRANSMISION", "GENERACION"], "ESTANDAR_SEGURIDAD_SEN"
    )
]

def sync_rag_documents():
    print("\n📚 Sincronizando Documentos y Chunks RAG en `knowledge.mae_documentos_rag` con Taxonomía SEN...")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = False
    cur = conn.cursor()
    
    total_docs_processed = 0
    total_chunks_processed = 0
    
    for rel_path, doc_code, doc_title, tags, proc_prim, proc_impact, dom_func in KNOWLEDGE_DOCS:
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
                tags,
                proc_prim,
                proc_impact,
                dom_func
            ))
            
        upsert_query = """
        INSERT INTO knowledge.mae_documentos_rag (
            id, documento_origen, seccion, chunk_index, titulo, contenido, resumen, tags,
            proceso_primario, procesos_impactados, dominio_funcional
        ) VALUES %s
        ON CONFLICT (id) DO UPDATE SET
            documento_origen = EXCLUDED.documento_origen,
            seccion = EXCLUDED.seccion,
            titulo = EXCLUDED.titulo,
            contenido = EXCLUDED.contenido,
            resumen = EXCLUDED.resumen,
            tags = EXCLUDED.tags,
            proceso_primario = EXCLUDED.proceso_primario,
            procesos_impactados = EXCLUDED.procesos_impactados,
            dominio_funcional = EXCLUDED.dominio_funcional,
            updated_at = NOW();
        """
        execute_values(cur, upsert_query, chunk_data_list)
        total_chunks_processed += len(chunk_data_list)
        conn.commit()
        print(f"   📄 [{proc_prim}] {doc_code}: {len(chunk_data_list)} chunks indexados.")
        
    conn.close()
    print(f"✅ Total RAG: {total_docs_processed} documentos y {total_chunks_processed} chunks sincronizados con Taxonomía Multi-Proceso.")

def sync_all():
    print("=" * 75)
    print("⚡ SINCRONIZACIÓN MAESTRA DE CONOCIMIENTO SEN A INSFORGE BCI")
    print(f"   Host: {config.get('host')}")
    print(f"   Base de Datos: {config.get('database')}")
    print("=" * 75)
    
    sync_rag_documents()
    print("\n🎉 ¡Sincronización Multi-Proceso completada exitosamente en InsForge!")

if __name__ == "__main__":
    sync_all()
