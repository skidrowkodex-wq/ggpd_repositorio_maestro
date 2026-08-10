# INSTRUCTIVOS OPERATIVOS Y NORMAS DE CALIDAD ISO
**CÓDIGO DE DOCUMENTO CONSOLIDADO: GGPD-SGM-INS-003**  
**GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC**  
**NORMATIVAS: ISO 9001:2015 (Gestión de Calidad) | ISO 27001:2022 (Seguridad) | ISO 8000 (Calidad de Datos)**

---

## INSTRUCTIVO 1: PROCEDIMIENTO DE CARGA Y PARSING DE MINUTAS IA
**Código Documental: GGPD-SGM-IO-001**

### 1.1. Objetivo
Normalizar la extracción automatizada de compromisos institucionales y minutas de trabajo utilizando el motor de Inteligencia Artificial Gemini 3.6 Flash, minimizando el tiempo de respuesta y garantizando la trazabilidad.

### 1.2. Políticas de Carga
1. Todo documento PDF de minuta de reunión debe ser cargado en las siguientes 24 horas hábiles posteriores a la conclusión de la asamblea.
2. La extracción debe validar la atribución correcta de tareas, plazos y pendientes por área.

---

## INSTRUCTIVO 2: ATRIBUCIÓN GERENCIAL Y CREACIÓN DIRECTA DE TAREAS (ISO 9001 / ISO 27001)
**Código Documental: GGPD-SGM-IA-002**

### 2.1. Alcance y Control de Creación Directa
Conforme a la norma ISO 9001:2015 cláusula 5.3 (Roles, Responsabilidades y Autoridades) e ISO 27001:
1. La conversión directa de pendientes de área a tareas activas (`+ Crear Tarea (Supervisor)`) está restringida a los roles de **Administrador y Supervisor** (Ing. Adrian Correa, Ing. Alejandro Mendoza, Ing. Carlos Rondón, Ing. Carlos Reyes).
2. Queda prohibida la asignación directa de compromisos por parte del rol `analista`.
3. Cada asignación genera automáticamente un registro inmutable en la bitácora de auditoría (`IsoAuditLogEntry`) capturando:
   - Identificador del Supervisor emisor.
   - Fecha y hora exacta ISO.
   - Detalle del pendiente y código de la minuta origen.

---

## INSTRUCTIVO 3: PROTOCOLO DE NOTIFICACIONES POR CORREO Y RESPALDO GOOGLE DRIVE
**Código Documental: GGPD-SGM-DT-003**

### 3.1. Programación Semanal y Cierre de Avances
1. El envío de reportes consolidados por correo electrónico está programado por defecto para **todos los Viernes a las 17:00 hrs** (Cierre Operativo Semanal).
2. Los destinatarios se segmentan según su función gerencial:
   - **Gerencia General (Ing. Adrian Correa):** Filtro *Concluidos* (Cumplimiento de Metas).
   - **Supervisión Operativa (Ing. Alejandro Mendoza):** Filtro *EnProceso* (Avances y Tareas Activas).
   - **Supervisión TI / Automatización (Ing. Carlos Rondón):** Filtro *Tecnología* (Sistemas y Plataforma).
3. Cualquier cambio en la dirección de correo de un destinatario debe realizarse a través del botón de **Edición de Destinatarios (Ícono Lápiz)** en la ventana de configuración.

### 3.2. Respaldo Automático en Google Drive Corporativo
1. Cada reporte semanal transmitido genera automáticamente un archivo `.doc` de calidad ISO.
2. El sistema sincroniza automáticamente una copia de respaldo en la carpeta corporativa de Google Drive:
   - **Folder ID:** `1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq`
   - **Enlace de Inspección:** `https://drive.google.com/drive/folders/1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq`

---
**Elaborado por:** Equipo de Gestión de Calidad y Gobierno de Datos — GGPD CORPOELEC  
**Aprobado por:** Ing. Adrian Correa — Gerente de Gestión de Planificación de Distribución
