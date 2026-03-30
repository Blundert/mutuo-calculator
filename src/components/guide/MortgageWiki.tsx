import { useState, useCallback } from 'react'
import { CheckCircle2, Circle, StickyNote, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { WIKI_SECTIONS } from '../../data/wiki'
import { useWiki } from '../../hooks/use-wiki'

function NoteEditor({ value, onChange, onSave }: {
  value: string
  onChange: (v: string) => void
  onSave: () => void
}) {
  return (
    <div className="mt-2 space-y-1.5">
      <textarea
        className="w-full text-sm rounded-md border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          backgroundColor: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }}
        rows={3}
        placeholder="Aggiungi una nota..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        onClick={onSave}
        className="text-xs font-medium px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Salva nota
      </button>
    </div>
  )
}

function ConceptCard({ conceptId, title, subtitle, body }: {
  conceptId: string
  title: string
  subtitle?: string
  body: string
}) {
  const { getState, toggleStudied, saveNote } = useWiki()
  const [expanded, setExpanded] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteValue, setNoteValue] = useState(() => getState(conceptId).note)

  const state = getState(conceptId)

  const handleSaveNote = useCallback(async () => {
    await saveNote(conceptId, noteValue)
    setNoteOpen(false)
  }, [conceptId, noteValue, saveNote])

  const handleToggleNote = () => {
    if (!noteOpen) setNoteValue(state.note)
    setNoteOpen(o => !o)
  }

  // Parse simple markdown: **bold** and newlines
  const renderBody = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g)
      return (
        <p key={i} className={`text-sm ${i > 0 ? 'mt-1.5' : ''} ${line === '' ? 'mt-2' : ''}`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      )
    })
  }

  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-3 text-left"
        style={{ backgroundColor: state.studied ? 'hsl(var(--muted))' : undefined }}
      >
        <button
          onClick={e => { e.stopPropagation(); toggleStudied(conceptId) }}
          className="flex-shrink-0"
          aria-label={state.studied ? 'Segna come non studiato' : 'Segna come studiato'}
        >
          {state.studied ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${state.studied ? 'text-muted-foreground line-through' : ''}`}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {state.note && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-2 border-t"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div style={{ color: 'hsl(var(--foreground))' }}>
            {renderBody(body)}
          </div>

          {/* Note section */}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <button
              onClick={handleToggleNote}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <StickyNote className="h-3.5 w-3.5" />
              {state.note ? 'Modifica nota' : 'Aggiungi nota'}
              {state.note && <span className="text-amber-500 ml-1">●</span>}
            </button>
            {state.note && !noteOpen && (
              <p className="mt-1.5 text-xs text-muted-foreground italic bg-amber-50 dark:bg-amber-950 rounded px-2 py-1.5">
                {state.note}
              </p>
            )}
            {noteOpen && (
              <NoteEditor value={noteValue} onChange={setNoteValue} onSave={handleSaveNote} />
            )}
          </div>

          {/* Mark as studied button */}
          <button
            onClick={() => toggleStudied(conceptId)}
            className={`mt-3 w-full text-xs font-medium py-1.5 rounded-md border transition-colors ${
              state.studied
                ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
                : 'border-dashed border-muted-foreground text-muted-foreground hover:border-green-500 hover:text-green-600'
            }`}
          >
            {state.studied ? '✓ Studiato' : 'Segna come studiato'}
          </button>
        </div>
      )}
    </div>
  )
}

export function MortgageWiki() {
  const { loading, totalStudied } = useWiki()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([WIKI_SECTIONS[0]?.id]))

  const totalConcepts = WIKI_SECTIONS.reduce((sum, s) => sum + s.concepts.length, 0)
  const progressPct = totalConcepts > 0 ? Math.round((totalStudied / totalConcepts) * 100) : 0

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Caricamento...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Guida al mutuo</h2>
          <p className="text-sm text-muted-foreground">
            Studia i concetti fondamentali per essere pronto
          </p>
        </div>
      </div>

      {/* Progress */}
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: 'hsl(var(--border))' }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Progressi</p>
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
            {totalStudied}/{totalConcepts}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progressPct === 100
            ? 'Hai studiato tutti i concetti!'
            : `${progressPct}% studiato — ${totalConcepts - totalStudied} concetti rimanenti`
          }
        </p>
      </div>

      {/* Sections */}
      {WIKI_SECTIONS.map(section => {
        const isOpen = expandedSections.has(section.id)
        const studiedInSection = section.concepts.filter(c => {
          // We need to check via hook but it's called inside ConceptCard
          // We just render and let ConceptCard manage its own state
          return false
        }).length

        return (
          <div
            key={section.id}
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm"
              style={{ backgroundColor: 'hsl(var(--muted))' }}
            >
              <span>{section.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-normal">
                  {section.concepts.length} concetti
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            {isOpen && (
              <div className="p-3 space-y-2">
                {section.concepts.map(concept => (
                  <ConceptCard
                    key={concept.id}
                    conceptId={concept.id}
                    title={concept.title}
                    subtitle={concept.subtitle}
                    body={concept.body}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
