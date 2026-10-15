import { VehicleRecord, ValidationErrorItem, IngestionValidationResult } from '../types/fleet';
import { FLEET_COLUMNS } from '../data/schemaDefinition';
import { validateForeignKeyRelations } from './regionAdapter';

export const COMPONENT_FIELDS: (keyof VehicleRecord)[] = [
  'pastillas', 'bandas', 'bomba_freno', 'disco', 'plato', 'collarin',
  'bombin_superior', 'bombin_inferior', 'bateria', 'bobina', 'bujias',
  'cauchos', 'correas_motor', 'luces_delanteras', 'parabrisas',
  'tren_delantero', 'ballesta', 'crucetas', 'amortiguadores', 'radiador', 'motor'
];

export const OFFICIAL_BRANDS = [
  'TOYOTA',
  'FORD',
  'HINO',
  'IVECO',
  'CHEVROLET',
  'DONGFENG',
  'DAYUN',
  'INTERNACIONAL',
  'ISUZU',
  'HAOJUE',
  'NISSAN',
  'MITSUBISHI',
  'JEEP',
  'ENCAVA',
  'MAZDA',
  'SAIPA',
  'BAW',
  'REWARD',
  'RUSA',
  'OTRO'
] as const;

export function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr || dateStr.trim() === '') return true; // Empty is valid if optional
  const clean = dateStr.trim();
  // Format DD/MM/AAAA or YYYY-MM-DD
  const dmyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

  if (dmyRegex.test(clean)) {
    const [, day, month, year] = clean.match(dmyRegex)!;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2050;
  }

  if (isoRegex.test(clean)) {
    const [, year, month, day] = clean.match(isoRegex)!;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1990 && y <= 2050;
  }

  return false;
}

export function normalizeDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (isoRegex.test(clean)) {
    const [, y, m, d] = clean.match(isoRegex)!;
    return `${d}/${m}/${y}`;
  }
  return clean;
}

