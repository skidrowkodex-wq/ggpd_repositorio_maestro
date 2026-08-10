# Session — 02 Agosto 2026

## Objective
Automatizar carga de tiras de interrupción desde Excel en app Flask, homologando causas contra 16 causas oficiales. Migrar a Google AI Studio posteriormente. Desplegar en Vercel.

## Estado actual
- **App `.env` apunta a `DB_HOST=localhost`** (servidor remoto 192.168.100.142 decommissionado)
- **BD local**: `localhost`, base `ggpd_se_cto_v1`, usuario `fullstack001`/`Lunes35.`
- Login: `ggpd_admin`/`Lunes35.` (admin total), `operador.amazona`/`Lunes35.` (editor, solo AMAZONAS)
- RLS policies activas, bloqueo por 5 intentos fallidos (30 min), calidad ISO 8000 con scoring
- Zona horaria: `America/Caracas` (-04)
- **Trigger `trg_set_mes`** en `sctis.tira_interrupcion`: auto-computa campo `mes` desde `fecha_falla`
- **Trigger `trg_tira_duplicate_check`**: detecta duplicados tras INSERT
- **Trigger `trg_tira_quality`**: evalúa calidad de registros (9 reglas ISO 8000)
- **Catálogo de formatos** `sctis.formato_catalogo`: 11 formatos (F328, TIRAS multi-estado; ANZOATEGUI, CARABOBO, CAPITAL, GUARICO_1, GUARICO_2, LARA, MIRANDA_TUY, YARACUY, ZULIA por estado)
- **Auditoría de cargas** `audit.submissions`: registra cada importación (accepted/rejected counts, formato_codigo, sheet_names, correction_file)
- **Tareas pendientes** `sctis.tarea_pendiente`: tipos CORREGIR_DATOS (rechazados en carga) y APROBAR_ACTIVO (SE/CT nuevos); CHECK ampliado
- **`common.process_codes`** tiene `sctis_import` (minúsculas, check constraint de lowercase)
- **Diccionario aprendido** `sctis.asset_alias` (migración 008): sinónimos SE/CT por estado; UNIQUE (estado, tipo, nombre, se_referencia). Resuelve automáticamente nombres fuera de norma (ISO 8000-110)
- **Cola de revisión** `sctis.asset_request` (migración 009): SE/CT reportados como nuevos; preclasificación (probable typo/alias/nuevo), decisión gobernada (aprobar / es alias / corregir / rechazar), trazabilidad decided_by/at/comentario
- **Bandeja de activos** `/admin/activos` (`app/asset_routes.py`): aprobación crea en `common.assets` + backfill de tiras + alias; CT requiere SE padre resuelta
- **Tira no bloqueada**: los activos nuevos se encolan y la tira entra con IDs NULL; el catálogo solo se modifica por el administrador (ISO 9001)
- **Rol Supervisor**: por ahora comparte las funciones del Administrador (decidido con el equipo)

## Documentación (01 Ago noche + 02 Ago)
- **4 documentos de propuesta** generados en `.md` y `.docx` en `docs/`:
  - `SCTIS_DOCTEC_v1_Arquitectura_Flujos` — técnico (arquitectura, stack, modelo de datos, 7 flujos de proceso, anexos: 22 causas, 14 sub-causas, 11 formatos)
  - `SCTIS_DOCFUN_v1_Beneficios_Decision` — funcional para decisores (antes/después, beneficios, impacto, próximos pasos)
  - `SCTIS_INSTRUCTIVO_v1_Procedimiento_Estados` — instructivo ISO operativo para estados (procedimiento completo de carga, errores frecuentes, buenas prácticas)
  - `SCTIS_INSTRUCTIVO_v1_Administradores_Supervisores` — instructivo ISO para admins/supervisores (bandeja de activos, auditoría, tareas; supervisor = funciones de admin por ahora)
