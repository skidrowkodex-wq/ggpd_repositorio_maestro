# GUÍA MAESTRA DE DESPLIEGUE LOCAL Y MIGRACIÓN A INSFORGE
## Sistema de Gestión de Flota Vehicular (CORPOELEC - GGPD)
> **Destinatario:** Agente de Inteligencia Artificial (Cursor, Windsurf, Claude Code, GitHub Copilot) o Ingeniero de Software DevSecOps.  
> **Objetivo:** Ejecutar la puesta en marcha local del proyecto, inicializar y validar la base de datos PostgreSQL en entorno de desarrollo, y ejecutar la migración estructurada hacia la plataforma **INSFORGE**.  
> **Punto de Control de Referencia:** `SISFLOTA01`.

---

## 1. Contexto Técnico del Sistema

El **Sistema de Gestión de Flota Vehicular** es una plataforma corporativa desarrollada para la **Gerencia General de Programación y Control de Operaciones de Distribución (GGPD)** de **CORPOELEC** y el **Sistema Eléctrico Nacional (SEN)** de Venezuela.

### 1.1. Arquitectura Actual del Código
- **Frontend SPA:** React 19 + TypeScript + Vite.
- **Estilos:** Tailwind CSS v4 con diseño institucional (identidad CORPOELEC: rojo `#C8102E`, verde corporativo `#00843D`, azul pizarra `#0B2545`).
- **Servicios Modulares (`src/services/`):**
  - `authService.ts`: Autenticación con 15 usuarios institucionales SEN preconfigurados y control de roles (`admin`, `nacional`, `gerente`, `estado`).
  - `permissionService.ts`: **Matriz RBAC rol × acción** (17 acciones controlables). Persistencia híbrida: caché `localStorage` + sincronización a InsForge.
  - `insforgeService.ts`: Cliente REST de InsForge para el CRUD de la tabla `flota_permisos_roles` (clave pública `anon`, con timeout de 8 s).
  - `auditService.ts`: Trazabilidad de acciones críticas (incluye `CAMBIO_PERMISOS`).
  - `passwordResetService.ts`: Flujo de reseteo de claves y tickets de autoservicio.
  - `backupService.ts`: Puntos de control del sistema (Checkpoint oficial: `SISFLOTA01`).
  - `correlativoService.ts`: Nomenclatura institucional de unidades (`GGDT-[EST]-[TIPO]-[CORR]`).
  - `postgresExportService.ts`: Generador dinámico de scripts DDL, DML y paquete unificado de PostgreSQL.
  - `excelService.ts` / `pdfService.ts`: Generación de actas técnicas y reportes analíticos.
  - `validationService.ts` / `regionAdapter.ts`: Validación de datos y adaptación territorial.
- **Componentes de Vistas (`src/components/`):** `IndustrialLogin.tsx` (autenticación), `ConsolidatedView.tsx`, `ManagerDashboardView.tsx`, `RolePermissionsView.tsx` (matriz RBAC) y navegación (`Sidebar.tsx`, `TopHeader.tsx`, `MobileBottomNav.tsx`).
- **Base de Datos Generada:** PostgreSQL 14 / 15 / 16 (normalizada en 9 tablas, 14 índices y 3 vistas analíticas) + tablas `flota_*` desplegadas en InsForge.

---

## 2. Inventario de Archivos para la Base de Datos (`database/`)

El repositorio incluye dentro de la carpeta `/database` los artefactos listos para su análisis y ejecución:

| Archivo | Propósito |
| :--- | :--- |
| `database/00_corpoelec_flota_completo.sql` | **Script unificado DDL + DML**. Contiene la creación de tablas, índices, vistas, catálogos completos, usuarios institucionales, vehículos de prueba y el checkpoint `SISFLOTA01`. |
| `database/01_esquema_ddl.sql` | Definición de estructuras (DDL puro): 9 tablas, llaves primarias, foráneas, restricciones de unicidad e índices. |
| `database/02_datos_semilla_dml.sql` | Inserción de datos (DML puro): Regiones, estados, catálogos A4, usuarios SEN y unidades vehiculares. |
| `database/docker-compose.yml` | Configuración Docker para levantar PostgreSQL 16 con el script `00` montado automáticamente en `/docker-entrypoint-initdb.d/`. |
| `database/insforge_flota_schema.sql` | **Esquema InsForge** de las tablas `public.flota_*` (incluida `flota_permisos_roles` con sus políticas RLS) para el modo híbrido de permisos por rol. |
| `scripts/exportSql.ts` | Script de NodeJS/TSX (`npm run db:export`) para re-generar los scripts SQL en cualquier momento. |

