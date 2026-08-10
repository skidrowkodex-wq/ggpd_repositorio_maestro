# DOCUMENTACIÓN ISO 8000/27001 - FASE 3: METAS FÍSICAS

## 1. ALCANCE DE LA IMPLEMENTACIÓN

### 1.1 Objetivo
Implementar el sistema de metas físicas mensuales para Planes Operativos Anuales (POA) 
con trazabilidad completa de aprobación y control de cambios.

### 1.2 Alcance
- Tabla `accion_especifica`: Campos adicionales
- Tabla `meta_fisica`: Metas físicas mensuales
- Tabla `poa_aprobacion`: Control de aprobación
- Tabla `partida_mensual`: Programación presupuestaria mensual
- Vistas de consulta y reportes

---

## 2. CUMPLIMIENTO ISO 8000 - CALIDAD DE DATOS

### 2.1 Dimensión: Unicidad

| Campo/Tabla | Restricción | Descripción |
|-------------|-------------|-------------|
| `meta_fisica` | UNIQUE(accion_especifica_id, mes_id, anio) | Un registro por acción/mes/año |
| `partida_mensual` | UNIQUE(partida_presupuestaria_id, mes_id, anio) | Un registro por partida/mes/año |
| `poa_aprobacion` | UNIQUE(poa_id) | Un solo registro de aprobación por POA |

### 2.2 Dimensión: Integridad

| Restricción | Tipo | Descripción |
|-------------|------|-------------|
| `fk_meta_fisica_accion` | FK CASCADE | Eliminación en cascada desde acción |
| `fk_meta_fisica_mes` | FK RESTRICT | No permite eliminar mes en uso |
| `chk_meta_fisica_programado` | CHECK | programado >= 0 |
| `chk_meta_fisica_ejecutado` | CHECK | ejecutado >= 0 |
| `chk_meta_fisica_eficacia` | CHECK | eficacia entre 0 y 100 |

### 2.3 Dimensión: Consistencia

| Mecanismo | Descripción |
|-----------|-------------|
| Campo GENERATED `eficacia` | Cálculo automático (ejecutado/programado)*100 |
| Triggers `updated_at` | Actualización automática de timestamp |
| Vistas materializadas | Consistencia en consultas |

### 2.4 Dimensión: Completitud

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `unidad_medida` | VARCHAR(100) | Unidad de medida de la acción |
| `anio` | INTEGER | Año de la meta |
| `programado` | DECIMAL(15,2) | Cantidad programada |
| `ejecutado` | DECIMAL(15,2) | Cantidad ejecutada |

---

## 3. CUMPLIMIENTO ISO 27001 - SEGURIDAD DE LA INFORMACIÓN

### 3.1 Control A.12.4.1 - Registro de Eventos

| Tabla | Propósito |
|-------|-----------|
| `auditoria` | Registro de todos los cambios en metas físicas |
| `poa_aprobacion` | Registro de aprobaciones con trazabilidad |

### 3.2 Control A.12.4.3 - Administración de Capacitación

| Vista | Propósito |
|-------|-----------|
| `v_meta_fisica_poa` | Consulta de metas por POA |
| `v_trazabilidad_aprobacion` | Consulta de aprobaciones |

### 3.3 Control A.14.2.8 - Pruebas de Sistema

| Mecanismo | Descripción |
|-----------|-------------|
| Constraints CHECK | Validación automática de datos |
| Campos GENERATED | Cálculos automáticos verificables |
| Vistas | Validación de consistencia |

---

## 4. CUMPLIMIENTO ISACA COBIT

### 4.1 BAI04 - Gestión de Cambios

| Control | Implementación |
|---------|----------------|
| Registro de cambios | Tabla `auditoria` |
| Aprobación de cambios | Tabla `poa_aprobacion` |
| Trazabilidad | Snapshot JSON de metas |

### 4.2 DSS06 - Gestión de Procesos

| Control | Implementación |
|---------|----------------|
| Definición de procesos | Vistas de consulta |
| Monitoreo | Campos GENERATED de eficacia |
| Reportes | Vistas consolidadas |

---

## 5. MATRIZ DE TRAZABILIDAD

