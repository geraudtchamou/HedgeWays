/**
 * Analytics Service - Core business logic for metrics and KPI calculation
 */

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
  RevenueMetrics
} from './analytics.types';

import { PREDEFINED_METRICS, PREDEFINED_KPIS, calculateKPIStatus } from './kpi-definitions';

interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

export class AnalyticsService {
  private metricDefinitions: Map<string, MetricDefinition>;
  private kpiDefinitions: Map<string, KPIDefinition>;
  private metricValues: Map<string, MetricValue[]>;
  private kpiValues: Map<string, KPIValue[]>;

  constructor() {
    this.metricDefinitions = new Map();
    this.kpiDefinitions = new Map();
    this.metricValues = new Map();
    this.kpiValues = new Map();
    
    this.initializePredefinedMetrics();
    this.initializePredefinedKPIs();
  }

  private initializePredefinedMetrics(): void {
    const now = new Date();
    PREDEFINED_METRICS.forEach(metric => {
      const fullMetric: MetricDefinition = {
        ...metric,
        createdAt: now,
        updatedAt: now
      };
      this.metricDefinitions.set(metric.id, fullMetric);
      this.metricValues.set(metric.id, []);
    });
  }

  private initializePredefinedKPIs(): void {
    const now = new Date();
    PREDEFINED_KPIS.forEach(kpi => {
      const fullKpi: KPIDefinition = {
        ...kpi,
        createdAt: now,
        updatedAt: now
      };
      this.kpiDefinitions.set(kpi.id, fullKpi);
      this.kpiValues.set(kpi.id, []);
    });
  }

  /**
   * Record a new metric value
   */
  recordMetricValue(
    metricId: string,
    value: number,
    options: {
      productId?: string;
      fundId?: string;
      countryId?: string;
      assetClass?: string;
      period?: TimeHorizon;
      source?: string;
      isEstimated?: boolean;
    } = {}
  ): MetricValue {
    const metric = this.getMetricDefinition(metricId);
    if (!metric) {
      throw new Error(`Metric ${metricId} not found`);
    }

    const existingValues = this.metricValues.get(metricId) || [];
    const previousValue = existingValues.length > 0 
      ? existingValues[existingValues.length - 1].value 
      : undefined;

    const change = previousValue !== undefined ? value - previousValue : 0;
    const changePercent = previousValue !== undefined && previousValue !== 0 
      ? (change / previousValue) * 100 
      : 0;

    const metricValue: MetricValue = {
      id: this.generateId('METRIC_VAL'),
      metricId,
      productId: options.productId,
      fundId: options.fundId,
      countryId: options.countryId,
      assetClass: options.assetClass,
      value,
      previousValue,
      change,
      changePercent,
      timestamp: new Date(),
      period: options.period || metric.frequency,
      dataQuality: 'HIGH',
      source: options.source || 'SYSTEM',
      isEstimated: options.isEstimated || false,
      createdAt: new Date()
    };

    existingValues.push(metricValue);
    this.metricValues.set(metricId, existingValues);

    // Trigger KPI recalculation if this metric is part of any KPI
    this.recalculateRelatedKPIs(metricId);

    return metricValue;
  }

