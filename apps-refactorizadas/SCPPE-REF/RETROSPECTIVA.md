# Retrospectiva del Proyecto

Este documento registra el progreso, decisiones y lecciones aprendidas del proyecto de Planificación Eléctrica. Se actualiza continuamente para mantener trazabilidad y evitar retrabajo.

---

## Estado Actual
**Fecha de última actualización**: 2026-07-31  
**Fase**: PRTSEN — Codificación RDS-PS (IEC 81346-10) de las 765 subestaciones y los 1,781 circuitos CT aplicada en Supabase. BD local `planificacion_electrica` sincronizada como espejo de Supabase (8 esquemas, 71 tablas, 361 objetos, RLS idénticos). App POA (`apps/web-nextjs`) operativa: build y lint limpios.

---

**Proyecto en PAUSA (2026-07-31).** Estado final guardado. Ver sesiones al final del documento.

---

## Aciertos
- Configuración inicial del entorno de trabajo
- Definición clara del alcance: POA y PRTSEN
- Establecimiento de base de datos PostgreSQL 17
- Creación exitosa de estructura jerárquica POA con prácticas ISO 8000/27001
- Uso de UUIDs para identificadores únicos
- Implementación de triggers automáticos para updated_at y versionado

---

## Desaciertos y Errores
_(Registrar aquí los errores cometidos y su contexto)_

### Error #1
- **Fecha**: 
- **Descripción**: 
- **Causa raíz**: 
- **Impacto**: 
- **Resolución**: 

---

## Resolución de Problemas
_(Documentar cómo se resolvieron los problemas identificados)_

### Problema #1
- **Fecha**: 
- **Problema**: 
- **Solución aplicada**: 
- **Lección aprendida**: 

---

## Lo que Funcionó
_(Registrar enfoques, herramientas o decisiones que dieron buenos resultados)_

- 

---

## Lo que No Funcionó
_(Registrar enfoques que fallaron o no dieron resultados esperados)_

- 

---

## Avances Completados
- [x] Configuración inicial de archivos del proyecto
- [x] Establecimiento de conexión a PostgreSQL
- [x] Creación de base de datos planificacion_electrica
- [x] Creación de estructura jerárquica POA:
  - empresa → ente → gerencia → unidad → poa → accion_especifica → partida_presupuestaria
- [x] Implementación de campos de auditoría ISO 8000/27001 en todas las tablas
- [x] Creación de tabla de auditoría para trazabilidad de cambios
- [x] Implementación de triggers para actualización automática de timestamps
- [x] Agregado campo `tipo` a tabla empresa (PÚBLICA/PRIVADA)
- [x] Agregado campo `ambito` a tabla empresa (NACIONALES/INTERNACIONALES/MIXTAS)
- [x] Agregado campo `tipo` a tabla ente (OPERADOR/FUNDACIÓN/ENTE AUTÓNOMO/ENTE ADSCRITO/OTROS)
- [x] Agregado campo `ambito` a tabla gerencia (GENERAL/NACIONAL/REGIONAL/ESTADAL)
- [x] Agregado campo `proceso_medular` a tabla gerencia (GENERACIÓN/TRANSMISIÓN/DISTRIBUCIÓN/COMERCIALIZACIÓN/NO APLICA)
- [x] Agregado campo `ceco` a tabla gerencia (Centro de Costos, nullable)
- [x] Agregado campo `codigo_sap` a tabla gerencia (nullable)
- [x] Creado esquema de geolocalización: region_geografica → estado → municipio
- [x] Precargadas 10 regiones geográficas de Venezuela
- [x] Precargados 25 estados de Venezuela con códigos INE (incluyendo Guayana Esequiba)
- [x] Relacionada tabla gerencia con municipio (FK municipio_id)
- [x] Agregados campos de ubicación física a gerencia: region_id, estado_id, direccion_fisica, centro_servicios
- [x] Creado sistema de responsables con histórico temporal:
  - Tabla responsable (datos maestros)
  - Tabla gerencia_responsable (relación temporal con gerencias)
  - Tabla unidad_responsable (relación temporal con unidades)
- [x] Análisis de instructivo POA 2022 (hoja Instructivo)
- [x] Creados catálogos de políticas nacionales (Plan Patria y Plan Carabobo 200)
- [x] Creadas tablas de referencia temporal (trimestre y mes)
- [x] Agregados campos del instructivo a tabla poa (politica_sen, programa_sen, codigo_sipes, etc.)
- [x] FASE 3: Implementación de sistema de metas físicas:
  - Agregado campo `unidad_medida` y `orden` a tabla accion_especifica
  - Creada tabla `meta_fisica` con metas mensuales por acción
  - Creada tabla `poa_aprobacion` con trazabilidad de presupuesto
  - Creada tabla `partida_mensual` para programación presupuestaria
  - Creadas 5 vistas para consulta y reportes
  - Documentación ISO 8000/27001 completada con 5 anexos (diagramas)
- [x] FASE 8: Agregados campos de ponderación y fechas a accion_especifica:
  - Campo `ponderacion` (DECIMAL 5,2) con CHECK (0-100)
  - Campo `fecha_inicio_accion` (DATE)
  - Campo `fecha_fin_accion` (DATE) con CHECK de coherencia
  - Índices para búsqueda por ponderación y fechas
- [x] Análisis de Excel formulario_ficha_poa_proyecto.xlsx (82% cumplimiento)
- [x] Análisis de archivo: for_opp_087_base_de_calculo_2027_proyecto.xlsx
- [x] Análisis de archivo: formulario_ficha_sipes_proyecto.xlsx
- [x] FASE 9: Agregados campos adicionales a tabla POA para SIPES:
  - Campo `es_plurianual` (BOOLEAN, default FALSE)
  - Campo `situacion_presupuestaria` (VARCHAR(50), default 'POR INICIAR')
  - Campo `responsable_tecnico_nombre` (VARCHAR(255))
  - Campo `responsable_tecnico_email` (VARCHAR(100))
  - Campo `responsable_admin_nombre` (VARCHAR(255))
  - Campo `responsable_admin_email` (VARCHAR(100))
  - Campo `localizacion` (TEXT)
  - Índices para búsqueda por plurianual, situación presupuestaria y responsables
- [x] FASE 10: Agregado campo ejecutor a tabla accion_especifica:
  - Campo `ejecutor` (VARCHAR(255)) - unidad ejecutora de la acción
  - Índice para búsqueda por ejecutor
- [x] FASE 11: Agregados campos a tabla partida_presupuestaria:
  - Campo `cantidad` (DECIMAL(15,2))
  - Campo `unidad_medida` (VARCHAR(100))
  - Campo `costo_unitario` (DECIMAL(15,2))
  - Campo `justificacion` (TEXT)
  - Índices para búsqueda por unidad y justificación
- [x] FASE 12: Creada tabla recurso_humano (detalle Partida 402):
  - Campo `rol_funcional` (VARCHAR(255))
  - Campo `dedicacion_meses` (INTEGER, CHECK 1-12)
  - Campo `costo_mensual` (DECIMAL(15,2))
  - Campo `costo_anual` (GENERATED ALWAYS AS costo_mensual × dedicacion_meses)
  - FK a partida_presupuestaria con CASCADE
  - Trigger para actualización automática de timestamps
- [x] FASE 13: Creadas 4 vistas SIPES para consulta y reportes:
  - `v_ficha_sipes`: Resumen del proyecto con datos generales y montos
  - `v_detalle_acciones_sipes`: Detalle de acciones con metas físicas
  - `v_detalle_partidas_sipes`: Detalle de partidas con recursos humanos
  - `v_resumen_recurso_humano`: Resumen de recursos humanos (Partida 402)
- [x] FASE 14: Creada tabla viatico (detalle Partida 405):
  - Campo `concepto` (VARCHAR(255)) - Descripción del viaje
  - Campo `numero_personas` (INTEGER) - Número de personas
  - Campo `dias` (INTEGER) - Días de viaje
  - Campo `costo_unitario` (DECIMAL(15,2)) - Costo por persona/día
  - Campo `costo_total` (GENERATED ALWAYS AS personas × días × costo_unitario)
  - FK a partida_presupuestaria con CASCADE
  - Trigger para actualización automática de timestamps
  - Creadas 2 vistas: v_resumen_viatico y v_detalle_viaticos_accion
