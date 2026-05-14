import { useState, useMemo } from 'react';
import { defaultConfig } from './config';
import type { AppConfig } from './config';
import { calculateProjection } from './projection';
import { Overview } from './components/Overview';
import { IncomeBreakdown } from './components/IncomeBreakdown';
import { FundingSource } from './components/FundingSource';
import { AccountBalances } from './components/AccountBalances';
import { StressTest } from './components/StressTest';
import { LayoutDashboard, PieChart, Layers, LineChart as LineChartIcon, SlidersHorizontal } from 'lucide-react';

type Tab = 'overview' | 'income' | 'funding' | 'balances' | 'stress';

function App() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const projection = useMemo(() => calculateProjection(config), [config]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'income', label: 'Income Breakdown', icon: PieChart },
    { id: 'funding', label: 'Funding Source', icon: Layers },
    { id: 'balances', label: 'Account Balances', icon: LineChartIcon },
    { id: 'stress', label: 'Stress Test', icon: SlidersHorizontal },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Retirement Planner
          </h1>
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
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          Private Client Dashboard
        </div>
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
            {activeTab === 'stress' && <StressTest config={config} setConfig={setConfig} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
