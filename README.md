# Calcolatore Mutuo

PWA per il calcolo di mutui ipotecari. Funziona offline, installabile su desktop e mobile.

## Funzionalità

- **Calcolatore** — importo, durata, TAN, spese accessorie (istruttoria, perizia, conto, assicurazione)
- **Risultati in tempo reale** — rata mensile, TAEG (Newton-Raphson IRR), totale interessi, totale restituito
- **Piano di ammortamento** — vista annuale/mensile, punto di sorpasso capitale > interessi evidenziato
- **Grafici** — composizione rata (area), ripartizione totale (donut), riepilogo annuale (barre)
- **Scenari** — salva, carica, duplica, elimina scenari in IndexedDB; confronto side-by-side fino a 3 scenari
- **Dark mode** — toggle con persistenza
- **PWA** — installabile, funziona offline dopo la prima visita
- **Mobile-first** — bottom navigation su mobile, safe area iOS

## Stack tecnico

| Tool | Versione |
|------|----------|
| Vite | ^8 |
| React + TypeScript | ^19 / ^6 |
| Tailwind CSS | ^4 |
| Radix UI | vari |
| Recharts | ^3 |
| Dexie (IndexedDB) | ^4 |
| vite-plugin-pwa | ^1 |

## Avvio locale

```bash
git clone https://github.com/<utente>/mutuo-calculator.git
cd mutuo-calculator
npm install
npm run dev
```

Apri [http://localhost:5173/mutuo-calculator/](http://localhost:5173/mutuo-calculator/)

> In un container Docker assicurati di esporre la porta: `-p 5173:5173`

## Build

```bash
npm run build
```

Output in `/dist`. Il service worker viene generato automaticamente da Workbox.

## Preview build di produzione

```bash
npm run preview
```

## Deploy su GitHub Pages

1. Crea un repository su GitHub (es. `mutuo-calculator`)
2. Aggiorna `base` in [vite.config.ts](vite.config.ts) con il nome del tuo repo:
   ```ts
   base: '/nome-repo/',
   ```
3. Fai lo stesso in [index.html](index.html) per i path delle icone
4. Esegui:
   ```bash
   npm run deploy
   ```

Il comando builda il progetto e fa il push del contenuto di `/dist` sul branch `gh-pages`.

## Struttura del progetto

```
src/
├── components/
│   ├── calculator/       # Form input, risultati, dialog salvataggio
│   ├── amortization/     # Tabella piano ammortamento
│   ├── charts/           # Grafici Recharts
│   ├── scenarios/        # Lista scenari e confronto
│   └── ui/               # Componenti base (Button, Card, Input, ...)
├── hooks/
│   ├── use-mortgage.ts   # Calcolo reattivo tramite useMemo
│   └── use-scenarios.ts  # CRUD scenari su IndexedDB
├── lib/
│   ├── mortgage-math.ts  # Funzioni pure: ammortamento francese, TAEG, crossover
│   ├── db.ts             # Schema Dexie e operazioni DB
│   ├── format.ts         # Formattazione numeri locale it-IT
│   └── utils.ts          # cn() helper per Tailwind
├── types/
│   └── mortgage.ts       # Tipi TypeScript
└── App.tsx
```

## Calcoli finanziari

Tutti i calcoli sono in [`src/lib/mortgage-math.ts`](src/lib/mortgage-math.ts):

- **Rata mensile** — formula francese: `R = C × r / (1 − (1+r)^−n)`
- **TAEG** — metodo IRR iterativo (Newton-Raphson), include tutte le spese
- **Punto di sorpasso** — prima rata in cui la quota capitale supera la quota interessi

I numeri sono formattati con `Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })`.

## Licenza

MIT
