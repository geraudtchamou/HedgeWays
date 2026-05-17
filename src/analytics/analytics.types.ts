/**
 * Analytics Module for Emerging Markets Investment Platform
 * Tracks KPIs, Metrics, and Performance across all asset classes
 */

export enum MetricCategory {
  PERFORMANCE = 'PERFORMANCE',
  RISK = 'RISK',
  LIQUIDITY = 'LIQUIDITY',
  OPERATIONAL = 'OPERATIONAL',
  CLIENT = 'CLIENT',
  ESG = 'ESG',
  REVENUE = 'REVENUE'
}

export enum TimeHorizon {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  YTD = 'YTD',
  SINCE_INCEPTION = 'SINCE_INCEPTION'
}

export interface MetricDefinition {
  id: string;
  name: string;
  category: MetricCategory;
  description: string;
  unit: string;
  calculationMethod: string;
  frequency: TimeHorizon;
  targetValue?: number;
  thresholdWarning?: number;
  thresholdCritical?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KPIDefinition {
  id: string;
  name: string;
  category: MetricCategory;
  description: string;
  metricIds: string[];
  weight: number;
  targetValue: number;
  actualValue?: number;
  variance?: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
  owner: string;
  reviewFrequency: TimeHorizon;
  lastReviewDate?: Date;
  nextReviewDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricValue {
  id: string;
  metricId: string;
  productId?: string;
  fundId?: string;
  countryId?: string;
  assetClass?: string;
  value: number;
  previousValue?: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  period: TimeHorizon;
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  isEstimated: boolean;
  createdAt: Date;
}

export interface KPIValue {
  id: string;
  kpiId: string;
  productId?: string;
  fundId?: string;
  organizationId?: string;
  value: number;
  targetValue: number;
  variance: number;
  variancePercent: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
  contributingMetrics: {
    metricId: string;
    metricName: string;
    value: number;
    weight: number;
    contribution: number;
  }[];
  timestamp: Date;
  period: TimeHorizon;
  commentary?: string;
  actionItems?: string[];
  createdAt: Date;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  kpiIds: string[];
  metricIds: string[];
  filters: {
    assetClasses?: string[];
    countries?: string[];
    products?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  layout: DashboardWidget[];
  refreshFrequency: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'CHART' | 'TABLE' | 'GAUGE' | 'TREND' | 'SUMMARY';
  title: string;
  metricId?: string;
  kpiId?: string;
  config: {
    chartType?: 'LINE' | 'BAR' | 'PIE' | 'SCATTER';
    dimensions?: { x: number; y: number; width: number; height: number };
    colors?: string[];
    showTarget?: boolean;
    showTrend?: boolean;
    decimalPlaces?: number;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface TrendAnalysis {
  metricId: string;
  periods: TimeHorizon[];
  values: {
    period: TimeHorizon;
    value: number;
    timestamp: Date;
  }[];
  trend: 'UPWARD' | 'DOWNWARD' | 'STABLE' | 'VOLATILE';
  volatility: number;
  momentum: number;
  seasonality?: {
    pattern: string;
    strength: number;
  };
  forecast?: {
    nextPeriod: TimeHorizon;
    predictedValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
      confidence: number;
    };
  };
}

export interface BenchmarkComparison {
  metricId: string;
  productId: string;
  benchmarkId: string;
  benchmarkName: string;
  productValue: number;
  benchmarkValue: number;
  outperformance: number;
  outperformancePercent: number;
  trackingError: number;
  informationRatio: number;
  correlation: number;
  beta: number;
  alpha: number;
  period: TimeHorizon;
  timestamp: Date;
}

export interface RiskMetrics {
  valueAtRisk: {
    var95: number;
    var99: number;
    conditionalVar95: number;
    conditionalVar99: number;
  };
  stressTestResults: {
    scenario: string;
    impact: number;
    probability: number;
  }[];
  sensitivityAnalysis: {
    factor: string;
    sensitivity: number;
  }[];
  drawdown: {
    current: number;
    maxDrawdown: number;
    recoveryTime?: number;
  };
  volatility: {
    daily: number;
    weekly: number;
    monthly: number;
    annualized: number;
  };
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownDuration: number;
}

export interface LiquidityMetrics {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  operatingCashFlowRatio: number;
  daysSalesOutstanding: number;
  daysInventoryOutstanding: number;
  daysPayableOutstanding: number;
  cashConversionCycle: number;
  liquidityCoverageRatio: number;
  netStableFundingRatio: number;
  redemptionFrequency: string;
  noticePeriod: number;
  gateProvisions?: {
    isActive: boolean;
    threshold: number;
    currentRedemptionRequests: number;
  };
}

export interface OperationalMetrics {
  totalAssetsUnderManagement: number;
  numberOfProducts: number;
  numberOfClients: number;
  averageClientSize: number;
  clientConcentration: {
    top5Percent: number;
    top10Percent: number;
  };
  employeeCount: number;
  revenuePerEmployee: number;
  costIncomeRatio: number;
  systemUptime: number;
  tradeExecutionTime: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  complianceBreaches: number;
  auditFindings: number;
}

export interface ClientMetrics {
  totalClients: number;
  newClientsThisPeriod: number;
  clientChurnRate: number;
  netClientGrowth: number;
  averageRelationshipLength: number;
  clientSatisfactionScore: number;
  netPromoterScore: number;
  clientSegmentation: {
    retail: number;
    highNetWorth: number;
    institutional: number;
    sovereign: number;
  };
  geographicDistribution: {
    [countryCode: string]: number;
  };
  productPenetration: {
    [productType: string]: number;
  };
}

export interface ESGMetrics {
  overallScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  carbonFootprint: number;
  waterUsage: number;
  wasteGeneration: number;
  renewableEnergyPercentage: number;
  diversityMetrics: {
    genderDiversity: number;
    ethnicDiversity: number;
    boardIndependence: number;
  };
  communityInvestment: number;
  humanRightsCompliance: boolean;
  controversialWeaponsExposure: number;
  tobaccoExposure: number;
  fossilFuelExposure: number;
  unGlobalCompactViolators: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  managementFees: number;
  performanceFees: number;
  transactionFees: number;
  advisoryFees: number;
  otherRevenue: number;
  revenueGrowthRate: number;
  recurringRevenuePercentage: number;
  revenueByAssetClass: {
    [assetClass: string]: number;
  };
  revenueByGeography: {
    [countryCode: string]: number;
  };
  revenueByClientSegment: {
    [segment: string]: number;
  };
  costStructure: {
    fixedCosts: number;
    variableCosts: number;
    compensationCosts: number;
    technologyCosts: number;
    regulatoryCosts: number;
  };
  profitabilityMetrics: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnEquity: number;
    returnOnAssets: number;
  };
}

export interface AnalyticsConfig {
  dataRetentionDays: number;
  aggregationIntervals: string[];
  realTimeMetrics: string[];
  batchMetrics: string[];
  alertThresholds: {
    metricId: string;
    warningLevel: number;
    criticalLevel: number;
  }[];
  dashboardRefreshInterval: number;
  exportFormats: string[];
  accessControls: {
    role: string;
    allowedMetrics: string[];
    allowedKPIs: string[];
    canExport: boolean;
    canModify: boolean;
  }[];
}
