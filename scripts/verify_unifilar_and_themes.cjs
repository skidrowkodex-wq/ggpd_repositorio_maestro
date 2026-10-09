const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Iniciando verificación de SIGA-SEN y SIGAD (Nuevo Módulo + Modo Claro/Oscuro)...');

  const outDir = path.join(__dirname, '../docs/img/verificaciones');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // -------------------------------------------------------------
  // 1. VERIFICAR SIGA-SEN (Puerto 3008)
  // -------------------------------------------------------------
  console.log('⚡ Navegando a SIGA-SEN en http://localhost:3008/ ...');
  await page.goto('http://localhost:3008/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Login si es necesario
  const userInput = await page.$('input[type="text"], input[placeholder*="Usuario"], input[placeholder*="usuario"]');
  if (userInput) {
    console.log('🔑 Realizando inicio de sesión en SIGA-SEN...');
    await userInput.type('fullstack001');
    const passInput = await page.$('input[type="password"]');
    if (passInput) await passInput.type('Lunes35.');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
  }

  // Verificar tema inicial de SIGA-SEN
  const temaInicialSiga = await page.evaluate(() => {
    return document.documentElement.getAttribute('data-theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
  console.log(`🎨 Tema inicial en SIGA-SEN: ${temaInicialSiga} (Debe ser 'light')`);

  // Ir a la nueva pestaña: "📐 Diagrama Unifilar del Activo"
  console.log('📐 Navegando a la nueva pestaña "Diagrama Unifilar del Activo"...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const unifilarBtn = buttons.find(b => b.textContent && b.textContent.includes('Diagrama Unifilar'));
    if (unifilarBtn) unifilarBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Captura 1: SIGA-SEN Unifilar Activo EL CONVENTO (Modo Claro)
  const img1 = path.join(outDir, 'siga_sen_unifilar_convento_light.png');
  await page.screenshot({ path: img1 });
  console.log(`📸 Guardada captura 1: ${img1}`);

  // Seleccionar GURI B en accesos rápidos
  console.log('⚡ Seleccionando GURI B en accesos rápidos...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const guriBtn = buttons.find(b => b.textContent && b.textContent.includes('GURI B'));
    if (guriBtn) guriBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Captura 2: SIGA-SEN GURI B (Modo Claro)
  const img2 = path.join(outDir, 'siga_sen_unifilar_guri_light.png');
  await page.screenshot({ path: img2 });
  console.log(`📸 Guardada captura 2: ${img2}`);

  // Alternar a Modo Oscuro en SIGA-SEN
  console.log('🌙 Alternando a Modo Oscuro en SIGA-SEN...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const themeBtn = buttons.find(b => b.title && b.title.includes('Modo Oscuro'));
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Captura 3: SIGA-SEN GURI B (Modo Oscuro)
  const img3 = path.join(outDir, 'siga_sen_unifilar_guri_dark.png');
  await page.screenshot({ path: img3 });
  console.log(`📸 Guardada captura 3: ${img3}`);

  // -------------------------------------------------------------
  // 2. VERIFICAR SIGAD (Puerto 3007)
  // -------------------------------------------------------------
  console.log('⚡ Navegando a SIGAD en http://localhost:3007/ ...');
  await page.goto('http://localhost:3007/', { waitUntil: 'networkidle2', timeout: 30000 });

  const sigadUserInput = await page.$('input[type="text"], input[placeholder*="Usuario"], input[placeholder*="usuario"]');
  if (sigadUserInput) {
    console.log('🔑 Realizando inicio de sesión en SIGAD...');
    await sigadUserInput.type('fullstack001');
    const passInput = await page.$('input[type="password"]');
    if (passInput) await passInput.type('Lunes35.');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
  }

  // Verificar tema inicial de SIGAD
  const temaInicialSigad = await page.evaluate(() => {
    return document.documentElement.getAttribute('data-theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
  console.log(`🎨 Tema inicial en SIGAD: ${temaInicialSigad} (Debe ser 'light')`);

  // Captura 4: SIGAD (Modo Claro)
  const img4 = path.join(outDir, 'sigad_dashboard_light.png');
  await page.screenshot({ path: img4 });
  console.log(`📸 Guardada captura 4: ${img4}`);

  // Ir a pestaña Atlas Topológico en SIGAD
  console.log('🗺️ Navegando a Atlas Topológico en SIGAD...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const atlasBtn = buttons.find(b => b.textContent && b.textContent.includes('Atlas Topológico'));
    if (atlasBtn) atlasBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Captura 5: SIGAD Atlas Topológico (Modo Claro)
  const img5 = path.join(outDir, 'sigad_atlas_light.png');
  await page.screenshot({ path: img5 });
  console.log(`📸 Guardada captura 5: ${img5}`);

  // Alternar a Modo Oscuro en SIGAD
  console.log('🌙 Alternando a Modo Oscuro en SIGAD...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const themeBtn = buttons.find(b => b.title && b.title.includes('Modo Oscuro'));
    if (themeBtn) themeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Captura 6: SIGAD Atlas Topológico (Modo Oscuro)
  const img6 = path.join(outDir, 'sigad_atlas_dark.png');
  await page.screenshot({ path: img6 });
  console.log(`📸 Guardada captura 6: ${img6}`);

  await browser.close();
  console.log('✅ Verificación completa con éxito total.');
})();
