const supabaseUrl = 'https://owpiwacuotcaeruvonbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cGl3YWN1b3RjYWVydXZvbmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MzA2MDQsImV4cCI6MjA5ODQwNjYwNH0.cKoGATpTwXF-awZiqdCuY_L4hQX2t69P72vdLQTiVls';

async function fetchSchemaSpec(schemaName) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept-Profile': schemaName,
        'Accept': 'application/openapi+json'
      }
    });

    console.log(`--- ESQUEMA "${schemaName}" HTTP STATUS: ${res.status} ---`);
    if (res.ok) {
      const spec = await res.json();
      if (spec.definitions) {
        console.log(`✅ ENTIDADES EN "${schemaName}":`, Object.keys(spec.definitions));
      } else {
        console.log(`Respuesta sin definiciones. Keys:`, Object.keys(spec));
      }
    } else {
      const text = await res.text();
      console.log(`Error body (${res.status}):`, text.slice(0, 200));
    }
  } catch (err) {
    console.log(`Excepción en "${schemaName}":`, err.message);
  }
}

async function runAll() {
  const schemas = ['common', 'public', 'distribucion', 'core', 'telemetria', 'activos', 'seguridad', 'master'];
  for (const s of schemas) {
    await fetchSchemaSpec(s);
  }
}

runAll();
