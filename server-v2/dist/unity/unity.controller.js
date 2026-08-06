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
exports.UnityController = void 0;
const common_1 = require("@nestjs/common");
const unity_service_1 = require("./unity.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const unity_structured_dto_1 = require("./dto/unity-structured.dto");
let UnityController = class UnityController {
    unityService;
    constructor(unityService) {
        this.unityService = unityService;
    }
    async createScene(dto) {
        return this.unityService.createScene(dto);
    }
    async getScene(id) {
        return this.unityService.getScene(id);
    }
    async addObject(sceneId, dto) {
        return this.unityService.addObject(sceneId, dto);
    }
    async updateObject(id, dto) {
        return this.unityService.updateObject(id, dto);
    }
    async deleteObject(id) {
        return this.unityService.deleteObject(id);
    }
    async addInteractivity(sceneId, dto) {
        return this.unityService.addInteractivity(sceneId, dto);
    }
    async deleteInteractivity(id) {
        return this.unityService.deleteInteractivity(id);
    }
    async publishScene(sceneId, dto, req) {
        const hostHeader = req.get('host') || 'localhost:3001';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        return this.unityService.publishScene(sceneId, dto, hostHeader, protocol);
    }
};
exports.UnityController = UnityController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Post)('scenes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [unity_structured_dto_1.CreateStructuredSceneDto]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "createScene", null);
__decorate([
    (0, common_1.Get)('scenes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "getScene", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Post)('scenes/:sceneId/objects'),
    __param(0, (0, common_1.Param)('sceneId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unity_structured_dto_1.CreateSceneObjectDto]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "addObject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Put)('objects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unity_structured_dto_1.UpdateSceneObjectDto]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "updateObject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Delete)('objects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "deleteObject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Post)('scenes/:sceneId/interactivities'),
    __param(0, (0, common_1.Param)('sceneId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unity_structured_dto_1.CreateInteractivityDto]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "addInteractivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Delete)('interactivities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "deleteInteractivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Post)('publish/:sceneId'),
    __param(0, (0, common_1.Param)('sceneId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unity_structured_dto_1.PublishUnitySceneDto, Object]),
    __metadata("design:returntype", Promise)
], UnityController.prototype, "publishScene", null);
exports.UnityController = UnityController = __decorate([
    (0, common_1.Controller)('api/unity'),
    __metadata("design:paramtypes", [unity_service_1.UnityService])
], UnityController);
//# sourceMappingURL=unity.controller.js.map