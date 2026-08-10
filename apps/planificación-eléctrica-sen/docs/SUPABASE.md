# SUPABASE.md — Cómo conectarse al proyecto Supabase del Proyecto Conexiones

> Guía para cualquier agente (IA-SRV, IA-CHROM, humanxs) que necesite
> interactuar con el Supabase donde **ya está migrada** la estructura de
> `sgc_centralized_v1_beta`.
>
> Última verificación: 2026-07-25 por IA-CHROM.

---

## 1. Resumen del proyecto

| Dato               | Valor                                                    |
|--------------------|----------------------------------------------------------|
| **Project URL**    | https://ucbaifaxgocjbcsetwqp.supabase.co                |
| **Project ref**    | `ucbaifaxgocjbcsetwqp`                                   |
| **Region**         | (ver dashboard)                                         |
| **Estado**         | 6 migraciones aplicadas — **esquemas ya creados**       |
| **RLS**            | Habilitado en todas las tablas (`scei`, `scdpp`, `audit`)|

### Migraciones aplicadas
```
20260719174323  remediate_security_advisors
20260719174344  add_missing_fk_indexes
20260719174435  create_scei_catalogs
20260719174552  create_scei_transactional
20260719174927  fix_scei_voltages_model
20260719200029  create_scdpp_schema
```

### Conteo actual (snapshot 2026-07-25)
| Esquema  | Tabla                              | Filas |
|----------|------------------------------------|-------|
| `scei`   | `materials`                         | 840   |
| `scei`   | `prices`                           | 810   |
| `scei`   | `element_types`                    | 95    |
| `scei`   | `components`                       | 21    |
| `scei`   | `families`                         | 26    |
| `scei`   | `voltages`                         | 27    |
| `scei`   | `states`                           | 25    |
| `scei`   | `regions`                          | 8     |
| `scei`   | `uoms`                             | 17    |
| `scei`   | `categories`                       | 13    |
| `scei`   | `statuses`, `priorities`, `master_meta` | 3, 3, 1 |
| `scei`   | `submissions`, `equipment_records`, `plan_execution`, `material_lines` | 0 (carga pendiente) |
| `scdpp`  | `fuentes`, `subestaciones`, `pica_y_poda_registro` | 0 (carga pendiente) |
| `audit`  | `logs`                             | 0     |

---

## 2. Credenciales

> ⚠️ **NUNCA versiones las claves del service_role**. La `anon`/`publishable`
> sí se puede exponer en clients frontend; las protegidas van en `.env`.

### Publishable (segura para clients)
```
SUPABASE_URL=https://ucbaifaxgocjbcsetwqp.supabase.co
SUPABASE_ANON_KEY=***REMOVED***
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YgnpGyvQWSp7uHgClC4jew_PuvZ6X8p
```

### Service Role
**NO está aquí.** La estoy manteniendo fuera del repo. La pedís al
administrador del proyecto en el dashboard de Supabase → Settings → API.
Guardarla en `.env` local como `SUPABASE_SERVICE_ROLE_KEY=` (jamás commitear).

---

## 3. Instalación del CLI

El servidor Debian ya tiene Node 20, así que instalas `supabase` globalmente:

```bash
# En el servidor Debian (yvancipiran@192.168.100.142)
sudo npm install -g supabase
supabase --version   # > 1.x
```

En el chromebook también queda útil para trabajar offline:
```bash
sudo apt-get install -y npm   # si no está
sudo npm install -g supabase
```

---

## 4. Login (una sola vez)

Para que el CLI pueda leer/escribir el proyecto necesarias un **access token**:

1. Abrí https://supabase.com/dashboard/account/tokens
2. Generá un token nuevo (nombre: `chromebook-conexiones` o `debian-srv`).
3. Guardalo **solo en `.env`** como `SUPABASE_ACCESS_TOKEN=...`.
4. Cargá y logeá:

```bash
set -a; . .env; set +a
supabase login --token "$SUPABASE_ACCESS_TOKEN"
# verificar:
supabase projects list
```

A partir de aquí, todos los comandos `supabase` usan ese token.

---

## 5. Trabajar con el proyecto desde el CLI

### Linkear el repo local al proyecto Supabase

En el directorio del repo (ej. `~/Documentos/conexiones`):
```bash
supabase link --project-ref ucbaifaxgocjbcsetwqp
```
Esto crea `supabase/.temp/` y configura el funciones localmente.

### Ver estado
```bash
supabase status
supabase migration list
```

### Migrations: el flujo correcto

**No uses `supabase db push` salvo emergencia.** Usá `migration new`:

```bash
# Crear nueva migracion (genera supabase/migrations/<ts>_<nombre>.sql)
supabase migration new <nombre_snake_case>

# Editá el archivo .sql con tus cambios
$EDITOR supabase/migrations/*_<nombre>.sql

# Aplicar al proyecto remoto:
supabase db push       # sube y aplica migrations pendientes
```

**Importante**: si estás editando con compatibilidad hacia la BD del
Debian (`192.168.100.142`), mantene los mismos nombres de migración
en `docs/arquitectura/0X_*.sql` para tener un único histórico compartido.

### Branches de desarrollo (recomendado para no romper producción)

```bash
# Crear branch
supabase branches create mi-feature

# Listar
supabase branches list

# Reset / delete / merge desde el dashboard o CLI:
supabase branches merge    <branch_id>
supabase branches delete   <branch_id>
```

---

