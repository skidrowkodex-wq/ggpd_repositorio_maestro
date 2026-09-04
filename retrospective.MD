# Retrospectiva Técnica del Proyecto — Repositorio Maestro CORPOELEC (GGPD)

**Código Normativo:** `NAC_2026_GGPD_RETROSPECTIVA_TECNICA_V01.md`  
**Fecha de Registro:** 14 de Agosto de 2026  
**Entorno / Plataforma:** Antigravity IDE 2.0 (Google Gemini 3.7 Flash)  
**Proyecto:** Repositorio Maestro de Distribución CORPOELEC  
**Autores / Equipo:** Yvan Ciprián | Josue Pacheco (skidrowkodex)  

---

## 🌟 1. Lo que Funcionó (Éxitos y Aciertos)

1. **Portal Maestro Unificado Centralizado:**
   - Desarrollo de una consola web reactiva e interactiva ([index.html](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/index.html) y [src/main.js](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/src/main.js)) en Vite con estética moderna (Lucide Icons, Glassmorphism, diseño responsivo).
   - Integración de diagnósticos de latencia en tiempo real, visor de credenciales, explorador de esquemas y consola de eventos Supabase.

2. **Orquestación Multi-Servicio Simultánea:**
   - Levantamiento concurrente de las 5 aplicaciones estratégicas del SEN más el portal central en puertos independientes (`3001` a `3005`, `5000` / `5173`) respondiendo con código **HTTP 200**.
   - Creación del script [serve_all.py](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/serve_all.py) y su inclusión en [package.json](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/package.json) como `npm run serve:all`.

3. **Arquitectura de Base de Datos y Cumplimiento Normativo (ISO / COBIT):**
   - Implementación de triggers relacionales PostgreSQL (`fn_validar_presupuesto_viatico` y `trg_validar_comprobantes_cierre`) para control presupuestario preventivo según COBIT 2019 (MEA02).
   - Algoritmo de deduplicación sintáctica SHA-256 (`generateEquipmentFingerprint`) y bandeja de aislamiento/remediación para equipos de subestaciones (ISO 8000-110 / ISO 55000).
   - Esquema DDL maestro unificado de activos eléctricos ([sql/01_tabla_unificada_activos.sql](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/sql/01_tabla_unificada_activos.sql)).

4. **Discovery Automatizado de Supabase:**
   - El script de introspección [.agents/discover.js](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/discover.js) detectó exitosamente la tabla central `activos_red` en el esquema `public` con todos sus metadatos técnicos.

5. **Protocolo Institucional de Continuidad (Handoff):**
   - Configuración formal de [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md), [AGENTS.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/AGENTS.md) y [.agents/rules/handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/rules/handoff.md) para garantizar la continuidad operativa de agentes de IA y desarrolladores humanos.

---

## ⚠️ 2. Lo que No Funcionó (Incidencias y Obstáculos)

1. **Gestión de Procesos en Segundo Plano mediante Shell (`&` / `nohup` simple):**
   - Los comandos `python3 -m http.server PORT &` lanzados dentro de subshells bash efímeras se terminaban inmediatamente al cerrarse la subshell, dejando los puertos inactivos (código `000` / Connection Refused).

2. **Falla en el Entorno del Navegador Automatizado (`browser_subagent`):**
   - El subagente de navegación no pudo inicializar Playwright debido a un error `404 Not Found` en el CDN de descarga del driver (`https://playwright.azureedge.net/builds/driver/playwright-1.57.0-linux.zip`).

3. **Invisibilidad Inicial de Esquemas No Públicos en Supabase:**
   - Las consultas REST directas a esquemas como `common`, `distribucion` o `activos` retornaban respuestas vacías o errores 404/406 sin la cabecera adecuada `Accept-Profile` y sin la configuración de esquemas expuestos en el backend de PostgREST.

4. **Restricción de Seguridad del Workspace en Sesión Previa:**
   - La IDE bloqueó intentos de escritura cruzada cuando el workspace activo era `/Documentos/update` y se intentaba escribir en `/Documentos/Repositorio_Maestro`.

