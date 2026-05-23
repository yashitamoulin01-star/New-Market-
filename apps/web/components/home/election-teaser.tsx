"use client"

import Link from "next/link"
import { Vote, Users, Calendar, ChevronRight, Trophy, Megaphone } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import type { ElectionWithDetails } from "@/lib/supabase/elections-defs"
import { PHASE_LABELS } from "@/lib/supabase/elections-defs"
import type { ElectionPhase } from "@/lib/supabase/elections-defs"

const DEFAULT_POSTS = [
  { hi: "अध्यक्ष",           en: "President" },
  { hi: "उपाध्यक्ष",         en: "Vice President" },
  { hi: "सचिव",              en: "Secretary" },
  { hi: "कोषाध्यक्ष",        en: "Treasurer" },
  { hi: "कार्यकारिणी सदस्य", en: "Executive Member" },
]

interface Props {
  election?: ElectionWithDetails | null
}

export function ElectionTeaser({ election }: Props) {
  const { lang } = useLanguage()
  const hi = lang === "hi"

  // ── Live election ──────────────────────────────────────────────
  if (election) {
    const phase = PHASE_LABELS[election.phase as ElectionPhase]
    const announcement = hi ? (election.announcement_hi ?? election.announcement) : election.announcement
    const title = hi ? (election.title_hi ?? election.title) : election.title

    const positions = election.positions.length > 0
      ? election.positions.map((p) => ({ en: p.title, hi: p.title_hi ?? p.title }))
      : DEFAULT_POSTS.slice(0, 5)

    return (
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between bg-primary px-4 py-3">
          <div className="flex items-center gap-2">
            <Vote size={15} className="text-primary-foreground/80" />
            <h3 className="text-sm font-bold text-primary-foreground line-clamp-1">{title}</h3>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${phase.color}`}>
            {hi ? phase.hi : phase.en}
          </span>
        </div>

        <div className="p-4">
          <p className="mb-3 text-[11px] text-muted-foreground">
            {election.organization}
          </p>

          {announcement && (
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <Megaphone size={11} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">{announcement}</p>
            </div>
          )}

          <div className="mb-4 space-y-1.5">
            {positions.slice(0, 5).map((post) => (
              <div key={post.en} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <Trophy size={11} className="shrink-0 text-amber-500" />
                <span className="text-xs font-medium">{hi ? post.hi : post.en}</span>
              </div>
            ))}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border bg-background px-3 py-2 text-center">
              <Users size={13} className="mx-auto mb-1 text-primary" />
              <p className="text-[11px] text-muted-foreground">
                {election.candidates.length} {hi ? "उम्मीदवार" : "Candidates"}
              </p>
            </div>
            <div className="rounded-lg border bg-background px-3 py-2 text-center">
              <Calendar size={13} className="mx-auto mb-1 text-primary" />
              <p className="text-[11px] text-muted-foreground">
                {election.voting_starts
                  ? new Date(election.voting_starts).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                  : (hi ? "तिथि शीघ्र" : "Date TBA")}
              </p>
            </div>
          </div>

          <Link
            href="/election"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            {hi ? "चुनाव हब देखें" : "View Election Hub"}
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    )
  }

  // ── Static fallback (no active election) ──────────────────────
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between bg-primary px-4 py-3">
        <div className="flex items-center gap-2">
          <Vote size={15} className="text-primary-foreground/80" />
          <h3 className="text-sm font-bold text-primary-foreground">
            {hi ? "व्यापारी महासंघ चुनाव" : "Vyapari Mahasangh Election"}
          </h3>
        </div>
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
          {hi ? "जल्द आ रहा है" : "Coming Soon"}
        </span>
      </div>

      <div className="p-4">
        <p className="mb-4 text-[11px] text-muted-foreground">
          {hi
            ? "नई मार्केट व्यापारी महासंघ, भोपाल — वार्षिक पदाधिकारी चुनाव"
            : "New Market Vyapari Mahasangh, Bhopal — Annual Officer Elections"}
        </p>

        <div className="mb-4 space-y-1.5">
          {DEFAULT_POSTS.map((post) => (
            <div key={post.en} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Trophy size={11} className="shrink-0 text-amber-500" />
              <span className="text-xs font-medium">{hi ? post.hi : post.en}</span>
            </div>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-background px-3 py-2 text-center">
            <Users size={13} className="mx-auto mb-1 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              {hi ? "OTP आधारित मतदान" : "OTP Voting"}
            </p>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2 text-center">
            <Calendar size={13} className="mx-auto mb-1 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              {hi ? "तिथि शीघ्र" : "Date TBA"}
            </p>
          </div>
        </div>

        <Link
          href="/election"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          {hi ? "चुनाव हब देखें" : "View Election Hub"}
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}
