# REPÚBLICA BOLIVARIANA DE VENEZUELA
# MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE)
# CORPORACIÓN ELÉCTRICA NACIONAL, S.A. (CORPOELEC)
## GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)

---

```text
====================================================================================================
REPORTE CONSOLIDADO DE POSTURA DE SEGURIDAD DE LAS 8 APLICACIONES DEL REPOSITORIO MAESTRO
====================================================================================================
CÓDIGO INSTITUCIONAL : GGPD-SGM-RSE-002 (v1.0 ISO)
NOMENCLATURA ARCHIVO : NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01.md
CÓDIGO DOCUMENTAL    : DOC-GGPD-2026-SEC-8APPS-001
APLICACIONES CUBIERTAS: SIGI · SCTIS · SCMTP · SCPPE · SCEIN · SCGCC · SIGAD · SIGA-SEN
CLASIFICACIÓN        : CONFIDENCIAL · Uso restringido (ATIT, Auditoría, GGPD)
AUTOR / ELABORACIÓN  : Equipo de Automatización, Analítica de Datos e Inteligencia Artificial (GGPD)
DIRIGIDO A           : ATIT Corporativo | Auditores Internos | Coordinación de Ciberseguridad
MARCO NORMATIVO      : ISO/IEC 27001:2022 · ISO 8000-110 · OWASP Top 10 · ISACA COBIT 2019 (MEA02)
FECHA DE EMISIÓN     : 12 de Octubre de 2026
ESTADO DE APLICACIÓN : Vigente · Actualizado con la rotación de la API key (12-10-2026)
====================================================================================================
```

---

## 📋 1. IDENTIFICACIÓN Y CONTROL DEL DOCUMENTO

| Parámetro Institucional | Especificación Técnica y Normativa |
| :--- | :--- |
| **Organización Emisora:** | Corporación Eléctrica Nacional, S.A. (CORPOELEC) |
| **Órgano Rector / Adscripción:** | Ministerio del Poder Popular para la Energía Eléctrica (MPPEE) |
| **Gerencia Responsable:** | Gerencia General de Planificación de Distribución (GGPD) |
| **Título del Instrumento:** | **Postura de Seguridad Consolidada de las Ocho (8) Aplicaciones Institucionales desplegadas en VibeHost** |
| **Naturaleza del Documento:** | Inventario técnico de seguridad por aplicación: estado de blindaje, gestión de claves, fase de ciclo de vida (operativo/QA) y riesgos pendientes. Complementa al reporte detallado de SIGAD/SIGA-SEN (`NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01.md`). |
| **Clasificación de Confidencialidad:** | **CONFIDENCIAL** — no contiene claves API ni contraseñas. |
| **Código Nomenclatura Oficial:** | `NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01` (Base `GGPD-SGM-RSE-002 v1.0 ISO`) |
| **Fecha de Aprobación:** | 12 de Octubre de 2026 |
| **Próxima Revisión Ordinaria:** | 12 de Enero de 2027 |
| **Aprobado y Autorizado por:** | Gerencia General de Planificación de Distribución (GGPD) |

---

## 🎯 2. OBJETIVO

Documentar, de forma consolidada y honesta, la **postura de seguridad de cada una de las 8 aplicaciones** del Repositorio Maestro de Distribución desplegadas en VibeHost, diferenciando con claridad:

* Las **2 aplicaciones con blindaje integral de grado industrial** (SIGAD y SIGA-SEN — Prioridad Nacional).
* Las **6 aplicaciones en fase de QA** que ya recibieron la **rotación de la clave de servicio** (eliminando la clave con `BYPASSRLS` de sus bundles).

Esto entrega a ATIT un **mapa de madurez de seguridad** accionable y sin ambigüedades, así como los **riesgos pendientes** que el equipo ya tiene identificados y planificados.

---

## 🌐 3. MATRIZ GENERAL DE POSTURA DE SEGURIDAD POR APLICACIÓN

| # | Aplicación | Puerto | URL desplegada (VibeHost) | Blindaje integral (IAM+RLS+CSP) | Rotación de clave (sin servicio en bundle) | Fase / Observación |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| 1 | **SIGI** (Consola Central) | 3001 | https://corpoelec-sigi-corpoelec-ggpd-hosting-apps.vibehost.space | — | ✅ | **QA** · `VITE_BCI_API_KEY` (proyecto aparte `jd3uejbz`) no afectada |
| 2 | **SCTIS** (Tiras de Interrupción) | 3002 | https://corpoelec-sctis-corpoelec-ggpd-hosting-apps.vibehost.space | — | ✅ (no embebe clave; config vía `localStorage`) | **QA** · ⚠️ Backend Python pendiente de clave nueva (ver §5) |
| 3 | **SCMTP** (Minutas y Tareas) | 3003 | https://corpoelec-scmtp-corpoelec-ggpd-hosting-apps.vibehost.space | — | ✅ | **QA** |
| 4 | **SCPPE** (Planificación Eléctrica SEN) | 3004 | https://corpoelec-scppe-corpoelec-ggpd-hosting-apps.vibehost.space | — | ✅ | **QA** |
| 5 | **SCEIN** (Equipos Indisponibles) | 3005 | https://corpoelec-scein-corpoelec-ggpd-hosting-apps.vibehost.space | — | ✅ | **QA** |
| 6 | **SCGCC** (Correspondencia Corporativa) | 3006 | https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space | — | ✅ | **QA** |
| 7 | **SIGAD** (Activos de Distribución) | 3007 | https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space | ✅ **Integral** | ✅ | 🟢 **Prioridad Nacional** · reporte detallado |
| 8 | **SIGA-SEN** (Activos del SEN) | 3008 | https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space | ✅ **Integral** | ✅ | 🟢 **Prioridad Nacional** · reporte detallado |

