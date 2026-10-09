const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'img', 'siga_sen');

async function capture() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('1. Cargando pantalla de Login SIGA-SEN...');
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_01_login.png') });

  console.log('2. Iniciando sesión con fullstack001 ...');
  // Click en el botón de submit
  await page.click('button[type="submit"]');
  await page.waitForSelector('header', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_02_nodos_patios.png') });

  console.log('3. Navegando a Centrales de Generación...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const genBtn = buttons.find(b => b.textContent.includes('Centrales de Generación'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_03_generacion.png') });

  console.log('4. Navegando a Balance SEN...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const balBtn = buttons.find(b => b.textContent.includes('Balance SEN'));
    if (balBtn) balBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_04_balance.png') });

  console.log('5. Navegando a Atlas Unifilar CND...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const atlasBtn = buttons.find(b => b.textContent.includes('Atlas Unifilar'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'siga_sen_05_atlas.png') });

  console.log('Capturas finalizadas con éxito en docs/img/siga_sen/');
  await browser.close();
}

capture().catch(err => {
  console.error('Error en captura:', err);
  process.exit(1);
});
