import { useRef, useState } from 'react'
import { Plus, Trash2, Copy, ChevronRight, BarChart3, Download, Upload } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { ScenarioComparison } from './ScenarioComparison'
import { formatCurrency } from '../../lib/format'
import { monthlyPayment } from '../../lib/mortgage-math'
import { getScenarioChecklistData } from '../../lib/db'
import type { Scenario } from '../../types/mortgage'
import type { ScenarioImportFile } from '../../hooks/use-scenarios'

interface Props {
  scenarios: Scenario[]
  activeScenarioId: number | null
  onCreate: () => Promise<void>
  onSelect: (id: number) => void
  onDelete: (id: number) => Promise<void>
  onDuplicate: (id: number) => Promise<number>
  onImport: (data: ScenarioImportFile) => Promise<void>
}

export function ScenarioSelector({ scenarios, activeScenarioId, onCreate, onSelect, onDelete, onDuplicate, onImport }: Props) {
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [compareScenarios, setCompareScenarios] = useState<Scenario[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreate = async () => {
    setCreating(true)
    try {
      await onCreate()
    } finally {
      setCreating(false)
    }
  }

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const scenarioExports = await Promise.all(
        scenarios.map(async ({ id, name, amount, years, tan, setupFee, appraisalFee, monthlyFee, insuranceCost, houseValue, downPayment, notaryAgencyTaxes, renovationFurniture, condoFeesAnnual, maintenanceAnnual, tariInsuranceAnnual }) => {
          const cl = id !== undefined ? await getScenarioChecklistData(id) : null
          return {
            name, amount, years, tan, setupFee, appraisalFee, monthlyFee, insuranceCost, houseValue,
            downPayment, notaryAgencyTaxes, renovationFurniture, condoFeesAnnual, maintenanceAnnual, tariInsuranceAnnual,
            checklist: cl ? {
              states: cl.states.map(s => ({ itemId: s.itemId, checked: s.checked, note: s.note })),
              customSections: cl.customSections.map(s => ({ exportId: s.id!, title: s.title })),
              customItems: cl.customItems.map(i => ({ exportId: i.id!, sectionId: i.sectionId, label: i.label })),
              customSubItems: cl.customSubItems.map(s => ({ exportId: s.id!, parentItemId: s.parentItemId, label: s.label })),
            } : undefined,
          }
        })
      )
      const data: ScenarioImportFile = {
        version: 2,
        exportedAt: new Date().toISOString(),
        scenarios: scenarioExports,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().slice(0, 10)
      a.download = `scenari-mutuo-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImportError(null)
    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ScenarioImportFile
      if (!Array.isArray(data.scenarios) || data.scenarios.length === 0) {
        setImportError('File non valido: nessuno scenario trovato.')
        return
      }
      for (const s of data.scenarios) {
        if (!s.name || typeof s.amount !== 'number' || typeof s.years !== 'number' || typeof s.tan !== 'number') {
          setImportError('File non valido: alcuni scenari hanno dati mancanti.')
          return
        }
      }
      await onImport(data)
    } catch {
      setImportError('Impossibile leggere il file. Assicurati che sia un JSON valido.')
    } finally {
      setImporting(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  if (compareScenarios) {
    return <ScenarioComparison scenarios={compareScenarios} onBack={() => setCompareScenarios(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">I tuoi scenari</h2>
          <p className="text-sm text-muted-foreground">
            {scenarios.length === 0 ? 'Crea il tuo primo scenario' : `${scenarios.length} scenario${scenarios.length !== 1 ? 'i' : ''}`}
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuovo
        </Button>
      </div>

      {selected.size >= 2 && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            const sel = scenarios.filter(s => s.id !== undefined && selected.has(s.id!))
            setCompareScenarios(sel)
          }}
        >
          <BarChart3 className="h-4 w-4" />
          Confronta {selected.size} scenari
        </Button>
      )}
      {selected.size === 1 && (
        <p className="text-xs text-center text-muted-foreground">
          Seleziona un altro scenario per confrontarli
        </p>
      )}

      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Nessuno scenario</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea un nuovo scenario per iniziare a simulare il tuo mutuo
              </p>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="mt-2">
              Crea il primo scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {scenarios.map(scenario => {
            const payment = monthlyPayment(scenario.amount, scenario.tan, scenario.years)
            const isActive = scenario.id === activeScenarioId
            const isSelected = scenario.id !== undefined && selected.has(scenario.id!)

            return (
              <Card
                key={scenario.id}
                className={`transition-all cursor-pointer ${
                  isActive ? 'ring-2 ring-blue-600' : isSelected ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-0">
                    {/* Checkbox selection for comparison */}
                    <button
                      onClick={() => scenario.id !== undefined && toggleSelect(scenario.id!)}
                      className="p-3 flex-shrink-0"
                      aria-label={isSelected ? 'Deseleziona' : 'Seleziona per confronto'}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Main clickable area */}
                    <button
                      onClick={() => scenario.id !== undefined && onSelect(scenario.id!)}
                      className="flex-1 flex items-center justify-between py-3 pr-2 text-left min-w-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{scenario.name}</p>
                          {isActive && (
                            <span className="text-[10px] font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full flex-shrink-0">
                              attivo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{formatCurrency(scenario.amount)}</span>
                          <span className="text-xs text-muted-foreground">{scenario.tan}%</span>
                          <span className="text-xs text-muted-foreground">{scenario.years} anni</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{formatCurrency(payment)}</p>
                          <p className="text-[10px] text-muted-foreground">al mese</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex gap-0.5 pr-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          if (scenario.id) await onDuplicate(scenario.id)
                        }}
                        aria-label="Duplica"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" aria-label="Elimina">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Elimina scenario</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare "{scenario.name}"? Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => scenario.id && onDelete(scenario.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Backup e ripristino */}
      <div className="pt-2">
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Backup e ripristino</p>
        <div className="flex gap-2">
          {scenarios.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={handleExport} disabled={exporting}>
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Esportazione…' : 'Scarica JSON'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 flex-1"
            disabled={importing}
            onClick={() => { setImportError(null); fileInputRef.current?.click() }}
          >
            <Upload className="h-3.5 w-3.5" />
            {importing ? 'Importazione…' : 'Importa JSON'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
        {importError && (
          <p className="text-xs text-red-500 mt-2">{importError}</p>
        )}
      </div>
    </div>
  )
}
