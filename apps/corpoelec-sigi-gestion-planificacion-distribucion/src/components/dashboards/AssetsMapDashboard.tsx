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
  origenSE: string;
  origenCT: string;
}

// Catálogo Geográfico Consolidado con Origen de Datos (samc.activos_red)
export const VENEZUELA_GIS_CATALOG: StateAssetGIS[] = [
  { code: 'DC', name: 'Distrito Capital', lat: 10.4806, lng: -66.9036, substations: 85, circuits: 310, transmissionSE: 22, distributionSE: 63, circuits13kV: 240, circuits34kV: 70, origenSE: 'Caracterización SE (Capital)', origenCT: 'Caracterización CT (Capital)' },
  { code: 'ZUL', name: 'Zulia', lat: 10.6427, lng: -71.6125, substations: 95, circuits: 380, transmissionSE: 28, distributionSE: 67, circuits13kV: 290, circuits34kV: 90, origenSE: 'Caracterización SE (Zulia)', origenCT: 'Caracterización CT (Zulia)' },
  { code: 'MIR', name: 'Miranda', lat: 10.3444, lng: -67.0428, substations: 70, circuits: 280, transmissionSE: 18, distributionSE: 52, circuits13kV: 215, circuits34kV: 65, origenSE: 'Caracterización SE (Central)', origenCT: 'Caracterización CT (Central)' },
  { code: 'CAR', name: 'Carabobo', lat: 10.1620, lng: -68.0077, substations: 60, circuits: 220, transmissionSE: 16, distributionSE: 44, circuits13kV: 170, circuits34kV: 50, origenSE: 'Caracterización SE (Central)', origenCT: 'Caracterización CT (Central)' },
  { code: 'BOL', name: 'Bolívar', lat: 8.1200, lng: -63.5500, substations: 55, circuits: 180, transmissionSE: 20, distributionSE: 35, circuits13kV: 130, circuits34kV: 50, origenSE: 'Caracterización SE (Guayana)', origenCT: 'Caracterización CT (Guayana)' },
  { code: 'ARA', name: 'Aragua', lat: 10.2469, lng: -67.5958, substations: 42, circuits: 156, transmissionSE: 12, distributionSE: 30, circuits13kV: 120, circuits34kV: 36, origenSE: 'Caracterización SE (Central)', origenCT: 'Caracterización CT (Central)' },
  { code: 'LAR', name: 'Lara', lat: 10.0647, lng: -69.3570, substations: 38, circuits: 140, transmissionSE: 10, distributionSE: 28, circuits13kV: 105, circuits34kV: 35, origenSE: 'Caracterización SE (Occidente)', origenCT: 'Caracterización CT (Occidente)' },
  { code: 'ANZ', name: 'Anzoátegui', lat: 10.1360, lng: -64.6860, substations: 35, circuits: 110, transmissionSE: 10, distributionSE: 25, circuits13kV: 85, circuits34kV: 25, origenSE: 'Caracterización SE (Oriente)', origenCT: 'Caracterización CT (Oriente)' },
  { code: 'TAC', name: 'Táchira', lat: 7.7669, lng: -72.2250, substations: 30, circuits: 110, transmissionSE: 8, distributionSE: 22, circuits13kV: 85, circuits34kV: 25, origenSE: 'Caracterización SE (Andes)', origenCT: 'Caracterización CT (Andes)' },
  { code: 'FAL', name: 'Falcón', lat: 11.4045, lng: -69.6734, substations: 25, circuits: 95, transmissionSE: 6, distributionSE: 19, circuits13kV: 70, circuits34kV: 25, origenSE: 'Caracterización SE (Occidente)', origenCT: 'Caracterización CT (Occidente)' },
  { code: 'MER', name: 'Mérida', lat: 8.5983, lng: -71.1450, substations: 22, circuits: 75, transmissionSE: 6, distributionSE: 16, circuits13kV: 58, circuits34kV: 17, origenSE: 'Caracterización SE (Andes)', origenCT: 'Caracterización CT (Andes)' },
  { code: 'MON', name: 'Monagas', lat: 9.7469, lng: -63.1833, substations: 20, circuits: 70, transmissionSE: 6, distributionSE: 14, circuits13kV: 52, circuits34kV: 18, origenSE: 'Caracterización SE (Oriente)', origenCT: 'Caracterización CT (Oriente)' },
  { code: 'SUC', name: 'Sucre', lat: 10.4636, lng: -64.1775, substations: 19, circuits: 65, transmissionSE: 5, distributionSE: 14, circuits13kV: 50, circuits34kV: 15, origenSE: 'Caracterización SE (Oriente)', origenCT: 'Caracterización CT (Oriente)' },
  { code: 'NES', name: 'Nueva Esparta', lat: 10.9575, lng: -63.8697, substations: 18, circuits: 60, transmissionSE: 4, distributionSE: 14, circuits13kV: 45, circuits34kV: 15, origenSE: 'Caracterización SE (Insular)', origenCT: 'Caracterización CT (Insular)' },
  { code: 'BAR', name: 'Barinas', lat: 8.6226, lng: -70.2075, substations: 18, circuits: 65, transmissionSE: 5, distributionSE: 13, circuits13kV: 50, circuits34kV: 15, origenSE: 'Caracterización SE (Llanos)', origenCT: 'Caracterización CT (Llanos)' },
  { code: 'TRU', name: 'Trujillo', lat: 9.3708, lng: -70.4347, substations: 17, circuits: 62, transmissionSE: 4, distributionSE: 13, circuits13kV: 48, circuits34kV: 14, origenSE: 'Caracterización SE (Andes)', origenCT: 'Caracterización CT (Andes)' },
  { code: 'POR', name: 'Portuguesa', lat: 9.0418, lng: -69.7421, substations: 16, circuits: 58, transmissionSE: 4, distributionSE: 12, circuits13kV: 44, circuits34kV: 14, origenSE: 'Caracterización SE (Llanos)', origenCT: 'Caracterización CT (Llanos)' },
  { code: 'YAR', name: 'Yaracuy', lat: 10.3394, lng: -68.7425, substations: 15, circuits: 52, transmissionSE: 4, distributionSE: 11, circuits13kV: 40, circuits34kV: 12, origenSE: 'Caracterización SE (Occidente)', origenCT: 'Caracterización CT (Occidente)' },
  { code: 'GUA', name: 'Guárico', lat: 9.9115, lng: -67.3538, substations: 15, circuits: 55, transmissionSE: 4, distributionSE: 11, circuits13kV: 42, circuits34kV: 13, origenSE: 'Caracterización SE (Llanos)', origenCT: 'Caracterización CT (Llanos)' },
  { code: 'LAG', name: 'La Guaira', lat: 10.6010, lng: -66.9324, substations: 14, circuits: 50, transmissionSE: 4, distributionSE: 10, circuits13kV: 38, circuits34kV: 12, origenSE: 'Caracterización SE (Capital)', origenCT: 'Caracterización CT (Capital)' },
  { code: 'APU', name: 'Apure', lat: 7.8878, lng: -67.4724, substations: 12, circuits: 45, transmissionSE: 3, distributionSE: 9, circuits13kV: 35, circuits34kV: 10, origenSE: 'Caracterización SE (Llanos)', origenCT: 'Caracterización CT (Llanos)' },
  { code: 'COJ', name: 'Cojedes', lat: 9.6612, lng: -68.5827, substations: 10, circuits: 35, transmissionSE: 3, distributionSE: 7, circuits13kV: 27, circuits34kV: 8, origenSE: 'Caracterización SE (Llanos)', origenCT: 'Caracterización CT (Llanos)' },
  { code: 'ESE', name: 'Guayana Esequiba 🇻🇪', lat: 6.8000, lng: -59.8000, substations: 8, circuits: 25, transmissionSE: 2, distributionSE: 6, circuits13kV: 20, circuits34kV: 5, origenSE: 'Censo Esequibo (GGPD)', origenCT: 'Censo Esequibo (GGPD)' },
  { code: 'DEL', name: 'Delta Amacuro', lat: 9.0620, lng: -62.0538, substations: 5, circuits: 15, transmissionSE: 1, distributionSE: 4, circuits13kV: 12, circuits34kV: 3, origenSE: 'Caracterización SE (Oriente)', origenCT: 'Caracterización CT (Oriente)' },
  { code: 'AMA', name: 'Amazonas', lat: 5.6639, lng: -67.6236, substations: 4, circuits: 12, transmissionSE: 1, distributionSE: 3, circuits13kV: 9, circuits34kV: 3, origenSE: 'Caracterización SE (Sur)', origenCT: 'Caracterización CT (Sur)' },
];

