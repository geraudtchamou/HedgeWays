/**
 * Dashboard Controller
 * REST API endpoints for dashboard data retrieval and management.
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Res,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import {
  DashboardResponse,
  FilterCriteria,
  UserRole,
  DashboardDataPoint,
} from './dashboard.types';

interface AuthRequest {
  user: {
    id: string;
    role: UserRole;
    email: string;
  };
}

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get complete dashboard for the authenticated user
   * GET /api/dashboard
   */
  @Get()
  async getDashboard(
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardResponse> {
    const userId = req.user.id;
    const role = req.user.role;

    return this.dashboardService.getDashboard(role, userId, filters);
  }

  /**
   * Get dashboard for a specific role (admin only)
   * GET /api/dashboard/role/:role
   */
  @Get('role/:role')
  async getDashboardByRole(
    @Param('role') role: string,
    @Query() filters?: FilterCriteria,
    @Request() req?: AuthRequest,
  ): Promise<DashboardResponse> {
    // In production, add admin guard check
    const userId = req?.user?.id || 'admin-user';
    
    return this.dashboardService.getDashboard(
      role.toUpperCase() as UserRole,
      userId,
      filters,
    );
  }

  /**
   * Get specific widget data
   * GET /api/dashboard/widget/:widgetId
   */
  @Get('widget/:widgetId')
  async getWidgetData(
    @Param('widgetId') widgetId: string,
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardDataPoint[]> {
    const userId = req.user.id;
    const role = req.user.role;

    return this.dashboardService.getWidgetData(widgetId, userId, role, filters);
  }

  /**
   * Get summary metrics only (lightweight endpoint)
   * GET /api/dashboard/summary
   */
  @Get('summary')
  async getSummaryMetrics(
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<{
    summaryMetrics: Record<string, number>;
    generatedAt: Date;
  }> {
    const userId = req.user.id;
    const role = req.user.role;

    const dashboard = await this.dashboardService.getDashboard(
      role,
      userId,
      filters,
    );

    return {
      summaryMetrics: dashboard.summaryMetrics,
      generatedAt: dashboard.generatedAt,
    };
  }

  /**
   * Export dashboard data
   * POST /api/dashboard/export
   */
  @Post('export')
  async exportDashboard(
    @Request() req: AuthRequest,
    @Body('format') format: 'JSON' | 'CSV' | 'PDF' = 'JSON',
    @Body('filters') filters?: FilterCriteria,
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user.id;
    const role = req.user.role;

    const data = await this.dashboardService.exportDashboard(
      role,
      userId,
      format,
      filters,
    );

    const contentType =
      format === 'JSON'
        ? 'application/json'
        : format === 'CSV'
          ? 'text/csv'
          : 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="dashboard-${role.toLowerCase()}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}"`,
    );

    res.send(data);
  }

  /**
   * Get investor-specific dashboard
   * GET /api/dashboard/investor
   */
  @Get('investor')
  async getInvestorDashboard(
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard('INVESTOR', req.user.id, filters);
  }

  /**
   * Get analyst-specific dashboard
   * GET /api/dashboard/analyst
   */
  @Get('analyst')
  async getAnalystDashboard(
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard('ANALYST', req.user.id, filters);
  }

  /**
   * Get fund manager-specific dashboard
   * GET /api/dashboard/fund-manager
   */
  @Get('fund-manager')
  async getFundManagerDashboard(
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(
      'FUND_MANAGER',
      req.user.id,
      filters,
    );
  }

  /**
   * Get admin-specific dashboard
   * GET /api/dashboard/admin
   */
  @Get('admin')
  async getAdminDashboard(
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard('ADMIN', req.user.id, filters);
  }

  /**
   * Get dashboard layout configuration (without data)
   * GET /api/dashboard/layout/:role
   */
  @Get('layout/:role')
  async getDashboardLayout(@Param('role') role: string): Promise<{
    role: UserRole;
    name: string;
    description: string;
    widgets: Array<{
      id: string;
      title: string;
      chartType: string;
      dataSource: string;
      position: { x: number; y: number; w: number; h: number };
    }>;
  }> {
    const { getDashboardByRole } = await import('./dashboard.layouts');
    const layout = getDashboardByRole(role);

    return {
      role: layout.role,
      name: layout.name,
      description: layout.description,
      widgets: layout.widgets.map((w) => ({
        id: w.id,
        title: w.title,
        chartType: w.chartType,
        dataSource: w.dataSource,
        position: w.position,
      })),
    };
  }

  /**
   * Refresh specific widget data (with cache bypass)
   * POST /api/dashboard/widget/:widgetId/refresh
   */
  @Post('widget/:widgetId/refresh')
  async refreshWidgetData(
    @Param('widgetId') widgetId: string,
    @Request() req: AuthRequest,
    @Query() filters?: FilterCriteria,
  ): Promise<DashboardDataPoint[]> {
    const userId = req.user.id;
    const role = req.user.role;

    // Force fresh data fetch
    return this.dashboardService.getWidgetData(widgetId, userId, role, filters);
  }

  /**
   * Get available filter options for dashboard
   * GET /api/dashboard/filters
   */
  @Get('filters')
  async getFilterOptions(): Promise<{
    assetClasses: string[];
    regions: string[];
    currencies: string[];
    riskLevels: string[];
    dateRanges: Array<{ label: string; value: string }>;
  }> {
    return {
      assetClasses: [
        'commodities',
        'stocks',
        'bonds',
        'real_estate',
        'manufacturing',
        'mining',
        'crypto',
      ],
      regions: [
        'North America',
        'Latin America',
        'Europe',
        'Asia Pacific',
        'Middle East',
        'Africa',
      ],
      currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'BRL', 'INR'],
      riskLevels: ['LOW', 'MEDIUM', 'HIGH'],
      dateRanges: [
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last 90 Days', value: '90d' },
        { label: 'Year to Date', value: 'ytd' },
        { label: 'Last 1 Year', value: '1y' },
        { label: 'Last 3 Years', value: '3y' },
        { label: 'Last 5 Years', value: '5y' },
      ],
    };
  }
}
