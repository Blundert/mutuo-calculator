import {
  Calculator, Table, BookOpen, BarChart3, BookMarked,
  ShieldCheck, Columns2, Download, ArrowRight, ChevronDown,
} from 'lucide-react'
import { Button } from '../ui/button'

interface Feature {
  icon: typeof Calculator
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: BookMarked,
    title: 'Scenari multipli',
    description: 'Crea e confronta più scenari indipendenti. Banca A vs banca B, durata 20 vs 25 anni: cambia i parametri e vedi subito la differenza.',
  },
  {
    icon: Calculator,
    title: 'Calcolatore preciso',
    description: 'Inserisci importo, durata e TAN. Aggiungi le spese bancarie per calcolare il TAEG reale e il costo totale del mutuo.',
  },
  {
    icon: Table,
    title: 'Piano di ammortamento',
    description: 'Visualizza ogni rata mese per mese: quanto va agli interessi, quanto riduce il debito e quando la quota capitale supera quella interessi.',
  },
  {
    icon: BarChart3,
    title: 'Grafici chiari',
    description: "Vedi l'andamento del debito residuo nel tempo, la composizione delle rate anno per anno e la ripartizione totale capitale/interessi.",
  },
  {
    icon: BookOpen,
    title: 'Diario di bordo',
    description: "Checklist personalizzabile del processo di acquisto, divisa in 9 fasi. Dalla preparazione finanziaria alla firma dal notaio, non perdi nessun passaggio.",
  },
  {
    icon: Columns2,
    title: 'Confronto scenari',
    description: 'Seleziona fino a 3 scenari e mettili a confronto affiancati: rata mensile, costo totale, interessi totali in un colpo d\'occhio.',
  },
]

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">M</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4" style={{ color: 'hsl(var(--foreground))' }}>
            Calcola il tuo mutuo,<br />senza sorprese
          </h1>

          <p className="text-lg sm:text-xl mb-8 max-w-lg mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Simula rate, confronta scenari, tieni traccia del processo di acquisto — tutto gratis, tutto sul tuo dispositivo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={onEnterApp}
              className="w-full sm:w-auto text-base px-8 py-3 h-auto"
            >
              Vai all'app <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button
              onClick={scrollToFeatures}
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Scopri di più <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 px-4" style={{ backgroundColor: 'hsl(var(--muted) / 0.4)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3" style={{ color: 'hsl(var(--foreground))' }}>
            Tutto quello che ti serve
          </h2>
          <p className="text-center mb-10" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Uno strumento completo per valutare il tuo mutuo con consapevolezza.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
            I tuoi dati restano sul tuo dispositivo
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Nessun account, nessun cookie, nessun tracciamento. Tutti i tuoi scenari e la tua checklist sono salvati localmente nel browser tramite IndexedDB — non escono mai dal tuo dispositivo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium">
            {[
              { icon: ShieldCheck, label: 'Nessun cookie' },
              { icon: Download, label: 'Backup JSON locale' },
              { icon: BookMarked, label: 'Dati solo sul tuo browser' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                {label}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            L'app funziona anche offline, una volta caricata. Puoi installarla sul tuo telefono per averla sempre a portata di mano.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: 'hsl(var(--muted) / 0.4)' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
            Pronto a pianificare il tuo mutuo?
          </h2>
          <p className="mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Gratis, senza registrazione, senza dati inviati a nessuno.
          </p>
          <Button
            size="lg"
            onClick={onEnterApp}
            className="text-base px-10 py-3 h-auto"
          >
            Inizia ora <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 px-4 text-center border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Calcolatore Mutuo — strumento gratuito e open source. Nessun dato viene raccolto o trasmesso.
        </p>
      </footer>
    </div>
  )
}