- [x] FASE 15: Creada tabla asignacion_viatico (control individual por persona):
  - Campo `viatico_id` (UUID FK) - Referencia a viático
  - Campo `responsable_id` (UUID FK) - Persona que viaja
  - Campo `monto_asignado` (DECIMAL(15,2)) - Monto asignado
  - Campo `monto_ejecutado` (DECIMAL(15,2)) - Monto ejecutado
  - Campo `saldo_pendiente` (GENERATED ALWAYS AS asignado - ejecutado)
  - Campo `destino` (VARCHAR(255)) - Destino del viaje
  - Campo `fecha_salida` y `fecha_retorno` (DATE)
  - Campo `dias_viaje` (GENERATED ALWAYS AS retorno - salida + 1)
  - Campo `estado` (PENDIENTE/APROBADO/EN_VIAJE/COMPLETADO/RECHAZADO/ANULADO)
  - FK a viatico y responsable con índices
- [x] FASE 16: Creada tabla comprobante_viatico (documentos de soporte):
  - Campo `asignacion_viatico_id` (UUID FK)
  - Campo `tipo_comprobante` (PASAJE/ALOJAMIENTO/ALIMENTACION/TRANSPORTE_LOCAL/OTROS)
  - Campo `numero_comprobante`, `fecha_comprobante`, `descripcion`, `monto_comprobante`
  - Campo `proveedor` y `rif_proveedor`
  - Campo `archivo_ruta`, `archivo_nombre`, `archivo_tipo`, `archivo_tamano`
  - Campo `estado` (PENDIENTE/VALIDADO/RECHAZADO)
- [x] FASE 17: Creada tabla aprobacion_viatico (flujo simple de aprobación):
  - Campo `asignacion_viatico_id` (UUID FK)
  - Campo `solicitado_por`, `fecha_solicitud`, `justificacion`
  - Campo `aprobado_por`, `fecha_aprobacion`, `estado`
  - Campo `monto_solicitado` y `monto_aprobado`
  - Campo `observaciones_aprobacion` y `motivo_rechazo`
- [x] FASE 18: Creadas 5 vistas de control de viáticos:
  - `v_resumen_asignacion_viaticos`: Resumen de asignaciones por persona
  - `v_detalle_comprobantes_viaticos`: Detalle de comprobantes
  - `v_control_aprobaciones_viaticos`: Control de aprobaciones
  - `v_dashboard_viaticos`: Dashboard de control general
  - `v_resumen_comprobantes_tipo`: Resumen por tipo de comprobante
- [x] FASE 19: Insertados datos de ejemplo para pruebas:
  - 1 viático, 1 asignación, 3 comprobantes, 1 aprobación
- [x] FASE 20: Creada tabla cierre_viatico (control de escenarios):
  - Campo `asignacion_viatico_id` (UUID FK)
  - Campo `tipo_cierre` (RENDICION_NORMAL/REINTEGRO/REEMBOLSO/EXCEPCIONAL)
  - Campo `monto_asignado`, `monto_gastado`, `monto_reintegro`, `monto_reembolso`
  - Campo `aprobado_por_gerente` y `aprobado_por_director` (para excepcional)
  - Campo `origen_fondos` (para reembolso y excepcional)
  - Campo `es_excepcional`, `requiere_revision_periodica`, `proxima_revision`
  - Índices para búsqueda por tipo, fecha, excepcional y revisión
- [x] FASE 21: Actualizados estados en asignacion_viatico:
  - Agregados estados: REINTEGRADO, REEMBOLSADO, EXCEPCIONAL
  - Total de 9 estados para control completo
- [x] FASE 22: Creadas 5 vistas de control de cierres:
  - `v_resumen_cierres_viaticos`: Resumen de cierres por escenario
  - `v_cierres_excepcionales`: Control de cierres excepcionales
  - `v_dashboard_cierres_viaticos`: Dashboard de control general
  - `v_control_aprobaciones_escenarios`: Control de aprobaciones por escenario
  - `v_resumen_origen_fondos`: Resumen por origen de fondos
- [x] FASE 23: Insertados datos de ejemplo para escenarios:
  - Escenario 1: Reintegro (Bs. 50,000 sobrante)
  - Escenario 2: Reembolso (Bs. 80,000 sobregasto)
  - Escenario 3: Rendición normal (completo)
  - Escenario 4: Asignación excepcional (sin rendición)
- [x] FASE 24: Creado catálogo de orígenes de fondos:
  - Tabla `catalogo_origen_fondos` con 6 registros iniciales
  - Corrección Hallazgo #5 de Auditoría (trazabilidad de fondos)
- [x] FASE 25: Creado trigger de validación presupuestaria:
  - Trigger `trg_validar_presupuesto_viatico` en tabla `asignacion_viatico`
  - Valida que monto_asignado no exceda saldo disponible
  - Corrección Hallazgo #1 de Auditoría (exceso presupuestario)
- [x] FASE 26: Creado trigger de validación de comprobantes:
  - Trigger `trg_validar_comprobantes_cierre` en tabla `cierre_viatico`
  - Valida conciliación entre monto_gastado y comprobantes validados
  - Corrección Hallazgo #3 de Auditoría (falta de validación)
- [x] FASE 27: Creadas vistas de conciliación presupuestaria:
  - `v_conciliacion_presupuestaria`: Conciliación completa por viático
  - `v_resumen_conciliacion`: Resumen general de conciliación
  - Corrección Hallazgo #2 de Auditoría (falta de conciliación)
- [x] FASE 28: Creado procedimiento de cierre con validación:
  - Procedimiento `sp_cerrar_asignacion_viatico`
  - Validación completa de comprobantes, montos y estados
  - Corrección Hallazgo #3 de Auditoría (validación de cierre)
- [x] INFORME DE AUDITORÍA completado:
  - 5 hallazgos identificados (3 críticos, 2 medios)
  - Plan corporativo de corrección documentado
  - Todas las correcciones implementadas
- [x] Análisis de archivo: formulario_ficha_poa_proyecto.xlsx (82%)
- [x] FASE 29: Sistema de control de items por partida presupuestaria
- [x] FASE 30: Auditoría y correcciones del flujo de presupuesto
- [x] FASE 31: Vinculación de metas físicas con ejecución presupuestaria
- [x] Modelado de estructura PRTSEN (realizado en esquema `samc/`, scripts 08–15b)
- [x] Creación de interfaz de usuario básica
  - App Flutter/Next.js POA (planificacion-app/)
  - API FastAPI + Jinja2 SAMC (samc/samc_api/)

---

## Avances SAMC / PRTSEN (Esquema `samc/`)

Estos avances residen en `Planificacion/samc/` y usan el esquema PostgreSQL `samc` con prefijo `samc_` en las tablas. La API activa es FastAPI en `samc/samc_api/`.

- [x] FASE SAMC 01: Schema `samc`, funciones de utilidad, tablas geográficas `carac_*` (estado, municipio, parroquia)
- [x] FASE SAMC 02: Tablas de negocio POA + migración de datos legacy (`samc_empresa`, `samc_ente`, `samc_proceso`, `samc_gerencia`, `samc_poa`, `samc_poa_accion_especifica`, `samc_meta_fisica`, `samc_meta_financiera`, `samc_base_calculo`)
- [x] FASE SAMC 03: Multimoneda (USD/EUR), 3 escenarios (SOLICITADO/AJUSTADO MPPP/ASIGNADO) en `samc_meta_financiera_moneda`
- [x] FASE SAMC 04: Normalización de empresa
- [x] FASE SAMC 04b: POA → Gerencia (relación directa)
- [x] FASE SAMC 05: Empresa socio (países socios internacionales)
- [x] FASE SAMC 06: Columnas GENERATED + vistas de reconciliación
- [x] FASE SAMC 07: Check constraints de auditoría
- [x] FASE SAMC 08: PRTSEN — Catálogos de infraestructura + proyecto especial:
  - `samc_subestacion`, `samc_planta_generacion`, `samc_circuito`
  - `samc_proyecto_especial` ambientes ESTADAL/SUBESTACION/PLANTA/CIRCUITO/MIXTO
  - `samc_proyecto_especial_subestacion/planta/circuito/estado` (relaciones M:N)
  - `samc_proyecto_especial_poa_accion` (vinculación a POA)
  - `samc_proyecto_especial_financiero` + `_moneda` (seguimiento mensual 3 escenarios)
  - Vista `v_conciliacion_proyecto_poa`
