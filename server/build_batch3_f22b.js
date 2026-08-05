/**
 * FASE F2.2b — Batch 3 (Ikan Kecil, Ikan Besar, Hiu, Elang, Burung)
 * Cute Glossy 3D Toy Style
 *
 * 5 Spesies di Batch 3:
 * 11. Ikan Kecil (laut/ikan_kecil.glb)
 * 12. Ikan Besar (laut/ikan_besar.glb)
 * 13. Hiu        (laut/hiu.glb)
 * 14. Elang      (darat/elang.glb, hutan/elang.glb, sawah/elang.glb)
 * 15. Burung     (hutan/burung.glb)
 *
 * Run from server/ directory: node build_batch3_f22b.js
 */
'use strict';

const path  = require('path');
const fs    = require('fs');
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

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
// 11. IKAN KECIL (Small Fish) — Cute chubby blue/cyan 2-tone fish
// =====================================================================
function buildIkanKecilToy() {
  const g = new THREE.Group();

  // Chubby body sphere
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 28, 22), glossyMat(0x42a5f5, 0.12));
  body.scale.set(1.4, 0.9, 0.85);
  body.position.y = 0.25;
  g.add(body);

  // Chubby belly (cyan underside)
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), glossyMat(0x80deea, 0.16));
  belly.scale.set(1.3, 0.6, 0.8);
  belly.position.set(0.02, 0.16, 0);
  g.add(belly);

  // Cute face on front of head
  const headPos = new THREE.Vector3(0.25, 0.28, 0);
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.1);

  // Cute smiling mouth slot
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), matteMat(0x1565c0, 0.8));
  mouth.scale.set(0.8, 0.4, 0.6);
  mouth.position.set(0.38, 0.22, 0);
  g.add(mouth);

  // Cute chubby dorsal fin
  const dorsal = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), glossyMat(0x1565c0, 0.12));
  dorsal.scale.set(1.2, 1.4, 0.25);
  dorsal.position.set(0.02, 0.48, 0);
  g.add(dorsal);

  // Cute rounded forked tail fin
  for (let s = -1; s <= 1; s += 2) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), glossyMat(0x1e88e5, 0.12));
    lobe.scale.set(1.3, 0.5, 0.25);
    lobe.position.set(-0.42, 0.25 + s * 0.08, 0);
    lobe.rotation.z = -Math.PI / 4 * s;
    g.add(lobe);
  }

  // Chubby pectoral fins
  [-1, 1].forEach(s => {
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 10), glossyMat(0x1e88e5, 0.14));
    fin.scale.set(1.2, 0.5, 0.25);
    fin.position.set(0.1, 0.18, s * 0.22);
    fin.rotation.y = s * 0.5;
    g.add(fin);
  });

  return g;
}

// =====================================================================
// 12. IKAN BESAR (Big Fish) — Cute chubby orange/yellow clownfish-style
// =====================================================================
function buildIkanBesarToy() {
  const g = new THREE.Group();

  // Chubby large body sphere (orange)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 28, 22), glossyMat(0xff9800, 0.12));
  body.scale.set(1.5, 0.95, 0.9);
  body.position.y = 0.32;
  g.add(body);

  // Chubby white/cream stripes (2 rounded torus bands)
  [-0.1, 0.2].forEach(x => {
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 12, 24), glossyMat(0xffffff, 0.15));
    stripe.rotation.y = Math.PI / 2;
    stripe.position.set(x, 0.32, 0);
    g.add(stripe);
  });

  // Chubby yellow belly
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.30, 24, 18), glossyMat(0xffeb3b, 0.16));
  belly.scale.set(1.4, 0.55, 0.85);
  belly.position.set(0.05, 0.20, 0);
  g.add(belly);

  // Cute face
  const headPos = new THREE.Vector3(0.38, 0.36, 0);
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.3);

  // Cute smiling mouth slot
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), matteMat(0xe65100, 0.8));
  mouth.scale.set(0.9, 0.45, 0.7);
  mouth.position.set(0.55, 0.28, 0);
  g.add(mouth);

  // Prominent rounded dorsal fin
  const dorsal = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 14), glossyMat(0xf57c00, 0.12));
  dorsal.scale.set(1.3, 1.4, 0.25);
  dorsal.position.set(0.05, 0.62, 0);
  g.add(dorsal);

  // Chubby rounded tail fin
  for (let s = -1; s <= 1; s += 2) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glossyMat(0xf57c00, 0.12));
    lobe.scale.set(1.4, 0.55, 0.25);
    lobe.position.set(-0.58, 0.32 + s * 0.11, 0);
    lobe.rotation.z = -Math.PI / 4 * s;
    g.add(lobe);
  }

  // Pectoral fins
  [-1, 1].forEach(s => {
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), glossyMat(0xffb74d, 0.14));
    fin.scale.set(1.3, 0.55, 0.25);
    fin.position.set(0.18, 0.24, s * 0.32);
    fin.rotation.y = s * 0.5;
    g.add(fin);
  });

  return g;
}

