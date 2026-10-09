const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });
  
  // Login
  const btn = await page.$('button[type="submit"]');
  if (btn) await btn.click();
  await page.waitForSelector('header');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch_nodos_full.png' });

  // Ir a Balance SEN
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    const b = btns.find(x => x.textContent.includes('Balance SEN'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch_balance_full.png' });

  await browser.close();
  console.log('Saved scratch_nodos_full.png and scratch_balance_full.png');
})();
