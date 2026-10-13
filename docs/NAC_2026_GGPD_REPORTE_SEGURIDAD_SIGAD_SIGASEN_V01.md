# REPÚBLICA BOLIVARIANA DE VENEZUELA
# MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE)
# CORPORACIÓN ELÉCTRICA NACIONAL, S.A. (CORPOELEC)
## GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)

---

```text
====================================================================================================
REPORTE TÉCNICO DE SEGURIDAD Y BLINDAJE DE GRADO INDUSTRIAL (SIGAD v1.0 · SIGA-SEN v1.0)
====================================================================================================
CÓDIGO INSTITUCIONAL : GGPD-SGM-RSE-001 (v1.0 ISO)
NOMENCLATURA ARCHIVO : NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01.md
CÓDIGO DOCUMENTAL    : DOC-GGPD-2026-SEC-SIGAD-SIGASEN-001
APLICACIONES CUBIERTAS: SIGAD v1.0 (Puerto 3007) · SIGA-SEN v1.0 (Puerto 3008) — Prioridad Nacional
BACKEND / DATOS      : InsForge `ggpd-data-maestra-0002` (PostgreSQL serverless) + puente local 5431
CLASIFICACIÓN        : CONFIDENCIAL · Uso restringido (ATIT, Auditoría, GGPD)
AUTOR / ELABORACIÓN  : Equipo de Automatización, Analítica de Datos e Inteligencia Artificial (GGPD)
EN COLABORACIÓN CON  : Equipo de Seguridad de la Información (perímetro IAM) · VibeHost Cloud
DIRIGIDO A           : ATIT Corporativo | Auditores Internos | Coordinación de Ciberseguridad
MARCO NORMATIVO      : ISO/IEC 27001:2022 · ISO 8000-110 · ISO 55000/55001 · ISO 9001:2015
                       OWASP ASVS v4.0 (Nivel 2) · OWASP Top 10 · ISACA COBIT 2019 (MEA02)
FECHA DE EMISIÓN     : 12 de Octubre de 2026
ESTADO DE APLICACIÓN : Vigente · Instrumento Técnico de Evidencia para Auditoría y Pruebas
====================================================================================================
```

---

## 📋 1. IDENTIFICACIÓN Y CONTROL DEL DOCUMENTO

| Parámetro Institucional | Especificación Técnica y Normativa |
| :--- | :--- |
| **Organización Emisora:** | Corporación Eléctrica Nacional, S.A. (CORPOELEC) |
| **Órgano Rector / Adscripción:** | Ministerio del Poder Popular para la Energía Eléctrica (MPPEE) |
| **Gerencia Responsable:** | Gerencia General de Planificación de Distribución (GGPD) |
| **Título del Instrumento:** | **Reporte Técnico de Seguridad, Control y Blindaje de Grado Industrial de los Sistemas SIGAD v1.0 y SIGA-SEN v1.0** |
| **Naturaleza del Documento:** | **Evidencia técnica de seguridad de la información** conforme a los controles de ISO/IEC 27001:2022 (Anexo A) y OWASP ASVS v4.0 Level 2. Documenta la arquitectura de seguridad implementada, las pruebas de verificación ejecutadas, los riesgos residuales y la hoja de ruta de aseguramiento continuo (incluida la propuesta de prueba de penetración independiente). |
| **Clasificación de Confidencialidad:** | **CONFIDENCIAL** — circulación restringida a ATIT Corporativo, Auditoría Interna y la GGPD. **No** contiene contraseñas, claves API ni hashes. Contiene descripción de controles y resultados de pruebas. |
| **Código Nomenclatura Oficial:** | `NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01` (Base de Codificación: `GGPD-SGM-RSE-001 v1.0 ISO`) |
| **Fecha de Aprobación:** | 12 de Octubre de 2026 |
| **Próxima Revisión Ordinaria:** | 12 de Enero de 2027 (o tras cada red de despliegue/auditoría) |
| **Aprobado y Autorizado por:** | Gerencia General de Planificación de Distribución (GGPD) |

