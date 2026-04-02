import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Home, Calculator, Table, BarChart3, BookOpen,
  Sun, Moon, Menu, X, Check, ArrowLeft, BookMarked,
} from 'lucide-react'
import { MortgageForm } from './components/calculator/MortgageForm'
import { ResultsCard } from './components/calculator/ResultsCard'
import { TotalCostCard } from './components/calculator/TotalCostCard'
import { AmortizationTable } from './components/amortization/AmortizationTable'
import { MortgageCharts } from './components/charts/MortgageCharts'
import { ScenarioSelector } from './components/scenarios/ScenarioSelector'
import { ScenarioHome } from './components/scenarios/ScenarioHome'
import { GuideChecklist } from './components/guide/GuideChecklist'
import { MortgageWiki } from './components/guide/MortgageWiki'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
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

const SCENARIO_TAB_IDS = SCENARIO_TABS.map(t => t.id)

// ─── URL routing ──────────────────────────────────────────────────────────────

const BASE = '/mutuo-calculator'

function parsePath(pathname: string): { view: AppView; scenarioId: number | null; tab: ScenarioTab } {
  // Handle GitHub Pages redirect query param
  const search = window.location.search
  if (search.startsWith('?redirect=')) {
    const redirected = decodeURIComponent(search.slice(10))
    return parsePath(BASE + redirected)
  }

  let path = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  if (!path || path === '/') return { view: 'scenarios', scenarioId: null, tab: 'home' }
  if (path === '/guide') return { view: 'guide', scenarioId: null, tab: 'home' }

  const match = path.match(/^\/(\d+)(?:\/([a-z]+))?(?:\/)?$/)
  if (match) {
    const id = parseInt(match[1], 10)
    const tabStr = match[2] ?? 'home'
    const tab = (SCENARIO_TAB_IDS.includes(tabStr as ScenarioTab) ? tabStr : 'home') as ScenarioTab
    return { view: 'scenario', scenarioId: id, tab }
  }

  return { view: 'scenarios', scenarioId: null, tab: 'home' }
}

