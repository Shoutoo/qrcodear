import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

  const rootDir = path.join(__dirname, '..', '..');
  const serverUploadsDir = path.join(rootDir, 'server', 'uploads');
  const clientDir = path.join(rootDir, 'client');

  // Serve static assets with CORS and MIME types
  app.use('/assets', express.static(serverUploadsDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.glb')) {
        res.setHeader('Content-Type', 'model/gltf-binary');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.endsWith('.gltf')) {
        res.setHeader('Content-Type', 'model/gltf+json');
      } else if (filePath.endsWith('.usdz')) {
        res.setHeader('Content-Type', 'model/vnd.usdz+zip');
      }
    },
  }));

  app.use('/uploads', express.static(serverUploadsDir, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  }));

  app.use(express.static(clientDir));

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 NestJS AlamVerse Platform Server (Where Nature Meets Reality) running on http://localhost:${port}`);
}

bootstrap();
