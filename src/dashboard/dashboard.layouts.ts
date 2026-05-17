/**
 * Dashboard Layout Configurations
 * Pre-defined dashboard layouts for each user role with specialized widgets and charts.
 */

import { DashboardLayout, ChartType } from './dashboard.types';

export const investorDashboard: DashboardLayout = {
  role: 'INVESTOR',
  name: 'Investor Portfolio Dashboard',
  description: 'Personalized view for investors tracking portfolio performance, allocation, and returns.',
  lastUpdated: new Date(),
  widgets: [
    {
      id: 'inv-portfolio-value',
      title: 'Portfolio Value Over Time',
      chartType: 'AREA',
      dataSource: '/api/metrics/portfolio/value',
      refreshInterval: 300,
      config: {
        xAxis: 'date',
        yAxis: ['value'],
        format: 'currency',
        showLegend: false,
        showTooltip: true,
      },
      position: { x: 0, y: 0, w: 12, h: 6 },
    },
    {
      id: 'inv-asset-allocation',
      title: 'Asset Allocation',
      chartType: 'DOUGHNUT',
      dataSource: '/api/metrics/portfolio/allocation',
      config: {
        series: ['commodities', 'stocks', 'bonds', 'real_estate', 'manufacturing', 'mining', 'crypto'],
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
        format: 'percentage',
        showLegend: true,
        showTooltip: true,
      },
      position: { x: 0, y: 6, w: 6, h: 6 },
    },
    {
      id: 'inv-returns',
      title: 'Returns by Asset Class',
      chartType: 'BAR',
      dataSource: '/api/metrics/portfolio/returns',
      config: {
        xAxis: 'assetClass',
        yAxis: ['return'],
        format: 'percentage',
        showLegend: false,
        thresholds: { warning: 0, critical: -5 },
      },
      position: { x: 6, y: 6, w: 6, h: 6 },
    },
    {
      id: 'inv-risk-gauge',
      title: 'Portfolio Risk Level',
      chartType: 'GAUGE',
      dataSource: '/api/metrics/portfolio/risk',
      config: {
        format: 'number',
        thresholds: { warning: 5, critical: 8 },
      },
      position: { x: 0, y: 12, w: 4, h: 4 },
    },
    {
      id: 'inv-recent-transactions',
      title: 'Recent Transactions',
      chartType: 'TABLE',
      dataSource: '/api/transactions/recent',
      refreshInterval: 60,
      config: {
        showLegend: false,
        showTooltip: false,
      },
      position: { x: 4, y: 12, w: 8, h: 4 },
    },
    {
      id: 'inv-dividend-income',
      title: 'Dividend & Interest Income',
      chartType: 'LINE',
      dataSource: '/api/metrics/portfolio/income',
      config: {
        xAxis: 'month',
        yAxis: ['dividends', 'interest'],
        format: 'currency',
        showLegend: true,
      },
      position: { x: 0, y: 16, w: 12, h: 4 },
    },
  ],
};

