const express = require('express');
const multer = require('multer');
const qrcode = require('qrcode');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.set('trust proxy', true); // Penting agar HTTPS dari tunnel terbaca dengan benar
app.use(cors());

// ─── Proxy API requests to NestJS server (port 3002) ───────────────────────────
const http = require('http');
app.use(['/api/auth', '/api/quizzes', '/api/lessons', '/api/analytics', '/api/unity', '/print-preset'], (req, res, next) => {


  const options = {
    hostname: 'localhost',
    port: 3002,
    path: req.originalUrl,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:3002' }
  };

  const proxyReq = http.request(options, proxyRes => {
    res.status(proxyRes.statusCode);
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    next();
  });

  req.pipe(proxyReq);
});

app.use(express.json());
app.use(compression());




// ─── Directories ───────────────────────────────────────────────────────────────
const ASSETS_DIR  = path.join(__dirname, 'uploads');
const MARKERS_DIR = path.join(ASSETS_DIR, 'markers');
const MEDIA_DIR   = path.join(ASSETS_DIR, 'media');
const DATA_FILE   = path.join(__dirname, 'data', 'assets.json');
const MEDIA_FILE  = path.join(__dirname, 'data', 'media.json');
const VIEWS_DIR   = path.join(__dirname, 'views');

[ASSETS_DIR, MARKERS_DIR, MEDIA_DIR, path.join(__dirname, 'data')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve uploads static assets & MindAR marker fallback
app.use('/assets', express.static(ASSETS_DIR));

app.get('/assets/markers/:filename', (req, res) => {
  const { filename } = req.params;
  const targetPath = path.join(MARKERS_DIR, filename);

  if (fs.existsSync(targetPath)) {
    return res.sendFile(targetPath);
  }

  if (filename.endsWith('.mind')) {
    const presetName = filename.replace(/\.mind$/, '');
    const presetPath = path.join(MARKERS_DIR, `preset-${presetName.replace(/^preset-/, '')}.mind`);
    if (fs.existsSync(presetPath)) {
      return res.sendFile(presetPath);
    }
    const defaultPath = path.join(MARKERS_DIR, 'default-card.mind');
    if (fs.existsSync(defaultPath)) {
      return res.sendFile(defaultPath);
    }
  }

  res.status(404).send('Marker asset not found');
});

// Endpoint to save compiled .mind target binary files
app.post('/api/save-marker-mind', express.raw({ type: 'application/octet-stream', limit: '50mb' }), (req, res) => {
  if (!req.body || !req.body.length) return res.status(400).json({ error: 'Empty buffer' });
  const target = req.query.target;
  if (target && target.endsWith('.mind')) {
    fs.writeFileSync(path.join(MARKERS_DIR, target), req.body);
    console.log(`✅ Compiled .mind target saved to ${target} (${req.body.length} bytes)!`);
  } else {
    const targetFiles = ['preset-darat.mind', 'preset-hutan.mind', 'preset-laut.mind', 'preset-sawah.mind', 'default-card.mind'];
    targetFiles.forEach(name => {
      fs.writeFileSync(path.join(MARKERS_DIR, name), req.body);
    });
    console.log(`✅ Compiled .mind target saved to all marker files (${req.body.length} bytes)!`);
  }
  res.json({ success: true, bytes: req.body.length });
});

app.get('/compiler', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'compiler.html'));
});

// AR Debug diagnostics page
app.get('/ar-debug', (req, res) => {
  res.sendFile(path.join(VIEWS_DIR, 'ar-debug.html'));
});

// ─── Data helpers ──────────────────────────────────────────────────────────────
function loadAssets() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function saveAssets(assets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(assets, null, 2), 'utf8');
}

const SCENES_FILE = path.join(__dirname, 'data', 'scenes.json');

function loadScenes() {
  if (!fs.existsSync(SCENES_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SCENES_FILE, 'utf8')); }
  catch { return []; }
}
function saveScenes(scenes) {
  fs.writeFileSync(SCENES_FILE, JSON.stringify(scenes, null, 2), 'utf8');
}

function loadMedia() {
  if (!fs.existsSync(MEDIA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf8')); }
  catch { return []; }
}
function saveMedia(media) {
  fs.writeFileSync(MEDIA_FILE, JSON.stringify(media, null, 2), 'utf8');
}

const ECOSYSTEM_PRESETS_FILE = path.join(__dirname, 'data', 'ecosystem-presets.json');

function loadEcosystemPresets() {
  if (!fs.existsSync(ECOSYSTEM_PRESETS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(ECOSYSTEM_PRESETS_FILE, 'utf8')); }
  catch { return []; }
}
function saveEcosystemPresets(presets) {
  fs.writeFileSync(ECOSYSTEM_PRESETS_FILE, JSON.stringify(presets, null, 2), 'utf8');
}

const ECOSYSTEM_MODEL_LIBRARY_FILE = path.join(__dirname, 'data', 'ecosystem-model-library.json');

// ─── THREE.js & Server Auto-Bake Engine ─────────────────────────────────────────
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
const { Blob } = require('buffer');
global.Blob = Blob;
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload)    this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
};

