const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3007', { waitUntil: 'networkidle0' });

  // 1. Screenshot Login SIGAD
  await page.screenshot({ path: 'scratch_sigad_login.png' });

  // 2. Login
  const btn = await page.$('button[type="submit"]');
  if (btn) await btn.click();
  await page.waitForSelector('header', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // 3. Screenshot Dashboard SIGAD
  await page.screenshot({ path: 'scratch_sigad_dashboard.png' });

  await browser.close();
  console.log('Saved scratch_sigad_login.png and scratch_sigad_dashboard.png');
})();
