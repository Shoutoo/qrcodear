/**
 * FASE F2.1 — Improved procedural models with proper continuous geometry.
 * Key fixes:
 *  - Ular/Ulat/Udang: TubeGeometry from CatmullRomCurve3 (no more sphere beads)
 *  - Bakteri: single CapsuleGeometry body + proper curving flagella tubes
 *  - Alga: TubeGeometry wavy ribbon
 *  - Padi: drooping grain heads
 *  - Katak: 4 legs (front + hind, hind larger)
 *  - Belalang: larger jump legs
 *  - All others: polished proportions
 *
 * Run from server/ directory: node build_unique_models_server.js
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
// Shared helper: TubeGeometry from array of Vec3 points
// ------------------------------------------------------------------
function tube(points, radius, tubeSeg, radSeg, hexColor) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo   = new THREE.TubeGeometry(curve, tubeSeg, radius, radSeg, false);
  return new THREE.Mesh(geo, mat(hexColor));
}

// ------------------------------------------------------------------
// MODEL BUILDERS — FASE F2.1 (improved)
// ------------------------------------------------------------------

// 🌿 Rumput — tall blades of varying heights, clearly vertical
function buildRumput() {
  const g = new THREE.Group();
  const heights = [0.7, 1.0, 0.8, 1.2, 0.9, 0.65, 1.05];
  const colors  = [0x4caf50, 0x388e3c, 0x66bb6a, 0x2e7d32, 0x43a047, 0x558b2f, 0x81c784];
  heights.forEach((h, i) => {
    // each blade is a thin tube curving slightly
    const xOff = (i - 3) * 0.14;
    const lean = (i - 3) * 0.04;
    const pts = [
      new THREE.Vector3(xOff, 0, 0),
      new THREE.Vector3(xOff + lean * 0.5, h * 0.5, 0),
      new THREE.Vector3(xOff + lean,       h,        0)
    ];
    const t = tube(pts, 0.022, 8, 4, colors[i]);
    g.add(t);
  });
  return g;
}

// 🌾 Padi — slender stalks with drooping grain heads
function buildPadi() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.2;
    // stalk
    const stalkPts = [
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(x, 0.5, 0),
      new THREE.Vector3(x, 0.85, 0)
    ];
    g.add(tube(stalkPts, 0.018, 6, 4, 0x81c784));
    // drooping grain head (malai) — curve downward
    const droop = (i % 2 === 0) ? -0.15 : -0.12;
    const grainPts = [
      new THREE.Vector3(x, 0.85, 0),
      new THREE.Vector3(x + droop * 0.5, 0.95, 0),
      new THREE.Vector3(x + droop, 0.88, 0)
    ];
    g.add(tube(grainPts, 0.032, 6, 5, 0xf9a825));
    // small oval grains hanging
    for (let k = 0; k < 3; k++) {
      const gk = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 3), mat(0xe65100));
      gk.scale.y = 1.4;
      gk.position.set(x + droop * (0.4 + k * 0.2), 0.93 - k * 0.04, (k - 1) * 0.05);
      g.add(gk);
    }
  }
  return g;
}

// 🌳 Pohon — solid trunk + layered canopy (2 sphere layers for fullness)
function buildPohon() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.0, 7), mat(0x6d4c41));
  trunk.position.y = 0.5;
  g.add(trunk);
  // lower canopy
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.58, 8, 7), mat(0x388e3c));
  lower.scale.y = 0.9;
  lower.position.y = 1.28;
  g.add(lower);
  // upper canopy (slightly smaller, lighter)
  const upper = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 6), mat(0x4caf50));
  upper.scale.y = 0.95;
  upper.position.y = 1.72;
  g.add(upper);
  return g;
}

// 🌊 Alga — TubeGeometry wavy ribbon shape
function buildAlga() {
  const g = new THREE.Group();
  // main ribbon (wavy tube)
  const pts = [
    new THREE.Vector3(-0.25, 0.0, 0),
    new THREE.Vector3(-0.05, 0.3, 0.08),
    new THREE.Vector3( 0.12, 0.55, -0.08),
    new THREE.Vector3(-0.1,  0.8, 0.06),
    new THREE.Vector3( 0.05, 1.05, 0)
  ];
  const ribbon = tube(pts, 0.055, 14, 6, 0x00897b);
  g.add(ribbon);
  // secondary ribbon
  const pts2 = [
    new THREE.Vector3(0.15, 0.0, 0),
    new THREE.Vector3(0.28, 0.28, -0.06),
    new THREE.Vector3(0.1,  0.56, 0.1),
    new THREE.Vector3(0.25, 0.82, 0)
  ];
  const ribbon2 = tube(pts2, 0.04, 10, 5, 0x26a69a);
  g.add(ribbon2);
  // gas bubbles (small spheres)
  [[0, 1.15, 0], [0.18, 0.9, 0], [-0.12, 0.7, 0.08]].forEach(([x, y, z]) => {
    const bub = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), mat(0x80cbc4));
    bub.position.set(x, y, z);
    g.add(bub);
  });
  return g;
}

// 🦗 Belalang — body + distinct LARGE jumping hind legs
function buildBelalang() {
  const g = new THREE.Group();
  // main body (elongated, horizontal)
  const bodyPts = [
    new THREE.Vector3(-0.28, 0.22, 0),
    new THREE.Vector3( 0.0,  0.26, 0),
    new THREE.Vector3( 0.3,  0.22, 0)
  ];
  g.add(tube(bodyPts, 0.1, 8, 6, 0x8bc34a));
  // abdomen taper
  const abdPts = [
    new THREE.Vector3(-0.28, 0.22, 0),
    new THREE.Vector3(-0.48, 0.19, 0),
    new THREE.Vector3(-0.62, 0.17, 0)
  ];
  g.add(tube(abdPts, 0.07, 6, 5, 0x558b2f));
  // head (larger)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 6, 5), mat(0x558b2f));
  head.position.set(0.38, 0.27, 0);
  g.add(head);
  // compound eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 5, 4), mat(0xffeb3b));
  eye.position.set(0.46, 0.31, 0.08);
  g.add(eye);
  // antennae (long tubes)
  for (let s = -1; s <= 1; s += 2) {
    const antPts = [
      new THREE.Vector3(0.38, 0.35, s * 0.04),
      new THREE.Vector3(0.42, 0.55, s * 0.12),
      new THREE.Vector3(0.4,  0.75, s * 0.18)
    ];
    g.add(tube(antPts, 0.01, 6, 3, 0x1b5e20));
  }
  // small walking legs (front 3 pairs)
  for (let j = 0; j < 3; j++) {
    for (let s = -1; s <= 1; s += 2) {
      const lx = -0.1 + j * 0.17;
      const legPts = [
        new THREE.Vector3(lx, 0.18, 0),
        new THREE.Vector3(lx + s * 0.08, 0.07, s * 0.14),
        new THREE.Vector3(lx + s * 0.14, 0.01, s * 0.22)
      ];
      g.add(tube(legPts, 0.016, 5, 3, 0x33691e));
    }
  }
  // BIG jumping hind legs
  for (let s = -1; s <= 1; s += 2) {
    // femur (thick upper part)
    const femPts = [
      new THREE.Vector3(-0.18, 0.22, 0),
      new THREE.Vector3(-0.22, 0.38, s * 0.18),
      new THREE.Vector3(-0.16, 0.48, s * 0.3)
    ];
    g.add(tube(femPts, 0.045, 6, 5, 0x8bc34a));
    // tibia (thin lower part, angled back down)
    const tibPts = [
      new THREE.Vector3(-0.16, 0.48, s * 0.3),
      new THREE.Vector3(-0.12, 0.28, s * 0.38),
      new THREE.Vector3(-0.06, 0.08, s * 0.42)
    ];
    g.add(tube(tibPts, 0.022, 6, 4, 0x558b2f));
  }
  return g;
}

// 🐛 Ulat — TubeGeometry single continuous caterpillar body (no sphere beads!)
function buildUlat() {
  const g = new THREE.Group();
  // continuous S-wave body tube, tapering at tail
  const pts = [
    new THREE.Vector3(-0.6, 0.14, 0),
    new THREE.Vector3(-0.4, 0.18, 0.06),
    new THREE.Vector3(-0.2, 0.14, -0.06),
    new THREE.Vector3( 0.0, 0.18, 0.06),
    new THREE.Vector3( 0.2, 0.14, -0.04),
    new THREE.Vector3( 0.4, 0.18, 0.04),
    new THREE.Vector3( 0.58, 0.12, 0)
  ];
  // body tube
  g.add(tube(pts, 0.12, 24, 8, 0x7cb342));
  // colour rings (dark bands — thin tubes overlaid)
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    const idx = Math.floor(t * (pts.length - 1));
    const a = pts[idx], b = pts[idx + 1] || pts[idx];
    const pos = new THREE.Vector3().lerpVectors(a, b, t * (pts.length - 1) - idx);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 5, 10), mat(0x558b2f));
    ring.position.copy(pos);
    g.add(ring);
  }
  // head (orange, slightly bigger)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 7, 6), mat(0xf57f17));
  head.position.set(-0.66, 0.17, 0);
  g.add(head);
  // eyes
  for (let s = -1; s <= 1; s += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 5, 4), mat(0x111111));
    eye.position.set(-0.72, 0.24, s * 0.1);
    g.add(eye);
  }
  // tiny prolegs (stubs under body)
  for (let i = 0; i < 5; i++) {
    for (let s = -1; s <= 1; s += 2) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 4), mat(0x33691e));
      leg.position.set(-0.3 + i * 0.18, 0.04, s * 0.1);
      g.add(leg);
    }
  }
  return g;
}

// 🦐 Udang — TubeGeometry curved shrimp body (no sphere beads!)
function buildUdang() {
  const g = new THREE.Group();
  // continuous curved body (prawn curl)
  const pts = [
    new THREE.Vector3(-0.55, 0.55, 0),
    new THREE.Vector3(-0.25, 0.72, 0),
    new THREE.Vector3( 0.05, 0.62, 0),
    new THREE.Vector3( 0.3,  0.38, 0),
    new THREE.Vector3( 0.38, 0.14, 0),
    new THREE.Vector3( 0.28,-0.04, 0)
  ];
  g.add(tube(pts, 0.09, 18, 7, 0xef9a9a));
  // tail fan (3 flat ovals)
  for (let i = -1; i <= 1; i++) {
    const fan = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 3), mat(0xe57373));
    fan.scale.set(1.5, 0.25, 0.7);
    fan.position.set(0.28 + i * 0.11, -0.12, i * 0.09);
    fan.rotation.z = i * 0.3 - 0.1;
    g.add(fan);
  }
  // rostrum (pointed spike above head)
  const rostrum = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.26, 4), mat(0xe53935));
  rostrum.rotation.z = Math.PI / 2;
  rostrum.position.set(-0.78, 0.58, 0);
  g.add(rostrum);
  // claws (2 small pinchers)
  for (let s = -1; s <= 1; s += 2) {
    const clawBase = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), mat(0xe53935));
    clawBase.position.set(-0.64, 0.55 + s * 0.07, s * 0.05);
    g.add(clawBase);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.13, 3), mat(0xb71c1c));
    claw.rotation.z = -Math.PI / 2 + s * 0.35;
    claw.position.set(-0.78, 0.55 + s * 0.07, s * 0.05);
    g.add(claw);
  }
  // antennae (long thin tubes)
  for (let s = -1; s <= 1; s += 2) {
    const antPts = [
      new THREE.Vector3(-0.55, 0.58, s * 0.03),
      new THREE.Vector3(-0.72, 0.72, s * 0.16),
      new THREE.Vector3(-0.82, 0.88, s * 0.3)
    ];
    g.add(tube(antPts, 0.01, 6, 3, 0xe91e63));
  }
  // walking legs (5 pairs, thin)
  for (let i = 0; i < 5; i++) {
    for (let s = -1; s <= 1; s += 2) {
      const t = i / 4;
      const px = -0.2 + t * 0.4;
      const py = 0.62 - t * 0.22;
      const legPts = [
        new THREE.Vector3(px, py, 0),
        new THREE.Vector3(px + s * 0.1, py - 0.18, s * 0.12),
        new THREE.Vector3(px + s * 0.14, py - 0.32, s * 0.2)
      ];
      g.add(tube(legPts, 0.012, 4, 3, 0xf48fb1));
    }
  }
  return g;
}

// 🐸 Katak — body + 4 legs (hind bigger than front, crouching pose)
function buildKatak() {
  const g = new THREE.Group();
  // squat oval body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.33, 8, 7), mat(0x66bb6a));
  body.scale.set(1.0, 0.6, 1.1);
  body.position.y = 0.2;
  g.add(body);
  // belly (lighter)
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.25, 7, 6), mat(0xa5d6a7));
  belly.scale.set(0.9, 0.45, 0.95);
  belly.position.set(0, 0.14, 0.18);
  g.add(belly);
  // head (merges into body at front)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 7, 6), mat(0x4caf50));
  head.scale.set(1.0, 0.7, 0.9);
  head.position.set(0, 0.28, 0.28);
  g.add(head);
  // bulging eyes on top of head
  for (let s = -1; s <= 1; s += 2) {
    const eyeBase = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), mat(0xfafafa));
    eyeBase.position.set(s * 0.17, 0.42, 0.26);
    g.add(eyeBase);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 5), mat(0x1a237e));
    pupil.position.set(s * 0.17, 0.42, 0.34);
    g.add(pupil);
  }
  // FRONT legs (small, supporting)
  for (let s = -1; s <= 1; s += 2) {
    const upper = tube([
      new THREE.Vector3(s * 0.22, 0.2, 0.22),
      new THREE.Vector3(s * 0.3, 0.1, 0.3),
      new THREE.Vector3(s * 0.35, 0.0, 0.38)
    ], 0.042, 6, 5, 0x43a047);
    g.add(upper);
    // foot
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 4), mat(0x388e3c));
    foot.scale.set(1.6, 0.5, 1.0);
    foot.position.set(s * 0.38, -0.02, 0.42);
    g.add(foot);
  }
  // HIND legs (larger — frog jump pose)
  for (let s = -1; s <= 1; s += 2) {
    // thigh going outward and back
    const thighPts = [
      new THREE.Vector3(s * 0.2, 0.14, -0.1),
      new THREE.Vector3(s * 0.42, 0.1, -0.22),
      new THREE.Vector3(s * 0.5, 0.03, -0.28)
    ];
    g.add(tube(thighPts, 0.075, 6, 6, 0x4caf50));
    // shin angling back up and forward
    const shinPts = [
      new THREE.Vector3(s * 0.5, 0.03, -0.28),
      new THREE.Vector3(s * 0.48, 0.04, 0.0),
      new THREE.Vector3(s * 0.44, 0.0, 0.2)
    ];
    g.add(tube(shinPts, 0.048, 6, 5, 0x388e3c));
    // long webbed foot
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 4), mat(0x2e7d32));
    foot.scale.set(1.8, 0.4, 1.1);
    foot.position.set(s * 0.44, -0.02, 0.3);
    g.add(foot);
  }
  return g;
}

// 🐟 Ikan Kecil — LatheGeometry torpedo body (continuous, no gaps)
function buildIkanKecil() {
  const g = new THREE.Group();
  // body via lathe profile (torpedo shape)
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t   = i / 12;
    const rad = Math.sin(t * Math.PI) * 0.18 + 0.01;
    pts.push(new THREE.Vector2(rad, t * 0.7 - 0.05));
  }
  const bodyGeo = new THREE.LatheGeometry(pts, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0x42a5f5));
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.22;
  g.add(body);
  // dorsal fin
  const dPoints = [
    new THREE.Vector3(0, 0.37, 0),
    new THREE.Vector3(0.06, 0.5, 0),
    new THREE.Vector3(-0.05, 0.44, 0)
  ];
  const dShape = new THREE.Shape();
  dShape.moveTo(0, 0); dShape.lineTo(0.08, 0.14); dShape.lineTo(-0.06, 0.14); dShape.lineTo(0, 0);
  const dorsalGeo = new THREE.ExtrudeGeometry(dShape, { depth: 0.01, bevelEnabled: false });
  const dorsal = new THREE.Mesh(dorsalGeo, mat(0x1565c0));
  dorsal.position.set(0.05, 0.32, 0);
  g.add(dorsal);
  // forked tail
  for (let s = -1; s <= 1; s += 2) {
    const lobe = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), mat(0x0d47a1));
    lobe.rotation.z = Math.PI / 2;
    lobe.rotation.x = s * 0.4;
    lobe.position.set(-0.4, 0.22 + s * 0.04, 0);
    g.add(lobe);
  }
  // eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 5), mat(0x000000));
  eye.position.set(0.28, 0.27, 0.13);
  g.add(eye);
  return g;
}

// 🐟 Ikan Besar — LatheGeometry larger torpedo + prominent fins
function buildIkanBesar() {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t   = i / 14;
    const rad = Math.sin(t * Math.PI) * 0.3 + 0.015;
    pts.push(new THREE.Vector2(rad, t * 1.1 - 0.08));
  }
  const bodyGeo = new THREE.LatheGeometry(pts, 12);
  const body = new THREE.Mesh(bodyGeo, mat(0xff8f00));
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.3;
  g.add(body);
  // prominent dorsal fin (extruded triangle)
  const dShape = new THREE.Shape();
  dShape.moveTo(0, 0); dShape.lineTo(0.14, 0.28); dShape.lineTo(-0.1, 0.28); dShape.lineTo(0, 0);
  const dorsalGeo = new THREE.ExtrudeGeometry(dShape, { depth: 0.015, bevelEnabled: false });
  const dorsal = new THREE.Mesh(dorsalGeo, mat(0xe65100));
  dorsal.position.set(0.05, 0.54, 0);
  g.add(dorsal);
  // forked tail (2 lobes)
  for (let s = -1; s <= 1; s += 2) {
    const lobe = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 4), mat(0xe65100));
    lobe.rotation.z = Math.PI / 2 + s * 0.35;
    lobe.position.set(-0.64, 0.3 + s * 0.1, 0);
    g.add(lobe);
  }
  // pectoral fins
  for (let s = -1; s <= 1; s += 2) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.18), mat(0xff6f00));
    fin.position.set(0.15, 0.16, s * 0.29);
    fin.rotation.z = s * 0.2;
    g.add(fin);
  }
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 5, 5), mat(0x212121));
  eye.position.set(0.44, 0.42, 0.26);
  g.add(eye);
  return g;
}

// 🐍 Ular — SINGLE TubeGeometry continuous S-curve body (no bead spheres!)
function buildUlar() {
  const g = new THREE.Group();
  // S-shaped coil of the snake body
  const pts = [
    new THREE.Vector3( 0.0,  0.06,  0.35),
    new THREE.Vector3( 0.32, 0.08,  0.18),
    new THREE.Vector3( 0.42, 0.1,  -0.06),
    new THREE.Vector3( 0.28, 0.12, -0.3),
    new THREE.Vector3( 0.0,  0.14, -0.42),
    new THREE.Vector3(-0.3,  0.16, -0.32),
    new THREE.Vector3(-0.42, 0.18, -0.06),
    new THREE.Vector3(-0.3,  0.2,   0.22),
    new THREE.Vector3( 0.0,  0.22,  0.38),
    new THREE.Vector3( 0.25, 0.24,  0.22),
    new THREE.Vector3( 0.35, 0.26, -0.02)
  ];
  // Variable-radius tube (thick at head, thin at tail)
  // Build manually to get tapered tube
  const curve = new THREE.CatmullRomCurve3(pts);
  const segments = 60;
  const positions = [];
  const normals   = [];
  const uvs       = [];
  const indices   = [];
  const radSeg = 8;
  for (let i = 0; i <= segments; i++) {
    const t  = i / segments;
    const r  = 0.095 * (1 - t * 0.72); // thickest at tail-end, thinned at tip
    const p  = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const up  = new THREE.Vector3(0, 1, 0);
    const bi  = new THREE.Vector3().crossVectors(tan, up).normalize();
    const no  = new THREE.Vector3().crossVectors(bi, tan).normalize();
    for (let j = 0; j <= radSeg; j++) {
      const theta = (j / radSeg) * Math.PI * 2;
      const cx = bi.x * Math.cos(theta) * r + no.x * Math.sin(theta) * r;
      const cy = bi.y * Math.cos(theta) * r + no.y * Math.sin(theta) * r;
      const cz = bi.z * Math.cos(theta) * r + no.z * Math.sin(theta) * r;
      positions.push(p.x + cx, p.y + cy, p.z + cz);
      normals.push(cx / r, cy / r, cz / r);
      uvs.push(j / radSeg, t);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radSeg; j++) {
      const a = i * (radSeg + 1) + j;
      const b = a + radSeg + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs,       2));
  geo.setIndex(indices);
  // pattern — alternating colour bands via vertex color not possible easily, use single color
  const snakeMesh = new THREE.Mesh(geo, mat(0x8d6e63));
  g.add(snakeMesh);
  // head (slightly bigger than body tip radius, flattened)
  const headPos = curve.getPoint(0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 6), mat(0x5d4037));
  head.scale.set(1.2, 0.7, 1.2);
  head.position.copy(headPos);
  g.add(head);
  // forked tongue
  const tongueBase = headPos.clone();
  const headTan = curve.getTangent(0).normalize();
  for (let s = -1; s <= 1; s += 2) {
    const tkPts = [
      tongueBase.clone().addScaledVector(headTan, 0.12),
      tongueBase.clone().addScaledVector(headTan, 0.22).add(new THREE.Vector3(s * 0.04, 0, 0))
    ];
    g.add(tube(tkPts, 0.008, 4, 3, 0xe53935));
  }
  return g;
}

// 🦅 Elang — wide-wingspan eagle, clear head + beak
function buildElang() {
  const g = new THREE.Group();
  // body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 6), mat(0x4e342e));
  body.scale.set(1.3, 0.85, 1.0);
  body.position.y = 0.3;
  g.add(body);
  // wings — wide flat panels, 2 segments per side (inner + outer)
  for (let s = -1; s <= 1; s += 2) {
    // inner wing (connected to body)
    const iShape = new THREE.Shape();
    iShape.moveTo(0, 0); iShape.lineTo(s * 0.7, 0); iShape.lineTo(s * 0.65, -0.28); iShape.lineTo(0, -0.12);
    const iGeo = new THREE.ExtrudeGeometry(iShape, { depth: 0.04, bevelEnabled: false });
    const inner = new THREE.Mesh(iGeo, mat(0x6d4c41));
    inner.position.set(0, 0.33, -0.1);
    inner.rotation.x = -0.15;
    g.add(inner);
    // outer wing tip
    const oShape = new THREE.Shape();
    oShape.moveTo(s * 0.7, 0); oShape.lineTo(s * 1.2, 0.05); oShape.lineTo(s * 1.15, -0.22); oShape.lineTo(s * 0.65, -0.28);
    const oGeo = new THREE.ExtrudeGeometry(oShape, { depth: 0.03, bevelEnabled: false });
    const outer = new THREE.Mesh(oGeo, mat(0x4e342e));
    outer.position.set(0, 0.32, -0.08);
    outer.rotation.x = -0.2;
    outer.rotation.z = s * -0.12;
    g.add(outer);
  }
  // white head (sea-eagle white crown)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 7, 6), mat(0xfafafa));
  head.position.set(0.28, 0.58, 0.0);
  g.add(head);
  // hooked yellow beak
  const beakPts = [
    new THREE.Vector3(0.42, 0.54, 0),
    new THREE.Vector3(0.55, 0.53, 0),
    new THREE.Vector3(0.58, 0.47, 0)
  ];
  g.add(tube(beakPts, 0.032, 5, 4, 0xf9a825));
  // tail fan
  const tShape = new THREE.Shape();
  tShape.moveTo(0, 0); tShape.lineTo(-0.25, -0.32); tShape.lineTo(0.25, -0.32); tShape.lineTo(0, 0);
  const tGeo = new THREE.ExtrudeGeometry(tShape, { depth: 0.03, bevelEnabled: false });
  const tail = new THREE.Mesh(tGeo, mat(0x4e342e));
  tail.position.set(-0.08, 0.22, -0.12);
  tail.rotation.x = 0.3;
  g.add(tail);
  // talons
  for (let s = -1; s <= 1; s += 2) {
    const talon = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 3), mat(0xfdd835));
    talon.rotation.z = Math.PI;
    talon.position.set(s * 0.1, 0.04, 0.12);
    g.add(talon);
  }
  return g;
}

// 🦈 Hiu — LatheGeometry torpedo body + tall dorsal fin
function buildHiu() {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t   = i / 16;
    // broader in front, tapers sharply at tail
    const rad = Math.sin(Math.pow(t, 0.7) * Math.PI) * 0.3 + 0.01;
    pts.push(new THREE.Vector2(rad, t * 1.4 - 0.1));
  }
  const bodyGeo = new THREE.LatheGeometry(pts, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0x78909c));
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.28;
  g.add(body);
  // TALL dorsal fin — the shark's iconic feature
  const dShape = new THREE.Shape();
  dShape.moveTo(0, 0); dShape.lineTo(0.06, 0.55); dShape.lineTo(-0.18, 0.55); dShape.lineTo(-0.22, 0); dShape.lineTo(0, 0);
  const dGeo = new THREE.ExtrudeGeometry(dShape, { depth: 0.018, bevelEnabled: false });
  const dorsal = new THREE.Mesh(dGeo, mat(0x546e7a));
  dorsal.position.set(0.15, 0.5, 0);
  g.add(dorsal);
  // pectoral fins (angled)
  for (let s = -1; s <= 1; s += 2) {
    const fShape = new THREE.Shape();
    fShape.moveTo(0, 0); fShape.lineTo(s * 0.38, -0.08); fShape.lineTo(s * 0.3, -0.24); fShape.lineTo(0.04, -0.12);
    const fGeo = new THREE.ExtrudeGeometry(fShape, { depth: 0.02, bevelEnabled: false });
    const fin  = new THREE.Mesh(fGeo, mat(0x607d8b));
    fin.position.set(0.24, 0.2, 0);
    fin.rotation.x = s * 0.35 - 0.1;
    g.add(fin);
  }
  // crescent caudal fin (tail)
  for (let s = -1; s <= 1; s += 2) {
    const lShape = new THREE.Shape();
    lShape.moveTo(0, 0); lShape.lineTo(s * 0.08, 0.26); lShape.lineTo(-0.22, 0.22); lShape.lineTo(-0.18, 0);
    const lGeo  = new THREE.ExtrudeGeometry(lShape, { depth: 0.015, bevelEnabled: false });
    const lobe  = new THREE.Mesh(lGeo, mat(0x546e7a));
    lobe.position.set(-0.65, 0.28 + s * 0.06, 0);
    g.add(lobe);
  }
  // eye (small, beady shark eye)
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 5), mat(0x000000));
  eye.position.set(0.56, 0.38, 0.24);
  g.add(eye);
  return g;
}

// 🍄 Jamur — proper mushroom cap shape (umbrella, not just squished sphere)
function buildJamur() {
  const g = new THREE.Group();
  // stalk
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.45, 8), mat(0xfafafa));
  stalk.position.y = 0.22;
  g.add(stalk);
  // cap via lathe (umbrella profile)
  const capPts = [
    new THREE.Vector2(0.0,  0.0),
    new THREE.Vector2(0.1,  0.0),
    new THREE.Vector2(0.28, 0.04),
    new THREE.Vector2(0.42, 0.14),
    new THREE.Vector2(0.48, 0.26),
    new THREE.Vector2(0.44, 0.38),
    new THREE.Vector2(0.3,  0.46),
    new THREE.Vector2(0.12, 0.48),
    new THREE.Vector2(0.0,  0.48)
  ];
  const capGeo = new THREE.LatheGeometry(capPts, 12);
  const cap = new THREE.Mesh(capGeo, mat(0xd32f2f));
  cap.position.y = 0.46;
  g.add(cap);
  // gills underside (ring)
  const gills = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 4, 10), mat(0xef9a9a));
  gills.rotation.x = Math.PI / 2;
  gills.position.y = 0.5;
  g.add(gills);
  // white dots on cap
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * Math.PI * 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), mat(0xffffff));
    dot.position.set(Math.cos(theta) * 0.28, 0.72, Math.sin(theta) * 0.28);
    g.add(dot);
  }
  // centre dot
  const cDot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), mat(0xffffff));
  cDot.position.set(0, 0.92, 0);
  g.add(cDot);
  return g;
}

// 🦠 Bakteri — single CapsuleGeometry body + distinct curving flagella tubes
function buildBakteri() {
  const g = new THREE.Group();
  // main body — single capsule (no scattered spheres!)
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.28, 6, 10), mat(0x80deea));
  body.rotation.z = Math.PI / 6;
  body.position.y = 0.22;
  g.add(body);
  // surface texture bumps (small attached spheres representing pili)
  for (let i = 0; i < 8; i++) {
    const theta = (i / 8) * Math.PI * 2;
    const pili = new THREE.Mesh(new THREE.SphereGeometry(0.028, 4, 3), mat(0x26c6da));
    pili.position.set(Math.cos(theta) * 0.16, 0.22 + Math.sin(theta) * 0.16, 0);
    g.add(pili);
  }
  // FLAGELLA — curving thin tubes radiating out (not straight cylinders!)
  const flagColors = [0x26c6da, 0x00acc1, 0x00bcd4, 0x4dd0e1];
  const flagConfigs = [
    // [startX, startY, midX, midY, endX, endY]
    [0.1,  0.35, 0.25, 0.52, 0.15,  0.72],
    [-0.1, 0.35, -0.28, 0.5, -0.22, 0.72],
    [0.18, 0.18, 0.38, 0.22, 0.52,  0.12],
    [-0.18, 0.12, -0.42, 0.08, -0.58, 0.18],
    [0.05, 0.08, 0.12, -0.08, 0.05, -0.28],
    [-0.05, 0.08, -0.18, -0.06, -0.25, -0.22],
    [0.16, 0.22, 0.32, 0.14, 0.42, 0.3],
    [-0.14, 0.3, -0.35, 0.35, -0.42, 0.22]
  ];
  flagConfigs.forEach(([sx, sy, mx, my, ex, ey], idx) => {
    const fPts = [
      new THREE.Vector3(sx, sy, 0),
      new THREE.Vector3(mx, my, (idx % 2 === 0 ? 0.06 : -0.06)),
      new THREE.Vector3(ex, ey, 0)
    ];
    const flagella = tube(fPts, 0.012, 8, 4, flagColors[idx % flagColors.length]);
    g.add(flagella);
  });
  // second smaller bacterium nearby (budding)
  const bud = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.16, 5, 8), mat(0x4dd0e1));
  bud.rotation.z = -Math.PI / 4;
  bud.position.set(0.3, 0.06, 0.1);
  g.add(bud);
  return g;
}

// 🐦 Burung — small insect-eating bird with open wings
function buildBurung() {
  const g = new THREE.Group();
  // body via lathe (teardrop bird body)
  const bPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.1, 0.04),
    new THREE.Vector2(0.16, 0.14),
    new THREE.Vector2(0.18, 0.26),
    new THREE.Vector2(0.15, 0.38),
    new THREE.Vector2(0.08, 0.46),
    new THREE.Vector2(0.0, 0.5)
  ];
  const bodyGeo = new THREE.LatheGeometry(bPts, 10);
  const body = new THREE.Mesh(bodyGeo, mat(0x8bc34a));
  body.rotation.x = -Math.PI / 2;
  body.position.set(0, 0.28, 0.05);
  g.add(body);
  // WINGS — open and tipped up (angled planes, clearly bird-like)
  for (let s = -1; s <= 1; s += 2) {
    const wShape = new THREE.Shape();
    wShape.moveTo(0, 0); wShape.lineTo(s * 0.65, 0.08); wShape.lineTo(s * 0.6, -0.2); wShape.lineTo(s * 0.12, -0.14);
    const wGeo = new THREE.ExtrudeGeometry(wShape, { depth: 0.028, bevelEnabled: false });
    const wing = new THREE.Mesh(wGeo, mat(0x558b2f));
    wing.position.set(0, 0.35, 0);
    wing.rotation.x = 0.25;
    wing.rotation.z = s * -0.18;
    g.add(wing);
  }
  // head (round, bright yellow)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 6), mat(0xfdd835));
  head.position.set(0.0, 0.55, 0.12);
  g.add(head);
  // pointed beak
  const beakPts = [
    new THREE.Vector3(0.0, 0.52, 0.23),
    new THREE.Vector3(0.0, 0.5, 0.35),
    new THREE.Vector3(0.0, 0.48, 0.44)
  ];
  g.add(tube(beakPts, 0.025, 4, 3, 0xf57f17));
  // eye
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 5, 5), mat(0x111111));
  eye.position.set(0.09, 0.58, 0.2);
  g.add(eye);
  // forked tail
  for (let s = -1; s <= 1; s += 2) {
    const tPts = [
      new THREE.Vector3(0, 0.22, -0.02),
      new THREE.Vector3(s * 0.06, 0.16, -0.18),
      new THREE.Vector3(s * 0.1, 0.1, -0.3)
    ];
    g.add(tube(tPts, 0.028, 5, 4, 0x33691e));
  }
  return g;
}

// ------------------------------------------------------------------
// Species manifest (unchanged paths — replace files in-place)
// ------------------------------------------------------------------
const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');

const SPECIES = [
  { p: 'darat/rumput.glb',    build: buildRumput    },
  { p: 'darat/belalang.glb',  build: buildBelalang  },
  { p: 'darat/katak.glb',     build: buildKatak     },
  { p: 'darat/ular.glb',      build: buildUlar      },
  { p: 'darat/elang.glb',     build: buildElang     },
  { p: 'darat/jamur.glb',     build: buildJamur     },
  { p: 'hutan/pohon.glb',     build: buildPohon     },
  { p: 'hutan/ulat.glb',      build: buildUlat      },
  { p: 'hutan/burung.glb',    build: buildBurung    },
  { p: 'hutan/ular.glb',      build: buildUlar      },
  { p: 'hutan/elang.glb',     build: buildElang     },
  { p: 'hutan/jamur.glb',     build: buildJamur     },
  { p: 'laut/alga.glb',       build: buildAlga      },
  { p: 'laut/udang.glb',      build: buildUdang     },
  { p: 'laut/ikan_kecil.glb', build: buildIkanKecil },
  { p: 'laut/ikan_besar.glb', build: buildIkanBesar },
  { p: 'laut/hiu.glb',        build: buildHiu       },
  { p: 'laut/bakteri.glb',    build: buildBakteri   },
  { p: 'sawah/padi.glb',      build: buildPadi      },
  { p: 'sawah/belalang.glb',  build: buildBelalang  },
  { p: 'sawah/katak.glb',     build: buildKatak     },
  { p: 'sawah/ular.glb',      build: buildUlar      },
  { p: 'sawah/elang.glb',     build: buildElang     },
  { p: 'sawah/jamur.glb',     build: buildJamur     },
];

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  console.log(`\nFASE F2.1 — Building ${SPECIES.length} improved GLB models...\n`);
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
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`\nFinished: ${ok} saved, ${fail} failed.\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