  /**
   * Calculate KPI value based on underlying metrics
   */
  calculateKPIValue(
    kpiId: string,
    options: {
      productId?: string;
      fundId?: string;
      organizationId?: string;
      period?: TimeHorizon;
      commentary?: string;
      actionItems?: string[];
    } = {}
  ): KPIValue {
    const kpi = this.getKPIDefinition(kpiId);
    if (!kpi) {
      throw new Error(`KPI ${kpiId} not found`);
    }

    const contributingMetrics = kpi.metricIds.map(metricId => {
      const metric = this.getMetricDefinition(metricId);
      const values = this.getMetricValues(metricId, {
        productId: options.productId,
        fundId: options.fundId
      });
      
      const latestValue = values.length > 0 ? values[values.length - 1] : null;
      const currentValue = latestValue ? latestValue.value : 0;
      
      // Simple weighted contribution (can be enhanced with more sophisticated logic)
      const weight = 1 / kpi.metricIds.length;
      const normalizedValue = this.normalizeMetricValue(metricId, currentValue);
      const contribution = normalizedValue * weight;

      return {
        metricId,
        metricName: metric?.name || 'Unknown',
        value: currentValue,
        weight,
        contribution
      };
    });

    const totalValue = contributingMetrics.reduce((sum, m) => sum + m.contribution, 0) * 100;
    const variance = totalValue - kpi.targetValue;
    const variancePercent = kpi.targetValue !== 0 ? (variance / kpi.targetValue) * 100 : 0;
    const status = calculateKPIStatus(kpi.targetValue, totalValue);

    const kpiValue: KPIValue = {
      id: this.generateId('KPI_VAL'),
      kpiId,
      productId: options.productId,
      fundId: options.fundId,
      organizationId: options.organizationId,
      value: totalValue,
      targetValue: kpi.targetValue,
      variance,
      variancePercent,
      status,
      contributingMetrics,
      timestamp: new Date(),
      period: options.period || kpi.reviewFrequency,
      commentary: options.commentary,
      actionItems: options.actionItems,
      createdAt: new Date()
    };

    const existingKpiValues = this.kpiValues.get(kpiId) || [];
    existingKpiValues.push(kpiValue);
    this.kpiValues.set(kpiId, existingKpiValues);

    return kpiValue;
  }

  /**
   * Normalize metric value to 0-100 scale for KPI calculation
   */
  private normalizeMetricValue(metricId: string, value: number): number {
    const metric = this.getMetricDefinition(metricId);
    if (!metric) return 0;

    // Different normalization strategies based on metric type
    if (metric.thresholdCritical !== undefined && metric.thresholdWarning !== undefined) {
      if (value >= metric.thresholdWarning) {
        return Math.min(1, value / 100);
      } else if (value >= metric.thresholdCritical) {
        return 0.5 + (value - metric.thresholdCritical) / (metric.thresholdWarning - metric.thresholdCritical) * 0.5;
      } else {
        return Math.max(0, value / metric.thresholdCritical * 0.5);
      }
    }

    if (metric.targetValue !== undefined) {
      return Math.min(1, value / metric.targetValue);
    }

    return Math.min(1, value / 100);
  }

  /**
   * Recalculate KPIs that depend on a specific metric
   */
  private recalculateRelatedKPIs(metricId: string): void {
    this.kpiDefinitions.forEach((kpi, kpiId) => {
      if (kpi.metricIds.includes(metricId)) {
        this.calculateKPIValue(kpiId);
      }
    });
  }

  /**
   * Get trend analysis for a metric
   */
  analyzeTrend(
    metricId: string,
    options: {
      periods?: TimeHorizon[];
      productId?: string;
      fundId?: string;
    } = {}
  ): TrendAnalysis | null {
    const values = this.getMetricValues(metricId, {
      productId: options.productId,
      fundId: options.fundId
    });

    if (values.length < 2) {
      return null;
    }

    const periods = options.periods || [TimeHorizon.DAILY, TimeHorizon.WEEKLY, TimeHorizon.MONTHLY];
    const trendValues = periods.map(period => ({
      period,
      value: this.aggregateValues(values, period),
      timestamp: new Date()
    }));

    // Calculate trend direction
    const recentValues = values.slice(-10).map(v => v.value);
    const trend = this.determineTrend(recentValues);
    const volatility = this.calculateVolatility(recentValues);
    const momentum = this.calculateMomentum(recentValues);

    // Simple forecast using linear regression
    const forecast = this.generateForecast(recentValues);

    return {
      metricId,
      periods,
      values: trendValues,
      trend,
      volatility,
      momentum,
      forecast
    };
  }