const { buildUlarToy } = require('./build_ular_f22a.js');
const { buildBelalangToy, buildUlatToy, buildUdangToy, buildBakteriToy, buildJamurToy } = require('./build_batch1_f22b.js');
const { buildKatakToy, buildRumputToy, buildPadiToy, buildPohonToy, buildAlgaToy } = require('./build_batch2_f22b.js');
const { buildIkanKecilToy, buildIkanBesarToy, buildHiuToy, buildElangToy, buildBurungToy } = require('./build_batch3_f22b.js');

const speciesMap = {
  'darat/rumput.glb': buildRumputToy,
  'darat/belalang.glb': buildBelalangToy,
  'sawah/belalang.glb': buildBelalangToy,
  'darat/katak.glb': buildKatakToy,
  'sawah/katak.glb': buildKatakToy,
  'darat/ular.glb': buildUlarToy,
  'hutan/ular.glb': buildUlarToy,
  'sawah/ular.glb': buildUlarToy,
  'darat/elang.glb': buildElangToy,
  'hutan/elang.glb': buildElangToy,
  'sawah/elang.glb': buildElangToy,
  'darat/jamur.glb': buildJamurToy,
  'hutan/jamur.glb': buildJamurToy,
  'sawah/jamur.glb': buildJamurToy,
  'hutan/pohon.glb': buildPohonToy,
  'hutan/ulat.glb': buildUlatToy,
  'hutan/burung.glb': buildBurungToy,
  'laut/alga.glb': buildAlgaToy,
  'laut/udang.glb': buildUdangToy,
  'laut/ikan_kecil.glb': buildIkanKecilToy,
  'laut/ikan_besar.glb': buildIkanBesarToy,
  'laut/hiu.glb': buildHiuToy,
  'laut/bakteri.glb': buildBakteriToy,
  'sawah/padi.glb': buildPadiToy,
};

async function ensureEcosystemGlbExists(id, forceRebake = false) {
  const glbFilename = id.endsWith('.glb') ? id : `${id}.glb`;
  const glbPath = path.join(ASSETS_DIR, glbFilename);

  if (!forceRebake && fs.existsSync(glbPath)) {
    const stat = fs.statSync(glbPath);
    if (stat.size > 10000) return glbFilename;
  }

  console.log(`[Auto-Bake Engine] Real-time baking missing GLB for ecosystem ID "${id}"...`);
  const publishedList = loadEcosystemPublished();
  const pubItem = publishedList.find(p => p.id === id || p.filename === glbFilename);

  const presets = loadEcosystemPresets();
  let targetPreset = null;

  if (pubItem && pubItem.presetId) {
    targetPreset = presets.find(p => p.id === pubItem.presetId);
  }
  if (!targetPreset) {
    targetPreset = presets.find(p => p.id === id || p.id === `preset-${id}` || (p.name || '').toLowerCase().includes(id.toLowerCase())) || presets[0];
  }

  if (!targetPreset) return null;

  const sceneGroup = new THREE.Group();
  sceneGroup.name = 'ecosystem_preset_group';

  const slots = targetPreset.slots || [];
  const numSlots = slots.length || 6;
  const radius = 2.2;

  // ─── 3D Ecosystem Food Chain Connecting Energy Arcs & Arrowheads ───────────
  // Add 3D Connecting Energy Arcs & Arrowheads between slots
  for (let i = 0; i < numSlots; i++) {
    const nextIdx = (i + 1) % numSlots;
    const a1 = (i * 2 * Math.PI) / numSlots;
    const a2 = (nextIdx * 2 * Math.PI) / numSlots;

    // Start, Mid, End 3D Points along arc (lowered Y to not block animals)
    const p1 = new THREE.Vector3(radius * Math.cos(a1), 0.15, radius * Math.sin(a1));
    const p2 = new THREE.Vector3(radius * Math.cos(a2), 0.15, radius * Math.sin(a2));

    const midAngle = a1 + (a2 < a1 ? a2 + 2 * Math.PI - a1 : a2 - a1) / 2;
    const pMid = new THREE.Vector3(radius * Math.cos(midAngle), 0.35, radius * Math.sin(midAngle));

    // Curved Tube Arc
    const curve = new THREE.CatmullRomCurve3([p1, pMid, p2]);
    const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.025, 12, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x632ce5,
      roughness: 0.2,
      clearcoat: 0.9
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    sceneGroup.add(tubeMesh);

    // Directional Arrowhead Cone pointing to p2
    const arrowGeo = new THREE.ConeGeometry(0.08, 0.22, 14);
    const arrowMat = new THREE.MeshPhysicalMaterial({
      color: 0xfdd400,
      roughness: 0.15,
      clearcoat: 1.0
    });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.position.copy(pMid);

    // Orient arrow along tangent
    const tangent = curve.getTangentAt(0.55).normalize();
    const defaultDir = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, tangent);
    arrowMesh.quaternion.copy(quat);
    sceneGroup.add(arrowMesh);

    // Subtle Animal Pod Pedestal Base
    const podGeo = new THREE.CylinderGeometry(0.55, 0.6, 0.04, 32);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5
    });
    const podMesh = new THREE.Mesh(podGeo, podMat);
    podMesh.position.set(radius * Math.cos(a1), 0.02, radius * Math.sin(a1));
    sceneGroup.add(podMesh);
  }

  slots.forEach((slot, i) => {
    const angle = (i * 2 * Math.PI) / numSlots;
    const slotGroup = new THREE.Group();
    slotGroup.position.set(radius * Math.cos(angle), 0.5, radius * Math.sin(angle));

    let relPath = (slot.modelSrc || '').replace(/^\/(assets|uploads)\/ecosystem-models\/library\//, '');
    let builderFn = speciesMap[relPath] || buildRumputToy;

    try {
      const modelObj = builderFn();
      const box = new THREE.Box3().setFromObject(modelObj);
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          modelObj.scale.setScalar(0.75 / maxDim);
        }
        const normBox = new THREE.Box3().setFromObject(modelObj);
        if (!normBox.isEmpty()) {
          modelObj.position.y -= normBox.min.y;
        }
      }
      slotGroup.add(modelObj);
    } catch (e) {
      console.warn(`[Auto-Bake Warning] Slot ${i} model error:`, e.message);
    }

    sceneGroup.add(slotGroup);
  });

  const exporter = new GLTFExporter();
  const buf = await new Promise((resolve, reject) => {
    exporter.parse(
      sceneGroup,
      res => resolve(res instanceof ArrayBuffer ? Buffer.from(res) : Buffer.from(JSON.stringify(res))),
      err => reject(err),
      { binary: true, embedImages: true }
    );
  });

  fs.writeFileSync(glbPath, buf);
  console.log(`[Auto-Bake Engine] Successfully baked & saved ${glbFilename}: ${(buf.length / 1024).toFixed(1)} KB`);
  return glbFilename;
}