export const analystDashboard: DashboardLayout = {
  role: 'ANALYST',
  name: 'Market Analyst Dashboard',
  description: 'Comprehensive market analysis tools with deep-dive metrics and comparative analytics.',
  lastUpdated: new Date(),
  widgets: [
    {
      id: 'analyst-market-overview',
      title: 'Market Performance Overview',
      chartType: 'LINE',
      dataSource: '/api/analytics/market/overview',
      refreshInterval: 60,
      config: {
        xAxis: 'date',
        yAxis: ['sp500', 'emergingMarkets', 'bonds', 'commodities'],
        format: 'percentage',
        showLegend: true,
        showTooltip: true,
      },
      position: { x: 0, y: 0, w: 12, h: 6 },
    },
    {
      id: 'analyst-asset-correlation',
      title: 'Asset Class Correlation Heatmap',
      chartType: 'HEATMAP',
      dataSource: '/api/analytics/correlation',
      config: {
        format: 'number',
        showLegend: true,
        showTooltip: true,
      },
      position: { x: 0, y: 6, w: 8, h: 6 },
    },
    {
      id: 'analyst-risk-metrics',
      title: 'Risk Metrics Comparison',
      chartType: 'RADAR',
      dataSource: '/api/analytics/risk/metrics',
      config: {
        series: ['volatility', 'sharpeRatio', 'maxDrawdown', 'beta', 'var'],
        format: 'number',
        showLegend: true,
      },
      position: { x: 8, y: 6, w: 4, h: 6 },
    },
    {
      id: 'analyst-sector-performance',
      title: 'Sector Performance Analysis',
      chartType: 'BAR',
      dataSource: '/api/analytics/sector/performance',
      config: {
        xAxis: 'sector',
        yAxis: ['return', 'volume'],
        format: 'percentage',
        showLegend: true,
      },
      position: { x: 0, y: 12, w: 6, h: 6 },
    },
    {
      id: 'analyst-esg-scores',
      title: 'ESG Scores by Investment',
      chartType: 'SCATTER',
      dataSource: '/api/analytics/esg/scores',
      config: {
        xAxis: 'environmentalScore',
        yAxis: ['socialScore', 'governanceScore'],
        showLegend: true,
        showTooltip: true,
      },
      position: { x: 6, y: 12, w: 6, h: 6 },
    },
    {
      id: 'analyst-fee-revenue',
      title: 'Fee & Revenue Analytics',
      chartType: 'AREA',
      dataSource: '/api/fees/analytics',
      config: {
        xAxis: 'month',
        yAxis: ['managementFees', 'performanceFees', 'transactionFees'],
        format: 'currency',
        showLegend: true,
      },
      position: { x: 0, y: 18, w: 12, h: 4 },
    },
  ],
};

export const fundManagerDashboard: DashboardLayout = {
  role: 'FUND_MANAGER',
  name: 'Fund Manager Operations Dashboard',
  description: 'Operational oversight for fund managers including AUM, flows, performance, and compliance.',
  lastUpdated: new Date(),
  widgets: [
    {
      id: 'fm-aum-trend',
      title: 'Assets Under Management (AUM)',
      chartType: 'AREA',
      dataSource: '/api/funds/aum/trend',
      refreshInterval: 300,
      config: {
        xAxis: 'date',
        yAxis: ['aum'],
        format: 'currency',
        showLegend: false,
      },
      position: { x: 0, y: 0, w: 8, h: 6 },
    },
    {
      id: 'fm-fund-flows',
      title: 'Fund Flows (Inflows/Outflows)',
      chartType: 'BAR',
      dataSource: '/api/funds/flows',
      config: {
        xAxis: 'date',
        yAxis: ['inflows', 'outflows'],
        format: 'currency',
        showLegend: true,
        thresholds: { warning: -1000000, critical: -5000000 },
      },
      position: { x: 8, y: 0, w: 4, h: 6 },
    },
    {
      id: 'fm-performance-vs-benchmark',
      title: 'Performance vs Benchmark',
      chartType: 'LINE',
      dataSource: '/api/funds/performance/benchmark',
      config: {
        xAxis: 'date',
        yAxis: ['fundReturn', 'benchmarkReturn'],
        format: 'percentage',
        showLegend: true,
      },
      position: { x: 0, y: 6, w: 12, h: 6 },
    },
    {
      id: 'fm-position-concentration',
      title: 'Top 10 Positions Concentration',
      chartType: 'PIE',
      dataSource: '/api/funds/positions/concentration',
      config: {
        series: ['positions'],
        format: 'percentage',
        showLegend: true,
        showTooltip: true,
      },
      position: { x: 0, y: 12, w: 6, h: 6 },
    },
    {
      id: 'fm-compliance-alerts',
      title: 'Compliance & Risk Alerts',
      chartType: 'TABLE',
      dataSource: '/api/compliance/alerts',
      refreshInterval: 60,
      config: {
        showLegend: false,
        showTooltip: false,
        thresholds: { warning: 3, critical: 10 },
      },
      position: { x: 6, y: 12, w: 6, h: 6 },
    },
    {
      id: 'fm-cash-position',
      title: 'Cash Position & Liquidity',
      chartType: 'GAUGE',
      dataSource: '/api/funds/liquidity',
      config: {
        format: 'percentage',
        thresholds: { warning: 10, critical: 5 },
      },
      position: { x: 0, y: 18, w: 4, h: 4 },
    },
    {
      id: 'fm-fee-accruals',
      title: 'Accrued Fees & Revenue',
      chartType: 'LINE',
      dataSource: '/api/fees/accruals',
      config: {
        xAxis: 'date',
        yAxis: ['accruedManagementFees', 'accruedPerformanceFees'],
        format: 'currency',
        showLegend: true,
      },
      position: { x: 4, y: 18, w: 8, h: 4 },
    },
  ],
};

