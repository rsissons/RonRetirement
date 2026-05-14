import type { FC, Dispatch, SetStateAction, ChangeEvent } from 'react';
import type { AppConfig } from '../config';

interface Props {
  config: AppConfig;
  setConfig: Dispatch<SetStateAction<AppConfig>>;
}

export const StressTest: FC<Props> = ({ config, setConfig }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue = parseFloat(value);
    
    // Convert percentages to decimals for the config state
    if (name === 'annualReturn' || name === 'spendingInflation' || name === 'pensionCOLA' || name === 'effectiveTaxRate') {
      numValue = numValue / 100;
    }

    setConfig(prev => {
      const next = { ...prev, [name]: numValue };
      if (name === 'annualReturn') {
        next.monthlyReturn = numValue / 12;
      }
      return next;
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Stress Test Parameters</h2>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Annual Return</span>
            <span className="font-bold text-blue-600">{(config.annualReturn * 100).toFixed(1)}%</span>
          </label>
          <input 
            type="range" 
            name="annualReturn"
            min="4" 
            max="10" 
            step="0.1" 
            value={config.annualReturn * 100} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Spending Inflation</span>
            <span className="font-bold text-red-600">{(config.spendingInflation * 100).toFixed(1)}%</span>
          </label>
          <input 
            type="range" 
            name="spendingInflation"
            min="1" 
            max="6" 
            step="0.1" 
            value={config.spendingInflation * 100} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Pension COLA</span>
            <span className="font-bold text-emerald-600">{(config.pensionCOLA * 100).toFixed(1)}%</span>
          </label>
          <input 
            type="range" 
            name="pensionCOLA"
            min="0" 
            max="4" 
            step="0.1" 
            value={config.pensionCOLA * 100} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Essential Spending (Monthly)</span>
            <span className="font-bold text-gray-900">${config.essentialSpending}</span>
          </label>
          <input 
            type="range" 
            name="essentialSpending"
            min="5000" 
            max="20000" 
            step="100" 
            value={config.essentialSpending} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Discretionary Spending (Monthly)</span>
            <span className="font-bold text-pink-600">${config.discretionarySpending}</span>
          </label>
          <input 
            type="range" 
            name="discretionarySpending"
            min="0" 
            max="10000" 
            step="100" 
            value={config.discretionarySpending} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Effective Tax Rate</span>
            <span className="font-bold text-amber-600">{(config.effectiveTaxRate * 100).toFixed(1)}%</span>
          </label>
          <input 
            type="range" 
            name="effectiveTaxRate"
            min="0" 
            max="35" 
            step="0.5" 
            value={config.effectiveTaxRate * 100} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Max Monthly Roth Conversion</span>
            <span className="font-bold text-purple-600">${config.maxMonthlyConversion}</span>
          </label>
          <input 
            type="range" 
            name="maxMonthlyConversion"
            min="0" 
            max="10000" 
            step="100" 
            value={config.maxMonthlyConversion} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Starting Pension (Monthly)</span>
            <span className="font-bold text-indigo-600">${config.pensionStart}</span>
          </label>
          <input 
            type="range" 
            name="pensionStart"
            min="8000" 
            max="14000" 
            step="100" 
            value={config.pensionStart} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Discretionary Roth Withdrawal (Annual)</span>
            <span className="font-bold text-teal-600">${config.rothExtraWithdrawal}</span>
          </label>
          <input 
            type="range" 
            name="rothExtraWithdrawal"
            min="0" 
            max="50000" 
            step="1000" 
            value={config.rothExtraWithdrawal} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Travel, big purchases, etc.</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};
