import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  projection: ProjectionResult;
}

export const FundingSource: FC<Props> = ({ projection }) => {
  const data = projection.yearly.map(y => ({
    age: y.age,
    '403b Withdrawals': y.totalWithdrawal403b,
    'Roth Withdrawals': y.totalWithdrawalRoth,
  }));

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="p-6 h-[600px]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Funding Source for Shortfall</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
            <YAxis 
              tickFormatter={(value) => `$${value / 1000}k`} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#6b7280' }} 
            />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Legend />
            <Area type="monotone" dataKey="403b Withdrawals" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
            <Area type="monotone" dataKey="Roth Withdrawals" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
