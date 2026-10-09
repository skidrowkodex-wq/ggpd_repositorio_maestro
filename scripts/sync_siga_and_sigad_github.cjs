const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps-refactorizadas');

function getEnvTokens() {
  let tokenPersonal = process.env.GITHUB_TOKEN_PERSONAL || '';
  let tokenInnovacion = process.env.GITHUB_TOKEN_INNOVACION || '';

  const envLocalPath = path.join(ROOT_DIR, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line.startsWith('GITHUB_TOKEN_PERSONAL=')) {
        tokenPersonal = line.split('=')[1].trim();
      } else if (line.startsWith('GITHUB_TOKEN_INNOVACION=')) {
        tokenInnovacion = line.split('=')[1].trim();
      }
    }
  }
  return { tokenPersonal, tokenInnovacion };
}

const { tokenPersonal: TOKEN_PERSONAL, tokenInnovacion: TOKEN_INNOVACION } = getEnvTokens();

function run(cmd, cwd = ROOT_DIR) {
  console.log(`> [${cwd}] ${cmd}`);
  return execSync(cmd, { cwd, stdio: 'inherit' });
}

function ensureRepoExists(token, owner, repoName, description) {
  return new Promise((resolve) => {
    // 1. Check if repo exists
    const checkReq = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repoName}`,
      method: 'GET',
      headers: {
        'User-Agent': 'NodeJS-CORPOELEC-Sync',
        'Authorization': `token ${token}`
      }
    }, (res) => {
      if (res.statusCode === 200) {
        console.log(`✓ Repositorio ya existe: ${owner}/${repoName}`);
        return resolve(true);
      }
      
      // If 404, create it
      console.log(`ℹ Creando repositorio ${owner}/${repoName}...`);
      const isOrg = owner === 'distribucion-corpoelec-automatizacion';
      const postPath = isOrg ? `/orgs/${owner}/repos` : '/user/repos';
      
      const payload = JSON.stringify({
        name: repoName,
        description: description,
        private: true,
        auto_init: false
      });

      const createReq = https.request({
        hostname: 'api.github.com',
        path: postPath,
        method: 'POST',
        headers: {
          'User-Agent': 'NodeJS-CORPOELEC-Sync',
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (createRes) => {
        let respData = '';
        createRes.on('data', chunk => respData += chunk);
        createRes.on('end', () => {
          if (createRes.statusCode === 201) {
            console.log(`✓ Creado exitosamente: ${owner}/${repoName}`);
            resolve(true);
          } else {
            console.log(`⚠ Respuesta creación (${createRes.statusCode}): ${respData.slice(0, 100)}`);
            resolve(false);
          }
        });
      });

      createReq.on('error', err => {
        console.error(`✗ Error al crear ${owner}/${repoName}:`, err.message);
        resolve(false);
      });
      createReq.write(payload);
      createReq.end();
    });

    checkReq.on('error', err => {
      console.error(`✗ Error verificando ${owner}/${repoName}:`, err.message);
      resolve(false);
    });
    checkReq.end();
  });
}

function copyDirRecursive(src, dest) {
  const ignored = ['node_modules', 'dist', '.env', '.env.local', 'bun.lock', 'python_runtime', '.git'];
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (sourcePath) => {
      const base = path.basename(sourcePath);
      return !ignored.includes(base);
    }
  });
}

const APPS_TO_SYNC = [
  {
    dirName: 'SIGA-SEN-REF',
    repoNames: ['SIGA-SEN-REF', 'SIGA-SEN-V1.0-REF'],
    desc: 'Sistema Integrado de Gestión de Activos del SEN (SIGA-SEN) - Generación, Transmisión y Subestaciones CND - CORPOELEC GGPD'
  },
  {
    dirName: 'SIGAD-REF',
    repoNames: ['SIGAD-REF', 'SIGAD-V1.0-REF'],
    desc: 'Sistema Integrado de Gestión de Activos de Distribución (SIGAD v1.0) - CORPOELEC GGPD'
  }
];

async function syncApp(app) {
  console.log(`\n============================================================`);
  console.log(`🔄 SINCRONIZANDO: ${app.dirName}`);
  console.log(`============================================================`);

  const appPath = path.join(APPS_DIR, app.dirName);
  if (!fs.existsSync(appPath)) {
    console.error(`Directorio no existe: ${appPath}`);
    return;
  }

  const tmpRepoPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'corpoelec_sync_' + app.dirName);
  try {
    fs.rmSync(tmpRepoPath, { recursive: true, force: true });
  } catch (e) {}
  fs.mkdirSync(tmpRepoPath, { recursive: true });

  console.log(`Copiando archivos limpios a directorio temporal de preparación...`);
  copyDirRecursive(appPath, tmpRepoPath);

  // Asegurar .gitignore
  const gitignorePath = path.join(tmpRepoPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, 'node_modules/\ndist/\n.env\n.env.local\n*.log\n');
  }

  // Inicializar git en directorio temporal
  run(`git init -b main`, tmpRepoPath);
  run(`git config user.name "CORPOELEC GGPD Automatizacion"`, tmpRepoPath);
  run(`git config user.email "automatizacion.ggpd@corpoelec.gob.ve"`, tmpRepoPath);
  run(`git add -A`, tmpRepoPath);
  run(`git commit -m "feat(${app.dirName.toLowerCase()}): actualizacion de grado industrial SEN 2026, contenedores tactiles, modo claro institucional y sincronizacion completa"`, tmpRepoPath);

  for (const repoName of app.repoNames) {
    // 1. Skidrowkodex-wq
    await ensureRepoExists(TOKEN_PERSONAL, 'skidrowkodex-wq', repoName, app.desc);
    const urlPersonal = `https://${TOKEN_PERSONAL}@github.com/skidrowkodex-wq/${repoName}.git`;
    console.log(`\nPushing ${app.dirName} -> skidrowkodex-wq/${repoName}...`);
    try {
      run(`git push --force "${urlPersonal}" main`, tmpRepoPath);
      console.log(`✓ Push exitoso a skidrowkodex-wq/${repoName}`);
    } catch (e) {
      console.error(`✗ Error pusheando a skidrowkodex-wq/${repoName}:`, e.message);
    }

    // 2. Distribucion-corpoelec-automatizacion
    await ensureRepoExists(TOKEN_INNOVACION, 'distribucion-corpoelec-automatizacion', repoName, app.desc);
    const urlInnovacion = `https://${TOKEN_INNOVACION}@github.com/distribucion-corpoelec-automatizacion/${repoName}.git`;
    console.log(`\nPushing ${app.dirName} -> distribucion-corpoelec-automatizacion/${repoName}...`);
    try {
      run(`git push --force "${urlInnovacion}" main`, tmpRepoPath);
      console.log(`✓ Push exitoso a distribucion-corpoelec-automatizacion/${repoName}`);
    } catch (e) {
      console.error(`✗ Error pusheando a distribucion-corpoelec-automatizacion/${repoName}:`, e.message);
    }
  }

  // Limpiar temporal
  try {
    fs.rmSync(tmpRepoPath, { recursive: true, force: true });
  } catch (e) {}
}

