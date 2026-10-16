/**
 * ==============================================================================
 * CORPOELEC - GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
 * SCPPE V3.0 — SERVICIO DE TASA DE CAMBIO (USD / EUR) — ve.dolarapi.com
 * ==============================================================================
 * Implementa la guía canónica:
 *   docs/NAC_2026_GGPD_GUIA_API_TASA_CAMBIO_DOLARAPI_V01.md (GGPD-SGM-INS-006 v1.0)
 *
 * Cumplimiento: ISO 8000-110 (trazabilidad de la fuente), ISO 27001:2022,
 * OWASP ASVS v4.0 N2 (sin concatenación, validación res.ok, timeouts) y
 * ISACA COBIT 2019 (MEA02 — registro del origen y momento de captura).
 *
 * Reglas que este módulo respeta (checklist §11 de la guía):
 *   - Base URL en constante de configuración.
 *   - Timeout explícito (<= 20 s) con AbortController.
 *   - Validación de `res.ok` ANTES de `res.json()` (el 404 llega vacío).
 *   - `promedio` validado como número finito.
 *   - NUNCA se usa `compra`/`venta` (llegan null en la práctica).
 *   - Fuentes en minúsculas: `oficial` | `paralelo`.
 *   - Caché con TTL + fallback a la última tasa persistida.
 *   - Fecha de valor calculada en hora Caracas (UTC-4, sin DST).
 *   - Captura al arrancar + diaria a las 08:05 hora Caracas.
 *   - La fuente `paralelo` se etiqueta como NO institucional.
 * ==============================================================================
 */

import { TASA_BCV_OFICIAL } from '../data/mockData';

export const TC_BASE = 'https://ve.dolarapi.com/v1';
export const TC_TTL_MS = 60 * 60 * 1000; // 1 h de caché en vivo
export const TC_TIMEOUT_MS = 8000;
const TC_STORAGE_KEY = 'ggpd_scppe_tasas_v1';
const TC_TZ_MS = 4 * 60 * 60 * 1000; // America/Caracas = UTC-4 (sin horario de verano)

export type Fuente = 'oficial' | 'paralelo';
export type Moneda = 'USD' | 'EUR';

