import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const distDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist';

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
console.log(JSON.stringify(files, null, 2));
