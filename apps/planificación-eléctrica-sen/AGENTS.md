# AGENTS.md — Planificación Eléctrica (consolidado)

Sistema para gestionar **POA** (Planes Operativos Anuales) y **PRTSEN** (Proyectos de Rehabilitación y Transformación del Sector Eléctrico Nacional) de la Empresa Eléctrica (CORPOELEC).

## Objetivo del consolidado

Unificar en un solo repo lo que antes estaba disperso en 3 lugares (`Planificacion/`, `_prtsen/_PTRSEN/`, `proyectos/samc/`), eliminar duplicados, y dejar listo para:
- **Google AI Studio** como entorno de desarrollo asistido
- **Vercel** como plataforma de despliegue (app Next.js)
- **Supabase** como backend (Postgres + Auth + Storage)

## Idioma

Toda la documentación, código, nombres de tablas y commits deben estar en **español** (excepto identificadores técnicos estándar: `package.json`, `tsconfig.json`, etc.).

## Estructura del repositorio

```
planificacion-electrica/
├── AGENTS.md                 # este archivo — contexto para agentes IA
├── README.md                 # documentación pública del repo
├── RETROSPECTIVA.md          # registro de decisiones, avances y sesiones
├── .env                      # SECRETS — NUNCA commitear (ver .gitignore)
├── .env.example              # template sin valores sensibles
├── .gitignore
│
├── data/                     # fuentes de verdad externas (NO código)
│   ├── poa/                  # Excel POA: for_opp_087*, formulario_ficha_poa*, sipes*, poa_2022.xlsx
│   └── prtsen/_PTRSEN/       # Excel PRTSEN — 7 carpetas 001..007 (NO aplanar)
│
├── db/
│   ├── schema_public/        # 33 scripts SQL — POA puro (esquema `public`, REFERENCIA)
│   └── schema_samc/          # 18 scripts SQL — POA + PRTSEN (esquema `samc`, ACTIVO)
│
├── docs/                     # documentación técnica unificada
│   ├── DIAGRAMAS_SISTEMA.md
│   ├── DOCUMENTO_TECNICO_ISO.md
│   ├── INFORME_AUDITORIA_*.md
│   ├── ISO_8000_METAS_FISICAS.md
│   ├── RESUMEN_SESION_*.md
│   ├── SUPABASE.md
│   └── *.pdf, *.docx
│
├── apps/
│   └── web-nextjs/           # app Next.js 16 (stack ACTIVO para Vercel)
│       ├── app/               # App Router (page.tsx, route.ts)
│       ├── components/
│       ├── lib/
│       │   ├── db.ts          # cliente Prisma (Postgres)
│       │   ├── supabase.ts    # cliente Supabase (frontend + service role para server)
│       │   └── utils.ts
│       ├── prisma/schema.prisma  # 33 modelos introspectados del esquema `public`
│       ├── vercel.json        # config de despliegue
│       └── package.json
│
└── _archive/                 # código legacy / deprecado (no se borra, no se mantiene activo)
    ├── samc_api-fastapi/     # API FastAPI completa (referencia, no se usa en el deploy)
    ├── ref-legacy-php/       # PHP PHPRunner legacy
    ├── prtsen_app_legacy.py
    ├── 03_migracion_completa.py
    └── *.md legacy
```

## Stack principal (decisión 2026-07-28)

- **Frontend + API**: Next.js 16 (App Router) en `apps/web-nextjs/`
- **ORM**: Prisma 7 (`@prisma/adapter-pg`)
- **Backend / BD**: **Supabase** (PostgreSQL 15+ gestionado)
- **Auth**: Supabase Auth (reemplaza al JWT custom de la FastAPI archivada)
- **Deploy**: Vercel (`apps/web-nextjs/vercel.json` ya configurado)
- **Asisted dev**: Google AI Studio lee este `AGENTS.md` y `RETROSPECTIVA.md`

## Esquemas de base de datos (2)

| Esquema | Carpeta | Estado | Uso |
|---|---|---|---|
| `public` | `db/schema_public/` | Referencia | POA puro — 35 tablas + 31 vistas. Era el modelo original del POA sin PRTSEN. |
| `samc` | `db/schema_samc/` | **Activo** | POA normalizado + PRTSEN completo — modelo vivo. Las apps nuevas apuntan aquí. |

