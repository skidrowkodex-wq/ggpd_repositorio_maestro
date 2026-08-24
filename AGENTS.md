# Reglas de Desarrollo y Agentes — Repositorio Maestro CORPOELEC

Bienvenido al **Repositorio Maestro de Distribución de CORPOELEC (GGPD)**. Todos los agentes de IA (Antigravity IDE 2.0, CLI `agy`, subagentes y asistentes) deben acatar las siguientes directrices operativas:

---

## 📌 1. Protocolo Obligatorio de Continuidad (Handoff)
- **Inicio de sesión:** Lee de inmediato el archivo [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md) para sincronizarte con el estado más reciente, historial de cambios y tareas pendientes.
- **Fin de sesión:** Actualiza [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md) registrando con exactitud lo realizado y el siguiente paso sugerido.

Consulta el detalle de la regla en [.agents/rules/handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/.agents/rules/handoff.md).

---

## 🏛️ 2. Estructura del Repositorio y Aplicaciones
El repositorio integra las cuatro aplicaciones estratégicas del SEN más el portal central y el sistema SIGI:
1. **Gestor de Tareas y Minutas (SGTA):** `apps/corpoelec---gestor-de-tareas-y-minutas` (Puerto `3003`)
2. **Planificación Eléctrica SEN / Viáticos / SAMC:** `apps/planificación-eléctrica-sen` (Puerto `3004`)
3. **SCEIN (Equipos Indisponibles de Subestaciones):** `apps/remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec` (Puerto `3005`)
4. **SCTIS v2.0 (Tiras de Interrupción de Distribución):** `apps/sctis-v-2.0-distribucion` (Puerto `3002`)
5. **SIGI (Gestión y Planificación de Distribución):** `apps/corpoelec-sigi-gestion-planificacion-distribucion` (Puerto `3001`)
6. **Portal Maestro Unificado:** `index.html` / `src/` (Puerto `5000` o `npm run dev`)

---

## 🛡️ 3. Estándares y Cumplimiento Normativo (GGPD)
- **ISO 8000-110:** Calidad de datos sintácticos y semánticos. Erradicación de duplicados y aislamiento en bandejas de remediación.
- **ISO/IEC 27001:2022:** Seguridad en Supabase Auth, Row Level Security (RLS) habilitado en todas las tablas y variables en `.env`.
- **ISO 55000 / 55001:** Gestión y trazabilidad del ciclo de vida de activos eléctricos.
- **ISACA COBIT 2019 (MEA02):** Controles financieros preventivos mediante triggers PostgreSQL (e.g. validación de presupuesto de viáticos antes del commit).

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
