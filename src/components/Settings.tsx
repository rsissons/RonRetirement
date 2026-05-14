import type { FC, ChangeEvent } from 'react';
import type { Config } from '../config';

interface Props {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

export const Settings: FC<Props> = ({ config, setConfig }) => {

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'yourRetirementDate' || name === 'wifeRetirementDate') {
      setConfig(prev => ({ ...prev, [name]: value }));
      return;
    }

    let numValue = parseFloat(value);
    
    // Convert percentages to decimals for the config state
    if (name === 'annualReturn' || name === 'spendingInflation' || name === 'pensionCOLA' || name === 'effectiveTaxRate' || name === 'healthcareInflation') {
      numValue = numValue / 100;
    }

    setConfig(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0072B2] mb-2">Settings & Assumptions</h2>
        <p className="text-gray-600">Adjust the inputs below to see how they impact your 30-year projection in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ages & Timing */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1a365d] mb-4 border-b pb-2">Ages & Timing</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Your Retirement Age</span>
              <span className="font-bold text-[#0072B2]">{config.retirementAge}</span>
            </label>
            <input type="range" name="retirementAge" min="55" max="70" step="1" value={config.retirementAge} onChange={handleChange} className="w-full accent-[#0072B2]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Your Target Date</span>
            </label>
            <input type="date" name="yourRetirementDate" value={config.yourRetirementDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Wife's Target Date</span>
            </label>
            <input type="date" name="wifeRetirementDate" value={config.wifeRetirementDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Your SS Start Age</span>
              <span className="font-bold text-[#0072B2]">{config.yourSSStartAge}</span>
            </label>
            <input type="range" name="yourSSStartAge" min="62" max="70" step="1" value={config.yourSSStartAge} onChange={handleChange} className="w-full accent-[#0072B2]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Wife's Retirement Age (salary ends, SS starts)</span>
              <span className="font-bold text-[#0072B2]">{config.wifeRetirementAge}</span>
            </label>
            <input type="range" name="wifeRetirementAge" min="60" max="70" step="1" value={config.wifeRetirementAge} onChange={handleChange} className="w-full accent-[#0072B2]" />
            <p className="text-xs text-gray-400 mt-1">Wife is {config.wifeAgeDifference.toFixed(1)} yrs older · At your retirement she'll be ~{(config.retirementAge + config.wifeAgeDifference).toFixed(1)} yrs old</p>
          </div>
        </div>

        {/* Starting Balances */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1a365d] mb-4 border-b pb-2">Starting Balances</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Starting 403b</span>
              <span className="font-bold text-[#0072B2]">${config.starting403b.toLocaleString()}</span>
            </label>
            <input type="range" name="starting403b" min="0" max="500000" step="1000" value={config.starting403b} onChange={handleChange} className="w-full accent-[#0072B2]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Starting Roth</span>
              <span className="font-bold text-[#0072B2]">${config.startingRoth.toLocaleString()}</span>
            </label>
            <input type="range" name="startingRoth" min="0" max="500000" step="1000" value={config.startingRoth} onChange={handleChange} className="w-full accent-[#0072B2]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Annual Return</span>
              <span className="font-bold text-[#0072B2]">{(config.annualReturn * 100).toFixed(1)}%</span>
            </label>
            <input type="range" name="annualReturn" min="0" max="15" step="0.5" value={config.annualReturn * 100} onChange={handleChange} className="w-full accent-[#0072B2]" />
          </div>
        </div>

        {/* Income Streams */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1a365d] mb-4 border-b pb-2">Income Streams (Monthly)</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Base Pension</span>
              <span className="font-bold text-[#009E73]">${config.pensionStart}</span>
            </label>
            <input type="range" name="pensionStart" min="5000" max="20000" step="100" value={config.pensionStart} onChange={handleChange} className="w-full accent-[#009E73]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Wife's Salary (Monthly, while working)</span>
              <span className="font-bold text-[#009E73]">${config.wifeSalary.toLocaleString()}</span>
            </label>
            <input type="range" name="wifeSalary" min="0" max="15000" step="100" value={config.wifeSalary} onChange={handleChange} className="w-full accent-[#009E73]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Your SS Amount</span>
              <span className="font-bold text-[#009E73]">${config.yourSS}</span>
            </label>
            <input type="range" name="yourSS" min="0" max="5000" step="50" value={config.yourSS} onChange={handleChange} className="w-full accent-[#009E73]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Wife's SS Amount</span>
              <span className="font-bold text-[#009E73]">${config.wifeSS}</span>
            </label>
            <input type="range" name="wifeSS" min="0" max="5000" step="50" value={config.wifeSS} onChange={handleChange} className="w-full accent-[#009E73]" />
          </div>
        </div>

        {/* Expenses & Taxes */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1a365d] mb-4 border-b pb-2">Expenses & Taxes</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Essential Spending</span>
              <span className="font-bold text-[#D55E00]">${config.essentialSpending}</span>
            </label>
            <input type="range" name="essentialSpending" min="5000" max="20000" step="100" value={config.essentialSpending} onChange={handleChange} className="w-full accent-[#D55E00]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Discretionary Spending</span>
              <span className="font-bold text-[#D55E00]">${config.discretionarySpending}</span>
            </label>
            <input type="range" name="discretionarySpending" min="0" max="10000" step="100" value={config.discretionarySpending} onChange={handleChange} className="w-full accent-[#D55E00]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Insurance Premium</span>
              <span className="font-bold text-[#D55E00]">${config.insurancePremium}</span>
            </label>
            <input type="range" name="insurancePremium" min="0" max="2000" step="10" value={config.insurancePremium} onChange={handleChange} className="w-full accent-[#D55E00]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Insurance Ends (At Your Age)</span>
              <span className="font-bold text-[#D55E00]">{config.insuranceEndAge}</span>
            </label>
            <input type="range" name="insuranceEndAge" min="55" max="80" step="1" value={config.insuranceEndAge} onChange={handleChange} className="w-full accent-[#D55E00]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Medicare Base Cost (Age 65+)</span>
              <span className="font-bold text-[#D55E00]">${config.medicarePremium}</span>
            </label>
            <input type="range" name="medicarePremium" min="0" max="1000" step="10" value={config.medicarePremium} onChange={handleChange} className="w-full accent-[#D55E00]" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Effective Tax Rate</span>
              <span className="font-bold text-gray-700">{(config.effectiveTaxRate * 100).toFixed(1)}%</span>
            </label>
            <input type="range" name="effectiveTaxRate" min="0" max="35" step="0.5" value={config.effectiveTaxRate * 100} onChange={handleChange} className="w-full accent-gray-600" />
          </div>
        </div>

      </div>
    </div>
  );
};