5. **Herramientas Obsoletas de Diagnóstico de Red (`netstat`):**
   - El comando `netstat` no se encontraba instalado en la distribución base del sistema operativo Linux.

---

## 🔍 3. Por Qué No Funcionó (Causas Raíz)

1. **Ciclo de Vida de Subshells en Linux:**
   - Los comandos ejecutados en subshells no interactivas envían señales `SIGHUP` a sus procesos hijos al finalizar el script si no están desacoplados mediante un servidor daemon multihilo persistente.
2. **Dependencia Externa de CDNs de Microsoft / Playwright:**
   - La versión 1.57.0 de los binarios del driver de Playwright no estaba disponible en los servidores perimetrales de Azure Edge en ese instante, bloqueando la inicialización del headless browser.
3. **Comportamiento por Defecto de PostgREST / Supabase API:**
   - Por diseño de seguridad, Supabase REST API enruta todas las peticiones al esquema `public` a menos que se configure explícitamente `PGRST_DB_SCHEMAS` en el servidor y se envíe el header `Accept-Profile: <esquema>`.
4. **Política de Sandbox del Agente de IA:**
   - La directiva de seguridad del IDE previene la mutación accidental de carpetas fuera de la raíz del proyecto activo para evitar daños colaterales en el sistema de archivos del usuario.
5. **Evolución del Stack de Red en Linux:**
   - El paquete `net-tools` (`netstat`, `ifconfig`) fue declarado obsoleto y sustituido por la suite estándar `iproute2` (`ss`, `ip`).

---

## 💡 4. Cómo Resolvimos lo que No Funcionó

| Problema | Causa Raíz | Solución Aplicada |
| :--- | :--- | :--- |
| **Servidores que se caían tras el subshell** | Procesos hijos terminados por `SIGHUP` | Creación de [serve_all.py](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/serve_all.py), un servidor multihilo Python con `TCPServer` y `allow_reuse_address=True`, ejecutado como daemon persistente. |
| **Error 404 en CDN de Playwright** | Driver no descargable en edge network | Validación manual y automatizada de los puertos mediante `curl` y habilitación del acceso directo vía navegador del sistema en `http://localhost:5173`. |
| **Dificultad de introspección de esquemas** | PostgREST requiere `Accept-Profile` y tabla existente | Desarrollo de scripts Node.js ([discover.js](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/discover.js) / [scan_tables.js](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/scan_tables.js)) que iteran esquemas y confirmaron la tabla `activos_red` en `public`. |
| **Error de permisos entre carpetas** | Workspace incorrecto abierto en IDE | Apertura de `/Documentos/Repositorio_Maestro` como workspace primario, permitiendo la creación de [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md) y [AGENTS.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/AGENTS.md). |
| **Comando `netstat` no encontrado** | Paquete `net-tools` deprecado | Uso del comando nativo moderno `ss -tuln` combinado con healthchecks HTTP de `curl`. |

---

## ⏳ 5. Qué Tomó Más Tiempo Resolver

1. **Orquestación y Concurrencia de 6 Servicios Heterogéneos:**
   - Integrar 5 aplicaciones independientes (compiladas en React/Vite, Remix y HTML/JS puro) junto al Portal Maestro, configurando un esquema de puertos sin colisiones (`3001` - `3005`, `5173`) y asegurando su persistencia en memoria.
2. **Auditoría Técnica y Cumplimiento Normativo Exhaustivo:**
   - Formular, verificar y documentar las normas institucionales (ISO 8000, 9001, 27001, 55000, COBIT 2019, IEC 81346-10), elaborando los informes técnicos formales en formato `.md` y `.docx` en el directorio [docs/](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/docs/).
3. **Estandarización del Esquema Unificado de Activos:**
   - Diseñar la estructura relacional de `activos_red` capaz de homologar subestaciones, circuitos, transformadores y tiras de interrupción de diferentes formatos regionales.

---

## 📌 6. Qué Quedó Pendiente por Resolver (Roadmap Próximo)

- [ ] **Carga Masiva de Datos Operativos:**
  - Coordinar con las 24 salas situacionales regionales de CORPOELEC para iniciar la ingesta masiva en SCTIS v2.0 y SCEIN utilizando las plantillas normalizadas.
