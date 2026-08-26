#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD | BCI TOKEN & ACCESS ADMINISTRATOR (ISO 27001)
Herramienta de gestión centralizada de accesos y tokens para programadores de IA.

Uso:
  python3 bci_admin.py --generate --user yvan.cipiran --name "Ing. Yván Cipirán" --email y.cipiran@corpoelec.gob.ve --role NIVEL_3_RESERVADO_DIRECTIVA --days 90
  python3 bci_admin.py --list
  python3 bci_admin.py --revoke <TOKEN_PREFIX_O_ID> --reason "Cambio de cargo"
  python3 bci_admin.py --audit [usuario]
"""

import argparse
import hashlib
import json
import os
import secrets
import sys
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import DictCursor

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "connection.json")
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

DB_URI = config["connection_uri"]

def get_db():
    return psycopg2.connect(DB_URI)

def generate_secure_token(user_id, name, email, division="Planificación de Distribución (GGPD)", role="NIVEL_2_TECNICO", quota=1000, days=90, emitido_por="admin.ggpd"):
    # Generar token con 32 bytes de entropía criptográfica
    raw_secret = secrets.token_hex(24) # 48 hex chars
    token_plain = f"bci_live_{raw_secret}"
    token_prefix = token_plain[:15] # 'bci_live_8f3a9e'
    
    # Calcular Hash SHA-256
    token_hash = hashlib.sha256(token_plain.encode("utf-8")).hexdigest()
    fecha_expiracion = datetime.now() + timedelta(days=days)
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO knowledge.mae_api_tokens (
        token_prefix, token_hash, usuario_id, nombre_desarrollador, correo_institucional,
        gerencia_division, nivel_acceso, cuota_diaria_consultas, fecha_expiracion, estado, emitido_por
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'ACTIVO', %s)
    RETURNING id;
    """, (token_prefix, token_hash, user_id, name, email, division, role, quota, fecha_expiracion, emitido_por))
    
    token_id = cur.fetchone()[0]
    conn.commit()
    conn.close()
    
    print("\n" + "=" * 75)
    print("🔑 NUEVO TOKEN BCI EMITIDO EXITOSAMENTE (ISO/IEC 27001)")
    print("=" * 75)
    print(f"  🔹 ID Registro:        {token_id}")
    print(f"  🔹 Usuario:            {user_id} ({name})")
    print(f"  🔹 Correo:             {email}")
    print(f"  🔹 Gerencia/División:  {division}")
    print(f"  🔹 Nivel de Acceso:    {role}")
    print(f"  🔹 Cuota Diaria:       {quota} consultas/día")
    print(f"  🔹 Válido Hasta:       {fecha_expiracion.strftime('%Y-%m-%d %H:%M:%S')} ({days} días)")
    print("=" * 75)
    print("⚠️  IMPORTANTE: Entregue este token al programador. No se volverá a mostrar:")
    print(f"\n👉  TOKEN SECRETO: {token_plain}\n")
    print("=" * 75 + "\n")
    return token_plain

def list_tokens():
    conn = get_db()
    cur = conn.cursor(cursor_factory=DictCursor)
    cur.execute("""
    SELECT id, token_prefix, usuario_id, nombre_desarrollador, correo_institucional,
           nivel_acceso, cuota_diaria_consultas, consultas_hoy, fecha_expiracion, estado, ultimo_acceso
    FROM knowledge.mae_api_tokens
    ORDER BY created_at DESC;
    """)
    rows = cur.fetchall()
    conn.close()
    
    print("\n" + "=" * 90)
    print("📋 TOKENS DE DESARROLLADORES REGISTRADOS EN BCI:")
    print("=" * 90)
    if not rows:
        print("  No hay tokens emitidos actualmente.\n")
        return
        
    for r in rows:
        exp = r['fecha_expiracion'].strftime('%Y-%m-%d')
        last = r['ultimo_acceso'].strftime('%Y-%m-%d %H:%M') if r['ultimo_acceso'] else 'Nunca'
        status_icon = "🟢" if r['estado'] == 'ACTIVO' else ("🔴" if r['estado'] == 'REVOCADO' else "🟡")
        print(f"{status_icon} [{r['token_prefix']}...] | Usuario: {r['usuario_id']} ({r['nombre_desarrollador']})")
        print(f"   Rol: {r['nivel_acceso']} | Cuota: {r['consultas_hoy']}/{r['cuota_diaria_consultas']} hoy | Expira: {exp} | Último uso: {last}")
        print(f"   Estado: {r['estado']} | ID: {r['id']}\n")
    print("=" * 90 + "\n")

