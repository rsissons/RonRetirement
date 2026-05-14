import { useState, useMemo } from 'react';
import { defaultConfig } from './config';
import type { Config } from './config';
import { calculateProjection } from './projection';
import { Overview } from './components/Overview';
import { IncomeBreakdown } from './components/IncomeBreakdown';
import { FundingSource } from './components/FundingSource';
import { AccountBalances } from './components/AccountBalances';
import { DataTable } from './components/DataTable';
import { Settings } from './components/Settings';
import { LayoutDashboard, PieChart, Layers, LineChart as LineChartIcon, Settings as SettingsIcon, TableProperties } from 'lucide-react';

type Tab = 'overview' | 'income' | 'funding' | 'balances' | 'data' | 'settings';

function App() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const projection = useMemo(() => calculateProjection(config), [config]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'income', label: 'Income Breakdown', icon: PieChart },
    { id: 'funding', label: 'Funding Source', icon: Layers },
    { id: 'balances', label: 'Account Balances', icon: LineChartIcon },
    { id: 'data', label: 'Data Table', icon: TableProperties },
    { id: 'settings', label: 'Settings & Assumptions', icon: SettingsIcon },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-[#15325b] text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-[#1e447a] text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 border-4 border-[#3b82f6] flex items-center justify-center overflow-hidden">
             {/* Profile placeholder */}
             <div className="text-[#15325b] font-bold text-2xl">RS</div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Ron
          </h1>
          <p className="text-[#93c5fd] text-xs uppercase tracking-wider mt-1">Retirement Planner</p>
        </div>
        
        <div className="px-6 py-4 border-b border-[#1e447a]">
          <p className="text-xs text-[#93c5fd] uppercase tracking-wider mb-1">Today</p>
          <p className="text-2xl font-bold text-white">
            ${((config.starting403b + config.startingRoth) / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-white/70">Starting Account Balance</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#15325b] font-semibold shadow-sm' 
                    : 'text-white/70 hover:bg-[#1e447a] hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#3b82f6]' : 'text-white/50'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
            CalPERS Strategy Model
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && <Overview projection={projection} />}
            {activeTab === 'income' && <IncomeBreakdown projection={projection} />}
            {activeTab === 'funding' && <FundingSource projection={projection} />}
            {activeTab === 'balances' && <AccountBalances projection={projection} />}
            {activeTab === 'data' && <DataTable projection={projection} />}
            {activeTab === 'settings' && <Settings config={config} setConfig={setConfig} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
