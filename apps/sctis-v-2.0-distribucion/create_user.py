from interrupciones.app.db import query_one, query
from werkzeug.security import generate_password_hash
import sys

role = query_one("SELECT role_id FROM sctis.roles WHERE role_code = 'admin' OR role_name ILIKE '%admin%'")
if not role:
    print("No se encontró rol de admin")
    sys.exit(1)

pwd_hash = generate_password_hash("Favio2026.")
res = query("""
    INSERT INTO sctis.user_profiles (username, password_hash, full_name, role_id, is_active)
    VALUES (%s, %s, %s, %s, true)
    ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name, role_id = EXCLUDED.role_id
    RETURNING user_id
""", ('c_favio', pwd_hash, 'Catherina Favio', role['role_id']))
print("Usuario creado/actualizado con ID:", res[0]['user_id'])
