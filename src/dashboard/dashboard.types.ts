/**
 * Dashboard Module Type Definitions
 * Defines structures for dashboard configurations, widget types, and user-specific layouts.
 */

export type UserRole = 'INVESTOR' | 'ANALYST' | 'FUND_MANAGER' | 'ADMIN';

export type ChartType = 
  | 'LINE' 
  | 'BAR' 
  | 'PIE' 
  | 'DOUGHNUT' 
  | 'AREA' 
  | 'SCATTER' 
  | 'CANDLESTICK' 
  | 'HEATMAP' 
  | 'GAUGE' 
  | 'TABLE';

export interface DashboardWidget {
  id: string;
  title: string;
  chartType: ChartType;
  dataSource: string; // API endpoint or metric key
  refreshInterval?: number; // in seconds
  config?: {
    xAxis?: string;
    yAxis?: string[];
    series?: string[];
    colors?: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
    format?: 'currency' | 'percentage' | 'number' | 'date';
    thresholds?: {
      warning?: number;
      critical?: number;
    };
  };
  position: { x: number; y: number; w: number; h: number }; // Grid layout
}

export interface DashboardLayout {
  role: UserRole;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  lastUpdated: Date;
}

export interface DashboardDataPoint {
  timestamp: Date;
  value: number | string;
  label?: string;
  metadata?: Record<string, any>;
}

export interface DashboardResponse {
  layout: DashboardLayout;
  data: Record<string, DashboardDataPoint[]>;
  summaryMetrics: Record<string, number>;
  generatedAt: Date;
}

export interface FilterCriteria {
  dateRange: { start: Date; end: Date };
  assetClasses?: string[];
  regions?: string[];
  currencies?: string[];
  riskLevels?: ('LOW' | 'MEDIUM' | 'HIGH')[];
}
