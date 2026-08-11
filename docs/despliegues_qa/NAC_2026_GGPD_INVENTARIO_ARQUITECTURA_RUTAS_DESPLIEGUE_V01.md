# INFORME TÉCNICO DE INVENTARIO, RUTAS DE DESPLIEGUE, REPOSITORIOS Y CUENTAS INSTITUCIONALES (REPOSITORIO MAESTRO DE DISTRIBUCIÓN)

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_INVENTARIO_ARQUITECTURA_RUTAS_DESPLIEGUE_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO)  
**FECHA DE EMISIÓN:** 10 de Agosto de 2026  
**ENTIDAD:** Corporación Eléctrica Nacional S.A. (CORPOELEC) — Ministerio del Poder Popular para la Energía Eléctrica (MPPEE)  
**DESPACHO DESTINO:** Gerencia General de Planificación de Distribución (GGPD) | Coordinación de Área de Innovación y Tecnología  
**DIRIGIDO A:** Coordinación General de Área | Gerencia de Informática / Innovación | Líderes de QA  
**ELABORADO POR:** Equipo de Desarrollo Backend y Arquitectura de Datos  
**PLATAFORMA Y MODELO DE IA:** Antigravity Platform — Google Gemini 3.6 Flash (High)  
**MARCOS NORMATIVOS:** ISO 8000-110 | ISO/IEC 27001:2022 | ISO 9001:2015 | ISO 55000/55001 | ISACA COBIT 2019  

---

## 1. RESUMEN EJECUTIVO Y AUDITORÍA DE INFRAESTRUCTURA EN LA NUBE

El presente documento formaliza el inventario completo, consolidado y auditado de la arquitectura de software, cuentas de despliegue cloud, repositorios de código fuente (GitHub), cuentas de desarrollo de Inteligencia Artificial (**Google AI Studio**), integraciones backend y usuarios preconfigurados en base de datos para las **cuatro (4) aplicaciones institucionales** del **Repositorio Maestro de Distribución** de CORPOELEC.

Este informe da respuesta a los requerimientos institucionales de cara al inicio formal de la **Fase de Pruebas y Aseguramiento de Calidad (QA)** pautada para el día **15 de Agosto de 2026**, permitiendo la transferencia formal de la responsabilidad de seguimiento, soporte de usuario y validación funcional desde el equipo de Desarrollo Backend hacia la Gerencia General y la Coordinación del Área.

### 1.1. Resumen Consolidado de Cuentas e Infraestructura
* **Motor Base de Datos Unificado:** PostgreSQL 17 / Supabase Cloud Project (`owpiwacuotcaeruvonbd.supabase.co`).
* **Proveedor Cloud Primario de Despliegue:** Vercel Inc. & Cloud Google (Google Cloud Platform / Cloud Run).
* **Plataforma de Inteligencia Artificial:** Google AI Studio (SDK Nivel Servidor `@google/genai` con modelo Gemini 3.6 Flash).
* **Cuentas Cloud Institucionales Asociadas:**
  * `skidrowkodex@gmail.com` (Entorno de Desarrollo y Applets Cloud Google / AI Studio).
  * `ggpd.innovacion.corpelec@gmail.com` (Cuenta Institucional de Despliegue Vercel, Repositorios GitHub e AI Studio Producción).

---

## 2. MATRIZ TÉCNICA GENERAL DE ARQUITECTURA Y DESPLIEGUE