export function validateSingleVehicle(
  vehicle: Partial<VehicleRecord>,
  existingVehicles: VehicleRecord[] = [],
  isUpdate: boolean = false
): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];

  // 1. Número de Vehículo (Col B)
  if (!vehicle.numero_vehiculo || vehicle.numero_vehiculo.trim() === '') {
    errors.push({
      columna_excel: 'B',
      campo: 'numero_vehiculo',
      mensaje: 'El Número de Vehículo es obligatorio (Primary Key).',
      tipo: 'error',
      valor_actual: vehicle.numero_vehiculo
    });
  } else {
    const cleanNum = vehicle.numero_vehiculo.trim().toUpperCase();
    const duplicate = existingVehicles.find(v => 
      v.numero_vehiculo.trim().toUpperCase() === cleanNum && (!isUpdate || v.id !== vehicle.id)
    );
    if (duplicate) {
      errors.push({
        columna_excel: 'B',
        campo: 'numero_vehiculo',
        mensaje: `Número de vehículo duplicado: Ya existe registrado el código '${cleanNum}'.`,
        tipo: 'error',
        valor_actual: vehicle.numero_vehiculo
      });
    }
  }

  // 1b. Placa del Vehículo (Identificador Único)
  if (vehicle.placa && vehicle.placa.trim() !== '') {
    const cleanPlaca = vehicle.placa.trim().toUpperCase();
    const duplicatePlaca = existingVehicles.find(v => 
      v.placa && v.placa.trim().toUpperCase() === cleanPlaca && (!isUpdate || v.id !== vehicle.id)
    );
    if (duplicatePlaca) {
      errors.push({
        columna_excel: 'C',
        campo: 'placa',
        mensaje: `Placa duplicada: La placa '${cleanPlaca}' ya está asignada a otro vehículo registrado y no puede repetirse.`,
        tipo: 'error',
        valor_actual: vehicle.placa
      });
    }
  }

  // 2. Estado General (Col A)
  const validEstados = ['ACTIVO', 'INACTIVO', 'EN MANTENIMIENTO', 'FUERA DE SERVICIO', 'RECUPERADO'];
  if (!vehicle.estado || !validEstados.includes(vehicle.estado.toUpperCase())) {
    errors.push({
      columna_excel: 'A',
      campo: 'estado',
      mensaje: `Estado inválido. Debe ser uno de: ${validEstados.join(', ')}.`,
      tipo: 'error',
      valor_actual: vehicle.estado
    });
  }

  // 3. Marca (Col C) - Catálogo oficial o nueva marca declarada (en mayúsculas)
  if (!vehicle.marca_vehiculo || vehicle.marca_vehiculo.trim() === '') {
    errors.push({
      columna_excel: 'C',
      campo: 'marca_vehiculo',
      mensaje: 'La Marca del Vehículo es obligatoria.',
      tipo: 'error',
      valor_actual: vehicle.marca_vehiculo
    });
  } else {
    const brandClean = vehicle.marca_vehiculo.trim().toUpperCase();
    if (brandClean === 'OTRO') {
      errors.push({
        columna_excel: 'C',
        campo: 'marca_vehiculo',
        mensaje: 'Ha seleccionado "OTRO": debe especificar el nombre de la nueva marca en el campo correspondiente.',
        tipo: 'error',
        valor_actual: vehicle.marca_vehiculo
      });
    }
  }

  // 4. Tipo de Vehículo (Col D)
  if (!vehicle.tipo_vehiculo || vehicle.tipo_vehiculo.trim() === '') {
    errors.push({
      columna_excel: 'D',
      campo: 'tipo_vehiculo',
      mensaje: 'El Tipo de Vehículo es obligatorio.',
      tipo: 'error',
      valor_actual: vehicle.tipo_vehiculo
    });
  }

  // 5. Condición Actual (Col G)
  const validCondiciones = ['BUENO', 'REGULAR', 'MALO', 'FUERA DE SERVICIO'];
  if (!vehicle.condicion_actual || !validCondiciones.includes(vehicle.condicion_actual.toUpperCase())) {
    errors.push({
      columna_excel: 'G',
      campo: 'condicion_actual',
      mensaje: `Condición Actual requerida (${validCondiciones.join(', ')}).`,
      tipo: 'error',
      valor_actual: vehicle.condicion_actual
    });
  }

  // 6. 21 Componentes Mecánicos (I - AC)
  const validComponentStatus = ['BUENO', 'REGULAR', 'MALO', 'N/A'];
  for (const compField of COMPONENT_FIELDS) {
    const val = vehicle[compField] as string | undefined;
    if (val && !validComponentStatus.includes(val.toUpperCase())) {
      const colDef = FLEET_COLUMNS.find(c => c.campo === compField);
      errors.push({
        columna_excel: colDef?.columna_excel || '?',
        campo: compField,
        mensaje: `Valor no permitido en ${colDef?.titulo || compField}. Solo admite: BUENO, REGULAR, MALO, N/A.`,
        tipo: 'error',
        valor_actual: val
      });
    }
  }

  // 7. Cantidades Enteras >= 0 (AD, AE, AG)
  if (vehicle.cant_total_reparaciones !== undefined && (isNaN(Number(vehicle.cant_total_reparaciones)) || Number(vehicle.cant_total_reparaciones) < 0)) {
    errors.push({
      columna_excel: 'AD',
      campo: 'cant_total_reparaciones',
      mensaje: 'Cant. Total de reparaciones debe ser un número entero >= 0.',
      tipo: 'error',
      valor_actual: vehicle.cant_total_reparaciones
    });
  }

  if (vehicle.cant_cauchos !== undefined && (isNaN(Number(vehicle.cant_cauchos)) || Number(vehicle.cant_cauchos) < 0)) {
    errors.push({
      columna_excel: 'AE',
      campo: 'cant_cauchos',
      mensaje: 'Cant. de cauchos debe ser un número entero >= 0.',
      tipo: 'error',
      valor_actual: vehicle.cant_cauchos
    });
  }

  if (vehicle.cantidad_baterias !== undefined && (isNaN(Number(vehicle.cantidad_baterias)) || Number(vehicle.cantidad_baterias) < 0)) {
    errors.push({
      columna_excel: 'AG',
      campo: 'cantidad_baterias',
      mensaje: 'Cantidad de Baterias debe ser un número entero >= 0.',
      tipo: 'error',
      valor_actual: vehicle.cantidad_baterias
    });
  }

  // 8. Booleano SI / NO (Cols AI, AL)
  const validSiNo = ['SI', 'NO'];
  if (vehicle.vehiculo_recuperado && !validSiNo.includes(vehicle.vehiculo_recuperado.toUpperCase())) {
    errors.push({
      columna_excel: 'AI',
      campo: 'vehiculo_recuperado',
      mensaje: "Campo Vehículo Recuperado debe ser 'SI' o 'NO'.",
      tipo: 'error',
      valor_actual: vehicle.vehiculo_recuperado
    });
  }

  if (vehicle.vehiculo_otra_gerencia_devuelto && !validSiNo.includes(vehicle.vehiculo_otra_gerencia_devuelto.toUpperCase())) {
    errors.push({
      columna_excel: 'AL',
      campo: 'vehiculo_otra_gerencia_devuelto',
      mensaje: "Campo Vehículo Devuelto debe ser 'SI' o 'NO'.",
      tipo: 'error',
      valor_actual: vehicle.vehiculo_otra_gerencia_devuelto
    });
  }

  // 9. Validaciones de Fecha (Cols AJ, AM)
  if (vehicle.fecha_recuperacion && !isValidDateFormat(vehicle.fecha_recuperacion)) {
    errors.push({
      columna_excel: 'AJ',
      campo: 'fecha_recuperacion',
      mensaje: 'Fecha de Recuperación inválida. Formato esperado: DD/MM/AAAA.',
      tipo: 'error',
      valor_actual: vehicle.fecha_recuperacion
    });
  }

  if (vehicle.fecha_entrega_gerencia_origen && !isValidDateFormat(vehicle.fecha_entrega_gerencia_origen)) {
    errors.push({
      columna_excel: 'AM',
      campo: 'fecha_entrega_gerencia_origen',
      mensaje: 'Fecha de Entrega a Gerencia de Origen inválida. Formato esperado: DD/MM/AAAA.',
      tipo: 'error',
      valor_actual: vehicle.fecha_entrega_gerencia_origen
    });
  }

  // 10. Reglas de coherencia contextual (Advertencias útiles)
  if (vehicle.vehiculo_recuperado === 'SI' && (!vehicle.fecha_recuperacion || vehicle.fecha_recuperacion.trim() === '')) {
    errors.push({
      columna_excel: 'AJ',
      campo: 'fecha_recuperacion',
      mensaje: "El vehículo está marcado como RECUPERADO (SI) pero no tiene fecha de recuperación registrada.",
      tipo: 'advertencia',
      valor_actual: ''
    });
  }

  if (vehicle.vehiculo_otra_gerencia_devuelto === 'SI' && (!vehicle.fecha_entrega_gerencia_origen || vehicle.fecha_entrega_gerencia_origen.trim() === '')) {
    errors.push({
      columna_excel: 'AM',
      campo: 'fecha_entrega_gerencia_origen',
      mensaje: "Está marcado como DEVUELTO (SI) pero no registra fecha formal de entrega a la gerencia de origen.",
      tipo: 'advertencia',
      valor_actual: ''
    });
  }

  // Cálculo de discrepancia de reparaciones sugeridas
  let badOrRegularComponents = 0;
  for (const compField of COMPONENT_FIELDS) {
    const val = (vehicle[compField] as string || '').toUpperCase();
    if (val === 'MALO' || val === 'REGULAR') {
      badOrRegularComponents++;
    }
  }

  if (vehicle.cant_total_reparaciones !== undefined && vehicle.cant_total_reparaciones !== badOrRegularComponents && badOrRegularComponents > 0) {
    errors.push({
      columna_excel: 'AD',
      campo: 'cant_total_reparaciones',
      mensaje: `Sugerencia de cálculo: El registro indica ${vehicle.cant_total_reparaciones} reparaciones, pero hay ${badOrRegularComponents} componentes en estado MALO o REGULAR.`,
      tipo: 'advertencia',
      valor_actual: vehicle.cant_total_reparaciones
    });
  }

  // 11. Integridad Referencial de Llaves Foráneas (Región -> Estado -> Centro de Servicios)
  if (vehicle.region || vehicle.estado_venezuela || vehicle.centro_servicios) {
    const fkRes = validateForeignKeyRelations(vehicle.region, vehicle.estado_venezuela, vehicle.centro_servicios);
    if (!fkRes.valid) {
      fkRes.errors.forEach(err => {
        const isCs = err.includes('Centro de Servicios');
        errors.push({
          columna_excel: isCs ? 'F' : 'AO',
          campo: isCs ? 'centro_servicios' : 'estado_venezuela',
          mensaje: err,
          tipo: 'error',
          valor_actual: isCs ? vehicle.centro_servicios : vehicle.estado_venezuela
        });
      });
    }
  }

  return errors;
}

