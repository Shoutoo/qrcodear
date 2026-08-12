const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

async function compileFullCardTargets() {
  console.log('🚀 Compiling MindAR targets from FULL FINISHED CARDS (Image 2)...');

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
  console.log('Reading background image:', imgPath);
  const jpegData = fs.readFileSync(imgPath);
  const rawImg = jpeg.decode(jpegData, { useTArray: true });
  console.log(`Base image dimension: ${rawImg.width}x${rawImg.height}`);

  const targetW = 800;
  const targetH = Math.round(rawImg.height * (targetW / rawImg.width));
  const scale = targetW / rawImg.width;

  const baseBuffer = new Uint8Array(targetW * targetH * 4);
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const ox = Math.floor(x / scale);
      const oy = Math.floor(y / scale);
      const oIdx = (oy * rawImg.width + ox) * 4;
      const rIdx = (y * targetW + x) * 4;
      baseBuffer[rIdx] = rawImg.data[oIdx];
      baseBuffer[rIdx + 1] = rawImg.data[oIdx + 1];
      baseBuffer[rIdx + 2] = rawImg.data[oIdx + 2];
      baseBuffer[rIdx + 3] = 255;
    }
  }

  const presets = [
    { id: 'laut', filename: 'preset-laut.mind', title: 'EKOSISTEM LAUT' },
    { id: 'sawah', filename: 'preset-sawah.mind', title: 'EKOSISTEM SAWAH' },
    { id: 'darat', filename: 'preset-darat.mind', title: 'EKOSISTEM DARAT' },
    { id: 'hutan', filename: 'preset-hutan.mind', title: 'EKOSISTEM HUTAN' },
    { id: 'default', filename: 'default-card.mind', title: 'KARTU AR EXPLORER' }
  ];

  const outDir = path.join(__dirname, '..', 'server', 'uploads', 'markers');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const compiledTargetImages = [];

  for (const preset of presets) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing Full Card Composite for: ${preset.title} (${preset.filename})`);

    const cardBuffer = new Uint8Array(baseBuffer);

    // 1. Outer green rounded border frame
    for (let y = 0; y < targetH; y++) {
      for (let x = 0; x < targetW; x++) {
        if (x < 18 || x > targetW - 18 || y < 18 || y > targetH - 18) {
          const idx = (y * targetW + x) * 4;
          cardBuffer[idx] = 27;     // R #1b
          cardBuffer[idx + 1] = 67; // G #43
          cardBuffer[idx + 2] = 50; // B #32
        }
      }
    }

    // 2. Top Banner Overlay for "SCAN HERE" text region
    for (let y = 60; y < 150; y++) {
      for (let x = 120; x < targetW - 120; x++) {
        const idx = (y * targetW + x) * 4;
        if (y > 80 && y < 130 && Math.abs((x % 80) - 40) < 25) {
          cardBuffer[idx] = 251;     // Yellow #fbbf24
          cardBuffer[idx + 1] = 191;
          cardBuffer[idx + 2] = 36;
        }
      }
    }

    // 3. Title Pill Badge (Y: 160 - 205)
    for (let y = 160; y < 205; y++) {
      for (let x = 240; x < targetW - 240; x++) {
        const idx = (y * targetW + x) * 4;
        cardBuffer[idx] = 30;     // Dark Slate #1e293b
        cardBuffer[idx + 1] = 41;
        cardBuffer[idx + 2] = 59;
      }
    }

    // 4. Bottom Dark Overlay Card with White QR Code Box
    for (let y = 790; y < 1130; y++) {
      for (let x = 50; x < targetW - 50; x++) {
        const idx = (y * targetW + x) * 4;

        if (x >= 470 && x <= 720 && y >= 815 && y <= 1105) {
          const isQRPattern = (x + y) % 18 < 9;
          if (isQRPattern && (x > 490 && x < 700 && y > 835 && y < 1085)) {
            cardBuffer[idx] = 15;
            cardBuffer[idx + 1] = 23;
            cardBuffer[idx + 2] = 42;
          } else {
            cardBuffer[idx] = 255;
            cardBuffer[idx + 1] = 255;
            cardBuffer[idx + 2] = 255;
          }
        } else {
          cardBuffer[idx] = 15;
          cardBuffer[idx + 1] = 23;
          cardBuffer[idx + 2] = 42;
        }
      }
    }

    const greyImageData = new Uint8Array(targetW * targetH);
    for (let i = 0; i < greyImageData.length; i++) {
      const offset = i * 4;
      const r = cardBuffer[offset];
      const g = cardBuffer[offset + 1];
      const b = cardBuffer[offset + 2];
      let gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
      gray = Math.max(0, Math.min(255, Math.floor((gray - 20) * (255 / 215))));
      greyImageData[i] = gray;
    }

    const targetImageObj = { data: greyImageData, height: targetH, width: targetW };
    compiledTargetImages.push(targetImageObj);

    // Save individual preset file
    console.log(`Extracting FREAK features for ${preset.filename}...`);
    const compiler = new CpuCompiler();
    await compiler.compileImageTargets([targetImageObj], (progress) => {
      if (progress % 25 === 0 || progress === 100) console.log(`   Progress ${preset.filename}: ${progress.toFixed(0)}%`);
    });
    const buffer = compiler.exportData();
    fs.writeFileSync(path.join(outDir, preset.filename), Buffer.from(buffer));
    console.log(`✅ SAVED: ${preset.filename} (${buffer.length} bytes)!`);
  }

  // Compile All-in-One Multi-Target Marker (all-presets.mind)
  console.log(`\n--------------------------------------------------`);
  console.log(`Compiling Multi-Target Buffer for Wrong Card Detection (all-presets.mind)...`);
  const multiCompiler = new CpuCompiler();
  await multiCompiler.compileImageTargets(compiledTargetImages.slice(0, 4), (progress) => {
    if (progress % 20 === 0 || progress === 100) console.log(`   Multi-Target Progress: ${progress.toFixed(0)}%`);
  });
  const multiBuffer = multiCompiler.exportData();
  fs.writeFileSync(path.join(outDir, 'all-presets.mind'), Buffer.from(multiBuffer));
  console.log(`✅ SAVED: all-presets.mind (${multiBuffer.length} bytes)!`);

  console.log('\n🎉 ALL SINGLE & MULTI-TARGET MARKERS COMPILED SUCCESSFULLY!');
}

compileFullCardTargets().catch(err => {
  console.error('Compilation failed:', err);
  process.exit(1);
});
