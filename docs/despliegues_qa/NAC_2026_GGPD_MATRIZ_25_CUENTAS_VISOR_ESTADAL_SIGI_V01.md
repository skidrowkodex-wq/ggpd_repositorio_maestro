# MEMORÁNDUM TÉCNICO NORMATIVO: MATRIZ DE 25 CUENTAS DE COORDINACIÓN ESTADAL (VISOR KGI/KPI) PARA EL PORTAL SIGI — FASE QA

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_MATRIZ_25_CUENTAS_VISOR_ESTADAL_SIGI_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO)  
**FECHA DE EMISIÓN:** 14 de Agosto de 2026  
**PARA:** Gerente General de Distribución | Coordinadores Estadales de Planificación | Salas Situacionales Regionales  
**DE:** Equipo de Automatización e Ingeniería de Productos con IA, de Planificación de Distribución  
**ASUNTO:** Asignación controlada de credenciales, patrón de contraseñas y marco de gobernanza para las 25 Cuentas Estadales (Visor Ejecutivo KGI/KPI) en el Sistema Integral de Gestión de Información (SIGI).

---

## 1. MARCO NORMATIVO Y PRINCIPIOS DE GOBERNANZA

El presente instrumento establece las directrices de seguridad, control de acceso y asignación de credenciales para las 24 entidades federales y el territorio de Guayana Esequiba, en estricto cumplimiento de:

1. **ISO 8000-110 (Calidad de Datos Sintáctica y Semántica):** Estandarización de códigos geográficos de 3 letras (`ZUL`, `DCA`, `CAR`, ..., `YAR`, `GEQ`) y nombres canónicos de coordinaciones.
2. **ISO/IEC 27001:2022 (Controles A.9.2, A.9.4.2 y A.9.4.3):** Asignación individualizada de usuarios, principio de mínimo privilegio y gestión de contraseñas.
3. **ISACA COBIT 2019 (Segregación de Funciones - SoD):** Separación tajante entre la **Ingesta de Datos Masivos** (reservada a los Custodios/Administradores de cada app maestra) y la **Visualización y Monitoreo de KGI/KPI** (asignada a las Coordinaciones Estadales).
4. **OWASP Top 10 / ASVS v4.0:** Robustecimiento de autenticación, prevención de fuerza bruta y contraseñas de alta entropía.

---

## 2. DEFINICIÓN DE LA REGLA DE NEGOCIO: ROL `VISOR_ESTADAL`

Las Coordinaciones Estadales operan como **unidades de análisis táctico y toma de decisiones**. Por consiguiente:

* **Sin permisos de ingesta masiva en apps satélites:** La carga masiva de interrupciones (SCTIS), transformadores indisponibles (SCEIN) y proyectos (Planificación SEN) es ejecutada exclusivamente por los Administradores Nacionales de cada aplicación tras pasar los filtros de homologación y deduplicación.
* **Ámbito Geográfico Bloqueado (`State-Lock`):** Al iniciar sesión en SIGI, el selector territorial queda fijado en la entidad asignada, convirtiendo el sistema en el *Portal Estadal de Distribución*.
* **Ocultamiento de Módulos Críticos:** Los módulos de *Lanzador de Apps Maestras*, *Repositorio Google Drive* y *Gestión de Usuarios* se ocultan completamente para este rol.
* **Apto para Salas Situacionales y TV:** Al no poseer credenciales de escritura ni enlaces externos, la sesión puede mantenerse proyectada en monitores de sala situacional sin representar un vector de riesgo cibernético.

---

## 3. POLÍTICA ESTANDARIZADA DE CONTRASEÑAS CONTROLADAS

### 📐 Patrón de Contraseña Inicial para la Fase de QA:
Para garantizar alta entropía, cumplimiento OWASP y evitar errores tipográficos por tildes en terminales Linux/Web, el patrón institucional establecido es:

$$\text{Formato: } \mathbf{[NombreEstadoSinAcentos]2026!.} \quad \text{o} \quad \mathbf{Coord\_[CodigoEstado]2026!.}$$

