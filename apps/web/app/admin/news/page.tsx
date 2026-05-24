import Link from "next/link"
import type { Metadata } from "next"
import {
  Clock, CheckCircle, XCircle, Eye, Inbox, ShieldOff,
  Zap, Pin, Flame, Star, ChevronDown, ChevronUp,
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
  { label: "Pending",  value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All",      value: "ALL" },
]

const STATUS_CONFIG: Record<ContentStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING:  { label: "Pending",  icon: Clock,       className: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", icon: CheckCircle, className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Rejected", icon: XCircle,     className: "bg-red-100 text-red-700" },
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
    <div className="container py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">News Queue</h1>
        <p className="text-sm text-muted-foreground">
          {total} article{total !== 1 ? "s" : ""} · Review and control homepage placement
        </p>
      </div>

      {/* Status tabs — scrollable on mobile */}
      <div className="mb-5 flex gap-0 overflow-x-auto border-b scrollbar-none">
        {TABS.map((tab) => {
          const active = currentStatus === tab.value || (tab.value === "PENDING" && !status)
          const href = tab.value === "ALL"
            ? "/admin/news?status=ALL"
            : `/admin/news?status=${tab.value}`
          return (
            <Link
              key={tab.value}
              href={href}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
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
        <div className="space-y-2.5">
          {items.map((article) => {
            const statusCfg = STATUS_CONFIG[article.status]
            const StatusIcon = statusCfg.icon
            const catColor = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.GENERAL
            const isApproved = article.status === "APPROVED"

            return (
              <div key={article.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                {/* ── Compact top bar ── */}
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusCfg.className}`}>
                        <StatusIcon size={9} />
                        {statusCfg.label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                        {article.category.charAt(0) + article.category.slice(1).toLowerCase()}
                      </span>
                      {article.is_featured  && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">⭐</span>}
                      {article.is_breaking  && <span className="breaking-badge rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">⚡</span>}
                      {article.is_pinned    && <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">📌</span>}
                      {article.is_trending  && <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-800">🔥</span>}
                      {article.homepage_slot && (
                        <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-800">
                          🏠 {article.homepage_slot}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-heading text-sm font-bold leading-snug text-foreground line-clamp-2">
                      {article.title}
                    </h2>

                    {/* Meta */}
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/80">{article.submitter_name}</span>
                      {article.is_anonymous && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                          <ShieldOff size={8} /> Anon
                        </span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Clock size={9} />{formatDate(article.created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Eye size={9} />{article.view_count.toLocaleString()}</span>
                      {article.priority_rank && (
                        <><span>·</span><span className="text-muted-foreground/70">Rank {article.priority_rank}</span></>
                      )}
                    </p>
                  </div>
                </div>

                {/* Excerpt preview */}
                {(article.excerpt || article.content) && (
                  <div className="border-t bg-muted/20 px-4 py-2">
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {article.excerpt ?? article.content.slice(0, 180) + (article.content.length > 180 ? "…" : "")}
                    </p>
                  </div>
                )}

                {/* Rejection note */}
                {article.rejection_note && (
                  <div className="border-t flex items-start gap-2 bg-red-50 px-4 py-2 text-xs text-red-700">
                    <XCircle size={12} className="mt-0.5 shrink-0" />
                    <span>{article.rejection_note}</span>
                  </div>
                )}

                {/* ── Action buttons ── */}
                <div className="flex flex-wrap items-center gap-2 border-t bg-muted/10 px-4 py-2.5">
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
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                      >
                        ✓ Approve
                      </button>
                    </form>
                  )}

                  {article.status !== "REJECTED" && (
                    <form action={rejectNewsAction.bind(null, article.id)} className="flex items-center gap-1.5">
                      <input
                        name="note"
                        type="text"
                        placeholder="Reason (optional)"
                        className="w-32 rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 sm:w-44"
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

                {/* ── Editorial controls (approved only, collapsible on mobile) ── */}
                {isApproved && (
                  <details className="border-t group">
                    <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                      <span>Editorial Controls</span>
                      <ChevronDown size={13} className="group-open:hidden" />
                      <ChevronUp   size={13} className="hidden group-open:block" />
                    </summary>

                    <div className="space-y-3 p-4">
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

                      {/* Slot + Rank + Schedule — stack on mobile, row on sm+ */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                        {/* Homepage slot */}
                        <form action={setHomepageSlotAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Slot</label>
                          <div className="relative">
                            <select
                              name="slot"
                              defaultValue={article.homepage_slot ?? ""}
                              className="appearance-none rounded-lg border bg-background py-1.5 pl-2.5 pr-7 text-xs outline-none focus:border-primary"
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
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Rank</label>
                          <input
                            name="rank"
                            type="number"
                            defaultValue={article.priority_rank}
                            min={1} max={999}
                            className="w-16 rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary"
                          />
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                        </form>

                        {/* Schedule */}
                        <form action={schedulePublishAction.bind(null, article.id)} className="flex items-center gap-1.5">
                          <label className="text-[11px] font-semibold text-muted-foreground w-12 shrink-0">Schedule</label>
                          <input
                            name="datetime"
                            type="datetime-local"
                            defaultValue={article.scheduled_publish_at?.slice(0, 16) ?? ""}
                            className="rounded-lg border bg-background py-1.5 px-2.5 text-xs outline-none focus:border-primary"
                          />
                          <button type="submit" className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-muted/80 transition">Set</button>
                        </form>
                      </div>

                      {/* Inline edit */}
                      <EditNewsPanel article={article} editAction={editNewsAction} />
                    </div>
                  </details>
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
