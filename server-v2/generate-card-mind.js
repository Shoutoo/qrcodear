const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

async function main() {
  console.log('Loading MindAR offline compiler...');
  const offlineCompilerPath = path.join(__dirname, 'node_modules', 'mind-ar', 'src', 'image-target', 'offline-compiler.js');
  const { OfflineCompiler } = await import('file:///' + offlineCompilerPath.replace(/\\/g, '/'));
  
  const rootDir = path.join(__dirname, '..');
  const imgPath = path.join(rootDir, 'server', 'uploads', 'kartu-background-jungle-A6-1500x2235.jpg');
  console.log('Reading image:', imgPath);
  const jpegData = fs.readFileSync(imgPath);
  
  // Decode JPEG into RGBA buffer
  const rawImageData = jpeg.decode(jpegData, { useTArray: true });
  console.log(`Decoded image: ${rawImageData.width}x${rawImageData.height} (${rawImageData.data.length} bytes)`);

  // Downscale image if too large for fast feature compilation (target width 600)
  let width = rawImageData.width;
  let height = rawImageData.height;
  let data = rawImageData.data;

  const targetWidth = 600;
  if (width > targetWidth) {
    const scale = targetWidth / width;
    const targetHeight = Math.round(height * scale);
    console.log(`Downscaling image to ${targetWidth}x${targetHeight} for target compilation...`);

    const resizedData = new Uint8Array(targetWidth * targetHeight * 4);
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const origX = Math.floor(x / scale);
        const origY = Math.floor(y / scale);
        const origIdx = (origY * width + origX) * 4;
        const resIdx = (y * targetWidth + x) * 4;

        resizedData[resIdx] = data[origIdx];
        resizedData[resIdx + 1] = data[origIdx + 1];
        resizedData[resIdx + 2] = data[origIdx + 2];
        resizedData[resIdx + 3] = data[origIdx + 3];
      }
    }
    width = targetWidth;
    height = targetHeight;
    data = resizedData;
  }

  const imgObj = { width, height, data };

  const compiler = new OfflineCompiler();
  compiler.createProcessCanvas = function(img) {
    return {
      getContext: () => ({
        drawImage: () => {},
        getImageData: () => ({ data: img.data, width: img.width, height: img.height })
      })
    };
  };

  console.log('Starting feature extraction compilation...');
  await compiler.compileImageTargets([imgObj], (progress) => {
    console.log(`Compilation progress: ${progress.toFixed(1)}%`);
  });

  console.log('Exporting .mind binary buffer...');
  const buffer = compiler.exportData();
  console.log(`Generated .mind buffer size: ${buffer.length} bytes`);

  const outDir = path.join(rootDir, 'server', 'uploads', 'markers');
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

  console.log('🎉 ALL PRESET AR MARKERS COMPILED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Compilation failed:', err);
  process.exit(1);
});
