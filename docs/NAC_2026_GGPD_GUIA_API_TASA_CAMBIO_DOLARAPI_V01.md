# GUÍA TÉCNICA DE CONEXIÓN: API DE TASA DE CAMBIO (DÓLAR Y EURO) — DOLARAPI VE

**DOCUMENTO OFICIAL:** `NAC_2026_GGPD_GUIA_API_TASA_CAMBIO_DOLARAPI_V01.md`
**NORMA INSTITUCIONAL:** GGPD-SGM-INS-006 (v1.0) / ISO 8000-110 / ISO 27001:2022 / OWASP ASVS v4.0 Nivel 2
**DESTINATARIOS:** Equipos de desarrollo de las 8 aplicaciones del Repositorio Maestro | Administradores de Datos GGPD | Agentes de IA (Antigravity / CLI `agy` / OpenCode)
**ORIGEN DEL CONOCIMIENTO:** Proyecto `C:\ggc_corporativos` — *Usuarios Corporativos* (`web/server.js`, `web/config.json`, `Scripts/Importar-Tasa-Cambio.ps1`, `Scripts/Sql/004_tasa_cambio.sql`)
**FECHA DE EMISIÓN:** 15 de Octubre de 2026
**ESTATUS:** Vigente — referencia obligatoria para toda integración multimoneda del SEN

---

## 1. RESUMEN EJECUTIVO

Este documento deja estandarizado **cómo conectarse a la API pública de cotizaciones `ve.dolarapi.com`** para obtener la tasa de cambio del **dólar (USD)** y del **euro (EUR)** en Venezuela, de modo que cualquier aplicación del Repositorio Maestro pueda replicar la integración sin re-descubrirla.

Puntos clave:

* **No requiere API key, registro ni autenticación.** Es HTTP `GET` sobre HTTPS con respuesta JSON.
* **CORS abierto** (`Access-Control-Allow-Origin: *`): el navegador *puede* llamarla directamente, aunque se recomienda el consumo *server-side* cuando la app aplica CSP restrictiva (`'self'`).
* **Dos monedas** (`USD`, `EUR`) y **dos fuentes** (`oficial`, `paralelo`).
* La fuente `oficial` se publica **una vez al día** con fecha de valor del día; la fuente `paralelo` se actualiza en **casi tiempo real**.
* La integración de referencia ya está en producción en el proyecto de origen: captura idempotente, persistencia en PostgreSQL con auditoría (`COBIT MEA02`) y fallback a la última tasa conocida.

---

## 2. PARÁMETROS DE ACCESO

| Parámetro | Valor |
|---|---|
| **URL base** | `https://ve.dolarapi.com/v1` |
| **Esquema** | HTTPS (TLS obligatorio) |
| **Método** | `GET` |
| **Autenticación** | Ninguna (sin API key, sin token) |
| **Formato respuesta** | `application/json` (UTF-8) |
| **CORS** | `Access-Control-Allow-Origin: *` (sin credenciales) |
| **Índice de endpoints** | **No existe**: `/v1` y `/v1/metadata` responden `404` |
| **Rate limit documentado** | No; tratar como servicio de terceros → **cachear siempre** |
| **Disponibilidad garantizada** | No (servicio externo) → **siempre requerir fallback local** |

---

## 3. CATÁLOGO DE ENDPOINTS

Todas las rutas son relativas a `https://ve.dolarapi.com/v1`.

| # | Ruta | Devuelve | Uso |
|---|---|---|---|
| 1 | `GET /dolares` | **array** con todas las fuentes de USD | Cotización USD consolidada |
| 2 | `GET /euros` | **array** con todas las fuentes de EUR | Cotización EUR consolidada |
| 3 | `GET /dolares/{fuente}` | **objeto** de una fuente USD | Cotización puntual |
| 4 | `GET /euros/{fuente}` | **objeto** de una fuente EUR | Cotización puntual |
| 5 | `GET /historicos/dolares/{fuente}` | **array** con la serie histórica USD | Series, backfill, valuar runs históricos |
| 6 | `GET /historicos/euros/{fuente}` | **array** con la serie histórica EUR | Series, backfill, valuar runs históricos |

**Fuentes válidas** (`{fuente}`): `oficial` · `paralelo` (son las **únicas** en ambas monedas, verificadas el 2026-10-15).

**⚠️ `fuente` es case-sensitive.** `oficial` y `OFICIAL` **no** son lo mismo: el valor en mayúsculas responde `404`. El segmento de moneda del path sí es literal: `dolares` / `euros` (en minúsculas).

