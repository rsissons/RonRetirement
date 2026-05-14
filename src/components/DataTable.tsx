import { useState } from 'react';
import type { FC } from 'react';
import type { ProjectionResult } from '../projection';

interface Props {
  projection: ProjectionResult;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const DataTable: FC<Props> = ({ projection }) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');

  const yearlyRows = projection.yearly;
  const monthlyRows = projection.yearly.flatMap(y => y.months);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projected 30-Year Table</h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Yearly
          </button>
          <button 
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Age {viewMode === 'monthly' && '(Mo)'}</th>
                <th className="px-4 py-3">Pension</th>
                <th className="px-4 py-3">Wife Salary</th>
                <th className="px-4 py-3">Wife SS</th>
                <th className="px-4 py-3">Your SS</th>
                <th className="px-4 py-3">Insurance</th>
                <th className="px-4 py-3 text-[#D55E00]">Taxes</th>
                <th className="px-4 py-3 font-bold text-[#009E73]">Net Income</th>
                <th className="px-4 py-3">Essential</th>
                <th className="px-4 py-3">Discretionary</th>
                <th className="px-4 py-3 text-[#D55E00]">Surplus/Shortfall</th>
                <th className="px-4 py-3 text-[#56B4E9]">403b End</th>
                <th className="px-4 py-3 text-[#0072B2]">Roth End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {viewMode === 'yearly' && yearlyRows.map((y) => (
                <tr key={`y-${y.age}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{y.age}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalPension)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalWifeSalary)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalWifeSS)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalYourSS)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalInsurance)}</td>
                  <td className="px-4 py-3 text-[#D55E00]">{formatCurrency(y.totalTaxes)}</td>
                  <td className="px-4 py-3 font-bold bg-[#009E73]/10 text-[#009E73]">{formatCurrency(y.totalNetIncome)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalEssentialSpending)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalDiscretionarySpending)}</td>
                  <td className={`px-4 py-3 font-medium ${y.totalGap > 0 ? 'text-[#D55E00]' : 'text-[#009E73]'}`}>
                    {y.totalGap > 0 ? formatCurrency(y.totalGap) : formatCurrency(-y.totalGap)}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#56B4E9]">{formatCurrency(y.endBalance403b)}</td>
                  <td className="px-4 py-3 font-medium text-[#0072B2]">{formatCurrency(y.endBalanceRoth)}</td>
                </tr>
              ))}
              
              {viewMode === 'monthly' && monthlyRows.map((m, idx) => (
                <tr key={`m-${idx}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.age} ({m.monthIndex + 1})</td>
                  <td className="px-4 py-3">{formatCurrency(m.pension)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.wifeSalary)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.wifeSS)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.yourSS)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.insurance)}</td>
                  <td className="px-4 py-3 text-[#D55E00]">{formatCurrency(m.taxes)}</td>
                  <td className="px-4 py-3 font-bold bg-[#009E73]/10 text-[#009E73]">{formatCurrency(m.netIncome)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.essentialSpending)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.discretionarySpending)}</td>
                  <td className={`px-4 py-3 font-medium ${m.gap > 0 ? 'text-[#D55E00]' : 'text-[#009E73]'}`}>
                    {m.gap > 0 ? formatCurrency(m.gap) : formatCurrency(-m.gap)}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#56B4E9]">{formatCurrency(m.balance403b)}</td>
                  <td className="px-4 py-3 font-medium text-[#0072B2]">{formatCurrency(m.balanceRoth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
