import { useState, useEffect, useCallback } from 'react'
import { getAllWikiStates, setWikiState } from '../lib/db'
import type { WikiItemState } from '../types/mortgage'

export function useWiki() {
  const [states, setStates] = useState<Map<string, WikiItemState>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllWikiStates().then(all => {
      const map = new Map<string, WikiItemState>()
      for (const s of all) map.set(s.itemId, s)
      setStates(map)
      setLoading(false)
    })
  }, [])

  const getState = useCallback((itemId: string): WikiItemState => {
    return states.get(itemId) ?? { itemId, studied: false, note: '' }
  }, [states])

  const toggleStudied = useCallback(async (itemId: string) => {
    const current = states.get(itemId)
    const newStudied = !(current?.studied ?? false)
    const note = current?.note ?? ''
    await setWikiState(itemId, newStudied, note)
    setStates(prev => {
      const next = new Map(prev)
      next.set(itemId, { ...next.get(itemId), itemId, studied: newStudied, note, updatedAt: new Date() })
      return next
    })
  }, [states])

  const saveNote = useCallback(async (itemId: string, note: string) => {
    const current = states.get(itemId)
    const studied = current?.studied ?? false
    await setWikiState(itemId, studied, note)
    setStates(prev => {
      const next = new Map(prev)
      next.set(itemId, { ...next.get(itemId), itemId, studied, note, updatedAt: new Date() })
      return next
    })
  }, [states])

  const totalStudied = Array.from(states.values()).filter(s => s.studied).length

  return { loading, getState, toggleStudied, saveNote, totalStudied }
}