- Generadores: `docx_utils.py` (helpers estilo), `renderizador.py` (md+docx desde bloques), `contenido_*.py` (contenido), `generar_docs.py` (script principal). Regenerar con: `python3 generar_docs.py`
- **Diagramas SVG** en `docs/diagramas/` (8 de secuencia por carriles/POOL + 1 de casos de uso): generador en `diagramas/` (`svg_base.py`, `secuencias.py`, `datos_secuencias.py`, `casos_uso.py`, `generar_diagramas.py`). Regenerar con: `python3 -m diagramas.generar_diagramas`
- Portada sin logo (texto MPPEE/CORPOELEC), dirigido a Ing. Adrián Correa e Ing. Catherina Favio, desarrollado por Yván Cipirán
- Formatos: códigos marcados como **PROPUESTOS, deben revisarse** con el equipo funcional
- **Los documentos son la propuesta base**: tras revisión de los ingenieros se ajustará el software, se probará y se actualizará la documentación; luego se migra a Supabase y Google AI Studio

## Deployment target: Vercel
- Proyecto adaptado para Vercel Serverless Functions (`@vercel/python`)
- Entry point único: `api/index.py` con dispatch a todas las rutas Flask
- Configuración: `vercel.json` con mapeo de rutas y env vars como secrets
- Despliegue: `vercel` CLI o dashboard de Vercel
- Variables de entorno configuradas como `@secret` en `vercel.json`
- Alternativa Cloud Run/Docker mantenida (`Dockerfile`, `cloudbuild.yaml`, `deploy.sh`)

## Files structure
```
/─ run.py                          # Entry point local (puerto 8080, carga .env via dotenv)
 ├─ app/
 │   ├── __init__.py                # Flask app factory + teardown
 │   ├── main.py                    # Entry point alternativo (Cloud Run)
 │   ├── config.py                  # Configuración centralizada (env vars)
 │   ├── db.py                      # Conexión PostgreSQL con auto-commit
 │   ├── auth.py                    # Login/logout, @login_required, session + Firebase compat
 │   ├── firebase_auth.py           # Capa de compatibilidad Firebase Auth
 │   ├── ai.py                      # Integración Gemini AI (causa, calidad, duplicados)
 │   ├── routes.py                  # API REST + dashboard + descarga formulario Excel
  │   ├── import_routes.py           # Importación Excel (wizard 3 pasos) + COL_MAP_FORMATO + activos inconsistentes
  │   ├── admin_routes.py            # CRUD usuarios (admin)
  │   ├── asset_routes.py            # Bandeja de activos /admin/activos (aprobar, alias, corregir, rechazar)
  │   ├── dashboard.py               # Dashboard 4 perspectivas (Ingeniero, Mantto, PM, Data)
  │   ├── static/
  │   └── templates/
  │       ├── base.html
  │       ├── login.html
  │       ├── importar.html
  │       ├── form.html
  │       ├── consulta.html
  │       ├── index.html
  │       ├── dashboard.html         # Dashboard completo con Chart.js
  │       └── admin/
  │           ├── usuarios.html
  │           └── activos.html       # Bandeja de revisión de activos (Vue 3)
  ├─ api/                            # Vercel serverless functions
  │   ├── __init__.py
  │   ├── index.py
  │   └── _utils.py
  ├─ migraciones/
  │   ├── 001_crear_esquema_sctis.sql
  │   ├── 002_poblar_catalogos.sql
  │   ├── 003_homologar_causas.sql
  │   ├── 004_iso_compliance.sql
  │   └── 005_campos_calculo.sql
  │   (008_asset_alias.sql, 009_asset_request.sql en BD local; migraciones 006-007 usadas en Supabase)
  ├─ diagramas/                      # Generador SVG de diagramas (secuencias + casos de uso)
  ├─ docs/
  │   ├── FORMATO ESTABLECIDO TIRAS.xlsx
  │   ├── FLUJO_PROCESOS_SCTIS_v1.docx
  │   ├── SCTIS_*.md / .docx         # 4 documentos de propuesta
  │   └── diagramas/                 # 8 secuencias + 1 casos de uso (SVG/PNG)
 ├─ generar_documento.py
 ├─ convertir_formato_anzoategui.py  # Conversor de formato por estado → homologado
 ├─ Dockerfile
 ├─ vercel.json
 ├─ cloudbuild.yaml
 ├─ deploy.sh
 ├─ .dockerignore
 ├─ .gcloudignore
 ├─ .env.example
 ├─ README.md
 └─ AGENTS.md
```

