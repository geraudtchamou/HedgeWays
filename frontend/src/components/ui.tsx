import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  className 
}) => {
  const cn = (...inputs: any[]) => twMerge(clsx(inputs));
  
  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-danger" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };
  
  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-gray-400';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('card stat-card', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {getChangeIcon(change)}
              <span className={cn('text-sm font-medium', getChangeColor(change))}>
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children, 
  className,
  headerAction 
}) => {
  const cn = (...inputs: any[]) => twMerge(clsx(inputs));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('card', className)}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </motion.div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  className 
}) => {
  const cn = (...inputs: any[]) => twMerge(clsx(inputs));
  
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className 
}) => {
  const cn = (...inputs: any[]) => twMerge(clsx(inputs));
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-primary-600', sizes[size])} />
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="card animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
  </div>
);