function loadEcosystemModelLibrary() {
  if (!fs.existsSync(ECOSYSTEM_MODEL_LIBRARY_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(ECOSYSTEM_MODEL_LIBRARY_FILE, 'utf8')); }
  catch { return []; }
}

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const id  = nanoid(10);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${id}${ext}`);
  }
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ─── Helper: Generate NFT dataset (.fset, .fset3, .iset) from QR PNG ──────────
function generateNftMarker(qrImagePath, assetId) {
  return new Promise((resolve) => {
    const cliScript = path.join(__dirname, 'node_modules', '@webarkit', 'nft-marker-creator-app', 'src', 'NFTMarkerCreator.js');
    if (!fs.existsSync(cliScript)) {
      console.warn('[NFT Warning] NFTMarkerCreator CLI not found, skipping auto-NFT generation.');
      return resolve(null);
    }

    console.log(`[NFT Generator] Processing QR image for asset ${assetId}...`);
    const child = execFile(process.execPath, [
      cliScript,
      '-i', qrImagePath,
      '-o', MARKERS_DIR,
      '-NoConf'
    ], { cwd: __dirname }, (err) => {
      if (err) {
        console.error(`[NFT Generator Error ${assetId}]`, err.message);
      }

      // NFTMarkerCreator saves files named after the QR image filename stem (e.g., {assetId}_qr.fset)
      const inputStem = path.parse(qrImagePath).name;
      const exts = ['.fset', '.fset3', '.iset'];

      exts.forEach(ext => {
        const srcFile = path.join(MARKERS_DIR, `${inputStem}${ext}`);
        const targetFile = path.join(MARKERS_DIR, `${assetId}_nft${ext}`);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, targetFile);
        }
      });

      console.log(`[NFT Generator] Finished NFT marker generation for ${assetId}`);
      resolve(`/assets/markers/${assetId}_nft`);
    });

    if (child.stdin) {
      child.stdin.write("Y\n");
      child.stdin.end();
    }
  });
}

// ─── Multer storage ────────────────────────────────────────────────────────────
const ALLOWED_EXTS = ['.glb', '.gltf', '.usdz'];
const MAX_SIZE = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ASSETS_DIR),
  filename: (req, file, cb) => {
    const id  = nanoid(10);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTS.includes(ext)) return cb(null, true);
    cb(new Error(`Format tidak didukung. Gunakan: ${ALLOWED_EXTS.join(', ')}`));
  }
});

// ─── Static routes ─────────────────────────────────────────────────────────────
app.use('/assets', express.static(ASSETS_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (filePath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('.gltf')) {
      res.setHeader('Content-Type', 'model/gltf+json');
    } else if (filePath.endsWith('.usdz')) {
      res.setHeader('Content-Type', 'model/vnd.usdz+zip');
    }
  }
}));
app.use('/uploads', express.static(ASSETS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

const CLIENT_DIR = path.join(__dirname, '..', 'client');
app.use(express.static(CLIENT_DIR));

app.get(['/login', '/register'], (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});


// ─── Helper: format date in Indonesian ─────────────────────────────────────────
function formatDateId(isoStr) {
  return new Date(isoStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ─── Helper: parse & validate annotations from form body ───────────────────────
function parseAnnotations(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(a => a && typeof a.name === 'string' && a.name.trim())
      .map(a => ({
        name: a.name.trim().slice(0, 60),
        description: (a.description || '').trim().slice(0, 300),
        position: a.position || 'right'
      }))
      .slice(0, 12); // max 12 annotations
  } catch {
    return [];
  }
}

// ─── Helper: escape HTML in template ───────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Route: AR Viewer page ────────────────────────────────────────────────────
app.get('/ar/:id', (req, res) => {
  const { id } = req.params;
  const assets = loadAssets();
  const asset  = assets.find(a => a.id === id);

  if (!asset) {
    return res.status(404).send(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
    <title>Tidak Ditemukan — AR Edu QR</title>
    <style>body{background:#07071a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}</style>
    </head><body><div><div style="font-size:48px;margin-bottom:16px">❌</div>
    <h2>Model Tidak Ditemukan</h2><p style="color:rgba(255,255,255,0.5);margin-top:8px">QR code ini mungkin sudah tidak valid.</p>
    <a href="/" style="color:#7c5cfc;margin-top:16px;display:inline-block">← Kembali ke beranda</a></div></body></html>`);
  }

  // Increment view counter
  asset.viewCount = (asset.viewCount || 0) + 1;
  const assetIndex = assets.findIndex(a => a.id === id);
  if (assetIndex !== -1) {
    assets[assetIndex].viewCount = asset.viewCount;
    saveAssets(assets);
  }

  const hostHeader = req.get('host') || '';
  const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
  const host      = protocol + '://' + hostHeader;
  const assetUrl  = `/assets/${asset.filename}`;
  const printUrl  = `/print/${id}`;
  const markerPattUrl = asset.markerPattUrl || '/assets/markers/custom-marker.patt';
  const nftMarkerBase = asset.nftMarkerBase || `/assets/markers/${asset.id}_nft`;

  const templatePath = path.join(VIEWS_DIR, 'ar-viewer.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace(/{{MODEL_URL}}/g,        assetUrl)
    .replace(/{{MODEL_USDZ_URL}}/g,   asset.usdzUrl || '')
    .replace(/{{MODEL_NAME}}/g,       escapeHtml(asset.name || 'Model 3D'))
    .replace(/{{MODEL_DESC}}/g,       escapeHtml(asset.description || ''))
    .replace(/{{ASSET_ID}}/g,         asset.id)
    .replace(/{{PRINT_URL}}/g,        printUrl)
    .replace(/{{MARKER_PATT_URL}}/g,  markerPattUrl)
    .replace(/{{NFT_MARKER_BASE}}/g,  nftMarkerBase)
    .replace(/{{UPLOAD_DATE}}/g,      formatDateId(asset.uploadedAt))
    .replace(/{{ANNOTATIONS_JSON}}/g, JSON.stringify(asset.annotations || []));

  res.send(html);
});