## What was done (30 Jul - 02 Ago 2026)

### 02 Ago: Activos no catalogados (alias + bandeja) + 4º documento + Diagramas SVG
- **Migraciones 008/009 aplicadas en BD local** (`sctis.asset_alias`, `sctis.asset_request`); CHECK de `tarea_pendiente` ampliado a `('CORREGIR_DATOS','APROBAR_ACTIVO')`
- **`app/import_routes.py`**:
  - Helpers `cargar_aliases_assets`, `guardar_aliases_assets`, `preclasificar_activo` (difflib: ≥0.85 typo, ≥0.60 alias)
  - Lógica `se_nuevos`/`ci_nuevos`: "Reportar como nueva" encola en `asset_request` + crea tarea APROBAR_ACTIVO para el primer admin activo; la tira entra sin bloqueo (IDs NULL)
  - `detectar_activos_inconsistentes` consulta `asset_alias` antes del matching difuso (auto-resolución)
- **`app/asset_routes.py`** (blueprint `assets`): `/admin/activos` + APIs `listar_activos`, `catalogo_activos`, `aprobar_activo`, `asignar_alias`, `rechazar_activo`, `corregir_activo`. Aprobar crea en `common.assets` (SE code UPPER; CT `'SE_CODE :: NOMBRE'`) + backfill + alias; `_completar_tareas_agotadas` cierra tareas al quedar 0 solicitudes
- **`app/templates/admin/activos.html`** (Vue 3, 3 modales) + nav "Activos" en `base.html` + blueprint en `app/__init__.py`
- **Verificado end-to-end vía curl** (aprobar SE, aprobar CT con SE padre, es alias, rechazar, corregir) y auto-resolución de alias; datos de prueba eliminados
- **4º documento** `SCTIS_INSTRUCTIVO_v1_Administradores_Supervisores` (.md/.docx); `contenido_doctec.py`, `contenido_docfun.py`, `contenido_instructivo.py` actualizados con las nuevas funcionalidades (secciones 5.6/5.7, 5.9, cap. 7, glosarios)
- **Diagramas SVG**: `docs/diagramas/` con 8 secuencias por carriles/POOL (importación, auditoría, calidad ISO 8000, dashboard, tareas, aprendizaje alias, aprobación de activos, login/RLS) + 1 casos de uso (19 UC, actores Operador/Admin/Supervisor/IA Gemini). Generador en `diagramas/`; renderizado a PNG validado con cairosvg (sin desbordes de texto)

### 01 Ago (noche): Auditoría de cargas + Tareas pendientes + Catálogo de formatos
- **`sctis.formato_catalogo`**: estados asignados (F328/TIRAS multi-estado; ANZOATEGUI→ANZOÁTEGUI, CARABOBO, CAPITAL→DISTRITO CAPITAL, GUARICO_1/2→GUÁRICO, LARA, MIRANDA_TUY→MIRANDA, YARACUY, ZULIA)
- **`common.process_codes`**: agregado `sctis_import` (minúsculas por check constraint)
- **Auditoría integrada al wizard de importación**:
  - `preview_import` inserta en `audit.submissions` (PENDING, formato_codigo, sheet_names, row_count, ingested_by)
  - `confirmar_import` actualiza accepted/rejected counts + validation_status (VALIDATED/PARTIAL)
  - Cuando hay rechazados > 0: crea `sctis.tarea_pendiente` (CORREGIR_DATOS) + genera Excel de corrección
