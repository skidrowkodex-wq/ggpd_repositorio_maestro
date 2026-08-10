const supabaseUrl = 'https://owpiwacuotcaeruvonbd.supabase.co';
const supabaseKey = '***REMOVED***';

const commonTables = [
  'subestaciones', 'subestacion',
  'circuitos', 'circuito',
  'regiones', 'region',
  'estados', 'estado',
  'municipios', 'municipio',
  'parroquias', 'parroquia',
  'personas', 'persona',
  'empleados', 'empleado',
  'usuarios', 'usuario',
  'empresas', 'empresa',
  'divisiones', 'division',
  'oficinas', 'oficina',
  'catalogos', 'catalogo',
  'activos', 'activo',
  'equipos', 'equipo',
  'transformadores', 'transformador',
  'lineas', 'linea',
  'barras', 'barra',
  'alimentadores', 'alimentador',
  'interruptores', 'seccionadores',
  'medidores', 'lecturas',
  'eventos', 'bitacora',
  'auditoria', 'logs'
];

async function scanCommonSchema() {
  console.log('=== ESCANEANDO TABLAS EN ESQUEMA "common" ===\n');
  const found = [];

  for (const table of commonTables) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept-Profile': 'common'
        }
      });

      if (res.status === 200) {
        const data = await res.json();
        console.log(`✅ [HTTP 200] TABLA ENCONTRADA EN common: "${table}" (${data.length} registros devueltos)`);
        if (data.length > 0) {
          console.log(`   Campos:`, Object.keys(data[0]));
          console.log(`   Muestra:`, JSON.stringify(data[0]));
        }
        found.push(table);
      } else if (res.status === 401 || res.status === 403) {
        console.log(`🔒 [HTTP ${res.status}] TABLA EXISTE EN common PERO RLS PROTEGE: "${table}"`);
        found.push(`${table} (RLS)`);
      } else if (res.status !== 404 && res.status !== 406) {
        console.log(`❓ [HTTP ${res.status}] RESPUESTA DIFERENTE PARA: "${table}"`);
      }
    } catch (e) {
      // Ignore network errors
    }
  }

  console.log('\n--- RESUMEN FINAL ESQUEMA common ---');
  console.log(`Tablas detectadas: ${found.length > 0 ? found.join(', ') : 'Ninguna de la lista básica se pudo leer directamente'}`);
}

scanCommonSchema();
