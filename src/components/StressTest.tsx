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
    if (name === 'annualReturn' || name === 'spendingInflation') {
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
            max="8" 
            step="0.1" 
            value={config.annualReturn * 100} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4%</span>
            <span>8%</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
            <span>Spending Inflation</span>
            <span className="font-bold text-red-600">{(config.spendingInflation * 100).toFixed(1)}%</span>
          </label>
          <input 
            type="range" 
            name="spendingInflation"
            min="2" 
            max="4" 
            step="0.1" 
            value={config.spendingInflation * 100} 
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2%</span>
            <span>4%</span>
          </div>
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
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$0</span>
            <span>$10,000</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};
