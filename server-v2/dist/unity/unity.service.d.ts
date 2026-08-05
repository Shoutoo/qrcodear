import { PrismaService } from '../prisma/prisma.service';
import { CreateStructuredSceneDto, CreateSceneObjectDto, UpdateSceneObjectDto, CreateInteractivityDto, PublishUnitySceneDto } from './dto/unity-structured.dto';
export declare class UnityService {
    private prisma;
    constructor(prisma: PrismaService);
    createScene(dto: CreateStructuredSceneDto): Promise<{
        success: boolean;
        scene: {
            objects: {
                id: string;
                sceneId: string;
                assetId: string | null;
                type: import(".prisma/client").$Enums.SceneObjectType;
                textContent: string | null;
                color: string | null;
                positionX: number;
                positionY: number;
                positionZ: number;
                rotationX: number;
                rotationY: number;
                rotationZ: number;
                scaleX: number;
                scaleY: number;
                scaleZ: number;
                createdAt: Date;
            }[];
            interactivities: {
                id: string;
                sceneId: string;
                name: string | null;
                triggerObjectId: string;
                targetObjectId: string;
                actionType: import(".prisma/client").$Enums.InteractivityActionType;
                params: import(".prisma/client").Prisma.JsonValue;
                startTime: number;
                duration: number;
                easing: string | null;
                autoTrigger: boolean;
                createdAt: Date;
            }[];
        } & {
            id: string;
            projectId: string;
            format: import(".prisma/client").$Enums.SceneFormat;
            data: import(".prisma/client").Prisma.JsonValue | null;
            order: number;
            createdAt: Date;
        };
    }>;
    getScene(sceneId: string): Promise<{
        success: boolean;
        scene: {
            objects: ({
                asset: {
                    id: string;
                    projectId: string | null;
                    type: import(".prisma/client").$Enums.AssetType;
                    modelUrl: string;
                    storageKey: string | null;
                    textureUrl: string | null;
                    label: string | null;
                    ecosystem: string | null;
                    role: string | null;
                    source: string | null;
                    license: string | null;
                    needsReview: boolean;
                    createdAt: Date;
                } | null;
            } & {
                id: string;
                sceneId: string;
                assetId: string | null;
                type: import(".prisma/client").$Enums.SceneObjectType;
                textContent: string | null;
                color: string | null;
                positionX: number;
                positionY: number;
                positionZ: number;
                rotationX: number;
                rotationY: number;
                rotationZ: number;
                scaleX: number;
                scaleY: number;
                scaleZ: number;
                createdAt: Date;
            })[];
            interactivities: ({
                triggerObject: {
                    id: string;
                    sceneId: string;
                    assetId: string | null;
                    type: import(".prisma/client").$Enums.SceneObjectType;
                    textContent: string | null;
                    color: string | null;
                    positionX: number;
                    positionY: number;
                    positionZ: number;
                    rotationX: number;
                    rotationY: number;
                    rotationZ: number;
                    scaleX: number;
                    scaleY: number;
                    scaleZ: number;
                    createdAt: Date;
                };
                targetObject: {
                    id: string;
                    sceneId: string;
                    assetId: string | null;
                    type: import(".prisma/client").$Enums.SceneObjectType;
                    textContent: string | null;
                    color: string | null;
                    positionX: number;
                    positionY: number;
                    positionZ: number;
                    rotationX: number;
                    rotationY: number;
                    rotationZ: number;
                    scaleX: number;
                    scaleY: number;
                    scaleZ: number;
                    createdAt: Date;
                };
            } & {
                id: string;
                sceneId: string;
                name: string | null;
                triggerObjectId: string;
                targetObjectId: string;
                actionType: import(".prisma/client").$Enums.InteractivityActionType;
                params: import(".prisma/client").Prisma.JsonValue;
                startTime: number;
                duration: number;
                easing: string | null;
                autoTrigger: boolean;
                createdAt: Date;
            })[];
        } & {
            id: string;
            projectId: string;
            format: import(".prisma/client").$Enums.SceneFormat;
            data: import(".prisma/client").Prisma.JsonValue | null;
            order: number;
            createdAt: Date;
        };
    }>;
    addObject(sceneId: string, dto: CreateSceneObjectDto): Promise<{
        success: boolean;
        object: {
            asset: {
                id: string;
                projectId: string | null;
                type: import(".prisma/client").$Enums.AssetType;
                modelUrl: string;
                storageKey: string | null;
                textureUrl: string | null;
                label: string | null;
                ecosystem: string | null;
                role: string | null;
                source: string | null;
                license: string | null;
                needsReview: boolean;
                createdAt: Date;
            } | null;
        } & {
            id: string;
            sceneId: string;
            assetId: string | null;
            type: import(".prisma/client").$Enums.SceneObjectType;
            textContent: string | null;
            color: string | null;
            positionX: number;
            positionY: number;
            positionZ: number;
            rotationX: number;
            rotationY: number;
            rotationZ: number;
            scaleX: number;
            scaleY: number;
            scaleZ: number;
            createdAt: Date;
        };
    }>;
    updateObject(objectId: string, dto: UpdateSceneObjectDto): Promise<{
        success: boolean;
        object: {
            id: string;
            sceneId: string;
            assetId: string | null;
            type: import(".prisma/client").$Enums.SceneObjectType;
            textContent: string | null;
            color: string | null;
            positionX: number;
            positionY: number;
            positionZ: number;
            rotationX: number;
            rotationY: number;
            rotationZ: number;
            scaleX: number;
            scaleY: number;
            scaleZ: number;
            createdAt: Date;
        };
    }>;
    deleteObject(objectId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addInteractivity(sceneId: string, dto: CreateInteractivityDto): Promise<{
        success: boolean;
        interactivity: {
            id: string;
            sceneId: string;
            name: string | null;
            triggerObjectId: string;
            targetObjectId: string;
            actionType: import(".prisma/client").$Enums.InteractivityActionType;
            params: import(".prisma/client").Prisma.JsonValue;
            startTime: number;
            duration: number;
            easing: string | null;
            autoTrigger: boolean;
            createdAt: Date;
        };
    }>;
    deleteInteractivity(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    publishScene(sceneId: string, dto: PublishUnitySceneDto, hostHeader: string, protocol?: string): Promise<{
        success: boolean;
        publishedId: string;
        sceneId: string;
        directUrl: string;
        qrCodeDataUrl: string;
        allow3DView: boolean;
        allowMarkerAR: boolean;
        allowMarkerlessAR: boolean;
    }>;
}
