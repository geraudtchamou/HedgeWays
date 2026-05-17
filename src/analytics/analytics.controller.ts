/**
 * Analytics Controller - REST API endpoints for analytics module
 */

import { Request, Response } from 'express';
import {
  MetricCategory,
  TimeHorizon,
  MetricDefinition,
  KPIDefinition,
  MetricValue,
  KPIValue,
  TrendAnalysis,
  BenchmarkComparison,
  RiskMetrics,
  LiquidityMetrics,
  OperationalMetrics,
  ClientMetrics,
  ESGMetrics,
  RevenueMetrics,
  AnalyticsDashboard,
  DashboardWidget
} from './analytics.types';
import { analyticsService } from './analytics.service';
import { PREDEFINED_METRICS, PREDEFINED_KPIS, getMetricsByCategory, getKPIsByCategory } from './kpi-definitions';

export class AnalyticsController {
  
  /**
   * GET /api/analytics/metrics
   * Retrieve all metric definitions
   */
  getAllMetrics = (req: Request, res: Response): void => {
    try {
      const metrics = analyticsService.getAllMetricDefinitions();
      res.json({
        success: true,
        data: metrics,
        count: metrics.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/metrics/:id
   * Retrieve a specific metric definition
   */
  getMetricById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const metric = analyticsService.getMetricDefinition(id);
      
      if (!metric) {
        res.status(404).json({
          success: false,
          error: 'Metric not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: metric
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metric',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/metrics/category/:category
   * Retrieve metrics by category
   */
  getMetricsByCategory = (req: Request, res: Response): void => {
    try {
      const { category } = req.params;
      const metrics = getMetricsByCategory(category as MetricCategory);
      
      res.json({
        success: true,
        data: metrics,
        count: metrics.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics by category',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/analytics/metrics/:id/values
   * Record a new metric value
   */
  recordMetricValue = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { value, productId, fundId, countryId, assetClass, period, source, isEstimated } = req.body;
      
      if (typeof value !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Value must be a number'
        });
        return;
      }
      
      const metricValue = analyticsService.recordMetricValue(id, value, {
        productId,
        fundId,
        countryId,
        assetClass,
        period: period as TimeHorizon,
        source,
        isEstimated
      });
      
      res.status(201).json({
        success: true,
        data: metricValue,
        message: 'Metric value recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to record metric value',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/metrics/:id/values
   * Retrieve metric values with optional filters
   */
  getMetricValues = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { productId, fundId, startDate, endDate } = req.query;
      
      const options: {
        productId?: string;
        fundId?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};
      
      if (productId) options.productId = productId as string;
      if (fundId) options.fundId = fundId as string;
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);
      
      const values = analyticsService.getMetricValues(id, options);
      
      res.json({
        success: true,
        data: values,
        count: values.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metric values',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/kpis
   * Retrieve all KPI definitions
   */
  getAllKPIs = (req: Request, res: Response): void => {
    try {
      const kpis = analyticsService.getAllKPIDefinitions();
      res.json({
        success: true,
        data: kpis,
        count: kpis.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KPIs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/kpis/:id
   * Retrieve a specific KPI definition
   */
  getKPIById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const kpi = analyticsService.getKPIDefinition(id);
      
      if (!kpi) {
        res.status(404).json({
          success: false,
          error: 'KPI not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: kpi
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KPI',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/kpis/category/:category
   * Retrieve KPIs by category
   */
  getKPIsByCategory = (req: Request, res: Response): void => {
    try {
      const { category } = req.params;
      const kpis = getKPIsByCategory(category as MetricCategory);
      
      res.json({
        success: true,
        data: kpis,
        count: kpis.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KPIs by category',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/analytics/kpis/:id/calculate
   * Calculate KPI value
   */
  calculateKPIValue = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { productId, fundId, organizationId, period, commentary, actionItems } = req.body;
      
      const kpiValue = analyticsService.calculateKPIValue(id, {
        productId,
        fundId,
        organizationId,
        period: period as TimeHorizon,
        commentary,
        actionItems
      });
      
      res.json({
        success: true,
        data: kpiValue,
        message: 'KPI value calculated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate KPI value',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/kpis/:id/values
   * Retrieve KPI values with optional filters
   */
  getKPIValues = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { productId, fundId, startDate, endDate } = req.query;
      
      const options: {
        productId?: string;
        fundId?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};
      
      if (productId) options.productId = productId as string;
      if (fundId) options.fundId = fundId as string;
      if (startDate) options.startDate = new Date(startDate as string);
      if (endDate) options.endDate = new Date(endDate as string);
      
      const values = analyticsService.getKPIValues(id, options);
      
      res.json({
        success: true,
        data: values,
        count: values.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve KPI values',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/trends/:metricId
   * Analyze trend for a metric
   */
  analyzeTrend = (req: Request, res: Response): void => {
    try {
      const { metricId } = req.params;
      const { periods, productId, fundId } = req.query;
      
      const options: {
        periods?: TimeHorizon[];
        productId?: string;
        fundId?: string;
      } = {};
      
      if (periods) {
        options.periods = (periods as string).split(',') as TimeHorizon[];
      }
      if (productId) options.productId = productId as string;
      if (fundId) options.fundId = fundId as string;
      
      const trend = analyticsService.analyzeTrend(metricId, options);
      
      if (!trend) {
        res.status(400).json({
          success: false,
          error: 'Insufficient data for trend analysis'
        });
        return;
      }
      
      res.json({
        success: true,
        data: trend
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to analyze trend',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/benchmarks/compare
   * Compare product performance against benchmark
   */
  compareWithBenchmark = (req: Request, res: Response): void => {
    try {
      const { metricId, productId, benchmarkId, benchmarkName, period } = req.query;
      
      if (!metricId || !productId || !benchmarkId || !benchmarkName || !period) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: metricId, productId, benchmarkId, benchmarkName, period'
        });
        return;
      }
      
      const comparison = analyticsService.compareWithBenchmark(
        metricId as string,
        productId as string,
        benchmarkId as string,
        benchmarkName as string,
        period as TimeHorizon
      );
      
      if (!comparison) {
        res.status(400).json({
          success: false,
          error: 'Insufficient data for benchmark comparison'
        });
        return;
      }
      
      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to compare with benchmark',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/risk/:productId
   * Calculate risk metrics for a product
   */
  getRiskMetrics = (req: Request, res: Response): void => {
    try {
      const { productId } = req.params;
      const { confidenceLevel, timeHorizon } = req.query;
      
      const options: {
        confidenceLevel?: number;
        timeHorizon?: number;
      } = {};
      
      if (confidenceLevel) options.confidenceLevel = parseFloat(confidenceLevel as string);
      if (timeHorizon) options.timeHorizon = parseInt(timeHorizon as string);
      
      const riskMetrics = analyticsService.calculateRiskMetrics(productId, options);
      
      if (!riskMetrics) {
        res.status(400).json({
          success: false,
          error: 'Insufficient data for risk metrics calculation'
        });
        return;
      }
      
      res.json({
        success: true,
        data: riskMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate risk metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/liquidity/:fundId
   * Calculate liquidity metrics for a fund
   */
  getLiquidityMetrics = (req: Request, res: Response): void => {
    try {
      const { fundId } = req.params;
      
      const liquidityMetrics = analyticsService.calculateLiquidityMetrics(fundId);
      
      if (!liquidityMetrics) {
        res.status(400).json({
          success: false,
          error: 'Unable to calculate liquidity metrics'
        });
        return;
      }
      
      res.json({
        success: true,
        data: liquidityMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate liquidity metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/operational
   * Get operational metrics
   */
  getOperationalMetrics = (req: Request, res: Response): void => {
    try {
      const operationalMetrics = analyticsService.calculateOperationalMetrics();
      
      res.json({
        success: true,
        data: operationalMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate operational metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/clients
   * Get client metrics
   */
  getClientMetrics = (req: Request, res: Response): void => {
    try {
      const clientMetrics = analyticsService.calculateClientMetrics();
      
      res.json({
        success: true,
        data: clientMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate client metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/esg
   * Get ESG metrics
   */
  getESGMetrics = (req: Request, res: Response): void => {
    try {
      const { portfolioId } = req.query;
      
      const esgMetrics = analyticsService.calculateESGMetrics(portfolioId as string);
      
      res.json({
        success: true,
        data: esgMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate ESG metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/revenue
   * Get revenue metrics
   */
  getRevenueMetrics = (req: Request, res: Response): void => {
    try {
      const { period } = req.query;
      
      const revenueMetrics = analyticsService.calculateRevenueMetrics(period as TimeHorizon);
      
      res.json({
        success: true,
        data: revenueMetrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to calculate revenue metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/dashboard
   * Get comprehensive dashboard data
   */
  getDashboard = (req: Request, res: Response): void => {
    try {
      const { includeKPIs, includeMetrics, includeRisk, includeRevenue } = req.query;
      
      const dashboard: any = {
        timestamp: new Date(),
        summaries: {}
      };
      
      if (includeKPIs !== 'false') {
        const kpis = analyticsService.getAllKPIDefinitions();
        dashboard.kpis = kpis.map(kpi => {
          const values = analyticsService.getKPIValues(kpi.id);
          const latestValue = values.length > 0 ? values[values.length - 1] : null;
          return {
            ...kpi,
            currentValue: latestValue?.value,
            status: latestValue?.status || 'UNKNOWN'
          };
        });
      }
      
      if (includeRisk !== 'false') {
        dashboard.operationalSummary = analyticsService.calculateOperationalMetrics();
      }
      
      if (includeRevenue !== 'false') {
        dashboard.revenueSummary = analyticsService.calculateRevenueMetrics();
      }
      
      if (includeMetrics !== 'false') {
        dashboard.clientSummary = analyticsService.calculateClientMetrics();
        dashboard.esgSummary = analyticsService.calculateESGMetrics();
      }
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate dashboard',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/analytics/export
   * Export analytics data
   */
  exportData = (req: Request, res: Response): void => {
    try {
      const { type, format, startDate, endDate } = req.query;
      
      // In production, this would generate CSV, Excel, or PDF exports
      const exportData = {
        type: type || 'all',
        format: format || 'json',
        generatedAt: new Date(),
        dateRange: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date()
        },
        data: {
          metrics: analyticsService.getAllMetricDefinitions(),
          kpis: analyticsService.getAllKPIDefinitions()
        }
      };
      
      res.json({
        success: true,
        data: exportData,
        message: `Export generated in ${format} format`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export const analyticsController = new AnalyticsController();
