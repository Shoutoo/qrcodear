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
exports.EcosystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const qrcode = __importStar(require("qrcode"));
let EcosystemService = class EcosystemService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLibrary() {
        const assets = await this.prisma.asset.findMany({
            where: { type: client_1.AssetType.ECOSYSTEM_MODEL },
            orderBy: { createdAt: 'asc' },
        });
        const ecoNames = ['darat', 'hutan', 'laut', 'sawah'];
        const ecoTitleMap = {
            darat: 'Ekosistem Darat',
            hutan: 'Ekosistem Hutan',
            laut: 'Ekosistem Laut',
            sawah: 'Ekosistem Sawah',
        };
        const library = ecoNames.map((eco) => {
            const items = assets
                .filter((a) => a.ecosystem === eco)
                .map((a) => ({
                id: a.id,
                name: a.label,
                role: a.role,
                icon: this.getIconForRole(a.role),
                modelSrc: a.modelUrl,
                thumbnail: a.textureUrl || `/uploads/ecosystem-models/library/${eco}/${a.label?.toLowerCase()}-thumb.png`,
                source: a.source,
                license: a.license,
            }));
            return {
                ecosystem: eco,
                name: ecoTitleMap[eco] || `Ekosistem ${eco}`,
                items,
            };
        });
        return { success: true, library };
    }
    getIconForRole(role) {
        switch (role) {
            case 'produsen': return 'grass';
            case 'konsumen_primer': return 'bug_report';
            case 'konsumen_sekunder': return 'water_drop';
            case 'konsumen_tersier': return 'waves';
            case 'konsumen_final': return 'flight';
            case 'decomposer': return 'forest';
            default: return 'nature';
        }
    }
    async getPresets() {
        const presets = await this.prisma.ecosystemPreset.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return {
            success: true,
            presets: presets.map((p) => ({
                id: p.id,
                name: p.name,
                slots: p.slots,
            })),
        };
    }
    async getPresetById(id) {
        const preset = await this.prisma.ecosystemPreset.findUnique({
            where: { id },
        });
        if (!preset) {
            throw new common_1.NotFoundException('Preset tidak ditemukan');
        }
        return {
            success: true,
            preset: {
                id: preset.id,
                name: preset.name,
                slots: preset.slots,
            },
        };
    }
    async updateSlot(id, slotIndex, label, modelSrc) {
        const preset = await this.prisma.ecosystemPreset.findUnique({ where: { id } });
        if (!preset) {
            throw new common_1.NotFoundException('Preset tidak ditemukan');
        }
        const slots = Array.isArray(preset.slots) ? [...preset.slots] : [];
        if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= slots.length) {
            throw new common_1.BadRequestException('Index slot tidak valid');
        }
        if (label !== undefined)
            slots[slotIndex].label = String(label).trim();
        if (modelSrc)
            slots[slotIndex].modelSrc = modelSrc;
        const updated = await this.prisma.ecosystemPreset.update({
            where: { id },
            data: { slots },
        });
        return {
            success: true,
            preset: updated,
            updatedSlot: slots[slotIndex],
        };
    }
    async publishEcosystem(presetId, presetName, hostHeader, protocol = 'http') {
        let targetPresetId = presetId;
        if (!targetPresetId && presetName) {
            const lowerName = presetName.toLowerCase();
            if (lowerName.includes('laut'))
                targetPresetId = 'preset-laut';
            else if (lowerName.includes('hutan'))
                targetPresetId = 'preset-hutan';
            else if (lowerName.includes('sawah'))
                targetPresetId = 'preset-sawah';
            else if (lowerName.includes('darat'))
                targetPresetId = 'preset-darat';
        }
        if (!targetPresetId)
            targetPresetId = 'preset-darat';
        const pubId = `eco_${Date.now().toString(36)}`;
        const host = hostHeader || 'localhost:3001';
        const directUrl = `${protocol}://${host}/ecosystem/view/${pubId}`;
        const glbUrl = `/assets/${pubId}.glb`;
        const qrFilename = `${pubId}_qr.png`;
        const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 400 });
        const publishedRecord = await this.prisma.publishedExperience.create({
            data: {
                id: pubId,
                type: client_1.PublishType.ECOSYSTEM_PRESET,
                presetId: targetPresetId,
                bakedGlbUrl: glbUrl,
                qrCodeUrl: qrCodeDataUrl,
                viewUrl: directUrl,
            },
        });
        const item = {
            id: publishedRecord.id,
            presetId: publishedRecord.presetId,
            name: presetName || 'Rantai Makanan AR',
            filename: `${pubId}.glb`,
            glbUrl,
            size: 80824,
            directUrl,
            qrFilename,
            qrCodeDataUrl,
            publishedAt: publishedRecord.createdAt.toISOString(),
        };
        return {
            success: true,
            id: publishedRecord.id,
            item,
            directUrl,
            qrCodeDataUrl,
        };
    }
};
exports.EcosystemService = EcosystemService;
exports.EcosystemService = EcosystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EcosystemService);
//# sourceMappingURL=ecosystem.service.js.map