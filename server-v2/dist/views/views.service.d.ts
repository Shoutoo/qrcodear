import { PrismaService } from '../prisma/prisma.service';
export declare class ViewsService {
    private prisma;
    constructor(prisma: PrismaService);
    private escapeHtml;
    private formatDateId;
    renderHomepage(): Promise<string>;
    renderStudioApp(): Promise<string>;
    renderArViewer(id: string, hostHeader: string, protocol?: string): Promise<string>;
    renderStudioViewer(id: string): Promise<string>;
    renderPrintCard(id: string, hostHeader?: string, protocol?: string): Promise<string>;
    renderEcosystemViewer(id: string, hostHeader: string, protocol?: string): Promise<string>;
    ensureEcosystemGlbExists(id: string): Promise<string>;
}