---

## 🎯 2. OBJETIVO

El presente reporte documenta, con evidencia verificable, el **blindaje de seguridad de grado industrial** implementado en las dos aplicaciones de **Prioridad Nacional** del Repositorio Maestro de Distribución: **SIGAD v1.0** (Sistema Integrado de Gestión de Activos de Distribución) y **SIGA-SEN v1.0** (Sistema Integrado de Gestión de Activos del SEN).

El propósito es entregar a **ATIT Corporativo** y a la **Auditoría Interna** un instrumento formal que:
1. Demuestre la **arquitectura de seguridad actual** (identidad, autorización por fila, cifrado, sesión, endurecimiento de red y gestión de claves).
2. Registre las **pruebas de verificación realmente ejecutadas** (nada fabricado) y sus resultados.
3. Declare con **honestidad los riesgos residuales** y la **hoja de ruta** de aseguramiento continuo.
4. Registre que la **prueba de penetración (pentest)** fue **ejecutada y cerrada** (PENT-001/002) y conserve el **protocolo formal** para extender el alcance y ejecutar retests.

> ⚠️ **Declaración de integridad:** la matriz P1–P11 de este reporte documenta el **endurecimiento defensivo** (auditoría estática, configuración, pruebas funcionales de autenticación y comprobaciones read-only). Las **pruebas ofensivas** fueron solicitadas y autorizadas por la GGPD e **ejecutadas el 12-10-2026** bajo reglas de enfrentamiento no destructivas, en **dos ciclos**: **`NAC_2026_GGPD_PENTEST_SIGAD_SIGASEN_V01.md`** (`GGPD-SGM-PENT-001`) y **`NAC_2026_GGPD_PENTEST_SEIS_APPS_V01.md`** (`GGPD-SGM-PENT-002`), ambos **cerrados con remediación ejecutada**. Este reporte **no fabrica** evidencia: toda la contenida es real y reproducible.

---

## 🌐 3. ALCANCE Y ÁMBITO DE APLICACIÓN

* **Sistemas cubiertos:**
  1. **SIGAD v1.0** — Rutas: nube `https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space` · local `http://localhost:3007`.
  2. **SIGA-SEN v1.0** — Rutas: nube `https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space` · local `http://localhost:3008`.
* **Infraestructura de datos:** almacén maestro InsForge PostgreSQL (`ggpd-data-maestra-0002`, base `https://wxkeqf37.ap-southeast.insforge.app`) y puente local de contingencia (`127.0.0.1:5431`).
* **Perímetro cubierto por el blindaje (KPI):** autenticación (login), autorización por fila (RLS), transporte seguro (HTTPS), políticas de contenido (CSP), gestión de sesión y gestión de claves/secrets.
* **Aplicaciones complementarias:** las 6 aplicaciones restantes (SIGI, SCTIS, SCMTP, SCPPE, SCEIN, SCGCC) recibieron el **mismo blindaje el 12-10-2026** (RLS — Migración 10, autenticación por RPC central, purga de secretos) y fueron **verificadas con el pentest PENT-002**; postura consolidada en `NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01.md`.

---

## ⚖️ 4. MARCO NORMATIVO Y REFERENCIAS

