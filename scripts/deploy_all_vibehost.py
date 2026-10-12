#!/usr/bin/env python3
"""
⚡ Deploy All Refactored Apps to VibeHost
"""
from deploy_vibehost_app import deploy_app, APPS_MAP, _resolve_dist

# (nombre, app_id, ruta absoluta del dist, mensaje)
# Fuente única de verdad: reutiliza el registro de deploy_vibehost_app.APPS_MAP
APPS = [
    (name, app_id, _resolve_dist(rel_path), msg)
    for name, app_id, rel_path, msg in (
        APPS_MAP["scppe"],
        APPS_MAP["scgcc"],
        APPS_MAP["scmtp"],
        APPS_MAP["sigi"],
        APPS_MAP["scein"],
        APPS_MAP["sctis"],
        APPS_MAP["sigad"],
        APPS_MAP["siga-sen"],
    )
]

def main():
    print("================================================================================")
    print("🚀 SINCRONIZACIÓN Y DESPLIEGUE MASIVO EN VIBEHOST")
    print("================================================================================")
    
    results = {}
    for name, app_id, path, msg in APPS:
        print(f"\n--- Procesando {name} ---")
        success = deploy_app(name, app_id, path, msg)
        results[name] = "✅ HEALTHY" if success else "❌ ERROR"
        
    print("\n================================================================================")
    print("📊 RESUMEN DE DESPLIEGUES EN VIBEHOST")
    print("================================================================================")
    for name, status in results.items():
        print(f" • {name}: {status}")

if __name__ == "__main__":
    main()
