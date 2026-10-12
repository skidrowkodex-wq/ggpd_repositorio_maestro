#!/usr/bin/env python3
"""
⚡ Universal VibeHost Deployer for Repositorio Maestro CORPOELEC
Deploys any target app's dist directory to VibeHost using the REST API.

Sin dependencias externas (solo stdlib de Python): usa urllib en lugar de
`requests`, de modo que funciona en cualquier entorno (incluido Windows)
sin necesidad de instalar paquetes.

Uso:
    python scripts/deploy_vibehost_app.py <target>
    python scripts/deploy_vibehost_app.py --list

El token se lee de la variable de entorno VIBEHOST_TOKEN o, si no existe,
de .env.local (nunca se hardcodea en el código).
"""

import os
import sys
import time
import json
import hashlib
import urllib.request
import urllib.error
from pathlib import Path

# Consolas Windows (cp1252) no soportan emojis: forzar UTF-8 en stdout/stderr.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent


def _load_env_file(path: Path) -> dict:
    data = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            data[key.strip()] = value.strip().strip('"').strip("'")
    return data


_ENV_LOCAL = _load_env_file(REPO_ROOT / ".env.local")

TOKEN = os.getenv("VIBEHOST_TOKEN") or _ENV_LOCAL.get("VIBEHOST_TOKEN", "")
WS_ID = os.getenv("VIBEHOST_WS_ID") or _ENV_LOCAL.get("VIBEHOST_WS_ID") or "tao59mlv54m5mo1fclakvldq"
BASE_URL = "https://api.vibehost.com"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "User-Agent": "VibeHost-CLI/4.15.0",
    "Content-Type": "application/json",
}


def _request(method: str, url: str, body: bytes | None = None, content_type: str | None = None):
    """Ejecuta una petición HTTP y devuelve (status, payload).

    `payload` es un dict si la respuesta es JSON, o texto crudo si no lo es.
    No lanza excepción en errores HTTP: devuelve el código para poder informarlos.
    """
    headers = dict(HEADERS)
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            raw = resp.read()
            try:
                return resp.status, json.loads(raw.decode("utf-8") or "{}")
            except json.JSONDecodeError:
                return resp.status, raw.decode("utf-8", "ignore")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "ignore")[:500]


def deploy_app(app_name, app_id, dist_dir_path, message="Deploy production build"):
    dist_dir = Path(dist_dir_path).resolve()
    print("============================================================")
    print(f"🚀 Desplegando `{app_name}` (ID: {app_id})")
    print(f"   Dist Dir: {dist_dir}")
    print("============================================================")

    if not dist_dir.is_dir():
        print(f"❌ No existe el directorio de build: {dist_dir}")
        return False

    # 1. Escanear archivos
    manifest = []
    blobs = {}
    for p in sorted(dist_dir.rglob("*")):
        if p.is_file():
            rel = p.relative_to(dist_dir).as_posix()
            if rel.startswith("server.cjs"):
                continue
            content = p.read_bytes()
            sha = hashlib.sha256(content).hexdigest()
            manifest.append({"path": rel, "sha256": sha, "size": len(content)})
            blobs[sha] = (content, p)
            print(f"   📄 {rel} ({len(content)/1024:.1f} KB)")

    # 2. Consultar blobs faltantes
    unique_shas = list(set(f["sha256"] for f in manifest))
    status, res = _request(
        "POST", f"{BASE_URL}/api/v1/blobs/missing",
        json.dumps({"shas": unique_shas}).encode(),
    )
    if status != 200 or not isinstance(res, dict):
        print(f"❌ Error missing blobs: HTTP {status} - {res}")
        return False
    missing = res.get("data", {}).get("missing", [])
    print(f"   ✓ Blobs a subir: {len(missing)} / {len(unique_shas)}")

    # 3. Subir los faltantes
    for sha in missing:
        content, path_ref = blobs[sha]
        status, _ = _request(
            "PUT", f"{BASE_URL}/api/v1/blobs/{sha}", content,
            content_type="application/octet-stream",
        )
        if status in (200, 201, 204):
            print(f"   ⬆️ Subido: {path_ref.name} -> {sha[:12]}")
        else:
            print(f"   ❌ Error subiendo {path_ref.name}: HTTP {status}")
            return False

    # 4. Deploy Manifest
    status, dep_res = _request(
        "POST", f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}/deploy-manifest",
        json.dumps({"manifest": manifest, "message": message}).encode(),
    )
    if status not in (200, 201) or not isinstance(dep_res, dict):
        print(f"❌ Error en deploy manifest: HTTP {status} - {dep_res}")
        return False
    deployment_id = dep_res.get("data", {}).get("id")
    print(f"   ✓ Deployment ID: {deployment_id}")

    # 5. Poll de estado
    for _ in range(15):
        time.sleep(2)
        status, st = _request("GET", f"{BASE_URL}/api/v1/workspaces/{WS_ID}/deployments/{deployment_id}")
        if status == 200 and isinstance(st, dict) and st.get("data", {}).get("status") == "healthy":
            print("   🎉 ¡Despliegue verificado y HEALTHY!")
            break

    # 6. Share link (el token completo SOLO se devuelve al crearlo)
    share_url = None
    status, create_res = _request(
        "POST", f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}/share-links",
        json.dumps({"name": f"{app_name} CORPOELEC GGPD"}).encode(),
    )
    if status == 200 and isinstance(create_res, dict):
        share_url = create_res.get("data", {}).get("url")

    # 7. Dominio oficial
    status, app_res = _request("GET", f"{BASE_URL}/api/v1/workspaces/{WS_ID}/apps/{app_id}")
    app_data = app_res.get("data", {}) if isinstance(app_res, dict) else {}
    domain = app_data.get("fqdn") or app_data.get("defaultDomain") or f"{app_name}-{WS_ID}.vibehost.space"
    official_url = f"https://{domain}"

    print(f"\n   ✅ URL Oficial: {official_url}")
    print(f"   🔗 Share Link:  {share_url or official_url}\n")
    return True


