import Link from "next/link"
import { Briefcase, Plus } from "lucide-react"
import { getCachedJobs } from "@/lib/data/cached"
import {
  JOB_TYPE_LABELS_BI,
  type JobType,
} from "@/lib/supabase/jobs-defs"
import { JobCard } from "@/components/jobs/job-card"
import { T } from "@/components/ui/t"

interface PageProps {
  searchParams: Promise<{ type?: string; page?: string }>
}

export const metadata = {
  title: "Job Vacancies — New Market",
  description: "Find local jobs in New Market, Bhopal — retail, food, tailoring, electronics and more.",
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const jobType  = params.type as JobType | undefined
  const page     = Number(params.page ?? 1)

  let result = {
    items: [] as Awaited<ReturnType<typeof getCachedJobs>>["items"],
    total: 0,
    totalPages: 0,
  }

  try {
    result = await getCachedJobs({ page, limit: 12, jobType })
  } catch {
    // Supabase unavailable
  }

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { type: jobType, page: undefined, ...overrides }
    const p = new URLSearchParams()
    if (merged.type) p.set("type", merged.type)
    if (merged.page && merged.page !== "1") p.set("page", merged.page)
    const q = p.toString()
    return `/jobs${q ? "?" + q : ""}`
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold">
            <Briefcase size={22} className="text-primary" />
            <T en="Job Vacancies" hi="नौकरियाँ" />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total > 0 ? (
              <T
                en={`${result.total} opening${result.total !== 1 ? "s" : ""} in New Market`}
                hi={`न्यू मार्केट में ${result.total} नौकरियाँ`}
              />
            ) : (
              <T en="Local jobs in New Market, Bhopal" hi="न्यू मार्केट, भोपाल में नौकरियाँ" />
            )}
          </p>
        </div>
        <Link
          href="/jobs/post"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus size={15} />
          <T en="Post a Job" hi="नौकरी पोस्ट करें" />
        </Link>
      </div>

      {/* Job type filters */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <Link
          href={buildHref({ type: undefined })}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            !jobType
              ? "border-foreground/50 bg-foreground/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-foreground/40"
          }`}
        >
          <T en="All Types" hi="सभी प्रकार" />
        </Link>
        {(Object.entries(JOB_TYPE_LABELS_BI) as [JobType, { en: string; hi: string }][]).map(([key, label]) => (
          <Link
            key={key}
            href={buildHref({ type: key })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              jobType === key
                ? "border-foreground/50 bg-foreground/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/40"
            }`}
          >
            <T en={label.en} hi={label.hi} />
          </Link>
        ))}
      </div>

      {/* Grid */}
      {result.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <T en="Previous" hi="पिछला" />
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                <T en={`Page ${page} of ${result.totalPages}`} hi={`पृष्ठ ${page} / ${result.totalPages}`} />
              </span>
              {page < result.totalPages && (
                <Link
                  href={buildHref({ page: String(page + 1) })}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <T en="Next" hi="अगला" />
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed bg-card py-16 text-center">
          <Briefcase size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="mb-1 font-medium text-muted-foreground">
            {jobType
              ? <T en="No jobs match your filters." hi="कोई नौकरी नहीं मिली।" />
              : <T en="No job listings yet." hi="अभी कोई नौकरी नहीं।" />
            }
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            {jobType ? (
              <Link href="/jobs" className="text-primary hover:underline">
                <T en="Clear filters" hi="फ़िल्टर हटाएँ" />
              </Link>
            ) : (
              <T en="Be the first to post an opening in New Market." hi="न्यू मार्केट में पहली नौकरी पोस्ट करें।" />
            )}
          </p>
          <Link
            href="/jobs/post"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus size={14} />
            <T en="Post a Job" hi="नौकरी पोस्ट करें" />
          </Link>
        </div>
      )}
    </div>
  )
}
