# Planificación Eléctrica — CORPOELEC

Sistema de gestión de **POA** (Planes Operativos Anuales) y **PRTSEN** (Proyectos de Rehabilitación y Transformación del Sector Eléctrico Nacional) para la Empresa Eléctrica (CORPOELEC, Venezuela).

## Estado del proyecto

- **Modelado POA**: completado (35 tablas + 31 vistas en esquema `public` como referencia; esquema `samc` como activo)
- **Modelado PRTSEN**: completado en esquema `samc` (18 scripts, scripts `08` a `15b`)
- **App Next.js**: funcional para gestión POA (11 formularios, 11 API Routes, Prisma 7)
- **Pendiente**: migrar a Supabase, ETL de datos PRTSEN desde Excel, deploy en Vercel

Ver [`RETROSPECTIVA.md`](./RETROSPECTIVA.md) para el historial completo de decisiones y `docs/` para la documentación técnica.

## Estructura

| Carpeta | Contenido |
|---|---|
| `apps/web-nextjs/` | App Next.js 16 (stack activo para Vercel) |
| `db/schema_samc/` | SQL activo — POA + PRTSEN (esquema `samc`) |
| `db/schema_public/` | SQL de referencia — POA puro (esquema `public`) |
| `data/poa/` | Excels fuente POA |
| `data/prtsen/_PTRSEN/` | Excels fuente PRTSEN (7 carpetas operativas) |
| `docs/` | Documentación técnica unificada |
| `_archive/` | Código legacy/deprecado (FastAPI, PHP, scripts sueltos) |

## Stack

- **Frontend + API**: Next.js 16 (App Router, TypeScript, TailwindCSS 4)
- **ORM**: Prisma 7
- **BD**: PostgreSQL local → migración a Supabase
- **Deploy**: Vercel (`apps/web-nextjs/vercel.json`)

## Comenzar

```bash
cd apps/web-nextjs
npm install
cp ../../.env.example .env.local   # y completar credenciales Supabase
npm run dev                        # http://localhost:3000
```

Para cargar el esquema en Postgres local (desarrollo sin Supabase):

```bash
for f in ../../db/schema_samc/*.sql; do
  psql -h 127.0.0.1 -U opencode_agent -d planificacion_electrica -f "$f"
done
cd .. && npx prisma generate   # regenerar cliente
```

## Documentación

- [`AGENTS.md`](./AGENTS.md) — contexto para agentes IA (Google AI Studio, etc.)
- [`RETROSPECTIVA.md`](./RETROSPECTIVA.md) — decisiones y progreso
- [`docs/SUPABASE.md`](./docs/SUPABASE.md) — configuración Supabase
- [`docs/DIAGRAMAS_SISTEMA.md`](./docs/DIAGRAMAS_SISTEMA.md) — diagramas
- [`docs/DOCUMENTO_TECNICO_ISO.md`](./docs/DOCUMENTO_TECNICO_ISO.md) — ISO 8000/27001

## Licencia

Uso interno CORPOELEC. Ver `RETROSPECTIVA.md` para detalles del proyecto.