- [x] FASE SAMC 09: ISO 27001 — bcrypt users, RBAC roles, audit triggers
- [x] FASE SAMC 10: Plurianualidad — columna `anio` en tablas financieras
- [x] FASE SAMC 11: Trigger chain sincroniza `base_calculo → meta_financiera → accion`
- [x] FASE SAMC 12: Catálogos Plan Patria y Plan Carabobo 200
- [x] FASE SAMC 12b: Junction tables (Plan Patria M:N, Plan Carabobo 1:1)
- [x] FASE SAMC 13: Documento PRTSEN — 22 columnas (identificación, análisis, formulación, RACI) + plantilla CORPOELEC DISTRIBUCIÓN/PLANIFICACIÓN (estatus=PLANTILLA)
- [x] FASE SAMC 14: Metas físicas plurianuales PRTSEN + vinculación POA flexible:
  - `samc_proyecto_meta_fisica` (mes × año, eficacia GENERATED)
  - `samc_proyecto_vinculacion_poa` (vínculo temporal con `anio`, `activo`, `monto_aporte`)
  - Función `proyectos_huerfanos(anio)` y alerta al crear POA
- [x] FASE SAMC 15: Año en `samc_meta_fisica` del POA para coherencia plurianual con PRTSEN
- [x] FASE SAMC 15b: Vistas consolidadas (5):
  - `v_avance_proyecto`, `v_avance_proyecto_resumen` (con detalle_anual JSON)
  - `v_consolidado_poa_accion`, `v_consolidado_poa`
  - `v_proyectos_sin_poa`

---

## Datos PRTSEN recuperados (`_prtsen/_PTRSEN/`)
Fuente de verdad externa para poblar catálogos y proyectos PRTSEN:
- [x] 001 CARACTERIZACIÓN → `CARACTERIZACIÓN DISTRIBUCION.xls` (catálogo de subestaciones distribución)
- [x] 002 FICHAS Y DIAGNOSTICO → ficha SE/circuitos
- [x] 003 EQUIPOS INDISPONIBLES → consolidado S/E
- [x] 004 RESTRICCIONES OPERATIVAS → materiales CTOS
- [x] 005 PROYECTOS consolidado + 21 fichas estadales (incluye Dtto. Capital)
- [ ] 006 LEVANTAMIENTO TRANSFORMADORES DE POTENCIA
- [ ] 007 LEVANTAMIENTO INTERRUPTORES Y RECONECTADORES
- [ ] Pendiente: ETL Excel → catálogos `samc_subestacion`, `samc_circuito`, `samc_planta_generacion`
- [ ] Pendiente: Cargar 21 proyectos estatales en `samc_proyecto_especial` + `samc_proyecto_vinculacion_poa`
- [ ] Pendiente: Mapear Ficha PRTSEN vs `samc_proyecto_especial` (porcentaje de cumplimiento)

---

## API FastAPI + Jinja2 (`samc/samc_api/`)
- [x] Estructura completa: config, core (JWT/bcrypt), db (pool), middleware (security+rate limit), api, schemas, repositories, services, routers, templates, static, tests
- [x] Routers: auth, poa, proyectos (PRTSEN), conciliación, datasamc, basecalculo, politicas
- [x] Autenticación JWT + cookie HttpOnly + rate limiting + audit log por request
- [x] Endpoints PRTSEN: CRUD proyecto + documento + metas físicas + avance + huerfanos + vincular-poa (plurianual) + vinculaciones

---

## Pendientes (Actualizado 2026-07-28)
- [ ] Cargar catálogos PRTSEN desde `_prtsen/_PTRSEN/` (001, 002, 006, 007) a la BD
- [ ] Cargar 21 proyectos estatales desde `005/FICHAS PROYECTOS/` a `samc_proyecto_especial`
- [ ] Mapear Ficha PRTSEN vs modelo `samc_proyecto_especial` (cobertura %)
- [ ] Formalizar reglas de negocio PRTSEN (¿cuándo va como acción POA vs proyecto especial vinculado? ¿aporte reemplaza o complementa el `programado` del POA?)
- [ ] Implementar sistema de control de acceso por nivel jerárquico
- [ ] Migrar BD a Supabase (pendiente: `URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`)
- [ ] Desplegar app en Vercel (config `vercel.json` existe en `planificacion-app/`)

---

## Decisiones de Arquitectura
_(Registrar decisiones importantes y su justificación)_

### Decisión #1: PostgreSQL 17
- **Fecha**: 2026-03-08
- **Contexto**: Selección de base de datos
- **Decisión**: Usar PostgreSQL 17
- **Justificación**: Robustez, soporte JSON, adecuado para datos estructurados de planificación
- **Alternativas consideradas**: 

### Decisión #2: Estructura Jerárquica POA
- **Fecha**: 2026-03-08
- **Contexto**: Modelado de datos para Planes Operativos Anuales
- **Decisión**: Jerarquía empresa → ente → gerencia → unidad → poa → accion_especifica → partida_presupuestaria
- **Justificación**: Refleja la estructura organizativa real de la empresa eléctrica
- **Alternativas consideradas**: 

### Decisión #3: Prácticas ISO 8000/27001
- **Fecha**: 2026-03-08
- **Contexto**: Calidad de datos y seguridad
- **Decisión**: Implementar en todas las tablas:
  - Campos de auditoría (created_at, updated_at, created_by, updated_by)
  - Campo version para control de concurrencia
  - Campo activo para soft-delete
  - Tabla de auditoría separada para trazabilidad completa
- **Justificación**: Cumplimiento de estándares internacionales de calidad y seguridad
- **Alternativas consideradas**: 

### Decisión #4: UUIDs como identificadores
- **Fecha**: 2026-03-08
- **Contexto**: Identificación única de registros
- **Decisión**: Usar UUIDs en lugar de integers secuenciales
- **Justificación**: Mejor para distribución, seguridad y evitar enumeración
- **Alternativas consideradas**: integers secuenciales

### Decisión #5: Tipo de Empresa
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla empresa
- **Decisión**: Agregar campo `tipo` con valores 'PÚBLICA' y 'PRIVADA', default 'PÚBLICA'
- **Justificación**: Clasificación regulatoria de empresas del sector eléctrico
- **Alternativas consideradas**: 

### Decisión #6: Ámbito de Empresa
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla empresa
- **Decisión**: Agregar campo `ambito` con valores 'NACIONALES', 'INTERNACIONALES' y 'MIXTAS', default 'NACIONALES'
- **Justificación**: Clasificación según conformación y cobertura geográfica de las empresas
- **Alternativas consideradas**: 

### Decisión #7: Tipo de Ente
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla ente
- **Decisión**: Agregar campo `tipo` con valores 'OPERADOR', 'FUNDACIÓN', 'ENTE AUTÓNOMO', 'ENTE ADSCRITO', 'OTROS', default 'OTROS'
- **Justificación**: Clasificación de entes según su naturaleza jurídica y operativa
- **Alternativas consideradas**: 

### Decisión #8: Ámbito de Gerencia
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla gerencia
- **Decisión**: Agregar campo `ambito` con valores 'GENERAL', 'NACIONAL', 'REGIONAL', 'ESTADAL', default 'GENERAL'
- **Justificación**: Clasificación del alcance geográfico y administrativo de las gerencias
- **Alternativas consideradas**: 

### Decisión #9: Proceso Medular de Gerencia
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla gerencia
- **Decisión**: Agregar campo `proceso_medular` con valores 'GENERACIÓN', 'TRANSMISIÓN', 'DISTRIBUCIÓN', 'COMERCIALIZACIÓN', 'NO APLICA', default 'NO APLICA'
- **Justificación**: Identificación del proceso medular del sector eléctrico al que pertenece la gerencia
- **Alternativas consideradas**: 

### Decisión #10: Centro de Costos (CECO) de Gerencia
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla gerencia
- **Decisión**: Agregar campo `ceco` VARCHAR(50), nullable, ingreso manual
- **Justificación**: Identificación del centro de costos asociado a la gerencia
- **Alternativas consideradas**: 

### Decisión #11: Código SAP de Gerencia
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Tabla gerencia
- **Decisión**: Agregar campo `codigo_sap` VARCHAR(50), nullable
- **Justificación**: Integración con sistema SAP corporativo para trazabilidad de códigos
- **Alternativas consideradas**: 

