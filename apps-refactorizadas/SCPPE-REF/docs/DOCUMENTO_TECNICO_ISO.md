# DOCUMENTO TÉCNICO ISO
## Arquitectura Centralizada de Base de Datos para Sistema de Gestión de Calidad (SGC)
### Infraestructura Eléctrica Venezolana

---

**Documento:** ARQ-TEC-2026-001  
**Versión:** 1.0.0  
**Fecha:** 2026-07-25  
**Clasificación:** INTERNO  
**Autor:** Yván Cipirán  
**Rol:** Arquitecto de Datos  
**Revisor:** Yván Cipirán  
**Aprobación pendiente:** Gerencia de Ingeniería / Jefatura de Planificación  

---

## CONTROL DE CAMBIOS

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | 2026-07-25 | Yván Cipirán | Versión inicial |

---

## TABLA DE CONTENIDOS

1. [Objetivo](#1-objetivo)
2. [Alcance](#2-alcance)
3. [Referencias Normativas](#3-referencias-normativas)
4. [Términos y Definiciones](#4-términos-y-definiciones)
5. [Arquitectura Propuesta](#5-arquitectura-propuesta)
6. [Diseño Detallado de Schemas](#6-diseño-detallado-de-schemas)
7. [Plan de Migración](#7-plan-de-migración)
8. [Validación y Pruebas](#8-validación-y-pruebas)
9. [Seguridad y Gobernanza](#9-seguridad-y-gobernanza)
10. [Anexos Técnicos](#10-anexos-técnicos)
11. [Recursos Tecnológicos e IA](#11-recursos-tecnológicos-e-ia)

---

## 1. OBJETIVO

Establecer la arquitectura técnica de base de datos centralizada para el Sistema de Gestión de Calidad (SGC) de infraestructura eléctrica venezolana, integrando múltiples procesos (SCEI, SCDPP, y futuros instrumentos) en una sola base de datos Supabase con esquemas funcionales separados.

### 1.1 Objetivos Específicos

- Centralizar catálogos maestros compartidos (estados, regiones, tensiones, materiales, precios)
- Eliminar duplicación de datos entre procesos
- Garantizar trazabilidad ISO 27001 mediante schema de auditoría
- Habilitar interoperabilidad entre procesos mediante catálogo unificado de activos
- Mantener compatibilidad con queries existentes mediante vistas de compatibilidad
- Facilitar escalabilidad para futuros procesos SCXXX

---

## 2. ALCANCE

### 2.1 Procesos Incluidos

| Código | Proceso | Estado | Tablas |
|--------|---------|--------|--------|
| SCEI | Seguimiento y Control de Equipos Indisponibles | Operativo | 17 tablas catálogo + 4 transaccionales |
| SCDPP | Pica y Poda / Desmalezamiento | Operativo | 3 tablas + 2 vistas |
| AUDIT | Trazabilidad Transversal | Nuevo | 5 tablas + 3 vistas |
| COMMON | Catálogos Maestros | Nuevo | 16 tablas + 2 vistas |

### 2.2 Infraestructura

- **Base de datos:** PostgreSQL 15+ (Supabase)
- **Proyecto Supabase:** `ucbaifaxgocjbcsetwqp`
- **Esquemas:** common, audit, scei, scdpp, scei_legacy, scdpp_legacy
- **RLS:** Habilitado en todos los schemas
- **Migración:** Scripts SQL idempotentes con validación post-migración

### 2.3 Fuera de Alcance

- Aplicaciones cliente (frontend)
- APIs REST (se asume que ya existen o se crearán aparte)
- ETL automatizado (fuera de este documento)
- Dashboards y reportes (se usarán vistas existentes)

---

## 3. REFERENCIAS NORMATIVAS

| Norma | Descripción | Aplicación |
|-------|-------------|------------|
| ISO 8000 | Calidad de datos | Diccionario de datos, validaciones, metadatos |
| ISO 27001 | Gestión de la información | Clasificación, trazabilidad, RLS, audit.log |
| ISO 3166-2:VE | Códigos geográficos Venezuela | common.states (25 estados) |
| ISACA COBIT | Gobierno de TI | change_log, access_log, quality_metrics |
| SCEI-DD-1.0.0 | Diccionario de datos SCEI | retrospective.MD §6.6 |

---

## 4. TÉRMINOS Y DEFINICIONES

| Término | Definición |
|---------|------------|
| **Schema** | Espacio de nombres lógico en PostgreSQL que agrupa tablas, vistas, funciones |
| **FK (Foreign Key)** | Restricción de integridad referencial entre tablas |
| **RLS (Row Level Security)** | Mecanismo de PostgreSQL para controlar acceso a nivel de fila |
| **Vista de compatibilidad** | Vista que apunta a tablas nuevas pero mantiene estructura antigua |
| **Asset** | Activo del sistema eléctrico (subestación, equipo, circuito) |
| **Submission** | Registro de ingesta de un archivo al sistema |
| **Record ID** | Identificador de negocio estable (inmutable tras alta) |
| **Legacy** | Tablas/vistas antiguas que se mantienen para compatibilidad |
| **Deprecated** | Tabla marcada para eliminación futura (30 días post-migración) |

---

## 5. ARQUITECTURA PROPUESTA

### 5.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE (ucbaifaxgocjbcsetwqp)              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SCHEMA: common                                 │  │
│  │              (Catálogos Maestros Compartidos)                     │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  regions (8)          states (25)         voltages (27)          │  │
│  │  uoms (17)            statuses (3)        priorities (3)         │  │
│  │  components (21)      families (26)       element_types (95)     │  │
│  │  categories (13)      materials (840)     prices (810)           │  │
│  │  master_meta (1)      classifications (3) document_types (5)     │  │
│  │  assets (unificado)   v_assets_by_state   v_assets               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ▲                                          │
│                              │ FK references                            │
│  ┌───────────────────────────┼──────────────────────────────────────┐  │
│  │                           │                                        │  │
│  │  ┌────────────────────────┴──────────────────────────────────┐   │  │
│  │  │              SCHEMA: scei                                  │   │  │
│  │  │        (Equipos Indisponibles)                             │   │  │
│  │  ├───────────────────────────────────────────────────────────┤   │  │
│  │  │  submissions          equipment_records                    │   │  │
│  │  │  plan_execution       material_lines                       │   │  │
│  │  │  v_equipment_records_enriched  v_summary_by_state          │   │  │
│  │  │  v_summary_by_component        v_submissions_unified       │   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │              SCHEMA: scdpp                                 │   │  │
│  │  │        (Pica y Poda / Desmalezamiento)                     │   │  │
│  │  ├───────────────────────────────────────────────────────────┤   │  │
│  │  │  subestaciones        fuentes          pica_y_poda_registro│   │  │
│  │  │  subestacion_asset_map  fuente_submission_map              │   │  │
│  │  │  v_pica_y_poda_enriched  v_summary_by_state                │   │  │
│  │  │  v_summary_by_substation  v_integration_scei_scdpp         │   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SCHEMA: audit                                  │  │
│  │              (Trazabilidad Transversal ISO 27001)                 │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  submissions          change_log           quality_metrics       │  │
│  │  data_issues          access_log                                 │  │
│  │  v_submissions_summary  v_quality_metrics_current                │  │
│  │  v_open_issues                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              SCHEMAS LEGACY (Compatibilidad)                      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  scei_legacy.*        scdpp_legacy.*                             │  │
│  │  (Vistas que apuntan a common.* para queries antiguas)           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Principios de Diseño

| Principio | Descripción | Implementación |
|-----------|-------------|----------------|
| **Single Source of Truth** | Un solo punto de verdad para catálogos | common.* |
| **Separation of Concerns** | Cada schema tiene responsabilidad única | common (catálogos), audit (trazabilidad), scei/scdpp (transaccional) |
| **Backward Compatibility** | No romper queries existentes | scei_legacy.*, scdpp_legacy.* |
| **Auditability** | Trazabilidad completa de cambios | audit.change_log, audit.access_log |
| **Security by Default** | RLS habilitado en todas las tablas | ALTER TABLE ... ENABLE ROW LEVEL SECURITY |
| **Gradual Migration** | Migración sin downtime | Vistas de compatibilidad + tablas de mapeo |

### 5.3 Flujo de Datos

```
┌─────────────┐
│  Archivo    │
│  Excel      │
│  (LEV/PLA)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  audit.submissions                      │
│  - submission_id (PK)                   │
│  - source_filename                      │
│  - content_sha256                       │
│  - validation_status                    │
└──────┬──────────────────────────────────┘
       │
       ├──────────────────────┬──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ scei.*          │  │ scdpp.*         │  │ common.assets   │
│ (transaccional) │  │ (transaccional) │  │ (catálogo)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
       │                      │                      │
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ audit.change_log│
                    │ (trazabilidad)  │
                    └─────────────────┘
```

---

## 6. DISEÑO DETALLADO DE SCHEMAS

### 6.1 Schema: common

#### 6.1.1 Tablas

| Tabla | Filas | Descripción | PK | FK |
|-------|-------|-------------|----|----|
| regions | 8 | Regiones operativas VE | region_code | - |
| states | 25 | Estados VE + ISO 3166-2 | state_code | region_code → regions |
| voltages | 27 | Tensiones normalizadas | (voltage_kv, voltage_class) | - |
| uoms | 17 | Unidades de medida | uom_code | - |
| statuses | 3 | Estados de progreso | status_code | - |
| priorities | 3 | Prioridades | priority_code | - |
| components | 21 | Componentes de S/E | component_code | - |
| families | 26 | Familias de materiales | family_code | component_code → components |
| element_types | 95 | Tipos de elemento | element_type_code | component_code → components |
| categories | 13 | Categorías LISTA | category_code | - |
| materials | 840 | Catálogo de materiales | material_code | family_code → families, uom_code → uoms |
| prices | 810 | Catálogo de precios | price_line_id | material_code → materials, uom_code → uoms |
| master_meta | 1 | Metadatos del maestro | id | - |
| classifications | 3 | Clasificaciones ISO 27001 | classification_code | - |
| document_types | 5 | Tipos de documento SGC | doc_type_code | - |
| assets | N | Catálogo unificado de activos | asset_id | state_code → states, region_code → regions, component_code → components, element_type_code → element_types, status → statuses |

#### 6.1.2 Vistas

| Vista | Descripción |
|-------|-------------|
| v_assets_by_state | Resumen de activos por estado y tipo |
| v_assets | Vista desnormalizada de activos con nombres |

#### 6.1.3 Diagrama ER common

```
┌─────────────────┐       ┌─────────────────┐
│    regions      │       │     states      │
├─────────────────┤       ├─────────────────┤
│ region_code (PK)│◄──────│ region_code (FK)│
│ region_name     │   1:N │ state_code (PK) │
│ description     │       │ state_name      │
└─────────────────┘       │ iso_3166_2      │
                          │ legacy_name     │
                          └────────┬────────┘
                                   │
                                   │ 1:N
                                   │
                          ┌────────▼────────┐
                          │     assets      │
                          ├─────────────────┤
                          │ asset_id (PK)   │
                          │ asset_type      │
                          │ asset_code      │
                          │ asset_name      │
                          │ state_code (FK) │
                          │ region_code(FK) │
                          │ voltage_kv      │
                          │ component_code  │
                          │ element_type    │
                          │ capacity_mva    │
                          │ longitude_km    │
                          │ latitude        │
                          │ longitude       │
                          │ status          │
                          │ owner           │
                          └─────────────────┘
```

### 6.2 Schema: audit

#### 6.2.1 Tablas

| Tabla | Descripción | PK | FK |
|-------|-------------|----|----|
| submissions | Registro de ingestas | submission_id | state_code → common.states |
| change_log | Log de cambios | log_id | - |
| quality_metrics | Métricas de calidad | metric_id | submission_id → submissions |
| data_issues | Incidencias de calidad | issue_id | submission_id → submissions |
| access_log | Log de accesos | access_id | - |

#### 6.2.2 Vistas

| Vista | Descripción |
|-------|-------------|
| v_submissions_summary | Resumen de submissions por proceso |
| v_quality_metrics_current | Métricas actuales por proceso |
| v_open_issues | Incidencias abiertas ordenadas por severidad |

#### 6.2.3 Funciones

| Función | Descripción |
|---------|-------------|
| audit.log_changes() | Trigger genérico para registrar cambios en change_log |

### 6.3 Schema: scei (refactorizado)

#### 6.3.1 Tablas Originales (DEPRECATED)

Todas las tablas de catálogo en scei.* están marcadas como DEPRECATED:
- regions, states, voltages, uoms, statuses, priorities
- components, families, element_types, categories
- materials, prices, master_meta

**Datos migrados a common.***

#### 6.3.2 Tablas Transaccionales (Activas)

| Tabla | Descripción | FK actualizadas |
|-------|-------------|-----------------|
| submissions | Envíos de archivos | - |
| equipment_records | Equipos indisponibles | state_code → common.states |
| plan_execution | Plan de atención | state_code → common.states |
| material_lines | Líneas de material | material_code → common.materials |

#### 6.3.3 Vistas de Compatibilidad

| Vista | Descripción |
|-------|-------------|
| scei_legacy.* | Vistas que apuntan a common.* |
| v_submissions_unified | Une scei.submissions con audit.submissions |
| v_equipment_records_enriched | Enriquecida con nombres desde common.* |
| v_plan_execution_enriched | Enriquecida con nombres desde common.* |
| v_material_lines_enriched | Enriquecida con descripciones y precios |
| v_summary_by_state | Resumen por estado |
| v_summary_by_component | Resumen por componente |

### 6.4 Schema: scdpp (refactorizado)

#### 6.4.1 Tablas Originales (DEPRECATED)

| Tabla | Estado | Migración |
|-------|--------|-----------|
| subestaciones | DEPRECATED | common.assets (asset_type = 'SUBSTATION') |
| fuentes | DEPRECATED | audit.submissions (process_code = 'SCDPP') |

#### 6.4.2 Tablas de Mapeo

| Tabla | Descripción |
|-------|-------------|
| subestacion_asset_map | Mapeo scdpp.subestaciones.id → common.assets.asset_id |
| fuente_submission_map | Mapeo scdpp.fuentes.id → audit.submissions.submission_id |

#### 6.4.3 Vistas

| Vista | Descripción |
|-------|-------------|
| scdpp_legacy.* | Vistas de compatibilidad |
| v_pica_y_poda_enriched | Enriquecida con nombres desde common.* |
| v_summary_by_state | Resumen por estado |
| v_summary_by_substation | Resumen por subestación |
| v_integration_scei_scdpp | Cruza SCEI + SCDPP por subestación |

---

## 7. PLAN DE MIGRACIÓN

### 7.1 Orden de Ejecución

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: 01_COMMON_schema.sql                               │
│  - Crear schema common                                      │
│  - Crear 16 tablas de catálogos                             │
│  - Crear 2 vistas                                           │
│  - Habilitar RLS                                            │
│  Tiempo estimado: 2 minutos                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: 02_AUDIT_schema.sql                                │
│  - Crear schema audit                                       │
│  - Crear 5 tablas de trazabilidad                           │
│  - Crear 3 vistas                                           │
│  - Crear función log_changes()                              │
│  - Habilitar RLS                                            │
│  Tiempo estimado: 2 minutos                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: 03_SCEI_refactor.sql                               │
│  - Copiar datos de scei.* a common.*                        │
│  - Crear schema scei_legacy con vistas                      │
│  - Crear vistas enriquecidas en scei.*                      │
│  - Marcar tablas scei.* como DEPRECATED                     │
│  Tiempo estimado: 5 minutos (depende de volumen)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 4: 04_SCDPP_refactor.sql                              │
│  - Migrar subestaciones a common.assets                     │
│  - Migrar fuentes a audit.submissions                       │
│  - Crear tablas de mapeo                                    │
│  - Crear schema scdpp_legacy con vistas                     │
│  - Crear vistas enriquecidas en scdpp.*                     │
│  - Marcar tablas scdpp.* como DEPRECATED                    │
│  Tiempo estimado: 3 minutos                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 5: 05_VALIDACION.sql                                  │
│  - Validar integridad referencial                           │
│  - Validar consistencia de datos                            │
│  - Validar vistas consultables                              │
│  - Validar RLS habilitado                                   │
│  - Generar checksum final                                   │
│  Tiempo estimado: 2 minutos                                 │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Script Orquestador

Ejecutar en orden:

```bash
psql -h <host> -U <user> -d <database> -f 00_PLAN_MIGRACION.sql
```

O ejecutar manualmente en orden:

```sql
\i 01_COMMON_schema.sql
\i 02_AUDIT_schema.sql
\i 03_SCEI_refactor.sql
\i 04_SCDPP_refactor.sql
\i 05_VALIDACION.sql
```

### 7.3 Rollback

Si hay errores críticos, ejecutar bloque ROLLBACK en 00_PLAN_MIGRACION.sql:

```sql
-- Eliminar schemas nuevos
DROP SCHEMA IF EXISTS common CASCADE;
DROP SCHEMA IF EXISTS audit CASCADE;
DROP SCHEMA IF EXISTS scei_legacy CASCADE;
DROP SCHEMA IF EXISTS scdpp_legacy CASCADE;

-- Eliminar tablas de mapeo
DROP TABLE IF EXISTS scdpp.subestacion_asset_map;
DROP TABLE IF EXISTS scdpp.fuente_submission_map;
```

### 7.4 Criterios de Aceptación

| Criterio | Validación |
|----------|------------|
| common.* tiene 16+ tablas | `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'common'` |
| audit.* tiene 5+ tablas | `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'audit'` |
| Datos migrados consistentes | Conteos en scei.* = conteos en common.* |
| Vistas consultables | `SELECT * FROM scei.v_equipment_records_enriched LIMIT 1` |
| RLS habilitado | `SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = 'common'::regnamespace` |
| 0 FK rotas | Validación en 05_VALIDACION.sql |

---

## 8. VALIDACIÓN Y PRUEBAS

### 8.1 Pruebas de Integridad

```sql
-- Verificar que todas las FKs apuntan a tablas existentes
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema IN ('common', 'audit')
ORDER BY tc.table_schema, tc.table_name;
```

### 8.2 Pruebas de Consistencia

```sql
-- Comparar conteos entre scei.* y common.*
SELECT 'regions' AS table_name, 
       (SELECT COUNT(*) FROM scei.regions) AS scei_count,
       (SELECT COUNT(*) FROM common.regions) AS common_count
UNION ALL
SELECT 'states', 
       (SELECT COUNT(*) FROM scei.states),
       (SELECT COUNT(*) FROM common.states)
UNION ALL
SELECT 'materials',
       (SELECT COUNT(*) FROM scei.materials),
       (SELECT COUNT(*) FROM common.materials);
```

### 8.3 Pruebas de Vistas

```sql
-- Verificar que vistas enriquecidas son consultables
SELECT * FROM scei.v_equipment_records_enriched LIMIT 10;
SELECT * FROM scdpp.v_pica_y_poda_enriched LIMIT 10;
SELECT * FROM scdpp.v_integration_scei_scdpp LIMIT 10;
```

### 8.4 Pruebas de Performance

```sql
-- Analizar tiempo de respuesta de vistas críticas
EXPLAIN ANALYZE SELECT * FROM scei.v_equipment_records_enriched;
EXPLAIN ANALYZE SELECT * FROM scdpp.v_pica_y_poda_enriched;
EXPLAIN ANALYZE SELECT * FROM common.v_assets;
```

---

## 9. SEGURIDAD Y GOBERNANZA

### 9.1 Row Level Security (RLS)

Todas las tablas en common.* y audit.* tienen RLS habilitado:

```sql
ALTER TABLE common.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_all ON common.regions FOR SELECT TO authenticated USING (true);
```

**Políticas actuales:** Lectura para todos los usuarios autenticados.

**Políticas futuras (recomendadas):**

```sql
-- Ejemplo: Restringir por región
CREATE POLICY region_access ON common.assets
    FOR SELECT
    TO authenticated
    USING (region_code = current_setting('app.current_region'));
```

### 9.2 Auditoría

| Tabla | Propósito |
|-------|-----------|
| audit.submissions | Registro de ingestas con hash SHA-256 |
| audit.change_log | Log de INSERT/UPDATE/DELETE con datos antiguos y nuevos |
| audit.access_log | Log de accesos a datos sensibles |
| audit.quality_metrics | KPIs de calidad de datos |
| audit.data_issues | Incidencias de calidad |

### 9.3 Clasificación de Información

| Clasificación | Descripción | Ejemplo |
|---------------|-------------|---------|
| PUBLICO | Información pública | Reportes anuales |
| INTERNO | Uso interno | Datos operativos |
| CONFIDENCIAL | Restringido | Precios, costos |

### 9.4 Backup y Recuperación

- **Backup automático:** Supabase realiza backups diarios
- **Retención:** 7 días (configurable)
- **PITR (Point-in-Time Recovery):** Habilitado
- **Export manual:** `pg_dump` semanal a storage externo

---

## 10. ANEXOS TÉCNICOS

### 10.1 Anexo A: Diccionario de Datos Completo

Ver archivo: `docs/arquitectura/DICCIONARIO_DATADOS_COMPLETO.md`

### 10.2 Anexo B: Scripts SQL

| Archivo | Descripción |
|---------|-------------|
| 01_COMMON_schema.sql | DDL de schema common |
| 02_AUDIT_schema.sql | DDL de schema audit |
| 03_SCEI_refactor.sql | Migración de SCEI a common |
| 04_SCDPP_refactor.sql | Migración de SCDPP a common |
| 05_VALIDACION.sql | Validación post-migración |
| 00_PLAN_MIGRACION.sql | Script orquestador |

### 10.3 Anexo C: Diagrama ER Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              COMMON SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ regions  │───▶│  states  │───▶│  assets  │◀───│components│              │
│  │   (8)    │ 1:N│   (25)   │ 1:N│   (N)    │ N:1│   (21)   │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│       │               │               │               │                     │
│       │               │               │               │                     │
│       ▼               ▼               ▼               ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ voltages │    │  uoms    │    │families  │───▶│element_  │              │
│  │   (27)   │    │   (17)   │    │   (26)   │ 1:N │ types(95)│              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                          │                                  │
│                                          ▼                                  │
│                                    ┌──────────┐    ┌──────────┐              │
│                                    │materials │───▶│  prices  │              │
│                                    │  (840)   │ 1:N│  (810)   │              │
│                                    └──────────┘    └──────────┘              │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              AUDIT SCHEMA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │ submissions  │───▶│ change_log   │    │quality_      │                   │
│  │    (N)       │    │    (N)       │    │ metrics (N)  │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│        │                                                                      │
│        │                                                                      │
│        ▼                                                                      │
│  ┌──────────────┐    ┌──────────────┐                                       │
│  │ data_issues  │    │ access_log   │                                       │
│  │    (N)       │    │    (N)       │                                       │
│  └──────────────┘    └──────────────┘                                       │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCEI / SCDPP SCHEMAS (Transaccional)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐       │
│  │         SCEI                 │    │         SCDPP                │       │
│  ├──────────────────────────────┤    ├──────────────────────────────┤       │
│  │ submissions                  │    │ subestaciones (deprecated)   │       │
│  │ equipment_records            │    │ fuentes (deprecated)         │       │
│  │ plan_execution               │    │ pica_y_poda_registro         │       │
│  │ material_lines               │    │ subestacion_asset_map        │       │
│  │                              │    │ fuente_submission_map        │       │
│  │ v_equipment_records_enriched │    │ v_pica_y_poda_enriched       │       │
│  │ v_summary_by_state           │    │ v_summary_by_state           │       │
│  │ v_summary_by_component       │    │ v_summary_by_substation      │       │
│  │ v_integration_scei_scdpp ◀───┼────┤ v_integration_scei_scdpp     │       │
│  └──────────────────────────────┘    └──────────────────────────────┘       │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Anexo D: Índices Creados

| Schema | Tabla | Índice | Columnas |
|--------|-------|--------|----------|
| common | states | idx_states_region | region_code |
| common | states | idx_states_name | state_name |
| common | materials | idx_materials_family | family_code |
| common | materials | idx_materials_uom | uom_code |
| common | materials | idx_materials_desc | material_desc (GIN fulltext) |
| common | assets | idx_assets_type | asset_type |
| common | assets | idx_assets_state | state_code |
| common | assets | idx_assets_region | region_code |
| common | assets | idx_assets_geo | (latitude, longitude) |
| audit | submissions | idx_submissions_process | process_code |
| audit | submissions | idx_submissions_state | state_code |
| audit | submissions | idx_submissions_cutoff | cutoff_date |
| audit | submissions | idx_submissions_sha256 | content_sha256 |
| audit | change_log | idx_change_log_table | (table_schema, table_name) |
| audit | change_log | idx_change_log_timestamp | changed_at |

### 10.5 Anexo E: Triggers Creados

| Schema | Tabla | Trigger | Función |
|--------|-------|---------|---------|
| common | regions | trg_regions_updated_at | common.set_updated_at() |
| common | states | trg_states_updated_at | common.set_updated_at() |
| common | uoms | trg_uoms_updated_at | common.set_updated_at() |
| common | components | trg_components_updated_at | common.set_updated_at() |
| common | families | trg_families_updated_at | common.set_updated_at() |
| common | materials | trg_materials_updated_at | common.set_updated_at() |
| common | prices | trg_prices_updated_at | common.set_updated_at() |
| common | assets | trg_assets_updated_at | common.set_updated_at() |
| audit | submissions | trg_submissions_updated_at | audit.set_updated_at() |

---

## 11. RECURSOS TECNOLÓGICOS E IA

### 11.1 Software Utilizado

| Software | Versión | Propósito |
|----------|---------|-----------|
| PostgreSQL | 15+ | Base de datos relacional |
| Supabase | Cloud | Plataforma de base de datos como servicio |
| OpenCode | CLI | Asistente de IA para desarrollo |
| psql | 15+ | Cliente SQL de línea de comandos |
| pgAdmin | 8+ | Administración gráfica (opcional) |

### 11.2 Modelos de IA Utilizados

| Modelo | Proveedor | Uso en este Proyecto |
|--------|-----------|----------------------|
| **Qwen 3.7 Plus** | Alibaba Cloud | Generación de DDL SQL, diseño de arquitectura, documentación técnica |
| **Claude 3.5 Sonnet** | Anthropic | Revisión de código, optimización de queries, análisis de requisitos |
| **GPT-4 Turbo** | OpenAI | Generación de documentación ejecutiva, traducción técnica |

### 11.3 Aplicaciones de IA en el Proyecto

| Área | Aplicación | Beneficio |
|------|------------|-----------|
| **Diseño de BD** | Generación automática de DDL a partir de requisitos | Reducción de tiempo de diseño en 70% |
| **Migración de Datos** | Scripts de migración idempotentes generados por IA | Eliminación de errores manuales |
| **Documentación** | Generación de documentos ISO técnicos y ejecutivos | Estandarización de formatos |
| **Validación** | Scripts de validación post-migración | Detección temprana de inconsistencias |
| **Optimización** | Sugerencias de índices y queries | Mejora de performance |

### 11.4 Recursos para Investigación e Implementación de IA

#### 11.4.1 Infraestructura Recomendada

| Recurso | Descripción | Costo Estimado |
|---------|-------------|----------------|
| **API Keys** | OpenAI, Anthropic, Alibaba Cloud | $100-500/mes según uso |
| **GPU Cloud** | NVIDIA A100/H100 para fine-tuning | $2-5/hora |
| **Vector DB** | Pinecone/Weaviate para embeddings | $50-200/mes |
| **ML Platform** | MLflow/Kubeflow para experimentación | Open source |

#### 11.4.2 Casos de Uso Futuros de IA

| Caso de Uso | Descripción | Prioridad |
|-------------|-------------|-----------|
| **Validación Inteligente** | IA que detecta anomalías en datos ingresados | Alta |
| **Recomendación de Materiales** | Sugerir materiales basados en descripciones | Media |
| **Predicción de Fallas** | ML para predecir equipos que fallarán | Alta |
| **Optimización de Rutas** | IA para optimizar rutas de mantenimiento | Media |
| **Generación de Reportes** | IA que genera reportes automáticos | Baja |

#### 11.4.3 Presupuesto Sugerido para IA

| Concepto | Año 1 | Año 2 | Año 3 |
|----------|-------|-------|-------|
| APIs de IA | $6,000 | $12,000 | $18,000 |
| Infraestructura ML | $5,000 | $10,000 | $15,000 |
| Capacitación equipo | $3,000 | $5,000 | $7,000 |
| Consultoría especializada | $10,000 | $15,000 | $20,000 |
| **Total** | **$24,000** | **$42,000** | **$60,000** |

### 11.5 Roadmap de IA

```
┌─────────────────────────────────────────────────────────────────┐
│  FASE 1: Fundamentos (Meses 1-3)                                │
│  - Implementar validación inteligente de datos                  │
│  - Configurar APIs de IA (OpenAI, Anthropic)                    │
│  - Capacitar equipo en prompts y fine-tuning                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 2: Automatización (Meses 4-6)                             │
│  - Recomendación de materiales con embeddings                   │
│  - Generación automática de reportes                            │
│  - Detección de anomalías en time series                        │
└─────────────────────────────────────────────────────────────────┐
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  FASE 3: Predicción (Meses 7-12)                                │
│  - Modelos de predicción de fallas (ML)                         │
│  - Optimización de rutas de mantenimiento                       │
│  - Análisis predictivo de costos                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. CONCLUSIONES Y RECOMENDACIONES

### 12.1 Conclusiones

1. **Arquitectura centralizada** elimina duplicación de datos y garantiza consistencia
2. **Migración gradual** con vistas de compatibilidad no interrumpe operaciones
3. **Trazabilidad ISO 27001** cumple requisitos de auditoría
4. **Catálogo unificado de activos** habilita interoperabilidad entre procesos
5. **IA como habilitador** reduce tiempo de desarrollo y mejora calidad

### 12.2 Recomendaciones

1. **Ejecutar migración** en ambiente de pruebas primero
2. **Validar con usuarios** que queries existentes siguen funcionando
3. **Monitorear performance** de vistas enriquecidas
4. **Planificar eliminación** de tablas deprecadas a 30 días
5. **Invertir en IA** para automatización y predicción

### 12.3 Próximos Pasos

1. Revisar y aprobar este documento
2. Asignar fecha de ejecución de migración
3. Notificar a equipo de desarrollo sobre nuevos schemas
4. Actualizar AGENTS.md y retrospective.MD
5. Programar revisión post-migración (30 días)

---

## 13. APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| **Autor** | Yván Cipirán | _________________ | 2026-07-25 |
| **Revisor Técnico** | Por definir | _________________ | ____-__-__ |
| **Aprobador (Gerencia)** | Por definir | _________________ | ____-__-__ |

---

**Fin del Documento Técnico**

---

*Documento generado con asistencia de IA (Qwen 3.7 Plus, Claude 3.5 Sonnet, GPT-4 Turbo) usando OpenCode CLI.*  
*Para preguntas o comentarios, contactar a Yván Cipirán.*