- **Admin routes nuevas**: `/admin/auditoria`, `/admin/tareas` (páginas + APIs de listado, resumen, completar/cancelar tarea, descargar corrección)
- **Templates**: `admin/auditoria.html` (tabla + resumen por estado/usuario), `admin/tareas.html` (filtros por estado/estado_tarea, badges de vencimiento)
- **Nav admin**: enlaces Auditoría y Tareas en `base.html` (visible solo para role admin)
- **Fixes**:
  - `detectar_formato_catalogo`: ORDER BY con `IS NOT DISTINCT FROM %s` (maneja estado_codigo NULL)
  - `sub_result` en preview: `query()` retorna lista de dicts, acceso `[0]['submission_id']`
- **Verificado**: preview detecta formato CARABOBO en FORMATO ESTABLECIDO TIRAS.xlsx (18 hojas, 25 filas), submission creado y auditado correctamente
- **Selección de hoja única (multi-hoja)**:
  - `preview_import` en 2 fases: subida → si hay varias hojas visibles devuelve `requires_sheet_selection` + lista + token; segunda llamada con `token`+`sheet_name` procesa SOLO esa hoja
  - El responsable DEBE consolidar en una sola hoja; no se cargan múltiples
  - `confirmar_import` usa la hoja seleccionada del preview (`sheet_seleccionada`)
  - Nuevo paso `seleccionar_hoja` en `importar.html` con mensaje de consolidación
- **Wrapper `HojaMemoria`** (read_only): resuelve rendimiento — hoja CARABOBO de 6351×63 celdas pasaba de ~100s (data_only sin read_only) a ~6s. Permite `ws[row_idx]` que read_only no soporta nativamente

### 01 Ago (tarde): Importación Excel ANZOÁTEGUI + verificación trigger mes
- **Conversión de formato**: `convertir_formato_anzoategui.py` convierte el Excel de ANZOÁTEGUI (formato propietario por estado) al formato homologado
- **Importación exitosa**: 19 registros insertados en `sctis.tira_interrupcion` en BD remota `192.168.100.142`
  - 7 filas omitidas: "no se pudo determinar el estado" (nombres no reconocidos en `common.states`)
  - Causas mapeadas: 18 causas originales → causas homologadas (IDs 1-18 en remoto)
- **Trigger `trg_set_mes` verificado**: todos los registros tienen `mes` auto-poblado
  - Registros con `fecha_falla` en enero 2026 → `mes = 'ENERO'`
  - Registro de prueba con `fecha_falla = 2026-04-15` → `mes = 'ABRIL'`
- **Fix `HEADERS_FORMATO_ESPERADOS`**: actualizado para aceptar el formato homologado (columnas B=Sistema, F=Fecha Inicio)
- **Dashboard** (`/dashboard`): 4 perspectivas expertas (Ingeniero Eléctrico, Mantenimiento, Project Manager, Data Scientist)
- **API dashboard** (`/api/dashboard`): 13 secciones de datos para visualización

### 01 Ago (tarde): Sincronización BDs + Sankey + Descarga de gráficos
- **Fix 7 filas error "estado"**: `detectar_estado_desde_texto` ahora normaliza acentos via `normalizar_texto` (resuelve ANZOATEGUI vs ANZOÁTEGUI)
- **Selector de estado obligatorio para admin**: Dropdown en paso 1 (upload) del wizard de importación. Operadores usan su estado asignado automáticamente.
- **Sincronización localhost ↔ remoto (192.168.100.142)**:
  - Remoto: columna `estado_codigo` + FK + índice agregados a `sctis.despachador`
  - Local: función `fn_set_mes_from_fecha` + trigger `trg_set_mes` copiados del remoto
  - Causas: local actualizado de 16 (IDs 23-38) a 22 (IDs 1-22, idéntico al remoto)
  - Sub-causas: local actualizado de 17 a 14 (idéntico al remoto)
  - `tira_interrupcion`: 20 registros sincronizados (remoto → local)
  - `record_quality_scores`, `user_profiles`, `audit.*`: sincronizados
  - `dblink` extension instalada en ambas BD para futuras sincronizaciones
  - **Resultado**: ambas BD idénticas en estructura, funciones, triggers y datos
