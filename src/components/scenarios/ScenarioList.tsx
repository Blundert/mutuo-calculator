import { useState } from 'react'
import { Trash2, Copy, Upload, CheckSquare, Square } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { formatCurrency } from '../../lib/format'
import { monthlyPayment, calculateTAEG } from '../../lib/mortgage-math'
import type { Scenario } from '../../types/mortgage'

const BADGE_COLORS = ['blue', 'green', 'orange', 'purple'] as const

interface Props {
  scenarios: Scenario[]
  onLoad: (scenario: Scenario) => void
  onDelete: (id: number) => Promise<void>
  onDuplicate: (id: number) => Promise<void>
  onCompare: (scenarios: Scenario[]) => void
}

export function ScenarioList({ scenarios, onLoad, onDelete, onDuplicate, onCompare }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Nessuno scenario salvato</p>
          <p className="text-sm text-muted-foreground mt-1">
            Calcola un mutuo e salvalo per confrontarlo in seguito
          </p>
        </CardContent>
      </Card>
    )
  }

  const selectedScenarios = scenarios.filter(s => s.id !== undefined && selected.has(s.id!))

  return (
    <div className="space-y-4">
      {selected.size >= 2 && (
        <Button className="w-full" onClick={() => onCompare(selectedScenarios)}>
          Confronta {selected.size} scenari selezionati
        </Button>
      )}
      {selected.size > 0 && selected.size < 2 && (
        <p className="text-sm text-center text-muted-foreground">
          Seleziona almeno 2 scenari per confrontarli
        </p>
      )}

      {scenarios.map((scenario, index) => {
        const payment = monthlyPayment(scenario.amount, scenario.tan, scenario.years)
        const taeg = calculateTAEG(scenario.amount, scenario.tan, scenario.years, {
          setupFee: scenario.setupFee,
          appraisalFee: scenario.appraisalFee,
          monthlyFee: scenario.monthlyFee,
          insuranceCost: scenario.insuranceCost,
        })
        const colorVariant = BADGE_COLORS[index % BADGE_COLORS.length]
        const isSelected = scenario.id !== undefined && selected.has(scenario.id!)

        return (
          <Card key={scenario.id} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={() => scenario.id !== undefined && toggleSelect(scenario.id!)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={isSelected ? 'Deseleziona' : 'Seleziona'}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm truncate">{scenario.name}</h3>
                      <Badge variant={colorVariant}>#{index + 1}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(scenario.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => scenario.id && onDuplicate(scenario.id)} aria-label="Duplica">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" aria-label="Elimina">
                        <Trash2 className="h-4 w-4" />
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
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Importo</p>
                  <p className="font-medium">{formatCurrency(scenario.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TAN / TAEG</p>
                  <p className="font-medium">{scenario.tan}% / {taeg.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Durata</p>
                  <p className="font-medium">{scenario.years} anni</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Rata mensile</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatCurrency(payment)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onLoad(scenario)} className="gap-1">
                  <Upload className="h-3.5 w-3.5" />
                  Carica
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
