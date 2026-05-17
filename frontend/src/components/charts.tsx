import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: any[];
  dataKey: string;
  nameKey?: string;
  title?: string;
  color?: string;
  showGrid?: boolean;
}

export const CustomLineChart: React.FC<LineChartProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  color = '#0ea5e9',
  showGrid = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          dataKey={nameKey} 
          stroke="#9ca3af" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface BarChartProps {
  data: any[];
  dataKey: string;
  nameKey?: string;
  colors?: string[];
}

export const CustomBarChart: React.FC<BarChartProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  colors = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444'],
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey={nameKey} 
          stroke="#9ca3af" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
}

export const CustomPieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  colors = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(entry) => `${entry.name}: ${((entry.value / data.reduce((a: any, b: any) => a + b.value, 0)) * 100).toFixed(1)}%`}
          fill="#8884d8"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface AreaChartProps {
  data: any[];
  dataKeys: string[];
  nameKey?: string;
  colors?: string[];
}

export const CustomAreaChart: React.FC<AreaChartProps> = ({
  data,
  dataKeys,
  nameKey = 'name',
  colors = ['#0ea5e9', '#d946ef'],
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey={nameKey} 
          stroke="#9ca3af" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};
