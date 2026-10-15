import fs from 'fs';
import path from 'path';
import { postgresExportService } from '../src/services/postgresExportService';
import { INITIAL_VEHICLES } from '../src/data/sampleVehicles';
import { INITIAL_CATALOGS } from '../src/data/defaultCatalogs';

const dbDir = path.resolve(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Generando scripts SQL de PostgreSQL...');

// 1. DDL
const ddl = postgresExportService.generatePostgreSqlSchema();
fs.writeFileSync(path.join(dbDir, '01_esquema_ddl.sql'), ddl, 'utf-8');
console.log('✓ Creado: database/01_esquema_ddl.sql');

// 2. DML
const dml = postgresExportService.generatePostgreSqlSeedData(INITIAL_VEHICLES, INITIAL_CATALOGS);
fs.writeFileSync(path.join(dbDir, '02_datos_semilla_dml.sql'), dml, 'utf-8');
console.log('✓ Creado: database/02_datos_semilla_dml.sql');

// 3. Completo
const complete = postgresExportService.generateCompleteSetupScript(INITIAL_VEHICLES, INITIAL_CATALOGS);
fs.writeFileSync(path.join(dbDir, '00_corpoelec_flota_completo.sql'), complete, 'utf-8');
console.log('✓ Creado: database/00_corpoelec_flota_completo.sql');

console.log('Todos los archivos SQL fueron generados exitosamente en la carpeta /database.');
