import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  projection: ProjectionResult;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatCompact = (value: number) => 
  new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(value);

export const Overview: FC<Props> = ({ projection }) => {
  const firstYear = projection.yearly[0];
  const firstMonth = firstYear.months[0];
  
  // Secure Income Score: (Guaranteed Income / Essential Expenses)
  const secureIncome = firstYear.totalPension + firstYear.totalWifeSalary + firstYear.totalWifeSS + firstYear.totalYourSS;
  const secureIncomeScore = Math.min(100, (secureIncome / firstYear.totalEssentialSpending) * 100);

  // Income vs Expenses (Annual)
  const annualIncome = firstYear.totalIncome;
  const annualExpenses = firstYear.totalExpenses;
  const annTaxesPct = (firstYear.totalTaxes / annualExpenses) * 100;
  const annInsPct = (firstYear.totalInsurance / annualExpenses) * 100;
  const annEssPct = (firstYear.totalEssentialSpending / annualExpenses) * 100;
  const annDiscPct = (firstYear.totalDiscretionarySpending / annualExpenses) * 100;

  // Income vs Expenses (Monthly)
  const monthlyIncome = firstMonth.totalIncome;
  const monthlyExpenses = firstMonth.totalExpenses;
  const moTaxesPct = (firstMonth.taxes / monthlyExpenses) * 100;
  const moInsPct = (firstMonth.insurance / monthlyExpenses) * 100;
  const moEssPct = (firstMonth.essentialSpending / monthlyExpenses) * 100;
  const moDiscPct = (firstMonth.discretionarySpending / monthlyExpenses) * 100;

  // Tax Allocation
  const totalAssets = firstMonth.balance403b + firstMonth.balanceRoth;
  const taxFreePct = totalAssets > 0 ? (firstMonth.balanceRoth / totalAssets) * 100 : 0;
  const taxDeferredPct = totalAssets > 0 ? (firstMonth.balance403b / totalAssets) * 100 : 0;

  // Future View Data
  const futureData = projection.yearly.map(y => ({
    age: y.age,
    year: new Date().getFullYear() + y.yearIndex,
    assets: y.endBalance403b + y.endBalanceRoth
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Benchmarks */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1a365d] mb-6">Retirement Benchmarks</h3>
          
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span>Secure Income Score</span>
              <span className="text-[#3b82f6]">Benchmark: 80%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-4 bg-gray-200 relative">
                <div 
                  className={`absolute top-0 left-0 h-full ${secureIncomeScore >= 80 ? 'bg-[#4c8b55]' : 'bg-[#eab308]'}`} 
                  style={{ width: `${secureIncomeScore}%` }}
                ></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-red-400" style={{ left: '80%' }}></div>
              </div>
              <span className={`font-bold ${secureIncomeScore >= 80 ? 'text-[#4c8b55]' : 'text-[#eab308]'}`}>
                {secureIncomeScore.toFixed(0)}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span>403b Depletion Year</span>
              <span className="text-gray-400">Target: Never</span>
            </div>
            <div className="flex items-center space-x-3">
               <span className={`font-bold text-lg ${projection.metrics.year403bDepleted ? 'text-red-600' : 'text-[#4c8b55]'}`}>
                  {projection.metrics.year403bDepleted ? `Age ${projection.metrics.year403bDepleted}` : 'Fully Funded'}
               </span>
            </div>
          </div>
        </div>

        {/* Panel 2: Retirement Countdown */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-center">
           <h3 className="text-lg font-bold text-[#1a365d] mb-6">Retirement Target</h3>
           <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-sm font-bold text-[#1a365d]">Ron (Age {firstYear.age})</span>
              <div className="flex space-x-2">
                 <div className="bg-[#6b7280] text-white px-3 py-2 text-xl font-bold rounded-sm">0</div>
                 <div className="bg-[#6b7280] text-white px-3 py-2 text-xl font-bold rounded-sm">0</div>
                 <div className="bg-[#6b7280] text-white px-3 py-2 text-xl font-bold rounded-sm">0</div>
              </div>
           </div>
           <div className="flex justify-between items-center pt-4">
              <span className="text-sm font-bold text-[#1a365d]">Wife (Age {firstYear.age + 4})</span>
              <span className="text-sm text-gray-500 italic">Working 1 more year</span>
           </div>
        </div>

        {/* Panel 3: Annual Income vs Expenses */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-[#1a365d] leading-tight">
              Annual Income <br/> vs. Expenses <br/>
              <span className="text-2xl text-[#4c8b55]">{formatCurrency(annualIncome - annualExpenses)}</span>
            </h3>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold text-[#1a365d] mb-1">Annual Income: {formatCurrency(annualIncome)}</div>
            <div className="h-6 bg-[#4c8b55] w-full"></div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#1a365d] mb-1">Annual Expenses: {formatCurrency(annualExpenses)}</div>
            <div className="h-6 w-full flex">
              <div className="bg-[#fca5a5] h-full" style={{ width: `${annInsPct}%` }} title="Insurance"></div>
              <div className="bg-[#f87171] h-full" style={{ width: `${annTaxesPct}%` }} title="Taxes"></div>
              <div className="bg-[#b91c1c] h-full" style={{ width: `${annEssPct}%` }} title="Essential"></div>
              <div className="bg-[#7f1d1d] h-full" style={{ width: `${annDiscPct}%` }} title="Discretionary"></div>
            </div>
            <div className="flex text-[10px] space-x-3 mt-2 text-gray-500 font-medium">
              <span className="flex items-center"><span className="w-2 h-2 bg-[#fca5a5] inline-block mr-1"></span> Insurance</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#f87171] inline-block mr-1"></span> Taxes</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#b91c1c] inline-block mr-1"></span> Essential</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#7f1d1d] inline-block mr-1"></span> Discretionary</span>
            </div>
          </div>
        </div>

        {/* Panel 4: Monthly Income vs Expenses */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-[#1a365d] leading-tight">
              Monthly Income <br/> vs. Expenses <br/>
              <span className="text-2xl text-[#4c8b55]">{formatCurrency(monthlyIncome - monthlyExpenses)}</span>
            </h3>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold text-[#1a365d] mb-1">Monthly Income: {formatCurrency(monthlyIncome)}</div>
            <div className="h-6 bg-[#4c8b55] w-full"></div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#1a365d] mb-1">Monthly Expenses: {formatCurrency(monthlyExpenses)}</div>
            <div className="h-6 w-full flex">
              <div className="bg-[#fca5a5] h-full" style={{ width: `${moInsPct}%` }}></div>
              <div className="bg-[#f87171] h-full" style={{ width: `${moTaxesPct}%` }}></div>
              <div className="bg-[#b91c1c] h-full" style={{ width: `${moEssPct}%` }}></div>
              <div className="bg-[#7f1d1d] h-full" style={{ width: `${moDiscPct}%` }}></div>
            </div>
            <div className="flex text-[10px] space-x-3 mt-2 text-gray-500 font-medium">
              <span className="flex items-center"><span className="w-2 h-2 bg-[#fca5a5] inline-block mr-1"></span> Insurance</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#f87171] inline-block mr-1"></span> Taxes</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#b91c1c] inline-block mr-1"></span> Essential</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#7f1d1d] inline-block mr-1"></span> Discretionary</span>
            </div>
          </div>
        </div>

        {/* Panel 5: Tax Allocation & Net Worth */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-4">Net Worth</h3>
              <p className="text-3xl font-bold text-[#4c8b55] mb-4">{formatCurrency(totalAssets)}</p>
           </div>
           
           <div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-2">Liquid Asset Tax Allocation</h3>
              <div className="h-6 w-full flex mb-2">
                 <div className="bg-[#4c8b55] h-full border-r border-white" style={{ width: `${taxFreePct}%` }}></div>
                 <div className="bg-[#7c3aed] h-full border-r border-white" style={{ width: `${taxDeferredPct}%` }}></div>
                 <div className="bg-[#3b82f6] h-full" style={{ width: '0%' }}></div>
              </div>
              <div className="flex text-[10px] space-x-4 text-gray-500 font-medium">
                 <span className="flex items-center"><span className="w-2 h-2 bg-[#4c8b55] inline-block mr-1"></span> Tax Free (Roth): {taxFreePct.toFixed(0)}%</span>
                 <span className="flex items-center"><span className="w-2 h-2 bg-[#7c3aed] inline-block mr-1"></span> Tax Deferred (403b): {taxDeferredPct.toFixed(0)}%</span>
                 <span className="flex items-center"><span className="w-2 h-2 bg-[#3b82f6] inline-block mr-1"></span> Taxable: 0%</span>
              </div>
           </div>
        </div>

        {/* Panel 6: Future View */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-4">Future View (Total Assets)</h3>
           <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={futureData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4c8b55" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4c8b55" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                     dataKey="year" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fill: '#6b7280' }} 
                     dy={10}
                     interval="preserveStartEnd"
                     minTickGap={30}
                  />
                  <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fill: '#6b7280' }} 
                     tickFormatter={formatCompact}
                     dx={-10}
                  />
                  <Tooltip 
                     formatter={(value: any) => [formatCurrency(value), 'Total Assets']}
                     labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Area type="monotone" dataKey="assets" stroke="#4c8b55" fillOpacity={1} fill="url(#colorAssets)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};
