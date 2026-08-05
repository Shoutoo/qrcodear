import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SceneFormat, PublishType } from '@prisma/client';
import * as qrcode from 'qrcode';
import {
  CreateStructuredSceneDto,
  CreateSceneObjectDto,
  UpdateSceneObjectDto,
  CreateInteractivityDto,
  PublishUnitySceneDto,
} from './dto/unity-structured.dto';

@Injectable()
export class UnityService {
  constructor(private prisma: PrismaService) {}

  async createScene(dto: CreateStructuredSceneDto) {
    let projectId = dto.projectId;
    if (!projectId) {
      const defaultProject = await this.prisma.project.findFirst();
      if (!defaultProject) throw new NotFoundException('Default project tidak ditemukan');
      projectId = defaultProject.id;
    }

    const scene = await this.prisma.scene.create({
      data: {
        projectId,
        format: SceneFormat.STRUCTURED,
        order: dto.order || 0,
      },
      include: {
        objects: true,
        interactivities: true,
      },
    });

    return { success: true, scene };
  }

  async getScene(sceneId: string) {
    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        objects: {
          include: {
            asset: true,
          },
        },
        interactivities: {
          include: {
            triggerObject: true,
            targetObject: true,
          },
        },
      },
    });

    if (!scene) throw new NotFoundException('Structured scene tidak ditemukan');

    return { success: true, scene };
  }

  async addObject(sceneId: string, dto: CreateSceneObjectDto) {
    const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
    if (!scene) throw new NotFoundException('Scene tidak ditemukan');

    const sceneObject = await this.prisma.sceneObject.create({
      data: {
        sceneId,
        assetId: dto.assetId || undefined,
        type: dto.type,
        textContent: dto.textContent,
        color: dto.color,
        positionX: dto.positionX || 0,
        positionY: dto.positionY || 0,
        positionZ: dto.positionZ || 0,
        rotationX: dto.rotationX || 0,
        rotationY: dto.rotationY || 0,
        rotationZ: dto.rotationZ || 0,
        scaleX: dto.scaleX !== undefined ? dto.scaleX : 1,
        scaleY: dto.scaleY !== undefined ? dto.scaleY : 1,
        scaleZ: dto.scaleZ !== undefined ? dto.scaleZ : 1,
      },
      include: { asset: true },
    });

    return { success: true, object: sceneObject };
  }

  async updateObject(objectId: string, dto: UpdateSceneObjectDto) {
    const existing = await this.prisma.sceneObject.findUnique({ where: { id: objectId } });
    if (!existing) throw new NotFoundException('Scene object tidak ditemukan');

    const updated = await this.prisma.sceneObject.update({
      where: { id: objectId },
      data: {
        textContent: dto.textContent !== undefined ? dto.textContent : existing.textContent,
        color: dto.color !== undefined ? dto.color : existing.color,
        positionX: dto.positionX !== undefined ? dto.positionX : existing.positionX,
        positionY: dto.positionY !== undefined ? dto.positionY : existing.positionY,
        positionZ: dto.positionZ !== undefined ? dto.positionZ : existing.positionZ,
        rotationX: dto.rotationX !== undefined ? dto.rotationX : existing.rotationX,
        rotationY: dto.rotationY !== undefined ? dto.rotationY : existing.rotationY,
        rotationZ: dto.rotationZ !== undefined ? dto.rotationZ : existing.rotationZ,
        scaleX: dto.scaleX !== undefined ? dto.scaleX : existing.scaleX,
        scaleY: dto.scaleY !== undefined ? dto.scaleY : existing.scaleY,
        scaleZ: dto.scaleZ !== undefined ? dto.scaleZ : existing.scaleZ,
      },
    });

    return { success: true, object: updated };
  }

  async deleteObject(objectId: string) {
    const existing = await this.prisma.sceneObject.findUnique({ where: { id: objectId } });
    if (!existing) throw new NotFoundException('Scene object tidak ditemukan');

    await this.prisma.sceneObject.delete({ where: { id: objectId } });
    return { success: true, message: 'Scene object berhasil dihapus' };
  }

  async addInteractivity(sceneId: string, dto: CreateInteractivityDto) {
    const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
    if (!scene) throw new NotFoundException('Scene tidak ditemukan');

    const interactivity = await this.prisma.interactivity.create({
      data: {
        sceneId,
        name: dto.name || `${dto.actionType} Rule`,
        triggerObjectId: dto.triggerObjectId,
        targetObjectId: dto.targetObjectId,
        actionType: dto.actionType,
        params: dto.params || {},
        startTime: dto.startTime || 0,
        duration: dto.duration || 0,
        easing: dto.easing || 'easeOutQuad',
        autoTrigger: dto.autoTrigger || false,
      },
    });

    return { success: true, interactivity };
  }

  async deleteInteractivity(id: string) {
    const existing = await this.prisma.interactivity.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Interactivity tidak ditemukan');

    await this.prisma.interactivity.delete({ where: { id } });
    return { success: true, message: 'Interactivity rule berhasil dihapus' };
  }

  async publishScene(sceneId: string, dto: PublishUnitySceneDto, hostHeader: string, protocol = 'http') {
    const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
    if (!scene) throw new NotFoundException('Scene tidak ditemukan');

    const host = hostHeader || 'localhost:3001';
    const directUrl = `${protocol}://${host}/studio/view/${sceneId}`;

    const qrCodeDataUrl = await qrcode.toDataURL(directUrl, { margin: 2, width: 400 });

    const published = await this.prisma.publishedExperience.create({
      data: {
        type: PublishType.STUDIO_SCENE,
        sceneId,
        qrCodeUrl: qrCodeDataUrl,
        viewUrl: directUrl,
        allow3DView: dto.allow3DView !== undefined ? dto.allow3DView : true,
        allowMarkerAR: dto.allowMarkerAR !== undefined ? dto.allowMarkerAR : true,
        allowMarkerlessAR: dto.allowMarkerlessAR !== undefined ? dto.allowMarkerlessAR : true,
        customMarkerUrl: dto.customMarkerUrl,
      },
    });

    return {
      success: true,
      publishedId: published.id,
      sceneId,
      directUrl,
      qrCodeDataUrl,
      allow3DView: published.allow3DView,
      allowMarkerAR: published.allowMarkerAR,
      allowMarkerlessAR: published.allowMarkerlessAR,
    };
  }
}
