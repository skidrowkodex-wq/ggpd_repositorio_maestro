# Mapeo de Orígenes, Rutas y Diagnóstico de Correspondencia GGP — CORPOELEC (SCGCC)

---

## 📌 1. Ficha Técnica y Registro de Directorios Oficiales en Google Drive

- **Cuenta Propietaria / Custodia:** `bk.ggpd.corpoelec@gmail.com`
- **Carpeta Raíz Data Lake GGPD:** `1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7`
- **Webhook Oficial Apps Script:** `https://script.google.com/macros/s/AKfycbxonVU31GBXuVCfu_5G8hmADkYFB7yriPJVt2nS9w7uMjsERu5_WPzpQSVbuB2kvtQkqA/exec`

---

## 🗂️ 2. Matriz de Directorios y Archivos de Correspondencia

| N° | Directorio / Nombre en Drive | Folder ID en Google Drive | URL de Acceso en Nube | Tipo de Contenido / Propósito |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **`_Gerencia Nacional`** *(Contiene `REGISTRO DE LA CORRESPONDENCIA RECIBIDA GGP.xlsx`)* | `1yKwQ8hKGjCPHwukuADkv__Kp3gicJkBj` | [Abrir en Drive](https://drive.google.com/drive/folders/1yKwQ8hKGjCPHwukuADkv__Kp3gicJkBj) | Libro maestro de entradas de correspondencia recibida por la Gerencia de Gestión de Planificación (GGP). |
| **2** | **`Gestion de Correspondencia GGP`** | `1rxcoAzXeBRPYOiKLWNmVWvKnPkF46Qfy` | [Abrir en Drive](https://drive.google.com/drive/folders/1rxcoAzXeBRPYOiKLWNmVWvKnPkF46Qfy) | Registro y correlativos de correspondencias emitidas (salidas) por la GGP. |
| **3** | **`PDF CORRESP TTHH  2026`** | `1TLY85lMR7R1Yz7TgKaMVc2p42dgSO07D` | [Abrir en Drive](https://drive.google.com/drive/folders/1TLY85lMR7R1Yz7TgKaMVc2p42dgSO07D) | Expedientes digitales en PDF de comunicaciones emitidas por la Gerencia de Talento Humano hacia la GGP. |
| **4** | **`PDF DOC. CORRESP GCIA GRAL DE DISTRIBUCION A LA GGP`** | `1LHRo1PlKxPRHYFSOJsdemq8iXO8SNMRf` | [Abrir en Drive](https://drive.google.com/drive/folders/1LHRo1PlKxPRHYFSOJsdemq8iXO8SNMRf) | Expedientes digitales en PDF emitidos por la Gerencia General de Distribución (GGPD) dirigidos a la GGP. |
| **5** | **`FORMATO CORPORATIVOS VARIOS 2026`** | `1-e_OVf929QnJkUUcXUFRy_pCujAdF26a` | [Abrir en Drive](https://drive.google.com/drive/folders/1-e_OVf929QnJkUUcXUFRy_pCujAdF26a) | Plantillas oficiales en Word/Excel para memorándums, oficios, puntos de cuenta y notas de entrega. |

---

## 🔎 3. Diagnóstico Preliminar: Riesgos de Proceso y Síntomas de Descontrol

A partir del análisis estructural de estas carpetas, se identifican **4 fallas procedimentales críticas** en la gestión tradicional de correspondencia:

```mermaid
flowchart TD
    subgraph Actual["❌ Flujo Tradicional Inconsistente (Descontrol)"]
        F1["Libro Excel Desconectado<br/>('REGISTRO...xlsx')"] -.->|Sin validación| F2["PDFs en Carpetas Sueltas<br/>(TTHH, Distribución)"]
        F2 -.->|Sin enlace| F3["Correlativos Manuales<br/>(Riesgo de saltos o duplicados)"]
        F3 -.->|Desconocido| F4["¿Quién atendió la solicitud?<br/>¿Cuándo venció el plazo?"]
    end

    subgraph Solucion["✅ Solución SCGCC V1.0 (Gobernanza ISO 15489)"]
        S1["Radicación Única 1-Clic<br/>(Correlativo Automático)"] ==> S2["Bóveda Digital Inmutable<br/>(Checksum SHA-256 + PDF)"]
        S2 ==> S3["Asignación de Responsable & SLA<br/>(Alerta de Vencimiento)"]
        S3 ==> S4["Derivación de Tareas SCMTP<br/>(Trazabilidad 100% Cerrada)"]
    end
```

### Síntomas Detectados:
1. **Desacoplamiento entre Registro y Soporte Digital:** El archivo `REGISTRO DE LA CORRESPONDENCIA RECIBIDA GGP.xlsx` suele registrar números de oficio en texto plano sin hipervínculos garantizados a los PDFs en las carpetas `PDF CORRESP TTHH 2026` o `PDF DOC. CORRESP...`. Si alguien renombra un PDF, se pierde el rastro.
2. **Silos por Remitente en lugar de Libro de Radicación Único:** Tener carpetas separadas para "Talento Humano" y "Gerencia General de Distribución" fragmenta la auditoría. Bajo norma ISO 15489, debe existir un **Índice Canónico Único** con atributo `remitente_institucion` / `remitente_unidad`.
3. **Ausencia de Trazabilidad de Ciclo de Vida (SLA de Respuesta):** No hay forma confiable en Excel de saber si una correspondencia fue atendida, si generó una respuesta formal con número de oficio de salida, o si el plazo legal de respuesta expiró.
4. **Falta de Segregación de Confidencialidad (ISO 27001):** Todo usuario con acceso a la carpeta de Drive puede ver tanto memorándums ordinarios de rutina como comunicaciones confidenciales de talento humano o sanciones/auditorías.

---

## 🚀 4. Próximo Paso para Descarga y Extracción Local

1. Actualizar el script en Google Apps Script con [`scripts/google_apps_script_provisioner_2026.gs`](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/scripts/google_apps_script_provisioner_2026.gs) (Versión 3.1.0).
2. Ejecutar el script extractor local para traer a `data/correspondencia_raw/` los archivos y realizar la auditoría sintáctica y semántica del Excel `REGISTRO DE LA CORRESPONDENCIA RECIBIDA GGP.xlsx`.
