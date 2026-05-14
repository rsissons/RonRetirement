import type { AppConfig } from './config';

export interface MonthlyData {
  age: number;
  yearIndex: number;
  monthIndex: number; // 0-11
  
  // Income
  pension: number;
  wifeSalary: number;
  wifeSS: number;
  yourSS: number;
  totalIncome: number;
  
  // Expenses
  spending: number;
  insurance: number;
  totalExpenses: number;
  
  // Gap
  gap: number;
  
  // Withdrawals & Conversions
  withdrawal403b: number;
  withdrawalRoth: number;
  conversionToRoth: number;
  
  // Balances
  balance403b: number;
  balanceRoth: number;
}

export interface YearlyData {
  age: number;
  yearIndex: number;
  
  totalPension: number;
  totalWifeSalary: number;
  totalWifeSS: number;
  totalYourSS: number;
  totalIncome: number;
  
  totalSpending: number;
  totalInsurance: number;
  totalExpenses: number;
  
  totalGap: number;
  
  totalWithdrawal403b: number;
  totalWithdrawalRoth: number;
  totalConversionToRoth: number;
  
  endBalance403b: number;
  endBalanceRoth: number;
  
  months: MonthlyData[];
}

export interface ProjectionResult {
  yearly: YearlyData[];
  metrics: {
    year403bDepleted: number | null;
    peakRothBalance: number;
    rothBalanceAt85: number;
    lifetimePension: number;
    lifetimeSS: number;
    total403bWithdrawn: number;
    totalRothWithdrawn: number;
  };
}

export function calculateProjection(config: AppConfig): ProjectionResult {
  let current403b = config.starting403b;
  let currentRoth = config.startingRoth;
  
  let currentPension = config.pensionStart;
  let currentSpending = config.spendingStart;
  
  const yearlyData: YearlyData[] = [];
  
  let year403bDepleted: number | null = null;
  let peakRothBalance = currentRoth;
  let rothBalanceAt85 = 0;
  
  let lifetimePension = 0;
  let lifetimeSS = 0;
  let total403bWithdrawn = 0;
  let totalRothWithdrawn = 0;
  
  for (let year = 0; year < config.projectionYears; year++) {
    const currentAge = config.retirementAge + year;
    
    // Annual COLA/Inflation applied at the start of each new year
    if (year > 0) {
      currentPension *= (1 + config.pensionCOLA);
      currentSpending *= (1 + config.spendingInflation);
    }
    
    const yearObj: YearlyData = {
      age: currentAge,
      yearIndex: year,
      totalPension: 0,
      totalWifeSalary: 0,
      totalWifeSS: 0,
      totalYourSS: 0,
      totalIncome: 0,
      totalSpending: 0,
      totalInsurance: 0,
      totalExpenses: 0,
      totalGap: 0,
      totalWithdrawal403b: 0,
      totalWithdrawalRoth: 0,
      totalConversionToRoth: 0,
      endBalance403b: 0,
      endBalanceRoth: 0,
      months: []
    };
    
    for (let month = 0; month < 12; month++) {
      // 0.5% growth applied to balances
      current403b *= (1 + config.monthlyReturn);
      currentRoth *= (1 + config.monthlyReturn);
      
      const pension = currentPension;
      
      // Wife works for specific years
      const wifeSalary = year < config.wifeSalaryYears ? config.wifeSalary : 0;
      
      // Wife SS starts
      const wifeSS = currentAge >= config.wifeSSStartAge ? config.wifeSS : 0;
      
      // Your SS starts
      const yourSS = currentAge >= config.yourSSStartAge ? config.yourSS : 0;
      
      const totalIncome = pension + wifeSalary + wifeSS + yourSS;
      
      const spending = currentSpending;
      // Insurance stops when you reach the end age
      const insurance = currentAge < config.insuranceEndAge ? config.insurancePremium : 0;
      const totalExpenses = spending + insurance;
      
      const gap = totalExpenses > totalIncome ? totalExpenses - totalIncome : 0;
      
      let withdrawal403b = 0;
      let withdrawalRoth = 0;
      let conversionToRoth = 0;
      
      let remainingGap = gap;
      
      if (current403b > 0) {
        if (current403b >= remainingGap) {
          withdrawal403b = remainingGap;
          current403b -= remainingGap;
          remainingGap = 0;
        } else {
          withdrawal403b = current403b;
          remainingGap -= current403b;
          current403b = 0;
          if (year403bDepleted === null) year403bDepleted = currentAge;
        }
      }
      
      // If 403b depleted, withdraw from Roth
      if (remainingGap > 0) {
        if (currentRoth >= remainingGap) {
          withdrawalRoth = remainingGap;
          currentRoth -= remainingGap;
          remainingGap = 0;
        } else {
          withdrawalRoth = currentRoth;
          remainingGap -= currentRoth;
          currentRoth = 0;
        }
      }
      
      // Discretionary Roth Extra Withdrawal
      const rothExtraMonthly = config.rothExtraWithdrawal / 12;
      if (currentRoth >= rothExtraMonthly) {
        currentRoth -= rothExtraMonthly;
        withdrawalRoth += rothExtraMonthly;
      } else if (currentRoth > 0) {
        withdrawalRoth += currentRoth;
        currentRoth = 0;
      }
      
      if (current403b > 0) {
        conversionToRoth = Math.min(current403b, config.maxMonthlyConversion);
        current403b -= conversionToRoth;
        currentRoth += conversionToRoth;
      }
      
      if (current403b === 0 && withdrawal403b > 0 && year403bDepleted === null) {
        year403bDepleted = currentAge;
      }
      
      if (currentRoth > peakRothBalance) {
        peakRothBalance = currentRoth;
      }
      
      if (currentAge === 85 && month === 11) {
        rothBalanceAt85 = currentRoth;
      }
      
      lifetimePension += pension;
      lifetimeSS += (wifeSS + yourSS);
      total403bWithdrawn += withdrawal403b;
      totalRothWithdrawn += withdrawalRoth;
      
      const monthObj: MonthlyData = {
        age: currentAge,
        yearIndex: year,
        monthIndex: month,
        pension,
        wifeSalary,
        wifeSS,
        yourSS,
        totalIncome,
        spending,
        insurance,
        totalExpenses,
        gap,
        withdrawal403b,
        withdrawalRoth,
        conversionToRoth,
        balance403b: current403b,
        balanceRoth: currentRoth
      };
      
      yearObj.months.push(monthObj);
      
      yearObj.totalPension += pension;
      yearObj.totalWifeSalary += wifeSalary;
      yearObj.totalWifeSS += wifeSS;
      yearObj.totalYourSS += yourSS;
      yearObj.totalIncome += totalIncome;
      yearObj.totalSpending += spending;
      yearObj.totalInsurance += insurance;
      yearObj.totalExpenses += totalExpenses;
      yearObj.totalGap += gap;
      yearObj.totalWithdrawal403b += withdrawal403b;
      yearObj.totalWithdrawalRoth += withdrawalRoth;
      yearObj.totalConversionToRoth += conversionToRoth;
    }
    
    yearObj.endBalance403b = current403b;
    yearObj.endBalanceRoth = currentRoth;
    
    yearlyData.push(yearObj);
  }
  
  return {
    yearly: yearlyData,
    metrics: {
      year403bDepleted,
      peakRothBalance,
      rothBalanceAt85,
      lifetimePension,
      lifetimeSS,
      total403bWithdrawn,
      totalRothWithdrawn
    }
  };
}
