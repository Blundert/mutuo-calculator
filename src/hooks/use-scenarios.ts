import { useState, useEffect, useCallback } from 'react'
import type { Scenario, MortgageInputs } from '../types/mortgage'
import { getAllScenarios, saveScenario, deleteScenario, duplicateScenario, updateScenarioInputs, updateScenario, getScenarioChecklistData, addCustomSection, addCustomItem, addCustomSubItem, setChecklistState } from '../lib/db'

export interface ChecklistStateExport {
  itemId: string
  checked: boolean
  note: string
}

export interface CustomSectionExport {
  exportId: number
  title: string
}

export interface CustomItemExport {
  exportId: number
  sectionId: string
  label: string
}

export interface CustomSubItemExport {
  exportId: number
  parentItemId: string
  label: string
}

export interface ChecklistExport {
  states: ChecklistStateExport[]
  customSections: CustomSectionExport[]
  customItems: CustomItemExport[]
  customSubItems: CustomSubItemExport[]
}

export interface ScenarioExport {
  name: string
  amount: number
  years: number
  tan: number
  setupFee: number
  appraisalFee: number
  monthlyFee: number
  insuranceCost: number
  houseValue?: number
  downPayment: number
  notaryAgencyTaxes: number
  renovationFurniture: number
  condoFeesAnnual: number
  maintenanceAnnual: number
  tariInsuranceAnnual: number
  checklist?: ChecklistExport
}

export interface ScenarioImportFile {
  version: number
  exportedAt: string
  scenarios: ScenarioExport[]
}

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
    houseValue: 0,
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

  const importScenarios = useCallback(async (data: ScenarioImportFile) => {
    for (const s of data.scenarios) {
      const newScenarioId = await saveScenario({
        name: s.name,
        amount: s.amount,
        years: s.years,
        tan: s.tan,
        setupFee: s.setupFee ?? 0,
        appraisalFee: s.appraisalFee ?? 0,
        monthlyFee: s.monthlyFee ?? 0,
        insuranceCost: s.insuranceCost ?? 0,
        houseValue: s.houseValue,
        downPayment: s.downPayment ?? 0,
        notaryAgencyTaxes: s.notaryAgencyTaxes ?? 0,
        renovationFurniture: s.renovationFurniture ?? 0,
        condoFeesAnnual: s.condoFeesAnnual ?? 0,
        maintenanceAnnual: s.maintenanceAnnual ?? 0,
        tariInsuranceAnnual: s.tariInsuranceAnnual ?? 0,
      })

      const cl = s.checklist
      if (!cl) continue

      // sectionId remap: "cs-{oldId}" → "cs-{newId}"
      const sectionIdMap = new Map<string, string>()
      for (const sec of cl.customSections) {
        const newId = await addCustomSection(newScenarioId, sec.title)
        sectionIdMap.set(`cs-${sec.exportId}`, `cs-${newId}`)
      }

      // customItem remap: "custom-{oldId}" → "custom-{newId}"
      const customItemIdMap = new Map<string, string>()
      for (const item of cl.customItems) {
        const remappedSectionId = sectionIdMap.get(item.sectionId) ?? item.sectionId
        const newId = await addCustomItem(newScenarioId, remappedSectionId, item.label)
        customItemIdMap.set(`custom-${item.exportId}`, `custom-${newId}`)
      }

      // customSubItem remap: "sub-{oldId}" → "sub-{newId}"
      const subItemIdMap = new Map<string, string>()
      for (const sub of cl.customSubItems) {
        const remappedParentId = customItemIdMap.get(sub.parentItemId) ?? sub.parentItemId
        const newId = await addCustomSubItem(remappedParentId, sub.label)
        subItemIdMap.set(`sub-${sub.exportId}`, `sub-${newId}`)
      }

      // checklist states with remapped itemIds
      for (const state of cl.states) {
        let itemId = state.itemId
        if (customItemIdMap.has(itemId)) itemId = customItemIdMap.get(itemId)!
        else if (subItemIdMap.has(itemId)) itemId = subItemIdMap.get(itemId)!
        await setChecklistState(newScenarioId, itemId, state.checked, state.note)
      }
    }
    await refresh()
  }, [refresh])

  return { scenarios, loading, create, remove, duplicate, updateInputs, rename, refresh, importScenarios }
}