| Requisito ISO | Elemento Implementado | Evidencia |
|---------------|----------------------|-----------|
| ISO 8000 Unicidad | UNIQUE constraints | Script SQL |
| ISO 8000 Integridad | FK constraints | Script SQL |
| ISO 8000 Consistencia | GENERATED fields | Script SQL |
| ISO 27001 A.12.4.1 | Tabla auditoría | Script SQL |
| ISO 27001 A.14.2.8 | Vistas de validación | Script SQL |
| ISACA BAI04 | poa_aprobacion | Script SQL |

---

## 6. INVENTARIO DE TABLAS CREADAS

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `accion_especifica` | Modificada (+2 campos) | - |
| `meta_fisica` | Nueva | - |
| `poa_aprobacion` | Nueva | - |
| `partida_mensual` | Nueva | - |
| `v_meta_fisica_poa` | Vista | - |
| `v_resumen_meta_fisica` | Vista | - |
| `v_trazabilidad_aprobacion` | Vista | - |
| `v_resumen_poa_meta_fisica` | Vista | - |
| `v_programacion_mensual_partida` | Vista | - |

---

## 7. FECHA DE IMPLEMENTACIÓN

| Fase | Estado | Fecha |
|------|--------|-------|
| 3.1 accion_especifica | Completada | 2026-03-08 |
| 3.2 meta_fisica | Completada | 2026-03-08 |
| 3.3 poa_aprobacion | Completada | 2026-03-08 |
| 3.4 partida_mensual | Completada | 2026-03-08 |
| 3.5 vistas | Completada | 2026-03-08 |
| 3.6 documentación | Completada | 2026-03-08 |

---

## 8. APROBACIÓN

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Project Manager | - | - | - |
| Auditor ISO | - | - | - |
| Auditor ISACA | - | - | - |

---

## ANEXOS

### ANEXO A: ESTRUCTURA COMPLETA DE BASE DE DATOS (22 TABLAS)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ESTRUCTURA JERÁRQUICA POA                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    EMPRESA      │
├─────────────────┤
│ id (PK)         │
│ codigo          │
│ nombre          │
│ rif             │
│ tipo            │──→ [PÚBLICA | PRIVADA]
│ ambito          │──→ [NACIONALES | INTERNACIONALES | MIXTAS]
│ + auditoría ISO │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│      ENTE       │
├─────────────────┤
│ id (PK)         │
│ empresa_id (FK) │
│ codigo          │
│ nombre          │
│ tipo            │──→ [OPERADOR | FUNDACIÓN | ENTE AUTÓNOMO | ENTE ADSCRITO | OTROS]
│ + auditoría ISO │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              GERENCIA                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                                     │
│ ente_id (FK)                                                                                │
│ codigo                                                                                      │
│ nombre                                                                                      │
│ ambito          │──→ [GENERAL | NACIONAL | REGIONAL | ESTADAL]                             │
│ proceso_medular │──→ [GENERACIÓN | TRANSMISIÓN | DISTRIBUCIÓN | COMERCIALIZACIÓN | NO APLICA]│
│ ceco            │──→ Centro de Costos                                                       │
│ codigo_sap      │──→ Código SAP corporativo                                                 │
│ region_id (FK)  │──→ region_geografica                                                      │
│ estado_id (FK)  │──→ estado                                                                 │
│ municipio_id(FK)│──→ municipio                                                              │
│ direccion_fisica│──→ Dirección manual                                                       │
│ centro_servicios│──→ [Centro de Servicios | NO APLICA]                                     │
│ + auditoría ISO │                                                                           │
└────────┬────────────────────────────────────────────────────────────────────────────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│     UNIDAD      │
├─────────────────┤
│ id (PK)         │
│ gerencia_id (FK)│
│ codigo          │
│ nombre          │
│ + auditoría ISO │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 POA (Plan Operativo Anual)                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                                     │
│ unidad_id (FK)                                                                              │
│ anio                                                                                         │
│ codigo                                                                                       │
│ nombre                                                                                       │
│ descripcion                                                                                  │
│ fecha_inicio                                                                                 │
│ fecha_fin                                                                                    │
│ estado            │──→ [borrador | en_revision | aprobado | cerrado]                        │
│ politica_sen      │──→ Política del Plan Desarrollo SEN                                      │
│ programa_sen      │──→ Programa del Plan Desarrollo SEN                                      │
│ codigo_sipes      │──→ Código SIPES-APN                                                      │
│ organismo_resp    │──→ Organismo Responsable                                                 │
│ unidad_ejec_local │──→ Unidad Ejecutora Local                                                │
│ obj_espec_unidad  │──→ Objetivo Específico de la Unidad                                      │
│ resp_ejec_nombre  │──→ Responsable de Ejecución                                              │
│ cargo_responsable │──→ Cargo del Responsable                                                 │
│ + auditoría ISO   │                                                                          │
└────────┬────────────────────────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1:N                                │ 1:1
         ▼                                    ▼
