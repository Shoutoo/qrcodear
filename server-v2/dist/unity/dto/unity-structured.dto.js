"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishUnitySceneDto = exports.CreateInteractivityDto = exports.UpdateSceneObjectDto = exports.CreateSceneObjectDto = exports.CreateStructuredSceneDto = void 0;
class CreateStructuredSceneDto {
    projectId;
    order;
}
exports.CreateStructuredSceneDto = CreateStructuredSceneDto;
class CreateSceneObjectDto {
    assetId;
    type;
    textContent;
    color;
    positionX;
    positionY;
    positionZ;
    rotationX;
    rotationY;
    rotationZ;
    scaleX;
    scaleY;
    scaleZ;
}
exports.CreateSceneObjectDto = CreateSceneObjectDto;
class UpdateSceneObjectDto {
    textContent;
    color;
    positionX;
    positionY;
    positionZ;
    rotationX;
    rotationY;
    rotationZ;
    scaleX;
    scaleY;
    scaleZ;
}
exports.UpdateSceneObjectDto = UpdateSceneObjectDto;
class CreateInteractivityDto {
    name;
    triggerObjectId;
    targetObjectId;
    actionType;
    params;
    startTime;
    duration;
    easing;
    autoTrigger;
}
exports.CreateInteractivityDto = CreateInteractivityDto;
class PublishUnitySceneDto {
    allow3DView;
    allowMarkerAR;
    allowMarkerlessAR;
    customMarkerUrl;
}
exports.PublishUnitySceneDto = PublishUnitySceneDto;
//# sourceMappingURL=unity-structured.dto.js.map