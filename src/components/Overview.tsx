import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import { Wallet, TrendingDown, TrendingUp, PiggyBank, Landmark } from 'lucide-react';

interface Props {
  projection: ProjectionResult;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const Overview: FC<Props> = ({ projection }) => {
  const firstYear = projection.yearly[0];
  const firstMonth = firstYear.months[0];
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Retirement Overview (Initial Month)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Net Income</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(firstMonth.totalIncome)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Spending (Incl. Ins.)</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(firstMonth.totalExpenses)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Monthly Gap</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(firstMonth.gap)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <PiggyBank size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">403b Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(firstMonth.balance403b)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Roth Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(firstMonth.balanceRoth)}</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lifetime Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total 403b Withdrawn" value={formatCurrency(projection.metrics.total403bWithdrawn)} />
        <MetricCard title="Total Roth Withdrawn" value={formatCurrency(projection.metrics.totalRothWithdrawn)} />
        <MetricCard title="Peak Roth Balance" value={formatCurrency(projection.metrics.peakRothBalance)} />
        <MetricCard title="Roth Balance at 85" value={formatCurrency(projection.metrics.rothBalanceAt85)} />
        <MetricCard title="Lifetime Pension Income" value={formatCurrency(projection.metrics.lifetimePension)} />
        <MetricCard title="Lifetime SS Income" value={formatCurrency(projection.metrics.lifetimeSS)} />
        <MetricCard 
          title="Year 403b Depleted" 
          value={projection.metrics.year403bDepleted ? `Age ${projection.metrics.year403bDepleted}` : 'Never'} 
          highlight={!!projection.metrics.year403bDepleted}
        />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, highlight = false }: { title: string, value: string, highlight?: boolean }) => (
  <div className={`p-5 rounded-xl shadow-sm border ${highlight ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
    <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
    <p className={`text-xl font-bold ${highlight ? 'text-orange-700' : 'text-gray-900'}`}>{value}</p>
  </div>
);
