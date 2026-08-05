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
exports.ScenesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const qrcode = __importStar(require("qrcode"));
let ScenesService = class ScenesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const scenes = await this.prisma.scene.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return scenes.map((s) => ({
            id: s.id,
            ...(typeof s.data === 'object' && s.data !== null ? s.data : {}),
            createdAt: s.createdAt,
        }));
    }
    async findOne(id) {
        const cleanId = id.replace(/^scene_/, '');
        const scene = await this.prisma.scene.findFirst({
            where: {
                OR: [{ id }, { id: cleanId }],
            },
        });
        if (!scene) {
            throw new common_1.NotFoundException('Scene tidak ditemukan');
        }
        return {
            id: scene.id,
            ...(typeof scene.data === 'object' && scene.data !== null ? scene.data : {}),
            createdAt: scene.createdAt,
        };
    }
    async publishScene(id, sceneData, hostHeader, protocol = 'http') {
        const cleanId = id.replace(/^scene_/, '');
        const defaultProject = await this.prisma.project.findFirst();
        if (!defaultProject) {
            throw new common_1.NotFoundException('Default project tidak ditemukan');
        }
        let targetSceneData = sceneData || { id: cleanId, name: 'AR Scene', objects: [] };
        targetSceneData.id = cleanId || targetSceneData.id || `scene_${Date.now()}`;
        targetSceneData.isPublished = true;
        targetSceneData.publishedAt = new Date().toISOString();
        const existing = await this.prisma.scene.findFirst({
            where: { OR: [{ id: cleanId }, { id }] },
        });
        let sceneRecord;
        if (existing) {
            sceneRecord = await this.prisma.scene.update({
                where: { id: existing.id },
                data: {
                    data: targetSceneData,
                },
            });
        }
        else {
            sceneRecord = await this.prisma.scene.create({
                data: {
                    id: cleanId,
                    projectId: defaultProject.id,
                    data: targetSceneData,
                },
            });
        }
        const host = hostHeader || 'localhost:3001';
        const directUrl = `${protocol}://${host}/studio/view/${sceneRecord.id}`;
        const embedCode = `<iframe src="${directUrl}" width="100%" height="600" allow="camera;gyroscope;accelerometer;magnetometer;xr-spatial-tracking" frameborder="0"></iframe>`;
        const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 300 });
        return {
            success: true,
            sceneId: sceneRecord.id,
            sceneName: (targetSceneData && targetSceneData.name) || 'AR Scene',
            directUrl,
            embedCode,
            qrCodeDataUrl,
        };
    }
};
exports.ScenesService = ScenesService;
exports.ScenesService = ScenesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScenesService);
//# sourceMappingURL=scenes.service.js.map