1. **ISO/IEC 27001:2022** — A.5.15 (Control de accesos) · A.5.18 (Seguridad de datos) · A.8 (Gestión de activos y claves) · A.8.25-28 (Ciclo de vida seguro de desarrollo).
2. **ISO 8000-110** — Calidad de datos maestros: erradicación de duplicados (username/email únicos), tipado estricto del esquema `core.*`.
3. **ISO 55000/55001** — Trazabilidad del ciclo de vida de activos eléctricos (dato → decisión operativa).
4. **OWASP ASVS v4.0 (Nivel 2)** — Requisitos de autenticación (V2), gestión de sesión (V3), control de acceso (V4), validación de entrada (V5), seguridad de datos (V6), comunicaciones (V9) y configuración (V14).
5. **OWASP Top 10 (2021)** — A01 Broken Access Control · A02 Cryptographic Failures · A07 Identification & Auth Failures · A05 Security Misconfiguration · A06 Vulnerable Components.
6. **ISACA COBIT 2019 (MEA02)** — Supervisión de controles internos; principio de segregación de funciones; auditoría de eventos mediante triggers PostgreSQL.
7. **Gobernanza del Repositorio Maestro** — `DOC-GGPD-2026-GOB-001` (prohibición de "Super-App", flujo desacoplado `SIGI ➔ SCMTP ➔ SCGCC`).

---

## 🏰 5. ARQUITECTURA DE SEGURIDAD IMPLEMENTADA

### 5.1. Identidad y Autenticación (Capa S1 — IAM Central)

* **Fuente única de identidad:** tabla maestra `core.mae_usuarios_sistema` (38 cuentas institucionales, hashes **bcrypt**, identificadores únicos `username`/`email`).
* **Verificación de credenciales server-side:** RPC `public.verificar_credencial_sistema(identificador, contraseña, app)` **fail-closed**:
  * `v_permiso := FALSE` por defecto; se otorga **solo** si la rama `SIGAD` o `SIGA-SEN` coincide con la app solicitada y el usuario está ACTIVO.
  * App desconocida o sin permiso → **denegado**. Contraseña errónea → *"Contraseña incorrecta."* Usuario inexistente → *"Usuario, correo institucional o cédula no encontrado."*
* **Roles y permisos:** mapeo institucional `role_code → rol de dominio` (`ADMINISTRADOR|GERENCIA → ADMIN_NACIONAL`, `AUDITOR → AUDITOR`, resto → `ANALISTA_ESTATAL`); `estado_codigo` → `state_code`. Cada transacción de mutación queda vinculada al identificador único del funcionario (responsabilidad civil y técnica en el SEN).
* **Eliminado el bypass SSO:** se eliminó el acceso por `?sso=true&user=<username>`; no existen usuarios predefinidos ni tarjetas "Perfiles IAM" en el formulario.

### 5.2. Autorización por Fila — Row Level Security (Capa S2)

* **RLS habilitado en 13/13 tablas**: esquema `sigad` (3 tablas) y `sigad_sen` (10 tablas base).
* **Políticas para el rol público (`anon`):** `FOR ALL TO anon USING(true) WITH CHECK(true)` sobre las tablas operativas, **más** `GRANT USAGE ON SCHEMA core` y `GRANT SELECT` sobre los catálogos `core.mae_subestaciones` / `core.mae_circuitos` (datos necesarios para el render de los tableros).
* **Vistas federadas:** los 4 views derivados operan como *security definer* (heredan el permiso del definidor), evitando exponer la lógica de unión.
* **Alcance deliberadamente acotado del rol `anon`:** puede **leer** `sigad`, `sigad_sen` y 2 catálogos de `core`. **NO** puede leer `core.mae_usuarios_sistema` (hashes bcrypt). Verificado: `permission denied for table mae_usuarios_sistema` (HTTP 401).

### 5.3. Criptografía y Transporte (Capa S3)

* **HTTPS obligatorio** en las 8 URLs desplegadas (VibeHost, verificado HTTP 200).
* **Claves API:** el bundle del navegador solo contiene la **clave pública `ANON_KEY`** (rol `anon`, sin privilegios administrativos). La **clave de servicio** (rol `project_admin` con `rolbypassrls = true`) fue **eliminada de los bundles** — verificación en `dist/assets/*.js`: clave de servicio **ausente**, clave anónima **presente**.
* **Rotación de la API key principal (2 ciclos, 12-10-2026):** (1.º) tras el pentest de SIGAD/SIGA-SEN, clave anterior con gracia hasta el 2026-10-15T22:01Z; (2.º) tras el pentest de las 6 apps restantes (`secrets rotate api-key --grace-hours 72`), al detectarse la clave `ik_985b…` embebida en bundles — clave nueva activa; la anterior expira el **2026-10-15T23:45:36Z** (cero caídas por superposición). Los bundles de las 8 apps quedaron reconstruidos con la `ANON_KEY` pública.

