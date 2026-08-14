import re

with open("apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/dashboards/AssetsMapDashboard.tsx", "r") as f:
    content = f.read()

# 1. Update StateAssetGIS and VENEZUELA_GIS_CATALOG
interface_replacement = """export interface StateAssetGIS {
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
  { code: 'DC', name: 'Distrito Capital', lat: 10.4806, lng: -66.9036, substations: 85, circuits: 470, transmissionSE: 22, distributionSE: 63, circuits13kV: 360, circuits34kV: 110, origen_se_carac_se: 60, origen_se_carac_ct: 10, origen_se_tiras: 15, origen_ct_carac_ct: 454, origen_ct_tiras: 16 },
  { code: 'ZUL', name: 'Zulia', lat: 10.6427, lng: -71.6125, substations: 95, circuits: 540, transmissionSE: 28, distributionSE: 67, circuits13kV: 410, circuits34kV: 130, origen_se_carac_se: 52, origen_se_carac_ct: 17, origen_se_tiras: 26, origen_ct_carac_ct: 509, origen_ct_tiras: 31 },
  { code: 'MIR', name: 'Miranda', lat: 10.3444, lng: -67.0428, substations: 70, circuits: 430, transmissionSE: 18, distributionSE: 52, circuits13kV: 340, circuits34kV: 90, origen_se_carac_se: 38, origen_se_carac_ct: 12, origen_se_tiras: 20, origen_ct_carac_ct: 405, origen_ct_tiras: 25 },
  { code: 'CAR', name: 'Carabobo', lat: 10.1620, lng: -68.0077, substations: 60, circuits: 330, transmissionSE: 16, distributionSE: 44, circuits13kV: 260, circuits34kV: 70, origen_se_carac_se: 33, origen_se_carac_ct: 10, origen_se_tiras: 17, origen_ct_carac_ct: 311, origen_ct_tiras: 19 },
  { code: 'BOL', name: 'Bolívar', lat: 8.1200, lng: -63.5500, substations: 55, circuits: 280, transmissionSE: 20, distributionSE: 35, circuits13kV: 210, circuits34kV: 70, origen_se_carac_se: 30, origen_se_carac_ct: 10, origen_se_tiras: 15, origen_ct_carac_ct: 264, origen_ct_tiras: 16 },
  { code: 'ARA', name: 'Aragua', lat: 10.2469, lng: -67.5958, substations: 42, circuits: 250, transmissionSE: 12, distributionSE: 30, circuits13kV: 200, circuits34kV: 50, origen_se_carac_se: 23, origen_se_carac_ct: 7, origen_se_tiras: 12, origen_ct_carac_ct: 235, origen_ct_tiras: 15 },
  { code: 'LAR', name: 'Lara', lat: 10.0647, lng: -69.3570, substations: 38, circuits: 220, transmissionSE: 10, distributionSE: 28, circuits13kV: 170, circuits34kV: 50, origen_se_carac_se: 21, origen_se_carac_ct: 6, origen_se_tiras: 11, origen_ct_carac_ct: 207, origen_ct_tiras: 13 },
  { code: 'ANZ', name: 'Anzoátegui', lat: 10.1360, lng: -64.6860, substations: 35, circuits: 200, transmissionSE: 10, distributionSE: 25, circuits13kV: 160, circuits34kV: 40, origen_se_carac_se: 19, origen_se_carac_ct: 6, origen_se_tiras: 10, origen_ct_carac_ct: 188, origen_ct_tiras: 12 },
  { code: 'TAC', name: 'Táchira', lat: 7.7669, lng: -72.2250, substations: 30, circuits: 190, transmissionSE: 8, distributionSE: 22, circuits13kV: 150, circuits34kV: 40, origen_se_carac_se: 16, origen_se_carac_ct: 5, origen_se_tiras: 9, origen_ct_carac_ct: 179, origen_ct_tiras: 11 },
  { code: 'FAL', name: 'Falcón', lat: 11.4045, lng: -69.6734, substations: 25, circuits: 170, transmissionSE: 6, distributionSE: 19, circuits13kV: 130, circuits34kV: 40, origen_se_carac_se: 13, origen_se_carac_ct: 4, origen_se_tiras: 8, origen_ct_carac_ct: 160, origen_ct_tiras: 10 },
  { code: 'MER', name: 'Mérida', lat: 8.5983, lng: -71.1450, substations: 22, circuits: 160, transmissionSE: 6, distributionSE: 16, circuits13kV: 130, circuits34kV: 30, origen_se_carac_se: 12, origen_se_carac_ct: 4, origen_se_tiras: 6, origen_ct_carac_ct: 150, origen_ct_tiras: 10 },
  { code: 'MON', name: 'Monagas', lat: 9.7469, lng: -63.1833, substations: 20, circuits: 150, transmissionSE: 6, distributionSE: 14, circuits13kV: 120, circuits34kV: 30, origen_se_carac_se: 11, origen_se_carac_ct: 3, origen_se_tiras: 6, origen_ct_carac_ct: 141, origen_ct_tiras: 9 },
  { code: 'SUC', name: 'Sucre', lat: 10.4636, lng: -64.1775, substations: 19, circuits: 140, transmissionSE: 5, distributionSE: 14, circuits13kV: 110, circuits34kV: 30, origen_se_carac_se: 10, origen_se_carac_ct: 3, origen_se_tiras: 6, origen_ct_carac_ct: 132, origen_ct_tiras: 8 },
  { code: 'NES', name: 'Nueva Esparta', lat: 10.9575, lng: -63.8697, substations: 18, circuits: 120, transmissionSE: 4, distributionSE: 14, circuits13kV: 100, circuits34kV: 20, origen_se_carac_se: 9, origen_se_carac_ct: 3, origen_se_tiras: 6, origen_ct_carac_ct: 113, origen_ct_tiras: 7 },
  { code: 'BAR', name: 'Barinas', lat: 8.6226, lng: -70.2075, substations: 18, circuits: 125, transmissionSE: 5, distributionSE: 13, circuits13kV: 100, circuits34kV: 25, origen_se_carac_se: 9, origen_se_carac_ct: 3, origen_se_tiras: 6, origen_ct_carac_ct: 117, origen_ct_tiras: 8 },
  { code: 'TRU', name: 'Trujillo', lat: 9.3708, lng: -70.4347, substations: 17, circuits: 115, transmissionSE: 4, distributionSE: 13, circuits13kV: 95, circuits34kV: 20, origen_se_carac_se: 9, origen_se_carac_ct: 3, origen_se_tiras: 5, origen_ct_carac_ct: 108, origen_ct_tiras: 7 },
  { code: 'POR', name: 'Portuguesa', lat: 9.0418, lng: -69.7421, substations: 16, circuits: 110, transmissionSE: 4, distributionSE: 12, circuits13kV: 90, circuits34kV: 20, origen_se_carac_se: 8, origen_se_carac_ct: 3, origen_se_tiras: 5, origen_ct_carac_ct: 103, origen_ct_tiras: 7 },
  { code: 'YAR', name: 'Yaracuy', lat: 10.3394, lng: -68.7425, substations: 15, circuits: 100, transmissionSE: 4, distributionSE: 11, circuits13kV: 85, circuits34kV: 15, origen_se_carac_se: 8, origen_se_carac_ct: 2, origen_se_tiras: 5, origen_ct_carac_ct: 94, origen_ct_tiras: 6 },
  { code: 'GUA', name: 'Guárico', lat: 9.9115, lng: -67.3538, substations: 15, circuits: 105, transmissionSE: 4, distributionSE: 11, circuits13kV: 85, circuits34kV: 20, origen_se_carac_se: 8, origen_se_carac_ct: 2, origen_se_tiras: 5, origen_ct_carac_ct: 99, origen_ct_tiras: 6 },
  { code: 'LAG', name: 'La Guaira', lat: 10.6010, lng: -66.9324, substations: 14, circuits: 95, transmissionSE: 4, distributionSE: 10, circuits13kV: 75, circuits34kV: 20, origen_se_carac_se: 7, origen_se_carac_ct: 2, origen_se_tiras: 5, origen_ct_carac_ct: 89, origen_ct_tiras: 6 },
  { code: 'APU', name: 'Apure', lat: 7.8878, lng: -67.4724, substations: 12, circuits: 80, transmissionSE: 3, distributionSE: 9, circuits13kV: 65, circuits34kV: 15, origen_se_carac_se: 6, origen_se_carac_ct: 2, origen_se_tiras: 4, origen_ct_carac_ct: 75, origen_ct_tiras: 5 },
  { code: 'COJ', name: 'Cojedes', lat: 9.6612, lng: -68.5827, substations: 10, circuits: 70, transmissionSE: 3, distributionSE: 7, circuits13kV: 55, circuits34kV: 15, origen_se_carac_se: 5, origen_se_carac_ct: 2, origen_se_tiras: 3, origen_ct_carac_ct: 66, origen_ct_tiras: 4 },
  { code: 'ESE', name: 'Guayana Esequiba 🇻🇪', lat: 6.8000, lng: -59.8000, substations: 8, circuits: 50, transmissionSE: 2, distributionSE: 6, circuits13kV: 40, circuits34kV: 10, origen_se_carac_se: 4, origen_se_carac_ct: 1, origen_se_tiras: 3, origen_ct_carac_ct: 47, origen_ct_tiras: 3 },
  { code: 'DEL', name: 'Delta Amacuro', lat: 9.0620, lng: -62.0538, substations: 5, circuits: 40, transmissionSE: 1, distributionSE: 4, circuits13kV: 35, circuits34kV: 5, origen_se_carac_se: 2, origen_se_carac_ct: 1, origen_se_tiras: 2, origen_ct_carac_ct: 37, origen_ct_tiras: 3 },
  { code: 'AMA', name: 'Amazonas', lat: 5.6639, lng: -67.6236, substations: 4, circuits: 30, transmissionSE: 1, distributionSE: 3, circuits13kV: 25, circuits34kV: 5, origen_se_carac_se: 2, origen_se_carac_ct: 0, origen_se_tiras: 2, origen_ct_carac_ct: 28, origen_ct_tiras: 2 },
];"""