┌─────────────────────────┐    ┌─────────────────────────────────────────────────────────────┐
│   ACCIÓN ESPECÍFICA     │    │                    POA APROBACIÓN                           │
├─────────────────────────┤    ├─────────────────────────────────────────────────────────────┤
│ id (PK)                 │    │ id (PK)                                                     │
│ poa_id (FK)             │    │ poa_id (FK)                                                 │
│ codigo                  │    │ monto_solicitado  │──→ Presupuesto Original                 │
│ nombre                  │    │ monto_asignado    │──→ Presupuesto Real Asignado           │
│ descripcion             │    │ tipo_aprobacion   │──→ [ASIGNADO_IGUAL | ASIGNADO_DIFERENTE]│
│ unidad_medida           │    │ metas_originales  │──→ JSON Snapshot antes de ajuste        │
│ orden                   │    │ metas_ajustadas   │──→ JSON Snapshot después de ajuste      │
│ meta                    │    │ porcentaje_var    │──→ GENERATED                            │
│ indicador               │    │ requiere_ajuste   │──→ Boolean                              │
│ + auditoría ISO         │    │ fecha_aprobacion  │──→ Timestamp                            │
└────────┬────────────────┘    │ aprobado_por      │──→ Usuario                             │
         │                     │ observaciones     │──→ Texto libre                         │
         │                     │ + auditoría ISO   │                                         │
         │                     └─────────────────────────────────────────────────────────────┘
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           META FÍSICA (12 registros por acción)                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                                     │
│ accion_especifica_id (FK)                                                                   │
│ mes_id (FK)                                                                                 │
│ anio                                                                                        │
│ programado            │──→ Cantidad programada del mes                                       │
│ ejecutado             │──→ Cantidad ejecutada del mes                                        │
│ unidad_medida         │──→ Unidad de medida                                                  │
│ eficacia              │──→ GENERATED: (ejecutado/programado)*100                             │
│ + auditoría ISO       │                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐
│  PARTIDA PRESUPUESTARIA │
├─────────────────────────┤
│ id (PK)                 │
│ accion_especifica_id(FK)│
│ codigo                  │──→ Código ONAPRE
│ nombre                  │──→ Denominación
│ descripcion             │
│ monto_presupuestado     │──→ Monto total
│ monto_ejecutado         │
│ moneda                  │──→ [VES | USD | EUR]
│ + auditoría ISO         │
└────────┬────────────────┘
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                        PARTIDA MENSUAL (12 registros por partida)                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                                     │
│ partida_presupuestaria_id (FK)                                                              │
│ mes_id (FK)                                                                                 │
│ anio                                                                                        │
│ monto_solicitado        │──→ Monto solicitado original                                       │
│ monto_asignado          │──→ Monto asignado real                                             │
│ monto_ejecutado         │──→ Monto ejecutado real                                            │
│ eficacia                │──→ GENERATED: (ejecutado/asignado)*100                             │
│ + auditoría ISO         │                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           GEOLOCALIZACIÓN                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│    REGION_GEOGRÁFICA    │
├─────────────────────────┤
│ id (PK)                 │
│ codigo                  │──→ [RG01-RG10]
│ nombre                  │──→ [Capital, Central, Los Llanos, ...]
│ + auditoría ISO         │
└────────┬────────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│     ESTADO      │
├─────────────────┤
│ id (PK)         │
│ region_id (FK)  │
│ codigo_ine      │──→ [01-25]
│ nombre          │──→ [Distrito Capital, Aragua, ...]
│ capital         │
│ + auditoría ISO │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    MUNICIPIO    │
├─────────────────┤
│ id (PK)         │
│ estado_id (FK)  │
│ codigo_ine      │
│ nombre          │
│ capital         │
│ + auditoría ISO │
└─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                        RESPONSABLES (HISTÓRICO)                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   RESPONSABLE   │
├─────────────────┤
│ id (PK)         │
│ cedula          │
│ numero_personal │
│ nombres         │
│ apellidos       │
│ + auditoría ISO │
└────────┬────────┘
         │
         ├────────────────────────────────────────────────────────────┐
         │ 1:N                                                        │ 1:N
         ▼                                                            ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│  GERENCIA_RESPONSABLE   │         │   UNIDAD_RESPONSABLE    │
