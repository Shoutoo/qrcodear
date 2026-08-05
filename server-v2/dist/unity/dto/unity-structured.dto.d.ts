import { SceneObjectType, InteractivityActionType } from '@prisma/client';
export declare class CreateStructuredSceneDto {
    projectId?: string;
    order?: number;
}
export declare class CreateSceneObjectDto {
    assetId?: string;
    type: SceneObjectType;
    textContent?: string;
    color?: string;
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
}
export declare class UpdateSceneObjectDto {
    textContent?: string;
    color?: string;
    positionX?: number;
    positionY?: number;
    positionZ?: number;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    scaleX?: number;
    scaleY?: number;
    scaleZ?: number;
}
export declare class CreateInteractivityDto {
    name?: string;
    triggerObjectId: string;
    targetObjectId: string;
    actionType: InteractivityActionType;
    params: any;
    startTime?: number;
    duration?: number;
    easing?: string;
    autoTrigger?: boolean;
}
export declare class PublishUnitySceneDto {
    allow3DView?: boolean;
    allowMarkerAR?: boolean;
    allowMarkerlessAR?: boolean;
    customMarkerUrl?: string;
}