### 5.4. Gestión de Sesión (Capa S4)

* **Sesión en `sessionStorage`**: la sesión muere al cerrar la pestaña del navegador (no persiste como `localStorage`); validación de forma (estructura y firma de campos) al rehidratar.
* **Cierre de sesión (logout)** limpia los parámetros SSO residuales de la URL.
* **Aviso de sesión auditada** bajo ISO/IEC 27001 en la pantalla de login; alternancia de visibilidad de la contraseña (ojo); bloqueo tras intentos fallidos según política.

### 5.5. Endurecimiento Web y de Red (Capa S5)

* **Content Security Policy (CSP)** vía `<meta>` en `index.html` de ambas apps:
  * `default-src 'self'` · `script-src 'self'` · `object-src 'none'` · `frame-src 'none'` (bloquea iframes/scripts externos maliciosos).
  * `connect-src` limitado al origen InsForge + puente local.
  * `style-src` con Google Fonts; `referrer-policy` reforzada.
  * **Nota de honestidad (actualizada 12-10-2026):** `frame-ancestors` / `X-Frame-Options` requieren **cabecera HTTP** (no válidos en `<meta>`) — **verificadas presentes a nivel hosting** (Cloudflare) en el pentest: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, HSTS (1 año) y CSP header. El `frame-ancestors` del header admite `dock.gntc.com` (consola VibeHost) — pendiente validar necesidad.
* **Endurecimiento del puente local de contingencia** (`scripts/local_pg_bridge.py`): CORS restringido a `localhost|127.0.0.1|::1`, validación obligatoria de `apikey`/`Authorization: Bearer`, `rawsql` deshabilitado por defecto (y de solo lectura si se habilita), whitelist de RPC (`verificar_credencial_sistema`).
* **Higiene de código:** sin `eval`, sin `innerHTML`, sin `dangerouslySetInnerHTML`, sin concatenación SQL en cliente; `npm audit` = **0 vulnerabilidades** en el momento de la verificación.

### 5.6. Gestión de Claves y Secretos (Capa S6)

* Claves en `.env` locales **gitignored** (nunca versionadas); el `.insforge/project.json` contiene la clave de la CLI (gitignored).
* En `opencode.json` permanece una clave **ya muerta** (gitignored) pendiente de depuración — registrada como limpieza recomendada.
* **Recomendación abierta:** rotación de los PAT de GitHub (`GITHUB_TOKEN_PERSONAL` / `GITHUB_TOKEN_INNOVACION`) por exposición en registros de sesión (ver Riesgos Residuales).

---

## 🔬 6. MATRIZ DE PRUEBAS DE SEGURIDAD EJECUTADAS

