import { useState, useEffect, useCallback } from 'react'
import type { Scenario, MortgageInputs } from '../types/mortgage'
import { getAllScenarios, saveScenario, deleteScenario, duplicateScenario, updateScenarioInputs, updateScenario } from '../lib/db'

const DEFAULT_INPUTS: MortgageInputs = {
  amount: 200000,
  years: 20,
  tan: 3.5,
  fees: {
    setupFee: 0,
    appraisalFee: 0,
    monthlyFee: 0,
    insuranceCost: 0,
  },
  additionalCosts: {
    downPayment: 0,
    notaryAgencyTaxes: 0,
    renovationFurniture: 0,
    condoFeesAnnual: 0,
    maintenanceAnnual: 0,
    tariInsuranceAnnual: 0,
  },
}

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getAllScenarios()
      setScenarios(all)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (): Promise<number> => {
    const all = await getAllScenarios()
    const name = `Scenario ${all.length + 1}`
    const id = await saveScenario({
      name,
      amount: DEFAULT_INPUTS.amount,
      years: DEFAULT_INPUTS.years,
      tan: DEFAULT_INPUTS.tan,
      setupFee: DEFAULT_INPUTS.fees.setupFee,
      appraisalFee: DEFAULT_INPUTS.fees.appraisalFee,
      monthlyFee: DEFAULT_INPUTS.fees.monthlyFee,
      insuranceCost: DEFAULT_INPUTS.fees.insuranceCost,
      downPayment: DEFAULT_INPUTS.additionalCosts.downPayment,
      notaryAgencyTaxes: DEFAULT_INPUTS.additionalCosts.notaryAgencyTaxes,
      renovationFurniture: DEFAULT_INPUTS.additionalCosts.renovationFurniture,
      condoFeesAnnual: DEFAULT_INPUTS.additionalCosts.condoFeesAnnual,
      maintenanceAnnual: DEFAULT_INPUTS.additionalCosts.maintenanceAnnual,
      tariInsuranceAnnual: DEFAULT_INPUTS.additionalCosts.tariInsuranceAnnual,
    })
    await refresh()
    return id
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    await deleteScenario(id)
    await refresh()
  }, [refresh])

  const duplicate = useCallback(async (id: number): Promise<number> => {
    const newId = await duplicateScenario(id)
    await refresh()
    return newId
  }, [refresh])

  const updateInputs = useCallback(async (id: number, inputs: MortgageInputs) => {
    await updateScenarioInputs(id, inputs)
    setScenarios(prev => prev.map(s => s.id === id ? {
      ...s,
      amount: inputs.amount,
      years: inputs.years,
      tan: inputs.tan,
      setupFee: inputs.fees.setupFee,
      appraisalFee: inputs.fees.appraisalFee,
      monthlyFee: inputs.fees.monthlyFee,
      insuranceCost: inputs.fees.insuranceCost,
      downPayment: inputs.additionalCosts.downPayment,
      notaryAgencyTaxes: inputs.additionalCosts.notaryAgencyTaxes,
      renovationFurniture: inputs.additionalCosts.renovationFurniture,
      condoFeesAnnual: inputs.additionalCosts.condoFeesAnnual,
      maintenanceAnnual: inputs.additionalCosts.maintenanceAnnual,
      tariInsuranceAnnual: inputs.additionalCosts.tariInsuranceAnnual,
      updatedAt: new Date(),
    } : s))
  }, [])

  const rename = useCallback(async (id: number, name: string) => {
    await updateScenario(id, { name })
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, name } : s))
  }, [])

  return { scenarios, loading, create, remove, duplicate, updateInputs, rename, refresh }
}
