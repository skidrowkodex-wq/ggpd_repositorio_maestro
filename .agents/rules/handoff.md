# Protocolo de Continuidad y Relevo Técnico (Handoff)

Este repositorio utiliza un sistema estricto de relevo y continuidad operativa (**Handoff**) para garantizar que cualquier sesión de IA (Antigravity IDE 2.0, CLI `agy`, subagentes o sesiones concurrentes) mantenga la sincronización y coherencia técnica del proyecto.

---

## 1. Regla de Lectura Obligatoria al Iniciar (Hand-in)
Antes de ejecutar cualquier comando, modificar archivos de código, realizar diagnósticos o responder sobre el estado de las aplicaciones:
* **Lectura de `handoff.md`:** Es **obligatorio** leer y procesar el contenido de [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md) en la raíz del espacio de trabajo.
* **Verificación de contexto:** Asegurarse de conocer la última versión activa, aplicaciones involucradas, scripts de arranque, esquemas de base de datos Supabase/PostgreSQL y tareas pendientes.

---

## 2. Regla de Actualización Obligatoria al Finalizar (Hand-off)
Al culminar cualquier intervención, entrega de funcionalidad, refactorización, corrección de errores o pausa de sesión:
* **Actualizar [handoff.md](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/handoff.md)** con:
  1. **📌 Fecha, hora y entorno:** Timestamp actual y cliente/agente utilizado.
  2. **🚀 Estado General:** Estatus operativo de las aplicaciones, portal maestro y esquemas.
  3. **🛠️ Cambios Realizados:** Lista concisa de archivos agregados/editados y funcionalidades implementadas.
  4. **📋 Tareas Pendientes / Próximos Pasos:** Acciones prioritarias que debe continuar el siguiente agente o desarrollador.
  5. **💡 Decisiones y Consideraciones Técnicas:** Notas de arquitectura, variables de entorno, puertos de ejecución o directrices normativas (ISO 8000/9001/27001/55000, COBIT 2019).

---

## 3. Normas de Estilo y Gobernanza
* No eliminar secciones históricas clave del handoff; mantener el registro limpio, legible y actualizado.
* Toda referencia a rutas dentro del workspace debe usar enlaces en formato markdown `[nombre](file:///ruta/absoluta)`.
* Cumplir con los estándares de calidad de datos, tipado estricto y triggers de integridad referencial de CORPOELEC GGPD.
