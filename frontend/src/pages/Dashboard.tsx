import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { StatCard, ChartCard, Badge, LoadingSpinner } from '@/components/ui';
import { CustomLineChart, CustomBarChart, CustomPieChart, CustomAreaChart } from '@/components/charts';
import { useAppStore } from '@/hooks/useStore';
import { dashboardApi, analyticsApi, portfolioApi } from '@/services/api';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  Shield, 
  Globe, 
  Award,
  Activity
} from 'lucide-react';
import type { KPI, DashboardWidget } from '@/types';

const InvestorDashboard: React.FC = () => {
  const { user, setPortfolio } = useAppStore();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock data - in production, fetch from API
  const portfolioData = {
    totalValue: 125750.50,
    dailyChange: 2.34,
    allocations: [
      { name: 'Stocks', value: 45000 },
      { name: 'Bonds', value: 30000 },
      { name: 'Crypto', value: 25000 },
      { name: 'Real Estate', value: 15000 },
      { name: 'Commodities', value: 10750.50 },
    ],
    performance: [
      { date: 'Jan', value: 100000 },
      { date: 'Feb', value: 105000 },
      { date: 'Mar', value: 102000 },
      { date: 'Apr', value: 110000 },
      { date: 'May', value: 115000 },
      { date: 'Jun', value: 120000 },
      { date: 'Jul', value: 125750.50 },
    ],
  };
  
  const assetPerformance = [
    { name: 'EM Stocks', value: 15.2, color: '#0ea5e9' },
    { name: 'EM Bonds', value: 8.5, color: '#10b981' },
    { name: 'Crypto', value: -5.3, color: '#ef4444' },
    { name: 'Real Estate', value: 12.1, color: '#f59e0b' },
    { name: 'Commodities', value: 6.8, color: '#d946ef' },
  ];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          const [kpiData, portfolioData] = await Promise.all([
            analyticsApi.getKPIs(),
            portfolioApi.getByInvestor(user.id).catch(() => null),
          ]);
          setKpis(kpiData);
          if (portfolioData) setPortfolio(portfolioData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Investor'}!
            </h1>
            <p className="text-gray-500 mt-1">
              Here's your portfolio overview for today
            </p>
          </div>
          <Badge variant="success">Portfolio Up 2.34%</Badge>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Portfolio Value"
            value={`$${portfolioData.totalValue.toLocaleString()}`}
            change={portfolioData.dailyChange}
            icon={<DollarSign size={24} />}
          />
          <StatCard
            title="Total Return"
            value="$25,750.50"
            change={25.75}
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            title="Assets Held"
            value="12"
            icon={<PieChart size={24} />}
          />
          <StatCard
            title="Tokenized Assets"
            value="5"
            icon={<Wallet size={24} />}
          />
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Portfolio Performance">
            <CustomLineChart
              data={portfolioData.performance}
              dataKey="value"
              nameKey="date"
              color="#0ea5e9"
            />
          </ChartCard>
          
          <ChartCard title="Asset Allocation">
            <CustomPieChart
              data={portfolioData.allocations}
              dataKey="value"
              nameKey="name"
            />
          </ChartCard>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Asset Performance (%)" className="lg:col-span-2">
            <CustomBarChart
              data={assetPerformance}
              dataKey="value"
              nameKey="name"
            />
          </ChartCard>
          
          <ChartCard title="ESG Score">
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="75, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">A</span>
                  <span className="text-sm text-gray-500">ESG Rating</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Your portfolio has excellent ESG compliance
              </p>
            </div>
          </ChartCard>
        </div>
        
        {/* Recent Activity */}
        <ChartCard title="Recent Transactions">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Asset</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2024-01-15', asset: 'EM Equity Fund', type: 'Buy', amount: '$5,000', status: 'Completed' },
                  { date: '2024-01-14', asset: 'Brazil Bond ETF', type: 'Buy', amount: '$3,000', status: 'Completed' },
                  { date: '2024-01-13', asset: 'Tokenized Real Estate', type: 'Dividend', amount: '$150', status: 'Completed' },
                  { date: '2024-01-12', asset: 'Crypto Index', type: 'Sell', amount: '$2,000', status: 'Pending' },
                ].map((tx, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{tx.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{tx.asset}</td>
                    <td className="py-3 px-4">
                      <Badge variant={tx.type === 'Buy' ? 'success' : tx.type === 'Sell' ? 'danger' : 'info'}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{tx.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant={tx.status === 'Completed' ? 'success' : 'warning'}>
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;