def revoke_token(token_prefix_or_id, reason="Revocación Administrativa"):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    UPDATE knowledge.mae_api_tokens
    SET estado = 'REVOCADO', motivo_revocacion = %s, updated_at = NOW()
    WHERE token_prefix ILIKE %s OR id::text = %s OR usuario_id = %s
    RETURNING usuario_id, nombre_desarrollador;
    """, (reason, f"%{token_prefix_or_id}%", token_prefix_or_id, token_prefix_or_id))
    
    row = cur.fetchone()
    conn.commit()
    conn.close()
    
    if row:
        print(f"🛑 Token de '{row[0]}' ({row[1]}) REVOCADO exitosamente. Motivo: {reason}")
    else:
        print(f"❌ No se encontró token con identificador: {token_prefix_or_id}")

def view_audit(user_filter=None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=DictCursor)
    if user_filter:
        cur.execute("""
        SELECT a.created_at, a.usuario_id, a.tipo_consulta, a.termino_busqueda,
               a.chunks_retornados, a.latencia_ms, a.client_agent
        FROM knowledge.mae_auditoria_consultas a
        WHERE a.usuario_id ILIKE %s
        ORDER BY a.created_at DESC LIMIT 50;
        """, (f"%{user_filter}%",))
    else:
        cur.execute("""
        SELECT a.created_at, a.usuario_id, a.tipo_consulta, a.termino_busqueda,
               a.chunks_retornados, a.latencia_ms, a.client_agent
        FROM knowledge.mae_auditoria_consultas a
        ORDER BY a.created_at DESC LIMIT 50;
        """)
    rows = cur.fetchall()
    conn.close()
    
    print("\n" + "=" * 90)
    print("🛡️ BITÁCORA DE AUDITORÍA ISO 27001 / ISACA COBIT (Últimos 50 eventos):")
    print("=" * 90)
    if not rows:
        print("  No hay registros de auditoría aún.\n")
        return
    for r in rows:
        ts = r['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{ts}] Usuario: {r['usuario_id']:<15} | Tipo: {r['tipo_consulta']:<15} | Chunks: {r['chunks_retornados']} ({r['latencia_ms']}ms) | Client: {r['client_agent']}")
        if r['termino_busqueda']:
            print(f"   Query: \"{r['termino_busqueda'][:70]}\"")
    print("=" * 90 + "\n")

def main():
    parser = argparse.ArgumentParser(description="BCI Access & Token Administrator")
    parser.add_argument("--generate", action="store_true", help="Generar nuevo token para desarrollador")
    parser.add_argument("--user", type=str, help="ID de usuario (ej. yvan.cipiran)")
    parser.add_argument("--name", type=str, help="Nombre del desarrollador")
    parser.add_argument("--email", type=str, help="Correo institucional")
    parser.add_argument("--division", type=str, default="Planificación de Distribución (GGPD)", help="División o Gerencia")
    parser.add_argument("--role", type=str, default="NIVEL_2_TECNICO", choices=["NIVEL_1_GENERAL", "NIVEL_2_TECNICO", "NIVEL_3_RESERVADO_DIRECTIVA"], help="Nivel de acceso")
    parser.add_argument("--quota", type=int, default=1000, help="Cuota diaria de consultas")
    parser.add_argument("--days", type=int, default=90, help="Días de validez")
    parser.add_argument("--list", action="store_true", help="Listar tokens emitidos")
    parser.add_argument("--revoke", type=str, help="Revocar token por prefijo, ID o usuario")
    parser.add_argument("--reason", type=str, default="Instrucción de Seguridad / Cambio de Perfil", help="Motivo de revocación")
    parser.add_argument("--audit", nargs="?", const="", help="Ver bitácora de auditoría")
    
    args = parser.parse_args()
    
    if args.generate:
        if not args.user or not args.name or not args.email:
            print("❌ Error: Para generar un token debe especificar --user, --name y --email")
            sys.exit(1)
        generate_secure_token(args.user, args.name, args.email, args.division, args.role, args.quota, args.days)
    elif args.list:
        list_tokens()
    elif args.revoke:
        revoke_token(args.revoke, args.reason)
    elif args.audit is not None:
        view_audit(args.audit if args.audit else None)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
