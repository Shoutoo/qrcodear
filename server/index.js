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
  maxAge: '7d',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.glb') || filePath.endsWith('.gltf')) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));

const CLIENT_DIR = path.join(__dirname, '..', 'client');
app.use(express.static(CLIENT_DIR));

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

// ─── Ecosystem Presets API (FASE P1) ───────────────────────────────────────────
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
    if (!req.file) return res.status(400).json({ error: 'File GLB hasil bake tidak ditemukan' });

    const { presetId, presetName } = req.body;
    const id = path.parse(req.file.filename).name;
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.protocol || 'http';
    const host = protocol + '://' + hostHeader;
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
      filename: req.file.filename,
      glbUrl: `/assets/${req.file.filename}`,
      size: req.file.size,
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