---

## 3. Fase 1: Puesta en Marcha Local

Agente de IA, ejecuta los siguientes pasos en la terminal de la máquina local:

### 3.1. Instalación de dependencias del proyecto
```bash
# Navegar al directorio raíz del proyecto
npm install
```

### 3.2. Configuración del entorno (.env)
Copia el archivo de variables de ejemplo (incluye las variables públicas de InsForge):
```bash
cp .env.example .env.development
```
Verifica que `.env.development` contenga las credenciales públicas de InsForge y, si vas a usar la base de datos local, **añade** también las de PostgreSQL:
```env
# InsForge — Proyecto ggpd-data-maestra-0002 (modo híbrido de permisos RBAC)
VITE_INSFORGE_API_URL="https://wxkeqf37.ap-southeast.insforge.app"
VITE_INSFORGE_URL="https://wxkeqf37.ap-southeast.insforge.app"
# Clave pública (rol anon) — NUNCA usar la service key en el frontend
VITE_INSFORGE_ANON_KEY="anon_..."

# PostgreSQL local (opcional, solo para la BD de desarrollo)
DATABASE_URL="postgresql://corpoelec_admin:Corpoelec2026*@localhost:5432/corpoelec_flota_db"
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="corpoelec_flota_db"
PGUSER="corpoelec_admin"
PGPASSWORD="Corpoelec2026*"
```

> **Regla de seguridad (ISO/IEC 27001):** nunca coloques la *service key* de InsForge en el frontend; el modo híbrido solo usa la clave pública `anon`, sujeta a las políticas RLS de `flota_permisos_roles`.

### 3.3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación abrirá en `http://localhost:3000` (por defecto). En este repositorio se puede usar un puerto alterno:
```bash
npm run dev -- --port=3010
```
La aplicación quedará disponible en `http://localhost:3010`.

### 3.4. Módulo de Control de Permisos por Rol (RBAC SEN)

La pestaña **Control de Permisos** (`tab_permisos`) es una página **exclusiva del Administrador** que gestiona una matriz rol × acción. Un cambio aplica a **todos los usuarios** del rol seleccionado.

**Roles:** `admin` (control total, columna bloqueada), `nacional`, `gerente`, `estado`.

**Acciones controlables (17):** `tab_formulario`, `tab_consolidado`, `tab_gerencia`, `tab_permisos`, `btn_import_excel`, `btn_export_excel`, `btn_edit_vehiculo`, `btn_delete_vehiculo`, `btn_vaciar_bd`, `btn_users_mgmt`, `btn_backup`, `btn_changepass`, `btn_password_resets`, `btn_pg_manager`, `btn_theme`, `btn_audit_history`, `btn_catalogs`.

**Persistencia híbrida (offline-first):**
1. Caché en `localStorage`: la app funciona sin red.
2. Al **Guardar**, `permissionService.saveMatrix()` llama a `insforgeService.pushPermisos()` para sincronizar a `public.flota_permisos_roles` en InsForge.
3. Al iniciar sesión, `App.tsx` invoca `syncFromCloud()` para recuperar la matriz más reciente.

**Tabla `public.flota_permisos_roles`** (declarada en `database/insforge_flota_schema.sql`):
- `id` (uuid PK), `rol` (varchar 50), `accion` (varchar 80), `habilitado` (bool), `actualizado_por`, `actualizado_en`.
- `UNIQUE(rol, accion)` y RLS habilitado con políticas permisivas para el rol `anon`.
- Poblada inicialmente con **68 filas** (17 acciones × 4 roles).

Cada cambio se registra en la auditoría con la acción `CAMBIO_PERMISOS`.

---

## 4. Fase 2: Creación y Análisis de la Base de Datos Local

Puedes crear la base de datos local usando **Docker** (Método recomendado) o directamente en un **PostgreSQL nativo**.

### Opción A: Vía Docker Compose (Recomendada - 1 solo comando)
```bash
cd database
docker compose up -d
```
*Docker creará el contenedor `corpoelec_postgres_flota`, habilitará el puerto `5432` y ejecutará de forma automática el script `00_corpoelec_flota_completo.sql`.*

Para verificar el estado del contenedor:
```bash
docker ps
docker logs corpoelec_postgres_flota
```

