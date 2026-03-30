import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Home, Calculator, Table, BarChart3, BookOpen,
  Sun, Moon, Menu, X, ChevronDown, Check, Pencil, ArrowLeft, BookMarked,
} from 'lucide-react'
import { MortgageForm } from './components/calculator/MortgageForm'
import { ResultsCard } from './components/calculator/ResultsCard'
import { AmortizationTable } from './components/amortization/AmortizationTable'
import { MortgageCharts } from './components/charts/MortgageCharts'
import { ScenarioSelector } from './components/scenarios/ScenarioSelector'
import { ScenarioHome } from './components/scenarios/ScenarioHome'
import { GuideChecklist } from './components/guide/GuideChecklist'
import { MortgageWiki } from './components/guide/MortgageWiki'
import { useMortgage } from './hooks/use-mortgage'
import { useScenarios } from './hooks/use-scenarios'
import { Button } from './components/ui/button'
import { getDarkMode, setDarkMode } from './lib/db'
import type { MortgageInputs, Scenario } from './types/mortgage'

// ─── Types ────────────────────────────────────────────────────────────────────

type AppView = 'scenarios' | 'guide' | 'scenario'
type ScenarioTab = 'home' | 'calculator' | 'amortization' | 'charts' | 'logbook'

const SCENARIO_TABS: { id: ScenarioTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calculator', label: 'Calcola', icon: Calculator },
  { id: 'amortization', label: 'Piano', icon: Table },
  { id: 'charts', label: 'Grafici', icon: BarChart3 },
  { id: 'logbook', label: 'Diario', icon: BookOpen },
]

const SCENARIO_TAB_IDS: ScenarioTab[] = ['home', 'calculator', 'amortization', 'charts', 'logbook']

// ─── Hash routing helpers ─────────────────────────────────────────────────────

function parseHash(): { view: AppView; tab: ScenarioTab } {
  const hash = window.location.hash.slice(1)
  if (hash === 'scenarios') return { view: 'scenarios', tab: 'home' }
  if (hash === 'guide') return { view: 'guide', tab: 'home' }
  if (SCENARIO_TAB_IDS.includes(hash as ScenarioTab)) {
    return { view: 'scenario', tab: hash as ScenarioTab }
  }
  return { view: 'scenarios', tab: 'home' }
}

function buildHash(view: AppView, tab?: ScenarioTab): string {
  if (view === 'scenarios') return '#scenarios'
  if (view === 'guide') return '#guide'
  return `#${tab ?? 'home'}`
}

// ─── Scenario name editor ─────────────────────────────────────────────────────

function ScenarioNameEditor({
  name, onSave,
}: { name: string; onSave: (name: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setValue(name)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, name])

  const commit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== name) onSave(trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="text-sm font-semibold bg-transparent border-b border-blue-500 focus:outline-none max-w-[160px]"
        style={{ color: 'hsl(var(--foreground))' }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-opacity max-w-[160px] truncate"
    >
      <span className="truncate">{name}</span>
      <Pencil className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
    </button>
  )
}

// ─── Inputs from scenario ─────────────────────────────────────────────────────

