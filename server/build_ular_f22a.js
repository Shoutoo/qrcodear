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
  // HEAD — elevated, oval/chubby, connected to end of spiral
  // =====================================================================
  const neckPos = bodyCurve.getPoint(1.0); // end of spiral = neck
  const neckTan = bodyCurve.getTangent(1.0).normalize();

  // Chubby oval head
  const headGeo  = new THREE.SphereGeometry(0.2, 24, 18);
  const headMesh = new THREE.Mesh(headGeo, glossyMat(0x4caf50, 0.13));
  headMesh.scale.set(1.15, 0.95, 1.1); // slightly wider, a bit flatter top-bottom
  // Position head above and in front of neck
  headMesh.position.set(
    neckPos.x + neckTan.x * 0.18,
    neckPos.y + 0.1,  // raised above last coil
    neckPos.z + neckTan.z * 0.18
  );
  g.add(headMesh);

  // Neck connector (short fat tube from body end to head)
  const neckPts = [
    neckPos.clone(),
    neckPos.clone().addScaledVector(neckTan, 0.09).add(new THREE.Vector3(0, 0.05, 0)),
    headMesh.position.clone().add(new THREE.Vector3(-neckTan.x * 0.1, -0.05, -neckTan.z * 0.1))
  ];
  g.add(tubeMesh(neckPts, TUBE_R * 0.9, 8, 20, glossyMat(0x4caf50, 0.13)));

  // Chin/belly of head — yellow accent
  const chinGeo  = new THREE.SphereGeometry(0.17, 20, 14);
  const chinMesh = new THREE.Mesh(chinGeo, glossyMat(0xfff176, 0.18));
  chinMesh.scale.set(0.95, 0.7, 0.9);
  chinMesh.position.set(
    headMesh.position.x,
    headMesh.position.y - 0.04,
    headMesh.position.z + 0.05
  );
  g.add(chinMesh);

  // ---- EYES (2 big round cute eyes) ----
  const eyeOffsets = [
    new THREE.Vector3(-0.11,  0.06,  0.16),
    new THREE.Vector3( 0.11,  0.06,  0.16)
  ];
  eyeOffsets.forEach(off => {
    const eyePos = headMesh.position.clone().add(off);

    // Eye white base (small)
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 12), matteMat(0xf5f5f5, 0.4));
    eyeWhite.position.copy(eyePos);
    g.add(eyeWhite);

    // Black pupil (large, cute big-eye)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), matteMat(0x111111, 0.8));
    pupil.position.copy(eyePos);
    pupil.position.z += 0.02;
    g.add(pupil);

    // Highlight dot (small white spark — gives glossy/shiny look)
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), matteMat(0xffffff, 0.1));
    highlight.position.copy(eyePos);
    highlight.position.z += 0.04;
    highlight.position.y += 0.018;
    highlight.position.x += off.x > 0 ? -0.015 : 0.015;
    g.add(highlight);
  });

  // ---- MOUTH (small open slot — bottom of head front) ----
  const mouthPos = headMesh.position.clone().add(new THREE.Vector3(0, -0.08, 0.2));
  const mouthGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const mouth = new THREE.Mesh(mouthGeo, matteMat(0xd32f2f, 0.7));
  mouth.scale.set(0.95, 0.45, 0.7); // flat oval slot
  mouth.position.copy(mouthPos);
  g.add(mouth);

  // ---- FORKED TONGUE (red, thin, splits at tip) ----
  const tongueBase = headMesh.position.clone().add(new THREE.Vector3(0, -0.07, 0.23));
  // Main tongue stem
  const tongueStemPts = [
    tongueBase.clone(),
    tongueBase.clone().add(new THREE.Vector3(0, -0.02, 0.1))
  ];
  g.add(tubeMesh(tongueStemPts, 0.018, 4, 8, glossyMat(0xe53935, 0.2)));
  // Fork tips
  for (let s = -1; s <= 1; s += 2) {
    const tipPts = [
      tongueBase.clone().add(new THREE.Vector3(0, -0.02, 0.1)),
      tongueBase.clone().add(new THREE.Vector3(s * 0.04, -0.03, 0.16)),
      tongueBase.clone().add(new THREE.Vector3(s * 0.06, -0.03, 0.2))
    ];
    g.add(tubeMesh(tipPts, 0.012, 4, 6, glossyMat(0xe53935, 0.2)));
  }

  // ---- TAIL TIP — rounded nub at start of spiral ----
  const tailPos = bodyCurve.getPoint(0);
  const tailCap = new THREE.Mesh(new THREE.SphereGeometry(TUBE_R * 0.85, 12, 10), glossyMat(0x4caf50, 0.13));
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
