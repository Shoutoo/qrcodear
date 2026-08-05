import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as qrcode from 'qrcode';

@Injectable()
export class ScenesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const scenes = await this.prisma.scene.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Return scene data array compatible with Express response
    return scenes.map((s) => ({
      id: s.id,
      ...(typeof s.data === 'object' && s.data !== null ? s.data : {}),
      createdAt: s.createdAt,
    }));
  }

  async findOne(id: string) {
    const cleanId = id.replace(/^scene_/, '');
    const scene = await this.prisma.scene.findFirst({
      where: {
        OR: [{ id }, { id: cleanId }],
      },
    });

    if (!scene) {
      throw new NotFoundException('Scene tidak ditemukan');
    }

    return {
      id: scene.id,
      ...(typeof scene.data === 'object' && scene.data !== null ? scene.data : {}),
      createdAt: scene.createdAt,
    };
  }

  async publishScene(id: string, sceneData: any, hostHeader: string, protocol = 'http') {
    const cleanId = id.replace(/^scene_/, '');

    // Get default project or fallback
    const defaultProject = await this.prisma.project.findFirst();
    if (!defaultProject) {
      throw new NotFoundException('Default project tidak ditemukan');
    }

    let targetSceneData = sceneData || { id: cleanId, name: 'AR Scene', objects: [] };
    targetSceneData.id = cleanId || targetSceneData.id || `scene_${Date.now()}`;
    targetSceneData.isPublished = true;
    targetSceneData.publishedAt = new Date().toISOString();

    const existing = await this.prisma.scene.findFirst({
      where: { OR: [{ id: cleanId }, { id }] },
    });

    let sceneRecord;
    if (existing) {
      sceneRecord = await this.prisma.scene.update({
        where: { id: existing.id },
        data: {
          data: targetSceneData,
        },
      });
    } else {
      sceneRecord = await this.prisma.scene.create({
        data: {
          id: cleanId,
          projectId: defaultProject.id,
          data: targetSceneData,
        },
      });
    }

    const host = hostHeader || 'localhost:3001';
    const directUrl = `${protocol}://${host}/studio/view/${sceneRecord.id}`;
    const embedCode = `<iframe src="${directUrl}" width="100%" height="600" allow="camera;gyroscope;accelerometer;magnetometer;xr-spatial-tracking" frameborder="0"></iframe>`;

    const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 300 });

    return {
      success: true,
      sceneId: sceneRecord.id,
      sceneName: (targetSceneData && targetSceneData.name) || 'AR Scene',
      directUrl,
      embedCode,
      qrCodeDataUrl,
    };
  }
}
