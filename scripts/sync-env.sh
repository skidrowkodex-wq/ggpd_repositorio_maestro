#!/usr/bin/env bash
# scripts/sync-env.sh — Propaga claves de .env.local a cada app y .env raíz
# Uso: ./scripts/sync-env.sh
# Requiere: .env.local con valores reales en la raíz del repo

set -euo pipefail

ROOT_ENV=".env.local"
if [[ ! -f "$ROOT_ENV" ]]; then
  echo "❌ No existe $ROOT_ENV — copialo desde .env.example y completa los valores"
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
  else
    echo "⚠️  No existe $env_file (copia .env.example primero)"
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

echo "🎉 Sincronización completada. Verifica con: cat apps-refactorizadas/SIGI-REF/.env"