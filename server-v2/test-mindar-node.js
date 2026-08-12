const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

async function test() {
  console.log('Testing mind-ar import in Node.js...');
  const mindarPath = path.join(__dirname, 'node_modules', 'mind-ar', 'dist', 'mindar-image.prod.js');
  console.log('MindAR file exists:', fs.existsSync(mindarPath));
  
  // Try importing mindar-image.prod.js
  try {
    const mod = await import('file:///' + mindarPath.replace(/\\/g, '/'));
    console.log('Module keys:', Object.keys(mod));
  } catch (e) {
    console.error('Import error:', e);
  }
}

test();
