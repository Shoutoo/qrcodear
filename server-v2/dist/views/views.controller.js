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
exports.ViewsController = void 0;
const common_1 = require("@nestjs/common");
const views_service_1 = require("./views.service");
let ViewsController = class ViewsController {
    viewsService;
    constructor(viewsService) {
        this.viewsService = viewsService;
    }
    async getHomepage(res) {
        const html = await this.viewsService.renderHomepage();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getStudioApp(res) {
        const html = await this.viewsService.renderStudioApp();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getArViewer(id, req, res) {
        const hostHeader = req.get('host') || 'localhost:3001';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        const html = await this.viewsService.renderArViewer(id, hostHeader, protocol);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getStudioViewer(id, res) {
        const html = await this.viewsService.renderStudioViewer(id);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getPrintCard(id, req, res) {
        const hostHeader = req.get('host') || 'localhost:3002';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        const html = await this.viewsService.renderPrintCard(id, hostHeader, protocol);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getPrintPresetCard(id, req, res) {
        const hostHeader = req.get('host') || 'localhost:3002';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        const html = await this.viewsService.renderPrintCard(id, hostHeader, protocol);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getEcosystemViewer(id, req, res) {
        const hostHeader = req.get('host') || 'localhost:3001';
        const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
        const html = await this.viewsService.renderEcosystemViewer(id, hostHeader, protocol);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getLoginPage(res) {
        const html = await this.viewsService.renderHomepage();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
    async getRegisterPage(res) {
        const html = await this.viewsService.renderHomepage();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    }
};
exports.ViewsController = ViewsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getHomepage", null);
__decorate([
    (0, common_1.Get)('studio'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getStudioApp", null);
__decorate([
    (0, common_1.Get)('ar/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getArViewer", null);
__decorate([
    (0, common_1.Get)('studio/view/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getStudioViewer", null);
__decorate([
    (0, common_1.Get)('print/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getPrintCard", null);
__decorate([
    (0, common_1.Get)('print-preset/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getPrintPresetCard", null);
__decorate([
    (0, common_1.Get)('ecosystem/view/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getEcosystemViewer", null);
__decorate([
    (0, common_1.Get)('login'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getLoginPage", null);
__decorate([
    (0, common_1.Get)('register'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewsController.prototype, "getRegisterPage", null);
exports.ViewsController = ViewsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [views_service_1.ViewsService])
], ViewsController);
//# sourceMappingURL=views.controller.js.map