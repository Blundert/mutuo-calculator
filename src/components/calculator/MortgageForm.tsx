import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import type { MortgageInputs, Fees } from '../../types/mortgage'

interface Props {
  inputs: MortgageInputs
  onChange: (inputs: MortgageInputs) => void
}

const YEAR_OPTIONS = [5, 10, 15, 20, 25, 30]

export function MortgageForm({ inputs, onChange }: Props) {
  const [feesOpen, setFeesOpen] = useState(false)

  const setAmount = useCallback((amount: number) => {
    onChange({ ...inputs, amount })
  }, [inputs, onChange])

  const setYears = useCallback((years: number) => {
    onChange({ ...inputs, years })
  }, [inputs, onChange])

  const setTan = useCallback((tan: number) => {
    onChange({ ...inputs, tan })
  }, [inputs, onChange])

  const setFee = useCallback((key: keyof Fees, value: number) => {
    onChange({ ...inputs, fees: { ...inputs.fees, [key]: value } })
  }, [inputs, onChange])

  const yearIndex = YEAR_OPTIONS.indexOf(inputs.years)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parametri del mutuo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Importo */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="amount">Importo mutuo</Label>
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              € {inputs.amount.toLocaleString('it-IT')}
            </span>
          </div>
          <Slider
            id="amount"
            min={50000}
            max={500000}
            step={5000}
            value={[inputs.amount]}
            onValueChange={([v]) => setAmount(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>€ 50.000</span>
            <span>€ 500.000</span>
          </div>
          <Input
            type="number"
            value={inputs.amount}
            onChange={e => setAmount(Number(e.target.value))}
            min={0}
            max={10000000}
            step={1000}
            className="mt-1"
          />
        </div>

        {/* Durata */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Durata</Label>
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              {inputs.years} anni
            </span>
          </div>
          <Slider
            min={0}
            max={YEAR_OPTIONS.length - 1}
            step={1}
            value={[Math.max(0, yearIndex)]}
            onValueChange={([i]) => setYears(YEAR_OPTIONS[i])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {YEAR_OPTIONS.map(y => (
              <span key={y} className={inputs.years === y ? 'font-bold text-blue-600' : ''}>{y}</span>
            ))}
          </div>
        </div>

        {/* TAN */}
        <div className="space-y-3">
          <Label htmlFor="tan">Tasso TAN (%)</Label>
          <Input
            id="tan"
            type="number"
            value={inputs.tan}
            onChange={e => setTan(parseFloat(e.target.value) || 0)}
            min={0}
            max={20}
            step={0.01}
          />
        </div>

        {/* Spese accessorie collapsible */}
        <Collapsible open={feesOpen} onOpenChange={setFeesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Spese accessorie</span>
              {feesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="setupFee">Spese istruttoria (€)</Label>
              <Input
                id="setupFee"
                type="number"
                value={inputs.fees.setupFee}
                onChange={e => setFee('setupFee', parseFloat(e.target.value) || 0)}
                min={0}
                step={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisalFee">Spese perizia (€)</Label>
              <Input
                id="appraisalFee"
                type="number"
                value={inputs.fees.appraisalFee}
                onChange={e => setFee('appraisalFee', parseFloat(e.target.value) || 0)}
                min={0}
                step={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Spese mensili conto (€)</Label>
              <Input
                id="monthlyFee"
                type="number"
                value={inputs.fees.monthlyFee}
                onChange={e => setFee('monthlyFee', parseFloat(e.target.value) || 0)}
                min={0}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceCost">Polizza assicurativa (€)</Label>
              <Input
                id="insuranceCost"
                type="number"
                value={inputs.fees.insuranceCost}
                onChange={e => setFee('insuranceCost', parseFloat(e.target.value) || 0)}
                min={0}
                step={100}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