├─────────────────────────┤         ├─────────────────────────┤
│ gerencia_id (FK)        │         │ unidad_id (FK)          │
│ responsable_id (FK)     │         │ responsable_id (FK)     │
│ numero_designacion      │         │ numero_designacion      │
│ cargo                   │         │ cargo                   │
│ gaceta                  │         │ gaceta                  │
│ fecha_designacion       │         │ fecha_designacion       │
│ fecha_inicio            │         │ fecha_inicio            │
│ fecha_fin               │         │ fecha_fin               │
│ + auditoría ISO         │         │ + auditoría ISO         │
└─────────────────────────┘         └─────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                     POLÍTICAS NACIONALES                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐       ┌─────────────────────────────┐
│   POLITICA_PLAN_PATRIA      │       │  POLITICA_PLAN_CARABOBO     │
├─────────────────────────────┤       ├─────────────────────────────┤
│ id (PK)                     │       │ id (PK)                     │
│ codigo                      │       │ codigo                      │
│ descripcion                 │       │ descripcion                 │
│ linea_estrategica           │       │ linea_estrategica           │
│ objetivo_nacional           │       │ is_active                   │
│ is_active                   │       │ + auditoría ISO             │
│ + auditoría ISO             │       └──────────────┬──────────────┘
└──────────────┬──────────────┘                      │
               │                                     │
               │    1:1 (polimórfico)                │
               ▼                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ENTIDAD_POLÍTICA                             │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                         │