## 6. Insertar datos (carga desde el Debian → Supabase)

### Opción A — vía `psql` (rápida, para cargas SQL grandes)

Consigue el connection string de la base (en el dashboard → Settings →
Database → Connection string → URI):

```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Guarda en `.env`:
```
SUPABASE_DB_URL=postgresql://postgres.ucbaifaxgocjbcsetwqp:CLAVE@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Entonces desde el Chromebook (conection autenticada por llave a Debian):
```bash
# Exportamos datos del Debian local
PGPASSWORD='Lunes35.' pg_dump -h 192.168.100.142 -U postgres \
  -d sgc_centralized_v1_beta --data-only --inserts \
  -t scei.materials -t scei.prices > carga.sql

# Aplicamos en Supabase
psql "$SUPABASE_DB_URL" -f carga.sql
```

### Opción B — vía Edge Function / REST API (para cargas online)

```bash
curl -X POST "$SUPABASE_URL/rest/v1/scei.materials" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '[{"material_code": "MAT-...", ...}]'
```

### Opción C — vía MCP (cuando la sesion opencode tiene MCP de Supabase)

Si estas en una sesion con `@modelcontextprotocol/server-supabase`
configurado, podes usar directamente las herramientas:

- `apply_migration(name, query)` — DDL seguro, versionado
- `execute_sql(query)` — para cargas puntuales (no DDL)
- `list_migrations()` — ver historial
- `get_advisors(type="security"|"performance")` — chequar issues
- `list_tables(schemas, verbose)` — inspeccionar

Ejemplo para insertar 100 materiales desde la BD local:
```python
# en una herramienta supabase_execute_sql:
INSERT INTO scei.materials (material_code, material_desc, family_code, source)
SELECT material_code, material_desc, family_code, source
FROM dblink(
  'host=192.168.100.142 port=5432 user=postgres password=...',
  'SELECT material_code, material_desc, family_code, source FROM common.materials'
) AS t(...)
ON CONFLICT (material_code) DO UPDATE SET
  material_desc = EXCLUDED.material_desc,
  family_code = EXCLUDED.family_code;
```
> Requiere extensión `dblink` o `postgres_fdw` en Supabase. Verificá con
> `supabase extensions list`.

---

## 7. Tests y verificación

### Chequeos obligatorios después de cualquier migración
```bash
# Security advisors (RLS, indices, etc.)
supabase inspect db advisors --type security

# Performance advisors
supabase inspect db advisors --type performance

# Tipos TS autogenerados
supabase gen types typescript --local > types/supabase.ts
```

### Tipos TypeScript (recomendado cuando se empiece con frontend)
```bash
# Generar y commitear
supabase gen types typescript --linked > types/supabase.ts
git add types/supabase.ts && git commit -m "types: regenerar TS"
```

---

## 8. RLS — Política sugerida para `classification`

Las tablas ya tienen RLS habilitado. Para que `classification`
(`PUBLICO`/`INTERNO`/`CONFIDENCIAL`) se respete desde el cliente:

```sql
-- Ejemplo: politicas por defecto para scei.*
ALTER TABLE scei.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_lectura" ON scei.materials
  FOR SELECT USING (classification IS DISTINCT FROM 'CONFIDENCIAL');

-- service_role bypassa RLS automaticamente
-- (para data loading no necesitas escribir politics de escritura)
```

`supabase inspect db advisors --type security` te avisará de cualquier
tabla sin policy.

---

## 9. Helpers comunes

```bash
# Ver logs de la ultima Edge Function
supabase functions logs <nombre>

# Listar Edge Functions desplegadas
supabase functions list

# Desplegar
supabase functions deployHola --no-verify-jwt   # solo si la función
                                                 # implementa auth custom

# Tipos
supabase gen types typescript --linked > types/supabase.ts

# Reset de branch develop
supabase branches reset <branch_id>
```

---

## 10. Convenciones para el Proyecto Conexiones

1. **Toda migración DDL** se sube con `apply_migration` desde el MCP o
   `supabase migration new` + `supabase db push`. NUNCAEdites el schema
   directo en el SQL Editor del dashboard (no queda versionado en git).
2. **Las migraciones van también a** `docs/arquitectura/0X_*.sql` del repo
   central (mantener nombre y descripción sincronizados con Supabase).
3. **El `.env` local** contendrá todas las claves. La `SERVICE_ROLE` jamás
   se commitea (ver `.gitignore`).
4. **Antes de cargar datos**: verifica advisors + RLS y hace un
   `pg_dump --data-only` de respaldo en el Debian (`~/Backups/`).
5. **Coordinación**: registra toda acción en `HANDOFF.md` para que la
   otra IA sepa que migraste/cargaste algo.

---

## 11. Contacto / FAQ

- **¿Dónde está la service_role?** En el dashboard. Pídesela al admin y
  guardala en `.env`. No la commitees.
- **¿Puedo borrar migraciones?** No. Aplicar nuevas que deshagan cambios
  (`ALTER TABLE ... DROP ...`).
- **¿Cómo hago una carga grande?** `pg_dump --data-only` desde el Debian +
  `psql "$SUPABASE_DB_URL" -f`.
- **¿Branch de desarrollo?** Recomendado (`supabase branches create
  develop`). No cargues datos en producción sin probar en branch first.
- **¿Bug en una FK index?** `supabase inspect db advisors --type security`
  lo detecta automáticamente (ya aplicamos `add_missing_fk_indexes`).
