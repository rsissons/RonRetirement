import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  projection: ProjectionResult;
}

export const AccountBalances: FC<Props> = ({ projection }) => {
  const data = projection.yearly.map(y => ({
    age: y.age,
    '403b Balance': y.endBalance403b,
    'Roth Balance': y.endBalanceRoth,
  }));

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="p-6 h-[600px]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Balances Over Time</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Line type="monotone" dataKey="403b Balance" stroke="#3b82f6" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Roth Balance" stroke="#8b5cf6" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
