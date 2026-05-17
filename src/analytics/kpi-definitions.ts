/**
 * Pre-defined KPIs and Metrics for Emerging Markets Investment Platform
 * Covers all asset classes: commodities, stocks, bonds, housing, manufacturing, mining, crypto
 */

import { MetricCategory, TimeHorizon, MetricDefinition, KPIDefinition } from './analytics.types';

export const PREDEFINED_METRICS: Omit<MetricDefinition, 'createdAt' | 'updatedAt'>[] = [
  // PERFORMANCE METRICS
  {
    id: 'PERF_001',
    name: 'Total Return',
    category: MetricCategory.PERFORMANCE,
    description: 'Total return including price appreciation and income',
    unit: 'percentage',
    calculationMethod: '(Ending Value - Beginning Value + Income) / Beginning Value * 100',
    frequency: TimeHorizon.DAILY,
    targetValue: 8.0,
    thresholdWarning: 5.0,
    thresholdCritical: 0.0,
    isActive: true
  },
  {
    id: 'PERF_002',
    name: 'Annualized Return',
    category: MetricCategory.PERFORMANCE,
    description: 'Compound annual growth rate',
    unit: 'percentage',
    calculationMethod: '((Ending Value / Beginning Value) ^ (365/Days)) - 1) * 100',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 10.0,
    thresholdWarning: 6.0,
    thresholdCritical: 2.0,
    isActive: true
  },
  {
    id: 'PERF_003',
    name: 'Excess Return',
    category: MetricCategory.PERFORMANCE,
    description: 'Return above benchmark',
    unit: 'percentage',
    calculationMethod: 'Portfolio Return - Benchmark Return',
    frequency: TimeHorizon.DAILY,
    targetValue: 2.0,
    thresholdWarning: 0.0,
    thresholdCritical: -2.0,
    isActive: true
  },
  {
    id: 'PERF_004',
    name: 'Commodity Index Performance',
    category: MetricCategory.PERFORMANCE,
    description: 'Performance of commodity basket',
    unit: 'percentage',
    calculationMethod: 'Weighted average of underlying commodity returns',
    frequency: TimeHorizon.DAILY,
    targetValue: 7.0,
    isActive: true
  },
  {
    id: 'PERF_005',
    name: 'Equity Alpha',
    category: MetricCategory.PERFORMANCE,
    description: 'Risk-adjusted excess return for equity products',
    unit: 'percentage',
    calculationMethod: 'Portfolio Return - (Risk-free Rate + Beta * Market Risk Premium)',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 3.0,
    thresholdWarning: 1.0,
    thresholdCritical: -1.0,
    isActive: true
  },
  {
    id: 'PERF_006',
    name: 'Bond Yield to Maturity',
    category: MetricCategory.PERFORMANCE,
    description: 'Expected return on bond if held to maturity',
    unit: 'percentage',
    calculationMethod: 'IRR of bond cash flows',
    frequency: TimeHorizon.DAILY,
    isActive: true
  },
  {
    id: 'PERF_007',
    name: 'REIT Dividend Yield',
    category: MetricCategory.PERFORMANCE,
    description: 'Annual dividend yield for real estate investments',
    unit: 'percentage',
    calculationMethod: 'Annual Dividends / Current Price * 100',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 5.0,
    thresholdWarning: 3.0,
    thresholdCritical: 2.0,
    isActive: true
  },
  {
    id: 'PERF_008',
    name: 'Manufacturing ROI',
    category: MetricCategory.PERFORMANCE,
    description: 'Return on investment for manufacturing assets',
    unit: 'percentage',
    calculationMethod: '(Net Profit / Investment Cost) * 100',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 12.0,
    thresholdWarning: 8.0,
    thresholdCritical: 5.0,
    isActive: true
  },
  {
    id: 'PERF_009',
    name: 'Mining Production Efficiency',
    category: MetricCategory.PERFORMANCE,
    description: 'Output per unit of input in mining operations',
    unit: 'ratio',
    calculationMethod: 'Total Output / Total Input Cost',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 1.5,
    thresholdWarning: 1.2,
    thresholdCritical: 1.0,
    isActive: true
  },
  {
    id: 'PERF_010',
    name: 'Crypto Asset Return',
    category: MetricCategory.PERFORMANCE,
    description: 'Return on cryptocurrency investments',
    unit: 'percentage',
    calculationMethod: '(Current Value - Cost Basis) / Cost Basis * 100',
    frequency: TimeHorizon.DAILY,
    isActive: true
  },

  // RISK METRICS
  {
    id: 'RISK_001',
    name: 'Value at Risk (95%)',
    category: MetricCategory.RISK,
    description: 'Maximum loss expected with 95% confidence over specified period',
    unit: 'percentage',
    calculationMethod: 'Historical or parametric VaR at 95% confidence level',
    frequency: TimeHorizon.DAILY,
    thresholdWarning: 5.0,
    thresholdCritical: 10.0,
    isActive: true
  },
  {
    id: 'RISK_002',
    name: 'Value at Risk (99%)',
    category: MetricCategory.RISK,
    description: 'Maximum loss expected with 99% confidence over specified period',
    unit: 'percentage',
    calculationMethod: 'Historical or parametric VaR at 99% confidence level',
    frequency: TimeHorizon.DAILY,
    thresholdWarning: 8.0,
    thresholdCritical: 15.0,
    isActive: true
  },
  {
    id: 'RISK_003',
    name: 'Sharpe Ratio',
    category: MetricCategory.RISK,
    description: 'Risk-adjusted return measure',
    unit: 'ratio',
    calculationMethod: '(Portfolio Return - Risk-free Rate) / Portfolio Volatility',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 1.0,
    thresholdWarning: 0.5,
    thresholdCritical: 0.0,
    isActive: true
  },
  {
    id: 'RISK_004',
    name: 'Sortino Ratio',
    category: MetricCategory.RISK,
    description: 'Downside risk-adjusted return',
    unit: 'ratio',
    calculationMethod: '(Portfolio Return - Risk-free Rate) / Downside Deviation',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 1.2,
    thresholdWarning: 0.6,
    thresholdCritical: 0.0,
    isActive: true
  },
  {
    id: 'RISK_005',
    name: 'Maximum Drawdown',
    category: MetricCategory.RISK,
    description: 'Largest peak-to-trough decline',
    unit: 'percentage',
    calculationMethod: 'Max((Peak - Trough) / Peak) * 100',
    frequency: TimeHorizon.DAILY,
    thresholdWarning: 15.0,
    thresholdCritical: 25.0,
    isActive: true
  },
  {
    id: 'RISK_006',
    name: 'Beta',
    category: MetricCategory.RISK,
    description: 'Sensitivity to market movements',
    unit: 'coefficient',
    calculationMethod: 'Covariance(Portfolio, Market) / Variance(Market)',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 1.0,
    isActive: true
  },
  {
    id: 'RISK_007',
    name: 'Tracking Error',
    category: MetricCategory.RISK,
    description: 'Standard deviation of excess returns vs benchmark',
    unit: 'percentage',
    calculationMethod: 'StdDev(Portfolio Return - Benchmark Return)',
    frequency: TimeHorizon.MONTHLY,
    thresholdWarning: 3.0,
    thresholdCritical: 5.0,
    isActive: true
  },
  {
    id: 'RISK_008',
    name: 'Currency Exposure',
    category: MetricCategory.RISK,
    description: 'Net exposure to foreign currencies',
    unit: 'percentage',
    calculationMethod: 'Sum of net positions in each currency',
    frequency: TimeHorizon.DAILY,
    thresholdWarning: 20.0,
    thresholdCritical: 40.0,
    isActive: true
  },
  {
    id: 'RISK_009',
    name: 'Crypto Volatility',
    category: MetricCategory.RISK,
    description: 'Volatility of cryptocurrency holdings',
    unit: 'percentage',
    calculationMethod: 'Annualized standard deviation of crypto returns',
    frequency: TimeHorizon.DAILY,
    thresholdWarning: 50.0,
    thresholdCritical: 80.0,
    isActive: true
  },

  // LIQUIDITY METRICS
  {
    id: 'LIQ_001',
    name: 'Current Ratio',
    category: MetricCategory.LIQUIDITY,
    description: 'Ability to pay short-term obligations',
    unit: 'ratio',
    calculationMethod: 'Current Assets / Current Liabilities',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 1.5,
    thresholdWarning: 1.2,
    thresholdCritical: 1.0,
    isActive: true
  },
  {
    id: 'LIQ_002',
    name: 'Quick Ratio',
    category: MetricCategory.LIQUIDITY,
    description: 'Ability to pay short-term obligations without inventory',
    unit: 'ratio',
    calculationMethod: '(Current Assets - Inventory) / Current Liabilities',
    frequency: TimeHorizon.MONTHLY,
    targetValue: 1.0,
    thresholdWarning: 0.8,
    thresholdCritical: 0.5,
    isActive: true
  },
  {
    id: 'LIQ_003',
    name: 'Redemption Coverage',
    category: MetricCategory.LIQUIDITY,
    description: 'Liquid assets available for redemptions',
    unit: 'percentage',
    calculationMethod: 'Liquid Assets / Expected Redemptions * 100',
    frequency: TimeHorizon.WEEKLY,
    targetValue: 150.0,
    thresholdWarning: 100.0,
    thresholdCritical: 75.0,
    isActive: true
  },
  {
    id: 'LIQ_004',
    name: 'Days to Liquidate',
    category: MetricCategory.LIQUIDITY,
    description: 'Estimated days to liquidate portfolio',
    unit: 'days',
    calculationMethod: 'Weighted average of position liquidation times',
    frequency: TimeHorizon.WEEKLY,
    thresholdWarning: 30,
    thresholdCritical: 60,
    isActive: true
  },

  // OPERATIONAL METRICS
  {
    id: 'OPS_001',
    name: 'Assets Under Management',
    category: MetricCategory.OPERATIONAL,
    description: 'Total value of assets managed',
    unit: 'currency',
    calculationMethod: 'Sum of all portfolio values',
    frequency: TimeHorizon.DAILY,
    isActive: true
  },
  {
    id: 'OPS_002',
    name: 'Number of Active Products',
    category: MetricCategory.OPERATIONAL,
    description: 'Count of active investment products',
    unit: 'count',
    calculationMethod: 'Count of products with status ACTIVE',
    frequency: TimeHorizon.DAILY,
    isActive: true
  },
  {
    id: 'OPS_003',
    name: 'Trade Settlement Rate',
    category: MetricCategory.OPERATIONAL,
    description: 'Percentage of trades settled on time',
    unit: 'percentage',
    calculationMethod: '(On-time Settlements / Total Settlements) * 100',
    frequency: TimeHorizon.DAILY,
    targetValue: 99.5,
    thresholdWarning: 98.0,
    thresholdCritical: 95.0,
    isActive: true
  },
  {
    id: 'OPS_004',
    name: 'Operational Error Rate',
    category: MetricCategory.OPERATIONAL,
    description: 'Rate of operational errors',
    unit: 'percentage',
    calculationMethod: '(Number of Errors / Total Transactions) * 100',
    frequency: TimeHorizon.WEEKLY,
    thresholdWarning: 0.5,
    thresholdCritical: 1.0,
    isActive: true
  },

  // CLIENT METRICS
  {
    id: 'CLI_001',
    name: 'Client Acquisition Rate',
    category: MetricCategory.CLIENT,
    description: 'New clients acquired per period',
    unit: 'count',
    calculationMethod: 'Count of new clients in period',
    frequency: TimeHorizon.MONTHLY,
    isActive: true
  },
  {
    id: 'CLI_002',
    name: 'Client Retention Rate',
    category: MetricCategory.CLIENT,
    description: 'Percentage of clients retained',
    unit: 'percentage',
    calculationMethod: '((End Clients - New Clients) / Start Clients) * 100',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 95.0,
    thresholdWarning: 90.0,
    thresholdCritical: 85.0,
    isActive: true
  },
  {
    id: 'CLI_003',
    name: 'Average Client AUM',
    category: MetricCategory.CLIENT,
    description: 'Average assets per client',
    unit: 'currency',
    calculationMethod: 'Total AUM / Number of Clients',
    frequency: TimeHorizon.MONTHLY,
    isActive: true
  },
  {
    id: 'CLI_004',
    name: 'Net Promoter Score',
    category: MetricCategory.CLIENT,
    description: 'Client satisfaction and loyalty metric',
    unit: 'score',
    calculationMethod: '% Promoters - % Detractors',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 50,
    thresholdWarning: 30,
    thresholdCritical: 0,
    isActive: true
  },

  // ESG METRICS
  {
    id: 'ESG_001',
    name: 'Overall ESG Score',
    category: MetricCategory.ESG,
    description: 'Composite ESG rating',
    unit: 'score',
    calculationMethod: 'Weighted average of E, S, and G scores',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 75,
    thresholdWarning: 60,
    thresholdCritical: 40,
    isActive: true
  },
  {
    id: 'ESG_002',
    name: 'Carbon Intensity',
    category: MetricCategory.ESG,
    description: 'Carbon emissions per unit of revenue',
    unit: 'tCO2e/million USD',
    calculationMethod: 'Total Scope 1 & 2 Emissions / Revenue',
    frequency: TimeHorizon.YEARLY,
    thresholdWarning: 500,
    thresholdCritical: 1000,
    isActive: true
  },
  {
    id: 'ESG_003',
    name: 'Board Diversity',
    category: MetricCategory.ESG,
    description: 'Percentage of diverse board members',
    unit: 'percentage',
    calculationMethod: '(Diverse Board Members / Total Board Members) * 100',
    frequency: TimeHorizon.YEARLY,
    targetValue: 40,
    thresholdWarning: 25,
    thresholdCritical: 15,
    isActive: true
  },
  {
    id: 'ESG_004',
    name: 'Renewable Energy Usage',
    category: MetricCategory.ESG,
    description: 'Percentage of energy from renewable sources',
    unit: 'percentage',
    calculationMethod: '(Renewable Energy / Total Energy) * 100',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 50,
    thresholdWarning: 30,
    thresholdCritical: 15,
    isActive: true
  },

  // REVENUE METRICS
  {
    id: 'REV_001',
    name: 'Total Revenue',
    category: MetricCategory.REVENUE,
    description: 'Total revenue from all sources',
    unit: 'currency',
    calculationMethod: 'Sum of all revenue streams',
    frequency: TimeHorizon.MONTHLY,
    isActive: true
  },
  {
    id: 'REV_002',
    name: 'Management Fee Revenue',
    category: MetricCategory.REVENUE,
    description: 'Revenue from management fees',
    unit: 'currency',
    calculationMethod: 'Sum of (AUM * Management Fee Rate)',
    frequency: TimeHorizon.MONTHLY,
    isActive: true
  },
  {
    id: 'REV_003',
    name: 'Performance Fee Revenue',
    category: MetricCategory.REVENUE,
    description: 'Revenue from performance fees',
    unit: 'currency',
    calculationMethod: 'Sum of performance fee calculations',
    frequency: TimeHorizon.QUARTERLY,
    isActive: true
  },
  {
    id: 'REV_004',
    name: 'Revenue Growth Rate',
    category: MetricCategory.REVENUE,
    description: 'Year-over-year revenue growth',
    unit: 'percentage',
    calculationMethod: '((Current Period Revenue - Prior Period Revenue) / Prior Period Revenue) * 100',
    frequency: TimeHorizon.QUARTERLY,
    targetValue: 15.0,
    thresholdWarning: 5.0,
    thresholdCritical: 0.0,
    isActive: true
  },
  {
    id: 'REV_005',
    name: 'Cost-Income Ratio',
    category: MetricCategory.REVENUE,
    description: 'Operating costs as percentage of revenue',
    unit: 'percentage',
    calculationMethod: '(Operating Costs / Operating Income) * 100',
    frequency: TimeHorizon.QUARTERLY,
    thresholdWarning: 70,
    thresholdCritical: 85,
    isActive: true
  }
];

