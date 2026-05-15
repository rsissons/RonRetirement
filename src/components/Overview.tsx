import type { FC } from 'react';
import type { ProjectionResult } from '../projection';
import type { Config } from '../config';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props { config: Config; projection: ProjectionResult; }

const $ = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const $k = (v: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(v);

function countdown(dateStr: string) {
  const t = new Date(dateStr), n = new Date();
  if (isNaN(t.getTime()) || t < n) return { y: 0, m: 0, d: 0 };
  let y = t.getFullYear() - n.getFullYear();
  let m = t.getMonth() - n.getMonth();
  let d = t.getDate() - n.getDate();
  if (d < 0) { m--; d += new Date(t.getFullYear(), t.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}

const C = { green: '#009E73', orange: '#E69F00', vermillion: '#D55E00', blue: '#0072B2', sky: '#56B4E9', purple: '#CC79A7', navy: '#15325b' };

const KPI: FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color = C.navy }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const CountdownBox: FC<{ n: number; label: string; color: string }> = ({ n, label, color }) => (
  <div className="flex flex-col items-center">
    <div className="text-white text-xl font-bold rounded w-12 h-10 flex items-center justify-center" style={{ background: color }}>{n}</div>
    <span className="text-[10px] font-bold text-gray-600 mt-1">{label}</span>
  </div>
);

export const Overview: FC<Props> = ({ config, projection }) => {
  const y1 = projection.yearly[0];
  const m1 = y1.months[0];
  const last = projection.yearly[projection.yearly.length - 1];
  const ron = countdown(config.yourRetirementDate);
  const wife = countdown(config.wifeRetirementDate);

  // Find depletion age
  const depletionYear = projection.yearly.find(y => y.endBalance403b + y.endBalanceRoth < 1000);
  const fundedThrough = depletionYear ? `Age ${depletionYear.age}` : `Age ${last.age}+`;

  // Monthly budget
  const monthlyNet = m1.netIncome;
  const monthlySpend = m1.essentialSpending + m1.discretionarySpending;
  const surplus = monthlyNet - monthlySpend;

  // Pension at 30 yrs (with COLA)
  const pensionAt30 = y1.totalPension * Math.pow(1 + config.pensionCOLA, 29) / 12;

  // Total assets
  const startAssets = config.starting403b + config.startingRoth;
  const endAssets = last.endBalance403b + last.endBalanceRoth;

  // Chart data
  const assetData = projection.yearly.map(y => ({
    age: y.age,
    '403b': Math.round(y.endBalance403b),
    Roth: Math.round(y.endBalanceRoth),
    Total: Math.round(y.endBalance403b + y.endBalanceRoth),
  }));

  // Tax/Roth allocation
  const taxFreePct = startAssets > 0 ? (config.startingRoth / startAssets * 100).toFixed(0) : '0';
  const taxDefPct = startAssets > 0 ? (config.starting403b / startAssets * 100).toFixed(0) : '0';

  // Key milestones
  const milestones: { age: number; label: string }[] = [];
  milestones.push({ age: config.retirementAge, label: '🎉 Ron retires' });
  if (config.wifeRetirementAge) milestones.push({ age: Math.round(config.retirementAge + config.wifeRetirementAge - config.wifeAgeDifference - config.retirementAge), label: `✅ Wife retires + SS begins (+$${config.wifeSS}/mo at her age ${config.wifeRetirementAge})` });
  if (config.yourSSStartAge) milestones.push({ age: config.yourSSStartAge, label: `✅ Ron's SS begins (+${$(config.yourSS)}/mo)` });
  milestones.push({ age: Math.round(config.retirementAge + (config.wifeInsuranceEndAge - config.wifeAgeDifference - config.retirementAge)), label: `💊 Wife's insurance ends → Medicare ($${config.medicarePremium}/mo)` });
  milestones.push({ age: 75, label: '📋 RMDs required on 403b' });
  if (projection.metrics.year403bDepleted) milestones.push({ age: projection.metrics.year403bDepleted, label: '⚠️ 403b fully converted/depleted' });
  milestones.sort((a, b) => a.age - b.age);

  // RMD estimate
  const y75 = projection.yearly.find(y => y.age === 75);
  const rmdEst = y75 ? y75.endBalance403b / 24.6 : 0;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">

      {/* ── TOP KPI ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Monthly Net Income — Year 1" value={$(monthlyNet)} sub={`${surplus >= 0 ? '+' : ''}${$(surplus)} vs. expenses`} color={surplus >= 0 ? C.green : C.vermillion} />
        <KPI label="CalPERS Pension (Base)" value={$(config.pensionStart) + '/mo'} sub={`+${(config.pensionCOLA * 100).toFixed(0)}% COLA · ${$(pensionAt30)}/mo at age ${config.retirementAge + 29}`} color={C.blue} />
        <KPI label="Total Liquid Assets at Retirement" value={$k(startAssets)} sub={`403b: ${$k(config.starting403b)} · Roth: ${$k(config.startingRoth)}`} color={C.navy} />
        <KPI label="Projected Funded Through" value={fundedThrough} sub={endAssets > 10000 ? `${$k(endAssets)} remaining at age ${last.age}` : 'Assets depleted — review plan'} color={endAssets > 10000 ? C.green : C.vermillion} />
      </div>

      {/* ── ROW 2: Countdown + CalPERS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Retirement Countdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#15325b] mb-4">🗓 Retirement Target</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-28 text-sm font-semibold text-gray-700">Ron<br/><span className="text-xs font-normal text-gray-400">{config.yourRetirementDate}</span></span>
              <div className="flex gap-2">{[{ n: ron.y, l: 'YRS' }, { n: ron.m, l: 'MOS' }, { n: ron.d, l: 'DAYS' }].map(x => <CountdownBox key={x.l} n={x.n} label={x.l} color={C.navy} />)}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-28 text-sm font-semibold text-gray-700">Wife<br/><span className="text-xs font-normal text-gray-400">{config.wifeRetirementDate}</span></span>
              <div className="flex gap-2">{[{ n: wife.y, l: 'YRS' }, { n: wife.m, l: 'MOS' }, { n: wife.d, l: 'DAYS' }].map(x => <CountdownBox key={x.l} n={x.n} label={x.l} color="#6b7280" />)}</div>
            </div>
          </div>
          {/* Life timeline bars */}
          <div className="mt-5 space-y-2">
            {[
              { name: 'Ron', lived: config.retirementAge - 0, toRet: 0, inRet: 30, expectancy: 85, retAge: config.retirementAge },
              { name: 'Wife', lived: config.retirementAge + 4 - 0, toRet: 0, inRet: 25, expectancy: 88, retAge: config.retirementAge + 4 },
            ].map(p => {
              const pct = (n: number) => `${((n / p.expectancy) * 100).toFixed(0)}%`;
              return (
                <div key={p.name}>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span className="font-semibold">{p.name}</span><span>Life Expectancy: {p.expectancy}</span>
                  </div>
                  <div className="h-4 flex w-full rounded overflow-hidden text-[10px] font-bold text-white">
                    <div style={{ width: pct(p.retAge), background: C.navy }} title={`Years lived: ${p.retAge}`} className="flex items-center justify-center truncate">Lived</div>
                    <div style={{ width: pct(p.inRet), background: C.sky }} title={`Est. years in retirement: ${p.inRet}`} className="flex items-center justify-center truncate">Retirement</div>
                    <div style={{ flex: 1, background: '#e5e7eb' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CalPERS Panel */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#15325b] mb-1">🏛 CalPERS Pension</h3>
          <p className="text-xs text-gray-400 mb-4">CalPERS 100% Beneficiary Option · Retire age {config.retirementAge}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Starting Monthly Pension', value: $(config.pensionStart), color: C.blue },
              { label: 'Annual COLA Rate', value: `${(config.pensionCOLA * 100).toFixed(0)}%/yr`, color: C.green },
              { label: 'Monthly at Age ' + (config.retirementAge + 10), value: $(config.pensionStart * Math.pow(1 + config.pensionCOLA, 10)), color: C.blue },
              { label: 'Monthly at Age ' + (config.retirementAge + 20), value: $(config.pensionStart * Math.pow(1 + config.pensionCOLA, 20)), color: C.blue },
              { label: 'Lifetime Total (30 yrs est.)', value: $k(projection.metrics.lifetimePension), color: C.green },
              { label: 'RMD Estimate at Age 75', value: rmdEst > 0 ? $(rmdEst) + '/yr' : 'N/A — fully converted', color: rmdEst > 0 ? C.orange : C.green },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{item.label}</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Monthly Budget + Asset Projection ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Monthly Budget */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#15325b] mb-1">💵 Monthly Budget — Year 1</h3>
          <p className="text-xs text-gray-400 mb-3">Age {y1.age} · {config.yourRetirementDate.slice(0,4)} · Income vs. Spending</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded p-3 border-l-4" style={{ borderColor: C.green, background: '#f0fdf4' }}>
              <p className="text-[10px] text-gray-500 uppercase">Net Monthly Income</p>
              <p className="text-xl font-bold" style={{ color: C.green }}>{$(monthlyNet)}</p>
            </div>
            <div className="rounded p-3 border-l-4" style={{ borderColor: C.orange, background: '#fff7ed' }}>
              <p className="text-[10px] text-gray-500 uppercase">Total Monthly Spend</p>
              <p className="text-xl font-bold" style={{ color: C.orange }}>{$(monthlySpend)}</p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            {[
              { label: 'CalPERS Pension', val: m1.pension, color: C.blue },
              { label: "Wife's Salary (Yr 1)", val: m1.wifeSalary, color: C.sky },
              { label: "Wife's Social Security", val: m1.wifeSS, color: C.blue },
              { label: 'Your Social Security', val: m1.yourSS, color: C.blue },
              { label: '—', val: 0, color: '' },
              { label: 'Essential (Housing, Food, etc.)', val: -m1.essentialSpending, color: C.orange },
              { label: 'Discretionary (Travel, Fun)', val: -m1.discretionarySpending, color: C.vermillion },
              { label: 'Healthcare / Insurance', val: -(m1.insurance + m1.medicare), color: C.purple },
              { label: 'Est. Taxes', val: -m1.taxes, color: '#6b7280' },
            ].filter(r => r.val !== 0 && r.label !== '—').map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-gray-600">{row.label}</span>
                <span className="font-semibold" style={{ color: row.color }}>{row.val > 0 ? '+' : ''}{$(row.val)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t pt-2 mt-1 font-bold">
              <span>Net Monthly {surplus >= 0 ? 'Surplus' : 'Shortfall'}</span>
              <span style={{ color: surplus >= 0 ? C.green : C.vermillion }}>{surplus >= 0 ? '+' : ''}{$(surplus)}</span>
            </div>
          </div>
        </div>

        {/* Asset Projection */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#15325b] mb-1">📈 Liquid Asset Projection</h3>
          <p className="text-xs text-gray-400 mb-3">30-year trajectory of 403b + Roth at {(config.annualReturn * 100).toFixed(0)}% return</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g403b" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.sky} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={C.sky} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gRoth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={$k} />
                <Tooltip formatter={(v: any) => [$(v)]} labelFormatter={l => `Age ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="403b" stackId="1" stroke={C.sky} fill="url(#g403b)" name="403b" />
                <Area type="monotone" dataKey="Roth" stackId="1" stroke={C.green} fill="url(#gRoth)" name="Roth" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Milestones + Tax Allocation + Account Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Key Milestones */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#15325b] mb-5 flex items-center gap-2">
            <span>📅</span> Key Milestones
          </h3>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="shrink-0 pt-0.5">
                  <span className="inline-block text-[10px] font-bold rounded-full px-2.5 py-1 text-white whitespace-nowrap shadow-sm" style={{ background: C.navy }}>
                    Age {m.age}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Allocation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#15325b] mb-1">🧾 Account Tax Allocation</h3>
          <p className="text-xs text-gray-400 mb-4">At retirement start · Goal: maximize tax-free Roth</p>
          <div className="h-5 flex w-full rounded overflow-hidden mb-3">
            <div style={{ width: `${taxFreePct}%`, background: C.green }} title="Tax-Free Roth" />
            <div style={{ width: `${taxDefPct}%`, background: C.sky }} title="Tax-Deferred 403b" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-sm" style={{ background: C.green, display: 'inline-block' }} /> Tax-Free (Roth)</span>
              <span className="font-bold" style={{ color: C.green }}>{taxFreePct}% · {$k(config.startingRoth)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-sm" style={{ background: C.sky, display: 'inline-block' }} /> Tax-Deferred (403b)</span>
              <span className="font-bold" style={{ color: C.sky }}>{taxDefPct}% · {$k(config.starting403b)}</span>
            </div>
            <div className="pt-2 border-t text-xs text-gray-500">
              Converting up to {$k(config.maxMonthlyConversion * 12)}/yr from 403b → Roth to maximize tax-free growth.
            </div>
          </div>
        </div>

        {/* 30-Year Summary */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-bold text-[#15325b] mb-1">📊 30-Year Summary</h3>
          <p className="text-xs text-gray-400 mb-4">Projected totals over full retirement horizon</p>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Lifetime Pension Income', val: projection.metrics.lifetimePension, color: C.blue },
              { label: 'Lifetime SS Income', val: projection.metrics.lifetimeSS, color: C.blue },
              { label: 'Total 403b Withdrawn', val: projection.metrics.total403bWithdrawn, color: C.sky },
              { label: 'Total Roth Withdrawn', val: projection.metrics.totalRothWithdrawn, color: C.green },
              { label: 'Peak Roth Balance', val: projection.metrics.peakRothBalance, color: C.green },
              { label: 'Roth Balance at Age 85', val: projection.metrics.rothBalanceAt85, color: C.green },
              { label: 'Final Assets (Age ' + last.age + ')', val: last.endBalance403b + last.endBalanceRoth, color: last.endBalance403b + last.endBalanceRoth > 50000 ? C.green : C.vermillion },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-600">{row.label}</span>
                <span className="font-bold" style={{ color: row.color }}>{$k(row.val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