| Aplicación / Proyecto | Código / Subdirectorio | URL de Publicación / Despliegue | Motor & Cuenta Despliegue / Repositorio | Cuenta AI Studio & Modelo IA |
| :--- | :--- | :--- | :--- | :--- |
| **1. SCTIS V 2.0 Distribución** | `sctis-v-2.0-distribucion` | `https://sctis-interrupciones-distribucion.ai.studio` | Cloud Google (`skidrowkodex@gmail.com`) | `skidrowkodex@gmail.com` (Gemini 3.6 Flash) |
| **2. Gestor de Tareas y Minutas (SGTA)** | `corpoelec---gestor-de-tareas-y-minutas` | `https://ggpd-corpoelec-sc-tareas.ai.studio` | Cloud Google (`skidrowkodex@gmail.com`) | `skidrowkodex@gmail.com` (Gemini 3.6 Flash) |
| **3. Planificación Eléctrica SEN** | `planificación-eléctrica-sen` | `https://ggpd-planificacion-proyectos-poa.vercel.app/` | Vercel (`ggpd-planificacion-proyectos-poa` / `ggpd.innovacion.corpelec@gmail.com`) | `skidrowkodex@gmail.com` (Gemini 3.6 Flash) |
| **4. REMIX SCEIN (Equipos Indisponibles)** | `remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec` | `https://distribucion-indisponibles-sen.vercel.app/` | Vercel (`remix-scein` / `ggpd.innovacion.corpelec@gmail.com`) | `ggpd.innovacion.corpelec@gmail.com` (Gemini 3.6 Flash) |

---

## 3. FICHA TÉCNICA DETALLADA POR APLICACIÓN

---

### 3.1. SCTIS V 2.0 Distribución — Control de Interrupciones de Servicio

* **Nombre Oficial:** SCTIS V 2.0 Distribución (Seguimiento y Control de Tiras de Interrupción)
* **Ubicación en Repositorio Maestro:** `/apps/sctis-v-2.0-distribucion`
* **URL de Despliegue / Acceso Directo:** `https://sctis-interrupciones-distribucion.ai.studio`
* **Motor & Plataforma Cloud:** Cloud Google Runtime (cloud.google.com)
* **Cuenta de Despliegue:** `skidrowkodex@gmail.com`
* **Cuenta Google AI Studio:** `skidrowkodex@gmail.com`
* **Integraciones Activas:** Google Drive, Gmail, Google Gemini AI, Supabase PostgreSQL (`sctis` schema, `activos_red`).

#### A. Usuarios Preconfigurados y Credenciales en Base de Datos (`sctis.user_profiles`)

| Usuario (`username`) | Nombre Completo | Rol Asignado | Contraseña Inicial | Ámbito / Perfil Funcional |
| :--- | :--- | :--- | :--- | :--- |
| `c_favio` | Catherina Favio | `admin` | `Favio2026.` | Administrador General del Sistema |
| `ggpd_admin` | Administrador GGPD | `admin` | `Lunes35.` | Admin Gerencia General de Protección y Distribución |
| `fullstack001` | Full Stack Operator | `admin` | `Lunes35.` | Operador Técnico y Soporte de Infraestructura |
| `admin` | Administrador Sistema | `admin` | `password` | Cuenta Administrador por defecto |

#### B. Integración y Automatizaciones de Inteligencia Artificial
1. **Homologación Automática de Causas (`suggest_cause` y `batch_suggest_causes`):**
   * Mapea descripciones informales o de texto libre en planillas de interrupción hacia las **16 causas oficiales** institucionales (ej. *ROBO DE MATERIAL*, *CAIDA DE ARBOL*, *MANIOBRA EN LINEA MT*, *SOBRECORRIENTE EN FASE*).
   * Retorna un objeto JSON estructurado con: `causa_homologada`, `confianza` (0.0 a 1.0), `sub_causa_sugerida` y `justificacion`.
2. **Auditoría de Calidad de Datos ISO 8000 (`evaluate_quality_with_ai`):**
   * Analiza la coherencia temporal, niveles de tensión e integridad sintáctica del evento registrado.
   * Retorna `score` (0-100), `issues` (lista de hallazgos), `suggestions` y `estado_calculo` (*CALCULO VALIDO* / *REVISAR CALCULO*).
3. **Detección Inteligente de Duplicados (`detect_duplicates_with_ai`):**
   * Evalúa eventos solapados en subestación/circuito para prevenir doble contabilización de la Energía No Suministrada (ENS en MWh).

---

### 3.2. CORPOELEC — Gestor de Tareas y Minutas (SGTA)