### Decisión #12: Esquema de Geolocalización
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Ubicación geográfica de gerencias
- **Decisión**: Crear estructura jerárquica: region_geografica → estado → municipio
  - region_geografica: 10 regiones de Venezuela precargadas
  - estado: 25 estados (23 + Distrito Capital + Guayana Esequiba) precargados con código INE
  - municipio: tabla creada pero vacía, se agregará paulatinamente
  - gerencia tiene FK municipio_id (nullable, ON DELETE SET NULL)
- **Justificación**: Estructura político-territorial de Venezuela para geolocalización de gerencias
- **Alternativas consideradas**: 

### Decisión #13: Estado Guayana Esequiba
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Geolocalización
- **Decisión**: Agregar estado "Guayana Esequiba" (código INE: 25) a la región Guayana
- **Justificación**: Requerimiento de entes públicos venezolanos para proyectos en territorio en reclamación. Anteriormente denominado "Zona en Reclamación", ahora debe tratarse como estado adicional en sistemas.
- **Alternativas consideradas**: Mantener como "Zona en Reclamación" sin tratarlo como estado

### Decisión #14: Campos de Ubicación Física en Gerencia
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Geolocalización de gerencias
- **Decisión**: Agregar campos a tabla gerencia:
  - region_id (FK a region_geografica, nullable)
  - estado_id (FK a estado, nullable)
  - municipio_id (FK a municipio, nullable) - ya existía
  - direccion_fisica (TEXT, nullable) - ingreso manual
  - centro_servicios (VARCHAR(255), default 'NO APLICA') - para gerencias en edificios administrativos
- **Justificación**: Ubicación física completa de gerencias con jerarquía geográfica y detalles específicos
- **Alternativas consideradas**: 

### Decisión #15: Sistema de Responsables con Histórico Temporal
- **Fecha**: 2026-03-08
- **Contexto**: Reglas de negocio - Trazabilidad de responsables en sector público
- **Decisión**: Implementar estructura de tres tablas:
  - `responsable`: datos maestros de personas (cedula, numero_personal, nombres, apellidos)
  - `gerencia_responsable`: relación temporal con gerencias (fecha_inicio, fecha_fin, cargo, gaceta)
  - `unidad_responsable`: relación temporal con unidades (fecha_inicio, fecha_fin, cargo, gaceta)
  - Validación: fecha_fin >= fecha_inicio o NULL (actual)
  - Índices especializados para consultas por período
- **Justificación**: 
  - Los POA están vinculados a gerencias/unidades (unidades ejecutoras estables)
  - Los responsables cambian frecuentemente en sector público (volatilidad política)
  - Necesario rastrear quién era responsable en cada período
  - Permite análisis de gestión y auditoría histórica
- **Alternativas consideradas**: 
  - FK simple a responsable en gerencia/unidad (pierde histórico)
  - Solo auditoría de cambios (difícil consultar períodos específicos)

### Decisión #16: Catálogos de Políticas Nacionales
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de instructivo POA 2022 - Alineación con planes nacionales
- **Decisión**: Crear tablas de políticas basadas en SAMC:
  - `politica_plan_patria`: catálogo de objetivos del Plan de la Patria 2019-2025
  - `politica_plan_carabobo`: catálogo de líneas estratégicas del Plan Carabobo 200
  - `entidad_politica`: tabla polimórfica para vincular POA/acciones a políticas
  - Datos iniciales: 3 políticas Plan Patria + 1 Plan Carabobo
- **Justificación**: Requerimiento del instructivo para vincular POA a objetivos nacionales
- **Alternativas consideradas**: Campos de texto libre en tabla poa (menos control)

### Decisión #17: Tablas de Referencia Temporal
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de instructivo POA 2022 - Programación mensual
- **Decisión**: Crear tablas de referencia temporal:
  - `trimestre`: 4 trimestres del año fiscal
  - `mes`: 12 meses vinculados a sus trimestres
  - Datos iniciales precargados
- **Justificación**: Base para metas físicas y financieras mensuales del instructivo
- **Alternativas consideradas**: Campos de texto (menos structured)

### Decisión #18: Campos del Instructivo en Tabla POA
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de instructivo POA 2022 - Campos requeridos
- **Decisión**: Agregar campos faltantes a tabla poa:
  - politica_sen (Política del Plan Desarrollo SEN)
  - programa_sen (Programa del Plan Desarrollo SEN)
  - codigo_sipes (Código SIPES-APN del proyecto)
  - organismo_responsable (Nombre de la institución ejecutora)
  - unidad_ejecutora_local (Nombre de la unidad administrativa)
  - objetivo_especifico_unidad (Objetivo de la unidad ejecutora)
  - responsable_ejecucion_nombre (Nombre del responsable)
  - cargo_responsable (Cargo del responsable)
- **Justificación**: Cumplimiento de los 14 campos requeridos por el instructivo
- **Alternativas consideradas**: 

### Decisión #19: Campos SIPES en Tabla POA
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de formulario_ficha_sipes_proyecto.xlsx - Campos requeridos
- **Decisión**: Agregar campos faltantes a tabla poa:
  - es_plurianual (BOOLEAN, default FALSE)
  - situacion_presupuestaria (VARCHAR(50), default 'POR INICIAR')
  - responsable_tecnico_nombre (VARCHAR(255))
  - responsable_tecnico_email (VARCHAR(100))
  - responsable_admin_nombre (VARCHAR(255))
  - responsable_admin_email (VARCHAR(100))
  - localizacion (TEXT)
- **Justificación**: Cumplimiento del 67% de campos del formulario SIPES (12/18 campos)
- **Alternativas consideradas**: 

### Decisión #20: Campo Ejecutor en Acción Específica
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de formulario_ficha_sipes_proyecto.xlsx - Campo requerido
- **Decisión**: Agregar campo ejecutor (VARCHAR(255)) a tabla accion_especifica
- **Justificación**: Identificación de la unidad ejecutora de cada acción específica
- **Alternativas consideradas**: 

### Decisión #21: Campos de Detalle en Partida Presupuestaria
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de for_opp_087_base_de_calculo_2027_proyecto.xlsx
- **Decisión**: Agregar campos a tabla partida_presupuestaria:
  - cantidad (DECIMAL(15,2))
  - unidad_medida (VARCHAR(100))
  - costo_unitario (DECIMAL(15,2))
  - justificacion (TEXT)
- **Justificación**: Captura de información detallada de cada partida presupuestaria
- **Alternativas consideradas**: 

### Decisión #22: Tabla Recurso Humano (Partida 402)
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de for_opp_087_base_de_calculo_2027_proyecto.xlsx - Hoja 402
- **Decisión**: Crear tabla recurso_humano con campos:
  - rol_funcional (VARCHAR(255))
  - dedicacion_meses (INTEGER, CHECK 1-12)
  - costo_mensual (DECIMAL(15,2))
  - costo_anual (GENERATED ALWAYS AS costo_mensual × dedicacion_meses)
  - FK a partida_presupuestaria con CASCADE
- **Justificación**: Detalle de recursos humanos para partidas tipo 402 (Servicios Personales)
- **Alternativas consideradas**: 

### Decisión #23: Vistas SIPES para Consulta
- **Fecha**: 2026-03-08
- **Contexto**: Necesidad de vistas consolidadas para reportes SIPES
- **Decisión**: Crear 4 vistas:
  - v_ficha_sipes: Resumen del proyecto con datos generales
  - v_detalle_acciones_sipes: Detalle de acciones con metas físicas
  - v_detalle_partidas_sipes: Detalle de partidas con recursos humanos
  - v_resumen_recurso_humano: Resumen de recursos humanos (Partida 402)
- **Justificación**: Facilitar consultas y reportes del sistema SIPES
- **Alternativas consideradas**: 

### Decisión #24: Tabla Viáticos (Partida 405)
- **Fecha**: 2026-03-08
- **Contexto**: Análisis de for_opp_087_base_de_calculo_2027_proyecto.xlsx - Hoja 405
- **Decisión**: Crear tabla viatico con campos:
  - concepto (VARCHAR(255))
  - numero_personas (INTEGER)
  - dias (INTEGER)
  - costo_unitario (DECIMAL(15,2))
  - costo_total (GENERATED ALWAYS AS personas × días × costo_unitario)
  - FK a partida_presupuestaria con CASCADE
