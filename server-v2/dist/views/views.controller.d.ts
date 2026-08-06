import { ViewsService } from './views.service';
export declare class ViewsController {
    private readonly viewsService;
    constructor(viewsService: ViewsService);
    getHomepage(res: any): Promise<void>;
    getStudioApp(res: any): Promise<void>;
    getArViewer(id: string, req: any, res: any): Promise<void>;
    getStudioViewer(id: string, res: any): Promise<void>;
    getPrintCard(id: string, req: any, res: any): Promise<void>;
    getPrintPresetCard(id: string, req: any, res: any): Promise<void>;
    getEcosystemViewer(id: string, req: any, res: any): Promise<void>;
    getLoginPage(res: any): Promise<void>;
    getRegisterPage(res: any): Promise<void>;
}
