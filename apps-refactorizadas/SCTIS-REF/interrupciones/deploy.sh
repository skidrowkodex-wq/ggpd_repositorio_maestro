#!/bin/bash
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-}"
SERVICE_NAME="${SERVICE_NAME:-sctis-backend}"
REGION="${REGION:-us-central1}"

if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: Set GOOGLE_CLOUD_PROJECT environment variable"
    exit 1
fi

echo "Deploying ${SERVICE_NAME} to Cloud Run in ${REGION}..."

gcloud run deploy "${SERVICE_NAME}" \
    --source . \
    --region "${REGION}" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "DB_HOST=${DB_HOST},DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PASSWORD=${DB_PASSWORD},DB_SSLMODE=require,GEMINI_API_KEY=${GEMINI_API_KEY},APP_SECRET=${APP_SECRET},SUPABASE_URL=${SUPABASE_URL},SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}" \
    --set-secrets "GEMINI_API_KEY=gemini-api-key:latest,DB_PASSWORD=db-password:latest" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --concurrency 80 \
    --timeout 120s

echo "Deployment complete."