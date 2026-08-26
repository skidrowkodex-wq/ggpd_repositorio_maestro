# Reglas de Desarrollo y Agentes — Repositorio Maestro CORPOELEC

Bienvenido al **Repositorio Maestro de Distribución de CORPOELEC (GGPD)**. Todos los agentes de IA (Antigravity IDE 2.0, CLI `agy`, subagentes y asistentes) deben acatar las siguientes directrices operativas:

---

## 📌 1. Protocolo Obligatorio de Continuidad (Handoff)
- **Inicio de sesión:** Lee de inmediato el archivo [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md) para sincronizarte con el estado más reciente, historial de cambios y tareas pendientes.
- **Fin de sesión:** Actualiza [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md) registrando con exactitud lo realizado y el siguiente paso sugerido.

Consulta el detalle de la regla en [.agents/rules/handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/rules/handoff.md).

---

## 🏛️ 2. Estructura del Repositorio y Aplicaciones
El repositorio integra las cinco aplicaciones estratégicas del SEN más la Consola Central SIGI y el portal maestro:
1. **Gestor de Tareas y Minutas (SCMTP / SGTA):** `apps/corpoelec---gestor-de-tareas-y-minutas` / `apps-refactorizadas/SCMTP-REF` (Puerto `3003`)
2. **Planificación Eléctrica SEN / Viáticos / SAMC (SCPPE):** `apps/planificación-eléctrica-sen` / `apps-refactorizadas/SCPPE-REF` (Puerto `3004`)
3. **SCEIN (Equipos Indisponibles de Subestaciones):** `apps/remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec` / `apps-refactorizadas/SCEIN-REF` (Puerto `3005`)
4. **SCTIS v2.0 (Tiras de Interrupción de Distribución):** `apps/sctis-v-2.0-distribucion` / `apps-refactorizadas/SCTIS-REF` (Puerto `3002`)
5. **SIGI (Consola Central de Gestión y Planificación):** `apps/corpoelec-sigi-gestion-planificacion-distribucion` / `apps-refactorizadas/SIGI-REF` (Puerto `3001`)
6. **SCGCC V1.0 (Gestión de Correspondencia Corporativa):** `apps-refactorizadas/SCGCC-REF` (Puerto `3006`)
7. **Portal Maestro Unificado:** `index.html` / `src/` (Puerto `5000` o `npm run dev`)

---

## 🛡️ 3. Estándares y Cumplimiento Normativo de Grado Industrial SEN (GGPD)
Toda aplicación nueva o refactorizada en el Repositorio Maestro DEBE implementar obligatoriamente el **Estándar de Certificación de Grado Industrial SEN & Zona Segura Cifrada**:
- **Pantalla de Autenticación (Login):**
  - Pill superior pulsante: `🛡️ ZONA SEGURA CIFRADA · ISO/IEC 27001 · OWASP ASVS`.
  - Sello: `CERTIFICACIÓN DE GRADO INDUSTRIAL · SEN 2026`.
  - Formulario convencional limpio: `Usuario Corporativo / Correo` y `Contraseña Institucional` (con botón para alternar visibilidad).
  - Caja de aviso de sesión auditada bajo norma ISO/IEC 27001.
  - Pie multi-normativo (ISO 27001, ISO 8000-110, OWASP Top 10, ISACA COBIT).
- **Barra Técnica Superior (Navbar):**
  - Estampado: `🛡️ ZONA SEGURA DE GRADO INDUSTRIAL | ISO 27001 · ISO 8000 · OWASP · PORT XXXX`.
- **Pie Institucional Unificado (Footer):**
  - Mención oficial a los 4 pilares normativos e impulso por Inteligencia Artificial Avanzada (*Google Antigravity / Gemini Flash AI*).
- **Marco Normativo y Documentos Estratégicos Vigentes:**
  - **`DOC-GGPD-2026-METAS-001`:** Marco Lógico de Metas 2026 de 1er Nivel (`TTI`, `FMI`, `NDI`, `DPI`, `RIND`) y 2do Nivel (`AP`, `P&P`, `SE`, `MT`, `BT`).
  - **`DOC-GGPD-2026-DIAG-PROC-001`:** Diagnóstico Forense de Procesos, Deconstrucción de `/repo_ggc` y Erradicación del Sesgo de Ex-Operadoras.
  - **`DOC-GGPD-2026-GOB-001`:** Dictamen Técnico de Gobernanza de Software, Prohibición de la "Super-App", Cierre de Canales Informales (WhatsApp) y Flujo Desacoplado `SIGI ➔ SCMTP ➔ SCGCC`.
  - **ISO/IEC 27001:2022:** Seguridad en InsForge Auth, Row Level Security (RLS) en todas las tablas y variables en `.env`.
  - **ISO 8000-110:** Calidad de datos sintácticos y semánticos. Erradicación de duplicados y validación estricta de esquemas (`core.*`).
  - **ISO 55000 / 55001:** Gestión y trazabilidad del ciclo de vida de activos eléctricos.
  - **OWASP ASVS v4.0 Level 2 / Top 10:** Blindaje contra inyección SQL, XSS, fijación de sesión y Broken Access Control.
  - **ISACA COBIT 2019 (MEA02):** Controles preventivos mediante triggers PostgreSQL y auditoría de eventos.

Consulta el detalle en [.agents/rules/industrial_grade_standard.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/rules/industrial_grade_standard.md) y [.agents/skills/corpoelec-qa-governance/SKILL.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/skills/corpoelec-qa-governance/SKILL.md).

---

## ⚙️ 4. Scripts y Comandos Principales
- `npm run dev`: Inicia el servidor de desarrollo Vite para el portal unificado.
- `npm run serve:portal`: Servidor HTTP en puerto 5000 para el portal maestro.
- `npm run discover` / `npm run spec` / `npm run scan`: Herramientas automatizadas de inspección y schema de Supabase.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **ggpd-data-maestra-0002** (API base `https://wxkeqf37.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

<!-- VIBEHOST:START -->
## VibeHost Deployment Service (`vibehost-bk`)

This project supports private-by-default web hosting via [VibeHost](https://vibehost.com) under the alias **`vibehost-bk`**.

- **Skill:** `vibehost-deploy` (located in `.agents/skills/vibehost-deploy`).
- **CLI:** `vibehost` installed at `~/.local/bin/vibehost`.
- **Usage:**
  - Authenticate: `vibehost login` (or pass `VIBEHOST_TOKEN` in env).
  - Deploy static sites: `vibehost deploy ./dist --app <app-name> --json`
  - Deploy Next.js apps: `vibehost deploy . --app <app-name> --runtime nextjs --json`
  - Link project: `vibehost link --app <app-name>`
<!-- VIBEHOST:END -->
