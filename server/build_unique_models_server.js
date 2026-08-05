/**
 * FASE F2 — Build unique low-poly GLB models per species.
 * Run from: server/ directory: node build_unique_models_server.js
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const THREE = require('./node_modules/three');
const { GLTFExporter } = require('./node_modules/three/examples/jsm/exporters/GLTFExporter.js');

// ------------------------------------------------------------------
// Polyfills
// ------------------------------------------------------------------
const { Blob } = require('buffer');
global.Blob = Blob;
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buf => {
      const b64 = Buffer.from(buf).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
};

// ------------------------------------------------------------------
// Export helper
// ------------------------------------------------------------------
function exportGLB(object3D, outPath) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object3D,
      (result) => {
        const buf = result instanceof ArrayBuffer ? Buffer.from(result) : Buffer.from(JSON.stringify(result));
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, buf);
        console.log(`✅  Saved (${(buf.length / 1024).toFixed(1)} KB): ${path.basename(outPath)}`);
        resolve(buf.length);
      },
      (err) => {
        console.error(`❌  Failed: ${path.basename(outPath)}`, err);
        reject(err);
      },
      { binary: true }
    );
    // Keep event loop alive for the callback to fire
    setTimeout(() => {}, 500);
  });
}

// ------------------------------------------------------------------
// Material
// ------------------------------------------------------------------
function mat(hex) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75, metalness: 0.0 });
}

// ------------------------------------------------------------------
// Model builders
// ------------------------------------------------------------------

function buildRumput() {
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const h = 0.5 + (i % 3) * 0.25;
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.05, h, 4), mat(0x4caf50));
    m.position.set((i - 3) * 0.13, h / 2, 0);
    m.rotation.z = (i - 3) * 0.08;
    g.add(m);
  }
  return g;
}

function buildPadi() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.18;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.8, 5), mat(0x81c784));
    stalk.position.set(x, 0.4, 0);
    g.add(stalk);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), mat(0xf9a825));
    head.position.set(x, 0.87, 0);
    g.add(head);
  }
  return g;
}

function buildPohon() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.9, 6), mat(0x6d4c41));
  trunk.position.y = 0.45;
  g.add(trunk);
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.55, 7, 6), mat(0x2e7d32));
  canopy.scale.y = 1.25;
  canopy.position.y = 1.3;
  g.add(canopy);
  return g;
}

function buildAlga() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.16;
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.85, 4), mat(0x00897b));
    ribbon.position.set(x, 0.42, 0);
    ribbon.rotation.z = Math.sin(i * 1.1) * 0.35;
    g.add(ribbon);
  }
  const bub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 5, 4), mat(0x26a69a));
  bub.position.y = 1.0;
  g.add(bub);
  return g;
}

function buildBelalang() {
  const g = new THREE.Group();
  // body
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.5, 5);
  const body = new THREE.Mesh(bodyGeo, mat(0x8bc34a));
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.22;
  g.add(body);
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 4), mat(0x558b2f));
  head.position.set(0.32, 0.28, 0);
  g.add(head);
  // legs (3 each side)
  for (let s = -1; s <= 1; s += 2) {
    for (let j = 0; j < 3; j++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4), mat(0x33691e));
      leg.position.set(s * 0.15, 0.1, (j - 1) * 0.16);
      leg.rotation.z = s * 0.55;
      g.add(leg);
    }
  }
  // antennae
  for (let s = -1; s <= 1; s += 2) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 3), mat(0x1b5e20));
    ant.position.set(s * 0.06 + 0.32, 0.5, 0.16);
    ant.rotation.x = -0.65;
    g.add(ant);
  }
  return g;
}

function buildUlat() {
  const g = new THREE.Group();
  const n = 6;
  for (let i = 0; i < n; i++) {
    const r = 0.14 - i * 0.01;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 5), mat(i % 2 === 0 ? 0x7cb342 : 0x558b2f));
    seg.position.set(i * 0.22 - n * 0.11, 0.14, 0);
    g.add(seg);
  }
  // head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), mat(0xf57f17));
  head.position.set(-n * 0.11, 0.18, 0);
  g.add(head);
  // eyes
  for (let s = -1; s <= 1; s += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), mat(0x000000));
    eye.position.set(-n * 0.11 + 0.06, 0.26, s * 0.1);
    g.add(eye);
  }
  return g;
}

function buildUdang() {
  const g = new THREE.Group();
  const n = 8;
  for (let i = 0; i < n; i++) {
    const t     = i / (n - 1);
    const angle = t * Math.PI * 0.65 - 0.15;
    const r     = 0.09 - t * 0.025;
    const seg   = new THREE.Mesh(new THREE.SphereGeometry(r, 5, 4), mat(0xef9a9a));
    seg.position.set(Math.cos(angle) * 0.38 - 0.38, Math.sin(angle) * 0.38, 0);
    g.add(seg);
  }
  // claws
  for (let s = -1; s <= 1; s += 2) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 3), mat(0xe53935));
    claw.position.set(-0.6, 0.38 + s * 0.06, 0);
    claw.rotation.z = Math.PI / 2 + s * 0.3;
    g.add(claw);
  }
  // antennae
  for (let s = -1; s <= 1; s += 2) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 3), mat(0xe91e63));
    ant.position.set(-0.58 + s * 0.06, 0.52, 0);
    ant.rotation.z = s * 0.28 + 0.1;
    g.add(ant);
  }
  return g;
}

function buildKatak() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 6), mat(0x66bb6a));
  body.scale.y = 0.65;
  body.position.y = 0.19;
  g.add(body);
  for (let s = -1; s <= 1; s += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 5, 5), mat(0xfafafa));
    eye.position.set(s * 0.18, 0.39, 0.23);
    g.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 5), mat(0x1a237e));
    pupil.position.set(s * 0.18, 0.39, 0.3);
    g.add(pupil);
    // hind legs
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.25, 3, 6), mat(0x43a047));
    leg.position.set(s * 0.33, 0.05, -0.06);
    leg.rotation.z = s * 0.72;
    g.add(leg);
  }
  return g;
}

function buildIkanKecil() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 6), mat(0x42a5f5));
  body.scale.set(1.55, 0.75, 0.85);
  body.position.y = 0.2;
  g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 3), mat(0x1565c0));
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-0.4, 0.2, 0);
  g.add(tail);
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 3), mat(0x0d47a1));
  dorsal.position.set(0, 0.34, 0);
  g.add(dorsal);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), mat(0x000000));
  eye.position.set(0.24, 0.26, 0.15);
  g.add(eye);
  return g;
}

function buildIkanBesar() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 7, 6), mat(0xff8f00));
  body.scale.set(1.7, 0.75, 0.9);
  body.position.y = 0.32;
  g.add(body);
  // large dorsal
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 3), mat(0xe65100));
  dorsal.position.set(0.05, 0.64, 0);
  g.add(dorsal);
  // broad tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.38, 4), mat(0xe65100));
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-0.7, 0.32, 0);
  g.add(tail);
  // pectoral fins
  for (let s = -1; s <= 1; s += 2) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.16), mat(0xff6f00));
    fin.position.set(0.15, 0.18, s * 0.3);
    g.add(fin);
  }
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 5, 5), mat(0x212121));
  eye.position.set(0.45, 0.44, 0.28);
  g.add(eye);
  return g;
}

function buildUlar() {
  const g    = new THREE.Group();
  const n    = 10;
  const rMax = 0.48;
  for (let i = 0; i < n; i++) {
    const t     = i / n;
    const angle = t * Math.PI * 2 * 1.9;
    const r     = rMax * (1 - t * 0.28);
    const seg   = new THREE.Mesh(new THREE.SphereGeometry(0.1 - t * 0.04, 6, 4), mat(0x8d6e63));
    seg.position.set(Math.cos(angle) * r, 0.05 + i * 0.055, Math.sin(angle) * r);
    g.add(seg);
  }
  // head
  const angle = n / n * Math.PI * 2 * 1.9;
  const head  = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), mat(0x5d4037));
  head.position.set(Math.cos(angle) * rMax * 0.72, 0.05 + n * 0.055 + 0.1, Math.sin(angle) * rMax * 0.72);
  g.add(head);
  // tongue (forked)
  for (let s = -1; s <= 1; s += 2) {
    const tongue = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 3), mat(0xe53935));
    tongue.position.copy(head.position);
    tongue.position.y -= 0.01;
    tongue.position.z += 0.16 + s * 0.05;
    tongue.rotation.x = Math.PI / 2;
    tongue.rotation.z = s * 0.25;
    g.add(tongue);
  }
  return g;
}

function buildElang() {
  const g = new THREE.Group();
  // body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), mat(0x4e342e));
  body.scale.set(1.4, 0.82, 1.0);
  body.position.y = 0.3;
  g.add(body);
  // wings spread
  for (let s = -1; s <= 1; s += 2) {
    const wing1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.045, 0.27), mat(0x6d4c41));
    wing1.position.set(s * 0.48, 0.32, 0.01);
    wing1.rotation.z = s * -0.18;
    g.add(wing1);
    const wing2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.035, 0.16), mat(0x4e342e));
    wing2.position.set(s * 0.9, 0.28, 0.01);
    wing2.rotation.z = s * -0.42;
    g.add(wing2);
    // primary feathers
    for (let f = 0; f < 3; f++) {
      const feather = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.06), mat(0x3e2723));
      feather.position.set(s * (1.04 + f * 0.1), 0.26 - f * 0.03, 0);
      feather.rotation.z = s * (-0.55 - f * 0.1);
      g.add(feather);
    }
  }
  // head (white-tipped)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), mat(0xffffff));
  head.position.set(0.32, 0.56, 0);
  g.add(head);
  // hooked beak
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), mat(0xf9a825));
  beak.rotation.z = Math.PI / 2;
  beak.position.set(0.49, 0.51, 0);
  g.add(beak);
  // tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), mat(0x4e342e));
  tail.rotation.z = -Math.PI / 2;
  tail.position.set(-0.46, 0.27, 0);
  g.add(tail);
  return g;
}

function buildHiu() {
  const g = new THREE.Group();
  // streamlined torpedo body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 6), mat(0x78909c));
  body.scale.set(2.6, 0.68, 0.82);
  body.position.y = 0.3;
  g.add(body);
  // tall dorsal fin (iconic shark shape)
  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.52, 3), mat(0x546e7a));
  dorsal.position.set(0.12, 0.74, 0);
  g.add(dorsal);
  // pectoral fins (angled down)
  for (let s = -1; s <= 1; s += 2) {
    const pec = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.22), mat(0x607d8b));
    pec.position.set(s * 0.32, 0.14, 0.16);
    pec.rotation.z = s * 0.35;
    g.add(pec);
  }
  // crescent caudal (tail) fin
  for (let s = -1; s <= 1; s += 2) {
    const lobe = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 3), mat(0x546e7a));
    lobe.rotation.z = -Math.PI / 2 + s * 0.52;
    lobe.position.set(-0.86, 0.3 + s * 0.13, 0);
    g.add(lobe);
  }
  // snout eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 5, 5), mat(0x000000));
  eye.position.set(0.65, 0.4, 0.22);
  g.add(eye);
  return g;
}

function buildJamur() {
  const g = new THREE.Group();
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.42, 7), mat(0xfafafa));
  stalk.position.y = 0.21;
  g.add(stalk);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), mat(0xd32f2f));
  cap.scale.y = 0.55;
  cap.position.y = 0.58;
  g.add(cap);
  for (let i = 0; i < 5; i++) {
    const theta = (i / 5) * Math.PI * 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 4, 4), mat(0xffffff));
    dot.position.set(Math.cos(theta) * 0.22, 0.62, Math.sin(theta) * 0.22);
    g.add(dot);
  }
  return g;
}

function buildBakteri() {
  const g = new THREE.Group();
  const positions = [
    [0, 0.1, 0], [0.22, 0.12, 0], [-0.2, 0.1, 0], [0.08, 0.24, 0.12],
    [-0.12, 0.22, -0.1], [0.16, 0.32, 0], [-0.14, 0.33, 0.1]
  ];
  positions.forEach(([x, y, z], idx) => {
    const r = 0.1 + (idx % 3) * 0.022;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 5, 4), mat(0x80deea));
    sphere.position.set(x, y, z);
    g.add(sphere);
    // flagella
    const flag = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 3), mat(0x26c6da));
    flag.position.set(x, y + r + 0.1, z);
    flag.rotation.z = ((idx % 3) - 1) * 0.5;
    g.add(flag);
  });
  return g;
}

function buildBurung() {
  const g = new THREE.Group();
  // body — distinct yellow-green small bird
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), mat(0x8bc34a));
  body.scale.set(1.25, 0.88, 1.0);
  body.position.y = 0.28;
  g.add(body);
  // folded wings
  for (let s = -1; s <= 1; s += 2) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.17), mat(0x558b2f));
    wing.position.set(s * 0.23, 0.3, 0);
    wing.rotation.z = s * -0.06;
    g.add(wing);
  }
  // bright yellow head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), mat(0xfdd835));
  head.position.set(0.22, 0.5, 0);
  g.add(head);
  // tiny beak (pointed — insect-eater)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 3), mat(0xf57f17));
  beak.rotation.z = Math.PI / 2;
  beak.position.set(0.36, 0.48, 0);
  g.add(beak);
  // eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.033, 5, 5), mat(0x111111));
  eye.position.set(0.27, 0.54, 0.1);
  g.add(eye);
  // forked tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 3), mat(0x33691e));
  tail.rotation.z = -Math.PI / 2;
  tail.position.set(-0.35, 0.25, 0);
  g.add(tail);
  return g;
}

// ------------------------------------------------------------------
// Species manifest
// ------------------------------------------------------------------
const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');

const SPECIES = [
  { p: 'darat/rumput.glb',    build: buildRumput   },
  { p: 'darat/belalang.glb',  build: buildBelalang },
  { p: 'darat/katak.glb',     build: buildKatak    },
  { p: 'darat/ular.glb',      build: buildUlar     },
  { p: 'darat/elang.glb',     build: buildElang    },
  { p: 'darat/jamur.glb',     build: buildJamur    },
  { p: 'hutan/pohon.glb',     build: buildPohon    },
  { p: 'hutan/ulat.glb',      build: buildUlat     },
  { p: 'hutan/burung.glb',    build: buildBurung   },
  { p: 'hutan/ular.glb',      build: buildUlar     },
  { p: 'hutan/elang.glb',     build: buildElang    },
  { p: 'hutan/jamur.glb',     build: buildJamur    },
  { p: 'laut/alga.glb',       build: buildAlga     },
  { p: 'laut/udang.glb',      build: buildUdang    },
  { p: 'laut/ikan_kecil.glb', build: buildIkanKecil},
  { p: 'laut/ikan_besar.glb', build: buildIkanBesar},
  { p: 'laut/hiu.glb',        build: buildHiu      },
  { p: 'laut/bakteri.glb',    build: buildBakteri  },
  { p: 'sawah/padi.glb',      build: buildPadi     },
  { p: 'sawah/belalang.glb',  build: buildBelalang },
  { p: 'sawah/katak.glb',     build: buildKatak    },
  { p: 'sawah/ular.glb',      build: buildUlar     },
  { p: 'sawah/elang.glb',     build: buildElang    },
  { p: 'sawah/jamur.glb',     build: buildJamur    },
];

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  console.log(`\nBuilding ${SPECIES.length} unique GLB models...\n`);
  let ok = 0; let fail = 0;
  for (const sp of SPECIES) {
    const outPath = path.join(BASE, sp.p);
    try {
      const obj = sp.build();
      await exportGLB(obj, outPath);
      ok++;
    } catch (err) {
      console.error(`  FAILED ${sp.p}:`, err.message);
      fail++;
    }
    // Small pause to let event loop flush
    await new Promise(r => setTimeout(r, 50));
  }
  console.log(`\nFinished: ${ok} saved, ${fail} failed.\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
