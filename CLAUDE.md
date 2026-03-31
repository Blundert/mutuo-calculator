# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server on port 5173 (all interfaces)
npm run build      # tsc -b && vite build  (also auto-generates PWA icons via prebuild)
npm run preview    # serve the dist/ build locally
npm run deploy     # build + publish to GitHub Pages via gh-pages
```

There are no tests. Type-check is the primary correctness gate — always run `npm run build` to verify.

## Architecture

### Routing

No React Router. Routing is entirely manual via `window.history.pushState` + `popstate` in `src/App.tsx`.

URL structure:
- `/mutuo-calculator/` → scenario selector
- `/mutuo-calculator/guide` → global wiki
- `/mutuo-calculator/<scenarioId>/<tab>` → scenario workspace

`parsePath()` and `buildUrl()` in App.tsx are the single source of truth for URL ↔ state mapping. A `public/404.html` redirect script handles GitHub Pages SPA fallback.

### Data persistence

All state is stored client-side in IndexedDB via **Dexie** (`src/lib/db.ts`). The DB has 7 versioned migrations — always add a new `this.version(N)` block when adding tables or indexes, never modify existing versions. Current tables: `scenarios`, `checklistStates`, `customChecklistItems`, `customSections`, `customSubItems`, `wikiStates`.

Checklist data (`checklistStates`, `customChecklistItems`, `customSections`) is **per-scenario** — all DB functions in those tables require a `scenarioId` parameter. `wikiStates` is global (one shared study log).

Dark mode preference is stored in `localStorage` (not IndexedDB).

### Scenario workspace

Each scenario is an independent workspace with its own calculator inputs, amortization plan, charts, and logbook (checklist). The active scenario ID comes from the URL (`/42/calculator`), not from any local state store.

Auto-save: `MortgageForm` changes flow into `setInputs` → debounced (800ms) `updateScenarioInputs()` call in `App.tsx`. No explicit save button.

### Key hooks

- `useMortgage(inputs)` — pure memoized calculation, no side effects
- `useScenarios()` — CRUD for scenario records; does NOT track active scenario (that's in the URL)
- `useChecklist(scenarioId)` — all checklist state for one scenario, reloads when `scenarioId` changes
- `useWiki()` — global study progress for the wiki concepts
- `usePWAInstall()` — detects platform (iOS/Android/other) and manages `beforeinstallprompt`

### Checklist ID scheme

Static item IDs: `s1-i0`, `s1-i0-sub2` (section-item-subitem indexes)
Custom item IDs: `custom-{dbId}`
Custom sub-item IDs: `sub-{dbId}`
Section note IDs: same as `sectionId` (e.g. `s1`)

### Static data

- `src/data/checklist.ts` — 9 hardcoded sections (the "Diario di bordo" process guide)
- `src/data/wiki.ts` — 15 mortgage concepts grouped in 6 sections (the global "Guida")

### UI

Shadcn/ui components (manually copied, no CLI) in `src/components/ui/`. Tailwind v4 with CSS custom properties for theming (`hsl(var(--background))` etc.). Icons from lucide-react. Charts via Recharts.

The app has no top-level nav on desktop when inside a scenario — the tab bar is embedded in the header row. Mobile uses a fixed bottom nav.

### PWA

`vite-plugin-pwa` with Workbox `generateSW` mode. Icons are generated at build time by `scripts/generate-icons.mjs` using pngjs. `navigateFallback` is set to `/mutuo-calculator/` so deep links work when installed as PWA.
