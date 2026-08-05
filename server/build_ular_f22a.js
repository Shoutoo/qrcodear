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
  // HEAD — LOGIKA KONSTRUKSI BENAR (FASE F2.2a-logika)
  //
  // Prinsip:
  //  1. neckPos  = curve.getPointAt(1)   → posisi ujung badan
  //  2. neckTan  = curve.getTangentAt(1) → arah badan menuju → arah moncong
  //  3. headGroup.position = neckPos + neckTan * offset → kepala DI DEPAN ujung badan
  //  4. headGroup.lookAt(headGroup.position + neckTan) → rotasi otomatis ikut tangent
  //  5. Semua anak (mata, mulut, lidah, chin) pakai posisi LOKAL headGroup
  //     → otomatis simetris & ikut orientasi kepala yang benar
  // =====================================================================
  const neckPos = bodyCurve.getPointAt(1.0);
  const neckTan = bodyCurve.getTangentAt(1.0).normalize();

  // Neck connector tube (body end → head base) — built BEFORE headGroup
  // because we need world positions for the tube control points
  const headCenter = neckPos.clone().addScaledVector(neckTan, 0.26)
                       .add(new THREE.Vector3(0, 0.08, 0)); // slight Y lift for "alert" pose

  const neckPts = [
    neckPos.clone(),
    neckPos.clone().addScaledVector(neckTan, 0.13).add(new THREE.Vector3(0, 0.04, 0)),
    headCenter.clone().addScaledVector(neckTan, -0.12)
  ];
  g.add(tubeMesh(neckPts, TUBE_R * 0.92, 10, 22, glossyMat(0x4caf50, 0.13)));

  // Yellow belly connector from body belly tube to head chin area
  const bellyNeckEnd = headCenter.clone().add(new THREE.Vector3(0, -0.09, 0));
  const bellyNeckPts = [
    neckPos.clone().addScaledVector(neckTan, -0.05).add(new THREE.Vector3(0, -0.06, 0)),
    bellyNeckEnd.clone().addScaledVector(neckTan, -0.08)
  ];
  g.add(tubeMesh(bellyNeckPts, TUBE_R * 0.5, 8, 16, glossyMat(0xfff176, 0.16)));

  // ---- HEAD GROUP — all face children go inside this ----
  const headGroup = new THREE.Group();
  headGroup.position.copy(headCenter);
  // Orient headGroup so its LOCAL +Z axis points along neckTan
  // lookAt target = headCenter + neckTan (a point directly in front)
  const lookTarget = headCenter.clone().add(neckTan);
  headGroup.lookAt(lookTarget);
  g.add(headGroup);

  // HEAD MESH — in local space: centre at origin, moncong points +Z
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 28, 20),
    glossyMat(0x4caf50, 0.13)
  );
  headMesh.scale.set(1.18, 0.95, 1.22); // wider in Z (moncong direction), oval
  // No position needed — sits at group origin (= headCenter in world)
  headGroup.add(headMesh);

  // CHIN / BELLY — flattened sphere below and slightly forward in local space
  // Local: -Y = below head, +Z = toward moncong
  const chin = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 22, 16),
    glossyMat(0xfff176, 0.16)
  );
  chin.scale.set(1.1, 0.45, 1.05);
  chin.position.set(0, -0.1, 0.04); // local: below centre, slightly forward
  headGroup.add(chin);

  // ---- EYES — local space, perfectly symmetric ----
  // Local axes: +X=right, +Y=up, +Z=forward(moncong)
  // Eyes sit on upper-front-sides of head
  const EYE_SIDE   = 0.18;  // lateral offset (X)
  const EYE_UP     = 0.09;  // upward offset (Y)
  const EYE_FWD    = 0.12;  // forward offset (Z) → ensures both eyes visible from front

  [-1, 1].forEach(side => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * EYE_SIDE, EYE_UP, EYE_FWD);
    headGroup.add(eyeGroup);

    // White sclera base
    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 14),
      matteMat(0xfafafa, 0.3)
    );
    // Sclera sits at eyeGroup origin; push slightly outward (X) so it protrudes from head
    sclera.position.set(side * 0.02, 0, 0.02);
    eyeGroup.add(sclera);

    // Big black pupil — fills almost entire eye (cute toy style)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 14, 12),
      matteMat(0x080808, 0.95)
    );
    pupil.position.set(side * 0.03, 0, 0.04);
    eyeGroup.add(pupil);

    // Highlight — small white dot, upper-inside offset (not perfectly centered)
    const hl = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 8, 6),
      matteMat(0xffffff, 0.05)
    );
    hl.position.set(side * 0.018, 0.028, 0.06);
    eyeGroup.add(hl);
  });

  // ---- MOUTH — dark interior slot, front-bottom in local space ----
  const mouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 12, 8),
    matteMat(0x5d1010, 0.85)
  );
  mouth.scale.set(1.05, 0.35, 0.9); // wide flat oval
  mouth.position.set(0, -0.1, 0.22); // local: below + forward
  headGroup.add(mouth);

  // ---- FORKED TONGUE — curved tubes in local space, from mouth forward ----
  // All positions are LOCAL to headGroup → correctly follows head orientation
  // Stem starts from mouth opening (+Z) and projects forward (+Z) and slightly down (-Y)
  const TONGUE_START = new THREE.Vector3(0, -0.09, 0.24);
  const TONGUE_MID   = new THREE.Vector3(0, -0.12, 0.34);
  const FORK_BASE    = new THREE.Vector3(0, -0.14, 0.42);

  // Stem tube (single, going forward from mouth)
  const stemCurve = new THREE.CatmullRomCurve3([
    TONGUE_START,
    TONGUE_MID,
    FORK_BASE
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.016, 8, false);
  headGroup.add(new THREE.Mesh(stemGeo, glossyMat(0xe53935, 0.18)));

  // Fork: 2 branches from FORK_BASE, curving gently left and right
  // Using local +X for lateral spread — guaranteed symmetric
  [-1, 1].forEach(s => {
    const forkCurve = new THREE.CatmullRomCurve3([
      FORK_BASE.clone(),
      new THREE.Vector3(s * 0.055, -0.155, 0.50),
      new THREE.Vector3(s * 0.095, -0.165, 0.58) // tip
    ]);
    const forkGeo = new THREE.TubeGeometry(forkCurve, 6, 0.011, 7, false);
    headGroup.add(new THREE.Mesh(forkGeo, glossyMat(0xe53935, 0.18)));
  });

  // ---- TAIL TIP — rounded nub at start of spiral ----
  const tailPos = bodyCurve.getPointAt(0);
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

module.exports = { buildUlarToy };

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}
