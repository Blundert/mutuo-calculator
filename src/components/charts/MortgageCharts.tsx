import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { formatCurrency } from '../../lib/format'
import { annualSummaries } from '../../lib/mortgage-math'
import type { AmortizationRow } from '../../types/mortgage'

interface Props {
  schedule: AmortizationRow[]
  crossoverMonth: number | null
  totalInterest: number
  totalPaid: number
}

export function MortgageCharts({ schedule, crossoverMonth, totalInterest, totalPaid }: Props) {
  const annualData = useMemo(() => annualSummaries(schedule), [schedule])

  const areaData = useMemo(() => schedule.map(row => ({
    month: row.month,
    interessi: Math.round(row.interest * 100) / 100,
    capitale: Math.round(row.principal * 100) / 100,
  })), [schedule])

  const pieData = [
    { name: 'Capitale', value: Math.round(totalPaid - totalInterest) },
    { name: 'Interessi', value: Math.round(totalInterest) },
  ]

  const barData = annualData.map(s => ({
    anno: `${s.year}°`,
    capitale: Math.round(s.totalPrincipal),
    interessi: Math.round(s.totalInterest),
  }))

  if (schedule.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafici</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="composizione" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="composizione" className="flex-1 text-xs sm:text-sm">Composizione</TabsTrigger>
              <TabsTrigger value="ripartizione" className="flex-1 text-xs sm:text-sm">Ripartizione</TabsTrigger>
              <TabsTrigger value="annuale" className="flex-1 text-xs sm:text-sm">Annuale</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="composizione" className="px-2 pb-4 pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={areaData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInteressi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCapitale" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${v}m`} interval={Math.floor(schedule.length / 6)} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(Number(value)), name === 'interessi' ? 'Interessi' : 'Capitale']}
                  labelFormatter={(label) => `Rata ${label}`}
                />
                {crossoverMonth && (
                  <ReferenceLine x={crossoverMonth} stroke="#22c55e" strokeDasharray="4 4"
                    label={{ value: '★', position: 'top', fill: '#22c55e', fontSize: 14 }} />
                )}
                <Area type="monotone" dataKey="interessi" stackId="1" stroke="#f97316" fill="url(#colorInteressi)" />
                <Area type="monotone" dataKey="capitale" stackId="1" stroke="#3b82f6" fill="url(#colorCapitale)" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="ripartizione" className="px-2 pb-4 pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 30, right: 20, left: 20, bottom: 0 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f97316" />
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-sm font-semibold mt-2">
              Totale restituito: <span className="text-blue-700 dark:text-blue-400">{formatCurrency(totalPaid)}</span>
            </p>
          </TabsContent>

          <TabsContent value="annuale" className="px-2 pb-4 pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="anno" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(Number(value)), name === 'interessi' ? 'Interessi' : 'Capitale']}
                />
                <Bar dataKey="capitale" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="interessi" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