content = re.sub(r'export interface StateAssetGIS \{.*?\];', interface_replacement, content, flags=re.DOTALL)

# 2. Add filterOrigin state
state_repl = """  const [filterSE, setFilterSE] = useState<'ALL' | 'DISTRIBUCION' | 'TRANSMISION'>('ALL');
  const [filterCT, setFilterCT] = useState<'ALL' | '13.8KV' | '34.5KV'>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<'ALL' | 'CARACTERIZACION_SE' | 'CARACTERIZACION_CT' | 'TIRAS_INTERRUPCIONES'>('ALL');"""
content = re.sub(r"  const \[filterSE, setFilterSE\].*?setFilterCT.*?ALL'\);", state_repl, content, flags=re.DOTALL)

# 3. Helpers getSEValueByFilter and getCTValueByFilter
helpers_repl = """  // Función helper para obtener valor SE por estado según filtro y ORIGEN
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
  const filteredCircuitsCount = VENEZUELA_GIS_CATALOG.reduce((acc, s) => acc + getCTValueByFilter(s), 0);"""

content = re.sub(r"  // Totales Dinámicos según Filtro SE.*?  // Función helper para obtener valor CT por estado según filtro.*?}", helpers_repl, content, flags=re.DOTALL)

# 4. Filter tooltips and dependencies
content = content.replace("📌 Origen Data: ${st.origenSE}", "📌 Orígenes Data: Caracterización SE (${st.origen_se_carac_se}) | Caracterización CT (${st.origen_se_carac_ct}) | Tiras (${st.origen_se_tiras})")
content = content.replace("📌 Origen Data: ${st.origenCT}", "📌 Orígenes Data: Caracterización CT (${st.origen_ct_carac_ct}) | Tiras (${st.origen_ct_tiras})")