  /**
   * Compare product performance against benchmark
   */
  compareWithBenchmark(
    metricId: string,
    productId: string,
    benchmarkId: string,
    benchmarkName: string,
    period: TimeHorizon
  ): BenchmarkComparison | null {
    const productValues = this.getMetricValues(metricId, { productId });
    const benchmarkValues = this.getMetricValues(metricId, { productId: benchmarkId });

    if (productValues.length === 0 || benchmarkValues.length === 0) {
      return null;
    }

    const productValue = productValues[productValues.length - 1].value;
    const benchmarkValue = benchmarkValues[benchmarkValues.length - 1].value;
    const outperformance = productValue - benchmarkValue;
    const outperformancePercent = benchmarkValue !== 0 
      ? (outperformance / benchmarkValue) * 100 
      : 0;

    // Calculate advanced statistics
    const productReturns = productValues.slice(-252).map(v => v.changePercent);
    const benchmarkReturns = benchmarkValues.slice(-252).map(v => v.changePercent);
    
    const trackingError = this.calculateTrackingError(productReturns, benchmarkReturns);
    const informationRatio = trackingError !== 0 ? (outperformance / trackingError) : 0;
    const correlation = this.calculateCorrelation(productReturns, benchmarkReturns);
    const beta = this.calculateBeta(productReturns, benchmarkReturns);
    const alpha = this.calculateAlpha(productReturns, benchmarkReturns, beta);

    return {
      metricId,
      productId,
      benchmarkId,
      benchmarkName,
      productValue,
      benchmarkValue,
      outperformance,
      outperformancePercent,
      trackingError,
      informationRatio,
      correlation,
      beta,
      alpha,
      period,
      timestamp: new Date()
    };
  }

  /**
   * Calculate comprehensive risk metrics
   */
  calculateRiskMetrics(
    productId: string,
    options: {
      confidenceLevel?: number;
      timeHorizon?: number;
    } = {}
  ): RiskMetrics | null {
    const returns = this.getProductReturns(productId, 252); // Last year of daily returns
    
    if (returns.length < 30) {
      return null;
    }

    const confidenceLevel = options.confidenceLevel || 0.95;
    const sortedReturns = [...returns].sort((a, b) => a - b);
    
    // Value at Risk calculations
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var99Index = Math.floor(sortedReturns.length * 0.01);
    const var95 = Math.abs(sortedReturns[var95Index] || 0);
    const var99 = Math.abs(sortedReturns[var99Index] || 0);
    
    // Conditional VaR (Expected Shortfall)
    const cvar95 = sortedReturns.slice(0, var95Index + 1)
      .reduce((sum, r) => sum + Math.abs(r), 0) / (var95Index + 1);
    const cvar99 = sortedReturns.slice(0, var99Index + 1)
      .reduce((sum, r) => sum + Math.abs(r), 0) / (var99Index + 1);

    // Volatility calculations
    const dailyVol = this.calculateStandardDeviation(returns);
    const weeklyVol = dailyVol * Math.sqrt(5);
    const monthlyVol = dailyVol * Math.sqrt(21);
    const annualizedVol = dailyVol * Math.sqrt(252);

    // Drawdown calculations
    const drawdown = this.calculateDrawdown(productId);

    // Risk-adjusted returns
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const riskFreeRate = 0.02 / 252; // Assuming 2% annual risk-free rate
    const excessReturn = avgReturn - riskFreeRate;
    const sharpeRatio = dailyVol !== 0 ? (excessReturn / dailyVol) * Math.sqrt(252) : 0;
    
    const downsideReturns = returns.filter(r => r < 0);
    const downsideDev = this.calculateStandardDeviation(downsideReturns);
    const sortinoRatio = downsideDev !== 0 ? (excessReturn / downsideDev) * Math.sqrt(252) : 0;
    
    const calmarRatio = drawdown.maxDrawdown !== 0 ? (avgReturn * 252 / Math.abs(drawdown.maxDrawdown)) : 0;

    return {
      valueAtRisk: {
        var95,
        var99,
        conditionalVar95: cvar95,
        conditionalVar99: cvar99
      },
      stressTestResults: this.runStressTests(productId),
      sensitivityAnalysis: this.calculateSensitivity(productId),
      drawdown,
      volatility: {
        daily: dailyVol * 100,
        weekly: weeklyVol * 100,
        monthly: monthlyVol * 100,
        annualized: annualizedVol * 100
      },
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      maxDrawdownDuration: drawdown.recoveryTime || 0
    };
  }

