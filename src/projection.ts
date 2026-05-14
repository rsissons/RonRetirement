import type { Config } from './config';

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
  
  // Expenses & Taxes
  essentialSpending: number;
  discretionarySpending: number;
  insurance: number;
  medicare: number;
  incomeTaxes: number;      // Tax on pension, salary, SS
  conversionTaxes: number;  // Tax on 403b→Roth conversions
  taxes: number;            // Total taxes (income + conversion)
  totalExpenses: number;
  
  // Net Income & Gap
  netIncome: number;
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
  
  totalEssentialSpending: number;
  totalDiscretionarySpending: number;
  totalInsurance: number;
  totalMedicare: number;
  totalIncomeTaxes: number;
  totalConversionTaxes: number;
  totalTaxes: number;
  totalExpenses: number;
  
  totalNetIncome: number;
  totalGap: number;
  
  totalWithdrawal403b: number;
  totalWithdrawalRoth: number;
  totalConversionToRoth: number;
  
  endBalance403b: number;
  endBalanceRoth: number;
  
  notes: string[];
  
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
    safeWithdrawalRate: number;
    bucketIncome: number;
    bucketConservative: number;
    bucketModerate: number;
  };
}

// Helper used in note generation
const formatNote = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export function calculateProjection(config: Config): ProjectionResult {
  let current403b = config.starting403b;
  let currentRoth = config.startingRoth;
  
  // All config spending/income values are MONTHLY figures.
  // currentPension tracks the monthly pension amount, inflated by COLA each year.
  let currentPension = config.pensionStart;
  let currentEssentialSpending = config.essentialSpending;
  let currentDiscretionarySpending = config.discretionarySpending;
  let currentMedicarePremium = config.medicarePremium;
  
  const yearlyData: YearlyData[] = [];
  
  let year403bDepleted: number | null = null;
  let peakRothBalance = currentRoth;
  let rothBalanceAt85 = 0;
  
  let total403bWithdrawn = 0;
  let totalRothWithdrawn = 0;
  
  let lifetimePension = 0;
  let lifetimeSS = 0;
  
  let bucketIncome = 0;
  let bucketConservative = 0;
  let bucketModerate = 0;
  
  let year1TotalWithdrawals = 0;
  const year1StartingAssets = config.starting403b + config.startingRoth;
  
  for (let year = 0; year < config.projectionYears; year++) {
    const currentAge = config.retirementAge + year;
    
    // Annual COLA/Inflation applied at the start of each new year
    if (year > 0) {
      currentPension *= (1 + config.pensionCOLA);
      currentEssentialSpending *= (1 + config.spendingInflation);
      currentDiscretionarySpending *= (1 + config.spendingInflation);
      currentMedicarePremium *= (1 + config.healthcareInflation);
    }
    
    const yearObj: YearlyData = {
      age: currentAge,
      yearIndex: year,
      totalPension: 0,
      totalWifeSalary: 0,
      totalWifeSS: 0,
      totalYourSS: 0,
      totalIncome: 0,
      totalEssentialSpending: 0,
      totalDiscretionarySpending: 0,
      totalInsurance: 0,
      totalMedicare: 0,
      totalIncomeTaxes: 0,
      totalConversionTaxes: 0,
      totalTaxes: 0,
      totalExpenses: 0,
      totalNetIncome: 0,
      totalGap: 0,
      totalWithdrawal403b: 0,
      totalWithdrawalRoth: 0,
      totalConversionToRoth: 0,
      endBalance403b: 0,
      endBalanceRoth: 0,
      notes: [],
      months: []
    };
    
    for (let month = 0; month < 12; month++) {
      // Monthly compounding
      current403b *= (1 + (config.annualReturn / 12));
      currentRoth *= (1 + (config.annualReturn / 12));
      
      // All values below are MONTHLY — config stores monthly figures already.
      const pension = currentPension;
      const wifeSalary = year < 2 ? config.wifeSalaryYears1_2 : 0;
      
      // Wife SS starts (monthly amount from config)
      const wifeSS = currentAge >= config.wifeSSStartAge ? config.wifeSS : 0;
      
      // Your SS starts (monthly amount from config)
      const yourSS = currentAge >= config.yourSSStartAge ? config.yourSS : 0;
      
      const totalIncome = pension + wifeSalary + wifeSS + yourSS;
      
      // Essential and discretionary are monthly from config
      const essentialSpending = currentEssentialSpending;
      const discretionarySpending = currentDiscretionarySpending;
      // Insurance stops when you reach the end age
      const insurance = currentAge <= config.insuranceEndAge ? config.insurancePremium : 0;
      // Medicare starts at age 65
      const medicare = currentAge >= 65 ? currentMedicarePremium : 0;
      
      // Income taxes on guaranteed income
      const taxableIncomeEstimate = pension + wifeSalary + wifeSS + yourSS;
      const incomeTaxes = taxableIncomeEstimate * config.effectiveTaxRate;
      
      // --- Step 1: Do Roth conversion FIRST so we know all costs ---
      let withdrawal403b = 0;
      let withdrawalRoth = 0;
      let conversionToRoth = 0;

      if (current403b > 0) {
        conversionToRoth = Math.min(current403b, config.maxMonthlyConversion);
        current403b -= conversionToRoth;
        currentRoth += conversionToRoth;
      }

      // Tax on conversion (comes out of pocket — treated as expense)
      const conversionTaxes = conversionToRoth * config.effectiveTaxRate;

      // --- Step 2: Now compute the REAL total taxes and gap ---
      const totalTaxes = incomeTaxes + conversionTaxes;
      const totalExpenses = essentialSpending + discretionarySpending + insurance + medicare + totalTaxes;
      const netIncome = totalIncome - totalTaxes - insurance - medicare;
      
      // Gap = what income DOESN'T cover. Positive = shortfall, negative = surplus
      const gap = totalExpenses - totalIncome;
      
      // --- Step 3: Cover any shortfall from 403b first, then Roth ---
      let remainingGap = gap > 0 ? gap : 0;
      
      if (current403b > 0 && remainingGap > 0) {
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
      
      if (year === 0) {
         year1TotalWithdrawals += (withdrawal403b + withdrawalRoth);
      }
      
      if (gap > 0) {
         if (year >= 0 && year <= 2) bucketIncome += gap;
         else if (year >= 3 && year <= 5) bucketConservative += gap;
         else if (year >= 6 && year <= 8) bucketModerate += gap;
      }
      
      const monthObj: MonthlyData = {
        age: currentAge,
        yearIndex: year,
        monthIndex: month,
        pension,
        wifeSalary,
        wifeSS,
        yourSS,
        totalIncome,
        essentialSpending,
        discretionarySpending,
        insurance,
        medicare,
        incomeTaxes,
        conversionTaxes,
        taxes: totalTaxes,
        totalExpenses,
        netIncome,
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
      yearObj.totalEssentialSpending += essentialSpending;
      yearObj.totalDiscretionarySpending += discretionarySpending;
      yearObj.totalInsurance += insurance;
      yearObj.totalMedicare += medicare;
      yearObj.totalIncomeTaxes += incomeTaxes;
      yearObj.totalConversionTaxes += conversionTaxes;
      yearObj.totalTaxes += totalTaxes;
      yearObj.totalExpenses += totalExpenses;
      yearObj.totalNetIncome += netIncome;
      yearObj.totalGap += gap;
      yearObj.totalWithdrawal403b += withdrawal403b;
      yearObj.totalWithdrawalRoth += withdrawalRoth;
      yearObj.totalConversionToRoth += conversionToRoth;
    }
    
    yearObj.endBalance403b = current403b;
    yearObj.endBalanceRoth = currentRoth;
    
    // --- Auto-generate notes for this year ---
    const notes: string[] = [];
    if (year === 0) notes.push('🎉 Retirement begins');
    if (yearObj.totalWifeSalary > 0) notes.push('👩‍💼 Wife still working');
    
    const firstMonth = yearObj.months[0];
    const prevYear = yearlyData[yearlyData.length - 1];
    
    // SS start events (compare first month of this year vs first month of last year)
    if (firstMonth.wifeSS > 0 && (prevYear === undefined || prevYear.months[0].wifeSS === 0)) {
      notes.push(`✅ Wife's SS begins (+${formatNote(config.wifeSS)}/mo)`);
    }
    if (firstMonth.yourSS > 0 && (prevYear === undefined || prevYear.months[0].yourSS === 0)) {
      notes.push(`✅ Your SS begins (+${formatNote(config.yourSS)}/mo)`);
    }
    
    // Insurance/Medicare transition
    if (firstMonth.insurance === 0 && (prevYear === undefined || prevYear.months[0].insurance > 0)) {
      notes.push(`💊 Insurance ends (save ${formatNote(config.insurancePremium)}/mo)`);
    }
    if (firstMonth.medicare > 0 && (prevYear === undefined || prevYear.months[0].medicare === 0)) {
      notes.push(`🏥 Medicare begins (~${formatNote(firstMonth.medicare)}/mo)`);
    }
    
    // 403b events
    if (yearObj.totalConversionToRoth > 0) {
      notes.push(`🔄 Roth conversion: ${formatNote(yearObj.totalConversionToRoth/12)}/mo`);
    }
    if (yearObj.totalWithdrawal403b > 0) {
      notes.push(`📤 Gap covered by 403b: ${formatNote(yearObj.totalWithdrawal403b/12)}/mo avg`);
    }
    if (yearObj.totalWithdrawalRoth > 0) {
      notes.push(`📤 Gap covered by Roth: ${formatNote(yearObj.totalWithdrawalRoth/12)}/mo avg`);
    }
    if (year403bDepleted === currentAge && yearObj.endBalance403b === 0) {
      notes.push('⚠️ 403b fully depleted — Roth is primary');
    }
    if (currentAge === 75) notes.push('📋 RMDs required starting this year');
    
    yearObj.notes = notes;
    
    yearlyData.push(yearObj);
  }
  
  const safeWithdrawalRate = year1StartingAssets > 0 ? (year1TotalWithdrawals / year1StartingAssets) * 100 : 0;

  return {
    yearly: yearlyData,
    metrics: {
      year403bDepleted,
      peakRothBalance,
      rothBalanceAt85,
      lifetimePension,
      lifetimeSS,
      total403bWithdrawn,
      totalRothWithdrawn,
      safeWithdrawalRate,
      bucketIncome,
      bucketConservative,
      bucketModerate
    }
  };
}