| # | Prueba / Verificación | Tipo | Método | Resultado | Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| P1 | Disponibilidad y cifrado de las 8 URLs desplegadas | No invasiva | `HEAD/GET` HTTPS | **8/8 HTTP 200** | Cabeceras CSP presentes |
| P2 | Ausencia de clave de servicio (BYPASSRLS) en bundles | Estática | Inspección de `dist/assets/*.js` | **PASA** — clave de servicio ausente; `ANON_KEY` presente | SIGAD `index-*.js`, SIGA-SEN `index-*.js` |
| P3 | RLS: rol `anon` lee datos operativos (`sigad`, `sigad_sen`) | Read-only | Consultas con clave pública | **PASA** — 871 subestaciones / 1.000 circuitos (SIGAD); 532 nodos / 1.000 líneas (SIGA-SEN) | Respuestas JSON 200 |
| P4 | RLS: rol `anon` **no** accede a `core.mae_usuarios_sistema` | Read-only | Consulta con clave pública | **PASA** — `permission denied for table mae_usuarios_sistema` (HTTP 401) | Log de error 401 |
| P5 | Autenticación real por RPC (`verificar_credencial_sistema`) | Funcional | Login contra IAM en la nube | **PASA** — `success=true` (ADMINISTRADOR) para múltiples cuentas; usuarios nuevos validados | Registro de pruebas 4/4 |
| P6 | Contraseña incorrecta | Funcional | Login con contraseña errónea | **PASA** — *"Contraseña incorrecta."* (denegado) | Log RPC |
| P7 | App sin permiso / desconocida | Funcional | RPC con app inválida | **PASA** — denegado (fail-closed) | Log RPC |
| P8 | Escritura sin persistir datos | No destructiva | `INSERT` con `id=null` · `PATCH` sin coincidencias | **PASA** — 400 (no 401/403) y 204; **0 filas creadas** | Respuestas HTTP |
| P9 | Conexión del navegador al backend real | Funcional | Carga de tablero en despliegue | **PASA** — badge `INSFORGE CLOUD: ggpd-data-maestra-0002 · ONLINE`; **0 errores de consola** | Consola del navegador |
| P10 | Auditoría de dependencias | Estática | `npm audit` | **PASA** — 0 vulnerabilidades | Reporte npm |
| P11 | Higiene de código (XSS por DOM) | Estática | Escaneo de patrones | **PASA** — sin `eval`/`innerHTML`/`dangerouslySetInnerHTML` | Revisión de código |

> **Interpretación honesta:** P1–P11 demuestran endurecimiento defensivo y funcionamiento correcto de los controles. **Ambos ciclos ofensivos (PENT-001 y PENT-002) fueron ejecutados el 12-10-2026** bajo autorización y RoE no destructivas: véanse `NAC_2026_GGPD_PENTEST_SIGAD_SIGASEN_V01.md` y `NAC_2026_GGPD_PENTEST_SEIS_APPS_V01.md`. La Sección 9 conserva el protocolo estándar para **extender** el pentest (backend SCTIS, cuentas desechables para bloqueo, retest).

---

## 📊 7. RESULTADOS Y ESTADO DE MADUREZ

| Control ISO/IEC 27001 | Estado | Medio de verificación |
| :--- | :--- | :--- |
| A.5.15 · Control de accesos | ✅ Implementado | IAM central + RPC fail-closed + roles por app |
| A.5.18 · Seguridad de datos | ✅ Implementado | RLS 13/13 tablas + `anon` acotado a `sigad`/`sigad_sen` + 2 catálogos |
| A.8.24 · Uso de criptografía | ✅ Implementado | HTTPS + rotación de claves (gracia 72 h) |
| A.8.25-28 · Desarrollo seguro | ✅ Implementado | CSP, sin XSS por DOM, 0 vulns npm; pentest ejecutado (PENT-001/002) y cerrado (Secc. 9) |
| A.8.12/13 · Gestión de claves | ✅ Implementado | Claves solo en `.env` gitignored; bundle con `ANON_KEY` |
| A.5.31 · Seguridad física de sitios | ⚠️ Externo | Depende de VibeHost / datacenter contratado (fuera de alcance GGPD) |

**Madurez declarada:** **Nivel 2 — Controlado** (OWASP ASVS v4.0 Level 2 alcanzado en autenticación, sesión, control de acceso, validación y configuración) en las **8 aplicaciones** del Repositorio. Controles pendientes de entornos externos: cabeceras CORS a nivel InsForge (H-PT-01) y rotación de la clave del proyecto BCI (H-PT-07).

---

## ⚠️ 8. RIESGOS RESIDUALES Y LIMITACIONES

