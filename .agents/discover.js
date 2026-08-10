const supabaseUrl = 'https://owpiwacuotcaeruvonbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cGl3YWN1b3RjYWVydXZvbmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzA2MDQsImV4cCI6MjA5ODQwNjYwNH0.cKoGATpTwXF-awZiqdCuY_L4hQX2t69P72vdLQTiVls';

const schemasToTest = [
  'common',
  'public',
  'distribucion',
  'core',
  'transmision',
  'telemetria',
  'activos',
  'se_ct',
  'corpoelec',
  'inspeccion',
  'mantenimiento',
  'medicion',
  'operaciones',
  'seguridad',
  'usuarios',
  'catalogos'
];

const candidateTables = [
  'subestaciones',
  'subestacion',
  'circuitos',
  'circuito',
  'activos',
  'activo',
  'activos_red',
  'regiones',
  'region',
  'estados',
  'estado',
  'municipios',
  'parroquias',
  'equipos',
  'transformadores',
  'lineas',
  'barras',
  'alimentadores',
  'usuarios',
  'usuario',
  'profiles',
  'personas',
  'empresas',
  'catalogos',
  'roles',
  'permisos',
  'eventos',
  'mediciones',
  'historico'
];

async function checkTable(schemaName, tableName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=2`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept-Profile': schemaName
      }
    });
    
    const status = res.status;
    if (status === 200) {
      const data = await res.json();
      return { success: true, count: data.length, sample: data[0] || null };
    } else if (status === 401 || status === 403) {
      return { rlsProtected: true, status };
    } else {
      return null; // 404 or non-existent in this schema
    }
  } catch (err) {
    return null;
  }
}

async function run() {
  console.log('=== AUDITORÍA Y DISCOVERY DE ESQUEMAS EN SUPABASE ===\n');

  for (const schemaName of schemasToTest) {
    let foundInSchema = [];

    for (const table of candidateTables) {
      const result = await checkTable(schemaName, table);
      if (result) {
        if (result.success) {
          foundInSchema.push({ table: tableNameFormat(table), count: result.count, sample: result.sample });
        } else if (result.rlsProtected) {
          foundInSchema.push({ table: tableNameFormat(table), rlsProtected: true, status: result.status });
        }
      }
    }

    if (foundInSchema.length > 0) {
      console.log(`📂 ESQUEMA ENCONTRADO: "${schemaName}" (${foundInSchema.length} entidades detectadas):`);
      foundInSchema.forEach(item => {
        if (item.rlsProtected) {
          console.log(`  - 🔒 ${item.table} (Protegido por RLS / Permisos HTTP ${item.status})`);
        } else {
          const keys = item.sample ? Object.keys(item.sample).join(', ') : 'sin datos aun';
          console.log(`  - 📋 ${item.table} (${item.count} registros devueltos). Campos: [${keys}]`);
        }
      });
      console.log('');
    } else {
      console.log(`⚪ Esquema "${schemaName}": Sin tablas encontradas en el escaneo inicial.`);
    }
  }
}

function tableNameFormat(t) {
  return t;
}

run();