- **Justificación**: Detalle de viáticos para partidas tipo 405 (Transferencias y Viáticos)
- **Alternativas consideradas**: 

---

## Notas para Próximos Modelos
_(Información crítica que otros modelos o sesiones deben conocer para continuar el trabajo)_

- Los archivos Excel son la fuente de verdad para la estructura de datos
- La base de datos está configurada y accesible en 127.0.0.1:5432
- Toda la documentación debe mantenerse en español
- Consultar este archivo antes de tomar decisiones de arquitectura o reimplementar funcionalidades
- La estructura jerárquica POA ya está implementada con 35 tablas + 31 vistas (esquema `public`)
- El esquema `samc` contiene ~25 tablas + 9 vistas adicionales (POA normalizado + PRTSEN)
- Todas las tablas tienen campos de auditoría ISO 8000/27001 (created_at, updated_at, created_by, updated_by, version, activo)
- Los triggers actualizan automáticamente updated_at y version en cada UPDATE
- Tabla recurso_humano tiene campo costo_anual calculado automáticamente (GENERATED ALWAYS AS)
- Tabla viatico tiene campo costo_total calculado automáticamente (GENERATED ALWAYS AS)
- Tabla asignacion_viatico tiene campos saldo_pendiente y dias_viaje calculados automáticamente
- Sistema de viáticos híbrido: 3 niveles (presupuesto → asignación → comprobantes)
- Tabla cierre_viatico controla 4 escenarios: normal, reintegro, reembolso, excepcional
- Escenario excepcional requiere aprobación de Gerente + Director
- Cada cierre registra: quién autorizó, por qué, origen de fondos
- Trigger de validación presupuestaria evita excesos de asignación
- Trigger de validación de comprobantes asegura integridad de cierres
- Vista de conciliación presupuestaria para auditoría
- Procedimiento de cierre con validación completa
- La estructura PRTSEN ya está modelada en el esquema `samc` (scripts 08 a 15b) — faltan los datos de los Excel de `_prtsen/_PTRSEN/`
- [x] FASE 29: Sistema de control de items por partida presupuestaria:
  - Analizado formato oficial F-PMFFAC-002 (base de cálculo 2021 y 2027)
  - Creada tabla `partida_elemento` (catálogo de sub-items por partida)
  - Creada tabla `item_presupuestario` (items con todos los campos del formato oficial)
  - Creada tabla `ejecucion_item` (histórico vinculado a comprobantes originales)
  - Implementado sistema híbrido de codificación (2021: 402.03.02.00 + 2027: EQ-01)
  - Incluido código SNC (Servicio Nacional de Contrataciones)
  - Soporte para tipos: MATERIAL, SERVICIO, ACTIVO, VIATICO, RECURSO_HUMANO
  - Creados 4 triggers de sincronización automática:
    - Sincronización item → partida_presupuestaria
    - Sincronización ejecución → item estado
    - Sincronización ejecución → partida_mensual
  - Creadas 6 vistas de control:
    - v_resumen_partida: Resumen por partida
    - v_detalle_items: Detalle con ejecución
    - v_dashboard_items: Dashboard general
    - v_items_pendientes: Pendientes con prioridad
    - v_historial_ejecucion: Histórico completo
    - v_conciliacion_items: Presupuestado vs ejecutado
  - Insertados datos de ejemplo (4 partidas, 8 elementos, 34 items, 6 ejecuciones)
  - Scripts: 29_01_item_presupuestario.sql, 29_02_ejemplos_item_presupuestario.sql
- [x] FASE 30: Auditoría y correcciones del flujo de presupuesto:
  - Auditado flujo completo: POA → Acción → Partida → Item → Ejecución
  - Identificados 3 hallazgos críticos y 2 medios
  - Corregidos montos de viáticos (sincronizados con tabla viatico)
  - Recalculado IVA 16% (excluido de items, calculado por separado)
  - Corregidas vistas v_resumen_partida y v_conciliacion_items
  - Insertada programación mensual (48 registros en partida_mensual)
  - Generado informe de auditoría completo
  - Scripts: 30_01_corregir_auditoria_v2.sql, docs/INFORME_AUDITORIA_FLUJO_PRESUPUESTO.md
- [x] FASE 31: Vinculación de metas físicas con ejecución presupuestaria:
  - Creada tabla `meta_fisica_presupuesto` (vinculación meta ↔ partida)
  - Implementado cálculo automático de eficacia financiera
  - Creadas 3 vistas de rendición:
    - v_rendicion_metas_fisicas: Detalle mes a mes
    - v_dashboard_rendicion: Dashboard general
    - v_conciliacion_fisico_financiera: Relación costo-beneficio
  - Insertados datos de ejemplo (12 metas, 48 vinculaciones)
  - Scripts: 31_01_meta_fisica_presupuesto.sql, 31_02_ejemplos_meta_fisica.sql

---

