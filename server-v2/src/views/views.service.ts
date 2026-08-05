import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as qrcode from 'qrcode';
import { createCanvas, ImageData } from '@napi-rs/canvas';

if (typeof global.ImageData === 'undefined') {
  global.ImageData = ImageData as any;
}
if (typeof global.document === 'undefined') {
  global.document = {
    createElement: (type: string) => {
      if (type === 'canvas') {
        const c = createCanvas(1, 1) as any;
        c.toDataURL = function (t: string) {
          return 'data:image/png;base64,' + c.toBuffer('image/png').toString('base64');
        };
        return c;
      }
      return {};
    },
  } as any;
}

// Polyfill FileReader for THREE.GLTFExporter in Node.js
if (typeof global.FileReader === 'undefined') {
  const { Blob } = require('buffer');
  global.Blob = Blob;
  global.FileReader = class FileReader {
    result: any;
    onload: any;
    onloadend: any;
    readAsArrayBuffer(blob: any) {
      blob.arrayBuffer().then((buf: any) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
    readAsDataURL(blob: any) {
      blob.arrayBuffer().then((buf: any) => {
        const b64 = Buffer.from(buf).toString('base64');
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  } as any;
}

function createSpecies3DLabelMesh(name: string, role: string, angle: number): THREE.Mesh {
  const canvas = createCanvas(512, 256) as any;
  const ctx = canvas.getContext('2d');

  canvas.toDataURL = function (t: string) {
    return 'data:image/png;base64,' + canvas.toBuffer('image/png').toString('base64');
  };

  ctx.clearRect(0, 0, 512, 256);

  // Outer Card Box (White Card with Purple Border)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = '#632ce5';
  ctx.lineWidth = 10;

  const x = 16, y = 16, w = 480, h = 224, r = 32;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Species Name Text (Dark Charcoal)
  ctx.fillStyle = '#0d1e25';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let displayName = name || 'Spesies';
  if (displayName.length > 16) displayName = displayName.substring(0, 14) + '..';
  ctx.fillText(displayName, 256, 92);

  // Role Badge (Yellow Pill)
  ctx.fillStyle = '#fdd400';
  const rx = 60, ry = 142, rw = 392, rh = 62, rr = 20;
  ctx.beginPath();
  ctx.moveTo(rx + rr, ry);
  ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
  ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
  ctx.arcTo(rx, ry + rh, rx, ry, rr);
  ctx.arcTo(rx, ry, rx + rw, ry, rr);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0d1e25';
  ctx.font = '900 28px Arial, sans-serif';
  const roleDisplay = role.toUpperCase().replace(/_/g, ' ');
  ctx.fillText(roleDisplay, 256, 173);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const planeGeom = new THREE.PlaneGeometry(1.0, 0.5);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(planeGeom, planeMat);
  mesh.position.set(0, 1.15, 0);

  // Face outward from center ring
  mesh.rotation.y = angle + Math.PI / 2;

  return mesh;
}

const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const VIEWS_DIR = path.join(ROOT_DIR, 'server', 'views');
const ASSETS_DIR = path.join(ROOT_DIR, 'server', 'uploads');

// Import procedural 3D toy species builders from legacy server scripts
const { buildUlarToy } = require(path.join(ROOT_DIR, 'server', 'build_ular_f22a.js'));
const { buildBelalangToy, buildUlatToy, buildUdangToy, buildBakteriToy, buildJamurToy } = require(path.join(ROOT_DIR, 'server', 'build_batch1_f22b.js'));
const { buildKatakToy, buildRumputToy, buildPadiToy, buildPohonToy, buildAlgaToy } = require(path.join(ROOT_DIR, 'server', 'build_batch2_f22b.js'));
const { buildIkanKecilToy, buildIkanBesarToy, buildHiuToy, buildElangToy, buildBurungToy } = require(path.join(ROOT_DIR, 'server', 'build_batch3_f22b.js'));

const speciesMap: Record<string, Function> = {
  'darat/rumput.glb': buildRumputToy,
  'darat/belalang.glb': buildBelalangToy,
  'sawah/belalang.glb': buildBelalangToy,
  'darat/katak.glb': buildKatakToy,
  'sawah/katak.glb': buildKatakToy,
  'darat/ular.glb': buildUlarToy,
  'hutan/ular.glb': buildUlarToy,
  'sawah/ular.glb': buildUlarToy,
  'darat/elang.glb': buildElangToy,
  'hutan/elang.glb': buildElangToy,
  'sawah/elang.glb': buildElangToy,
  'darat/jamur.glb': buildJamurToy,
  'hutan/jamur.glb': buildJamurToy,
  'sawah/jamur.glb': buildJamurToy,
  'hutan/pohon.glb': buildPohonToy,
  'hutan/ulat.glb': buildUlatToy,
  'hutan/burung.glb': buildBurungToy,
  'laut/alga.glb': buildAlgaToy,
  'laut/udang.glb': buildUdangToy,
  'laut/ikan_kecil.glb': buildIkanKecilToy,
  'laut/ikan_besar.glb': buildIkanBesarToy,
  'laut/hiu.glb': buildHiuToy,
  'laut/bakteri.glb': buildBakteriToy,
  'sawah/padi.glb': buildPadiToy,
};

@Injectable()
export class ViewsService {
  constructor(private prisma: PrismaService) {}

  private escapeHtml(str: string): string {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private formatDateId(isoStr?: string | Date | null): string {
    if (!isoStr) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(isoStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  async renderHomepage(): Promise<string> {
    const indexPath = path.join(ROOT_DIR, 'client', 'index.html');
    if (!fs.existsSync(indexPath)) throw new NotFoundException('client/index.html tidak ditemukan');
    return fs.readFileSync(indexPath, 'utf8');
  }

  async renderStudioApp(): Promise<string> {
    const studioPath = path.join(VIEWS_DIR, 'studio', 'index.html');
    if (!fs.existsSync(studioPath)) throw new NotFoundException('Studio index.html tidak ditemukan');
    return fs.readFileSync(studioPath, 'utf8');
  }

  async renderArViewer(id: string, hostHeader: string, protocol = 'http'): Promise<string> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
      <title>Tidak Ditemukan — EduAR Platform</title>
      <style>body{background:#07071a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}</style>
      </head><body><div><div style="font-size:48px;margin-bottom:16px">❌</div>
      <h2>Model Tidak Ditemukan</h2><p style="color:rgba(255,255,255,0.5);margin-top:8px">QR code ini mungkin sudah tidak valid.</p>
      <a href="/" style="color:#7c5cfc;margin-top:16px;display:inline-block">← Kembali ke beranda</a></div></body></html>`;
    }

    const templatePath = path.join(VIEWS_DIR, 'ar-viewer.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const assetUrl = asset.modelUrl.startsWith('/') ? asset.modelUrl : `/assets/${asset.modelUrl.split('/').pop()}`;
    const printUrl = `/print/${id}`;
    const markerPattUrl = '/assets/markers/custom-marker.patt';
    const nftMarkerBase = `/assets/markers/${asset.id}_nft`;

    html = html
      .replace(/{{MODEL_URL}}/g, assetUrl)
      .replace(/{{MODEL_USDZ_URL}}/g, asset.textureUrl || '')
      .replace(/{{MODEL_NAME}}/g, this.escapeHtml(asset.label || 'Model 3D'))
      .replace(/{{MODEL_DESC}}/g, this.escapeHtml(asset.source || ''))
      .replace(/{{ASSET_ID}}/g, asset.id)
      .replace(/{{PRINT_URL}}/g, printUrl)
      .replace(/{{MARKER_PATT_URL}}/g, markerPattUrl)
      .replace(/{{NFT_MARKER_BASE}}/g, nftMarkerBase)
      .replace(/{{UPLOAD_DATE}}/g, this.formatDateId(asset.createdAt))
      .replace(/{{ANNOTATIONS_JSON}}/g, JSON.stringify([]));

    return html;
  }

  async renderStudioViewer(id: string): Promise<string> {
    const cleanId = id.replace(/^scene_/, '');
    const scene = await this.prisma.scene.findFirst({
      where: { OR: [{ id }, { id: cleanId }] },
    });

    if (!scene) throw new NotFoundException('AR Scene tidak ditemukan');

    const viewerPath = path.join(VIEWS_DIR, 'studio', 'viewer.html');
    let html = fs.readFileSync(viewerPath, 'utf8');

    const sceneData: any = typeof scene.data === 'object' ? scene.data : {};

    html = html
      .replace(/{{SCENE_NAME}}/g, this.escapeHtml(sceneData.name || 'AR Multi-Object Scene'))
      .replace(/{{SCENE_ID}}/g, scene.id)
      .replace(/{{SCENE_DATA_JSON}}/g, JSON.stringify(sceneData));

    return html;
  }

  async renderPrintCard(id: string, hostHeader?: string, protocol = 'http'): Promise<string> {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    const scene = !asset ? await this.prisma.scene.findFirst({ where: { OR: [{ id }, { id: id.replace(/^scene_/, '') }] } }) : null;
    const preset = (!asset && !scene) ? await this.prisma.ecosystemPreset.findFirst({ where: { OR: [{ id }, { id: `preset-${id}` }] } }) : null;
    const pub = (!asset && !scene && !preset) ? await this.prisma.publishedExperience.findFirst({ where: { OR: [{ id }, { bakedGlbUrl: `/assets/${id}.glb` }] } }) : null;

    if (!asset && !scene && !preset && !pub) throw new NotFoundException('Model / Scene 3D tidak ditemukan');

    const name = asset ? asset.label : scene ? (scene.data as any)?.name : preset ? preset.name : pub ? 'Rantai Makanan AR' : 'Rantai Makanan AR';
    const desc = asset ? asset.source : scene ? (scene.data as any)?.description : preset ? 'Rantai Makanan AR Preset' : 'AR Scene';
    const createdAt = asset ? asset.createdAt : scene ? scene.createdAt : preset ? preset.createdAt : pub ? pub.createdAt : new Date();

    const templatePath = path.join(VIEWS_DIR, 'print-card.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const isEcosystem = preset || pub || id.startsWith('preset-') || id.startsWith('eco_');
    const viewerRelativePath = isEcosystem ? `/ecosystem/view/${id}` : `/ar/${id}`;

    const host = hostHeader || 'localhost:3002';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const finalProto = isLocal ? protocol : 'https';
    const fullViewerUrl = `${finalProto}://${host}${viewerRelativePath}`;

    let qrDataUrl = '';
    try {
      qrDataUrl = await qrcode.toDataURL(fullViewerUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 400,
        color: { dark: '#000000', light: '#ffffff' },
      });
    } catch (e) {
      qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullViewerUrl)}`;
    }

    html = html
      .replace(/{{MODEL_NAME}}/g, this.escapeHtml(name || 'Model 3D'))
      .replace(/{{MODEL_DESC}}/g, this.escapeHtml(desc || ''))
      .replace(/{{QR_DATA_URL}}/g, qrDataUrl)
      .replace(/\/assets\/{{QR_FILENAME}}/g, qrDataUrl)
      .replace(/{{QR_FILENAME}}/g, qrDataUrl)
      .replace(/{{MARKER_IMAGE_URL}}/g, '/assets/markers/custom-marker.png')
      .replace(/{{ASSET_ID}}/g, id)
      .replace(/{{VIEWER_URL}}/g, viewerRelativePath)
      .replace(/{{UPLOAD_DATE}}/g, this.formatDateId(createdAt));

    return html;
  }

  async renderEcosystemViewer(id: string, hostHeader: string, protocol = 'http'): Promise<string> {
    const isPresetId = id.startsWith('preset-') || ['darat', 'hutan', 'laut', 'sawah'].includes(id);

    const preset = await this.prisma.ecosystemPreset.findFirst({
      where: { OR: [{ id }, { id: `preset-${id}` }] },
    });

    const pubRecord = !isPresetId ? await this.prisma.publishedExperience.findFirst({
      where: { OR: [{ id }, { presetId: id }, { bakedGlbUrl: `/assets/${id}.glb` }] },
    }) : null;

    const activePreset = preset || (pubRecord?.presetId ? await this.prisma.ecosystemPreset.findUnique({ where: { id: pubRecord.presetId } }) : null);

    const targetId = isPresetId ? (id.startsWith('preset-') ? id : `preset-${id}`) : (pubRecord?.id || id);
    await this.ensureEcosystemGlbExists(targetId);

    const ecoViewerPath = path.join(VIEWS_DIR, 'ecosystem', 'viewer.html');
    if (!fs.existsSync(ecoViewerPath)) throw new NotFoundException('Ecosystem viewer.html tidak ditemukan');

    let html = fs.readFileSync(ecoViewerPath, 'utf8');

    const isLocal = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1');
    const finalProto = isLocal ? protocol : 'https';
    const host = `${finalProto}://${hostHeader}`;

    const glbFilename = isPresetId 
      ? `eco_${targetId.replace('preset-', '')}_baked.glb` 
      : (pubRecord?.bakedGlbUrl?.split('/')?.pop() || `${id}.glb`);

    let fullGlbUrl = `${host}/assets/${glbFilename}?t=${Date.now()}`;

    const name = activePreset ? activePreset.name : pubRecord ? 'Rantai Makanan AR' : 'Rantai Makanan AR';

    const slots: any[] = activePreset && Array.isArray(activePreset.slots) ? activePreset.slots : [];

    for (let i = 0; i < 6; i++) {
      const slot = slots[i] || {};
      const label = slot.label || `Spesies ${i + 1}`;
      const role = (slot.role || 'organisme').replace('_', ' ');
      html = html
        .replace(new RegExp(`{{SLOT_${i}_LABEL}}`, 'g'), this.escapeHtml(label))
        .replace(new RegExp(`{{SLOT_${i}_ROLE}}`, 'g'), this.escapeHtml(role));
    }

    html = html
      .replace(/{{ECOSYSTEM_NAME}}/g, this.escapeHtml(name))
      .replace(/{{ECOSYSTEM_GLB_URL}}/g, fullGlbUrl);

    return html;
  }

  async ensureEcosystemGlbExists(id: string): Promise<string> {
    const isPresetId = id.startsWith('preset-') || ['darat', 'hutan', 'laut', 'sawah'].includes(id);
    const cleanPresetName = id.replace('preset-', '');

    const pubRecord = !isPresetId ? await this.prisma.publishedExperience.findFirst({
      where: { OR: [{ id }, { presetId: id }, { bakedGlbUrl: `/assets/${id}.glb` }] },
    }) : null;

    const targetGlbPath = isPresetId
      ? path.join(ASSETS_DIR, `eco_${cleanPresetName}_baked.glb`)
      : (pubRecord?.bakedGlbUrl
          ? path.join(ASSETS_DIR, pubRecord.bakedGlbUrl.split('/').pop()!)
          : path.join(ASSETS_DIR, id.endsWith('.glb') ? id : `${id}.glb`));

    const glbFilename = path.basename(targetGlbPath);
    const glbPath = targetGlbPath;

    if (fs.existsSync(targetGlbPath) && fs.statSync(targetGlbPath).size > 10000 && fs.statSync(targetGlbPath).size !== 80824) {
      return glbFilename;
    }

    console.log(`[NestJS Auto-Bake Engine] Real-time baking missing GLB for "${id}" -> ${glbFilename}...`);

    const preset = (pubRecord?.presetId ? await this.prisma.ecosystemPreset.findUnique({ where: { id: pubRecord.presetId } }) : null)
      || await this.prisma.ecosystemPreset.findFirst({
        where: { OR: [{ id }, { id: `preset-${id}` }] },
      })
      || await this.prisma.ecosystemPreset.findFirst();

    if (!preset) return glbFilename;

    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'ecosystem_preset_group';

    const slots: any[] = Array.isArray(preset.slots) ? preset.slots : [];
    const numSlots = slots.length || 6;
    const radius = 2.2;

    // 1. Add Species 3D Models
    slots.forEach((slot, i) => {
      const angle = (i * 2 * Math.PI) / numSlots;
      const slotGroup = new THREE.Group();
      slotGroup.position.set(radius * Math.cos(angle), 0.5, radius * Math.sin(angle));

      let relPath = (slot.modelSrc || '').replace(/^\/assets\/ecosystem-models\/library\//, '').replace(/^\/uploads\/ecosystem-models\/library\//, '');
      let builderFn = speciesMap[relPath] || buildRumputToy;

      try {
        if (typeof builderFn === 'function') {
          const modelObj = builderFn();
          const box = new THREE.Box3().setFromObject(modelObj);
          if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) modelObj.scale.setScalar(0.75 / maxDim);
            const normBox = new THREE.Box3().setFromObject(modelObj);
            if (!normBox.isEmpty()) modelObj.position.y -= normBox.min.y;
          }
          slotGroup.add(modelObj);
        }
      } catch (e) {
        console.warn(`[NestJS Auto-Bake Warning] Slot ${i} model error:`, e.message);
      }

      // 1b. Add 3D Floating Label Badge (visible in mobile AR & web)
      try {
        const labelText = slot.label || `Spesies ${i + 1}`;
        const roleText = (slot.role || 'organisme').replace(/_/g, ' ');
        const labelMesh = createSpecies3DLabelMesh(labelText, roleText, angle);
        slotGroup.add(labelMesh);
      } catch (err) {
        console.warn(`[NestJS Auto-Bake Warning] Slot ${i} label mesh error:`, err.message);
      }

      sceneGroup.add(slotGroup);
    });

    // 2. Add 3D Directional Flow Arrows between species
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xfdd400,
      roughness: 0.2,
      metalness: 0.8,
    });

    for (let i = 0; i < numSlots; i++) {
      const a1 = (i * 2 * Math.PI) / numSlots;
      const a2 = (((i + 1) % numSlots) * 2 * Math.PI) / numSlots;

      const p1 = new THREE.Vector3(radius * Math.cos(a1), 0.35, radius * Math.sin(a1));
      const p2 = new THREE.Vector3(radius * Math.cos(a2), 0.35, radius * Math.sin(a2));

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.48);
      mid.y = 0.45;

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.04, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeom, arrowMat);
      sceneGroup.add(tubeMesh);

      const coneGeom = new THREE.ConeGeometry(0.12, 0.35, 12);
      const coneMesh = new THREE.Mesh(coneGeom, arrowMat);
      coneMesh.position.copy(p2);
      coneMesh.lookAt(p1);
      coneMesh.rotateX(Math.PI / 2);
      sceneGroup.add(coneMesh);
    }

    sceneGroup.traverse((n: any) => {
      if (n.pivot === undefined) n.pivot = null;
    });

    try {
      const exporter = new GLTFExporter();
      const buf = await new Promise<Buffer>((resolve, reject) => {
        exporter.parse(
          sceneGroup,
          (res) => resolve(res instanceof ArrayBuffer ? Buffer.from(res) : Buffer.from(JSON.stringify(res))),
          (err) => reject(err),
          { binary: true, embedImages: true }
        );
      });

      fs.writeFileSync(glbPath, buf);
      console.log(`[NestJS Auto-Bake Engine] Successfully baked & saved ${glbFilename}: ${(buf.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.warn(`[NestJS Auto-Bake Exporter Warning] ${e.message}`);
    }

    return glbFilename;
  }
}
