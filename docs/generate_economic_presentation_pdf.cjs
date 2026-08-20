const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, 'NAC_2026_GGPD_PRESENTACION_INFORME_ECONOMICO_SERVICIOS_CLOUD_IA_2026.html');
  const pdfPath = path.resolve(__dirname, 'NAC_2026_GGPD_PRESENTACION_INFORME_ECONOMICO_SERVICIOS_CLOUD_IA_2026.pdf');

  console.log('📄 Launching Chrome for Economic Presentation PDF generation...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  console.log('📂 Loading HTML economic presentation...');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for rendering
  await new Promise(r => setTimeout(r, 2000));

  console.log('🖨️ Generating PDF...');
  await page.pdf({
    path: pdfPath,
    width: '1280px',
    height: '720px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    timeout: 0
  });

  console.log(`✅ Economic Presentation PDF generated successfully: ${pdfPath}`);
  await browser.close();
})();
