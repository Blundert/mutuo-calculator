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
}

function getStoredActiveId(): number | null {
  const v = localStorage.getItem('activeScenarioId')
  return v ? Number(v) : null
}

function storeActiveId(id: number | null) {
  if (id === null) {
    localStorage.removeItem('activeScenarioId')
  } else {
    localStorage.setItem('activeScenarioId', String(id))
  }
}

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [activeScenarioId, setActiveScenarioIdState] = useState<number | null>(getStoredActiveId)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getAllScenarios()
      setScenarios(all)
      // If stored active scenario no longer exists, clear it
      const stored = getStoredActiveId()
      if (stored !== null && !all.find(s => s.id === stored)) {
        storeActiveId(null)
        setActiveScenarioIdState(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActive = useCallback((id: number | null) => {
    storeActiveId(id)
    setActiveScenarioIdState(id)
  }, [])

  const create = useCallback(async (): Promise<number> => {
    const count = (await getAllScenarios()).length
    const name = `Scenario ${count + 1}`
    const id = await saveScenario({
      name,
      amount: DEFAULT_INPUTS.amount,
      years: DEFAULT_INPUTS.years,
      tan: DEFAULT_INPUTS.tan,
      setupFee: DEFAULT_INPUTS.fees.setupFee,
      appraisalFee: DEFAULT_INPUTS.fees.appraisalFee,
      monthlyFee: DEFAULT_INPUTS.fees.monthlyFee,
      insuranceCost: DEFAULT_INPUTS.fees.insuranceCost,
    })
    await refresh()
    return id
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    await deleteScenario(id)
    if (activeScenarioId === id) {
      storeActiveId(null)
      setActiveScenarioIdState(null)
    }
    await refresh()
  }, [refresh, activeScenarioId])

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
      updatedAt: new Date(),
    } : s))
  }, [])

  const rename = useCallback(async (id: number, name: string) => {
    await updateScenario(id, { name })
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, name } : s))
  }, [])

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) ?? null

  return {
    scenarios, loading, activeScenarioId, activeScenario,
    setActive, create, remove, duplicate, updateInputs, rename, refresh,
  }
}
