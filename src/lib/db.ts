import Dexie, { type Table } from 'dexie'
import type { Scenario, ChecklistItemState, CustomChecklistItem, CustomSection, CustomSubItem, WikiItemState, MortgageInputs } from '../types/mortgage'

class MortgageDB extends Dexie {
  scenarios!: Table<Scenario>
  checklistStates!: Table<ChecklistItemState>
  customChecklistItems!: Table<CustomChecklistItem>
  customSections!: Table<CustomSection>
  customSubItems!: Table<CustomSubItem>
  wikiStates!: Table<WikiItemState>

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
    // Version 6: add scenarioId to checklist tables (compound unique on checklistStates)
    this.version(6).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, [scenarioId+itemId], scenarioId',
      customChecklistItems: '++id, scenarioId, sectionId, createdAt',
      customSections: '++id, scenarioId, createdAt',
      customSubItems: '++id, parentItemId, createdAt',
    }).upgrade(tx => {
      // Migrate existing checklist data to scenarioId=0 (orphaned)
      return Promise.all([
        tx.table('checklistStates').toCollection().modify((rec: ChecklistItemState) => {
          if (rec.scenarioId === undefined) rec.scenarioId = 0
        }),
        tx.table('customChecklistItems').toCollection().modify((rec: CustomChecklistItem) => {
          if (rec.scenarioId === undefined) rec.scenarioId = 0
        }),
        tx.table('customSections').toCollection().modify((rec: CustomSection) => {
          if (rec.scenarioId === undefined) rec.scenarioId = 0
        }),
      ])
    })
    // Version 7: add wikiStates table
    this.version(7).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, [scenarioId+itemId], scenarioId',
      customChecklistItems: '++id, scenarioId, sectionId, createdAt',
      customSections: '++id, scenarioId, createdAt',
      customSubItems: '++id, parentItemId, createdAt',
      wikiStates: '++id, &itemId',
    })
    // Version 8: add houseValue to scenarios (no schema change needed, Dexie handles new columns automatically)
    this.version(8).stores({
      scenarios: '++id, name, createdAt',
      checklistStates: '++id, [scenarioId+itemId], scenarioId',
      customChecklistItems: '++id, scenarioId, sectionId, createdAt',
      customSections: '++id, scenarioId, createdAt',
      customSubItems: '++id, parentItemId, createdAt',
      wikiStates: '++id, &itemId',
    })
  }
}

export const db = new MortgageDB()

// ─── Scenarios ───────────────────────────────────────────────────────────────

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

export async function updateScenarioInputs(id: number, inputs: MortgageInputs): Promise<void> {
  await db.scenarios.update(id, {
    amount: inputs.amount,
    years: inputs.years,
    tan: inputs.tan,
    setupFee: inputs.fees.setupFee,
    appraisalFee: inputs.fees.appraisalFee,
    monthlyFee: inputs.fees.monthlyFee,
    insuranceCost: inputs.fees.insuranceCost,
    houseValue: inputs.additionalCosts.houseValue,
    downPayment: inputs.additionalCosts.downPayment,
    notaryAgencyTaxes: inputs.additionalCosts.notaryAgencyTaxes,
    renovationFurniture: inputs.additionalCosts.renovationFurniture,
    condoFeesAnnual: inputs.additionalCosts.condoFeesAnnual,
    maintenanceAnnual: inputs.additionalCosts.maintenanceAnnual,
    tariInsuranceAnnual: inputs.additionalCosts.tariInsuranceAnnual,
    updatedAt: new Date(),
  })
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

// ─── Checklist States (per-scenario) ─────────────────────────────────────────

export async function setChecklistState(scenarioId: number, itemId: string, checked: boolean, note: string): Promise<void> {
  const existing = await db.checklistStates
    .where('[scenarioId+itemId]').equals([scenarioId, itemId]).first()
  const now = new Date()
  if (existing?.id !== undefined) {
    await db.checklistStates.update(existing.id, { checked, note, updatedAt: now })
  } else {
    await db.checklistStates.add({ scenarioId, itemId, checked, note, updatedAt: now })
  }
}

export async function getAllChecklistStatesByScenario(scenarioId: number): Promise<ChecklistItemState[]> {
  return db.checklistStates.where('scenarioId').equals(scenarioId).toArray()
}

// ─── Custom Checklist Items (per-scenario) ────────────────────────────────────

export async function getAllCustomItemsByScenario(scenarioId: number): Promise<CustomChecklistItem[]> {
  return db.customChecklistItems.where('scenarioId').equals(scenarioId).sortBy('createdAt')
}

export async function addCustomItem(scenarioId: number, sectionId: string, label: string): Promise<number> {
  return db.customChecklistItems.add({ scenarioId, sectionId, label, createdAt: new Date() })
}

export async function deleteCustomItem(id: number): Promise<void> {
  const parentItemId = `custom-${id}`
  const subs = await db.customSubItems.where('parentItemId').equals(parentItemId).toArray()
  for (const sub of subs) {
    if (sub.id !== undefined) await deleteCustomSubItem(sub.id)
  }
  await db.customChecklistItems.delete(id)
  const state = await db.checklistStates.where('[scenarioId+itemId]').between(
    [Dexie.minKey, parentItemId], [Dexie.maxKey, parentItemId]
  ).first()
  if (state?.id !== undefined) await db.checklistStates.delete(state.id)
}

export async function updateCustomItem(id: number, label: string): Promise<void> {
  await db.customChecklistItems.update(id, { label })
}

// ─── Custom Sections (per-scenario) ──────────────────────────────────────────

export async function getAllCustomSectionsByScenario(scenarioId: number): Promise<CustomSection[]> {
  return db.customSections.where('scenarioId').equals(scenarioId).sortBy('createdAt')
}

export async function addCustomSection(scenarioId: number, title: string): Promise<number> {
  return db.customSections.add({ scenarioId, title, createdAt: new Date() })
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
  await db.customSections.delete(id)
}

// ─── Custom Sub-Items ─────────────────────────────────────────────────────────

export async function getAllCustomSubItems(): Promise<CustomSubItem[]> {
  return db.customSubItems.orderBy('createdAt').toArray()
}

export async function addCustomSubItem(parentItemId: string, label: string): Promise<number> {
  return db.customSubItems.add({ parentItemId, label, createdAt: new Date() })
}

export async function deleteCustomSubItem(id: number): Promise<void> {
  await db.customSubItems.delete(id)
  const subItemId = `sub-${id}`
  const state = await db.checklistStates.where('[scenarioId+itemId]').between(
    [Dexie.minKey, subItemId], [Dexie.maxKey, subItemId]
  ).first()
  if (state?.id !== undefined) await db.checklistStates.delete(state.id)
}

export async function updateCustomSubItem(id: number, label: string): Promise<void> {
  await db.customSubItems.update(id, { label })
}

// ─── Wiki States ──────────────────────────────────────────────────────────────

export async function getAllWikiStates(): Promise<WikiItemState[]> {
  return db.wikiStates.toArray()
}

export async function setWikiState(itemId: string, studied: boolean, note: string): Promise<void> {
  const existing = await db.wikiStates.where('itemId').equals(itemId).first()
  const now = new Date()
  if (existing?.id !== undefined) {
    await db.wikiStates.update(existing.id, { studied, note, updatedAt: now })
  } else {
    await db.wikiStates.add({ itemId, studied, note, updatedAt: now })
  }
}

// ─── Dark mode preference (localStorage) ─────────────────────────────────────

export function getDarkMode(): boolean {
  return localStorage.getItem('darkMode') === 'true'
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem('darkMode', String(value))
}
