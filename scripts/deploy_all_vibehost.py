#!/usr/bin/env python3
"""
⚡ Deploy All Refactored Apps to VibeHost
"""
import subprocess
from deploy_vibehost_app import deploy_app

APPS = [
    ("corpoelec-scppe", "c947eg8pgpux8vffy0bjt7ms", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCPPE-REF/dist", "Actualización SCPPE con Árbol Organizacional e InsForge"),
    ("corpoelec-scgcc", "hrxha775a7btx7k1r3t3p2g2", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCGCC-REF/dist", "Actualización SCGCC V1.0 InsForge Grado Industrial"),
    ("corpoelec-scmtp", "xon0wv9a3s45vomgd22w8kp3", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCMTP-REF/dist", "Actualización SCMTP V2.0 InsForge Grado Industrial"),
    ("corpoelec-sigi", "a53r8tvlvt9ihw09maca8a2g", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist", "Actualización SIGI InsForge Grado Industrial"),
    ("corpoelec-scein", "pqb1ryl1s59ner372rbmf559", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCEIN-REF/dist", "Actualización SCEIN V3.0 InsForge Grado Industrial"),
    ("corpoelec-sctis", "yq94rtmw5enw9bual08l0p3u", "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SCTIS-REF/dist", "Actualización SCTIS V2.0 InsForge Grado Industrial"),
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