  /**
   * Calculate liquidity metrics
   */
  calculateLiquidityMetrics(fundId: string): LiquidityMetrics | null {
    // This would integrate with portfolio holdings and cash management systems
    // Placeholder implementation
    return {
      currentRatio: 1.5,
      quickRatio: 1.2,
      cashRatio: 0.8,
      operatingCashFlowRatio: 1.1,
      daysSalesOutstanding: 30,
      daysInventoryOutstanding: 45,
      daysPayableOutstanding: 60,
      cashConversionCycle: 15,
      liquidityCoverageRatio: 120,
      netStableFundingRatio: 110,
      redemptionFrequency: 'MONTHLY',
      noticePeriod: 30,
      gateProvisions: {
        isActive: false,
        threshold: 10,
        currentRedemptionRequests: 5
      }
    };
  }

  /**
   * Calculate operational metrics
   */
  calculateOperationalMetrics(): OperationalMetrics {
    // Aggregate operational data across the platform
    return {
      totalAssetsUnderManagement: this.calculateTotalAUM(),
      numberOfProducts: this.countActiveProducts(),
      numberOfClients: this.countActiveClients(),
      averageClientSize: this.calculateAverageClientSize(),
      clientConcentration: {
        top5Percent: 35,
        top10Percent: 50
      },
      employeeCount: 150,
      revenuePerEmployee: 500000,
      costIncomeRatio: 65,
      systemUptime: 99.9,
      tradeExecutionTime: {
        average: 150,
        p95: 300,
        p99: 500
      },
      errorRate: 0.1,
      complianceBreaches: 0,
      auditFindings: 2
    };
  }

  /**
   * Calculate client metrics
   */
  calculateClientMetrics(): ClientMetrics {
    return {
      totalClients: 1250,
      newClientsThisPeriod: 45,
      clientChurnRate: 3.5,
      netClientGrowth: 38,
      averageRelationshipLength: 4.2,
      clientSatisfactionScore: 8.5,
      netPromoterScore: 52,
      clientSegmentation: {
        retail: 60,
        highNetWorth: 25,
        institutional: 10,
        sovereign: 5
      },
      geographicDistribution: {
        'BR': 20,
        'IN': 25,
        'CN': 15,
        'ZA': 10,
        'MX': 8,
        'OTHER': 22
      },
      productPenetration: {
        'EQUITY': 45,
        'FIXED_INCOME': 35,
        'COMMODITIES': 20,
        'CRYPTO': 15,
        'REAL_ESTATE': 25
      }
    };
  }

  /**
   * Calculate ESG metrics
   */
  calculateESGMetrics(portfolioId?: string): ESGMetrics {
    return {
      overallScore: 78,
      environmentalScore: 75,
      socialScore: 80,
      governanceScore: 79,
      carbonFootprint: 245,
      waterUsage: 1250,
      wasteGeneration: 85,
      renewableEnergyPercentage: 42,
      diversityMetrics: {
        genderDiversity: 45,
        ethnicDiversity: 38,
        boardIndependence: 65
      },
      communityInvestment: 2500000,
      humanRightsCompliance: true,
      controversialWeaponsExposure: 0,
      tobaccoExposure: 2,
      fossilFuelExposure: 8,
      unGlobalCompactViolators: 0
    };
  }

