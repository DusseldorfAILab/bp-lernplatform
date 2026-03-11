#!/usr/bin/env node

/**
 * Generates filled prescription images for all 9 remaining scenarios
 * using Gemini image generation, then uploads to Supabase Storage.
 *
 * Usage:
 *   node scripts/generate-prescriptions.mjs <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Requires: template + example images in /Downloads/
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GEMINI_API_KEY = "AIzaSyBQ-ejhLrlxBIbx_ZNiWlOwmg3Cv3VywBM";
const GEMINI_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SUPABASE_URL = "https://dgewbsyvaglfmrlaufkd.supabase.co";
const SUPABASE_KEY = process.argv[2];
const BUCKET = "training-assets";

if (!SUPABASE_KEY) {
  console.error("Usage: node scripts/generate-prescriptions.mjs <SUPABASE_SERVICE_ROLE_KEY>");
  process.exit(1);
}

// Reference images
const TEMPLATE_PATH = resolve("/Users/janmac/Downloads/51115_rezept_vorlage.jpg");
const EXAMPLE_PATH = resolve("/Users/janmac/Downloads/pharmacy_diurethikum_rezept.png");

// Output dir for local backup
const OUTPUT_DIR = resolve(__dirname, "../generated-prescriptions");
mkdirSync(OUTPUT_DIR, { recursive: true });

// 9 scenarios to generate (diuretikum already exists)
const scenarios = [
  {
    fileName: "pharmacy_fluoridbehandlung_rezept",
    patientName: "Lisa Schneider",
    krankenkasse: "AOK Bayern",
    doctorName: "Dr. med. Anna Braun",
    doctorDetails: "Fachärztin für Kinder- und Jugendmedizin\nMozartstr. 5\n80336 München\nLANR: 3456789",
    medication: "D-Fluoretten 500 I.E. - 90 Tbl. N3\n(PZN: 23456789)",
    dosage: "1x täglich 1 Tablette\nvor der Mahlzeit",
    date: "04.03.2026",
  },
  {
    fileName: "pharmacy_gastritis_reflux_rezept",
    patientName: "Thomas Becker",
    krankenkasse: "Barmer GEK",
    doctorName: "Dr. med. Klaus Fischer",
    doctorDetails: "Facharzt für Innere Medizin\nHauptstr. 22\n50667 Köln\nLANR: 4567891",
    medication: "Omeprazol 20mg - 30 Kps. N1\n(PZN: 34567890)",
    dosage: "1x täglich morgens\nvor dem Frühstück",
    date: "03.03.2026",
  },
  {
    fileName: "pharmacy_gicht_rezept",
    patientName: "Werner Hoffmann",
    krankenkasse: "DAK Gesundheit",
    doctorName: "Dr. med. Petra Lange",
    doctorDetails: "Fachärztin für Allgemeinmedizin\nLindenallee 8\n40210 Düsseldorf\nLANR: 5678901",
    medication: "Allopurinol 300mg - 100 Tbl. N3\n(PZN: 45678901)",
    dosage: "1x täglich nach\neiner Mahlzeit",
    date: "05.03.2026",
  },
  {
    fileName: "pharmacy_eisenmangelanaemie_rezept",
    patientName: "Sabine Klein",
    krankenkasse: "Techniker Krankenkasse (TK)",
    doctorName: "Dr. med. Martin Scholz",
    doctorDetails: "Facharzt für Allgemeinmedizin\nBergstr. 15\n60311 Frankfurt\nLANR: 6789012",
    medication: "Ferro Sanol duodenal 100mg - 50 Kps. N2\n(PZN: 56789012)",
    dosage: "1x täglich morgens\nvor dem Frühstück",
    date: "04.03.2026",
  },
  {
    fileName: "pharmacy_grippeimpfstoff_rezept",
    patientName: "Gerhard Neumann",
    krankenkasse: "AOK Nordost",
    doctorName: "Dr. med. Claudia Richter",
    doctorDetails: "Fachärztin für Allgemeinmedizin\nKastanienweg 3\n10115 Berlin\nLANR: 7890123",
    medication: "Influvac Tetra 2025/2026\nFertigspritze 0,5ml\n(PZN: 67890123)",
    dosage: "Einmalige Applikation\ndurch den Arzt",
    date: "02.03.2026",
  },
  {
    fileName: "pharmacy_helicobacter_rezept",
    patientName: "Andrea Zimmermann",
    krankenkasse: "IKK classic",
    doctorName: "Dr. med. Jörg Hartmann",
    doctorDetails: "Facharzt für Innere Medizin\nRosenstr. 12\n70173 Stuttgart\nLANR: 8901234",
    medication: "Amoxicillin 1000mg - 20 Tbl.\nClarithromycin 500mg - 14 Tbl.\nPantoprazol 40mg - 14 Tbl.\n(Eradikationstherapie 7 Tage)",
    dosage: "nach Anweisung",
    date: "03.03.2026",
  },
  {
    fileName: "pharmacy_hyperthyreose_rezept",
    patientName: "Monika Krause",
    krankenkasse: "Barmer GEK",
    doctorName: "Dr. med. Friedrich Baumann",
    doctorDetails: "Facharzt für Innere Medizin\nEndokrinologie\nAm Markt 7\n04109 Leipzig\nLANR: 9012345",
    medication: "Thiamazol 10mg - 100 Tbl. N3\n(PZN: 89012345)",
    dosage: "1x täglich",
    date: "05.03.2026",
  },
  {
    fileName: "pharmacy_hypothyreose_rezept",
    patientName: "Karin Schulze",
    krankenkasse: "DAK Gesundheit",
    doctorName: "Dr. med. Hans Schreiber",
    doctorDetails: "Facharzt für Allgemeinmedizin\nGoethestr. 20\n30159 Hannover\nLANR: 0123456",
    medication: "L-Thyroxin 50µg - 100 Tbl. N3\n(PZN: 90123456)",
    dosage: "1x täglich morgens\nnüchtern einnehmen",
    date: "04.03.2026",
  },
  {
    fileName: "pharmacy_kompressionsstruempfe_rezept",
    patientName: "Ursula Wagner",
    krankenkasse: "AOK Baden-Württemberg",
    doctorName: "Dr. med. Bernd König",
    doctorDetails: "Facharzt für Allgemeinmedizin\nPhlebologie\nBahnhofstr. 4\n79098 Freiburg\nLANR: 1234560",
    medication: "Kompressionsstrümpfe Klasse II\nAD (Unterschenkel), 1 Paar\n(Hilfsmittel-Nr: 17.02.01)",
    dosage: "täglich tragen",
    date: "01.03.2026",
  },
];

function imageToBase64(filePath) {
  const buf = readFileSync(filePath);
  return buf.toString("base64");
}

async function generatePrescriptionImage(scenario) {
  const templateB64 = imageToBase64(TEMPLATE_PATH);
  const exampleB64 = imageToBase64(EXAMPLE_PATH);

  const prompt = `Du siehst zwei Bilder:
1. Eine leere deutsche Rezeptvorlage (Muster 16)
2. Ein ausgefülltes Beispielrezept für HCT 25mg (Diuretikum)

Erstelle ein neues ausgefülltes Rezept im EXAKT gleichen Stil wie das Beispiel.
Verwende die gleiche Schriftart, Positionierung und den gleichen visuellen Stil.
Das Rezept soll realistisch und professionell aussehen.

Fülle folgende Daten ein:
- Krankenkasse: ${scenario.krankenkasse}
- Patient: ${scenario.patientName}
- Kostenträgerkennung: 1010101
- Versicherten-Nr: A123456789
- Betriebsstätten-Nr: 1234567
- Arzt-Nr: 4567890
- Datum: ${scenario.date}
- Zuzahlung: 0.00
- Rp. (Verordnung): ${scenario.medication}
- Dosierung: ${scenario.dosage}
- Arztstempel: ${scenario.doctorName}\n${scenario.doctorDetails}
- Unterschrift: Handschriftlich stilisiert (Nachname des Arztes)

WICHTIG: Das Ergebnis muss wie ein echtes deutsches Kassenrezept (Muster 16) aussehen, rosa/pink Hintergrund, gleicher Stil wie das Beispiel.`;

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: templateB64,
            },
          },
          {
            inline_data: {
              mime_type: "image/png",
              data: exampleB64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Extract image from response (Gemini uses camelCase: inlineData/mimeType)
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      const inlined = part.inline_data || part.inlineData;
      const mime = inlined?.mime_type || inlined?.mimeType || "";
      if (mime.startsWith("image/")) {
        return Buffer.from(inlined.data, "base64");
      }
    }
  }

  throw new Error("No image in Gemini response");
}

async function uploadToSupabase(fileName, imageBuffer) {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}.png`;

  // Try upsert
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "image/png",
      "x-upsert": "true",
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    // Try POST if PUT fails
    const res2 = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}.png`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "image/png",
      },
      body: imageBuffer,
    });
    if (!res2.ok) {
      const err = await res2.text();
      throw new Error(`Upload failed: ${res2.status} ${err}`);
    }
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}.png`;
}

async function main() {
  console.log("=== Prescription Image Generator ===\n");
  console.log(`Generating ${scenarios.length} prescription images...\n`);

  for (const scenario of scenarios) {
    process.stdout.write(`  ${scenario.fileName}... `);
    try {
      // Generate
      const imageBuffer = await generatePrescriptionImage(scenario);

      // Save locally
      const localPath = resolve(OUTPUT_DIR, `${scenario.fileName}.png`);
      writeFileSync(localPath, imageBuffer);

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(scenario.fileName, imageBuffer);
      console.log(`OK -> ${publicUrl}`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log("\nDone! Restart dev server to see new images in chat.");
}

main().catch(console.error);
