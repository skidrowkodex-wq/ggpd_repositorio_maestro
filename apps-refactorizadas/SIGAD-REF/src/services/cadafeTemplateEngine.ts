// ==============================================================================
// ⚡ CORPOELEC - SIGAD: Motor Estructural de Bahías CADAFE NS-P-105 (CERO MOCK)
// ==============================================================================
// Genera o regenera el esqueleto topológico de patio según la tensión real,
// los circuitos de la subestación y las especificaciones técnicas del usuario.
// ==============================================================================

import { SubestacionMaster, CircuitoMaster, BahiaPatio, ComponentePatio, SubestacionEstructura } from '../types/sigad';

export interface OpcionesEstructuraCadafe {
  numTransformadores?: number;
  tensionPrimariaKv?: number;
  tensionSecundariaKv?: number;
  capacidadMvaPorTrafo?: number;
  numCircuitosSalida?: number;
  circuitosSeleccionados?: CircuitoMaster[];
  nombresCircuitosPersonalizados?: string[];
  esquemaBarras?: 'SIMPLE_BARRA' | 'TRANSFERENCIA' | 'DOBLE_BARRA';
  incluirSsaa?: boolean;
  incluirInfra?: boolean;
  preservarExistentes?: boolean;
  componentesPrevios?: ComponentePatio[];
}

