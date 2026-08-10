# MANUAL FUNCIONAL DE USUARIO Y GUÍA DE OPERACIONES
**CÓDIGO DE DOCUMENTO: GGPD-SGM-MAN-002**  
**GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC**  
**SISTEMA DE GESTIÓN Y TRAZABILIDAD DE ACUERDOS (CORPOELEC - SGTA - Ai Studio Google)**

---

## 1. INTRODUCCIÓN Y OBJETIVOS DEL SISTEMA

El **CORPOELEC - SGTA - Ai Studio Google** es una plataforma corporativa desarrollada para facilitar la digitalización, seguimiento, asignación de responsabilidades, notificación automatizada por correo y evaluación del cumplimiento de metas operativas de la Gerencia de Gestión de Planificación de Distribución de CORPOELEC.

---

## 2. MODALIDADES DE ACCESO Y PERFILES POR ROLES

Al ingresar al sistema, el usuario cuenta con un selector de perfil corporativo con privilegios diferenciados:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                             PERFILES DE USUARIO CORPOELEC                                │
├─────────────────────┬──────────────────────────┬─────────────────────────────────────────┤
│ Usuario / Nombre    │ Rol Asignado             │ Correo / Alias Identificador            │
├─────────────────────┼──────────────────────────┼─────────────────────────────────────────┤
│ Ing. Adrian Correa  │ Admin (Gerente GGPD)     │ adrian.correa@corpoelec.gob.ve          │
│ Ing. Carlos Reyes A.│ Admin (Director Gral)    │ c_reyes@corpoelec.gob.ve                │
│ Ing. Alejandro M.   │ Supervisor Operaciones   │ a_mendoza@corpoelec.gob.ve (`@a_mendoza`)│
│ Ing. Carlos Rondón  │ Supervisor TI/Automat.   │ c_rondon@corpoelec.gob.ve (`@c_rondon`) │
│ Fabio K.            │ Analista Planificación   │ k_fabio@corpoelec.gob.ve (`@k_fabio`)   │
│ Pedro Pérez         │ Analista de Automatiz.   │ pperez@corpoelec.gob.ve                 │
└─────────────────────┴──────────────────────────┴─────────────────────────────────────────┘
```

---

## 3. MANUAL PASO A PASO DE MÓDULOS DEL SISTEMA

### 3.1. Módulo 1: Resumen Ejecutivo (Dashboard KGI / KPI)
* **Objetivo:** Ofrece una visión panorámica instantánea del cumplimiento global de minutas y compromisos.
* **Componentes:**
  - **Indicadores de Cumplimiento (%):** Métricas de Compromisos Concluidos, En Proceso y Pendientes.
  - **Graficador Dinámico (Recharts):** Distribución visual por áreas de la GGPD.
  - **ALERTAS ISO:** Compromisos próximos a vencer en los siguientes 7 días.

### 3.2. Módulo 2: Carga de Minutas con Inteligencia Artificial (Gemini 3.6 Flash)
* **Paso 1:** Haga clic en el botón superior **"Cargar Minuta IA"**.
* **Paso 2:** Seleccione o arrastre un archivo de minuta en formato PDF (ej. `MINUTA_20260730_26-0004.pdf`) o escriba/pegue el texto estructurado de la reunión.
* **Paso 3:** Presione **"Analizar Minuta con IA"**. El motor de Inteligencia Artificial procesará la información y desglosará:
  - Número de Minuta y Fecha de Realización.
  - Coordinador de la Reunión y Asistentes.
  - Tabla de Compromisos extraídos con Responsable y Plazo.
  - Asuntos Pendientes por Área.
* **Paso 4:** Revise los campos parseados y presione **"Guardar y Registrar Minuta"**.

### 3.3. Módulo 3: Compromisos Asignados y Vista RBAC Personalizada
* **Seguridad de Vista por Rol:**
  - Si ingresa como **Analista** (ej. Fabio K. `@k_fabio`), el sistema mostrará la notificación **"Vista Personal Asignada"** y filtrará automáticamente la tabla para mostrar **únicamente sus compromisos**.
  - Si ingresa como **Admin / Supervisor**, visualiza el listado consolidado completo de la GGPD.
* **Controles:**
  - Cambie el estado de avance entre: `No Iniciado`, `En Proceso`, `Concluido`, `Cancelado`.
  - Ingrese observaciones de avance técnico para mantener el historial de auditoría.

### 3.4. Módulo 4: Tablero Kanban de Flujo Operativo
* Gestiona visualmente los compromisos arrastrando o seleccionando los estados de trabajo en 4 columnas dinámicas:
  - **Sin Iniciar (Gris)**
  - **En Proceso (Azul)**
  - **Concluido (Verde)**
  - **Cancelado (Rojo)**

### 3.5. Módulo 5: Pendientes por Área & Atribución Gerencial ISO 9001
* **Acceso Restringido:** Reservado a Administradores y Supervisores (Ing. Adrian Correa, Ing. Alejandro Mendoza, Ing. Carlos Rondón, Ing. Carlos Reyes).
* **Creación Directa de Tareas de Supervisión:** Los botones `+ Crear Tarea (Supervisor)` están reservados exclusivamente a perfiles elevados.
* **Traza de Auditoría ISO:** Al convertir un pendiente en tarea activa asignada, el sistema genera de inmediato un registro inmutable con el nombre del supervisor emisor, hora exacta y código de auditoría ISO 9001 / ISO 27001.

### 3.6. Módulo 6: Notificaciones Parametrizables por Correo & Google Drive Auto
* **Acceso:** Botón verde destacado **"Correos & Drive Auto"** en el menú lateral (Solo visible para Administradores y Supervisores).
* **Gestión de Destinatarios y Edición de Correos:**
  - Visualiza la lista de distribución.
  - **Botón con Ícono de Lápiz (Editar Destinatario):** Permite modificar de inmediato el Nombre, Dirección de Correo Electrónico (Gmail/Corporativo), Cargo y Filtro de Estado asignado.
* **Filtros Personalizados de Envío:**
  - *Concluidos*: Diseñado para Gerencia General (Ing. Adrian Correa).
  - *EnProceso*: Diseñado para Supervisión Operativa (Ing. Alejandro Mendoza).
  - *Tecnologia*: Diseñado para Supervisión TI / Automatización (Ing. Carlos Rondón).
  - *Todos*: Consolidado Total.
* **Programación Semanal Automática:**
  - Configurable por día (predeterminado: *Todos los Viernes*) y hora (predeterminado: *17:00 hrs / Cierre Semanal*).
* **Sincronización Directa con Google Drive:**
  - Conectado a la carpeta oficial Google Drive ID `1sujg7EUE-TeZcpGB8kp6JoZIqv2TqNzq`.
  - Genera y adjunta el informe semanal `.doc` ISO y envía respaldo directo al directorio en la nube.

### 3.7. Módulo 7: Generación y Descarga de Documentos ISO (.DOC)
* Permite descargar en cualquier momento los reportes e instructivos oficiales en formato `.doc` compatibles con Microsoft Word y Google Docs, almacenados en `/data/docs/`.

---
**Elaborado por:** Coordinación de Operaciones y Métodos — GGPD CORPOELEC  
**Aprobado por:** Ing. Adrian Correa — Gerente de Gestión de Planificación de Distribución
