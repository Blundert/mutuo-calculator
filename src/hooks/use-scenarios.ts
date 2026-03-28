import { useState, useEffect, useCallback } from 'react'
import type { Scenario } from '../types/mortgage'
import { getAllScenarios, saveScenario, deleteScenario, duplicateScenario } from '../lib/db'

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

  const save = useCallback(async (data: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>) => {
    await saveScenario(data)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    await deleteScenario(id)
    await refresh()
  }, [refresh])

  const duplicate = useCallback(async (id: number) => {
    await duplicateScenario(id)
    await refresh()
  }, [refresh])

  return { scenarios, loading, save, remove, duplicate, refresh }
}
