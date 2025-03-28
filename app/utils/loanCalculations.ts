// Calculate Monthly Installment (Reducing Balance)
export const calculateMonthlyInstallment = (
    principal: number,
    annualRate: number,
    months: number
  ): number => {
    const monthlyRate = annualRate / 12 / 100;
    return parseFloat(
      ((principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)).toFixed(2)
    );
  };
  
  // Calculate Penalty for Late Payments
  export const calculatePenalty = (
    overdueDays: number,
    penaltyRate: number,
    balance: number
  ): number => {
    return parseFloat(((overdueDays * penaltyRate * balance) / 100).toFixed(2));
  };
  