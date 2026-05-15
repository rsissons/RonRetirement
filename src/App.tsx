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
import { LayoutDashboard, PieChart, Layers, LineChart as LineChartIcon, Settings as SettingsIcon, TableProperties, Menu, X, ChevronRight, Sliders } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'overview' | 'income' | 'funding' | 'balances' | 'data' | 'settings';

function App() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  const projection = useMemo(() => calculateProjection(config), [config]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'income', label: 'Income Breakdown', icon: PieChart },
    { id: 'funding', label: 'Funding Source', icon: Layers },
    { id: 'balances', label: 'Account Balances', icon: LineChartIcon },
    { id: 'data', label: 'Data Table', icon: TableProperties },
    { id: 'settings', label: 'All Settings', icon: SettingsIcon },
  ] as const;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#0f172a] text-slate-300 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
              RS
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Ron Sissons</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Strategic Planner</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              ${((config.starting403b + config.startingRoth) / 1000).toFixed(0)}k
            </p>
          </div>
        </div>
        
        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 font-semibold border border-blue-500/20 shadow-sm shadow-blue-500/5' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={cn("transition-colors duration-200", isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-400')} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-500/50" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-800">
           <button 
             onClick={() => setIsSettingsPanelOpen(true)}
             className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 rounded-xl transition-colors"
           >
             <Sliders size={14} />
             Quick Adjust
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-4 py-2 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE CALCULATION
            </div>
            <button 
              onClick={() => setIsSettingsPanelOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors lg:hidden"
            >
              <Sliders size={20} />
            </button>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-slate-50/50">
          <div className={cn(
            "mx-auto transition-all duration-300",
            activeTab === 'data' ? 'max-w-full' : 'max-w-6xl'
          )}>
            {activeTab === 'overview' && <Overview config={config} projection={projection} />}
            {activeTab === 'income' && <IncomeBreakdown projection={projection} />}
            {activeTab === 'funding' && <FundingSource projection={projection} />}
            {activeTab === 'balances' && <AccountBalances projection={projection} />}
            {activeTab === 'data' && <DataTable config={config} projection={projection} />}
            {activeTab === 'settings' && <Settings config={config} setConfig={setConfig} />}
          </div>
        </main>

        {/* Quick Settings Panel (Overlay) */}
        <div className={cn(
          "fixed inset-y-0 right-0 w-80 sm:w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-500 ease-out border-l border-slate-200",
          isSettingsPanelOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Quick Adjust</h3>
                <p className="text-xs text-slate-500">Live preview of changes</p>
              </div>
              <button 
                onClick={() => setIsSettingsPanelOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <Settings config={config} setConfig={setConfig} />
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setIsSettingsPanelOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
