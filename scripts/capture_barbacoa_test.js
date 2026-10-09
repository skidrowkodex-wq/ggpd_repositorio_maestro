import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { LIGHT_THEME_CSS } from './lightThemeCss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT_DIR, 'docs', 'img', 'sigad');

async function testBarbacoa() {
  console.log('--- Iniciando captura precisa de S/E BARBACOA I ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1080, deviceScaleFactor: 2.0 });

  await page.goto('http://localhost:3007/', { waitUntil: 'networkidle0' });
  
  // Login
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 1200));

  // Seleccionar ANZOATEGUI en el primer select
  console.log('Seleccionando ANZOATEGUI...');
  await page.evaluate(() => {
    const selects = document.querySelectorAll('select');
    const estadoSelect = selects[0];
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    nativeSetter.call(estadoSelect, 'ANZOATEGUI');
    estadoSelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 1000));

  // Seleccionar SE-ANZ-0007 en el segundo select
  console.log('Seleccionando SE-ANZ-0007 (BARBACOA I)...');
  const selectedInfo = await page.evaluate(() => {
    const selects = document.querySelectorAll('select');
    const seSelect = selects[1];
    if (!seSelect) return { found: false, error: 'No seSelect' };
    
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    nativeSetter.call(seSelect, 'SE-ANZ-0007');
    seSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    return {
      found: true,
      currentValue: seSelect.value,
      optionsCount: seSelect.options.length
    };
  });
  console.log('Respuesta selección:', selectedInfo);
  await new Promise(r => setTimeout(r, 1500));

  // Verificar texto del header card
  const headerText = await page.evaluate(() => {
    const h1 = document.querySelector('h1, h2, h3');
    return document.body.innerText.slice(0, 500);
  });
  console.log('Snippet texto tras selección:', headerText.slice(0, 300));

  // Aplicar tema claro
  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  // 1. Screenshot Ficha 360 de Barbacoa I
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_08_barbacoa_ficha_kpis_claro.png') });
  console.log('✓ Guardado sigad_08_barbacoa_ficha_kpis_claro.png');

  // Si no tiene estructura, o para generarla con CADAFE:
  console.log('Revisando si requiere generar estructura CADAFE...');
  const openedModal = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && (b.textContent.includes('Esqueleto CADAFE') || b.textContent.includes('Generar Estructura CADAFE')));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Modal CADAFE abierto:', openedModal);
  await new Promise(r => setTimeout(r, 1200));

  if (openedModal) {
    // Confirmar en el modal
    console.log('Confirmando generación CADAFE para Barbacoa I...');
    await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        const submit = modal.querySelector('button[type="submit"]') || Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Generar') || b.textContent.includes('Confirmar'));
        if (submit) submit.click();
      }
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Cambiar a la pestaña "Atlas Topológico"
  console.log('Cambiando a pestaña Atlas Topológico...');
  const atlasTabClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Pestaña Atlas Topológico clickeada:', atlasTabClicked);
  await new Promise(r => setTimeout(r, 1500));

  // Re-aplicar tema claro
  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  // 2. Screenshot Atlas Topológico Completo
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_09_barbacoa_atlas_topologico_claro.png') });
  console.log('✓ Guardado sigad_09_barbacoa_atlas_topologico_claro.png');

  // 3. Screenshot Detalle Diagrama Unifilar SVG
  const unifilarBox = await page.evaluateHandle(() => {
    return document.querySelector('svg[viewBox="0 0 960 480"]')?.parentElement;
  });

  if (unifilarBox && unifilarBox.asElement()) {
    await unifilarBox.asElement().screenshot({ path: path.join(IMG_DIR, 'sigad_10_barbacoa_diagrama_unifilar.png') });
    console.log('✓ Guardado sigad_10_barbacoa_diagrama_unifilar.png (UNIFILAR DETALLE)');
  } else {
    console.warn('No se encontró el contenedor SVG unifilar');
  }

  await browser.close();
  console.log('=== Proceso completado exitosamente ===');
}

testBarbacoa().catch(err => {
  console.error('Error en testBarbacoa:', err);
  process.exit(1);
});
