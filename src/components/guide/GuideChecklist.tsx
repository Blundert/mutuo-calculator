import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, StickyNote, Check, Plus, Trash2, Pencil, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { useChecklist } from '../../hooks/use-checklist'
import type { SectionInfo } from '../../hooks/use-checklist'
import { CHECKLIST_SECTIONS } from '../../data/checklist'
import type { CustomChecklistItem, CustomSection, CustomSubItem } from '../../types/mortgage'

// ─── Shared helpers ────────────────────────────────────────────────────────

function CheckboxBtn({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label?: string }) {
  return (
    <button
      onClick={onToggle}
      className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all"
      style={{
        border: checked ? 'none' : '2px solid hsl(var(--muted-foreground))',
        backgroundColor: checked ? '#22c55e' : 'transparent',
        minWidth: '20px',
        minHeight: '20px',
      }}
      aria-label={label ?? (checked ? 'Deseleziona' : 'Segna come fatto')}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </button>
  )
}

function NoteEditor({ id, value, onChange, onSave }: {
  id: string; value: string; onChange: (v: string) => void; onSave: (id: string) => Promise<void>
}) {
  return (
    <div className="mt-2 space-y-2">
      <textarea
        className="w-full rounded-md border p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          borderColor: 'hsl(var(--border))',
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          minHeight: '72px',
        }}
        placeholder="Scrivi una nota..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => onSave(id)}>Salva nota</Button>
      </div>
    </div>
  )
}

function NoteToggleBtn({ note, onClick }: { note: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 mt-1.5 text-xs transition-colors"
      style={{ color: 'hsl(var(--muted-foreground))' }}
    >
      <StickyNote className="h-3 w-3" />
      {note ? 'Nota' : 'Aggiungi nota'}
      {note && <span className="text-amber-500">●</span>}
    </button>
  )
}

// ─── Sub-item row ───────────────────────────────────────────────────────────

interface SubItemRowProps {
  subId: string
  label: string
  checked: boolean
  note: string
  isCustom?: boolean
  onToggle: () => void
  onDelete?: () => void
  onEdit?: (label: string) => void
  // note management (local to parent)
  noteOpen: boolean
  noteValue: string
  onToggleNote: () => void
  onNoteChange: (v: string) => void
  onNoteSave: (id: string) => Promise<void>
}

