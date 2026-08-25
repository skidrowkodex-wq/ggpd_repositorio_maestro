/**
 * Script de Extracción y Descarga Local de Correspondencias GGP
 * Repositorio Maestro CORPOELEC (GGPD) — SCGCC
 */

import fs from 'fs';
import path from 'path';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwmnYukC-DaaHWSRvfwW6lLipK7MZmgkLH9Ra3dh4JXjeDWK0AHPo_jxMXyZ0obhgAY/exec';
const OUTPUT_DIR = path.resolve(process.cwd(), 'data/correspondencia_raw');

async function main() {
  console.log('📡 Conectando con Google Apps Script Webhook...');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    const res = await fetch(`${WEBHOOK_URL}?action=INSPECT_CORRESPONDENCIAS`);
    const data = await res.json();

    if (data.status !== 'SUCCESS' || !Array.isArray(data.data)) {
      console.log('⚠️ El Webhook aún está en versión v3.0.0. Por favor implementa la versión v3.1.0 desde scripts/google_apps_script_provisioner_2026.gs en la consola de Google Apps Script.');
      console.log('Respuesta recibida:', JSON.stringify(data, null, 2));
      return;
    }

    console.log(`✅ ${data.count} Directorios identificados en Google Drive.`);
    
    // Guardar inventario JSON
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'inventario_correspondencia_drive.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`📁 Inventario guardado en data/correspondencia_raw/inventario_correspondencia_drive.json`);

    // Descargar archivos mediante Base64
    for (const folder of data.data) {
      console.log(`\n📂 Procesando carpeta: ${folder.alias} (${folder.realName})`);
      const folderLocalPath = path.join(OUTPUT_DIR, folder.alias.replace(/[^a-zA-Z0-9_\-]/g, '_'));
      if (!fs.existsSync(folderLocalPath)) {
        fs.mkdirSync(folderLocalPath, { recursive: true });
      }

      for (const file of folder.files) {
        console.log(`  ⬇️ Descargando: ${file.name} (${file.sizeKB} KB)...`);
        try {
          const fileRes = await fetch(`${WEBHOOK_URL}?action=GET_FILE_BASE64&fileId=${file.id}`);
          const fileData = await fileRes.json();
          if (fileData.success && fileData.base64Data) {
            const buffer = Buffer.from(fileData.base64Data, 'base64');
            fs.writeFileSync(path.join(folderLocalPath, file.name), buffer);
            console.log(`  ✅ Guardado: ${file.name}`);
          } else {
            console.log(`  ❌ Error obteniendo base64 de ${file.name}:`, fileData.error);
          }
        } catch (err) {
          console.log(`  ❌ Fallo en descarga de ${file.name}:`, err.message);
        }
      }
    }

    console.log('\n🎉 ¡Extracción y réplica local completadas con éxito!');
  } catch (err) {
    console.error('❌ Error de conexión con el Webhook:', err.message);
  }
}

main();
