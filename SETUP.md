# Guía de Configuración — Repositorio Maestro CORPOELEC GGPD

Esta guía permite configurar el proyecto completo en una máquina nueva para continuar el desarrollo con **opencode**.

---

## 1. Requisitos Previos

| Herramienta | Versión Mínima | Notas |
|-------------|----------------|-------|
| **Node.js** | 20.x (LTS) | Usar `nvm` o `fnm` para gestionar versiones |
| **npm** | 10.x | Viene con Node.js |
| **Python** | 3.11+ | Requerido para SCTIS-REF (Flask) y scripts de despliegue |
| **Git** | 2.40+ | Para control de versiones |
| **opencode** | Latest | `npm install -g @opencode/opencode` |

---

## 2. Clonar / Copiar el Repositorio

### Opción A: Copia directa de carpeta (recomendada si ya tienes la carpeta)
```bash
# En la máquina origen: comprime excluyendo node_modules, dist, .env, .env.local
tar --exclude='node_modules' --exclude='dist' --exclude='.env' --exclude='.env.local' \
    --exclude='*.zip' --exclude='*.log' --exclude='__pycache__' \
    -czf repositorio-maestro.tar.gz Repositorio_Maestro/

# En la máquina destino:
tar -xzf repositorio-maestro.tar.gz
cd Repositorio_Maestro
```

### Opción B: Clonar desde GitHub (si tienes acceso)
```bash
git clone https://github.com/tu-usuario/Repositorio_Maestro.git
cd Repositorio_Maestro
```

---

## 3. Configurar Variables de Entorno

### 3.1 Archivo raíz `.env` (para portal maestro y scripts)
```bash
cp .env.example .env
# Edita .env con tus valores reales
```

### 3.2 Archivo `.env.local` (para opencode, InsForge CLI, claves sensibles)
```bash
cp .env.example .env.local
# Edita .env.local con las claves REALES (NUNCA commitear este archivo)
```

### 3.3 Variables por aplicación (apps-refactorizadas/*/)
Cada app tiene su propio `.env.example`. Copia y configura:

```bash
# SIGI-REF
cp apps-refactorizadas/SIGI-REF/.env.example apps-refactorizadas/SIGI-REF/.env

# SCTIS-REF (Python/Flask)
cp apps-refactorizadas/SCTIS-REF/.env.example apps-refactorizadas/SCTIS-REF/.env

# SCMTP-REF
cp apps-refactorizadas/SCMTP-REF/.env.example apps-refactorizadas/SCMTP-REF/.env

# SCPPE-REF
cp apps-refactorizadas/SCPPE-REF/.env.example apps-refactorizadas/SCPPE-REF/.env

# SCEIN-REF
cp apps-refactorizadas/SCEIN-REF/.env.example apps-refactorizadas/SCEIN-REF/.env

# SCGCC-REF
cp apps-refactorizadas/SCGCC-REF/.env.example apps-refactorizadas/SCGCC-REF/.env
```

> **Importante:** Los valores reales de `INSFORGE_API_KEY`, `VIBEHOST_TOKEN`, `GITHUB_TOKEN_*` deben ir en `.env.local` (raíz) y copiarse a cada `.env` de app, o usar un script que los inyecte. Ver sección 5.

---

## 4. Instalar Dependencias

### 4.1 Raíz (portal maestro)
```bash
npm install
```

### 4.2 Cada aplicación refactorizada
```bash
# SIGI-REF
cd apps-refactorizadas/SIGI-REF && npm install && cd ../..

# SCTIS-REF (Python)
cd apps-refactorizadas/SCTIS-REF
# El script de dev/build instala Python standalone y dependencias automáticamente
cd ../..

# SCMTP-REF
cd apps-refactorizadas/SCMTP-REF && npm install && cd ../..

# SCPPE-REF
cd apps-refactorizadas/SCPPE-REF && npm install && cd ../..

# SCEIN-REF
cd apps-refactorizadas/SCEIN-REF && npm install && cd ../..

# SCGCC-REF
cd apps-refactorizadas/SCGCC-REF && npm install && cd ../..
```

> **Tip:** Usa un script para instalar todo en paralelo:
```bash
for app in SIGI-REF SCMTP-REF SCPPE-REF SCEIN-REF SCGCC-REF; do
  (cd apps-refactorizadas/$app && npm install) &
done
wait
```

---

## 5. Sincronizar Claves Secretas (Script Recomendado)

Crea un script `scripts/sync-env.sh` para propagar las claves de `.env.local` a cada app:

