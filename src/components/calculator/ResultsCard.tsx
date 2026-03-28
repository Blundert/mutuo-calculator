import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatCurrency, formatPercent } from '../../lib/format'
import type { MortgageResult, MortgageInputs } from '../../types/mortgage'

interface Props {
  result: MortgageResult
  inputs: MortgageInputs
}

export function ResultsCard({ result, inputs }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Rata mensile in evidenza */}
        <div className="text-center mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
          <p className="text-sm text-muted-foreground mb-1">Rata mensile</p>
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
            {formatCurrency(result.monthlyPayment)}
          </p>
          {inputs.fees.monthlyFee > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              + {formatCurrency(inputs.fees.monthlyFee)} spese mensili
            </p>
          )}
        </div>

        {/* Grid valori */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">TAN</p>
            <p className="text-lg font-semibold">{formatPercent(inputs.tan)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">TAEG</p>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {formatPercent(result.taeg)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Totale interessi</p>
            <p className="text-base font-medium text-red-600 dark:text-red-400">
              {formatCurrency(result.totalInterest)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Totale restituito</p>
            <p className="text-base font-medium">{formatCurrency(result.totalPaid)}</p>
          </div>
          {result.totalFees > 0 && (
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-muted-foreground">Totale spese accessorie</p>
              <p className="text-base font-medium text-amber-600 dark:text-amber-400">
                {formatCurrency(result.totalFees)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
