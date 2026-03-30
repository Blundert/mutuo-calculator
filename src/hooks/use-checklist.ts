import { useState, useEffect, useCallback } from 'react'
import {
  getAllChecklistStatesByScenario, setChecklistState,
  getAllCustomItemsByScenario, addCustomItem, deleteCustomItem, updateCustomItem,
  getAllCustomSectionsByScenario, addCustomSection, deleteCustomSection, updateCustomSection,
  getAllCustomSubItems, addCustomSubItem, deleteCustomSubItem, updateCustomSubItem,
} from '../lib/db'
import type { ChecklistItemState, CustomChecklistItem, CustomSection, CustomSubItem } from '../types/mortgage'

export type StaticItemInfo = { id: string; subCount: number }
export type SectionInfo = { id: string; staticItems: StaticItemInfo[] }

export function useChecklist(scenarioId: number) {
  const [states, setStates] = useState<Map<string, ChecklistItemState>>(new Map())
  const [customItems, setCustomItems] = useState<Map<string, CustomChecklistItem[]>>(new Map())
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [customSubItems, setCustomSubItems] = useState<Map<string, CustomSubItem[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAllChecklistStatesByScenario(scenarioId),
      getAllCustomItemsByScenario(scenarioId),
      getAllCustomSectionsByScenario(scenarioId),
      getAllCustomSubItems(),
    ]).then(([allStates, allCustom, allSections, allSubs]) => {
      const stateMap = new Map<string, ChecklistItemState>()
      for (const s of allStates) stateMap.set(s.itemId, s)

      const customMap = new Map<string, CustomChecklistItem[]>()
      for (const item of allCustom) {
        const list = customMap.get(item.sectionId) ?? []
        list.push(item)
        customMap.set(item.sectionId, list)
      }

      // Filter sub-items to only those belonging to items in this scenario
      const scenarioItemIds = new Set<string>()
      for (const s of allStates) scenarioItemIds.add(s.itemId)
      for (const item of allCustom) {
        if (item.id !== undefined) scenarioItemIds.add(`custom-${item.id}`)
      }

      const subMap = new Map<string, CustomSubItem[]>()
      for (const sub of allSubs) {
        const list = subMap.get(sub.parentItemId) ?? []
        list.push(sub)
        subMap.set(sub.parentItemId, list)
      }

      setStates(stateMap)
      setCustomItems(customMap)
      setCustomSections(allSections)
      setCustomSubItems(subMap)
      setLoading(false)
    })
  }, [scenarioId])

  const toggle = useCallback(async (itemId: string) => {
    const current = states.get(itemId)
    const newChecked = !(current?.checked ?? false)
    const note = current?.note ?? ''
    await setChecklistState(scenarioId, itemId, newChecked, note)
    setStates(prev => {
      const next = new Map(prev)
      next.set(itemId, { scenarioId, itemId, checked: newChecked, note, updatedAt: new Date() })
      return next
    })
  }, [scenarioId, states])

  const saveNote = useCallback(async (itemId: string, note: string) => {
    const current = states.get(itemId)
    const checked = current?.checked ?? false
    await setChecklistState(scenarioId, itemId, checked, note)
    setStates(prev => {
      const next = new Map(prev)
      next.set(itemId, { scenarioId, itemId, checked, note, updatedAt: new Date() })
      return next
    })
  }, [scenarioId, states])

  const getState = useCallback((itemId: string) => {
    return states.get(itemId) ?? { scenarioId, itemId, checked: false, note: '' }
  }, [scenarioId, states])

  const getCustomItems = useCallback((sectionId: string): CustomChecklistItem[] => {
    return customItems.get(sectionId) ?? []
  }, [customItems])

  const addItem = useCallback(async (sectionId: string, label: string) => {
    const id = await addCustomItem(scenarioId, sectionId, label)
    const newItem: CustomChecklistItem = { id, scenarioId, sectionId, label, createdAt: new Date() }
    setCustomItems(prev => {
      const next = new Map(prev)
      next.set(sectionId, [...(next.get(sectionId) ?? []), newItem])
      return next
    })
  }, [scenarioId])

  const removeItem = useCallback(async (sectionId: string, itemId: number) => {
    await deleteCustomItem(itemId)
    const cid = `custom-${itemId}`
    setCustomItems(prev => {
      const next = new Map(prev)
      next.set(sectionId, (next.get(sectionId) ?? []).filter(i => i.id !== itemId))
      return next
    })
    setStates(prev => {
      const next = new Map(prev)
      next.delete(cid)
      return next
    })
    setCustomSubItems(prev => {
      const next = new Map(prev)
      next.delete(cid)
      return next
    })
  }, [])

  const editItemLabel = useCallback(async (sectionId: string, itemId: number, label: string) => {
    await updateCustomItem(itemId, label)
    setCustomItems(prev => {
      const next = new Map(prev)
      next.set(sectionId, (next.get(sectionId) ?? []).map(i => i.id === itemId ? { ...i, label } : i))
      return next
    })
  }, [])

  const getCustomSubItems = useCallback((parentItemId: string): CustomSubItem[] => {
    return customSubItems.get(parentItemId) ?? []
  }, [customSubItems])

  const addSubItem = useCallback(async (parentItemId: string, label: string) => {
    const id = await addCustomSubItem(parentItemId, label)
    const newSub: CustomSubItem = { id, parentItemId, label, createdAt: new Date() }
    setCustomSubItems(prev => {
      const next = new Map(prev)
      next.set(parentItemId, [...(next.get(parentItemId) ?? []), newSub])
      return next
    })
  }, [])

  const removeSubItem = useCallback(async (parentItemId: string, subId: number) => {
    await deleteCustomSubItem(subId)
    setCustomSubItems(prev => {
      const next = new Map(prev)
      next.set(parentItemId, (next.get(parentItemId) ?? []).filter(s => s.id !== subId))
      return next
    })
    setStates(prev => {
      const next = new Map(prev)
      next.delete(`sub-${subId}`)
      return next
    })
  }, [])

  const editSubItemLabel = useCallback(async (parentItemId: string, subId: number, label: string) => {
    await updateCustomSubItem(subId, label)
    setCustomSubItems(prev => {
      const next = new Map(prev)
      next.set(parentItemId, (next.get(parentItemId) ?? []).map(s => s.id === subId ? { ...s, label } : s))
      return next
    })
  }, [])

  const addSection = useCallback(async (title: string) => {
    const id = await addCustomSection(scenarioId, title)
    setCustomSections(prev => [...prev, { id, scenarioId, title, createdAt: new Date() }])
  }, [scenarioId])

  const removeSection = useCallback(async (sectionId: number) => {
    await deleteCustomSection(sectionId)
    const sid = `cs-${sectionId}`
    setCustomSections(prev => prev.filter(s => s.id !== sectionId))
    setCustomItems(prev => { const next = new Map(prev); next.delete(sid); return next })
    setStates(prev => { const next = new Map(prev); next.delete(sid); return next })
  }, [])

  const editSectionTitle = useCallback(async (sectionId: number, title: string) => {
    await updateCustomSection(sectionId, title)
    setCustomSections(prev => prev.map(s => s.id === sectionId ? { ...s, title } : s))
  }, [])

  const progress = useCallback((sectionId: string, staticItems: StaticItemInfo[]) => {
    let total = 0
    let checked = 0

    for (const item of staticItems) {
      total++
      if (states.get(item.id)?.checked) checked++
      for (let j = 0; j < item.subCount; j++) {
        total++
        if (states.get(`${item.id}-sub${j}`)?.checked) checked++
      }
      for (const sub of customSubItems.get(item.id) ?? []) {
        total++
        if (sub.id !== undefined && states.get(`sub-${sub.id}`)?.checked) checked++
      }
    }

    for (const item of customItems.get(sectionId) ?? []) {
      const cid = `custom-${item.id}`
      total++
      if (item.id !== undefined && states.get(cid)?.checked) checked++
      for (const sub of customSubItems.get(cid) ?? []) {
        total++
        if (sub.id !== undefined && states.get(`sub-${sub.id}`)?.checked) checked++
      }
    }

    return { checked, total }
  }, [states, customItems, customSubItems])

  const totalProgress = useCallback((sections: SectionInfo[]) => {
    return sections.reduce(
      (acc, sec) => {
        const { checked, total } = progress(sec.id, sec.staticItems)
        return { checked: acc.checked + checked, total: acc.total + total }
      },
      { checked: 0, total: 0 }
    )
  }, [progress])

  return {
    loading, toggle, saveNote, getState,
    getCustomItems, addItem, removeItem, editItemLabel,
    getCustomSubItems, addSubItem, removeSubItem, editSubItemLabel,
    customSections, addSection, removeSection, editSectionTitle,
    progress, totalProgress,
  }
}