- **Dashboard — Sankey de desglose "OTRAS"**:
  - Plotly.js v2.35.0 agregado (CDN)
  - Gráfico Sankey en Sección 1 (Ingeniero Eléctrico): muestra flujo causa homologada → causa original
  - Solo muestra registros donde `causa_codigo = 'OTRAS'` (las causas que se pierden en homologación)
  - Query `desglose_otras` agregado en `/api/dashboard`
- **Descarga de gráficos como PNG**:
  - Cada tarjeta de gráfico tiene botón `⬇` para descargar
  - Chart.js: `canvas.toDataURL()` → PNG nativo
  - Plotly (Sankey): `Plotly.downloadImage()` → PNG 1200x500 @2x
  - 9 gráficos descargables: causas, horas, tendencia, sistema, sankey, circuitos, subestaciones, estados, horario, calidad

### 01 Ago (mañana): BD remota 192.168.100.142 + trigger mes + dotenv fix
- **Conexión a BD remota `192.168.100.142`**:
  - `.env` actualizado: `DB_HOST=192.168.100.142`
  - Contraseña `fullstack001` sincronizada en servidor remoto (`ALTER USER`)
  - Base `ggpd_se_cto_v1` creada en remoto, esquemas `common` (5,153 assets), `audit` (5 tablas) y `sctis` (12 tablas) sincronizados desde local
  - Rol `ggpd_admin` creado como SUPERUSER en remoto
  - Columna `estado_codigo` agregada a `sctis.user_profiles` (faltaba en migración original)
- **Trigger `trg_set_mes`** en `sctis.tira_interrupcion`:
  - Función `sctis.fn_set_mes_from_fecha()`: extrae mes de `fecha_falla` y almacena nombre español uppercase
  - Previene errores tipográficos y nombres fuera de norma en el campo `mes`
- **Fix dotenv en `run.py`**: agregado `load_dotenv()` al inicio para que `.env` se cargue automáticamente

### 30 Jul: análisis de formatos, documento, reestructuración
- Analizados los 17 sheets del Excel original (formatos propios por estado)
- Generado `docs/FLUJO_PROCESOS_SCTIS_v1.docx` (ISO-style, 8 secciones, branding MPPEE/CORPOELEC)
- Reestructurado Formato Establecido a 21 columnas: F=Fecha Inicio, G=Hora Inicio, H=Fecha Fin, I=Hora Fin
- Campos de cálculo automatizados en BD (migración 005): `duracion_calculada`, `horas_calculadas`, `diferencia_horas`, `estado_calculo`
- Fixes en `fn_detect_duplicates` y `fn_evaluate_tira_quality` (9 reglas)
- Commit `bc94bb2`

### 31 Jul: Supabase + limpieza + catálogo de SE/CT
- Aplicadas migraciones 001-005 en Supabase
- Sync catálogo: 16 causas + 17 sub-causas
- Catálogo SE/CT en `common.assets`: 4,311 CT, 838 SE activas
- 4 SE MOVIL inactivadas, SE URUMACO I creada

