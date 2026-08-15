# GUÍA NORMATIVA Y DE ARQUITECTURA: ESTRUCTURA OFICIAL DEL DATA LAKE GGPD EN GOOGLE DRIVE (2026)

**DOCUMENTO OFICIAL:** `NAC_2026_GGPD_GUIA_DESPLIEGUE_DATA_LAKE_GOOGLE_DRIVE_V01.md`  
**NORMA INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO) / ISO 8000-110 / ISO 27001:2022  
**DESTINATARIOS:** Gerente General de Planificación de Distribución | Coordinadores Estadales | Administradores de Datos  
**ORIGEN:** Área de Innovación, Tecnología y Desarrollo Backend (GGPD)  
**FECHA DE EMISIÓN:** 14 de Agosto de 2026  
**ESTATUS:** Aprobado para Despliegue e Inspección  

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO INSTITUCIONAL

Por primera vez en la historia de la Gerencia General de Planificación de Distribución (GGPD) y del Sistema Eléctrico Nacional (SEN), se formaliza una **Estructura Jerárquica y Normalizada de Repositorio en la Nube (Google Drive Data Lake)**. 

Este esquema erradica la dispersión de archivos, garantiza la gobernanza del dato bajo la norma **ISO 8000-110** y permite que las cuatro aplicaciones estratégicas del SEN (`SCTIS`, `SCEIN`, `SCPPE`, `SCMTP`) y el portal unificado `SIGI` almacenen y consuman información operativa en ubicaciones predecibles y auditables.

---

## 2. PARÁMETROS INSTITUCIONALES DEL REPOSITORIO