* **Requisitos Cumplidos:**
  - Longitud mínima: 12 caracteres.
  - Caracteres en mayúscula (inicial).
  - Caracteres en minúscula.
  - Dígitos numéricos (`2026`).
  - Símbolos especiales de alta seguridad (`!` y `.`).
  - Compatibilidad ASCII 100% (sin acentos para prevenir fallas de codificación UTF-8).

---

## 4. MATRIZ MAESTRA DE LAS 25 CUENTAS DE COORDINACIÓN ESTADAL (SIGI)

| # | Código | Estado / Territorio | Usuario (`username`) | Nombre Completo Institucional | Correo Corporativo | Cuenta Google | Contraseña Inicial QA | Perfil / Rol |
| :-: | :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `DCA` | **Distrito Capital** | `coord_capital` | Coordinación Estadal Distrito Capital (GGPD) | `coord.capital@corpoelec.gob.ve` | `distribucion.capital.ggpd@gmail.com` | `Capital2026!.` | `VISOR_ESTADAL` |
| **2** | `MIR` | **Miranda** | `coord_miranda` | Coordinación Estadal Miranda (GGPD) | `coord.miranda@corpoelec.gob.ve` | `distribucion.miranda.ggpd@gmail.com` | `Miranda2026!.` | `VISOR_ESTADAL` |
| **3** | `LGU` | **La Guaira** | `coord_laguaira` | Coordinación Estadal La Guaira (GGPD) | `coord.laguaira@corpoelec.gob.ve` | `distribucion.laguaira.ggpd@gmail.com` | `Laguaira2026!.` | `VISOR_ESTADAL` |
| **4** | `CAR` | **Carabobo** | `coord_carabobo` | Coordinación Estadal Carabobo (GGPD) | `coord.carabobo@corpoelec.gob.ve` | `distribucion.carabobo.ggpd@gmail.com` | `Carabobo2026!.` | `VISOR_ESTADAL` |
| **5** | `ARA` | **Aragua** | `coord_aragua` | Coordinación Estadal Aragua (GGPD) | `coord.aragua@corpoelec.gob.ve` | `distribucion.aragua.ggpd@gmail.com` | `Aragua2026!.` | `VISOR_ESTADAL` |
| **6** | `ZUL` | **Zulia** | `coord_zulia` | Coordinación Estadal Zulia (GGPD) | `coord.zulia@corpoelec.gob.ve` | `distribucion.zulia.ggpd@gmail.com` | `Zulia2026!.` | `VISOR_ESTADAL` |
| **7** | `FAL` | **Falcón** | `coord_falcon` | Coordinación Estadal Falcón (GGPD) | `coord.falcon@corpoelec.gob.ve` | `distribucion.falcon.ggpd@gmail.com` | `Falcon2026!.` | `VISOR_ESTADAL` |
| **8** | `LAR` | **Lara** | `coord_lara` | Coordinación Estadal Lara (GGPD) | `coord.lara@corpoelec.gob.ve` | `distribucion.lara.ggpd@gmail.com` | `Lara2026!.` | `VISOR_ESTADAL` |
| **9** | `YAR` | **Yaracuy** | `coord_yaracuy` | Coordinación Estadal Yaracuy (GGPD) | `coord.yaracuy@corpoelec.gob.ve` | `distribucion.yaracuy.ggpd@gmail.com` | `Yaracuy2026!.` | `VISOR_ESTADAL` |
| **10** | `TAC` | **Táchira** | `coord_tachira` | Coordinación Estadal Táchira (GGPD) | `coord.tachira@corpoelec.gob.ve` | `distribucion.tachira.ggpd@gmail.com` | `Tachira2026!.` | `VISOR_ESTADAL` |
| **11** | `MER` | **Mérida** | `coord_merida` | Coordinación Estadal Mérida (GGPD) | `coord.merida@corpoelec.gob.ve` | `distribucion.merida.ggpd@gmail.com` | `Merida2026!.` | `VISOR_ESTADAL` |
| **12** | `TRU` | **Trujillo** | `coord_trujillo` | Coordinación Estadal Trujillo (GGPD) | `coord.trujillo@corpoelec.gob.ve` | `distribucion.trujillo.ggpd@gmail.com` | `Trujillo2026!.` | `VISOR_ESTADAL` |
| **13** | `BAR` | **Barinas** | `coord_barinas` | Coordinación Estadal Barinas (GGPD) | `coord.barinas@corpoelec.gob.ve` | `distribucion.barinas.ggpd@gmail.com` | `Barinas2026!.` | `VISOR_ESTADAL` |
| **14** | `POR` | **Portuguesa** | `coord_portuguesa` | Coordinación Estadal Portuguesa (GGPD) | `coord.portuguesa@corpoelec.gob.ve` | `distribucion.portuguesa.ggpd@gmail.com` | `Portuguesa2026!.` | `VISOR_ESTADAL` |
| **15** | `COJ` | **Cojedes** | `coord_cojedes` | Coordinación Estadal Cojedes (GGPD) | `coord.cojedes@corpoelec.gob.ve` | `distribucion.cojedes.ggpd@gmail.com` | `Cojedes2026!.` | `VISOR_ESTADAL` |
| **16** | `GUA` | **Guárico** | `coord_guarico` | Coordinación Estadal Guárico (GGPD) | `coord.guarico@corpoelec.gob.ve` | `distribucion.guarico.ggpd@gmail.com` | `Guarico2026!.` | `VISOR_ESTADAL` |
| **17** | `APU` | **Apure** | `coord_apure` | Coordinación Estadal Apure (GGPD) | `coord.apure@corpoelec.gob.ve` | `distribucion.apure.ggpd@gmail.com` | `Apure2026!.` | `VISOR_ESTADAL` |
| **18** | `ANZ` | **Anzoátegui** | `coord_anzoategui` | Coordinación Estadal Anzoátegui (GGPD) | `coord.anzoategui@corpoelec.gob.ve` | `distribucion.anzoategui.ggpd@gmail.com` | `Anzoategui2026!.` | `VISOR_ESTADAL` |
| **19** | `MON` | **Monagas** | `coord_monagas` | Coordinación Estadal Monagas (GGPD) | `coord.monagas@corpoelec.gob.ve` | `distribucion.monagas.ggpd@gmail.com` | `Monagas2026!.` | `VISOR_ESTADAL` |
| **20** | `SUC` | **Sucre** | `coord_sucre` | Coordinación Estadal Sucre (GGPD) | `coord.sucre@corpoelec.gob.ve` | `distribucion.sucre.ggpd@gmail.com` | `Sucre2026!.` | `VISOR_ESTADAL` |
| **21** | `NES` | **Nueva Esparta** | `coord_nuevaesparta` | Coordinación Estadal Nueva Esparta (GGPD) | `coord.nuevaesparta@corpoelec.gob.ve` | `distribucion.nuevaesparta.ggpd@gmail.com` | `Nuevaesparta2026!.` | `VISOR_ESTADAL` |
| **22** | `BOL` | **Bolívar** | `coord_bolivar` | Coordinación Estadal Bolívar (GGPD) | `coord.bolivar@corpoelec.gob.ve` | `distribucion.bolivar.ggpd@gmail.com` | `Bolivar2026!.` | `VISOR_ESTADAL` |
| **23** | `AMA` | **Amazonas** | `coord_amazonas` | Coordinación Estadal Amazonas (GGPD) | `coord.amazonas@corpoelec.gob.ve` | `distribucion.amazonas.ggpd@gmail.com` | `Amazonas2026!.` | `VISOR_ESTADAL` |
| **24** | `DEL` | **Delta Amacuro** | `coord_deltaamacuro` | Coordinación Estadal Delta Amacuro (GGPD) | `coord.deltaamacuro@corpoelec.gob.ve` | `distribucion.deltaamacuro.ggpd@gmail.com` | `Deltaamacuro2026!.` | `VISOR_ESTADAL` |
| **25** | `GEQ` | **Guayana Esequiba** | `coord_esequibo` | Proyecto Especial de Electrificación Guayana Esequiba | `electrificacion.esequibo@corpoelec.gob.ve` | `esequibo.electrificacion.ggpd@gmail.com` | `Esequibo2026!.` | `VISOR_ESTADAL` |

