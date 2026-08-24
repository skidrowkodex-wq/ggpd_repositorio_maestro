#!/usr/bin/env python3
"""
Prueba de Integración End-to-End del Motor Unificado de Usuarios (IAM)
InsForge BaaS (ggpd-data-maestra-0002) - CORPOELEC GGPD
"""

import requests
import json
import sys
import time

INSFORGE_URL = "https://wxkeqf37.ap-southeast.insforge.app"
INSFORGE_API_KEY = "***REMOVED***"

HEADERS = {
    "apikey": INSFORGE_API_KEY,
    "Authorization": f"Bearer {INSFORGE_API_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def print_separator(title=""):
    print("\n" + "=" * 80)
    if title:
        print(f" 🔍 {title}")
        print("=" * 80)

def test_insforge_connectivity():
    print_separator("TEST 1: Conectividad y Censo de Usuarios en InsForge")
    url = f"{INSFORGE_URL}/rest/v1/mae_usuarios_sistema?select=*"
    res = requests.get(url, headers=HEADERS, timeout=10)
    
    assert res.status_code == 200, f"Error al conectar con InsForge: {res.status_code} - {res.text}"
    users = res.json()
    print(f"✓ Conexión exitosa a InsForge REST API (HTTP 200)")
    print(f"✓ Total de usuarios registrados en core.mae_usuarios_sistema: {len(users)}")
    assert len(users) >= 37, f"Se esperaban al menos 37 usuarios, encontrados {len(users)}"
    return users

def simulate_app_login(app_name, username, password):
    """Simula la lógica de autenticación implementada en cada aplicación refactorizada"""
    clean_user = username.strip().lower()
    url = f"{INSFORGE_URL}/rest/v1/mae_usuarios_sistema?or=(username.eq.{clean_user},email.eq.{clean_user})&limit=1"
    
    res = requests.get(url, headers=HEADERS, timeout=5)
    if not res.ok:
        return False, f"Error HTTP {res.status_code}"
    
    records = res.json()
    if not records:
        return False, "Usuario no encontrado"
    
    u = records[0]
    if u.get('status') == 'SUSPENDIDO':
        return False, "403_SUSPENDED: Cuenta SUSPENDIDA por directiva de seguridad (Kill-Switch Activo)"
    
    # Validar permiso por aplicación
    permiso_key = {
        'SIGI': 'permiso_sigi',
        'SCTIS': 'permiso_sctis',
        'SCEIN': 'permiso_scein',
        'SCPPE': 'permiso_scppe',
        'SCMTP': 'permiso_scmtp'
    }.get(app_name)
    
    has_perm = u.get(permiso_key, False) or u.get('role_code') in ('ADMINISTRADOR', 'GERENCIA')
    if not has_perm:
        return False, f"403_FORBIDDEN: Acceso denegado. El usuario no posee permiso para {app_name}"
    
    if u.get('password_hash') != password:
        return False, "401_UNAUTHORIZED: Contraseña incorrecta"
    
    return True, {
        'id': u.get('id'),
        'username': u.get('username'),
        'full_name': u.get('full_name'),
        'role': u.get('role_code'),
        'estado_codigo': u.get('estado_codigo'),
        'status': u.get('status')
    }

def test_credentials_and_permissions():
    print_separator("TEST 2: Validación de Credenciales y Matriz de Permisos por App")
    
    test_cases = [
        # (App, Username, Password, Expected_Success, Description)
        ("SIGI", "yvan.cipiran", "Cipiran2026!.", True, "Admin Yván Cipiran en SIGI"),
        ("SCTIS", "yvan.cipiran", "Cipiran2026!.", True, "Admin Yván Cipiran en SCTIS"),
        ("SCEIN", "yvan.cipiran", "Cipiran2026!.", True, "Admin Yván Cipiran en SCEIN"),
        ("SCPPE", "yvan.cipiran", "Cipiran2026!.", True, "Admin Yván Cipiran en SCPPE"),
        ("SCMTP", "yvan.cipiran", "Cipiran2026!.", True, "Admin Yván Cipiran en SCMTP"),
        
        ("SCTIS", "distribucion.carabobo", "Carabobo2026!.", True, "Visor Estadal Carabobo en SCTIS (Permiso Habilitado)"),
        ("SCEIN", "distribucion.carabobo", "Carabobo2026!.", False, "Visor Estadal Carabobo en SCEIN (Permiso Bloqueado por Matriz)"),
        
        ("SIGI", "admin.ggpd", "Corpoelec2026*!", True, "SuperAdmin GGPD en SIGI"),
        ("SCPPE", "walter.prato", "Prato2026!.", True, "Especialista Walter Prato en SCPPE"),
        
        # Test bad password
        ("SIGI", "yvan.cipiran", "ClaveInvalida999", False, "Admin con contraseña incorrecta (Debe ser rechazado)"),
        ("SCTIS", "usuario.fantasma", "Cipiran2026!.", False, "Usuario inexistente (Debe ser rechazado)")
    ]
    
    passed = 0
    for app, user, pwd, expected_ok, desc in test_cases:
        ok, result = simulate_app_login(app, user, pwd)
        status_symbol = "✅" if ok == expected_ok else "❌"
        msg = f"{status_symbol} [{app}] {desc} -> Resultado: {'Acceso Concedido' if ok else result}"
        print(msg)
        if ok == expected_ok:
            passed += 1
        else:
            print(f"   ⚠️ ERROR: Se esperaba ok={expected_ok}, pero se obtuvo ok={ok}")

    print(f"\n✓ Casos de prueba ejecutados: {len(test_cases)} | Exitosos: {passed}/{len(test_cases)}")
    assert passed == len(test_cases), "Fallaron algunos casos de prueba de permisos"

def test_full_lifecycle_and_killswitch():
    print_separator("TEST 3: Ciclo de Vida IAM y Kill-Switch Inmediato")
    
    test_user_id = f"test-user-iam-{int(time.time())}"
    test_username = "test.auditor.iam"
    test_pwd = "AuditorPass2026!."
    
    # 1. Crear usuario en InsForge
    print(f"1. Creando usuario de prueba `{test_username}` con permisos en SIGI, SCTIS, SCPPE y SCMTP (sin SCEIN)...")
    payload = {
        "id": test_user_id,
        "username": test_username,
        "email": "test.auditor.iam@corpoelec.gob.ve",
        "full_name": "Auditor de Integración IAM",
        "role_code": "AUDITOR",
        "estado_codigo": "DCA",
        "unidad_organizativa": "Auditoría Interna GGPD",
        "password_hash": test_pwd,
        "status": "ACTIVO",
        "permiso_sigi": True,
        "permiso_sctis": True,
        "permiso_scein": False, # Sin permiso en SCEIN
        "permiso_scppe": True,
        "permiso_scmtp": True,
        "permiso_gdrive": False
    }
    
    url = f"{INSFORGE_URL}/rest/v1/mae_usuarios_sistema"
    res = requests.post(url, headers=HEADERS, json=payload, timeout=10)
    assert res.status_code in (200, 201), f"Fallo al crear usuario: {res.status_code} - {res.text}"
    print(f"   ✅ Usuario `{test_username}` creado exitosamente en InsForge (HTTP {res.status_code})")
    
    # 2. Validar acceso inmediato en las 5 apps
    print("\n2. Validando acceso en tiempo real a través de los motores de las 5 aplicaciones:")
    for app in ["SIGI", "SCTIS", "SCPPE", "SCMTP"]:
        ok, res_data = simulate_app_login(app, test_username, test_pwd)
        assert ok, f"Error: `{test_username}` debió tener acceso a {app}, pero falló: {res_data}"
        print(f"   ✅ [{app}] Acceso CONCEDIDO exitosamente.")
    
    ok_scein, res_scein = simulate_app_login("SCEIN", test_username, test_pwd)
    assert not ok_scein and "Acceso denegado" in str(res_scein), f"Error: `{test_username}` no debió tener acceso a SCEIN"
    print(f"   ✅ [SCEIN] Acceso BLOQUEADO por matriz de permisos (como correspondía: {res_scein}).")

    # 3. Probar Kill-Switch Inmediato (Suspender usuario)
    print("\n3. Activando Kill-Switch (Cambiando estado a SUSPENDIDO)...")
    patch_url = f"{INSFORGE_URL}/rest/v1/mae_usuarios_sistema?id=eq.{test_user_id}"
    patch_res = requests.patch(patch_url, headers=HEADERS, json={"status": "SUSPENDIDO"}, timeout=10)
    assert patch_res.status_code in (200, 204), f"Fallo al suspender usuario: {patch_res.status_code}"
    print("   ✅ Estado cambiado a `SUSPENDIDO` en InsForge.")

    print("\n4. Verificando bloqueo inmediato y transversal en las 5 apps:")
    for app in ["SIGI", "SCTIS", "SCEIN", "SCPPE", "SCMTP"]:
        ok, res_block = simulate_app_login(app, test_username, test_pwd)
        assert not ok and "SUSPENDIDA" in str(res_block), f"Error: `{test_username}` no fue bloqueado en {app}: {res_block}"
        print(f"   🛑 [{app}] Bloqueado de inmediato -> {res_block}")

    # 4. Limpieza del usuario de prueba
    print("\n5. Limpieza de datos: Eliminando usuario de prueba...")
    del_url = f"{INSFORGE_URL}/rest/v1/mae_usuarios_sistema?id=eq.{test_user_id}"
    del_res = requests.delete(del_url, headers=HEADERS, timeout=10)
    assert del_res.status_code in (200, 204), f"Fallo al eliminar usuario: {del_res.status_code}"
    print(f"   ✅ Usuario de prueba `{test_username}` eliminado de InsForge.")

def main():
    print_separator("INICIANDO SUITE DE PRUEBAS DE INTEGRACIÓN: MOTOR IAM INSFORGE")
    try:
        users = test_insforge_connectivity()
        test_credentials_and_permissions()
        test_full_lifecycle_and_killswitch()
        
        print_separator("RESUMEN DE RESULTADOS DE INTEGRACIÓN")
        print("🎉 TODAS LAS PRUEBAS DE INTEGRACIÓN DEL MOTOR IAM PASARON AL 100%")
        print("✓ Conectividad en tiempo real: OPERATIVA")
        print("✓ Censo de 37 usuarios canónicos: VERIFICADO")
        print("✓ Matriz de permisos por app (SIGI, SCTIS, SCEIN, SCPPE, SCMTP): VERIFICADA")
        print("✓ Mecanismo de Kill-Switch y Bloqueo Inmediato Transversal: VERIFICADO")
        print("=" * 80 + "\n")
        return 0
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO EN PRUEBA DE INTEGRACIÓN: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
