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
exports.UnityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const qrcode = __importStar(require("qrcode"));
let UnityService = class UnityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createScene(dto) {
        let projectId = dto.projectId;
        if (!projectId) {
            const defaultProject = await this.prisma.project.findFirst();
            if (!defaultProject)
                throw new common_1.NotFoundException('Default project tidak ditemukan');
            projectId = defaultProject.id;
        }
        const scene = await this.prisma.scene.create({
            data: {
                projectId,
                format: client_1.SceneFormat.STRUCTURED,
                order: dto.order || 0,
            },
            include: {
                objects: true,
                interactivities: true,
            },
        });
        return { success: true, scene };
    }
    async getScene(sceneId) {
        const scene = await this.prisma.scene.findUnique({
            where: { id: sceneId },
            include: {
                objects: {
                    include: {
                        asset: true,
                    },
                },
                interactivities: {
                    include: {
                        triggerObject: true,
                        targetObject: true,
                    },
                },
            },
        });
        if (!scene)
            throw new common_1.NotFoundException('Structured scene tidak ditemukan');
        return { success: true, scene };
    }
    async addObject(sceneId, dto) {
        const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
        if (!scene)
            throw new common_1.NotFoundException('Scene tidak ditemukan');
        const sceneObject = await this.prisma.sceneObject.create({
            data: {
                sceneId,
                assetId: dto.assetId || undefined,
                type: dto.type,
                textContent: dto.textContent,
                color: dto.color,
                positionX: dto.positionX || 0,
                positionY: dto.positionY || 0,
                positionZ: dto.positionZ || 0,
                rotationX: dto.rotationX || 0,
                rotationY: dto.rotationY || 0,
                rotationZ: dto.rotationZ || 0,
                scaleX: dto.scaleX !== undefined ? dto.scaleX : 1,
                scaleY: dto.scaleY !== undefined ? dto.scaleY : 1,
                scaleZ: dto.scaleZ !== undefined ? dto.scaleZ : 1,
            },
            include: { asset: true },
        });
        return { success: true, object: sceneObject };
    }
    async updateObject(objectId, dto) {
        const existing = await this.prisma.sceneObject.findUnique({ where: { id: objectId } });
        if (!existing)
            throw new common_1.NotFoundException('Scene object tidak ditemukan');
        const updated = await this.prisma.sceneObject.update({
            where: { id: objectId },
            data: {
                textContent: dto.textContent !== undefined ? dto.textContent : existing.textContent,
                color: dto.color !== undefined ? dto.color : existing.color,
                positionX: dto.positionX !== undefined ? dto.positionX : existing.positionX,
                positionY: dto.positionY !== undefined ? dto.positionY : existing.positionY,
                positionZ: dto.positionZ !== undefined ? dto.positionZ : existing.positionZ,
                rotationX: dto.rotationX !== undefined ? dto.rotationX : existing.rotationX,
                rotationY: dto.rotationY !== undefined ? dto.rotationY : existing.rotationY,
                rotationZ: dto.rotationZ !== undefined ? dto.rotationZ : existing.rotationZ,
                scaleX: dto.scaleX !== undefined ? dto.scaleX : existing.scaleX,
                scaleY: dto.scaleY !== undefined ? dto.scaleY : existing.scaleY,
                scaleZ: dto.scaleZ !== undefined ? dto.scaleZ : existing.scaleZ,
            },
        });
        return { success: true, object: updated };
    }
    async deleteObject(objectId) {
        const existing = await this.prisma.sceneObject.findUnique({ where: { id: objectId } });
        if (!existing)
            throw new common_1.NotFoundException('Scene object tidak ditemukan');
        await this.prisma.sceneObject.delete({ where: { id: objectId } });
        return { success: true, message: 'Scene object berhasil dihapus' };
    }
    async addInteractivity(sceneId, dto) {
        const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
        if (!scene)
            throw new common_1.NotFoundException('Scene tidak ditemukan');
        const interactivity = await this.prisma.interactivity.create({
            data: {
                sceneId,
                name: dto.name || `${dto.actionType} Rule`,
                triggerObjectId: dto.triggerObjectId,
                targetObjectId: dto.targetObjectId,
                actionType: dto.actionType,
                params: dto.params || {},
                startTime: dto.startTime || 0,
                duration: dto.duration || 0,
                easing: dto.easing || 'easeOutQuad',
                autoTrigger: dto.autoTrigger || false,
            },
        });
        return { success: true, interactivity };
    }
    async deleteInteractivity(id) {
        const existing = await this.prisma.interactivity.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Interactivity tidak ditemukan');
        await this.prisma.interactivity.delete({ where: { id } });
        return { success: true, message: 'Interactivity rule berhasil dihapus' };
    }
    async publishScene(sceneId, dto, hostHeader, protocol = 'http') {
        const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
        if (!scene)
            throw new common_1.NotFoundException('Scene tidak ditemukan');
        const host = hostHeader || 'localhost:3001';
        const directUrl = `${protocol}://${host}/studio/view/${sceneId}`;
        const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 400 });
        const published = await this.prisma.publishedExperience.create({
            data: {
                type: client_1.PublishType.STUDIO_SCENE,
                sceneId,
                qrCodeUrl: qrCodeDataUrl,
                viewUrl: directUrl,
                allow3DView: dto.allow3DView !== undefined ? dto.allow3DView : true,
                allowMarkerAR: dto.allowMarkerAR !== undefined ? dto.allowMarkerAR : true,
                allowMarkerlessAR: dto.allowMarkerlessAR !== undefined ? dto.allowMarkerlessAR : true,
                customMarkerUrl: dto.customMarkerUrl,
            },
        });
        return {
            success: true,
            publishedId: published.id,
            sceneId,
            directUrl,
            qrCodeDataUrl,
            allow3DView: published.allow3DView,
            allowMarkerAR: published.allowMarkerAR,
            allowMarkerlessAR: published.allowMarkerlessAR,
        };
    }
};
exports.UnityService = UnityService;
exports.UnityService = UnityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnityService);
//# sourceMappingURL=unity.service.js.map