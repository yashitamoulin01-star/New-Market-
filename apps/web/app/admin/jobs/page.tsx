import Link from "next/link"
import type { Metadata } from "next"
import {
  Clock, CheckCircle, XCircle, Inbox, ChevronDown, ChevronUp,
  Mail, Phone, User, Star, Radio,
} from "lucide-react"
import {
  adminListJobs, JOB_TYPE_LABELS,
  formatSalary, type ContentStatus,
} from "@/lib/supabase/jobs"
import {
  approveJobAction, rejectJobAction, deleteJobAction,
  restoreJobAction, editJobAction, featureJobAction,
} from "./actions"

export const metadata: Metadata = { title: "Admin — Jobs Queue" }

type Tab = "PENDING" | "LIVE" | "REJECTED"
const TABS: { label: string; value: Tab }[] = [
  { label: "Pending",  value: "PENDING" },
  { label: "Live",     value: "LIVE" },
  { label: "Rejected", value: "REJECTED" },
]

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-xs">
      <span className="shrink-0 w-24 font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground/85 break-all">{value}</span>
    </div>
  )
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const { tab, page } = await searchParams
  const activeTab = (tab as Tab) || "PENDING"
  const currentPage = Math.max(1, Number(page) || 1)

  const dbStatus: ContentStatus =
    activeTab === "LIVE" ? "APPROVED" :
    activeTab === "REJECTED" ? "REJECTED" : "PENDING"

  const { items, total, totalPages } = await adminListJobs({ status: dbStatus, page: currentPage })

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">Jobs Queue</h1>
        <p className="text-sm text-muted-foreground">{total} listing{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-0 overflow-x-auto border-b scrollbar-none">
        {TABS.map(t => (
          <Link key={t.value} href={`/admin/jobs?tab=${t.value}`}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "PENDING" && (
        <div className="mb-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
          <strong>Review:</strong> Check all details, edit if needed, then Approve or Reject.
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Inbox size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Queue is clear</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(job => {

            // ── PENDING card ─────────────────────────────────────────
            if (activeTab === "PENDING") return (
              <div key={job.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 border-b flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Clock size={9} /> PENDING
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {JOB_TYPE_LABELS[job.job_type]}
                      </span>
                    </div>
                    <h2 className="font-heading text-base font-bold">{job.title}</h2>
                    <p className="text-xs text-muted-foreground">{job.shop_name} · {fmt(job.created_at)}</p>
                  </div>
                  <form action={deleteJobAction.bind(null, job.id)}>
                    <button type="submit" className="shrink-0 rounded border border-red-200 px-2.5 py-1 text-[11px] text-red-500 hover:bg-red-50 transition">Delete</button>
                  </form>
                </div>

                {/* Full info */}
                <div className="px-4 py-3 space-y-2 border-b">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Description</p>
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap max-h-48 overflow-y-auto">{job.description}</p>
                  </div>
                  {job.requirements && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Requirements</p>
                      <p className="text-sm text-foreground/75 whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                    <InfoRow label="Salary" value={formatSalary(job.salary_min, job.salary_max, job.salary_label)} />
                    <InfoRow label="Openings" value={String(job.openings)} />
                    <InfoRow label="Timing" value={job.timing} />
                    <InfoRow label="Experience" value={job.experience_years ? `${job.experience_years} yr` : null} />
                    <InfoRow label="Address" value={job.shop_address} />
                  </div>
                </div>

                {/* Contact */}
                <div className="px-4 py-3 border-b bg-muted/10">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Contact</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1.5"><User size={13} className="text-primary" />{job.contact_name}</span>
                    <a href={`mailto:${job.contact_email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition">
                      <Mail size={13} className="text-primary" />{job.contact_email}
                    </a>
                    {job.contact_phone && (
                      <a href={`tel:${job.contact_phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition">
                        <Phone size={13} className="text-primary" />{job.contact_phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Inline edit */}
                <details className="border-b group">
                  <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                    <span>Edit Before Approving</span>
                    <ChevronDown size={13} className="group-open:hidden" />
                    <ChevronUp   size={13} className="hidden group-open:block" />
                  </summary>
                  <form action={editJobAction.bind(null, job.id)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Title</label>
                        <input name="title" defaultValue={job.title} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Shop / Company</label>
                        <input name="shop_name" defaultValue={job.shop_name} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Salary Label</label>
                        <input name="salary_label" defaultValue={job.salary_label ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Timing</label>
                        <input name="timing" defaultValue={job.timing ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea name="description" defaultValue={job.description} rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Requirements</label>
                      <textarea name="requirements" defaultValue={job.requirements ?? ""} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <button type="submit" className="rounded-lg bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80 transition">Save Edits</button>
                  </form>
                </details>

                {/* Approve / Reject */}
                <div className="flex flex-wrap items-center gap-2 bg-muted/5 px-4 py-3">
                  <form action={approveJobAction.bind(null, job.id)}>
                    <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                      <CheckCircle size={11} className="inline mr-1" />Approve → Go Live
                    </button>
                  </form>
                  <form action={rejectJobAction.bind(null, job.id)} className="flex items-center gap-1.5 ml-auto">
                    <input name="rejection_note" type="text" placeholder="Rejection reason (optional)"
                      className="w-44 rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <button type="submit" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition">Reject</button>
                  </form>
                </div>
              </div>
            )

            // ── LIVE card ─────────────────────────────────────────────
            if (activeTab === "LIVE") return (
              <div key={job.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Radio size={9} /> LIVE
                      </span>
                      {job.is_featured && (
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">⭐ Featured</span>
                      )}
                    </div>
                    <h2 className="font-heading text-sm font-bold">{job.title}</h2>
                    <p className="text-xs text-muted-foreground">{job.shop_name} · {formatSalary(job.salary_min, job.salary_max, job.salary_label)} · {fmt(job.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t bg-muted/10 px-4 py-2.5">
                  <Link href={`/jobs/${job.id}`} target="_blank" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">
                    View Live ↗
                  </Link>

                  <form action={featureJobAction.bind(null, job.id, !job.is_featured)}>
                    <button type="submit" className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold border transition ${
                      job.is_featured
                        ? "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}>
                      <Star size={10} />{job.is_featured ? "Unfeature" : "Feature"}
                    </button>
                  </form>

                  <form action={deleteJobAction.bind(null, job.id)} className="ml-auto">
                    <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Remove</button>
                  </form>
                </div>

                <details className="border-t group">
                  <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                    <span>Edit</span>
                    <ChevronDown size={13} className="group-open:hidden" />
                    <ChevronUp   size={13} className="hidden group-open:block" />
                  </summary>
                  <form action={editJobAction.bind(null, job.id)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Title</label>
                        <input name="title" defaultValue={job.title} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Salary Label</label>
                        <input name="salary_label" defaultValue={job.salary_label ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea name="description" defaultValue={job.description} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <button type="submit" className="rounded-lg bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80 transition">Save</button>
                  </form>
                </details>
              </div>
            )

            // ── REJECTED card ─────────────────────────────────────────
            return (
              <div key={job.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle size={9} /> REJECTED
                      </span>
                    </div>
                    <h2 className="font-heading text-sm font-bold">{job.title}</h2>
                    <p className="text-xs text-muted-foreground">{job.shop_name} · {fmt(job.created_at)}</p>
                  </div>
                </div>
                {job.rejection_note && (
                  <div className="border-t flex items-start gap-2 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-xs text-red-700 dark:text-red-300">
                    <XCircle size={11} className="mt-0.5 shrink-0" />{job.rejection_note}
                  </div>
                )}
                <div className="flex items-center gap-2 border-t bg-muted/5 px-4 py-3">
                  <form action={restoreJobAction.bind(null, job.id)}>
                    <button type="submit" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">↩ Restore to Pending</button>
                  </form>
                  <form action={deleteJobAction.bind(null, job.id)} className="ml-auto">
                    <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Delete Permanently</button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link href={`/admin/jobs?tab=${activeTab}&page=${currentPage - 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">Previous</Link>
          )}
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/jobs?tab=${activeTab}&page=${currentPage + 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">Next</Link>
          )}
        </div>
      )}
    </div>
  )
}