function inputsFromScenario(s: Scenario): MortgageInputs {
  return {
    amount: s.amount,
    years: s.years,
    tan: s.tan,
    fees: {
      setupFee: s.setupFee,
      appraisalFee: s.appraisalFee,
      monthlyFee: s.monthlyFee,
      insuranceCost: s.insuranceCost,
    },
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkModeState] = useState(getDarkMode)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Routing state
  const [view, setView] = useState<AppView>(() => parseHash().view)
  const [scenarioTab, setScenarioTab] = useState<ScenarioTab>(() => parseHash().tab)

  // Scenarios
  const {
    scenarios, loading: scenariosLoading, activeScenarioId, activeScenario,
    setActive, create, remove, duplicate, updateInputs, rename,
  } = useScenarios()

  // Inputs — local state synced from active scenario
  const [inputs, setInputs] = useState<MortgageInputs>(() => {
    // Will be overwritten once scenarios load
    return { amount: 200000, years: 20, tan: 3.5, fees: { setupFee: 0, appraisalFee: 0, monthlyFee: 0, insuranceCost: 0 } }
  })

  // Sync inputs when active scenario changes
  useEffect(() => {
    if (activeScenario) {
      setInputs(inputsFromScenario(activeScenario))
    }
  }, [activeScenario?.id]) // Only when the ID changes, not on every update

  // Auto-save inputs with debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!activeScenarioId) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateInputs(activeScenarioId, inputs)
    }, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [inputs, activeScenarioId, updateInputs])

  const result = useMortgage(inputs)

  // ── Navigation ──────────────────────────────────────────────────────────────

  const navigateTo = useCallback((newView: AppView, newTab?: ScenarioTab) => {
    setView(newView)
    if (newTab) setScenarioTab(newTab)
    setMenuOpen(false)
    window.history.pushState(null, '', buildHash(newView, newTab))
  }, [])

  // Back/forward support
  useEffect(() => {
    const handler = () => {
      const { view: v, tab: t } = parseHash()
      setView(v)
      setScenarioTab(t)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // If scenario view is requested but no active scenario, redirect to scenarios
  useEffect(() => {
    if (!scenariosLoading && view === 'scenario' && !activeScenarioId) {
      navigateTo('scenarios')
    }
  }, [scenariosLoading, view, activeScenarioId, navigateTo])

  // If first load has scenarios and none active, show selector
  useEffect(() => {
    if (!scenariosLoading && view === 'scenarios' && scenarios.length === 0) {
      // Stay on scenarios view — ScenarioSelector handles the empty state
    }
  }, [scenariosLoading, view, scenarios.length])

  // ── Scenario handlers ───────────────────────────────────────────────────────

  const handleSelectScenario = useCallback((id: number) => {
    setActive(id)
    navigateTo('scenario', 'home')
  }, [setActive, navigateTo])

  const handleCreateScenario = useCallback(async () => {
    const id = await create()
    setActive(id)
    navigateTo('scenario', 'calculator')
  }, [create, setActive, navigateTo])

  const handleDuplicateScenario = useCallback(async (id: number) => {
    const newId = await duplicate(id)
    return newId
  }, [duplicate])

  // ── Dark mode ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setDarkMode(darkMode)
  }, [darkMode])

  // ── Close menu on outside click ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // ── Render ───────────────────────────────────────────────────────────────────

  const inScenario = view === 'scenario' && activeScenario !== null

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Left: logo + back (if in scenario or guide) */}
          <div className="flex items-center gap-2 min-w-0">
            {(view === 'scenario' || view === 'guide') ? (
              <button
                onClick={() => navigateTo('scenarios')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Tutti gli scenari"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            )}

            {/* Title area */}
            {view === 'scenarios' && (
              <h1 className="font-bold text-lg">Mutuo</h1>
            )}
            {view === 'guide' && (
              <h1 className="font-semibold text-base">Guida al mutuo</h1>
            )}
            {inScenario && activeScenario && (
              <ScenarioNameEditor
                name={activeScenario.name}
                onSave={(name) => activeScenario.id && rename(activeScenario.id, name)}
              />
            )}
          </div>

          {/* Right: menu + dark mode */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Hamburger menu */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-52 rounded-lg border shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                >
                  <button
                    onClick={() => navigateTo('scenarios')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                    style={{
                      backgroundColor: view === 'scenarios' ? 'hsl(var(--muted))' : undefined,
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <BookMarked className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">Scenari</span>
                    {view === 'scenarios' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => navigateTo('guide')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                    style={{
                      backgroundColor: view === 'guide' ? 'hsl(var(--muted))' : undefined,
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">Guida al mutuo</span>
                    {view === 'guide' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                  {inScenario && (
                    <>
                      <div className="h-px mx-4" style={{ backgroundColor: 'hsl(var(--border))' }} />
                      {SCENARIO_TABS.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => navigateTo('scenario', tab.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                          style={{
                            backgroundColor: scenarioTab === tab.id ? 'hsl(var(--muted))' : undefined,
                            color: 'hsl(var(--foreground))',
                          }}
                        >
                          <tab.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{tab.label}</span>
                          {scenarioTab === tab.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkModeState(d => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Sub-nav for scenario tabs (desktop) */}
        {inScenario && (
          <div
            className="hidden md:flex max-w-2xl mx-auto px-4 border-t"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            {SCENARIO_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo('scenario', tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  scenarioTab === tab.id
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main className={`max-w-2xl mx-auto px-4 py-4 ${inScenario ? 'pb-24 md:pb-6' : 'pb-6'}`}>

        {/* Scenarios view */}
        {view === 'scenarios' && (
          <ScenarioSelector
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onCreate={handleCreateScenario}
            onSelect={handleSelectScenario}
            onDelete={remove}
            onDuplicate={handleDuplicateScenario}
          />
        )}

        {/* Guide / Wiki view */}
        {view === 'guide' && <MortgageWiki />}

        {/* Scenario workspace */}
        {inScenario && activeScenario && (
          <>
            {scenarioTab === 'home' && (
              <ScenarioHome
                scenarioId={activeScenario.id!}
                scenarioName={activeScenario.name}
                inputs={inputs}
                result={result}
                onNavigate={(tab) => navigateTo('scenario', tab as ScenarioTab)}
              />
            )}

            {scenarioTab === 'calculator' && (
              <div className="space-y-4">
                <MortgageForm inputs={inputs} onChange={setInputs} />
                <ResultsCard result={result} inputs={inputs} />
              </div>
            )}

            {scenarioTab === 'amortization' && (
              <AmortizationTable schedule={result.schedule} crossoverMonth={result.crossoverMonth} />
            )}

            {scenarioTab === 'charts' && (
              <MortgageCharts
                schedule={result.schedule}
                crossoverMonth={result.crossoverMonth}
                totalInterest={result.totalInterest}
                totalPaid={result.totalPaid}
              />
            )}

            {scenarioTab === 'logbook' && (
              <GuideChecklist scenarioId={activeScenario.id!} />
            )}
          </>
        )}
      </main>

      {/* ── Mobile bottom nav (only when in a scenario) ── */}
      {inScenario && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bottom-nav"
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        >
          <div className="flex">
            {SCENARIO_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo('scenario', tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
                  scenarioTab === tab.id
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] leading-none">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
