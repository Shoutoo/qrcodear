import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { EcosystemService } from './ecosystem.service';
import { Request } from 'express';

@Controller('api/ecosystem')
export class EcosystemController {
  constructor(private readonly ecosystemService: EcosystemService) {}

  @Get('library')
  async getLibrary() {
    return this.ecosystemService.getLibrary();
  }

  @Get('presets')
  async getPresets() {
    return this.ecosystemService.getPresets();
  }

  @Get('presets/:id')
  async getPresetById(@Param('id') id: string) {
    return this.ecosystemService.getPresetById(id);
  }

  @Post('presets/:id/slot')
  async updateSlot(
    @Param('id') id: string,
    @Body('slotIndex') slotIndex: number,
    @Body('label') label?: string,
    @Body('modelSrc') modelSrc?: string,
  ) {
    return this.ecosystemService.updateSlot(id, Number(slotIndex), label, modelSrc);
  }

  @Post('publish')
  async publishEcosystem(
    @Body('presetId') presetId: string,
    @Body('presetName') presetName: string,
    @Req() req: any,
  ) {
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    return this.ecosystemService.publishEcosystem(presetId, presetName, hostHeader, protocol);
  }
}
