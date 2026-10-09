const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Iniciando verificación visual de Modo Claro y Modo Oscuro...');

  const outDir = path.join(__dirname, '../docs/img/verificaciones');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. LOGIN SIGA-SEN (3008)
  console.log('📸 Capturando Login SIGA-SEN (Modo Claro)...');
  await page.goto('http://localhost:3008/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '01_siga_login_light.png') });

  // Alternar a modo oscuro en Login SIGA-SEN
  const toggleBtn = await page.$('button[title*="Modo Oscuro"]');
  if (toggleBtn) {
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, '02_siga_login_dark.png') });
    // Regresar a modo claro
    const lightBtn = await page.$('button[title*="Modo Claro"]');
    if (lightBtn) await lightBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Iniciar sesión en SIGA-SEN
  console.log('🔑 Iniciando sesión en SIGA-SEN...');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await new Promise(r => setTimeout(r, 1500));

  // Dashboard de SIGA-SEN en Modo Claro
  await page.screenshot({ path: path.join(outDir, '03_siga_dashboard_light.png') });

  // Ir a la pestaña Unifilar del Activo
  console.log('📐 Navegando a Diagrama Unifilar del Activo en SIGA-SEN...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const unifilar = btns.find(b => b.textContent && b.textContent.includes('Diagrama Unifilar'));
    if (unifilar) unifilar.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '04_siga_unifilar_activo_light.png') });

  // 2. SIGAD (3007)
  console.log('📸 Capturando Login SIGAD (Modo Claro)...');
  await page.goto('http://localhost:3007/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '05_sigad_login_light.png') });

  // Iniciar sesión en SIGAD
  const sigadSubmit = await page.$('button[type="submit"]');
  if (sigadSubmit) await sigadSubmit.click();
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '06_sigad_dashboard_light.png') });

  await browser.close();
  console.log('✅ Capturas generadas exitosamente en docs/img/verificaciones/');
})();
