import { VehicleRecord } from '../types/fleet';
import { VENEZUELA_STATES, ASSET_TYPE_CODES } from '../data/venezuelaRegions';

export function getTypeCode(tipoVehiculo: string): string {
  if (!tipoVehiculo) return 'VEH';
  const clean = tipoVehiculo.trim().toUpperCase();
  if (ASSET_TYPE_CODES[clean]) return ASSET_TYPE_CODES[clean];

  // Derive 4-letter code from words
  const words = clean.split(' ');
  if (words.length >= 2) {
    return (words[0].substring(0, 2) + words[1].substring(0, 2)).toUpperCase();
  }
  return clean.substring(0, 4).toUpperCase();
}

export function getStateCode(estadoNombre: string): string {
  if (!estadoNombre) return 'VEN';
  const match = VENEZUELA_STATES.find(
    s => s.nombre.toLowerCase().trim() === estadoNombre.toLowerCase().trim() ||
         s.codigo.toLowerCase().trim() === estadoNombre.toLowerCase().trim()
  );
  return match ? match.codigo : 'VEN';
}

/**
 * Generates an automatic unique sequential load identifier (correlativo de carga)
 * Nomenclature requested: GGDT + ESTADO + TIPO VEHICULO + CORRELATIVO
 * Example for Guayana Esequiba, Camioneta: GGDT-ESQ-CAMI-0001
 */
export function generateAutoCorrelativo(
  estadoNombre: string,
  tipoVehiculo: string,
  existingVehicles: VehicleRecord[] = []
): string {
  const codEstado = getStateCode(estadoNombre);
  const codTipo = getTypeCode(tipoVehiculo);

  const prefixBase = `GGDT-${codEstado}-${codTipo}`;

  // Find all existing records with similar prefix to find the max sequential number
  let maxSeq = 0;

  existingVehicles.forEach(v => {
    const codesToCheck = [v.correlativo_carga, v.numero_vehiculo].filter(Boolean) as string[];

    codesToCheck.forEach(code => {
      const upper = code.toUpperCase();
      // Match pattern like GGDT-ESQ-CAMI-0001
      if (upper.startsWith(prefixBase)) {
        const matches = upper.match(/(\d+)$/);
        if (matches) {
          const num = parseInt(matches[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });
  });

  // Next sequential number (4 digits, auto-incrementable and unique)
  const nextSeq = maxSeq + 1;
  const seqString = nextSeq.toString().padStart(4, '0');

  return `${prefixBase}-${seqString}`;
}
