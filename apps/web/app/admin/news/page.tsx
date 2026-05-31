import Link from "next/link"
import type { Metadata } from "next"
import { SafeImage } from "@/components/ui/safe-image"
import {
  Clock, CheckCircle, XCircle, Eye, Inbox, ShieldOff,
  Zap, Pin, Flame, Star, ChevronDown, ChevronUp,
  Mail, Phone, User, Pencil, Radio,
} from "lucide-react"
import { adminListNews, type ContentStatus } from "@/lib/supabase/news"
import {
  approveNewsAction, rejectNewsAction, deleteNewsAction,
  toggleNewsFlagAction, setHomepageSlotAction, setPriorityRankAction,
  schedulePublishAction, editNewsAction, moveToEditorialAction,
  restoreToPendingAction, saveEditorialNotesAction,
} from "./actions"
import { EditNewsPanel } from "./edit-panel"

export const metadata: Metadata = { title: "Newsroom — News Queue" }

type Tab = "PENDING" | "EDITORIAL" | "LIVE" | "REJECTED"

const TABS: { label: string; value: Tab; color: string }[] = [
  { label: "Pending",   value: "PENDING",   color: "text-amber-600" },
  { label: "Editorial", value: "EDITORIAL", color: "text-violet-600" },
  { label: "Live",      value: "LIVE",      color: "text-emerald-600" },
  { label: "Rejected",  value: "REJECTED",  color: "text-red-600" },
]

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:   "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  EVENTS:    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  NOTICES:   "bg-red-500/15 text-red-700 dark:text-red-300",
  BUSINESS:  "bg-primary/10 text-primary",
  COMMUNITY: "bg-green-500/15 text-green-700 dark:text-green-300",
  SAFETY:    "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  TRAFFIC:   "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function FlagButton({
  id, field, active, label, icon: Icon, activeColor,
}: {
  id: string
  field: "is_featured" | "is_breaking" | "is_pinned" | "is_trending"
  active: boolean
  label: string
  icon: React.ElementType
  activeColor: string
}) {
  return (
    <form action={toggleNewsFlagAction.bind(null, id, field, !active)}>
      <button
        type="submit"
        title={active ? `Remove ${label}` : `Mark as ${label}`}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
          active
            ? `${activeColor} border border-current/20`
            : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
        }`}
      >
        <Icon size={10} className={active ? "" : "opacity-50"} />
        {label}
      </button>
    </form>
  )
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const { tab, page } = await searchParams
  const activeTab = (tab as Tab) || "PENDING"
  const currentPage = Math.max(1, Number(page) || 1)

  // Map UI tab to DB status
  const dbStatus: ContentStatus | undefined =
    activeTab === "LIVE" ? "APPROVED" :
    activeTab === "PENDING" ? "PENDING" :
    activeTab === "EDITORIAL" ? "EDITORIAL" :
    activeTab === "REJECTED" ? "REJECTED" : undefined

  const { items, total, totalPages } = await adminListNews({
    status: dbStatus,
    page: currentPage,
  })

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">News Queue</h1>
        <p className="text-sm text-muted-foreground">
          {total} article{total !== 1 ? "s" : ""} · {activeTab === "PENDING" ? "Review new submissions" : activeTab === "EDITORIAL" ? "Edit before publishing" : activeTab === "LIVE" ? "Live on site" : "Rejected submissions"}
        </p>
      </div>

      {/* Stage tabs */}
      <div className="mb-5 flex gap-0 overflow-x-auto border-b scrollbar-none">
        {TABS.map((t) => {
          const active = activeTab === t.value
          return (
            <Link
              key={t.value}
              href={`/admin/news?tab=${t.value}`}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? `border-b-2 border-primary ${t.color}`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {/* Stage-specific instructions */}
      {activeTab === "PENDING" && (
        <div className="mb-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
          <strong>Pending Review:</strong> Read the full submission, verify the content and poster details, then move to Editorial for editing or Reject directly.
        </div>
      )}
      {activeTab === "EDITORIAL" && (
        <div className="mb-4 rounded-lg border-l-4 border-violet-400 bg-violet-50 dark:bg-violet-950/30 px-4 py-2.5 text-xs text-violet-800 dark:text-violet-300">
          <strong>Editorial Desk:</strong> Edit the article (title, excerpt, content, image), set flags and homepage slot, then Approve to publish live.
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Inbox size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Queue is clear</p>
          <p className="text-sm text-muted-foreground/60">No articles in this stage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((article) => {
            const catColor = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.GENERAL

            // ── PENDING card ──────────────────────────────────────────
            if (activeTab === "PENDING") {
              return (
                <div key={article.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 border-b">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          <Clock size={9} /> PENDING
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                          {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <h2 className="font-heading text-base font-bold leading-snug" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {article.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={9} /> Submitted {formatDate(article.created_at)}
                      </p>
                    </div>
                    <form action={deleteNewsAction.bind(null, article.id)}>
                      <button type="submit" className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50 transition">
                        Delete
                      </button>
                    </form>
                  </div>

                  {/* Cover image */}
                  {article.cover_image_url && (
                    <div className="relative h-52 w-full border-b overflow-hidden">
                      <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover" />
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                        Cover Image
                      </div>
                    </div>
                  )}

                  {/* Full content */}
                  <div className="px-4 py-4 space-y-3 border-b">
                    {article.excerpt && (
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Excerpt / Summary</p>
                        <p className="text-sm italic text-foreground/80" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{article.excerpt}</p>
                      </div>
                    )}
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Full Content</p>
                      <div className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap max-h-64 overflow-y-auto" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {article.content}
                      </div>
                    </div>
                  </div>

                  {/* Poster info */}
                  <div className="px-4 py-3 border-b bg-muted/10">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Submitted By</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {article.is_anonymous ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                          <ShieldOff size={11} /> Posted anonymously
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 text-foreground/80">
                            <User size={13} className="text-primary shrink-0" />
                            <span className="font-medium">{article.submitter_name}</span>
                          </span>
                          <a href={`mailto:${article.submitter_email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition">
                            <Mail size={13} className="text-primary shrink-0" />
                            {article.submitter_email}
                          </a>
                          {article.submitter_phone && (
                            <a href={`tel:${article.submitter_phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition">
                              <Phone size={13} className="text-primary shrink-0" />
                              {article.submitter_phone}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 bg-muted/5 px-4 py-3">
                    <form action={moveToEditorialAction.bind(null, article.id)}>
                      <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition">
                        <Pencil size={11} className="inline mr-1" />
                        Move to Editorial
                      </button>
                    </form>

                    <form action={approveNewsAction.bind(null, article.id)}>
                      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                        <CheckCircle size={11} className="inline mr-1" />
                        Approve Directly
                      </button>
                    </form>

                    <form action={rejectNewsAction.bind(null, article.id)} className="flex items-center gap-1.5 ml-auto">
                      <input
                        name="note"
                        type="text"
                        placeholder="Rejection reason (optional)"
                        className="w-40 rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 sm:w-52"
                      />
                      <button type="submit" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              )
            }

            // ── EDITORIAL card ────────────────────────────────────────
            if (activeTab === "EDITORIAL") {
              return (
                <div key={article.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-start justify-between gap-3 bg-violet-50/60 dark:bg-violet-950/20 px-4 py-3 border-b">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                          <Pencil size={9} /> EDITORIAL
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                          {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                        </span>
                        {article.is_featured  && <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">⭐ Featured</span>}
                        {article.is_breaking  && <span className="breaking-badge rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">⚡ Breaking</span>}
                        {article.is_pinned    && <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-400">📌 Pinned</span>}
                        {article.is_trending  && <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 dark:text-orange-400">🔥 Trending</span>}
                      </div>
                      <h2 className="font-heading text-sm font-bold leading-snug" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {article.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
                        <span className="flex items-center gap-0.5"><User size={9} /> {article.is_anonymous ? "Anonymous" : article.submitter_name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Clock size={9} />{formatDate(article.created_at)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Eye size={9} />{article.view_count.toLocaleString()} views</span>
                      </p>
                    </div>
                  </div>

                  {/* Edit panel — always open in editorial */}
                  <div className="px-4 py-4 border-b">
                    <EditNewsPanel article={article} editAction={editNewsAction} defaultOpen />
                  </div>

                  {/* Flag controls */}
                  <details className="border-b group">
                    <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                      <span>Editorial Flags & Placement</span>
                      <ChevronDown size={13} className="group-open:hidden" />
                      <ChevronUp   size={13} className="hidden group-open:block" />
                    </summary>
                    <div className="space-y-3 p-4">
                      <div className="flex flex-wrap gap-2">
                        <FlagButton id={article.id} field="is_featured" active={article.is_featured}
                          label="Featured" icon={Star} activeColor="bg-amber-500/15 text-amber-700 dark:text-amber-400" />
                        <FlagButton id={article.id} field="is_breaking" active={article.is_breaking}
                          label="Breaking" icon={Zap} activeColor="bg-red-500 text-white" />
                        <FlagButton id={article.id} field="is_pinned" active={article.is_pinned}
                          label="Pinned" icon={Pin} activeColor="bg-blue-500/15 text-blue-700 dark:text-blue-400" />
                        <FlagButton id={article.id} field="is_trending" active={article.is_trending}
                          label="Trending" icon={Flame} activeColor="bg-orange-500/15 text-orange-700 dark:text-orange-400" />
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                        <form action={setHomepageSlotAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Slot</label>
                          <div className="relative">
                            <select
                              name="slot"
                              defaultValue={article.homepage_slot ?? ""}
                              className="appearance-none rounded-lg border bg-background py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-primary"
                            >
                              <option value="">— No placement —</option>
                              <option value="headline">Main Top Story (Hero)</option>
                              <option value="featured">Top Side Stories (Grid)</option>
                              <option value="sidebar">Recent News Sidebar</option>
                              <option value="ticker">Breaking Ticker</option>
                            </select>
                            <ChevronDown size={10} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                        </form>

                        <form action={setPriorityRankAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Rank</label>
                          <input
                            name="rank" type="number"
                            defaultValue={article.priority_rank}
                            min={1} max={999}
                            className="w-16 rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary"
                          />
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                        </form>

                        <form action={schedulePublishAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Schedule</label>
                          <input
                            name="datetime" type="datetime-local"
                            defaultValue={article.scheduled_publish_at?.slice(0, 16) ?? ""}
                            className="rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary"
                          />
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                        </form>
                      </div>
                    </div>
                  </details>

                  {/* Approve / Reject */}
                  <div className="flex flex-wrap items-center gap-2 bg-muted/5 px-4 py-3">
                    <form action={approveNewsAction.bind(null, article.id)}>
                      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                        <CheckCircle size={11} className="inline mr-1" />
                        Approve → Go Live
                      </button>
                    </form>

                    <form action={rejectNewsAction.bind(null, article.id)} className="flex items-center gap-1.5">
                      <input
                        name="note" type="text"
                        placeholder="Rejection reason"
                        className="w-40 rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary sm:w-52"
                      />
                      <button type="submit" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition">
                        Reject
                      </button>
                    </form>

                    <form action={deleteNewsAction.bind(null, article.id)} className="ml-auto">
                      <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              )
            }

            // ── LIVE card ─────────────────────────────────────────────
            if (activeTab === "LIVE") {
              return (
                <div key={article.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <Radio size={9} /> LIVE
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                          {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                        </span>
                        {article.is_featured  && <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">⭐</span>}
                        {article.is_breaking  && <span className="breaking-badge rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">⚡</span>}
                        {article.is_pinned    && <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-400">📌</span>}
                        {article.is_trending  && <span className="rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 dark:text-orange-400">🔥</span>}
                        {article.homepage_slot && (
                          <span className="rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:text-violet-400">
                            🏠 {article.homepage_slot}
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading text-sm font-bold leading-snug text-foreground line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
                        <span>{article.submitter_name}</span>
                        <span>·</span>
                        <span>{formatDate(article.created_at)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Eye size={9} />{article.view_count.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {(article.excerpt || article.content) && (
                    <div className="border-t bg-muted/20 px-4 py-2">
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {article.excerpt ?? article.content.slice(0, 180) + (article.content.length > 180 ? "…" : "")}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 border-t bg-muted/10 px-4 py-2.5">
                    <Link
                      href={`/news/${article.slug}`}
                      target="_blank"
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                    >
                      View Live ↗
                    </Link>

                    <div className="flex flex-wrap gap-1.5">
                      <FlagButton id={article.id} field="is_featured" active={article.is_featured}
                        label="Featured" icon={Star} activeColor="bg-amber-500/15 text-amber-700 dark:text-amber-400" />
                      <FlagButton id={article.id} field="is_breaking" active={article.is_breaking}
                        label="Breaking" icon={Zap} activeColor="bg-red-500 text-white" />
                      <FlagButton id={article.id} field="is_pinned" active={article.is_pinned}
                        label="Pinned" icon={Pin} activeColor="bg-blue-500/15 text-blue-700 dark:text-blue-400" />
                      <FlagButton id={article.id} field="is_trending" active={article.is_trending}
                        label="Trending" icon={Flame} activeColor="bg-orange-500/15 text-orange-700 dark:text-orange-400" />
                    </div>

                    <form action={deleteNewsAction.bind(null, article.id)} className="ml-auto">
                      <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                        Remove
                      </button>
                    </form>
                  </div>

                  <details className="border-t group">
                    <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                      <span>Edit / Placement</span>
                      <ChevronDown size={13} className="group-open:hidden" />
                      <ChevronUp   size={13} className="hidden group-open:block" />
                    </summary>
                    <div className="space-y-3 p-4">
                      <EditNewsPanel article={article} editAction={editNewsAction} />

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end border-t pt-3">
                        <form action={setHomepageSlotAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Slot</label>
                          <div className="relative">
                            <select name="slot" defaultValue={article.homepage_slot ?? ""}
                              className="appearance-none rounded-lg border bg-background py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-primary">
                              <option value="">None</option>
                              <option value="headline">Headline</option>
                              <option value="ticker">Ticker</option>
                              <option value="sidebar">Sidebar</option>
                              <option value="featured">Featured</option>
                            </select>
                            <ChevronDown size={10} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80">Set</button>
                        </form>
                        <form action={setPriorityRankAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Rank</label>
                          <input name="rank" type="number" defaultValue={article.priority_rank} min={1} max={999}
                            className="w-16 rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary" />
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80">Set</button>
                        </form>
                      </div>
                    </div>
                  </details>
                </div>
              )
            }

            // ── REJECTED card ─────────────────────────────────────────
            return (
              <div key={article.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle size={9} /> REJECTED
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                        {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <h2 className="font-heading text-sm font-bold leading-snug text-foreground line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {article.submitter_name} · {formatDate(article.created_at)}
                    </p>
                  </div>
                </div>

                {article.rejection_note && (
                  <div className="border-t flex items-start gap-2 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-xs text-red-700 dark:text-red-300">
                    <XCircle size={12} className="mt-0.5 shrink-0" />
                    <span style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>{article.rejection_note}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t bg-muted/5 px-4 py-3">
                  <form action={restoreToPendingAction.bind(null, article.id)}>
                    <button type="submit" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">
                      ↩ Restore to Pending
                    </button>
                  </form>
                  <form action={deleteNewsAction.bind(null, article.id)} className="ml-auto">
                    <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
                      Delete Permanently
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/admin/news?tab=${activeTab}&page=${currentPage - 1}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/news?tab=${activeTab}&page=${currentPage + 1}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
