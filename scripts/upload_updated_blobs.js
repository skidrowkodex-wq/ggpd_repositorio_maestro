import fs from 'fs';
import path from 'path';
import https from 'https';

const uploads = [
  {
    sha: "1ec1346e823c7893f60b6b1e2320b8ca542787709700f998895d1de45be5495b",
    uploadUrl: "https://api.vibehost.com/api/v1/blobs/1ec1346e823c7893f60b6b1e2320b8ca542787709700f998895d1de45be5495b?app=a53r8tvlvt9ihw09maca8a2g&exp=1787533173&sig=D31CiUjmm4PmR2Mdms297qkw4FlseZyHY-n1rl67pvk",
    filePath: "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist/assets/index-CS-QNvhQ.css"
  },
  {
    sha: "04bce77f7b5e7d0e47dbeb3faac4a4fdab0f01419b99829af4ae1ce694e257a8",
    uploadUrl: "https://api.vibehost.com/api/v1/blobs/04bce77f7b5e7d0e47dbeb3faac4a4fdab0f01419b99829af4ae1ce694e257a8?app=a53r8tvlvt9ihw09maca8a2g&exp=1787533173&sig=6VAabHgbj2TqSP1u93CStf3mVWwkYXzTjuUdvgLCx-g",
    filePath: "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist/assets/index-Cn1a1fvD.js"
  },
  {
    sha: "429c55bcccbbbdfa8029c8466fc30c47e40a3565110f85da19f17f4d9d98408f",
    uploadUrl: "https://api.vibehost.com/api/v1/blobs/429c55bcccbbbdfa8029c8466fc30c47e40a3565110f85da19f17f4d9d98408f?app=a53r8tvlvt9ihw09maca8a2g&exp=1787533173&sig=wxq_MLJiqJmYRUGTpNYE0zWFLnohj_Da-mXiFqZTGFA",
    filePath: "/home/skidrowkodex/Documentos/Repositorio_Maestro/apps-refactorizadas/SIGI-REF/dist/index.html"
  }
];

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
  for (const item of uploads) {
    console.log(`Uploading ${item.sha} from ${item.filePath}...`);
    await uploadBlob(item.sha, item.uploadUrl, item.filePath);
  }
  console.log('Uploads complete!');
}

run().catch(console.error);
