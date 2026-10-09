const puppeteer = require('puppeteer');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'scratch');

async function captureGuri() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });
  await page.click('button[type="submit"]');
  await page.waitForSelector('header', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));

  // Ir a Atlas Unifilar
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const atlasBtn = buttons.find(b => b.textContent.includes('Atlas Unifilar'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Buscar GURI B
  const searchInput = await page.$('input[placeholder*="Buscar"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('GURI B');
    await new Promise(r => setTimeout(r, 600));
  }

  // Click en sugerencia GURI B
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const guriBtn = btns.find(b => b.textContent && b.textContent.includes('GURI B'));
    if (guriBtn) guriBtn.click();
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(IMG_DIR, 'siga_sen_guri_calibrado.png') });
  console.log('✓ Captura guardada: scratch/siga_sen_guri_calibrado.png');

  await browser.close();
}

captureGuri().catch(console.error);