1. **Autenticación de sesión aún de cliente (R1, MEDIO):** la autorización entre app-desplegada y backend usa la clave pública compartida; no se emite aún un **JWT de plataforma (InsForge Auth) por sesión** con políticas RLS por *claim* de usuario. Remediable con `auth.users` + emisión de token por sesión (trabajo futuro — ver Sección 9).
2. **Pentest ejecutado (R2, RESUELTO 12-10-2026):** dos ciclos autorizados y no destructivos (PENT-001 SIGAD/SIGA-SEN y PENT-002 seis apps restantes), ambos **cerrados con remediación**. Residuales: CORS reflectante (H-PT-01, requiere configuración en InsForge) y clave del proyecto BCI (H-PT-07, tercero).
3. **Tokens PAT de GitHub expuestos en registros (R3, ALTO):** durante inspección de `.env.local`, una máscara falló y los PAT quedaron visibles en un registro de sesión. **Acción recomendada:** revocar y regenerar con scope `repo`, actualizar `.env.local`.
4. **Cabeceras HTTP anti-embebido (R4, RESUELTO 12-10-2026):** verificadas presentes a nivel hosting (Cloudflare) durante el pentest: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, HSTS y CSP header. Pendiente menor: validar si `frame-ancestors` debe conservar los orígenes `dock.gntc.com` de la consola VibeHost.
5. **Dependencia del proveedor cloud (R5, EXTERNO):** disponibilidad y cifrado dependen de la infraestructura contratada (VibeHost) y de InsForge (back-end serverless). Gestión de incidentes según contrato.
6. **SCTIS backend Python (R6, EXTERNO):** si el backend Python de SCTIS corre fuera de VibeHost, debe apuntar a la clave nueva **antes del 2026-10-15T23:45:36Z** (fin de la gracia de la 2.ª rotación). Conserva endurecimiento pendiente (`config.py`, `auth.py`, `db.py`) documentado en el PENT-002.

---

## 🗺️ 9. HOJA DE RUTA DE ASEGURAMIENTO CONTINUO

### 9.1. Próximas entregas (0–6 meses)
1. **JWT de sesión (remediación R1):** integración con InsForge Auth (`auth.users`), emisión de token por sesión y políticas RLS por claim.
2. **Cabeceras HTTP a nivel hosting (R4):** solicitar/setear `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` en VibeHost.
3. **Rotación de PAT GitHub (R3):** revocar y regenerar; limpiar `opencode.json`.
4. **Monitoreo continuo:** revisión de logs de acceso en InsForge y alertas de eventos (COBIT MEA02) mediante triggers.
5. **Rotación de la clave del proyecto BCI (R7, tercero):** la instancia de la Base de Conocimiento Inteligente (`jd3uejbz`) tuvo una clave embebida en SIGI (H-PT-07); coordinar su rotación con el propietario del proyecto.

### 9.2. Protocolo de Pentest Independiente (estado: PRIMER CICLO EJECUTADO — 12-10-2026)

> **Dos ciclos de pentest fueron ejecutados y autorizados por la GGPD** el 12-10-2026 (no destructivos, vector externo): **PENT-001** (SIGAD/SIGA-SEN, H-PT-01…H-PT-05) y **PENT-002** (las 6 apps restantes, H-PT-06…H-PT-12). Ambos **cerrados con remediación ejecutada** (RLS, autenticación RPC central, purga de secretos y rotación de la clave de servicio). El protocolo estándar siguiente rige para **extender** el alcance (backend SCTIS, cuentas desechables para bloqueo, retests):