---

### 4.1 MATRIZ DE CUENTAS EJECUTIVAS Y ADMINISTRATIVAS CENTRALES (GGPD NACIONAL)

| # | Nivel | Usuario (`username`) | Nombre Completo Institucional | Cargo / Rol | Correo Corporativo | Cuenta Google | Contraseña de Acceso | Alcance de Permisos |
| :-: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A1** | Central | `ggpd_admin` | Administrador General GGPD | `ADMINISTRADOR` | `admin.ggpd@corpoelec.gob.ve` | `bk.ggpd.corpoelec@gmail.com` | `admin2026!.` | Acceso Total (SCTIS, SCEIN, SCPPE, SCMTP, GDrive, Usuarios) |
| **A2** | Central | `a_correa` | Ing. Adrian Correa | `GERENCIA` (Gerente General) | `a.correa@corpoelec.gob.ve` | `adrian.correa.ggpd@gmail.com` | `Correa2026!.` | Control Ejecutivo, Minutas, Aprobación de Viáticos y Proyectos |
| **A3** | Central | `j_pacheco` | Ing. Josue Pacheco | `ADMINISTRADOR` (Dev & Data) | `j.pacheco@corpoelec.gob.ve` | `josue.pacheco.ggpd@gmail.com` | `Pacheco2026!.` | Administración Tecnológica, Arquitectura BD y Seguridad |

