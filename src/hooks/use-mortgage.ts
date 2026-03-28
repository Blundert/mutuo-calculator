import { useMemo } from 'react'
import type { MortgageInputs, MortgageResult } from '../types/mortgage'
import {
  monthlyPayment,
  amortizationSchedule,
  calculateTAEG,
  crossoverPoint,
  totalFees,
} from '../lib/mortgage-math'

export function useMortgage(inputs: MortgageInputs): MortgageResult {
  return useMemo(() => {
    const { amount, years, tan, fees } = inputs

    if (amount <= 0 || years <= 0 || tan < 0) {
      return {
        monthlyPayment: 0,
        totalInterest: 0,
        totalPaid: 0,
        taeg: 0,
        totalFees: 0,
        schedule: [],
        crossoverMonth: null,
      }
    }

    const payment = monthlyPayment(amount, tan, years)
    const schedule = amortizationSchedule(amount, tan, years)
    const totalPaid = payment * years * 12
    const totalInterest = totalPaid - amount
    const taeg = calculateTAEG(amount, tan, years, fees)
    const feesTotal = totalFees(fees, years)
    const crossoverMonth = crossoverPoint(schedule)

    return {
      monthlyPayment: payment,
      totalInterest,
      totalPaid,
      taeg,
      totalFees: feesTotal,
      schedule,
      crossoverMonth,
    }
  }, [inputs.amount, inputs.years, inputs.tan, inputs.fees.setupFee, inputs.fees.appraisalFee, inputs.fees.monthlyFee, inputs.fees.insuranceCost])
}
