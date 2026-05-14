export interface Config {
  projectionYears: number;
  
  starting403b: number;
  startingRoth: number;
  
  annualReturn: number;
  
  pensionStart: number;
  pensionCOLA: number;
  
  wifeSalaryYears1_2: number;
  
  wifeSS: number;
  wifeSSStartAge: number;
  
  yourSS: number;
  yourSSStartAge: number;
  
  essentialSpending: number;
  discretionarySpending: number;
  spendingInflation: number;
  
  effectiveTaxRate: number;
  
  rothExtraWithdrawal: number;
  
  insurancePremium: number;
  insuranceEndAge: number;
  medicarePremium: number; // New: Medicare costs after 65
  healthcareInflation: number; // New: Healthcare specific inflation
  
  retirementAge: number;
  yourRetirementDate: string;
  wifeRetirementDate: string;
  
  maxMonthlyConversion: number;
}

export const defaultConfig: Config = {
  projectionYears: 30,
  
  starting403b: 136500,
  startingRoth: 0,
  
  annualReturn: 0.06,
  
  pensionStart: 11441,
  pensionCOLA: 0.02,
  
  wifeSalaryYears1_2: 4500,
  
  wifeSS: 1800,
  wifeSSStartAge: 60,
  
  yourSS: 2250,
  yourSSStartAge: 62,
  
  essentialSpending: 10000,
  discretionarySpending: 3000,
  spendingInflation: 0.03,
  
  effectiveTaxRate: 0.12,
  
  rothExtraWithdrawal: 0,
  
  insurancePremium: 888,
  insuranceEndAge: 61,
  medicarePremium: 350, // Approx base Medicare B + Supplement for two
  healthcareInflation: 0.05,
  
  retirementAge: 59,
  yourRetirementDate: '2029-10-31',
  wifeRetirementDate: '2030-01-31',
  
  maxMonthlyConversion: 2500,
};
