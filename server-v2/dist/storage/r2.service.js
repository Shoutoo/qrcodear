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
var R2Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const LOCAL_UPLOADS_DIR = path.join(ROOT_DIR, 'server', 'uploads');
let R2Service = R2Service_1 = class R2Service {
    configService;
    logger = new common_1.Logger(R2Service_1.name);
    s3Client;
    bucketName;
    publicUrlBase;
    isConfigured = false;
    constructor(configService) {
        this.configService = configService;
        const accountId = this.configService.get('R2_ACCOUNT_ID', '');
        const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID', '');
        const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY', '');
        this.bucketName = this.configService.get('R2_BUCKET_NAME', 'eduar-assets');
        this.publicUrlBase = this.configService.get('R2_PUBLIC_URL_BASE', 'https://assets.eduar-platform.com');
        if (accountId && accessKeyId && secretAccessKey && !accessKeyId.includes('YOUR_')) {
            this.isConfigured = true;
            this.s3Client = new client_s3_1.S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
        }
        else {
            this.logger.log('Cloudflare R2 credentials not fully set. Storage service operating in LOCAL DISK FALLBACK mode.');
        }
    }
    async checkConnection() {
        if (!this.isConfigured || !this.s3Client)
            return false;
        try {
            await this.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucketName }));
            return true;
        }
        catch (error) {
            this.logger.warn(`R2 Connection check failed: ${error.message}`);
            return false;
        }
    }
    async uploadWithFallback(key, buffer, contentType) {
        if (this.isConfigured && this.s3Client) {
            try {
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                });
                await this.s3Client.send(command);
                const url = `${this.publicUrlBase.replace(/\/$/, '')}/${key}`;
                this.logger.log(`Uploaded file to Cloudflare R2: ${key} -> ${url}`);
                return { key, url, mode: 'R2' };
            }
            catch (err) {
                this.logger.warn(`Failed to upload to Cloudflare R2 (${err.message}). Falling back to local disk storage.`);
            }
        }
        if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
            fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
        }
        const localFilePath = path.join(LOCAL_UPLOADS_DIR, key);
        fs.writeFileSync(localFilePath, buffer);
        const localUrl = `/assets/${key}`;
        this.logger.log(`Saved file to Local Disk Storage Fallback: ${localFilePath} -> ${localUrl}`);
        return { key, url: localUrl, mode: 'LOCAL' };
    }
    async deleteWithFallback(key) {
        let r2Success = false;
        if (this.isConfigured && this.s3Client) {
            try {
                await this.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
                r2Success = true;
            }
            catch (err) {
                this.logger.warn(`Failed to delete from Cloudflare R2: ${err.message}`);
            }
        }
        const localFilePath = path.join(LOCAL_UPLOADS_DIR, key);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return true;
    }
};
exports.R2Service = R2Service;
exports.R2Service = R2Service = R2Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2Service);
//# sourceMappingURL=r2.service.js.map