## Pending decisions / next steps
1. ~~Probar carga del Excel de ANZOÁTEGUI~~ ✅ Completado 01-Ago
2. ~~Investigar 7 filas con error "no se pudo determinar el estado"~~ ✅ Resuelto (normalización de acentos)
3. Replicar cambios de catálogo SE/CT (MOVIL, URUMACO I) en Supabase
4. Definir scope de `audit.transformaciones` con el equipo funcional
5. Migración a Google AI Studio — pendiente de aprobación
6. ~~Sincronizar secuencia de causas: remoto (1-22, 22 causas) vs local (23-38, 16 causas)~~ ✅ Sincronizadas
7. ~~Probar con otros formatos de estado (ANZOÁTEGUI fue el primero; CARABOBO ya detecta correctamente en preview)~~ ✅ Verificado multi-hoja 01-Ago
8. Desplegar en Vercel
9. Automatizar reportes consolidados (pendiente de definir formulario)
10. ~~Catálogo de formatos con estados asignados~~ ✅ Asignados 9 formatos por estado, F328/TIRAS multi-estado
11. ~~Auditoría de cargas + tareas pendientes~~ ✅ Integrados al wizard, admin routes y templates listos
12. ~~Selección de hoja única en importación~~ ✅ El usuario debe elegir UNA hoja; no se cargan múltiples (consolidar en una sola hoja)
13. ~~Rendimiento parseo Excel multi-hoja~~ ✅ Wrapper HojaMemoria (read_only): 100s → ~6s
14. ~~Generar 3 documentos de propuesta (técnico, funcional, instructivo) en .md + .docx~~ ✅ Completado 01-Ago noche
15. Revisión de los documentos por los ingenieros → ajustar software según observaciones → probar → actualizar documentación
16. Migración a Supabase y Google AI Studio (tras aprobación y ajustes)
17. Replicar migraciones 008/009 en Supabase cuando se migre
18. ~~Generar diagramas SVG (secuencias por carriles + casos de uso)~~ ✅ Completado 02-Ago
19. ~~Generar 4º documento (instructivo admin/supervisores)~~ ✅ Completado 02-Ago

## Datos de prueba en BD local
```sql
-- 20 registros en sctis.tira_interrupcion (tira_id 2-21)
-- 1 registro de prueba pre-existente (tira_id 2, ANZOÁTEGUI, fecha_falla=2026-04-15, mes=ABRIL)
-- 19 registros importados del Excel (tira_id 3-21, todos con mes=ENERO)
-- 7 filas del Excel omitidas por error de estado
```

## BD Local (única)
- Servidor remoto 192.168.100.142 decommissionado; la app apunta SOLO a localhost
- Causas: 22 registros (IDs 1-22), Sub-causas: 14 registros (IDs 1-14)
- tira_interrupcion: 20 registros
- `common.process_codes`: agregado `sctis_import`

## Server
- Flask en `http://localhost:5000`
- Iniciar: `setsid sh -c 'APP_DEBUG=false python3 run.py >> /tmp/sctis_app.log 2>&1' & disown`
- **IMPORTANTE**: `APP_DEBUG=false` para evitar el watchdog reloader que mata el proceso
- `run.py` carga `.env` automáticamente via `dotenv` al inicio
- NO combinar `pkill` y `setsid` en un solo comando (mata el proceso nuevo)
- Usar `python3` del sistema (el `.venv` está vacío)
- **Sesiones Flask**: usar `-b` y `-c` en cada request curl para mantener sesión

## Session log
- **20:00** — 3 documentos de propuesta generados (.md + .docx): técnico, funcional e instructivo; lista para revisión de los ingenieros
- **23:30** — Auditoría + tareas + catálogo de formatos integrados y verificados en BD local
- **19:40** — Selección de hoja única (multi-hoja) implementada + wrapper HojaMemoria read_only (100s→6s)
- **15:00** — Sincronización localhost ↔ remoto completada (ambas BD idénticas)
- **14:50** — dblink instalado en ambas BD
- **14:30** — Fix detectar_estado_desde_texto con normalización de acentos
- **14:00** — Selector de estado obligatorio para admin en wizard de importación
- **12:00** — Pausa de 2 horas solicitada por usuario
- **12:05** — Importación Excel ANZOÁTEGUI completada (19 registros, 7 errores de estado)
- **12:03** — Trigger `trg_set_mes` verificado: mes auto-poblado correctamente
- **12:02** — App reiniciada con `HEADERS_FORMATO_ESPERADOS` actualizado
- **12:01** — Conversión de formato ANZOÁTEGUI → homologado completada
- **02 Ago** — Diccionario aprendido de alias + cola de revisión de activos + bandeja /admin/activos verificada end-to-end
- **02 Ago** — 4º documento (instructivo admin/supervisores) + contenidos ISO actualizados (5.6/5.7, 5.9, cap. 7)
- **02 Ago** — Diagramas SVG generados: 8 secuencias por carriles + 1 casos de uso
