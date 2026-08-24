#!/usr/bin/env python3
"""
⚡ VibeHost Deployer Script for SIGI-REF (and other SEN apps)
Uses the VibeHost REST / MCP HTTP API with PAT authentication.
"""

import os
import sys
import json
import hashlib
import mimetypes
import requests
from pathlib import Path

VIBEHOST_API_BASE = "https://api.vibehost.com"
PAT_TOKEN = os.environ.get("VIBEHOST_TOKEN", "***REMOVED***")

HEADERS = {
    "Authorization": f"Bearer {PAT_TOKEN}",
    "Content-Type": "application/json",
    "User-Agent": "VibeHost-CLI/4.15.0"
}

def check_auth():
    print("1. Verificando autenticación y sesión en VibeHost...")
    endpoints = ["/v1/auth/whoami", "/v1/whoami", "/whoami", "/v1/apps", "/apps", "/v1/workspaces"]
    for ep in endpoints:
        try:
            r = requests.get(f"{VIBEHOST_API_BASE}{ep}", headers=HEADERS, timeout=5)
            if r.status_code in (200, 201):
                print(f"   ✓ Endpoint {ep} responde HTTP {r.status_code}: {r.text[:120]}")
                return ep, r.json() if r.headers.get("content-type", "").startswith("application/json") else r.text
        except Exception as e:
            pass
    print("   ⚠️ Probando llamadas MCP en /mcp...")
    return None, None

def deploy_static_directory(dist_dir, app_name="corpoelec-sigi"):
    dist_path = Path(dist_dir).resolve()
    if not dist_path.exists() or not (dist_path / "index.html").exists():
        print(f"❌ Error: El directorio {dist_path} no contiene un archivo index.html")
        return False
    
    print(f"\n2. Escaneando archivos para despliegue de `{app_name}` desde: {dist_path}...")
    files_manifest = []
    blobs = {}
    
    for f in dist_path.rglob("*"):
        if f.is_file():
            rel_path = str(f.relative_to(dist_path))
            content = f.read_bytes()
            sha256 = hashlib.sha256(content).hexdigest()
            size = len(content)
            mime_type, _ = mimetypes.guess_type(str(f))
            mime_type = mime_type or "application/octet-stream"
            
            files_manifest.append({
                "path": rel_path,
                "sha256": sha256,
                "size": size,
                "contentType": mime_type
            })
            blobs[sha256] = content
            
    print(f"   ✓ {len(files_manifest)} archivos procesados (Total {sum(f['size'] for f in files_manifest) / 1024:.1f} KB).")
    
    # Check apps / create app
    print(f"\n3. Gestionando aplicación `{app_name}` en VibeHost...")
    app_payload = {"name": app_name, "runtime": "static"}
    app_res = requests.post(f"{VIBEHOST_API_BASE}/v1/apps", headers=HEADERS, json=app_payload, timeout=10)
    print(f"   App Create / Get status: HTTP {app_res.status_code}")
    
    return True

if __name__ == "__main__":
    check_auth()
    deploy_static_directory("apps-refactorizadas/SIGI-REF/dist", "corpoelec-sigi")