- [ ] **Configuración de Proxy Inverso / SSL Corporativo:**
  - Configurar un servidor Nginx/Caddy con terminación TLS para unificar el enrutamiento bajo un único dominio o subdominios institucionales (`sctis.corpoelec.gob.ve`, `scein.corpoelec.gob.ve`, etc.).
- [ ] **Pruebas E2E Automatizadas con Drivers Locales:**
  - Configurar un runner de pruebas Cypress o Playwright con binarios pre-descargados localmente para pruebas de regresión automáticas en pipelines CI/CD.
- [ ] **Exposición de Esquemas Adicionales en Supabase:**
  - Si se requiere separar por esquemas (`distribucion`, `telemetria`, `samc`), configurar el parámetro `db-schemas` en el panel de Supabase y ajustar las directivas RLS correspondientes.

---

# 📋 7. Retrospectiva Adicional — Auditoría Gobernanza IAM & SCGCC (02-Sep-2026)

**Fecha:** 02 de Septiembre de 2026  
**Alcance:** Revisión de SCGCC-REF (correspondencia corporativa), motor IAM unificado e integración de gestión de usuarios en SIGI-REF.

---

## 7.1. Contexto / Reporte del Usuario (SCGCC-REF)

**Incidente reportado:** La usuaria **Lic. Blanca González** usó SCGCC el Lunes y Martes y, al no hacer LogOut, el sistema quedó abierto en su navegador. Al reabrir, la app mostró su panel con su nombre directamente. Al ingresar con la cuenta `ggpd_admin`, el sistema mostró el nombre de **Ing. Carlos Reyes** en lugar del perfil de administrador.

**Hallazgos de causalidad:**
1. **La sesión persiste deliberadamente en `localStorage`** (clave `scgcc_user`) en `apps-refactorizadas/SCGCC-REF/src/lib/authContext.tsx`. El comportamiento de Blanca (mantener sesión abierta) es **esperado del diseño** (sesión persistida entre reinicios de navegador) — no es un bug.
2. **El bug de "Carlos Reyes" NO era caché del navegador**, sino una colisión de alias en el catálogo local: en `src/data/initialCorrespondencias.ts`, la cuenta `admin.ggpd`/`ggpd_admin` era **alias del perfil `usr-01` = Ing. Carlos Reyes** (aliases: `['carlos.reyes', 'c.reyes', ..., 'ggpd_admin', 'admin.ggpd', 'admin']`). Por tanto, al ingresar `ggpd_admin`, `findInstitutionalUser()` resolvía al perfil personal de Carlos.
3. **Causa raíz estructural:** SCGCC-REF **NO autentica contra la tabla maestra `core.mae_usuarios_sistema` de InsForge**; valida contra un catálogo hardcodeado `INITIAL_USERS` en el frontend. Esto la hace inconsistente con el resto del ecosistema.

**Corrección local aplicada (pendiente de validar/persistir):**
- Se separó la cuenta `admin.ggpd` en un perfil **`Administrador Central GGPD`** (rol `ADMINISTRADOR`), quitándola de los alias de Carlos Reyes, y se creó un perfil independiente `usr-01b` para `carlos.reyes` (rol `GERENTE`). **IMPORTANTE:** esta edición en el catálogo local es un parche; la solución de fondo es conectar SCGCC a la tabla maestra (ver 7.4).

---

## 7.2. Estado real de la tabla maestra IAM en InsForge (verificado por API)

- **Tabla:** `core.mae_usuarios_sistema` (esquema `core`, **NO** `public`).
- **Vista semántica:** `public.v_usuarios_sistema` (JOIN con `core.dim_estados`; expone `nombre_estado`, `codigo_region`).
- **Conteo:** **37 usuarios** (`ADMINISTRADOR: 3`, `GERENCIA: 3`, `ESPECIALISTA: 2`, `ANALISTA: 2`, `OPERADOR: 1`, `AUDITOR: 1`, `VISOR_ESTADAL: 25`).
- **Cuenta admin confirmada:** `admin.ggpd` = `Administrador General GGPD`, rol `ADMINISTRADOR`, email `admin.ggpd@corpoelec.gob.ve`, `status=ACTIVO`, con **todos** los permisos `TRUE`.
- **Matriz de permisos por app** en la tabla (solo 6 + drive): `permiso_sigi`, `permiso_sctis`, `permiso_scein`, `permiso_scppe`, `permiso_scmtp`, `permiso_gdrive`. **⚠ NO existe `permiso_scgcc`** en la tabla maestra.

