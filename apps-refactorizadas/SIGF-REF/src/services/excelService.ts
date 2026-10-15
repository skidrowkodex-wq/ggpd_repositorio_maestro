import * as XLSX from 'xlsx';
import { VehicleRecord } from '../types/fleet';
import { FLEET_COLUMNS } from '../data/schemaDefinition';
import { adaptVehicleLocation } from './regionAdapter';

export function exportFleetToExcel(vehicles: VehicleRecord[], filename: string = 'FLOTA_CORPOELEC.xlsx') {
  // Create row arrays starting with the exact 45 headers in order
  const headers = FLEET_COLUMNS.map(col => col.titulo);

  const dataRows = vehicles.map(v => {
    return FLEET_COLUMNS.map(col => {
      const val = v[col.campo];
      if (val === undefined || val === null) return '';
      return val;
    });
  });

  const wsData = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for readability
  ws['!cols'] = FLEET_COLUMNS.map(col => {
    const minW = Math.max(col.titulo.length + 2, 12);
    return { wch: Math.min(minW, 35) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'FLOTA');

  XLSX.writeFile(wb, filename);
}

export function downloadEmptyTemplate(filename: string = 'PLANTILLA_FLOTA_OFICIAL.xlsx') {
  const headers = FLEET_COLUMNS.map(col => col.titulo);

  // Sample exemplary row
  const sampleRow = FLEET_COLUMNS.map(col => {
    if (col.ejemplo) return col.ejemplo;
    if (col.valores_sugeridos && col.valores_sugeridos.length > 0) return col.valores_sugeridos[0];
    if (col.tipo_dato === 'entero') return 0;
    if (col.tipo_dato === 'si_no') return 'NO';
    if (col.tipo_dato === 'estado_componente') return 'BUENO';
    if (col.tipo_dato === 'fecha') return '01/01/2026';
    return '';
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  ws['!cols'] = FLEET_COLUMNS.map(col => ({ wch: Math.max(col.titulo.length + 2, 14) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'FLOTA');
  XLSX.writeFile(wb, filename);
}

export async function parseExcelOrCsvFile(file: File): Promise<Partial<VehicleRecord>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        // Pick sheet 'FLOTA' or first sheet
        const sheetName = workbook.SheetNames.includes('FLOTA') ? 'FLOTA' : workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of arrays
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rawRows.length < 2) {
          resolve([]);
          return;
        }

        const headerRow: string[] = rawRows[0].map((h: any) => String(h || '').trim());
        
        // Map header position or header title to field
        const colMapping: { [colIndex: number]: keyof VehicleRecord } = {};

        headerRow.forEach((title, idx) => {
          const cleanTitle = title.toLowerCase().replace(/\s+/g, ' ').trim();
          
          // Match by title
          const foundByTitle = FLEET_COLUMNS.find(c => 
            c.titulo.toLowerCase().replace(/\s+/g, ' ').trim() === cleanTitle
          );

          if (foundByTitle) {
            colMapping[idx] = foundByTitle.campo;
          } else if (idx < FLEET_COLUMNS.length) {
            // Fallback by strict column position order (0 -> Col A, 1 -> Col B...)
            colMapping[idx] = FLEET_COLUMNS[idx].campo;
          }
        });

        const records: Partial<VehicleRecord>[] = [];

        for (let r = 1; r < rawRows.length; r++) {
          const rowData = rawRows[r];
          // Check if row is empty
          const hasData = rowData.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '');
          if (!hasData) continue;

          const record: any = {};

          Object.keys(colMapping).forEach(colIdxStr => {
            const colIdx = parseInt(colIdxStr, 10);
            const field = colMapping[colIdx];
            let cellValue = rowData[colIdx];

            // Normalize formats
            if (cellValue instanceof Date) {
              const d = cellValue.getDate().toString().padStart(2, '0');
              const m = (cellValue.getMonth() + 1).toString().padStart(2, '0');
              const y = cellValue.getFullYear();
              cellValue = `${d}/${m}/${y}`;
            } else if (typeof cellValue === 'number') {
              const colDef = FLEET_COLUMNS.find(c => c.campo === field);
              if (colDef?.tipo_dato !== 'entero') {
                cellValue = String(cellValue);
              }
            } else if (typeof cellValue === 'string') {
              cellValue = cellValue.trim();
            }

            record[field] = cellValue;
          });

          // Adaptar y armonizar Región CORPOELEC, Estado y Centros de Servicios mediante Llaves Foráneas
          const loc = adaptVehicleLocation(record);
          record.region = loc.region;
          record.estado_venezuela = loc.estado_venezuela;
          if (loc.centro_servicios) {
            record.centro_servicios = loc.centro_servicios;
          }

          records.push(record);
        }

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
