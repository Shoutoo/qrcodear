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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const qrcode = __importStar(require("qrcode"));
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(type) {
        const assets = await this.prisma.asset.findMany({
            where: type ? { type } : undefined,
            orderBy: { createdAt: 'desc' },
        });
        return assets.map((a) => ({
            id: a.id,
            name: a.label || 'Model 3D',
            filename: a.modelUrl.split('/').pop(),
            modelSrc: a.modelUrl,
            thumbnail: a.textureUrl,
            source: a.source,
            license: a.license,
            ecosystem: a.ecosystem,
            role: a.role,
            createdAt: a.createdAt,
        }));
    }
    async getAssetQr(id, hostHeader, protocol = 'http') {
        const asset = await this.prisma.asset.findUnique({ where: { id } });
        const preset = !asset ? await this.prisma.ecosystemPreset.findFirst({ where: { OR: [{ id }, { id: `preset-${id}` }] } }) : null;
        const pub = (!asset && !preset) ? await this.prisma.publishedExperience.findFirst({ where: { OR: [{ id }, { bakedGlbUrl: `/assets/${id}.glb` }] } }) : null;
        if (!asset && !preset && !pub) {
            throw new common_1.NotFoundException('Aset / Preset tidak ditemukan');
        }
        const host = hostHeader || 'localhost:3001';
        const viewerUrl = preset
            ? `${protocol}://${host}/ecosystem/view/${preset.id}`
            : pub
                ? `${protocol}://${host}/ecosystem/view/${pub.id}`
                : `${protocol}://${host}/ar/${id}`;
        const printUrl = `${protocol}://${host}/print/${id}`;
        const qrDataUrl = await qrcode.toDataURL(viewerUrl, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 400,
            color: { dark: '#000000', light: '#ffffff' },
        });
        return {
            qrDataUrl,
            viewerUrl,
            printUrl,
            asset: {
                id: asset?.id || preset?.id || pub?.id || id,
                name: asset?.label || preset?.name || 'Rantai Makanan AR',
            },
        };
    }
    async saveAnnotations(id, annotations) {
        const asset = await this.prisma.asset.findUnique({ where: { id } });
        if (!asset) {
            throw new common_1.NotFoundException('Asset tidak ditemukan');
        }
        const sanitized = (Array.isArray(annotations) ? annotations : []).map((a) => ({
            name: String(a.name || '').trim().slice(0, 60),
            description: String(a.description || '').trim().slice(0, 300),
            dataPosition: String(a.dataPosition || a.position || '0m 0.25m 0m').trim(),
            dataNormal: String(a.dataNormal || a.normal || '0 1 0').trim(),
        }));
        await this.prisma.asset.update({
            where: { id },
            data: {
                label: asset.label,
            },
        });
        return { success: true, annotations: sanitized };
    }
    async deleteAsset(id) {
        const asset = await this.prisma.asset.findUnique({ where: { id } });
        if (!asset) {
            throw new common_1.NotFoundException('Asset tidak ditemukan');
        }
        await this.prisma.asset.delete({ where: { id } });
        return { success: true };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map