import type { ChecklistSectionData } from '../types/mortgage'

export const CHECKLIST_SECTIONS: ChecklistSectionData[] = [
  {
    id: 's1',
    number: 1,
    title: 'Preparazione finanziaria',
    duration: '2–4 settimane',
    warning: 'Anche con mutuo 100%, devi avere liquidità per le spese accessorie: notaio (€2.000–€4.000), imposte di registro o IVA (2–4% prima casa), agenzia (2–3% + IVA), perizia (€200–€400), polizze assicurative.',
    items: [
      {
        id: 's1-i0',
        label: 'Parla con il tuo commercialista',
        subItems: [
          'Verifica che i bilanci SRL degli ultimi 2–3 anni siano coerenti e senza anomalie',
          'Controlla le tue dichiarazioni dei redditi (Modello Persone Fisiche)',
          'Assicurati che non ci siano debiti pendenti o cartelle esattoriali',
          'Chiedi una proiezione del reddito medio netto degli ultimi 3 anni',
        ],
      },
      {
        id: 's1-i1',
        label: 'Controlla la tua reputazione creditizia',
        subItems: [
          'Richiedi il report alla Centrale Rischi di Banca d\'Italia (gratuito, online o in filiale)',
          'Richiedi il report CRIF (verifica che non ci siano segnalazioni negative)',
          'Se hai prestiti in corso, calcola l\'indebitamento residuo',
        ],
      },
      {
        id: 's1-i2',
        label: 'Calcola il tuo ISEE aggiornato',
        subItems: [
          'Necessario se vuoi accedere al Fondo Consap (soglia max €40.000)',
          'Puoi farlo tramite CAF, patronato o portale INPS',
        ],
      },
      {
        id: 's1-i3',
        label: 'Definisci il tuo budget realistico',
        subItems: [
          'Rata massima sostenibile: 25–30% del reddito netto mensile',
          'Con €3.000/mese netti → rata max indicativa €750–900',
          'Ricorda: il mutuo 100% copre il valore casa, NON le spese accessorie',
          'Prevedi €15.000–25.000 di spese extra (notaio, imposte, agenzia, perizia)',
        ],
      },
    ],
  },
  {
    id: 's2',
    number: 2,
    title: 'Esplorazione mutui e pre-delibera',
    duration: '2–4 settimane',
    warning: 'Se sei under 36 (o la tua compagna lo è e cointestate), la garanzia Consap fino all\'80% rende molto più facile ottenere il 100%. Anche il tasso sarà calmierato. Verifica subito se rientrate.',
    items: [
      {
        id: 's2-i0',
        label: 'Raccogli i documenti base per le banche',
        subItems: [
          'Documento d\'identità e codice fiscale (tuoi e della compagna se cointestate)',
          'Modello Persone Fisiche (dichiarazione redditi) ultimi 2–3 anni',
          'Bilanci SRL ultimi 2–3 esercizi depositati in Camera di Commercio',
          'Visura camerale aggiornata della SRL',
          'Estratti conto bancari personali ultimi 6–12 mesi',
          'Eventuale ISEE in corso di validità',
          'Certificato di stato civile / stato di famiglia',
        ],
      },
      {
        id: 's2-i1',
        label: 'Confronta le offerte mutuo 100%',
        subItems: [
          'Usa comparatori online (MutuiOnline, Mutui.it, MutuiSupermarket)',
          'Richiedi preventivi a 3–4 banche diverse',
          'Valuta anche un mediatore creditizio (può negoziare condizioni migliori)',
          'Confronta sempre il TAEG (costo reale totale), non solo il TAN',
        ],
      },
      {
        id: 's2-i2',
        label: 'Verifica l\'accesso al Fondo Consap Prima Casa',
        subItems: [
          'Requisiti: non proprietario di altri immobili, mutuo max €250.000, prima casa',
          'Categorie prioritarie (garanzia fino all\'80%): under 36, giovani coppie, famiglie numerose',
          'Se rientri, il tasso dev\'essere calmierato (TAEG ≤ TEGM pubblicato dal MEF)',
          'La banca stessa invia la domanda a Consap',
        ],
      },
      {
        id: 's2-i3',
        label: 'Ottieni una pre-delibera (o pre-approvazione)',
        subItems: [
          'La banca valuta preliminarmente la tua capacità di rimborso',
          'È un parere indicativo, non vincolante, ma ti dà forza nella trattativa',
          'Avere una pre-delibera velocizza tutto quando trovi la casa giusta',
        ],
      },
    ],
  },
  {
    id: 's3',
    number: 3,
    title: 'Ricerca dell\'immobile',
    duration: 'variabile',
    warning: 'La perizia della banca valuta il valore di mercato, NON i vizi dell\'immobile. Se la perizia valuta l\'immobile meno del prezzo di acquisto, con il mutuo 100% la banca finanzierà il 100% del valore periziato, non del prezzo. La differenza la devi mettere tu di tasca.',
    items: [
      {
        id: 's3-i0',
        label: 'Cerca l\'immobile con criterio',
        subItems: [
          'Definisci zona, metratura, tipologia e budget massimo',
          'Visita più immobili e non farti prendere dalla fretta',
          'Attenzione alle case in classe energetica alta (A/B): tassi agevolati "green"',
        ],
      },
      {
        id: 's3-i1',
        label: 'Verifica la regolarità urbanistica e catastale',
        subItems: [
          'Chiedi la visura catastale aggiornata',
          'Verifica che la planimetria catastale corrisponda allo stato reale',
          'Controlla eventuali abusi edilizi (possono bloccare il mutuo!)',
          'Chiedi l\'Attestato di Prestazione Energetica (APE)',
          'Verifica l\'assenza di ipoteche, vincoli o servitù pregiudizievoli',
        ],
      },
      {
        id: 's3-i2',
        label: 'Fai controllare tutto da un tecnico di fiducia',
        subItems: [
          'Un geometra o architetto indipendente può verificare la conformità',
          'Costo indicativo: €300–€800 per una verifica completa',
        ],
      },
    ],
  },
  {
    id: 's4',
    number: 4,
    title: 'Proposta d\'acquisto e compromesso',
    duration: '1–2 settimane',
    warning: 'La clausola sospensiva è il tuo paracadute. Non firmare MAI senza. È l\'errore più costoso che puoi fare.',
    items: [
      {
        id: 's4-i0',
        label: 'Formula la proposta d\'acquisto',
        subItems: [
          'Presenta un\'offerta scritta al venditore (tramite agenzia o direttamente)',
          'Indica il prezzo offerto, i tempi e le condizioni',
        ],
      },
      {
        id: 's4-i1',
        label: 'Inserisci la clausola sospensiva per il mutuo',
        subItems: [
          'Questa è la protezione più importante: se la banca rifiuta il mutuo, recuperi la caparra',
          'Formula tipo: "La presente proposta è condizionata all\'ottenimento del mutuo entro [data]"',
          'Senza clausola sospensiva, se il mutuo salta perdi la caparra confirmatoria',
          'Alcune agenzie cercano di evitarla: insisti, è un tuo diritto',
        ],
      },
      {
        id: 's4-i2',
        label: 'Firma il compromesso (preliminare di vendita)',
        subItems: [
          'Versa la caparra confirmatoria (di solito 5–10% del prezzo)',
          'Registra il preliminare all\'Agenzia delle Entrate entro 20 giorni',
          'Fissa la data del rogito in accordo con i tempi del mutuo',
        ],
      },
    ],
  },
  {
    id: 's5',
    number: 5,
    title: 'Richiesta formale del mutuo',
    duration: '4–8 settimane',
    warning: 'Non dare per scontata l\'approvazione. Come lavoratore autonomo/socio SRL l\'istruttoria è più lunga. Mantieni i conti personali e aziendali in ordine durante tutto il processo.',
    items: [
      {
        id: 's5-i0',
        label: 'Presenta la richiesta formale alla banca scelta',
        subItems: [
          'Compila il modulo di richiesta mutuo',
          'Allega tutta la documentazione personale e reddituale',
          'Allega i documenti dell\'immobile (compromesso, planimetria, APE, visura)',
          'Se usi Consap, la banca invia contestualmente la domanda al Fondo',
        ],
      },
      {
        id: 's5-i1',
        label: 'Attendi la perizia della banca sull\'immobile',
        subItems: [
          'Il perito della banca valuta il valore di mercato dell\'immobile',
          'Costo: €200–€400 (a tuo carico)',
          'Se il valore periziato è inferiore al prezzo, negozia col venditore o integra di tasca',
        ],
      },
      {
        id: 's5-i2',
        label: 'Se Consap: attendi l\'esito della garanzia',
        subItems: [
          'Consap comunica alla banca entro 20 giorni se la garanzia è concessa',
          'Poi la banca ha 90 giorni per comunicarti l\'esito finale del mutuo',
        ],
      },
      {
        id: 's5-i3',
        label: 'Ricevi la delibera (approvazione) del mutuo',
        subItems: [
          'La banca ti comunica formalmente l\'approvazione',
          'Verifica tutte le condizioni: tasso, durata, rata, spese, penali di estinzione',
          'Hai 10 giorni per il "periodo di riflessione" prima della stipula',
        ],
      },
    ],
  },
  {
    id: 's6',
    number: 6,
    title: 'Scelta assicurazioni',
    duration: 'durante la fase 5',
    items: [
      {
        id: 's6-i0',
        label: 'Polizza incendio e scoppio (OBBLIGATORIA)',
        subItems: [
          'Copre l\'immobile ipotecato per tutta la durata del mutuo',
          'NON sei obbligato a farla con la banca: confronta preventivi esterni',
          'Spesso fuori dalla banca risparmi il 50–70%',
        ],
      },
      {
        id: 's6-i1',
        label: 'Polizza vita / perdita impiego (facoltativa)',
        subItems: [
          'La banca spingerà molto per fartela sottoscrivere',
          'Può essere utile ma confronta sempre con compagnie esterne',
          'Verifica le esclusioni (per autonomi spesso la perdita impiego non si applica)',
        ],
      },
      {
        id: 's6-i2',
        label: 'Polizza fideiussoria (se richiesta per il 100%)',
        subItems: [
          'Copre la quota eccedente l\'80% del valore',
          'Costo una tantum o annuale: valuta l\'impatto sul costo totale',
        ],
      },
    ],
  },
  {
    id: 's7',
    number: 7,
    title: 'Scelta del notaio e preparazione rogito',
    duration: '2–4 settimane',
    items: [
      {
        id: 's7-i0',
        label: 'Scegli un notaio di tua fiducia',
        subItems: [
          'Non sei obbligato a usare quello dell\'agenzia o della banca',
          'Chiedi preventivi a 2–3 notai (la parcella varia molto)',
          'Il notaio fa le verifiche ipotecarie e catastali finali',
        ],
      },
      {
        id: 's7-i1',
        label: 'Il notaio prepara l\'atto',
        subItems: [
          'Atto di compravendita (rogito)',
          'Atto di mutuo ipotecario',
          'Verifica l\'assenza di ipoteche, pignoramenti, vincoli',
          'Ti invia le bozze: leggile con attenzione prima della firma',
        ],
      },
    ],
  },
  {
    id: 's8',
    number: 8,
    title: 'Il rogito — Giorno della firma',
    warning: 'Il giorno del rogito è anche l\'ultimo momento per verificare che l\'immobile sia nelle condizioni pattuite. Fai un sopralluogo finale il giorno prima o la mattina stessa.',
    items: [
      {
        id: 's8-i0',
        label: 'Preparati per il giorno del rogito',
        subItems: [
          'Documento d\'identità valido e codice fiscale',
          'Assegni circolari per il saldo (li prepara la banca con i fondi del mutuo)',
          'Assegno per le imposte e la parcella del notaio',
          'Chiavi dell\'immobile',
        ],
      },
      {
        id: 's8-i1',
        label: 'Cosa succede dal notaio',
        subItems: [
          'Si firmano l\'atto di compravendita e l\'atto di mutuo',
          'La banca eroga il mutuo al venditore',
          'Il notaio registra l\'atto e iscrive l\'ipoteca',
          'Ricevi le chiavi: la casa è tua!',
        ],
      },
    ],
  },
  {
    id: 's9',
    number: 9,
    title: 'Dopo il rogito — Adempimenti post-acquisto',
    duration: '2–4 settimane',
    items: [
      {
        id: 's9-i0',
        label: 'Voltura delle utenze (luce, gas, acqua, internet)',
        subItems: [
          'Contatta i fornitori per il cambio intestatario',
          'Comunica le letture dei contatori al momento del passaggio',
        ],
      },
      {
        id: 's9-i1',
        label: 'Cambio di residenza',
        subItems: [
          'Comunicalo al Comune entro 20 giorni (obbligatorio per le agevolazioni prima casa)',
          'Aggiorna i documenti (carta d\'identità, patente, tessera sanitaria)',
        ],
      },
      {
        id: 's9-i2',
        label: 'Comunicazione all\'amministratore di condominio',
        subItems: [
          'Invia copia dell\'atto di acquisto',
          'Chiedi il regolamento condominiale e la situazione spese',
        ],
      },
      {
        id: 's9-i3',
        label: 'Conserva tutta la documentazione',
        subItems: [
          'Atto di rogito e atto di mutuo (copie autentiche)',
          'Polizze assicurative',
          'Ricevute di tutte le spese (detraibili in dichiarazione dei redditi)',
          'Piano di ammortamento del mutuo',
        ],
      },
      {
        id: 's9-i4',
        label: 'Detrazioni fiscali',
        subItems: [
          'Interessi passivi del mutuo: detraibili al 19% fino a €4.000/anno',
          'Spese notarili per il mutuo: detraibili',
          'Spese di intermediazione (agenzia): detraibili fino a €1.000',
        ],
      },
    ],
  },
]
