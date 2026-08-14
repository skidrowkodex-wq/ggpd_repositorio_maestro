const states = [
  { code: 'DC', name: 'Distrito Capital', SE: 85, CT: 450 },
  { code: 'ZUL', name: 'Zulia', SE: 95, CT: 520 },
  { code: 'MIR', name: 'Miranda', SE: 70, CT: 410 },
  { code: 'CAR', name: 'Carabobo', SE: 60, CT: 310 },
  { code: 'BOL', name: 'Bolívar', SE: 55, CT: 260 },
  { code: 'ARA', name: 'Aragua', SE: 42, CT: 230 },
  { code: 'LAR', name: 'Lara', SE: 38, CT: 200 },
  { code: 'ANZ', name: 'Anzoátegui', SE: 35, CT: 190 },
  { code: 'TAC', name: 'Táchira', SE: 30, CT: 180 },
  { code: 'FAL', name: 'Falcón', SE: 25, CT: 150 },
  { code: 'MER', name: 'Mérida', SE: 22, CT: 140 },
  { code: 'MON', name: 'Monagas', SE: 20, CT: 130 },
  { code: 'SUC', name: 'Sucre', SE: 19, CT: 120 },
  { code: 'NES', name: 'Nueva Esparta', SE: 18, CT: 110 },
  { code: 'BAR', name: 'Barinas', SE: 18, CT: 115 },
  { code: 'TRU', name: 'Trujillo', SE: 17, CT: 105 },
  { code: 'POR', name: 'Portuguesa', SE: 16, CT: 100 },
  { code: 'YAR', name: 'Yaracuy', SE: 15, CT: 90 },
  { code: 'GUA', name: 'Guárico', SE: 15, CT: 95 },
  { code: 'LAG', name: 'La Guaira', SE: 14, CT: 85 },
  { code: 'APU', name: 'Apure', SE: 12, CT: 70 },
  { code: 'COJ', name: 'Cojedes', SE: 10, CT: 60 },
  { code: 'ESE', name: 'Guayana Esequiba 🇻🇪', SE: 8, CT: 40 },
  { code: 'DEL', name: 'Delta Amacuro', SE: 5, CT: 30 },
  { code: 'AMA', name: 'Amazonas', SE: 4, CT: 20 },
];

let totalSE = 0;
let totalCT = 0;
let seCaracSE = 0;
let seCaracCT = 0;
let seTiras = 0;
let ctCaracCT = 0;
let ctTiras = 0;

states.forEach(s => {
  totalSE += s.SE;
  totalCT += s.CT;
  
  // distribute SE
  const sese = Math.floor(s.SE * 0.55); // approx 55% from CARACTERIZACION_SE -> total ~ 411
  const sect = Math.floor(s.SE * 0.20); // approx 20% from CARACTERIZACION_CT
  const stira = s.SE - sese - sect;
  seCaracSE += sese;
  seCaracCT += sect;
  seTiras += stira;
  
  // distribute CT
  const ctct = Math.floor(s.CT * 0.95); // approx 95% from CARACTERIZACION_CT -> total ~ 4000+
  const ctira = s.CT - ctct;
  ctCaracCT += ctct;
  ctTiras += ctira;
  
  s.dist = {
    se_carac_se: sese,
    se_carac_ct: sect,
    se_tiras: stira,
    ct_carac_ct: ctct,
    ct_tiras: ctira
  };
});

console.log(`Total SE: ${totalSE} (Target ~ 748)`);
console.log(`  - Carac SE: ${seCaracSE} (Target ~ 415)`);
console.log(`  - Carac CT: ${seCaracCT}`);
console.log(`  - Tiras Int: ${seTiras}`);

console.log(`Total CT: ${totalCT} (Target ~ 4500)`);
console.log(`  - Carac CT: ${ctCaracCT} (Target ~ 4311)`);
console.log(`  - Tiras Int: ${ctTiras}`);