export function generarEstructuraCadafe(
  subestacion: SubestacionMaster, 
  circuitos: CircuitoMaster[],
  opciones: OpcionesEstructuraCadafe = {}
): SubestacionEstructura {
  const seCode = subestacion.codigo;
  const kvIn = opciones.tensionPrimariaKv || subestacion.tension_entrada_kv || subestacion.tension_alimentador_kv || 115;
  const kvOut = opciones.tensionSecundariaKv || subestacion.tension_secundaria_kv || (circuitos.length > 0 ? circuitos[0].nivel_tension_kv : 13.8);
  
  // Cantidad de transformadores
  const numTrafos = opciones.numTransformadores || (subestacion.es_movil ? 1 : circuitos.length > 6 ? 2 : 1);

  // Esquema de barras
  const esquemaBarras = opciones.esquemaBarras || 'SIMPLE_BARRA';
  const incluirSsaa = opciones.incluirSsaa !== false;
  const incluirInfra = opciones.incluirInfra !== false;

  // Mapa de componentes previos si se solicita preservar datos de placa
  const prevMap = new Map<string, ComponentePatio>();
  if (opciones.preservarExistentes && opciones.componentesPrevios) {
    opciones.componentesPrevios.forEach(c => {
      prevMap.set(c.codigo_norma, c);
      prevMap.set(c.id, c);
    });
  }

  // Función auxiliar para construir componente preservando datos de placa si existían
  const buildComp = (compBase: ComponentePatio): ComponentePatio => {
    const prev = prevMap.get(compBase.codigo_norma) || prevMap.get(compBase.id);
    if (!prev) return compBase;

    return {
      ...compBase,
      nombre_equipo: prev.nombre_equipo || compBase.nombre_equipo,
      estado_operativo: prev.estado_operativo || compBase.estado_operativo,
      fabricante: prev.fabricante || compBase.fabricante,
      serial: prev.serial || compBase.serial,
      modelo: prev.modelo || compBase.modelo,
      capacidad_mva: prev.capacidad_mva || compBase.capacidad_mva,
      anio_instalacion: prev.anio_instalacion || compBase.anio_instalacion,
      nivel_aceite: prev.nivel_aceite || compBase.nivel_aceite,
      tecnologia_corte: prev.tecnologia_corte || compBase.tecnologia_corte,
      presion_sf6_bar: prev.presion_sf6_bar || compBase.presion_sf6_bar,
      alarma_activa: prev.alarma_activa ?? compBase.alarma_activa,
      observaciones: prev.observaciones || compBase.observaciones,
      historial_eventos: prev.historial_eventos || compBase.historial_eventos,
    };
  };

  const bahias: BahiaPatio[] = [];
  let bahiaOrden = 1;

  // --------------------------------------------------------------------------
  // 1. BAHÍAS DE TRANSFORMACIÓN DE ALTA TENSIÓN (TR-1, TR-2, ...)
  // --------------------------------------------------------------------------
  for (let i = 1; i <= numTrafos; i++) {
    const trafoCode = `TR-${i}`;
    const bahiaId = `bahia-${seCode}-tr${i}`;
    const compList: ComponentePatio[] = [
      buildComp({
        id: `comp-${seCode}-${trafoCode}`,
        bahia_id: bahiaId,
        se_codigo: seCode,
        codigo_norma: trafoCode,
        nombre_equipo: `Transformador de Potencia ${trafoCode}`,
        tipo_elemento: 'TRANSFORMADOR_POTENCIA',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvIn,
        capacidad_mva: opciones.capacidadMvaPorTrafo || subestacion.capacidad_mva_instalada || undefined,
        fabricante: '',
        serial: '',
        modelo: '',
        anio_instalacion: undefined,
        nivel_aceite: 'NORMAL',
        observaciones: subestacion.es_movil ? 'Transformador en unidad móvil de contingencia' : '',
      }),
      buildComp({
        id: `comp-${seCode}-D${i}`,
        bahia_id: bahiaId,
        se_codigo: seCode,
        codigo_norma: `D${i}`,
        nombre_equipo: `Interruptor de Potencia D${i}`,
        tipo_elemento: 'DISYUNTOR_POTENCIA',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvIn,
        fabricante: '',
        serial: '',
        tecnologia_corte: 'SF6',
        presion_sf6_bar: undefined,
        observaciones: '',
      }),
      buildComp({
        id: `comp-${seCode}-S${i}`,
        bahia_id: bahiaId,
        se_codigo: seCode,
        codigo_norma: `S${i}`,
        nombre_equipo: `Seccionador de Entrada S${i}`,
        tipo_elemento: 'SECCIONADOR',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvIn,
        fabricante: '',
        serial: '',
        observaciones: '',
      }),
      buildComp({
        id: `comp-${seCode}-TC${i}`,
        bahia_id: bahiaId,
        se_codigo: seCode,
        codigo_norma: `TC-${i}`,
        nombre_equipo: `Juego de Transformadores de Corriente TC-${i}`,
        tipo_elemento: 'TRANSFORMADOR_CORRIENTE_TC',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvIn,
        observaciones: 'Medición y protección diferencial',
      }),
      buildComp({
        id: `comp-${seCode}-PA${i}`,
        bahia_id: bahiaId,
        se_codigo: seCode,
        codigo_norma: `PA-${i}`,
        nombre_equipo: `Pararrayos de Entrada PA-${i}`,
        tipo_elemento: 'PARARRAYOS',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvIn,
        observaciones: 'Protección contra sobretensiones atmosféricas',
      })
    ];

    const tensionStr = `${kvIn}/${kvOut} kV`;

    bahias.push({
      id: bahiaId,
      se_codigo: seCode,
      nombre_bahia: `Bahía de Transformación AT ${i} (${trafoCode} · ${tensionStr})`,
      tipo_bahia: 'TRANSFORMACION_AT',
      tension_kv: kvIn,
      orden: bahiaOrden++,
      componentes: compList,
    });
  }

  // --------------------------------------------------------------------------
  // 2. JUEGO DE BARRAS DE MEDIA TENSIÓN
  // --------------------------------------------------------------------------
  const barraId = `bahia-${seCode}-barras`;
  const barraComp: ComponentePatio[] = [
    buildComp({
      id: `comp-${seCode}-B1`,
      bahia_id: barraId,
      se_codigo: seCode,
      codigo_norma: 'B1',
      nombre_equipo: `Juego de Barras Colectoras MT (Sección 1)`,
      tipo_elemento: 'JUEGO_BARRAS',
      estado_operativo: 'EN_SERVICIO',
      tension_kv: kvOut,
      observaciones: 'Barra colectora principal',
    })
  ];

  if (esquemaBarras === 'TRANSFERENCIA') {
    barraComp.push(
      buildComp({
        id: `comp-${seCode}-B-TRANSF`,
        bahia_id: barraId,
        se_codigo: seCode,
        codigo_norma: 'B-TRANSF',
        nombre_equipo: `Barra de Transferencia MT`,
        tipo_elemento: 'JUEGO_BARRAS',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvOut,
        observaciones: 'Barra auxiliar de transferencia',
      }),
      buildComp({
        id: `comp-${seCode}-D-TRANSF`,
        bahia_id: barraId,
        se_codigo: seCode,
        codigo_norma: 'D-TRANSF',
        nombre_equipo: `Interruptor de Transferencia MT`,
        tipo_elemento: 'DISYUNTOR_POTENCIA',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvOut,
        observaciones: 'Disyuntor de acople para reemplazo en caliente',
      })
    );
  } else if (esquemaBarras === 'DOBLE_BARRA' || numTrafos > 1) {
    barraComp.push(
      buildComp({
        id: `comp-${seCode}-B2`,
        bahia_id: barraId,
        se_codigo: seCode,
        codigo_norma: 'B2',
        nombre_equipo: `Juego de Barras Colectoras MT (Sección 2)`,
        tipo_elemento: 'JUEGO_BARRAS',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvOut,
        observaciones: 'Segunda sección de barra colectora',
      }),
      buildComp({
        id: `comp-${seCode}-D-ACOP`,
        bahia_id: barraId,
        se_codigo: seCode,
        codigo_norma: 'D-ACOP',
        nombre_equipo: `Interruptor de Acoplamiento de Barras`,
        tipo_elemento: 'DISYUNTOR_POTENCIA',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: kvOut,
        observaciones: 'Enlace de acople entre barras B1 y B2',
      })
    );
  }

  bahias.push({
    id: barraId,
    se_codigo: seCode,
    nombre_bahia: `Juego de Barras de Distribución MT (${kvOut} kV)`,
    tipo_bahia: 'BARRAS_MT',
    tension_kv: kvOut,
    orden: bahiaOrden++,
    componentes: barraComp,
  });

  // --------------------------------------------------------------------------
  // 3. BAHÍAS DE SALIDA DE CIRCUITOS (ALIMENTADORES MT CONFIRMADOS)
  // --------------------------------------------------------------------------
  const listaBase = (opciones.circuitosSeleccionados && opciones.circuitosSeleccionados.length > 0)
    ? opciones.circuitosSeleccionados
    : circuitos;

  const circuitosAListar: Array<{ codigo: string; nombre: string; tension: number }> = [];

  if (listaBase.length > 0) {
    listaBase.forEach(ct => {
      const raw = ct.nombre_circuito || ct.circuito || ct.nombre_ct_norm || ct.codigo;
      const clean = raw.toString().replace(/\*+/g, '').trim();
      circuitosAListar.push({
        codigo: ct.codigo,
        nombre: clean,
        tension: ct.nivel_tension_kv || kvOut,
      });
    });
  }

  // Si la S/E no tenía circuitos o se especificaron salidas adicionales requeridas
  const numReqCirc = opciones.numCircuitosSalida || (circuitosAListar.length === 0 ? 4 : circuitosAListar.length);
  if (circuitosAListar.length < numReqCirc) {
    const faltantes = numReqCirc - circuitosAListar.length;
    for (let f = 1; f <= faltantes; f++) {
      const idx = circuitosAListar.length + 1;
      const nombreManual = opciones.nombresCircuitosPersonalizados?.[f - 1] || `SALIDA MT ${idx} (${subestacion.nombre_se})`;
      const codManual = `CT-${seCode.replace('SE-', '')}-${String(idx).padStart(2, '0')}`;
      circuitosAListar.push({
        codigo: codManual,
        nombre: nombreManual,
        tension: kvOut,
      });
    }
  }

  // Generar cada bahía de circuito de salida
  circuitosAListar.forEach((cto, idx) => {
    const ctoId = `bahia-${seCode}-cto-${idx + 1}`;
    const seq = idx + 1;
    const ctoComponents: ComponentePatio[] = [
      buildComp({
        id: `comp-${seCode}-REC-${seq}`,
        bahia_id: ctoId,
        se_codigo: seCode,
        circuito_codigo: cto.codigo,
        codigo_norma: `REC-${seq}`,
        nombre_equipo: `Interruptor / Reconectador de Cabecera (${cto.nombre})`,
        tipo_elemento: 'RECONECTADOR',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: cto.tension,
        fabricante: '',
        serial: '',
        observaciones: `Alimentador: ${cto.codigo}`,
      }),
      buildComp({
        id: `comp-${seCode}-S-CTO-${seq}`,
        bahia_id: ctoId,
        se_codigo: seCode,
        circuito_codigo: cto.codigo,
        codigo_norma: `S-CTO-${seq}`,
        nombre_equipo: `Seccionador de Salida (${cto.nombre})`,
        tipo_elemento: 'SECCIONADOR',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: cto.tension,
        observaciones: 'Seccionamiento de línea de salida',
      }),
      buildComp({
        id: `comp-${seCode}-TC-CTO-${seq}`,
        bahia_id: ctoId,
        se_codigo: seCode,
        circuito_codigo: cto.codigo,
        codigo_norma: `TC-CTO-${seq}`,
        nombre_equipo: `Transformadores de Corriente TC (${cto.nombre})`,
        tipo_elemento: 'TRANSFORMADOR_CORRIENTE_TC',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: cto.tension,
        observaciones: 'Medición de corriente y relé de sobrecorriente 50/51',
      }),
      buildComp({
        id: `comp-${seCode}-PA-CTO-${seq}`,
        bahia_id: ctoId,
        se_codigo: seCode,
        circuito_codigo: cto.codigo,
        codigo_norma: `PA-CTO-${seq}`,
        nombre_equipo: `Pararrayos de Salida MT (${cto.nombre})`,
        tipo_elemento: 'PARARRAYOS',
        estado_operativo: 'EN_SERVICIO',
        tension_kv: cto.tension,
        observaciones: 'Protección en pórtico de salida',
      })
    ];

    bahias.push({
      id: ctoId,
      se_codigo: seCode,
      nombre_bahia: `Bahía de Circuito: ${cto.nombre} (${cto.codigo})`,
      tipo_bahia: 'CIRCUITO_SALIDA',
      tension_kv: cto.tension,
      orden: bahiaOrden++,
      componentes: ctoComponents,
    });
  });

  // --------------------------------------------------------------------------
  // 4. BAHÍA DE SERVICIOS AUXILIARES (SSAA - DC / AC)
  // --------------------------------------------------------------------------
  if (incluirSsaa) {
    const ssaaId = `bahia-${seCode}-ssaa`;
    bahias.push({
      id: ssaaId,
      se_codigo: seCode,
      nombre_bahia: 'Servicios Auxiliares (SSAA - Sistemas Vitales DC / AC)',
      tipo_bahia: 'SERVICIOS_AUXILIARES',
      tension_kv: 0.125,
      orden: bahiaOrden++,
      componentes: [
        buildComp({
          id: `comp-${seCode}-BAT-1`,
          bahia_id: ssaaId,
          se_codigo: seCode,
          codigo_norma: 'BAT-1',
          nombre_equipo: 'Banco de Baterías de Control (125 Vdc)',
          tipo_elemento: 'BANCO_BATERIAS_DC',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: 0.125,
          fabricante: '',
          serial: '',
          observaciones: 'Alimentación de protecciones y mandos de disparo',
        }),
        buildComp({
          id: `comp-${seCode}-RECT-1`,
          bahia_id: ssaaId,
          se_codigo: seCode,
          codigo_norma: 'RECT-1',
          nombre_equipo: 'Rectificador / Cargador de Baterías',
          tipo_elemento: 'RECTIFICADOR_CARGADOR',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: 0.125,
          fabricante: '',
          serial: '',
          observaciones: 'Carga flotante de banco de baterías',
        }),
        buildComp({
          id: `comp-${seCode}-TR-SSAA`,
          bahia_id: ssaaId,
          se_codigo: seCode,
          codigo_norma: 'TR-SSAA',
          nombre_equipo: 'Transformador de Servicios Auxiliares (MT/BT)',
          tipo_elemento: 'TRANSFORMADOR_SSAA',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: kvOut,
          fabricante: '',
          serial: '',
          observaciones: 'Alimentación en baja tensión 208/120V',
        }),
        buildComp({
          id: `comp-${seCode}-GE-1`,
          bahia_id: ssaaId,
          se_codigo: seCode,
          codigo_norma: 'GE-1',
          nombre_equipo: 'Planta Eléctrica de Emergencia (Grupo Diésel)',
          tipo_elemento: 'PLANTA_EMERGENCIA',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: 0.208,
          fabricante: '',
          serial: '',
          observaciones: 'Respaldo autónomo de CA',
        })
      ]
    });
  }

  // --------------------------------------------------------------------------
  // 5. INFRAESTRUCTURA CIVIL Y SEGURIDAD DE PATIO
  // --------------------------------------------------------------------------
  if (incluirInfra) {
    const civilId = `bahia-${seCode}-civil`;
    bahias.push({
      id: civilId,
      se_codigo: seCode,
      nombre_bahia: 'Infraestructura Civil y Seguridad de Patio',
      tipo_bahia: 'INFRAESTRUCTURA_CIVIL',
      tension_kv: 0,
      orden: bahiaOrden++,
      componentes: [
        buildComp({
          id: `comp-${seCode}-MALLA`,
          bahia_id: civilId,
          se_codigo: seCode,
          codigo_norma: 'MAT-TIERRA',
          nombre_equipo: 'Malla de Puesta a Tierra (IEEE 80)',
          tipo_elemento: 'MALLA_PUESTA_TIERRA',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: 0,
          observaciones: 'Malla equipotencial de cobre en patio',
        }),
        buildComp({
          id: `comp-${seCode}-GRAVA`,
          bahia_id: civilId,
          se_codigo: seCode,
          codigo_norma: 'GRAVA-PATIO',
          nombre_equipo: 'Manto de Grava / Piedra Picada',
          tipo_elemento: 'GRAVA_PIEDRA_PICADA',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: 0,
          observaciones: 'Aislación superficial para tensiones de paso y contacto',
        }),
        buildComp({
          id: `comp-${seCode}-CERCA`,
          bahia_id: civilId,
          se_codigo: seCode,
          codigo_norma: 'CERCA-PERIMETRAL',
          nombre_equipo: 'Cercado Perimetral y Alumbrado de Seguridad',
          tipo_elemento: 'CERCADO_PERIMETRAL',
          estado_operativo: 'EN_SERVICIO',
          tension_kv: 0,
          observaciones: 'Delimitación física y alumbrado perimetral',
        })
      ]
    });
  }

  return {
    se_codigo: seCode,
    ultima_actualizacion: new Date().toISOString(),
    bahias,
  };
}