**NOTA CRÍTICA de esquema:** la tabla vive en `core`; al consultarla por REST con `Accept-Profile` por defecto (`public`) devuelve `relation "public.mae_usuarios_sistema" does not exist`. El acceso funcional se hace vía la **vista `public.v_usuarios_sistema`** (que sí está en `public`).

---

## 7.3. Análisis de impacto — Autenticación en las 4 apps (SCMTP / SCPPE / SCEIN / SCTIS)

| Criterio | SCMTP | SCPPE | SCEIN | SCTIS |
|---|---|---|---|---|
| **Consulta `mae_usuarios_sistema`?** | ✅ Sí | ✅ Sí | ✅ Sí (backend) | ✅ Sí (Python + vista) |
| **Check de permiso por app?** | ❌ **NO** (`permiso_scmtp`) | ✅ Sí (`permiso_scppe`) | ✅ Sí (`permiso_scein`) | ✅ Sí (`permiso_sctis`) |
| **Catálogo local hardcodeado?** | ⚠ (17 users) | ⚠ (7 users + **backdoor pw**) | ⚠ (6 users) | ⚠ (BD local `sctis.user_profiles`) |
| **Fallback genérico sin validación?** | ⚠ Sí | ⚠ Sí | ⚠ Parcial | ⚠ Sí (auto-crea) |
| **Mapeo de rol compatible con InsForge?** | ❌ **Bug `rol` vs `role`** | ⚠ Parcial | ❌ `ADMINISTRADOR`≠`ADMIN_NACIONAL` | ❌ `ADMINISTRADOR`≠`admin` |
| **Persistencia de sesión** | localStorage | localStorage | Cookie httpOnly+HMAC | Flask session |

**Hallazgos de alto impacto (seguridad & gobernanza):**
1. **SCMTP no valida `permiso_scmtp`** — cualquier usuario activo puede entrar, sin importar la matriz.
2. **SCPPE tiene backdoor de contraseña** (`userService/authService.ts`): acepta `'Corpoelec2026!.'` o `'admin2026!.'` hardcodeadas como válidas para cualquier usuario, además de comparar `password_hash` en texto plano (sin hash).
3. **`password_hash` se almacena en texto plano** en el seed de InsForge (script `deploy_insforge_iam_users.py`) — vulnerabilidad OWASP A07:2021 (Auth Failures).
4. **Inconsistencia de roles:** cada app define su propio union type de rol (`ADMIN_NACIONAL`, `admin`, `DIRECTOR`, etc.) que **no coincide** con `role_code` de InsForge (`ADMINISTRADOR`, `GERENCIA`, `ESPECIALISTA`, `OPERADOR`, `AUDITOR`, `VISOR_ESTADAL`), rompiendo el RBAC interno.
5. **SCMTP bug de campo:** construye `rol:` pero el tipo espera `role:` → RBAC de SCMTP queda desactivado para usuarios InsForge.
6. **SCEIN/SCTIS consultan desde backend** (buena práctica); **SCMTP/SCPPE consultan la API key desde el frontend** exponiéndola en el tráfico del navegador.
7. **SCTIS además** mantiene tablas locales `sctis.user_profiles`/`sctis.user_roles` y soporta Firebase Auth como canal, generando duplicidad de fuentes de verdad.

---

## 7.4. SIGI-REF como gestor centralizado de usuarios

