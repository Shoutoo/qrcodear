const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

async function compile() {
  console.log('Loading MindAR CPU tracker module...');

  const { CompilerBase } = await import('mind-ar/src/image-target/compiler-base.js');
  const { buildTrackingImageList } = await import('mind-ar/src/image-target/image-list.js');
  const { extractTrackingFeatures } = await import('mind-ar/src/image-target/tracker/extract-utils.js');

  class CpuCompiler extends CompilerBase {
    createProcessCanvas(img) {
      return {
        getContext: () => ({
          drawImage: () => {},
          getImageData: () => ({ data: img.data, width: img.width, height: img.height })
        })
      };
    }

    compileTrack({ progressCallback, targetImages, basePercent }) {
      return new Promise((resolve) => {
        const list = [];
        for (let i = 0; i < targetImages.length; i++) {
          const targetImage = targetImages[i];
          const imageList = buildTrackingImageList(targetImage);
          const trackingData = extractTrackingFeatures(imageList, (index) => {
            if (progressCallback) progressCallback(basePercent + (index / imageList.length) * 100);
          });
          list.push(trackingData);
        }
        resolve(list);
      });
    }
  }

  const imgPath = path.join(__dirname, '..', 'server', 'uploads', 'kartu-background-jungle-A6-1500x2235.jpg');
  console.log('Reading card background image:', imgPath);
  const jpegData = fs.readFileSync(imgPath);
  const rawImg = jpeg.decode(jpegData, { useTArray: true });
  console.log(`Original image size: ${rawImg.width}x${rawImg.height}`);

  // Downscale image to target width 800 for optimal feature point density across screens and print
  let width = rawImg.width;
  let height = rawImg.height;
  let data = rawImg.data;
  const targetW = 800;

  if (width > targetW) {
    const scale = targetW / width;
    const targetH = Math.round(height * scale);
    console.log(`Resizing image to ${targetW}x${targetH} for multi-scale feature extraction...`);
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

  // Create contrast-enhanced grayscale target image object for monitor screen & print robustness
  const greyImageData = new Uint8Array(width * height);
  for (let i = 0; i < greyImageData.length; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    let gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    // Apply contrast stretch (min 20, max 235) to boost edge contrast on LED screens
    gray = Math.max(0, Math.min(255, Math.floor((gray - 20) * (255 / 215))));
    greyImageData[i] = gray;
  }

  const targetImageObj = { data: greyImageData, height, width };

  console.log('Starting MindAR CPU feature extraction compilation...');
  const compiler = new CpuCompiler();

  await compiler.compileImageTargets([targetImageObj], (progress) => {
    console.log(`Progress: ${progress.toFixed(1)}%`);
  });

  console.log('Encoding .mind target binary buffer...');
  const buffer = compiler.exportData();
  console.log(`✅ MIND Buffer generated: ${buffer.length} bytes!`);

  const outDir = path.join(__dirname, '..', 'server', 'uploads', 'markers');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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

  console.log('🎉 ALL PRESET MARKERS COMPILED FOR SCREEN & PRINT!');
}

compile().catch(err => {
  console.error('Compilation error:', err);
  process.exit(1);
});