  /**
   * Calculate revenue metrics
   */
  calculateRevenueMetrics(period: TimeHorizon = TimeHorizon.MONTHLY): RevenueMetrics {
    const totalRevenue = 15000000;
    const managementFees = 10000000;
    const performanceFees = 3000000;
    const transactionFees = 1200000;
    const advisoryFees = 500000;
    const otherRevenue = 300000;

    const priorPeriodRevenue = 13500000;
    const revenueGrowthRate = ((totalRevenue - priorPeriodRevenue) / priorPeriodRevenue) * 100;

    return {
      totalRevenue,
      managementFees,
      performanceFees,
      transactionFees,
      advisoryFees,
      otherRevenue,
      revenueGrowthRate,
      recurringRevenuePercentage: 86.7,
      revenueByAssetClass: {
        'EQUITY': 6000000,
        'FIXED_INCOME': 4000000,
        'COMMODITIES': 2000000,
        'CRYPTO': 1500000,
        'REAL_ESTATE': 1000000,
        'OTHER': 500000
      },
      revenueByGeography: {
        'BR': 3000000,
        'IN': 3500000,
        'CN': 2500000,
        'ZA': 1500000,
        'MX': 1200000,
        'OTHER': 3300000
      },
      revenueByClientSegment: {
        'RETAIL': 4500000,
        'HIGH_NET_WORTH': 5000000,
        'INSTITUTIONAL': 4000000,
        'SOVEREIGN': 1500000
      },
      costStructure: {
        fixedCosts: 5000000,
        variableCosts: 3500000,
        compensationCosts: 6000000,
        technologyCosts: 1500000,
        regulatoryCosts: 800000
      },
      profitabilityMetrics: {
        grossMargin: 73.3,
        operatingMargin: 43.3,
        netMargin: 32.5,
        returnOnEquity: 18.5,
        returnOnAssets: 2.8
      }
    };
  }

  // Helper methods
  getMetricDefinition(metricId: string): MetricDefinition | undefined {
    return this.metricDefinitions.get(metricId);
  }

  getKPIDefinition(kpiId: string): KPIDefinition | undefined {
    return this.kpiDefinitions.get(kpiId);
  }

  getAllMetricDefinitions(): MetricDefinition[] {
    return Array.from(this.metricDefinitions.values());
  }

  getAllKPIDefinitions(): KPIDefinition[] {
    return Array.from(this.kpiDefinitions.values());
  }

