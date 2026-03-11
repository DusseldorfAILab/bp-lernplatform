# consultation_sessions - Datenstruktur & Auswertung

## Tabelle: `consultation_sessions`

Speichert jede abgeschlossene Beratungssimulation mit Score, Phasen-Tracking, Produktempfehlungen und vollem Transkript.

---

## Schema

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | `uuid` (PK) | Automatisch generiert |
| `user_id` | `uuid` (FK → auth.users) | Supabase Auth User ID |
| `scenario_id` | `text` NOT NULL | Szenario-Key, z.B. `diuretikum`, `fluoridbehandlung`, `gastritis-reflux` |
| `scenario_title` | `text` | Anzeigename, z.B. `Diuretikum`, `Fluoridbehandlung` |
| `agent_key` | `text` | ElevenLabs Agent-Key, z.B. `pharmacy_diuretikum` |
| `score` | `integer` | Erreichte Punktzahl |
| `max_score` | `integer` | Maximal erreichbare Punktzahl |
| `percentage` | `integer` | Prozent (0-100), berechnet als `round(score / max_score * 100)` |
| `phases_completed` | `integer` | Anzahl abgeschlossener Gespraechsphasen |
| `phases_total` | `integer` | Gesamtanzahl Phasen |
| `completed_phases` | `text[]` | Array der abgeschlossenen Phasen-IDs, z.B. `{greeting,prescription_handling}` |
| `missed_phases` | `text[]` | Array der verpassten Phasen-IDs |
| `products_recommended` | `integer` | Anzahl empfohlener Produkte |
| `products_total` | `integer` | Gesamtanzahl moeglicher Produkte |
| `recommended_products` | `text[]` | Array der empfohlenen Produktnamen, z.B. `{"Magnesium Sandoz forte"}` |
| `missed_products` | `text[]` | Array der nicht empfohlenen Produktnamen |
| `transcript` | `jsonb` | Volles Gespraechstranskript (Array von Nachrichten) |
| `gemini_analysis` | `jsonb` | KI-generierte Analyse (optional, wird aktuell nicht befuellt) |
| `duration_seconds` | `integer` | Gespraechsdauer in Sekunden |
| `created_at` | `timestamptz` | Zeitpunkt der Session |
| `updated_at` | `timestamptz` | Letztes Update |

---

## Moegliche Werte

### scenario_id

| scenario_id | scenario_title | agent_key |
|-------------|---------------|-----------|
| `diuretikum` | Diuretikum | `pharmacy_diuretikum` |
| `fluoridbehandlung` | Fluoridbehandlung | `pharmacy_fluorid` |
| `gastritis-reflux` | Gastritis / Reflux | `pharmacy_gastritis` |
| `gicht` | Gicht | `pharmacy_gicht` |
| `eisenmangel` | Eisenmangelanaemie | `pharmacy_eisenmangel` |
| `grippeimpfstoff` | Grippeimpfstoff | `pharmacy_grippe` |
| `helicobacter` | Helicobacter | `pharmacy_helicobacter` |
| `hyperthyreose` | Hyperthyreose | `pharmacy_hyperthyreose` |
| `hypothyreose` | Hypothyreose | `pharmacy_hypothyreose` |
| `kompressionsstruempfe` | Kompressionsstruempfe | `pharmacy_kompression` |

### Phasen-IDs (completed_phases / missed_phases)

Jede Simulation hat diese Phasen (in Reihenfolge):

| Phase-ID | Label | Punkte | Beschreibung |
|----------|-------|--------|--------------|
| `greeting` | Begruessung | 5 | Freundliche Begruessung des Kunden |
| `prescription_handling` | Rezeptannahme | 5 | Rezept entgegennehmen und bearbeiten |
| `medication_knowledge` | Medikamentenwissen | 10 | Fragen ob Kunde das Medikament kennt / Erklaerung |
| `bridge_to_supplement` | Ueberleitung zur Ergaenzung | 15 | Natuerliche Ueberleitung zu Zusatzempfehlungen |
| `tips` | Zusaetzliche Tipps | 10 | Allgemeine Gesundheitstipps (nur wenn in Coaching Card vorhanden) |

### Produkte (recommended_products / missed_products)

Jedes Szenario hat unterschiedliche Produkte. Beispiel Diuretikum:

| Produkt | Punkte | Typ |
|---------|--------|-----|
| Magnesium Sandoz forte | 20 | Hauptempfehlung |
| Macrogol Hexal | 15 | Zusatzempfehlung |
| Eucerin Urea Lotion 3/10% | 15 | Zusatzempfehlung |

---

## Transcript-Format (jsonb)

Das `transcript`-Feld ist ein JSON-Array mit folgendem Format:

```json
[
  {
    "role": "ai",
    "text": "Guten Tag, ich habe hier ein Rezept von meinem Arzt.",
    "timestamp": "2026-03-11T09:30:00.000Z"
  },
  {
    "role": "user",
    "text": "Guten Tag! Zeigen Sie mir doch mal das Rezept.",
    "timestamp": "2026-03-11T09:30:05.000Z"
  },
  {
    "role": "prescription",
    "text": "",
    "timestamp": "2026-03-11T09:30:06.000Z"
  }
]
```

