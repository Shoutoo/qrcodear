/**
 * FASE F2.2a — Ular: Cute Glossy 3D Toy Style
 *
 * Design spec:
 *  - Coiled body: helical spiral, rapi tersusun, jelas tiap lilitannya
 *  - Tube tebal/gempal (radius besar relatif panjang)
 *  - Warna 2-nada: hijau cerah (body) + kuning (belly strip inner side)
 *  - Material: MeshPhysicalMaterial, roughness 0.12, clearcoat 0.9
 *  - Segmen halus: 24 radial segments
 *  - Kepala oval membulat gempal, terangkat, wajah lucu
 *  - 2 mata hitam + titik highlight putih
 *  - Lidah bercabang merah
 *  - Lubang mulut terbuka kecil
 *
 * Run from server/ directory: node build_ular_f22a.js
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

// GLB export
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

// Glossy material
function glossyMat(hex, roughness = 0.15) {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    roughness,
    metalness: 0.0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
  });
}

// Matte highlight material (for eyes highlight dot - white)
function matteMat(hex, rough = 0.6) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: rough });
}

// Helper: tube from CatmullRomCurve3
function tubeMesh(pts, radius, segments, radSeg, mat, closed = false) {
  const curve = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.5);
  const geo   = new THREE.TubeGeometry(curve, segments, radius, radSeg, closed);
  return new THREE.Mesh(geo, mat);
}

// ------------------------------------------------------------------
// buildUlarToy — cute coiled snake
// ------------------------------------------------------------------
function buildUlarToy() {
  const g = new THREE.Group();

  // =====================================================================
  // COIL BODY
  // Design: helical spiral, 2.5 turns, each turn slightly elevated in Y
  //   so individual coils are visually separated.
  //   Radius of spiral: 0.42 (horizontal)
  //   Y offset per full turn: 0.22 (gap between coils)
  //   Tube radius: 0.115 (chubby!)
  //   Total angle: 2.5 * 2π
  //   Control points: 32 points evenly around the spiral
  // =====================================================================
  const TURNS   = 2.5;
  const SPIRAL_R = 0.42;
  const COIL_RISE = 0.22;  // Y gain per full turn (creates gap between coils)
  const TUBE_R   = 0.115;  // fat tube radius
  const N_PTS    = 48;     // control points for smooth spiral
  const spiralPts = [];

  for (let i = 0; i <= N_PTS; i++) {
    const t      = i / N_PTS;
    const angle  = t * TURNS * Math.PI * 2;
    const x      = Math.cos(angle) * SPIRAL_R;
    const z      = Math.sin(angle) * SPIRAL_R;
    const y      = t * TURNS * COIL_RISE + 0.12; // base 0.12 off ground
    spiralPts.push(new THREE.Vector3(x, y, z));
  }

  // Main body tube — green glossy
  const bodyCurve = new THREE.CatmullRomCurve3(spiralPts, false, 'catmullrom', 0.5);
  const bodyGeo   = new THREE.TubeGeometry(bodyCurve, 160, TUBE_R, 24, false);
  const bodyMesh  = new THREE.Mesh(bodyGeo, glossyMat(0x4caf50, 0.13));
  g.add(bodyMesh);

  // ---- BELLY STRIP (inner/underside yellow accent) ----
  // Same curve but with slightly smaller tube (0.09) offset DOWN in local normal
  // Simpler approach: a separate thin flat tube at slightly smaller radius
  // displaced toward the center of the coil (inner face)
  const BELLY_SPIRAL_R = SPIRAL_R * 0.78; // shifted inward
  const bellyPts = [];
  for (let i = 0; i <= N_PTS; i++) {
    const t      = i / N_PTS;
    const angle  = t * TURNS * Math.PI * 2;
    const x      = Math.cos(angle) * BELLY_SPIRAL_R;
    const z      = Math.sin(angle) * BELLY_SPIRAL_R;
    const y      = t * TURNS * COIL_RISE + 0.10; // slightly lower than body center
    bellyPts.push(new THREE.Vector3(x, y, z));
  }
  const bellyCurve = new THREE.CatmullRomCurve3(bellyPts, false, 'catmullrom', 0.5);
  const bellyGeo   = new THREE.TubeGeometry(bellyCurve, 160, TUBE_R * 0.55, 18, false);
  const bellyMesh  = new THREE.Mesh(bellyGeo, glossyMat(0xfff176, 0.18)); // bright yellow
  g.add(bellyMesh);

  // =====================================================================
  // HEAD — elevated, chubby oval, connected to end of spiral
  // FIX: larger head, eyes properly on upper-sides, no red nostrils,
  //      longer visible tongue, belly yellow strip extended to chin
  // =====================================================================
  const neckPos = bodyCurve.getPoint(1.0);
  const neckTan = bodyCurve.getTangent(1.0).normalize();

  // Head: bigger chubby oval — radius 0.24 (was 0.2), wider + taller
  const headGeo  = new THREE.SphereGeometry(0.24, 28, 20);
  const headMesh = new THREE.Mesh(headGeo, glossyMat(0x4caf50, 0.13));
  headMesh.scale.set(1.2, 1.0, 1.15); // wide oval, taller than before
  headMesh.position.set(
    neckPos.x + neckTan.x * 0.22,
    neckPos.y + 0.14,   // raised higher above last coil
    neckPos.z + neckTan.z * 0.22
  );
  g.add(headMesh);

  // Neck connector — fat tube, same green
  const neckPts = [
    neckPos.clone(),
    neckPos.clone().addScaledVector(neckTan, 0.11).add(new THREE.Vector3(0, 0.07, 0)),
    headMesh.position.clone().add(new THREE.Vector3(-neckTan.x * 0.12, -0.07, -neckTan.z * 0.12))
  ];
  g.add(tubeMesh(neckPts, TUBE_R * 0.92, 10, 22, glossyMat(0x4caf50, 0.13)));

  // Yellow belly strip extended from neck tube INTO chin of head
  // Approach: large flattened sphere for chin, positioned clearly under front of head
  const chinMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 22, 16), glossyMat(0xfff176, 0.16));
  chinMesh.scale.set(1.05, 0.52, 1.0); // flat wide oval underside
  chinMesh.position.set(
    headMesh.position.x + neckTan.x * 0.04,
    headMesh.position.y - 0.07,  // clearly below head centre
    headMesh.position.z + neckTan.z * 0.04 + 0.06
  );
  g.add(chinMesh);

  // Yellow neck belly strip connector — matches body belly tube end to chin
  const bellyNeckPts = [
    new THREE.Vector3(
      neckPos.x * 0.78,
      neckPos.y * 1.0 - 0.02,
      neckPos.z * 0.78
    ),
    chinMesh.position.clone().add(new THREE.Vector3(0, 0.04, -0.05))
  ];
  g.add(tubeMesh(bellyNeckPts, TUBE_R * 0.52, 8, 16, glossyMat(0xfff176, 0.16)));

  // ---- EYES: big, on upper-SIDES of head (not front center) ----
  // Position: offset sideways (±X) + slightly back (−Z) + high up (+Y)
  // so they sit on top-side, like real snake eyes
  const hp = headMesh.position; // shorthand
  [
    { side: -1 },
    { side:  1 }
  ].forEach(({ side }) => {
    // Eye BASE (white sclera — large so pupil reads as big)
    const eyeBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.072, 16, 14),
      matteMat(0xfafafa, 0.35)
    );
    eyeBase.position.set(
      hp.x + side * 0.19,   // wide to the side
      hp.y + 0.10,           // high on head (upper hemisphere)
      hp.z + 0.04            // slightly forward
    );
    g.add(eyeBase);

    // Black pupil — fills almost all of eye white (cute big-eye style)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.058, 14, 12),
      matteMat(0x0a0a0a, 0.9)
    );
    pupil.position.copy(eyeBase.position);
    // Push outward to sit on surface
    pupil.position.x += side * 0.022;
    pupil.position.z += 0.018;
    g.add(pupil);

    // Highlight dot — offset upper-inside of pupil (not centered)
    const hl = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 6),
      matteMat(0xffffff, 0.05)
    );
    hl.position.copy(pupil.position);
    hl.position.y += 0.024;
    hl.position.x += side * -0.014; // toward nose
    hl.position.z += 0.018;
    g.add(hl);
  });

  // ---- MOUTH — dark interior, NOT red, sits at front-bottom of head ----
  const mouthPos = hp.clone().add(new THREE.Vector3(0, -0.1, 0.22));
  const mouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 12, 8),
    matteMat(0x5d1010, 0.8) // dark red-brown, not bright red
  );
  mouth.scale.set(1.0, 0.38, 0.9); // wide flat slot
  mouth.position.copy(mouthPos);
  g.add(mouth);

  // ---- FORKED TONGUE — longer, clearly visible, bright red ----
  // Starts from mouth opening, projects forward+down
  const tongueRoot = mouthPos.clone().add(new THREE.Vector3(0, 0.01, 0.06));
  // Stem: longer than before
  const stemPts = [
    tongueRoot.clone(),
    tongueRoot.clone().add(new THREE.Vector3(0, -0.02, 0.1)),
    tongueRoot.clone().add(new THREE.Vector3(0, -0.03, 0.2))  // extended further
  ];
  g.add(tubeMesh(stemPts, 0.016, 6, 8, glossyMat(0xe53935, 0.18)));

  // Fork tips: wider spread and longer so they're clearly visible
  const forkBase = tongueRoot.clone().add(new THREE.Vector3(0, -0.03, 0.2));
  for (let s = -1; s <= 1; s += 2) {
    const forkPts = [
      forkBase.clone(),
      forkBase.clone().add(new THREE.Vector3(s * 0.05, -0.015, 0.08)),
      forkBase.clone().add(new THREE.Vector3(s * 0.09, -0.02, 0.15))  // longer fork
    ];
    g.add(tubeMesh(forkPts, 0.011, 5, 7, glossyMat(0xe53935, 0.18)));
  }

  // NO red nostrils — removed completely

  // ---- TAIL TIP — rounded nub at start of spiral ----
  const tailPos = bodyCurve.getPoint(0);
  const tailCap = new THREE.Mesh(
    new THREE.SphereGeometry(TUBE_R * 0.85, 12, 10),
    glossyMat(0x4caf50, 0.13)
  );
  tailCap.position.copy(tailPos);
  g.add(tailCap);

  return g;
}

// ------------------------------------------------------------------
// Main — only build Ular for F2.2a review
// ------------------------------------------------------------------
async function main() {
  const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');
  const targets = ['darat/ular.glb', 'hutan/ular.glb', 'sawah/ular.glb'];

  console.log('\nFASE F2.2a — Building Cute Toy Style Ular...\n');
  for (const t of targets) {
    await exportGLB(buildUlarToy(), path.join(BASE, t));
    await new Promise(r => setTimeout(r, 60));
  }
  console.log('\nDone! Push to GitHub & review in Studio before proceeding to other species.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
