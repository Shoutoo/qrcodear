/**
 * FASE F2.2b — Complete Master Builder for ALL 24 Ecosystem Models
 * Cute Glossy 3D Toy Style
 *
 * Run from server/ directory: node build_unique_models_server.js
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

function addCuteFace(group, headPos, forwardVec, sideVec, upVec, scale = 1.0) {
  [-1, 1].forEach(side => {
    const eyeGroup = new THREE.Group();
    const pos = headPos.clone()
      .addScaledVector(sideVec, side * 0.14 * scale)
      .addScaledVector(upVec, 0.08 * scale)
      .addScaledVector(forwardVec, 0.12 * scale);
    eyeGroup.position.copy(pos);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scale, 16, 14), matteMat(0xfafafa, 0.3));
    sclera.position.set(side * 0.01, 0, 0.01);
    eyeGroup.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.052 * scale, 14, 12), matteMat(0x0a0a0a, 0.95));
    pupil.position.set(side * 0.02 * scale, 0, 0.03 * scale);
    eyeGroup.add(pupil);

    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 8, 6), matteMat(0xffffff, 0.05));
    hl.position.set(side * 0.01 * scale, 0.02 * scale, 0.05 * scale);
    eyeGroup.add(hl);

    group.add(eyeGroup);
  });
}

// Imports from batch scripts
const { buildUlarToy } = require('./build_ular_f22a.js');

// ------------------------------------------------------------------
// Species Manifest
// ------------------------------------------------------------------
const BASE = path.join(__dirname, 'uploads', 'ecosystem-models', 'library');

const batch1 = require('./build_batch1_f22b.js');
const batch2 = require('./build_batch2_f22b.js');
const batch3 = require('./build_batch3_f22b.js');

console.log('\nMaster builder ready. All 24 GLBs generated via individual batch scripts.\n');
