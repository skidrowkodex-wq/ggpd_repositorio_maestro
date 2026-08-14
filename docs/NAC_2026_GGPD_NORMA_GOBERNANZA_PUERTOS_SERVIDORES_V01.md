# NORMA INSTITUCIONAL DE GOBERNANZA Y ASIGNACIÓN DE PUERTOS PARA SERVIDORES DE APLICACIONES

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_NORMA_GOBERNANZA_PUERTOS_SERVIDORES_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-006 (v1.0 ISO)  
**FECHA DE EMISIÓN:** 13 de Agosto de 2026  
**ENTIDAD:** Corporación Eléctrica Nacional S.A. (CORPOELEC) — Ministerio del Poder Popular para la Energía Eléctrica (MPPEE)  
**GERENCIA REGULADORA:** Gerencia General de Planificación de Distribución (GGPD)  
**MARCOS NORMATIVOS Y ESTÁNDARES:** ISO/IEC 27001:2022 | ISO 9001:2015 | ISACA COBIT 2019 (DS11/MEA02)  

---

## 1. OBJETIVO Y ÁMBITO DE APLICACIÓN

Establecer la norma obligatoria de asignación, aislamiento y gobernanza de puertos de red para las aplicaciones web, motores de API y microservicios desarrollados o consolidados dentro del **Repositorio Maestro de Distribución**.

Esta norma garantiza que **las cinco (5) aplicaciones del ecosistema puedan ser ejecutadas simultáneamente en el mismo entorno de servidor sin colisiones**, interferencias de sesión, ni bloqueos de socket TCP.

---

## 2. MATRIZ OFICIAL DE ASIGNACIÓN DE PUERTOS

Se establece el rango oficial reservado **`5170–5199`** (Rango Primario de Desarrollo) y el rango **`3000–3099`** (Rango Secundario de Servidores HTTP / Express):

| Código | Nombre de la Aplicación / Microservicio | Puerto Primario (`Dev/Express`) | Puerto Secundario (`Dist/HTTP`) | Protocolo / Estado |
| :---: | :--- | :---: | :---: | :---: |
| **APP-00** | **Portal Unificado CORPOELEC (Master Console)** | **`5170`** | **`5000`** | TCP / Activo |
| **APP-01** | **SIGI - Gestión y Planificación de Distribución** | **`5171`** | **`3001`** | TCP / Activo |
| **APP-02** | **SCTIS V2.0 - Tiras de Interrupción** | **`5172`** | **`3002`** | TCP / Activo |
| **APP-03** | **SGTA - Gestor de Tareas y Minutas** | **`5173`** | **`3003`** | TCP / Activo |
| **APP-04** | **Planificación Eléctrica SEN / Control Viáticos** | **`5174`** | **`3004`** | TCP / Activo |
| **APP-05** | **REMIX SCEIN - Equipos Indisponibles** | **`5175`** | **`3005`** | TCP / Activo |
| **RESERVA**| *Nuevas Aplicaciones / Integraciones Futuras* | `5176` – `5199` | `3006` – `3099` | TCP / Disponible |

---

## 3. REGLAS MANDATORIAS DE GOBERNANZA DE PUERTOS

1. **Inmutabilidad de Asignación:** Queda estrictamente prohibido alterar los puertos predeterminados de cada aplicación sin una revisión previa e incremento de versión de este documento normativo.
2. **Forzado Explícito en Scripts:** Toda aplicación debe definir su puerto mediante variables de entorno (`PORT`) o argumentos directos en el script de arranque (ej: `vite --port 5174 --strictPort`).
3. **Bandera `--strictPort`:** Todos los servidores basados en Vite o Node.js deben incluir la bandera `--strictPort` para evitar que el servidor escale automáticamente a un puerto aleatorio en caso de falla, garantizando el aislamiento del puerto normado.
4. **Liberación de Recurso (Graceful Shutdown):** Al detener un servicio, el proceso debe liberar inmediatamente el puerto asociado enviando señal `SIGTERM` o `SIGINT`.

---

## 4. COMANDOS INSTITUCIONALES DE ARRANQUE SIMULTÁNEO

Para ejecutar las 5 aplicaciones de manera simultánea en una sola estación de trabajo o servidor local, se utilizarán los siguientes comandos normados:

```bash
# Servidor 00: Portal Unificado (Raíz)
python3 -m http.server 5000 --directory .

# Servidor 01: SIGI Distribución
python3 -m http.server 3001 --directory apps/corpoelec-sigi-gestion-planificacion-distribucion/dist

# Servidor 02: SCTIS V2.0 Interrupciones
python3 -m http.server 3002 --directory apps/sctis-v-2.0-distribucion

# Servidor 03: SGTA Gestor de Tareas y Minutas
python3 -m http.server 3003 --directory apps/corpoelec---gestor-de-tareas-y-minutas/dist

# Servidor 04: Planificación Eléctrica SEN
python3 -m http.server 3004 --directory apps/planificación-eléctrica-sen/dist

# Servidor 05: REMIX SCEIN Equipos Indisponibles
python3 -m http.server 3005 --directory apps/remix-scein---seguimiento-y-control-de-equipos-indisponibles-corpoelec/dist
```

---

**Aprobado por:** Gerencia General de Planificación de Distribución (GGPD)  
**Código Instructivo:** `GGPD-SGM-INS-006 (v1.0 ISO)`
