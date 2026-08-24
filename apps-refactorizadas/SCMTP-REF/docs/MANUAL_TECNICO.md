# MANUAL TÉCNICO DE ARQUITECTURA DE SOFTWARE Y SISTEMA
**CÓDIGO DE DOCUMENTO: GGPD-SGM-MAN-001**  
**GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC**  
**SISTEMA: CORPOELEC - SGTA - Ai Studio Google**  
**NORMATIVA: ISO/IEC 25010 (Calidad de Software) | ISO 27001 (Seguridad) | ISO 9001 (Calidad)**

---

## 1. VISIÓN GENERAL DE ARQUITECTURA TÉCNICA

El **CORPOELEC - SGTA - Ai Studio Google** ha sido construido bajo una arquitectura **Full-Stack desacoplada y escalable**, orientada a microservicios e integraciones en la nube (Cloud Run / Node.js).

```
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                        CAPA DE CLIENTE (WEB SPA)                         │
 │  React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts  │
 └────────────────────────────────────┬─────────────────────────────────────┘
                                      │ REST API / HTTP (JSON / Form-Data)
 ┌────────────────────────────────────▼─────────────────────────────────────┐
 │                       CAPA DE SERVIDOR (BACKEND)                         │
 │            Node.js Express + TSX (Dev) / ESBuild CJS (Prod)            │
 ├────────────────────────────────────┬─────────────────────────────────────┤
 │ • Autenticación y Perfiles RBAC     │ • Motor de Parsing IA (Gemini)      │
 │ • Endpoints REST de Minutas        │ • Generador de Docs ISO (.doc)      │
 │ • Logger de Auditoría ISO 8000/9001│ • Dispatcher Correos & Drive Sync   │
 └──────────────────┬─────────────────┴──────────────────┬──────────────────┘
                    │                                    │
 ┌──────────────────▼─────────────────┐┌─────────────────▼──────────────────┐
 │      BASE DE DATOS SUPABASE        ││   ALMACENAMIENTO DE RESPALDO     │
 │  PostgreSQL + Supabase Client JS   ││  archivos JSON / /data/docs .doc │
 └────────────────────────────────────┘└────────────────────────────────────┘
```

---

## 2. COMPONENTES Y TECNOLOGÍAS DEL STACK TÉCNICO

### 2.1. Frontend (Capa de Presentación)
* **Framework Principal:** React 18 / 19 con TypeScript en modo SPA (Single Page Application).
* **Herramienta de Construcción:** Vite (Bundler HMR desactivado en contenedor Cloud Run).
* **Estilizado Visual:** Tailwind CSS v4 con variables institucionales CORPOELEC (`#002B49` Azul Institucional, `#E30613` Rojo Corporativo).
* **Librerías de Visualización:** `recharts` para analítica de compromisos y KPIs estratégicos PRTSEN/POA.
* **Componentes de Notificación e Integración Drive:** `EmailReportConfigModal.tsx` para parametrización de correos, edición de destinatarios y programación semanal.

### 2.2. Backend (Capa de Aplicación API)
* **Entorno de Ejecución:** Node.js v20+ con Express 4.
* **Servidor HTTP:** Express `server.ts` escuchando obligatoriamente en el puerto `3000` e interfaz `0.0.0.0` según las restricciones del contenedor Cloud Run.
* **Compilación a Producción:** `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`.

### 2.3. Integración Google Drive Corporativa
* **Directorio de Respaldo:** `1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq` (`https://drive.google.com/drive/folders/1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq`).
* **Mecanismo:** Endpoint Express `/api/notifications/send-report` para generación y sincronización automática de informes semanales ISO `.doc` en el almacenamiento local `/data/docs/` y trazabilidad de sincronización en Google Drive.

---

## 3. SEGURIDAD, RBAC Y MATRIZ DE PERFILES

El sistema implementa una matriz estricta de **Control de Acceso Basado en Roles (RBAC)** en cumplimiento con las normas **ISO 27001** e **ISO 9001**:

### 3.1. Matriz de Roles y Permisos

| Rol | Usuarios / Perfiles | Alcance Tareas | Módulo Correos & Drive | Atribución Pendientes |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador (`admin`)** | Ing. Adrian Correa, Ing. Carlos Reyes | Global | **Si (Acceso Exclusivo)** | **Si (+Crear Tarea con Traza ISO)** |
| **Supervisor Operaciones (`supervisor`)** | Ing. Alejandro Mendoza (`@a_mendoza`) | Global Operaciones | **Si (Acceso Exclusivo)** | **Si (+Crear Tarea con Traza ISO)** |
| **Supervisor TI / Automatiz (`supervisor`)** | Ing. Carlos Rondón (`@c_rondon`) | Global TI / Automat. | **Si (Acceso Exclusivo)** | **Si (+Crear Tarea con Traza ISO)** |
| **Analista (`analista`)** | Fabio K. (`@k_fabio`), Pedro Pérez | **Solo Asignadas** | **No (Oculto)** | **No (Acceso Denegado)** |

---

## 4. ENDPOINTS API REST DEL SERVIDOR (`server.ts`)

| Endpoint | Método | Descripción | Parámetros / Body |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Verificación de estado de salud del backend | N/A |
| `/api/parse-minuta` | `POST` | Procesa PDF/Texto con Gemini 3.6 Flash y retorna JSON estructurado | `pdfText`, `fileName`, `fileBuffer` |
| `/api/drive/sync` | `POST` | Sincroniza archivos desde Google Drive corporativo | `folderId`, `userEmail` |
| `/api/notifications/send-report` | `POST` | Transmite reportes por correo y respalda copia ISO `.doc` en Google Drive | `recipients`, `driveFolderId`, `includeAttachment`, `minutaNumero` |
| `/api/docs/download-doc` | `POST` | Genera y guarda un documento `.doc` en `/data/docs/` y retorna la descarga | `docCode`, `title`, `content`, `subtitle` |
| `/api/docs/list` | `GET` | Lista los documentos `.doc` almacenados localmente en `/data/docs/` | N/A |

---

## 5. ESTRUCTURA Y MODELO DE DATOS (`/src/types.ts`)

### 5.1. Objeto EmailRecipientConfig
```typescript
export interface EmailRecipientConfig {
  id: string;
  name: string;
  email: string;
  cargo: string;
  targetFilter: 'Concluidos' | 'EnProceso' | 'Tecnologia' | 'Todos';
  activo: boolean;
}
```

### 5.2. Registro de Auditoría ISO 9001 / ISO 27001
```typescript
export interface IsoAuditLogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  rol: string;
  accion: string;
  modulo: string;
  detalles: string;
  ipAcceso?: string;
  isoStandard: 'ISO_27001' | 'ISO_8000' | 'ISO_9001';
}
```

---

## 6. GUÍA DE INSTALACIÓN Y DESPLIEGUE

### Pasos para Ejecutar en Servidor Local o Contenedor Docker:
1. Clonar o extraer el proyecto en la carpeta de trabajo.
2. Instalar dependencias mediante NPM:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno en `.env`:
   ```env
   GEMINI_API_KEY=tu_clave_gemini_api
   PORT=3000
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Construir para producción:
   ```bash
   npm run build
   npm start
   ```

---
**Elaborado por:** Equipo de Arquitectura de Software — GGPD CORPOELEC  
**Aprobado por:** Ing. Adrian Correa — Gerente de Gestión de Planificación de Distribución
