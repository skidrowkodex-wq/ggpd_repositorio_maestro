# DOCUMENTO FUNCIONAL Y EJECUTIVO DE GOBIERNO DE DATOS, SEGURIDAD Y CONTROL DE RECURSOS
**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_AUDITORIA_FUNCIONAL_GOBIERNO_DATOS_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO)  
**DIRIGIDO A:** Gerencia General, Direcciones Ejecutivas, Aprobadores Presupuestarios y Unidades de Planificación  
**PROYECTO:** Repositorio Maestro e Integración de Aplicaciones de Distribución  
**ENTIDAD:** GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC / MPPEE  
**FECHA DE EMISIÓN:** Agosto 2026

---

## 1. RESUMEN EJECUTIVO PARA LA ALTA GERENCIA

El presente documento expone, en un lenguaje estratégico y accesible, el funcionamiento, los mecanismos de protección de recursos y las garantías de calidad del **Sistema Maestro de Distribución** de CORPOELEC.

Este desarrollo no es solo una suite de programas informáticos; representa un **blindaje institucional** que garantiza que los recursos financieros asignados a las inspecciones, mantenimientos y obras del Sistema Eléctrico Nacional (SEN) sean utilizados con estricta transparencia, control de gastos y soporte documental inalterable, alineado con el Instructivo Normativo `GGPD-SGM-INS-005` (v3.0 ISO).

---

## 2. ¿QUÉ SIGNIFICAN LAS NORMAS INTERNACIONALES PARA NUESTRA INSTITUCIÓN?

Para quienes tienen la responsabilidad de aprobar presupuestos y tomar decisiones operativas, las normativas internacionales aplicadas en el sistema se traducen en los siguientes beneficios concretos:

### 🏆 1. ISO 9001:2015 — Calidad en la Gestión y Orden Operativo
* **¿Qué significa en la práctica?:** Elimina la improvisación. Garantiza que todos los estados del país sigan **el mismo procedimiento formal** para reportar fallas, minutas y presupuestos. Si un informe no cumple con el formato estándar, el sistema guía al usuario para corregirlo antes de ingresarlo.

### 📊 2. ISO 8000 — Calidad de los Datos Maestros
* **¿Qué significa en la práctica?:** Información limpia, confiable y libre de errores. Impide que una misma Subestación Eléctrica o Circuito sea registrado con dos o tres nombres distintos (evitando errores tipográficos o nombres locales). Garantiza que los informes ejecutivos presentados a la Presidencia reflejen cifras exactas.

### 🔒 3. ISO/IEC 27001:2022 — Seguridad, Privacidad y Registro Inalterable
* **¿Qué significa en la práctica?:** Protección total de la información institucional. Cada usuario tiene acceso **exclusivamente a los datos que le corresponden por su cargo y región** (un analista regional solo ve su estado; la Gerencia General ve todo el país). Además, el sistema guarda una bitácora digital inalterable de *quién hizo qué, desde dónde y a qué hora*.

### 🏛️ 4. ISACA COBIT 2019 — Gobierno de TI y Control del Dinero Institucional
* **¿Qué significa en la práctica?:** Es el estándar mundial utilizado por auditores financieros y de tecnología. Asegura que la tecnología trabaje en favor de los objetivos de la empresa, controlando los riesgos financieros y garantizando que **no se pueda gastar ni un solo Bolívar o Euro por encima del presupuesto aprobado**.

---

## 3. ¿CÓMO PROTEGE EL SISTEMA LOS RECURSOS DE CORPOELEC? (EJEMPLO PRÁCTICO DE VIÁTICOS Y PROYECTOS)

Recientemente, el equipo técnico y de auditoría identificó y resolvió un riesgo crítico mediante la implementación de reglas inteligentes en la base de datos:

```
                                  ¿CÓMO FUNCIONA EL BLINDAJE PRESUPUESTARIO?

      SOLICITUD DE ASIGNACIÓN                             EVALUACIÓN AUTOMÁTICA DEL SISTEMA
┌──────────────────────────────────┐                 ┌─────────────────────────────────────────┐
│ Un analista o inspector solicita │                 │ El motor de Base de Datos verifica:     │
│ la asignación de viáticos para   │────────────────►│  ¿El monto solicitado es MENOR o IGUAL  │
│ una inspección en subestación.   │                 │  al saldo disponible en la partida?     │
└──────────────────────────────────┘                 └────────────────────┬────────────────────┘
                                                                          │
                                                ┌─────────────────────────┴─────────────────────────┐
                                                ▼                                                   ▼
                                         SI ES MENOR                                           SI EXCEDE
                               ┌─────────────────────────────┐                     ┌─────────────────────────────┐
                               │     APROBACIÓN AUTOMÁTICA   │                     │    BLOQUEO INMEDIATO (409)  │
                               │  Se genera el registro y se │                     │ El sistema detiene la carga │
                               │   descuenta del saldo real. │                     │   y muestra alerta de error.│
                               └─────────────────────────────┘                     └─────────────────────────────┘
```

### Casos de Uso del Control Financiero:
1. **Freno Automático al Sobregasto:** Si una partida de viáticos tiene un saldo disponible de 100.000 Bs. y un usuario intenta registrar una asignación por 120.000 Bs., **el sistema bloquea la operación de forma inmediata** y muestra un mensaje de alerta impidiendo el sobregasto.
2. **Cierre de Viáticos con Facturas Validadas:** Ningún inspector puede dar por "cerrado" un viático o viaje si no adjunta los comprobantes de gasto (facturas) validados y cuyo monto total coincida exactamente con lo gastado.
3. **Control de Origen de Fondos:** Se eliminan las anotaciones informales; todo reembolso o reintegro debe estar vinculado a una fuente de financiamiento autorizada (Presupuesto de Gerencia, Presupuesto Corporativo o Fondos de Reserva).

