"use client"

import Link from "next/link"
import { Briefcase, MapPin, Eye, Users } from "lucide-react"
import {
  type JobCardData,
  JOB_TYPE_LABELS_BI,
  JOB_CATEGORY_LABELS_BI,
  formatSalary,
} from "@/lib/supabase/jobs-defs"
import { useLanguage } from "@/contexts/language-context"
import type { Lang } from "@/lib/i18n"

const CATEGORY_COLORS: Record<string, string> = {
  RETAIL:             "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  FOOD_BEVERAGE:      "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  TAILORING:          "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  ELECTRONICS:        "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  BEAUTY_WELLNESS:    "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  LOGISTICS_DELIVERY: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  MANAGEMENT:         "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  SECURITY:           "bg-red-500/15 text-red-700 dark:text-red-400",
  HOUSEKEEPING:       "bg-green-500/15 text-green-700 dark:text-green-400",
  OTHER:              "bg-slate-500/15 text-slate-700 dark:text-slate-400",
}

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME:  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  PART_TIME:  "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  CONTRACT:   "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  INTERNSHIP: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  SEASONAL:   "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
}

function timeAgo(iso: string, lang: Lang) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (lang === "hi") {
    if (days === 0) return "आज"
    if (days === 1) return "कल"
    if (days < 7)  return `${days} दिन पहले`
    if (days < 30) return `${Math.floor(days / 7)} सप्ताह पहले`
    return new Date(iso).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })
  }
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function JobCard({ job }: { job: JobCardData }) {
  const { lang } = useLanguage()
  const catColor  = CATEGORY_COLORS[job.category] ?? CATEGORY_COLORS.OTHER
  const typeColor = JOB_TYPE_COLORS[job.job_type] ?? "bg-slate-500/15 text-slate-700 dark:text-slate-400"
  const salary    = formatSalary(job.salary_min, job.salary_max, job.salary_label)
  const catLabel  = JOB_CATEGORY_LABELS_BI[job.category]?.[lang] ?? job.category
  const typeLabel = JOB_TYPE_LABELS_BI[job.job_type]?.[lang] ?? job.job_type

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColor}`}>
          {catLabel}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
          {typeLabel}
        </span>
        {job.is_featured && (
          <span className="ml-auto rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
          </span>
        )}
      </div>

      <h2 className="mb-1 line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
        {job.title}
      </h2>

      <p className="mb-2 text-sm font-medium text-muted-foreground">{job.shop_name}</p>

      {job.shop_address && (
        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={11} className="shrink-0" />
          <span className="line-clamp-1">{job.shop_address}</span>
        </div>
      )}

      <div className="mb-3 flex items-center gap-1 text-sm font-semibold text-foreground">
        <Briefcase size={13} className="shrink-0 text-primary" />
        {salary}
      </div>

      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users size={11} />
          {lang === "hi"
            ? `${job.openings} पद`
            : `${job.openings} opening${job.openings !== 1 ? "s" : ""}`}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {job.view_count.toLocaleString()}
          </span>
          <span>{timeAgo(job.created_at, lang)}</span>
        </div>
      </div>
    </Link>
  )
}
