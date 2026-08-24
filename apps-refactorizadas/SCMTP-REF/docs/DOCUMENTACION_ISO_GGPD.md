# CORPOELEC — GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)

## DOCUMENTACIÓN DE CALIDAD, GOBIERNO DE DATOS Y MANUALES DE SISTEMA
**Normativa ISO 9001:2015 | ISO/IEC 27001:2022 | ISO 8000 (Calidad de Datos)**

---

### ÍNDICE DE LA DOCUMENTACIÓN DEL PROYECTO

El presente directorio contiene la documentación técnica, funcional y operativa correspondiente al **CORPOELEC - SGTA - Ai Studio Google** (Sistema de Gestión y Trazabilidad de Acuerdos, Minutas y Proyectos Operativos PRTSEN / POA) desarrollado para la Gerencia de Gestión de Planificación de Distribución (GGPD) de CORPOELEC.

| Código ISO | Tipo de Documento | Descripción / Alcance | Archivo |
| :--- | :--- | :--- | :--- |
| **GGPD-SGM-MAN-001** | **Manual Técnico** | Arquitectura Full-Stack, Motor IA Gemini 3.6 Flash, RBAC ISO 27001, Endpoint Correos & Google Drive Sync | [`MANUAL_TECNICO.md`](./MANUAL_TECNICO.md) |
| **GGPD-SGM-MAN-002** | **Manual Funcional** | Guía de uso para Analistas, Supervisores (Operaciones/TI) y Administrador por Roles | [`MANUAL_FUNCIONAL.md`](./MANUAL_FUNCIONAL.md) |
| **GGPD-SGM-INS-003** | **Instructivos ISO** | Instructivos Operativos ISO 9001/27001 para auditoría, atribución gerencial, envío programado y Drive Sync | [`INSTRUCTIVOS_OPERATIVOS_ISO.md`](./INSTRUCTIVOS_OPERATIVOS_ISO.md) |

---

### METADATOS Y CONTROL DE REVISIONES DEL DOCUMENTO

* **Empresa / Ente:** CORPOELEC (Corporación Eléctrica Nacional)
* **Gerencia:** Gerencia General de Gestión de Planificación de Distribución (GGPD)
* **Gerente Responsable:** Ing. Adrian Correa — Gerente GGPD
* **Proyecto:** CORPOELEC - SGTA - Ai Studio Google (Seguimiento de Minutas y Proyectos PRTSEN / POA)
* **Versión del Sistema:** v2.5 ISO (Build 2026.08)
* **Entorno de Despliegue:** Cloud Run / Node.js Express + React 19 + TypeScript
* **Fecha de Emisión:** Agosto 2026

---

### RESUMEN EJECUTIVO PARA LA GERENCIA GENERAL

El **CORPOELEC - SGTA - Ai Studio Google** es una plataforma tecnológica de nivel empresarial diseñada para automatizar la extracción, gestión, asignación y auditoría de compromisos institucionales derivados de las minutas de trabajo de la Gerencia de Gestión de Planificación de Distribución.

#### Pilares Fundamentales del Sistema:
1. **Inteligencia Artificial para Extracción de Minutas (Gemini 3.6 Flash):** Lectura e interpretación automatizada de documentos de reunión en PDF o transcripciones de texto, con extracción estructurada en JSON de responsables, compromisos, plazos y pendientes por área organizativa.
2. **Control de Acceso Basado en Roles (RBAC ISO 27001) y Atribución Gerencial ISO 9001:**
   - **Analistas:** Visualizan y gestionan **exclusivamente sus propios compromisos asignados** (ej. usuario `@k_fabio` observa únicamente sus tareas correspondientes).
   - **Supervisores Específicos:** Perfiles dedicados para la *Supervisión de Operaciones y Redes de Distribución* (Ing. Alejandro Mendoza `@a_mendoza`) y la *Supervisión de Tecnología, Automatización y Sistemas* (Ing. Carlos Rondón `@c_rondon`).
   - **Administradores y Supervisores:** Acceso global, control exclusivo para la conversión directa de pendientes a tareas asignadas con traza inmutable de auditoría y módulo de notificaciones.
3. **Módulo de Notificaciones por Correo & Respaldo Automático en Google Drive:**
   - Programación de reportes semanales (predeterminado: *Todos los Viernes a las 17:00 hrs* para cierre de semana).
   - Destinatarios parametrizables por nivel funcional (Gerencia General, Supervisión Operativa, Supervisión TI/Automatización).
   - Edición dinámica de correos electrónicos y envío directo con respaldo de informes `.doc` en la carpeta oficial de Google Drive (`ID: 1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq`).
4. **Persistencia Dual (Cloud Supabase + Almacenamiento Local de Respaldo):** Sincronización en tiempo real con bases de datos PostgreSQL en Supabase y archivos locales estructurados en `/data`.
5. **Exportación e Integración ISO:** Generación directa de informes descargables en formato `.DOC` (Word / Google Docs) listos para firma y revisión ejecutiva.

---

### GUÍA RÁPIDA DE DESCARGA Y EXPORTACIÓN DEL PROYECTO

Si ha exportado o descargado el código fuente de este proyecto en archivo `.zip` o mediante sincronización de repositorio GitHub, los archivos `.md` contenidos en esta carpeta `/docs` quedan automáticamente preservados en la raíz del proyecto.

Puede abrirlos directamente con cualquier editor Markdown (VSCode, Obsidian, GitHub Viewer) o convertirlos directamente a PDF / Word para su entrega formal a la Gerencia General y Auditores ISO.
