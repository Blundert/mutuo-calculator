import type { AmortizationRow, Fees, AnnualSummary } from '../types/mortgage'

export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (annualRate === 0) {
    return principal / (years * 12)
  }
  const r = annualRate / 100 / 12
  const n = years * 12
  return principal * r / (1 - Math.pow(1 + r, -n))
}

export function amortizationSchedule(
  principal: number,
  annualRate: number,
  years: number
): AmortizationRow[] {
  const r = annualRate / 100 / 12
  const n = years * 12
  const payment = monthlyPayment(principal, annualRate, years)
  const rows: AmortizationRow[] = []
  let balance = principal

  for (let i = 1; i <= n; i++) {
    const interest = balance * r
    const principalPart = payment - interest
    balance = Math.max(0, balance - principalPart)
    rows.push({
      month: i,
      year: Math.ceil(i / 12),
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    })
  }

  return rows
}

export function annualSummaries(schedule: AmortizationRow[]): AnnualSummary[] {
  const byYear = new Map<number, AmortizationRow[]>()
  for (const row of schedule) {
    if (!byYear.has(row.year)) byYear.set(row.year, [])
    byYear.get(row.year)!.push(row)
  }

  const summaries: AnnualSummary[] = []
  for (const [year, rows] of byYear) {
    summaries.push({
      year,
      totalPayment: rows.reduce((s, r) => s + r.payment, 0),
      totalPrincipal: rows.reduce((s, r) => s + r.principal, 0),
      totalInterest: rows.reduce((s, r) => s + r.interest, 0),
      endBalance: rows[rows.length - 1].balance,
      rows,
    })
  }
  return summaries
}

export function calculateTAEG(
  principal: number,
  annualRate: number,
  years: number,
  fees: Fees
): number {
  const n = years * 12
  const basePayment = monthlyPayment(principal, annualRate, years)
  const effectivePayment = basePayment + fees.monthlyFee

  // Initial outflow: principal minus upfront fees (istruttoria + perizia + assicurazione)
  const upfrontFees = fees.setupFee + fees.appraisalFee + fees.insuranceCost
  const netPrincipal = principal - upfrontFees

  // IRR via Newton-Raphson
  // We find monthly rate r such that:
  // netPrincipal = sum_{t=1}^{n} effectivePayment / (1+r)^t

  let rate = annualRate / 100 / 12  // initial guess

  for (let iter = 0; iter < 1000; iter++) {
    let f = -netPrincipal
    let df = 0
    for (let t = 1; t <= n; t++) {
      const disc = Math.pow(1 + rate, t)
      f += effectivePayment / disc
      df -= t * effectivePayment / (disc * (1 + rate))
    }
    const newRate = rate - f / df
    if (Math.abs(newRate - rate) < 1e-10) {
      rate = newRate
      break
    }
    rate = newRate
  }

  // Convert monthly rate to annual (TAEG)
  return (Math.pow(1 + rate, 12) - 1) * 100
}

export function crossoverPoint(schedule: AmortizationRow[]): number | null {
  for (const row of schedule) {
    if (row.principal > row.interest) return row.month
  }
  return null
}

export function totalFees(fees: Fees, years: number): number {
  return fees.setupFee + fees.appraisalFee + fees.insuranceCost + fees.monthlyFee * years * 12
}
