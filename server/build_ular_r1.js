/**
 * FASE F2.1-R1 — Rebuild Ular ONLY with open S-curve TubeGeometry.
 * Run from server/ directory: node build_ular_r1.js
 *
 * Key design rules (from FASE F2.1-R prompt):
 *  - Open path (NOT a loop/coil), start = head, end = tail
 *  - Max 2-3 WIDE, GENTLE S-bends (not tight repeated coils)
 *  - Radius tapers from thick (neck) → thin (tail tip)
 *  - Head elevated slightly (Y higher than body) for "alert" posture
 *  - Overall bounding box clearly elongated (X >> Y, Z)
 *  - Forked tongue from head
 *  - Pattern: alternating dark/light rings hinted by a second narrower
 *    tube slightly offset (visual segmentation without sphere beads)
 */
'use strict';

const path  = require('path');
const fs    = require('fs');
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

function mat(hex, rough = 0.75) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0 });
}

// ------------------------------------------------------------------
// buildUlar — OPEN S-CURVE, elongated, tapered, head elevated
//
// Coordinate layout (viewed from above):
//   HEAD at positive X, tail at negative X
//   S-bend uses Z axis for the lateral waves
//   Y axis: body hovers just above ground, head raised
//
// Control points form a gentle S — 3 inflection points, WIDE arcs:
//   Start (tail tip) -> curve left -> curve right -> head (elevated)
// ------------------------------------------------------------------
function buildUlar() {
  const g = new THREE.Group();

  // ---- BODY: tapered tube along open S-curve ----
  // Points run from TAIL (left) → HEAD (right, elevated)
  // X range: -1.1 → +1.0  (total ~2.1 units long)
  // Z displacement: ±0.35 for gentle S bends
  // Y: 0.04 at tail, rises to 0.22 at head
  const pts = [
    new THREE.Vector3(-1.1,  0.04,  0.0),   // tail tip
    new THREE.Vector3(-0.75, 0.06, -0.28),   // first curve (left)
    new THREE.Vector3(-0.35, 0.08,  0.0),    // S inflection
    new THREE.Vector3( 0.05, 0.10,  0.32),   // second curve (right)
    new THREE.Vector3( 0.45, 0.13,  0.08),   // second S inflection
    new THREE.Vector3( 0.78, 0.17, -0.18),   // third gentle curve
    new THREE.Vector3( 1.0,  0.22,  0.0),    // neck (head joins here)
  ];

  const SEGS   = 80;   // tube length segments
  const RAD_S  = 10;   // radial segments around tube
  const curve  = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);

  // Build custom tapered tube geometry manually
  const positions = [];
  const normals   = [];
  const uvs       = [];
  const indices   = [];

  for (let i = 0; i <= SEGS; i++) {
    const t   = i / SEGS;
    // Radius: thick at neck (t≈1), thinner at tail (t=0), very thin at tip
    const r   = 0.025 + (1 - Math.pow(1 - t, 1.5)) * 0.065; // 0.025 tail → 0.09 neck
    const pos = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    // Build local frame: up → binormal → normal
    const worldUp = new THREE.Vector3(0, 1, 0);
    const bi = new THREE.Vector3().crossVectors(tan, worldUp).normalize();
    const no = new THREE.Vector3().crossVectors(bi, tan).normalize();

    for (let j = 0; j <= RAD_S; j++) {
      const theta = (j / RAD_S) * Math.PI * 2;
      const cr    = bi.clone().multiplyScalar(Math.cos(theta) * r)
                      .add(no.clone().multiplyScalar(Math.sin(theta) * r));
      positions.push(pos.x + cr.x, pos.y + cr.y, pos.z + cr.z);
      normals.push(cr.x / r, cr.y / r, cr.z / r);
      uvs.push(j / RAD_S, t);
    }
  }
  for (let i = 0; i < SEGS; i++) {
    for (let j = 0; j < RAD_S; j++) {
      const a = i * (RAD_S + 1) + j;
      const b = a + RAD_S + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  g.add(new THREE.Mesh(geo, mat(0x8d6e63)));

  // Pattern overlay: dark narrow bands at regular intervals (visual segmentation)
  // Done with thin flat TorusGeometry rings ALONG the curve
  for (let k = 1; k <= 12; k++) {
    const t  = k / 13;
    const r  = 0.026 + (1 - Math.pow(1 - t, 1.5)) * 0.066; // match body radius
    const p  = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.008, 4, 10),
      mat(k % 3 === 0 ? 0x5d4037 : 0x795548)
    );
    ring.position.copy(p);
    // orient torus ring perpendicular to tangent
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
    g.add(ring);
  }

  // ---- HEAD ----
  // Flattened sphere, slightly wider than neck, more elevated
  const headPos = curve.getPoint(1.0);
  const headTan = curve.getTangent(1.0).normalize();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(0x5d4037));
  head.scale.set(1.25, 0.8, 1.1); // flatten head slightly
  head.position.set(headPos.x + headTan.x * 0.1,
                    headPos.y + 0.04,  // raise head tip
                    headPos.z + headTan.z * 0.1);
  g.add(head);

  // Nostril bumps
  for (let s = -1; s <= 1; s += 2) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 3), mat(0x4e342e));
    n.position.set(head.position.x + headTan.x * 0.1,
                   head.position.y + 0.025,
                   head.position.z + headTan.z * 0.1 + s * 0.06);
    g.add(n);
  }

  // Eye (one visible side)
  const eyeRight = new THREE.Mesh(new THREE.SphereGeometry(0.028, 5, 5), mat(0xffe082));
  eyeRight.position.set(head.position.x - 0.02,
                        head.position.y + 0.07,
                        head.position.z + 0.08);
  g.add(eyeRight);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 4, 4), mat(0x000000));
  pupil.position.copy(eyeRight.position);
  pupil.position.z += 0.018;
  g.add(pupil);

  // ---- FORKED TONGUE ----
  const tBase = head.position.clone().addScaledVector(headTan, 0.12);
  for (let s = -1; s <= 1; s += 2) {
    const tkPts = [
      tBase.clone(),
      tBase.clone().addScaledVector(headTan, 0.06).add(new THREE.Vector3(0, 0, s * 0.04)),
      tBase.clone().addScaledVector(headTan, 0.12).add(new THREE.Vector3(0, -0.01, s * 0.08))
    ];
    const tkCurve = new THREE.CatmullRomCurve3(tkPts);
    const tkGeo   = new THREE.TubeGeometry(tkCurve, 5, 0.007, 4, false);
    g.add(new THREE.Mesh(tkGeo, mat(0xe53935)));
  }

  // ---- TAIL TIP CONE (tapered end visual reinforcement) ----
  const tailPos = curve.getPoint(0);
  const tailTan = curve.getTangent(0).negate();
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 5), mat(0x8d6e63));
  tip.position.copy(tailPos);
  tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailTan);
  g.add(tip);

  return g;
}

// ------------------------------------------------------------------
// Build only the Ular GLB (darat + hutan + sawah ecosystems)
// ------------------------------------------------------------------
async function main() {
  const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');
  const targets = [
    'darat/ular.glb',
    'hutan/ular.glb',
    'sawah/ular.glb'
  ];
  console.log('\nFASE F2.1-R1 — Building improved Ular (open S-curve)...\n');
  for (const t of targets) {
    await exportGLB(buildUlar(), path.join(BASE, t));
    await new Promise(r => setTimeout(r, 60));
  }
  console.log('\nDone. Review the Ular GLB before proceeding to other species.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
