import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import type { MortgageInputs, Fees, AdditionalCosts } from '../../types/mortgage'

interface Props {
  inputs: MortgageInputs
  onChange: (inputs: MortgageInputs) => void
}

const YEAR_OPTIONS = [5, 10, 15, 20, 25, 30, 40]

function pct(value: number, base: number): string {
  if (!base) return ''
  return (value / base * 100).toFixed(1) + '%'
}

function ltvColor(ltv: number): string {
  if (ltv <= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (ltv <= 90) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function MortgageForm({ inputs, onChange }: Props) {
  const [feesOpen, setFeesOpen] = useState(false)
  const [costsOpen, setCostsOpen] = useState(false)

  const setAmount = useCallback((amount: number) => {
    const ac = inputs.additionalCosts
    const newDownPayment = ac.houseValue > 0 ? Math.max(0, ac.houseValue - amount) : ac.downPayment
    onChange({ ...inputs, amount, additionalCosts: { ...ac, downPayment: newDownPayment } })
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

  const setAdditionalCost = useCallback((key: keyof AdditionalCosts, value: number) => {
    onChange({ ...inputs, additionalCosts: { ...inputs.additionalCosts, [key]: value } })
  }, [inputs, onChange])

  const setHouseValue = useCallback((houseValue: number) => {
    const newDownPayment = houseValue > 0 ? Math.max(0, houseValue - inputs.amount) : inputs.additionalCosts.downPayment
    onChange({ ...inputs, additionalCosts: { ...inputs.additionalCosts, houseValue, downPayment: newDownPayment } })
  }, [inputs, onChange])

  const yearIndex = YEAR_OPTIONS.indexOf(inputs.years)
  const hv = inputs.additionalCosts.houseValue
  const ltv = hv > 0 ? (inputs.amount / hv) * 100 : null

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

        {/* Costi della casa collapsible */}
        <Collapsible open={costsOpen} onOpenChange={setCostsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Costi della casa</span>
              {costsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Valore immobile */}
            <div className="space-y-2">
              <Label htmlFor="houseValue">Valore immobile (€)</Label>
              <Input
                id="houseValue"
                type="number"
                value={inputs.additionalCosts.houseValue || ''}
                placeholder="es. 250000"
                onChange={e => setHouseValue(parseFloat(e.target.value) || 0)}
                min={0}
                step={5000}
              />
              {ltv !== null && (
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ltvColor(ltv)}`}
                    title="LTV (Loan to Value): rapporto tra importo del mutuo e valore dell'immobile. Vedi la sezione 'Guida' per approfondire."
                  >
                    LTV {ltv.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ltv <= 80 ? 'ottimo' : ltv <= 90 ? 'nella norma' : 'alto — spread più elevati'}
                  </span>
                </div>
              )}
            </div>

            {/* Anticipo */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="downPayment">
                  Anticipo (€){hv > 0 ? ' — calcolato' : ''}
                </Label>
                {hv > 0 && inputs.additionalCosts.downPayment > 0 && (
                  <span className="text-xs text-muted-foreground">
                    = {pct(inputs.additionalCosts.downPayment, hv)} del valore
                  </span>
                )}
              </div>
              <Input
                id="downPayment"
                type="number"
                value={inputs.additionalCosts.downPayment}
                onChange={e => setAdditionalCost('downPayment', parseFloat(e.target.value) || 0)}
                min={0}
                step={1000}
              />
            </div>

            {/* Notaio, agenzia, tasse */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="notaryAgencyTaxes">Notaio, agenzia, tasse (€)</Label>
                {hv > 0 && inputs.additionalCosts.notaryAgencyTaxes > 0 && (
                  <span className="text-xs text-muted-foreground">
                    = {pct(inputs.additionalCosts.notaryAgencyTaxes, hv)} del valore
                  </span>
                )}
              </div>
              <Input
                id="notaryAgencyTaxes"
                type="number"
                value={inputs.additionalCosts.notaryAgencyTaxes}
                onChange={e => setAdditionalCost('notaryAgencyTaxes', parseFloat(e.target.value) || 0)}
                min={0}
                step={100}
              />
              {hv > 0 && inputs.additionalCosts.notaryAgencyTaxes === 0 && (
                <p className="text-xs text-muted-foreground">
                  tipico: 3–6% del valore (≈ € {Math.round(hv * 0.04).toLocaleString('it-IT')})
                </p>
              )}
            </div>

            {/* Ristrutturazione e arredo */}
            <div className="space-y-2">
              <Label htmlFor="renovationFurniture">Ristrutturazione e arredo (€)</Label>
              <Input
                id="renovationFurniture"
                type="number"
                value={inputs.additionalCosts.renovationFurniture}
                onChange={e => setAdditionalCost('renovationFurniture', parseFloat(e.target.value) || 0)}
                min={0}
                step={500}
              />
            </div>

            {/* Condominio */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="condoFeesAnnual">Condominio (€/anno)</Label>
                {hv > 0 && inputs.additionalCosts.condoFeesAnnual > 0 && (
                  <span className="text-xs text-muted-foreground">
                    = {pct(inputs.additionalCosts.condoFeesAnnual, hv)}/anno del valore
                  </span>
                )}
              </div>
              <Input
                id="condoFeesAnnual"
                type="number"
                value={inputs.additionalCosts.condoFeesAnnual}
                onChange={e => setAdditionalCost('condoFeesAnnual', parseFloat(e.target.value) || 0)}
                min={0}
                step={100}
              />
            </div>

            {/* Manutenzione */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="maintenanceAnnual">Manutenzione (€/anno)</Label>
                {hv > 0 && inputs.additionalCosts.maintenanceAnnual > 0 && (
                  <span className="text-xs text-muted-foreground">
                    = {pct(inputs.additionalCosts.maintenanceAnnual, hv)}/anno del valore
                  </span>
                )}
              </div>
              <Input
                id="maintenanceAnnual"
                type="number"
                value={inputs.additionalCosts.maintenanceAnnual}
                onChange={e => setAdditionalCost('maintenanceAnnual', parseFloat(e.target.value) || 0)}
                min={0}
                step={100}
              />
              {hv > 0 && inputs.additionalCosts.maintenanceAnnual === 0 && (
                <p className="text-xs text-muted-foreground">
                  tipico: 0,5–1%/anno del valore (≈ € {Math.round(hv * 0.008).toLocaleString('it-IT')}/anno)
                </p>
              )}
            </div>

            {/* TARI e assicurazione */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="tariInsuranceAnnual">TARI e assicurazione (€/anno)</Label>
                {hv > 0 && inputs.additionalCosts.tariInsuranceAnnual > 0 && (
                  <span className="text-xs text-muted-foreground">
                    = {pct(inputs.additionalCosts.tariInsuranceAnnual, hv)}/anno del valore
                  </span>
                )}
              </div>
              <Input
                id="tariInsuranceAnnual"
                type="number"
                value={inputs.additionalCosts.tariInsuranceAnnual}
                onChange={e => setAdditionalCost('tariInsuranceAnnual', parseFloat(e.target.value) || 0)}
                min={0}
                step={50}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
