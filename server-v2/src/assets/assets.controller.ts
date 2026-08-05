import { Controller, Get, Post, Delete, Param, Body, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Request } from 'express';

@Controller('api')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('assets')
  async getAllAssets() {
    const assets = await this.assetsService.findAll();
    return { assets };
  }

  @Get('assets/:id/qr')
  async getAssetQr(@Param('id') id: string, @Req() req: any) {
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    return this.assetsService.getAssetQr(id, hostHeader, protocol);
  }

  @Post('assets/:id/annotations')
  async saveAnnotations(@Param('id') id: string, @Body('annotations') annotations: any[]) {
    return this.assetsService.saveAnnotations(id, annotations);
  }

  @Delete('assets/:id')
  async deleteAsset(@Param('id') id: string) {
    return this.assetsService.deleteAsset(id);
  }
}