│ entidad_type [POA/ACCION_ESPECIFICA/PROYECTO_ESPECIAL]         │
│ entidad_id                                                      │
│ plan_patria_id (FK)                                             │
│ plan_carabobo_id (FK)                                           │
│ + auditoría ISO                                                 │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                     REFERENCIALES TEMPORALES                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   TRIMESTRE     │
├─────────────────┤
│ id (PK)         │
│ codigo          │──→ [T1, T2, T3, T4]
│ nombre          │──→ [Primer Trimestre, ...]
│ numero          │──→ [1, 2, 3, 4]
│ + auditoría ISO │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│      MES        │
├─────────────────┤
│ id (PK)         │
│ trimestre_id(FK)│
│ codigo          │──→ [MES-01 a MES-12]
│ nombre          │──→ [Enero, Febrero, ...]
│ nombre_corto    │──→ [Ene, Feb, ...]
│ numero          │──→ [1-12]
│ + auditoría ISO │
└─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AUDITORÍA                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    AUDITORÍA    │
├─────────────────┤
│ id (PK)         │
│ tabla_nombre    │──→ Nombre de la tabla modificada
│ registro_id     │──→ UUID del registro
│ operacion       │──→ [INSERT | UPDATE | DELETE]
│ datos_anteriores│──→ JSONB con valores anteriores
│ datos_nuevos    │──→ JSONB con valores nuevos
│ usuario         │──→ Usuario que realizó el cambio
│ fecha           │──→ Timestamp del cambio
│ ip_address      │──→ Dirección IP
└─────────────────┘
```

---

### ANEXO B: FLUJO COMPLETO DE PROCESOS

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO: POA → METAS → APROBACIÓN → PRESUPUESTO                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │    INICIO    │
    └──────┬───────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 1: CREAR POA                                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Código, Nombre, Año, Unidad                                                               │
│ • Fecha inicio, Fecha fin                                                                   │
│ • Políticas (Plan Patria, Plan Carabobo)                                                    │
│ • Datos del instructivo (SIPES, organismo, responsable)                                     │
│ • Estado: BORRADOR                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 2: AGREGAR ACCIONES ESPECÍFICAS                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Para cada acción:                                                                           │
│ • Código correlativo (1, 2, 3...)                                                           │
│ • Nombre de la acción                                                                       │
│ • Unidad de medida (Plataforma, Software, Metro, etc.)                                     │
│ • Orden de presentación                                                                     │
│ • Meta general e indicador                                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 3: PROGRAMAR METAS FÍSICAS                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Para cada acción, crear 12 registros (uno por mes):                                         │
│                                                                                             │
│   Acción 1: "Adecuación infraestructura"                                                   │
│   ├── MES-01 (Ene): programado = 0                                                         │
│   ├── MES-02 (Feb): programado = 1   ← Aquí se carga                                      │
│   ├── MES-03 (Mar): programado = 0                                                         │
│   ├── ...                                                                                   │
│   └── MES-12 (Dic): programado = 0                                                         │
│                                                                                             │
│   Total Anual = SUM(meses) = 1                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 4: ENVIAR A REVISIÓN                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Estado: BORRADOR → EN_REVISION                                                            │
│ • Validar completitud de metas                                                              │
│ • Verificar coherencia de datos                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 5: APROBAR POA                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                          DECISIÓN: TIPO DE APROBACIÓN                              │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                             │
│   ┌───────────────────────────────┐     ┌───────────────────────────────┐                  │
│   │   OPCIÓN A:                   │     │   OPCIÓN B:                   │                  │
│   │   ASIGNADO_IGUAL              │     │   ASIGNADO_DIFERENTE          │                  │
│   ├───────────────────────────────┤     ├───────────────────────────────┤                  │
│   │ monto_asignado =              │     │ monto_asignado ≠              │                  │
│   │ monto_solicitado              │     │ monto_solicitado              │                  │
│   │                               │     │                               │                  │
│   │ • Metas originales se         │     │ • Requiere ajuste de metas    │                  │
│   │   mantienen sin cambios       │     │ • Guardar snapshot original    │                  │
│   │ • No hay impacto en           │     │ • Calcular nuevas metas       │                  │
│   │   desempeño proyectado        │     │ • Guardar snapshot ajustado    │                  │
│   │                               │     │ • Registrar variación (%)     │                  │
│   │ Estado: APROBADO              │     │ Estado: APROBADO              │                  │
│   └───────────────────────────────┘     └───────────────────────────────┘                  │
│                                                                                             │
│   Registro en tabla poa_aprobacion:                                                         │
│   • monto_solicitado                                                                        │
│   • monto_asignado                                                                          │
│   • tipo_aprobacion                                                                         │
│   • metas_originales (JSON)                                                                 │
│   • metas_ajustadas (JSON)                                                                  │
│   • porcentaje_variacion (GENERATED)                                                        │
│   • fecha_aprobacion                                                                        │
│   • aprobado_por                                                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 6: CARGAR PARTIDAS PRESUPUESTARIAS                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Para cada acción específica:                                                                │
│ • Crear partidas presupuestarias (402, 403, 404, etc.)                                     │
│ • Para cada partida, crear 12 registros mensuales:                                          │
│                                                                                             │
│   Partida 402 - Materiales                                                                  │
│   ├── MES-01: monto_solicitado, monto_asignado, monto_ejecutado                            │
│   ├── MES-02: ...                                                                           │
│   └── MES-12: ...                                                                           │
│                                                                                             │
│ • Calcular eficacia financiera: (ejecutado/asignado)*100                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 7: EJECUTAR Y SEGUIR                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Durante el año fiscal:                                                                      │
│ • Registrar avance físico en meta_fisica.ejecutado                                         │
│ • Registrar avance financiero en partida_mensual.monto_ejecutado                           │
│ • Calcular eficacias automáticamente (GENERATED)                                           │
│ • Generar reportes de avance                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ PASO 8: CERRAR POA                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Estado: APROBADO → CERRADO                                                                │
│ • Consolidación final                                                                       │
│ • Verificar cumplimiento de metas                                                           │
│ • Archivar para trazabilidad                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │     FIN      │
    └──────────────┘
```

---

