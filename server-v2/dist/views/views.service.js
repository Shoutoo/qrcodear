"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const THREE = __importStar(require("three"));
const GLTFExporter_js_1 = require("three/examples/jsm/exporters/GLTFExporter.js");
if (typeof global.FileReader === 'undefined') {
    const { Blob } = require('buffer');
    global.Blob = Blob;
    global.FileReader = class FileReader {
        result;
        onload;
        onloadend;
        readAsArrayBuffer(blob) {
            blob.arrayBuffer().then((buf) => {
                this.result = buf;
                if (this.onload)
                    this.onload({ target: this });
                if (this.onloadend)
                    this.onloadend({ target: this });
            });
        }
        readAsDataURL(blob) {
            blob.arrayBuffer().then((buf) => {
                const b64 = Buffer.from(buf).toString('base64');
                this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
                if (this.onload)
                    this.onload({ target: this });
                if (this.onloadend)
                    this.onloadend({ target: this });
            });
        }
    };
}
const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const VIEWS_DIR = path.join(ROOT_DIR, 'server', 'views');
const ASSETS_DIR = path.join(ROOT_DIR, 'server', 'uploads');
const { buildUlarToy } = require(path.join(ROOT_DIR, 'server', 'build_ular_f22a.js'));
const { buildBelalangToy, buildUlatToy, buildUdangToy, buildBakteriToy, buildJamurToy } = require(path.join(ROOT_DIR, 'server', 'build_batch1_f22b.js'));
const { buildKatakToy, buildRumputToy, buildPadiToy, buildPohonToy, buildAlgaToy } = require(path.join(ROOT_DIR, 'server', 'build_batch2_f22b.js'));
const { buildIkanKecilToy, buildIkanBesarToy, buildHiuToy, buildElangToy, buildBurungToy } = require(path.join(ROOT_DIR, 'server', 'build_batch3_f22b.js'));
const speciesMap = {
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
let ViewsService = class ViewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    formatDateId(isoStr) {
        if (!isoStr)
            return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        return new Date(isoStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }
    async renderHomepage() {
        const indexPath = path.join(ROOT_DIR, 'client', 'index.html');
        if (!fs.existsSync(indexPath))
            throw new common_1.NotFoundException('client/index.html tidak ditemukan');
        return fs.readFileSync(indexPath, 'utf8');
    }
    async renderStudioApp() {
        const studioPath = path.join(VIEWS_DIR, 'studio', 'index.html');
        if (!fs.existsSync(studioPath))
            throw new common_1.NotFoundException('Studio index.html tidak ditemukan');
        return fs.readFileSync(studioPath, 'utf8');
    }
    async renderArViewer(id, hostHeader, protocol = 'http') {
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
    async renderStudioViewer(id) {
        const cleanId = id.replace(/^scene_/, '');
        const scene = await this.prisma.scene.findFirst({
            where: { OR: [{ id }, { id: cleanId }] },
        });
        if (!scene)
            throw new common_1.NotFoundException('AR Scene tidak ditemukan');
        const viewerPath = path.join(VIEWS_DIR, 'studio', 'viewer.html');
        let html = fs.readFileSync(viewerPath, 'utf8');
        const sceneData = typeof scene.data === 'object' ? scene.data : {};
        html = html
            .replace(/{{SCENE_NAME}}/g, this.escapeHtml(sceneData.name || 'AR Multi-Object Scene'))
            .replace(/{{SCENE_ID}}/g, scene.id)
            .replace(/{{SCENE_DATA_JSON}}/g, JSON.stringify(sceneData));
        return html;
    }
    async renderPrintCard(id) {
        const asset = await this.prisma.asset.findUnique({ where: { id } });
        const scene = !asset ? await this.prisma.scene.findFirst({ where: { OR: [{ id }, { id: id.replace(/^scene_/, '') }] } }) : null;
        const preset = (!asset && !scene) ? await this.prisma.ecosystemPreset.findFirst({ where: { OR: [{ id }, { id: `preset-${id}` }] } }) : null;
        const pub = (!asset && !scene && !preset) ? await this.prisma.publishedExperience.findFirst({ where: { OR: [{ id }, { bakedGlbUrl: `/assets/${id}.glb` }] } }) : null;
        if (!asset && !scene && !preset && !pub)
            throw new common_1.NotFoundException('Model / Scene 3D tidak ditemukan');
        const name = asset ? asset.label : scene ? scene.data?.name : preset ? preset.name : 'Rantai Makanan AR';
        const desc = asset ? asset.source : scene ? scene.data?.description : preset ? 'Rantai Makanan AR Preset' : 'AR Scene';
        const qrFilename = pub ? `${pub.id}_qr.png` : `${id}_qr.png`;
        const createdAt = asset ? asset.createdAt : scene ? scene.createdAt : preset ? preset.createdAt : pub ? pub.createdAt : new Date();
        const templatePath = path.join(VIEWS_DIR, 'print-card.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        const isEcosystem = preset || pub || id.startsWith('preset-') || id.startsWith('eco_');
        const viewerUrl = isEcosystem ? `/ecosystem/view/${id}` : `/ar/${id}`;
        html = html
            .replace(/{{MODEL_NAME}}/g, this.escapeHtml(name || 'Model 3D'))
            .replace(/{{MODEL_DESC}}/g, this.escapeHtml(desc || ''))
            .replace(/{{QR_FILENAME}}/g, qrFilename)
            .replace(/{{MARKER_IMAGE_URL}}/g, '/assets/markers/custom-marker.png')
            .replace(/{{ASSET_ID}}/g, id)
            .replace(/{{VIEWER_URL}}/g, viewerUrl)
            .replace(/{{UPLOAD_DATE}}/g, this.formatDateId(createdAt));
        return html;
    }
    async renderEcosystemViewer(id, hostHeader, protocol = 'http') {
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
        if (!fs.existsSync(ecoViewerPath))
            throw new common_1.NotFoundException('Ecosystem viewer.html tidak ditemukan');
        let html = fs.readFileSync(ecoViewerPath, 'utf8');
        const isLocal = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1');
        const finalProto = isLocal ? protocol : 'https';
        const host = `${finalProto}://${hostHeader}`;
        const glbFilename = isPresetId
            ? `eco_${targetId.replace('preset-', '')}_baked.glb`
            : (pubRecord?.bakedGlbUrl?.split('/')?.pop() || `${id}.glb`);
        let fullGlbUrl = `${host}/assets/${glbFilename}?t=${Date.now()}`;
        const name = activePreset ? activePreset.name : pubRecord ? 'Rantai Makanan AR' : 'Rantai Makanan AR';
        const slots = activePreset && Array.isArray(activePreset.slots) ? activePreset.slots : [];
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
    async ensureEcosystemGlbExists(id) {
        const isPresetId = id.startsWith('preset-') || ['darat', 'hutan', 'laut', 'sawah'].includes(id);
        const cleanPresetName = id.replace('preset-', '');
        const pubRecord = !isPresetId ? await this.prisma.publishedExperience.findFirst({
            where: { OR: [{ id }, { presetId: id }, { bakedGlbUrl: `/assets/${id}.glb` }] },
        }) : null;
        const targetGlbPath = isPresetId
            ? path.join(ASSETS_DIR, `eco_${cleanPresetName}_baked.glb`)
            : (pubRecord?.bakedGlbUrl
                ? path.join(ASSETS_DIR, pubRecord.bakedGlbUrl.split('/').pop())
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
        if (!preset)
            return glbFilename;
        const sceneGroup = new THREE.Group();
        sceneGroup.name = 'ecosystem_preset_group';
        const slots = Array.isArray(preset.slots) ? preset.slots : [];
        const numSlots = slots.length || 6;
        const radius = 2.2;
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
                        if (maxDim > 0)
                            modelObj.scale.setScalar(0.75 / maxDim);
                        const normBox = new THREE.Box3().setFromObject(modelObj);
                        if (!normBox.isEmpty())
                            modelObj.position.y -= normBox.min.y;
                    }
                    slotGroup.add(modelObj);
                }
            }
            catch (e) {
                console.warn(`[NestJS Auto-Bake Warning] Slot ${i} model error:`, e.message);
            }
            sceneGroup.add(slotGroup);
        });
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
        sceneGroup.traverse((n) => {
            if (n.pivot === undefined)
                n.pivot = null;
        });
        try {
            const exporter = new GLTFExporter_js_1.GLTFExporter();
            const buf = await new Promise((resolve, reject) => {
                exporter.parse(sceneGroup, (res) => resolve(res instanceof ArrayBuffer ? Buffer.from(res) : Buffer.from(JSON.stringify(res))), (err) => reject(err), { binary: true, embedImages: true });
            });
            fs.writeFileSync(glbPath, buf);
            console.log(`[NestJS Auto-Bake Engine] Successfully baked & saved ${glbFilename}: ${(buf.length / 1024).toFixed(1)} KB`);
        }
        catch (e) {
            console.warn(`[NestJS Auto-Bake Exporter Warning] ${e.message}`);
        }
        return glbFilename;
    }
};
exports.ViewsService = ViewsService;
exports.ViewsService = ViewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ViewsService);
//# sourceMappingURL=views.service.js.map