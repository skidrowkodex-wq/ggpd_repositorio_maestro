import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

const distDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist';
const appId = 'a53r8tvlvt9ihw09maca8a2g';

function getFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(base, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, relPath));
    } else {
      const content = fs.readFileSync(fullPath);
      const sha256 = crypto.createHash('sha256').update(content).digest('hex');
      results.push({
        path: relPath.replace(/\\/g, '/'),
        fullPath,
        sha256,
        size: stat.size,
        mode: 0o644
      });
    }
  }
  return results;
}

const files = getFiles(distDir);
const manifest = files.map(f => ({
  path: f.path,
  sha256: f.sha256,
  size: f.size
}));

const shas = [...new Set(files.map(f => f.sha256))];

fs.writeFileSync('/home/skidrowkodex/Documentos/Repositorio_Maestro/scripts/vibehost_manifest_ready.json', JSON.stringify({
  appId,
  shas,
  manifest,
  files
}, null, 2));

console.log(`Prepared manifest with ${files.length} files and ${shas.length} unique hashes.`);
