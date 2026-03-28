import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog'
import type { MortgageInputs } from '../../types/mortgage'

interface Props {
  inputs: MortgageInputs
  onSave: (name: string) => Promise<void>
}

export function SaveScenarioDialog({ inputs, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const defaultName = `Mutuo € ${inputs.amount.toLocaleString('it-IT')} - ${inputs.tan}% - ${inputs.years}a`

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(name || defaultName)
      setOpen(false)
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Save className="h-4 w-4" />
          Salva scenario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salva scenario</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Nome scenario</Label>
            <Input
              id="scenario-name"
              placeholder={defaultName}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