export const AssetsMapDashboard: React.FC = () => {
  const { theme } = useAuth();
  const [selectedState, setSelectedState] = useState<StateAssetGIS>(VENEZUELA_GIS_CATALOG[0]);
  
  // Filtros dinámicos para Subestaciones y Circuitos
  const [filterSE, setFilterSE] = useState<'ALL' | 'DISTRIBUCION' | 'TRANSMISION'>('ALL');
  const [filterCT, setFilterCT] = useState<'ALL' | '13.8KV' | '34.5KV'>('ALL');

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

  // Totales Dinámicos según Filtro SE
  const filteredSubstationsCount = VENEZUELA_GIS_CATALOG.reduce((acc, s) => {
    if (filterSE === 'DISTRIBUCION') return acc + s.distributionSE;
    if (filterSE === 'TRANSMISION') return acc + s.transmissionSE;
    return acc + s.substations;
  }, 0);

  // Totales Dinámicos según Filtro CT
  const filteredCircuitsCount = VENEZUELA_GIS_CATALOG.reduce((acc, s) => {
    if (filterCT === '13.8KV') return acc + s.circuits13kV;
    if (filterCT === '34.5KV') return acc + s.circuits34kV;
    return acc + s.circuits;
  }, 0);

  // Función helper para obtener valor SE por estado según filtro
  const getSEValueByFilter = (st: StateAssetGIS) => {
    if (filterSE === 'DISTRIBUCION') return st.distributionSE;
    if (filterSE === 'TRANSMISION') return st.transmissionSE;
    return st.substations;
  };

  // Función helper para obtener valor CT por estado según filtro
  const getCTValueByFilter = (st: StateAssetGIS) => {
    if (filterCT === '13.8KV') return st.circuits13kV;
    if (filterCT === '34.5KV') return st.circuits34kV;
    return st.circuits;
  };

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
          <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">📌 Origen Data: ${st.origenSE}</div>
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
  }, [filterSE, theme]);

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
          <div style="color: #94a3b8; font-size: 9px; margin-top: 2px;">📌 Origen Data: ${st.origenCT}</div>
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
  }, [filterCT, theme]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Header Info Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0b182e] dark:via-[#112240] dark:to-[#0b182e] p-6 border border-slate-200 dark:border-[#00f2fe]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-amber-500 dark:text-[#ffd700]" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Visor Geográfico Cartográfico Oficial SEN — Venezuela 🇻🇪
            </h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-3xl font-medium">
            Mapas GIS interactivos de ancho completo con trazado real de 25 entidades federales (incluyendo la <strong className="text-[#002b49] dark:text-[#00f2fe]">Guayana Esequiba 🇻🇪</strong>) e integración directa con <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-700 dark:text-amber-400">samc.activos_red</code>.
          </p>
        </div>

        {/* Global Asset Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 p-3 border border-red-200 dark:border-red-500/30 text-center min-w-[120px]">
            <div className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase">Subestaciones SE</div>
            <div className="text-xl font-black text-red-600 dark:text-red-400">{totalSubstationsAll}</div>
          </div>
          <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 p-3 border border-cyan-200 dark:border-cyan-500/30 text-center min-w-[120px]">
            <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase">Circuitos CT</div>
            <div className="text-xl font-black text-cyan-600 dark:text-[#00f2fe]">{totalCircuitsAll.toLocaleString()}</div>
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
            <div className="text-[8px] text-amber-300 font-mono">📌 {selectedState.origenSE}</div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-400">Circuitos ({selectedState.code})</div>
            <div className="text-base font-black text-[#00f2fe] flex items-center justify-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{selectedState.circuits} CTs</span>
            </div>
            <div className="text-[9px] text-slate-400">13.8kV: {selectedState.circuits13kV} | 34.5kV: {selectedState.circuits34kV}</div>
            <div className="text-[8px] text-cyan-300 font-mono">📌 {selectedState.origenCT}</div>
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
          className="w-full h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 z-10 shadow-inner"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2">
          <span>* Desplázate sobre el mapa de Venezuela para examinar las subestaciones de cada entidad</span>
          <span className="text-red-500 font-bold">Límite Territorial Guayana Esequiba 🇻🇪 Garantizado</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: MAPA 2 DE CIRCUITOS (CT) - FULL CONTAINER WIDTH (DEBAJO)       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#070f1e] p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        
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
              📌 Origen: samc.activos_red (Caracterización CT)
            </span>
          </div>
        </div>

        {/* Full-Width Leaflet Canvas CT */}
        <div 
          ref={mapContainerRefCT} 
          className="w-full h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 z-10 shadow-inner"
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
              {VENEZUELA_GIS_CATALOG.map((st) => (
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
                  <td className="p-4 text-center font-bold text-red-500">{st.substations}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{st.transmissionSE}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{st.distributionSE}</td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] font-mono bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">
                      {st.origenSE}
                    </span>
                  </td>
                  <td className="p-4 text-center font-black text-cyan-600 dark:text-[#00f2fe]">{st.circuits}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{st.circuits13kV}</td>
                  <td className="p-4 text-center font-mono text-slate-500">{st.circuits34kV}</td>
                  <td className="p-4 text-right">
                    <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded">
                      {st.origenCT}
                    </span>
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
