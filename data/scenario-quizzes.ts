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
    key: "Begrüßung",
    type: "phase",
    icon: "Users",
    title: "Begrüßung des Kunden",
    description: "Der erste Eindruck zählt - so startest du das Gespräch richtig.",
    content: [
      "<b>Warum wichtig:</b> Eine freundliche Begrüßung schafft Vertrauen und öffnet das Gespräch.",
      "<b>Formulierung:</b> 'Guten Tag, was kann ich für Sie tun?' oder 'Herzlich willkommen, wie darf ich Ihnen helfen?'",
      "<b>Praxis-Tipp:</b> Blickkontakt herstellen und den Kunden anlächeln - das wirkt einladend.",
    ],
    quiz: {
      question: "Was ist der wichtigste Aspekt bei der Begrüßung eines Kunden in der Apotheke?",
      answers: [
        { text: "Sofort nach dem Rezept fragen", isCorrect: false },
        { text: "Freundlich begrüßen und fragen, wie man helfen kann", isCorrect: true },
        { text: "Auf den nächsten freien Kollegen verweisen", isCorrect: false },
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
      "<b>Warum wichtig:</b> Der Kunde erwartet eine kompetente und zügige Bearbeitung seines Rezepts.",
      "<b>Formulierung:</b> 'Vielen Dank, ich schaue gerade für Sie nach...' oder 'Ich stelle Ihnen das Medikament zusammen.'",
      "<b>Praxis-Tipp:</b> Während du das Rezept bearbeitest, nutze die Zeit für Beratungsfragen.",
    ],
    quiz: {
      question: "Was sagst du, wenn eine Kundin dir ein Rezept für HCT 25mg überreicht?",
      answers: [
        { text: "'Moment, ich muss erst nachschauen ob wir das haben.'", isCorrect: false },
        { text: "'Vielen Dank, ich schaue gerade für Sie nach und stelle das Medikament zusammen.'", isCorrect: true },
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
      "<b>Warum wichtig:</b> Nur wenn du weißt, ob der Kunde das Medikament bereits kennt, kannst du die Beratung richtig anpassen.",
      "<b>Formulierung:</b> 'Kennen Sie das Medikament bereits oder nehmen Sie es zum ersten Mal?'",
      "<b>Bei Erstverordnung erklären:</b> 'Diese Tabletten führen zu einer vermehrten Wasserausscheidung. Wasseransammlungen im Körper werden ausgeschwemmt, der Blutdruck wird gesenkt und das Herz entlastet.'",
    ],
    quiz: {
      question: "Frau Müller bekommt HCT 25mg zum ersten Mal. Was erklärst du ihr über die Wirkung?",
      answers: [
        { text: "Es ist ein Schmerzmittel gegen Kopfschmerzen.", isCorrect: false },
        { text: "Die Tabletten fördern die Wasserausscheidung, senken den Blutdruck und entlasten das Herz.", isCorrect: true },
        { text: "Es ist ein Antibiotikum gegen Infektionen.", isCorrect: false },
      ],
    },
  },
  {
    key: "Überleitung zur Ergänzung",
    type: "phase",
    icon: "Target",
    title: "Überleitung zur Ergänzung",
    description: "Der natürliche Übergang von der Rezeptberatung zur Zusatzempfehlung.",
    content: [
      "<b>Warum wichtig:</b> Die Überleitung muss natürlich wirken und auf die Nebenwirkungen des Medikaments eingehen.",
      "<b>Formulierung:</b> 'Durch die entwässernde Wirkung werden auch Mineralstoffe ausgeschieden. Kommt es bei Ihnen jetzt häufiger vor, dass Sie Muskelkrämpfe haben?'",
      "<b>Praxis-Tipp:</b> Frage nach konkreten Symptomen (Krämpfe, Müdigkeit) statt direkt ein Produkt zu empfehlen.",
    ],
    quiz: {
      question: "Wie leitest du bei einem Diuretikum-Rezept natürlich zu einer Magnesium-Empfehlung über?",
      answers: [
        { text: "'Möchten Sie auch Magnesium kaufen?'", isCorrect: false },
        { text: "'Durch die entwässernde Wirkung werden auch Mineralstoffe ausgeschieden. Haben Sie öfter Muskelkrämpfe?'", isCorrect: true },
        { text: "'Magnesium ist gerade im Angebot.'", isCorrect: false },
      ],
    },
  },
  {
    key: "Zusätzliche Tipps",
    type: "tip",
    icon: "Heart",
    title: "Zusätzliche Tipps geben",
    description: "Allgemeine Gesundheitstipps runden die Beratung ab.",
    content: [
      "<b>Warum wichtig:</b> Zusätzliche Tipps zeigen Kompetenz und Fürsorglichkeit - der Kunde fühlt sich gut beraten.",
      "<b>Tipp aus der Praxis:</b> 'Achten Sie auf eine ausgewogene, ballaststoffreiche Ernährung, um das Gewicht und die Verdauung im Auge zu behalten.'",
      "<b>Weitere Tipps:</b> Ausreichend trinken (mind. 1,5-2 Liter täglich), regelmäßig Blutdruck kontrollieren.",
    ],
    quiz: {
      question: "Welchen allgemeinen Tipp gibst du einer Kundin mit Diuretikum-Verordnung zusätzlich mit?",
      answers: [
        { text: "Möglichst wenig trinken, um die Wirkung zu verstärken.", isCorrect: false },
        { text: "Auf ausgewogene, ballaststoffreiche Ernährung achten und ausreichend trinken.", isCorrect: true },
        { text: "Das Medikament abends einnehmen für besseren Schlaf.", isCorrect: false },
      ],
    },
  },

  // --- PRODUCTS ---
  {
    key: "Magnesium Sandoz forte",
    type: "product",
    icon: "Zap",
    title: "Produktempfehlung: Magnesium Sandoz forte",
    description: "Gegen Muskelkrämpfe durch Mineralstoffverlust bei Diuretika.",
    content: [
      "<b>Warum empfehlen:</b> Durch die entwässernde Wirkung von HCT werden Mineralstoffe (v.a. Magnesium) vermehrt ausgeschieden. Das kann zu Muskelkrämpfen führen.",
      "<b>Nutzenargumentation:</b> 'Sie beugen einem Mangel vor und können ein bereits vorhandenes Defizit einfach ausgleichen. Sie spüren die entspannende Wirkung in Ihrer Muskulatur und leisten zudem einen wichtigen Beitrag für die Energieversorgung Ihres Herzens.'",
      "<b>Darreichung:</b> Brausetabletten - einfache Einnahme und gleichzeitig Flüssigkeitszufuhr.",
    ],
    quiz: {
      question: "Eine Kundin mit HCT-Rezept klagt über nächtliche Wadenkrämpfe. Welches Produkt empfiehlst du?",
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
      "<b>Überleitung:</b> 'Durch die vermehrte Wasserausscheidung kann es auch zu Verdauungsproblemen kommen. Für den Fall empfehle ich Ihnen Macrogol Hexal.'",
      "<b>Nutzenargumentation:</b> 'Mit dem sanften aber zuverlässigen Wirkstoff haben Sie die Möglichkeit, Ihre Verdauung jederzeit zu unterstützen. Es ist zur Dauereinnahme geeignet.'",
    ],
    quiz: {
      question: "Welches Produkt empfiehlst du bei Verdauungsproblemen durch ein Diuretikum?",
      answers: [
        { text: "Loperamid gegen Durchfall", isCorrect: false },
        { text: "Macrogol Hexal - sanft, zuverlässig und zur Dauereinnahme geeignet", isCorrect: true },
        { text: "Iberogast Tropfen", isCorrect: false },
      ],
    },
  },
  {
    key: "Eucerin Urea Lotion 3/10%",
    type: "product",
    icon: "Heart",
    title: "Produktempfehlung: Eucerin Urea Lotion",
    description: "Gegen trockene Haut bei längerer Diuretika-Einnahme.",
    content: [
      "<b>Warum empfehlen:</b> Häufig zeigt sich eine trockenere Haut nach längerer Einnahme eines entwässernden Medikamentes.",
      "<b>Überleitung:</b> 'Häufig zeigt sich eine trockenere Haut nach längerer Einnahme eines entwässernden Medikamentes. Eucerin Urea Lotion versorgt die Haut nachhaltig mit Feuchtigkeit.'",
      "<b>Nutzenargumentation:</b> 'Wirksam gegen Juckreiz und hervorragend verträglich. Dadurch bewahren Sie sich eine glatte, gepflegte Haut.' 3% bei leichter Trockenheit, 10% bei stärkerem Juckreiz.",
    ],
    quiz: {
      question: "Eine Kundin mit Diuretikum berichtet über zunehmend trockene Haut. Was empfiehlst du?",
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
  // weitere Szenarien hier ergänzen...
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
  // missedPhases contains labels like "Begrüßung", "Rezeptannahme" etc.
  // We need to match against the quiz key which uses phase ids like "greeting"
  // But the ConsultationTracker returns labels in missedPhases, so we match both ways

  for (const quiz of allQuizzes) {
    if (quiz.type === "phase" || quiz.type === "tip") {
      // Keys match phase labels directly (e.g. "Begrüßung", "Rezeptannahme")
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
