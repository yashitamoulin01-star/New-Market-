-- migration-003-elections.sql
-- Run in Supabase SQL Editor. Full election CMS tables.

CREATE TYPE election_phase AS ENUM (
  'DRAFT',
  'NOMINATIONS_OPEN',
  'VOTING_OPEN',
  'CLOSED',
  'RESULTS_PUBLISHED'
);

CREATE TABLE IF NOT EXISTS elections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             varchar(200) NOT NULL,
  title_hi          varchar(200),
  description       text,
  organization      varchar(200) NOT NULL DEFAULT 'New Market Vyapari Mahasangh',
  phase             election_phase NOT NULL DEFAULT 'DRAFT',
  nomination_starts timestamptz,
  nomination_ends   timestamptz,
  voting_starts     timestamptz,
  voting_ends       timestamptz,
  results_at        timestamptz,
  announcement      text,
  announcement_hi   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_positions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  title       varchar(150) NOT NULL,
  title_hi    varchar(150),
  seats       integer NOT NULL DEFAULT 1,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS election_candidates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id uuid REFERENCES election_positions(id) ON DELETE SET NULL,
  name        varchar(150) NOT NULL,
  name_hi     varchar(150),
  photo_url   text,
  bio         text,
  bio_hi      text,
  vote_count  integer NOT NULL DEFAULT 0,
  is_winner   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_votes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id      uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id     uuid NOT NULL REFERENCES election_candidates(id) ON DELETE CASCADE,
  voter_phone_hash text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_vote_per_election UNIQUE (election_id, voter_phone_hash)
);

CREATE INDEX IF NOT EXISTS idx_elections_phase        ON elections(phase);
CREATE INDEX IF NOT EXISTS idx_positions_election     ON election_positions(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_election    ON election_candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election         ON election_votes(election_id);

-- Row Level Security
ALTER TABLE elections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_positions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_votes      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elections_public_read"    ON elections           FOR SELECT TO anon USING (phase != 'DRAFT');
CREATE POLICY "positions_public_read"    ON election_positions  FOR SELECT TO anon USING (true);
CREATE POLICY "candidates_public_read"   ON election_candidates FOR SELECT TO anon USING (true);
CREATE POLICY "elections_admin_all"      ON elections           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "positions_admin_all"      ON election_positions  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "candidates_admin_all"     ON election_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "votes_admin_all"          ON election_votes      FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON elections, election_positions, election_candidates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON elections, election_positions, election_candidates, election_votes TO authenticated;