### Opción B: Vía PostgreSQL Nativo en Linux / macOS / Windows
Si ya tienes PostgreSQL instalado en la máquina:
```bash
# 1. Conectarse como superusuario postgres
sudo -u postgres psql

# 2. En la consola de psql ejecutar:
CREATE DATABASE corpoelec_flota_db WITH ENCODING 'UTF8';
CREATE USER corpoelec_admin WITH ENCRYPTED PASSWORD 'Corpoelec2026*';
GRANT ALL PRIVILEGES ON DATABASE corpoelec_flota_db TO corpoelec_admin;
\c corpoelec_flota_db
GRANT ALL ON SCHEMA public TO corpoelec_admin;
\q

# 3. Importar el paquete SQL completo:
psql -h localhost -U corpoelec_admin -d corpoelec_flota_db -f database/00_corpoelec_flota_completo.sql
```

---

## 5. Fase 3: Consultas de Validación para el Agente

Agente de IA, ejecuta las siguientes consultas de validación en la base de datos local para verificar la integridad del esquema y los datos migrados:

```bash
psql -h localhost -U corpoelec_admin -d corpoelec_flota_db -c "
SELECT 'Total Vehiculos' AS metrica, count(*)::text FROM flota_vehiculos
UNION ALL
SELECT 'Total Usuarios', count(*)::text FROM usuarios
UNION ALL
SELECT 'Regiones Registradas', count(*)::text FROM regiones_venezuela
UNION ALL
SELECT 'Estados Registrados', count(*)::text FROM estados_venezuela
UNION ALL
SELECT 'Puntos de Control', count(*)::text FROM puntos_control_backups;
"
```

### Consultas analíticas clave:
```sql
-- 1. Ver resumen operativo por estado y región
SELECT * FROM v_resumen_operativo_flota LIMIT 10;

-- 2. Ver vehículos en estado crítico o con mantenimiento vencido
SELECT * FROM v_kpis_mantenimiento;

-- 3. Confirmar existencia del Punto de Control SISFLOTA01
SELECT id, nombre, version, creado_en 
FROM puntos_control_backups 
WHERE id = 'SISFLOTA01';

-- 4. Validar usuarios administradores y estatales del SEN
SELECT email, nombre_completo, rol, estado_asignado, activo 
FROM usuarios 
ORDER BY rol ASC;
```

### Consultas de validación del RBAC (InsForge `public.flota_permisos_roles`):
```sql
-- 5. Cobertura de la matriz: 17 acciones x 4 roles = 68 filas
SELECT rol, count(*)::text AS acciones_habilitadas
FROM flota_permisos_roles
WHERE habilitado = true
GROUP BY rol
ORDER BY rol;

-- 6. Ver la matriz completa (rol x accion)
SELECT rol, accion, habilitado, actualizado_en
FROM flota_permisos_roles
ORDER BY accion, rol;

-- 7. Verificar que la columna del Administrador no pueda quedar bloqueada
SELECT * FROM flota_permisos_roles
WHERE rol = 'admin' AND habilitado = false;
-- (Sin resultados esperados: el rol admin mantiene control total.)
```

---

## 6. Fase 4: Arquitectura Backend (Conexión Frontend <-> PostgreSQL)

Actualmente el frontend opera como una SPA que genera y exporta SQL, y guarda datos en el navegador. Para conectar el frontend directamente a la base de datos PostgreSQL, el agente de IA debe implementar una capa de API en NodeJS/Express:

### 6.1. Paquetes requeridos
```bash
npm install pg dotenv
npm install -D @types/pg
```

### 6.2. Configuración del Pool (`server/db.ts`)
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://corpoelec_admin:Corpoelec2026*@localhost:5432/corpoelec_flota_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 6.3. Rutas principales de la API (`server/routes.ts`)
1. `GET /api/vehiculos` -> Consulta `flota_vehiculos`.
2. `POST /api/vehiculos` -> Inserción/actualización con validación de correlativo.
3. `POST /api/auth/login` -> Validación contra tabla `usuarios` (con `bcrypt` o password hash institucional).
4. `GET /api/catalogos` -> Consulta de `catalogos_maestros` y `centros_servicios`.
5. `GET /api/kpis` -> Consulta de vistas `v_resumen_operativo_flota` y `v_kpis_mantenimiento`.

---

## 7. Fase 5: Procedimiento de Migración a INSFORGE

**INSFORGE** es la plataforma de infraestructura de aplicaciones y bases de datos corporativas donde se desplegará el sistema en producción.

