import Dexie, { type Table } from 'dexie'
import type { Scenario } from '../types/mortgage'

class MortgageDB extends Dexie {
  scenarios!: Table<Scenario>

  constructor() {
    super('MortgageDB')
    this.version(1).stores({
      scenarios: '++id, name, createdAt',
    })
  }
}

export const db = new MortgageDB()

export async function saveScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date()
  return db.scenarios.add({
    ...scenario,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateScenario(id: number, data: Partial<Scenario>): Promise<void> {
  await db.scenarios.update(id, { ...data, updatedAt: new Date() })
}

export async function deleteScenario(id: number): Promise<void> {
  await db.scenarios.delete(id)
}

export async function duplicateScenario(id: number): Promise<number> {
  const original = await db.scenarios.get(id)
  if (!original) throw new Error('Scenario not found')
  const { id: _id, ...rest } = original
  const now = new Date()
  return db.scenarios.add({
    ...rest,
    name: `${rest.name} (copia)`,
    createdAt: now,
    updatedAt: now,
  })
}

export async function getAllScenarios(): Promise<Scenario[]> {
  return db.scenarios.orderBy('createdAt').reverse().toArray()
}

export async function getScenario(id: number): Promise<Scenario | undefined> {
  return db.scenarios.get(id)
}

// Dark mode preference stored in localStorage
export function getDarkMode(): boolean {
  return localStorage.getItem('darkMode') === 'true'
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem('darkMode', String(value))
}
