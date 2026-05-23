// Client-safe types and labels for elections. No server imports.

export type ElectionPhase =
  | "DRAFT"
  | "NOMINATIONS_OPEN"
  | "VOTING_OPEN"
  | "CLOSED"
  | "RESULTS_PUBLISHED"

export interface Election {
  id: string
  title: string
  title_hi: string | null
  description: string | null
  organization: string
  phase: ElectionPhase
  nomination_starts: string | null
  nomination_ends: string | null
  voting_starts: string | null
  voting_ends: string | null
  results_at: string | null
  announcement: string | null
  announcement_hi: string | null
  created_at: string
  updated_at: string
}

export interface ElectionPosition {
  id: string
  election_id: string
  title: string
  title_hi: string | null
  seats: number
  sort_order: number
}

export interface ElectionCandidate {
  id: string
  election_id: string
  position_id: string | null
  name: string
  name_hi: string | null
  photo_url: string | null
  bio: string | null
  bio_hi: string | null
  vote_count: number
  is_winner: boolean
  created_at: string
}

export interface ElectionWithDetails extends Election {
  positions: ElectionPosition[]
  candidates: ElectionCandidate[]
}

export const PHASE_LABELS: Record<ElectionPhase, { en: string; hi: string; color: string }> = {
  DRAFT:             { en: "Draft",            hi: "ड्राफ्ट",       color: "bg-slate-100 text-slate-700" },
  NOMINATIONS_OPEN:  { en: "Nominations Open", hi: "नामांकन खुला",  color: "bg-blue-100 text-blue-800" },
  VOTING_OPEN:       { en: "Voting Open",       hi: "मतदान खुला",   color: "bg-green-100 text-green-800" },
  CLOSED:            { en: "Closed",            hi: "बंद",           color: "bg-orange-100 text-orange-800" },
  RESULTS_PUBLISHED: { en: "Results Published", hi: "परिणाम घोषित", color: "bg-primary/10 text-primary" },
}

export const NEXT_PHASE: Record<ElectionPhase, ElectionPhase | null> = {
  DRAFT:             "NOMINATIONS_OPEN",
  NOMINATIONS_OPEN:  "VOTING_OPEN",
  VOTING_OPEN:       "CLOSED",
  CLOSED:            "RESULTS_PUBLISHED",
  RESULTS_PUBLISHED: null,
}
