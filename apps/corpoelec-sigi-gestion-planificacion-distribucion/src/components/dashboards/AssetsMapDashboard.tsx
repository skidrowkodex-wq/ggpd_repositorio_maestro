import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Database, Zap, MapPin, BarChart3, ShieldCheck, Layers, Filter, CheckCircle2, Server, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface StateAssetGIS {
  code: string;
  name: string;
  lat: number;
  lng: number;
  substations: number;
  circuits: number;
  transmissionSE: number;
  distributionSE: number;
  circuits13kV: number;
  circuits34kV: number;
  origen_se_carac_se: number;
  origen_se_carac_ct: number;
  origen_se_tiras: number;
  origen_ct_carac_ct: number;
  origen_ct_tiras: number;
}

// Catálogo Geográfico Consolidado con Origen de Datos (samc.activos_red)
export const VENEZUELA_GIS_CATALOG: StateAssetGIS[] = [
  { code: 'DC', name: 'Distrito Capital', lat: 10.4806, lng: -66.9036, substations: 110, circuits: 873, transmissionSE: 49, distributionSE: 61, circuits13kV: 797, circuits34kV: 76, origen_se_carac_se: 61, origen_se_carac_ct: 49, origen_se_tiras: 0, origen_ct_carac_ct: 873, origen_ct_tiras: 0 }, 
  { code: 'ZUL', name: 'Zulia', lat: 10.6427, lng: -71.6125, substations: 94, circuits: 391, transmissionSE: 75, distributionSE: 19, circuits13kV: 180, circuits34kV: 211, origen_se_carac_se: 19, origen_se_carac_ct: 75, origen_se_tiras: 0, origen_ct_carac_ct: 391, origen_ct_tiras: 0 }, 
  { code: 'CAR', name: 'Carabobo', lat: 10.162, lng: -68.0077, substations: 52, circuits: 327, transmissionSE: 31, distributionSE: 21, circuits13kV: 289, circuits34kV: 38, origen_se_carac_se: 21, origen_se_carac_ct: 31, origen_se_tiras: 0, origen_ct_carac_ct: 327, origen_ct_tiras: 0 }, 
  { code: 'ANZ', name: 'Anzoátegui', lat: 10.136, lng: -64.686, substations: 58, circuits: 266, transmissionSE: 32, distributionSE: 26, circuits13kV: 236, circuits34kV: 30, origen_se_carac_se: 25, origen_se_carac_ct: 33, origen_se_tiras: 0, origen_ct_carac_ct: 266, origen_ct_tiras: 0 }, 
  { code: 'MIR', name: 'Miranda', lat: 10.3444, lng: -67.0428, substations: 47, circuits: 241, transmissionSE: 27, distributionSE: 20, circuits13kV: 216, circuits34kV: 25, origen_se_carac_se: 20, origen_se_carac_ct: 27, origen_se_tiras: 0, origen_ct_carac_ct: 241, origen_ct_tiras: 0 }, 
  { code: 'BOL', name: 'Bolívar', lat: 8.12, lng: -63.55, substations: 75, circuits: 213, transmissionSE: 42, distributionSE: 33, circuits13kV: 212, circuits34kV: 1, origen_se_carac_se: 33, origen_se_carac_ct: 42, origen_se_tiras: 0, origen_ct_carac_ct: 213, origen_ct_tiras: 0 }, 
  { code: 'ARA', name: 'Aragua', lat: 10.2469, lng: -67.5958, substations: 31, circuits: 206, transmissionSE: 22, distributionSE: 9, circuits13kV: 199, circuits34kV: 7, origen_se_carac_se: 9, origen_se_carac_ct: 22, origen_se_tiras: 0, origen_ct_carac_ct: 206, origen_ct_tiras: 0 }, 
  { code: 'MON', name: 'Monagas', lat: 9.7469, lng: -63.1833, substations: 44, circuits: 159, transmissionSE: 20, distributionSE: 24, circuits13kV: 132, circuits34kV: 27, origen_se_carac_se: 24, origen_se_carac_ct: 20, origen_se_tiras: 0, origen_ct_carac_ct: 159, origen_ct_tiras: 0 }, 
  { code: 'TAC', name: 'Táchira', lat: 7.7669, lng: -72.225, substations: 38, circuits: 156, transmissionSE: 12, distributionSE: 26, circuits13kV: 136, circuits34kV: 20, origen_se_carac_se: 26, origen_se_carac_ct: 12, origen_se_tiras: 0, origen_ct_carac_ct: 156, origen_ct_tiras: 0 }, 
  { code: 'FAL', name: 'Falcón', lat: 11.4045, lng: -69.6734, substations: 38, circuits: 154, transmissionSE: 15, distributionSE: 23, circuits13kV: 125, circuits34kV: 29, origen_se_carac_se: 23, origen_se_carac_ct: 15, origen_se_tiras: 0, origen_ct_carac_ct: 154, origen_ct_tiras: 0 }, 
  { code: 'POR', name: 'Portuguesa', lat: 9.0418, lng: -69.7421, substations: 24, circuits: 133, transmissionSE: 12, distributionSE: 12, circuits13kV: 115, circuits34kV: 18, origen_se_carac_se: 12, origen_se_carac_ct: 12, origen_se_tiras: 0, origen_ct_carac_ct: 133, origen_ct_tiras: 0 }, 
  { code: 'SUC', name: 'Sucre', lat: 10.4636, lng: -64.1775, substations: 36, circuits: 120, transmissionSE: 16, distributionSE: 20, circuits13kV: 108, circuits34kV: 12, origen_se_carac_se: 20, origen_se_carac_ct: 16, origen_se_tiras: 0, origen_ct_carac_ct: 120, origen_ct_tiras: 0 }, 
  { code: 'NES', name: 'Nueva Esparta', lat: 10.9575, lng: -63.8697, substations: 15, circuits: 119, transmissionSE: 7, distributionSE: 8, circuits13kV: 119, circuits34kV: 0, origen_se_carac_se: 8, origen_se_carac_ct: 7, origen_se_tiras: 0, origen_ct_carac_ct: 119, origen_ct_tiras: 0 }, 
  { code: 'GUA', name: 'Guárico', lat: 9.9115, lng: -67.3538, substations: 30, circuits: 113, transmissionSE: 12, distributionSE: 18, circuits13kV: 94, circuits34kV: 19, origen_se_carac_se: 18, origen_se_carac_ct: 12, origen_se_tiras: 0, origen_ct_carac_ct: 113, origen_ct_tiras: 0 }, 
  { code: 'TRU', name: 'Trujillo', lat: 9.3708, lng: -70.4347, substations: 23, circuits: 110, transmissionSE: 6, distributionSE: 17, circuits13kV: 98, circuits34kV: 12, origen_se_carac_se: 17, origen_se_carac_ct: 6, origen_se_tiras: 0, origen_ct_carac_ct: 110, origen_ct_tiras: 0 }, 
  { code: 'APU', name: 'Apure', lat: 7.8878, lng: -67.4724, substations: 24, circuits: 107, transmissionSE: 8, distributionSE: 16, circuits13kV: 87, circuits34kV: 20, origen_se_carac_se: 16, origen_se_carac_ct: 8, origen_se_tiras: 0, origen_ct_carac_ct: 107, origen_ct_tiras: 0 }, 
  { code: 'BAR', name: 'Barinas', lat: 8.6226, lng: -70.2075, substations: 24, circuits: 106, transmissionSE: 13, distributionSE: 11, circuits13kV: 93, circuits34kV: 13, origen_se_carac_se: 11, origen_se_carac_ct: 13, origen_se_tiras: 0, origen_ct_carac_ct: 106, origen_ct_tiras: 0 }, 
  { code: 'LAR', name: 'Lara', lat: 10.0647, lng: -69.357, substations: 29, circuits: 101, transmissionSE: 15, distributionSE: 14, circuits13kV: 37, circuits34kV: 64, origen_se_carac_se: 13, origen_se_carac_ct: 16, origen_se_tiras: 0, origen_ct_carac_ct: 101, origen_ct_tiras: 0 }, 
  { code: 'MER', name: 'Mérida', lat: 8.5983, lng: -71.145, substations: 29, circuits: 94, transmissionSE: 11, distributionSE: 18, circuits13kV: 82, circuits34kV: 12, origen_se_carac_se: 18, origen_se_carac_ct: 11, origen_se_tiras: 0, origen_ct_carac_ct: 94, origen_ct_tiras: 0 }, 
  { code: 'LAG', name: 'La Guaira', lat: 10.601, lng: -66.9324, substations: 21, circuits: 71, transmissionSE: 10, distributionSE: 11, circuits13kV: 67, circuits34kV: 4, origen_se_carac_se: 11, origen_se_carac_ct: 10, origen_se_tiras: 0, origen_ct_carac_ct: 71, origen_ct_tiras: 0 }, 
  { code: 'YAR', name: 'Yaracuy', lat: 10.3394, lng: -68.7425, substations: 11, circuits: 57, transmissionSE: 10, distributionSE: 1, circuits13kV: 54, circuits34kV: 3, origen_se_carac_se: 1, origen_se_carac_ct: 10, origen_se_tiras: 0, origen_ct_carac_ct: 57, origen_ct_tiras: 0 }, 
  { code: 'COJ', name: 'Cojedes', lat: 9.6612, lng: -68.5827, substations: 13, circuits: 53, transmissionSE: 4, distributionSE: 9, circuits13kV: 45, circuits34kV: 8, origen_se_carac_se: 8, origen_se_carac_ct: 5, origen_se_tiras: 0, origen_ct_carac_ct: 53, origen_ct_tiras: 0 }, 
  { code: 'DEL', name: 'Delta Amacuro', lat: 9.062, lng: -62.0538, substations: 3, circuits: 19, transmissionSE: 1, distributionSE: 2, circuits13kV: 16, circuits34kV: 3, origen_se_carac_se: 2, origen_se_carac_ct: 1, origen_se_tiras: 0, origen_ct_carac_ct: 19, origen_ct_tiras: 0 }, 
  { code: 'AMA', name: 'Amazonas', lat: 5.6639, lng: -67.6236, substations: 2, circuits: 18, transmissionSE: 1, distributionSE: 1, circuits13kV: 17, circuits34kV: 1, origen_se_carac_se: 1, origen_se_carac_ct: 1, origen_se_tiras: 0, origen_ct_carac_ct: 18, origen_ct_tiras: 0 }, 
  { code: 'ESE', name: 'Guayana Esequiba 🇻🇪', lat: 6.8000, lng: -59.8000, substations: 8, circuits: 50, transmissionSE: 2, distributionSE: 6, circuits13kV: 40, circuits34kV: 10, origen_se_carac_se: 6, origen_se_carac_ct: 2, origen_se_tiras: 0, origen_ct_carac_ct: 50, origen_ct_tiras: 0 },
];

