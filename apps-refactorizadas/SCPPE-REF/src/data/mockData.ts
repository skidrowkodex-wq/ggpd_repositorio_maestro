import { PartidaAPU } from '../types';

export const METRICAS_GENERALES = {
  total_proyectos_prtsen: 823,
  proyectos_clasificados: 269,
  proyectos_sin_match: 553,
  total_subestaciones: 765,
  subestaciones_se_distribucion: 417,
  subestaciones_ct: 348,
  total_circuitos: 1781,
  circuitos_codificados_rds: 1781,
  cobertura_rds_pct: 100,
  ejecucion_presupuestaria_poa_pct: 0.0,
  eficacia_metas_fisicas_pct: 0.0,
  esquemas_supabase: 8,
  tablas_activas: 71,
  politicas_rls: 73,
};

export const TASA_BCV_OFICIAL = 68.50; // Bs. / USD de referencia oficial

export const TABULADOR_VIATICOS_CORPOELEC_2026 = {
  tarifa_diaria_pernocta_usd: 45.0, // Hospedaje e imprevistos
  tarifa_diaria_alimentacion_usd: 25.0, // Desayuno, almuerzo y cena
  tarifa_movilizacion_base_usd: 30.0, // Transporte interurbano / peajes
  tasa_bcv: TASA_BCV_OFICIAL,
};

export const CATALOGO_PARTIDAS_APU_SEN: PartidaAPU[] = [
  {
    codigo: 'PART-ELEC-01',
    partida_onapre: '404.01.01.00',
    descripcion: 'Suministro, montaje y pruebas de Transformador de Potencia 115/13.8 kV trifásico con cambiador de tomas bajo carga (LTC)',
    unidad: 'TRAFO',
    costo_unitario_usd: 380000.0,
    desglose: { materiales_pct: 82, equipos_pct: 10, mano_obra_pct: 8 },
    rendimiento_diario: '1 unidad / 15 días',
  },
  {
    codigo: 'PART-ELEC-02',
    partida_onapre: '402.04.01.00',
    descripcion: 'Tendido, flechado y tensado de conductor de aluminio Arvidal 336.4 MCM en línea aérea de Media Tensión (incluye aisladores y herrajes)',
    unidad: 'KM-FASE',
    costo_unitario_usd: 6200.0,
    desglose: { materiales_pct: 65, equipos_pct: 15, mano_obra_pct: 20 },
    rendimiento_diario: '1.2 km-fase / día',
  },
  {
    codigo: 'PART-ELEC-03',
    partida_onapre: '404.01.02.00',
    descripcion: 'Excavación, hincado y plomado de poste tubular de hierro / concreto de 12 metros para líneas de distribución urbana/rural',
    unidad: 'POSTE',
    costo_unitario_usd: 850.0,
    desglose: { materiales_pct: 55, equipos_pct: 25, mano_obra_pct: 20 },
    rendimiento_diario: '4 postes / día',
  },
  {
    codigo: 'PART-ELEC-04',
    partida_onapre: '404.02.01.00',
    descripcion: 'Instalación y conexionado de Reconectador Automático (Recloser) trifásico 13.8 kV en poste con control microprocesado y telemetría',
    unidad: 'EQUIPO',
    costo_unitario_usd: 18500.0,
    desglose: { materiales_pct: 85, equipos_pct: 5, mano_obra_pct: 10 },
    rendimiento_diario: '1 equipo / día',
  },
  {
    codigo: 'PART-ELEC-05',
    partida_onapre: '402.04.03.00',
    descripcion: 'Construcción de Malla de Puesta a Tierra para Subestación con cable Cu desnudo 4/0 AWG, varillas Copperweld 5/8x2.4m y soldaduras exotérmicas',
    unidad: 'PUNTO',
    costo_unitario_usd: 350.0,
    desglose: { materiales_pct: 60, equipos_pct: 10, mano_obra_pct: 30 },
    rendimiento_diario: '6 puntos / día',
  },
  {
    codigo: 'PART-ELEC-06',
    partida_onapre: '403.03.01.00',
    descripcion: 'Desmalezamiento, pica y poda técnica de vegetación en corredores de servidumbre de líneas aéreas de distribución (ancho 8m)',
    unidad: 'KM',
    costo_unitario_usd: 1200.0,
    desglose: { materiales_pct: 10, equipos_pct: 30, mano_obra_pct: 60 },
    rendimiento_diario: '1.5 km / día',
  },
];