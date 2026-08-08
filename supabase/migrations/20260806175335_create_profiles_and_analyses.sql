/*
# Create profiles and analyses tables for TruthLens AI

## Overview
Adds two tables to support the TruthLens AI deepfake-detection app: a user
profile table (for per-user settings like theme preference and full name) and
an analyses table (one row per video the user submits for deepfake detection).

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — one row per user
  - `full_name` (text) — display name shown in the UI
  - `avatar_url` (text) — optional profile picture URL
  - `theme` (text, default 'dark') — 'dark' or 'light' preference
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `analyses`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid()) — owner of the analysis
  - `file_name` (text) — original uploaded video file name
  - `file_size` (bigint) — file size in bytes
  - `file_type` (text) — mime type / container format
  - `prediction` (text) — 'REAL' or 'FAKE'
  - `confidence` (numeric) — confidence score 0–100
  - `risk_level` (text) — 'Low', 'Medium', or 'High'
  - `face_consistency` (numeric) — 0–100
  - `lip_sync` (numeric) — 0–100
  - `visual_artifact` (numeric) — 0–100
  - `temporal_consistency` (numeric) — 0–100
  - `explanation` (text) — AI-generated reason text
  - `summary` (text) — AI-generated summary
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- profiles: owner-scoped CRUD (authenticated users manage only their own row).
- analyses: owner-scoped CRUD (authenticated users manage only their own rows).
- user_id on analyses defaults to auth.uid() so inserts that omit it succeed.

3. Notes
- No destructive operations; tables use IF NOT EXISTS.
- Policies are dropped before creation to remain idempotent.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  theme text NOT NULL DEFAULT 'dark',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text,
  prediction text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'Low',
  face_consistency numeric NOT NULL DEFAULT 0,
  lip_sync numeric NOT NULL DEFAULT 0,
  visual_artifact numeric NOT NULL DEFAULT 0,
  temporal_consistency numeric NOT NULL DEFAULT 0,
  explanation text,
  summary text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analyses_user_id_created_at_idx
  ON analyses (user_id, created_at DESC);
