/**
 * FASE F2.2b — Batch 2 (Katak, Rumput, Padi, Pohon, Alga)
 * Cute Glossy 3D Toy Style
 *
 * 5 Spesies di Batch 2:
 *  6. Katak   (darat/katak.glb, sawah/katak.glb)
 *  7. Rumput  (darat/rumput.glb)
 *  8. Padi    (sawah/padi.glb)
 *  9. Pohon   (hutan/pohon.glb)
 * 10. Alga    (laut/alga.glb)
 *
 * Run from server/ directory: node build_batch2_f22b.js
 */
'use strict';

const path  = require('path');
const fs    = require('fs');
const THREE = require('./node_modules/three');
const { GLTFExporter } = require('./node_modules/three/examples/jsm/exporters/GLTFExporter.js');

// Polyfills
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
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buf => {
      const b64 = Buffer.from(buf).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
      if (this.onload)    this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
};

function exportGLB(obj, outPath) {
  return new Promise((resolve, reject) => {
    const exp = new GLTFExporter();
    exp.parse(obj,
      r => {
        const buf = r instanceof ArrayBuffer ? Buffer.from(r) : Buffer.from(JSON.stringify(r));
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, buf);
        console.log(`✅  ${path.basename(outPath)}: ${(buf.length / 1024).toFixed(1)} KB`);
        resolve();
      },
      e => reject(e),
      { binary: true }
    );
    setTimeout(() => {}, 500);
  });
}

function glossyMat(hex, roughness = 0.15) {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness,
    metalness: 0.0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05
  });
}

function matteMat(hex, rough = 0.6) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rough });
}

function tubeMesh(pts, radius, segments, radSeg, mat, closed = false) {
  const curve = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.5);
  const geo   = new THREE.TubeGeometry(curve, segments, radius, radSeg, closed);
  return new THREE.Mesh(geo, mat);
}

// Helper for cute toy face (eyes + pupils + highlights) — TASK A
function addCuteFace(group, headPos, forwardVec, sideVec, upVec, scale = 1.0) {
  [-1, 1].forEach(side => {
    const eyeGroup = new THREE.Group();
    const pos = headPos.clone()
      .addScaledVector(sideVec, side * 0.16 * scale)
      .addScaledVector(upVec, 0.10 * scale)
      .addScaledVector(forwardVec, 0.14 * scale);
    eyeGroup.position.copy(pos);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.075 * scale, 16, 14), matteMat(0xfafafa, 0.3));
    sclera.position.set(side * 0.015 * scale, 0, 0.015 * scale);
    eyeGroup.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.062 * scale, 14, 12), matteMat(0x080808, 0.95));
    pupil.position.set(side * 0.025 * scale, 0, 0.038 * scale);
    eyeGroup.add(pupil);

    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.022 * scale, 8, 6), matteMat(0xffffff, 0.05));
    hl.position.set(side * 0.015 * scale, 0.026 * scale, 0.058 * scale);
    eyeGroup.add(hl);

    group.add(eyeGroup);
  });
}

// =====================================================================
// 6. KATAK (Frog) — Cute chubby 2-tone green/lime frog
// =====================================================================
function buildKatakToy() {
  const g = new THREE.Group();

  // Chubby main body sphere (wide & squishy)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 22), glossyMat(0x4caf50, 0.12));
  body.scale.set(1.15, 0.75, 1.1);
  body.position.y = 0.22;
  g.add(body);

  // Chubby yellow/cream belly underside
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 18), glossyMat(0xdce775, 0.16));
  belly.scale.set(1.0, 0.55, 1.0);
  belly.position.set(0, 0.15, 0.08);
  g.add(belly);

  // Cute blushing cheeks
  [-1, 1].forEach(s => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), glossyMat(0xff8a80, 0.3));
    cheek.scale.set(1.2, 0.6, 0.5);
    cheek.position.set(s * 0.22, 0.22, 0.22);
    g.add(cheek);
  });

  // Big cute eyes on top of head
  const headPos = new THREE.Vector3(0, 0.28, 0.12);
  addCuteFace(g, headPos, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), 1.25);

  // Cute smiling mouth slot
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), matteMat(0x2e7d32, 0.8));
  mouth.scale.set(1.3, 0.35, 0.6);
  mouth.position.set(0, 0.18, 0.34);
  g.add(mouth);

  // Chubby FRONT LEGS (2 rounded stubby legs)
  [-1, 1].forEach(s => {
    const legPts = [
      new THREE.Vector3(s * 0.22, 0.2, 0.22),
      new THREE.Vector3(s * 0.28, 0.1, 0.30),
      new THREE.Vector3(s * 0.32, 0.04, 0.35)
    ];
    g.add(tubeMesh(legPts, 0.048, 8, 12, glossyMat(0x43a047, 0.14)));
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), glossyMat(0x388e3c, 0.15));
    foot.scale.set(1.4, 0.4, 1.0);
    foot.position.set(s * 0.32, 0.03, 0.38);
    g.add(foot);
  });

  // Chubby HIND LEGS (2 large rounded jumping legs)
  [-1, 1].forEach(s => {
    const thighPts = [
      new THREE.Vector3(s * 0.22, 0.18, -0.05),
      new THREE.Vector3(s * 0.42, 0.15, -0.18),
      new THREE.Vector3(s * 0.46, 0.06, -0.22)
    ];
    g.add(tubeMesh(thighPts, 0.085, 10, 14, glossyMat(0x4caf50, 0.12)));

    const shinPts = [
      new THREE.Vector3(s * 0.46, 0.06, -0.22),
      new THREE.Vector3(s * 0.42, 0.05, 0.05),
      new THREE.Vector3(s * 0.38, 0.03, 0.22)
    ];
    g.add(tubeMesh(shinPts, 0.055, 10, 12, glossyMat(0x388e3c, 0.14)));

    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), glossyMat(0x2e7d32, 0.15));
    foot.scale.set(1.6, 0.4, 1.1);
    foot.position.set(s * 0.38, 0.02, 0.28);
    g.add(foot);
  });

  return g;
}