**Respuesta a rutas inválidas:** `404` con **cuerpo vacío** (no es JSON). Cualquier integración debe validar `res.ok` antes de `res.json()`.

---

## 4. FORMA DE LA RESPUESTA (ESQUEMA DE CAMPOS)

### 4.1 Endpoint en vivo (`/dolares/{fuente}`, `/euros/{fuente}`)

Objeto único:

```json
{
  "moneda": "USD",
  "fuente": "oficial",
  "nombre": "Dólar",
  "compra": null,
  "venta": null,
  "promedio": 879.1225,
  "fechaActualizacion": "2026-10-15T00:00:00-04:00"
}
```

| Campo | Tipo | Descripción | Observación |
|---|---|---|---|
| `moneda` | string | `USD` o `EUR` | |
| `fuente` | string | `oficial` o `paralelo` | En minúsculas |
| `nombre` | string | Etiqueta legible (`Dólar`, `Euro`, `Paralelo`) | Útil para UI |
| `compra` | number \| null | Cotización de compra | **Habitualmente `null`** |
| `venta` | number \| null | Cotización de venta | **Habitualmente `null`** |
| `promedio` | number | **Valor de uso general** | Único campo siempre presente y numérico |
| `fechaActualizacion` | string | ISO 8601 | **Formato inconsistente** → ver §6.2 |

**Ejemplo de valores reales (2026-10-15):**

| Moneda / Fuente | `promedio` |
|---|---|
| USD oficial | `879.1225` |
| USD paralelo | `1005.640985` |
| EUR oficial | `977.68092347` |
| EUR paralelo | `1126.733262` |

### 4.2 Endpoint de lista (`/dolares`, `/euros`)

**Misma estructura que 4.1, pero como array** (un objeto por fuente). Ideal para obtener todas las cotizaciones con una sola llamada.

### 4.3 Endpoint histórico (`/historicos/...`)

**Array de objetos con una estructura DIFERENTE** (sin `moneda`, sin `nombre`, sin `fechaActualizacion`):

```json
{ "fuente": "oficial", "compra": null, "venta": null, "promedio": 17.5591, "fecha": "2023-01-03" }
```

| Campo | Tipo | Descripción |
|---|---|---|
| `fuente` | string | Repite la fuente consultada |
| `compra` / `venta` | number \| null | Casi siempre `null` |
| `promedio` | number | Cotización de esa fecha |
| `fecha` | string | **`YYYY-MM-DD`** (fecha de valor) — *no* es un timestamp |

> **La moneda NO aparece en cada elemento:** ya está implícita en el segmento del path (`/historicos/euros/...` → todo es EUR). Si se consolidan series de ambas monedas, debe inyectarse `moneda` en el código cliente.

---

## 5. ZONA HORARIA Y CALENDARIO DE PUBLICACIÓN

* **Zona:** `America/Caracas` = **UTC-4**, **sin horario de verano**.
* **Fuente `oficial`:** el campo `fechaActualizacion` llega como `00:00:00-04:00` del día de la cotización (la del día se publica al inicio del día hábil).
* **Fuente `paralelo`:** `fechaActualizacion` llega en **UTC con sufijo `Z`** (ej. `2026-10-15T20:01:34.174Z`), porque refleja el último muestreo.
* **Fecha de valor:** la fecha *de la cotización* es la fecha Caracas, no la fecha del servidor ni la del navegador.

Conversión a fecha Caracas en JavaScript (patrón del proyecto de origen):

```js
const TZ_MS = 4 * 60 * 60 * 1000; // America/Caracas = UTC-4 (sin horario de verano)

function caracasYmd(d) {
  const x = new Date(d.getTime() - TZ_MS);   // UTC - 4h = hora de Caracas
  const p = (n) => String(n).padStart(2, '0');
  return `${x.getUTCFullYear()}-${p(x.getUTCMonth() + 1)}-${p(x.getUTCDate())}`;
}

// Uso con fecha de valor que a veces no existe:
const fechaValor = item.fecha || caracasYmd(new Date(item.fechaActualizacion || Date.now()));
```

**Política de captura recomendada** (heredada del proyecto de origen):

1. **Al arrancar el servicio:** capturar si aún no existe la fila de hoy.
2. **Una vez al día a las 08:05 hora Caracas** (bajo la hora de inicio laboral, cuando la oficial ya fue publicada), con reprogramación automática cada 24 h.
3. **Idempotente:** no re-consultar si ya existe registro de `(moneda, fuente, fecha de valor)`, salvo orden explícita de forzar.

---

## 6. ADVERTENCIAS Y TRAMPAS CONOCIDAS

