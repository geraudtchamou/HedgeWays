/**
 * Dashboard Service
 * Handles data aggregation, transformation, and delivery for dashboard widgets.
 */

import { Injectable } from '@nestjs/common';
import {
  DashboardLayout,
  DashboardResponse,
  DashboardDataPoint,
  FilterCriteria,
  UserRole,
} from './dashboard.types';
import { getDashboardByRole } from './dashboard.layouts';

interface MetricData {
  timestamp: Date;
  value: number;
  label?: string;
  [key: string]: any;
}

@Injectable()
export class DashboardService {
  /**
   * Get complete dashboard data for a user role
   */
  async getDashboard(
    role: UserRole,
    userId: string,
    filters?: FilterCriteria,
  ): Promise<DashboardResponse> {
    const layout = getDashboardByRole(role);
    const data: Record<string, DashboardDataPoint[]> = {};
    const summaryMetrics: Record<string, number> = {};

    // Fetch data for each widget in parallel
    const widgetPromises = layout.widgets.map(async (widget) => {
      const widgetData = await this.fetchWidgetData(widget.dataSource, userId, filters);
      data[widget.id] = widgetData;
    });

    await Promise.all(widgetPromises);

    // Calculate summary metrics based on role
    summaryMetrics.totalValue = await this.calculateTotalValue(userId, filters);
    summaryMetrics.totalReturn = await this.calculateTotalReturn(userId, filters);
    summaryMetrics.riskScore = await this.calculateRiskScore(userId, filters);

    if (role === 'FUND_MANAGER' || role === 'ADMIN') {
      summaryMetrics.totalAUM = await this.calculateTotalAUM(filters);
      summaryMetrics.totalRevenue = await this.calculateTotalRevenue(filters);
    }

    return {
      layout,
      data,
      summaryMetrics,
      generatedAt: new Date(),
    };
  }

