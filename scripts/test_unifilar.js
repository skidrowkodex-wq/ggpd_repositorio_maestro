import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { LIGHT_THEME_CSS } from './lightThemeCss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT_DIR, 'docs', 'img', 'sigad');

async function testUnifilar() {
  console.log('Testing Unifilar generation and screenshot...');
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

  // 1. BEJUMA
  console.log('Buscando BEJUMA...');
  const searchInput = await page.$('input[placeholder*="Buscar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('BEJUMA');
    await new Promise(r => setTimeout(r, 800));
  }
  const bejumaCard = await page.waitForSelector('text=BEJUMA', { timeout: 5000 });
  if (bejumaCard) await bejumaCard.click();
  await new Promise(r => setTimeout(r, 1000));

  // Click botón Auto-Generar Esqueleto CADAFE
  console.log('Abriendo modal CADAFE...');
  const clickedModal = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Esqueleto CADAFE'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Botón CADAFE clickeado:', clickedModal);
  await new Promise(r => setTimeout(r, 1000));

  // Enviar modal CADAFE
  const submittedModal = await page.evaluate(() => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      const submit = modal.querySelector('button[type="submit"]');
      if (submit) {
        submit.click();
        return true;
      }
    }
    return false;
  });
  console.log('Modal CADAFE submitted:', submittedModal);
  await new Promise(r => setTimeout(r, 1500));

  // Cambiar a Atlas Topológico en el Navbar
  console.log('Cambiando a Atlas Topológico...');
  const clickedAtlas = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Atlas Tab clickeada:', clickedAtlas);
  await new Promise(r => setTimeout(r, 1500));

  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  // Verificar presencia del SVG
  const svgInfo = await page.evaluate(() => {
    const svg = document.querySelector('svg[viewBox="0 0 960 480"]');
    if (!svg) return { found: false };
    return {
      found: true,
      lines: svg.querySelectorAll('line').length,
      circles: svg.querySelectorAll('circle').length,
      texts: svg.querySelectorAll('text').length,
    };
  });
  console.log('SVG Info BEJUMA:', svgInfo);

  if (svgInfo.found) {
    // Screenshot whole Atlas view
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_06_bejuma_atlas_topologico_claro.png') });
    console.log('✓ Guardado sigad_06_bejuma_atlas_topologico_claro.png');

    // Screenshot ONLY unifilar container
    const unifilarBox = await page.evaluateHandle(() => {
      return document.querySelector('svg[viewBox="0 0 960 480"]')?.parentElement;
    });
    if (unifilarBox && unifilarBox.asElement()) {
      await unifilarBox.asElement().screenshot({ path: path.join(IMG_DIR, 'sigad_07_bejuma_diagrama_unifilar.png') });
      console.log('✓ Guardado sigad_07_bejuma_diagrama_unifilar.png');
    }
  }

  // 2. BARBACOA I
  console.log('Buscando BARBACOA I...');
  // Cambiar a Estructura por Bahías primero
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Estructura por Bahías'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const searchInput2 = await page.$('input[placeholder*="Buscar"]');
  if (searchInput2) {
    await searchInput2.click();
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Buscar"]');
      if (input) input.value = '';
    });
    await searchInput2.type('BARBACOA I');
    await new Promise(r => setTimeout(r, 800));
  }

  const barbacoaCard = await page.waitForSelector('text=BARBACOA I', { timeout: 5000 });
  if (barbacoaCard) await barbacoaCard.click();
  await new Promise(r => setTimeout(r, 1000));

  // Abrir y generar CADAFE para Barbacoa I
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Esqueleto CADAFE'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

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

  // Screenshot Barbacoa I
  const svgInfo2 = await page.evaluate(() => {
    const svg = document.querySelector('svg[viewBox="0 0 960 480"]');
    if (!svg) return { found: false };
    return {
      found: true,
      lines: svg.querySelectorAll('line').length,
      texts: svg.querySelectorAll('text').length,
    };
  });
  console.log('SVG Info BARBACOA I:', svgInfo2);

  if (svgInfo2.found) {
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_09_barbacoa_atlas_topologico_claro.png') });
    console.log('✓ Guardado sigad_09_barbacoa_atlas_topologico_claro.png');

    const unifilarBox2 = await page.evaluateHandle(() => {
      return document.querySelector('svg[viewBox="0 0 960 480"]')?.parentElement;
    });
    if (unifilarBox2 && unifilarBox2.asElement()) {
      await unifilarBox2.asElement().screenshot({ path: path.join(IMG_DIR, 'sigad_10_barbacoa_diagrama_unifilar.png') });
      console.log('✓ Guardado sigad_10_barbacoa_diagrama_unifilar.png');
    }
  }

  await browser.close();
  console.log('¡Capturas unifilares finalizadas exitosamente!');
}

testUnifilar();
