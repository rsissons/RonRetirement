import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, Target, TrendingUp } from 'lucide-react';

interface Props {
  projection: ProjectionResult;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const Overview: FC<Props> = ({ projection }) => {
  const firstYear = projection.yearly[0];
  const firstMonth = firstYear.months[0];
  
  // Data for Asset Allocation
  const assetData = [
    { name: '403b', value: firstMonth.balance403b, color: '#15325b' },
    { name: 'Roth', value: firstMonth.balanceRoth, color: '#f97316' },
  ].filter(d => d.value > 0);
  
  // If no assets yet, just show a blank or default
  if (assetData.length === 0) {
    assetData.push({ name: 'Empty', value: 1, color: '#e5e7eb' });
  }

  // Calculate goal achieved roughly based on Roth balance at 85 vs a 1M goal
  const goalTarget = 1000000;
  const goalAchievedPct = Math.min(100, Math.max(0, (projection.metrics.rothBalanceAt85 / goalTarget) * 100));
  
  const goalData = [
    { name: 'Achieved', value: goalAchievedPct, color: '#f97316' },
    { name: 'Remaining', value: 100 - goalAchievedPct, color: '#fed7aa' },
  ];

  return (
    <div className="p-6">
      
      {/* Top Banner Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-[#f97316] px-6 py-3">
          <h2 className="text-white font-bold text-lg flex items-center space-x-2">
            <ShieldCheck size={20} />
            <span>Retirement Income & Strategy Overview</span>
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-center">
          <div className="px-4">
            <p className="text-sm font-medium text-gray-500 mb-1">Starting Account Balance</p>
            <p className="text-3xl font-bold text-[#15325b]">{formatCurrency(firstMonth.balance403b + firstMonth.balanceRoth)}</p>
            <p className="text-xs text-gray-400 mt-2">Combined 403b & Roth</p>
          </div>
          <div className="px-4 pt-4 md:pt-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Long-term Goal Achieved</p>
            <p className="text-3xl font-bold text-[#15325b]">{goalAchievedPct.toFixed(0)}%</p>
            <p className="text-xs text-gray-400 mt-2">Based on $1M Roth at age 85</p>
          </div>
          <div className="px-4 pt-4 md:pt-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Est. Starting Monthly Income</p>
            <p className="text-3xl font-bold text-[#15325b]">{formatCurrency(firstMonth.totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-2">Pension + SS + Other</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Goal Achievement Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-[#15325b] px-4 py-2">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <Target size={16} />
              <span>Goal Achievement</span>
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {goalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `${val.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-800">{goalAchievedPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Asset Allocation Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-[#15325b] px-4 py-2">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <TrendingUp size={16} />
              <span>Initial Asset Allocation</span>
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
           <div className="bg-[#15325b] px-4 py-2">
            <h3 className="text-white font-medium">Key Metrics</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Lifetime Pension Income</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(projection.metrics.lifetimePension)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Lifetime SS Income</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(projection.metrics.lifetimeSS)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Roth Conversions</p>
              <p className="text-2xl font-bold text-[#f97316]">
                {formatCurrency(projection.yearly.reduce((sum, y) => sum + y.totalConversionToRoth, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Year 403b Depleted</p>
              <p className={`text-xl font-bold ${projection.metrics.year403bDepleted ? 'text-red-600' : 'text-emerald-600'}`}>
                {projection.metrics.year403bDepleted ? `Age ${projection.metrics.year403bDepleted}` : 'Never'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
