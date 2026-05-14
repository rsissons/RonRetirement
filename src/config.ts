export interface AppConfig {
  retirementAge: number;
  projectionYears: number;
  annualReturn: number;
  monthlyReturn: number;
  pensionStart: number;
  pensionCOLA: number;
  spendingStart: number;
  spendingInflation: number;
  wifeSalaryAt59: number;
  wifeSSAt61: number;
  yourSSAt62: number;
  insuranceUntil61: number;
  starting403b: number;
  startingRoth: number;
  maxMonthlyConversion: number;
}

export const defaultConfig: AppConfig = {
  retirementAge: 59,
  projectionYears: 30,
  annualReturn: 0.06,
  monthlyReturn: 0.06 / 12,
  pensionStart: 10100,
  pensionCOLA: 0.02,
  spendingStart: 16000,
  spendingInflation: 0.03,
  wifeSalaryAt59: 4500,
  wifeSSAt61: 1800,
  yourSSAt62: 2250,
  insuranceUntil61: 888,
  starting403b: 136500,
  startingRoth: 0,
  maxMonthlyConversion: 2500,
};
