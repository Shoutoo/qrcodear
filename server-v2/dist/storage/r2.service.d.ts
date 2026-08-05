import { ConfigService } from '@nestjs/config';
export declare class R2Service {
    private configService;
    private readonly logger;
    private s3Client?;
    private bucketName;
    private publicUrlBase;
    private isConfigured;
    constructor(configService: ConfigService);
    checkConnection(): Promise<boolean>;
    uploadWithFallback(key: string, buffer: Buffer, contentType: string): Promise<{
        key: string;
        url: string;
        mode: 'R2' | 'LOCAL';
    }>;
    deleteWithFallback(key: string): Promise<boolean>;
}
