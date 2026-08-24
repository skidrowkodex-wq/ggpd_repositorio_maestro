export interface VenezuelanState {
  code: string;
  name: string;
  region: string;
}

export const VENEZUELAN_STATES: VenezuelanState[] = [
  { code: 'AM', name: 'Amazonas', region: 'SUR' },
  { code: 'AN', name: 'Anzoátegui', region: 'ORIENTE' },
  { code: 'AP', name: 'Apure', region: 'LLANOS' },
  { code: 'AR', name: 'Aragua', region: 'CENTRO' },
  { code: 'BA', name: 'Barinas', region: 'LLANOS' },
  { code: 'BO', name: 'Bolívar', region: 'SUR' },
  { code: 'CA', name: 'Carabobo', region: 'CENTRO' },
  { code: 'CO', name: 'Cojedes', region: 'LLANOS' },
  { code: 'DA', name: 'Delta Amacuro', region: 'ORIENTE' },
  { code: 'DC', name: 'Distrito Capital', region: 'CAPITAL' },
  { code: 'FA', name: 'Falcón', region: 'OCCIDENTE' },
  { code: 'GU', name: 'Guárico', region: 'LLANOS' },
  { code: 'LA', name: 'Lara', region: 'OCCIDENTE' },
  { code: 'ME', name: 'Mérida', region: 'ANDES' },
  { code: 'MI', name: 'Miranda', region: 'CAPITAL' },
  { code: 'MO', name: 'Monagas', region: 'ORIENTE' },
  { code: 'NE', name: 'Nueva Esparta', region: 'INSULAR' },
  { code: 'PO', name: 'Portuguesa', region: 'LLANOS' },
  { code: 'SU', name: 'Sucre', region: 'ORIENTE' },
  { code: 'TA', name: 'Táchira', region: 'ANDES' },
  { code: 'TR', name: 'Trujillo', region: 'ANDES' },
  { code: 'VA', name: 'Vargas (La Guaira)', region: 'CAPITAL' },
  { code: 'YA', name: 'Yaracuy', region: 'CENTRO' },
  { code: 'ZU', name: 'Zulia', region: 'OCCIDENTE' }
];

export const VOLTAGE_LEVELS_KV = [765, 400, 230, 115, 34.5, 13.8, 4.16];

export function getStateName(code: string): string {
  const found = VENEZUELAN_STATES.find(s => s.code === code.toUpperCase());
  return found ? found.name : code;
}

export function getStateRegion(code: string): string {
  const found = VENEZUELAN_STATES.find(s => s.code === code.toUpperCase());
  return found ? found.region : 'CENTRO';
}