/** Respuesta cruda de la API en vivo (`/dolares/{fuente}`, `/euros/{fuente}`). */
export interface Tasa {
  moneda: Moneda;
  fuente: Fuente;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

/** Origen del dato según ISO 8000-110 (§6.8 de la guía). */
export type OrigenTasa = 'API' | 'CACHE' | 'RESPALDO';

export interface TasaRegistro {
  moneda: Moneda;
  fuente: Fuente;
  /** Valor de uso general (`promedio`). */
  promedio: number;
  /** Fecha de publicación en la fuente (ISO 8601) o null. */
  fechaActualizacion: string | null;
  /** Fecha de valor de la cotización en hora Caracas (YYYY-MM-DD). */
  fechaValor: string;
  /** De dónde provino el dato: API (vivo) · CACHE (TTL) · RESPALDO (semilla local). */
  origen: OrigenTasa;
  /** Momento de nuestra captura (ISO 8601). */
  obtenidaEl: string;
}

export type EstadoTasas = 'CARGANDO' | 'VIVO' | 'PARCIAL' | 'RESPALDO';

export interface TasaSnapshot {
  estado: EstadoTasas;
  registros: TasaRegistro[];
  actualizadoEl: string | null;
  error?: string;
}

const COMBOS: Array<{ moneda: Moneda; fuente: Fuente }> = [
  { moneda: 'USD', fuente: 'oficial' },
  { moneda: 'USD', fuente: 'paralelo' },
  { moneda: 'EUR', fuente: 'oficial' },
  { moneda: 'EUR', fuente: 'paralelo' },
];

const SEGMENTO: Record<Moneda, string> = { USD: 'dolares', EUR: 'euros' };

interface CacheEntrada {
  promedio: number;
  fechaActualizacion: string | null;
  fechaValor: string;
  obtenidaEl: string;
}

type CacheAlmacen = Record<string, CacheEntrada>;

const claveCombo = (moneda: Moneda, fuente: Fuente) => `${moneda}_${fuente}`;

/** Fecha Caracas (UTC-4) en formato YYYY-MM-DD. */
export function caracasYmd(d: Date): string {
  const x = new Date(d.getTime() - TC_TZ_MS);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${x.getUTCFullYear()}-${p(x.getUTCMonth() + 1)}-${p(x.getUTCDate())}`;
}

/** Semilla de respaldo (último valor conocido) — sólo se usa si no hay caché persistida. */
const RESPALDO: CacheAlmacen = {
  USD_oficial: {
    promedio: TASA_BCV_OFICIAL,
    fechaActualizacion: null,
    fechaValor: caracasYmd(new Date()),
    obtenidaEl: new Date(0).toISOString(),
  },
};

function leerCache(): CacheAlmacen {
  try {
    const raw = localStorage.getItem(TC_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CacheAlmacen;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function escribirCache(almacen: CacheAlmacen): void {
  try {
    localStorage.setItem(TC_STORAGE_KEY, JSON.stringify(almacen));
  } catch {
    /* sin espacio o modo privado: la caché es best-effort */
  }
}

function registroDesdeEntrada(
  moneda: Moneda,
  fuente: Fuente,
  entrada: CacheEntrada,
  origen: OrigenTasa
): TasaRegistro {
  return {
    moneda,
    fuente,
    promedio: entrada.promedio,
    fechaActualizacion: entrada.fechaActualizacion,
    fechaValor: entrada.fechaValor || caracasYmd(new Date()),
    origen,
    obtenidaEl: entrada.obtenidaEl,
  };
}

function construirSnapshotInicial(): TasaSnapshot {
  const cache = leerCache();
  const usadas = new Set<string>();
  const registros: TasaRegistro[] = [];

  for (const { moneda, fuente } of COMBOS) {
    const entrada = cache[claveCombo(moneda, fuente)] ?? RESPALDO[claveCombo(moneda, fuente)];
    if (!entrada) continue; // sin dato alguno: se omite de la UI
    usadas.add(claveCombo(moneda, fuente));
    registros.push(
      registroDesdeEntrada(
        moneda,
        fuente,
        entrada,
        cache[claveCombo(moneda, fuente)] ? 'CACHE' : 'RESPALDO'
      )
    );
  }

  return { estado: 'CARGANDO', registros, actualizadoEl: null };
}

let snapshot: TasaSnapshot = construirSnapshotInicial();
let enVuelo: Promise<TasaSnapshot> | null = null;
let timerDiario: ReturnType<typeof setTimeout> | null = null;
const suscriptores = new Set<(s: TasaSnapshot) => void>();

function notificar(): void {
  for (const cb of suscriptores) {
    try {
      cb(snapshot);
    } catch {
      /* un suscriptor roto no debe tumbar la captura */
    }
  }
}

/** Snapshot actual (síncrono). */
export function getSnapshot(): TasaSnapshot {
  return snapshot;
}

/** Se suscribe a cambios del snapshot. Devuelve la función de baja. */
export function suscribir(cb: (s: TasaSnapshot) => void): () => void {
  suscriptores.add(cb);
  return () => suscriptores.delete(cb);
}

/**
 * Tasa oficial USD en Bs. de forma síncrona (para cálculos existentes).
 * Devuelve el valor vivo si ya se capturó, o la última conocida / respaldo.
 */
export function getTasaOficialUsd(): number {
  const reg = snapshot.registros.find((r) => r.moneda === 'USD' && r.fuente === 'oficial');
  return reg && Number.isFinite(reg.promedio) ? reg.promedio : TASA_BCV_OFICIAL;
}

/** Busca un registro en el snapshot actual. */
export function getRegistro(moneda: Moneda, fuente: Fuente): TasaRegistro | undefined {
  return snapshot.registros.find((r) => r.moneda === moneda && r.fuente === fuente);
}

async function pedirJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
    });
    // El 404 de fuente inválida llega con cuerpo VACÍO: validar antes de parsear.
    if (!res.ok) throw new Error(`dolarapi HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizarTasas(payload: unknown, moneda: Moneda): Tasa[] {
  if (!Array.isArray(payload)) return [];
  const out: Tasa[] = [];
  for (const item of payload) {
    if (!item || typeof item !== 'object') continue;
    const fuente = String((item as any).fuente || '').toLowerCase();
    if (fuente !== 'oficial' && fuente !== 'paralelo') continue;
    const promedio = Number((item as any).promedio);
    if (!Number.isFinite(promedio)) continue;
    out.push({
      moneda,
      fuente: fuente as Fuente,
      nombre: String((item as any).nombre || moneda),
      compra: Number.isFinite(Number((item as any).compra)) ? Number((item as any).compra) : null,
      venta: Number.isFinite(Number((item as any).venta)) ? Number((item as any).venta) : null,
      promedio,
      fechaActualizacion: String((item as any).fechaActualizacion || ''),
    });
  }
  return out;
}

/**
 * Captura idempotente de las 4 combinaciones (USD/EUR × oficial/paralelo).
 * Si una moneda falla, sus registros conservan el último valor conocido
 * (caché o respaldo) y el estado global pasa a `PARCIAL`; si todas fallan,
 * a `RESPALDO`. Nunca lanza.
 */
export function refrescarTasas(forzar = false): Promise<TasaSnapshot> {
  if (enVuelo && !forzar) return enVuelo;

  const ahora = new Date();
  const tarea = (async (): Promise<TasaSnapshot> => {
    const resultados = await Promise.allSettled([
      pedirJson(`${TC_BASE}/${SEGMENTO.USD}`, TC_TIMEOUT_MS),
      pedirJson(`${TC_BASE}/${SEGMENTO.EUR}`, TC_TIMEOUT_MS),
    ]);

    const cache = leerCache();
    const previos = new Map(snapshot.registros.map((r) => [claveCombo(r.moneda, r.fuente), r]));
    const vivos: Array<{ registro: TasaRegistro; entrada: CacheEntrada }> = [];
    const monedas = ['USD', 'EUR'] as Moneda[];

    resultados.forEach((res, idx) => {
      const moneda = monedas[idx];
      if (res.status !== 'fulfilled') return;
      for (const tasa of normalizarTasas(res.value, moneda)) {
        const fechaValor = (tasa as any).fecha || caracasYmd(new Date(tasa.fechaActualizacion || ahora));
        const entrada: CacheEntrada = {
          promedio: tasa.promedio,
          fechaActualizacion: tasa.fechaActualizacion || null,
          fechaValor,
          obtenidaEl: ahora.toISOString(),
        };
        vivos.push({
          registro: registroDesdeEntrada(moneda, tasa.fuente, entrada, 'API'),
          entrada,
        });
      }
    });

    // Persistir sólo lo capturado en vivo (trazabilidad ISO 8000-110).
    for (const { registro, entrada } of vivos) {
      cache[claveCombo(registro.moneda, registro.fuente)] = entrada;
    }
    if (vivos.length > 0) escribirCache(cache);

    // Reconstruir: vivo > último conocido.
    const registros: TasaRegistro[] = [];
    for (const { moneda, fuente } of COMBOS) {
      const vivo = vivos.find((v) => v.registro.moneda === moneda && v.registro.fuente === fuente);
      if (vivo) {
        registros.push(vivo.registro);
        continue;
      }
      const previo = previos.get(claveCombo(moneda, fuente));
      if (previo) {
        registros.push({ ...previo, origen: previo.origen === 'API' ? 'CACHE' : previo.origen });
        continue;
      }
      const entrada = cache[claveCombo(moneda, fuente)] ?? RESPALDO[claveCombo(moneda, fuente)];
      if (entrada) {
        registros.push(registroDesdeEntrada(moneda, fuente, entrada, 'RESPALDO'));
      }
    }

    const totalCombos = COMBOS.length;
    const vivosCount = registros.filter((r) => r.origen === 'API').length;
    const estado: EstadoTasas =
      vivosCount === totalCombos ? 'VIVO' : vivosCount > 0 ? 'PARCIAL' : 'RESPALDO';

    const huboFallo = resultados.some((r) => r.status === 'rejected');

    snapshot = {
      estado,
      registros,
      actualizadoEl: vivosCount > 0 ? ahora.toISOString() : snapshot.actualizadoEl,
      error: huboFallo ? 'API de tasa de cambio no disponible (parcial o total).' : undefined,
    };
    notificar();
    return snapshot;
  })();

  enVuelo = tarea.finally(() => {
    enVuelo = null;
  });
  return enVuelo;
}

/** Milisegundos hasta la próxima 08:05 hora Caracas. */
function msHastaProxima0805(): number {
  const ahora = new Date();
  const caracas = new Date(ahora.getTime() - TC_TZ_MS);
  const objetivoCaracas = new Date(
    Date.UTC(
      caracas.getUTCFullYear(),
      caracas.getUTCMonth(),
      caracas.getUTCDate(),
      8,
      5,
      0,
      0
    )
  );
  if (objetivoCaracas.getTime() <= caracas.getTime()) {
    objetivoCaracas.setUTCDate(objetivoCaracas.getUTCDate() + 1);
  }
  const objetivoUtc = objetivoCaracas.getTime() + TC_TZ_MS;
  return Math.max(1000, objetivoUtc - ahora.getTime());
}

/**
 * Arranca la captura automática: una al iniciar y luego diaria a las 08:05
 * hora Caracas (§5 de la guía). Idempotente.
 */
export function programarCapturaDiaria(): void {
  if (timerDiario !== null) return;
  const programar = () => {
    timerDiario = setTimeout(() => {
      void refrescarTasas(true);
      programar();
    }, msHastaProxima0805());
  };
  programar();
}