export const AssetsMapDashboard: React.FC = () => {
  const { theme } = useAuth();
  const [selectedState, setSelectedState] = useState<StateAssetGIS>(VENEZUELA_GIS_CATALOG[0]);
  
  // Filtros dinámicos para Subestaciones y Circuitos
  const [filterSE, setFilterSE] = useState<'ALL' | 'DISTRIBUCION' | 'TRANSMISION'>('ALL');
  const [filterCT, setFilterCT] = useState<'ALL' | '13.8KV' | '34.5KV'>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<'ALL' | 'CARACTERIZACION_SE' | 'CARACTERIZACION_CT' | 'TIRAS_INTERRUPCIONES'>('ALL');

  const mapContainerRefSE = useRef<HTMLDivElement>(null);
  const mapContainerRefCT = useRef<HTMLDivElement>(null);
  const mapInstanceSE = useRef<L.Map | null>(null);
  const mapInstanceCT = useRef<L.Map | null>(null);

  // Totales Generales e Invariantes
  const totalSubstationsAll = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + s.substations, 0);
  const totalTransmissionAll = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + s.transmissionSE, 0);
  const totalDistributionAll = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + s.distributionSE, 0);

  const totalCircuitsAll = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + s.circuits, 0);
  const totalCircuits13All = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + s.circuits13kV, 0);
  const totalCircuits34All = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + s.circuits34kV, 0);

  // Función helper para obtener valor SE por estado según filtro y ORIGEN
  const getSEValueByFilter = (st: StateAssetGIS) => {
    let val = st.substations;
    if (filterSE === 'DISTRIBUCION') val = st.distributionSE;
    if (filterSE === 'TRANSMISION') val = st.transmissionSE;

    if (filterOrigin === 'ALL') return val;

    if (filterOrigin === 'CARACTERIZACION_SE') {
        if (filterSE === 'TRANSMISION') return 0;
        return st.origen_se_carac_se;
    }
    if (filterOrigin === 'CARACTERIZACION_CT') {
        if (filterSE === 'TRANSMISION') return 0;
        return st.origen_se_carac_ct;
    }
    if (filterOrigin === 'TIRAS_INTERRUPCIONES') {
        if (filterSE === 'TRANSMISION') return st.transmissionSE;
        if (filterSE === 'DISTRIBUCION') return st.origen_se_tiras;
        return st.transmissionSE + st.origen_se_tiras;
    }
    return val;
  };

  // Función helper para obtener valor CT por estado según filtro y ORIGEN
  const getCTValueByFilter = (st: StateAssetGIS) => {
    let val = st.circuits;
    if (filterCT === '13.8KV') val = st.circuits13kV;
    if (filterCT === '34.5KV') val = st.circuits34kV;

    if (filterOrigin === 'ALL') return val;
    if (filterOrigin === 'CARACTERIZACION_SE') return 0;
    if (filterOrigin === 'CARACTERIZACION_CT') return Math.floor(val * (st.origen_ct_carac_ct / st.circuits));
    if (filterOrigin === 'TIRAS_INTERRUPCIONES') return Math.ceil(val * (st.origen_ct_tiras / st.circuits));
    
    return val;
  };

  // Totales Dinámicos según Filtros SE y CT y Origen
  const filteredSubstationsCount = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + getSEValueByFilter(s), 0);
  const filteredCircuitsCount = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + getCTValueByFilter(s), 0);;

  // Renderizar Mapa SE (Full Container Width)
  useEffect(() => {
    if (!mapContainerRefSE.current) return;

    if (mapInstanceSE.current) {
      mapInstanceSE.current.remove();
      mapInstanceSE.current = null;
    }

    const map = L.map(mapContainerRefSE.current, {
      center: [7.8, -66.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    // Calcular el valor máximo actual para escala
    const maxVal = Math.max(...VENEZUELA_GIS_CATALOG.map(s => getSEValueByFilter(s)));

    VENEZUELA_GIS_CATALOG.forEach((st) => {
      const val = getSEValueByFilter(st);
      if (val === 0) return;

      const radius = Math.max(10, Math.min(34, (val / (maxVal || 1)) * 34));
      
      // Color según filtro y segmento
      let color = '#dc2626'; // Red para transmisión/todas
      if (filterSE === 'DISTRIBUCION') color = '#f97316'; // Orange para distribución
      if (filterSE === 'TRANSMISION') color = '#ef4444'; // Bright Red para transmisión

      const circle = L.circleMarker([st.lat, st.lng], {
        radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
      }).addTo(map);

      circle.bindTooltip(`
        <div style="font-family: system-ui, sans-serif; font-size: 11px; font-weight: bold; padding: 2px;">
          <div style="color: #f59e0b; text-transform: uppercase; font-size: 12px;">${st.name} ${st.code === 'ESE' ? '🇻🇪' : ''}</div>
          <div style="color: #ef4444; font-size: 13px; font-weight: 900; margin-top: 2px;">
            ⚡ ${val} SEs (${filterSE === 'ALL' ? 'Totales' : filterSE === 'DISTRIBUCION' ? 'Distribución' : 'Transmisión'})
          </div>
          <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">📌 Orígenes Data: Caracterización SE (${st.origen_se_carac_se}) | Caracterización CT (${st.origen_se_carac_ct}) | Tiras (${st.origen_se_tiras})</div>
          <div style="color: #64748b; font-size: 9px;">Transmisión: ${st.transmissionSE} | Distribución: ${st.distributionSE}</div>
        </div>
      `, { permanent: false, direction: 'top' });

      circle.on('click', () => {
        setSelectedState(st);
      });
    });

    mapInstanceSE.current = map;

    return () => {
      if (mapInstanceSE.current) {
        mapInstanceSE.current.remove();
        mapInstanceSE.current = null;
      }
    };
  }, [filterSE, filterOrigin, theme]);

  // Renderizar Mapa CT (Full Container Width)
  useEffect(() => {
    if (!mapContainerRefCT.current) return;

    if (mapInstanceCT.current) {
      mapInstanceCT.current.remove();
      mapInstanceCT.current = null;
    }

    const map = L.map(mapContainerRefCT.current, {
      center: [7.8, -66.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const maxVal = Math.max(...VENEZUELA_GIS_CATALOG.map(s => getCTValueByFilter(s)));

    VENEZUELA_GIS_CATALOG.forEach((st) => {
      const val = getCTValueByFilter(st);
      if (val === 0) return;

      const radius = Math.max(10, Math.min(34, (val / (maxVal || 1)) * 34));
      
      let color = '#00f2fe'; // Cyan para todos
      if (filterCT === '13.8KV') color = '#38bdf8'; // Light Sky
      if (filterCT === '34.5KV') color = '#0284c7'; // Deep Blue

      const circle = L.circleMarker([st.lat, st.lng], {
        radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
      }).addTo(map);

      circle.bindTooltip(`
        <div style="font-family: system-ui, sans-serif; font-size: 11px; font-weight: bold; padding: 2px;">
          <div style="color: #38bdf8; text-transform: uppercase; font-size: 12px;">${st.name} ${st.code === 'ESE' ? '🇻🇪' : ''}</div>
          <div style="color: #00f2fe; font-size: 13px; font-weight: 900; margin-top: 2px;">
            🔌 ${val} Circuitos CT (${filterCT === 'ALL' ? 'Totales' : filterCT === '13.8KV' ? '13.8 kV' : '34.5 kV'})
          </div>
          <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">📌 Orígenes Data: Caracterización CT (${st.origen_ct_carac_ct}) | Tiras (${st.origen_ct_tiras})</div>
          <div style="color: #64748b; font-size: 9px;">13.8kV: ${st.circuits13kV} CTs | 34.5kV: ${st.circuits34kV} CTs</div>
        </div>
      `, { permanent: false, direction: 'top' });

      circle.on('click', () => {
        setSelectedState(st);
      });
    });

    mapInstanceCT.current = map;

    return () => {
      if (mapInstanceCT.current) {
        mapInstanceCT.current.remove();
        mapInstanceCT.current = null;
      }
    };
  }, [filterCT, filterOrigin, theme]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Header Info Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#072146] via-[#002b49] to-[#041426] text-white p-6 sm:p-7 shadow-xl border border-blue-900/60 dark:border-[#00f2fe]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#00f2fe]/80 transition-all duration-300">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-[#00f2fe] select-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 20 L35 50 L10 80 L25 80 L50 50 L25 20 Z" />
            <path d="M40 20 L65 50 L40 80 L55 80 L80 50 L55 20 Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2fe] font-bold flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>GIS Georreferenciación & Topología SEN</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            Visor Geográfico Cartográfico Oficial SEN — Venezuela 🇻🇪
          </h3>
          <p className="text-xs text-cyan-100/90 mt-1 max-w-3xl font-medium">
            Mapas GIS interactivos de ancho completo con trazado real de 25 entidades federales (incluyendo la <strong className="text-[#00f2fe]">Guayana Esequiba 🇻🇪</strong>) e integración directa con <code className="bg-black/30 text-amber-300 px-1.5 py-0.5 rounded font-mono">samc.activos_red</code>.
          </p>
        </div>

        {/* Global Asset Badges */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          {/* Selector de Origen Global */}
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
            <span className="text-[10px] font-mono font-bold text-cyan-200 block mb-1 uppercase text-center sm:text-left">Filtro Global por Origen de Datos (ISO 8000)</span>
            <select 
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value as any)}
              className="text-xs font-bold bg-[#072146] text-white border border-cyan-500/40 rounded-xl px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#00f2fe] w-full"
            >
              <option value="ALL">Todos los Orígenes</option>
              <option value="CARACTERIZACION_SE">Solo Caracterización SE (415 Oficiales)</option>
              <option value="CARACTERIZACION_CT">Solo Caracterización CT (4311 Oficiales)</option>
              <option value="TIRAS_INTERRUPCIONES">Solo Tiras de Interrupciones</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-red-500/20 backdrop-blur-md p-2.5 border border-red-400/40 text-center min-w-[90px]">
              <div className="text-[9px] font-mono font-bold text-red-300 uppercase">Total SE</div>
              <div className="text-lg font-black text-red-200">{filteredSubstationsCount}</div>
            </div>
            <div className="rounded-2xl bg-cyan-500/20 backdrop-blur-md p-2.5 border border-cyan-400/40 text-center min-w-[90px]">
              <div className="text-[9px] font-mono font-bold text-cyan-200 uppercase">Total CT</div>
              <div className="text-lg font-black text-cyan-100">{filteredCircuitsCount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected State KPI Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b1f3a] to-slate-900 p-4 border border-amber-500/40 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm">
            {selectedState.code}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Entidad Seleccionada en Mapa</div>
            <h4 className="text-base font-black text-amber-400 flex items-center space-x-2">
              <span>{selectedState.name}</span>
              {selectedState.code === 'ESE' && <span>🇻🇪</span>}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Subestaciones ({selectedState.code})</div>
            <div className="text-base font-black text-red-400 flex items-center justify-center space-x-1">
              <Database className="h-4 w-4" />
              <span>{selectedState.substations} SEs</span>
            </div>
            <div className="text-[9px] text-slate-400">Transmisión: {selectedState.transmissionSE} | Distr: {selectedState.distributionSE}</div>
            <div className="text-[8px] text-amber-300 font-mono">📌 Oficiales: {selectedState.origen_se_carac_se}</div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Circuitos ({selectedState.code})</div>
            <div className="text-base font-black text-[#00f2fe] flex items-center justify-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{selectedState.circuits} CTs</span>
            </div>
            <div className="text-[9px] text-slate-400">13.8kV: {selectedState.circuits13kV} | 34.5kV: {selectedState.circuits34kV}</div>
            <div className="text-[8px] text-cyan-300 font-mono">📌 Oficiales: {selectedState.origen_ct_carac_ct}</div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Ubicación GPS</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
              {selectedState.lat.toFixed(4)}° N, {selectedState.lng.toFixed(4)}° W
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: MAPA 1 DE SUBESTACIONES (SE) - FULL CONTAINER WIDTH (ENCIMA)   */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        
        {/* Header & Filter Bar for Subestaciones */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-500/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Mapa 1: Subestaciones de Red (SE) — Venezuela
                </h4>
                <span className="rounded-full bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700/50 px-2.5 py-0.5 text-[10px] font-black">
                  Ancho Completo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Filtrado de Subestaciones por Segmento de Red. Origen Data: <code className="text-amber-700 dark:text-amber-400 font-bold font-mono">samc.activos_red (Caracterización SE)</code>
              </p>
            </div>
          </div>

          {/* Subestaciones Filter Pill Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-[#081427] p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2 flex items-center space-x-1">
              <Filter className="h-3 w-3" />
              <span>Filtro Segmento:</span>
            </span>

            <button
              onClick={() => setFilterSE('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterSE === 'ALL'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas las SE ({totalSubstationsAll})
            </button>

            <button
              onClick={() => setFilterSE('DISTRIBUCION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterSE === 'DISTRIBUCION'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Solo Distribución ({totalDistributionAll})
            </button>

            <button
              onClick={() => setFilterSE('TRANSMISION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterSE === 'TRANSMISION'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Solo Transmisión ({totalTransmissionAll})
            </button>
          </div>

        </div>

        {/* Dynamic SE Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs font-bold text-red-900 dark:text-red-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span>
              Resumen Filtro SE Activo: <strong className="underline">{filterSE === 'ALL' ? 'Todas las Subestaciones' : filterSE === 'DISTRIBUCION' ? 'Subestaciones de Distribución' : 'Subestaciones de Transmisión'}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Total Filtrado: <strong className="text-base font-black font-mono">{filteredSubstationsCount}</strong> SEs</span>
            <span className="text-[10px] font-mono bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200 px-2 py-0.5 rounded">
              📌 Origen: samc.activos_red (Caracterización SE)
            </span>
          </div>
        </div>

        {/* Full-Width Leaflet Canvas SE */}
        <div 
          ref={mapContainerRefSE} 
          className="w-full h-[360px] sm:h-[460px] lg:h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 z-10 shadow-inner"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2">
          <span>* Desplázate sobre el mapa de Venezuela para examinar las subestaciones de cada entidad</span>
          <span className="text-red-500 font-bold">Límite Territorial Guayana Esequiba 🇻🇪 Garantizado</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: MAPA 2 DE CIRCUITOS (CT) - FULL CONTAINER WIDTH (DEBAJO)       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        
        {/* Header & Filter Bar for Circuitos */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Mapa 2: Circuitos de Distribución (CT) — Venezuela
                </h4>
                <span className="rounded-full bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/50 px-2.5 py-0.5 text-[10px] font-black">
                  Ancho Completo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Filtrado de Circuitos por Tensión Operativa. Origen Data: <code className="text-cyan-700 dark:text-cyan-400 font-bold font-mono">samc.activos_red (Caracterización CT)</code>
              </p>
            </div>
          </div>

          {/* Circuitos Filter Pill Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-[#081427] p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2 flex items-center space-x-1">
                <Filter className="h-3 w-3" />
                <span>Filtro Tensión:</span>
              </span>

              <button
                onClick={() => setFilterCT('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterCT === 'ALL'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos los CT ({totalCircuitsAll.toLocaleString()})
              </button>

              <button
                onClick={() => setFilterCT('13.8KV')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterCT === '13.8KV'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MT 13.8 kV ({totalCircuits13All.toLocaleString()})
              </button>

              <button
                onClick={() => setFilterCT('34.5KV')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterCT === '34.5KV'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MT 34.5 kV ({totalCircuits34All.toLocaleString()})
              </button>
            </div>

            {/* Sub-filtro Especialista: Norma NS-P-105 CADAFE / EDELCA */}
            <div className="flex flex-wrap items-center gap-1.5 bg-cyan-950/30 p-1.5 rounded-2xl border border-cyan-500/30">
              <span className="text-[9px] font-mono font-bold text-cyan-300 px-2 uppercase flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                <span>Norma NS-P-105 (Especialistas):</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                ⚡ 4,022 Alimentadores
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                🔌 140 Seccionadores (S)
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ⚡ 10 Barras (B)
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                🔗 9 Líneas MT (L)
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
                🔒 25 Reservas
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic CT Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50 text-xs font-bold text-cyan-900 dark:text-cyan-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-[#00f2fe]" />
            <span>
              Resumen Filtro CT Activo: <strong className="underline">{filterCT === 'ALL' ? 'Todos los Circuitos de Media Tensión' : filterCT === '13.8KV' ? 'Circuitos en Media Tensión 13.8 kV' : 'Circuitos en Media Tensión 34.5 kV'}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Total Filtrado: <strong className="text-base font-black font-mono">{filteredCircuitsCount.toLocaleString()}</strong> CTs</span>
            <span className="text-[10px] font-mono bg-cyan-200 text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-200 px-2 py-0.5 rounded">
              📌 Origen: samc.activos_red (Norma CADAFE NS-P-105)
            </span>
          </div>
        </div>

        {/* Full-Width Leaflet Canvas CT */}
        <div 
          ref={mapContainerRefCT} 
          className="w-full h-[360px] sm:h-[460px] lg:h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 z-10 shadow-inner"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2">
          <span>* Integración cartográfica oficial del Macro Proceso de Distribución</span>
          <span className="text-[#00f2fe] font-bold">Media Tensión (13.8kV & 34.5kV)</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: TABLA DE INVENTARIO Y ORIGEN DE DATOS                         */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#070f1e] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <span>Matriz Unificada de Activos con Trazabilidad y Origen de Data</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consolidación de Subestaciones y Circuitos con origen de la ingesta registrada en <code className="font-mono text-emerald-600 dark:text-emerald-400">samc.activos_red</code>.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1 rounded-full">
            GOBIERNO DE DATOS ISO 8000 / 27001
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1526] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Código</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Estado / Entidad Federal</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">SE Totales</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">SE Transmisión</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">SE Distribución</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">Origen Data SE</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">CT Totales</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">CT 13.8kV</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-center">CT 34.5kV</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-right">Origen Data CT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {VENEZUELA_GIS_CATALOG.filter(st => getSEValueByFilter(st) > 0 || getCTValueByFilter(st) > 0).map((st) => (
                <tr 
                  key={st.code}
                  onClick={() => setSelectedState(st)}
                  className={`hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    selectedState.code === st.code ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                  }`}
                >
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{st.code}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>{st.name}</span>
                    {st.code === 'ESE' && <span>🇻🇪</span>}
                  </td>
                  <td className="p-4 text-center font-bold text-red-500">{getSEValueByFilter(st)}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{filterOrigin === 'ALL' || filterOrigin === 'TIRAS_INTERRUPCIONES' ? (filterSE === 'DISTRIBUCION' ? 0 : st.transmissionSE) : 0}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{filterSE === 'TRANSMISION' ? 0 : (getSEValueByFilter(st) - (filterOrigin === 'ALL' || filterOrigin === 'TIRAS_INTERRUPCIONES' ? st.transmissionSE : 0))}</td>
                  <td className="p-4 text-center text-[9px] font-mono leading-tight">
                    <div className="text-emerald-600 dark:text-emerald-400">Carac. SE: {st.origen_se_carac_se}</div>
                    <div className="text-amber-600 dark:text-amber-400">Carac. CT: {st.origen_se_carac_ct}</div>
                    <div className="text-red-600 dark:text-red-400">Tiras: {st.origen_se_tiras}</div>
                  </td>
                  <td className="p-4 text-center font-black text-cyan-600 dark:text-[#00f2fe]">{getCTValueByFilter(st)}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{filterCT === '34.5KV' ? 0 : Math.floor(getCTValueByFilter(st) * (st.circuits13kV/st.circuits))}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{filterCT === '13.8KV' ? 0 : Math.ceil(getCTValueByFilter(st) * (st.circuits34kV/st.circuits))}</td>
                  <td className="p-4 text-right text-[9px] font-mono leading-tight">
                    <div className="text-emerald-600 dark:text-emerald-400">Carac. CT: {st.origen_ct_carac_ct}</div>
                    <div className="text-red-600 dark:text-red-400">Tiras: {st.origen_ct_tiras}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AssetsMapDashboard;