**Confirmado:** SIGI-REF es la **Consola Central de Gestión de Usuarios** del ecosistema (decisión arquitectónica: *se gestiona desde una sola app*). El módulo `UserManagementModule.tsx` ofrece:
- **CRUD completo** de usuarios contra InsForge (`create/update/delete` vía `saveUserToInsForge`).
- **Wizard de permisos por app** (`updateUserPermissionsInInsForge`): `permiso_sigi/sctis/scein/scppe/scmtp/gdrive`.
- **Kill-switch** suspender/reactivar (`toggleUserStatusInInsForge`).
- **Reseteo de clave** con validación OWASP (`validatePasswordStrength`).
- **Simulación de token SSO JWT** y **bitácora ISO 27001** con export JSON.
- Roles definidos (`UserSystemRole`, 8): `ADMINISTRADOR`, `GERENCIA`, `ESPECIALISTA`, `SUPERVISOR`, `ANALISTA`, `OPERADOR`, `AUDITOR`, `VISOR_ESTADAL`.

**Gaps detectados en SIGI como gestor central:**
1. **SCGCC es un "permiso huérfano":** existe como entidad de UI y catálogo local (`scgcc?: boolean`), y hay badge/wizard para SCGCC, **pero NO se persiste `permiso_scgcc`** en `mae_usuarios_sistema` (ni en `saveUserToInsForge`, ni en `updateUserPermissionsInInsForge`, ni en el mapeo de lectura). El dato se pierde al resincronizar desde InsForge.
2. **Los dropdowns de rol de la UI** (filtro y formulario crear/editar) solo listan 6 roles y **no permiten asignar `SUPERVISOR` ni `VISOR_ESTADAL`**, aunque el tipo los soporta.
3. **`permiso_sigi` se escribe siempre `true`** al guardar pero **nunca se lee/mapea de vuelta** (no hay round-trip de lectura del acceso a SIGI).
4. **La cuenta admin del catálogo es `ggpd_admin`** (Administrador General GGPD), mientras que en InsForge el username real es **`admin.ggpd`** — hay que unificar la nomenclatura de la cuenta maestra.

---

## 7.5. Hoja de Ruta Recomendada (Impacto y Correcciones)

**Cortísimo plazo (corregir el incidente de Blanca/SCGCC):**
- [x] Conectar la autenticación de **SCGCC-REF** a la tabla maestra (`v_usuarios_sistema` + verificación de `password_hash`/`status` y `permiso_scgcc`), eliminando la dependencia exclusiva de `INITIAL_USERS`. *(Hecho 02-Sep: SCGCC autentica vía RPC `public.verificar_credencial_sistema`, sin exponer el hash.)*
- [ ] Separar definitivamente el perfil `Administrador General GGPD` de la identidad personal de Ing. Carlos Reyes en todas las vistas/catálogos de SCGCC. *(El bug de alias quedó resuelto de fondo al centralizar en la tabla maestra, donde la cuenta maestra `admin.ggpd` es independiente; pendiente purgar restos del catálogo local.)*

**A corto/medio plazo (uniformizar el IAM en las 5 apps):**
- [x] Agregar la columna `permiso_scgcc BOOLEAN DEFAULT FALSE` a `core.mae_usuarios_sistema` y a la vista `public.v_usuarios_sistema`; sembrar `TRUE` en `admin.ggpd`, `blanca.gonzalez`, etc. *(Hecho 02-Sep: columna + índice + vista recreada + 11 usuarios con `TRUE`.)*
- [x] Completar la persistencia de `scgcc` en `saveUserToInsForge` / `updateUserPermissionsInInsForge` / mapa de lectura de SIGI para que sea un permiso de primera clase gestionado centralmente. *(Hecho 02-Sep: lectura + escritura en save/update + hashing en la RPC `hash_contrasena`.)*
- [ ] Corregir en **SCMTP**: check de `permiso_scmtp` + bug de campo `rol`/`role` + eliminación del catálogo local y del fallback genérico.
- [ ] Corregir en **SCPPE**: eliminar backdoor de contraseñas y el catálogo local; ampliar union type `RolUsuario`.
- [ ] **SCTIS/SCEIN:** eliminar tablas locales de usuarios y mapear `role_code` a roles internos.
- [ ] **Unificar nomenclatura** de la cuenta admin (`ggpd_admin` vs `admin.ggpd`) en todo el ecosistema.