* **Nombre Oficial:** CORPOELEC - Gestor de Tareas y Minutas
* **Ubicación en Repositorio Maestro:** `/apps/corpoelec---gestor-de-tareas-y-minutas`
* **URL de Despliegue / Acceso Directo:** `https://ggpd-corpoelec-sc-tareas.ai.studio`
* **Motor & Plataforma Cloud:** Cloud Google Runtime (Node.js Express Server + React Vite)
* **Cuenta de Despliegue:** `skidrowkodex@gmail.com`
* **Cuenta Google AI Studio:** `skidrowkodex@gmail.com`
* **Integraciones Activas:** Gemini AI, Google Drive Sync, Notificaciones por Correo Electrónico, Supabase PostgreSQL (`sctap` schema).

#### A. Usuarios Preconfigurados y Credenciales Registradas

| Usuario (`username`) | Nombre Completo | Rol / Cargo | Unidad Organizativa |
| :--- | :--- | :--- | :--- |
| `@w_prato` | Walter Prato | `analista` / Analista Senior | División de Planificación |
| `@c_fabio` / `@k_fabio` | Caterina Fabio (Fabio K.) | `analista` / Analista de Sistemas | División de Planificación |
| `@b_gonzalez` | Blanca González | `analista` / Asistente Gerencia General | Gerencia Gestión de Planificación |
| `@m_brito` | Michael Brito | `analista` / Control y Seguimiento | Grupo de Seguimiento y Control |
| `@a_garcia` | Arturo García | `analista` / Operaciones y Rescate SEN | Grupo de Seguimiento y Control |
| `@e_castro` | Esteban Castro | `analista` / Estadísticas y Cobertura | Grupo de Seguimiento y Control |
| `@j_bencomo` | Jaime Bencomo | `analista` / Redes de Distribución | División de Planificación |
| `@d_blanco` | Dayais E. Blanco | `analista` / Proyectos Energéticos | División de Planificación |
| `@j_jimenez` | Jorge Jiménez | `analista` / Incidencias Territoriales | Grupo de Seguimiento y Control |
| `@j_parra` | Jasmín Parra | `analista` / Cierres y Consolidación | Grupo de Seguimiento y Control |
| `@jo_parra` | Josser Parra | `analista` / Campo y Soporte Técnico | Grupo de Seguimiento y Control |

#### B. Integración y Automatizaciones de Inteligencia Artificial
1. **Parsing Multimodal Nativo de Minutas (PDF / Texto):**
   * Endpoint de servidor `/api/parse-minuta` ejecuta la versión multimodal de **Gemini 3.6 Flash** utilizando el SDK `@google/genai`.
   * Procesa directamente minutas en formato PDF sin necesidad de motores OCR de terceros, convirtiendo Base64 en datos estructurados.
2. **Esquema de Salida Estructurado (`responseSchema`):**
   * Garantiza la extracción estricta en formato JSON de: Metadatos de la reunión (Correlativo, Fecha DD/MM/YYYY e ISO, Hora, Modalidad, Coordinador), Lista de Asistentes con confirmación de asistencia, Tabla de Compromisos (Responsable, Tarea, Fecha Límite ISO, Prioridad, Área Técnica) y Pendientes por Área.
3. **Población Automática del Sistema:**
   * Alimenta el Tablero Kanban, los KPIs de seguimiento PRTSEN/POA y restringe el acceso mediante RBAC para que cada analista visualice únicamente las tareas bajo su responsabilidad.

---

### 3.3. Planificación Eléctrica SEN — Control de Proyectos POA & PRTSEN / Viáticos

* **Nombre Oficial:** Planificación Eléctrica SEN
* **Ubicación en Repositorio Maestro:** `/apps/planificación-eléctrica-sen`
* **Repositorio GitHub:** `ggpd-planificacion-proyectos-poa`
* **URL de Despliegue / Acceso Directo:** `https://ggpd-planificacion-proyectos-poa.vercel.app/`
* **Motor & Plataforma Cloud:** Vercel Inc.
* **Cuenta de Despliegue / GitHub Account:** `ggpd.innovacion.corpelec@gmail.com`
* **Cuenta Google AI Studio:** `skidrowkodex@gmail.com`
* **Integraciones Activas:** Gemini AI (`@google/genai`), Supabase PostgreSQL (Módulos PRTSEN, POA, SAMC, Viáticos y `activos_red`).

