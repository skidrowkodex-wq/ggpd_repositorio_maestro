#!/usr/bin/env python3
"""
⚡ Universal VibeHost Deployer for Repositorio Maestro CORPOELEC
Deploys any target app's dist directory to VibeHost using REST API.
"""

import os
import sys
import time
import json
import hashlib
from pathlib import Path
import requests

TOKEN = os.getenv("VIBEHOST_TOKEN", "***REMOVED***")
WS_ID = os.getenv("VIBEHOST_WS_ID", "tao59mlv54m5mo1fclakvldq")
BASE_URL = "https://api.vibehost.com"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "User-Agent": "VibeHost-CLI/4.15.0",
    "Content-Type": "application/json"
}

def deploy_app(app_name, app_id, dist_dir_path, message="Deploy production build"):
    dist_dir = Path(dist_dir_path).resolve()
    print(f"============================================================")
    print(f"🚀 Desplegando `{app_name}` (ID: {app_id})")
    print(f"   Dist Dir: {dist_dir}")
    print(f"============================================================")

    # 1. Scan files
    manifest = []
    blobs = {}
    for p in dist_dir.rglob("*"):
        if p.is_file():
            rel = p.relative_to(dist_dir).as_posix()
            if rel.startswith("server.cjs"):
                continue
            content = p.read_bytes()
            sha = hashlib.sha256(content).hexdigest()
            manifest.append({
                "path": rel,
                "sha256": sha,
                "size": len(content)
            })
            blobs[sha] = (content, p)
            print(f"   📄 {rel} ({len(content)/1024:.1f} KB)")

    # 2. Check missing blobs
    unique_shas = list(set(f["sha256"] for f in manifest))
    res = requests.post(f"{BASE_URL}/api/v1/blobs/missing", headers=HEADERS, json={"shas": unique_shas}, timeout=15)
    if not res.ok:
        print(f"❌ Error missing blobs: HTTP {res.status_code} - {res.text}")
        return False
    missing = res.json().get("data", {}).get("missing", [])
    print(f"   ✓ Blobs a subir: {len(missing)} / {len(unique_shas)}")

    # 3. Upload missing
    for sha in missing:
        content, path_ref = blobs[sha]
        put_headers = {
            "Authorization": f"Bearer {TOKEN}",
            "User-Agent": "VibeHost-CLI/4.15.0",
            "Content-Type": "application/octet-stream"
        }
        put_res = requests.put(f"{BASE_URL}/api/v1/blobs/{sha}", headers=put_headers, data=content, timeout=30)
        if put_res.status_code in (200, 201, 204):
            print(f"   ⬆️ Subido: {path_ref.name} -> {sha[:12]}")
        else:
            print(f"   ❌ Error subiendo {path_ref.name}: HTTP {put_res.status_code}")
            return False

    # 4. Deploy Manifest
    dep_res = requests.post(
        f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}/deploy-manifest",
        headers=HEADERS,
        json={"manifest": manifest, "message": message},
        timeout=20
    )
    if not dep_res.ok:
        print(f"❌ Error en deploy manifest: HTTP {dep_res.status_code} - {dep_res.text}")
        return False
    dep_data = dep_res.json().get("data", {})
    deployment_id = dep_data.get("id")
    print(f"   ✓ Deployment ID: {deployment_id}")

    # 5. Poll
    for _ in range(15):
        time.sleep(2)
        st = requests.get(f"{BASE_URL}/api/v1/workspaces/{WS_ID}/deployments/{deployment_id}", headers=HEADERS, timeout=10)
        if st.ok and st.json().get("data", {}).get("status") == "healthy":
            print(f"   🎉 ¡Despliegue verificado y HEALTHY!")
            break

    # 6. Share link
    share_res = requests.get(f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}/share-links", headers=HEADERS, timeout=10)
    share_key = None
    if share_res.ok:
        links = share_res.json().get("data", [])
        if links:
            share_key = links[0].get("key") or links[0].get("token")
    if not share_key:
        create_res = requests.post(
            f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}/share-links",
            headers=HEADERS,
            json={"name": f"{app_name} Share Link"},
            timeout=10
        )
        if create_res.ok:
            share_key = create_res.json().get("data", {}).get("key")

    app_res = requests.get(f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}", headers=HEADERS, timeout=10)
    app_data = app_res.json().get("data", {}) if app_res.ok else {}
    domain = app_data.get("fqdn") or app_data.get("defaultDomain") or f"{app_name}-{WS_ID}.vibehost.space"
    official_url = f"https://{domain}"
    share_url = f"{official_url}/?__vh_share={share_key}" if share_key else official_url

    print(f"\n   ✅ URL Oficial: {official_url}")
    print(f"   🔗 Share Link:  {share_url}\n")
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "sigi"
    apps_map = {
        "sigi": ("corpoelec-sigi", "a53r8tvlvt9ihw09maca8a2g", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist", "Actualización SIGI con Grado Industrial"),
        "scgcc": ("corpoelec-scgcc", "hrxha775a7btx7k1r3t3p2g2", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCGCC-REF/dist", "Actualización SCGCC V1.0 Grado Industrial"),
        "scmtp": ("corpoelec-scmtp", "xon0wv9a3s45vomgd22w8kp3", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCMTP-REF/dist", "Actualización SCMTP V2.0 Grado Industrial"),
        "scppe": ("corpoelec-scppe", "c947eg8pgpux8vffy0bjt7ms", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCPPE-REF/dist", "Actualización SCPPE V3.0 Grado Industrial"),
        "scein": ("corpoelec-scein", "pqb1ryl1s59ner372rbmf559", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCEIN-REF/dist", "Actualización SCEIN V3.0 Grado Industrial"),
        "sctis": ("corpoelec-sctis", "yq94rtmw5enw9bual08l0p3u", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCTIS-REF/dist", "Actualización SCTIS V2.0 Grado Industrial"),
    }
    if target in apps_map:
        name, app_id, path, msg = apps_map[target]
        deploy_app(name, app_id, path, msg)
    else:
        print(f"Target '{target}' no reconocido. Opciones: {list(apps_map.keys())}")