**Medio plazo (endurecimiento de seguridad ISO 27001):**
- [x] **Hashing de contraseñas** en `password_hash` (bcrypt/argon2) en lugar de texto plano; validar con verificación segura por app en lugar de comparación literal. *(Hecho 02-Sep para `core.mae_usuarios_sistema`: 37 contraseñas hasheadas con `crypt(gen_salt('bf',10))`; verificación vía RPC `hash_contrasena`/`verificar_credencial_sistema`.)*
- [ ] Eliminar la exposición de la API key de InsForge en el frontend de SCMTP/SCPPE (mover autenticación a backend).
- [ ] Adoptar token de sesión JWT estándar compartido (SCEIN usa HMAC manual). *(SCGCC usa sesión persistida en localStorage; pendiente JWT compartido.)*

---

## 🔒 7.6. Implicancias Normativas

- **ISO 27001 (A7/IAM):** la centralización en SIGI + tabla maestra única es correcta; persisten gaps de contraseña en texto plano y permisos de SCGCC no persistidos.
- **OWASP ASVS v4.0 L2:** presentes fallas de Broken Access Control (SCMTP sin check de permiso), Broken Authentication (backdoor SCPPE) y falta de hashing de credenciales.
- **ISACA COBIT MEA02:** la bitácora ISO 27001 de SIGI es el control preventivo adecuado; requiere que todas las mutaciones de usuarios pasen por este canal único.

---

## 🛠️ 7.7. Implementación IAM Unificado — Hashing bcrypt + SCGCC contra tabla maestra (02-Sep-2026)

**Fecha:** 02 de Septiembre de 2026 · **Entorno:** opencode CLI sobre Node 20 (`PATH="/usr/bin:$PATH"`).  
**Objetivo:** que todas las apps usen la **única** tabla maestra `core.mae_usuarios_sistema` (gestionada por SIGI-REF) y eliminar las contraseñas en texto plano.

**Decisiones del usuario (confirmadas por `question`):**
1. Usar **pgcrypto `crypt()`/`gen_salt('bf')`** en Postgres para el hashing (bcrypt, prefijo `$2a$`).
2. Conectar **solo SCGCC-REF primero** como piloto.
3. Agregar columna **`permiso_scgcc`** a la tabla maestra y que **SIGI la gestione**.
4. Usar la herramienta que resulte más conveniente para backend (InsForge CLI/MCP/REST).

**Lo que se implementó y verificó contra la BD real (InsForge `ggpd-data-maestra-0002`, PostgreSQL 15.18):**
1. **Hashing bcrypt aplicado a las 37 contraseñas** de `core.mae_usuarios_sistema` en la BD: `UPDATE ... SET password_hash = crypt(..., gen_salt('bf', 10))`. Verificado: `crypt('admin2026!.', password_hash)` = true y contraseña errónea = false. **Backup en texto plano** guardado (sin versionar, es secreto) en `/tmp/opencode/passwords_backup_pre_hash.json` por si se requiere rollback.
2. **Columna `permiso_scgcc BOOLEAN DEFAULT FALSE`** + índice `idx_usuarios_permiso_scgcc` sobre la tabla maestra.
3. **Vista `public.v_usuarios_sistema` recreada** (22 columnas, incluye `permiso_scgcc`, **sin** exponer `password_hash`); `GRANT SELECT TO anon, authenticated`.
4. **RPCs creadas y probadas por REST:**
   - `public.verificar_credencial_sistema(p_identifier, p_password, p_app)` → valida `status='ACTIVO'`, check de permiso por app, verifica con `crypt()` y actualiza `ultimo_acceso`. Devuelve JSONB **sin exponer el hash**. Casos probados: login correcto, contraseña incorrecta, sin permiso para la app, usuario inexistente, usuario con mayúsculas (`Blanca.Gonzalez`).
   - `public.hash_contrasena(p_password)` → devuelve `crypt(p_password, gen_salt('bf', 10))` (`$2a$10$...`); se usará desde SIGI al crear/resetear contraseñas.
