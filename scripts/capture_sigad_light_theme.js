import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LIGHT_THEME_CSS } from './lightThemeCss.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT_DIR, 'docs', 'img', 'sigad');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

async function injectLightMode(page) {
  await page.addStyleTag({ content: LIGHT_THEME_CSS });
  await page.evaluate(() => {
    // Forzar fondo blanco en SVGs y contenedores
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(s => {
      s.style.backgroundColor = '#ffffff';
      if (s.parentElement) {
        s.parentElement.style.backgroundColor = '#ffffff';
        s.parentElement.style.borderColor = '#cbd5e1';
      }
    });
  });
  await new Promise(r => setTimeout(r, 400));
}

async function capture() {
  console.log('Iniciando Puppeteer en MODO CLARO (Optimizado para impresión láser monocromática)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2.0 });

  try {
    // 1. Login en Modo Claro
    console.log('1. Capturando Login...');
    await page.goto('http://localhost:3007/', { waitUntil: 'networkidle0', timeout: 15000 });
    await injectLightMode(page);
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_01_login_claro.png'), fullPage: false });
    console.log('✓ Capturado sigad_01_login_claro.png');

    // Iniciar Sesión
    console.log('Iniciando sesión...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // 2. Dashboard Principal con Selector
    console.log('2. Capturando Dashboard Principal...');
    await injectLightMode(page);
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_02_dashboard_inicial_claro.png'), fullPage: false });
    console.log('✓ Capturado sigad_02_dashboard_inicial_claro.png');

    // 3. Buscar y seleccionar S/E BEJUMA
    console.log('3. Buscando S/E BEJUMA...');
    const searchInput = await page.$('input[placeholder*="Buscar"]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.type('BEJUMA');
      await new Promise(r => setTimeout(r, 800));
    }

    const bejumaCard = await page.waitForSelector('text=BEJUMA', { timeout: 5000 }).catch(() => null);
    if (bejumaCard) await bejumaCard.click();
    await new Promise(r => setTimeout(r, 1200));
    await injectLightMode(page);

    // Capturar Ficha y KPIs de Bejuma
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_03_bejuma_ficha_kpis_claro.png'), fullPage: false });
    console.log('✓ Capturado sigad_03_bejuma_ficha_kpis_claro.png');

    // 4. Modal CADAFE NS-P-105
    console.log('4. Capturando Modal CADAFE...');
    const cadafeBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('CADAFE') || b.textContent.includes('Esqueleto') || b.textContent.includes('Auto-Generar')));
    });

    if (cadafeBtn && cadafeBtn.asElement()) {
      await cadafeBtn.asElement().click();
      await new Promise(r => setTimeout(r, 1000));
      await injectLightMode(page);
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_04_bejuma_modal_cadafe_claro.png'), fullPage: false });
      console.log('✓ Capturado sigad_04_bejuma_modal_cadafe_claro.png');

      // Enviar formulario y cerrar modal
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          const submit = form.querySelector('button[type="submit"]');
          if (submit) submit.click();
        }
      });
      await new Promise(r => setTimeout(r, 1500));
    }

    // 5. Árbol de Bahías
    console.log('5. Capturando Árbol de Bahías...');
    await injectLightMode(page);
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_05_bejuma_arbol_bahias_claro.png'), fullPage: false });
    console.log('✓ Capturado sigad_05_bejuma_arbol_bahias_claro.png');

    // 6. Vista Atlas Topológico SEN
    console.log('6. Cambiando a Atlas Topológico de BEJUMA...');
    const atlasTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    });
    if (atlasTab && atlasTab.asElement()) {
      await atlasTab.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
      await injectLightMode(page);
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_06_bejuma_atlas_topologico_claro.png'), fullPage: false });
      console.log('✓ Capturado sigad_06_bejuma_atlas_topologico_claro.png');

      // 7. DETALLE DIRECTO DEL DIAGRAMA UNIFILAR (SVG) DE BEJUMA
      console.log('7. Capturando recorte de DIAGRAMA UNIFILAR de BEJUMA...');
      const unifilarBox = await page.evaluateHandle(() => {
        const svg = document.querySelector('svg[viewBox="0 0 960 480"]');
        return svg ? svg.parentElement : null;
      });
      if (unifilarBox && unifilarBox.asElement()) {
        await unifilarBox.asElement().screenshot({ path: path.join(IMG_DIR, 'sigad_07_bejuma_diagrama_unifilar.png') });
        console.log('✓ Capturado sigad_07_bejuma_diagrama_unifilar.png (UNIFILAR DETALLE)');
      }
    }

    // 8. Seleccionar BARBACOA I
    console.log('8. Seleccionando BARBACOA I...');
    const treeTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('Árbol') || b.textContent.includes('Bahías')));
    });
    if (treeTab && treeTab.asElement()) {
      await treeTab.asElement().click();
      await new Promise(r => setTimeout(r, 800));
    }

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
    if (barbacoaCard && barbacoaCard.asElement()) {
      await barbacoaCard.asElement().click();
      await new Promise(r => setTimeout(r, 1200));
    }

    await injectLightMode(page);
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_08_barbacoa_ficha_kpis_claro.png'), fullPage: false });
    console.log('✓ Capturado sigad_08_barbacoa_ficha_kpis_claro.png');

    // Generar esqueleto de Barbacoa si hace falta
    const cadafeBtn2 = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('CADAFE') || b.textContent.includes('Esqueleto') || b.textContent.includes('Auto-Generar')));
    });
    if (cadafeBtn2 && cadafeBtn2.asElement()) {
      await cadafeBtn2.asElement().click();
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          const submit = form.querySelector('button[type="submit"]');
          if (submit) submit.click();
        }
      });
      await new Promise(r => setTimeout(r, 1500));
    }

    // Atlas Topológico de Barbacoa I
    const atlasTab2 = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    });
    if (atlasTab2 && atlasTab2.asElement()) {
      await atlasTab2.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
      await injectLightMode(page);
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_09_barbacoa_atlas_topologico_claro.png'), fullPage: false });
      console.log('✓ Capturado sigad_09_barbacoa_atlas_topologico_claro.png');

      // 10. DETALLE DIRECTO DEL DIAGRAMA UNIFILAR (SVG) DE BARBACOA I
      console.log('10. Capturando recorte de DIAGRAMA UNIFILAR de BARBACOA I...');
      const unifilarBox2 = await page.evaluateHandle(() => {
        const svg = document.querySelector('svg[viewBox="0 0 960 480"]');
        return svg ? svg.parentElement : null;
      });
      if (unifilarBox2 && unifilarBox2.asElement()) {
        await unifilarBox2.asElement().screenshot({ path: path.join(IMG_DIR, 'sigad_10_barbacoa_diagrama_unifilar.png') });
        console.log('✓ Capturado sigad_10_barbacoa_diagrama_unifilar.png (UNIFILAR DETALLE)');
      }
    }

    console.log('¡Todas las imágenes en MODO CLARO y DIAGRAMAS UNIFILARES han sido generadas con éxito!');
  } catch (err) {
    console.error('Error durante la captura en modo claro:', err);
  } finally {
    await browser.close();
  }
}

capture();