Migración a Supabase: aplicar los scripts de `schema_samc/` en orden (`01_*.sql` → `15b_*.sql`).

## Datos PRTSEN (fuentes externas)

`data/prtsen/_PTRSEN/` contiene 7 carpetas — **no aplanar**, la estructura es información:

| Carpeta | Contenido | Mapea a tabla |
|---|---|---|
| 001 CARACTERIZACIÓN | Subestaciones distribución | `samc_subestacion` |
| 002 FICHAS Y DIAGNOSTICO | Ficha SE/circuitos | `samc_subestacion` + `samc_circuito` |
| 003 EQUIPOS INDISPONIBLES | Consolidado S/E | `samc_subestacion` (estado operativo) |
| 004 RESTRICCIONES OPERATIVAS | Materiales CTOS | `samc_circuito` (restricciones) |
| 005 PROYECTOS | Consolidado + 21 fichas estadales | `samc_proyecto_especial` + `samc_proyecto_vinculacion_poa` |
| 006 TRANSFORMADORES POTENCIA | Levantamiento | Detalle de activos |
| 007 INTERRUPTORES/RECONECTADORES | Levantamiento | Detalle de activos |

**Pendiente**: ETL Excel → BD (ver `RETROSPECTIVA.md` sección Pendientes).

## Variables de entorno

El `.env` real está en la raíz del repo pero **está en `.gitignore`** — no se commitea. Para Google AI Studio / Vercel configurar:

```
NEXT_PUBLIC_SUPABASE_URL=<URL-de-Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key-o-anon>
SUPABASE_SERVICE_ROLE_KEY=<service-role-solo-servidor>  # solo en Vercel, NUNCA en client
DATABASE_URL=postgresql://...@db.<ref>.supabase.co:5432/postgres
DIRECT_URL=postgresql://...@db.<ref>.supabase.co:5432/postgres  # para migraciones Prisma
```

## Flujo de trabajo para agentes

1. **Antes de empezar**: leer `RETROSPECTIVA.md` (estado actual) y este `AGENTS.md`
2. **Cambios de BD**: escribir SQL en `db/schema_samc/` con prefijo numérico secuencial (`16_*.sql`, `17_*.sql`...)
3. **Cambios de app**: editar dentro de `apps/web-nextjs/` — mantener Next.js 16 + App Router + TailwindCSS 4
4. **Trazabilidad**: actualizar `RETROSPECTIVA.md` al final de cada sesión (avances, decisiones, pendientes)
5. **Validar** antes de commit: `npm run build` y `npm run lint` en `apps/web-nextjs/`

## Convenciones importantes

- Nombres de tablas en **español**, `snake_case`, prefijo `samc_` en el esquema activo
- Validar estructura contra los Excel en `data/` antes de implementar
- UUIDs como PK en todas las tablas (no integers secuenciales)
- Campos de auditoría ISO 8000/27001: `created_at`, `updated_at`, `created_by`, `updated_by`, `version`, `activo`
- Soft-delete vía `activo = false` (no `DELETE` físico)
- Triggers para `updated_at` y `version` automáticos
- Generados `GENERATED ALWAYS AS` para campos calculados (eficacia, costos)
- **Nada de emojis en el código o documentación** salvo pedido explícito

## Comandos útiles

```bash
# App Next.js (desarrollo local)
cd apps/web-nextjs && npm install && npm run dev   # http://localhost:3000

# Build de verificación
cd apps/web-nextjs && npm run build

# Aplicar esquema samc a Postgres local (antes de migrar a Supabase)
for f in db/schema_samc/*.sql; do psql -h 127.0.0.1 -U opencode_agent -d planificacion_electrica -f "$f"; done

# Prisma (regenerar client tras cambios de schema)
cd apps/web-nextjs && npx prisma generate
```

## Archivos clave a consultar

1. `RETROSPECTIVA.md` — estado actual, decisiones, pendientes
2. `docs/SUPABASE.md` — guía de configuración Supabase
3. `docs/DOCUMENTO_TECNICO_ISO.md` — documento técnico ISO 8000/27001
4. `_archive/samc_api-fastapi/AGENTS_samc_legacy.md` — referencia del modelo SAMC completo (cuando se dude de una FK o vista)
