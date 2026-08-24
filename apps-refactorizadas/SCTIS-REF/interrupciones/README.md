# SCTIS - Interrupciones Backend (Vercel)

Backend Flask para el sistema de gestión de tiras de interrupción (SCTIS), desplegable en Vercel como funciones serverless.

## Arquitectura

- **Backend**: Flask (Python 3.11) → Vercel Serverless Functions
- **Base de datos**: Supabase PostgreSQL (externo)
- **Auth**: Session-based (Flask) + Firebase Auth compat
- **IA**: Google Gemini (causa homologación, scoring de calidad, detección de duplicados)
- **Despliegue**: Vercel (serverless functions)

## Estructura del proyecto

```
interrupciones/
├── app/
│   ├── __init__.py          # Factory Flask, registro de blueprints
│   ├── config.py            # Configuración centralizada (env vars)
│   ├── db.py                # Conexión PostgreSQL (Supabase)
│   ├── auth.py              # Autenticación (session + Firebase compat)
│   ├── firebase_auth.py     # Capa de compatibilidad Firebase Auth
│   ├── ai.py                # Integración Gemini AI
│   ├── routes.py            # API REST principal + plantillas
│   ├── import_routes.py     # Importación Excel (wizard 3 pasos)
│   ├── admin_routes.py      # CRUD usuarios (admin)
│   ├── static/              # Archivos estáticos (vacío)
│   └── templates/           # Plantillas Jinja2 (Vue 3 + Tailwind)
├── api/
│   ├── __init__.py          # Importa el Flask app
│   ├── index.py             # Entry point único para Vercel
│   └── _utils.py            # Utilidad de dispatch compartida
├── Dockerfile               # Container para Cloud Run (alternativo)
├── vercel.json              # Configuración de Vercel
├── requirements.txt         # Dependencias Python
├── run.py                   # Entry point local (dev)
├── .env.example             # Template de variables de entorno
├── README.md                # Este archivo
├── AGENTS.md                # Estado de la sesión
├── migraciones/             # SQL migrations (001-005)
└── docs/                    # Documentación
```

## Despliegue en Vercel

### Paso 1: Preparar el proyecto

1. Comprimir el directorio del proyecto (excluyendo `.env`, `.git`, `.venv`):
   ```bash
   zip -r sctis-backend.zip . -x ".git/*" ".venv/*" "__pycache__/*" "*.pyc" ".env" ".env.*"
   ```

## Integración con Google AI Studio / Project IDX

Si vas a subir este proyecto a **Google AI Studio** o **Project IDX** mediante un archivo ZIP:

1. **Subida y Desempaquetado**: Sube el archivo `.zip` con el código fuente del proyecto.
2. **Configuración del Entorno**:
   - Copia `.env.example` a `.env`:
     ```bash
     cp .env.example .env
     ```
   - Rellena las credenciales de tu base de datos **Supabase** y tu API key de **Gemini** en el archivo `.env`. (Nota: Si estás usando el pooler de Supabase en AI Studio, usa el host `aws-1-ap-southeast-1.pooler.supabase.com` y puerto `6543`).
3. **Instalación de Dependencias**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Ejecución y Verificación**:
   ```bash
   python run.py
   ```
   La aplicación se iniciará en `http://localhost:5000`.

### Paso 2: Crear proyecto en Vercel

1. Ir a https://vercel.com
2. Click en **Add New Project** → **Import Git Repository** (o **Upload**)
3. Si subes el ZIP, selecciona el proyecto y Vercel lo detectará como Python

### Paso 3: Configurar variables de entorno

En **Settings** → **Environment Variables**, agregar:

| Variable | Valor |
|---|---|
| `DB_HOST` | Host de tu Supabase (ej: `db.abc.supabase.co`) |
| `DB_PORT` | `5432` o `6543` (Supabase pooler) |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | Contraseña de Supabase |
| `DB_SSLMODE` | `require` |
| `DB_SCHEMA` | `sctis` |
| `APP_SECRET` | Clave secreta para Flask sessions |
| `GEMINI_API_KEY` | Tu API key de Gemini |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase |
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase (opcional) |
| `FIREBASE_CLIENT_EMAIL` | Email del service account (opcional) |
| `FIREBASE_PRIVATE_KEY` | Private key del service account (opcional) |

### Paso 4: Desplegar

1. Click en **Deploy**
2. Vercel detectará `vercel.json` y usará `@vercel/python` para construir
3. Esperar el despliegue (~1-2 minutos)
4. Obtener la URL `.vercel.app`

### Paso 5: Configurar Supabase allowlist

En Supabase → **Settings** → **Database** → **Connection pooling** → **IP Allowlist**, agregar las IPs de Vercel o usar Supabase connecter.

## Variables de entorno

Ver `.env.example` para la lista completa. Las variables obligatorias son:

- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — conexión PostgreSQL
- `GEMINI_API_KEY` — API key de Gemini
- `APP_SECRET` — secret de Flask

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/` | Dashboard |
| GET | `/api/estados` | Lista de estados |
| GET | `/api/causas` | Causas homologadas |
| GET | `/api/interrupciones` | Lista de interrupciones |
| POST | `/api/interrupciones` | Crear interrupción |
| POST | `/api/importar/preview` | Preview import Excel |
| POST | `/api/importar/confirmar` | Confirmar import |
| POST | `/api/ai/suggest-cause` | Sugerir causa con IA |
| POST | `/api/ai/quality-score` | Scoring de calidad con IA |
| POST | `/api/ai/detect-duplicates` | Detección de duplicados con IA |

## Migraciones

Las migraciones SQL están en `migraciones/`. Aplicar en orden:

```bash
psql "host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" -f migraciones/001_crear_esquema_sctis.sql
psql "host=$DB_HOST dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD" -f migraciones/002_poblar_catalogos.sql
# ... etc
```

## Desarrollo local

```bash
# Copiar .env.example
cp .env.example .env
# Editar .env con tus credenciales
# Instalar dependencias
pip install -r requirements.txt
# Ejecutar
python run.py
```

## Notas sobre Vercel

- Las funciones serverless tienen cold starts (~1-3 segundos)
- El filesystem es efímero (no guardar archivos en disco)
- Timeout máximo: 10s (Hobby) / 60s (Pro) / 900s (Enterprise)
- La app se escala automáticamente a cero cuando no hay tráfico
- Para conexiones a Supabase, usa el connection pooler de Supabase (port 6543)

## Licencia

Uso interno — CORPOELEC / MPPEE.