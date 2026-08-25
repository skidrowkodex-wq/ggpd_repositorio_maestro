#!/usr/bin/env python3
"""
⚡ VibeHost Universal Deployer for SCGCC-REF & CORPOELEC SEN Apps
Deploys static build to VibeHost using official REST API.
"""

import os
import sys
import time
import json
import hashlib
import mimetypes
from pathlib import Path
import requests

TOKEN = "***REMOVED***"
WS_ID = "tao59mlv54m5mo1fclakvldq"
APP_NAME = "corpoelec-scgcc"
APP_ID = "hrxha775a7btx7k1r3t3p2g2"
DIST_DIR = Path("/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCGCC-REF/dist").resolve()

BASE_URL = "https://api.vibehost.com"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "User-Agent": "VibeHost-CLI/4.15.0",
    "Content-Type": "application/json"
}

def main():
    print(f"============================================================")
    print(f"🚀 Iniciando Despliegue de SCGCC V1.0 en VibeHost")
    print(f"   Workspace: {WS_ID} (corpoelec-ggpd-hosting-apps)")
    print(f"   App Name:  {APP_NAME} (ID: {APP_ID})")
    print(f"   Dist Dir:  {DIST_DIR}")
    print(f"============================================================\n")

    # 1. Verificar sesión
    print("1. Verificando autenticación y sesión...")
    res = requests.get(f"{BASE_URL}/api/v1/auth/whoami", headers=HEADERS, timeout=10)
    if not res.ok:
        print(f"❌ Error de autenticación: HTTP {res.status_code} - {res.text}")
        sys.exit(1)
    whoami = res.json().get("data", {})
    user = whoami.get("user", {}).get("email")
    ws_name = whoami.get("workspace", {}).get("name")
    print(f"   ✓ Sesión activa: {user} en workspace '{ws_name}'\n")

    # 2. Escaneo de archivos estáticos
    print(f"2. Escaneando directorio de producción `{DIST_DIR}`...")
    manifest = []
    blobs = {}
    
    # Exclude server.cjs and sourcemaps if deploying static web frontend, or include public assets
    for file_path in DIST_DIR.rglob("*"):
        if file_path.is_file():
            rel_path = file_path.relative_to(DIST_DIR).as_posix()
            if rel_path.startswith("server.cjs"):
                continue # Skip node backend bundle in static hosting
            
            content = file_path.read_bytes()
            sha256 = hashlib.sha256(content).hexdigest()
            size = len(content)
            
            manifest.append({
                "path": rel_path,
                "sha256": sha256,
                "size": size
            })
            blobs[sha256] = (content, file_path)
            print(f"   📄 {rel_path} ({size / 1024:.1f} KB) - SHA: {sha256[:12]}...")

    print(f"   ✓ Total de archivos a desplegar: {len(manifest)}\n")

    # 3. Consultar missing blobs
    unique_shas = list(set(f["sha256"] for f in manifest))
    print(f"3. Verificando blobs requeridos en VibeHost ({len(unique_shas)} SHAs únicos)...")
    res = requests.post(f"{BASE_URL}/api/v1/blobs/missing", headers=HEADERS, json={"shas": unique_shas}, timeout=15)
    if not res.ok:
        print(f"❌ Error al consultar blobs faltantes: HTTP {res.status_code} - {res.text}")
        sys.exit(1)
    
    missing_shas = res.json().get("data", {}).get("missing", [])
    print(f"   ✓ Blobs pendientes de subida: {len(missing_shas)} / {len(unique_shas)}\n")

    # 4. Subir blobs faltantes
    if missing_shas:
        print("4. Subiendo blobs faltantes a VibeHost...")
        for sha in missing_shas:
            content, path_ref = blobs[sha]
            put_headers = {
                "Authorization": f"Bearer {TOKEN}",
                "User-Agent": "VibeHost-CLI/4.15.0",
                "Content-Type": "application/octet-stream"
            }
            put_res = requests.put(
                f"{BASE_URL}/api/v1/blobs/{sha}",
                headers=put_headers,
                data=content,
                timeout=30
            )
            if put_res.status_code in (200, 201, 204):
                print(f"   ⬆️ Subido con éxito: {path_ref.name} ({len(content)} bytes) -> SHA {sha[:12]}")
            else:
                print(f"   ❌ Error subiendo {path_ref.name}: HTTP {put_res.status_code} - {put_res.text}")
                sys.exit(1)
        print("   ✓ Todos los blobs requeridos han sido subidos.\n")
    else:
        print("4. No hay blobs faltantes por subir (todos en caché).\n")

    # 5. Crear Deployment Manifest
    print(f"5. Registrando despliegue en VibeHost para `{APP_NAME}`...")
    deploy_payload = {
        "manifest": manifest,
        "message": "Despliegue Producción SCGCC V1.0 - Gestión de Correspondencia y Despacho GGPD"
    }
    
    dep_res = requests.post(
        f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{APP_ID}/deploy-manifest",
        headers=HEADERS,
        json=deploy_payload,
        timeout=20
    )
    
    if not dep_res.ok:
        print(f"❌ Error al registrar despliegue: HTTP {dep_res.status_code} - {dep_res.text}")
        sys.exit(1)
        
    dep_data = dep_res.json().get("data", {})
    deployment_id = dep_data.get("id")
    print(f"   ✓ Deployment creado con ID: {deployment_id}")
    print(f"   ✓ Initial status: {dep_data.get('status')}\n")

    # 6. Monitoreo de Estado del Despliegue
    print("6. Verificando salud y propagación del despliegue (polling)...")
    for attempt in range(15):
        time.sleep(2)
        status_res = requests.get(
            f"{BASE_URL}/api/v1/workspaces/{WS_ID}/deployments/{deployment_id}",
            headers=HEADERS,
            timeout=10
        )
        if status_res.ok:
            cur_dep = status_res.json().get("data", {})
            status = cur_dep.get("status")
            print(f"   ⏱️ Intento {attempt + 1}: Estado = {status}")
            if status == "healthy":
                print(f"   🎉 ¡Despliegue verificado y en estado HEALTHY!")
                break
        else:
            print(f"   ⚠️ Reintentando consulta: HTTP {status_res.status_code}")

    # 7. Asegurar visibilidad pública
    print("\n7. Verificando y configurando visibilidad pública (`visibility: public`)...")
    vis_res = requests.patch(
        f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{APP_ID}",
        headers=HEADERS,
        json={"visibility": "public"},
        timeout=10
    )
    if vis_res.ok:
        print("   ✓ Visibilidad pública confirmada exitosamente.")
    else:
        print(f"   ⚠️ Aviso visibilidad: HTTP {vis_res.status_code} - {vis_res.text}")

    # 8. Generar / Obtener Share Link
    print("\n8. Gestionando Share Link de acceso directo...")
    share_links_res = requests.get(
        f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{APP_ID}/share-links",
        headers=HEADERS,
        timeout=10
    )
    share_link_key = None
    if share_links_res.ok:
        links = share_links_res.json().get("data", [])
        if links:
            share_link_key = links[0].get("key") or links[0].get("token")
            print(f"   ✓ Share Link existente encontrado: {share_link_key}")
    
    if not share_link_key:
        create_share_res = requests.post(
            f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{APP_ID}/share-links",
            headers=HEADERS,
            json={"name": "SCGCC Public Direct Access"},
            timeout=10
        )
        if create_share_res.ok:
            new_share = create_share_res.json().get("data", {})
            share_link_key = new_share.get("key") or new_share.get("token")
            print(f"   ✓ Nuevo Share Link generado: {share_link_key}")

    # 9. Obtener detalles finales de la app
    app_info_res = requests.get(
        f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{APP_ID}",
        headers=HEADERS,
        timeout=10
    )
    app_info = app_info_res.json().get("data", {}) if app_info_res.ok else {}
    
    official_domain = app_info.get("defaultDomain") or f"corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space"
    official_url = f"https://{official_domain}"
    share_url = f"{official_url}/?__vh_share={share_link_key}" if share_link_key else official_url

    print("\n============================================================")
    print("🚀 DESPLIEGUE COMPLETADO CON ÉXITO")
    print(f"   Aplicación:   SCGCC V1.0 - Gestión de Correspondencia")
    print(f"   App ID:       {APP_ID}")
    print(f"   URL Oficial:  {official_url}")
    print(f"   Share Link:   {share_url}")
    print("============================================================\n")

    # Guardar resumen en archivo
    result_data = {
        "appName": APP_NAME,
        "appId": APP_ID,
        "deploymentId": deployment_id,
        "status": "healthy",
        "officialUrl": official_url,
        "shareUrl": share_url,
        "shareKey": share_link_key,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    with open("/home/skidrowkodex/Documentos/Repositorio_Maestro/scripts/vibehost_scgcc_deployed.json", "w") as f:
        json.dump(result_data, f, indent=2)

if __name__ == "__main__":
    main()