#### A. Usuarios Preconfigurados y Credenciales en Base de Datos

| Usuario (`username`) | Correo Institucional | Contraseña | Nombre Completo | Rol Asignado | Cargo / Unidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `j_pacheco` | `j_pacheco@corpoelec.gob.ve` | `Pacheco2026.` | Josue D. Pacheco | `ADMINISTRADOR` | Administrador Sistema / GGPD |
| `ggpd_admin` | `ggpd_admin@corpoelec.gob.ve` | `Lunes35.` | Administrador GGPD | `ADMINISTRADOR` | Administrador General GGPD |
| `w_prato` | `w_prato@corpoelec.gob.ve` | `Prato2026.` | Walter Prato | `ESPECIALISTA` | Especialista Planificación / GGPD |
| `j_bencomo` | `j_bencomo@corpoelec.gob.ve` | `Bencomo2026.` | Jaime Bencomo | `ESPECIALISTA` | Especialista Proyectos PRTSEN |
| `c_reyes` | `c_reyes@corpoelec.gob.ve` | `Reyes2026.` | Carlos Reyes | `ESPECIALISTA` | Especialista Evaluación POA & RDS-PS |
| `a_correa` | `a_correa@corpoelec.gob.ve` | `Correa2026.` | Adrian Correa | `ESPECIALISTA` | Especialista Control Operativo |
| `analista_gestion` | `analista_gestion@corpoelec.gob.ve` | `Lunes35.` | Lcdo. Juan Pérez | `ANALISTA` | Analista Control Territorial |

#### B. Integración de Inteligencia Artificial y Controles Financieros
1. **Google Gemini API (`@google/genai`):**
   * Asistente inteligente integrado en servidor para la lectura e interpretación de planes de trabajo, resúmenes ejecutivos POA/PRTSEN y validación de normas de auditoría.
2. **Hardening de Base de Datos para Viáticos (ISACA COBIT 2019 MEA02):**
   * Disparador preventivo `fn_validar_presupuesto_viatico`: Bloquea e impide la asignación de viáticos que superen el saldo disponible de la partida.
   * Vistas de Conciliación 360°: `v_conciliacion_presupuestaria` y `v_resumen_conciliacion`.
   * Validación de comprobantes: Exige 100% de facturas en estado `VALIDADO` antes de permitir el cierre administrativo.

---

### 3.4. REMIX SCEIN — Control de Equipos Indisponibles CORPOELEC

* **Nombre Oficial:** REMIX SCEIN - seguimiento y control de equipos indisponibles CORPOELEC
* **Ubicación en Repositorio Maestro:** `/apps/remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec`
* **Repositorio GitHub:** `remix-scein`
* **URL de Despliegue / Acceso Directo:** `https://distribucion-indisponibles-sen.vercel.app/`
* **Motor & Plataforma Cloud:** Vercel Inc.
* **Cuenta de Despliegue / GitHub Account:** `ggpd.innovacion.corpelec@gmail.com`
* **Cuenta Google AI Studio:** `ggpd.innovacion.corpelec@gmail.com`
* **Integraciones Activas:** Gemini AI (`@google/genai`), Supabase PostgreSQL, jsPDF, XLSX Parser.

#### A. Usuarios Preconfigurados y Credenciales Registradas

| Nombre Completo | Usuario (`username`) | Correo Electrónico | Perfil / Rol | Ámbito / Estado | Contraseña Inicial |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Administrador General GGPD | `ggpd_admin` | `admin.ggpd@corpoelec.gob.ve` | `ADMIN_NACIONAL` | Nacional (Global) | `Lunes35.` |
| Ing. J. Jiménez | `j_jimenez` | `j.jimenez@corpoelec.gob.ve` | `ADMIN_NACIONAL` | Nacional (Global) | `Jimenez2026.` |
| Ing. J. Pacheco | `j_pacheco` | `j.pacheco@corpoelec.gob.ve` | `Pacheco2026.` | `ADMIN_NACIONAL` | Nacional (Global) | `Pacheco2026.` |
| Ing. Y. Cipiran | `y_cipiran` | `y.cipiran@corpoelec.gob.ve` | `ADMIN_NACIONAL` | Nacional (Global) | `Cipiran2026.` |
| Analista Estatal Táchira | `e_tachira` | `analista.tachira@corpoelec.gob.ve` | `ANALISTA_ESTATAL` | Táchira (TA) | `Tachira2026.` |
| Auditor ISO 8000 / 27001 | `a_auditor` | `auditoria.iso@corpoelec.gob.ve` | `AUDITOR` | Solo Lectura | `Auditor2026.` |

