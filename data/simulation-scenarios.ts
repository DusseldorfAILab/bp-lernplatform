import { coachingCards, type CoachingCard } from "./coaching-cards";

// ============================================================
// Scoring criteria for each phase of the consultation
// ============================================================

export interface ConsultationPhase {
  id: string;
  label: string;
  description: string;
  /** Keywords/phrases the employee should mention (lowercased) */
  keywords: string[];
  /** Points awarded for completing this phase */
  points: number;
}

export interface UpsellPath {
  productName: string;
  /** Keywords that indicate the employee recommended this product */
  keywords: string[];
  points: number;
}

export interface SimulationScenario {
  id: string;
  coachingCard: CoachingCard;
  /** ElevenLabs agent key to use */
  agentKey: string;
  /** Prescription details shown as an image */
  prescription: {
    patientName: string;
    doctorName: string;
    medication: string;
    dosage: string;
    date: string;
  };
  /** Phases the employee should go through */
  phases: ConsultationPhase[];
  /** Products the employee should recommend (primary + additional) */
  upsellPaths: UpsellPath[];
  /** Max total score */
  maxScore: number;
}

// ============================================================
// Build scenarios from coaching cards
// ============================================================

function buildScenario(cardId: string, overrides: Partial<SimulationScenario> & {
  prescription: SimulationScenario["prescription"];
  agentKey: string;
}): SimulationScenario {
  const card = coachingCards.find(c => c.id === cardId);
  if (!card) throw new Error(`Coaching card ${cardId} not found`);

  // Extract medication name words for the medication_knowledge phase
  const medicationWords = overrides.prescription.medication
    .toLowerCase()
    .replace(/[()\/]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);

  // Auto-generate phases from the coaching card structure
  const phases: ConsultationPhase[] = [
    {
      id: "greeting",
      label: "Begrüßung",
      description: "Freundliche Begrüßung des Kunden",
      keywords: [
        "hallo", "guten tag", "guten morgen", "guten abend",
        "willkommen", "was kann ich", "wie kann ich", "darf ich",
        "grüß", "gruess", "herzlich",
      ],
      points: 5,
    },
    {
      id: "prescription_handling",
      label: "Rezeptannahme",
      description: "Rezept annehmen und bearbeiten",
      keywords: [
        "rezept", "verordnung", "verschreibung",
        // Employee actions with the prescription
        "schaue ich", "schaue mal", "schauen wir", "schau mir",
        "hole ich", "hole das", "bringe ich",
        "stelle zusammen", "bearbeite",
        "zeigen sie", "geben sie", "sehen wir",
        "nehme das", "nehme ich",
        // Common handling phrases
        "einen moment", "augenblick", "kurz nach",
      ],
      points: 5,
    },
    {
      id: "medication_knowledge",
      label: "Medikamentenwissen",
      description: "Frage ob Kunde das Medikament kennt oder Erklärung des Medikaments",
      keywords: [
        // Asking if customer knows the medication
        "kennen sie", "zum ersten mal", "schon einmal", "schon mal",
        "erfahrung", "wissen sie", "bekannt",
        // Explaining the medication
        "einnahme", "einnehmen", "dosierung", "wirkstoff",
        "tablette", "kapsel", "tropfen",
        "morgens", "abends", "täglich", "taeglich",
        "nüchtern", "nuechtern", "vor dem essen", "nach dem essen",
        "vor der mahlzeit", "nach einer mahlzeit",
        // Medication-specific words from prescription
        ...medicationWords,
        // From coaching card: what to tell when customer doesn't know
        ...extractKeywordsStrict(card.customerDoesNotKnow.join(" ")),
      ],
      points: 10,
    },
    {
      id: "bridge_to_supplement",
      label: "Überleitung zur Ergänzung",
      description: "Natürliche Überleitung zu Zusatzempfehlungen",
      keywords: extractKeywordsStrict(card.bridgeToSupplement),
      points: 15,
    },
  ];

  // Primary product recommendation - ONLY match on product name, not benefits
  const upsellPaths: UpsellPath[] = card.products.map(p => ({
    productName: p.name,
    keywords: extractProductKeywords(p.name),
    points: 20,
  }));

  // Additional bridges / products - ONLY match on product name
  if (card.additionalBridges) {
    card.additionalBridges.forEach(bridge => {
      bridge.products.forEach(p => {
        if (p.name && p.benefits.length > 0) {
          upsellPaths.push({
            productName: p.name,
            keywords: extractProductKeywords(p.name),
            points: 15,
          });
        }
      });
    });
  }

  // Tips phase
  if (card.tips) {
    phases.push({
      id: "tips",
      label: "Zusätzliche Tipps",
      description: "Allgemeine Gesundheitstipps geben",
      keywords: extractKeywordsStrict(card.tips),
      points: 10,
    });
  }

  const maxScore = phases.reduce((s, p) => s + p.points, 0)
    + upsellPaths.reduce((s, p) => s + p.points, 0);

  return {
    id: cardId,
    coachingCard: card,
    agentKey: overrides.agentKey,
    prescription: overrides.prescription,
    phases,
    upsellPaths,
    maxScore,
  };
}