// ─── Route: Print Card page ───────────────────────────────────────────────────
app.get('/print/:id', (req, res) => {
  const { id } = req.params;
  const assets = loadAssets();
  let asset = assets.find(a => a.id === id);

  // If not found in 3D assets, check Studio scenes.json
  if (!asset) {
    const scenes = loadScenes();
    const cleanId = id.replace(/^scene_/, '');
    const scene = scenes.find(s => s.id === cleanId || s.id === id);
    if (scene) {
      asset = {
        id: scene.id,
        name: scene.name || 'AR Studio Multi-Object Scene',
        description: scene.description || 'Scene 3D dari AR Studio (Multi-Object & Texture)',
        qrFilename: scene.qrFilename || `${scene.id}_qr.png`,
        uploadedAt: scene.updatedAt || scene.createdAt || new Date().toISOString()
      };
    }
  }

  if (!asset) {
    // Check Ecosystem Presets
    const presets = loadEcosystemPresets();
    const cleanPresetId = id.replace(/^preset-/, '');
    const preset = presets.find(p => p.id === id || p.id === cleanPresetId || p.id === `preset-${cleanPresetId}`);
    if (preset) {
      const hostHeader = req.get('host') || 'localhost:3001';
      const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
      const targetId = preset.id.startsWith('preset-') ? preset.id : `preset-${preset.id}`;
      const viewerUrl = `${protocol}://${hostHeader}/ecosystem/view/${targetId}`;

      qrcode.toDataURL(viewerUrl, { width: 400, margin: 2 }, (err, qrDataUrl) => {
        const templatePath = path.join(VIEWS_DIR, 'print-card.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        html = html
          .replace(/{{MODEL_NAME}}/g, escapeHtml(preset.name || 'Ekosistem AR'))
          .replace(/{{MODEL_DESC}}/g, escapeHtml('Scan untuk mulai AR Rantai Makanan!'))
          .replace(/\/assets\/{{QR_FILENAME}}/g, qrDataUrl)
          .replace(/{{QR_FILENAME}}/g, qrDataUrl)
          .replace(/{{MARKER_IMAGE_URL}}/g, '/assets/markers/custom-marker.png')
          .replace(/{{ASSET_ID}}/g, preset.id)
          .replace(/{{VIEWER_URL}}/g, `/ecosystem/view/${targetId}`)
          .replace(/{{UPLOAD_DATE}}/g, formatDateId(preset.createdAt || new Date().toISOString()));

        res.send(html);
      });
      return;
    }
  }

  if (!asset) return res.status(404).send('Model / Scene 3D tidak ditemukan');

  const markerImageUrl = asset.markerImageUrl || '/assets/markers/custom-marker.png';

  const templatePath = path.join(VIEWS_DIR, 'print-card.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace(/{{MODEL_NAME}}/g,      escapeHtml(asset.name || 'Model 3D'))
    .replace(/{{MODEL_DESC}}/g,      escapeHtml(asset.description || ''))
    .replace(/{{QR_FILENAME}}/g,     asset.qrFilename || `${asset.id}_qr.png`)
    .replace(/{{MARKER_IMAGE_URL}}/g, markerImageUrl)
    .replace(/{{ASSET_ID}}/g,        asset.id)
    .replace(/{{UPLOAD_DATE}}/g,     formatDateId(asset.uploadedAt));

  res.send(html);
});


// ─── Route: Visual 3D Annotation Editor ───────────────────────────────────────
app.get('/editor/:id', (req, res) => {
  const { id } = req.params;
  const assets = loadAssets();
  const asset  = assets.find(a => a.id === id);

  if (!asset) return res.status(404).send('Model tidak ditemukan');

  const assetUrl = `/assets/${asset.filename}`;
  const templatePath = path.join(VIEWS_DIR, 'editor.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace(/{{MODEL_URL}}/g,        assetUrl)
    .replace(/{{MODEL_NAME}}/g,       escapeHtml(asset.name || 'Model 3D'))
    .replace(/{{MODEL_DESC}}/g,       escapeHtml(asset.description || ''))
    .replace(/{{ASSET_ID}}/g,         asset.id)
    .replace(/{{UPLOAD_DATE}}/g,      formatDateId(asset.uploadedAt))
    .replace(/{{ANNOTATIONS_JSON}}/g, JSON.stringify(asset.annotations || []));

  res.send(html);
});

// ─── API Route: Save Annotations for Asset ────────────────────────────────────
app.post('/api/assets/:id/annotations', (req, res) => {
  const { id } = req.params;
  const { annotations } = req.body;

  if (!Array.isArray(annotations)) {
    return res.status(400).json({ error: 'Annotations harus berupa array' });
  }

  const assets = loadAssets();
  const assetIndex = assets.findIndex(a => a.id === id);

  if (assetIndex === -1) {
    return res.status(404).json({ error: 'Asset tidak ditemukan' });
  }

  // Sanitize annotations array
  const sanitized = annotations.map(a => ({
    name:         String(a.name || '').trim().slice(0, 60),
    description:  String(a.description || '').trim().slice(0, 300),
    dataPosition: String(a.dataPosition || a.position || '0m 0.25m 0m').trim(),
    dataNormal:   String(a.dataNormal || a.normal || '0 1 0').trim()
  }));

  assets[assetIndex].annotations = sanitized;
  saveAssets(assets);

  res.json({ success: true, annotations: sanitized });
});

// ─── Route: Upload asset ──────────────────────────────────────────────────────
app.post('/api/upload', upload.fields([
  { name: 'model', maxCount: 1 },
  { name: 'usdz',  maxCount: 1 }
]), async (req, res) => {
  try {
    const modelFile = req.files?.model?.[0];
    const usdzFile  = req.files?.usdz?.[0];

    if (!modelFile) return res.status(400).json({ error: 'File model 3D tidak ditemukan' });

    const { name, description } = req.body;
    const annotations = parseAnnotations(req.body.annotations);
    const id   = path.parse(modelFile.filename).name;
    const hostHeader = req.get('host') || '';
    const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
    const host = protocol + '://' + hostHeader;
    const viewerUrl = `${host}/ar/${id}`;
    const printUrl  = `${host}/print/${id}`;

    // Handle optional USDZ file upload (iOS AR Quick Look)
    let usdzFilename = null;
    let usdzUrl = '';
    if (usdzFile) {
      usdzFilename = `${id}.usdz`;
      const targetUsdzPath = path.join(ASSETS_DIR, usdzFilename);
      fs.copyFileSync(usdzFile.path, targetUsdzPath);
      usdzUrl = `/assets/${usdzFilename}`;
    }

    // Generate QR code (data URL)
    const qrDataUrl = await qrcode.toDataURL(viewerUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: { dark: '#000000', light: '#ffffff' }
    });

    // Save QR as PNG file
    const qrFilename = `${id}_qr.png`;
    const qrPath = path.join(ASSETS_DIR, qrFilename);
    await qrcode.toFile(qrPath, viewerUrl, {
      errorCorrectionLevel: 'M', margin: 2, width: 400
    });

    // Generate NFT marker dataset files (.fset, .fset3, .iset) automatically
    const nftMarkerBase = await generateNftMarker(qrPath, id);

    // Build metadata
    const assetMeta = {
      id,
      name:         name || modelFile.originalname,
      description:  description || '',
      annotations,
      filename:     modelFile.filename,
      originalName: modelFile.originalname,
      usdzFilename,
      usdzUrl,
      size:         modelFile.size,
      mimetype:     modelFile.mimetype,
      viewerUrl,
      printUrl,
      qrFilename,
      nftMarkerBase: nftMarkerBase || `/assets/markers/${id}_nft`,
      uploadedAt:   new Date().toISOString()
    };

    const assets = loadAssets();
    assets.unshift(assetMeta);
    saveAssets(assets);

    res.json({
      success: true,
      asset: assetMeta,
      qrDataUrl,
      qrDownloadUrl: `${host}/assets/${qrFilename}`
    });

  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: err.message || 'Terjadi kesalahan saat upload' });
  }
});