#### B. Integración y Automatizaciones de Inteligencia Artificial
1. **Server-Side API Gemini (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`):**
   * Ejecución segura en servidor Node.js/Express mediante `@google/genai` sin exposición de API Keys en el cliente web.
2. **Ingesta y Deduplicación de Planillas Estadales (ISO 55000 / ISO 8000):**
   * Procesa planillas de los 24 estados federales detectando automáticamente errores en niveles de tensión (**765 kV, 400 kV, 230 kV, 115 kV, 34.5 kV, 13.8 kV**).
   * Algoritmo de Huella Digital Criptográfica SHA-256 (`generateEquipmentFingerprint`) para aislar duplicados y enviar registros inconsistentes a la Bandeja de Cuarentena.

---

## 4. ARQUITECTURA DE SEGURIDAD Y DEFENSA EN BASE DE DATOS (ISO/IEC 27001)

Las cuatro aplicaciones comparten las siguientes directrices de seguridad de datos:

1. **Row-Level Security (RLS) en PostgreSQL:** Ningún usuario o cliente frontend puede modificar o acceder a registros fuera de su ámbito asignado (Nacional, Estatal o Específico).
2. **Seguridad de Claves de API:** Las claves `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y cadenas de conexión a base de datos están almacenadas en variables de entorno de servidor protegidas.
3. **Segregación de Funciones (SoD - COBIT 2019):** Separación estricta entre perfiles de consulta/auditoría (`AUDITOR`), analistas territoriales (`ANALISTA_ESTATAL`), especialistas (`ESPECIALISTA`) y supervisores generales (`ADMIN_NACIONAL` / `ADMINISTRADOR`).

---

## 5. PLAN DE ACCIÓN Y HOJA DE RUTA PARA EL INICIO DE QA (15 DE AGOSTO DE 2026)

Para formalizar la transición de responsabilidades y permitir que la Coordinación de Área asuma el seguimiento operativo con los usuarios finales:

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                    HOJA DE RUTA DE INICIO DE LA FASE DE PRUEBAS DE QA                     │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────────┤
│ HITO 1: 10-12 AGOSTO     │ HITO 2: 13-14 AGOSTO     │ HITO 3: 15 DE AGOSTO DE 2026         │
│ Notificación e Inducción │ Distribución Credenciales│ Arranque Masivo QA Operativo        │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────────┤
│ Envío de Resumen Exec.   │ Entrega de accesos a los │ Ingesta de datos en las 4 apps por  │
│ a Coordinadores de Área. │ usuarios en cada grupo.  │ parte de los analistas de las 24 EE. │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────────┘
```

1. **Paso 1 (Coordinación de Área):** Enviar el informe resumido ejecutivo a los coordinadores y jefes de división para formalizar la asignación de cuentas.
2. **Paso 2 (Grupos de Usuarios):** Distribuir las credenciales preconfiguradas y enlaces de despliegue a los respectivos usuarios de las 24 entidades federales.
3. **Paso 3 (Ciclo de Feedback y QA):** Registrar las observaciones funcionales y requerimientos de ajuste durante la fase de QA iniciada el 15 de Agosto.

---

**Documento Elaborado por:** Equipo de Desarrollo Backend y Arquitectura de Datos  
**Revisado para:** Coordinación de Área y Gerencia General de Planificación de Distribución (GGPD)  
**Código Normativo:** `GGPD-SGM-INS-005 (v3.0 ISO)` | **Versión:** V01  
