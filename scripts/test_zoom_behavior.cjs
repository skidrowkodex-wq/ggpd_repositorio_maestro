const puppeteer = require('puppeteer');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'scratch');

async function testZoomBehavior() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('--- TEST 1: SIGA-SEN (Port 3008) Atlas Unifilar CND ---');
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });
  await page.click('button[type="submit"]');
  await page.waitForSelector('header', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));

  // Ir a pestaña Atlas Unifilar
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const atlasBtn = buttons.find(b => b.textContent.includes('Atlas Unifilar'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 1.1 Click en Turbina/Generador de CARUACHI
  console.log('Buscando turbina en Caruachi...');
  const clickedTurbina = await page.evaluate(() => {
    const genGroup = document.querySelectorAll('#generadores-turbinas g');
    if (genGroup.length > 0) {
      // El primero o el que tenga mayor MW
      const target = genGroup[0];
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log('Generador clickeado:', clickedTurbina);

  // Esperar animación de zoom
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(IMG_DIR, 'siga_sen_zoom_generador.png') });
  console.log('Screenshot guardado: scratch/siga_sen_zoom_generador.png');

  // 1.2 Click en botón "Zoom Detalle (18x)" de la card modal
  const clickedDetalleBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const zoomBtn = btns.find(b => b.textContent && b.textContent.includes('Zoom Detalle'));
    if (zoomBtn) {
      zoomBtn.click();
      return true;
    }
    return false;
  });
  console.log('Botón Zoom Detalle clickeado:', clickedDetalleBtn);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(IMG_DIR, 'siga_sen_zoom_maximo_18x.png') });
  console.log('Screenshot guardado: scratch/siga_sen_zoom_maximo_18x.png');

  console.log('--- TEST 2: SIGAD (Port 3007) Atlas Topológico ---');
  await page.goto('http://localhost:3007', { waitUntil: 'networkidle0' });
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 1200));

  // Seleccionar BEJUMA
  const searchInput = await page.$('input[placeholder*="Buscar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('BEJUMA');
    await new Promise(r => setTimeout(r, 800));
  }
  const bejumaCard = await page.waitForSelector('text=BEJUMA', { timeout: 5000 });
  if (bejumaCard) await bejumaCard.click();
  await new Promise(r => setTimeout(r, 1000));

  // Cambiar a Atlas Topológico
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click en el Transformador TR-1
  console.log('Clickeando transformador en SIGAD Atlas Topológico...');
  const clickedTrafo = await page.evaluate(() => {
    // Buscar el grupo con circulos de trafo o texto TR
    const textElements = Array.from(document.querySelectorAll('svg text'));
    const trText = textElements.find(t => t.textContent && t.textContent.includes('TR'));
    if (trText && trText.parentElement) {
      trText.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }
    return false;
  });
  console.log('Trafo clickeado en SIGAD:', clickedTrafo);

  // Esperar animación de zoom
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_zoom_trafo.png') });
  console.log('Screenshot guardado: scratch/sigad_zoom_trafo.png');

  await browser.close();
  console.log('✓ Pruebas completadas exitosamente.');
}

testZoomBehavior().catch(console.error);
