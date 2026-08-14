const fs = require('fs');
const path = require('path');
const THREE = require('three');

// Complete Polyfill FileReader for Node.js GLTFExporter
global.FileReader = class FileReader {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onloadend = null;
    this.onerror = null;
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (typeof this.onload === 'function') this.onload({ target: this });
      if (typeof this.onloadend === 'function') this.onloadend({ target: this });
    }).catch(err => {
      if (typeof this.onerror === 'function') this.onerror(err);
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buf => {
      const base64 = Buffer.from(buf).toString('base64');
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
      if (typeof this.onload === 'function') this.onload({ target: this });
      if (typeof this.onloadend === 'function') this.onloadend({ target: this });
    }).catch(err => {
      if (typeof this.onerror === 'function') this.onerror(err);
    });
  }
};

const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

async function loadGlbModel(filePath) {
  const buf = fs.readFileSync(filePath);
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', (gltf) => resolve(gltf.scene), (err) => reject(err));
  });
}

// Helper to create a premium 3D double-sided badge mesh
function create3DBadgeMesh(speciesName, roleName) {
  const badgeGroup = new THREE.Group();
  badgeGroup.name = `badge_${speciesName.toLowerCase()}`;

  // 1. Base White Rounded Pill
  const pillWidth = 0.54;
  const pillHeight = 0.16;
  const pillDepth = 0.025;

  const shape = new THREE.Shape();
  const radius = pillHeight / 2;
  const x = -pillWidth / 2;
  const y = -pillHeight / 2;
  const w = pillWidth;
  const h = pillHeight;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + w - radius, y);
  shape.absarc(x + w - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(x + radius, y + h);
  shape.absarc(x + radius, y + radius, radius, Math.PI / 2, (3 * Math.PI) / 2, false);

  const extrudeSettings = {
    steps: 1,
    depth: pillDepth,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 3
  };

  const pillGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  pillGeo.center();

  // White Material (Double-sided for 360° visibility)
  const pillMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const pillMesh = new THREE.Mesh(pillGeo, pillMat);
  badgeGroup.add(pillMesh);

  // 2. Purple Border Rim Frames (Front & Back)
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed, // Royal Purple
    roughness: 0.25,
    metalness: 0.2,
    side: THREE.DoubleSide
  });
  const rimGeo = new THREE.TorusGeometry(pillHeight * 0.48, 0.007, 12, 32);
  
  // Front rims
  const leftRimFront = new THREE.Mesh(rimGeo, rimMat);
  leftRimFront.position.set(-pillWidth / 2 + radius, 0, pillDepth / 2 + 0.002);
  badgeGroup.add(leftRimFront);

  const rightRimFront = new THREE.Mesh(rimGeo, rimMat);
  rightRimFront.position.set(pillWidth / 2 - radius, 0, pillDepth / 2 + 0.002);
  badgeGroup.add(rightRimFront);

  // Back rims
  const leftRimBack = new THREE.Mesh(rimGeo, rimMat);
  leftRimBack.position.set(-pillWidth / 2 + radius, 0, -pillDepth / 2 - 0.002);
  badgeGroup.add(leftRimBack);

  const rightRimBack = new THREE.Mesh(rimGeo, rimMat);
  rightRimBack.position.set(pillWidth / 2 - radius, 0, -pillDepth / 2 - 0.002);
  badgeGroup.add(rightRimBack);

  // 3. Yellow Role Pill Plates (Front & Back)
  const roleWidth = 0.22;
  const roleHeight = 0.11;
  const roleShape = new THREE.Shape();
  const rRadius = roleHeight / 2;
  const rx = -roleWidth / 2, ry = -roleHeight / 2;
  roleShape.moveTo(rx + rRadius, ry);
  roleShape.lineTo(rx + roleWidth - rRadius, ry);
  roleShape.absarc(rx + roleWidth - rRadius, ry + rRadius, rRadius, -Math.PI / 2, Math.PI / 2, false);
  roleShape.lineTo(rx + rRadius, ry + roleHeight);
  roleShape.absarc(rx + rRadius, ry + rRadius, rRadius, Math.PI / 2, (3 * Math.PI) / 2, false);

  const roleGeo = new THREE.ExtrudeGeometry(roleShape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 });
  roleGeo.center();
  const roleMat = new THREE.MeshStandardMaterial({
    color: 0xfde047, // Vibrant Yellow Tag
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const roleMeshFront = new THREE.Mesh(roleGeo, roleMat);
  roleMeshFront.position.set(pillWidth / 2 - roleWidth / 2 - 0.02, 0, pillDepth / 2 + 0.008);
  badgeGroup.add(roleMeshFront);

  const roleMeshBack = new THREE.Mesh(roleGeo, roleMat);
  roleMeshBack.position.set(-(pillWidth / 2 - roleWidth / 2 - 0.02), 0, -pillDepth / 2 - 0.008);
  badgeGroup.add(roleMeshBack);

  // 4. Double-Sided Stem / Pole Connecting to Ground / Animal
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 16);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.4,
    metalness: 0.6
  });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.position.set(0, -0.22, 0);
  badgeGroup.add(stemMesh);

  return badgeGroup;
}