// =====================================================================
// 13. HIU (Shark) — Cute chubby slate-blue shark with TALL rounded dorsal
// =====================================================================
function buildHiuToy() {
  const g = new THREE.Group();

  // Streamlined chubby body (slate blue / teal grey)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 28, 22), glossyMat(0x607d8b, 0.12));
  body.scale.set(2.0, 0.8, 0.85);
  body.position.y = 0.32;
  g.add(body);

  // Chubby white/light-cyan belly
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), glossyMat(0xe0f7fa, 0.16));
  belly.scale.set(1.9, 0.5, 0.8);
  belly.position.set(0.05, 0.20, 0);
  g.add(belly);

  // Cute face on snout
  const headPos = new THREE.Vector3(0.55, 0.36, 0);
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.25);

  // Cute smiling mouth slot
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), matteMat(0x37474f, 0.85));
  mouth.scale.set(1.0, 0.4, 0.7);
  mouth.position.set(0.70, 0.26, 0);
  g.add(mouth);

  // TALL ICONIC SHARK DORSAL FIN (rounded glossy)
  const dorsal = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 14), glossyMat(0x455a64, 0.10));
  dorsal.scale.set(1.1, 1.8, 0.22);
  dorsal.position.set(0.12, 0.68, 0);
  dorsal.rotation.z = -0.2;
  g.add(dorsal);

  // Crescent caudal fin (tail)
  for (let s = -1; s <= 1; s += 2) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), glossyMat(0x455a64, 0.12));
    lobe.scale.set(1.5, 0.5, 0.22);
    lobe.position.set(-0.78, 0.32 + s * 0.14, 0);
    lobe.rotation.z = -Math.PI / 3 * s;
    g.add(lobe);
  }

  // Pectoral fins
  [-1, 1].forEach(s => {
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), glossyMat(0x546e7a, 0.14));
    fin.scale.set(1.5, 0.45, 0.22);
    fin.position.set(0.28, 0.22, s * 0.32);
    fin.rotation.y = s * 0.6;
    fin.rotation.z = -0.2;
    g.add(fin);
  });

  return g;
}

// =====================================================================
// 14. ELANG (Eagle) — Cute chubby brown eagle, white head, hooked beak
// =====================================================================
function buildElangToy() {
  const g = new THREE.Group();

  // Chubby brown body sphere
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.30, 28, 22), glossyMat(0x4e342e, 0.14));
  body.scale.set(1.2, 0.9, 0.95);
  body.position.y = 0.32;
  g.add(body);

  // Chubby white head (sea-eagle white crown)
  const headPos = new THREE.Vector3(0.28, 0.54, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.20, 24, 20), glossyMat(0xffffff, 0.12));
  head.position.copy(headPos);
  g.add(head);

  // Cute face
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.2);

  // Cute hooked yellow beak
  const beakPts = [
    new THREE.Vector3(0.42, 0.52, 0),
    new THREE.Vector3(0.56, 0.50, 0),
    new THREE.Vector3(0.58, 0.42, 0)
  ];
  g.add(tubeMesh(beakPts, 0.045, 10, 12, glossyMat(0xfbc02d, 0.12)));

  // Chubby spread wings (2-tone brown/tan)
  [-1, 1].forEach(s => {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.32, 22, 16), glossyMat(0x6d4c41, 0.13));
    wing.scale.set(1.5, 0.25, 0.8);
    wing.position.set(0.05, 0.38, s * 0.45);
    wing.rotation.z = -0.15;
    wing.rotation.x = s * 0.3;
    g.add(wing);
  });

  // Chubby tail fan
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), glossyMat(0x3e2723, 0.14));
  tail.scale.set(1.4, 0.25, 0.8);
  tail.position.set(-0.38, 0.28, 0);
  g.add(tail);

  // Cute chubby yellow talons
  [-1, 1].forEach(s => {
    const talon = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), glossyMat(0xfbc02d, 0.15));
    talon.position.set(0.08, 0.06, s * 0.14);
    g.add(talon);
  });

  return g;
}

