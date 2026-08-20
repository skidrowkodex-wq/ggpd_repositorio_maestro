# MEMORÁNDUM EJECUTIVO: ENLACES DE DESPLIEGUE, CUENTAS DE USUARIO, REGLAS DE NEGOCIO Y HOJA DE RUTA PARA LA FASE DE QA

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_RESUMEN_EJECUTIVO_DESPLIEGUE_USUARIOS_QA_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO)  
**FECHA DE EMISIÓN / ACTUALIZACIÓN:** 14 de Agosto de 2026  
**PARA:** Coordinación General de Área | Jefes de División | Supervisores de Grupo | Coordinadores Estadales (25 Entidades)  
**DE:** Equipo de Automatización e Ingeniería de Productos con IA, de Planificación de Distribución  
**ASUNTO:** Transmisión formal de accesos, enlaces de publicación, catálogo de credenciales, reglas de negocio estandarizadas y Single Sign-On (SSO) para el Aseguramiento de Calidad (QA)  

---

## 1. PRESENTACIÓN Y OBJETIVO INSTITUCIONAL

Estimados Coordinadores, Jefes de División y Supervisores Territoriales,

Cumpliendo con las directrices de la Gerencia General de Planificación de Distribución (GGPD) y con miras a la **Fase de Aseguramiento de Calidad (QA) y Pruebas Operativas Integradas**, se remite la información formal correspondiente a las **cinco (5) aplicaciones corporativas** que componen el **Repositorio Maestro de Distribución**:

1. **SIGI:** Sistema Integrado de Gestión y Planificación de Distribución (Portal Maestro Central).
2. **SCTIS V2.0:** Seguimiento y Control de Tiras de Interrupciones.
3. **SCPPE V3.0:** Seguimiento y Control de Planes y Proyectos Especiales (POA, PRTSEN, Viáticos SAMC).
4. **SCEIN V3.0:** Seguimiento y Control de Equipos Indisponibles de Subestaciones.
5. **SCMTP V2.0:** Seguimiento y Control de Minutas y Tareas de Planificación.

El presente memorándum detalla los enlaces web de producción, la matriz oficial de credenciales (cuentas ejecutivas, especialistas y 25 coordinaciones estadales) y las **cinco (5) reglas de negocio y gobernanza estandarizadas**.

---

## 2. REGLAS DE NEGOCIO Y GOBERNANZA ESTANDARIZADAS (ISO 27001 / COBIT 2019)

Para garantizar la integridad operativa, la segregación de funciones (*Segregation of Duties - SoD*) y la seguridad de la información, rigen las siguientes directivas obligatorias:

### ⚡ Regla 1: Acceso Total Automatizado para Administradores y Gerencia vía SSO
* Los usuarios con rol `ADMINISTRADOR` o `GERENCIA` (`ggpd_admin`, `j_pacheco`, `a_correa`, `c_favio`) poseen acceso irrestricto a todas las herramientas del portal.
* Al hacer clic en *"Ejecutar Aplicación"* desde el lanzador de SIGI, se establece un apretón de manos (**Single Sign-On - SSO**) que los autentica de forma silenciosa en las aplicaciones satélites, eliminando la necesidad de reintroducir contraseñas.

### 👷 Regla 2: Acceso Condicionado a Aplicaciones para Especialistas y Operadores de Estado
* Los ingenieros especialistas y operadores asignados a una entidad federal (ej. `w_prato` [Miranda], `j_bencomo` [Carabobo], `r_cipiran` [Zulia]) ingresan a las aplicaciones satélites vía SSO **únicamente si cuentan con autorización activa (check de permiso encendido) en su ficha de usuario administrada en el SIGI**.
* Si un especialista no está permisado para una app, la tarjeta mostrará el candado institucional (`🔒 Requiere Permiso`) y registrará cualquier intento denegado en la bitácora de seguridad ISO 27001.

### 👁️ Regla 3: Aislamiento Operativo de Cuentas Estadales de Solo Visualización (`coord_*`)
* Las 25 cuentas nominales de coordinación estadal (`coord_capital`, `coord_tachira`, `coord_zulia`, etc.) poseen el rol exclusivo **`VISOR_ESTADAL`**.
* Tienen acceso completo al portal SIGI para consultar tableros estadales, mapas geoespaciales de subestaciones/circuitos y minutas de su jurisdicción, pero **tienen el acceso deshabilitado a las aplicaciones maestras transaccionales externas**. Esto previene modificaciones de datos de red o inventario de forma genérica o no atribuible a un funcionario específico.

