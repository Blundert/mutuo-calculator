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

export interface ChecklistItemData {
  id: string
  label: string
  subItems: string[]
}

export interface ChecklistSectionData {
  id: string
  number: number
  title: string
  duration?: string
  warning?: string
  items: ChecklistItemData[]
}

export interface ChecklistItemState {
  id?: number
  scenarioId: number
  itemId: string   // "s1-i2" = section 1 item index 2, "custom-{id}" = custom item
  checked: boolean
  note: string
  updatedAt: Date
}

export interface CustomChecklistItem {
  id?: number
  scenarioId: number
  sectionId: string
  label: string
  createdAt: Date
}

export interface CustomSection {
  id?: number
  scenarioId: number
  title: string
  createdAt: Date
}

export interface CustomSubItem {
  id?: number
  parentItemId: string   // "s1-i0" | "custom-42"
  label: string
  createdAt: Date
}

export interface WikiItemState {
  id?: number
  itemId: string
  studied: boolean
  note: string
  updatedAt?: Date
}

export interface WikiConceptData {
  id: string
  title: string
  subtitle?: string
  body: string
}

export interface WikiSectionData {
  id: string
  title: string
  concepts: WikiConceptData[]
}
