#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD | BCI CLIENT SDK (PYTHON)
Módulo ligero para que agentes, subagentes o bots consulten la
Base de Conocimiento Inteligente de InsForge con cero sobrecarga local.
"""

import json
import os
import psycopg2
from typing import Any, Dict, List, Optional

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "connection.json")

class BCIClient:
    def __init__(self, config_path: str = CONFIG_PATH):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)
        self.db_uri = self.config["connection_uri"]
        
    def _get_conn(self):
        return psycopg2.connect(self.db_uri)
        
    def get_fact(self, fact_id: str) -> Optional[Any]:
        """Obtiene un hecho atómico L1 por su ID (ej. 'fact_ports', 'fact_targets_2026')."""
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute("SELECT valor_texto, valor_json FROM knowledge.mae_hechos_l1 WHERE id = %s AND vigente = TRUE;", (fact_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        return row[0] if row[0] is not None else row[1]
        
    def get_decision(self, doc_code_or_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene una decisión L2 por código de documento o ID."""
        conn = self._get_conn()
        cur = conn.cursor()
        cur.execute("""
        SELECT codigo_documento, titulo, escenario, decision, justificacion_normativa, impacto_sistemas, fecha_decision
        FROM knowledge.mae_decisiones_l2
        WHERE id = %s OR codigo_documento = %s;
        """, (doc_code_or_id, doc_code_or_id))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        return {
            "codigo_documento": row[0],
            "titulo": row[1],
            "escenario": row[2],
            "decision": row[3],
            "justificacion_normativa": row[4],
            "impacto_sistemas": row[5],
            "fecha_decision": str(row[6])
        }
        
    def search_rag(self, query_text: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Busca fragmentos relevantes en la base documental L3."""
        conn = self._get_conn()
        cur = conn.cursor()
        sql = """
        SELECT id, documento_origen, seccion, titulo, contenido, resumen, tags,
               ts_rank(tsv_contenido, plainto_tsquery('spanish', %s)) AS rank
        FROM knowledge.mae_documentos_rag
        WHERE tsv_contenido @@ plainto_tsquery('spanish', %s)
           OR contenido ILIKE %s
        ORDER BY rank DESC
        LIMIT %s;
        """
        cur.execute(sql, (query_text, query_text, f"%{query_text}%", limit))
        rows = cur.fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "doc": r[1],
                "section": r[2],
                "title": r[3],
                "content": r[4],
                "summary": r[5],
                "tags": r[6],
                "rank": float(r[7])
            }
            for r in rows
        ]

if __name__ == "__main__":
    bci = BCIClient()
    print("✅ Probando BCIClient:")
    ports = bci.get_fact("fact_ports")
    print(f"Puertos registrados: {ports}")
    
    rag_sample = bci.search_rag("Super-App", limit=1)
    if rag_sample:
        print(f"RAG Resultado: [{rag_sample[0]['doc']}] {rag_sample[0]['title']}")