### 🗺️ Regla 4: Fijación Territorial Automática (State-Lock)
* La jurisdicción territorial se asigna automáticamente a la sesión a partir del perfil registrado en la base de datos (`matchedUser.stateCode`).
* Se erradicó el ComboBox manual de estado en la pantalla de inicio de sesión, garantizando que ningún operador pueda conmutar arbitrariamente la data de otra entidad.

### 🛡️ Regla 5: Blindaje Criptográfico de Credenciales y Trazabilidad ISO 27001
* Se prohíbe terminantemente la presencia de claves escritas en texto claro o botones de acceso rápido pre-rellenados en las pantallas de ingreso.
* Todas las contraseñas institucionales cumplen con la política de complejidad (mínimo 8 caracteres, mayúsculas, números y caracteres especiales `!.`).

---

## 3. DESGLOSE DE APLICACIONES Y ENLACES WEB DE DESPLIEGUE

---

### APLICACIÓN 1: Portal Maestro Central SIGI (Gestión y Planificación de Distribución)
* **Descripción:** Portal central unificado, showcase ministerial del SEN, lanzador corporativo SSO, visor geoespacial de 838 Subestaciones y módulo de administración de usuarios.
* **Enlace de Despliegue QA:** `http://localhost:3001` (Portal Unificado) / `http://localhost:5000` (Monorepo Maestro)
* **Integración Nube:** Google Cloud Drive oficial (`bk.ggpd.corpoelec@gmail.com` / Carpeta `1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7`).
* **Webhook Oficial:** Google Apps Script (`https://script.google.com/macros/s/AKfycbxonVU31GBXuVCfu_5G8hmADkYFB7yriPJVt2nS9w7uMjsERu5_WPzpQSVbuB2kvtQkqA/exec`).

---

### APLICACIÓN 2: SCTIS V2.0 — Seguimiento y Control de Tiras de Interrupciones
* **Descripción:** Ingesta y deduplicación de tiras de interrupción, cálculo de ENS y homologación de causas con IA Gemini 3.6 Flash.
* **Enlace de Despliegue QA:** `https://sctis-interrupciones-distribucion.ai.studio` (Puerto local `:3002`)
* **Color de Proceso:** Cian Eléctrico (`#00f2fe`)

---

### APLICACIÓN 3: SCPPE V3.0 — Planes y Proyectos Especiales (POA, PRTSEN & Viáticos)
* **Descripción:** Control de ejecución de proyectos PRTSEN, vinculación POA y validación de presupuesto de viáticos con control COBIT.
* **Enlace de Despliegue QA:** `https://ggpd-planificacion-proyectos-poa.vercel.app/` (Puerto local `:3004`)
* **Color de Proceso:** Dorado Energía (`#ffd700`)

---

### APLICACIÓN 4: SCEIN V3.0 — Equipos Indisponibles de Subestaciones
* **Descripción:** Catálogo de criticidad y control en tiempo real de transformadores de potencia y bahías fuera de servicio.
* **Enlace de Despliegue QA:** `https://distribucion-indisponibles-sen.vercel.app/` (Puerto local `:3005`)
* **Color de Proceso:** Ámbar Industrial (`#f59e0b`)

---

### APLICACIÓN 5: SCMTP V2.0 — Minutas y Tareas de Planificación
* **Descripción:** Procesamiento multimodal de minutas de reunión, compromisos institucionales y seguimiento Kanban.
* **Enlace de Despliegue QA:** `https://ggpd-corpoelec-sc-tareas.ai.studio` (Puerto local `:3003`)
* **Color de Proceso:** Esmeralda Auditoría (`#10b981`)

---

## 4. MATRIZ OFICIAL DE USUARIOS Y CREDENCIALES DEL ECOSISTEMA SIGI

### A. Cuentas Ejecutivas Nacionales y Especialistas Centrales

