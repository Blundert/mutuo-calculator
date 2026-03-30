import Dexie, { type Table } from 'dexie'
import type { Scenario, ChecklistItemState, CustomChecklistItem, CustomSection, CustomSubItem } from '../types/mortgage'

class MortgageDB extends Dexie {
  scenarios!: Table<Scenario>
  checklistStates!: Table<ChecklistItemState>
  customChecklistItems!: Table<CustomChecklistItem>
  customSections!: Table<CustomSection>
  customSubItems!: Table<CustomSubItem>

  constructor() {
    super('MortgageDB')
    this.version(1).stores({
      scenarios: '++id, name, createdAt',
    })
    this.version(2).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, &itemId',
    })
    this.version(3).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, &itemId',
      customChecklistItems: '++id, sectionId, createdAt',
    })
    this.version(4).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, &itemId',
      customChecklistItems: '++id, sectionId, createdAt',
      customSections: '++id, createdAt',
    })
    this.version(5).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, &itemId',
      customChecklistItems: '++id, sectionId, createdAt',
      customSections: '++id, createdAt',
      customSubItems: '++id, parentItemId, createdAt',
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

export async function getChecklistState(itemId: string): Promise<ChecklistItemState | undefined> {
  return db.checklistStates.where('itemId').equals(itemId).first()
}

export async function setChecklistState(itemId: string, checked: boolean, note: string): Promise<void> {
  const existing = await db.checklistStates.where('itemId').equals(itemId).first()
  const now = new Date()
  if (existing?.id !== undefined) {
    await db.checklistStates.update(existing.id, { checked, note, updatedAt: now })
  } else {
    await db.checklistStates.add({ itemId, checked, note, updatedAt: now })
  }
}

export async function getAllChecklistStates(): Promise<ChecklistItemState[]> {
  return db.checklistStates.toArray()
}

export async function getCustomItemsBySection(sectionId: string): Promise<CustomChecklistItem[]> {
  return db.customChecklistItems.where('sectionId').equals(sectionId).sortBy('createdAt')
}

export async function getAllCustomItems(): Promise<CustomChecklistItem[]> {
  return db.customChecklistItems.orderBy('createdAt').toArray()
}

export async function addCustomItem(sectionId: string, label: string): Promise<number> {
  return db.customChecklistItems.add({ sectionId, label, createdAt: new Date() })
}

export async function deleteCustomItem(id: number): Promise<void> {
  const parentItemId = `custom-${id}`
  // Delete custom sub-items of this item
  const subs = await db.customSubItems.where('parentItemId').equals(parentItemId).toArray()
  for (const sub of subs) {
    if (sub.id !== undefined) await deleteCustomSubItem(sub.id)
  }
  await db.customChecklistItems.delete(id)
  const state = await db.checklistStates.where('itemId').equals(parentItemId).first()
  if (state?.id !== undefined) await db.checklistStates.delete(state.id)
}

export async function updateCustomItem(id: number, label: string): Promise<void> {
  await db.customChecklistItems.update(id, { label })
}

export async function getAllCustomSections(): Promise<CustomSection[]> {
  return db.customSections.orderBy('createdAt').toArray()
}

export async function addCustomSection(title: string): Promise<number> {
  return db.customSections.add({ title, createdAt: new Date() })
}

export async function updateCustomSection(id: number, title: string): Promise<void> {
  await db.customSections.update(id, { title })
}

export async function deleteCustomSection(id: number): Promise<void> {
  const sectionId = `cs-${id}`
  const items = await db.customChecklistItems.where('sectionId').equals(sectionId).toArray()
  for (const item of items) {
    if (item.id !== undefined) await deleteCustomItem(item.id)
  }
  const state = await db.checklistStates.where('itemId').equals(sectionId).first()
  if (state?.id !== undefined) await db.checklistStates.delete(state.id)
  await db.customSections.delete(id)
}

// Sub-items
export async function getAllCustomSubItems(): Promise<CustomSubItem[]> {
  return db.customSubItems.orderBy('createdAt').toArray()
}

export async function addCustomSubItem(parentItemId: string, label: string): Promise<number> {
  return db.customSubItems.add({ parentItemId, label, createdAt: new Date() })
}

export async function deleteCustomSubItem(id: number): Promise<void> {
  await db.customSubItems.delete(id)
  const state = await db.checklistStates.where('itemId').equals(`sub-${id}`).first()
  if (state?.id !== undefined) await db.checklistStates.delete(state.id)
}

export async function updateCustomSubItem(id: number, label: string): Promise<void> {
  await db.customSubItems.update(id, { label })
}

// Dark mode preference stored in localStorage
export function getDarkMode(): boolean {
  return localStorage.getItem('darkMode') === 'true'
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem('darkMode', String(value))
}
