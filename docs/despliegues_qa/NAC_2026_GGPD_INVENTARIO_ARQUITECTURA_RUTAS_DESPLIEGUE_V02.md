# INFORME TÉCNICO DE INVENTARIO, RUTAS DE DESPLIEGUE, REPOSITORIOS Y CUENTAS INSTITUCIONALES (REPOSITORIO MAESTRO DE DISTRIBUCIÓN)

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_INVENTARIO_ARQUITECTURA_RUTAS_DESPLIEGUE_V02.md`
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.1 ISO)
**FECHA DE EMISIÓN:** 12 de Octubre de 2026
**ENTIDAD:** Corporación Eléctrica Nacional S.A. (CORPOELEC) — Ministerio del Poder Popular para la Energía Eléctrica (MPPEE)
**DESPACHO DESTINO:** Gerencia General de Planificación de Distribución (GGPD)
**DIRIGIDO A:** Coordinación General de Área | Jefatura de Planificación de Distribución | Líderes de QA | ATIT (Postura de Seguridad)
**ELABORADO POR:** Yvan Cipiran | T.S.U. Josue Pacheco — Equipo de Automatización e Ingeniería de Productos con IA, de Planificación de Distribución
**MARCOS NORMATIVOS:** ISO 8000-110 | ISO/IEC 27001:2022 | ISO 9001:2015 | ISO 55000/55001 | ISACA COBIT 2019

---

## 1. RESUMEN EJECUTIVO Y AUDITORÍA DE INFRAESTRUCTURA EN LA NUBE

Este documento reemplaza y actualiza la **Versión V01** (10 de Agosto de 2026): la plataforma de despliegue institucional **migró de Vercel/Google AI Studio a VibeHost** (`workspace corporativo "corpoelec-ggpd-hosting-apps"`), por lo que las rutas históricas (`*.vercel.app` / `*.ai.studio`) **dejaron de ser las rutas oficiales**.

**Estado actual (verificado el 12-10-2026):**
* **Plataforma de despliegue:** VibeHost — 8 aplicaciones en el workspace `corpoelec-ggpd-hosting-apps`.
* **Backend de datos unificado:** InsForge `ggpd-data-maestra-0002` (`https://wxkeqf37.ap-southeast.insforge.app`) — PostgreSQL serverless con IAM central (`core.mae_usuarios_sistema`) y Row Level Security.
* **Verificación de rutas:** **8/8 URLs responden HTTP 200** con HTTPS y CSP presente.
* **Seguridad:** clave de servicio (`BYPASSRLS`) rotada el 12-10-2026 (gracia 72 h); dos aplicaciones (SIGAD y SIGA-SEN) con **blindaje integral** (ver `NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01.md`).

> ⚠️ **Nota de seguridad documental (mejora sobre la V01):** este inventario **no** incluye contraseñas en texto plano. Las credenciales se gestionan de forma centralizada en el IAM (tabla `core.mae_usuarios_sistema`, hashes bcrypt) y se entregan bajo clasificación CONFIDENCIAL por canal institucional seguro.

---

## 2. MATRIZ TÉCNICA GENERAL DE ARQUITECTURA Y DESPLIEGUE (8 APLICACIONES)

