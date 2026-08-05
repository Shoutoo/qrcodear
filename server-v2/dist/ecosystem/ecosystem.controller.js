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
exports.EcosystemController = void 0;
const common_1 = require("@nestjs/common");
const ecosystem_service_1 = require("./ecosystem.service");
let EcosystemController = class EcosystemController {
    ecosystemService;
    constructor(ecosystemService) {
        this.ecosystemService = ecosystemService;
    }
    async getLibrary() {
        return this.ecosystemService.getLibrary();
    }
    async getPresets() {
        return this.ecosystemService.getPresets();
    }
    async getPresetById(id) {
        return this.ecosystemService.getPresetById(id);
    }
    async updateSlot(id, slotIndex, label, modelSrc) {
        return this.ecosystemService.updateSlot(id, Number(slotIndex), label, modelSrc);
    }
    async publishEcosystem(presetId, presetName, req) {
        const hostHeader = req.get('host') || 'localhost:3001';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        return this.ecosystemService.publishEcosystem(presetId, presetName, hostHeader, protocol);
    }
};
exports.EcosystemController = EcosystemController;
__decorate([
    (0, common_1.Get)('library'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EcosystemController.prototype, "getLibrary", null);
__decorate([
    (0, common_1.Get)('presets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EcosystemController.prototype, "getPresets", null);
__decorate([
    (0, common_1.Get)('presets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EcosystemController.prototype, "getPresetById", null);
__decorate([
    (0, common_1.Post)('presets/:id/slot'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('slotIndex')),
    __param(2, (0, common_1.Body)('label')),
    __param(3, (0, common_1.Body)('modelSrc')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String]),
    __metadata("design:returntype", Promise)
], EcosystemController.prototype, "updateSlot", null);
__decorate([
    (0, common_1.Post)('publish'),
    __param(0, (0, common_1.Body)('presetId')),
    __param(1, (0, common_1.Body)('presetName')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EcosystemController.prototype, "publishEcosystem", null);
exports.EcosystemController = EcosystemController = __decorate([
    (0, common_1.Controller)('api/ecosystem'),
    __metadata("design:paramtypes", [ecosystem_service_1.EcosystemService])
], EcosystemController);
//# sourceMappingURL=ecosystem.controller.js.map