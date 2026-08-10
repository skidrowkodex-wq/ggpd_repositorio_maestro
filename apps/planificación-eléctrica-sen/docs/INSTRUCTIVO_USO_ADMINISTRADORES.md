# INSTRUCTIVO DE USO DEL SISTEMA SAMC - ROL ADMINISTRADOR

**Código de Documento:** SAMC-IU-001
**Versión:** 1.0
**Fecha de Aprobación:** Agosto 2026
**Clasificación:** Confidencial / Uso Interno
**Marco Normativo:** ISO/IEC 27001:2022, ISO 8000-61:2016

---

## 1. OBJETIVO
Establecer los procedimientos y lineamientos técnicos para la operación del Sistema de Administración de Mantenimiento y Control (SAMC) por parte del personal con rol de **ADMINISTRADOR**, garantizando la integridad, disponibilidad y confidencialidad de la información del Sistema Eléctrico Nacional (SEN).

## 2. ALCANCE
Este documento aplica a todo el personal autorizado con credenciales de nivel "Administrador" dentro de la Gerencia General de Planificación de Distribución (GGPD) de CORPOELEC.

## 3. RESPONSABILIDADES DEL ADMINISTRADOR
El Administrador del sistema es el garante de:
- La correcta parametrización y configuración de la base de datos maestra (Supabase).
- El otorgamiento y revocación de accesos de usuarios al sistema (Control de Accesos - ISO 27001).
- La revisión y aprobación final de las metas físicas y la ejecución presupuestaria del Plan Operativo Anual (POA).
- La gestión integral de los Proyectos de Rehabilitación y Transformación del Sector Eléctrico Nacional (PRTSEN).

---

## 4. PROCEDIMIENTOS DE OPERACIÓN

### 4.1. Acceso al Sistema (Autenticación)
1. Ingrese a la URL oficial del Sistema SAMC.
2. El sistema presentará la pantalla de inicio de sesión de Planificación Eléctrica SEN.
3. Introduzca su **Usuario o Correo Institucional** y **Contraseña**.
4. Haga clic en **Autenticar y Acceder**.
5. *Nota de Seguridad:* Toda sesión exitosa o fallida queda registrada en el módulo de Auditoría ISO 27001.

### 4.2. Módulo: Dashboard General
El Dashboard proporciona una visión holística en tiempo real de los indicadores clave del SEN.
- **Acción:** Revise las métricas de Codificación RDS-PS, Proyectos PRTSEN, Ejecución POA y Cumplimiento de Normas ISO.
- **Validación:** El sistema alertará visualmente si existen discrepancias entre el presupuesto asignado y el ejecutado.

### 4.3. Módulo: Proyectos PRTSEN
Gestión de los proyectos estratégicos de rehabilitación.
- **Crear/Editar Proyecto:** Acceda al listado, seleccione la opción de registro y complete los campos obligatorios (Código RDS-PS, Dimensión, Estado, Monto USD, Avances).
- **Consistencia ISO 8000:** Todos los proyectos deben estar vinculados obligatoriamente a una acción del POA para garantizar la trazabilidad del gasto.

### 4.4. Módulo: POA & Presupuesto
Control de la planificación presupuestaria anual.
- **Asignación de Presupuesto:** El Administrador puede modificar los topes presupuestarios asignados a cada unidad ejecutora.
- **Metas Físicas:** Aprobación de la meta física programada frente a la meta física ejecutada.

### 4.5. Módulo: Auditoría ISO 27001
Revisión de las trazas de uso del sistema.
- **Consulta de Logs:** Ingrese al submódulo de Auditoría. El sistema mostrará un registro inmutable de quién, cuándo y qué acción se ejecutó en la base de datos.
- **Exportación:** Posibilidad de generar informes forenses ante incidentes de seguridad.

---

## 5. POLÍTICAS DE SEGURIDAD Y CALIDAD DE DATOS (ISO 27001 / ISO 8000)
1. **Control de Credenciales:** La contraseña del Administrador es intransferible y no debe ser almacenada en medios no seguros.
2. **Cierre de Sesión:** Es obligatorio usar la opción "Cerrar Sesión" al finalizar la jornada o ausentarse del puesto de trabajo.
3. **Calidad de Datos (ISO 8000):** Antes de realizar cargas masivas de proyectos PRTSEN, el Administrador debe validar el esquema, asegurando que no existan valores nulos en campos obligatorios como `codigo_rds` o `monto_usd`.
4. **Soft-Delete:** No está permitida la eliminación física de registros. Toda baja de un proyecto o acción POA debe realizarse mediante el cambio de estado (Inactivación lógica).

## 6. SOPORTE TÉCNICO E INCIDENCIAS
Ante cualquier falla crítica de la base de datos Supabase o comportamiento anómalo del sistema, el Administrador debe registrar el evento y notificar al equipo de infraestructura y ciberseguridad a través de los canales corporativos oficiales.