content = content.replace("[filterSE, theme]", "[filterSE, filterOrigin, theme]")
content = content.replace("[filterCT, theme]", "[filterCT, filterOrigin, theme]")

# 5. Global Asset Badges (Add Filter bar)
global_badges = """        {/* Global Asset Badges */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Selector de Origen Global */}
          <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-xl border border-amber-200 dark:border-amber-700/50">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block mb-1 uppercase text-center sm:text-left">Filtro Global por Origen de Datos (ISO 8000)</span>
            <select 
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value as any)}
              className="text-xs font-bold bg-white dark:bg-[#0b182e] border border-amber-300 dark:border-amber-600 rounded px-2 py-1 text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-amber-500 w-full"
            >
              <option value="ALL">Todos los Orígenes</option>
              <option value="CARACTERIZACION_SE">Solo Caracterización SE (415 Oficiales)</option>
              <option value="CARACTERIZACION_CT">Solo Caracterización CT (4311 Oficiales)</option>
              <option value="TIRAS_INTERRUPCIONES">Solo Tiras de Interrupciones</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-2 border border-red-200 dark:border-red-500/30 text-center min-w-[100px]">
              <div className="text-[9px] font-bold text-red-700 dark:text-red-300 uppercase">Total SE</div>
              <div className="text-lg font-black text-red-600 dark:text-red-400">{filteredSubstationsCount}</div>
            </div>
            <div className="rounded-xl bg-cyan-50 dark:bg-cyan-950/40 p-2 border border-cyan-200 dark:border-cyan-500/30 text-center min-w-[100px]">
              <div className="text-[9px] font-bold text-cyan-700 dark:text-cyan-300 uppercase">Total CT</div>
              <div className="text-lg font-black text-cyan-600 dark:text-[#00f2fe]">{filteredCircuitsCount.toLocaleString()}</div>
            </div>
          </div>
        </div>"""

content = re.sub(r"        {\/\* Global Asset Badges \*\/}.*?<\/div>\n        <\/div>", global_badges, content, flags=re.DOTALL)

# 6. Selected State Banner
content = content.replace("📌 {selectedState.origenSE}", "📌 Oficiales: {selectedState.origen_se_carac_se}")
content = content.replace("📌 {selectedState.origenCT}", "📌 Oficiales: {selectedState.origen_ct_carac_ct}")


# 7. Table logic
table_tbody = """            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
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
            </tbody>"""

content = re.sub(r'            <tbody.*?<\/tbody>', table_tbody, content, flags=re.DOTALL)


with open("apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/dashboards/AssetsMapDashboard.tsx", "w") as f:
    f.write(content)

print("File successfully patched!")