5. **`permiso_scgcc=TRUE`** otorgado a 11 usuarios (incluye `admin.ggpd`, `blanca.gonzalez`, gerentes y analistas/operador).
6. **SCGCC-REF rehecho para autenticar contra la tabla maestra:** se agregó `autenticarCredencialesInsForge()` en `insforgeService.ts` (llama a la RPC por `POST /api/database/rpc/verificar_credencial_sistema`); `authContext.tsx` ahora mapea `full_name→nombre`, `role_code→rol`, `unidad_organizativa→dependencia`, `permiso_scgcc→permisoScgcc` y expone `loginError`; `LoginForm.tsx` muestra `authError || loginError`. Compila (`tsc --noEmit` y `vite build`, 1606 módulos) con **0 errores**. *Corrige el incidente de "Carlos Reyes" y el de Blanca al no persistir la sesión de forma ajena.*
7. **SIGI-REF:** mapeo de lectura `scgcc = permiso_scgcc` agregado en `mapInsForgeToInstitutionalUser` de `userService.ts`. **Además (02-Sep, completado):** se **persiste `permiso_scgcc`** en `saveUserToInsForge`/`updateUserPermissionsInInsForge`; las contraseñas se **hashean con la RPC `public.hash_contrasena()`** al crear/editar (y también el fallback de creación `Corpoelec2026!.`); y `authenticateWithInsForge` **ya no compara hash en texto plano** sino que valida vía la RPC `public.verificar_credencial_sistema` (`p_app='SIGI'`, verificación bcrypt + permiso de app). SIGI-REF compila (`tsc --noEmit` EXIT 0) y `vite build` EXIT 0.
8. **Migración versionada** `sql/05_iam_seguridad_credenciales_permiso_scgcc.sql` (secciones 1-4 aplicadas; sección 5 retractada por divergencia real de la BD — ver abajo).

**Obstáculos / causas raíz de esta sesión:**
1. **⚠ Trabajo perdido por cierre de terminal:** la sesión anterior se cerró sin documentar; todo el progreso IAM se reconstruyó desde cero y ahora se registra en este `.MD` y en `handoff.md` para evitar repetir pérdidas.
2. **Node 24 rompe `npx @insforge/cli`** con `Class extends value undefined is not a constructor or null` (bug de npm 11.19 / `minipass-flush`). **Workaround:** prepend Node 20: `PATH="/usr/bin:$PATH" npx -y @insforge/cli ...` (node v20.19.2). Se encapsuló en el wrapper `/tmp/opencode/ifc.sh`.
3. **Divergencia entre el SQL versionado y la BD real:** el archivo `sql/04_scgcc_schema_correspondencia.sql` describe una vista `v_scgcc_correspondencias_activas` con JOIN a la tabla maestra, RLS y `nombre`/`rol`, pero la **BD real no tiene RLS, solo 2 tablas y una vista sin ese JOIN** (por eso se retractó la sección 5 del migration aplicado).
4. **La tabla maestra no tenía RLS** y las tablas SCGCC lo tenían deshabilitado; **el buscador REST** `GET /api/database/records/<table>` solo aplica a tablas (no a `/rpc` ni `/api/database/sql`, que no funcionan), y `Accept-Profile: core` es imprescindible para esquema `core`.
5. El **instalador MCP de InsForge sobrescribió `AGENTS.md`**; se restauró con `git checkout` y se re-añadió una sección consolidada entre `<!-- INSFORGE:START/END -->`.

**Pendiente inmediato (ver handoff.md para retomar si se cierra la terminal):**
- ~~Persistir `permiso_scgcc` en `saveUserToInsForge`/`updateUserPermissionsInInsForge` de `SIGI-REF/src/services/userService.ts` y usar la RPC `hash_contrasena` al escribir `password_hash` (hoy guarda texto plano al crear/editar).~~ **RESUELTO 02-Sep:** ya se persiste `permiso_scgcc`, las contraseñas se hashean con `hash_contrasena`, y `authenticateWithInsForge` valida vía RPC `verificar_credencial_sistema` (antes comparaba el hash en texto plano, lo que habría roto el login tras el hashing). SIGI-REF compilado con `tsc --noEmit` + `vite build` (0 errores).
- (Siguiente alcance a decidir) Desplegar SIGI/SCGCC con el IAM hasheado a VibeHost, migrar SCMTP/SCPPE/SCEIN/SCTIS a la tabla maestra con el mismo patrón RPC, y purgar restos de catálogos locales.
