const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const tokenB = env.match(/GITHUB_TOKEN_INNOVACION=(.+)/)?.[1]?.trim();

function createRepoUser(token, repoName, desc) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ name: repoName, description: desc, private: true });
    const req = https.request({
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'NodeJS',
        'Authorization': 'token ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(500));
    req.write(payload);
    req.end();
  });
}

const APPS = [
  { dir: path.join(__dirname, '..', 'apps-refactorizadas', 'SIGA-SEN-REF'), repos: ['SIGA-SEN-REF', 'SIGA-SEN-V1.0-REF'], desc: 'SIGA-SEN CORPOELEC GGPD' },
  { dir: path.join(__dirname, '..', 'apps-refactorizadas', 'SIGAD-REF'), repos: ['SIGAD-REF', 'SIGAD-V1.0-REF'], desc: 'SIGAD CORPOELEC GGPD' }
];

async function main() {
  for (const app of APPS) {
    const tmp = path.join(process.env.TEMP, 'sync_b_' + path.basename(app.dir));
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });
    
    fs.cpSync(app.dir, tmp, {
      recursive: true,
      filter: (p) => !['node_modules', 'dist', '.env', '.env.local', '.git'].includes(path.basename(p))
    });

    execSync('git init -b main', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.name "CORPOELEC GGPD Automatizacion"', { cwd: tmp, stdio: 'ignore' });
    execSync('git config user.email "automatizacion.ggpd@corpoelec.gob.ve"', { cwd: tmp, stdio: 'ignore' });
    execSync('git add -A', { cwd: tmp, stdio: 'ignore' });
    execSync('git commit -m "feat: actualizacion de grado industrial SEN 2026 y modo claro institucional"', { cwd: tmp, stdio: 'ignore' });

    for (const r of app.repos) {
      console.log('Creando/verificando ' + r + '...');
      const code = await createRepoUser(tokenB, r, app.desc);
      console.log('Status creación (' + r + '):', code);
      const url = 'https://' + tokenB + '@github.com/distribucion-corpoelec-automatizacion/' + r + '.git';
      console.log('Pusheando a ' + r + '...');
      execSync('git push --force ' + url + ' main', { cwd: tmp, stdio: 'inherit' });
      console.log('✓ Push completado: distribucion-corpoelec-automatizacion/' + r);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log('🎉 ¡Todas las apps sincronizadas en distribucion-corpoelec-automatizacion!');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
