import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType } from '@prisma/client';
import * as qrcode from 'qrcode';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: AssetType) {
    const assets = await this.prisma.asset.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((a) => ({
      id: a.id,
      name: a.label || 'Model 3D',
      filename: a.modelUrl.split('/').pop(),
      modelSrc: a.modelUrl,
      thumbnail: a.textureUrl,
      source: a.source,
      license: a.license,
      ecosystem: a.ecosystem,
      role: a.role,
      createdAt: a.createdAt,
    }));
  }

  async getAssetQr(id: string, hostHeader: string, protocol = 'http') {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    const preset = !asset ? await this.prisma.ecosystemPreset.findFirst({ where: { OR: [{ id }, { id: `preset-${id}` }] } }) : null;
    const pub = (!asset && !preset) ? await this.prisma.publishedExperience.findFirst({ where: { OR: [{ id }, { bakedGlbUrl: `/assets/${id}.glb` }] } }) : null;

    if (!asset && !preset && !pub) {
      throw new NotFoundException('Aset / Preset tidak ditemukan');
    }

    const host = hostHeader || 'localhost:3001';
    const viewerUrl = preset 
      ? `${protocol}://${host}/ecosystem/view/${preset.id}` 
      : pub 
        ? `${protocol}://${host}/ecosystem/view/${pub.id}` 
        : `${protocol}://${host}/ar/${id}`;
    const printUrl = `${protocol}://${host}/print/${id}`;

    const qrDataUrl = await qrcode.toDataURL(viewerUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return {
      qrDataUrl,
      viewerUrl,
      printUrl,
      asset: {
        id: asset?.id || preset?.id || pub?.id || id,
        name: asset?.label || preset?.name || 'Rantai Makanan AR',
      },
    };
  }

  async saveAnnotations(id: string, annotations: any[]) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset tidak ditemukan');
    }

    const sanitized = (Array.isArray(annotations) ? annotations : []).map((a) => ({
      name: String(a.name || '').trim().slice(0, 60),
      description: String(a.description || '').trim().slice(0, 300),
      dataPosition: String(a.dataPosition || a.position || '0m 0.25m 0m').trim(),
      dataNormal: String(a.dataNormal || a.normal || '0 1 0').trim(),
    }));

    await this.prisma.asset.update({
      where: { id },
      data: {
        label: asset.label, // keep existing label
      },
    });

    return { success: true, annotations: sanitized };
  }

  async deleteAsset(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset tidak ditemukan');
    }

    await this.prisma.asset.delete({ where: { id } });
    return { success: true };
  }
}