## Próximos Pasos (2026-07-28)
- [ ] Cargar catálogos PRTSEN desde `_prtsen/_PTRSEN/`: 001 (subestaciones), 002 (ficha SE), 006 (transformadores), 007 (interruptores/reconectadores)
- [ ] Cargar 21 proyectos estatales desde `_prtsen/_PTRSEN/005 PROYECTOS/FICHAS PROYECTOS/` a `samc_proyecto_especial`
- [ ] Mapear Ficha PRTSEN vs modelo `samc_proyecto_especial` (cobertura % similar al análisis POA)
- [ ] Formalizar reglas de negocio PRTSEN (¿cuándo va como acción POA vs proyecto especial vinculado? ¿aporte reemplaza o complementa el `programado` del POA?)
- [ ] Implementar sistema de control de acceso por nivel jerárquico
- [ ] Migrar BD a Supabase (pendiente: URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Desplegar app en Vercel

---

## Métricas y Progreso
- **Archivos Excel POA analizados**: 3/3 (formulario_ficha_poa_proyecto.xlsx - 82%, formulario_ficha_sipes_proyecto.xlsx - 67%, for_opp_087_formato_base_calculo_2021.xls - 100%)
- **Archivos Excel PRTSEN recuperados**: 7 carpetas en `_prtsen/_PTRSEN/` (pendiente análisis)
- **Entidades de BD (esquema `public`, POA puro)**: 35 tablas + 31 vistas
- **Entidades de BD (esquema `samc`, POA+PRTSEN)**: ~25 tablas + 9 vistas
- **Documentación ISO**: 1 documento (728 líneas con 5 anexos)
- **Scripts SQL POA** (`Planificacion/sql/`): 33 scripts (03_01 a 31_02)
- **Scripts SQL SAMC** (`Planificacion/samc/`): 18 scripts (01 a 15b)
- **Fases POA completadas**: 31
- **Fases SAMC completadas**: 15 (01 a 15b)
- **Componentes de UI POA**: App web Next.js completa (planificacion-app/)
- **Componentes de UI SAMC**: FastAPI + Jinja2 (samc/samc_api/) — backend activo

---

## Estado de Sesión (2026-07-28 - Apertura)

### Resumen de la sesión anterior (2026-07-14)
- **Última fase POA completada**: CRUD completo de POA + App web funcional (Next.js)
- **Aplicación web POA completada** (planificacion-app/):
  - Stack: Next.js 16 + TypeScript + Prisma 7 + TailwindCSS 4 + @prisma/adapter-pg
  - Base de datos: PostgreSQL local (con soporte futuro para Supabase)
  - ORM: Prisma con schema introspectado (33 modelos)
  - Build: Exitoso (33 rutas compiladas)
  - **Páginas**: Dashboard, Empresas, Entes, Gerencias, Unidades, POA, Acciones, Partidas, Metas, Items, Viáticos, Recursos Humanos, Configuración
  - **API Routes**: /api/empresas, /api/entes, /api/gerencias, /api/unidades, /api/poa, /api/acciones, /api/partidas, /api/metas, /api/items, /api/viaticos, /api/recursos-humanos
  - **Formularios**: Empresa, Ente, Gerencia, Unidad, POA, Acción, Partida, Meta, Item, Viático, Recurso Humano
  - **Componentes UI**: Card, Sidebar, 11 formularios
  - Configuración Vercel lista (vercel.json) — cliente Supabase preparado (lib/supabase.ts) — pendiente secrets

### Avances PRTSEN (1985-07-14 hasta 2026-07-27, esquema `samc`)
- Modelado completo de PRTSEN en `samc/samc_proyecto_especial` (scripts 08–15b)
- Catálogos de infraestructura creados (subestaciones, plantas, circuitos) pero **vacíos**
- API FastAPI activa con endpoints PRTSEN completos
- Soporte plurianual vía `samc_proyecto_vinculacion_poa` con `anio`, `activo`, `monto_aporte`
- Función `proyectos_huerfanos(anio)` para detectar proyectos activos sin POA vinculado

### Pendientes priorizados para esta sesión (2026-07-28)
1. **Sincronizar `RETROSPECTIVA.md`** (este paso — DONE)
2. **Cargar catálogos PRTSEN** desde `_prtsen/_PTRSEN/001` y `006`/`007` (subestaciones, transformadores, interruptores)
3. **Mapear Ficha PRTSEN vs `samc_proyecto_especial`** (cobertura %)
4. **Cargar 21 proyectos estatales** a `samc_proyecto_especial` + vínculos POA
5. **Formalizar reglas de negocio PRTSEN** que quedaron pendientes
6. Migrar BD a Supabase y desplegar en Vercel

### Notas importantes
- Los datos PRTSEN están en `_prtsen/_PTRSEN/` (recuperados de equipo que se pensaba borrado)
- `samc/AGENTS.md` describe la arquitectura completa de la API FastAPI y el modelo de datos
- Existen **dos stacks paralelos** (Next.js POA en `planificacion-app/` y FastAPI SAMC en `samc/samc_api/`) — sin decidir si se consolidan
- El esquema `samc` es la fuente activa para PRTSEN; el esquema `public` del POA puro quedó como referencia

---

## Estado de Sesión (2026-07-31 — Clasificación PRTSEN en Supabase)

### Resumen
- Se clasificaron los **823 proyectos PRTSEN** con un matcher local (`/tmp/opencode/replica/matcher.py`), proponiendo dimensión SUBESTACION, CIRCUITO o ESTADAL.
- El delta resultante (319 UPDATEs + región 24 AMAZONAS) se aplicó por bloques a Supabase real y quedó **verificado**.

### Decisiones de negocio tomadas
1. **AMAZONAS = región id 24** en `maestro.regiones` (codigo `AMAZONAS`, nombre `Amazonas`, tipo `ESTADO`).
2. **Preferir CIRCUITO sobre SUBESTACION** ante nombres ambiguos.
3. **Solo asignar dimensión con match confiable**; el resto queda `SIN_MATCH` para revisión humana.

### Correcciones al matcher
- `tipo_instalacion` evita asignar circuito a proyectos SUBESTACION (respeta CHECK `chk_activo_coherente`).
- Sufijo de estado `-APURE` solo se quita en circuitos con separador `-`; nombres reales como "ALTO BARINAS" se preservan.
- Eliminada regex agresiva `[A-Z]{2,} \d{1,3}` que borraba nombres legítimos ("INOS 2").
- `match_metodo` `SIN_CATALOGO` reemplazado por `SIN_MATCH` (válido en CHECK).

### Resultado final verificado en Supabase
- **ESTADAL**: 553 (546 + 7 Amazonas) — `match_metodo` = SIN_MATCH
- **CIRCUITO**: 141 — EXACTO/FUZZY
- **SUBESTACION**: 128 — EXACTO/FUZZY
- **SUELTO**: 1 (registro TEST `00000000-0000-0000-0000-000000000001`, PENDIENTE, sin región)
- Total: 269 con match (231 EXACTO + 38 FUZZY) + 553 SIN_MATCH + 1 PENDIENTE = 823

### Archivos de trabajo
- Matcher: `/tmp/opencode/replica/matcher.py`
- Delta completo: `/tmp/opencode/replica/delta_clasificacion.sql` (dividido en `delta_block_0.sql`…`delta_block_6.sql`)
- Propuestas: `/tmp/opencode/replica/data/propuestas_clasificacion.json`
- Lista de revisión manual: `/tmp/opencode/replica/data/revision_manual.json` (542 proyectos SIN_MATCH)

### Pendientes
- **Revisión humana** de los 542 proyectos SIN_MATCH (incluye 71 que mencionan CIRCUITO y 40 que mencionan SUBESTACION sin match en catálogo) — archivo `revision_manual.json`.
- Documentar el matcher en el repo (hoy vive solo en `/tmp/opencode/replica/`).

---

## Estado de Sesión (2026-07-31 — Marcado de origen en `maestro.subestaciones`)

### Objetivo
Clasificar en Supabase el origen de cada subestación del catálogo: `CARACTERIZACION SE DISTRIBUCION` (subestaciones de distribución del Excel `CARACTERIZACION SE`, 417) vs `CARACTERIZACION DE CT` (provenientes de la hoja de circuitos/CT).

### Contexto / Hallazgos
- La BD tenía **512 subestaciones** cargadas desde la hoja `CARACTERIZACION CIRCUITOS` (no de la hoja SE), con nombres simples (`BARCELONA`, `SAN JUAN`) y algunos con formato `S/E X 34,5/13,8 KV`.
- La hoja canónica `CARACTERIZACION SE` del Excel `CARACTERIZACIÓN DISTRIBUCION.xls` tiene **417 subestaciones** por estado.
- Solo **164** de las 512 BD coincidían por (región + nombre normalizado) con la hoja SE; las otras 253 SE faltaban en la BD.
- Se descartó el matching global sin región (16 homónimos entre estados, ej. ANZOATEGUI-SANTA ANA → Táchira) por riesgo de asignación errónea.
- La hoja `RESUMEN` del Excel reporta **418** SE (incluye COJEDES 10), pero la hoja detalle tiene 417 (COJEDES 9); se priorizó la hoja detalle como fuente.

### Regla de normalización de nombres
- Los **números romanos** en nombres se conservan; las variantes de escritura se normalizan (`L`/`LL`/`LLL` → `I`/`II`/`III`, `LV` → `IV`).
- Se eliminan prefijos `S/E`, paréntesis, `PROVISIONAL`, y sufijos de voltaje tipo `34,5/13,8 KV`.

### Cambios aplicados en Supabase (esquema `maestro`)
1. `UPDATE` de **164** subestaciones existentes → `origen = 'CARACTERIZACION SE DISTRIBUCION'`.
2. `INSERT` de **253** subestaciones SE faltantes (codigo `ESTADO-NOMBRE`, tipo `DISTRIBUCION`, origen SE DISTRIBUCION).
3. `UPDATE` de las **348** restantes → `origen = 'CARACTERIZACION DE CT'`.

### Resultado final verificado
- `CARACTERIZACION SE DISTRIBUCION`: **417** (conteos por estado idénticos a la hoja SE).
- `CARACTERIZACION DE CT`: **348**.
- Total: **765** subestaciones.

### Archivos de trabajo
- Script generador: `/tmp/marcar_origen_final.sql` (plan + SQL)
- Plan (ids matched / ct / inserts): `/tmp/marcar_plan.json`
- Descarga original de la BD: `/tmp/bd_subestaciones.txt`

### Pendientes
- Limpiar tabla temporal `maestro._tmp_caract_se` (417 filas cargadas del Excel SE) cuando deje de ser necesaria.
- Documentar el matcher de nombres en el repo (vive en `/tmp`).

---

## Estado de Sesión (2026-07-31 — Codificación RDS-PS de subestaciones)

### Objetivo
Normalizar y estandarizar la codificación de las 765 subestaciones del catálogo aplicando el marco IEC 81346-10 (RDS-PS), con formato aprobado por el usuario: `=VE+<ESTADO>-<NOMBRE>`.

### Formato aplicado (IEC 81346 / RDS-PS)
```
=VE+<ESTADO>-<NOMBRE_NORMALIZADO>
```
- `=VE`: aspecto de función — Sistema Eléctrico Nacional de Venezuela (raíz del sistema de referencia).
- `+<ESTADO>`: aspecto de ubicación — estado/región en español (ej. `GUARICO`, `REGION CAPITAL`, `NUEVA ESPARTA`).
- `-<NOMBRE>`: aspecto de producto — nombre normalizado de la subestación.

### Reglas de normalización aplicadas
1. Mayúsculas sin acentos (`EL PIÑAL` → `EL PINAL`, `CAÑO ZANCUDO` → `CANO ZANCUDO`).
2. Eliminación de prefijos `S/E`, `SE`, `SUBESTACION`.
3. Eliminación de sufijos de voltaje: `115 KV`, `115KV.`, `34,5 KV`, `115/34,5/13,8 KV`, `34.5 /24 KV`, `115`, `2,4` → `2.4` (designador preservado como decimal).
4. Eliminación de sufijo `PROVISIONAL`.
5. Normalización de separadores: `,` decimal → `.`, guiones bajos → espacios, `CDAD.`/`STA.`/`S/E` residuos limpiados.
6. Numerales romanos conservados (`VALERA I`, `TRONCONAL V`, `BARINAS III`).
7. Colisiones tras normalizar → sufijo determinista `-2`, `-3`... ordenado por `id` (estable ante re-ejecución).

### Implementación
- Generador: `/tmp/opencode/generador_codigos.py` (Python puro, sin dependencias).
- Validación: 765/765 códigos únicos, longitud máxima 44 caracteres, 0 colisiones sin resolver.
- Se probaron 3 formatos candidatos (`=VE+VE-J-...` ISO 3166-2, `=VE+GUARICO-...`, legible sin prefijos); el usuario aprobó el formato B (estado legible en español).
- Resultado: **192 de 765 códigos cambiaron** vs el formato `ESTADO-NOMBRE` previo (normalización de suciedad); el resto mantuvo su forma.

### Sincronización BD local
- BD local `planificacion_electrica` (esquema `maestro`) sincronizada con Supabase: 765 SE (antes 512), columna `origen` añadida, estado replicado (417 SE + 348 CT).

### Cambios aplicados en Supabase (esquema `maestro`)
- `UPDATE` de las 765 subestaciones con su código RDS-PS (`maestro.subestaciones.codigo`).
- Verificado: 765 totales, 765 `DISTINCT`, 765 con prefijo `=VE+`.

### Colisiones resueltas (muestra)
- `=VE+TACHIRA-LA PEDRERA` (SE) / `-2` y `-3` (duplicados CT `115 kV`/`115 KV`).
- `=VE+ANZOATEGUI-TRONCONAL V` / `-2` (`S/E TRONCONAL V`).
- `=VE+MIRANDA-SANTA ROSA` / `-2` (`SANTA_ROSA` CT vs `SANTA ROSA I` SE).
- `=VE+CARABOBO-SANTA ROSA` vs `=VE+CARABOBO-SANTA ROSA 2.4` (distinguidos por designador).

### Archivos de trabajo
- Dump completo Supabase: `/tmp/subestaciones_supabase_full.json` (765 SE, todas las columnas).
- Generador: `/tmp/opencode/generador_codigos.py`.
- SQL local: `/tmp/opencode/update_codigos_local.sql`; bloques Supabase: `/tmp/opencode/block_0.sql`…`block_7.sql`.
- Resultado codificado: `/tmp/subestaciones_codificadas.json`.

### Pendientes
- _(Ninguno pendiente de esta sesión. Decisión 2026-07-31: distinguir el origen de las 348 SE de CT solo mediante la columna `origen`; no se añade prefijo al código RDS-PS.)_

---

## Estado de Sesión (2026-07-31 — Codificación RDS-PS de circuitos CT)

### Objetivo
Extender la codificación RDS-PS (IEC 81346-10) a los 1,781 circuitos de distribución (`maestro.circuitos`), que estaban sin normalizar (`NOMBRE -ESTADO`, voltajes y designadores sueltos), y aplicar el resultado en Supabase tras aprobación del usuario.

### Formato aplicado (IEC 81346 / RDS-PS)
```
=VE+<ESTADO>-<SUBESTACION>:<CIRCUITO>
```
- `=VE+<ESTADO>-<SUBESTACION>`: misma raíz de ubicación que la subestación padre (`subestacion_id`).
- `:<CIRCUITO>`: aspecto de **conexión** (`:`) para el circuito dentro de la subestación.

### Reglas de normalización aplicadas
1. Prefijo compuesto por el código RDS-PS de la SE padre + `:` + circuito normalizado.
2. Eliminación del sufijo `-ESTADO` (ej. `... -MERIDA`, `... -TACHIRA`).
3. Voltajes eliminados: `13,8 KV`, `13.8 kV`, `34,5 KV`, `34.5 /24 KV`, `115/34,5/13,8 KV`, `K V`/`K` suelto, `115` desnudo.
4. Designadores conservados y normalizados: `(D-105)`/`(D405)` → `D-105`, `B4` → `B-4` (prefijo `D-`/`B-` + guion), pegados al circuito (`SEBORUCO D-205`).
5. Acentos eliminados (`CAÑO` → `CANO`), `,` decimal → `.` (`13, 8` → `13.8`).
6. Colisiones intra-SE tras normalizar → sufijo determinista `-2`, `-3`... ordenado por `id` (ej. `CAÑO TIGRE`/`CAÑO TIGRE-2`, `D-105 CENTRO`/`-2`).
7. SE con nombre normalizado duplicado conservan su sufijo ya asignado en la fase SE (`LA PEDRERA-2`/`-3`, `FALCON-MIRIMIRE-2`).

### Implementación
- Generador: `/tmp/opencode/generador_circuitos.py` (Python puro, sin dependencias).
- Validación: **1,781/1,781 códigos únicos**, longitud máxima 90, 0 residuos de voltaje, 0 dobles guiones, 146 colisiones resueltas con sufijo `-N`, 660 circuitos con designador `D-`/`B-`.
- Aplicado primero a BD local (1,781 únicos verificados) y luego a Supabase en 18 bloques (`ct_0.sql`…`ct_17.sql`, 100 UPDATEs por bloque).

### Cambios aplicados en Supabase (esquema `maestro`)
- `UPDATE` de los 1,781 circuitos con su código RDS-PS (`maestro.circuitos.codigo`).
- Verificado en Supabase: **1,781 totales, 1,781 `DISTINCT`, 0 nulos, 1,781 con formato `=VE+%:%`**.
- Muestra: `=VE+MERIDA-VIGIA I:D-105 CANO TIGRE` (id 113) / `-2` (id 115); `=VE+TACHIRA-LA GRITA:SEBORUCO D-205` (id 131) / `-2` (id 135); `=VE+MONAGAS-QUIRIQUIRE:4-QUIRIQUIRE D-405` (id 744); `=VE+TACHIRA-LA PEDRERA-3:EL NULA B-305` (id 948); `=VE+TACHIRA-FRIA 2 LF:BOCONO B-405` (id 1781).

### Archivos de trabajo
- Dump completo Supabase: `/tmp/circuitos_supabase_full.json` (1,781 circuitos, todas las columnas).
- Generador (versión original): `/tmp/opencode/generador_circuitos.py`.
- Generador reutilizable (versionado en el repo): `scripts/generar_codigos_circuitos.py` + `scripts/rds_ps.py` (reproducen los 1,781 códigos aplicados, 0 diferencias).
- SQL local: `/tmp/opencode/update_circuitos_local.sql`; bloques Supabase: `/tmp/opencode/ct_0.sql`…`ct_17.sql`.
- Resultado codificado: `/tmp/circuitos_codificados.json`.

### Pendientes
- _(Ninguno pendiente de esta sesión. Decisión 2026-07-31: distinguir el origen de las 348 SE de CT solo mediante la columna `origen`; no se añade prefijo al código RDS-PS.)_

---

## Estado de Sesión (2026-07-31 — Sincronización BD local desde Supabase)

### Objetivo
Dejar la BD local de desarrollo (`planificacion_electrica`, `127.0.0.1:5432`) como espejo fiel de la BD de Supabase, replicando todos los esquemas, datos, funciones, triggers, secuencias y políticas RLS.

### Descubrimiento clave
- La BD local solo tenía los esquemas `maestro`, `prtsen` y `public`; en Supabase hay **8 esquemas de app**: `audit`, `common`, `maestro`, `prtsen`, `psf`, `scdpp`, `scei`, `sctis`.
- El `prtsen` local (39 tablas, modelo legacy) difiere del `prtsen` de Supabase (8 tablas, modelo nuevo con 823 proyectos). Los datos legacy NO se perdieron: viven en la BD local aparte **`prtsen`** (821 proyectos, 355 desembolsos), que usa la app archivada `_archive/prtsen_app_legacy.py`.
- `public` en Supabase está vacío (0 tablas); el `public` local es solo referencia (POA schema_public) y no se tocó.
- El pooler del proyecto NO usa `aws-0-<region>` sino **`aws-1-ap-northeast-2.pooler.supabase.com`** (el usuario en el pooler es `postgres.<ref>`). El host directo `db.<ref>.supabase.co` solo resuelve a IPv6 (sin add-on IPv4), inaccesible desde esta red.

### Proceso
1. `pg_dump` remoto vía pooler en modo sesión (puerto 5432) de los 8 esquemas, con `--no-owner --no-privileges` (dump: `/tmp/opencode/supabase_app_schemas.sql`, 8,7 MB; sin extensiones, 54 tablas con RLS, 73 políticas, 16 funciones, 20 triggers, 30 secuencias).
2. Verificado que ningún objeto externo dependía de `maestro`/`prtsen` antes de soltar ambos esquemas locales (CASCADE) y restaurar el dump.
3. Se creó el rol local `authenticated` (NOLOGIN) porque las 73 políticas RLS lo referencian.

### Error detectado y corregido
- El restore inicial se truncó porque la salida pasó por `| head -40`: al cerrarse `head`, el `psql` recibió SIGPIPE y **murió en la sección final** (RLS/políticas), dejando solo 28 de 73 políticas. Los datos (71/71 tablas con `COUNT(*)` idéntico) sí se restauraron.
- **Lección**: no encadenar restores a `head`/`tail`; usar `-f` con redirección a archivo y revisar `EXIT`. El `ON_ERROR_STOP=1` no evitó el SIGPIPE.
- Corrección: se extrajo la sección RLS del dump (líneas 28490–29326), se eliminaron las políticas parciales y se reaplicó completa.

### Verificación final (local vs Supabase)
- **71/71 tablas** con `COUNT(*)` exactos idénticos.
- **361/361 objetos** idénticos (tablas, vistas, secuencias, funciones, triggers, políticas, índices).
- **73/73 políticas RLS** por esquema (audit 1, common 32, maestro 5, prtsen 8, psf 4, scdpp 6, scei 17, sctis 0) y **54/54** tablas con RLS habilitado.
- Códigos RDS-PS intactos: `maestro.subestaciones` 765/765 únicos, `maestro.circuitos` 1,781/1,781 únicos.

### Credenciales guardadas en `.env` (gitignored)
- `SUPABASE_DB_URL` (pooler sesión, IPv4) y `SUPABASE_SERVICE_ROLE_KEY` (uso solo server/scripts). Para `pg_dump`/`psql` remoto usar `PGPASSWORD='#$Lunes35.**#$'`.

### Pendientes
- _(Ninguno de esta sesión. El `public` local sigue siendo la referencia POA puro, no se sincroniza con Supabase por diseño.)_

---

## Estado de Sesión (2026-07-31 — Reparación de la app POA / POUSA del proyecto)

### Objetivo
Revisar el estatus de la app POA (`apps/web-nextjs`) y dejar el proyecto en estado final reproducible antes de pausarlo.

### Estatus detectado
- App POA funcional pero **no compilaba** por 2 errores de tipos y **lint con 1 error + 42 warnings**.
- `node_modules` corrupto (binarios `.bin` sin permiso de ejecución y copiados como archivos planos en vez de symlinks) → reparado con `npm ci`.
- Cliente Prisma no generado (los modelos tipaban `any`) → `npx prisma generate`.
- El script `"lint": "eslint"` estaba mal definido (sin target) → corregido a `"lint": "eslint ."`.

### Correcciones de código
- `app/poa/nuevo/page.tsx`: faltaba `include: { ente: true }` en `gerencia` (requerido por `POAForm`).
- `app/recursos-humanos/page.tsx`: faltaba `include: { accion_especifica: true }` en `partida_presupuestaria`.
- `app/api/metas/route.ts`: `where: any` → `Prisma.meta_fisicaWhereInput` (error de lint).
- 11 archivos `app/api/*/route.ts`: `catch (error)` → `catch` (variable `error` sin usar).
- `app/poa/page.tsx` y `app/viaticos/page.tsx`: imports sin usar eliminados.

### Verificación final
- `npm run lint` → **0 problemas**.
- `npm run build` → **OK** (type-check pasa, 13 rutas app + 11 APIs).
- Prueba de ejecución real: `next start` → `/` HTTP 200; `/api/empresas` y `/api/poa` devuelven datos reales de la BD local.
- Commit `d91f67a`.

### Estado final del proyecto (PAUSA 2026-07-31)
1. **Supabase**: 8 esquemas de app (`audit`, `common`, `maestro`, `prtsen`, `psf`, `scdpp`, `scei`, `sctis`), 823 proyectos PRTSEN, 765 subestaciones y 1,781 circuitos con código RDS-PS (IEC 81346-10) aplicado.
2. **BD local `planificacion_electrica`**: espejo fiel de Supabase (71 tablas, 361 objetos, 73 políticas RLS). El `public` local sigue siendo la referencia POA puro. La BD `prtsen` (legacy, 821 proyectos) intacta.
3. **App POA**: operativa (build + lint limpios), apuntando a BD local; pendiente migrar la conexión a Supabase en producción (ver `.env` de la app).
4. **Generadores RDS-PS**: versionados en `scripts/` (reproducen 765 SE + 1,781 circuitos con 0 diferencias).
5. **`.env`**: credenciales Supabase guardadas (gitignored): `SUPABASE_DB_URL` (pooler `aws-1-ap-northeast-2`, IPv4) y `SUPABASE_SERVICE_ROLE_KEY`.

### Pendientes para cuando se retome (sin urgencia)
- Migrar la app a Supabase en producción (descomentar las variables de Supabase en `apps/web-nextjs/.env`).
- ETL Excel PRTSEN → BD (catálogos 001/002/006/007 y 21 fichas estadales).
- Revisar si el esquema `samc` (referencia AGENTS.md) debe sustituirse por los 8 esquemas activos de Supabase.

---

## Estado de Sesión (Agosto 2026 — Resolución Hallazgo #1 de Auditoría Presupuestaria de Viáticos)

### Objetivo
Atender el Hallazgo #1 (Riesgo CRÍTICO) del Informe de Auditoría Presupuestaria referente a sobregastos no autorizados en la Partida 405 de Viáticos, aplicando el control presupuestario mediante DDL triggers en Supabase y la interfaz interactiva en la app.

### Acciones Realizadas
1. **Script DDL de Migración**: Creado `db/schema_samc/16_samc_control_presupuestario_viaticos.sql` con:
   - Catálogo de origen de fondos (`samc.catalogo_origen_fondos`).
   - Función y Trigger DDL `fn_validar_presupuesto_viatico()` / `trg_validar_presupuesto_viatico` para denegar inserciones/actualizaciones que superen el saldo disponible de la Partida 405 (Techo: Bs. 1.200.000).
   - Función y Trigger `fn_validar_comprobantes_cierre()` para exigir consistencia de comprobantes en el cierre de asignación.
   - Vista de Conciliación Presupuestaria `samc.v_conciliacion_presupuestaria` para trazabilidad ISO 8000.
   - Procedimiento de cierre `samc.sp_cerrar_asignacion_viatico()` y registros en `samc.samc_audit_log`.

2. **Tipos & Servicios Supabase**:
   - Agregada interfaz `ConciliacionPresupuestaria` en `src/types.ts`.
   - Implementadas funciones `getConciliacionPresupuestaria()` y `crearAsignacionViatico()` en `src/services/supabaseService.ts`, incorporando la validación del trigger en tiempo de ejecución.

3. **Interfaz de Usuario (`ViaticosControlView.tsx`)**:
   - Banner de Resolución de Hallazgo #1 destacando la activación del trigger `trg_validar_presupuesto_viatico` (ENFORCED, 0% Sobregasto).
   - Tarjetas métricas de Techo Presupuestario, Asignado, Saldo Disponible y % Comprometido.
   - Modal interactivo de "Nueva Asignación de Viático" para validar en vivo que montos superiores al saldo disponible son rechazados.
   - Pestaña para alternar entre "Asignaciones/Rendiciones" y la vista `v_conciliacion_presupuestaria`.

### Verificación
- `compile_applet` ejecutado exitosamente. Build sin errores ni advertencias de compilación.

