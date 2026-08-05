import { SceneObjectType, InteractivityActionType } from '@prisma/client';

export class CreateStructuredSceneDto {
  projectId?: string;
  order?: number;
}

export class CreateSceneObjectDto {
  assetId?: string;
  type!: SceneObjectType; // "MODEL_3D", "TEXT", "IMAGE", "VIDEO", "ANNOTATION_POINT", "ANNOTATION_LINE"
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

export class UpdateSceneObjectDto {
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

export class CreateInteractivityDto {
  name?: string;
  triggerObjectId!: string;
  targetObjectId!: string;
  actionType!: InteractivityActionType; // MOVE, ROTATE, SCALE, PLAY_ANIMATION, HIDE, SHOW, JUMP_SCENE, OPEN_URL, VIDEO_CONTROL, SOUND_EFFECT
  params!: any;
  startTime?: number;
  duration?: number;
  easing?: string;
  autoTrigger?: boolean;
}

export class PublishUnitySceneDto {
  allow3DView?: boolean;
  allowMarkerAR?: boolean;
  allowMarkerlessAR?: boolean;
  customMarkerUrl?: string;
}
