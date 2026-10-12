// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Servicio de Catálogos de Activos de Red (871 SE / 4207 CT)
// Conexión en Vivo con InsForge PostgreSQL (Esquema core.*) & Caché de Alta Disponibilidad
// CERO DATA MOCK: 100% Subestaciones y Circuitos Reales del SEN
// ==============================================================================

import { SubestacionMaster, CircuitoMaster } from '../types/sigad';
import assetsData from '../data/assetsSeed.json';
import { insforgeClient } from '../lib/insforgeClient';

// Normalización automática inicial de las 871 subestaciones reales
let subestacionesList: SubestacionMaster[] = ((assetsData.subestaciones as any[]) || []).map((s) => ({
  ...s,
  nombre_se: (s.nombre_se || s.nombre || s.nombre_se_norm || s.codigo || '').toString().trim(),
  nombre_se_norm: (s.nombre_se_norm || s.nombre_se || s.nombre || '').toString().trim(),
}));

// Normalización automática inicial de los 4.207 circuitos reales de core.mae_circuitos
let circuitosList: CircuitoMaster[] = ((assetsData.circuitos as any[]) || []).map((c) => {
  const rawNombre = c.nombre_circuito || c.circuito || c.nombre_ct_norm || c.codigo || '';
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

type CatalogListener = () => void;
const catalogListeners = new Set<CatalogListener>();

export const catalogService = {
  subscribe(listener: CatalogListener): () => void {
    catalogListeners.add(listener);
    return () => catalogListeners.delete(listener);
  },

  async syncFromInsforge(): Promise<boolean> {
    if (!insforgeClient.apiKey) return false;
    try {
      // 1. Cargar las 871 subestaciones reales desde core.mae_subestaciones
      const seRes = await insforgeClient.select<any>('mae_subestaciones', {
        schema: 'core',
        limit: 1000,
        order: 'nombre_subestacion.asc',
      });
      if (seRes.data && seRes.data.length > 0) {
        subestacionesList = seRes.data.map((s: any) => ({
          codigo: s.codigo_se,
          nombre_se: (s.nombre_subestacion || '').trim(),
          nombre: (s.nombre_subestacion || '').trim(),
          nombre_se_norm: (s.nombre_subestacion || '').trim(),
          estado: (s.codigo_estado || '').trim(),
          region: s.metadata_tecnica?.region || 'NACIONAL',
          municipio: s.municipio || '',
          tipo_instalacion: s.tipo_instalacion || 'SUBESTACION DISTRIBUCION',
          macro_proceso: s.macro_proceso || 'DISTRIBUCION',
          atendida_por: s.atendida_por || '',
          es_movil: s.es_movil || false,
          tension_entrada_kv: s.tension_entrada_kv || null,
          tension_secundaria_kv: s.tension_secundaria_kv || null,
          tension_alimentador_kv: s.tension_alimentador_kv || null,
          alimentador_principal: s.alimentador_principal || null,
          area_se_m2: s.area_se_m2 || null,
          capacidad_mva_instalada: s.metadata_tecnica?.capacidad_mva || 20,
        }));
      }

      // 2. Cargar los 4.207 circuitos reales desde core.mae_circuitos
      const ctRes = await insforgeClient.select<any>('mae_circuitos', {
        schema: 'core',
        limit: 5000,
        order: 'nombre_circuito.asc',
      });
      if (ctRes.data && ctRes.data.length > 0) {
        circuitosList = ctRes.data.map((c: any) => {
          const rawNombre = (c.nombre_circuito || c.circuito || c.nombre_ct_norm || c.codigo_circuito || '').toString();
          const cleanNombre = rawNombre.replace(/\*+/g, '').trim();
          return {
            codigo: c.codigo_circuito,
            nombre_circuito: cleanNombre,
            circuito: cleanNombre,
            nombre_ct_norm: cleanNombre,
            se_codigo: c.codigo_se_padre || '',
            subestacion_cabecera: c.subestacion_cabecera || '',
            estado: c.codigo_estado || '',
            region: c.metadata_tecnica?.region || 'NACIONAL',
            nivel_tension_kv: c.nivel_tension_kv || 13.8,
            longitud_km: c.longitud_km || 0,
            tipo_red: c.tipo_red || 'AÉREO',
            elemento_tipo: c.elemento_tipo || '',
            elemento_tecnico_especifico: c.elemento_tecnico_especifico || '',
            codigo_maniobra_norma: c.codigo_maniobra_norma || '',
            es_componente_patio: c.es_componente_patio || false,
          };
        });
      }

      console.info(
        `⚡ SIGAD: Conectado a InsForge PostgreSQL (Esquema core). ` +
        `Cargadas ${subestacionesList.length} subestaciones y ${circuitosList.length} circuitos reales.`
      );
      catalogListeners.forEach((fn) => fn());
      return true;
    } catch (e) {
      console.warn('⚠️ SIGAD: Error sincronizando catálogos desde InsForge, operando con caché local:', e);
      return false;
    }
  },

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

// NOTA: la sincronización con InsForge se dispara desde el useEffect de App.tsx
// (catalogService.subscribe + syncFromInsforge) para evitar llamadas duplicadas.