export const PREDEFINED_KPIS: Omit<KPIDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'KPI_001',
    name: 'Investment Performance Excellence',
    category: MetricCategory.PERFORMANCE,
    description: 'Overall investment performance across all products',
    metricIds: ['PERF_001', 'PERF_002', 'PERF_003', 'PERF_005'],
    weight: 0.30,
    targetValue: 85,
    status: 'ON_TRACK',
    owner: 'Chief Investment Officer',
    reviewFrequency: TimeHorizon.MONTHLY,
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_002',
    name: 'Risk Management Effectiveness',
    category: MetricCategory.RISK,
    description: 'Effectiveness of risk management framework',
    metricIds: ['RISK_001', 'RISK_002', 'RISK_003', 'RISK_005'],
    weight: 0.25,
    targetValue: 90,
    status: 'ON_TRACK',
    owner: 'Chief Risk Officer',
    reviewFrequency: TimeHorizon.WEEKLY,
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_003',
    name: 'Liquidity Health',
    category: MetricCategory.LIQUIDITY,
    description: 'Overall liquidity position and redemption capability',
    metricIds: ['LIQ_001', 'LIQ_002', 'LIQ_003', 'LIQ_004'],
    weight: 0.15,
    targetValue: 95,
    status: 'ON_TRACK',
    owner: 'Treasury Manager',
    reviewFrequency: TimeHorizon.WEEKLY,
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_004',
    name: 'Operational Excellence',
    category: MetricCategory.OPERATIONAL,
    description: 'Operational efficiency and error minimization',
    metricIds: ['OPS_001', 'OPS_003', 'OPS_004'],
    weight: 0.10,
    targetValue: 98,
    status: 'ON_TRACK',
    owner: 'Chief Operating Officer',
    reviewFrequency: TimeHorizon.MONTHLY,
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_005',
    name: 'Client Satisfaction & Growth',
    category: MetricCategory.CLIENT,
    description: 'Client acquisition, retention, and satisfaction',
    metricIds: ['CLI_001', 'CLI_002', 'CLI_003', 'CLI_004'],
    weight: 0.15,
    targetValue: 88,
    status: 'ON_TRACK',
    owner: 'Head of Client Relations',
    reviewFrequency: TimeHorizon.QUARTERLY,
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_006',
    name: 'ESG Leadership',
    category: MetricCategory.ESG,
    description: 'Environmental, Social, and Governance performance',
    metricIds: ['ESG_001', 'ESG_002', 'ESG_003', 'ESG_004'],
    weight: 0.10,
    targetValue: 80,
    status: 'ON_TRACK',
    owner: 'Head of Sustainability',
    reviewFrequency: TimeHorizon.QUARTERLY,
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_007',
    name: 'Revenue Growth & Profitability',
    category: MetricCategory.REVENUE,
    description: 'Revenue generation and cost management',
    metricIds: ['REV_001', 'REV_002', 'REV_003', 'REV_004', 'REV_005'],
    weight: 0.20,
    targetValue: 90,
    status: 'ON_TRACK',
    owner: 'Chief Financial Officer',
    reviewFrequency: TimeHorizon.MONTHLY,
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: 'KPI_008',
    name: 'Emerging Markets Exposure Quality',
    category: MetricCategory.PERFORMANCE,
    description: 'Quality of emerging markets investment exposure',
    metricIds: ['PERF_004', 'PERF_006', 'PERF_007', 'PERF_008', 'PERF_009', 'PERF_010'],
    weight: 0.15,
    targetValue: 85,
    status: 'ON_TRACK',
    owner: 'Head of Emerging Markets',
    reviewFrequency: TimeHorizon.MONTHLY,
    nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  }
];

