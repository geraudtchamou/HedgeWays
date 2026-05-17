export interface FinancialProduct {
  id: string;
  name: string;
  assetClass: 'COMMODITY' | 'STOCK' | 'BOND' | 'REAL_ESTATE' | 'MANUFACTURING' | 'MINING' | 'CRYPTO';
  ticker: string;
  currency: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  esgRating?: 'A' | 'B' | 'C' | 'D';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

export interface TokenizedAsset {
  id: string;
  tokenId: string;
  name: string;
  symbol: string;
  totalSupply: number;
  circulatingSupply: number;
  pricePerToken: number;
  underlyingAsset: string;
  complianceStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  lockupPeriodDays: number;
}

export interface Portfolio {
  id: string;
  investorId: string;
  totalValue: number;
  currency: string;
  allocations: PortfolioAllocation[];
  performance: PerformanceMetrics;
}

export interface PortfolioAllocation {
  assetId: string;
  assetName: string;
  assetClass: string;
  quantity: number;
  value: number;
  weight: number;
  avgCost: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PerformanceMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
  ytd: number;
  sinceInception: number;
}

export interface Fee {
  id: string;
  productId: string;
  feeType: 'MANAGEMENT' | 'PERFORMANCE' | 'TRANSACTION' | 'CUSTODY';
  calculationMethod: 'FLAT' | 'AUM_PERCENTAGE' | 'PERFORMANCE_WITH_HWM';
  rate: number;
  currency: string;
  accruedAmount: number;
  lastCalculated: string;
}

export interface KPI {
  id: string;
  name: string;
  category: 'PERFORMANCE' | 'RISK' | 'LIQUIDITY' | 'OPERATIONAL' | 'CLIENT' | 'ESG' | 'REVENUE';
  value: number;
  target: number;
  unit: string;
  status: 'ON_TRACK' | 'WARNING' | 'CRITICAL';
  trend: 'UP' | 'DOWN' | 'STABLE';
  lastUpdated: string;
}

export interface DashboardWidget {
  id: string;
  type: 'CHART' | 'STAT' | 'TABLE' | 'MAP' | 'GAUGE';
  title: string;
  data: any;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
}

export interface WidgetConfig {
  chartType?: 'LINE' | 'BAR' | 'PIE' | 'DOUGHNUT' | 'AREA' | 'SCATTER' | 'CANDLESTICK';
  showLegend?: boolean;
  showGrid?: boolean;
  colorScheme?: string[];
  animation?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'INVESTOR' | 'ANALYST' | 'FUND_MANAGER' | 'ADMIN';
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface Wallet {
  id: string;
  address: string;
  balance: Record<string, number>;
  kycVerified: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'TRANSFER' | 'MINT' | 'BURN' | 'DIVIDEND';
  fromAddress?: string;
  toAddress?: string;
  tokenId: string;
  amount: number;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  blockchainHash?: string;
}
