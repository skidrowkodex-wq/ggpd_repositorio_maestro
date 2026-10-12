// ==============================================================================
// ⚡ CORPOELEC - SIGA-SEN v1.0: Servicio de Catálogos y Topología del SEN
// Datos Reales de Generación, Transmisión y Subestaciones (CND Mayo 2025)
// Persistencia y Sincronización en Vivo con InsForge PostgreSQL (Esquema sigad_sen)
// CERO DATA MOCK: 100% Topología Real CND
// ==============================================================================

import { SubestacionSigaSen, SigaSenSeedData, LineaTransmisionSEN } from '../types/sigaSen';
import rawData from '../data/sigaSenSeed.json';
import { insforgeClient } from '../lib/insforgeClient';

const seedData = rawData as unknown as SigaSenSeedData;
let subestacionesList: SubestacionSigaSen[] = seedData.subestaciones || [];
let lineasList: LineaTransmisionSEN[] = seedData.lineas || [];
let estadisticasData = seedData.estadisticas;
let nivelesTensionList = seedData.niveles_tension || [];
let clientesIndustrialesList = seedData.clientes_industriales || [];

type Listener = () => void;
const listeners = new Set<Listener>();

export const sigaSenService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error en listener SIGA-SEN:', err);
      }
    });
  },

  async syncFromInsforge(): Promise<boolean> {
    try {
      // 1. Estadísticas Nacionales desde vista oficial
      const statsRes = await insforgeClient.select<any>('v_estadisticas_nacionales', {
        schema: 'sigad_sen',
        limit: 1,
      });
      if (statsRes.data && statsRes.data.length > 0) {
        estadisticasData = statsRes.data[0];
      }

      // 2. Niveles de Tensión Canónicos
      const nivelesRes = await insforgeClient.select<any>('cnd_niveles_tension', {
        schema: 'sigad_sen',
        limit: 20,
      });
      if (nivelesRes.data && nivelesRes.data.length > 0) {
        nivelesTensionList = nivelesRes.data;
      }

      // 3. Clientes Industriales Estratégicos
      const clientesRes = await insforgeClient.select<any>('cnd_clientes_industriales', {
        schema: 'sigad_sen',
        limit: 100,
      });
      if (clientesRes.data && clientesRes.data.length > 0) {
        clientesIndustrialesList = clientesRes.data;
      }

      // 4. Subestaciones detalladas con bahías de patio
      const subestacionesRes = await insforgeClient.select<SubestacionSigaSen>('v_subestaciones_detalle', {
        schema: 'sigad_sen',
        limit: 1000,
      });
      if (subestacionesRes.data && subestacionesRes.data.length > 0) {
        subestacionesList = subestacionesRes.data;
      }

      // 5. Tramos y Líneas de Interconexión
      const lineasRes = await insforgeClient.select<LineaTransmisionSEN>('v_lineas_transmision', {
        schema: 'sigad_sen',
        limit: 3000,
      });
      if (lineasRes.data && lineasRes.data.length > 0) {
        lineasList = lineasRes.data;
      }

      console.info(
        `⚡ SIGA-SEN: Conectado a InsForge PostgreSQL (Esquema sigad_sen). ` +
        `Cargados ${subestacionesList.length} nodos y ${lineasList.length} líneas de interconexión reales.`
      );
      this.notify();
      return true;
    } catch (err) {
      console.warn('⚠️ SIGA-SEN: Conexión remota diferida, operando con caché local verificado:', err);
      return false;
    }
  },

  getEstadisticas() {
    return estadisticasData;
  },

  getNivelesTension() {
    return nivelesTensionList;
  },

  getClientesIndustriales() {
    return clientesIndustrialesList;
  },

  getCuadrantes(): string[] {
    const set = new Set<string>();
    subestacionesList.forEach((s) => {
      if (s.cuadrante) set.add(s.cuadrante);
    });
    return Array.from(set).sort();
  },

  getTipos(): string[] {
    const set = new Set<string>();
    subestacionesList.forEach((s) => {
      if (s.clasificacion) set.add(s.clasificacion);
    });
    return Array.from(set).sort();
  },

  getSubestaciones(
    filtroTipo?: string,
    filtroCuadrante?: string,
    filtroTension?: string,
    busquedaTexto?: string
  ): SubestacionSigaSen[] {
    return subestacionesList.filter((s) => {
      if (filtroTipo && filtroTipo !== 'TODOS' && s.clasificacion !== filtroTipo) {
        return false;
      }
      if (filtroCuadrante && filtroCuadrante !== 'TODOS' && s.cuadrante !== filtroCuadrante) {
        return false;
      }
      if (filtroTension && filtroTension !== 'TODOS') {
        const targetKv = parseFloat(filtroTension);
        const hasKv = s.barras.some((b) => Math.abs(b.tension_kv - targetKv) < 2);
        if (!hasKv) return false;
      }
      if (busquedaTexto && busquedaTexto.trim()) {
        const query = busquedaTexto.trim().toUpperCase();
        const matchNombre = s.nombre_norm?.toUpperCase().includes(query) || s.nombre_cnd?.toUpperCase().includes(query);
        const matchCodigo = s.codigo?.toString().toUpperCase().includes(query);
        const matchTension = s.tensiones_lista?.toUpperCase().includes(query);
        if (!matchNombre && !matchCodigo && !matchTension) return false;
      }
      return true;
    });
  },

  getSubestacionByCodigo(codigo: string): SubestacionSigaSen | null {
    if (!codigo) return null;
    const clean = codigo.trim().toUpperCase();
    return (
      subestacionesList.find(
        (s) => s.codigo?.toString().toUpperCase() === clean || s.nombre_norm?.toUpperCase() === clean
      ) || null
    );
  },

  getLineas(filtroTensionKv?: number): LineaTransmisionSEN[] {
    if (!filtroTensionKv) return lineasList;
    return lineasList.filter((l) => Math.abs(l.kv - filtroTensionKv) < 2);
  },

  getLineasConectadas(nombreOcodigo: string): { entrantes: LineaTransmisionSEN[]; salientes: LineaTransmisionSEN[] } {
    if (!nombreOcodigo) return { entrantes: [], salientes: [] };
    const n = nombreOcodigo.trim().toUpperCase();
    const entrantes: LineaTransmisionSEN[] = [];
    const salientes: LineaTransmisionSEN[] = [];
    const seenIn = new Set<string>();
    const seenOut = new Set<string>();

    lineasList.forEach((l) => {
      const orig = (l.origen || '').trim().toUpperCase();
      const dest = (l.destino || '').trim().toUpperCase();
      const kv = l.kv || 0;

      if (dest && (dest === n || (dest.includes(n) && n.length > 3)) && orig !== n) {
        const key = `${orig || 'S/E'}-${kv}`;
        if (!seenIn.has(key)) {
          seenIn.add(key);
          entrantes.push(l);
        }
      }
      if (orig && (orig === n || (orig.includes(n) && n.length > 3)) && dest !== n) {
        const key = `${dest || 'S/E'}-${kv}`;
        if (!seenOut.has(key)) {
          seenOut.add(key);
          salientes.push(l);
        }
      }
    });

    return { entrantes, salientes };
  },
};

// NOTA: la sincronización con InsForge se dispara desde el useEffect de App.tsx
// (sigaSenService.subscribe + syncFromInsforge) para evitar llamadas duplicadas.