### ANEXO C: FLUJO DE TRAZABILIDAD DE APROBACIÓN

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    TRAZABILIDAD: PRESUPUESTO SOLICITADO vs ASIGNADO                         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                          POA "Mejora de Infraestructura"
                          ════════════════════════════════
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
    ┌───────────────────────────┐       ┌───────────────────────────┐
    │   PRESUPUESTO SOLICITADO  │       │   PRESUPUESTO ASIGNADO    │
    │   Total: $100,000         │       │   Total: $85,000          │
    └───────────────────────────┘       └───────────────────────────┘
                    │                                   │
                    │         ┌─────────────────────────┤
                    │         │                         │
                    ▼         ▼                         ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                              poa_aprobacion                                         │
    ├─────────────────────────────────────────────────────────────────────────────────────┤
    │ monto_solicitado: 100,000                                                           │
    │ monto_asignado:   85,000                                                            │
    │ tipo_aprobacion:  ASIGNADO_DIFERENTE                                                │
    │ porcentaje_var:   -15.00%  (GENERATED)                                              │
    │ requiere_ajuste:  true                                                              │
    │                                                                                     │
    │ metas_originales: {                     │ metas_ajustadas: {                       │
    │   "accion_1": {                         │   "accion_1": {                          │
    │     "ene": 10,                          │     "ene": 8,   ← Ajustado              │
    │     "feb": 15,                          │     "feb": 12,  ← Ajustado              │
    │     ...                                 │     ...                                 │
    │   }                                     │   }                                     │
    │ }                                       │ }                                       │
    └─────────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                           IMPACTO EN METAS FÍSICAS                                 │
    ├─────────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                     │
    │   Acción 1: "Adecuación infraestructura"                                           │
    │                                                                                     │
    │   MES    │ ORIGINAL │ AJUSTADO │ DIFERENCIA │ NOTA                                 │
    │   ───────┼──────────┼──────────┼────────────┼─────────────────────────────────────  │
    │   Ene    │    10    │     8    │     -2     │ Reducido por corte presupuestario    │
    │   Feb    │    15    │    12    │     -3     │ Reducido por corte presupuestario    │
    │   Mar    │    20    │    17    │     -3     │ Reducido por corte presupuestario    │
    │   ...    │   ...    │   ...    │    ...     │ ...                                   │
    │   TOTAL  │   100    │    85    │    -15     │ Variación: -15%                       │
    │                                                                                     │
    └─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### ANEXO D: VISTAS CONSULTADAS

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           VISTAS DISPONIBLES                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. v_meta_fisica_poa                                                                       │
│    Propósito: Formulario de metas físicas por POA                                          │
│    Uso: Carga y consulta de metas mensuales                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Columnas:                                                                                  │
│   poa_codigo | accion_codigo | accion_nombre | unidad_medida                              │
│   mes_nombre | programado | ejecutado | eficacia                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. v_resumen_meta_fisica                                                                   │
│    Propósito: Resumen por acción específica                                                │
│    Uso: Reporte de totales por acción                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Columnas:                                                                                  │
│   accion_codigo | accion_nombre | unidad_medida | anio                                    │
│   total_programado | total_ejecutado | eficacia_total                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. v_trazabilidad_aprobacion                                                               │
│    Propósito: Control de aprobaciones con trazabilidad                                     │
│    Uso: Verificar tipo de aprobación y variaciones                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Columnas:                                                                                  │
│   poa_codigo | tipo_aprobacion | monto_solicitado | monto_asignado                        │
│   porcentaje_variacion | estado_ajuste | requiere_ajuste_metas                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. v_resumen_poa_meta_fisica                                                               │
│    Propósito: Resumen consolidado por POA                                                  │
│    Uso: Dashboard general de avance                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Columnas:                                                                                  │
│   poa_codigo | poa_nombre | anio | total_acciones                                         │
│   total_programado | total_ejecutado | eficacia_total                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 5. v_programacion_mensual_partida                                                          │
│    Propósito: Programación presupuestaria mensual                                          │
│    Uso: Control de partidas por mes                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Columnas:                                                                                  │
│   partida_codigo | partida_nombre | monto_solicitado | monto_asignado                     │
│   monto_ejecutado | eficacia | mes_nombre | anio                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### ANEXO E: INVENTARIO DE COMPONENTES

| Componente | Tipo | Cantidad | Estado |
|------------|------|----------|--------|
| Tablas | Table | 22 | ✅ Completadas |
| Vistas | View | 5 | ✅ Completadas |
| Triggers | Trigger | 15+ | ✅ Activos |
| Constraints | Constraint | 20+ | ✅ Implementados |
| Índices | Index | 25+ | ✅ Creados |
| Scripts SQL | Script | 5 | ✅ Ejecutados |
| Documentación ISO | Documento | 1 | ✅ Completada |