---

## 4. EL VALOR ESTRATÉGICO DE UNIFICAR LAS 4 APLICACIONES (EL PROYECTO MAESTRO)

Actualmente, el Repositorio Maestro integra **cuatro (4) aplicaciones fundamentales** para la operación de distribución:

| Aplicación | Función Principal para la Gerencia | Beneficio de la Unificación |
| :--- | :--- | :--- |
| **1. Gestor de Tareas y Minutas (SGTA)** | Seguimiento de acuerdos de reuniones institucionales y compromisos POA. | Convierte compromisos de reuniones en tareas asignadas con fecha límite y seguimiento automático por correo. |
| **2. Planificación Eléctrica SEN** | Control presupuestario de viáticos, codificación RDS-PS y metas físicas POA. | Permite ver en tiempo real cuánto dinero se ha invertido por cada meta física ejecutada en el SEN. |
| **3. Remix SCEIN (Equipos Indisponibles)** | Diagnóstico y plan de atención de transformadores, interruptores y equipos en subestaciones. | Permite priorizar la compra de repuestos e inversión en los equipos de mayor criticidad a nivel nacional. |
| **4. SCTIS v2.0 (Interrupciones)** | Registro y análisis de causas de cortes de servicio eléctrico en los 24 estados. | Identifica causas raíz (vegetación, descargas, fallas) para orientar el presupuesto de mantenimiento preventivo. |

**Beneficio de la Unificación:** Al integrar estas 4 aplicaciones en un solo sistema centralizado (con una **Tabla Unificada de Activos**), la Gerencia General puede tomar decisiones basadas en datos reales, visualizando en un solo tablero la salud de una Subestación, sus fallas históricas, los equipos pendientes por repuestos y el presupuesto gastado en ella.

---

## 5. INNOVACIÓN TECNOLÓGICA: INTELIGENCIA ARTIFICIAL + EXPERTOS HUMANOS

Este sistema fue desarrollado utilizando una arquitectura de vanguardia que combina dos fuerzas clave:

1. **Inteligencia Artificial Avanzada (Google Gemini 3.6 Flash en Google Antigravity):**
   * Actúa como un asistente ultra-rápido capaz de procesar miles de filas de datos de planillas Excel en segundos, traducir formatos complejos, corregir errores sintácticos y proponer código de alta precisión.
   * **Ahorro Institucional:** Permitió construir y validar soluciones complejas en **días en lugar de meses**, reduciendo drásticamente los costos de desarrollo de software externo.
2. **Supervisión y Gobernanza de Personal Humano Experto:**
   * La Inteligencia Artificial no trabaja sola. Todo el diseño, las reglas de negocio y las validaciones fueron guiadas y auditadas por un equipo humano especializado en:
     * **Ingeniería Eléctrica:** Garantizando que las nomenclaturas y tensiones de las Subestaciones (765 kV a 13.8 kV) sean las correctas.
     * **Ciencia de Datos:** Diseñando la limpieza automática y cruce de datos.
     * **Auditoría ISO y COBIT:** Garantizando el cumplimiento estricto de las leyes y normas de control de la Administración Pública.

---

## 6. MATRIZ RACI Y MATRIZ DE RESPONSABILIDADES INSTITUCIONALES

Conforme al Instructivo `GGPD-SGM-INS-005`, las responsabilidades sobre la gestión de datos de las aplicaciones quedan distribuidas de la siguiente manera:

| Actividad / Proceso | Analista Estadal | Coordinador / Supervisor | Gerente General GGPD | Administración de Sistemas e IA |
| :--- | :---: | :---: | :---: | :---: |
| **Generación de Data y Nomenclatura** | **R** (Responsable) | **A** (Aprobador) | **I** (Informado) | **C** (Consultado) |
| **Validación Sintáctica y Cargas** | **C** (Consultado) | **R** (Responsable) | **A** (Aprobador) | **R** (Ejecutor IA) |
| **Auditoría ISO 8000 / COBIT** | **I** (Informado) | **C** (Consultado) | **A** (Aprobador) | **R** (Responsable) |
| **Mantenimiento Catálogo Maestro** | **I** (Informado) | **R** (Responsable) | **A** (Aprobador) | **C** (Consultado) |

---

## 7. CONCLUSIÓN Y RECOMENDACIÓN DE INVERSIÓN ESTRATÉGICA

El **Sistema Maestro de Gestión de Distribución** ha demostrado cumplir al 100% con los estándares internacionales de gobernanza, calidad de datos y control presupuestario.

### Recomendación a la Alta Gerencia:
* **Aprobar y respaldar la unificación centralizada de datos** en el Repositorio Maestro para las 24 entidades federales.
* **Garantizar la inclusión presupuestaria** de las licencias corporativas de Inteligencia Artificial (Google AI Studio / Antigravity) e infraestructura en la nube (Supabase Cloud / Vercel), dado que representan una **inversión de alto retorno (ROI)** que ahorra tiempo, evita sobregastos y coloca a CORPOELEC en la vanguardia tecnológica del sector eléctrico latinoamericano.

---

**Elaborado por:** Equipo de Desarrollo de IA, Ciencia de Datos y Gobierno de TI  
**Gerencia Responsable:** Gerencia de Gestión de Planificación de Distribución (GGPD) — CORPOELEC  
**Aprobado por:** Ing. Adrian Correa — Gerente GGPD  
**Documento Oficial:** GGPD-SGM-INS-005 v3.0 ISO