async function syncRootRepo() {
  console.log(`\n============================================================`);
  console.log(`🔄 SINCRONIZANDO REPOSITORIO MAESTRO (ggpd_repositorio_maestro)`);
  console.log(`============================================================`);

  run(`git add -A`, ROOT_DIR);
  try {
    run(`git commit -m "feat(maestro): resolucion integral de contenedores tactiles, margenes responsivos, modo claro institucional y sincronizacion de SIGA-SEN y SIGAD"`, ROOT_DIR);
  } catch (e) {
    console.log('No hay cambios pendientes por commitear en el maestro.');
  }

  console.log('\nPusheando Maestro a origin (skidrowkodex-wq/ggpd_repositorio_maestro)...');
  try {
    run(`git push origin main`, ROOT_DIR);
    console.log('✓ Maestro pusheado a origin.');
  } catch (e) {
    console.error('✗ Error pusheando a origin:', e.message);
  }

  console.log('\nPusheando Maestro a github-innovacion (distribucion-corpoelec-automatizacion/corpoelec-sigi-gestion-planificacion-distribucion)...');
  try {
    run(`git push github-innovacion main`, ROOT_DIR);
    console.log('✓ Maestro pusheado a github-innovacion.');
  } catch (e) {
    console.error('✗ Error pusheando a github-innovacion:', e.message);
  }
}

async function main() {
  console.log('🚀 Iniciando sincronización de SIGA-SEN y SIGAD con GitHub...');
  for (const app of APPS_TO_SYNC) {
    await syncApp(app);
  }
  await syncRootRepo();
  console.log('\n🎉 ¡Sincronización completada con éxito en ambas cuentas de GitHub!');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
