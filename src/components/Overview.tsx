import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import type { Config } from '../config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  config: Config;
  projection: ProjectionResult;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const formatCompact = (value: number) => 
  new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(value);

// Okabe-Ito Colorblind Friendly Palette
const C_SUCCESS = "#009E73"; // Blue-Green
const C_WARNING = "#F0E442"; // Yellow
const C_DANGER = "#D55E00"; // Vermillion
const C_INFO_LIGHT = "#56B4E9"; // Sky Blue
const C_INFO_DARK = "#0072B2"; // Blue
const C_ORANGE = "#E69F00"; // Orange
const C_PURPLE = "#CC79A7"; // Reddish Purple

export const Overview: FC<Props> = ({ config, projection }) => {
  const firstYear = projection.yearly[0];
  const firstMonth = firstYear.months[0];
  
  // Calculate Countdowns
  const calculateCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const now = new Date();
    
    if (isNaN(target.getTime()) || target < now) {
      return { years: 0, months: 0, days: 0 };
    }
    
    let years = target.getFullYear() - now.getFullYear();
    let months = target.getMonth() - now.getMonth();
    let days = target.getDate() - now.getDate();
    
    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    return { years, months, days };
  };

  const yourCountdown = calculateCountdown(config.yourRetirementDate);
  const wifeCountdown = calculateCountdown(config.wifeRetirementDate);
  
  // Secure Income Score: (Guaranteed Income / Essential Expenses)
  const secureIncome = firstYear.totalPension + firstYear.totalWifeSalary + firstYear.totalWifeSS + firstYear.totalYourSS;
  const secureIncomeScore = Math.min(100, (secureIncome / firstYear.totalEssentialSpending) * 100);

  // Income vs Expenses (Annual)
  const annualIncome = firstYear.totalIncome;
  const annualExpenses = firstYear.totalExpenses;
  const annTaxesPct = (firstYear.totalTaxes / annualExpenses) * 100;
  const annInsPct = ((firstYear.totalInsurance + firstYear.totalMedicare) / annualExpenses) * 100;
  const annEssPct = (firstYear.totalEssentialSpending / annualExpenses) * 100;
  const annDiscPct = (firstYear.totalDiscretionarySpending / annualExpenses) * 100;

  // Income vs Expenses (Monthly)
  const monthlyIncome = firstMonth.totalIncome;
  const monthlyExpenses = firstMonth.totalExpenses;
  const moTaxesPct = (firstMonth.taxes / monthlyExpenses) * 100;
  const moInsPct = ((firstMonth.insurance + firstMonth.medicare) / monthlyExpenses) * 100;
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
          <h3 className="text-lg font-bold text-[#1a365d] mb-1">Retirement Benchmarks</h3>
          <p className="text-xs text-gray-400 mb-4">Based on Year 1 projections (Age {firstYear.age})</p>
          
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span title="Guaranteed income divided by essential expenses">Secure Income Score</span>
              <span className="text-gray-400">Benchmark: 80%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-4 bg-gray-200 relative">
                <div 
                  className={`absolute top-0 left-0 h-full`} 
                  style={{ width: `${secureIncomeScore}%`, backgroundColor: secureIncomeScore >= 80 ? C_SUCCESS : C_WARNING }}
                ></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-gray-400" style={{ left: '80%' }}></div>
              </div>
              <span className={`font-bold w-12 text-right`} style={{ color: secureIncomeScore >= 80 ? C_SUCCESS : C_WARNING }}>
                {secureIncomeScore.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span title="Year 1 account withdrawals ÷ starting liquid assets. 0% means income fully covers expenses — no account withdrawals needed.">Safe Withdrawal Rate</span>
              <span className="text-gray-400">Target: &lt;4%</span>
            </div>
            <div className="flex items-center space-x-3">
               <div className="flex-1 h-4 bg-gray-200 relative">
                <div 
                  className={`absolute top-0 left-0 h-full`} 
                  style={{ width: `${Math.min(100, (projection.metrics.safeWithdrawalRate / 10) * 100)}%`, backgroundColor: projection.metrics.safeWithdrawalRate <= 4 ? C_SUCCESS : C_DANGER }}
                ></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-gray-400" style={{ left: '40%' }}></div>
              </div>
               <span className={`font-bold w-16 text-right text-sm`} style={{ color: C_SUCCESS }}>
                  {projection.metrics.safeWithdrawalRate === 0 ? '✓ 0%' : `${projection.metrics.safeWithdrawalRate.toFixed(1)}%`}
               </span>
            </div>
            {projection.metrics.safeWithdrawalRate === 0 && (
              <p className="text-[10px] text-[#009E73] mt-1">✓ Excellent — Year 1 income fully covers all expenses. No account withdrawals needed.</p>
            )}
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#1a365d] mb-1">
              <span>Debt to Asset Ratio</span>
              <span className="text-gray-400">Target: &lt;20%</span>
            </div>
            <div className="flex items-center space-x-3">
               <div className="flex-1 h-4 bg-gray-200 relative">
                <div className="absolute top-0 left-0 h-full" style={{ width: `0%`, backgroundColor: C_SUCCESS }}></div>
                <div className="absolute top-0 bottom-0 border-r-2 border-gray-400" style={{ left: '20%' }}></div>
              </div>
               <span className="font-bold w-12 text-right" style={{ color: C_SUCCESS }}>0%</span>
            </div>
            <p className="text-[10px] text-[#009E73] mt-1">✓ No liabilities modeled. Add mortgage/debt in Settings if applicable.</p>
          </div>
        </div>

        {/* Panel 2: Retirement Target */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-6">Retirement Target</h3>
           <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-sm font-bold text-[#1a365d] w-1/2 text-right pr-4">Ron ({config.yourRetirementDate})</span>
              <div className="flex space-x-2 w-1/2">
                 <div className="flex flex-col items-center"><div className="bg-[#15325b] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">{yourCountdown.years}</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">YEARS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#15325b] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">{yourCountdown.months}</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">MONTHS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#15325b] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">{yourCountdown.days}</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">DAYS</span></div>
              </div>
           </div>
           <div className="flex justify-between items-center pt-4">
              <span className="text-sm font-bold text-[#1a365d] w-1/2 text-right pr-4">Wife ({config.wifeRetirementDate})</span>
              <div className="flex space-x-2 w-1/2">
                 <div className="flex flex-col items-center"><div className="bg-[#9ca3af] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">{wifeCountdown.years}</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">YEARS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#9ca3af] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">{wifeCountdown.months}</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">MONTHS</span></div>
                 <div className="flex flex-col items-center"><div className="bg-[#9ca3af] text-white px-3 py-2 text-xl font-bold rounded-sm w-12 text-center">{wifeCountdown.days}</div><span className="text-[10px] font-bold text-[#1a365d] mt-1">DAYS</span></div>
              </div>
           </div>
        </div>

        {/* Panel 3: Annual Income vs Expenses */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-[#1a365d] leading-tight w-1/2">
              Annual Income <br/> vs. Expenses
              <span className="block text-xs font-normal text-gray-400 mb-1">Year 1 · Age {firstYear.age} · {config.yourRetirementDate.slice(0,4)}</span>
              <span className="text-2xl" style={{ color: annualIncome >= annualExpenses ? C_SUCCESS : C_DANGER }}>
                {annualIncome >= annualExpenses ? '+' : '-'}{formatCurrency(Math.abs(annualIncome - annualExpenses))}
              </span>
            </h3>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold text-[#1a365d] mb-1">Annual Income: {formatCurrency(annualIncome)}</div>
            <div className="h-6 w-full" style={{ backgroundColor: C_SUCCESS }}></div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#1a365d] mb-1">Annual Expenses: {formatCurrency(annualExpenses)}</div>
            <div className="h-6 w-full flex">
              <div className="h-full" style={{ width: `${annInsPct}%`, backgroundColor: C_PURPLE }} title="Healthcare"></div>
              <div className="h-full border-l border-white/20" style={{ width: `${annTaxesPct}%`, backgroundColor: C_DANGER }} title="Taxes"></div>
              <div className="h-full border-l border-white/20" style={{ width: `${annEssPct}%`, backgroundColor: C_ORANGE }} title="Essential"></div>
              <div className="h-full border-l border-white/20" style={{ width: `${annDiscPct}%`, backgroundColor: C_WARNING }} title="Discretionary"></div>
            </div>
            <div className="flex text-[10px] space-x-3 mt-2 text-gray-500 font-medium">
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_PURPLE }}></span> Healthcare</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_DANGER }}></span> Taxes</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_ORANGE }}></span> Essential</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_WARNING }}></span> Discretionary</span>
            </div>
          </div>
        </div>

        {/* Panel 4: Monthly Income vs Expenses */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-[#1a365d] leading-tight w-1/2">
              Monthly Income <br/> vs. Expenses
              <span className="block text-xs font-normal text-gray-400 mb-1">Month 1 · Age {firstYear.age} · {config.yourRetirementDate.slice(0,4)}</span>
              <span className="text-2xl" style={{ color: monthlyIncome >= monthlyExpenses ? C_SUCCESS : C_DANGER }}>
                {monthlyIncome >= monthlyExpenses ? '+' : '-'}{formatCurrency(Math.abs(monthlyIncome - monthlyExpenses))}
              </span>
            </h3>
          </div>

          <div className="mb-4">
            <div className="text-xs font-bold text-[#1a365d] mb-1">Monthly Income: {formatCurrency(monthlyIncome)}</div>
            <div className="h-6 w-full" style={{ backgroundColor: C_SUCCESS }}></div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#1a365d] mb-1">Monthly Expenses: {formatCurrency(monthlyExpenses)}</div>
            <div className="h-6 w-full flex">
              <div className="h-full" style={{ width: `${moInsPct}%`, backgroundColor: C_PURPLE }}></div>
              <div className="h-full border-l border-white/20" style={{ width: `${moTaxesPct}%`, backgroundColor: C_DANGER }}></div>
              <div className="h-full border-l border-white/20" style={{ width: `${moEssPct}%`, backgroundColor: C_ORANGE }}></div>
              <div className="h-full border-l border-white/20" style={{ width: `${moDiscPct}%`, backgroundColor: C_WARNING }}></div>
            </div>
            <div className="flex text-[10px] space-x-3 mt-2 text-gray-500 font-medium">
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_PURPLE }}></span> Healthcare</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_DANGER }}></span> Taxes</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_ORANGE }}></span> Essential</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_WARNING }}></span> Discretionary</span>
            </div>
          </div>
        </div>

        {/* Panel 5: Liquid Asset Risk Allocation */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-8">Liquid Asset Risk Allocation</h3>
           <div className="h-6 w-full flex mb-2">
              <div className="h-full border-r border-white" style={{ width: '0%', backgroundColor: C_SUCCESS }}></div>
              <div className="h-full border-r border-white" style={{ width: '0%', backgroundColor: C_INFO_LIGHT }}></div>
              <div className="h-full border-r border-white" style={{ width: '20%', backgroundColor: C_ORANGE }}></div>
              <div className="h-full" style={{ width: '80%', backgroundColor: C_DANGER }}></div>
           </div>
           <div className="flex text-[10px] space-x-4 text-gray-500 font-medium justify-between px-2">
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_SUCCESS }}></span> Emergency: 0%</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_INFO_LIGHT }}></span> Low: 0%</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_ORANGE }}></span> Medium: 20%</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_DANGER }}></span> Aggressive: 80%</span>
           </div>
        </div>

        {/* Panel 6: Liquid Asset Tax Allocation */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-8">Liquid Asset Tax Allocation</h3>
           <div className="h-6 w-full flex mb-2">
              <div className="h-full border-r border-white" style={{ width: `${taxFreePct}%`, backgroundColor: C_SUCCESS }}></div>
              <div className="h-full border-r border-white" style={{ width: '0%', backgroundColor: C_INFO_LIGHT }}></div>
              <div className="h-full" style={{ width: `${taxDeferredPct}%`, backgroundColor: C_INFO_DARK }}></div>
           </div>
           <div className="flex text-[10px] space-x-4 text-gray-500 font-medium justify-between px-2">
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_SUCCESS }}></span> Tax Free: {taxFreePct.toFixed(0)}%</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_INFO_LIGHT }}></span> Taxable: 0%</span>
              <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_INFO_DARK }}></span> Tax Deferred: {taxDeferredPct.toFixed(0)}%</span>
           </div>
        </div>

        {/* Panel 7: Net Worth */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200 flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-1">Net Worth</h3>
              <p className="text-xs text-gray-400 mb-2">Liquid assets at start of retirement · {config.yourRetirementDate}</p>
              <p className="text-3xl font-bold mb-6" style={{ color: C_SUCCESS }}>{formatCurrency(totalAssets)}</p>
           </div>
           
           <div>
              <div className="text-xs font-bold text-[#1a365d] mb-1">Assets: {formatCurrency(totalAssets)}</div>
              <div className="h-6 w-full flex mb-2">
                 <div className="h-full border-r border-white" style={{ width: '100%', backgroundColor: C_INFO_LIGHT }}></div>
                 <div className="h-full border-r border-white" style={{ width: '0%', backgroundColor: C_SUCCESS }}></div>
                 <div className="h-full" style={{ width: '0%', backgroundColor: C_INFO_DARK }}></div>
              </div>
              <div className="flex text-[10px] space-x-4 text-gray-500 font-medium mb-4">
                 <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_INFO_LIGHT }}></span> Liquid: {formatCompact(totalAssets)}</span>
                 <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_SUCCESS }}></span> Real: 0</span>
                 <span className="flex items-center"><span className="w-2 h-2 inline-block mr-1" style={{ backgroundColor: C_INFO_DARK }}></span> Other: 0</span>
              </div>

              <div className="text-xs font-bold text-[#1a365d] mb-1">Liabilities: $0</div>
              <div className="h-6 w-full flex mb-2">
                 <div className="h-full w-12" style={{ backgroundColor: C_DANGER }}></div>
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
              <span className={`text-xl font-bold`} style={{ color: rmdEstimate > 0 ? C_DANGER : '#9ca3af' }}>
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
                      <stop offset="5%" stopColor={C_INFO_DARK} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={C_INFO_DARK} stopOpacity={0}/>
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
                  <Area type="monotone" dataKey="assets" stroke={C_INFO_DARK} fillOpacity={1} fill="url(#colorAssets)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Panel 10: Buckets */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-[#1a365d] mb-1">Spending Buckets</h3>
           <p className="text-xs text-gray-400 mb-4">Projected cumulative shortfalls by time horizon. The Growth bucket is your remaining investable balance beyond the first 9 years of shortfalls.</p>
           
           <div className="flex justify-between items-end h-32 px-4 space-x-2">
              
              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(projection.metrics.bucketIncome)}</span>
                 <div className="w-full bg-white border border-gray-200 relative h-full flex items-end">
                    <div className="w-full absolute bottom-0" style={{ height: '5px', backgroundColor: C_DANGER }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2 text-center">Income<br/>(1-3 yrs)</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(projection.metrics.bucketConservative)}</span>
                 <div className="w-full bg-white border border-gray-200 relative h-full flex items-end">
                    <div className="w-full absolute bottom-0" style={{ height: '5px', backgroundColor: C_ORANGE }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2 text-center">Conservative<br/>(4-6 yrs)</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(projection.metrics.bucketModerate)}</span>
                 <div className="w-full bg-white border border-gray-200 relative h-full flex items-end">
                    <div className="w-full absolute bottom-0" style={{ height: '5px', backgroundColor: C_WARNING }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2 text-center">Moderate<br/>(7-9 yrs)</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-xs font-bold text-[#1a365d] mb-2">{formatCurrency(Math.max(0, growthBucket))}</span>
                 <div className="w-full border border-gray-200 relative h-full flex items-end" style={{ backgroundColor: C_SUCCESS, opacity: 0.8 }}>
                    <div className="w-full absolute bottom-0" style={{ height: '5px', backgroundColor: C_INFO_DARK }}></div>
                 </div>
                 <span className="text-[10px] font-bold text-[#1a365d] mt-2 text-center">Growth<br/>(10+ yrs)</span>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