```bash
#!/usr/bin/env bash
# scripts/sync-env.sh — Propaga claves de .env.local a cada app
set -euo pipefail

ROOT_ENV=".env.local"
if [[ ! -f "$ROOT_ENV" ]]; then
  echo "❌ No existe $ROOT_ENV"
  exit 1
fi

# Cargar variables del root
source "$ROOT_ENV"

apps=(
  "apps-refactorizadas/SIGI-REF"
  "apps-refactorizadas/SCTIS-REF"
  "apps-refactorizadas/SCMTP-REF"
  "apps-refactorizadas/SCPPE-REF"
  "apps-refactorizadas/SCEIN-REF"
  "apps-refactorizadas/SCGCC-REF"
)

for app in "${apps[@]}"; do
  env_file="$app/.env"
  if [[ -f "$env_file" ]]; then
    # Actualizar solo las claves que existen en .env.local
    sed -i "s|^INSFORGE_URL=.*|INSFORGE_URL=$INSFORGE_URL|" "$env_file"
    sed -i "s|^INSFORGE_API_KEY=.*|INSFORGE_API_KEY=$INSFORGE_API_KEY|" "$env_file"
    sed -i "s|^VITE_INSFORGE_URL=.*|VITE_INSFORGE_URL=$VITE_INSFORGE_URL|" "$env_file"
    sed -i "s|^VITE_INSFORGE_API_KEY=.*|VITE_INSFORGE_API_KEY=$VITE_INSFORGE_API_KEY|" "$env_file"
    [[ -n "${INSFORGE_PROJECT_ID:-}" ]] && sed -i "s|^INSFORGE_PROJECT_ID=.*|INSFORGE_PROJECT_ID=$INSFORGE_PROJECT_ID|" "$env_file"
    [[ -n "${VITE_BCI_URL:-}" ]] && sed -i "s|^VITE_BCI_URL=.*|VITE_BCI_URL=$VITE_BCI_URL|" "$env_file"
    [[ -n "${VITE_BCI_API_KEY:-}" ]] && sed -i "s|^VITE_BCI_API_KEY=.*|VITE_BCI_API_KEY=$VITE_BCI_API_KEY|" "$env_file"
    echo "✅ Actualizado $env_file"
  fi
done

# También actualizar .env raíz
sed -i "s|^INSFORGE_URL=.*|INSFORGE_URL=$INSFORGE_URL|" .env
sed -i "s|^INSFORGE_API_KEY=.*|INSFORGE_API_KEY=$INSFORGE_API_KEY|" .env
sed -i "s|^VITE_INSFORGE_URL=.*|VITE_INSFORGE_URL=$VITE_INSFORGE_URL|" .env
sed -i "s|^VITE_INSFORGE_API_KEY=.*|VITE_INSFORGE_API_KEY=$VITE_INSFORGE_API_KEY|" .env
[[ -n "${VITE_BCI_URL:-}" ]] && sed -i "s|^VITE_BCI_URL=.*|VITE_BCI_URL=$VITE_BCI_URL|" .env
[[ -n "${VITE_BCI_API_KEY:-}" ]] && sed -i "s|^VITE_BCI_API_KEY=.*|VITE_BCI_API_KEY=$VITE_BCI_API_KEY|" .env
[[ -n "${VIBEHOST_TOKEN:-}" ]] && sed -i "s|^VIBEHOST_TOKEN=.*|VIBEHOST_TOKEN=$VIBEHOST_TOKEN|" .env
echo "✅ Actualizado .env raíz"
```

Hazlo ejecutable y úsalo:
```bash
chmod +x scripts/sync-env.sh
./scripts/sync-env.sh
```

---

## 6. Verificar Configuración de opencode

El archivo `opencode.json` ya está configurado con el MCP de InsForge. Verifica:

```bash
cat opencode.json
```

Debe apuntar a la API key correcta (la de `.env.local`). Si cambió, actualiza `opencode.json` manualmente o regenera.

---

## 7. Comandos de Desarrollo

### Portal Maestro (raíz)
```bash
npm run dev          # Vite dev server (puerto 5173)
npm run serve:portal # Python HTTP server en puerto 5000
```

### Aplicaciones Refactorizadas (cada una en su puerto)
```bash
# SIGI-REF (puerto 3001)
cd apps-refactorizadas/SIGI-REF && npm run dev

# SCTIS-REF (puerto 3002) — Python/Flask
cd apps-refactorizadas/SCTIS-REF && npm run dev

# SCMTP-REF (puerto 3003)
cd apps-refactorizadas/SCMTP-REF && npm run dev

# SCPPE-REF (puerto 3004)
cd apps-refactorizadas/SCPPE-REF && npm run dev

# SCEIN-REF (puerto 3005)
cd apps-refactorizadas/SCEIN-REF && npm run dev

# SCGCC-REF (puerto 3006)
cd apps-refactorizadas/SCGCC-REF && npm run dev
```

### Levantar todas a la vez (portal + 6 apps)
```bash
npm run serve:all  # Usa serve_all.py (Python)
```

---

## 8. Build de Producción

```bash
# Portal maestro
npm run build

# Cada app refactorizada
cd apps-refactorizadas/SIGI-REF && npm run build
cd apps-refactorizadas/SCMTP-REF && npm run build
cd apps-refactorizadas/SCPPE-REF && npm run build
cd apps-refactorizadas/SCEIN-REF && npm run build
cd apps-refactorizadas/SCGCC-REF && npm run build

# SCTIS-REF (Python)
cd apps-refactorizadas/SCTIS-REF && npm run build
```

