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
