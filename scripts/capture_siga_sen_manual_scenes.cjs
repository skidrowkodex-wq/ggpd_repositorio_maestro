const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'img', 'siga_sen');

async function captureExtraScenes() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });

  // Login
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  }

  // Navegar a Atlas Unifilar CND
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const atlasBtn = buttons.find(b => b.textContent && b.textContent.includes('Atlas Unifilar'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Buscar y enfocar GURI
  console.log('Capturando Guri...');
  const searchInput = await page.$('input[placeholder*="Buscar y viajar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('PLANTA GURI');
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const guriBtn = buttons.find(b => b.textContent && b.textContent.includes('PLANTA GURI'));
      if (guriBtn) guriBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_06_guri_unifilar.png') });
  }

  // 2. Buscar y enfocar PLANTA CENTRO
  console.log('Capturando Planta Centro...');
  if (searchInput) {
    await page.evaluate(() => {
      const inp = document.querySelector('input[placeholder*="Buscar y viajar"]');
      if (inp) inp.value = '';
    });
    await searchInput.type('PLANTA CENTRO');
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pcBtn = buttons.find(b => b.textContent && b.textContent.includes('PLANTA CENTRO'));
      if (pcBtn) pcBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_07_planta_centro_unifilar.png') });
  }

  // 3. Capturar elemento enfocado de detalle (Click en transformador o generador)
  console.log('Capturando detalle de elemento enfocado...');
  await page.evaluate(() => {
    // Click en el primer transformador o barra visible
    const trafos = document.querySelectorAll('#transformadores-potencia g');
    if (trafos.length > 0) {
      trafos[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_08_elemento_modal_hud.png') });

  console.log('Capturas adicionales generadas con éxito.');
  await browser.close();
}

captureExtraScenes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