  getMetricValues(
    metricId: string,
    options: {
      productId?: string;
      fundId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): MetricValue[] {
    let values = this.metricValues.get(metricId) || [];

    if (options.productId) {
      values = values.filter(v => v.productId === options.productId);
    }

    if (options.fundId) {
      values = values.filter(v => v.fundId === options.fundId);
    }

    if (options.startDate) {
      values = values.filter(v => v.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      values = values.filter(v => v.timestamp <= options.endDate!);
    }

    return values;
  }

  getKPIValues(
    kpiId: string,
    options: {
      productId?: string;
      fundId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): KPIValue[] {
    let values = this.kpiValues.get(kpiId) || [];

    if (options.productId) {
      values = values.filter(v => v.productId === options.productId);
    }

    if (options.fundId) {
      values = values.filter(v => v.fundId === options.fundId);
    }

    if (options.startDate) {
      values = values.filter(v => v.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      values = values.filter(v => v.timestamp <= options.endDate!);
    }

    return values;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private aggregateValues(values: MetricValue[], period: TimeHorizon): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v.value, 0) / values.length;
  }

  private determineTrend(values: number[]): 'UPWARD' | 'DOWNWARD' | 'STABLE' | 'VOLATILE' {
    if (values.length < 2) return 'STABLE';

    const changes = values.slice(1).map((v, i) => v - values[i]);
    const positiveChanges = changes.filter(c => c > 0).length;
    const negativeChanges = changes.filter(c => c < 0).length;
    const volatility = this.calculateVolatility(values);

    if (volatility > 0.15) return 'VOLATILE';
    if (positiveChanges > negativeChanges * 1.5) return 'UPWARD';
    if (negativeChanges > positiveChanges * 1.5) return 'DOWNWARD';
    return 'STABLE';
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    return this.calculateStandardDeviation(values);
  }

  private calculateMomentum(values: number[]): number {
    if (values.length < 5) return 0;
    const recentAvg = values.slice(-5).reduce((sum, v) => sum + v, 0) / 5;
    const olderAvg = values.slice(-10, -5).reduce((sum, v) => sum + v, 0) / 5;
    return recentAvg - olderAvg;
  }

  private generateForecast(values: number[]): TrendAnalysis['forecast'] {
    if (values.length < 10) return undefined;

    // Simple linear regression forecast
    const n = values.length;
    const xSum = n * (n - 1) / 2;
    const ySum = values.reduce((sum, v) => sum + v, 0);
    const xySum = values.reduce((sum, v, i) => sum + i * v, 0);
    const xxSum = n * (n - 1) * (2 * n - 1) / 6;

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    const nextValue = slope * n + intercept;
    const stdError = this.calculateStandardDeviation(values) / Math.sqrt(n);

    return {
      nextPeriod: TimeHorizon.DAILY,
      predictedValue: nextValue,
      confidenceInterval: {
        lower: nextValue - 1.96 * stdError,
        upper: nextValue + 1.96 * stdError,
        confidence: 0.95
      }
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private calculateTrackingError(productReturns: number[], benchmarkReturns: number[]): number {
    if (productReturns.length !== benchmarkReturns.length) return 0;
    const excessReturns = productReturns.map((r, i) => r - benchmarkReturns[i]);
    return this.calculateStandardDeviation(excessReturns) * Math.sqrt(252);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const xMean = x.reduce((sum, v) => sum + v, 0) / n;
    const yMean = y.reduce((sum, v) => sum + v, 0) / n;
    
    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xVariance += xDiff * xDiff;
      yVariance += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(xVariance * yVariance);
    return denominator !== 0 ? numerator / denominator : 0;
  }

  private calculateBeta(productReturns: number[], benchmarkReturns: number[]): number {
    const covariance = this.calculateCovariance(productReturns, benchmarkReturns);
    const benchmarkVariance = Math.pow(this.calculateStandardDeviation(benchmarkReturns), 2);
    return benchmarkVariance !== 0 ? covariance / benchmarkVariance : 1;
  }

  private calculateCovariance(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const xMean = x.reduce((sum, v) => sum + v, 0) / n;
    const yMean = y.reduce((sum, v) => sum + v, 0) / n;
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (x[i] - xMean) * (y[i] - yMean);
    }
    
    return sum / (n - 1);
  }

  private calculateAlpha(
    productReturns: number[],
    benchmarkReturns: number[],
    beta: number
  ): number {
    const avgProductReturn = productReturns.reduce((sum, r) => sum + r, 0) / productReturns.length;
    const avgBenchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    const riskFreeRate = 0.02 / 252;
    
    return (avgProductReturn - riskFreeRate) - beta * (avgBenchmarkReturn - riskFreeRate);
  }

  private getProductReturns(productId: string, days: number): number[] {
    // Simulated returns - in production, this would query actual portfolio data
    const returns: number[] = [];
    for (let i = 0; i < days; i++) {
      returns.push((Math.random() - 0.5) * 0.04);
    }
    return returns;
  }

  private calculateDrawdown(productId: string): {
    current: number;
    maxDrawdown: number;
    recoveryTime?: number;
  } {
    // Simulated drawdown calculation
    return {
      current: -5.2,
      maxDrawdown: -12.8,
      recoveryTime: 45
    };
  }

  private runStressTests(productId: string): {
    scenario: string;
    impact: number;
    probability: number;
  }[] {
    return [
      { scenario: 'Market Crash (-20%)', impact: -18.5, probability: 0.05 },
      { scenario: 'Interest Rate Spike (+200bps)', impact: -8.2, probability: 0.10 },
      { scenario: 'Currency Devaluation (-30%)', impact: -12.4, probability: 0.08 },
      { scenario: 'Emerging Markets Crisis', impact: -22.1, probability: 0.03 },
      { scenario: 'Commodity Price Collapse', impact: -15.6, probability: 0.07 }
    ];
  }

  private calculateSensitivity(productId: string): {
    factor: string;
    sensitivity: number;
  }[] {
    return [
      { factor: 'Interest Rates', sensitivity: -0.45 },
      { factor: 'USD Exchange Rate', sensitivity: 0.32 },
      { factor: 'Oil Prices', sensitivity: 0.18 },
      { factor: 'Equity Markets', sensitivity: 0.85 },
      { factor: 'Credit Spreads', sensitivity: -0.28 }
    ];
  }

  private calculateTotalAUM(): number {
    return 2500000000; // $2.5B
  }

  private countActiveProducts(): number {
    return 45;
  }

  private countActiveClients(): number {
    return 1250;
  }

  private calculateAverageClientSize(): number {
    return this.calculateTotalAUM() / this.countActiveClients();
  }
}

export const analyticsService = new AnalyticsService();
