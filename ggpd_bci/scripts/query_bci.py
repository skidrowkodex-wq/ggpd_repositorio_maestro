#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD | CLI DE CONSULTA GGPD-BCI
Herramienta de consulta rápida de la Base de Conocimiento Inteligente.
Ahorra tokens permitiendo a los agentes obtener datos específicos bajo demanda.

Uso:
  python3 query_bci.py --facts [categoria]
  python3 query_bci.py --decisions [busqueda]
  python3 query_bci.py --search "término de búsqueda RAG"
  python3 query_bci.py --graph [app]
  python3 query_bci.py --summary
"""

import argparse
import json
import os
import sys
import psycopg2

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "connection.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

DB_URI = config["connection_uri"]

def get_connection():
    return psycopg2.connect(DB_URI)

def query_facts(categoria=None):
    conn = get_connection()
    cur = conn.cursor()
    if categoria:
        cur.execute("SELECT id, categoria, clave, valor_texto, valor_json, descripcion FROM knowledge.mae_hechos_l1 WHERE categoria ILIKE %s AND vigente = TRUE;", (f"%{categoria}%",))
    else:
        cur.execute("SELECT id, categoria, clave, valor_texto, valor_json, descripcion FROM knowledge.mae_hechos_l1 WHERE vigente = TRUE ORDER BY categoria, clave;")
        
    rows = cur.fetchall()
    print(f"\n📦 HECHOS ATÓMICOS L1 ({len(rows)} encontrados):")
    print("-" * 75)
    for r in rows:
        val = r[3] if r[3] is not None else json.dumps(r[4], indent=2, ensure_ascii=False)
        print(f"🔹 [{r[1]}] {r[2]} (ID: {r[0]}):")
        print(f"   Valor: {val}")
        print(f"   Descripción: {r[5]}\n")
    conn.close()

def query_decisions(query=None):
    conn = get_connection()
    cur = conn.cursor()
    if query:
        cur.execute("""
        SELECT codigo_documento, titulo, escenario, decision, justificacion_normativa, impacto_sistemas, fecha_decision
        FROM knowledge.mae_decisiones_l2
        WHERE titulo ILIKE %s OR escenario ILIKE %s OR decision ILIKE %s OR codigo_documento ILIKE %s
        ORDER BY fecha_decision DESC;
        """, (f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%"))
    else:
        cur.execute("""
        SELECT codigo_documento, titulo, escenario, decision, justificacion_normativa, impacto_sistemas, fecha_decision
        FROM knowledge.mae_decisiones_l2
        ORDER BY fecha_decision DESC;
        """)
        
    rows = cur.fetchall()
    print(f"\n🏛️ DECISIONES Y DICTÁMENES L2 ({len(rows)} encontrados):")
    print("-" * 75)
    for r in rows:
        print(f"📜 [{r[0]}] {r[1]} ({r[6]}):")
        print(f"   Escenario: {r[2]}")
        print(f"   Decisión:  {r[3]}")
        print(f"   Normativa: {r[4]}")
        print(f"   Impacto:   {', '.join(r[5]) if r[5] else 'General'}\n")
    conn.close()

def search_rag(search_text, limit=5):
    conn = get_connection()
    cur = conn.cursor()
    
    # Búsqueda combinada: Full-Text Search tsvector + ILIKE de respaldo
    sql = """
    SELECT 
        id, documento_origen, seccion, titulo, contenido, resumen, tags,
        ts_rank(tsv_contenido, plainto_tsquery('spanish', %s)) AS rank
    FROM knowledge.mae_documentos_rag
    WHERE tsv_contenido @@ plainto_tsquery('spanish', %s)
       OR contenido ILIKE %s
       OR titulo ILIKE %s
    ORDER BY rank DESC
    LIMIT %s;
    """
    like_query = f"%{search_text}%"
    cur.execute(sql, (search_text, search_text, like_query, like_query, limit))
    rows = cur.fetchall()
    
    print(f"\n🔍 RESULTADOS DE BÚSQUEDA RAG L3 para '{search_text}' ({len(rows)} fragmentos):")
    print("=" * 75)
    for idx, r in enumerate(rows, 1):
        print(f"\n[{idx}] 📄 Doc: {r[1]} | Sección: {r[2]} (Score: {r[7]:.4f})")
        print(f"    Tags: {', '.join(r[6]) if r[6] else 'N/A'}")
        print(f"    Resumen: {r[5]}")
        print("    Contenido:")
        # Print indented snippet
        lines = r[4].strip().split('\n')
        for line in lines[:12]:
            print(f"      {line}")
        if len(lines) > 12:
            print(f"      ... [{len(lines)-12} líneas adicionales omitidas para ahorrar tokens]")
    conn.close()

def query_graph(app_filter=None):
    conn = get_connection()
    cur = conn.cursor()
    if app_filter:
        cur.execute("""
        SELECT aplicacion, tipo_nodo, nombre_nodo, puerto, descripcion, lecturas_db, escrituras_db, enlaces_apps
        FROM knowledge.mae_grafo_codigo
        WHERE aplicacion ILIKE %s OR id ILIKE %s;
        """, (f"%{app_filter}%", f"%{app_filter}%"))
    else:
        cur.execute("""
        SELECT aplicacion, tipo_nodo, nombre_nodo, puerto, descripcion, lecturas_db, escrituras_db, enlaces_apps
        FROM knowledge.mae_grafo_codigo
        ORDER BY aplicacion;
        """)
        
    rows = cur.fetchall()
    print(f"\n🌐 GRAFO DE CÓDIGO Y ARQUITECTURA L4 ({len(rows)} nodos):")
    print("-" * 75)
    for r in rows:
        print(f"🔹 {r[0]} ({r[1]}) - Puerto: {r[3] or 'N/A'}:")
        print(f"   Rol/Desc: {r[4]}")
        if r[5]: print(f"   Lecturas DB:   {', '.join(r[5])}")
        if r[6]: print(f"   Escrituras DB: {', '.join(r[6])}")
        if r[7]: print(f"   Enlaces/Dep:   {', '.join(r[7])}")
        print("")
    conn.close()

def show_summary():
    conn = get_connection()
    cur = conn.cursor()
    print("\n" + "=" * 70)
    print("🧠 ESTADO DE LA BASE DE CONOCIMIENTOS INTELIGENTE (GGPD-BCI)")
    print(f"   Alias: {config['alias']}")
    print(f"   Host:  {config['host']}")
    print("=" * 70)
    
    cur.execute("SELECT count(*) FROM knowledge.mae_hechos_l1;")
    print(f"  🔹 Hechos Atómicos L1:            {cur.fetchone()[0]} registros")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_decisiones_l2;")
    print(f"  🔹 Decisiones y Dictámenes L2:    {cur.fetchone()[0]} directrices")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_documentos_rag;")
    print(f"  🔹 Chunks Documentales RAG L3:    {cur.fetchone()[0]} fragmentos indexados")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_grafo_codigo;")
    print(f"  🔹 Nodos Grafo de Código L4:      {cur.fetchone()[0]} aplicaciones")
    
    cur.execute("SELECT count(*) FROM knowledge.mae_sesiones_handoff;")
    print(f"  🔹 Sesiones de Handoff L5:        {cur.fetchone()[0]} sesiones")
    print("=" * 70 + "\n")
    conn.close()

def main():
    parser = argparse.ArgumentParser(description="CLI de Consulta GGPD-BCI")
    parser.add_argument("--facts", nargs="?", const="", help="Consultar hechos L1 (opcional: categoria)")
    parser.add_argument("--decisions", nargs="?", const="", help="Consultar decisiones L2 (opcional: filtro)")
    parser.add_argument("--search", type=str, help="Buscar en RAG L3 por lenguaje natural")
    parser.add_argument("--graph", nargs="?", const="", help="Consultar grafo L4 (opcional: app)")
    parser.add_argument("--summary", action="store_true", help="Mostrar resumen de BCI")
    
    args = parser.parse_args()
    
    if args.summary or len(sys.argv) == 1:
        show_summary()
    if args.facts is not None:
        query_facts(args.facts if args.facts else None)
    if args.decisions is not None:
        query_decisions(args.decisions if args.decisions else None)
    if args.search:
        search_rag(args.search)
    if args.graph is not None:
        query_graph(args.graph if args.graph else None)

if __name__ == "__main__":
    main()