* **Cuenta Oficial de Almacenamiento:** `bk.ggpd.corpoelec@gmail.com`
* **Carpeta Raíz Principal (ID):** `1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7`
* **Enlace Directo de Acceso:** [`https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7`](https://drive.google.com/drive/folders/1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7)
* **Script de Aprovisionamiento Automatizado:** [`scripts/google_apps_script_provisioner_2026.gs`](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/scripts/google_apps_script_provisioner_2026.gs)

---

## 3. ARQUITECTURA DE DIRECTORIOS (DATA LAKE SEN 2026)

```
📁 GGPD_DATA_LAKE_OFICIAL (ID: 1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7)
│
├── 📁 01_DCA_DISTRITO_CAPITAL/
│   ├── 📁 01_SCTIS_INTERRUPCIONES/
│   │   └── 📁 2026/
│   │       ├── 📄 NORMA_NOMENCLATURA_SCTIS.txt
│   │       ├── 📁 08_AGOSTO/
│   │       │   ├── 📄 SCTIS_DCA_20260814_SEM32_V01.xlsx (Conforme)
│   │       │   └── 📄 SCTIS_DCA_20260814_SEM32_REMEDIACION.xlsx (Errores)
│   │       └── 📁 09_SEPTIEMBRE/
│   ├── 📁 02_SCEIN_INDISPONIBLES/
│   │   └── 📁 2026/
│   │       ├── 📄 NORMA_NOMENCLATURA_SCEIN.txt
│   │       └── 📁 08_AGOSTO/
│   ├── 📁 03_SCPPE_PROYECTOS_VIATICOS/
│   │   └── 📁 2026/
│   │       ├── 📄 NORMA_NOMENCLATURA_SCPPE.txt
│   │       └── 📁 08_AGOSTO/
│   └── 📁 04_SCMTP_MINUTAS_COMPROMISOS/
│       └── 📁 2026/
│           ├── 📄 NORMA_NOMENCLATURA_SCMTP.txt
│           └── 📁 08_AGOSTO/
│
├── 📁 02_MIR_MIRANDA/
├── 📁 03_LGU_LA_GUAIRA/
├── 📁 04_ZUL_ZULIA/
├── 📁 05_CAR_CARABOBO/
├── 📁 06_ARA_ARAGUA/
├── 📁 07_LAR_LARA/
├── 📁 08_BOL_BOLIVAR/
├── 📁 09_ANZ_ANZOATEGUI/
├── 📁 10_BAR_BARINAS/
├── 📁 11_FAL_FALCON/
├── 📁 12_MER_MERIDA/
├── 📁 13_TAC_TACHIRA/
├── 📁 14_TRU_TRUJILLO/
├── 📁 15_POR_PORTUGUESA/
├── 📁 16_COJ_COJEDES/
├── 📁 17_GUA_GUARICO/
├── 📁 18_SUC_SUCRE/
├── 📁 19_MON_MONAGAS/
├── 📁 20_APU_APURE/
├── 📁 21_NES_NUEVA_ESPARTA/
├── 📁 22_DEL_DELTA_AMACURO/
├── 📁 23_AMA_AMAZONAS/
├── 📁 24_YAR_YARACUY/
├── 📁 25_GEQ_GUAYANA_ESEQUIBA/
│
└── 📁 99_CONSOLIDADOS_NACIONALES/
    └── 📁 2026/
        ├── 📁 REPORTES_EJECUTIVOS_MPPEE/
        └── 📁 MATRICES_DEDUPLICADAS_ISO8000/
```

---

## 4. MATRIZ DE PROCESOS Y NOMENCLATURAS ESTANDARIZADAS

| Código de Proceso | Carpeta Oficial | Sistema Responsable | Formato de Nomenclatura ISO | Ejemplo Oficial |
| :--- | :--- | :--- | :--- | :--- |
| **01_SCTIS** | `01_SCTIS_INTERRUPCIONES` | **SCTIS V2.0** | `SCTIS_[ESTADO]_[YYYYMMDD]_SEM[N]_V[REV].xlsx` | `SCTIS_DCA_20260814_SEM32_V01.xlsx` |
| **02_SCEIN** | `02_SCEIN_INDISPONIBLES` | **SCEIN V3.0** | `SCEIN_[ESTADO]_[YYYYMMDD]_V[REV].xlsx` | `SCEIN_ZUL_20260814_V01.xlsx` |
| **03_SCPPE** | `03_SCPPE_PROYECTOS_VIATICOS` | **SCPPE V3.0** | `SCPPE_[ESTADO]_[YYYYMMDD]_[TIPO]_V[REV].xlsx` | `SCPPE_CAR_20260814_PROYECTOS_V01.xlsx` |
| **04_SCMTP** | `04_SCMTP_MINUTAS_COMPROMISOS`| **SCMTP V2.0** | `SCMTP_[ESTADO]_[YYYYMMDD]_MINUTA_[ID].xlsx` | `SCMTP_BOL_20260814_MINUTA_01.xlsx` |

---

## 5. REGLAS DE CONTROL TEMPORAL Y PLAZOS NORMATIVOS

```
VENTANAS OPERATIVAS DE INGESTA:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📅 CARGAS SEMANALES (SCTIS, SCEIN, SCPPE, SCMTP):                          │
│    • Apertura de Ventana: Miércoles 08:00 AM                                │
│    • Cierre Ordinario: Jueves 12:00 PM (Mediodía)                           │
│    • Cierre Extraordinario (Alerta SCMTP): Jueves 05:00 PM                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 CIERRES MENSUALES DE GESTIÓN:                                            │
│    • Límite de Recepción: 3er Día Hábil del mes siguiente (03 o 3er DL)     │
│    • Emisión de Matriz Consolidada SEN: 4to Día Hábil                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. INSTRUCCIONES DE EJECUCIÓN (1-CLICK PROVISIONING)

Para desplegar o actualizar la estructura completa de carpetas en Google Drive:

1. Abrir la consola de **Google Apps Script** en la cuenta `bk.ggpd.corpoelec@gmail.com`.
2. Pegar el código del archivo [`scripts/google_apps_script_provisioner_2026.gs`](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/scripts/google_apps_script_provisioner_2026.gs).
3. Seleccionar la función `provisionCompleteDataLake2026` y presionar **Ejecutar**.
4. En menos de 10 segundos, las **25 carpetas estadales, los 100 procesos operativos, las subcarpetas del año 2026 y los archivos README normativos** quedarán creados y listos para su uso.

---

**Atentamente,**

**Área de Innovación, Tecnología y Desarrollo Backend**  
Gerencia General de Planificación de Distribución (GGPD) — CORPOELEC  
*Norma de Documentación Institucional GGPD-SGM-INS-005 (v3.0 ISO)*  
