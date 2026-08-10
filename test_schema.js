import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owpiwacuotcaeruvonbd.supabase.co';
const supabaseKey = '***REMOVED***';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'common' }
});

const candidateTables = [
  'subestaciones',
  'subestacion',
  'circuitos',
  'circuito',
  'activos',
  'activo',
  'regiones',
  'estados',
  'municipios',
  'parroquias',
  'equipos',
  'transformadores',
  'lineas',
  'barras',
  'alimentadores',
  'usuarios',
  'profiles'
];

async function run() {
  console.log('--- TEST ESQUEMA common ---');
  for (const table of candidateTables) {
    const { data, error } = await supabase.from(table).select('*').limit(3);
    if (error) {
      console.log(`[${table}]: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ [${table}] ENCONTRADO EN common! Data:`, JSON.stringify(data));
    }
  }
}

run();
