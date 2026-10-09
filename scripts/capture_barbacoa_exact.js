import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { LIGHT_THEME_CSS } from './lightThemeCss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT_DIR, 'docs', 'img', 'sigad');

async function captureBarbacoa() {
  console.log('Capturando S/E BARBACOA I con sus circuitos reales...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2.0 });

  await page.goto('http://localhost:3007/', { waitUntil: 'networkidle0' });
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 1200));

  // 1. Filtrar por estado ANZOATEGUI en el select
  await page.evaluate(() => {
    const sel = document.querySelector('select');
    if (sel) {
      sel.value = 'ANZOATEGUI';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // 2. Buscar BARBACOA I
  const searchInput = await page.$('input[placeholder*="Buscar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('BARBACOA I');
    await new Promise(r => setTimeout(r, 800));
  }

  // 3. Click en la tarjeta de BARBACOA I
  const clicked = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('.glass-panel'));
    const barbacoaPanel = panels.find(p => p.textContent && p.textContent.includes('BARBACOA I') && p.textContent.includes('SE-ANZ-0007'));
    if (barbacoaPanel) {
      barbacoaPanel.click();
      return true;
    }
    return false;
  });
  console.log('Tarjeta BARBACOA I clickeada:', clicked);
  await new Promise(r => setTimeout(r, 1200));

  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  // Capturar Ficha 360 y KPIs en Modo Claro
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_08_barbacoa_ficha_kpis_claro.png') });
  console.log('✓ Guardado sigad_08_barbacoa_ficha_kpis_claro.png');

  // Abrir modal CADAFE
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Esqueleto CADAFE'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Enviar modal CADAFE
  await page.evaluate(() => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      const submit = modal.querySelector('button[type="submit"]');
      if (submit) submit.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Cambiar a Atlas Topológico
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  // Screenshot Atlas completo de Barbacoa I
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_09_barbacoa_atlas_topologico_claro.png') });
  console.log('✓ Guardado sigad_09_barbacoa_atlas_topologico_claro.png');

  // Screenshot Diagrama Unifilar directo de Barbacoa I
  const unifilarBox = await page.evaluateHandle(() => {
    return document.querySelector('svg[viewBox="0 0 960 480"]')?.parentElement;
  });
  if (unifilarBox && unifilarBox.asElement()) {
    await unifilarBox.asElement().screenshot({ path: path.join(IMG_DIR, 'sigad_10_barbacoa_diagrama_unifilar.png') });
    console.log('✓ Guardado sigad_10_barbacoa_diagrama_unifilar.png (UNIFILAR DETALLE)');
  }

  await browser.close();
  console.log('BARBACOA I completada!');
}

captureBarbacoa();