def _resolve_dist(relative: str) -> str:
    """Resuelve la ruta del dist relativa a la raíz del repositorio."""
    return str((REPO_ROOT / relative).resolve())


APPS_MAP = {
    "sigi": ("corpoelec-sigi", "a53r8tvlvt9ihw09maca8a2g", "apps-refactorizadas/SIGI-REF/dist", "Actualización SIGI con Grado Industrial"),
    "scgcc": ("corpoelec-scgcc", "hrxha775a7btx7k1r3t3p2g2", "apps-refactorizadas/SCGCC-REF/dist", "Actualización SCGCC V1.0 Grado Industrial"),
    "scmtp": ("corpoelec-scmtp", "xon0wv9a3s45vomgd22w8kp3", "apps-refactorizadas/SCMTP-REF/dist", "Actualización SCMTP V2.0 Grado Industrial"),
    "scppe": ("corpoelec-scppe", "c947eg8pgpux8vffy0bjt7ms", "apps-refactorizadas/SCPPE-REF/dist", "Actualización SCPPE V3.0 Grado Industrial"),
    "scein": ("corpoelec-scein", "pqb1ryl1s59ner372rbmf559", "apps-refactorizadas/SCEIN-REF/dist", "Actualización SCEIN V3.0 Grado Industrial"),
    "sctis": ("corpoelec-sctis", "yq94rtmw5enw9bual08l0p3u", "apps-refactorizadas/SCTIS-REF/dist", "Actualización SCTIS V2.0 Grado Industrial"),
    "sigad": ("corpoelec-sigad", "cs8p93iobf180xhva11c50bv", "apps-refactorizadas/SIGAD-REF/dist", "Migración InsForge sigad + codigo CND (SIGAD v1.0)"),
    "siga-sen": ("corpoelec-siga-sen", "llq2cjhgi5a5kibi91nbjsm2", "apps-refactorizadas/SIGA-SEN-REF/dist", "Migración InsForge sigad_sen + codigo CND (SIGA-SEN v1.0)"),
}


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "sigi"
    if target in ("--list", "-l"):
        print("Targets disponibles:")
        for key in APPS_MAP:
            print(f"  - {key}")
        sys.exit(0)
    if target in APPS_MAP:
        name, app_id, path, msg = APPS_MAP[target]
        ok = deploy_app(name, app_id, _resolve_dist(path), msg)
        sys.exit(0 if ok else 1)
    print(f"Target '{target}' no reconocido. Opciones: {list(APPS_MAP.keys())}")
    sys.exit(1)
