/**
 * FASE F2.2b — Batch 1 (Serangga, Artropoda, Mikroba, Jamur)
 * Cute Glossy 3D Toy Style
 *
 * 5 Spesies di Batch 1:
 *  1. Belalang (darat/belalang.glb, sawah/belalang.glb)
 *  2. Ulat     (hutan/ulat.glb)
 *  3. Udang    (laut/udang.glb)
 *  4. Bakteri  (laut/bakteri.glb)
 *  5. Jamur    (darat/jamur.glb, hutan/jamur.glb, sawah/jamur.glb)
 *
 * Directives:
 *  - Chubby / Toy-style proportions
 *  - 2-tone vibrant colors
 *  - MeshPhysicalMaterial with clearcoat 0.9, roughness 0.12 - 0.18
 *  - High polygon smoothness (24 radial segments)
 *  - Cute big round eyes (pupil + highlight)
 *
 * Run from server/ directory: node build_batch1_f22b.js
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

// Helper for cute toy face (eyes + pupils + highlights)
function addCuteFace(group, headPos, forwardVec, sideVec, upVec, scale = 1.0) {
  [-1, 1].forEach(side => {
    const eyeGroup = new THREE.Group();
    const pos = headPos.clone()
      .addScaledVector(sideVec, side * 0.14 * scale)
      .addScaledVector(upVec, 0.08 * scale)
      .addScaledVector(forwardVec, 0.12 * scale);
    eyeGroup.position.copy(pos);

    // Eye white base
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scale, 16, 14), matteMat(0xfafafa, 0.3));
    sclera.position.set(side * 0.01, 0, 0.01);
    eyeGroup.add(sclera);

    // Black pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.052 * scale, 14, 12), matteMat(0x0a0a0a, 0.95));
    pupil.position.set(side * 0.02 * scale, 0, 0.03 * scale);
    eyeGroup.add(pupil);

    // White highlight dot
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 8, 6), matteMat(0xffffff, 0.05));
    hl.position.set(side * 0.01 * scale, 0.02 * scale, 0.05 * scale);
    eyeGroup.add(hl);

    group.add(eyeGroup);
  });
}

// =====================================================================
// 1. BELALANG (Grasshopper) — Cute chubby 2-tone green/lime
// =====================================================================
function buildBelalangToy() {
  const g = new THREE.Group();

  // Chubby 2-tone body tube (lime green top, yellow-green belly)
  const bodyPts = [
    new THREE.Vector3(-0.35, 0.24, 0),
    new THREE.Vector3( 0.0,  0.28, 0),
    new THREE.Vector3( 0.32, 0.26, 0)
  ];
  g.add(tubeMesh(bodyPts, 0.15, 30, 24, glossyMat(0x8bc34a, 0.13))); // main body (lime)

  // Belly strip (yellow-green underside)
  const bellyPts = [
    new THREE.Vector3(-0.32, 0.18, 0),
    new THREE.Vector3( 0.0,  0.20, 0),
    new THREE.Vector3( 0.30, 0.19, 0)
  ];
  g.add(tubeMesh(bellyPts, 0.11, 24, 18, glossyMat(0xdce775, 0.16)));

  // Chubby head (sphere)
  const headPos = new THREE.Vector3(0.44, 0.30, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 20), glossyMat(0x7cb342, 0.13));
  head.scale.set(1.1, 1.15, 1.1);
  head.position.copy(headPos);
  g.add(head);

  // Cute face
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.1);

  // Chubby cute antennae (2 curved tubes)
  [-1, 1].forEach(s => {
    const antPts = [
      headPos.clone().add(new THREE.Vector3(0.05, 0.14, s * 0.06)),
      headPos.clone().add(new THREE.Vector3(0.1, 0.35, s * 0.15)),
      headPos.clone().add(new THREE.Vector3(0.06, 0.55, s * 0.22))
    ];
    g.add(tubeMesh(antPts, 0.016, 12, 10, glossyMat(0x33691e, 0.15)));
    // Cute antenna tip bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), glossyMat(0xc0ca33, 0.1));
    bulb.position.copy(antPts[2]);
    g.add(bulb);
  });

  // Chubby JUMPING LEGS (big femur + tibia)
  [-1, 1].forEach(s => {
    // Large rounded femur
    const femPts = [
      new THREE.Vector3(-0.15, 0.26, s * 0.12),
      new THREE.Vector3(-0.25, 0.52, s * 0.26),
      new THREE.Vector3(-0.15, 0.65, s * 0.35)
    ];
    g.add(tubeMesh(femPts, 0.065, 14, 16, glossyMat(0x8bc34a, 0.13)));

    // Tibia going back down
    const tibPts = [
      new THREE.Vector3(-0.15, 0.65, s * 0.35),
      new THREE.Vector3(-0.08, 0.35, s * 0.42),
      new THREE.Vector3( 0.02, 0.06, s * 0.48)
    ];
    g.add(tubeMesh(tibPts, 0.035, 12, 12, glossyMat(0x689f38, 0.14)));

    // Cute foot sphere
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glossyMat(0x33691e, 0.15));
    foot.position.set(0.02, 0.04, s * 0.48);
    g.add(foot);
  });

  // Small front walking legs (chubby)
  for (let j = 0; j < 2; j++) {
    [-1, 1].forEach(s => {
      const lx = 0.1 + j * 0.18;
      const legPts = [
        new THREE.Vector3(lx, 0.2, s * 0.1),
        new THREE.Vector3(lx + 0.08, 0.1, s * 0.22),
        new THREE.Vector3(lx + 0.12, 0.03, s * 0.28)
      ];
      g.add(tubeMesh(legPts, 0.025, 8, 10, glossyMat(0x689f38, 0.15)));
    });
  }

  return g;
}

// =====================================================================
// 2. ULAT (Caterpillar) — Cute chubby segmented body (lime/emerald)
// =====================================================================
function buildUlatToy() {
  const g = new THREE.Group();

  // 6 overlapping chubby segments (spheres merged smoothly)
  const nSeg = 6;
  const segCenters = [];
  for (let i = 0; i < nSeg; i++) {
    const t = i / (nSeg - 1);
    const x = t * 1.0 - 0.5;
    const y = 0.18 + Math.sin(t * Math.PI) * 0.08;
    const r = 0.17 - Math.abs(t - 0.4) * 0.04;
    segCenters.push({ pos: new THREE.Vector3(x, y, 0), r });

    // Alternating 2-tone green glossy segments
    const color = (i % 2 === 0) ? 0x8bc34a : 0x7cb342;
    const segMesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 20), glossyMat(color, 0.12));
    segMesh.position.set(x, y, 0);
    g.add(segMesh);

    // Yellow stripe ring around each segment
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.98, 0.018, 10, 20), glossyMat(0xffeb3b, 0.18));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(x, y, 0);
    g.add(ring);
  }

  // Big cute head (front)
  const headPos = new THREE.Vector3(0.62, 0.22, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 28, 22), glossyMat(0xff9800, 0.12)); // cute orange head
  head.position.copy(headPos);
  g.add(head);

  // Cute face on head
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.25);

  // Cute chubby antennae (short nubs)
  [-1, 1].forEach(s => {
    const ant = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), glossyMat(0xe65100, 0.1));
    ant.position.set(headPos.x + 0.08, headPos.y + 0.18, s * 0.1);
    g.add(ant);
  });

  // Cute stubby prolegs under segments
  for (let i = 1; i < nSeg - 1; i++) {
    [-1, 1].forEach(s => {
      const legPos = segCenters[i].pos.clone().add(new THREE.Vector3(0, -segCenters[i].r * 0.7, s * 0.1));
      const leg = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), glossyMat(0xcddc39, 0.15));
      leg.scale.set(1.0, 0.7, 1.0);
      leg.position.copy(legPos);
      g.add(leg);
    });
  }

  return g;
}

// =====================================================================
// 3. UDANG (Shrimp) — Cute chubby curled shrimp (glossy pink/coral)
// =====================================================================
function buildUdangToy() {
  const g = new THREE.Group();

  // Curled tube body (continuous curved path)
  const pts = [
    new THREE.Vector3(-0.45, 0.52, 0),
    new THREE.Vector3(-0.20, 0.65, 0),
    new THREE.Vector3( 0.08, 0.55, 0),
    new THREE.Vector3( 0.28, 0.32, 0),
    new THREE.Vector3( 0.35, 0.08, 0)
  ];
  g.add(tubeMesh(pts, 0.14, 30, 24, glossyMat(0xff8a80, 0.12))); // coral pink body

  // Belly strip (cream/yellowish underside)
  const bellyPts = [
    new THREE.Vector3(-0.42, 0.45, 0),
    new THREE.Vector3(-0.18, 0.56, 0),
    new THREE.Vector3( 0.05, 0.47, 0),
    new THREE.Vector3( 0.22, 0.27, 0)
  ];
  g.add(tubeMesh(bellyPts, 0.09, 24, 18, glossyMat(0xffffe0, 0.18)));

  // Head (front bulb)
  const headPos = new THREE.Vector3(-0.52, 0.52, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 20), glossyMat(0xff5252, 0.12));
  head.position.copy(headPos);
  g.add(head);

  // Cute face on head (facing left/front)
  addCuteFace(g, headPos, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.1);

  // Chubby rounded claws (front)
  [-1, 1].forEach(s => {
    const clawBase = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), glossyMat(0xff1744, 0.12));
    clawBase.position.set(headPos.x - 0.12, headPos.y - 0.05, s * 0.1);
    g.add(clawBase);

    const clawPincer = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), glossyMat(0xd50000, 0.12));
    clawPincer.scale.set(1.5, 0.6, 0.8);
    clawPincer.position.set(headPos.x - 0.22, headPos.y - 0.05, s * 0.1);
    g.add(clawPincer);
  });

  // Long cute antennae (thin glossy pink tubes)
  [-1, 1].forEach(s => {
    const antPts = [
      headPos.clone().add(new THREE.Vector3(0, 0.12, s * 0.04)),
      headPos.clone().add(new THREE.Vector3(-0.25, 0.35, s * 0.18)),
      headPos.clone().add(new THREE.Vector3(-0.45, 0.55, s * 0.3))
    ];
    g.add(tubeMesh(antPts, 0.014, 12, 10, glossyMat(0xff4081, 0.15)));
  });

  // Tail fan (3 overlapping glossy pink ovals)
  for (let i = -1; i <= 1; i++) {
    const fan = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), glossyMat(0xff5252, 0.12));
    fan.scale.set(1.4, 0.25, 0.7);
    fan.position.set(0.35 + i * 0.08, -0.02, i * 0.08);
    fan.rotation.z = -0.3;
    g.add(fan);
  }

  return g;
}

// =====================================================================
// 4. BAKTERI (Bacteria) — Cute chubby capsule with face & flagella
// =====================================================================
function buildBakteriToy() {
  const g = new THREE.Group();

  // Chubby main capsule body (cyan/teal 2-tone)
  const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.38, 16, 24);
  const body = new THREE.Mesh(bodyGeo, glossyMat(0x00bcd4, 0.12));
  body.rotation.z = Math.PI / 4;
  body.position.set(0, 0.32, 0);
  g.add(body);

  // Belly / highlight oval (light cyan inner patch)
  const bellyGeo = new THREE.SphereGeometry(0.20, 20, 16);
  const belly = new THREE.Mesh(bellyGeo, glossyMat(0x80deea, 0.16));
  belly.scale.set(1.0, 0.6, 0.8);
  belly.position.set(0, 0.28, 0.12);
  g.add(belly);

  // Cute face on front
  const headPos = new THREE.Vector3(0, 0.36, 0.18);
  addCuteFace(g, headPos, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), 1.2);

  // Cute smiling mouth slot
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), matteMat(0x006064, 0.8));
  mouth.scale.set(1.2, 0.4, 0.6);
  mouth.position.set(0, 0.26, 0.38);
  g.add(mouth);

  // Wavy flagella (4 glossy colorful tubes)
  const flagColors = [0x00e676, 0xffeb3b, 0xff4081, 0x7c4dff];
  const flagConfigs = [
    [ 0.28,  0.52,  0.48,  0.72,  0.38,  0.88],
    [-0.28,  0.50, -0.48,  0.70, -0.38,  0.86],
    [-0.25,  0.15, -0.45,  0.08, -0.55, -0.05],
    [ 0.25,  0.12,  0.42,  0.05,  0.52, -0.08]
  ];
  flagConfigs.forEach(([sx, sy, mx, my, ex, ey], idx) => {
    const fPts = [
      new THREE.Vector3(sx, sy, 0),
      new THREE.Vector3(mx, my, (idx % 2 === 0 ? 0.1 : -0.1)),
      new THREE.Vector3(ex, ey, 0)
    ];
    g.add(tubeMesh(fPts, 0.022, 12, 10, glossyMat(flagColors[idx], 0.14)));
    // Cute bulb at tip
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), glossyMat(flagColors[idx], 0.10));
    tip.position.set(ex, ey, 0);
    g.add(tip);
  });

  return g;
}

// =====================================================================
// 5. JAMUR (Mushroom) — Cute chubby stem with face + glossy red cap
// =====================================================================
function buildJamurToy() {
  const g = new THREE.Group();

  // Chubby white/cream stem (sphere + cylinder merged)
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 24), glossyMat(0xfff8e1, 0.15));
  stem.position.y = 0.25;
  g.add(stem);

  // Cute face on stem
  const facePos = new THREE.Vector3(0, 0.28, 0.15);
  addCuteFace(g, facePos, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), 1.15);

  // Cute blushing cheeks (2 pink ovals)
  [-1, 1].forEach(s => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glossyMat(0xff8a80, 0.3));
    cheek.scale.set(1.2, 0.6, 0.5);
    cheek.position.set(s * 0.12, 0.24, 0.18);
    g.add(cheek);
  });

  // Large glossy red umbrella cap (lathe geometry)
  const capPts = [
    new THREE.Vector2(0.0,  0.0),
    new THREE.Vector2(0.12, 0.0),
    new THREE.Vector2(0.35, 0.06),
    new THREE.Vector2(0.52, 0.22),
    new THREE.Vector2(0.55, 0.38),
    new THREE.Vector2(0.48, 0.52),
    new THREE.Vector2(0.28, 0.62),
    new THREE.Vector2(0.0,  0.64)
  ];
  const capGeo = new THREE.LatheGeometry(capPts, 28);
  const cap = new THREE.Mesh(capGeo, glossyMat(0xe53935, 0.10)); // glossy red
  cap.position.y = 0.46;
  g.add(cap);

  // White 3D dots on cap (distinct raised spheres)
  const dotCoords = [
    [0.0,   1.08, 0.0],
    [0.32,  0.88, 0.12],
    [-0.30, 0.86, -0.15],
    [0.15,  0.85, -0.32],
    [-0.18, 0.87, 0.30],
    [0.35,  0.72, -0.20]
  ];
  dotCoords.forEach(([x, y, z]) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), glossyMat(0xffffff, 0.12));
    dot.position.set(x, y, z);
    g.add(dot);
  });

  return g;
}

// ------------------------------------------------------------------
// Main — build Batch 1 models and export to target files
// ------------------------------------------------------------------
async function main() {
  const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');

  const targets = [
    { p: 'darat/belalang.glb',  fn: buildBelalangToy },
    { p: 'sawah/belalang.glb',  fn: buildBelalangToy },
    { p: 'hutan/ulat.glb',      fn: buildUlatToy },
    { p: 'laut/udang.glb',      fn: buildUdangToy },
    { p: 'laut/bakteri.glb',    fn: buildBakteriToy },
    { p: 'darat/jamur.glb',     fn: buildJamurToy },
    { p: 'hutan/jamur.glb',     fn: buildJamurToy },
    { p: 'sawah/jamur.glb',     fn: buildJamurToy },
  ];

  console.log('\nFASE F2.2b — Building Batch 1 (Belalang, Ulat, Udang, Bakteri, Jamur)...\n');
  for (const t of targets) {
    await exportGLB(t.fn(), path.join(BASE, t.p));
    await new Promise(r => setTimeout(r, 50));
  }
  console.log('\nBatch 1 completed successfully!\n');
}

main().catch(e => { console.error(e); process.exit(1); });
