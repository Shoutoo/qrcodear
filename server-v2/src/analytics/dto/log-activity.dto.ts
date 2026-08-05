export class LogActivityDto {
  action!: string; // "SCAN_QR", "VIEW_AR", "BAKE_GLB", "SUBMIT_QUIZ", "PUBLISH_SCENE"
  entityType?: string; // "Asset", "Scene", "EcosystemPreset", "Quiz"
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}
