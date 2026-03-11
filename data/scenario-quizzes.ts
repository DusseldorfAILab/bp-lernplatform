// ============================================================
// Pre-defined quiz modules per scenario, keyed by missed phase/product
// These come directly from the coaching card PDF content.
// The completion page picks the modules matching missed items.
// ============================================================

import type { CoachingCard } from "./coaching-cards";

export interface ScenarioQuizModule {
  /** Matches a phase id (e.g. "greeting") or product name (e.g. "Macrogol Hexal") */
  key: string;
  type: "phase" | "product" | "tip";
  icon: string;
  title: string;
  description: string;
  content: string[];
  quiz: {
    question: string;
    answers: { text: string; isCorrect: boolean }[];
  };
}

// ============================================================
// DIURETIKUM
// ============================================================

const diuretikumQuizzes: ScenarioQuizModule[] = [
  // --- PHASES (keys match the phase labels from simulation-scenarios.ts) ---
  {
    key: "Begruessung",
    type: "phase",
    icon: "Users",
    title: "Begruessung des Kunden",
    description: "Der erste Eindruck zaehlt - so startest du das Gespraech richtig.",
    content: [
      "<b>Warum wichtig:</b> Eine freundliche Begruessung schafft Vertrauen und oeffnet das Gespraech.",
      "<b>Formulierung:</b> 'Guten Tag, was kann ich fuer Sie tun?' oder 'Herzlich willkommen, wie darf ich Ihnen helfen?'",
      "<b>Praxis-Tipp:</b> Blickkontakt herstellen und den Kunden anlächeln - das wirkt einladend.",
    ],
    quiz: {
      question: "Was ist der wichtigste Aspekt bei der Begruessung eines Kunden in der Apotheke?",
      answers: [
        { text: "Sofort nach dem Rezept fragen", isCorrect: false },
        { text: "Freundlich begruessen und fragen, wie man helfen kann", isCorrect: true },
        { text: "Auf den naechsten freien Kollegen verweisen", isCorrect: false },
      ],
    },
  },
  {
    key: "Rezeptannahme",
    type: "phase",
    icon: "Pill",
    title: "Rezeptannahme und Bearbeitung",
    description: "Professioneller Umgang mit dem Rezept.",
    content: [
      "<b>Warum wichtig:</b> Der Kunde erwartet eine kompetente und zuegige Bearbeitung seines Rezepts.",
      "<b>Formulierung:</b> 'Vielen Dank, ich schaue gerade fuer Sie nach...' oder 'Ich stelle Ihnen das Medikament zusammen.'",
      "<b>Praxis-Tipp:</b> Waehrend du das Rezept bearbeitest, nutze die Zeit fuer Beratungsfragen.",
    ],
    quiz: {
      question: "Was sagst du, wenn eine Kundin dir ein Rezept fuer HCT 25mg ueberreicht?",
      answers: [
        { text: "'Moment, ich muss erst nachschauen ob wir das haben.'", isCorrect: false },
        { text: "'Vielen Dank, ich schaue gerade fuer Sie nach und stelle das Medikament zusammen.'", isCorrect: true },
        { text: "'Das kenne ich nicht, was ist das?'", isCorrect: false },
      ],
    },
  },
  {
    key: "Medikamentenwissen",
    type: "phase",
    icon: "ShieldCheck",
    title: "Medikamentenwissen abfragen",
    description: "Kennt der Kunde das Medikament? Diese Frage bestimmt die Beratungstiefe.",
    content: [
      "<b>Warum wichtig:</b> Nur wenn du weisst, ob der Kunde das Medikament bereits kennt, kannst du die Beratung richtig anpassen.",
      "<b>Formulierung:</b> 'Kennen Sie das Medikament bereits oder nehmen Sie es zum ersten Mal?'",
      "<b>Bei Erstverordnung erklaeren:</b> 'Diese Tabletten fuehren zu einer vermehrten Wasserausscheidung. Wasseransammlungen im Koerper werden ausgeschwemmt, der Blutdruck wird gesenkt und das Herz entlastet.'",
    ],
    quiz: {
      question: "Frau Mueller bekommt HCT 25mg zum ersten Mal. Was erklaerst du ihr ueber die Wirkung?",
      answers: [
        { text: "Es ist ein Schmerzmittel gegen Kopfschmerzen.", isCorrect: false },
        { text: "Die Tabletten foerdern die Wasserausscheidung, senken den Blutdruck und entlasten das Herz.", isCorrect: true },
        { text: "Es ist ein Antibiotikum gegen Infektionen.", isCorrect: false },
      ],
    },
  },
  {
    key: "Ueberleitung zur Ergaenzung",
    type: "phase",
    icon: "Target",
    title: "Ueberleitung zur Ergaenzung",
    description: "Der natuerliche Uebergang von der Rezeptberatung zur Zusatzempfehlung.",
    content: [
      "<b>Warum wichtig:</b> Die Ueberleitung muss natuerlich wirken und auf die Nebenwirkungen des Medikaments eingehen.",
      "<b>Formulierung:</b> 'Durch die entwaessernde Wirkung werden auch Mineralstoffe ausgeschieden. Kommt es bei Ihnen jetzt haeufiger vor, dass Sie Muskelkraempfe haben?'",
      "<b>Praxis-Tipp:</b> Frage nach konkreten Symptomen (Kraempfe, Muedigkeit) statt direkt ein Produkt zu empfehlen.",
    ],
    quiz: {
      question: "Wie leitest du bei einem Diuretikum-Rezept natuerlich zu einer Magnesium-Empfehlung ueber?",
      answers: [
        { text: "'Moechten Sie auch Magnesium kaufen?'", isCorrect: false },
        { text: "'Durch die entwaessernde Wirkung werden auch Mineralstoffe ausgeschieden. Haben Sie oefter Muskelkraempfe?'", isCorrect: true },
        { text: "'Magnesium ist gerade im Angebot.'", isCorrect: false },
      ],
    },
  },
  {
    key: "Zusaetzliche Tipps",
    type: "tip",
    icon: "Heart",
    title: "Zusaetzliche Tipps geben",
    description: "Allgemeine Gesundheitstipps runden die Beratung ab.",
    content: [
      "<b>Warum wichtig:</b> Zusaetzliche Tipps zeigen Kompetenz und Fuersorglichkeit - der Kunde fuehlt sich gut beraten.",
      "<b>Tipp aus der Praxis:</b> 'Achten Sie auf eine ausgewogene, ballaststoffreiche Ernaehrung, um das Gewicht und die Verdauung im Auge zu behalten.'",
      "<b>Weitere Tipps:</b> Ausreichend trinken (mind. 1,5-2 Liter taeglich), regelmaessig Blutdruck kontrollieren.",
    ],
    quiz: {
      question: "Welchen allgemeinen Tipp gibst du einer Kundin mit Diuretikum-Verordnung zusaetzlich mit?",
      answers: [
        { text: "Moeglichst wenig trinken, um die Wirkung zu verstaerken.", isCorrect: false },
        { text: "Auf ausgewogene, ballaststoffreiche Ernaehrung achten und ausreichend trinken.", isCorrect: true },
        { text: "Das Medikament abends einnehmen fuer besseren Schlaf.", isCorrect: false },
      ],
    },
  },

  // --- PRODUCTS ---
  {
    key: "Magnesium Sandoz forte",
    type: "product",
    icon: "Zap",
    title: "Produktempfehlung: Magnesium Sandoz forte",
    description: "Gegen Muskelkraempfe durch Mineralstoffverlust bei Diuretika.",
    content: [
      "<b>Warum empfehlen:</b> Durch die entwaessernde Wirkung von HCT werden Mineralstoffe (v.a. Magnesium) vermehrt ausgeschieden. Das kann zu Muskelkraempfen fuehren.",
      "<b>Nutzenargumentation:</b> 'Sie beugen einem Mangel vor und koennen ein bereits vorhandenes Defizit einfach ausgleichen. Sie spueren die entspannende Wirkung in Ihrer Muskulatur und leisten zudem einen wichtigen Beitrag fuer die Energieversorgung Ihres Herzens.'",
      "<b>Darreichung:</b> Brausetabletten - einfache Einnahme und gleichzeitig Fluessigkeitszufuhr.",
    ],
    quiz: {
      question: "Eine Kundin mit HCT-Rezept klagt ueber naechtliche Wadenkraempfe. Welches Produkt empfiehlst du?",
      answers: [
        { text: "Ibuprofen 400mg gegen die Schmerzen", isCorrect: false },
        { text: "Magnesium Sandoz forte Brausetabletten", isCorrect: true },
        { text: "Baldrian-Tropfen zum Einschlafen", isCorrect: false },
      ],
    },
  },
  {
    key: "Macrogol Hexal",
    type: "product",
    icon: "Pill",
    title: "Produktempfehlung: Macrogol Hexal",
    description: "Gegen Verdauungsprobleme als Begleiterscheinung von Diuretika.",
    content: [
      "<b>Warum empfehlen:</b> Durch die vermehrte Wasserausscheidung kann es zu Verstopfung kommen, da dem Stuhl Wasser entzogen wird.",
      "<b>Ueberleitung:</b> 'Durch die vermehrte Wasserausscheidung kann es auch zu Verdauungsproblemen kommen. Fuer den Fall empfehle ich Ihnen Macrogol Hexal.'",
      "<b>Nutzenargumentation:</b> 'Mit dem sanften aber zuverlaessigen Wirkstoff haben Sie die Moeglichkeit, Ihre Verdauung jederzeit zu unterstuetzen. Es ist zur Dauereinnahme geeignet.'",
    ],
    quiz: {
      question: "Welches Produkt empfiehlst du bei Verdauungsproblemen durch ein Diuretikum?",
      answers: [
        { text: "Loperamid gegen Durchfall", isCorrect: false },
        { text: "Macrogol Hexal - sanft, zuverlaessig und zur Dauereinnahme geeignet", isCorrect: true },
        { text: "Iberogast Tropfen", isCorrect: false },
      ],
    },
  },
  {
    key: "Eucerin Urea Lotion 3/10%",
    type: "product",
    icon: "Heart",
    title: "Produktempfehlung: Eucerin Urea Lotion",
    description: "Gegen trockene Haut bei laengerer Diuretika-Einnahme.",
    content: [
      "<b>Warum empfehlen:</b> Haeufig zeigt sich eine trockenere Haut nach laengerer Einnahme eines entwaessernden Medikamentes.",
      "<b>Ueberleitung:</b> 'Haeufig zeigt sich eine trockenere Haut nach laengerer Einnahme eines entwaessernden Medikamentes. Eucerin Urea Lotion versorgt die Haut nachhaltig mit Feuchtigkeit.'",
      "<b>Nutzenargumentation:</b> 'Wirksam gegen Juckreiz und hervorragend vertraeglich. Dadurch bewahren Sie sich eine glatte, gepflegte Haut.' 3% bei leichter Trockenheit, 10% bei staerkerem Juckreiz.",
    ],
    quiz: {
      question: "Eine Kundin mit Diuretikum berichtet ueber zunehmend trockene Haut. Was empfiehlst du?",
      answers: [
        { text: "Eucerin Urea Lotion - versorgt die Haut nachhaltig mit Feuchtigkeit", isCorrect: true },
        { text: "Mehr Wasser trinken reicht aus", isCorrect: false },
        { text: "Cortison-Salbe gegen den Juckreiz", isCorrect: false },
      ],
    },
  },
];