// ─── Route: List assets ───────────────────────────────────────────────────────
app.get('/api/assets', (req, res) => {
  const assets = loadAssets();
  res.json({ assets });
});

// ─── Route: Get QR for asset ──────────────────────────────────────────────────
app.get('/api/assets/:id/qr', async (req, res) => {
  const { id } = req.params;
  const assets = loadAssets();
  const asset  = assets.find(a => a.id === id);
  if (!asset) return res.status(404).json({ error: 'Asset tidak ditemukan' });

  const hostHeader = req.get('host') || '';
  const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
  const host = protocol + '://' + hostHeader;
  const viewerUrl = `${host}/ar/${id}`;
  const qrDataUrl = await qrcode.toDataURL(viewerUrl, {
    errorCorrectionLevel: 'M', margin: 2, width: 400,
    color: { dark: '#000000', light: '#ffffff' }
  });

  res.json({ qrDataUrl, viewerUrl, printUrl: `${host}/print/${id}`, asset });
});

// ─── Route: Delete asset ──────────────────────────────────────────────────────
app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  let assets = loadAssets();
  const asset = assets.find(a => a.id === id);
  if (!asset) return res.status(404).json({ error: 'Asset tidak ditemukan' });

  [asset.filename, asset.qrFilename].forEach(f => {
    if (f) {
      const p = path.join(ASSETS_DIR, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  });

  assets = assets.filter(a => a.id !== id);
  saveAssets(assets);
  res.json({ success: true });
});

