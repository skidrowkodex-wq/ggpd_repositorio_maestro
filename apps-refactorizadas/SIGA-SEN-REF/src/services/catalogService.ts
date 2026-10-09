// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Servicio de Catálogos de Activos de Red (871 SE / 4207 CT)
// ==============================================================================

import { SubestacionMaster, CircuitoMaster } from '../types/sigad';
import assetsData from '../data/assetsSeed.json';

// Normalización automática de las 871 subestaciones reales
const subestacionesList: SubestacionMaster[] = ((assetsData.subestaciones as any[]) || []).map((s) => ({
  ...s,
  nombre_se: (s.nombre_se || s.nombre || s.nombre_se_norm || s.codigo || '').toString().trim(),
  nombre_se_norm: (s.nombre_se_norm || s.nombre_se || s.nombre || '').toString().trim(),
}));

// Normalización automática de los 4.207 circuitos reales de core.mae_circuitos
// Resuelve el problema donde la columna en BD es "circuito" o "nombre_ct_norm" y no "nombre_circuito"
const circuitosList: CircuitoMaster[] = ((assetsData.circuitos as any[]) || []).map((c) => {
  const rawNombre = c.nombre_circuito || c.circuito || c.nombre_ct_norm || c.codigo || '';
  // Limpieza de caracteres residuales como asteriscos de ex-operadoras (ej. SABANETA**** -> SABANETA)
  const cleanNombre = rawNombre.toString().replace(/\*+/g, '').trim();

  return {
    ...c,
    nombre_circuito: cleanNombre,
    circuito: cleanNombre,
    nombre_ct_norm: cleanNombre,
    longitud_km: c.longitud_km ?? c.km_total ?? 0,
    nivel_tension_kv: c.nivel_tension_kv || 13.8,
  };
});

export const catalogService = {
  getEstados(): string[] {
    const set = new Set<string>();
    subestacionesList.forEach((s) => {
      if (s.estado) set.add(s.estado.toUpperCase());
    });
    return Array.from(set).sort();
  },

  getSubestaciones(filtroEstado?: string): SubestacionMaster[] {
    if (!filtroEstado || filtroEstado === 'TODOS') {
      return subestacionesList;
    }
    const cleanEstado = filtroEstado.toUpperCase();
    return subestacionesList.filter((s) => s.estado?.toUpperCase() === cleanEstado);
  },

  getSubestacionByCodigo(codigo: string): SubestacionMaster | null {
    if (!codigo) return null;
    const clean = codigo.trim().toUpperCase();
    return subestacionesList.find((s) => s.codigo.toUpperCase() === clean) || null;
  },

  getCircuitosBySubestacion(seCodigo: string): CircuitoMaster[] {
    if (!seCodigo) return [];
    const clean = seCodigo.trim().toUpperCase();
    const se = this.getSubestacionByCodigo(clean);
    const seNombreNorm = (se?.nombre_se_norm || se?.nombre_se || '').toUpperCase();

    return circuitosList.filter((c) => {
      // 1. Coincidencia directa por código de subestación
      if (c.se_codigo && c.se_codigo.trim().toUpperCase() === clean) {
        return true;
      }
      // 2. Coincidencia por subestación cabecera (nombre normalizado)
      if (seNombreNorm && c.subestacion_cabecera && c.subestacion_cabecera.trim().toUpperCase() === seNombreNorm) {
        return true;
      }
      return false;
    });
  },

  getStatsGlobales() {
    let totalMva = 0;
    let moviles = 0;
    subestacionesList.forEach((s) => {
      totalMva += s.capacidad_mva_instalada || 20;
      if (s.es_movil) moviles++;
    });

    return {
      totalSe: subestacionesList.length,
      totalCt: circuitosList.length,
      totalMva: Math.round(totalMva),
      totalMoviles: moviles,
    };
  },
};
