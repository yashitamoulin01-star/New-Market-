import Link from "next/link"
import type { Metadata } from "next"
import {
  Clock, CheckCircle, XCircle, Eye, Inbox, ShieldOff,
  Zap, Pin, Flame, Star, ChevronDown,
} from "lucide-react"
import { adminListNews, type ContentStatus } from "@/lib/supabase/news"
import {
  approveNewsAction, rejectNewsAction, deleteNewsAction,
  toggleNewsFlagAction, setHomepageSlotAction, setPriorityRankAction,
  schedulePublishAction, editNewsAction,
} from "./actions"
import { EditNewsPanel } from "./edit-panel"

export const metadata: Metadata = { title: "Newsroom — News Queue" }

const TABS: { label: string; value: ContentStatus | "ALL" }[] = [
  { label: "Pending Review", value: "PENDING" },
  { label: "Approved",       value: "APPROVED" },
  { label: "Rejected",       value: "REJECTED" },
  { label: "All",            value: "ALL" },
]

const STATUS_CONFIG: Record<ContentStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING:  { label: "Pending",  icon: Clock,        className: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", icon: CheckCircle,  className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Rejected", icon: XCircle,      className: "bg-red-100 text-red-700" },
}

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL:   "bg-slate-100 text-slate-700",
  EVENTS:    "bg-amber-100 text-amber-800",
  NOTICES:   "bg-red-100 text-red-700",
  BUSINESS:  "bg-primary/10 text-primary",
  COMMUNITY: "bg-green-100 text-green-800",
  SAFETY:    "bg-orange-100 text-orange-800",
  TRAFFIC:   "bg-yellow-100 text-yellow-800",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ── Reusable small flag toggle button ────────────────────────────

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
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const currentStatus = (status as ContentStatus) || "PENDING"
  const currentPage   = Math.max(1, Number(page) || 1)

  const { items, total, totalPages } = await adminListNews({
    status: currentStatus === "ALL" as ContentStatus ? undefined : currentStatus,
    page: currentPage,
  })

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">News Queue</h1>
        <p className="text-sm text-muted-foreground">
          {total} article{total !== 1 ? "s" : ""} · Review and control homepage placement
        </p>
      </div>

      {/* Status tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {TABS.map((tab) => {
          const active = currentStatus === tab.value || (tab.value === "PENDING" && !status)
          const href = tab.value === "ALL"
            ? "/admin/news?status=ALL"
            : `/admin/news?status=${tab.value}`
          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Queue */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Inbox size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Queue is clear</p>
          <p className="text-sm text-muted-foreground/60">No articles in this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((article) => {
            const statusCfg = STATUS_CONFIG[article.status]
            const StatusIcon = statusCfg.icon
            const catColor = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.GENERAL
            const isApproved = article.status === "APPROVED"

            return (
              <div key={article.id} className="rounded-xl border bg-card p-5 shadow-sm">
                {/* Top row */}
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCfg.className}`}>
                        <StatusIcon size={10} />
                        {statusCfg.label}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColor}`}>
                        {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                      </span>
                      {article.is_featured  && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">⭐ Featured</span>}
                      {article.is_breaking  && <span className="breaking-badge rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">⚡ Breaking</span>}
                      {article.is_pinned    && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">📌 Pinned</span>}
                      {article.is_trending  && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">🔥 Trending</span>}
                      {article.homepage_slot && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                          🏠 {article.homepage_slot}
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-base font-bold leading-snug text-foreground">
                      {article.title}
                    </h2>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
                      By <span className="font-medium text-foreground">{article.submitter_name}</span>
                      {article.is_anonymous && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                          <ShieldOff size={9} />
                          Anonymous
                        </span>
                      )}
                      <span>·</span>
                      <span className="font-medium text-foreground/70">{article.submitter_email}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 justify-end">
                      <Clock size={10} />
                      {formatDate(article.created_at)}
                    </div>
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <Eye size={10} />
                      {article.view_count.toLocaleString()} views
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground/60">
                      Rank: {article.priority_rank}
                    </div>
                  </div>
                </div>

                {/* Excerpt or content preview */}
                {(article.excerpt || article.content) && (
                  <p className="mb-3 line-clamp-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {article.excerpt ?? article.content.slice(0, 200) + (article.content.length > 200 ? "…" : "")}
                  </p>
                )}

                {/* Rejection note */}
                {article.rejection_note && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <XCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{article.rejection_note}</span>
                  </div>
                )}

                {/* ── Moderation actions ─────────────────────── */}
                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  {article.status === "APPROVED" && (
                    <Link
                      href={`/news/${article.slug}`}
                      target="_blank"
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                    >
                      View Live
                    </Link>
                  )}

                  {article.status !== "APPROVED" && (
                    <form action={approveNewsAction.bind(null, article.id)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                      >
                        Approve & Publish
                      </button>
                    </form>
                  )}

                  {article.status !== "REJECTED" && (
                    <form action={rejectNewsAction.bind(null, article.id)} className="flex items-center gap-2">
                      <input
                        name="note"
                        type="text"
                        placeholder="Rejection reason (optional)"
                        className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600"
                      >
                        Reject
                      </button>
                    </form>
                  )}

                  <form action={deleteNewsAction.bind(null, article.id)} className="ml-auto">
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                {/* ── Editorial controls (approved only) ────────── */}
                {isApproved && (
                  <div className="mt-3 space-y-3 rounded-xl border border-dashed bg-muted/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Editorial Controls
                    </p>

                    {/* Flag toggles */}
                    <div className="flex flex-wrap gap-2">
                      <FlagButton id={article.id} field="is_featured" active={article.is_featured}
                        label="Featured" icon={Star} activeColor="bg-amber-100 text-amber-800" />
                      <FlagButton id={article.id} field="is_breaking" active={article.is_breaking}
                        label="Breaking" icon={Zap} activeColor="bg-red-500 text-white" />
                      <FlagButton id={article.id} field="is_pinned" active={article.is_pinned}
                        label="Pinned" icon={Pin} activeColor="bg-blue-100 text-blue-800" />
                      <FlagButton id={article.id} field="is_trending" active={article.is_trending}
                        label="Trending" icon={Flame} activeColor="bg-orange-100 text-orange-800" />
                    </div>

                    {/* Slot + Rank + Schedule row */}
                    <div className="flex flex-wrap items-end gap-3">
                      {/* Homepage slot */}
                      <form action={setHomepageSlotAction.bind(null, article.id)} className="flex items-center gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Slot</label>
                        <div className="relative">
                          <select
                            name="slot"
                            defaultValue={article.homepage_slot ?? ""}
                            className="appearance-none rounded-lg border bg-background py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                          >
                            <option value="">None</option>
                            <option value="headline">Headline</option>
                            <option value="ticker">Ticker</option>
                            <option value="sidebar">Sidebar</option>
                            <option value="featured">Featured</option>
                          </select>
                          <ChevronDown size={10} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                        <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                      </form>

                      {/* Priority rank */}
                      <form action={setPriorityRankAction.bind(null, article.id)} className="flex items-center gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Rank</label>
                        <input
                          name="rank"
                          type="number"
                          defaultValue={article.priority_rank}
                          min={1}
                          max={999}
                          className="w-16 rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                        />
                        <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                      </form>

                      {/* Schedule */}
                      <form action={schedulePublishAction.bind(null, article.id)} className="flex items-center gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Schedule</label>
                        <input
                          name="datetime"
                          type="datetime-local"
                          defaultValue={article.scheduled_publish_at?.slice(0, 16) ?? ""}
                          className="rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                        />
                        <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                      </form>
                    </div>

                    {/* Inline edit */}
                    <EditNewsPanel article={article} editAction={editNewsAction} />
                  </div>
                )}
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
              href={`/admin/news?status=${currentStatus}&page=${currentPage - 1}`}
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
              href={`/admin/news?status=${currentStatus}&page=${currentPage + 1}`}
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
