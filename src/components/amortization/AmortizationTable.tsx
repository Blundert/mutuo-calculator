import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { formatCurrency } from '../../lib/format'
import { annualSummaries } from '../../lib/mortgage-math'
import type { AmortizationRow, AnnualSummary } from '../../types/mortgage'

interface Props {
  schedule: AmortizationRow[]
  crossoverMonth: number | null
}

export function AmortizationTable({ schedule, crossoverMonth }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)
  const summaries = annualSummaries(schedule)

  if (schedule.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Piano di ammortamento</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMonthly(!showMonthly)}
            >
              {showMonthly ? 'Vista annuale' : 'Vista mensile'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          {/* Always show first few rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">{showMonthly ? '# Rata' : 'Anno'}</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Rata</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Capitale</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Interessi</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Residuo</th>
                </tr>
              </thead>
              <tbody>
                {showMonthly
                  ? schedule.slice(0, expanded ? schedule.length : 24).map((row) => (
                    <AmortizationMonthRow key={row.month} row={row} crossoverMonth={crossoverMonth} />
                  ))
                  : summaries.slice(0, expanded ? summaries.length : 5).map((summary) => (
                    <AmortizationAnnualRow key={summary.year} summary={summary} />
                  ))
                }
              </tbody>
            </table>
          </div>

          <CollapsibleContent>
            {/* Extra rows shown when expanded - handled above with slice */}
          </CollapsibleContent>

          {((showMonthly && schedule.length > 24) || (!showMonthly && summaries.length > 5)) && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full rounded-none border-t gap-2"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                {expanded ? (
                  <><ChevronUp className="h-4 w-4" /> Mostra meno</>
                ) : (
                  <><ChevronDown className="h-4 w-4" /> Mostra tutto ({showMonthly ? `${schedule.length} rate` : `${summaries.length} anni`})</>
                )}
              </Button>
            </CollapsibleTrigger>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  )
}

function AmortizationMonthRow({ row, crossoverMonth }: { row: AmortizationRow; crossoverMonth: number | null }) {
  const isCrossover = row.month === crossoverMonth
  return (
    <tr
      className={`border-b transition-colors ${isCrossover ? 'bg-green-50 dark:bg-green-950' : 'hover:bg-muted/50'}`}
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <td className="py-2 px-3">
        {row.month}
        {isCrossover && <span className="ml-1 text-xs text-green-600">★</span>}
      </td>
      <td className="text-right py-2 px-3">{formatCurrency(row.payment)}</td>
      <td className="text-right py-2 px-3 text-blue-700 dark:text-blue-400">{formatCurrency(row.principal)}</td>
      <td className="text-right py-2 px-3 text-red-600 dark:text-red-400">{formatCurrency(row.interest)}</td>
      <td className="text-right py-2 px-3">{formatCurrency(row.balance)}</td>
    </tr>
  )
}

function AmortizationAnnualRow({ summary }: { summary: AnnualSummary }) {
  return (
    <tr
      className="border-b hover:bg-muted/50 transition-colors"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <td className="py-2 px-3 font-medium">{summary.year}</td>
      <td className="text-right py-2 px-3">{formatCurrency(summary.totalPayment)}</td>
      <td className="text-right py-2 px-3 text-blue-700 dark:text-blue-400">{formatCurrency(summary.totalPrincipal)}</td>
      <td className="text-right py-2 px-3 text-red-600 dark:text-red-400">{formatCurrency(summary.totalInterest)}</td>
      <td className="text-right py-2 px-3">{formatCurrency(summary.endBalance)}</td>
    </tr>
  )
}
