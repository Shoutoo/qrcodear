const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

async function compileQrCodeTargets() {
  console.log('🚀 Compiling MindAR targets directly from DUAL-PURPOSE QR CODES...');

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

  const presets = [
    { id: 'laut', filename: 'preset-laut.mind', url: 'https://qrcodear.onrender.com/ecosystem/view/laut', name: 'EKOSISTEM LAUT' },
    { id: 'sawah', filename: 'preset-sawah.mind', url: 'https://qrcodear.onrender.com/ecosystem/view/sawah', name: 'EKOSISTEM SAWAH' },
    { id: 'darat', filename: 'preset-darat.mind', url: 'https://qrcodear.onrender.com/ecosystem/view/darat', name: 'EKOSISTEM DARAT' },
    { id: 'hutan', filename: 'preset-hutan.mind', url: 'https://qrcodear.onrender.com/ecosystem/view/hutan', name: 'EKOSISTEM HUTAN' },
    { id: 'default', filename: 'default-card.mind', url: 'https://qrcodear.onrender.com/', name: 'AR EXPLORER' }
  ];

  const outDir = path.join(__dirname, '..', 'server', 'uploads', 'markers');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const compiledTargetImages = [];

  for (const preset of presets) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Generating Unique QR Code & Compiling AR Target for: ${preset.name} (${preset.filename})`);
    console.log(`Target URL: ${preset.url}`);

    // Generate raw QR Code pixel matrix (600x600 px)
    const qrWidth = 600;
    const qrPngBuffer = await qrcode.toBuffer(preset.url, {
      type: 'png',
      width: qrWidth,
      margin: 4,
      color: {
        dark: '#0f172a',  // Dark navy slate QR modules
        light: '#ffffff'  // Pure white background
      }
    });

    // Save PNG file for marker inspection if needed
    const pngPath = path.join(outDir, `qr-${preset.id}.png`);
    fs.writeFileSync(pngPath, qrPngBuffer);
    console.log(`✅ Saved QR Code PNG: ${pngPath}`);

    // Decode PNG buffer to raw RGBA pixels using pngjs or simple buffer parser
    // We create a high-contrast binary grayscale target image object directly for MindAR
    const qrCanvasBuffer = await qrcode.toBuffer(preset.url, {
      type: 'png',
      width: qrWidth,
      margin: 4,
      color: { dark: '#000000', light: '#ffffff' }
    });

    // Simple PNG parsing / fallback buffer generation for 600x600 QR code
    // Using qrcode module's raw matrix array to build exact pixel array
    const qrMatrix = qrcode.create(preset.url, { margin: 4 });
    const moduleCount = qrMatrix.modules.size;
    const cellSize = Math.floor(qrWidth / moduleCount);
    const actualWidth = moduleCount * cellSize;
    const actualHeight = actualWidth;

    const greyImageData = new Uint8Array(actualWidth * actualHeight);

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        const isDark = qrMatrix.modules.get(r, c);
        const colorVal = isDark ? 0 : 255; // 0 for black module, 255 for white space

        for (let cy = 0; cy < cellSize; cy++) {
          for (let cx = 0; cx < cellSize; cx++) {
            const py = r * cellSize + cy;
            const px = c * cellSize + cx;
            greyImageData[py * actualWidth + px] = colorVal;
          }
        }
      }
    }

    const targetImageObj = { data: greyImageData, height: actualHeight, width: actualWidth };
    compiledTargetImages.push(targetImageObj);

    console.log(`Extracting FREAK features from QR Code pattern (${actualWidth}x${actualHeight} px)...`);
    const compiler = new CpuCompiler();
    await compiler.compileImageTargets([targetImageObj], (progress) => {
      if (progress % 25 === 0 || progress === 100) console.log(`   Progress ${preset.filename}: ${progress.toFixed(0)}%`);
    });
    const buffer = compiler.exportData();
    fs.writeFileSync(path.join(outDir, preset.filename), Buffer.from(buffer));
    console.log(`✅ SAVED SINGLE TARGET: ${preset.filename} (${buffer.length} bytes)!`);
  }

  // Compile Multi-Target Buffer for Wrong QR Code Detection (all-presets.mind)
  console.log(`\n--------------------------------------------------`);
  console.log(`Compiling Multi-QR-Target Buffer (all-presets.mind)...`);
  const multiCompiler = new CpuCompiler();
  await multiCompiler.compileImageTargets(compiledTargetImages.slice(0, 4), (progress) => {
    if (progress % 20 === 0 || progress === 100) console.log(`   Multi-QR Progress: ${progress.toFixed(0)}%`);
  });
  const multiBuffer = multiCompiler.exportData();
  fs.writeFileSync(path.join(outDir, 'all-presets.mind'), Buffer.from(multiBuffer));
  console.log(`✅ SAVED MULTI-TARGET: all-presets.mind (${multiBuffer.length} bytes)!`);

  console.log('\n🎉 ALL QR CODE AR TARGET MARKERS COMPILED SUCCESSFULLY!');
}

compileQrCodeTargets().catch(err => {
  console.error('Compilation failed:', err);
  process.exit(1);
});
