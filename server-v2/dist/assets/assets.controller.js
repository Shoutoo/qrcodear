"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const assets_service_1 = require("./assets.service");
let AssetsController = class AssetsController {
    assetsService;
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    async getAllAssets() {
        const assets = await this.assetsService.findAll();
        return { assets };
    }
    async getAssetQr(id, req) {
        const hostHeader = req.get('host') || 'localhost:3001';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        return this.assetsService.getAssetQr(id, hostHeader, protocol);
    }
    async saveAnnotations(id, annotations) {
        return this.assetsService.saveAnnotations(id, annotations);
    }
    async deleteAsset(id) {
        return this.assetsService.deleteAsset(id);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)('assets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAllAssets", null);
__decorate([
    (0, common_1.Get)('assets/:id/qr'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetQr", null);
__decorate([
    (0, common_1.Post)('assets/:id/annotations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('annotations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "saveAnnotations", null);
__decorate([
    (0, common_1.Delete)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "deleteAsset", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map