// ─── Studio Multi-Object Scene Editor Routes (FASE 0 & 1) ──────────────────────
app.get('/studio', (req, res) => {
  const studioPath = path.join(VIEWS_DIR, 'studio', 'index.html');
  if (!fs.existsSync(studioPath)) {
    return res.status(404).send('Studio index.html tidak ditemukan');
  }
  res.sendFile(studioPath);
});

app.get('/api/scenes', (req, res) => {
  const scenes = loadScenes();
  res.json({ success: true, scenes });
});

// ─── Studio AR Scene Viewer (FASE 8 Opsi A & FASE C Tap-to-Place) ───────────────
app.get('/studio/view/:id', (req, res) => {
  const { id } = req.params;
  const scenes = loadScenes();
  const cleanId = id.replace(/^scene_/, '');
  const scene = scenes.find(s => s.id === cleanId || s.id === id || s.sceneId === cleanId || s.sceneId === id);

  if (!scene) {
    return res.status(404).send('AR Scene tidak ditemukan');
  }

  const viewerPath = path.join(VIEWS_DIR, 'studio', 'viewer.html');
  let html = fs.readFileSync(viewerPath, 'utf8');

  html = html
    .replace(/{{SCENE_NAME}}/g,      escapeHtml(scene.name || 'AR Multi-Object Scene'))
    .replace(/{{SCENE_ID}}/g,        scene.id || scene.sceneId)
    .replace(/{{SCENE_DATA_JSON}}/g, JSON.stringify(scene));

  res.send(html);
});

