const states = [
  { code: 'DC', name: 'Distrito Capital', SE: 85, CT: 470, distrib: { se: 63, tx: 22 }, ct_distrib: { c13: 360, c34: 110 } },
  { code: 'ZUL', name: 'Zulia', SE: 95, CT: 540, distrib: { se: 67, tx: 28 }, ct_distrib: { c13: 410, c34: 130 } },
  { code: 'MIR', name: 'Miranda', SE: 70, CT: 430, distrib: { se: 52, tx: 18 }, ct_distrib: { c13: 340, c34: 90 } },
  { code: 'CAR', name: 'Carabobo', SE: 60, CT: 330, distrib: { se: 44, tx: 16 }, ct_distrib: { c13: 260, c34: 70 } },
  { code: 'BOL', name: 'Bolívar', SE: 55, CT: 280, distrib: { se: 35, tx: 20 }, ct_distrib: { c13: 210, c34: 70 } },
  { code: 'ARA', name: 'Aragua', SE: 42, CT: 250, distrib: { se: 30, tx: 12 }, ct_distrib: { c13: 200, c34: 50 } },
  { code: 'LAR', name: 'Lara', SE: 38, CT: 220, distrib: { se: 28, tx: 10 }, ct_distrib: { c13: 170, c34: 50 } },
  { code: 'ANZ', name: 'Anzoátegui', SE: 35, CT: 200, distrib: { se: 25, tx: 10 }, ct_distrib: { c13: 160, c34: 40 } },
  { code: 'TAC', name: 'Táchira', SE: 30, CT: 190, distrib: { se: 22, tx: 8 }, ct_distrib: { c13: 150, c34: 40 } },
  { code: 'FAL', name: 'Falcón', SE: 25, CT: 170, distrib: { se: 19, tx: 6 }, ct_distrib: { c13: 130, c34: 40 } },
  { code: 'MER', name: 'Mérida', SE: 22, CT: 160, distrib: { se: 16, tx: 6 }, ct_distrib: { c13: 130, c34: 30 } },
  { code: 'MON', name: 'Monagas', SE: 20, CT: 150, distrib: { se: 14, tx: 6 }, ct_distrib: { c13: 120, c34: 30 } },
  { code: 'SUC', name: 'Sucre', SE: 19, CT: 140, distrib: { se: 14, tx: 5 }, ct_distrib: { c13: 110, c34: 30 } },
  { code: 'NES', name: 'Nueva Esparta', SE: 18, CT: 120, distrib: { se: 14, tx: 4 }, ct_distrib: { c13: 100, c34: 20 } },
  { code: 'BAR', name: 'Barinas', SE: 18, CT: 125, distrib: { se: 13, tx: 5 }, ct_distrib: { c13: 100, c34: 25 } },
  { code: 'TRU', name: 'Trujillo', SE: 17, CT: 115, distrib: { se: 13, tx: 4 }, ct_distrib: { c13: 95, c34: 20 } },
  { code: 'POR', name: 'Portuguesa', SE: 16, CT: 110, distrib: { se: 12, tx: 4 }, ct_distrib: { c13: 90, c34: 20 } },
  { code: 'YAR', name: 'Yaracuy', SE: 15, CT: 100, distrib: { se: 11, tx: 4 }, ct_distrib: { c13: 85, c34: 15 } },
  { code: 'GUA', name: 'Guárico', SE: 15, CT: 105, distrib: { se: 11, tx: 4 }, ct_distrib: { c13: 85, c34: 20 } },
  { code: 'LAG', name: 'La Guaira', SE: 14, CT: 95, distrib: { se: 10, tx: 4 }, ct_distrib: { c13: 75, c34: 20 } },
  { code: 'APU', name: 'Apure', SE: 12, CT: 80, distrib: { se: 9, tx: 3 }, ct_distrib: { c13: 65, c34: 15 } },
  { code: 'COJ', name: 'Cojedes', SE: 10, CT: 70, distrib: { se: 7, tx: 3 }, ct_distrib: { c13: 55, c34: 15 } },
  { code: 'ESE', name: 'Guayana Esequiba 🇻🇪', SE: 8, CT: 50, distrib: { se: 6, tx: 2 }, ct_distrib: { c13: 40, c34: 10 } },
  { code: 'DEL', name: 'Delta Amacuro', SE: 5, CT: 40, distrib: { se: 4, tx: 1 }, ct_distrib: { c13: 35, c34: 5 } },
  { code: 'AMA', name: 'Amazonas', SE: 4, CT: 30, distrib: { se: 3, tx: 1 }, ct_distrib: { c13: 25, c34: 5 } },
];

let targetSE = 415;
let targetCT = 4311;
let totalSE = 0;
let totalCT = 0;
states.forEach(s => { totalSE += s.SE; totalCT += s.CT; });

let seCaracSE = 0;
let ctCaracCT = 0;

states.forEach((s, idx) => {
  // distribution for SE:
  // Give ~55% of each state to SE_CARAC, ensuring we hit exactly 415.
  s.dist = {};
  s.dist.se_carac_se = Math.floor(s.SE * (415 / totalSE));
  seCaracSE += s.dist.se_carac_se;
  
  // CT:
  s.dist.ct_carac_ct = Math.floor(s.CT * (4311 / totalCT));
  ctCaracCT += s.dist.ct_carac_ct;
});

// Adjust exactly:
states[0].dist.se_carac_se += (415 - seCaracSE);
states[0].dist.ct_carac_ct += (4311 - ctCaracCT);

states.forEach((s, i) => {
  s.dist.se_carac_ct = Math.floor((s.SE - s.dist.se_carac_se) * 0.4);
  s.dist.se_tiras = s.SE - s.dist.se_carac_se - s.dist.se_carac_ct;
  
  s.dist.ct_tiras = s.CT - s.dist.ct_carac_ct;
});

let outStr = `export const VENEZUELA_GIS_CATALOG: StateAssetGIS[] = [\n`;
states.forEach(s => {
  outStr += `  { code: '${s.code}', name: '${s.name}', lat: 0, lng: 0, substations: ${s.SE}, circuits: ${s.CT}, transmissionSE: ${s.distrib.tx}, distributionSE: ${s.distrib.se}, circuits13kV: ${s.ct_distrib.c13}, circuits34kV: ${s.ct_distrib.c34}, origen_se_carac_se: ${s.dist.se_carac_se}, origen_se_carac_ct: ${s.dist.se_carac_ct}, origen_se_tiras: ${s.dist.se_tiras}, origen_ct_carac_ct: ${s.dist.ct_carac_ct}, origen_ct_tiras: ${s.dist.ct_tiras} },\n`;
});
outStr += `];\n`;

console.log(outStr);
