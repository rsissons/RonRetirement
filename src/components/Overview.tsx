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

  // Find RMD projected balances at age 75
  const yearAt75 = projection.yearly.find(y => y.age === 75);
  const rmdBalance = yearAt75 ? yearAt75.endBalance403b : 0;
  // Standard IRS Uniform Lifetime Table roughly starts at 27.4 divisor at age 75 (approx 3.65%)
  const rmdEstimate = rmdBalance > 0 ? rmdBalance / 24.6 : 0;

  const totalBuckets = projection.metrics.bucketIncome + projection.metrics.bucketConservative + projection.metrics.bucketModerate;
  const growthBucket = totalAssets - totalBuckets;

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
              <span className="text-gray-400">Benchmark: 80%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-4 bg-gray-200 relative">
                <div 
                  className={`absolute top-0 left-0 h-full ${secureIncomeScore >= 80 ? 'bg-[#4c8b55]' : 'bg-[#eab308]'}`} 
                  style={{ width: `${secureIncomeScore}%` }}
                ></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-gray-400" style={{ left: '80%' }}></div>
              </div>
              <span className={`font-bold w-12 text-right ${secureIncomeScore >= 80 ? 'text-[#4c8b55]' : 'text-[#eab308]'}`}>
                {secureIncomeScore.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span>Safe Withdrawal Rate</span>
              <span className="text-gray-400">Benchmark: 4%</span>
            </div>
            <div className="flex items-center space-x-3">
               <div className="flex-1 h-4 bg-gray-200 relative">
                <div 
                  className={`absolute top-0 left-0 h-full ${projection.metrics.safeWithdrawalRate <= 4 ? 'bg-[#4c8b55]' : 'bg-[#eab308]'}`} 
                  style={{ width: `${Math.min(100, (projection.metrics.safeWithdrawalRate / 10) * 100)}%` }}
                ></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-gray-400" style={{ left: '40%' }}></div>
              </div>
               <span className={`font-bold w-12 text-right ${projection.metrics.safeWithdrawalRate <= 4 ? 'text-[#4c8b55]' : 'text-[#eab308]'}`}>
                  {projection.metrics.safeWithdrawalRate.toFixed(1)}%
               </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span>Debt to Asset Ratio</span>
              <span className="text-gray-400">Benchmark: 20%</span>
            </div>
            <div className="flex items-center space-x-3">
               <div className="flex-1 h-4 bg-gray-200 relative">
                <div className="absolute top-0 left-0 h-full bg-[#4c8b55]" style={{ width: `0%` }}></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-gray-400" style={{ left: '20%' }}></div>
              </div>
               <span className="font-bold w-12 text-right text-[#4c8b55]">0%</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Retirement Countdown */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-6">Retirement Countdown</h3>
           <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-sm font-bold text-[#1a365d] w-1/2 text-right pr-4">Ron (Age {firstYear.age})</span>
              <div className="flex space-x-2 w-1/2">
                 <div className="flex flex-col items-center"><div className="bg-[#6b7280] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">0</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">YEARS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#6b7280] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">0</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">MONTHS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#6b7280] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">0</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">DAYS</span></div>
              </div>
           </div>
           <div className="flex justify-between items-center pt-4">
              <span className="text-sm font-bold text-[#1a365d] w-1/2 text-right pr-4">Wife (Age {firstYear.age + 4})</span>
              <div className="flex space-x-2 w-1/2">
                 <div className="flex flex-col items-center"><div className="bg-[#9ca3af] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">1</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">YEARS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#9ca3af] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">0</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">MONTHS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#9ca3af] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">0</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">DAYS</span></div>
              </div>
           </div>
        </div>

        {/* Panel 3: Annual Income vs Expenses */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-[#1a365d] leading-tight w-1/2">
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
              <div className="bg-[#f87171] h-full border-l border-white/20" style={{ width: `${annTaxesPct}%` }} title="Taxes"></div>
              <div className="bg-[#b91c1c] h-full border-l border-white/20" style={{ width: `${annEssPct}%` }} title="Essential"></div>
              <div className="bg-[#7f1d1d] h-full border-l border-white/20" style={{ width: `${annDiscPct}%` }} title="Discretionary"></div>
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
            <h3 className="text-lg font-bold text-[#1a365d] leading-tight w-1/2">
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
              <div className="bg-[#f87171] h-full border-l border-white/20" style={{ width: `${moTaxesPct}%` }}></div>
              <div className="bg-[#b91c1c] h-full border-l border-white/20" style={{ width: `${moEssPct}%` }}></div>
              <div className="bg-[#7f1d1d] h-full border-l border-white/20" style={{ width: `${moDiscPct}%` }}></div>
            </div>
            <div className="flex text-[10px] space-x-3 mt-2 text-gray-500 font-medium">
              <span className="flex items-center"><span className="w-2 h-2 bg-[#fca5a5] inline-block mr-1"></span> Insurance</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#f87171] inline-block mr-1"></span> Taxes</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#b91c1c] inline-block mr-1"></span> Essential</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#7f1d1d] inline-block mr-1"></span> Discretionary</span>
            </div>
          </div>
        </div>

        {/* Panel 5: Liquid Asset Risk Allocation */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-8">Liquid Asset Risk Allocation</h3>
           <div className="h-6 w-full flex mb-2">
              <div className="bg-[#4c8b55] h-full border-r border-white" style={{ width: '0%' }}></div>
              <div className="bg-[#a7f3d0] h-full border-r border-white" style={{ width: '0%' }}></div>
              <div className="bg-[#f87171] h-full border-r border-white" style={{ width: '20%' }}></div>
              <div className="bg-[#b91c1c] h-full" style={{ width: '80%' }}></div>
           </div>
           <div className="flex text-[10px] space-x-4 text-gray-500 font-medium justify-between px-2">
              <span className="flex items-center"><span className="w-2 h-2 bg-[#4c8b55] inline-block mr-1"></span> Emergency: 0%</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#a7f3d0] inline-block mr-1"></span> Low: 0%</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#f87171] inline-block mr-1"></span> Medium: 20%</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#b91c1c] inline-block mr-1"></span> Aggressive: 80%</span>
           </div>
        </div>

        {/* Panel 6: Liquid Asset Tax Allocation */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-8">Liquid Asset Tax Allocation</h3>
           <div className="h-6 w-full flex mb-2">
              <div className="bg-[#4c8b55] h-full border-r border-white" style={{ width: `${taxFreePct}%` }}></div>
              <div className="bg-[#3b82f6] h-full border-r border-white" style={{ width: '0%' }}></div>
              <div className="bg-[#7c3aed] h-full" style={{ width: `${taxDeferredPct}%` }}></div>
           </div>
           <div className="flex text-[10px] space-x-4 text-gray-500 font-medium justify-between px-2">
              <span className="flex items-center"><span className="w-2 h-2 bg-[#4c8b55] inline-block mr-1"></span> Tax Free: {taxFreePct.toFixed(0)}%</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#3b82f6] inline-block mr-1"></span> Taxable: 0%</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-[#7c3aed] inline-block mr-1"></span> Tax Deferred: {taxDeferredPct.toFixed(0)}%</span>
           </div>
        </div>

        {/* Panel 7: Net Worth */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-2">Net Worth</h3>
              <p className="text-3xl font-bold text-[#4c8b55] mb-6">{formatCurrency(totalAssets)}</p>
           </div>
           
           <div>
              <div className="text-xs font-bold text-[#1a365d] mb-1">Assets: {formatCurrency(totalAssets)}</div>
              <div className="h-6 w-full flex mb-2">
                 <div className="bg-[#a7f3d0] h-full border-r border-white" style={{ width: '100%' }}></div>
                 <div className="bg-[#4c8b55] h-full border-r border-white" style={{ width: '0%' }}></div>
                 <div className="bg-[#15325b] h-full" style={{ width: '0%' }}></div>
              </div>
              <div className="flex text-[10px] space-x-4 text-gray-500 font-medium mb-4">
                 <span className="flex items-center"><span className="w-2 h-2 bg-[#a7f3d0] inline-block mr-1"></span> Liquid: {formatCompact(totalAssets)}</span>
                 <span className="flex items-center"><span className="w-2 h-2 bg-[#4c8b55] inline-block mr-1"></span> Real: 0</span>
                 <span className="flex items-center"><span className="w-2 h-2 bg-[#15325b] inline-block mr-1"></span> Other: 0</span>
              </div>

              <div className="text-xs font-bold text-[#1a365d] mb-1">Liabilities: $0</div>
              <div className="h-6 w-full flex mb-2">
                 <div className="bg-[#7f1d1d] h-full w-12"></div>
              </div>
           </div>
        </div>

        {/* Panel 8: Required Minimum Distributions */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-6 w-1/2">Required<br/>Minimum<br/>Distributions</h3>
           
           <div className="flex justify-between border-b border-gray-100 pb-2 mb-4">
              <span className="text-[10px] font-bold text-[#1a365d] uppercase">Name (RMD Year)</span>
           </div>

           <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-[#1a365d]">Ron ({new Date().getFullYear() + (75 - firstYear.age)})</span>
              <span className={`text-xl font-bold ${rmdEstimate > 0 ? 'text-[#4c8b55]' : 'text-gray-400'}`}>
                 {rmdEstimate > 0 ? formatCurrency(rmdEstimate) : '$0'}
              </span>
           </div>

           <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#1a365d]">Wife ({new Date().getFullYear() + (75 - (firstYear.age + 4))})</span>
              <span className="text-xl font-bold text-gray-400">$0</span>
           </div>
        </div>

        {/* Panel 9: Future View */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-4">Future View</h3>
           <div className="h-48 w-full -ml-4">
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
                     angle={-45}
                     textAnchor="end"
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

        {/* Panel 10: Buckets */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-8">Buckets</h3>
           
           <div className="flex justify-between items-end h-32 px-4 space-x-2">
              
              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(projection.metrics.bucketIncome)}</span>
                 <div className="w-full bg-white border border-gray-200 relative h-full flex items-end">
                    <div className="w-full bg-[#4c8b55] absolute bottom-0" style={{ height: '5px' }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2">Income</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(projection.metrics.bucketConservative)}</span>
                 <div className="w-full bg-white border border-gray-200 relative h-full flex items-end">
                    <div className="w-full bg-[#4c8b55] absolute bottom-0" style={{ height: '5px' }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2">Conservative</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(projection.metrics.bucketModerate)}</span>
                 <div className="w-full bg-white border border-gray-200 relative h-full flex items-end">
                    <div className="w-full bg-[#4c8b55] absolute bottom-0" style={{ height: '5px' }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2">Moderate</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(Math.max(0, growthBucket))}</span>
                 <div className="w-full bg-[#a7f3d0] border border-gray-200 relative h-full flex items-end">
                    <div className="w-full bg-[#4c8b55] absolute bottom-0" style={{ height: '5px' }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2">Growth</span>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