export const adminDashboard: DashboardLayout = {
  role: 'ADMIN',
  name: 'System Administrator Dashboard',
  description: 'System-wide oversight including user activity, system health, revenue, and operational metrics.',
  lastUpdated: new Date(),
  widgets: [
    {
      id: 'admin-system-health',
      title: 'System Health Status',
      chartType: 'GAUGE',
      dataSource: '/api/admin/system/health',
      refreshInterval: 30,
      config: {
        format: 'percentage',
        thresholds: { warning: 90, critical: 80 },
      },
      position: { x: 0, y: 0, w: 4, h: 4 },
    },
    {
      id: 'admin-active-users',
      title: 'Active Users by Role',
      chartType: 'PIE',
      dataSource: '/api/admin/users/active',
      config: {
        series: ['investors', 'analysts', 'fundManagers', 'admins'],
        format: 'number',
        showLegend: true,
      },
      position: { x: 4, y: 0, w: 4, h: 4 },
    },
    {
      id: 'admin-api-usage',
      title: 'API Usage Trends',
      chartType: 'LINE',
      dataSource: '/api/admin/api/usage',
      refreshInterval: 60,
      config: {
        xAxis: 'hour',
        yAxis: ['requests', 'errors'],
        format: 'number',
        showLegend: true,
      },
      position: { x: 8, y: 0, w: 4, h: 4 },
    },
    {
      id: 'admin-total-revenue',
      title: 'Total Platform Revenue',
      chartType: 'AREA',
      dataSource: '/api/admin/revenue/total',
      config: {
        xAxis: 'month',
        yAxis: ['fees', 'subscriptions', 'other'],
        format: 'currency',
        showLegend: true,
      },
      position: { x: 0, y: 4, w: 8, h: 6 },
    },
    {
      id: 'admin-user-growth',
      title: 'User Growth & Retention',
      chartType: 'LINE',
      dataSource: '/api/admin/users/growth',
      config: {
        xAxis: 'month',
        yAxis: ['newUsers', 'churnedUsers', 'activeUsers'],
        format: 'number',
        showLegend: true,
      },
      position: { x: 8, y: 4, w: 4, h: 6 },
    },
    {
      id: 'admin-asset-class-distribution',
      title: 'Platform AUM by Asset Class',
      chartType: 'DOUGHNUT',
      dataSource: '/api/admin/aum/distribution',
      config: {
        series: ['commodities', 'stocks', 'bonds', 'real_estate', 'manufacturing', 'mining', 'crypto'],
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'],
        format: 'percentage',
        showLegend: true,
      },
      position: { x: 0, y: 10, w: 6, h: 6 },
    },
    {
      id: 'admin-error-logs',
      title: 'Recent Error Logs',
      chartType: 'TABLE',
      dataSource: '/api/admin/logs/errors',
      refreshInterval: 60,
      config: {
        showLegend: false,
        showTooltip: false,
      },
      position: { x: 6, y: 10, w: 6, h: 6 },
    },
    {
      id: 'admin-regional-exposure',
      title: 'Regional Exposure Heatmap',
      chartType: 'HEATMAP',
      dataSource: '/api/admin/regional/exposure',
      config: {
        format: 'currency',
        showLegend: true,
        showTooltip: true,
      },
      position: { x: 0, y: 16, w: 12, h: 6 },
    },
  ],
};

export const getDashboardByRole = (role: string): DashboardLayout => {
  switch (role.toUpperCase()) {
    case 'INVESTOR':
      return investorDashboard;
    case 'ANALYST':
      return analystDashboard;
    case 'FUND_MANAGER':
      return fundManagerDashboard;
    case 'ADMIN':
      return adminDashboard;
    default:
      throw new Error(`Unknown role: ${role}`);
  }
};