  /**
   * Fetch data for a specific widget based on its data source
   */
  private async fetchWidgetData(
    dataSource: string,
    userId: string,
    filters?: FilterCriteria,
  ): Promise<DashboardDataPoint[]> {
    // Simulate data fetching - in production, this would call actual services/APIs
    const now = new Date();
    const dataPoints: DashboardDataPoint[] = [];

    // Generate sample data based on data source pattern
    if (dataSource.includes('portfolio/value') || dataSource.includes('aum')) {
      // Time series data for portfolio value or AUM
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const baseValue = dataSource.includes('aum') ? 10000000 : 500000;
        const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
        const trend = 1 + (30 - i) * 0.005; // Slight upward trend
        dataPoints.push({
          timestamp: date,
          value: baseValue * randomFactor * trend,
          label: date.toISOString().split('T')[0],
        });
      }
    } else if (dataSource.includes('allocation') || dataSource.includes('distribution')) {
      // Categorical data for allocation
      const categories = ['commodities', 'stocks', 'bonds', 'real_estate', 'manufacturing', 'mining', 'crypto'];
      const total = 100;
      let remaining = total;
      
      categories.forEach((category, index) => {
        const value = index === categories.length - 1 ? remaining : Math.random() * remaining * 0.5;
        remaining -= value;
        dataPoints.push({
          timestamp: now,
          value: parseFloat(value.toFixed(2)),
          label: category,
          metadata: { category },
        });
      });
    } else if (dataSource.includes('returns') || dataSource.includes('performance')) {
      // Returns data by asset class
      const assetClasses = ['commodities', 'stocks', 'bonds', 'real_estate', 'manufacturing', 'mining', 'crypto'];
      assetClasses.forEach((asset) => {
        dataPoints.push({
          timestamp: now,
          value: (Math.random() - 0.3) * 30, // -30% to +70% range
          label: asset,
          metadata: { assetClass: asset },
        });
      });
    } else if (dataSource.includes('flows')) {
      // Fund flows data
      for (let i = 14; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dataPoints.push({
          timestamp: date,
          value: (Math.random() - 0.4) * 2000000, // Net inflows bias
          label: date.toISOString().split('T')[0],
          metadata: {
            inflows: Math.random() * 1500000,
            outflows: Math.random() * 1000000,
          },
        });
      }
    } else if (dataSource.includes('revenue') || dataSource.includes('fees')) {
      // Revenue/fee data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        dataPoints.push({
          timestamp: date,
          value: 50000 + Math.random() * 100000,
          label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          metadata: {
            managementFees: 30000 + Math.random() * 50000,
            performanceFees: 10000 + Math.random() * 30000,
            transactionFees: 5000 + Math.random() * 15000,
          },
        });
      }
    } else if (dataSource.includes('health') || dataSource.includes('risk')) {
      // Gauge/metric data
      dataPoints.push({
        timestamp: now,
        value: 75 + Math.random() * 20, // 75-95 range
        label: 'Current',
      });
    } else if (dataSource.includes('users') || dataSource.includes('api')) {
      // User/API metrics
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(date.getHours() - i);
        dataPoints.push({
          timestamp: date,
          value: 100 + Math.random() * 400 + (i > 8 && i < 18 ? 200 : 0), // Peak during business hours
          label: date.getHours().toString().padStart(2, '0') + ':00',
          metadata: {
            requests: 100 + Math.random() * 400,
            errors: Math.floor(Math.random() * 10),
          },
        });
      }
    } else if (dataSource.includes('transactions') || dataSource.includes('alerts') || dataSource.includes('logs')) {
      // Table data - recent items
      for (let i = 9; i >= 0; i--) {
        const date = new Date(now);
        date.setMinutes(date.getMinutes() - i * 15);
        dataPoints.push({
          timestamp: date,
          value: 0,
          label: date.toLocaleTimeString(),
          metadata: {
            id: `TXN-${1000 + i}`,
            type: i % 3 === 0 ? 'BUY' : i % 3 === 1 ? 'SELL' : 'DIVIDEND',
            amount: Math.random() * 50000,
            status: i % 5 === 0 ? 'PENDING' : 'COMPLETED',
          },
        });
      }
    } else if (dataSource.includes('correlation') || dataSource.includes('regional')) {
      // Heatmap data
      const labels = ['commodities', 'stocks', 'bonds', 'real_estate', 'manufacturing', 'mining', 'crypto'];
      labels.forEach((x) => {
        labels.forEach((y) => {
          dataPoints.push({
            timestamp: now,
            value: x === y ? 1 : (Math.random() - 0.5) * 2, // Correlation -1 to 1
            label: `${x}-${y}`,
            metadata: { x, y },
          });
        });
      });
    } else if (dataSource.includes('esg')) {
      // ESG scatter plot data
      const investments = ['Fund A', 'Fund B', 'Fund C', 'Fund D', 'Fund E'];
      investments.forEach((inv) => {
        dataPoints.push({
          timestamp: now,
          value: 0,
          label: inv,
          metadata: {
            environmentalScore: 60 + Math.random() * 40,
            socialScore: 50 + Math.random() * 50,
            governanceScore: 55 + Math.random() * 45,
          },
        });
      });
    } else if (dataSource.includes('sector')) {
      // Sector performance
      const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'Materials', 'Utilities'];
      sectors.forEach((sector) => {
        dataPoints.push({
          timestamp: now,
          value: (Math.random() - 0.4) * 40,
          label: sector,
          metadata: {
            sector,
            return: (Math.random() - 0.4) * 40,
            volume: Math.random() * 1000000,
          },
        });
      });
    } else {
      // Default: generate simple time series
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dataPoints.push({
          timestamp: date,
          value: Math.random() * 100,
          label: date.toISOString().split('T')[0],
        });
      }
    }

    return dataPoints;
  }

  /**
   * Calculate total portfolio/fund value
   */
  private async calculateTotalValue(userId: string, filters?: FilterCriteria): Promise<number> {
    // In production, query database for actual value
    return 500000 + Math.random() * 200000;
  }

  /**
   * Calculate total return percentage
   */
  private async calculateTotalReturn(userId: string, filters?: FilterCriteria): Promise<number> {
    return (Math.random() - 0.3) * 30; // -30% to +70%
  }

  /**
   * Calculate risk score (1-10 scale)
   */
  private async calculateRiskScore(userId: string, filters?: FilterCriteria): Promise<number> {
    return 4 + Math.random() * 4; // 4-8 range
  }

  /**
   * Calculate total AUM (for fund managers and admins)
   */
  private async calculateTotalAUM(filters?: FilterCriteria): Promise<number> {
    return 10000000 + Math.random() * 5000000; // $10M-$15M
  }

  /**
   * Calculate total revenue (for fund managers and admins)
   */
  private async calculateTotalRevenue(filters?: FilterCriteria): Promise<number> {
    return 500000 + Math.random() * 300000; // $500K-$800K
  }

  /**
   * Get specific widget data
   */
  async getWidgetData(
    widgetId: string,
    userId: string,
    role: UserRole,
    filters?: FilterCriteria,
  ): Promise<DashboardDataPoint[]> {
    const layout = getDashboardByRole(role);
    const widget = layout.widgets.find((w) => w.id === widgetId);
    
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found for role ${role}`);
    }

    return this.fetchWidgetData(widget.dataSource, userId, filters);
  }

  /**
   * Export dashboard data for reporting
   */
  async exportDashboard(
    role: UserRole,
    userId: string,
    format: 'JSON' | 'CSV' | 'PDF',
    filters?: FilterCriteria,
  ): Promise<Buffer> {
    const dashboard = await this.getDashboard(role, userId, filters);
    
    // In production, implement actual export logic
    const jsonString = JSON.stringify(dashboard, null, 2);
    return Buffer.from(jsonString);
  }
}
