import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ViewsService } from './views.service';
import { Request, Response } from 'express';

@Controller()
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get()
  async getHomepage(@Res() res: any) {
    const html = await this.viewsService.renderHomepage();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('studio')
  async getStudioApp(@Res() res: any) {
    const html = await this.viewsService.renderStudioApp();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('ar/:id')
  async getArViewer(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    const html = await this.viewsService.renderArViewer(id, hostHeader, protocol);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('studio/view/:id')
  async getStudioViewer(@Param('id') id: string, @Res() res: any) {
    const html = await this.viewsService.renderStudioViewer(id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('print/:id')
  async getPrintCard(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const hostHeader = req.get('host') || 'localhost:3002';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    const html = await this.viewsService.renderPrintCard(id, hostHeader, protocol);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('ecosystem/view/:id')
  async getEcosystemViewer(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const hostHeader = req.get('host') || 'localhost:3001';
    const protocol = req.headers['x-forwarded-proto']?.toString() || req.protocol || 'http';
    const html = await this.viewsService.renderEcosystemViewer(id, hostHeader, protocol);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
