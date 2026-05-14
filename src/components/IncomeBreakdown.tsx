import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface Props {
  projection: ProjectionResult;
}

export const IncomeBreakdown: FC<Props> = ({ projection }) => {
  const data = projection.yearly.map(y => ({
    age: y.age,
    Pension: y.totalPension,
    'Wife Salary': y.totalWifeSalary,
    'Wife SS': y.totalWifeSS,
    'Your SS': y.totalYourSS,
    Spending: y.totalExpenses // The prompt asks for an "Overlay spending line"
  }));

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="p-6 h-[600px]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Income Breakdown vs Spending</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Bar dataKey="Pension" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Wife Salary" stackId="a" fill="#10b981" />
            <Bar dataKey="Wife SS" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Your SS" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Spending" stroke="#ef4444" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