---

## 5. INDICADORES VISIBLES EN MODO SALA SITUACIONAL (KGI vs KPI)

| Categoría | Indicador Principal | Tipo | Fuente / Aplicación Maestra |
| :--- | :--- | :---: | :--- |
| **Disponibilidad de Red** | SAIDI / SAIFI Estadal y Continuidad del Servicio (%) | **KGI** | SCTIS V2.0 |
| **Energía Crítica** | Energía No Suministrada (ENS en MWh) | **KGI** | SCTIS V2.0 |
| **Gobernanza Táctica** | Tasa de Cumplimiento de Acuerdos de Minutas Regionales (%) | **KGI** | SCMTP V2.0 |
| **Transformación Nube** | Tasa de Digitalización Zero-WhatsApp (%) | **KGI** | SIGI Auditoría |
| **Parque de Activos** | Bahías y Transformadores Indisponibles en Proceso | **KPI** | SCEIN V3.0 |
| **Mantenimiento Red** | Tiempo Medio de Reparación de Circuitos (MTTR en Horas) | **KPI** | SCTIS V2.0 |
| **Obras y Proyectos** | % de Ejecución Física y Financiera POA / PRTSEN | **KPI** | SCPPE V3.0 |

> **Nota de Tratamiento Especial para Guayana Esequiba (`GEQ`):**  
> Al constituir un territorio de expansión estratégica en fase de desarrollo, sus tableros mostrarán el avance del **Plan de Electrificación Integral**, trazabilidad de estudios geográficos y proyección de cargas comunitarias.

---

## 6. PROTOCOLO DE ENTREGA Y RECOMENDACIONES DE SEGURIDAD

1. **Entrega Formal de Credenciales:** El Administrador General de GGPD remitirá a cada Coordinador Estadal su usuario institucional y contraseña inicial de forma confidencial.
2. **Primer Inicio de Sesión y Verificación:** Cada coordinación ingresará en `http://localhost:3001` (o URL de despliegue oficial) y verificará que el tablero cargue automáticamente con los datos de su entidad federal.
3. **Restricción de Reenvío:** Queda terminantemente prohibido compartir estas credenciales por canales no seguros (mensajería instantánea no corporativa).

---

**Atentamente,**

**Equipo de Automatización e Ingeniería de Productos con IA, de Planificación de Distribución**  
Gerencia General de Planificación de Distribución (GGPD) — CORPOELEC  
*Norma de Documentación Institucional GGPD-SGM-INS-005 (v3.0 ISO)*