// =====================================================================
// 7. RUMPUT (Grass) — Cute chubby 3D grass blades with rounded caps
// =====================================================================
function buildRumputToy() {
  const g = new THREE.Group();

  const bladeConfigs = [
    { pts: [[-0.22, 0, 0], [-0.28, 0.4, 0.05], [-0.35, 0.75, 0.1]], r: 0.05, c: 0x4caf50 },
    { pts: [[-0.10, 0, 0], [-0.12, 0.5, -0.05], [-0.15, 0.95, -0.1]], r: 0.055, c: 0x66bb6a },
    { pts: [[ 0.02, 0, 0], [ 0.04, 0.45, 0.04], [ 0.06, 0.85, 0.08]], r: 0.048, c: 0x81c784 },
    { pts: [[ 0.14, 0, 0], [ 0.20, 0.48, -0.04], [ 0.26, 0.90, -0.08]], r: 0.052, c: 0x43a047 },
    { pts: [[ 0.25, 0, 0], [ 0.32, 0.38, 0.06], [ 0.40, 0.70, 0.12]], r: 0.045, c: 0x388e3c }
  ];

  bladeConfigs.forEach(cfg => {
    const vPts = cfg.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    g.add(tubeMesh(vPts, cfg.r, 16, 16, glossyMat(cfg.c, 0.13)));
    const cap = new THREE.Mesh(new THREE.SphereGeometry(cfg.r * 0.95, 12, 10), glossyMat(cfg.c, 0.13));
    cap.position.copy(vPts[vPts.length - 1]);
    g.add(cap);
  });

  // Cute flower nubs in front
  [[-0.12, 0.25, 0.15, 0xff4081], [0.15, 0.20, 0.18, 0xffeb3b]].forEach(([x, y, z, col]) => {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 12), glossyMat(col, 0.1));
    flower.position.set(x, y, z);
    g.add(flower);
  });

  return g;
}

// =====================================================================
// 8. PADI (Rice Stalk) — Cute golden rice with drooping chubby grains
// =====================================================================
function buildPadiToy() {
  const g = new THREE.Group();

  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.22;
    // Chubby green stalk
    const stalkPts = [
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(x, 0.5, 0),
      new THREE.Vector3(x + (i - 1.5) * 0.05, 0.85, 0)
    ];
    g.add(tubeMesh(stalkPts, 0.038, 16, 14, glossyMat(0x81c784, 0.14)));

    // Drooping golden grain head (malai)
    const droop = (i % 2 === 0) ? -0.20 : 0.20;
    const grainPts = [
      new THREE.Vector3(x + (i - 1.5) * 0.05, 0.85, 0),
      new THREE.Vector3(x + (i - 1.5) * 0.05 + droop * 0.5, 0.98, 0),
      new THREE.Vector3(x + (i - 1.5) * 0.05 + droop, 0.88, 0)
    ];
    g.add(tubeMesh(grainPts, 0.045, 14, 14, glossyMat(0xfbc02d, 0.12)));

    // Cute chubby golden grain pods
    for (let k = 0; k < 4; k++) {
      const gk = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), glossyMat(0xffeb3b, 0.10));
      gk.scale.set(1.4, 0.8, 0.9);
      gk.position.set(
        x + (i - 1.5) * 0.05 + droop * (0.3 + k * 0.22),
        0.95 - k * 0.05,
        (k % 2 === 0 ? 0.05 : -0.05)
      );
      g.add(gk);
    }
  }

  return g;
}

