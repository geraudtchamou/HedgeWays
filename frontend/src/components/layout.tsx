import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  PieChart, 
  Wallet, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  User,
  Shield,
  Briefcase,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '@/hooks/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['INVESTOR', 'ANALYST', 'FUND_MANAGER', 'ADMIN'] },
  { icon: <PieChart size={20} />, label: 'Products', path: '/products', roles: ['INVESTOR', 'ANALYST', 'FUND_MANAGER', 'ADMIN'] },
  { icon: <Wallet size={20} />, label: 'Portfolio', path: '/portfolio', roles: ['INVESTOR', 'ANALYST', 'FUND_MANAGER'] },
  { icon: <TrendingUp size={20} />, label: 'Tokens', path: '/tokens', roles: ['INVESTOR', 'ANALYST', 'FUND_MANAGER', 'ADMIN'] },
  { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics', roles: ['ANALYST', 'FUND_MANAGER', 'ADMIN'] },
  { icon: <Briefcase size={20} />, label: 'Fees', path: '/fees', roles: ['FUND_MANAGER', 'ADMIN'] },
  { icon: <Shield size={20} />, label: 'Compliance', path: '/compliance', roles: ['FUND_MANAGER', 'ADMIN'] },
  { icon: <Settings size={20} />, label: 'Settings', path: '/settings', roles: ['ADMIN'] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const cn = (...inputs: any[]) => twMerge(clsx(inputs));
  const { user, logout, currentTheme } = useAppStore();
  const [activePath, setActivePath] = useState('/');
  
  const filteredNavItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );
  
  return (
    <>
      {/* Mobile overlay */}
      {!isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200',
          'lg:translate-x-0 lg:static',
          !isOpen && 'hidden'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">EM Invest</h1>
                  <p className="text-xs text-gray-500">Emerging Markets Platform</p>
                </div>
              </div>
              <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={() => {
                      setActivePath(item.path);
                      onClose?.();
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                      activePath === item.path
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="text-primary-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const cn = (...inputs: any[]) => twMerge(clsx(inputs));
  const { user } = useAppStore();
  
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products, tokens..."
              className="pl-10 pr-4 py-2 w-80 input-field"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Market Open</span>
          </div>
        </div>
      </div>
    </header>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