// ─── Ecosystem Preset Baked AR Viewer Route (FASE P5) ─────────────────────────
app.get('/ecosystem/view/:id', async (req, res) => {
  const { id } = req.params;
  const forceRebake = req.query.rebake === 'true' || req.query.rebake === '1';

  // Auto-bake engine: ensure the combined GLB file exists on disk
  try {
    await ensureEcosystemGlbExists(id, forceRebake);
  } catch (err) {
    console.error(`[Auto-Bake Error] Failed to auto-bake GLB for ${id}:`, err.message);
  }

  const publishedList = loadEcosystemPublished();
  const item = publishedList.find(p => p.id === id || p.filename === `${id}.glb`);

  const ecoViewerPath = path.join(VIEWS_DIR, 'ecosystem', 'viewer.html');
  if (!fs.existsSync(ecoViewerPath)) {
    return res.status(404).send('Ecosystem viewer.html tidak ditemukan');
  }

  let html = fs.readFileSync(ecoViewerPath, 'utf8');

  const hostHeader = req.get('host') || 'localhost:3001';
  let isLocal = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1');
  let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  if (!isLocal) {
    protocol = 'https'; // Force HTTPS for Scene Viewer / Quick Look / WebXR
  }
  let host = protocol + '://' + hostHeader;

  const glbPath = (item && item.glbUrl) ? item.glbUrl : `/assets/${id}.glb`;
  let fullGlbUrl = glbPath.startsWith('http') ? glbPath : `${host}${glbPath}`;
  if (!isLocal) {
    fullGlbUrl = fullGlbUrl.replace(/^http:\/\//, 'https://');
  }
  // Cache-busting query param so browser never serves stale disk-cached GLB
  fullGlbUrl = `${fullGlbUrl}?v=${Date.now()}`;

  const presets = loadEcosystemPresets();
  let targetPreset = presets.find(p => p.id === id || p.id === `preset-${id}` || (item && (p.id === item.presetId || p.id === `preset-${item.presetId}`)));
  if (!targetPreset) {
    targetPreset = presets.find(p => (p.name || '').toLowerCase().includes(id.toLowerCase())) || presets[0];
  }

  const name = item ? item.name : (targetPreset ? targetPreset.name : 'Rantai Makanan AR');

  html = html
    .replace(/{{ECOSYSTEM_NAME}}/g, escapeHtml(name))
    .replace(/{{ECOSYSTEM_ID}}/g, escapeHtml(id))
    .replace(/{{ECOSYSTEM_GLB_URL}}/g, fullGlbUrl);

  const slots = (targetPreset && targetPreset.slots) ? targetPreset.slots : [];
  for (let idx = 0; idx < 6; idx++) {
    const s = slots[idx] || {};
    const roleMap = {
      'produsen': 'PRODUSEN',
      'konsumen_primer': 'KONSUMEN I',
      'konsumen_sekunder': 'KONSUMEN II',
      'konsumen_tersier': 'KONSUMEN III',
      'konsumen_final': 'KONSUMEN IV',
      'decomposer': 'PENGURAI'
    };
    const roleLabel = roleMap[s.role] || (s.role || 'PERAN').toUpperCase();
    const labelStr = s.label || `Spesies ${idx + 1}`;
    
    html = html
      .replace(new RegExp(`{{SLOT_${idx}_LABEL}}`, 'g'), escapeHtml(labelStr))
      .replace(new RegExp(`{{SLOT_${idx}_ROLE}}`, 'g'), escapeHtml(roleLabel));
  }

  res.send(html);
});

app.get('/api/scenes/:id', (req, res) => {
  const { id } = req.params;
  const scenes = loadScenes();
  const cleanId = id.replace(/^scene_/, '');
  const scene = scenes.find(s => s.id === cleanId || s.id === id || s.sceneId === cleanId || s.sceneId === id);

  if (!scene) return res.status(404).json({ error: 'Scene tidak ditemukan' });
  res.json({ success: true, scene });
});

// ─── Studio Publish API Endpoint (FASE B) ──────────────────────────────────────
app.post('/api/studio/publish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sceneData } = req.body;
    let scenes = loadScenes();
    const cleanId = id.replace(/^scene_/, '');

    let sceneIndex = scenes.findIndex(s => s.id === cleanId || s.id === id || s.sceneId === cleanId || s.sceneId === id);
    
    let targetScene = sceneData || (sceneIndex !== -1 ? scenes[sceneIndex] : null);
    if (!targetScene) {
      targetScene = { id: cleanId || 'scene_' + Date.now(), name: 'AR Scene', objects: [] };
    }

    targetScene.id = cleanId || targetScene.id || 'scene_' + Date.now();
    targetScene.sceneId = targetScene.id;
    targetScene.isPublished = true;
    targetScene.publishedAt = new Date().toISOString();

    if (sceneIndex !== -1) {
      scenes[sceneIndex] = targetScene;
    } else {
      scenes.push(targetScene);
    }
    saveScenes(scenes);

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3001';
    const directUrl = `${protocol}://${host}/studio/view/${targetScene.id}`;
    const embedCode = `<iframe src="${directUrl}" width="100%" height="600" allow="camera;gyroscope;accelerometer;magnetometer;xr-spatial-tracking" frameborder="0"></iframe>`;

    // Generate QR Code Data URL
    const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 300 });

    res.json({
      success: true,
      sceneId: targetScene.id,
      sceneName: targetScene.name,
      directUrl,
      embedCode,
      qrCodeDataUrl
    });
  } catch (err) {
    console.error('Error publishing scene:', err);
    res.status(500).json({ error: 'Gagal mempublish AR scene: ' + err.message });
  }
});

// ─── Studio Media Upload API (FASE 5) ──────────────────────────────────────────
app.get('/api/studio/media', (req, res) => {
  const media = loadMedia();
  res.json({ success: true, media });
});

app.post('/api/studio/upload-media', uploadMedia.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diunggah' });

  const id = path.parse(req.file.filename).name;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const isVideo = ['.mp4', '.webm', '.ogv', '.mov'].includes(ext);
  const mediaType = isVideo ? 'video' : 'image';

  const mediaItem = {
    id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mediaType,
    url: `/assets/media/${req.file.filename}`,
    uploadedAt: new Date().toISOString()
  };

  const mediaList = loadMedia();
  mediaList.unshift(mediaItem);
  saveMedia(mediaList);

  res.json({ success: true, item: mediaItem });
});

