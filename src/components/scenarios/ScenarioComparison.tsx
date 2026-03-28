import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { formatCurrency, formatPercent } from '../../lib/format'
import { monthlyPayment, calculateTAEG, amortizationSchedule, annualSummaries } from '../../lib/mortgage-math'
import type { Scenario } from '../../types/mortgage'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

const COLORS = ['#3b82f6', '#f97316', '#22c55e']

interface Props {
  scenarios: Scenario[]
  onBack: () => void
}

interface ComparisonRow {
  label: string
  values: string[]
  bestIndex?: number
  lowerIsBetter?: boolean
}

export function ScenarioComparison({ scenarios, onBack }: Props) {
  const computed = useMemo(() => scenarios.map(s => {
    const payment = monthlyPayment(s.amount, s.tan, s.years)
    const n = s.years * 12
    const totalPaid = payment * n
    const totalInterest = totalPaid - s.amount
    const taeg = calculateTAEG(s.amount, s.tan, s.years, {
      setupFee: s.setupFee,
      appraisalFee: s.appraisalFee,
      monthlyFee: s.monthlyFee,
      insuranceCost: s.insuranceCost,
    })
    const schedule = amortizationSchedule(s.amount, s.tan, s.years)
    return { payment, totalPaid, totalInterest, taeg, schedule }
  }), [scenarios])

  const rows: ComparisonRow[] = [
    {
      label: 'Importo',
      values: scenarios.map(s => formatCurrency(s.amount)),
    },
    {
      label: 'Durata',
      values: scenarios.map(s => `${s.years} anni`),
    },
    {
      label: 'TAN',
      values: scenarios.map(s => formatPercent(s.tan)),
      bestIndex: computed.reduce((best, c, i) => c.taeg < computed[best].taeg ? i : best, 0),
      lowerIsBetter: true,
    },
    {
      label: 'TAEG',
      values: computed.map(c => formatPercent(c.taeg)),
      bestIndex: computed.reduce((best, c, i) => c.taeg < computed[best].taeg ? i : best, 0),
      lowerIsBetter: true,
    },
    {
      label: 'Rata mensile',
      values: computed.map(c => formatCurrency(c.payment)),
      bestIndex: computed.reduce((best, c, i) => c.payment < computed[best].payment ? i : best, 0),
      lowerIsBetter: true,
    },
    {
      label: 'Totale interessi',
      values: computed.map(c => formatCurrency(c.totalInterest)),
      bestIndex: computed.reduce((best, c, i) => c.totalInterest < computed[best].totalInterest ? i : best, 0),
      lowerIsBetter: true,
    },
    {
      label: 'Totale restituito',
      values: computed.map(c => formatCurrency(c.totalPaid)),
      bestIndex: computed.reduce((best, c, i) => c.totalPaid < computed[best].totalPaid ? i : best, 0),
      lowerIsBetter: true,
    },
  ]

  // Chart data: balance over years
  const maxYears = Math.max(...scenarios.map(s => s.years))
  const chartData = useMemo(() => {
    const data: Record<string, number | string>[] = []
    for (let year = 0; year <= maxYears; year++) {
      const entry: Record<string, number | string> = { anno: year === 0 ? 'Inizio' : `${year}°` }
      scenarios.forEach((s, i) => {
        if (year === 0) {
          entry[s.name] = s.amount
        } else {
          const summaries = annualSummaries(computed[i].schedule)
          const yearSummary = summaries[year - 1]
          entry[s.name] = yearSummary ? Math.round(yearSummary.endBalance) : 0
        }
      })
      data.push(entry)
    }
    return data
  }, [scenarios, computed, maxYears])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Confronto scenari</h2>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground w-32">Parametro</th>
                {scenarios.map((s, i) => (
                  <th key={s.id} className="text-right py-3 px-4 font-medium min-w-[140px]">
                    <span style={{ color: COLORS[i] }}>{s.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} style={{ borderBottom: '1px solid hsl(var(--border))' }}
                  className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground font-medium">{row.label}</td>
                  {row.values.map((value, i) => (
                    <td key={i} className={`text-right py-3 px-4 ${i === row.bestIndex ? 'font-bold text-green-600 dark:text-green-400' : ''}`}>
                      {value}
                      {i === row.bestIndex && <span className="ml-1">✓</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Debito residuo nel tempo</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="anno" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              {scenarios.map((s, i) => (
                <Line key={s.id} type="monotone" dataKey={s.name} stroke={COLORS[i]}
                  strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