export function getMetricsByCategory(category: MetricCategory): Omit<MetricDefinition, 'createdAt' | 'updatedAt'>[] {
  return PREDEFINED_METRICS.filter(m => m.category === category);
}

export function getMetricsByAssetClass(assetClass: string): Omit<MetricDefinition, 'createdAt' | 'updatedAt'>[] {
  const assetClassMetrics: Record<string, string[]> = {
    'COMMODITIES': ['PERF_004'],
    'EQUITIES': ['PERF_005', 'RISK_006', 'RISK_007'],
    'FIXED_INCOME': ['PERF_006'],
    'REAL_ESTATE': ['PERF_007'],
    'MANUFACTURING': ['PERF_008'],
    'MINING': ['PERF_009'],
    'CRYPTOCURRENCY': ['PERF_010', 'RISK_009']
  };
  
  const metricIds = assetClassMetrics[assetClass] || [];
  return PREDEFINED_METRICS.filter(m => metricIds.includes(m.id));
}

export function getKPIsByCategory(category: MetricCategory): Omit<KPIDefinition, 'createdAt' | 'updatedAt'>[] {
  return PREDEFINED_KPIS.filter(k => k.category === category);
}

export function calculateKPIStatus(targetValue: number, actualValue: number): 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' {
  const variance = ((actualValue - targetValue) / targetValue) * 100;
  
  if (variance >= -5) {
    return 'ON_TRACK';
  } else if (variance >= -15) {
    return 'AT_RISK';
  } else {
    return 'OFF_TRACK';
  }
}
