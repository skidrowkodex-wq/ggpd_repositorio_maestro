import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT_DIR, 'docs', 'img', 'sigad');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

async function capture() {
  console.log('Iniciando Puppeteer para capturar pantallas de SIGAD (Puerto 3007)...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  try {
    // 1. Pantalla de Login
    console.log('1. Navegando a Login...');
    await page.goto('http://localhost:3007/', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_01_login.png'), fullPage: false });
    console.log('✓ Capturado sigad_01_login.png');

    // Iniciar Sesión (los datos de y_cipiran ya están pre-cargados)
    console.log('Iniciando sesión...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    }
    await new Promise(r => setTimeout(r, 1500));

    // 2. Dashboard inicial con selector
    console.log('2. Capturando Dashboard Principal...');
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_02_dashboard_inicial.png'), fullPage: false });
    console.log('✓ Capturado sigad_02_dashboard_inicial.png');

    // 3. Buscar y seleccionar S/E BEJUMA (Carabobo)
    console.log('3. Buscando S/E BEJUMA...');
    const searchInput = await page.$('input[placeholder*="Buscar"]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.type('BEJUMA');
      await new Promise(r => setTimeout(r, 1000));
    }

    // Click en la subestación BEJUMA encontrada
    const bejumaCard = await page.waitForSelector('text=BEJUMA', { timeout: 5000 }).catch(() => null);
    if (bejumaCard) {
      await bejumaCard.click();
    } else {
      // Intentar click por selector alternativo o botón
      const items = await page.$$('.glass-panel');
      for (const item of items) {
        const text = await page.evaluate(el => el.textContent, item);
        if (text && text.includes('BEJUMA')) {
          await item.click();
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    // Capturar Ficha 360 y KPIs de Bejuma
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_03_bejuma_ficha_kpis.png'), fullPage: false });
    console.log('✓ Capturado sigad_03_bejuma_ficha_kpis.png');

    // 4. Abrir modal de Regeneración de Esqueleto CADAFE
    console.log('4. Abriendo modal Regenerate CADAFE...');
    const cadafeBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('CADAFE') || b.textContent.includes('Esqueleto') || b.textContent.includes('Auto-Generar')));
    });

    if (cadafeBtn && cadafeBtn.asElement()) {
      await cadafeBtn.asElement().click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_04_bejuma_modal_cadafe.png'), fullPage: false });
      console.log('✓ Capturado sigad_04_bejuma_modal_cadafe.png');

      // Confirmar y generar esqueleto
      const confirmBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && (b.textContent.includes('Confirmar') || b.textContent.includes('Generar') || b.textContent.includes('Regenerar')));
      });
      if (confirmBtn && confirmBtn.asElement()) {
        await confirmBtn.asElement().click();
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // 5. Capturar Árbol de Bahías de BEJUMA poblado
    console.log('5. Capturando Árbol de Bahías...');
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_05_bejuma_arbol_bahias.png'), fullPage: false });
    console.log('✓ Capturado sigad_05_bejuma_arbol_bahias.png');

    // 6. Cambiar a vista Atlas Topológico
    console.log('6. Cambiando a pestaña Atlas Topológico...');
    const atlasTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    });
    if (atlasTab && atlasTab.asElement()) {
      await atlasTab.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_06_bejuma_atlas_topologico.png'), fullPage: false });
      console.log('✓ Capturado sigad_06_bejuma_atlas_topologico.png');
    }

    // Volver a pestaña Árbol de Bahías
    const treeTab = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('Árbol') || b.textContent.includes('Bahías')));
    });
    if (treeTab && treeTab.asElement()) {
      await treeTab.asElement().click();
      await new Promise(r => setTimeout(r, 1000));
    }

    // 7. Abrir Modal de Declaración de Falla en un equipo
    console.log('7. Abriendo modal de Declaración de Falla...');
    const reportFaultBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('Declarar Falla') || b.textContent.includes('Falla')));
    });
    if (reportFaultBtn && reportFaultBtn.asElement()) {
      await reportFaultBtn.asElement().click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_07_modal_declaracion_falla.png'), fullPage: false });
      console.log('✓ Capturado sigad_07_modal_declaracion_falla.png');

      // Cerrar modal
      const cancelBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && (b.textContent.includes('Cancelar') || b.textContent.includes('Cerrar')));
      });
      if (cancelBtn && cancelBtn.asElement()) {
        await cancelBtn.asElement().click();
        await new Promise(r => setTimeout(r, 800));
      }
    }

    // 8. Seleccionar Segunda Subestación al azar: S/E BARBACOA I (Anzoátegui)
    console.log('8. Seleccionando Segunda Subestación: BARBACOA I...');
    if (searchInput) {
      await searchInput.click();
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Buscar"]');
        if (input) input.value = '';
      });
      await searchInput.type('BARBACOA I');
      await new Promise(r => setTimeout(r, 1000));
    }

    const barbacoaCard = await page.evaluateHandle(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => el.textContent && el.textContent.includes('BARBACOA I') && el.closest('.glass-panel'));
    });
    if (barbacoaCard && barbacoaCard.asElement()) {
      await barbacoaCard.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
    }

    // Capturar Ficha y KPIs de Barbacoa I
    await page.screenshot({ path: path.join(IMG_DIR, 'sigad_08_barbacoa_ficha_kpis.png'), fullPage: false });
    console.log('✓ Capturado sigad_08_barbacoa_ficha_kpis.png');

    // Auto-generar esqueleto para Barbacoa I si está vacía
    const cadafeBtn2 = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && (b.textContent.includes('CADAFE') || b.textContent.includes('Esqueleto') || b.textContent.includes('Auto-Generar')));
    });
    if (cadafeBtn2 && cadafeBtn2.asElement()) {
      await cadafeBtn2.asElement().click();
      await new Promise(r => setTimeout(r, 1000));
      const confirmBtn2 = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && (b.textContent.includes('Confirmar') || b.textContent.includes('Generar') || b.textContent.includes('Regenerar')));
      });
      if (confirmBtn2 && confirmBtn2.asElement()) {
        await confirmBtn2.asElement().click();
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Cambiar a Atlas Topológico de Barbacoa I
    const atlasTab2 = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    });
    if (atlasTab2 && atlasTab2.asElement()) {
      await atlasTab2.asElement().click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(IMG_DIR, 'sigad_09_barbacoa_atlas_topologico.png'), fullPage: false });
      console.log('✓ Capturado sigad_09_barbacoa_atlas_topologico.png');
    }

    console.log('Todas las capturas de pantalla han sido generadas con éxito en docs/img/sigad/');
  } catch (err) {
    console.error('Error durante la captura:', err);
  } finally {
    await browser.close();
  }
}

capture();