export function validateBatchRecords(
  rows: Partial<VehicleRecord>[],
  existingVehicles: VehicleRecord[] = []
): IngestionValidationResult {
  const allErrors: ValidationErrorItem[] = [];
  const seenVehicleNumbers = new Set<string>();
  let validCount = 0;
  let invalidCount = 0;

  rows.forEach((row, idx) => {
    const filaNumber = idx + 2; // Row 1 is header in Excel
    const rowErrors = validateSingleVehicle(row, existingVehicles);

    // Check duplicate within the uploaded batch itself
    const vehNum = (row.numero_vehiculo || '').trim().toUpperCase();
    if (vehNum) {
      if (seenVehicleNumbers.has(vehNum)) {
        rowErrors.push({
          fila: filaNumber,
          vehiculo: vehNum,
          columna_excel: 'B',
          campo: 'numero_vehiculo',
          mensaje: `Número de vehículo duplicado dentro del mismo lote de carga (Fila ${filaNumber}).`,
          tipo: 'error',
          valor_actual: vehNum
        });
      } else {
        seenVehicleNumbers.add(vehNum);
      }
    }

    const hardErrors = rowErrors.filter(e => e.tipo === 'error');
    if (hardErrors.length > 0) {
      invalidCount++;
    } else {
      validCount++;
    }

    rowErrors.forEach(err => {
      allErrors.push({
        ...err,
        fila: filaNumber,
        vehiculo: row.numero_vehiculo || `Fila ${filaNumber}`
      });
    });
  });

  return {
    total_filas: rows.length,
    filas_validas: validCount,
    filas_con_errores: invalidCount,
    errores: allErrors,
    registros_procesados: rows
  };
}
