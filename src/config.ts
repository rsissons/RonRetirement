export interface AppConfig {
  retirementAge: number;
  projectionYears: number;
  annualReturn: number;
  monthlyReturn: number;
  
  // Income
  pensionStart: number;
  pensionCOLA: number;
  
  wifeSalary: number;
  wifeSalaryYears: number; // How many years she works after you retire
  
  wifeSS: number;
  wifeSSStartAge: number; // YOUR age when her SS starts
  
  yourSS: number;
  yourSSStartAge: number; // YOUR age when your SS starts
  
  // Expenses
  spendingStart: number;
  spendingInflation: number;
  
  rothExtraWithdrawal: number; // Discretionary annual Roth withdrawal
  
  insurancePremium: number;
  insuranceEndAge: number; // YOUR age when insurance stops (e.g. 60 meaning it covers age 60 and stops at 61, or 61 meaning it covers up to and including 61. If she is 4 years older, she hits 65 when you hit 61. So insurance stops when you hit 61. We'll say it covers you while age < 61).
  
  // Assets
  starting403b: number;
  startingRoth: number;
  maxMonthlyConversion: number;
}

export const defaultConfig: AppConfig = {
  retirementAge: 59,
  projectionYears: 30,
  annualReturn: 0.06,
  monthlyReturn: 0.06 / 12,
  
  // From CalPERS Estimate (100% Beneficiary Option)
  pensionStart: 11441, 
  pensionCOLA: 0.02,
  
  // Wife works 1 year when you retire
  wifeSalary: 4500,
  wifeSalaryYears: 1, 
  
  // Wife SS kicks in after 1 year (when you are 60)
  wifeSS: 1800,
  wifeSSStartAge: 60,
  
  // Your SS kicks in at 62
  yourSS: 2250,
  yourSSStartAge: 62,
  
  spendingStart: 13000,
  spendingInflation: 0.03,
  
  rothExtraWithdrawal: 0,
  
  // Insurance stops when she is 65. If she's 4 years older, you are 61.
  insurancePremium: 888,
  insuranceEndAge: 61, // Stops at 61 (so paid during 59 and 60)
  
  starting403b: 136500,
  startingRoth: 0,
  maxMonthlyConversion: 2500,
};
