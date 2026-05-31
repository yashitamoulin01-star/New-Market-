import { createClient } from "@/lib/supabase/server"
import { BarChart2, TrendingUp, Users, Newspaper, Eye, Megaphone, Briefcase, Store, Building2 } from "lucide-react"
import { SparkLine, HBar, DonutChart, RangeSwitcher } from "./charts"

export const metadata = { title: "Admin — Analytics" }

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDayBuckets(days: number | null): Record<string, number> {
  const buckets: Record<string, number> = {}
  if (days === null) return buckets
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets[d.toISOString().slice(0, 10)] = 0
  }
  return buckets
}

function groupByDay(
  records: { created_at: string }[],
  days: number | null,
): { date: string; count: number }[] {
  const buckets = buildDayBuckets(days)
  for (const r of records) {
    const day = r.created_at.slice(0, 10)
    if (days === null) {
      buckets[day] = (buckets[day] ?? 0) + 1
    } else if (day in buckets) {
      buckets[day]++
    }
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

// ── Data fetch ────────────────────────────────────────────────────────────────

async function getAnalyticsData(range: string) {
  const supabase = await createClient()

  let days: number | null = 30
  let startDate: string | null = null
  const now = new Date()

  if (range === "today") {
    days = 1
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    startDate = d.toISOString()
  } else if (range === "7") {
    days = 7
    startDate = new Date(now.getTime() - 7 * 86400_000).toISOString()
  } else if (range === "all") {
    days = null
    startDate = null
  } else {
    days = 30
    startDate = new Date(now.getTime() - 30 * 86400_000).toISOString()
  }

  function applyDate<T extends { gte: (col: string, val: string) => T }>(q: T): T {
    return startDate ? q.gte("created_at", startDate) : q
  }

  const [
    newsRes,
    usersRes,
    allNewsStatusRes,
    approvedNewsRes,
    jobsRes,
    shopsRes,
    propertyRes,
    adsRes,
    topViewsRes,
    allViewsRes,
  ] = await Promise.allSettled([
    applyDate(supabase.from("news_articles").select("created_at").order("created_at")),
    applyDate(supabase.from("user_profiles").select("created_at").order("created_at")),
    supabase.from("news_articles").select("status"),
    supabase.from("news_articles").select("category").eq("status", "APPROVED"),
    applyDate(supabase.from("jobs").select("created_at")),
    applyDate(supabase.from("shops").select("created_at")),
    applyDate(supabase.from("properties").select("created_at")),
    supabase.from("advertisements").select("title, slot, click_count, is_active").order("click_count", { ascending: false }).limit(10),
    supabase.from("news_articles").select("id, title, slug, category, view_count, published_at").eq("status", "APPROVED").order("view_count", { ascending: false }).limit(8),
    supabase.from("news_articles").select("view_count").eq("status", "APPROVED"),
  ])

  const newsRows     = newsRes.status     === "fulfilled" ? (newsRes.value.data     ?? []) : []
  const usersRows    = usersRes.status    === "fulfilled" ? (usersRes.value.data    ?? []) : []
  const jobsRows     = jobsRes.status     === "fulfilled" ? (jobsRes.value.data     ?? []) : []
  const shopsRows    = shopsRes.status    === "fulfilled" ? (shopsRes.value.data    ?? []) : []
  const propertyRows = propertyRes.status === "fulfilled" ? (propertyRes.value.data ?? []) : []
  const statusRows   = allNewsStatusRes.status === "fulfilled" ? (allNewsStatusRes.value.data ?? []) : []
  const catRows      = approvedNewsRes.status  === "fulfilled" ? (approvedNewsRes.value.data  ?? []) : []
  const ads          = adsRes.status      === "fulfilled" ? (adsRes.value.data      ?? []) : []
  const topViews     = topViewsRes.status === "fulfilled" ? (topViewsRes.value.data ?? []) : []
  const allViewsRows = allViewsRes.status === "fulfilled" ? (allViewsRes.value.data ?? []) : []

  const newsByDay     = groupByDay(newsRows as { created_at: string }[],     days)
  const usersByDay    = groupByDay(usersRows as { created_at: string }[],    days)
  const jobsByDay     = groupByDay(jobsRows as { created_at: string }[],     days)
  const shopsByDay    = groupByDay(shopsRows as { created_at: string }[],    days)
  const propertyByDay = groupByDay(propertyRows as { created_at: string }[], days)

  const statusCounts = { PENDING: 0, EDITORIAL: 0, APPROVED: 0, REJECTED: 0 }
  for (const r of statusRows) {
    const s = (r as { status: string }).status as keyof typeof statusCounts
    if (s in statusCounts) statusCounts[s]++
  }

  const catCounts: Record<string, number> = {}
  for (const r of catRows) {
    const c = (r as { category: string }).category
    catCounts[c] = (catCounts[c] ?? 0) + 1
  }

  const totalNewsViews = (allViewsRows as { view_count: number }[])
    .reduce((s, r) => s + (r.view_count ?? 0), 0)

  return {
    newsByDay,
    usersByDay,
    jobsByDay,
    shopsByDay,
    propertyByDay,
    statusCounts,
    catCounts,
    ads: ads as { title: string; slot: string; click_count: number; is_active: boolean }[],
    topViews: topViews as { id: string; title: string; slug: string; category: string; view_count: number; published_at: string }[],
    totals: {
      news:     newsRows.length,
      users:    usersRows.length,
      jobs:     jobsRows.length,
      shops:    shopsRows.length,
      property: propertyRows.length,
    },
    totalNewsViews,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-bold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${color}`}>
        <Icon size={16} className="opacity-80" />
      </div>
      <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  GENERAL:   "#6366f1",
  EVENTS:    "#f59e0b",
  NOTICES:   "#ef4444",
  BUSINESS:  "#10b981",
  COMMUNITY: "#3b82f6",
  SAFETY:    "#f97316",
  TRAFFIC:   "#8b5cf6",
}

const STATUS_COLORS = {
  APPROVED:  "#10b981",
  PENDING:   "#f59e0b",
  EDITORIAL: "#6366f1",
  REJECTED:  "#ef4444",
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range = "30" } = await searchParams
  const d = await getAnalyticsData(range)

  const catData = Object.entries(d.catCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([label, count]) => ({ label, count, color: CAT_COLORS[label] ?? "#94a3b8" }))

  const statusData = Object.entries(d.statusCounts)
    .filter(([, v]) => v > 0)
    .map(([label, count]) => ({ label, count, color: STATUS_COLORS[label as keyof typeof STATUS_COLORS] ?? "#94a3b8" }))

  const adBarData = d.ads
    .filter(a => a.click_count > 0)
    .map(a => ({ label: a.title, count: a.click_count, sublabel: a.slot }))

  const totalAdClicks = d.ads.reduce((s, a) => s + a.click_count, 0)

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={20} className="text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Real-time data from Supabase</p>
          </div>
        </div>
        <RangeSwitcher current={range} />
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard icon={Newspaper}  label="News submitted"   value={d.totals.news}     color="bg-blue-50 text-blue-600 dark:bg-blue-950/40" />
        <KpiCard icon={Users}      label="New users"        value={d.totals.users}    color="bg-violet-50 text-violet-600 dark:bg-violet-950/40" />
        <KpiCard icon={Briefcase}  label="Jobs posted"      value={d.totals.jobs}     color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" />
        <KpiCard icon={Store}      label="Shops listed"     value={d.totals.shops}    color="bg-amber-50 text-amber-600 dark:bg-amber-950/40" />
        <KpiCard icon={Building2}  label="Properties"       value={d.totals.property} color="bg-rose-50 text-rose-600 dark:bg-rose-950/40" />
      </div>

      {/* Sparklines row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <ChartCard title="News Submissions" subtitle="Over selected period">
          <SparkLine data={d.newsByDay} color="#6366f1" height={100} />
        </ChartCard>
        <ChartCard title="User Registrations" subtitle="Over selected period">
          <SparkLine data={d.usersByDay} color="#10b981" height={100} />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <ChartCard title="Jobs" subtitle="Submissions over period">
          <SparkLine data={d.jobsByDay} color="#f59e0b" height={80} />
        </ChartCard>
        <ChartCard title="Shops" subtitle="Submissions over period">
          <SparkLine data={d.shopsByDay} color="#ef4444" height={80} />
        </ChartCard>
        <ChartCard title="Property" subtitle="Submissions over period">
          <SparkLine data={d.propertyByDay} color="#8b5cf6" height={80} />
        </ChartCard>
      </div>

      {/* Category + Status row */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Content by Category" subtitle="Approved articles">
          {catData.length > 0
            ? <DonutChart data={catData} />
            : <p className="text-center text-sm text-muted-foreground py-8">No approved content yet</p>
          }
        </ChartCard>
        <ChartCard title="News by Status" subtitle="All-time moderation breakdown">
          {statusData.length > 0
            ? <DonutChart data={statusData} />
            : <p className="text-center text-sm text-muted-foreground py-8">No data</p>
          }
        </ChartCard>
      </div>

      {/* Top articles by views */}
      <div className="mb-6 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
          <Eye size={14} className="text-primary" />
          <h2 className="text-sm font-bold">Top Articles by Views</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {d.totalNewsViews.toLocaleString()} total views
          </span>
        </div>
        {d.topViews.length > 0 ? (
          <ul className="divide-y">
            {d.topViews.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 shrink-0 text-xs font-bold text-muted-foreground/60 tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {a.category.toLowerCase()} · {a.published_at ? new Date(a.published_at).toLocaleDateString("en-IN") : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Eye size={11} className="text-muted-foreground" />
                  <span className="text-sm font-bold tabular-nums text-primary">{a.view_count.toLocaleString()}</span>
                </div>
                <a
                  href={`/news/${a.slug}`}
                  target="_blank"
                  className="shrink-0 rounded border px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-muted"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No approved articles yet</p>
        )}
      </div>

      {/* Ad performance */}
      <ChartCard
        title="Ad Performance"
        subtitle={`${totalAdClicks.toLocaleString()} total clicks · ${d.ads.filter(a => a.is_active).length} active ads`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={13} className="text-primary" />
          <span className="text-xs text-muted-foreground">Click counts per ad</span>
        </div>
        {adBarData.length > 0 ? (
          <HBar data={adBarData} color="#f59e0b" />
        ) : (
          <div className="py-8 text-center">
            <TrendingUp size={28} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No ad clicks recorded yet</p>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
