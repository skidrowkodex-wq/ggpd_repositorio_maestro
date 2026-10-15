<div align="center">

# ⚡ Sistema de Ingesta y Gestión de Flota Vehicular

### CORPOELEC · Gerencia General de Planificación y Distribución (GGPD)

**Plataforma institucional para el registro, consolidación y control del parque automotor del Sistema Eléctrico Nacional (SEN).**

`React 19` · `TypeScript` · `Vite` · `Tailwind CSS v4` · `InsForge (PostgreSQL)`

**Versión `1.1.0`** · *Punto de Control oficial: `SISFLOTA01`*

</div>

---

## 📋 Descripción

SPA institucional que permite a las coordinaciones territoriales (estados), a la Dirección Nacional y a la Gerencia General **capturar, consolidar y analizar** la flota vehicular, con autenticación descentralizada por estado, trazabilidad de auditoría y control de acceso basado en roles (RBAC).

---

## 🧩 Módulos Funcionales

| Módulo | Pestaña | Descripción |
| :--- | :--- | :--- |
| **Formulario de Captura** | `tab_formulario` | Registro y edición de fichas técnicas de vehículos (formato A4, nomenclatura `GGDT-[EST]-[TIPO]-[CORR]`). |
| **Consolidado de Flota** | `tab_consolidado` | Tabla consolidada con filtros avanzados, resúmenes territoriales/por componentes/por gerencias, importación Excel→BD, exportación, PDF por vehículo y vaciado de BD. |
| **Cuadro de Mando Gerencial** | `tab_gerencia` | KPIs ejecutivos, alertas de mantenimiento, **mapa geopolítico de Venezuela** e **Historial de Auditoría** de acciones críticas. |
| **Control de Permisos por Rol** | `tab_permisos` | Página **administrativa** que define qué botones/vistas ve cada rol (ver sección RBAC). |

---

## 🔐 Control de Permisos por Rol (RBAC SEN)

Página exclusiva del **Administrador** que gestiona una **matriz rol × acción**. Un cambio aplica a **todos los usuarios** del rol seleccionado.

### Roles
| Rol | Clave | Alcance |
| :--- | :--- | :--- |
| Administrador | `admin` | Control total. Su columna está **bloqueada** (no puede perder acceso). |
| Director Nacional | `nacional` | Supervisión nacional sobre todos los estados. |
| Gerente / Cuadro Mando | `gerente` | Métricas, KPIs y consolidación gerencial. |
| Coordinador de Estado | `estado` | Operación limitada a su entidad territorial. |

### Acciones controlables (17)
- **Navegación:** `tab_formulario`, `tab_consolidado`, `tab_gerencia`, `tab_permisos`
- **Operación de flota:** `btn_import_excel`, `btn_export_excel`, `btn_edit_vehiculo`, `btn_delete_vehiculo`, `btn_vaciar_bd`
- **Sistema:** `btn_users_mgmt`, `btn_backup`, `btn_changepass`, `btn_password_resets`, `btn_pg_manager`, `btn_theme`, `btn_audit_history`, `btn_catalogs`

### Persistencia híbrida (ISO/IEC 27001)
- **Caché local** (`localStorage`, clave `corpoelec_flota_permissions_v1`): instantánea y **offline-first**.
- **Fuente de verdad en InsForge** (`public.flota_permisos_roles`): sincronización vía API REST con la **clave pública (`anon`)**.
- Si la nube no responde, la app opera con la caché local y reintenta al guardar.

### Valores por defecto (réplica del comportamiento previo)
- `admin`: todas las acciones habilitadas.
- `nacional` / `estado`: todo, salvo `tab_permisos`, `btn_password_resets` y `btn_vaciar_bd`.
- `gerente`: igual que `nacional`, además sin `tab_formulario`.

> Cada cambio de la matriz se registra en el **Historial de Auditoría** con la acción `CAMBIO_PERMISOS` (ISACA COBIT 2019 · MEA02).

---

## 🛡️ Autenticación y Seguridad

- **Login institucional** con dos modos: **Conexión por Estado (24)** y **Roles Centrales / Admin**.
- Formulario **en blanco por defecto** (sin estado ni usuario pre-seleccionados), con **CAPTCHA** alfanumérico y **clave por entidad territorial**.
- Aviso de **sesión auditada** (ISO/IEC 27001), sello **CERTIFICACIÓN DE GRADO INDUSTRIAL · SEN 2026** e imagen corporativa.
- Trazabilidad de acciones críticas (crear/editar/eliminar/importar/respaldar/vaciar/cambio de clave/cambio de permisos).

---

## 🚀 Puesta en Marcha

**Requisitos:** Node.js 20+

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (ver sección siguiente)
cp .env.example .env.development

# 3. Servidor de desarrollo
npm run dev            # por defecto en http://localhost:3000
npm run dev -- --port=3010   # puerto alterno usado en este repositorio
```

### Scripts disponibles
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo Vite (`--port=3000 --host=0.0.0.0`). |
| `npm run build` | Compilación de producción a `dist/`. |
| `npm run preview` | Previsualización del build. |
| `npm run lint` | Verificación de tipos (`tsc --noEmit`). |
| `npm run db:export` | Regenera los scripts SQL locales (`tsx scripts/exportSql.ts`). |
| `npm run clean` | Limpia `dist/` y `server.js`. |

---

## 🔑 Variables de Entorno (`.env.development` / `.env.example`)

```env
# InsForge — Proyecto ggpd-data-maestra-0002
VITE_INSFORGE_API_URL=https://wxkeqf37.ap-southeast.insforge.app
VITE_INSFORGE_URL=https://wxkeqf37.ap-southeast.insforge.app