> ⚠️ Estas seis observaciones fueron **verificadas en vivo el 15-10-2026**. Son las que más tiempo consumen si no se conocen.

1. **Usar `promedio`, no `compra`/`venta`.** En ambas monedas y ambas fuentes, `compra` y `venta` llegan `null` en la práctica. Cualquier cálculo basado en ellos dará `NaN`.

2. **`fuente` case-sensitive + `404` con cuerpo vacío.** No usar mayúsculas; validar `res.ok` **antes** de `res.json()`, porque `404` devuelve texto vacío y `JSON.parse('')` lanza excepción.

3. **Los parámetros de filtro del histórico NO existen.** Probado: `?fechaDesde=2026-10-10` y `?desde=2026-10-10` **se ignoran** y la API devuelve la serie completa (~910 filas desde 2023-01-03). **El filtrado por rango de fechas debe hacerse en el cliente:**

   ```js
   const serie = (await res.json()).filter(x => x.fecha >= '2026-01-01');
   ```

4. **`fechaActualizacion` tiene dos formatos distintos:** la oficial trae offset `-04:00` y la paralelo trae `Z` (UTC). Parsear siempre con `new Date(valor)` y derivar la fecha con la regla de Caracas de §5; nunca extraer la fecha con un *substring*.

5. **Redondeo de decimales.** El `promedio` llega con hasta **8 decimales** (ej. `977.68092347`). Si la columna es `NUMERIC(18,6)` —como en el proyecto de origen— el valor se redondea a 6. Para catálogos de referencia o valúaciones con alta precisión, usar **`NUMERIC(18,8)`**.

6. **CORS abierto ≠ disponible en navegador.** Aunque la API responde `Access-Control-Allow-Origin: *`, si la app define **CSP `connect-src 'self'`** (patrón de seguridad GGPD), el navegador bloqueará la llamada. En ese caso **el fetch debe hacerse en el servidor** y exponer un endpoint propio.

7. **Servicio externo sin SLA.** Toda integración debe: (a) **cachear** (≥ 1 h en vivo; 24 h para la oficial), (b) **tener timeout** (< 20 s), y (c) **degradar** a la última tasa persistida localmente si la API no responde.

8. **Trazabilidad de la fuente (ISO 8000-110).** Registrar siempre de dónde vino la tasa: campo `origen` = `API` (captura en vivo) o `HISTORICO` (backfill), más `obtenida_el` (momento de captura) y `fecha_actualizacion` (momento de publicación). La fuente `paralelo` **no** es una cotización institucional: etiquetarla como tal en cualquier dato expuesto.

---

## 7. CÓDIGO DE CONEXIÓN LISTO PARA USAR

### 7.1 Cliente TypeScript/JavaScript (front-end, con caché y timeout)

```ts
const TC_BASE = 'https://ve.dolarapi.com/v1';
const TC_TTL_MS = 60 * 60 * 1000; // 1 h de caché
const TC_TIMEOUT_MS = 8000;

export type Fuente = 'oficial' | 'paralelo';
export type Moneda = 'USD' | 'EUR';

export interface Tasa {
  moneda: Moneda;
  fuente: Fuente;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

const segmento = (m: Moneda) => (m === 'EUR' ? 'euros' : 'dolares');

export async function obtenerTasa(moneda: Moneda, fuente: Fuente = 'oficial'): Promise<Tasa> {
  const clave = `ggpd_tasa_${moneda}_${fuente}`;
  try {
    const cache = JSON.parse(localStorage.getItem(clave) ?? 'null');
    if (cache && Date.now() - cache.ts < TC_TTL_MS) return cache.dato as Tasa;
  } catch { /* caché corrupto: ignorar y consultar */ }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TC_TIMEOUT_MS);
  try {
    const res = await fetch(`${TC_BASE}/${segmento(moneda)}/${fuente}`, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`dolarapi HTTP ${res.status}`); // 404 = fuente inválida
    const dato: Tasa = await res.json();
    if (!Number.isFinite(dato.promedio)) throw new Error('promedio no numérico');
    try { localStorage.setItem(clave, JSON.stringify({ ts: Date.now(), dato })); } catch { /* sin espacio */ }
    return dato;
  } finally {
    clearTimeout(timer);
  }
}
```

### 7.2 Consumo server-side (recomendado con CSP `'self'`)

```js
async function pedirJson(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json', 'user-agent': 'ggpd-web/2.0' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

const TC_BASE = 'https://ve.dolarapi.com/v1';
const urlTasa = (moneda, fuente) =>
  `${TC_BASE}/${moneda === 'EUR' ? 'euros' : 'dolares'}/${encodeURIComponent(fuente)}`;
```