| Usuario (`username`) | Nombre Completo | Correo Institucional | Rol / Perfil | Ámbito | Contraseña Inicial |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ggpd_admin` | Administrador General GGPD | `admin.ggpd@corpoelec.gob.ve` | `ADMINISTRADOR` | Nacional (`NAC`) | `admin2026!.` / `Lunes35.` |
| `j_pacheco` | Josue D. Pacheco | `j.pacheco@corpoelec.gob.ve` | `ADMINISTRADOR` | Nacional (`NAC`) | `Pacheco2026!.` |
| `a_correa` | Adrian Correa | `a.correa@corpoelec.gob.ve` | `GERENCIA` | Nacional (`NAC`) | `Correa2026!.` |
| `c_favio` | Catherina Favio | `c.favio@corpoelec.gob.ve` | `GERENCIA` | Nacional (`NAC`) | `Favio2026.` |
| `w_prato` | Walter Prato | `w_prato@corpoelec.gob.ve` | `ESPECIALISTA` | Miranda (`MIR`) | `Prato2026.` |
| `j_bencomo` | Jaime Bencomo | `j_bencomo@corpoelec.gob.ve` | `ESPECIALISTA` | Carabobo (`CAR`) | `Bencomo2026.` |
| `c_reyes` | Carlos Reyes | `c_reyes@corpoelec.gob.ve` | `ESPECIALISTA` | Lara (`LAR`) | `Reyes2026.` |
| `r_cipiran` | Y. Cipiran | `y.cipiran@corpoelec.gob.ve` | `ESPECIALISTA` | Zulia (`ZUL`) | `Cipiran2026.` |
| `b_gonzalez` | Blanca González | `b.gonzalez@corpoelec.gob.ve`| `ANALISTA` | Nacional (`NAC`) | `Gonzalez2026.` |
| `a_auditor` | Auditor ISO 8000 / 27001 | `auditoria.iso@corpoelec.gob.ve` | `AUDITOR` | Nacional (`NAC`) | `Auditor2026.` |
| `analista_gestion` | Lcdo. Juan Pérez | `analista_gestion@corpoelec.gob.ve` | `ANALISTA` | Nacional (`NAC`) | `admin2026!.` |

---

### B. Cuentas Oficiales de las 25 Coordinaciones Estadales (Perfil `VISOR_ESTADAL`)

| Entidad Federal | Código ISO | Usuario SIGI | Correo Institucional Asignado | Rol Operativo | Contraseña Inicial |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Distrito Capital** | `DCA` (`01`) | `coord_capital` | `distribucion.capital.ggpd@gmail.com` | `VISOR_ESTADAL` | `Capital2026!.` |
| **Miranda** | `MIR` (`02`) | `coord_miranda` | `distribucion.miranda.ggpd@gmail.com` | `VISOR_ESTADAL` | `Miranda2026!.` |
| **La Guaira** | `LGU` (`03`) | `coord_laguaira` | `distribucion.laguaira.ggpd@gmail.com` | `VISOR_ESTADAL` | `LaGuaira2026!.` |
| **Aragua** | `ARA` (`04`) | `coord_aragua` | `distribucion.aragua.ggpd@gmail.com` | `VISOR_ESTADAL` | `Aragua2026!.` |
| **Carabobo** | `CAR` (`05`) | `coord_carabobo` | `distribucion.carabobo.ggpd@gmail.com` | `VISOR_ESTADAL` | `Carabobo2026!.` |
| **Cojedes** | `COJ` (`06`) | `coord_cojedes` | `distribucion.cojedes.ggpd@gmail.com` | `VISOR_ESTADAL` | `Cojedes2026!.` |
| **Guárico** | `GUA` (`07`) | `coord_guarico` | `distribucion.guarico.ggpd@gmail.com` | `VISOR_ESTADAL` | `Guarico2026!.` |
| **Falcón** | `FAL` (`08`) | `coord_falcon` | `distribucion.falcon.ggpd@gmail.com` | `VISOR_ESTADAL` | `Falcon2026!.` |
| **Lara** | `LAR` (`09`) | `coord_lara` | `distribucion.lara.ggpd@gmail.com` | `VISOR_ESTADAL` | `Lara2026!.` |
| **Yaracuy** | `YAR` (`10`) | `coord_yaracuy` | `distribucion.yaracuy.ggpd@gmail.com` | `VISOR_ESTADAL` | `Yaracuy2026!.` |
| **Portuguesa** | `POR` (`11`) | `coord_portuguesa` | `distribucion.portuguesa.ggpd@gmail.com` | `VISOR_ESTADAL` | `Portuguesa2026!.` |
| **Barinas** | `BAR` (`12`) | `coord_barinas` | `distribucion.barinas.ggpd@gmail.com` | `VISOR_ESTADAL` | `Barinas2026!.` |
| **Apure** | `APU` (`13`) | `coord_apure` | `distribucion.apure.ggpd@gmail.com` | `VISOR_ESTADAL` | `Apure2026!.` |
| **Táchira** | `TAC` (`14`) | `coord_tachira` | `distribucion.tachira.ggpd@gmail.com` | `VISOR_ESTADAL` | `Tachira2026!.` |
| **Mérida** | `MER` (`15`) | `coord_merida` | `distribucion.merida.ggpd@gmail.com` | `VISOR_ESTADAL` | `Merida2026!.` |
| **Trujillo** | `TRU` (`16`) | `coord_trujillo` | `distribucion.trujillo.ggpd@gmail.com` | `VISOR_ESTADAL` | `Trujillo2026!.` |
| **Zulia** | `ZUL` (`17`) | `coord_zulia` | `distribucion.zulia.ggpd@gmail.com` | `VISOR_ESTADAL` | `Zulia2026!.` |
| **Anzoátegui** | `ANZ` (`18`) | `coord_anzoategui`| `distribucion.anzoategui.ggpd@gmail.com`| `VISOR_ESTADAL` | `Anzoategui2026!.` |
| **Monagas** | `MON` (`19`) | `coord_monagas` | `distribucion.monagas.ggpd@gmail.com` | `VISOR_ESTADAL` | `Monagas2026!.` |
| **Sucre** | `SUC` (`20`) | `coord_sucre` | `distribucion.sucre.ggpd@gmail.com` | `VISOR_ESTADAL` | `Sucre2026!.` |
| **Nueva Esparta** | `NES` (`21`) | `coord_nuevaesparta`| `distribucion.nuevaesparta.ggpd@gmail.com`| `VISOR_ESTADAL` | `NuevaEsparta2026!.` |
| **Bolívar** | `BOL` (`22`) | `coord_bolivar` | `distribucion.bolivar.ggpd@gmail.com` | `VISOR_ESTADAL` | `Bolivar2026!.` |
| **Amazonas** | `AMA` (`23`) | `coord_amazonas` | `distribucion.amazonas.ggpd@gmail.com` | `VISOR_ESTADAL` | `Amazonas2026!.` |
| **Delta Amacuro** | `DEL` (`24`) | `coord_delta` | `distribucion.delta.ggpd@gmail.com` | `VISOR_ESTADAL` | `Delta2026!.` |
| **Guayana Esequiba** | `GEQ` (`25`) | `coord_esequibo` | `distribucion.esequibo.ggpd@gmail.com` | `VISOR_ESTADAL` | `Esequibo2026!.` |

---

## 5. HOJA DE RUTA Y RECOMENDACIONES DE QA

1. **Validación de SSO Silencioso:** Probar el inicio de sesión con `ggpd_admin` en SIGI y verificar la apertura inmediata de SCTIS, SCPPE, SCEIN y SCMTP sin solicitud de clave adicional.
2. **Prueba de Confinamiento Territorial (State-Lock):** Ingresar con `coord_tachira` y comprobar que la información desplegada en el visor geoespacial y métricas pertenezca a la Coordinación Táchira.
3. **Prueba de Denegación de Permisos:** Con la cuenta `coord_tachira`, intentar pulsar sobre cualquier aplicación satélite en el lanzador y comprobar que el sistema muestra el modal de acceso restringido y registra el evento de seguridad en la bitácora ISO 27001.

---

**Atentamente,**

**Equipo de Automatización e Ingeniería de Productos con IA, de Planificación de Distribución**  
Gerencia General de Planificación de Distribución (GGPD) — CORPOELEC  
*Norma de Documentación Institucional GGPD-SGM-INS-005 (v3.0 ISO)*  
