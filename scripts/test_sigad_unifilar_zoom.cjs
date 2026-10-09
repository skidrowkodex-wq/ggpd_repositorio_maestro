const puppeteer = require('puppeteer');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'scratch');

async function testSigadZoom() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3007', { waitUntil: 'networkidle0' });
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 1200));

  // Buscar BARBACOA I
  const searchInput = await page.$('input[placeholder*="Buscar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('BARBACOA I');
    await new Promise(r => setTimeout(r, 800));
  }
  const barbacoaCard = await page.waitForSelector('text=BARBACOA I', { timeout: 5000 });
  if (barbacoaCard) await barbacoaCard.click();
  await new Promise(r => setTimeout(r, 1000));

  // Generar esqueleto CADAFE si no está generado
  const needsGenerate = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Configurar y Auto-Generar'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (needsGenerate) {
    await new Promise(r => setTimeout(r, 800));
    // Confirmar en modal
    await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        const confirmBtn = modal.querySelector('button[type="submit"]');
        if (confirmBtn) confirmBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  // Cambiar a Atlas Topológico
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Capturar vista general
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_atlas_general.png') });

  // Clickeando el Transformador TR-1
  console.log('Clickeando transformador TR-1...');
  const clickedTrafo = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('svg text'));
    const trText = texts.find(t => t.textContent && t.textContent.includes('TR'));
    const gElem = trText?.closest('g.cursor-pointer');
    if (gElem) {
      if (typeof gElem.click === 'function') gElem.click();
      gElem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    }
    return false;
  });
  console.log('Trafo clickeado:', clickedTrafo);

  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(IMG_DIR, 'sigad_atlas_zoom_trafo.png') });

  await browser.close();
  console.log('✓ Test SIGAD completado.');
}

testSigadZoom().catch(console.error);
