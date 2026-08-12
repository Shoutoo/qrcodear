import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import { CompilerBase } from './node_modules/mind-ar/src/image-target/compiler-base.js';
import { buildTrackingImageList } from './node_modules/mind-ar/src/image-target/image-list.js';
import { extractTrackingFeatures } from './node_modules/mind-ar/src/image-target/tracker/extract-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NodeCompiler extends CompilerBase {
  compileTrack({ progressCallback, targetImages, basePercent }) {
    return new Promise((resolve) => {
      const list = [];
      for (let i = 0; i < targetImages.length; i++) {
        const targetImage = targetImages[i];
        const imageList = buildTrackingImageList(targetImage);
        const trackingData = extractTrackingFeatures(imageList, (index) => {
          if (progressCallback) progressCallback(basePercent + index);
        });
        list.push(trackingData);
      }
      resolve(list);
    });
  }
}

async function run() {
  console.log('Reading print card background image...');
  const imgPath = path.join(__dirname, 'server', 'uploads', 'kartu-background-jungle-A6-1500x2235.jpg');
  const jpegData = fs.readFileSync(imgPath);
  const rawImg = jpeg.decode(jpegData, { useTArray: true });
  console.log(`Original image size: ${rawImg.width}x${rawImg.height}`);

  // Downscale image to max width 600 for optimal feature point density
  let width = rawImg.width;
  let height = rawImg.height;
  let data = rawImg.data;
  const targetW = 600;

  if (width > targetW) {
    const scale = targetW / width;
    const targetH = Math.round(height * scale);
    console.log(`Resizing image to ${targetW}x${targetH} for feature extraction...`);
    const resized = new Uint8Array(targetW * targetH * 4);
    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        const ox = Math.floor(x / scale);
        const oy = Math.floor(y / scale);
        const oIdx = (oy * width + ox) * 4;
        const rIdx = (y * targetW + x) * 4;
        resized[rIdx] = data[oIdx];
        resized[rIdx + 1] = data[oIdx + 1];
        resized[rIdx + 2] = data[oIdx + 2];
        resized[rIdx + 3] = data[oIdx + 3];
      }
    }
    width = targetW;
    height = targetH;
    data = resized;
  }

  // Create grayscale target image object
  const greyImageData = new Uint8Array(width * height);
  for (let i = 0; i < greyImageData.length; i++) {
    const offset = i * 4;
    greyImageData[i] = Math.floor((data[offset] + data[offset + 1] + data[offset + 2]) / 3);
  }

  const targetImageObj = { data: greyImageData, height, width };

  console.log('Starting MindAR feature extraction compilation...');
  const compiler = new NodeCompiler();

  await compiler.compileImageTargets([targetImageObj], (progress) => {
    console.log(`Progress: ${progress.toFixed(1)}%`);
  });

  console.log('Encoding .mind target binary buffer...');
  const buffer = compiler.exportData();
  console.log(`✅ MIND Buffer generated: ${buffer.length} bytes!`);

  const outDir = path.join(__dirname, 'server', 'uploads', 'markers');
  const targetFiles = [
    'preset-darat.mind',
    'preset-hutan.mind',
    'preset-laut.mind',
    'preset-sawah.mind',
    'default-card.mind'
  ];

  targetFiles.forEach(fileName => {
    const outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, Buffer.from(buffer));
    console.log(`✅ Saved ${fileName} (${buffer.length} bytes)`);
  });

  console.log('🎉 ALL PRESET MARKERS COMPILED & UPDATED SUCCESSFULLY!');
}

run().catch(err => console.error('Error:', err));