# Clave pública (rol anon) para el CRUD REST del modo híbrido de permisos.
# NUNCA colocar aquí la service key.
VITE_INSFORGE_ANON_KEY=anon_...
```

> Las claves reales no se versionan. `VITE_INSFORGE_ANON_KEY` es pública por diseño (rol `anon`, sujeta a RLS).

---

## 🗄️ Base de Datos

| Recurso | Ruta |
| :--- | :--- |
| Esquema InsForge (tablas `flota_*`, RLS, políticas) | `database/insforge_flota_schema.sql` |
| Paquete local completo (DDL + DML) | `database/00_corpoelec_flota_completo.sql` |
| Esquema puro (DDL) | `database/01_esquema_ddl.sql` |
| Datos semilla (DML) | `database/02_datos_semilla_dml.sql` |
| PostgreSQL 16 local (Docker) | `database/docker-compose.yml` |

Tablas principales en InsForge: `flota_usuarios_perfiles`, `flota_regiones_venezuela`, `flota_estados_venezuela`, `flota_centros_servicios`, `flota_catalogos_maestros`, `flota_vehiculos`, `flota_auditoria_sistema`, `flota_puntos_control_backups`, `flota_permisos_roles`.

Arranque local de la BD:
```bash
cd database && docker compose up -d
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/       # Vistas (Formulario, Consolidado, Cuadro de Mando, Control de Permisos, Login, etc.)
├── services/         # Lógica de negocio y acceso a datos
│   ├── authService.ts          # Autenticación institucional (15 usuarios SEN) y roles
│   ├── permissionService.ts    # Matriz RBAC rol × acción (híbrido localStorage + InsForge)
│   ├── insforgeService.ts      # Cliente REST InsForge (fetch/push de permisos)
│   ├── auditService.ts         # Trazabilidad de acciones críticas
│   ├── passwordResetService.ts # Flujo de reinicio de claves
│   ├── backupService.ts        # Puntos de control (SISFLOTA01)
│   ├── correlativoService.ts   # Nomenclatura GGDT-[EST]-[TIPO]-[CORR]
│   ├── postgresExportService.ts# Generador DDL/DML PostgreSQL
│   ├── excelService.ts / pdfService.ts
│   └── validationService.ts / regionAdapter.ts
├── data/             # Catálogos, usuarios por defecto, regiones y contorno geopolítico de Venezuela
├── types/            # Tipos del dominio (fleet, etc.)
└── assets/           # Imagen corporativa (logo-corpoelec.png)
database/             # Esquemas y semillas SQL
scripts/              # Utilidades (exportSql.ts)
```

---

## 🗺️ Mapa Geopolítico (Cuadro de Mando Gerencial)

El **Cuadro de Mando Gerencial (`tab_gerencia`)** incluye un **mapa político de Venezuela** construido 100 % en SVG, **sin dependencias externas** (sin GeoJSON ni librerías de mapeo).

### Características
- **Territorio nacional con tratamiento uniforme:** la **Guayana Esequiba** queda integrada al territorio con **idéntico tratamiento tipográfico** que el resto de las entidades (sin tramas, líneas administradas ni rasgos diferenciadores).
- **Rotulación de las entidades federales** con anclajes individuales y líneas guía en las regiones densas (Capital, Centro-Norte, Nororiental); `★ CARACAS` como capital.
- **Capas conmutables:** división político-territorial (rótulos), relación de **Centros de Servicios** y burbujas de **densidad por estado**.
- **Cartografía de referencia:** contorno georreferenciado, hidrografía (lago de Maracaibo, Orinoco, delta), retícula, entorno de países vecinos, rótulos de agua, rosa de los vientos y escala gráfica de 300 km.
- **Proyección compartida:** el contorno usa la **misma función de proyección** que los nodos de Estados y Centros de Servicios, garantizando alineación exacta.

> Módulo fuente: `src/data/venezuelaGeoOutline.ts` · Componente: `src/components/VenezuelaFleetMap.tsx`.

---

## 🌐 Despliegue y Repositorios

| Recurso | Ubicación |
| :--- | :--- |
| **Aplicación en vivo (VibeHost)** | https://flota-vehicular-ggpd-corpoelec-ggpd-hosting-apps.vibehost.space |
| **Repositorio dedicado (GitHub)** | https://github.com/distribucion-corpoelec-automatizacion/SIGF-REF (privado) |
| **Repositorio Maestro** | `apps-refactorizadas/SIGF-REF` |
| **Puerto de desarrollo** | `3010` (alterno al `3000` por defecto de Vite) |

---

## 📐 Cumplimiento Normativo

- **ISO/IEC 27001:2022** — Seguridad de la información, sesiones auditadas y RLS en InsForge.
- **ISO 8000-110** — Calidad de datos (erradicación de duplicados, validación de esquemas).
- **ISO 55000 / 55001** — Gestión y trazabilidad del ciclo de vida de los activos.
- **OWASP ASVS v4.0 / Top 10** — Blindaje contra inyección, XSS y control de acceso.
- **ISACA COBIT 2019 (MEA02)** — Controles y auditoría de eventos.

---

<div align="center">

**CORPOELEC · GGPD · 2026** — Impulsado por Inteligencia Artificial Avanzada

</div>
