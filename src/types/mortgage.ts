export interface Scenario {
  id?: number;
  name: string;
  amount: number;
  years: number;
  tan: number;
  setupFee: number;
  appraisalFee: number;
  monthlyFee: number;
  insuranceCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fees {
  setupFee: number;
  appraisalFee: number;
  monthlyFee: number;
  insuranceCost: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AnnualSummary {
  year: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  endBalance: number;
  rows: AmortizationRow[];
}

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  taeg: number;
  totalFees: number;
  schedule: AmortizationRow[];
  crossoverMonth: number | null;
}

export interface MortgageInputs {
  amount: number;
  years: number;
  tan: number;
  fees: Fees;
}
