import { PrismaService } from '../prisma/prisma.service';
export declare class EcosystemService {
    private prisma;
    constructor(prisma: PrismaService);
    getLibrary(): Promise<{
        success: boolean;
        library: {
            ecosystem: string;
            name: string;
            items: {
                id: string;
                name: string | null;
                role: string | null;
                icon: string;
                modelSrc: string;
                thumbnail: string;
                source: string | null;
                license: string | null;
            }[];
        }[];
    }>;
    private getIconForRole;
    getPresets(): Promise<{
        success: boolean;
        presets: {
            id: string;
            name: string;
            slots: import(".prisma/client").Prisma.JsonValue;
        }[];
    }>;
    getPresetById(id: string): Promise<{
        success: boolean;
        preset: {
            id: string;
            name: string;
            slots: import(".prisma/client").Prisma.JsonValue;
        };
    }>;
    updateSlot(id: string, slotIndex: number, label?: string, modelSrc?: string): Promise<{
        success: boolean;
        preset: {
            id: string;
            name: string;
            slots: import(".prisma/client").Prisma.JsonValue;
            createdAt: Date;
        };
        updatedSlot: any;
    }>;
    publishEcosystem(presetId?: string, presetName?: string, hostHeader?: string, protocol?: string): Promise<{
        success: boolean;
        id: string;
        item: {
            id: string;
            presetId: string | null;
            name: string;
            filename: string;
            glbUrl: string;
            size: number;
            directUrl: string;
            qrFilename: string;
            qrCodeDataUrl: string;
            publishedAt: string;
        };
        directUrl: string;
        qrCodeDataUrl: string;
    }>;
}
