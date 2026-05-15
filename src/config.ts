export interface Config {
  projectionYears: number;

  starting403b: number;
  startingRoth: number;

  annualReturn: number;

  pensionStart: number;
  pensionCOLA: number;

  wifeSalary: number;          // Monthly salary while she's still working
  wifeRetirementAge: number;   // Age at which wife stops working (and SS starts)
  wifeAgeDifference: number;   // How many years older the wife is than Ron

  wifeSS: number;
  wifeSSStartAge: number;      // Wife's age when her SS starts (usually same as wifeRetirementAge)

  yourSS: number;
  yourSSStartAge: number;

  essentialSpending: number;
  discretionarySpending: number;
  spendingInflation: number;

  effectiveTaxRate: number;

  rothExtraWithdrawal: number;

  insurancePremium: number;       // Wife's monthly private insurance (until her age 65)
  wifeInsuranceEndAge: number;    // Wife's age when private insurance ends (→ Medicare)
  medicarePremium: number;        // Wife's Medicare cost after her age 65 (Ron = $0, CalPERS covers him)
  healthcareInflation: number;

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

  wifeSalary: 4500,            // Wife's monthly salary while working
  wifeRetirementAge: 64,       // Wife stops working at 62
  wifeAgeDifference: 3.79,     // Wife is ~3y 9mo older than Ron (born 5/12/1966 vs 2/25/1970)

  wifeSS: 1800,
  wifeSSStartAge: 62,          // Wife's SS starts at her age 62

  yourSS: 2250,
  yourSSStartAge: 62,

  essentialSpending: 10000,
  discretionarySpending: 3000,
  spendingInflation: 0.02,

  effectiveTaxRate: 0.12,

  rothExtraWithdrawal: 0,

  insurancePremium: 888,          // Wife's private insurance until she's 65
  wifeInsuranceEndAge: 65,        // Wife goes on Medicare at 65; Ron covered by CalPERS forever
  medicarePremium: 174,           // Wife's Medicare Part B only (~$174/mo 2024); Ron = $0
  healthcareInflation: 0.031,

  retirementAge: 59,
  yourRetirementDate: '2029-10-31',
  wifeRetirementDate: '2030-01-31',

  maxMonthlyConversion: 2500,
};