### 7.3 PowerShell (scripts de escritorio / ETL)

```powershell
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

$url = 'https://ve.dolarapi.com/v1/dolares/oficial'
$tasa = Invoke-RestMethod -Uri $url -Method Get -Headers @{ accept = 'application/json' } -TimeoutSec 20

# Siempre verificar los campos: compra/venta suelen ser null
"{0}/{1} = {2} (act. {3})" -f $tasa.moneda, $tasa.fuente, $tasa.promedio, $tasa.fechaActualizacion

# Histórico: el filtro de fechas es LOCAL, la API devuelve todo
$serie = Invoke-RestMethod -Uri 'https://ve.dolarapi.com/v1/historicos/dolares/oficial' -TimeoutSec 60 |
         Where-Object { $_.fecha -ge '2026-01-01' }
```

### 7.4 Verificación rápida (una sola línea)

```powershell
Invoke-RestMethod 'https://ve.dolarapi.com/v1/dolares/oficial' |
  Select-Object moneda, fuente, promedio, fechaActualizacion | Format-List
```

Salida esperada (2026-10-15): `moneda: USD`, `fuente: oficial`, `promedio: 879.1225`, `fechaActualizacion: 2026-10-15T00:00:00-04:00`.

---

## 8. PATRÓN DE PERSISTENCIA RECOMENDADO (POSTGRESQL)

Un registro por **(moneda, fuente, fecha de valor)**, idempotente vía `ON CONFLICT`.

```sql
-- Idempotente: se puede ejecutar varias veces.
BEGIN;

CREATE TABLE IF NOT EXISTS tasa_cambio (
    moneda              TEXT    NOT NULL,           -- USD | EUR
    fuente              TEXT    NOT NULL,           -- oficial | paralelo
    fecha_valor         DATE    NOT NULL,           -- día de la cotización (hora Caracas)
    promedio            NUMERIC(18,8) NOT NULL,     -- 8 decimales: ver §6.5
    compra              NUMERIC(18,8),
    venta               NUMERIC(18,8),
    origen              TEXT    NOT NULL,           -- API | HISTORICO
    fecha_actualizacion TIMESTAMPTZ,                -- fecha de publicación en la fuente
    obtenida_el         TIMESTAMPTZ NOT NULL DEFAULT now(),  -- momento de nuestra captura
    PRIMARY KEY (moneda, fuente, fecha_valor)
);

COMMENT ON TABLE tasa_cambio IS
  'Tasa de cambio (USD/EUR) obtenida de ve.dolarapi.com. Origen: API (vivo) o HISTORICO (backfill).';

-- Última tasa vigente por moneda/fuente (la que usa el tablero).
CREATE OR REPLACE VIEW v_tasa_actual AS
SELECT DISTINCT ON (moneda, fuente)
       moneda, fuente, fecha_valor, promedio, origen, obtenida_el, fecha_actualizacion
FROM   tasa_cambio
ORDER  BY moneda, fuente, fecha_valor DESC;

COMMIT;
```

**Upsert (SQL parametrizado, anti-inyección):**

```js
const SQL_UPSERT = `
  INSERT INTO tasa_cambio
    (moneda, fuente, fecha_valor, promedio, compra, venta, origen, fecha_actualizacion)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  ON CONFLICT (moneda, fuente, fecha_valor) DO UPDATE SET
    promedio            = EXCLUDED.promedio,
    compra              = EXCLUDED.compra,
    venta               = EXCLUDED.venta,
    origen              = EXCLUDED.origen,
    fecha_actualizacion = EXCLUDED.fecha_actualizacion,
    obtenida_el         = now()`;

await pool.query(SQL_UPSERT, [
  moneda, fuente, fechaValor, promedio,
  compra ?? null, venta ?? null, 'API', item.fechaActualizacion ?? null,
]);
```

**Consulta de tasa para valuar una fecha (con fallback a la última conocida):**

```sql
-- Última tasa oficial con fecha <= la fecha a valuar; si no hay, la más reciente.
SELECT promedio
FROM   tasa_cambio
WHERE  moneda = $1 AND fuente = 'oficial'
  AND  fecha_valor <= COALESCE($2::date, DATE '9999-12-31')
ORDER  BY fecha_valor DESC
LIMIT  1;
```

---

## 9. AUDITORÍA Y CONTROLES (COBIT MEA02)

Toda captura debe quedar trazada. Patrón del proyecto de origen (no rompe la captura si falla):

