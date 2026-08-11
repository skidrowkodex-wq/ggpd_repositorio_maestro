---
name: vercel-express-deployment
description: "Use when configuring, debugging, or deploying Express.js backend projects to Vercel. Contains critical workarounds for Vercel Serverless Functions with Express (body parsing, ESM extensions, rewrites)."
metadata:
  author: CORPOELEC GGPD / AI Studio
  version: "1.0.0"
---

# Vercel Express Deployment Best Practices

This skill outlines mandatory requirements for deploying Express.js backend projects to Vercel Serverless Functions.

## Critical Deployment Rules (from AI Studio)

Si despliegas un proyecto Express en Vercel, asegúrate de cumplir obligatoriamente con los siguientes 3 puntos para evitar problemas de despliegue y bloqueo de streams:

1. **Reescritura de Rutas en `vercel.json`**:
   Agregar la reescritura `/api/(.*)` a `/api` en el archivo de configuración `vercel.json` para asegurar que todas las peticiones lleguen correctamente al entrypoint de la Serverless Function.
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api" }
     ]
   }
   ```

2. **Compatibilidad ESM en Node.js (Extensiones Explícitas)**:
   Usar extensiones `.js` explícitas en las importaciones dentro del entrypoint (ej. `api/index.ts` o `api/index.js`) para garantizar la compatibilidad con ESM (ECMAScript Modules) en los entornos Node.js de Vercel.
   * **Correcto:** `import app from '../server.js'`
   * **Incorrecto:** `import app from '../server'`

3. **Prevención de Bloqueo del Stream de Vercel (Body Parser)**:
   Asignar `req._body = true` si `req.body` ya está definido **ANTES** del middleware `express.json()`. Vercel a veces pre-procesa el body en las Serverless Functions, y si Express intenta volver a parsearlo con un body ya consumido, el stream se bloquea indefinidamente causando errores de timeout (504).
   
   ```javascript
   // Ejemplo de implementación de parche para Vercel ANTES de express.json()
   app.use((req, res, next) => {
     if (req.body) {
       req._body = true;
     }
     next();
   });
   
   app.use(express.json());
   ```
