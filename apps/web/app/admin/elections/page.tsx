import type { Metadata } from "next"
import { Vote, Plus, ChevronRight, Trophy, Trash2, Users } from "lucide-react"
import { adminListElections, adminGetElection } from "@/lib/supabase/elections"
import { PHASE_LABELS, NEXT_PHASE } from "@/lib/supabase/elections-defs"
import type { ElectionPhase } from "@/lib/supabase/elections-defs"
import {
  createElectionAction, advancePhaseAction, updateAnnouncementAction,
  addPositionAction, deletePositionAction,
  addCandidateAction, deleteCandidateAction, toggleWinnerAction,
  deleteElectionAction,
} from "./actions"

export const metadata: Metadata = { title: "Newsroom — Elections" }

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminElectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id: selectedId } = await searchParams
  const elections = await adminListElections()
  const selected  = selectedId ? await adminGetElection(selectedId) : null

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Election CMS</h1>
        <p className="text-sm text-muted-foreground">
          Create elections, manage candidates, control phases, publish results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left panel: election list + create ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Create election */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
              <Plus size={13} className="text-primary" /> New Election
            </h2>
            <form action={createElectionAction} className="space-y-2">
              <input
                name="title"
                required
                placeholder="Election title (English)"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                name="title_hi"
                placeholder="Election title (Hindi)"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                name="organization"
                defaultValue="New Market Vyapari Mahasangh"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <textarea
                name="description"
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
              >
                Create Draft
              </button>
            </form>
          </div>

          {/* Election list */}
          {elections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No elections yet.</p>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <ul className="divide-y">
                {elections.map((el) => {
                  const phase = PHASE_LABELS[el.phase as ElectionPhase]
                  const isSelected = el.id === selectedId
                  return (
                    <li key={el.id}>
                      <a
                        href={`/admin/elections?id=${el.id}`}
                        className={`flex items-start gap-3 px-4 py-3 transition hover:bg-muted/30 ${isSelected ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                      >
                        <Vote size={14} className="mt-0.5 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold">{el.title}</p>
                          <p className="text-xs text-muted-foreground">{el.organization}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${phase.color}`}>
                          {phase.en}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right panel: election detail ── */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
              <Vote size={32} className="mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Select an election to manage it</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Phase card */}
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-xl font-bold">{selected.title}</h2>
                    {selected.title_hi && <p className="text-sm text-muted-foreground">{selected.title_hi}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{selected.organization}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${PHASE_LABELS[selected.phase as ElectionPhase].color}`}>
                    {PHASE_LABELS[selected.phase as ElectionPhase].en}
                  </span>
                </div>

                {selected.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {NEXT_PHASE[selected.phase as ElectionPhase] && (
                    <form action={advancePhaseAction.bind(null, selected.id)}>
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
                      >
                        Advance to {PHASE_LABELS[NEXT_PHASE[selected.phase as ElectionPhase]!].en}
                        <ChevronRight size={14} />
                      </button>
                    </form>
                  )}
                  <form action={deleteElectionAction.bind(null, selected.id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={12} /> Delete Election
                    </button>
                  </form>
                </div>
              </div>

              {/* Announcement */}
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold">Pinned Announcement</h3>
                <form action={updateAnnouncementAction.bind(null, selected.id)} className="space-y-2">
                  <textarea
                    name="announcement"
                    defaultValue={selected.announcement ?? ""}
                    placeholder="Admin announcement (shown on election page)"
                    rows={2}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  />
                  <textarea
                    name="announcement_hi"
                    defaultValue={selected.announcement_hi ?? ""}
                    placeholder="Announcement in Hindi (optional)"
                    rows={2}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold hover:bg-muted/80 transition"
                  >
                    Save Announcement
                  </button>
                </form>
              </div>

              {/* Positions */}
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold">Positions ({selected.positions.length})</h3>
                <form action={addPositionAction.bind(null, selected.id)} className="mb-3 flex flex-wrap gap-2">
                  <input name="title"    required placeholder="Position title (EN)" className="flex-1 min-w-32 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <input name="title_hi" placeholder="पद का नाम (HI)" className="flex-1 min-w-28 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <input name="seats"    type="number" defaultValue={1} min={1} max={10} className="w-16 rounded-lg border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary" />
                  <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition">Add</button>
                </form>
                {selected.positions.length > 0 && (
                  <ul className="space-y-1">
                    {selected.positions.map((pos) => (
                      <li key={pos.id} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                        <Trophy size={11} className="shrink-0 text-amber-500" />
                        <span className="flex-1 text-sm font-medium">{pos.title}{pos.title_hi ? ` / ${pos.title_hi}` : ""}</span>
                        <span className="text-xs text-muted-foreground">{pos.seats} seat{pos.seats !== 1 ? "s" : ""}</span>
                        <form action={deletePositionAction.bind(null, pos.id)}>
                          <button type="submit" className="rounded p-1 text-red-400 hover:bg-red-50 transition">
                            <Trash2 size={11} />
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Candidates */}
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold">
                  Candidates ({selected.candidates.length})
                </h3>
                <form action={addCandidateAction.bind(null, selected.id)} className="mb-4 grid gap-2 sm:grid-cols-2">
                  <input name="name"     required placeholder="Candidate name" className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <input name="name_hi"  placeholder="उम्मीदवार का नाम" className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <select name="position_id" className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary">
                    <option value="">— Select position —</option>
                    {selected.positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.title}</option>
                    ))}
                  </select>
                  <input name="photo_url" placeholder="Photo URL (optional)" className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary" />
                  <div className="sm:col-span-2 flex justify-end">
                    <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition">
                      Add Candidate
                    </button>
                  </div>
                </form>

                {selected.candidates.length > 0 && (
                  <ul className="divide-y">
                    {selected.candidates.map((c) => {
                      const pos = selected.positions.find((p) => p.id === c.position_id)
                      return (
                        <li key={c.id} className={`flex items-center gap-3 py-2.5 ${c.is_winner ? "bg-amber-50" : ""}`}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground overflow-hidden">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover" />
                            ) : c.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              {c.name}{c.name_hi ? ` / ${c.name_hi}` : ""}
                              {c.is_winner && <span className="ml-1.5 text-amber-500">🏆</span>}
                            </p>
                            {pos && <p className="text-[11px] text-muted-foreground">{pos.title}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Users size={10} /> {c.vote_count}
                            </span>
                            <form action={toggleWinnerAction.bind(null, c.id, !c.is_winner)}>
                              <button
                                type="submit"
                                title={c.is_winner ? "Remove winner" : "Mark as winner"}
                                className={`rounded p-1 text-xs transition ${c.is_winner ? "text-amber-500 hover:bg-amber-50" : "text-muted-foreground hover:bg-muted"}`}
                              >
                                🏆
                              </button>
                            </form>
                            <form action={deleteCandidateAction.bind(null, c.id)}>
                              <button type="submit" className="rounded p-1 text-red-400 hover:bg-red-50 transition">
                                <Trash2 size={11} />
                              </button>
                            </form>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
