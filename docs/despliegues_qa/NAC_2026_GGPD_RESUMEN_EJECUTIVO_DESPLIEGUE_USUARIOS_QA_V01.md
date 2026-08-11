# MEMORÁNDUM EJECUTIVO: ENLACES DE DESPLIEGUE, CUENTAS DE USUARIO Y HOJA DE RUTA PARA LA FASE DE QA

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_RESUMEN_EJECUTIVO_DESPLIEGUE_USUARIOS_QA_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO)  
**FECHA DE EMISIÓN:** 10 de Agosto de 2026  
**PARA:** Coordinación General de Área | Jefes de División | Supervisores de Grupo  
**DE:** Área de Innovación, Tecnología y Desarrollo Backend (GGPD)  
**ASUNTO:** Transmisión formal de accesos, enlaces de publicación y cuentas de usuario para el inicio de la Fase de Aseguramiento de Calidad (QA) - 15 de Agosto de 2026  

---

## 1. PRESENTACIÓN Y OBJETIVO INSTITUCIONAL

Estimados Coordinadores y Jefes de Equipo,

Cumpliendo con las directrices de la Gerencia General de Planificación de Distribución (GGPD) y con miras al inicio formal de la **Fase de Aseguramiento de Calidad (QA) y Pruebas Operativas** pautada para el próximo **15 de Agosto de 2026**, se remite la información correspondiente a las **cuatro (4) aplicaciones corporativas** que componen el **Repositorio Maestro de Distribución**.

El propósito del presente documento es proporcionar a cada Coordinador de Área el desglose directo de los **enlaces de acceso web (URLs de despliegue)** y las **cuentas de usuario preconfiguradas con sus respectivas contraseñas y roles**, de manera que puedan formalizar la entrega de credenciales a los analistas y especialistas de los grupos operativos en las 24 entidades federales.

---

## 2. DESGLOSE DE APLICACIONES, ENLACES WEB Y CREDENCIALES DE ACCESO

Below is the detail of each application ready to be copied or distributed to the respective workgroups:

---

### APLICACIÓN 1: SCTIS V 2.0 Distribución (Control de Interrupciones)
* **Descripción:** Ingesta automatizada, homologación con Inteligencia Artificial y cálculo de la Energía No Suministrada (ENS) en tiras de interrupción de servicio.
* **Enlace de Acceso Directo (QA):** `https://sctis-interrupciones-distribucion.ai.studio`
* **Tecnología IA:** Google Gemini 3.6 Flash (Homologación de causas y auditoría ISO 8000).

#### Usuarios Registrados y Credenciales:
| Usuario (`username`) | Nombre Completo | Rol Asignado | Contraseña Inicial | Ámbito / Perfil |
| :--- | :--- | :--- | :--- | :--- |
| `c_favio` | Catherina Favio | Admin General | `Favio2026.` | Administradora General |
| `ggpd_admin` | Administrador GGPD | Admin GGPD | `Lunes35.` | Admin Gerencia General |
| `fullstack001` | Full Stack Operator | Soporte Técnico | `Lunes35.` | Operador Técnico / Soporte |
| `admin` | Administrador Sistema | Admin Defecto | `password` | Cuenta Administrador Base |

---

### APLICACIÓN 2: CORPOELEC - Gestor de Tareas y Minutas (SGTA)
* **Descripción:** Carga multimodal de minutas de reunión (PDF/Texto), extracción automatizada de compromisos mediante Inteligencia Artificial y seguimiento en Tablero Kanban.
* **Enlace de Acceso Directo (QA):** `https://ggpd-corpoelec-sc-tareas.ai.studio`
* **Tecnología IA:** Gemini 3.6 Flash Nactivo Multimodal (`/api/parse-minuta`).

#### Usuarios Registrados y Asignación por Áreas:
| Usuario (`username`) | Nombre Completo | Perfil / Cargo | Unidad Organizativa |
| :--- | :--- | :--- | :--- |
| `@w_prato` | Walter Prato | Analista Senior | División de Planificación |
| `@c_fabio` / `@k_fabio` | Caterina Fabio (Fabio K.) | Analista de Sistemas | División de Planificación |
| `@b_gonzalez` | Blanca González | Asistente de Gerencia | Gerencia Gestión de Planificación |
| `@m_brito` | Michael Brito | Control y Seguimiento | Grupo de Seguimiento y Control |
| `@a_garcia` | Arturo García | Operaciones y Rescate SEN | Grupo de Seguimiento y Control |
| `@e_castro` | Esteban Castro | Estadísticas y Cobertura | Grupo de Seguimiento y Control |
| `@j_bencomo` | Jaime Bencomo | Redes de Distribución | División de Planificación |
| `@d_blanco` | Dayais E. Blanco | Proyectos Energéticos | División de Planificación |
| `@j_jimenez` | Jorge Jiménez | Incidencias Territoriales | Grupo de Seguimiento y Control |
| `@j_parra` | Jasmín Parra | Cierres y Consolidación | Grupo de Seguimiento y Control |
| `@jo_parra` | Josser Parra | Campo y Soporte Técnico | Grupo de Seguimiento y Control |

