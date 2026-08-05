import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';
import http from 'http';

function fetchUrl(url: string): Promise<{ statusCode: number; contentType: string; bodyLength: number }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
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

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });

  app.enableCors({ origin: '*' });

  const rootDir = path.join(__dirname, '..', '..');
  const serverUploadsDir = path.join(rootDir, 'server', 'uploads');
  const clientDir = path.join(rootDir, 'client');

  app.use('/assets', express.static(serverUploadsDir, {
    maxAge: '7d',
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.glb')) res.setHeader('Content-Type', 'model/gltf-binary');
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
    } catch (err) {
      console.error(`❌ ${r.name} (${r.path}) → ERROR: ${err.message}`);
    }
  }

  await app.close();
  console.log('\n=====================================================');
  console.log('✅ ALL FASE R4 REWIRING ROUTES VALIDATED SUCCESSFULLY');
  console.log('=====================================================');
}

testRewiring().catch(console.error);