| # | Aplicación | Código / Subdirectorio | Puerto Local | URL Oficial (VibeHost) | App ID VibeHost | Backend de Datos | Fase |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| 1 | **SIGI** (Consola Central) | `apps/corpoelec-sigi-gestion-planificacion-distribucion` · `SIGI-REF` | 3001 | https://corpoelec-sigi-corpoelec-ggpd-hosting-apps.vibehost.space | `a53r8tvlvt9ihw09maca8a2g` | InsForge `ggpd-data-maestra-0002` (+ BCI aparte `jd3uejbz`, `VITE_BCI_API_KEY`) | QA |
| 2 | **SCTIS** (Tiras de Interrupción) | `apps/sctis-v-2.0-distribucion` · `SCTIS-REF` | 3002 | https://corpoelec-sctis-corpoelec-ggpd-hosting-apps.vibehost.space | `yq94rtmw5enw9bual08l0p3u` | InsForge `ggpd-data-maestra-0002` (+ backend Python) | QA |
| 3 | **SCMTP** (Minutas y Tareas) | `apps/corpoelec---gestor-de-tareas-y-minutas` · `SCMTP-REF` | 3003 | https://corpoelec-scmtp-corpoelec-ggpd-hosting-apps.vibehost.space | `xon0wv9a3s45vomgd22w8kp3` | InsForge `ggpd-data-maestra-0002` | QA |
| 4 | **SCPPE** (Planificación SEN) | `apps/planificación-eléctrica-sen` · `SCPPE-REF` | 3004 | https://corpoelec-scppe-corpoelec-ggpd-hosting-apps.vibehost.space | `c947eg8pgpux8vffy0bjt7ms` | InsForge `ggpd-data-maestra-0002` | QA |
| 5 | **SCEIN** (Equipos Indisponibles) | `apps/remix-scein-...` · `SCEIN-REF` | 3005 | https://corpoelec-scein-corpoelec-ggpd-hosting-apps.vibehost.space | `pqb1ryl1s59ner372rbmf559` | InsForge `ggpd-data-maestra-0002` | QA |
| 6 | **SCGCC** (Correspondencia) | `apps-refactorizadas/SCGCC-REF` | 3006 | https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space | `hrxha775a7btx7k1r3t3p2g2` | InsForge `ggpd-data-maestra-0002` | QA |
| 7 | **SIGAD** (Activos de Distribución) | `apps/remix-scein-...` → `apps-refactorizadas/SIGAD-REF` | 3007 | https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space | `cs8p93iobf180xhva11c50bv` | InsForge `ggpd-data-maestra-0002` · Postgres local (`cnd_sen_unifilar_2025`) | 🟢 **Prioridad Nacional** |
| 8 | **SIGA-SEN** (Activos del SEN) | `apps-refactorizadas/SIGA-SEN-REF` | 3008 | https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space | `llq2cjhgi5a5kibi91nbjsm2` | InsForge `ggpd-data-maestra-0002` · Postgres local (`cnd_sen_unifilar_2025`) | 🟢 **Prioridad Nacional** |

**Plantilla de URL oficial (patrón VibeHost):** `https://<nombre-app>-corpoelec-ggpd-hosting-apps.vibehost.space`

---

## 3. FICHA TÉCNICA DETALLADA POR APLICACIÓN

> Fichas resumidas a propósito: la gobernanza funcional y de seguridad de cada app vive en sus instructivos y reportes específicos (Sección 6).

### 3.1. SIGI — Consola Central de Gestión y Planificación de Distribución
* **Subdirectorio:** `apps/corpoelec-sigi-gestion-planificacion-distribucion` / `apps-refactorizadas/SIGI-REF`
* **URL Oficial:** https://corpoelec-sigi-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3001`
* **App ID VibeHost:** `a53r8tvlvt9ihw09maca8a2g`
* **Integraciones:** InsForge `ggpd-data-maestra-0002` · BCI (proyecto aparte `jd3uejbz`, clave `VITE_BCI_API_KEY` no afectada por la rotación).
* **Seguridad:** rotación de clave aplicada (bundle sin clave de servicio). Fase **QA**.

### 3.2. SCTIS — Seguimiento y Control de Tiras de Interrupción de Distribución
* **Subdirectorio:** `apps/sctis-v-2.0-distribucion` / `apps-refactorizadas/SCTIS-REF`
* **URL Oficial:** https://corpoelec-sctis-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3002`
* **App ID VibeHost:** `yq94rtmw5enw9bual08l0p3u`
* **Configuración de clave:** el frontend **no embebe ninguna clave** (la configura el usuario vía `localStorage` — `corpoelec_sctis_insforge_config`).
* **⚠️ Pendiente:** el **backend Python** debe apuntar a la clave nueva de InsForge **antes del 2026-10-15T22:01Z** (expiración de la clave anterior por rotación).

### 3.3. SCMTP / SGTA — Gestor de Tareas y Minutas
* **Subdirectorio:** `apps/corpoelec---gestor-de-tareas-y-minutas` / `apps-refactorizadas/SCMTP-REF`
* **URL Oficial:** https://corpoelec-scmtp-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3003`
* **App ID VibeHost:** `xon0wv9a3s45vomgd22w8kp3`
* **Seguridad:** rotación de clave aplicada. Fase **QA**.

### 3.4. SCPPE — Planificación Eléctrica SEN (Viáticos / SAMC)
* **Subdirectorio:** `apps/planificación-eléctrica-sen` / `apps-refactorizadas/SCPPE-REF`
* **URL Oficial:** https://corpoelec-scppe-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3004`
* **App ID VibeHost:** `c947eg8pgpux8vffy0bjt7ms`
* **Seguridad:** rotación de clave aplicada. Fase **QA**.

### 3.5. SCEIN — Seguimiento y Control de Equipos Indisponibles de Subestaciones
* **Subdirectorio:** `apps/remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec` / `apps-refactorizadas/SCEIN-REF`
* **URL Oficial:** https://corpoelec-scein-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3005`
* **App ID VibeHost:** `pqb1ryl1s59ner372rbmf559`
* **Seguridad:** rotación de clave aplicada. Fase **QA**.

