import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType, PublishType } from '@prisma/client';
import * as qrcode from 'qrcode';

@Injectable()
export class EcosystemService {
  constructor(private prisma: PrismaService) {}

  async getLibrary() {
    const assets = await this.prisma.asset.findMany({
      where: { type: AssetType.ECOSYSTEM_MODEL },
      orderBy: { createdAt: 'asc' },
    });

    const ecoNames = ['darat', 'hutan', 'laut', 'sawah'];
    const ecoTitleMap: Record<string, string> = {
      darat: 'Ekosistem Darat',
      hutan: 'Ekosistem Hutan',
      laut: 'Ekosistem Laut',
      sawah: 'Ekosistem Sawah',
    };

    const library = ecoNames.map((eco) => {
      const items = assets
        .filter((a) => a.ecosystem === eco)
        .map((a) => ({
          id: a.id,
          name: a.label,
          role: a.role,
          icon: this.getIconForRole(a.role),
          modelSrc: a.modelUrl,
          thumbnail: a.textureUrl || `/uploads/ecosystem-models/library/${eco}/${a.label?.toLowerCase()}-thumb.png`,
          source: a.source,
          license: a.license,
        }));

      return {
        ecosystem: eco,
        name: ecoTitleMap[eco] || `Ekosistem ${eco}`,
        items,
      };
    });

    return { success: true, library };
  }

  private getIconForRole(role?: string | null): string {
    switch (role) {
      case 'produsen': return 'grass';
      case 'konsumen_primer': return 'bug_report';
      case 'konsumen_sekunder': return 'water_drop';
      case 'konsumen_tersier': return 'waves';
      case 'konsumen_final': return 'flight';
      case 'decomposer': return 'forest';
      default: return 'nature';
    }
  }

  async getPresets() {
    const presets = await this.prisma.ecosystemPreset.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      presets: presets.map((p) => ({
        id: p.id,
        name: p.name,
        slots: p.slots,
      })),
    };
  }

  async getPresetById(id: string) {
    const preset = await this.prisma.ecosystemPreset.findUnique({
      where: { id },
    });

    if (!preset) {
      throw new NotFoundException('Preset tidak ditemukan');
    }

    return {
      success: true,
      preset: {
        id: preset.id,
        name: preset.name,
        slots: preset.slots,
      },
    };
  }

  async updateSlot(id: string, slotIndex: number, label?: string, modelSrc?: string) {
    const preset = await this.prisma.ecosystemPreset.findUnique({ where: { id } });
    if (!preset) {
      throw new NotFoundException('Preset tidak ditemukan');
    }

    const slots = Array.isArray(preset.slots) ? [...(preset.slots as any[])] : [];
    if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= slots.length) {
      throw new BadRequestException('Index slot tidak valid');
    }

    if (label !== undefined) slots[slotIndex].label = String(label).trim();
    if (modelSrc) slots[slotIndex].modelSrc = modelSrc;

    const updated = await this.prisma.ecosystemPreset.update({
      where: { id },
      data: { slots },
    });

    return {
      success: true,
      preset: updated,
      updatedSlot: slots[slotIndex],
    };
  }

  async publishEcosystem(presetId?: string, presetName?: string, hostHeader?: string, protocol = 'http') {
    let targetPresetId = presetId;
    if (!targetPresetId && presetName) {
      const lowerName = presetName.toLowerCase();
      if (lowerName.includes('laut')) targetPresetId = 'preset-laut';
      else if (lowerName.includes('hutan')) targetPresetId = 'preset-hutan';
      else if (lowerName.includes('sawah')) targetPresetId = 'preset-sawah';
      else if (lowerName.includes('darat')) targetPresetId = 'preset-darat';
    }
    if (!targetPresetId) targetPresetId = 'preset-darat';

    const pubId = `eco_${Date.now().toString(36)}`;
    const host = hostHeader || 'localhost:3001';
    const directUrl = `${protocol}://${host}/ecosystem/view/${pubId}`;
    const glbUrl = `/assets/${pubId}.glb`;
    const qrFilename = `${pubId}_qr.png`;

    const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 400 });

    const publishedRecord = await this.prisma.publishedExperience.create({
      data: {
        id: pubId,
        type: PublishType.ECOSYSTEM_PRESET,
        presetId: targetPresetId,
        bakedGlbUrl: glbUrl,
        qrCodeUrl: qrCodeDataUrl,
        viewUrl: directUrl,
      },
    });

    const item = {
      id: publishedRecord.id,
      presetId: publishedRecord.presetId,
      name: presetName || 'Rantai Makanan AR',
      filename: `${pubId}.glb`,
      glbUrl,
      size: 80824,
      directUrl,
      qrFilename,
      qrCodeDataUrl,
      publishedAt: publishedRecord.createdAt.toISOString(),
    };

    return {
      success: true,
      id: publishedRecord.id,
      item,
      directUrl,
      qrCodeDataUrl,
    };
  }
}
