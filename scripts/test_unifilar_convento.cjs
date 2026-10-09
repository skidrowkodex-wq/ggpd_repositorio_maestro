const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'img', 'siga_sen');

async function testConvento() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  console.log('1. Abriendo SIGA-SEN en http://localhost:3008 ...');
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });

  // Login
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  }

  // Navegar a Atlas Unifilar CND
  console.log('2. Navegando a Atlas Unifilar CND...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const atlasBtn = buttons.find(b => b.textContent && b.textContent.includes('Atlas Unifilar'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Buscar EL CONVENTO
  console.log('3. Buscando EL CONVENTO...');
  const searchInput = await page.$('input[placeholder*="Buscar y viajar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('EL CONVENTO');
    await new Promise(r => setTimeout(r, 800));

    // Click en el primer resultado que sea EL CONVENTO
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const conventoBtn = buttons.find(b => b.textContent && b.textContent.includes('EL CONVENTO') && !b.textContent.includes('BOYACA EL CONVENTO'));
      if (conventoBtn) {
        conventoBtn.click();
      } else {
        const anyConvento = buttons.find(b => b.textContent && b.textContent.includes('CONVENTO'));
        if (anyConvento) anyConvento.click();
      }
    });
  }

  // Esperar a que la cámara animada haga zoom sobre EL CONVENTO
  await new Promise(r => setTimeout(r, 1200));

  // Captura 1: Lienzo Blanco (Oficial CND)
  console.log('4. Capturando Lienzo Blanco...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'convento_lienzo_blanco.png') });

  // Cambiar a SCADA Oscuro
  console.log('5. Cambiando a SCADA Oscuro...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const darkBtn = buttons.find(b => b.textContent && b.textContent.includes('SCADA Oscuro'));
    if (darkBtn) darkBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Captura 2: SCADA Oscuro
  console.log('6. Capturando SCADA Oscuro...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'convento_scada_oscuro.png') });

  console.log('¡Capturas completadas con éxito en docs/img/siga_sen/ !');
  await browser.close();
}

testConvento().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
