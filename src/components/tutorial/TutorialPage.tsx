import { useState } from 'react'
import {
  BookMarked, Calculator, Table, BarChart3, BookOpen,
  Book, Columns2, Download, ChevronDown, ChevronUp, GraduationCap,
} from 'lucide-react'

interface Section {
  icon: typeof BookMarked
  title: string
  badge?: string
  body: string
}

const SECTIONS: Section[] = [
  {
    icon: BookMarked,
    title: 'Scenari',
    body: `Ogni scenario è un mutuo ipotetico indipendente con i propri parametri, calcoli e checklist.

Puoi creare quanti scenari vuoi, dargli un nome (es. "Banca Alfa – 20 anni"), duplicarli per partire da una base già compilata e cancellarli quando non servono più.

Dal menù degli scenari puoi anche selezionarne due o tre per confrontarli affiancati: utile per mettere a confronto banche diverse, durate diverse o tassi fissi e variabili.`,
  },
  {
    icon: Calculator,
    title: 'Calcola',
    badge: 'tab',
    body: `Il tab principale di ogni scenario. Inserisci i parametri del mutuo:

• **Importo** – la somma che chiedi alla banca
• **Durata** – in anni (tipicamente 10–30)
• **TAN** – il tasso annuo nominale applicato dalla banca

La rata mensile si aggiorna in tempo reale. Puoi anche aggiungere le spese bancarie (istruttoria, perizia, spese mensili, assicurazione) per calcolare il **TAEG reale** — che include tutti i costi e permette di confrontare offerte diverse in modo equo.

La sezione "Costi aggiuntivi" raccoglie le spese legate alla casa (anticipo, notaio, agenzia, ristrutturazione) per mostrare il costo totale dell'operazione immobiliare.`,
  },
  {
    icon: Table,
    title: 'Piano di ammortamento',
    badge: 'tab',
    body: `Mostra ogni rata del mutuo, mese per mese, suddivisa in:

• **Quota interessi** – la parte che va alla banca come compenso per il prestito
• **Quota capitale** – la parte che riduce il debito residuo

All'inizio del mutuo gli interessi rappresentano la parte maggiore della rata; verso la fine prevale il capitale. Il mese in cui le due quote si equivalgono è il **punto di crossover**, evidenziato nella tabella.

Puoi scorrere l'intera tabella per vedere il debito residuo dopo ogni pagamento.`,
  },
  {
    icon: BarChart3,
    title: 'Grafici',
    badge: 'tab',
    body: `Tre visualizzazioni per capire l'andamento del mutuo nel tempo:

• **Debito residuo** – come decresce il debito mese dopo mese
• **Composizione delle rate** – anno per anno, quanto è capitale e quanto sono interessi
• **Ripartizione totale** – un grafico a torta con la suddivisione complessiva tra capitale rimborsato e interessi pagati

I grafici aiutano a capire visivamente l'impatto della durata e del tasso sul costo finale.`,
  },
  {
    icon: BookOpen,
    title: 'Diario di bordo',
    badge: 'tab',
    body: `Una checklist guidata del processo di acquisto casa, divisa in 9 fasi:

1. Preparazione finanziaria
2. Ricerca casa
3. Proposta e trattativa
4. Richiesta mutuo
5. Perizia e istruttoria
6. Approvazione e offerta
7. Compromesso (rogito preliminare)
8. Atti notarili
9. Dopo il rogito

Puoi spuntare le voci man mano che le completi, aggiungere note a ogni sezione e creare voci personalizzate.

Il diario è **per-scenario**: ogni scenario ha il proprio stato indipendente, così puoi seguire pratiche parallele con banche diverse.`,
  },
  {
    icon: Book,
    title: 'Guida al mutuo',
    body: `Un glossario dei principali termini e concetti legati ai mutui, raggruppati per tema:

TAN e TAEG, spread, indici Euribor e IRS, mutuo a tasso fisso e variabile, LTV (Loan-To-Value), piano di ammortamento alla francese, portabilità e surroga.

Per ogni concetto puoi:
• Espandere la spiegazione dettagliata
• Aggiunger una nota personale
• Segnarlo come "studiato" per tenere traccia dei progressi

La Guida è **condivisa tra tutti gli scenari** — non è legata a un singolo mutuo ma serve da riferimento generale.`,
  },
  {
    icon: Columns2,
    title: 'Confronto scenari',
    body: `Dalla lista degli scenari, seleziona due o tre scenari usando le caselle di selezione che appaiono a sinistra di ogni riga.

Appare il pulsante "Confronta": toccalo per aprire la vista affiancata con:

• Rata mensile
• Costo totale (capitale + interessi + spese)
• Totale interessi pagati
• TAEG

Utile per scegliere tra offerte di banche diverse o per valutare l'impatto di cambiare la durata del mutuo.`,
  },
  {
    icon: Download,
    title: 'Backup e ripristino',
    body: `Tutti i tuoi dati (scenari, checklist, note) sono salvati nel browser. Per non perderli se cambi dispositivo o browser:

• **Esporta** – dal menù della lista scenari, scarica un file JSON con tutti i tuoi scenari
• **Importa** – carica il file JSON su un altro browser o dispositivo per ripristinare tutto

Il backup è manuale: ricordati di esportarlo quando vuoi trasferire i dati o fare una copia di sicurezza.`,
  },
]

function SectionCard({ icon: Icon, title, badge, body }: Section) {
  const [open, setOpen] = useState(false)

  const renderBody = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <p key={i} className="text-sm leading-relaxed mb-0" style={{ color: 'hsl(var(--foreground))' }}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      )
    })
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
        style={{ backgroundColor: open ? 'hsl(var(--muted) / 0.5)' : undefined }}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-blue-700 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm" style={{ color: 'hsl(var(--foreground))' }}>{title}</span>
          {badge && (
            <span
              className="ml-2 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        }
      </button>
      {open && (
        <div
          className="px-4 pb-4 pt-3 border-t space-y-1"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {renderBody(body)}
        </div>
      )}
    </div>
  )
}

export function TutorialPage() {
  return (
    <div className="space-y-4">
      {/* Intro card */}
      <div
        className="rounded-xl border p-4 flex items-start gap-3"
        style={{
          backgroundColor: 'hsl(var(--muted) / 0.4)',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <GraduationCap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm mb-1" style={{ color: 'hsl(var(--foreground))' }}>
            Sei nuovo? Questa guida spiega cosa fa ogni sezione dell'app.
          </p>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Tocca una sezione per espanderla e leggere come funziona.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map(section => (
          <SectionCard key={section.title} {...section} />
        ))}
      </div>
    </div>
  )
}
