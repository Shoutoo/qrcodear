import { AssetsService } from './assets.service';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAllAssets(): Promise<{
        assets: {
            id: string;
            name: string;
            filename: string | undefined;
            modelSrc: string;
            thumbnail: string | null;
            source: string | null;
            license: string | null;
            ecosystem: string | null;
            role: string | null;
            createdAt: Date;
        }[];
    }>;
    getAssetQr(id: string, req: any): Promise<{
        qrDataUrl: string;
        viewerUrl: string;
        printUrl: string;
        asset: {
            id: string;
            name: string;
        };
    }>;
    saveAnnotations(id: string, annotations: any[]): Promise<{
        success: boolean;
        annotations: {
            name: string;
            description: string;
            dataPosition: string;
            dataNormal: string;
        }[];
    }>;
    deleteAsset(id: string): Promise<{
        success: boolean;
    }>;
}