// ─── Ecosystem Presets API (FASE P1 & P2.5) ───────────────────────────────────
app.get('/api/ecosystem/library', (req, res) => {
  const library = loadEcosystemModelLibrary();
  res.json({ success: true, library });
});

app.get('/api/ecosystem/presets', (req, res) => {
  const presets = loadEcosystemPresets();
  res.json({ success: true, presets });
});

app.get('/api/ecosystem/presets/:id', (req, res) => {
  const { id } = req.params;
  const presets = loadEcosystemPresets();
  const preset = presets.find(p => p.id === id);
  if (!preset) return res.status(404).json({ error: 'Preset tidak ditemukan' });
  res.json({ success: true, preset });
});

app.post('/api/ecosystem/presets/:id/slot', upload.single('model'), (req, res) => {
  try {
    const { id } = req.params;
    const { slotIndex, label } = req.body;
    const presets = loadEcosystemPresets();
    const preset = presets.find(p => p.id === id);
    if (!preset) return res.status(404).json({ error: 'Preset tidak ditemukan' });

    const idx = parseInt(slotIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= preset.slots.length) {
      return res.status(400).json({ error: 'Index slot tidak valid' });
    }

    if (label !== undefined) preset.slots[idx].label = String(label).trim();
    if (req.file) {
      preset.slots[idx].modelSrc = `/assets/${req.file.filename}`;
    }

    saveEcosystemPresets(presets);
    res.json({ success: true, preset, updatedSlot: preset.slots[idx] });
  } catch (err) {
    console.error('Error updating slot:', err);
    res.status(500).json({ error: 'Gagal memperbarui slot: ' + err.message });
  }
});

const ECOSYSTEM_PUBLISHED_FILE = path.join(__dirname, 'data', 'ecosystem-published.json');

function loadEcosystemPublished() {
  if (!fs.existsSync(ECOSYSTEM_PUBLISHED_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(ECOSYSTEM_PUBLISHED_FILE, 'utf8')); }
  catch { return []; }
}

function saveEcosystemPublished(published) {
  fs.writeFileSync(ECOSYSTEM_PUBLISHED_FILE, JSON.stringify(published, null, 2), 'utf8');
}

const ecoBakeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ASSETS_DIR),
  filename: (req, file, cb) => {
    const id = 'eco_' + nanoid(10);
    cb(null, `${id}.glb`);
  }
});

const uploadEcoBake = multer({
  storage: ecoBakeStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.post('/api/ecosystem/publish', uploadEcoBake.single('bakedGlb'), async (req, res) => {
  try {
    const { presetId, presetName } = req.body;
    let id = req.file ? path.parse(req.file.filename).name : ('eco_' + nanoid(10));
    let filename = req.file ? req.file.filename : `${id}.glb`;
    let filePath = path.join(ASSETS_DIR, filename);

    // If uploaded file is missing or less than 10KB, trigger server-side auto bake
    if (!req.file || !fs.existsSync(filePath) || fs.statSync(filePath).size < 10000) {
      console.log(`[Publish API] Auto-baking GLB for published preset "${presetId || id}"...`);
      await ensureEcosystemGlbExists(id);
    }

    const fileSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 100000;

    const hostHeader = req.get('host') || 'localhost:3001';
    let isLocal = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1');
    let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    if (!isLocal) {
      protocol = 'https';
    }
    let host = protocol + '://' + hostHeader;
    if (!isLocal) {
      host = host.replace(/^http:\/\//, 'https://');
    }
    const directUrl = `${host}/ecosystem/view/${id}`;

    // Generate QR Code PNG
    const qrFilename = `${id}_qr.png`;
    const qrPath = path.join(ASSETS_DIR, qrFilename);
    await qrcode.toFile(qrPath, directUrl, { margin: 2, width: 400 });
    const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 400 });

    const publishedItem = {
      id,
      presetId: presetId || 'preset-darat',
      name: presetName || 'Rantai Makanan AR',
      filename,
      glbUrl: `/assets/${filename}`,
      size: fileSize,
      directUrl,
      qrFilename,
      qrCodeDataUrl,
      publishedAt: new Date().toISOString()
    };

    const list = loadEcosystemPublished();
    list.unshift(publishedItem);
    saveEcosystemPublished(list);

    res.json({
      success: true,
      id,
      item: publishedItem,
      directUrl,
      qrCodeDataUrl
    });
  } catch (err) {
    console.error('Error publishing ecosystem GLB:', err);
    res.status(500).json({ error: 'Gagal publish ecosystem GLB: ' + err.message });
  }
});

// ─── Catch-all: serve frontend ────────────────────────────────────────────────
app.get('*', (req, res) => {
  const indexPath = path.join(CLIENT_DIR, 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.status(404).send('Frontend not found');
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║     AR Edu QR — Server Started       ║');
  console.log(`  ║  → http://localhost:${PORT}             ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log('  Routes:');
  console.log(`  • Frontend  : http://localhost:${PORT}/`);
  console.log(`  • AR Viewer : http://localhost:${PORT}/ar/:id`);
  console.log(`  • Print Card: http://localhost:${PORT}/print/:id`);
  console.log('');
});
