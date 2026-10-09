const puppeteer = require('puppeteer');
const path = require('path');

async function testClick() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Abriendo SIGA-SEN en http://localhost:3008 ...');
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });

  // Login
  await page.click('button[type="submit"]');
  await page.waitForSelector('header', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));

  // Ir a Atlas Unifilar CND
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('nav button'));
    const atlasBtn = buttons.find(b => b.textContent.includes('Atlas Unifilar'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot antes de click
  await page.screenshot({ path: path.join(__dirname, '..', 'scratch', 'atlas_before_click.png') });

  // Obtener estado del SVG viewBox
  const vbBefore = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    return svg ? svg.getAttribute('viewBox') : null;
  });
  console.log('ViewBox antes de click:', vbBefore);

  // Buscar un nodo para clickear, por ejemplo CARUACHI o GURI o cualquiera visible
  const clickResult = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('#nodos-subestaciones g'));
    if (nodes.length > 0) {
      // Tomar un nodo que esté visible o el primero
      const target = nodes.find(n => n.textContent && n.textContent.includes('CARUACHI')) || nodes[0];
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { clicked: true, text: target.textContent };
    }
    return { clicked: false };
  });
  console.log('Click en nodo:', clickResult);

  await new Promise(r => setTimeout(r, 1000));

  // Estado del SVG viewBox después de click
  const vbAfter = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const card = document.querySelector('.bg-slate-900\\/95');
    return {
      viewBox: svg ? svg.getAttribute('viewBox') : null,
      hasCard: !!card,
      cardText: card ? card.innerText : null
    };
  });
  console.log('Estado después de click:', vbAfter);

  await page.screenshot({ path: path.join(__dirname, '..', 'scratch', 'atlas_after_click.png') });

  await browser.close();
}

testClick().catch(console.error);