/**
 * Extract product name keywords for matching.
 * Only uses the product name itself - NOT benefit text.
 * This prevents false positives from generic words like "wirkung", "mangel", etc.
 */
function extractProductKeywords(productName: string): string[] {
  // Common non-distinctive words in product names
  const skipWords = new Set([
    "plus", "forte", "comp", "mono", "akut", "direkt",
    "zum", "einnehmen", "auftragen", "trinken",
  ]);

  const nameWords = productName
    .toLowerCase()
    .replace(/[()\/\-%&]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !skipWords.has(w));

  // Also add the full name (lowercased) as a keyword if it's distinctive enough
  const fullNameLower = productName.toLowerCase().trim();
  const keywords = [...nameWords];
  if (fullNameLower.length > 6) {
    keywords.push(fullNameLower);
  }

  return Array.from(new Set(keywords));
}

/**
 * Extract meaningful keywords from German text.
 * Stricter filtering than before - requires longer words and filters
 * more common pharmacy/conversation words to reduce false positives.
 */
function extractKeywordsStrict(text: string): string[] {
  if (!text) return [];
  const stopWords = new Set([
    // General German stop words
    "der", "die", "das", "und", "oder", "ein", "eine", "ist", "sind", "bei",
    "mit", "von", "zu", "für", "fuer", "auf", "in", "den", "dem", "des", "es", "sich",
    "wie", "auch", "nicht", "als", "dass", "kann", "wird", "hat", "haben",
    "sie", "ich", "wir", "ihr", "er", "man", "nur", "noch", "aber", "was",
    "nach", "diese", "einem", "einer", "dieses", "ihnen", "ihrem", "ihre",
    "sehr", "können", "werden", "schon", "durch", "über", "ueber", "mehr", "bereits",
    "denn", "dann", "hier", "dort", "jetzt", "wenn", "weil", "dazu", "daher",
    "damit", "dafür", "dafuer", "dabei", "darum", "also", "etwa",
    // Common pharmacy/medical conversation words (too generic for matching)
    "wirkung", "nehmen", "einnahme", "empfehle", "empfehlung", "produkt",
    "wichtig", "besonders", "helfen", "sorgt", "dafür", "dafuer", "bedeutet",
    "tabletten", "kapseln", "tropfen", "pulver", "creme", "lotion",
    "einfach", "bitte", "gerne", "natürlich", "natuerlich",
    "guten", "guten", "danke", "bitte",
  ]);

  return text
    .toLowerCase()
    .replace(/[.,;:!?()'"]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopWords.has(w))
    .slice(0, 10);
}

// ============================================================
// Predefined scenarios
// ============================================================

export const simulationScenarios: SimulationScenario[] = [
  buildScenario("diuretikum", {
    agentKey: "pharmacy_diuretikum",
    prescription: {
      patientName: "Helga Müller",
      doctorName: "Dr. med. Stefan Weber",
      medication: "HCT 25mg (Hydrochlorothiazid)",
      dosage: "1x täglich morgens",
      date: "05.03.2026",
    },
  }),
  buildScenario("fluoridbehandlung", {
    agentKey: "pharmacy_fluorid",
    prescription: {
      patientName: "Lisa Schneider (für Sohn Maximilian, 3 Monate)",
      doctorName: "Dr. med. Anna Braun, Kinderärztin",
      medication: "D-Fluoretten 500 I.E.",
      dosage: "1x täglich 1 Tablette vor der Mahlzeit",
      date: "04.03.2026",
    },
  }),
  buildScenario("gastritis-reflux", {
    agentKey: "pharmacy_gastritis",
    prescription: {
      patientName: "Thomas Becker",
      doctorName: "Dr. med. Klaus Fischer",
      medication: "Omeprazol 20mg",
      dosage: "1x täglich morgens vor dem Frühstück",
      date: "03.03.2026",
    },
  }),
  buildScenario("gicht", {
    agentKey: "pharmacy_gicht",
    prescription: {
      patientName: "Werner Hoffmann",
      doctorName: "Dr. med. Petra Lange",
      medication: "Allopurinol 300mg",
      dosage: "1x täglich nach einer Mahlzeit",
      date: "05.03.2026",
    },
  }),
  buildScenario("eisenmangel", {
    agentKey: "pharmacy_eisenmangel",
    prescription: {
      patientName: "Sabine Klein",
      doctorName: "Dr. med. Martin Scholz",
      medication: "Ferro Sanol duodenal 100mg",
      dosage: "1x täglich morgens vor dem Frühstück",
      date: "04.03.2026",
    },
  }),
  buildScenario("grippeimpfstoff", {
    agentKey: "pharmacy_grippe",
    prescription: {
      patientName: "Gerhard Neumann",
      doctorName: "Dr. med. Claudia Richter",
      medication: "Influvac Tetra 2025/2026",
      dosage: "Einmalige Applikation durch den Arzt",
      date: "02.03.2026",
    },
  }),
  buildScenario("helicobacter", {
    agentKey: "pharmacy_helicobacter",
    prescription: {
      patientName: "Andrea Zimmermann",
      doctorName: "Dr. med. Jörg Hartmann",
      medication: "Amoxicillin 1000mg + Clarithromycin 500mg + Pantoprazol 40mg",
      dosage: "Eradikationstherapie 7 Tage",
      date: "03.03.2026",
    },
  }),
  buildScenario("hyperthyreose", {
    agentKey: "pharmacy_hyperthyreose",
    prescription: {
      patientName: "Monika Krause",
      doctorName: "Dr. med. Friedrich Baumann",
      medication: "Thiamazol 10mg",
      dosage: "1x täglich",
      date: "05.03.2026",
    },
  }),
  buildScenario("hypothyreose", {
    agentKey: "pharmacy_hypothyreose",
    prescription: {
      patientName: "Karin Schulze",
      doctorName: "Dr. med. Hans Schreiber",
      medication: "L-Thyroxin 50 Mikrogramm",
      dosage: "1x täglich morgens nüchtern",
      date: "04.03.2026",
    },
  }),
  buildScenario("kompressionsstruempfe", {
    agentKey: "pharmacy_kompression",
    prescription: {
      patientName: "Ursula Wagner",
      doctorName: "Dr. med. Bernd König",
      medication: "Kompressionsstrümpfe Klasse II, AD",
      dosage: "Täglich tragen",
      date: "01.03.2026",
    },
  }),
];

export function getScenarioById(id: string): SimulationScenario | undefined {
  return simulationScenarios.find(s => s.id === id);
}

export function getScenarioByAgentKey(agentKey: string): SimulationScenario | undefined {
  return simulationScenarios.find(s => s.agentKey === agentKey);
}
