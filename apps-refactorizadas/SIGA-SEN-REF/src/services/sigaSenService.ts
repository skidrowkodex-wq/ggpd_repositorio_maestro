// ==============================================================================
// ⚡ CORPOELEC - SIGA-SEN v1.0: Servicio de Catálogos y Topología del SEN
// Datos Reales de Generación, Transmisión y Subestaciones (CND Mayo 2025)
// ==============================================================================

import { SubestacionSigaSen, SigaSenSeedData, LineaTransmisionSEN } from '../types/sigaSen';
import rawData from '../data/sigaSenSeed.json';

const seedData = rawData as unknown as SigaSenSeedData;
const subestacionesList: SubestacionSigaSen[] = seedData.subestaciones || [];
const lineasList: LineaTransmisionSEN[] = seedData.lineas || [];

export const sigaSenService = {
  getEstadisticas() {
    return seedData.estadisticas;
  },

  getNivelesTension() {
    return seedData.niveles_tension || [];
  },

  getClientesIndustriales() {
    return seedData.clientes_industriales || [];
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
        const matchNombre = s.nombre_norm.toUpperCase().includes(query) || s.nombre_cnd.toUpperCase().includes(query);
        const matchCodigo = s.codigo.toUpperCase().includes(query);
        const matchTension = s.tensiones_lista.toUpperCase().includes(query);
        if (!matchNombre && !matchCodigo && !matchTension) return false;
      }
      return true;
    });
  },

  getSubestacionByCodigo(codigo: string): SubestacionSigaSen | null {
    if (!codigo) return null;
    const clean = codigo.trim().toUpperCase();
    return subestacionesList.find((s) => s.codigo.toUpperCase() === clean || s.nombre_norm.toUpperCase() === clean) || null;
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
  }
};