### 3.6. SCGCC — Gestión de Correspondencia Corporativa
* **Subdirectorio:** `apps-refactorizadas/SCGCC-REF`
* **URL Oficial:** https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3006`
* **App ID VibeHost:** `hrxha775a7btx7k1r3t3p2g2`
* **Seguridad:** rotación de clave aplicada. Fase **QA**.

### 3.7. SIGAD — Sistema Integrado de Gestión de Activos de Distribución 🟢
* **Subdirectorio:** `apps-refactorizadas/SIGAD-REF`
* **URL Oficial:** https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3007`
* **App ID VibeHost:** `cs8p93iobf180xhva11c50bv`
* **Datos:** InsForge `ggpd-data-maestra-0002` (esquema `core`) · PostgreSQL local `cnd_sen_unifilar_2025` (contingencia via puente `5431`).
* **Seguridad:** **blindaje integral** (IAM central, RLS 13/13, CSP, `ANON_KEY`, sesión segura). Ver reporte insignia.

### 3.8. SIGA-SEN — Sistema Integrado de Gestión de Activos del SEN 🟢
* **Subdirectorio:** `apps-refactorizadas/SIGA-SEN-REF`
* **URL Oficial:** https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space · Puerto local `3008`
* **App ID VibeHost:** `llq2cjhgi5a5kibi91nbjsm2`
* **Datos:** InsForge `ggpd-data-maestra-0002` (esquema `sigad_sen`) · PostgreSQL local `cnd_sen_unifilar_2025` (contingencia via puente `5431`).
* **Seguridad:** **blindaje integral**. Ver reporte insignia.

---

## 4. REPOSITORIOS Y CUENTAS INSTITUCIONALES

| Recurso | Detalle |
| :--- | :--- |
| **Repositorio Maestro (Remoto Personal)** | `https://github.com/skidrowkodex-wq/ggpd_repositorio_maestro.git` |
| **Repositorio Maestro (Remoto Institucional)** | `https://github.com/distribucion-corpoelec-automatizacion/corpoelec-sigi-gestion-planificacion-distribucion.git` |
| **Workspace VibeHost** | `corpoelec-ggpd-hosting-apps` (ID `tao59mlv54m5mo1fclakvldq`) |
| **Cuenta VibeHost / PAT** | `bk.ggpd.corpoelec@gmail.com` — token `VIBEHOST_TOKEN` en `.env.local` (gitignored) |
| **Backend InsForge** | Proyecto `ggpd-data-maestra-0002` · API `https://wxkeqf37.ap-southeast.insforge.app` |
| **IAM Central** | `core.mae_usuarios_sistema` — 38 cuentas (hashes bcrypt) · RPC `verificar_credencial_sistema` |

---

## 5. VERIFICACIÓN DE DESPLIEGUE (12-10-2026)

* **HTTP:** 8/8 URLs oficiales → **HTTP 200** con HTTPS y Content-Security-Policy presente.
* **Bundles:** SIGAD y SIGA-SEN sin clave de servicio (solo `ANON_KEY`); SCTIS sin assets JS embebidos (config por `localStorage`).
* **Login:** pruebas RPC reales `success=true` (SIGI y SIGAD) para el personal autorizado, incluidos los dos Ingenieros Gerentes incorporados en esta fase.
* **Firma de Integridad:** verificación de los bundles en `dist/assets/` al momento de cada despliegue.

---

## 6. DOCUMENTACIÓN RELACIONADA

| Documento | Propósito |
| :--- | :--- |
| `NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01.md` | Reporte técnico de blindaje (ATIT) — prioridad nacional |
| `NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01.md` | Postura de seguridad consolidada de las 8 apps |
| `NAC_2026_GGPD_GUIA_SEGURIDAD_DECISORES_V01.md` | Guía pedagógica para decisores (no técnicos) |
| `NAC_2026_GGPD_INS_OPERATIVO_SIGAD_V01.md` · `..._SIGA_SEN_V01.md` | Instructivos operativos con rutas de acceso |
| `NAC_2026_GGPD_MATRIZ_ACCESOS_IAM_37_USUARIOS_V01.md` | Matriz de accesos (actualizar a 38) |

---

*Fin del documento — NAC_2026_GGPD_INVENTARIO_ARQUITECTURA_RUTAS_DESPLIEGUE_V02 · Rev. 1 · 2026-10-12 · GGPD.*