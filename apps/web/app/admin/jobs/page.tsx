import { adminListJobs, JOB_TYPE_LABELS, JOB_CATEGORY_LABELS, formatSalary, type ContentStatus } from "@/lib/supabase/jobs"
import { approveJobAction, rejectJobAction, deleteJobAction } from "./actions"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export const metadata = { title: "Admin — Jobs" }

const STATUS_TABS: { label: string; value: ContentStatus | "" }[] = [
  { label: "Pending",  value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All",      value: "" },
]

const STATUS_COLORS: Record<ContentStatus, string> = {
  PENDING:  "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
}

export default async function AdminJobsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = (params.status as ContentStatus) || "PENDING"
  const page = Number(params.page ?? 1)

  const result = await adminListJobs({
    status: status || undefined,
    page,
    limit: 20,
  })

  function tabHref(s: string) {
    const p = new URLSearchParams()
    if (s) p.set("status", s)
    const q = p.toString()
    return `/admin/jobs${q ? "?" + q : ""}`
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Job Listings</h1>
        <span className="text-sm text-muted-foreground">{result.total} total</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              status === tab.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          No listings found.
        </div>
      ) : (
        <div className="space-y-4">
          {result.items.map((job) => {
            const approveWithId = approveJobAction.bind(null, job.id)
            const rejectWithId  = rejectJobAction.bind(null, job.id)
            const deleteWithId  = deleteJobAction.bind(null, job.id)

            return (
              <div key={job.id} className="rounded-xl border bg-card p-5">
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[job.status]}`}>
                        {job.status}
                      </span>
                      {job.is_featured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-base font-semibold text-foreground">
                      {job.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {job.shop_name} · {JOB_CATEGORY_LABELS[job.category]} · {JOB_TYPE_LABELS[job.job_type]}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{formatSalary(job.salary_min, job.salary_max, job.salary_label)}</div>
                    <div>{job.openings} opening{job.openings !== 1 ? "s" : ""}</div>
                    <div>{new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
                  <span><span className="font-medium text-foreground">Contact:</span> {job.contact_name}</span>
                  <span><span className="font-medium text-foreground">Email:</span> {job.contact_email}</span>
                  {job.contact_phone && <span><span className="font-medium text-foreground">Phone:</span> {job.contact_phone}</span>}
                  {job.shop_address && <span><span className="font-medium text-foreground">Address:</span> {job.shop_address}</span>}
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    target="_blank"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
                  >
                    View
                  </Link>

                  {job.status !== "APPROVED" && (
                    <form action={approveWithId}>
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </form>
                  )}

                  {job.status !== "REJECTED" && (
                    <form action={rejectWithId} className="flex items-center gap-2">
                      <input
                        name="rejection_note"
                        type="text"
                        placeholder="Rejection reason (optional)"
                        className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                      >
                        Reject
                      </button>
                    </form>
                  )}

                  <form action={deleteWithId} className="ml-auto">
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={`/admin/jobs?status=${status}&page=${page - 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
          {page < result.totalPages && (
            <Link href={`/admin/jobs?status=${status}&page=${page + 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