---

### APLICACIÓN 3: Planificación Eléctrica SEN (Proyectos POA & PRTSEN / Viáticos)
* **Descripción:** Control de ejecución física y financiera del Plan de Respuesta Técnica del SEN (PRTSEN), proyectos POA y módulo de validación presupuestaria de viáticos en campo.
* **Enlace de Acceso Directo (QA):** `https://ggpd-planificacion-proyectos-poa.vercel.app/`
* **Tecnología IA:** Gemini API (`@google/genai`) para asistencia en planificación e interpretación normativa.

#### Usuarios Registrados y Credenciales:
| Usuario (`username`) | Correo Institucional | Contraseña | Nombre Completo | Rol Asignado | Cargo / Unidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `j_pacheco` | `j_pacheco@corpoelec.gob.ve` | `Pacheco2026.` | Josue D. Pacheco | `ADMINISTRADOR` | Administrador Sistema (GGPD) |
| `ggpd_admin` | `ggpd_admin@corpoelec.gob.ve` | `Lunes35.` | Administrador GGPD | `ADMINISTRADOR` | Administrador General GGPD |
| `w_prato` | `w_prato@corpoelec.gob.ve` | `Prato2026.` | Walter Prato | `ESPECIALISTA` | Especialista Planificación |
| `j_bencomo` | `j_bencomo@corpoelec.gob.ve` | `Bencomo2026.` | Jaime Bencomo | `ESPECIALISTA` | Especialista Proyectos PRTSEN |
| `c_reyes` | `c_reyes@corpoelec.gob.ve` | `Reyes2026.` | Carlos Reyes | `ESPECIALISTA` | Especialista Evaluación POA |
| `a_correa` | `a_correa@corpoelec.gob.ve` | `Correa2026.` | Adrian Correa | `ESPECIALISTA` | Especialista Control Operativo |
| `analista_gestion` | `analista_gestion@corpoelec.gob.ve` | `Lunes35.` | Lcdo. Juan Pérez | `ANALISTA` | Analista Control Territorial |

---

### APLICACIÓN 4: REMIX SCEIN — Control de Equipos Indisponibles
* **Descripción:** Registro técnico, catálogo de criticidad y control de inventario de equipos de patio indisponibles (Transformadores de Potencia, SF6, Seccionadores) en las 838 subestaciones.
* **Enlace de Acceso Directo (QA):** `https://distribucion-indisponibles-sen.vercel.app/`
* **Tecnología IA:** Gemini 3.6 Flash Server-Side (Validación sintáctica ISO 8000 y deduplicación SHA-256).

#### Usuarios Registrados y Credenciales:
| Nombre Completo | Usuario (`username`) | Correo Electrónico | Perfil / Rol | Ámbito | Contraseña Inicial |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Administrador General GGPD | `ggpd_admin` | `admin.ggpd@corpoelec.gob.ve` | `ADMIN_NACIONAL` | Nacional (Global) | `Lunes35.` |
| Ing. J. Jiménez | `j_jimenez` | `j.jimenez@corpoelec.gob.ve` | `ADMIN_NACIONAL` | Nacional (Global) | `Jimenez2026.` |
| Ing. J. Pacheco | `j_pacheco` | `j.pacheco@corpoelec.gob.ve` | `Pacheco2026.` | `ADMIN_NACIONAL` | Nacional (Global) | `Pacheco2026.` |
| Ing. Y. Cipiran | `y_cipiran` | `y.cipiran@corpoelec.gob.ve` | `ADMIN_NACIONAL` | Nacional (Global) | `Cipiran2026.` |
| Analista Estatal Táchira | `e_tachira` | `analista.tachira@corpoelec.gob.ve` | `ANALISTA_ESTATAL` | Táchira (TA) | `Tachira2026.` |
| Auditor ISO 8000 / 27001 | `a_auditor` | `auditoria.iso@corpoelec.gob.ve` | `AUDITOR` | Solo Lectura | `Auditor2026.` |

---

## 3. INSTRUCCIONES PARA LOS COORDINADORES Y PRÓXIMOS PASOS

1. **Distribución de Accesos (10 a 14 de Agosto):** Cada Coordinador de Área enviará a su personal a cargo el enlace web correspondiente a la aplicación que operará, junto a sus credenciales individuales.
2. **Inicio del Periodo de Pruebas (15 de Agosto):** Los usuarios ingresar con sus claves iniciales para realizar pruebas de carga de minutas, reporte de interrupciones, registro de viáticos e ingesta de equipos indisponibles.
3. **Canal de Observaciones:** Cualquier consulta técnica o reporte de hallazgos durante el QA será centralizado por la Coordinación de Área para su canalización con el equipo técnico.

---

**Atentamente,**

**Área de Innovación, Tecnología y Desarrollo Backend**  
Gerencia General de Planificación de Distribución (GGPD) — CORPOELEC  
*Norma de Documentación Institucional GGPD-SGM-INS-005 (v3.0 ISO)*  
