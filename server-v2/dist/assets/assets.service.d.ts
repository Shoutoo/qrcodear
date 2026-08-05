import { PrismaService } from '../prisma/prisma.service';
import { AssetType } from '@prisma/client';
export declare class AssetsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(type?: AssetType): Promise<{
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
    }[]>;
    getAssetQr(id: string, hostHeader: string, protocol?: string): Promise<{
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
