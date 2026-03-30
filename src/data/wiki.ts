import type { WikiSectionData } from '../types/mortgage'

export const WIKI_SECTIONS: WikiSectionData[] = [
  {
    id: 'tassi',
    title: 'Tassi e costi',
    concepts: [
      {
        id: 'tan',
        title: 'TAN – Tasso Annuo Nominale',
        subtitle: 'Il costo "puro" del denaro prestato',
        body: `Il TAN è il tasso di interesse annuale applicato dal lasso all'importo del mutuo, al netto di qualsiasi spesa accessoria. Esprime solo il costo degli interessi e non include commissioni, assicurazioni o altri oneri.

**Come si usa:** La banca lo applica mensilmente (TAN ÷ 12) sul debito residuo per calcolare la quota interessi di ogni rata.

**Esempio:** Con 200.000€ a TAN 3,5% per 20 anni, la prima rata ha una quota interessi di circa 583€.

**Attenzione:** Un TAN basso non significa sempre mutuo conveniente — confronta sempre il TAEG.`,
      },
      {
        id: 'taeg',
        title: 'TAEG – Tasso Annuo Effettivo Globale',
        subtitle: 'Il costo reale e completo del mutuo',
        body: `Il TAEG include **tutti i costi** obbligatori del mutuo: interessi (TAN), spese di istruttoria, perizia, assicurazione scoppio/incendio (se obbligatoria), imposta sostitutiva. È l'indicatore più affidabile per confrontare offerte diverse.

**Regola pratica:** Più il TAEG si avvicina al TAN, minori sono le spese accessorie.

**Per legge:** Le banche sono obbligate a comunicare il TAEG prima della firma. Trovi questo valore nel PIES (Prospetto Informativo Europeo Standardizzato).

**Come confrontare:** A parità di TAN, scegli il mutuo con TAEG più basso.`,
      },
      {
        id: 'spread',
        title: 'Spread',
        subtitle: 'Il margine di guadagno della banca',
        body: `Lo spread è la componente fissa che la banca aggiunge all'indice di mercato (Euribor o IRS) per formare il tasso finale del mutuo variabile o misto.

**Formula:**
- Mutuo variabile: Tasso = Euribor 1M + Spread
- Mutuo fisso: Tasso = IRS + Spread

**Esempio:** Euribor 3,2% + Spread 0,8% = TAN 4%

**Negoziazione:** Lo spread è fisso per tutta la durata del mutuo e rappresenta il principale elemento su cui si può trattare con la banca. Più alto il profilo di rischio, più alto lo spread applicato.`,
      },
    ],
  },
  {
    id: 'indici',
    title: 'Indici di mercato',
    concepts: [
      {
        id: 'euribor',
        title: 'Euribor',
        subtitle: 'L\'indice dei mutui variabili',
        body: `L'Euribor (Euro Interbank Offered Rate) è il tasso medio al quale le banche europee si prestano denaro tra loro. Viene rilevato quotidianamente e pubblicato nelle varianti a 1, 3, 6 e 12 mesi.

**Quando si usa:** È l'indice di riferimento per i mutui a tasso variabile in Italia.

**Come influisce sulla rata:** Se l'Euribor sale, la tua rata mensile aumenta; se scende, la rata si riduce. Le variazioni si ripercuotono sulla rata con la periodicità prevista dal contratto (tipicamente ogni 1, 3 o 6 mesi).

**Storia recente:** L'Euribor è stato negativo tra il 2015 e il 2022, poi è risalito rapidamente sopra il 3% nel 2023.`,
      },
      {
        id: 'irs',
        title: 'IRS – Interest Rate Swap',
        subtitle: 'L\'indice dei mutui fissi',
        body: `L'IRS (o Eurirs) è il tasso swap di riferimento per i mutui a tasso fisso. Rappresenta il costo al quale le banche si coprono dal rischio di tasso fisso sul mercato interbancario.

**Quando si usa:** È l'indice di partenza per i mutui a tasso fisso. La banca aggiunge il proprio spread per ottenere il TAN definitivo.

**Scadenze:** Esiste in varianti che vanno da 5 a 30 anni (per coprire la durata del mutuo). Per un mutuo da 20 anni si usa tipicamente l'IRS a 20 anni.

**Relazione con BCE:** L'IRS segue le aspettative sui tassi a lungo termine, non solo le decisioni immediate della BCE.`,
      },
    ],
  },
  {
    id: 'tipologie',
    title: 'Tipi di mutuo',
    concepts: [
      {
        id: 'fisso',
        title: 'Mutuo a tasso fisso',
        subtitle: 'Rata costante per tutta la durata',
        body: `Nel mutuo a tasso fisso, il TAN rimane invariato per tutta la durata. La rata è sempre la stessa dal primo all'ultimo mese.

**Vantaggi:**
- Certezza della rata — ideale per chi pianifica il budget a lungo termine
- Protezione dai rialzi dei tassi di mercato

**Svantaggi:**
- Tasso inizialmente più alto rispetto al variabile
- Non benefici dei ribassi dei tassi (a meno di rinegoziare o surrogare)

**Quando sceglierlo:** Quando i tassi di mercato sono bassi, quando vuoi stabilità finanziaria o quando la tua capacità di rimborso è limitata.`,
      },
      {
        id: 'variabile',
        title: 'Mutuo a tasso variabile',
        subtitle: 'Rata che cambia con il mercato',
        body: `Nel mutuo variabile, il tasso (e quindi la rata) cambia periodicamente in base all'andamento dell'Euribor. A parità di condizioni, parte con un tasso inferiore al fisso.

**Vantaggi:**
- Tasso di partenza più basso
- Beneficia dei cali dei tassi di mercato

**Svantaggi:**
- Incertezza sull'importo futuro della rata
- Rischio di rialzi significativi (come accaduto nel 2022-2023)

**Cap rate:** Alcune banche offrono variabili con "cap" (tetto massimo al tasso). Più sicuri ma con spread più alto.

**Quando sceglierlo:** Quando i tassi sono alti e si prevede un ribasso, o quando si pensa di estinguere il mutuo anticipatamente.`,
      },
      {
        id: 'misto',
        title: 'Mutuo a tasso misto',
        subtitle: 'Flessibilità tra fisso e variabile',
        body: `Il mutuo misto permette di passare tra tasso fisso e variabile durante la vita del mutuo, a determinate scadenze o in qualsiasi momento (a seconda del contratto).

**Varianti comuni:**
- **Misto con opzione:** puoi scegliere alla scadenza (es. ogni 2-5 anni) se passare a fisso o variabile
- **Bilanciato:** metà importo a fisso, metà a variabile

**Vantaggi:** Flessibilità di adattarsi all'andamento dei tassi nel tempo.

**Svantaggi:** Spesso ha spread più alti delle altre tipologie. Richiede attenzione alle finestre di switch.`,
      },
    ],
  },
  {
    id: 'ammortamento',
    title: 'Ammortamento e rata',
    concepts: [
      {
        id: 'francese',
        title: 'Piano alla francese',
        subtitle: 'Il metodo di ammortamento più diffuso in Italia',
        body: `Nel piano di ammortamento alla francese (o "a rata costante"), la rata mensile è sempre uguale ma la sua composizione cambia nel tempo:

- **All'inizio:** la rata è composta prevalentemente da interessi e da poca quota capitale
- **Col tempo:** la quota interessi scende e la quota capitale sale
- **Alla fine:** la rata è quasi tutta quota capitale

**Perché accade:** Gli interessi si calcolano sempre sul debito residuo, che diminuisce mese dopo mese. Quindi anche gli interessi diminuiscono, lasciando spazio alla quota capitale.

**Implicazione pratica:** Se vuoi estinguere anticipatamente, conviene farlo nei primi anni quando stai pagando più interessi.`,
      },
      {
        id: 'crossover',
        title: 'Punto di crossover',
        subtitle: 'Quando paghi più capitale che interessi',
        body: `Il punto di crossover è il mese in cui la quota capitale supera la quota interessi nella rata. Da quel momento in poi, ogni rata "restituisce" più debito di quanto "costi" in interessi.

**Come trovarlo:** Nell'app lo trovi evidenziato nella tabella di ammortamento.

**Perché è importante:**
- Prima del crossover: ogni euro di rata serve principalmente a pagare interessi
- Dopo il crossover: ogni euro di rata riduce significativamente il debito residuo

**Regola empirica:** Con un piano alla francese standard, il crossover avviene circa a metà della durata del mutuo.`,
      },
      {
        id: 'debito-residuo',
        title: 'Debito residuo',
        subtitle: 'Quanto devi ancora alla banca',
        body: `Il debito residuo (o capitale residuo) è la quota del mutuo che non hai ancora rimborsato. È la base su cui vengono calcolati gli interessi di ogni rata.

**Come diminuisce:** Ogni mese, la quota capitale della rata riduce il debito residuo.

**Utilità pratica:**
- **Estinzione anticipata:** Il debito residuo è l'importo che dovresti versare per chiudere il mutuo. Aggiungi l'eventuale penale.
- **Surroga:** Il nuovo mutuo deve coprire almeno il debito residuo dell'attuale.
- **Rinegoziazione:** La banca valuta il debito residuo rispetto al valore attuale dell'immobile (LTV residuo).`,
      },
    ],
  },
  {
    id: 'finanziamento',
    title: 'Parametri del finanziamento',
    concepts: [
      {
        id: 'ltv',
        title: 'LTV – Loan to Value',
        subtitle: 'Quanto la banca ti presta rispetto al valore dell\'immobile',
        body: `Il Loan to Value (LTV) è il rapporto percentuale tra l'importo del mutuo richiesto e il valore dell'immobile (il minore tra prezzo d'acquisto e valore di perizia).

**Formula:** LTV = (Importo mutuo ÷ Valore immobile) × 100

**Esempio:** Immobile da 250.000€, mutuo da 200.000€ → LTV = 80%

**Soglie tipiche:**
- ≤ 50%: condizioni ottimali, spread bassissimi
- ≤ 80%: standard, il 95% dei mutui rientra qui
- 80–100%: possibile ma con spread più alti e spesso assicurazione obbligatoria

**La maggior parte delle banche non finanzia oltre il 80% del valore** (in rari casi fino al 95% con garanzie aggiuntive).`,
      },
      {
        id: 'dti',
        title: 'DTI – Debt to Income Ratio',
        subtitle: 'Quanto pesa il mutuo sul tuo stipendio',
        body: `Il Debt to Income Ratio (o rapporto rata/reddito) misura quanto incide la rata mensile sul reddito netto mensile del mutuatario.

**Formula:** DTI = (Rata mensile ÷ Reddito netto mensile) × 100

**Esempio:** Reddito netto 2.500€, rata 800€ → DTI = 32%

**Soglie orientative:**
- ≤ 30%: ideale, la banca concede facilmente
- 30–35%: accettabile per molte banche
- > 35–40%: difficile ottenere il mutuo senza garante

**Nota:** Si considerano **tutte** le rate mensili (auto, prestiti personali, carte revolving). Riduci i debiti esistenti prima di fare domanda.`,
      },
    ],
  },
  {
    id: 'processo',
    title: 'Il processo di acquisto',
    concepts: [
      {
        id: 'pre-delibera',
        title: 'Pre-delibera (o pre-approvazione)',
        subtitle: 'Il primo "sì" della banca',
        body: `La pre-delibera è una valutazione preliminare con cui la banca ti comunica la disponibilità a concedere un mutuo, senza ancora impegnarsi formalmente. Si basa sull'analisi del reddito, della storia creditizia e delle informazioni fornite.

**Cosa serve:** Busta paga (o dichiarazione dei redditi), documento identità, CF, estratto conto bancario degli ultimi 3-6 mesi.

**Valore:** La pre-delibera ti consente di fare offerte d'acquisto con maggiore credibilità. Non è vincolante per la banca (può cambiare idea dopo la perizia) né per te.

**Durata:** Tipicamente valida 2-4 mesi.`,
      },
      {
        id: 'istruttoria',
        title: 'Istruttoria',
        subtitle: 'L\'analisi formale della pratica',
        body: `L'istruttoria è la fase in cui la banca analizza formalmente la tua richiesta di mutuo dopo che hai trovato l'immobile. Include la verifica di tutti i documenti, la perizia sull'immobile e la delibera definitiva.

**Costi:** La banca addebita solitamente una spesa di istruttoria (da 0 a 1.500€ circa). Alcune banche la azzerano come promozione.

**Durata:** Tipicamente 4-8 settimane.

**Documenti richiesti:** Documenti personali + reddituali + relativi all'immobile (atto di provenienza, planimetria, APE).`,
      },
      {
        id: 'perizia',
        title: 'Perizia (Stima dell\'immobile)',
        subtitle: 'La valutazione indipendente dell\'immobile',
        body: `La perizia è una valutazione tecnica dell'immobile effettuata da un perito incaricato dalla banca (non da te). Serve a stabilire il valore di mercato dell'immobile su cui si basa il calcolo dell'LTV.

**Costi:** Di norma a carico del mutuatario: 200-400€.

**Cosa valuta:** Superficie, stato conservativo, posizione, conformità urbanistica, presenza di abusi edilizi.

**Attenzione:** Se il perito stima l'immobile meno del prezzo di acquisto, la banca eroga il mutuo basandosi sul valore peritato (più basso), non sul prezzo pagato. Potresti dover coprire la differenza.`,
      },
      {
        id: 'rogito',
        title: 'Rogito notarile',
        subtitle: 'Il giorno della firma',
        body: `Il rogito (o atto notarile di compravendita) è il contratto definitivo davanti al notaio con cui avviene il trasferimento di proprietà dell'immobile. Nello stesso atto viene solitamente stipulato anche il contratto di mutuo (atto contestuale).

**Chi partecipa:** Acquirente, venditore, notaio, rappresentante della banca (spesso presente tramite procura).

**Cosa si firma:** Atto di compravendita + contratto di mutuo + ipoteca sull'immobile.

**Costi del notaio:** Variabili in base al valore dell'immobile e al tipo di acquisto (prima/seconda casa). Di norma tra 1.500 e 4.000€.

**Dopo il rogito:** Il notaio registra l'atto e l'ipoteca. Da quel momento sei proprietario e il mutuo è attivo.`,
      },
      {
        id: 'imposta-sostitutiva',
        title: 'Imposta sostitutiva',
        subtitle: 'La tassa sul mutuo',
        body: `L'imposta sostitutiva è una tassa che si paga allo Stato al momento della stipula del mutuo. Sostituisce l'imposta di registro, ipotecaria e catastale che altrimenti si pagherebbero separatamente.

**Aliquote:**
- **Prima casa:** 0,25% dell'importo del mutuo
- **Seconda casa / altri scopi:** 2% dell'importo del mutuo

**Esempio:** Mutuo da 200.000€ per prima casa → Imposta sostitutiva = 500€

**Come si paga:** La banca la preleva direttamente e la versa per tuo conto al rogito. Non devi occupartene tu separatamente.`,
      },
    ],
  },
]
