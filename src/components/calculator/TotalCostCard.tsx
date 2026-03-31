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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costo Totale ({years} anni)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
