# CORPOELEC — GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)

## DOCUMENTACIÓN DE CALIDAD, GOBIERNO DE DATOS Y GESTIÓN DOCUMENTAL
**Normativa ISO 15489-1:2016 | ISO 9001:2015 | ISO/IEC 27001:2022 | ISO 8000 (Calidad de Datos) | ISACA COBIT 2019**

---

### ÍNDICE DE LA DOCUMENTACIÓN DEL PROYECTO SCGCC

El presente directorio contiene la documentación técnica, funcional y operativa correspondiente al **SCGCC V1.0** (*Sistema de Seguimiento y Control de la Gestión de Correspondencia Corporativa*) desarrollado para la Gerencia General de Gestión de Planificación de Distribución (GGPD) de CORPOELEC.

| Código ISO | Tipo de Documento | Descripción / Alcance | Archivo |
| :--- | :--- | :--- | :--- |
| **GGPD-SCGCC-DOCFUN-001** | **Informe de Avance & Definición Funcional** | Justificación institucional, matriz de prioridades por verbos rectores, custodia ISO 15489 y estado de avance solicitado vs. entregado. | [`SCGCC_DOCFUN_v1_Informe_Avance_Solicitantes.md`](./SCGCC_DOCFUN_v1_Informe_Avance_Solicitantes.md) |
| **GGPD-SCGCC-DOCTEC-002** | **Documento Técnico & Arquitectura** | Esquema de base de datos PostgreSQL `scgcc.*`, seguridad RBAC/RLS, integración SCMTP y API Storage. | [`SCGCC_DOCTEC_v1_Arquitectura_Gobernanza.md`](./SCGCC_DOCTEC_v1_Arquitectura_Gobernanza.md) |

---

### METADATOS Y CONTROL DE REVISIONES DEL DOCUMENTO

* **Empresa / Ente:** CORPOELEC (Corporación Eléctrica Nacional, S.A.) / MPPEE
* **Gerencia:** Gerencia General de Gestión de Planificación de Distribución (GGPD)
* **Gerente Responsable:** Ing. Adrian Correa — Gerente General GGPD
* **Líder de Desarrollo:** Yván M. Cipiran N. / Equipo de Automatización e Ingeniería de Productos con IA
* **Proyecto:** SCGCC V1.0 (Seguimiento y Control de Gestión de Correspondencia Corporativa)
* **Código de Proceso:** `GGPD-SEC-01 • GESTIÓN DE CORRESPONDENCIA & DESPACHO`
* **Versión del Sistema:** v1.0 ISO (Build 2026.08)
* **Entorno de Despliegue Oficial:** [https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space](https://corpoelec-scgcc-corpoelec-ggpd-hosting-apps.vibehost.space)
* **Fecha de Emisión:** 24 de Agosto de 2026

---

### RESUMEN EJECUTIVO PARA LOS SOLICITANTES Y LA GERENCIA GENERAL

El **SCGCC V1.0** es una plataforma de **Grado Industrial SEN** diseñada para garantizar que ninguna correspondencia institucional (Oficios ministeriales, memorándums, instrucciones ejecutivas o solicitudes 1x10) quede desatendida, extraviada o fuera de plazo legal.

#### Pilares Fundamentales del Sistema:
1. **Triaje y Clasificación Ejecutiva por Verbos Rectores:**
   - Tratamiento prioritario de las instrucciones directas del Ministro y del Gerente General (Canal Preferencial con SLA de 24 a 48 horas).
   - Clasificación diferenciada para Evaluaciones Técnicas, Revisiones y Circulares Informativas.
2. **Custodia Documental Automatizada (ISO 15489):**
   - Nomenclatura normalizada automática (`RAD-GGPD-2026-XXXX_...pdf`).
   - Mapeo directo a la jerarquía de carpetas institucionales de la gerencia (Entradas, Salidas, Internas, Confidenciales), eliminando la creación manual de directorios.
3. **Integración Bidireccional con SCMTP V2.0:**
   - Conversión automática de instrucciones recibidas en tareas y compromisos técnicos asignados a analistas con semáforos de seguimiento.
4. **Segregación de Confidencialidad y Zona Segura (ISO 27001):**
   - Protección estricta de documentos confidenciales para directores y gerentes, garantizando que los analistas reciban solo las órdenes de trabajo sin vulnerar información sensible.
5. **Trazabilidad 360° para Reuniones Ejecutivas:**
   - Acceso instantáneo en 3 segundos al expediente completo (Entrada $\rightarrow$ Análisis Técnico $\rightarrow$ Oficio de Respuesta Firmado $\rightarrow$ Acuse de Recibo).