// ============================================================
// REGISTRY: Maps scenario IDs to their quiz modules
// ============================================================

const scenarioQuizRegistry: Record<string, ScenarioQuizModule[]> = {
  diuretikum: diuretikumQuizzes,
  // weitere Szenarien hier ergaenzen...
};

/**
 * Returns pre-defined quiz modules for missed phases/products in a scenario.
 * Uses the consultationScore to determine which modules to show.
 */
export function getQuizModulesForMissedItems(
  scenarioId: string,
  missedPhases: string[],
  missedProducts: string[],
): ScenarioQuizModule[] {
  const allQuizzes = scenarioQuizRegistry[scenarioId];
  if (!allQuizzes) return [];

  const modules: ScenarioQuizModule[] = [];

  // Map phase labels back to phase ids for matching
  // missedPhases contains labels like "Begruessung", "Rezeptannahme" etc.
  // We need to match against the quiz key which uses phase ids like "greeting"
  // But the ConsultationTracker returns labels in missedPhases, so we match both ways

  for (const quiz of allQuizzes) {
    if (quiz.type === "phase" || quiz.type === "tip") {
      // Keys match phase labels directly (e.g. "Begruessung", "Rezeptannahme")
      const isMissed = missedPhases.some(mp => mp === quiz.key);
      if (isMissed) modules.push(quiz);
    } else if (quiz.type === "product") {
      // Keys match product names (e.g. "Macrogol Hexal")
      const isMissed = missedProducts.some(mp =>
        mp === quiz.key || mp.includes(quiz.key) || quiz.key.includes(mp)
      );
      if (isMissed) modules.push(quiz);
    }
  }

  return modules;
}

/**
 * Returns ALL quiz modules for a scenario (for fallback/full review).
 */
export function getAllQuizModules(scenarioId: string): ScenarioQuizModule[] {
  return scenarioQuizRegistry[scenarioId] || [];
}