**Verificación general:** las **8 URLs responden HTTP 200** con HTTPS y CSP presente (2026-10-12).

---

## 🔑 4. GESTIÓN DE CLAVES Y SECRETOS (COMÚN A LAS 8 APPS)

* **Rotación de la API key principal** de InsForge ejecutada el 12-10-2026 con **periodo de gracia de 72 horas** (`secrets rotate api-key --grace-hours 72`).
  * Clave nueva: activa.
  * Clave anterior: expira el **2026-10-15T22:01:33Z** (superposición = cero caídas).
* **Bundles sin clave de servicio:** las apps de frontend recompiladas y redesplegadas **no contienen** la clave `project_admin` (`BYPASSRLS`) en `dist/assets/*.js`; verificadas por inspección de bundle.
* **Variables actualizadas:** `.insforge/project.json`, `.env.local` (raíz), `.env` de cada app y `SCTIS-REF/interrupciones/.env` (backend Python).
* **Claves gitignored:** ningún `.env` ni `project.json` se versiona; solo `handoff.md` documenta el historial.

---

## ⚠️ 5. HALLAZGOS PENDIENTES Y ACCIONES CORRECTIVAS

| # | Hallazgo | Severidad | Acción | Responsable / Plazo |
| :--- | :--- | :---: | :--- | :--- |
| H1 | **Backend Python de SCTIS** debe apuntar a la clave nueva de InsForge | **ALTA** (si corre fuera de VibeHost) | Actualizar credencial antes de la expiración de la clave anterior | Equipo TI / **antes del 2026-10-15T22:01Z** |
| H2 | Las 6 apps en QA no tienen aún blindaje integral (IAM central + RLS + CSP) | MEDIA | Secuencia: elevación de SIGAD/SIGA-SEN como patrón de referencia y replicación por app | GGPD (próximas fases) |
| H3 | PAT GitHub (`GITHUB_TOKEN_PERSONAL` / `GITHUB_TOKEN_INNOVACION`) expuestos en registro de sesión por fallo de máscara | **ALTA** | Revocar y regenerar con scope `repo`; actualizar `.env.local` | Usuario titular |
| H4 | Clave muerta residual en `opencode.json` | BAJA | Depurar (gitignored) | GGPD |
| H5 | Sesión de cliente sin JWT por sesión (las 8 apps) | MEDIA | Integración InsForge Auth + RLS por claim (patrón SIGAD/SIGA-SEN) | GGPD (roadmap) |
| H6 | Cabeceras anti-embebido (`X-Frame-Options`, HSTS) a nivel hosting | BAJA | Solicitar configuración en VibeHost | GGPD + Hosting |

---

## 🗺️ 6. HOJA DE RUTA DE ELEVACIÓN DE LAS 8 APPS

1. **Fase 1 — Consolidar (completada):** rotación de clave + bundles sin clave de servicio + inventario de rutas (V02).
2. **Fase 2 — Referencia (realizada para 2):** blindaje integral de SIGAD y SIGA-SEN (IAM central, RLS, CSP, sesión segura) — **patrón de oro** para el resto.
3. **Fase 3 — Replicar (en curso de planificación):** llevar el patrón a las 6 apps en QA (SIGI, SCTIS, SCMTP, SCPPE, SCEIN, SCGCC), respetando la gobernanza `DOC-GGPD-2026-GOB-001` (flujo desacoplado `SIGI ➔ SCMTP ➔ SCGCC`, prohibición de "Super-App").
4. **Fase 4 — Pentest independiente:** bajo protocolo formal (ver reporte SIGAD/SIGA-SEN §9) una vez consolidadas las fases 2–3.

---

## 📖 7. GLOSARIO

* **Bundle:** conjunto de archivos JavaScript/HTML que el navegador descarga al abrir la aplicación.
* **Clave de servicio (`project_admin`):** credencial con privilegio `BYPASSRLS`; su presencia en el bundle expondría la base de datos a la vista del público.
* **Fase QA:** aplicación en aseguramiento de calidad (funcional y de seguridad) previo a declararse operativa.
* **Rotación de clave con gracia:** se emite una clave nueva sin desactivar la anterior durante un plazo (aquí 72 h) para evitar caídas de servicio.

---

*Fin del documento — NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01 · Rev. 0 · 2026-10-12 · GGPD.*