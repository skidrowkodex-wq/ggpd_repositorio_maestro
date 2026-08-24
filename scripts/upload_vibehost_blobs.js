import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

const distDir = '/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist';
const uploadData = JSON.parse(fs.readFileSync('/home/skidrowkodex/.gemini/antigravity-ide/brain/e299bbc3-6530-4966-be16-a1c9b01262ed/.system_generated/steps/93/output.txt', 'utf8'));

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
const shaToPath = {};
for (const f of files) {
  if (!shaToPath[f.sha256]) {
    shaToPath[f.sha256] = f.fullPath;
  }
}

async function uploadBlob(sha, uploadUrl, filePath) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const urlObj = new URL(uploadUrl);
    
    const req = https.request({
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileData.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[OK] Uploaded ${sha.slice(0, 12)} (${fileData.length} bytes) - Status ${res.statusCode}`);
          resolve(true);
        } else {
          console.error(`[FAIL] ${sha.slice(0, 12)} - Status ${res.statusCode}: ${body}`);
          reject(new Error(`Failed with ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[ERROR] ${sha.slice(0, 12)}:`, err);
      reject(err);
    });

    req.write(fileData);
    req.end();
  });
}

async function run() {
  for (const item of uploadData.data.uploads) {
    const filePath = shaToPath[item.sha];
    if (!filePath) {
      console.warn(`No file found for sha ${item.sha}`);
      continue;
    }
    console.log(`Uploading ${item.sha} from ${filePath}...`);
    await uploadBlob(item.sha, item.uploadUrl, filePath);
  }
  console.log('All uploads complete!');
}

run().catch(console.error);
