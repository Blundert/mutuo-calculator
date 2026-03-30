import { useState, useCallback, useEffect, useRef } from 'react'
import { Calculator, Table, BarChart3, BookMarked, BookOpen, Sun, Moon, Menu, X, Check } from 'lucide-react'
import { MortgageForm } from './components/calculator/MortgageForm'
import { ResultsCard } from './components/calculator/ResultsCard'
import { SaveScenarioDialog } from './components/calculator/SaveScenarioDialog'
import { AmortizationTable } from './components/amortization/AmortizationTable'
import { MortgageCharts } from './components/charts/MortgageCharts'
import { ScenarioList } from './components/scenarios/ScenarioList'
import { ScenarioComparison } from './components/scenarios/ScenarioComparison'
import { GuideChecklist } from './components/guide/GuideChecklist'
import { useMortgage } from './hooks/use-mortgage'
import { useScenarios } from './hooks/use-scenarios'
import { Button } from './components/ui/button'
import { getDarkMode, setDarkMode } from './lib/db'
import type { MortgageInputs, Scenario } from './types/mortgage'

const DEFAULT_INPUTS: MortgageInputs = {
  amount: 200000,
  years: 20,
  tan: 3.5,
  fees: {
    setupFee: 0,
    appraisalFee: 0,
    monthlyFee: 0,
    insuranceCost: 0,
  },
}

type TabId = 'calculator' | 'amortization' | 'charts' | 'scenarios' | 'guide'

const TAB_IDS: TabId[] = ['calculator', 'amortization', 'charts', 'scenarios', 'guide']

const TABS: { id: TabId; label: string; icon: typeof Calculator }[] = [
  { id: 'calculator', label: 'Calcolatore', icon: Calculator },
  { id: 'amortization', label: 'Ammortamento', icon: Table },
  { id: 'charts', label: 'Grafici', icon: BarChart3 },
  { id: 'scenarios', label: 'Scenari', icon: BookMarked },
  { id: 'guide', label: 'Guida', icon: BookOpen },
]

function getTabFromHash(): TabId {
  const hash = window.location.hash.slice(1) as TabId
  return TAB_IDS.includes(hash) ? hash : 'calculator'
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromHash)
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_INPUTS)
  const [darkMode, setDarkModeState] = useState(getDarkMode)
  const [compareScenarios, setCompareScenarios] = useState<Scenario[] | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const result = useMortgage(inputs)
  const { scenarios, save, remove, duplicate } = useScenarios()

  // Sync hash → tab on browser back/forward
  useEffect(() => {
    const handler = () => {
      setActiveTab(getTabFromHash())
      setCompareScenarios(null)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  // Update URL when tab changes
  const navigateTo = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setCompareScenarios(null)
    window.history.pushState(null, '', `#${tab}`)
    setMenuOpen(false)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setDarkMode(darkMode)
  }, [darkMode])

  const handleSave = useCallback(async (name: string) => {
    await save({
      name,
      amount: inputs.amount,
      years: inputs.years,
      tan: inputs.tan,
      ...inputs.fees,
    })
  }, [inputs, save])

  const handleLoadScenario = useCallback((scenario: Scenario) => {
    setInputs({
      amount: scenario.amount,
      years: scenario.years,
      tan: scenario.tan,
      fees: {
        setupFee: scenario.setupFee,
        appraisalFee: scenario.appraisalFee,
        monthlyFee: scenario.monthlyFee,
        insuranceCost: scenario.insuranceCost,
      },
    })
    navigateTo('calculator')
  }, [navigateTo])

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="font-bold text-lg">Mutuo</h1>
          </div>
          {/* Desktop hamburger menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Show active tab name */}
            {(() => {
              const active = TABS.find(t => t.id === activeTab)
              return active ? (
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {active.label}
                </span>
              ) : null
            })()}
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
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => navigateTo(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                      style={{
                        backgroundColor: activeTab === tab.id ? 'hsl(var(--muted))' : undefined,
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      <tab.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{tab.label}</span>
                      {activeTab === tab.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkModeState(d => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          {/* Mobile dark mode button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setDarkModeState(d => !d)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-6">
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <MortgageForm inputs={inputs} onChange={setInputs} />
            <ResultsCard result={result} inputs={inputs} />
            <SaveScenarioDialog inputs={inputs} onSave={handleSave} />
          </div>
        )}

        {activeTab === 'amortization' && (
          <AmortizationTable schedule={result.schedule} crossoverMonth={result.crossoverMonth} />
        )}

        {activeTab === 'charts' && (
          <MortgageCharts
            schedule={result.schedule}
            crossoverMonth={result.crossoverMonth}
            totalInterest={result.totalInterest}
            totalPaid={result.totalPaid}
          />
        )}

        {activeTab === 'scenarios' && (
          compareScenarios ? (
            <ScenarioComparison scenarios={compareScenarios} onBack={() => setCompareScenarios(null)} />
          ) : (
            <ScenarioList
              scenarios={scenarios}
              onLoad={handleLoadScenario}
              onDelete={remove}
              onDuplicate={duplicate}
              onCompare={setCompareScenarios}
            />
          )
        )}

        {activeTab === 'guide' && (
          <GuideChecklist />
        )}
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bottom-nav"
        style={{
          backgroundColor: 'hsl(var(--background))',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition-colors ${
                activeTab === tab.id
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
    </div>
  )
}