### 7.1. Obtención de Credenciales de INSFORGE
En el panel de INSFORGE o mediante el equipo de infraestructura, obtén:
- `INSFORGE_DATABASE_URL`: Cadena de conexión PostgreSQL (ejemplo: `postgresql://insforge_user:SecretPass@db.insforge.corpoelec.gob.ve:5432/flota_prod`).
- `INSFORGE_APP_HOST`: Dominio asignado para la aplicación web.

### 7.2. Migración del Esquema y Datos hacia INSFORGE

#### Método 1: Ejecución directa por CLI con `psql`
```bash
# Ejecutar el paquete completo directamente sobre el nodo de INSFORGE
psql "$INSFORGE_DATABASE_URL" -f database/00_corpoelec_flota_completo.sql
```

#### Método 2: Volcado y Restauración (`pg_dump` local -> `pg_restore` INSFORGE)
Si realizaste modificaciones locales y deseas transferir el estado exacto:
```bash
# 1. Generar dump limpio desde la base local
pg_dump -h localhost -U corpoelec_admin -d corpoelec_flota_db --no-owner --no-acl -F c -b -v -f backup_flota_local.dump

# 2. Restaurar en INSFORGE
pg_restore -d "$INSFORGE_DATABASE_URL" --no-owner --clean --if-exists -v backup_flota_local.dump
```

### 7.3. Configuración de Variables en INSFORGE
En el panel de configuración de variables de entorno de INSFORGE, agrega:
```ini
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://[USUARIO]:[PASSWORD]@[HOST_INSFORGE]:5432/[DB_INSFORGE]"
APP_NAME="CORPOELEC - Sistema de Gestión de Flota Vehicular GGPD"
SYSTEM_CHECKPOINT="SISFLOTA01"

# Variables públicas del frontend (modo híbrido de permisos RBAC)
VITE_INSFORGE_API_URL="https://[PROYECTO].insforge.app"
VITE_INSFORGE_URL="https://[PROYECTO].insforge.app"
VITE_INSFORGE_ANON_KEY="anon_..."
```

### 7.4. Despliegue del Esquema InsForge (tablas `flota_*`)
Las tablas de InsForge se declaran en `database/insforge_flota_schema.sql` y se aplican con el CLI oficial:
```bash
npx -y @insforge/cli db query -f database/insforge_flota_schema.sql
```
> **Nota importante (PostgREST/InsForge):** en los filtros `in.(...)` los valores van **SIN comillas** (`rol=in.(admin,nacional,gerente,estado)`). Con comillas el `DELETE` responde `204` pero **no borra filas**, lo que provoca un `HTTP 409` por la restricción `UNIQUE(rol, accion)` en el `POST` siguiente. Ver `src/services/insforgeService.ts`.

### 7.5. Build y Despliegue de la Aplicación en INSFORGE
```bash
# Compilar frontend
npm run build

# Si la plataforma requiere arranque de servidor:
npm run start # O node server.ts
```

---

## 8. Prompt Específico para Indicar al Agente de IA Local

Cuando abras tu proyecto en tu editor local (Cursor, VS Code con Claude/Copilot o Windsurf), copia y pega el siguiente prompt:

```text
Actúa como Arquitecto de Software Senior y Especialista en Bases de Datos PostgreSQL para CORPOELEC. 
He descargado el repositorio del "Sistema de Gestión de Flota Vehicular (GGPD)". 

Por favor, lee detalladamente el archivo "GUIA_MIGRACION_IA_INSFORGE.md" en la raíz del proyecto.
Tus tareas son:
1. Validar que todas las dependencias estén instaladas y el proyecto compile sin errores.
2. Analizar el archivo "database/00_corpoelec_flota_completo.sql" y verificar que cumpla con las 9 tablas, índices y vistas descritas.
3. Ayudarme a levantar la base de datos localmente (vía docker compose en database/ o psql local).
4. Ejecutar las consultas de validación de la sección 5 de la guía para certificar el estado de la base de datos y la existencia del punto de control SISFLOTA01.
5. Verificar el **Módulo de Control de Permisos por Rol (RBAC)**: que la tabla `public.flota_permisos_roles` tenga 68 filas (17 acciones × 4 roles) y que el rol `admin` conserve todas sus acciones habilitadas.
6. Preparar los scripts de migración para transferir esta base de datos a la plataforma INSFORGE con las variables de entorno de producción, incluidas las variables públicas `VITE_INSFORGE_*`.

Indícame cuál es el primer paso y procedamos ordenadamente.
```

---
*Documento generado y certificado por el motor de ingeniería de software del Sistema de Flota Vehicular CORPOELEC - GGPD.*
