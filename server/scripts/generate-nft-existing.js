const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const SERVER_DIR  = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(SERVER_DIR, 'uploads');
const MARKERS_DIR = path.join(UPLOADS_DIR, 'markers');
const DATA_FILE   = path.join(SERVER_DIR, 'data', 'assets.json');

if (!fs.existsSync(MARKERS_DIR)) fs.mkdirSync(MARKERS_DIR, { recursive: true });

function generateNftForAsset(asset) {
  return new Promise((resolve) => {
    const qrFilename = asset.qrFilename || `${asset.id}_qr.png`;
    const qrPath = path.join(UPLOADS_DIR, qrFilename);

    if (!fs.existsSync(qrPath)) {
      console.log(`[Skip] QR file for asset ${asset.id} not found at ${qrPath}`);
      return resolve();
    }

    console.log(`[NFT Generator] Starting NFT generation for asset ${asset.id}...`);
    const cliScript = path.join(SERVER_DIR, 'node_modules', '@webarkit', 'nft-marker-creator-app', 'src', 'NFTMarkerCreator.js');

    const child = execFile(process.execPath, [
      cliScript,
      '-i', qrPath,
      '-o', MARKERS_DIR,
      '-NoConf'
    ], { cwd: SERVER_DIR }, (err, stdout, stderr) => {
      if (err) {
        console.error(`[NFT Generator Error ${asset.id}]`, err.message);
      }

      const inputStem = path.parse(qrFilename).name;
      const exts = ['.fset', '.fset3', '.iset'];

      exts.forEach(ext => {
        const srcFile = path.join(MARKERS_DIR, `${inputStem}${ext}`);
        const targetFile = path.join(MARKERS_DIR, `${asset.id}_nft${ext}`);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, targetFile);
          console.log(`  ✓ Generated: ${asset.id}_nft${ext}`);
        }
      });

      asset.nftMarkerBase = `/assets/markers/${asset.id}_nft`;
      resolve();
    });

    if (child.stdin) {
      child.stdin.write("Y\n");
      child.stdin.end();
    }
  });
}

async function run() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('No assets.json found.');
    return;
  }

  const assets = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`Processing ${assets.length} assets...`);

  for (const asset of assets) {
    await generateNftForAsset(asset);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(assets, null, 2), 'utf8');
  console.log('\n[Done] All assets processed and assets.json updated with nftMarkerBase!');
}

run();
