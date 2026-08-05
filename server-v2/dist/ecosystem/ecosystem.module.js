"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcosystemModule = void 0;
const common_1 = require("@nestjs/common");
const ecosystem_controller_1 = require("./ecosystem.controller");
const ecosystem_service_1 = require("./ecosystem.service");
let EcosystemModule = class EcosystemModule {
};
exports.EcosystemModule = EcosystemModule;
exports.EcosystemModule = EcosystemModule = __decorate([
    (0, common_1.Module)({
        controllers: [ecosystem_controller_1.EcosystemController],
        providers: [ecosystem_service_1.EcosystemService],
        exports: [ecosystem_service_1.EcosystemService],
    })
], EcosystemModule);
//# sourceMappingURL=ecosystem.module.js.map