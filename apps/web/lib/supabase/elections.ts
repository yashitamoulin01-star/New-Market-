import { createClient } from "./server"
export * from "./elections-defs"
import type { Election, ElectionWithDetails, ElectionPhase } from "./elections-defs"
import { NEXT_PHASE } from "./elections-defs"

async function fetchWithDetails(election: Election): Promise<ElectionWithDetails> {
  const supabase = await createClient()
  const [posResult, canResult] = await Promise.all([
    supabase
      .from("election_positions")
      .select("*")
      .eq("election_id", election.id)
      .order("sort_order"),
    supabase
      .from("election_candidates")
      .select("*")
      .eq("election_id", election.id)
      .order("vote_count", { ascending: false }),
  ])
  return {
    ...election,
    positions: posResult.data ?? [],
    candidates: canResult.data ?? [],
  } as ElectionWithDetails
}

// ── Public ────────────────────────────────────────────────────────

export async function getActiveElection(): Promise<ElectionWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .neq("phase", "DRAFT")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return fetchWithDetails(data as Election)
}

// ── Admin ─────────────────────────────────────────────────────────

export async function adminListElections(): Promise<Election[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Election[]
}

export async function adminGetElection(id: string): Promise<ElectionWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return fetchWithDetails(data as Election)
}

export async function adminCreateElection(input: {
  title: string
  title_hi?: string
  description?: string
  organization?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("elections")
    .insert({ organization: "New Market Vyapari Mahasangh", ...input })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function adminUpdateElection(
  id: string,
  patch: Partial<Omit<Election, "id" | "created_at" | "updated_at">>
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("elections")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function adminAdvancePhase(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("elections")
    .select("phase")
    .eq("id", id)
    .single()

  if (!data) return
  const next = NEXT_PHASE[data.phase as ElectionPhase]
  if (!next) return

  await supabase
    .from("elections")
    .update({ phase: next, updated_at: new Date().toISOString() })
    .eq("id", id)
}

export async function adminAddPosition(input: {
  election_id: string
  title: string
  title_hi?: string
  seats?: number
  sort_order?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("election_positions")
    .insert({ seats: 1, sort_order: 0, ...input })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function adminDeletePosition(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("election_positions").delete().eq("id", id)
  if (error) throw error
}

export async function adminAddCandidate(input: {
  election_id: string
  position_id?: string
  name: string
  name_hi?: string
  photo_url?: string
  bio?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("election_candidates")
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function adminDeleteCandidate(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("election_candidates").delete().eq("id", id)
  if (error) throw error
}

export async function adminToggleWinner(candidateId: string, isWinner: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("election_candidates")
    .update({ is_winner: isWinner })
    .eq("id", candidateId)

  if (error) throw error
}

export async function adminDeleteElection(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("elections").delete().eq("id", id)
  if (error) throw error
}
