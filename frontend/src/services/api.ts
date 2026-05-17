import axios from 'axios';
import type { FinancialProduct, TokenizedAsset, Portfolio, KPI, DashboardWidget, Transaction } from '@/types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productsApi = {
  getAll: async (assetClass?: string): Promise<FinancialProduct[]> => {
    const params = assetClass ? { asset_class: assetClass } : {};
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id: string): Promise<FinancialProduct> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: Partial<FinancialProduct>): Promise<FinancialProduct> => {
    const response = await api.post('/products', product);
    return response.data;
  },
};

export const tokensApi = {
  getAll: async (): Promise<TokenizedAsset[]> => {
    const response = await api.get('/tokens');
    return response.data;
  },
  
  getById: async (id: string): Promise<TokenizedAsset> => {
    const response = await api.get(`/tokens/${id}`);
    return response.data;
  },
  
  transfer: async (tokenId: string, toAddress: string, amount: number): Promise<any> => {
    const response = await api.post(`/tokens/${tokenId}/transfer`, { to_address: toAddress, amount });
    return response.data;
  },
  
  getTransactions: async (walletId: string): Promise<Transaction[]> => {
    const response = await api.get(`/wallets/${walletId}/transactions`);
    return response.data;
  },
};

export const portfolioApi = {
  getByInvestor: async (investorId: string): Promise<Portfolio> => {
    const response = await api.get(`/portfolios/investor/${investorId}`);
    return response.data;
  },
  
  getPerformance: async (portfolioId: string): Promise<any> => {
    const response = await api.get(`/portfolios/${portfolioId}/performance`);
    return response.data;
  },
};

export const analyticsApi = {
  getKPIs: async (category?: string): Promise<KPI[]> => {
    const params = category ? { category } : {};
    const response = await api.get('/analytics/kpis', { params });
    return response.data;
  },
  
  recordMetric: async (metricData: any): Promise<any> => {
    const response = await api.post('/analytics/metrics', metricData);
    return response.data;
  },
  
  getTrends: async (metricName: string, period: string): Promise<any> => {
    const response = await api.get(`/analytics/trends/${metricName}`, { params: { period } });
    return response.data;
  },
};

export const dashboardApi = {
  getByRole: async (role: string): Promise<DashboardWidget[]> => {
    const response = await api.get(`/dashboards/role/${role}`);
    return response.data;
  },
  
  getWidgetData: async (widgetId: string): Promise<any> => {
    const response = await api.get(`/dashboards/widgets/${widgetId}/data`);
    return response.data;
  },
  
  export: async (dashboardId: string, format: 'PDF' | 'CSV' | 'PNG'): Promise<Blob> => {
    const response = await api.post(`/dashboards/${dashboardId}/export`, { format }, { responseType: 'blob' });
    return response.data;
  },
};

export const feesApi = {
  calculate: async (productId: string, method: string): Promise<any> => {
    const response = await api.post('/fees/calculate', { product_id: productId, method });
    return response.data;
  },
  
  getAccrued: async (productId: string): Promise<any> => {
    const response = await api.get(`/fees/${productId}/accrued`);
    return response.data;
  },
};

export default api;