```js
// accion: 'TASA_CAMBIO' · resultado: 'OK' | 'FAIL'
// detalle: 'actualizada USD/oficial=879.1225 (2026-10-15)'
INSERT INTO audit_log (username, perfil, accion, detalle, resultado)
VALUES ('sistema', 'SISTEMA', $1, $2, $3);
```

Al iniciar la captura, el servicio reporta por consola el resultado desagregado, por ejemplo:

```
Tasa de cambio: {"actualizados":["EUR/oficial=977.68 (2026-10-15)"],"omitidos":["USD/oficial"],"fallos":[]}
```

**Control previo a llamar a la API** (evita consumo innecesario):

```sql
SELECT 1 FROM tasa_cambio
WHERE  moneda = $1 AND fuente = $2 AND fecha_valor = $3;
```

---

## 10. APLICACIONES DEL REPOSITORIO MAESTRO QUE PUEDEN CONSUMIRLA

| Aplicación | Puerto | Caso de uso de la tasa |
|---|---|---|
| **SCPPE** (`apps-refactorizadas/SCPPE-REF`) | 3004 | **Multimoneda SAMC**: catálogo `samc.samc_moneda` (USD, EUR, RUB, CNY, BRICS…) y los 3 escenarios financieros (SOLICITADO / AJUSTADO MPPP / ASIGNADO) en `db/schema_samc/03_samc_multimoneda.sql`. **Consumidor principal.** |
| **SCTIS** (`apps-refactorizadas/SCTIS-REF`) | 3002 | Valuar en USD los costos asociados a interrupciones de distribución. |
| **SIGI** (`apps-refactorizadas/SIGI-REF`) | 3001 | Cuadro de mando con indicadores económicos convertibles. |
| **SIGAD** (`apps-refactorizadas/SIGAD-REF`) | 3007 | Valoración de activos eléctricos (ISO 55000) en moneda extranjera. |
| **SIGF** (`apps-refactorizadas/SIGF-REF`) | 3010 | Costos de flota (combustible/repuestos importados). |
| Portal Maestro | 5000 | Visualización de referencias. |

> **Patrón de integración de referencia (en producción):** `C:\ggc_corporativos\web\server.js` → secciones *tasa de cambio* (`TC`, `urlTasa`, `pedirJSON`, `upsertTasa`, `capturarTasa`, `tasaDe`, `tasasData`, `programarTasa`) y `C:\ggc_corporativos\web\config.json` → bloque `tasaCambio`.

---

## 11. CHECKLIST DE INTEGRACIÓN

- [ ] URL base en una **constante/variable de configuración** (`baseUrl`), no escrita en cada llamada.
- [ ] **Timeout** explícito (≤ 20 s) con `AbortController`.
- [ ] Validación `res.ok` **antes** de `res.json()` (el `404` viene vacío).
- [ ] Validación de que `promedio` es un número finito antes de usarlo.
- [ ] Uso de `promedio` (nunca `compra`/`venta` sin verificar presencia).
- [ ] Fuentes en **minúsculas** (`oficial` / `paralelo`).
- [ ] Filtro de fechas del histórico hecho en **cliente**.
- [ ] Caché con TTL + **fallback a última tasa persistida** ante error.
- [ ] Fecha de valor calculada en **hora Caracas (UTC-4)**.
- [ ] Tabla con `UNIQUE`/`PK (moneda, fuente, fecha_valor)` y **`ON CONFLICT`** (captura idempotente).
- [ ] `origen` (`API`/`HISTORICO`) + `obtenida_el` para trazabilidad ISO 8000-110.
- [ ] Auditoría de captura OK/FAIL (COBIT MEA02).
- [ ] Captura **al arrancar** y **diaria a las 08:05** hora Caracas.
- [ ] Si hay CSP `'self'`: fetch **server-side** con endpoint propio.
- [ ] La fuente `paralelo` queda **etiquetada como no institucional** en la UI.

---

## 12. TRAZABILIDAD DE ESTE DOCUMENTO

| Campo | Valor |
|---|---|
| Origen del conocimiento | `C:\ggc_corporativos` (`web/server.js`, `web/config.json`, `Scripts/Importar-Tasa-Cambio.ps1`, `Scripts/Sql/004_tasa_cambio.sql`) |
| Verificación en vivo | 15-10-2026 (endpoints, CORS, fuentes, históricos, 404 y parámetros de filtro) |
| Glosario de términos | Fuente `oficial` = referencia BCV · Fuente `paralelo` = mercado, no institucional |
| Actualización | Regenerar los valores de §4.1 y re-verificar §6 ante cualquier cambio del servicio |
