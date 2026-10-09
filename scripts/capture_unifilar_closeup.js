import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { LIGHT_THEME_CSS } from './lightThemeCss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT_DIR, 'docs', 'img', 'sigad');

async function captureUnifilares() {
  console.log('Capturando Diagramas Unifilares en Primer Plano (Modo Claro / Blanco y Negro)...');
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

  const bejumaCard = await page.waitForSelector('text=BEJUMA', { timeout: 5000 }).catch(() => null);
  if (bejumaCard) await bejumaCard.click();
  await new Promise(r => setTimeout(r, 1200));

  // Click Atlas Topológico
  const atlasTab = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
  });
  if (atlasTab && atlasTab.asElement()) await atlasTab.asElement().click();
  await new Promise(r => setTimeout(r, 1500));

  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  // Screenshot parent of SVG
  const bejumaSvgParent = await page.evaluateHandle(() => {
    const svg = document.querySelector('svg');
    return svg ? svg.parentElement : null;
  });

  if (bejumaSvgParent && bejumaSvgParent.asElement()) {
    await bejumaSvgParent.asElement().screenshot({
      path: path.join(IMG_DIR, 'sigad_07_bejuma_diagrama_unifilar.png')
    });
    console.log('✓ Capturado exitosamente sigad_07_bejuma_diagrama_unifilar.png');
  }

  // 2. BARBACOA I
  console.log('Buscando BARBACOA I...');
  const treeTab = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && (b.textContent.includes('Árbol') || b.textContent.includes('Bahías')));
  });
  if (treeTab && treeTab.asElement()) await treeTab.asElement().click();
  await new Promise(r => setTimeout(r, 800));

  const searchInput2 = await page.$('input[placeholder*="Buscar"]');
  if (searchInput2) {
    await searchInput2.click();
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Buscar"]');
      if (input) input.value = '';
    });
    await searchInput2.type('BARBACOA I');
    await new Promise(r => setTimeout(r, 1000));
  }

  const barbacoaCard = await page.evaluateHandle(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.find(el => el.textContent && el.textContent.includes('BARBACOA I') && el.closest('.glass-panel'));
  });
  if (barbacoaCard && barbacoaCard.asElement()) await barbacoaCard.asElement().click();
  await new Promise(r => setTimeout(r, 1200));

  // Generar esqueleto CADAFE si hace falta
  const cadafeBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && (b.textContent.includes('CADAFE') || b.textContent.includes('Esqueleto') || b.textContent.includes('Auto-Generar')));
  });
  if (cadafeBtn && cadafeBtn.asElement()) {
    await cadafeBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1000));
    const confirmBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('Confirmar') || b.textContent.includes('Generar') || b.textContent.includes('Regenerar')));
    });
    if (confirmBtn && confirmBtn.asElement()) {
      await confirmBtn.asElement().click();
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  // Click Atlas Topológico Barbacoa
  const atlasTab2 = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
  });
  if (atlasTab2 && atlasTab2.asElement()) await atlasTab2.asElement().click();
  await new Promise(r => setTimeout(r, 1500));

  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await new Promise(r => setTimeout(r, 500));

  const barbacoaSvgParent = await page.evaluateHandle(() => {
    const svg = document.querySelector('svg');
    return svg ? svg.parentElement : null;
  });

  if (barbacoaSvgParent && barbacoaSvgParent.asElement()) {
    await barbacoaSvgParent.asElement().screenshot({
      path: path.join(IMG_DIR, 'sigad_10_barbacoa_diagrama_unifilar.png')
    });
    console.log('✓ Capturado exitosamente sigad_10_barbacoa_diagrama_unifilar.png');
  }

  await browser.close();
  console.log('Unifilares finalizados!');
}

captureUnifilares();
