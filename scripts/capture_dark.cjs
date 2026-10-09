const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3008', { waitUntil: 'networkidle0' });

  // Toggle Dark Mode
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Modo Oscuro'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scratch_dark_login.png' });

  // Login
  const btn = await page.$('button[type="submit"]');
  if (btn) await btn.click();
  await page.waitForSelector('header');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch_dark_dashboard.png' });

  await browser.close();
  console.log('Saved scratch_dark_login.png and scratch_dark_dashboard.png');
})();
