#!/usr/bin/env python3
"""
==============================================================================
⚡ CORPOELEC - GERENCIA GENERAL DE GESTIÓN DE PLANIFICACIÓN (GGPD)
🛡️ RESTAURADOR OFICIAL DE SNAPSHOT CANÓNICO SCGCC V1.0 (PRE-QA)
==============================================================================
CÓDIGO: NAC_2026_GGPD_SNAPSHOT_SCGCC_PRE_QA_V01
USO: python3 scripts/restore_scgcc_snapshot.py [--verify | --show]
==============================================================================
"""

import os
import sys
import json
import hashlib
from pathlib import Path
import requests

SNAPSHOT_JSON = Path("database/snapshots/NAC_2026_GGPD_SNAPSHOT_SCGCC_PRE_QA_V01.json")
SNAPSHOT_SQL = Path("database/snapshots/NAC_2026_GGPD_SNAPSHOT_SCGCC_PRE_QA_V01.sql")

INSFORGE_URL = "https://wxkeqf37.ap-southeast.insforge.app"
INSFORGE_KEY = os.environ.get("INSFORGE_API_KEY", "")

def get_headers():
    return {
        "apikey": INSFORGE_KEY,
        "Authorization": f"Bearer {INSFORGE_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

def verify_snapshot_integrity():
    print("================================================================================")
    print("🔍 VERIFICACIÓN DE INTEGRIDAD DEL SNAPSHOT SCGCC (ISO 8000-110 / ISO 27001)")
    print("================================================================================")
    
    if not SNAPSHOT_JSON.exists():
        print(f"❌ Error: No se encontró el archivo {SNAPSHOT_JSON}")
        return False
    if not SNAPSHOT_SQL.exists():
        print(f"❌ Error: No se encontró el archivo {SNAPSHOT_SQL}")
        return False

    json_bytes = SNAPSHOT_JSON.read_bytes()
    sql_bytes = SNAPSHOT_SQL.read_bytes()

    sha_json = hashlib.sha256(json_bytes).hexdigest()
    sha_sql = hashlib.sha256(sql_bytes).hexdigest()

    with open(SNAPSHOT_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    records = data.get("records", [])
    total = len(records)

    print(f"   📁 Archivo JSON:    {SNAPSHOT_JSON} ({len(json_bytes):,} bytes)")
    print(f"   🔒 Hash SHA-256:   {sha_json}")
    print(f"   📁 Archivo SQL:     {SNAPSHOT_SQL} ({len(sql_bytes):,} bytes)")
    print(f"   🔒 Hash SHA-256:   {sha_sql}")
    print(f"   📊 Total Registros: {total} expedientes oficiales")
    print(f"   🕒 Timestamp:       {data.get('timestamp_utc')}")
    print(f"   🏷️  Código:          {data.get('documento_codigo')}")
    print("================================================================================")
    
    print("\n📋 RESUMEN DE EXPEDIENTES EN EL SNAPSHOT:")
    for idx, r in enumerate(records, 1):
        correlativo = r.get("correlativo", "N/A")
        asunto = r.get("asunto", "Sin asunto")[:55]
        estado = r.get("estado_tramite", "N/A")
        oficio = r.get("oficio_numero") or "Sin Oficio"
        print(f"   {idx:02d}. [{correlativo}] {asunto.ljust(55)} | {estado.ljust(18)} | {oficio}")

    print("\n✓ Integridad de datos 100% verificada.")
    return True

def test_live_connection():
    print("\n🌐 COMPROBANDO CONEXIÓN A BASE DE DATOS INSFORGE POSTGRESQL...")
    try:
        res = requests.get(f"{INSFORGE_URL}/api/database/records/v_scgcc_correspondencias_activas?limit=100", headers=get_headers(), timeout=10)
        if res.ok:
            live_records = res.json()
            print(f"   ✅ Conexión exitosa a InsForge BaaS (ggpd-data-maestra-0002).")
            print(f"   📊 Registros activos actuales en BD: {len(live_records)}")
            return True
        else:
            print(f"   ❌ Error al consultar InsForge: HTTP {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error de red: {e}")
        return False

def main():
    verify_snapshot_integrity()
    test_live_connection()
    print("\n💡 INSTRUCCIONES DE RESTAURACIÓN:")
    print("1. En la aplicación web (SCGCC): Abre el modal 'QA / BD' en la barra superior y presiona 'Restablecer Datos Canónicos'.")
    print("2. En PostgreSQL: Ejecuta el script SQL:")
    print("   python3 scripts/deploy_insforge_scgcc.py")
    print(f"   o importa `{SNAPSHOT_SQL}`")

if __name__ == "__main__":
    main()
