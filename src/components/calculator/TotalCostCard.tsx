import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatCurrency } from '../../lib/format'
import type { MortgageResult, MortgageInputs } from '../../types/mortgage'

interface Props {
  result: MortgageResult
  inputs: MortgageInputs
}

interface CostRow {
  label: string
  value: number
  color: string
  indent?: boolean
}

function ltvColor(ltv: number): string {
  if (ltv <= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (ltv <= 90) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function TotalCostCard({ result, inputs }: Props) {
  const { years, additionalCosts: ac } = inputs

  const totalRecurring =
    (ac.condoFeesAnnual + ac.maintenanceAnnual + ac.tariInsuranceAnnual) * years
  const totalOneTime =
    ac.downPayment + ac.notaryAgencyTaxes + ac.renovationFurniture
  const grandTotal = result.totalPaid + totalRecurring + totalOneTime

  // Only show if at least one additional cost is set
  if (grandTotal <= result.totalPaid) return null

  const rows: CostRow[] = [
    { label: `Rate mutuo (${years} anni)`, value: result.totalPaid, color: 'bg-blue-500' },
    { label: 'di cui interessi alla banca', value: result.totalInterest, color: 'bg-red-400', indent: true },
    ...(ac.downPayment > 0 ? [{ label: 'Anticipo', value: ac.downPayment, color: 'bg-orange-400' }] : []),
    ...(ac.notaryAgencyTaxes > 0 ? [{ label: 'Notaio, agenzia, tasse', value: ac.notaryAgencyTaxes, color: 'bg-amber-400' }] : []),
    ...(ac.renovationFurniture > 0 ? [{ label: 'Ristrutturazione e arredo', value: ac.renovationFurniture, color: 'bg-yellow-400' }] : []),
    ...(ac.maintenanceAnnual > 0 ? [{ label: `Manutenzione (${years} anni)`, value: ac.maintenanceAnnual * years, color: 'bg-orange-300' }] : []),
    ...(ac.condoFeesAnnual > 0 ? [{ label: `Condominio (${years} anni)`, value: ac.condoFeesAnnual * years, color: 'bg-amber-300' }] : []),
    ...(ac.tariInsuranceAnnual > 0 ? [{ label: `TARI e assicurazione (${years} anni)`, value: ac.tariInsuranceAnnual * years, color: 'bg-slate-400' }] : []),
  ]

  const grandTotalMonthly = grandTotal / (years * 12)
  const hv = ac.houseValue ?? 0
  const ltv = hv > 0 ? (inputs.amount / hv) * 100 : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costo Totale ({years} anni)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hv > 0 && ltv !== null && (
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-sm text-muted-foreground">Valore immobile</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{formatCurrency(hv)}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ltvColor(ltv)}`}
                title="LTV: rapporto tra importo del mutuo e valore dell'immobile"
              >
                LTV {ltv.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
        {rows.map((row) => (
          <div key={row.label} className={row.indent ? 'pl-4' : ''}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${row.indent ? 'text-muted-foreground' : ''}`}>{row.label}</span>
              <span className={`text-sm font-medium ${row.indent ? 'text-red-600 dark:text-red-400' : ''}`}>
                {formatCurrency(row.value)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${row.color}`}
                style={{ width: `${Math.min(100, (row.value / grandTotal) * 100)}%` }}
              />
            </div>
          </div>
        ))}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Costo totale</span>
            <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            = {formatCurrency(grandTotalMonthly)} al mese per {years} anni
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