---

## 9. Despliegue a VibeHost

```bash
# Autenticar (una sola vez)
vibehost login
# O exportar token: export VIBEHOST_TOKEN=tu_token

# Desplegar portal maestro (estático)
npm run build
vibehost deploy ./dist --app corpoelec-portal --json

# Desplegar apps refactorizadas (usando script helper)
python3 scripts/deploy_vibehost_app.py sigi
python3 scripts/deploy_vibehost_app.py scgcc
python3 scripts/deploy_vibehost_app.py scmtp
python3 scripts/deploy_vibehost_app.py scppe
python3 scripts/deploy_vibehost_app.py scein
python3 scripts/deploy_vibehost_app.py sctis
```

---

## 10. InsForge CLI (Opcional, para admin de BD)

```bash
# Instalar CLI (requiere Node 20 por bug en Node 24)
PATH="/usr/bin:$PATH" npx -y @insforge/cli login

# Verificar proyecto
insforge project list
insforge db tables --project ggpd-data-maestra-0002
```

---

## 11. Verificación Rápida (Smoke Test)

```bash
# 1. Verificar que opencode arranca
opencode --version

# 2. Verificar conectividad InsForge (desde raíz)
node -e "
const { createClient } = require('@insforge/sdk');
const c = createClient(process.env.INSFORGE_URL, process.env.INSFORGE_API_KEY);
c.db.from('core.mae_usuarios_sistema').select('username').limit(1).then(r => console.log('✅ InsForge OK:', r.data)).catch(e => console.error('❌', e.message));
"

# 3. Verificar build de una app (ej. SIGI-REF)
cd apps-refactorizadas/SIGI-REF && npm run build && echo "✅ Build OK"
```

---

## 12. Estructura de Directorios Clave

```
Repositorio_Maestro/
├── .env.example              # Plantilla variables de entorno (ESTE ARCHIVO)
├── .env                      # Variables locales (gitignored)
├── .env.local                # Secretos reales (gitignored, para opencode/CLI)
├── opencode.json             # Config opencode + MCP InsForge
├── .mcp.json                 # Config MCP Supabase
├── handoff.md                # Estado del proyecto y continuidad (LEER AL INICIO)
├── AGENTS.md                 # Reglas obligatorias para agentes IA
├── package.json              # Portal maestro (Vite)
├── apps-refactorizadas/      # 6 Apps principales (Node.js + Python)
│   ├── SIGI-REF/             # Puerto 3001 - Consola Central
│   ├── SCTIS-REF/            # Puerto 3002 - Tiras Interrupción (Python/Flask)
│   ├── SCMTP-REF/            # Puerto 3003 - Minutas y Tareas
│   ├── SCPPE-REF/            # Puerto 3004 - Planificación Eléctrica
│   ├── SCEIN-REF/            # Puerto 3005 - Equipos Indisponibles
│   └── SCGCC-REF/            # Puerto 3006 - Correspondencia
├── apps/                     # Apps legacy (referencia, no usar en prod)
├── docs/                     # Documentación normativa y técnica
├── scripts/                  # Scripts de despliegue, ETL, utilidades
├── sql/                      # Scripts SQL para InsForge
├── database/                 # Snapshots y migraciones
└── node_modules/             # Dependencias raíz (gitignored)
```

---

## 13. Primera Sesión con opencode en la Nueva Máquina

1. **Lee `handoff.md`** — Estado actual, tareas pendientes, credenciales de prueba
2. **Lee `AGENTS.md`** — Reglas obligatorias (estándar industrial, handoff, estructura)
3. **Ejecuta `./scripts/sync-env.sh`** — Sincroniza claves
4. **Inicia opencode** — `opencode` en la raíz del repo
5. **Pide al agente que lea `handoff.md`** para sincronizarse

---

## 14. Troubleshooting Común

| Problema | Solución |
|----------|----------|
| `opencode` no encuentra API key InsForge | Verifica `.env.local` y `opencode.json` |
| Build falla en SCTIS-REF | Requiere Python 3.11+; el script descarga standalone automáticamente |
| `vibehost` da SIGILL | Usa `VIBEHOST_TOKEN` por env; no uses el binario local si falla |
| Error 401 InsForge | Rotar API key en dashboard InsForge y actualizar `.env.local` |
| Puertos en uso | Cambia `PORT` en cada `.env` de app |
| `node_modules` muy grande | `rm -rf node_modules && npm install` en cada app |

---

## 15. Contacto y Soporte

- **Repositorio:** `ggpd-data-maestra-0002` en InsForge
- **Despliegues:** VibeHost (alias `vibehost-bk`)
- **Documentación normativa:** `docs/` y `AGENTS.md`
- **Historial técnico:** `handoff.md`

---

**Última actualización:** 2026-09-22 — Preparado para transferencia a máquina nueva