| role | Bedeutung |
|------|-----------|
| `ai` | KI-Kunde (ElevenLabs Agent) |
| `user` | Apotheker/PTA (der echte Nutzer) |
| `prescription` | Marker: Rezeptkarte wurde im UI angezeigt (kein Text) |

---

## Indizes

| Index | Spalte | Zweck |
|-------|--------|-------|
| `idx_consultation_sessions_user_id` | `user_id` | Sessions pro Nutzer abfragen |
| `idx_consultation_sessions_scenario_id` | `scenario_id` | Sessions pro Szenario filtern |
| `idx_consultation_sessions_created_at` | `created_at DESC` | Neueste Sessions zuerst |

---

## RLS Policies

Row Level Security ist aktiv. Nutzer koennen nur ihre eigenen Sessions lesen, erstellen und aktualisieren.

**Fuer Admin-Panel:** RLS muss umgangen werden. Optionen:
1. **Service Role Key** verwenden (umgeht RLS automatisch)
2. **Eigene Admin-Policy** hinzufuegen, z.B.:

```sql
-- Admin-Rolle kann alle Sessions lesen
CREATE POLICY "Admins can view all consultation sessions"
  ON consultation_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
```

3. **Database Function** mit `SECURITY DEFINER`:

```sql
CREATE OR REPLACE FUNCTION get_all_consultation_sessions()
RETURNS SETOF consultation_sessions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM consultation_sessions ORDER BY created_at DESC;
$$;
```

---

## Beispiel-Queries fuer Admin-Panel

### Alle Sessions (neueste zuerst)

```sql
SELECT
  id, user_id, scenario_title, percentage, score, max_score,
  phases_completed, phases_total,
  products_recommended, products_total,
  duration_seconds, created_at
FROM consultation_sessions
ORDER BY created_at DESC;
```

### Durchschnittlicher Score pro Szenario

```sql
SELECT
  scenario_id,
  scenario_title,
  COUNT(*) AS total_sessions,
  ROUND(AVG(percentage)) AS avg_percentage,
  ROUND(AVG(score)) AS avg_score,
  ROUND(AVG(duration_seconds)) AS avg_duration_sec
FROM consultation_sessions
GROUP BY scenario_id, scenario_title
ORDER BY total_sessions DESC;
```

### Meistverpasste Phasen (ueber alle Sessions)

```sql
SELECT
  phase,
  COUNT(*) AS times_missed
FROM consultation_sessions, unnest(missed_phases) AS phase
GROUP BY phase
ORDER BY times_missed DESC;
```

### Meistverpasste Produkte (ueber alle Sessions)

```sql
SELECT
  product,
  COUNT(*) AS times_missed
FROM consultation_sessions, unnest(missed_products) AS product
GROUP BY product
ORDER BY times_missed DESC;
```

### Fortschritt eines Nutzers ueber Zeit

```sql
SELECT
  scenario_title,
  percentage,
  phases_completed || '/' || phases_total AS phases,
  products_recommended || '/' || products_total AS products,
  duration_seconds,
  created_at
FROM consultation_sessions
WHERE user_id = '<USER_UUID>'
ORDER BY created_at DESC;
```

### Top-Performer pro Szenario

```sql
SELECT DISTINCT ON (scenario_id)
  scenario_id,
  scenario_title,
  user_id,
  percentage,
  score,
  created_at
FROM consultation_sessions
ORDER BY scenario_id, percentage DESC, created_at;
```

### Sessions mit Transkript durchsuchen

```sql
SELECT id, scenario_title, percentage, created_at
FROM consultation_sessions
WHERE transcript::text ILIKE '%magnesium%';
```

---

## Supabase JS Client Beispiele (Admin-Panel)

### Alle Sessions laden

```typescript
// Mit Service Role Key (umgeht RLS)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NICHT den anon key!
)

const { data: sessions } = await supabase
  .from('consultation_sessions')
  .select('*')
  .order('created_at', { ascending: false })
```

### Sessions pro Szenario aggregieren

```typescript
const { data: sessions } = await supabase
  .from('consultation_sessions')
  .select('scenario_id, scenario_title, percentage, score, max_score, duration_seconds')

// Client-seitig aggregieren
const byScenario = sessions.reduce((acc, s) => {
  if (!acc[s.scenario_id]) {
    acc[s.scenario_id] = {
      title: s.scenario_title,
      sessions: [],
      totalPercentage: 0,
    }
  }
  acc[s.scenario_id].sessions.push(s)
  acc[s.scenario_id].totalPercentage += s.percentage
  return acc
}, {} as Record<string, any>)

// Durchschnitt berechnen
Object.values(byScenario).forEach((s: any) => {
  s.avgPercentage = Math.round(s.totalPercentage / s.sessions.length)
})
```

### Einzelne Session mit Transkript laden

```typescript
const { data: session } = await supabase
  .from('consultation_sessions')
  .select('*')
  .eq('id', sessionId)
  .single()

// Transkript iterieren
session.transcript.forEach((msg: { role: string; text: string; timestamp: string }) => {
  if (msg.role === 'prescription') return  // UI-Marker, kein Text
  console.log(`[${msg.role}] ${msg.text}`)
})
```
