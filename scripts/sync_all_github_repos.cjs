const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps-refactorizadas');

// Cargar credenciales desde .env.local (ignorado en git para cumplimiento ISO 27001)
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

const APPS = [
  {
    dirName: 'SIGI-REF',
    repoNames: ['SIGI-REF'],
    desc: 'Sistema Integral de Gestión de Información (SIGI) Refactorizado - CORPOELEC GGPD'
  },
  {
    dirName: 'SCTIS-REF',
    repoNames: ['SCTIS-V2.0-REF'],
    desc: 'Sistema de Control de Tiras de Interrupción (SCTIS v2.0) Refactorizado - CORPOELEC GGPD'
  },
  {
    dirName: 'SCMTP-REF',
    repoNames: ['SCMTP-V2.0-REF'],
    desc: 'Seguimiento y Control de Minutas y Tareas de Planificación (SCMTP v2.0) Refactorizado - CORPOELEC GGPD'
  },
  {
    dirName: 'SCPPE-REF',
    repoNames: ['SCPPE-V3.0-REF'],
    desc: 'Seguimiento y Control de Planes, Proyectos Especiales y Viáticos (SCPPE v3.0) Refactorizado - CORPOELEC GGPD'
  },
  {
    dirName: 'SCEIN-REF',
    repoNames: ['SCEIN-V3.0-REF'],
    desc: 'Seguimiento y Control de Equipos Indisponibles (SCEIN v3.0) Refactorizado - CORPOELEC GGPD'
  },
  {
    dirName: 'SCGCC-REF',
    repoNames: ['SCGCC-V1.0-REF', 'SCGCC-REF'],
    desc: 'Seguimiento y Control de Gestión de Correspondencia Corporativa (SCGCC V1.0) - CORPOELEC GGPD'
  }
];

function run(cmd, cwd = ROOT_DIR) {
  console.log(`> [${cwd}] ${cmd}`);
  return execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyDirRecursive(src, dest) {
  const ignored = ['node_modules', 'dist', '.env', '.env.local', 'bun.lock', 'python_runtime', '.git'];
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (sourcePath) => {
      const base = path.basename(sourcePath);
      if (ignored.includes(base)) {
        return false;
      }
      return true;
    }
  });
}

async function syncApp(app) {
  console.log(`\n========================================`);
  console.log(`🔄 Sincronizando App: ${app.dirName}`);
  console.log(`========================================`);

  const appPath = path.join(APPS_DIR, app.dirName);
  if (!fs.existsSync(appPath)) {
    console.error(`Directory ${appPath} does not exist. Skipping.`);
    return;
  }

  const tmpRepoPath = path.join('/tmp/corpoelec_gh_sync', app.dirName);
  fs.rmSync(tmpRepoPath, { recursive: true, force: true });
  fs.mkdirSync(tmpRepoPath, { recursive: true });

  // Copiar archivos recursivamente
  copyDirRecursive(appPath, tmpRepoPath);

  // Asegurar .gitignore
  const gitignorePath = path.join(tmpRepoPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, 'node_modules/\ndist/\n.env\n.env.local\n*.log\n');
  }

  // Inicializar git
  run(`git init -b main`, tmpRepoPath);
  run(`git config user.name "CORPOELEC GGPD Automatizacion"`, tmpRepoPath);
  run(`git config user.email "automatizacion.ggpd@corpoelec.gob.ve"`, tmpRepoPath);
  run(`git add -A`, tmpRepoPath);
  run(`git commit -m "feat(${app.dirName.toLowerCase()}): actualizacion de grado industrial SEN 2026, autenticacion limpia y sincronizacion institucional"`, tmpRepoPath);

  // Pushear a ambas cuentas para cada nombre de repositorio
  for (const repoName of app.repoNames) {
    const urlPersonal = `https://${TOKEN_PERSONAL}@github.com/skidrowkodex-wq/${repoName}.git`;
    const urlInnovacion = `https://${TOKEN_INNOVACION}@github.com/distribucion-corpoelec-automatizacion/${repoName}.git`;

    console.log(`\nPushing ${app.dirName} -> skidrowkodex-wq/${repoName}...`);
    try {
      run(`git push --force "${urlPersonal}" main`, tmpRepoPath);
      console.log(`✓ Push exitoso a skidrowkodex-wq/${repoName}`);
    } catch (e) {
      console.error(`✗ Error al pushear a skidrowkodex-wq/${repoName}:`, e.message);
    }

    console.log(`\nPushing ${app.dirName} -> distribucion-corpoelec-automatizacion/${repoName}...`);
    try {
      run(`git push --force "${urlInnovacion}" main`, tmpRepoPath);
      console.log(`✓ Push exitoso a distribucion-corpoelec-automatizacion/${repoName}`);
    } catch (e) {
      console.error(`✗ Error al pushear a distribucion-corpoelec-automatizacion/${repoName}:`, e.message);
    }
  }
}

async function syncRootRepo() {
  console.log(`\n========================================`);
  console.log(`🔄 Sincronizando Repositorio Maestro Principal`);
  console.log(`========================================`);

  run(`git add -A`, ROOT_DIR);
  try {
    run(`git commit -m "feat(maestro): integracion formal de SCGCC V1.0, homologacion de grado industrial SEN en 6 apps y cierre de jornada 2026-08-24"`, ROOT_DIR);
  } catch (e) {
    console.log('No hay cambios pendientes por commitear en el maestro.');
  }

  console.log('\nPusheando Maestro a origin (skidrowkodex-wq/ggpd_repositorio_maestro)...');
  run(`git push origin main`, ROOT_DIR);

  console.log('\nPusheando Maestro a github-innovacion (distribucion-corpoelec-automatizacion/corpoelec-sigi-gestion-planificacion-distribucion)...');
  run(`git push github-innovacion main`, ROOT_DIR);
}

async function main() {
  try {
    for (const app of APPS) {
      await syncApp(app);
    }
    await syncRootRepo();
    console.log(`\n🎉 ¡Todos los repositorios de GitHub han sido actualizados con éxito total!`);
  } catch (err) {
    console.error('Fatal error in sync:', err);
  }
}

main();
