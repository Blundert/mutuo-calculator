import { useState, useEffect, useCallback } from 'react'
import {
  getAllChecklistStates, setChecklistState,
  getAllCustomItems, addCustomItem, deleteCustomItem, updateCustomItem,
  getAllCustomSections, addCustomSection, deleteCustomSection, updateCustomSection,
  getAllCustomSubItems, addCustomSubItem, deleteCustomSubItem, updateCustomSubItem,
} from '../lib/db'
import type { ChecklistItemState, CustomChecklistItem, CustomSection, CustomSubItem } from '../types/mortgage'

export type StaticItemInfo = { id: string; subCount: number }
export type SectionInfo = { id: string; staticItems: StaticItemInfo[] }

export function useChecklist() {
  const [states, setStates] = useState<Map<string, ChecklistItemState>>(new Map())
  const [customItems, setCustomItems] = useState<Map<string, CustomChecklistItem[]>>(new Map())
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [customSubItems, setCustomSubItems] = useState<Map<string, CustomSubItem[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAllChecklistStates(),
      getAllCustomItems(),
      getAllCustomSections(),
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
  }, [])

  const toggle = useCallback(async (itemId: string) => {
    const current = states.get(itemId)
    const newChecked = !(current?.checked ?? false)
    const note = current?.note ?? ''
    await setChecklistState(itemId, newChecked, note)
    setStates(prev => {
      const next = new Map(prev)
      next.set(itemId, { itemId, checked: newChecked, note, updatedAt: new Date() })
      return next
    })
  }, [states])

  const saveNote = useCallback(async (itemId: string, note: string) => {
    const current = states.get(itemId)
    const checked = current?.checked ?? false
    await setChecklistState(itemId, checked, note)
    setStates(prev => {
      const next = new Map(prev)
      next.set(itemId, { itemId, checked, note, updatedAt: new Date() })
      return next
    })
  }, [states])

  const getState = useCallback((itemId: string) => {
    return states.get(itemId) ?? { itemId, checked: false, note: '' }
  }, [states])

  const getCustomItems = useCallback((sectionId: string): CustomChecklistItem[] => {
    return customItems.get(sectionId) ?? []
  }, [customItems])

  const addItem = useCallback(async (sectionId: string, label: string) => {
    const id = await addCustomItem(sectionId, label)
    const newItem: CustomChecklistItem = { id, sectionId, label, createdAt: new Date() }
    setCustomItems(prev => {
      const next = new Map(prev)
      next.set(sectionId, [...(next.get(sectionId) ?? []), newItem])
      return next
    })
  }, [])

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
    // Remove sub-items of this item from state
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
    const id = await addCustomSection(title)
    setCustomSections(prev => [...prev, { id, title, createdAt: new Date() }])
  }, [])

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

  // Progress: counts all checked items — static items + static sub-items + custom sub-items + custom items + their custom sub-items
  const progress = useCallback((sectionId: string, staticItems: StaticItemInfo[]) => {
    let total = 0
    let checked = 0

    // Static items and their sub-items
    for (const item of staticItems) {
      total++
      if (states.get(item.id)?.checked) checked++
      // Static sub-items
      for (let j = 0; j < item.subCount; j++) {
        total++
        if (states.get(`${item.id}-sub${j}`)?.checked) checked++
      }
      // Custom sub-items added to this static item
      for (const sub of customSubItems.get(item.id) ?? []) {
        total++
        if (sub.id !== undefined && states.get(`sub-${sub.id}`)?.checked) checked++
      }
    }

    // Custom items in this section
    for (const item of customItems.get(sectionId) ?? []) {
      const cid = `custom-${item.id}`
      total++
      if (item.id !== undefined && states.get(cid)?.checked) checked++
      // Custom sub-items of this custom item
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
