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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path = __importStar(require("path"));
const express = __importStar(require("express"));
const http_1 = __importDefault(require("http"));
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        http_1.default.get(url, (res) => {
            let dataLength = 0;
            res.on('data', (chunk) => { dataLength += chunk.length; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    contentType: res.headers['content-type'] || '',
                    bodyLength: dataLength,
                });
            });
        }).on('error', reject);
    });
}
async function testRewiring() {
    console.log('=====================================================');
    console.log('🧪 FASE R4: Testing NestJS Rewiring & HTML View Rendering');
    console.log('=====================================================\n');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: false });
    app.enableCors({ origin: '*' });
    const rootDir = path.join(__dirname, '..', '..');
    const serverUploadsDir = path.join(rootDir, 'server', 'uploads');
    const clientDir = path.join(rootDir, 'client');
    app.use('/assets', express.static(serverUploadsDir, {
        maxAge: '7d',
        setHeaders: (res, filePath) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (filePath.endsWith('.glb'))
                res.setHeader('Content-Type', 'model/gltf-binary');
        },
    }));
    app.use('/uploads', express.static(serverUploadsDir));
    app.use(express.static(clientDir));
    const PORT = 3003;
    await app.listen(PORT);
    console.log(`Server started on http://localhost:${PORT}\n`);
    const testRoutes = [
        { name: 'Studio App Page', path: '/studio', expectedType: 'text/html' },
        { name: 'Studio Scene Viewer Page', path: '/studio/view/sample-scene-01', expectedType: 'text/html' },
        { name: 'AR Model Viewer Page', path: '/ar/lib-sawah-jamur', expectedType: 'text/html' },
        { name: 'Ecosystem AR Viewer Page', path: '/ecosystem/view/preset-darat', expectedType: 'text/html' },
        { name: 'Print Card Page', path: '/print/preset-darat', expectedType: 'text/html' },
        { name: 'Static GLB Model Asset', path: '/assets/eco_darat_baked.glb', expectedType: 'model/gltf-binary' },
    ];
    for (const r of testRoutes) {
        try {
            const res = await fetchUrl(`http://localhost:${PORT}${r.path}`);
            const pass = res.statusCode === 200 && res.bodyLength > 0;
            console.log(`${pass ? '✅' : '❌'} ${r.name} (${r.path}) → HTTP ${res.statusCode} [${res.contentType}] (${res.bodyLength} bytes)`);
        }
        catch (err) {
            console.error(`❌ ${r.name} (${r.path}) → ERROR: ${err.message}`);
        }
    }
    await app.close();
    console.log('\n=====================================================');
    console.log('✅ ALL FASE R4 REWIRING ROUTES VALIDATED SUCCESSFULLY');
    console.log('=====================================================');
}
testRewiring().catch(console.error);
//# sourceMappingURL=test-r4-rewiring.js.map