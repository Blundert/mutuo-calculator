import { Calculator, Table, TrendingUp, BookOpen } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { formatCurrency, formatPercent } from '../../lib/format'
import { useChecklist } from '../../hooks/use-checklist'
import { CHECKLIST_SECTIONS } from '../../data/checklist'
import type { MortgageResult, MortgageInputs } from '../../types/mortgage'

interface Props {
  scenarioId: number
  scenarioName: string
  inputs: MortgageInputs
  result: MortgageResult
  onNavigate: (tab: string) => void
}

export function ScenarioHome({ scenarioId, scenarioName, inputs, result, onNavigate }: Props) {
  const { totalProgress, customSections, loading } = useChecklist(scenarioId)

  const allSectionsForProgress = [
    ...CHECKLIST_SECTIONS.map(s => ({
      id: s.id,
      staticItems: s.items.map(item => ({ id: item.id, subCount: item.subItems.length })),
    })),
    ...(customSections.map(s => ({ id: `cs-${s.id!}`, staticItems: [] }))),
  ]
  const checklistProgress = loading ? { checked: 0, total: 0 } : totalProgress(allSectionsForProgress)

  const progressPct = checklistProgress.total > 0
    ? Math.round((checklistProgress.checked / checklistProgress.total) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Hero: rata mensile */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <p className="text-sm text-muted-foreground text-center mb-1">Rata mensile stimata</p>
          <p className="text-5xl font-bold text-blue-700 dark:text-blue-400 text-center mb-1">
            {formatCurrency(result.monthlyPayment)}
          </p>
          {inputs.fees.monthlyFee > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              + {formatCurrency(inputs.fees.monthlyFee)} spese mensili
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center mt-2">
            {scenarioName}
          </p>
        </CardContent>
      </Card>

      {/* Metriche chiave */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Importo</p>
            <p className="text-lg font-bold">{formatCurrency(inputs.amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Durata</p>
            <p className="text-lg font-bold">{inputs.years} anni</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">TAN</p>
            <p className="text-lg font-bold">{formatPercent(inputs.tan)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">TAEG</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatPercent(result.taeg)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Totale interessi</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400">{formatCurrency(result.totalInterest)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Totale restituito</p>
            <p className="text-base font-bold">{formatCurrency(result.totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Diario di bordo progress */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Diario di bordo</p>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
              {checklistProgress.checked}/{checklistProgress.total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {progressPct === 100 && checklistProgress.total > 0
              ? 'Tutti i passaggi completati!'
              : `${progressPct}% completato`
            }
          </p>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => onNavigate('calculator')}
        >
          <Calculator className="h-5 w-5" />
          <span className="text-xs">Modifica</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => onNavigate('amortization')}
        >
          <Table className="h-5 w-5" />
          <span className="text-xs">Ammortamento</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => onNavigate('charts')}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs">Grafici</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => onNavigate('logbook')}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs">Diario</span>
        </Button>
      </div>
    </div>
  )
}
