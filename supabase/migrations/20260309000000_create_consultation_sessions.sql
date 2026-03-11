-- ============================================================
-- consultation_sessions: Tracks each sales coaching conversation
-- Records which phases were completed, which products recommended,
-- and the overall score per session.
-- ============================================================

CREATE TABLE IF NOT EXISTS consultation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),

  -- Scenario identification
  scenario_id text NOT NULL,                    -- e.g. 'diuretikum', 'fluoridbehandlung'
  scenario_title text,                          -- e.g. 'Diuretikum'
  agent_key text,                               -- e.g. 'pharmacy_diuretikum'

  -- Overall score
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  percentage integer NOT NULL DEFAULT 0,

  -- Phase tracking
  phases_completed integer NOT NULL DEFAULT 0,
  phases_total integer NOT NULL DEFAULT 0,
  completed_phases text[] DEFAULT '{}',         -- array of phase labels that were hit
  missed_phases text[] DEFAULT '{}',            -- array of phase labels that were missed

  -- Product / upsell tracking
  products_recommended integer NOT NULL DEFAULT 0,
  products_total integer NOT NULL DEFAULT 0,
  recommended_products text[] DEFAULT '{}',     -- array of product names that were recommended
  missed_products text[] DEFAULT '{}',          -- array of product names that were NOT recommended

  -- Transcript & analysis
  transcript jsonb,                             -- full conversation transcript
  gemini_analysis jsonb,                        -- AI-generated analysis result

  -- Duration
  duration_seconds integer,                     -- how long the conversation lasted

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_user_id ON consultation_sessions(user_id);
-- Index for querying by scenario
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_scenario_id ON consultation_sessions(scenario_id);
-- Index for recent sessions
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_created_at ON consultation_sessions(created_at DESC);

-- RLS policies
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users can view own consultation sessions"
  ON consultation_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own consultation sessions"
  ON consultation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own consultation sessions"
  ON consultation_sessions FOR UPDATE
  USING (auth.uid() = user_id);