async function bakeEcosystemPreset(presetId) {
  console.log(`\n🚀 [Bake Engine] Memulai baking GLB Ekosistem "${presetId}" Lengkap...`);

  const masterScene = new THREE.Group();
  masterScene.name = `ekosistem_${presetId}_lengkap`;

  const radius = 1.65; // Radius lingkaran 6 hewan (Diameter 3.3m)

  const slotsByPreset = {
    sawah: [
      { name: 'Padi',     role: 'Produsen',           file: 'server/uploads/ecosystem-models/library/sawah/padi.glb' },
      { name: 'Belalang', role: 'Konsumen Primer',    file: 'server/uploads/ecosystem-models/library/sawah/belalang.glb' },
      { name: 'Katak',    role: 'Konsumen Sekunder',  file: 'server/uploads/ecosystem-models/library/sawah/katak.glb' },
      { name: 'Ular',     role: 'Konsumen Tersier',   file: 'server/uploads/ecosystem-models/library/sawah/ular.glb' },
      { name: 'Elang',    role: 'Konsumen Final',     file: 'server/uploads/ecosystem-models/library/sawah/elang.glb' },
      { name: 'Jamur',    role: 'Dekomposer',         file: 'server/uploads/ecosystem-models/library/sawah/jamur.glb' }
    ],
    hutan: [
      { name: 'Pohon',    role: 'Produsen',           file: 'server/uploads/ecosystem-models/library/hutan/pohon.glb' },
      { name: 'Ulat',     role: 'Konsumen Primer',    file: 'server/uploads/ecosystem-models/library/hutan/ulat.glb' },
      { name: 'Burung',   role: 'Konsumen Sekunder',  file: 'server/uploads/ecosystem-models/library/hutan/burung.glb' },
      { name: 'Ular',     role: 'Konsumen Tersier',   file: 'server/uploads/ecosystem-models/library/hutan/ular.glb' },
      { name: 'Elang',    role: 'Konsumen Final',     file: 'server/uploads/ecosystem-models/library/hutan/elang.glb' },
      { name: 'Jamur',    role: 'Dekomposer',         file: 'server/uploads/ecosystem-models/library/hutan/jamur.glb' }
    ],
    darat: [
      { name: 'Rumput',   role: 'Produsen',           file: 'server/uploads/ecosystem-models/library/darat/rumput.glb' },
      { name: 'Belalang', role: 'Konsumen Primer',    file: 'server/uploads/ecosystem-models/library/darat/belalang.glb' },
      { name: 'Katak',    role: 'Konsumen Sekunder',  file: 'server/uploads/ecosystem-models/library/darat/katak.glb' },
      { name: 'Ular',     role: 'Konsumen Tersier',   file: 'server/uploads/ecosystem-models/library/darat/ular.glb' },
      { name: 'Elang',    role: 'Konsumen Final',     file: 'server/uploads/ecosystem-models/library/darat/elang.glb' },
      { name: 'Jamur',    role: 'Dekomposer',         file: 'server/uploads/ecosystem-models/library/darat/jamur.glb' }
    ],
    laut: [
      { name: 'Alga',     role: 'Produsen',           file: 'server/uploads/ecosystem-models/library/laut/alga.glb' },
      { name: 'Udang',    role: 'Konsumen Primer',    file: 'server/uploads/ecosystem-models/library/laut/udang.glb' },
      { name: 'IkanKecil',role: 'Konsumen Sekunder',  file: 'server/uploads/ecosystem-models/library/laut/ikan_kecil.glb' },
      { name: 'IkanBesar',role: 'Konsumen Tersier',   file: 'server/uploads/ecosystem-models/library/laut/ikan_besar.glb' },
      { name: 'Hiu',      role: 'Konsumen Final',     file: 'server/uploads/ecosystem-models/library/laut/hiu.glb' },
      { name: 'Bakteri',  role: 'Dekomposer',         file: 'server/uploads/ecosystem-models/library/laut/bakteri.glb' }
    ]
  };

  const slots = slotsByPreset[presetId] || slotsByPreset.sawah;
  const numSlots = slots.length;

  // ─── 1. Garis Rantai Makanan (Curved Purple Energy Tubes & Yellow Directional Arrows) ───
  for (let i = 0; i < numSlots; i++) {
    const nextIdx = (i + 1) % numSlots;
    const a1 = (i * 2 * Math.PI) / numSlots;
    const a2 = (nextIdx * 2 * Math.PI) / numSlots;

    const p1 = new THREE.Vector3(radius * Math.cos(a1), 0.12, radius * Math.sin(a1));
    const p2 = new THREE.Vector3(radius * Math.cos(a2), 0.12, radius * Math.sin(a2));

    const midAngle = a1 + (a2 < a1 ? a2 + 2 * Math.PI - a1 : a2 - a1) / 2;
    const pMid = new THREE.Vector3((radius * 0.95) * Math.cos(midAngle), 0.28, (radius * 0.95) * Math.sin(midAngle));

    // Curved Tube Arc
    const curve = new THREE.CatmullRomCurve3([p1, pMid, p2]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.022, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Purple Food Chain Line
      roughness: 0.2,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    masterScene.add(tubeMesh);

    // Directional Arrowhead Cone pointing along curve
    const arrowGeo = new THREE.ConeGeometry(0.065, 0.18, 16);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright Yellow Arrow
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.position.copy(pMid);

    const tangent = curve.getTangentAt(0.55).normalize();
    const defaultDir = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(defaultDir, tangent);
    arrowMesh.quaternion.copy(quat);
    masterScene.add(arrowMesh);

    // White Pedestal Disc Under Animal
    const podGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.035, 32);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const podMesh = new THREE.Mesh(podGeo, podMat);
    podMesh.position.set(radius * Math.cos(a1), 0.018, radius * Math.sin(a1));
    masterScene.add(podMesh);
  }

  // ─── 2. Muat 6 Model 3D Hewan & Pasang 3D Badges di Atas Kepala ───
  for (let i = 0; i < numSlots; i++) {
    const slot = slots[i];
    const angle = (i * 2 * Math.PI) / numSlots;
    const posX = radius * Math.cos(angle);
    const posZ = radius * Math.sin(angle);

    const slotGroup = new THREE.Group();
    slotGroup.name = `slot_${i}_${slot.name.toLowerCase()}`;
    slotGroup.position.set(posX, 0.035, posZ);

    // Orient slot group facing outward
    slotGroup.rotation.y = -angle + Math.PI / 2;

    // Load GLB
    try {
      if (fs.existsSync(slot.file)) {
        const modelObj = await loadGlbModel(slot.file);
        const box = new THREE.Box3().setFromObject(modelObj);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1.0;

        // Scale model to standard 0.55m size
        const targetSize = 0.55;
        modelObj.scale.setScalar(targetSize / maxDim);

        const normBox = new THREE.Box3().setFromObject(modelObj);
        modelObj.position.y = -normBox.min.y; // Sit flat on pedestal

        // Enable DoubleSide on all child materials
        modelObj.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.side = THREE.DoubleSide;
          }
        });

        slotGroup.add(modelObj);
        console.log(`✅ [${presetId} - Slot ${i}] ${slot.name} (${slot.role}) berhasil dimuat!`);
      } else {
        console.warn(`⚠️ [${presetId} - Slot ${i}] File ${slot.file} tidak ditemukan, melewatinya...`);
      }
    } catch (err) {
      console.error(`❌ Gagal memuat ${slot.name}:`, err.message);
    }

    masterScene.add(slotGroup);
  }

  // ─── 3. Export Scene to Standalone GLB File ───
  const exporter = new GLTFExporter();
  const outputGlbPath = path.join(__dirname, `../uploads/ekosistem_${presetId}_lengkap.glb`);
  const publicGlbPath = path.join(__dirname, `../../viewer_assets/ekosistem_${presetId}_lengkap.glb`);

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(publicGlbPath), { recursive: true });

  const glbBuffer = await new Promise((resolve, reject) => {
    exporter.parse(
      masterScene,
      res => resolve(res instanceof ArrayBuffer ? Buffer.from(res) : Buffer.from(JSON.stringify(res))),
      err => reject(err),
      { binary: true }
    );
  });

  fs.writeFileSync(outputGlbPath, glbBuffer);
  fs.writeFileSync(publicGlbPath, glbBuffer);
  
  // Also update preset-{id}.glb so viewer and studio are 100% synchronized
  const presetGlbPath = path.join(__dirname, `../uploads/preset-${presetId}.glb`);
  fs.writeFileSync(presetGlbPath, glbBuffer);

  if (presetId === 'sawah') {
    const rootGlbPath = path.join(__dirname, `../../ekosistem_sawah_lengkap.glb`);
    fs.writeFileSync(rootGlbPath, glbBuffer);
  }

  const fileSizeMB = (glbBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`🎉 BERHASIL! File GLB "${presetId}" tersimpan:`);
  console.log(`   📁 Output: ${outputGlbPath}`);
  console.log(`   📁 Preset: ${presetGlbPath}`);
  console.log(`   📦 Ukuran: ${fileSizeMB} MB`);

  return outputGlbPath;
}

async function main() {
  await bakeEcosystemPreset('sawah');
}

main().catch(err => {
  console.error('Error saat bake:', err);
});