// =====================================================================
// 15. BURUNG (Bird) — Cute chubby yellow/lime songbird
// =====================================================================
function buildBurungToy() {
  const g = new THREE.Group();

  // Chubby body sphere (lime green)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 28, 22), glossyMat(0x8bc34a, 0.12));
  body.scale.set(1.2, 0.9, 0.9);
  body.position.y = 0.30;
  g.add(body);

  // Chubby yellow head
  const headPos = new THREE.Vector3(0.22, 0.50, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 20), glossyMat(0xffeb3b, 0.12));
  head.position.copy(headPos);
  g.add(head);

  // Cute face
  addCuteFace(g, headPos, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), 1.15);

  // Cute blushing cheeks
  [-1, 1].forEach(s => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glossyMat(0xff8a80, 0.3));
    cheek.scale.set(1.2, 0.6, 0.5);
    cheek.position.set(headPos.x + 0.08, headPos.y - 0.04, s * 0.12);
    g.add(cheek);
  });

  // Cute tiny orange beak
  const beakPts = [
    new THREE.Vector3(0.36, 0.48, 0),
    new THREE.Vector3(0.48, 0.46, 0)
  ];
  g.add(tubeMesh(beakPts, 0.032, 8, 10, glossyMat(0xff9800, 0.12)));

  // Chubby open wings (dark green)
  [-1, 1].forEach(s => {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), glossyMat(0x558b2f, 0.13));
    wing.scale.set(1.4, 0.28, 0.75);
    wing.position.set(0.05, 0.34, s * 0.32);
    wing.rotation.z = -0.15;
    wing.rotation.x = s * 0.3;
    g.add(wing);
  });

  // Cute chubby tail fan
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), glossyMat(0x33691e, 0.14));
  tail.scale.set(1.4, 0.22, 0.7);
  tail.position.set(-0.30, 0.28, 0);
  g.add(tail);

  // Cute stubby feet
  [-1, 1].forEach(s => {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glossyMat(0xff9800, 0.15));
    foot.position.set(0.06, 0.05, s * 0.1);
    g.add(foot);
  });

  return g;
}

// ------------------------------------------------------------------
// Main — build Batch 3 models and export to target files
// ------------------------------------------------------------------
async function main() {
  const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');

  const targets = [
    { p: 'laut/ikan_kecil.glb', fn: buildIkanKecilToy },
    { p: 'laut/ikan_besar.glb', fn: buildIkanBesarToy },
    { p: 'laut/hiu.glb',        fn: buildHiuToy },
    { p: 'darat/elang.glb',     fn: buildElangToy },
    { p: 'hutan/elang.glb',     fn: buildElangToy },
    { p: 'sawah/elang.glb',     fn: buildElangToy },
    { p: 'hutan/burung.glb',    fn: buildBurungToy },
  ];

  console.log('\nFASE F2.2b — Building Batch 3 (Ikan Kecil, Ikan Besar, Hiu, Elang, Burung)...\n');
  for (const t of targets) {
    await exportGLB(t.fn(), path.join(BASE, t.p));
    await new Promise(r => setTimeout(r, 50));
  }
  console.log('\nBatch 3 completed successfully!\n');
}

module.exports = {
  buildIkanKecilToy,
  buildIkanBesarToy,
  buildHiuToy,
  buildElangToy,
  buildBurungToy
};

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}