function buildUrl(view: AppView, scenarioId?: number | null, tab?: ScenarioTab): string {
  if (view === 'scenarios') return `${BASE}/`
  if (view === 'guide') return `${BASE}/guide`
  return `${BASE}/${scenarioId}/${tab ?? 'home'}`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    additionalCosts: {
      houseValue: s.houseValue ?? 0,
      downPayment: s.downPayment ?? 0,
      notaryAgencyTaxes: s.notaryAgencyTaxes ?? 0,
      renovationFurniture: s.renovationFurniture ?? 0,
      condoFeesAnnual: s.condoFeesAnnual ?? 0,
      maintenanceAnnual: s.maintenanceAnnual ?? 0,
      tariInsuranceAnnual: s.tariInsuranceAnnual ?? 0,
    },
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkModeState] = useState(getDarkMode)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Routing — parse current URL as source of truth
  const [{ view, scenarioId: activeScenarioId, tab: scenarioTab }, setRoute] = useState(
    () => parsePath(window.location.pathname)
  )

  // Scenarios
  const { scenarios, loading: scenariosLoading, create, remove, duplicate, updateInputs, rename, importScenarios } = useScenarios()

  // Active scenario object
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) ?? null

  // Inputs — local state, synced from active scenario when it changes
  const [inputs, setInputs] = useState<MortgageInputs>({
    amount: 200000, years: 20, tan: 3.5,
    fees: { setupFee: 0, appraisalFee: 0, monthlyFee: 0, insuranceCost: 0 },
    additionalCosts: { houseValue: 0, downPayment: 0, notaryAgencyTaxes: 0, renovationFurniture: 0, condoFeesAnnual: 0, maintenanceAnnual: 0, tariInsuranceAnnual: 0 },
  })

  useEffect(() => {
    if (activeScenario) setInputs(inputsFromScenario(activeScenario))
  }, [activeScenario?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save inputs with debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!activeScenarioId) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { updateInputs(activeScenarioId, inputs) }, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [inputs, activeScenarioId, updateInputs])

  const result = useMortgage(inputs)

  // ── Navigation ──────────────────────────────────────────────────────────────

  const navigateTo = useCallback((
    newView: AppView,
    opts?: { tab?: ScenarioTab; scenarioId?: number | null }
  ) => {
    const sid = opts?.scenarioId !== undefined ? opts.scenarioId : activeScenarioId
    const tab = opts?.tab ?? 'home'
    setRoute({ view: newView, scenarioId: newView === 'scenario' ? sid : null, tab })
    setMenuOpen(false)
    window.history.pushState(null, '', buildUrl(newView, sid, tab))
    // Clear GH Pages redirect query if present
    if (window.location.search.startsWith('?redirect=')) {
      window.history.replaceState(null, '', buildUrl(newView, sid, tab))
    }
  }, [activeScenarioId])

  // Sync on browser back/forward
  useEffect(() => {
    const handler = () => setRoute(parsePath(window.location.pathname))
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // If we're in scenario view but scenario no longer exists (deleted), go to selector
  useEffect(() => {
    if (scenariosLoading) return
    if (view === 'scenario' && activeScenarioId !== null && scenarios.length > 0) {
      const exists = scenarios.some(s => s.id === activeScenarioId)
      if (!exists) navigateTo('scenarios')
    }
  }, [scenariosLoading, view, activeScenarioId, scenarios, navigateTo])

  // Handle GH Pages redirect on mount
  useEffect(() => {
    const search = window.location.search
    if (search.startsWith('?redirect=')) {
      const redirected = decodeURIComponent(search.slice(10))
      window.history.replaceState(null, '', BASE + redirected)
      setRoute(parsePath(BASE + redirected))
    }
  }, [])

  // ── Scenario handlers ───────────────────────────────────────────────────────

  const handleSelectScenario = useCallback((id: number) => {
    navigateTo('scenario', { scenarioId: id, tab: 'home' })
  }, [navigateTo])

  const handleCreateScenario = useCallback(async () => {
    const id = await create()
    navigateTo('scenario', { scenarioId: id, tab: 'calculator' })
  }, [create, navigateTo])

  const handleDuplicateScenario = useCallback(async (id: number): Promise<number> => {
    return duplicate(id)
  }, [duplicate])

  // ── Dark mode ────────────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    setDarkMode(darkMode)
  }, [darkMode])

  // ── Close menu on outside click ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
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
        <div className="max-w-2xl mx-auto px-3 h-14 flex items-center gap-2">

          {/* ── Left: back / logo ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {(view === 'scenario' || view === 'guide') ? (
              <button
                onClick={() => navigateTo('scenarios')}
                className="p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Tutti gli scenari"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
            )}
          </div>

          {/* ── Center: title / scenario name + tabs on desktop ── */}
          <div className="flex-1 flex items-center gap-0 min-w-0">
            {/* Title for non-scenario views */}
            {view === 'scenarios' && (
              <span className="font-bold text-base">Mutuo</span>
            )}
            {view === 'guide' && (
              <span className="font-semibold text-sm truncate">Guida al mutuo</span>
            )}

            {/* Scenario: tabs on desktop */}
            {inScenario && activeScenario && (
              <>
                {/* Tabs — desktop only, inline in header */}
                <nav className="hidden md:flex items-center h-14 gap-0.5">
                  {SCENARIO_TABS.map(tab => {
                    const active = scenarioTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigateTo('scenario', { tab: tab.id })}
                        className={`relative flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors ${
                          active
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5 flex-shrink-0" />
                        {tab.label}
                        {/* Active underline */}
                        {active && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                      </button>
                    )
                  })}
                </nav>
              </>
            )}
          </div>

          {/* ── Right: hamburger (global nav only) + dark mode ── */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <div className="relative" ref={menuRef}>
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-52 rounded-xl border shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                >
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Navigazione
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('scenarios')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-muted"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    <BookMarked className={`h-4 w-4 flex-shrink-0 ${view === 'scenarios' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    <span className="flex-1">Scenari</span>
                    {view === 'scenarios' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => navigateTo('guide')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-muted"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    <BookOpen className={`h-4 w-4 flex-shrink-0 ${view === 'guide' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    <span className="flex-1">Guida al mutuo</span>
                    {view === 'guide' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDarkModeState(d => !d)} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

        </div>
      </header>

      {/* ── Main content ── */}
      <main className={`max-w-2xl mx-auto px-4 py-4 ${inScenario ? 'pb-24 md:pb-6' : 'pb-6'}`}>

        {view === 'scenarios' && (
          <ScenarioSelector
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onCreate={handleCreateScenario}
            onSelect={handleSelectScenario}
            onDelete={remove}
            onDuplicate={handleDuplicateScenario}
            onImport={importScenarios}
          />
        )}

        {view === 'guide' && <MortgageWiki />}

        {inScenario && activeScenario && (
          <>
            {scenarioTab === 'home' && (
              <ScenarioHome
                scenarioId={activeScenario.id!}
                scenarioName={activeScenario.name}
                inputs={inputs}
                result={result}
                onNavigate={(tab) => navigateTo('scenario', { tab: tab as ScenarioTab })}
                onRename={(name) => activeScenario.id && rename(activeScenario.id, name)}
              />
            )}
            {scenarioTab === 'calculator' && (
              <div className="space-y-4">
                <MortgageForm inputs={inputs} onChange={setInputs} />
                <ResultsCard result={result} inputs={inputs} />
                <TotalCostCard result={result} inputs={inputs} />
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

      {/* ── Mobile bottom nav ── */}
      {inScenario && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bottom-nav"
          style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
        >
          <div className="flex">
            {SCENARIO_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo('scenario', { tab: tab.id })}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
                  scenarioTab === tab.id ? 'text-blue-700 dark:text-blue-400' : 'text-muted-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] leading-none">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ── PWA install prompt ── */}
      <PWAInstallPrompt />
    </div>
  )
}