function SubItemRow({
  subId, label, checked, note, isCustom,
  onToggle, onDelete, onEdit,
  noteOpen, noteValue, onToggleNote, onNoteChange, onNoteSave,
}: SubItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(label)

  const saveEdit = async () => {
    const t = editVal.trim()
    if (t && t !== label && onEdit) await onEdit(t)
    else setEditVal(label)
    setEditing(false)
  }

  return (
    <div
      className={`rounded-md border p-2.5 transition-colors ${checked ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : ''}`}
      style={!checked ? { borderColor: 'hsl(var(--border))' } : {}}
    >
      <div className="flex items-start gap-2">
        <CheckboxBtn checked={checked} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            {editing ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEdit() } if (e.key === 'Escape') { setEditVal(label); setEditing(false) } }}
                onBlur={saveEdit}
                className="flex-1 text-xs rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
              />
            ) : (
              <span className={`text-xs leading-relaxed flex-1 ${checked ? 'line-through' : ''}`}
                style={checked ? { color: 'hsl(var(--muted-foreground))' } : {}}>
                {label}
                {isCustom && (
                  <span className="ml-1 text-[10px] px-1 rounded" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                    personalizzato
                  </span>
                )}
              </span>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isCustom && onEdit && !editing && (
                <button onClick={() => { setEditVal(label); setEditing(true) }} className="text-blue-400 hover:text-blue-600">
                  <Pencil className="h-3 w-3" />
                </button>
              )}
              {isCustom && onDelete && !editing && (
                <button onClick={onDelete} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              {editing && (
                <button onClick={() => { setEditVal(label); setEditing(false) }} style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <NoteToggleBtn note={note} onClick={onToggleNote} />
          {noteOpen && <NoteEditor id={subId} value={noteValue} onChange={onNoteChange} onSave={onNoteSave} />}
        </div>
      </div>
    </div>
  )
}

// ─── Checklist item row ─────────────────────────────────────────────────────

interface ItemRowProps {
  itemId: string
  label: string
  staticSubItems: string[]
  checked: boolean
  note: string
  isCustom?: boolean
  onToggle: () => void
  onDelete?: () => void
  onEdit?: (label: string) => void
  // note (main)
  noteOpen: boolean
  noteValue: string
  onToggleNote: () => void
  onNoteChange: (v: string) => void
  onNoteSave: (id: string) => Promise<void>
  // sub-items
  customSubItems: CustomSubItem[]
  getState: (id: string) => { checked: boolean; note: string }
  toggle: (id: string) => Promise<void>
  saveNote: (id: string, note: string) => Promise<void>
  onAddSubItem: (label: string) => Promise<void>
  onRemoveSubItem: (id: number) => Promise<void>
  onEditSubItem: (id: number, label: string) => Promise<void>
}

function ItemRow({
  itemId, label, staticSubItems, checked, note, isCustom,
  onToggle, onDelete, onEdit,
  noteOpen, noteValue, onToggleNote, onNoteChange, onNoteSave,
  customSubItems, getState, toggle, saveNote,
  onAddSubItem, onRemoveSubItem, onEditSubItem,
}: ItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(label)
  const [addingSubItem, setAddingSubItem] = useState(false)
  const [newSubLabel, setNewSubLabel] = useState('')
  // Local sub-note state
  const [subNoteOpen, setSubNoteOpen] = useState<Set<string>>(new Set())
  const [subNoteValues, setSubNoteValues] = useState<Map<string, string>>(new Map())

  const toggleSubNote = (id: string, currentNote: string) => {
    setSubNoteValues(prev => { const next = new Map(prev); if (!next.has(id)) next.set(id, currentNote); return next })
    setSubNoteOpen(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const handleSubNoteSave = async (id: string) => {
    const n = subNoteValues.get(id) ?? ''
    await saveNote(id, n)
    setSubNoteOpen(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  const saveEdit = async () => {
    const t = editVal.trim()
    if (t && t !== label && onEdit) await onEdit(t)
    else setEditVal(label)
    setEditing(false)
  }

  const handleAddSubItem = async () => {
    const l = newSubLabel.trim()
    if (!l) return
    await onAddSubItem(l)
    setNewSubLabel('')
    setAddingSubItem(false)
  }

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${checked ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : ''}`}
      style={!checked ? { borderColor: 'hsl(var(--border))' } : {}}
    >
      {/* Main item row */}
      <div className="flex items-start gap-2.5">
        <CheckboxBtn checked={checked} onToggle={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {editing ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEdit() } if (e.key === 'Escape') { setEditVal(label); setEditing(false) } }}
                onBlur={saveEdit}
                className="flex-1 text-sm font-medium rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
              />
            ) : (
              <span className={`text-sm font-medium leading-snug flex-1 ${checked ? 'line-through' : ''}`}
                style={checked ? { color: 'hsl(var(--muted-foreground))' } : {}}>
                {label}
                {isCustom && (
                  <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                    personalizzato
                  </span>
                )}
              </span>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isCustom && onEdit && !editing && (
                <button onClick={() => { setEditVal(label); setEditing(true) }} className="text-blue-400 hover:text-blue-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {isCustom && onDelete && !editing && (
                <button onClick={onDelete} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              {editing && (
                <button onClick={() => { setEditVal(label); setEditing(false) }} style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <NoteToggleBtn note={note} onClick={onToggleNote} />
          {noteOpen && <NoteEditor id={itemId} value={noteValue} onChange={onNoteChange} onSave={onNoteSave} />}
        </div>
      </div>

      {/* Sub-items */}
      {(staticSubItems.length > 0 || customSubItems.length > 0 || addingSubItem) && (
        <div className="mt-2.5 ml-7 space-y-1.5">
          {/* Static sub-items */}
          {staticSubItems.map((sub, idx) => {
            const subId = `${itemId}-sub${idx}`
            const subState = getState(subId)
            return (
              <SubItemRow
                key={subId}
                subId={subId}
                label={sub}
                checked={subState.checked}
                note={subState.note}
                onToggle={() => toggle(subId)}
                noteOpen={subNoteOpen.has(subId)}
                noteValue={subNoteValues.get(subId) ?? subState.note}
                onToggleNote={() => toggleSubNote(subId, subState.note)}
                onNoteChange={v => setSubNoteValues(prev => new Map(prev).set(subId, v))}
                onNoteSave={handleSubNoteSave}
              />
            )
          })}

          {/* Custom sub-items */}
          {customSubItems.map(sub => {
            const subId = `sub-${sub.id}`
            const subState = getState(subId)
            return (
              <SubItemRow
                key={subId}
                subId={subId}
                label={sub.label}
                checked={subState.checked}
                note={subState.note}
                isCustom
                onToggle={() => toggle(subId)}
                onDelete={() => sub.id !== undefined && onRemoveSubItem(sub.id)}
                onEdit={(newLabel) => sub.id !== undefined && onEditSubItem(sub.id, newLabel)}
                noteOpen={subNoteOpen.has(subId)}
                noteValue={subNoteValues.get(subId) ?? subState.note}
                onToggleNote={() => toggleSubNote(subId, subState.note)}
                onNoteChange={v => setSubNoteValues(prev => new Map(prev).set(subId, v))}
                onNoteSave={handleSubNoteSave}
              />
            )
          })}

          {/* Add sub-item input */}
          {addingSubItem ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newSubLabel}
                onChange={e => setNewSubLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSubItem(); if (e.key === 'Escape') { setAddingSubItem(false); setNewSubLabel('') } }}
                placeholder="Descrizione sotto-punto..."
                className="flex-1 h-8 rounded-md border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
              />
              <Button size="sm" onClick={handleAddSubItem} disabled={!newSubLabel.trim()}>+</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAddingSubItem(false); setNewSubLabel('') }}>✕</Button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubItem(true)}
              className="flex items-center gap-1 text-xs py-0.5 transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <Plus className="h-3 w-3" />
              Aggiungi sotto-punto
            </button>
          )}
        </div>
      )}

      {/* Show "add sub-item" even when no subs exist yet */}
      {staticSubItems.length === 0 && customSubItems.length === 0 && !addingSubItem && (
        <div className="mt-1.5 ml-7">
          <button
            onClick={() => setAddingSubItem(true)}
            className="flex items-center gap-1 text-xs py-0.5 transition-colors"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <Plus className="h-3 w-3" />
            Aggiungi sotto-punto
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Section note row ───────────────────────────────────────────────────────

function SectionNoteRow({ sectionNoteId, note, noteOpen, noteValue, onToggleNote, onNoteChange, onNoteSave }: {
  sectionNoteId: string; note: string
  noteOpen: boolean; noteValue: string
  onToggleNote: () => void
  onNoteChange: (v: string) => void; onNoteSave: (id: string) => Promise<void>
}) {
  return (
    <div>
      <button
        onClick={onToggleNote}
        className="flex items-center gap-1.5 text-xs transition-colors py-1"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        <StickyNote className="h-3.5 w-3.5" />
        {note ? 'Modifica nota sezione' : 'Aggiungi nota alla sezione'}
        {note && <span className="text-amber-500">●</span>}
      </button>
      {noteOpen && <NoteEditor id={sectionNoteId} value={noteValue} onChange={onNoteChange} onSave={onNoteSave} />}
    </div>
  )
}

// ─── Section card ───────────────────────────────────────────────────────────

interface StaticItem { id: string; label: string; subItems: string[] }

interface SectionCardProps {
  sectionId: string
  number: number
  title: string
  duration?: string
  warning?: string
  staticItems?: StaticItem[]
  isOpen: boolean
  onToggleSection: () => void
  openNotes: Set<string>
  noteValues: Map<string, string>
  onToggleNote: (id: string, currentNote: string) => void
  onNoteChange: (id: string, val: string) => void
  onNoteSave: (id: string) => Promise<void>
  toggle: (id: string) => Promise<void>
  saveNote: (id: string, note: string) => Promise<void>
  getState: (id: string) => { checked: boolean; note: string }
  progress: (sectionId: string, staticItems: Array<{ id: string; subCount: number }>) => { checked: number; total: number }
  customItems: CustomChecklistItem[]
  onAddItem: (label: string) => Promise<void>
  onRemoveItem: (itemId: number) => Promise<void>
  onEditItem: (itemId: number, label: string) => Promise<void>
  getCustomSubItems: (parentItemId: string) => CustomSubItem[]
  onAddSubItem: (parentItemId: string, label: string) => Promise<void>
  onRemoveSubItem: (parentItemId: string, id: number) => Promise<void>
  onEditSubItem: (parentItemId: string, id: number, label: string) => Promise<void>
  isCustomSection?: boolean
  onDeleteSection?: () => void
  onEditSectionTitle?: (title: string) => void
}

function SectionCard({
  sectionId, number, title, duration, warning, staticItems = [],
  isOpen, onToggleSection, openNotes, noteValues,
  onToggleNote, onNoteChange, onNoteSave,
  toggle, saveNote, getState, progress, customItems,
  onAddItem, onRemoveItem, onEditItem,
  getCustomSubItems, onAddSubItem, onRemoveSubItem, onEditSubItem,
  isCustomSection, onDeleteSection, onEditSectionTitle,
}: SectionCardProps) {
  const staticItemsInfo = staticItems.map(i => ({ id: i.id, subCount: i.subItems.length }))
  const { checked, total } = progress(sectionId, staticItemsInfo)
  const allDone = total > 0 && checked === total
  const sectionNoteId = sectionId
  const sectionState = getState(sectionNoteId)
  const sectionNoteOpen = openNotes.has(sectionNoteId)

  const [newItemLabel, setNewItemLabel] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(title)

  const handleAddItem = async () => {
    const l = newItemLabel.trim()
    if (!l) return
    await onAddItem(l)
    setNewItemLabel('')
    setAddingItem(false)
  }

  const handleSaveTitle = async () => {
    const t = titleValue.trim()
    if (!t) return
    if (onEditSectionTitle) await onEditSectionTitle(t)
    setEditingTitle(false)
  }

  return (
    <Card className={`transition-all ${allDone ? 'border-green-200 dark:border-green-800' : ''}`}>
      <CardHeader className="p-0">
        <div className="w-full flex items-center gap-3 p-4">
          <button onClick={onToggleSection} className="flex items-center gap-3 flex-1 text-left min-w-0">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${allDone ? 'bg-green-500 text-white' : 'bg-blue-700 text-white'}`}>
              {allDone ? <Check className="h-4 w-4" /> : number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleValue}
                    onChange={e => setTitleValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSaveTitle() } if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(title) } }}
                    onBlur={handleSaveTitle}
                    onClick={e => e.stopPropagation()}
                    className="font-semibold text-sm rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                  />
                ) : (
                  <span className="font-semibold text-sm">{title}</span>
                )}
                {duration && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                    {duration}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                  <div className={`h-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${total > 0 ? (checked / total) * 100 : 0}%` }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{checked}/{total}</span>
              </div>
            </div>
          </button>
          <div className="flex items-center gap-1 flex-shrink-0">
            {sectionState.note && <div className="w-2 h-2 rounded-full bg-amber-400" />}
            {isCustomSection && (
              <>
                <button onClick={e => { e.stopPropagation(); setEditingTitle(true) }}
                  className="p-1 rounded transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={e => { e.stopPropagation(); onDeleteSection?.() }}
                  className="p-1 rounded text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <button onClick={onToggleSection}>
              {isOpen
                ? <ChevronUp className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                : <ChevronDown className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />}
            </button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 pb-3 space-y-3">
          {warning && (
            <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{warning}</p>
            </div>
          )}

          {/* Section note */}
          <SectionNoteRow
            sectionNoteId={sectionNoteId}
            note={sectionState.note}
            noteOpen={sectionNoteOpen}
            noteValue={noteValues.get(sectionNoteId) ?? sectionState.note}
            onToggleNote={() => onToggleNote(sectionNoteId, sectionState.note)}
            onNoteChange={val => onNoteChange(sectionNoteId, val)}
            onNoteSave={onNoteSave}
          />

          {/* All items */}
          <div className="space-y-2">
            {staticItems.map(item => {
              const itemState = getState(item.id)
              return (
                <ItemRow
                  key={item.id}
                  itemId={item.id}
                  label={item.label}
                  staticSubItems={item.subItems}
                  checked={itemState.checked}
                  note={itemState.note}
                  onToggle={() => toggle(item.id)}
                  noteOpen={openNotes.has(item.id)}
                  noteValue={noteValues.get(item.id) ?? itemState.note}
                  onToggleNote={() => onToggleNote(item.id, itemState.note)}
                  onNoteChange={val => onNoteChange(item.id, val)}
                  onNoteSave={onNoteSave}
                  customSubItems={getCustomSubItems(item.id)}
                  getState={getState}
                  toggle={toggle}
                  saveNote={saveNote}
                  onAddSubItem={(label) => onAddSubItem(item.id, label)}
                  onRemoveSubItem={(id) => onRemoveSubItem(item.id, id)}
                  onEditSubItem={(id, label) => onEditSubItem(item.id, id, label)}
                />
              )
            })}

            {customItems.map(item => {
              const cid = `custom-${item.id}`
              const itemState = getState(cid)
              return (
                <ItemRow
                  key={cid}
                  itemId={cid}
                  label={item.label}
                  staticSubItems={[]}
                  checked={itemState.checked}
                  note={itemState.note}
                  isCustom
                  onToggle={() => toggle(cid)}
                  onDelete={() => item.id !== undefined && onRemoveItem(item.id)}
                  onEdit={(newLabel) => item.id !== undefined && onEditItem(item.id, newLabel)}
                  noteOpen={openNotes.has(cid)}
                  noteValue={noteValues.get(cid) ?? itemState.note}
                  onToggleNote={() => onToggleNote(cid, itemState.note)}
                  onNoteChange={val => onNoteChange(cid, val)}
                  onNoteSave={onNoteSave}
                  customSubItems={getCustomSubItems(cid)}
                  getState={getState}
                  toggle={toggle}
                  saveNote={saveNote}
                  onAddSubItem={(label) => onAddSubItem(cid, label)}
                  onRemoveSubItem={(id) => onRemoveSubItem(cid, id)}
                  onEditSubItem={(id, label) => onEditSubItem(cid, id, label)}
                />
              )
            })}
          </div>

          {/* Add item */}
          {addingItem ? (
            <div className="flex gap-2 pt-1">
              <input
                autoFocus
                type="text"
                value={newItemLabel}
                onChange={e => setNewItemLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); if (e.key === 'Escape') { setAddingItem(false); setNewItemLabel('') } }}
                placeholder="Descrizione punto..."
                className="flex-1 h-9 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
              />
              <Button size="sm" onClick={handleAddItem} disabled={!newItemLabel.trim()}>Aggiungi</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAddingItem(false); setNewItemLabel('') }}>Annulla</Button>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-1.5 text-xs transition-colors py-1 w-full"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Aggiungi punto
            </button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function GuideChecklist() {
  const {
    loading, toggle, saveNote, getState,
    getCustomItems, addItem, removeItem, editItemLabel,
    getCustomSubItems, addSubItem, removeSubItem, editSubItemLabel,
    customSections, addSection, removeSection, editSectionTitle,
    progress, totalProgress,
  } = useChecklist()

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['s1']))
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set())
  const [noteValues, setNoteValues] = useState<Map<string, string>>(new Map())
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleNote = useCallback((id: string, currentNote: string) => {
    setNoteValues(prev => { const next = new Map(prev); if (!next.has(id)) next.set(id, currentNote); return next })
    setOpenNotes(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }, [])

  const handleNoteSave = useCallback(async (id: string) => {
    const note = noteValues.get(id) ?? ''
    await saveNote(id, note)
    setOpenNotes(prev => { const next = new Set(prev); next.delete(id); return next })
  }, [noteValues, saveNote])

  const allSectionsForProgress: SectionInfo[] = [
    ...CHECKLIST_SECTIONS.map(s => ({
      id: s.id,
      staticItems: s.items.map(item => ({ id: item.id, subCount: item.subItems.length })),
    })),
    ...customSections.map(s => ({ id: `cs-${s.id!}`, staticItems: [] })),
  ]
  const { checked: totalChecked, total: totalItems } = totalProgress(allSectionsForProgress)

  const handleAddSection = async () => {
    const t = newSectionTitle.trim()
    if (!t) return
    await addSection(t)
    setNewSectionTitle('')
    setAddingSection(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12" style={{ color: 'hsl(var(--muted-foreground))' }}>Caricamento...</div>
  }

  const sharedProps = {
    openNotes, noteValues, onToggleNote: toggleNote,
    onNoteChange: (id: string, val: string) => setNoteValues(prev => new Map(prev).set(id, val)),
    onNoteSave: handleNoteSave,
    toggle, saveNote, getState, progress,
    getCustomSubItems,
    onAddSubItem: addSubItem,
    onRemoveSubItem: removeSubItem,
    onEditSubItem: editSubItemLabel,
  }

  return (
    <div className="space-y-3">
      {/* Global progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso totale</span>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{totalChecked}/{totalItems}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <div className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${totalItems > 0 ? (totalChecked / totalItems) * 100 : 0}%` }} />
          </div>
          {totalChecked === totalItems && totalItems > 0 && (
            <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2 font-medium">✓ Guida completata!</p>
          )}
        </CardContent>
      </Card>

      {/* Static sections */}
      {CHECKLIST_SECTIONS.map(section => (
        <SectionCard
          key={section.id}
          sectionId={section.id}
          number={section.number}
          title={section.title}
          duration={section.duration}
          warning={section.warning}
          staticItems={section.items}
          isOpen={openSections.has(section.id)}
          onToggleSection={() => toggleSection(section.id)}
          customItems={getCustomItems(section.id)}
          onAddItem={(label) => addItem(section.id, label)}
          onRemoveItem={(id) => removeItem(section.id, id)}
          onEditItem={(id, label) => editItemLabel(section.id, id, label)}
          {...sharedProps}
        />
      ))}

      {/* Custom sections */}
      {customSections.map((cs, idx) => {
        const sid = `cs-${cs.id!}`
        return (
          <SectionCard
            key={sid}
            sectionId={sid}
            number={CHECKLIST_SECTIONS.length + idx + 1}
            title={cs.title}
            isOpen={openSections.has(sid)}
            onToggleSection={() => toggleSection(sid)}
            customItems={getCustomItems(sid)}
            onAddItem={(label) => addItem(sid, label)}
            onRemoveItem={(id) => removeItem(sid, id)}
            onEditItem={(id, label) => editItemLabel(sid, id, label)}
            isCustomSection
            onDeleteSection={() => cs.id !== undefined && removeSection(cs.id)}
            onEditSectionTitle={(t) => cs.id !== undefined && editSectionTitle(cs.id, t)}
            {...sharedProps}
          />
        )
      })}

      {/* Add section */}
      {addingSection ? (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-medium mb-3">Nuova sezione</p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') { setAddingSection(false); setNewSectionTitle('') } }}
                placeholder="Titolo della sezione..."
                className="flex-1 h-9 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
              />
              <Button size="sm" onClick={handleAddSection} disabled={!newSectionTitle.trim()}>Crea</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAddingSection(false); setNewSectionTitle('') }}>Annulla</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed text-sm transition-colors"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
        >
          <Plus className="h-4 w-4" />
          Aggiungi sezione personalizzata
        </button>
      )}
    </div>
  )
}