| Parámetro | Propuesta |
| :--- | :--- |
| **Alcance** | SIGAD y SIGA-SEN (nubes + RPC de autenticación) |
| **Perfiles** | Anónimo externo y autenticado (bajo autorización escrita) |
| **Metodología** | OWASP ASVS v4.0 Level 2 + OWASP Top 10 2021 |
| **Reglas de enfrentamiento (RoE)** | Prohibido: inyección/corrupción de datos maestros, DoS, exfiltración, pruebas destructivas sobre datos reales. Pruebas destructivas → entorno de réplica aislado. |
| **Ventana** | A coordinar (fuera de horario de salas operativas) |
| **Entregable** | Informe con hallazgos calificados **CVSS v3.1**, plan de remediación y retest |
| **Ejecutor** | Equipo externo acreditado o ATIT (bajo acuerdo de confidencialidad) |

---

## 🇻🇪 10. VALOR ESTRATÉGICO NACIONAL

SIGAD y SIGA-SEN constituyen la **plataforma de mayor valor estratégico del Repositorio Maestro**: consolidan la **fuente única de verdad del SEN** (871 nodos de transformación, 4.207 circuitos de distribución, 562 nodos de subestación CND, 649 barras, 2.506 tramos de líneas), alimentan las **salas técnicas y situacionales de las 24 entidades federales** y proyectan la **capacidad institucional de desarrollo con Inteligencia Artificial** (*Antigravity / Gemini Flash*) para software de alto valor nacional.

Su blindaje de seguridad — documentado en este reporte — es la **condición habilitante** para su institucionalización en las salas del SEN y para responder con integridad a cualquier requerimiento de auditoría, incluida una prueba de penetración formal. Adicionalmente, en esta fase se **incorporaron al IAM central dos Ingenieros Gerentes de Gestión de Planificación de Distribución** (perfil `ADMINISTRADOR`, acceso total verificado), fortaleciendo la gobernanza de acceso de la plataforma.

---

## 📖 11. GLOSARIO

* **RLS (Row Level Security):** control de base de datos que restringe la visibilidad/modificación de filas según el rol del solicitante.
* **ANON_KEY:** clave pública del proyecto (rol `anon`, sin privilegios administrativos); lo único que embebe el navegador.
* **BYPASSRLS:** privilegio de la clave de servicio que eludía el RLS; fue **eliminado del bundle**.
* **Fail-closed:** comportamiento por defecto seguro: ante la duda o error, se niega el acceso.
* **CSP (Content Security Policy):** política que restringe qué orígenes pueden cargar scripts/estilos/recursos en la página.
* **RPC:** procedimiento almacenado ejecutado en el servidor de base de datos (aquí, verificación de credenciales).
* **sessionStorage:** almacenamiento de sesión del navegador que se limpia al cerrar la pestaña.

---

## 📎 ANEXO A — RUTAS DE ACCESO (VERIFICADAS 2026-10-12)

| Aplicación | Nube (producción) | Local (contingencia) | Backend |
| :--- | :--- | :--- | :--- |
| **SIGAD v1.0** | https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space | http://localhost:3007 | InsForge `ggpd-data-maestra-0002` |
| **SIGA-SEN v1.0** | https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space | http://localhost:3008 | InsForge `ggpd-data-maestra-0002` |

## 📎 ANEXO B — MATRIZ DE ACCESOS IAM (RESUMEN)

| Perfil IAM | Rol de Dominio | Acceso SIGAD | Acceso SIGA-SEN | Mutación |
| :--- | :--- | :--- | :--- | :--- |
| `ADMINISTRADOR` | `ADMIN_NACIONAL` | ✅ | ✅ | Sí (trazable) |
| `GERENCIA` | `ADMIN_NACIONAL` | ✅ | ✅ | Sí (trazable) |
| `AUDITOR` | `AUDITOR` | Lectura | Lectura | No |
| Analista / Operativo | `ANALISTA_ESTATAL` | Según permiso | Según permiso | Parcial |

*(Detalle nominal completo disponible en la matriz de accesos IAM — 38 cuentas — bajo clasificación CONFIDENCIAL.)*

---

*Fin del documento — NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01 · Rev. 0 · 2026-10-12 · GGPD.*