import type { FC } from 'react';
import type { ProjectionResult } from '../projection';

interface Props {
  projection: ProjectionResult;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const DataTable: FC<Props> = ({ projection }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Projected 30-Year Table</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Pension</th>
                <th className="px-4 py-3">Wife Salary</th>
                <th className="px-4 py-3">Wife SS</th>
                <th className="px-4 py-3">Your SS</th>
                <th className="px-4 py-3">Insurance</th>
                <th className="px-4 py-3">Net Income</th>
                <th className="px-4 py-3">Spending</th>
                <th className="px-4 py-3 text-red-600">Shortfall</th>
                <th className="px-4 py-3 text-blue-600">403b End</th>
                <th className="px-4 py-3 text-purple-600">Roth End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projection.yearly.map((y) => (
                <tr key={y.age} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{y.age}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalPension)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalWifeSalary)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalWifeSS)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalYourSS)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalInsurance)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(y.totalIncome - y.totalInsurance)}</td>
                  <td className="px-4 py-3">{formatCurrency(y.totalSpending)}</td>
                  <td className="px-4 py-3 font-medium text-red-600">{formatCurrency(y.totalGap)}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">{formatCurrency(y.endBalance403b)}</td>
                  <td className="px-4 py-3 font-medium text-purple-600">{formatCurrency(y.endBalanceRoth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