// =====================================================================
// 9. POHON (Tree) — Cute chubby cloud canopy tree + red berries
// =====================================================================
function buildPohonToy() {
  const g = new THREE.Group();

  // Chubby brown trunk (sphere + cylinder merged)
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.9, 24), glossyMat(0x795548, 0.18));
  trunk.position.y = 0.45;
  g.add(trunk);

  // 3 overlapping chubby cloud canopy spheres (emerald / lime green)
  const canopies = [
    { pos: [0.0, 1.25, 0.0],  r: 0.58, c: 0x2e7d32 },
    { pos: [-0.22, 1.15, 0.15], r: 0.48, c: 0x388e3c },
    { pos: [0.22, 1.20, -0.15], r: 0.46, c: 0x4caf50 },
    { pos: [0.0, 1.62, 0.0],  r: 0.42, c: 0x66bb6a }
  ];

  canopies.forEach(c => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(c.r, 24, 20), glossyMat(c.c, 0.12));
    mesh.position.set(...c.pos);
    g.add(mesh);
  });

  // Cute glossy red berry dots on canopy
  const berries = [
    [-0.25, 1.35, 0.42],
    [0.30,  1.28, 0.38],
    [0.08,  1.55, 0.35],
    [-0.32, 1.10, 0.32],
    [0.28,  1.42, -0.30]
  ];
  berries.forEach(([x, y, z]) => {
    const berry = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), glossyMat(0xff1744, 0.10));
    berry.position.set(x, y, z);
    g.add(berry);
  });

  return g;
}

// =====================================================================
// 10. ALGA (Seaweed) — Cute chubby wavy cyan ribbons + glossy bubbles
// =====================================================================
function buildAlgaToy() {
  const g = new THREE.Group();

  // 2 chubby wavy ribbons
  const ribbon1Pts = [
    new THREE.Vector3(-0.20, 0, 0),
    new THREE.Vector3(-0.05, 0.35, 0.1),
    new THREE.Vector3( 0.15, 0.65, -0.1),
    new THREE.Vector3(-0.08, 0.95, 0.08),
    new THREE.Vector3( 0.06, 1.20, 0)
  ];
  g.add(tubeMesh(ribbon1Pts, 0.075, 24, 18, glossyMat(0x00897b, 0.12)));

  const cap1 = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), glossyMat(0x00897b, 0.12));
  cap1.position.copy(ribbon1Pts[ribbon1Pts.length - 1]);
  g.add(cap1);

  const ribbon2Pts = [
    new THREE.Vector3(0.18, 0, 0),
    new THREE.Vector3(0.30, 0.32, -0.08),
    new THREE.Vector3(0.12, 0.62, 0.1),
    new THREE.Vector3(0.25, 0.92, 0)
  ];
  g.add(tubeMesh(ribbon2Pts, 0.06, 20, 16, glossyMat(0x26a69a, 0.13)));

  const cap2 = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), glossyMat(0x26a69a, 0.13));
  cap2.position.copy(ribbon2Pts[ribbon2Pts.length - 1]);
  g.add(cap2);

  // Cute glossy gas bubbles
  const bubbles = [
    [0.02,  1.32, 0.0,  0.085],
    [0.26,  1.05, 0.0,  0.072],
    [-0.12, 0.82, 0.1,  0.065],
    [0.18,  0.50, -0.1, 0.078]
  ];
  bubbles.forEach(([x, y, z, r]) => {
    const bub = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 14), glossyMat(0x80cbc4, 0.08));
    bub.position.set(x, y, z);
    g.add(bub);
  });

  return g;
}

// ------------------------------------------------------------------
// Main — build Batch 2 models and export to target files
// ------------------------------------------------------------------
async function main() {
  const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');

  const targets = [
    { p: 'darat/katak.glb',   fn: buildKatakToy },
    { p: 'sawah/katak.glb',   fn: buildKatakToy },
    { p: 'darat/rumput.glb',  fn: buildRumputToy },
    { p: 'sawah/padi.glb',    fn: buildPadiToy },
    { p: 'hutan/pohon.glb',   fn: buildPohonToy },
    { p: 'laut/alga.glb',     fn: buildAlgaToy },
  ];

  console.log('\nFASE F2.2b — Building Batch 2 (Katak, Rumput, Padi, Pohon, Alga)...\n');
  for (const t of targets) {
    await exportGLB(t.fn(), path.join(BASE, t.p));
    await new Promise(r => setTimeout(r, 50));
  }
  console.log('\nBatch 2 completed successfully!\n');
}

main().catch(e => { console.error(e); process.exit(1); });
