import Link from "next/link"
import {
  Newspaper, Briefcase, Store, Building2, MessageSquare,
  Megaphone, Vote, Users, Settings, TrendingUp, Eye,
  Clock, CheckCircle, AlertCircle, ArrowRight, BarChart2,
} from "lucide-react"
import { adminListNews } from "@/lib/supabase/news"
import { adminListJobs } from "@/lib/supabase/jobs"
import { adminListShops } from "@/lib/supabase/shops"
import { adminListProperties } from "@/lib/supabase/property"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Admin — Dashboard" }

async function getStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    news, jobs, shops, property,
    pendingNews, pendingJobs, pendingShops, pendingProperty,
    recentNews, topNews,
  ] = await Promise.allSettled([
    adminListNews({ limit: 1 }),
    adminListJobs({ limit: 1 }),
    adminListShops({ limit: 1 }),
    adminListProperties({ limit: 1 }),
    adminListNews({ status: "PENDING", limit: 1 }),
    adminListJobs({ status: "PENDING", limit: 1 }),
    adminListShops({ status: "PENDING", limit: 1 }),
    adminListProperties({ status: "PENDING", limit: 1 }),
    // recent 7-day news submissions
    (async () => {
      const supabase = await createClient()
      const { count } = await supabase
        .from("news_articles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo)
      return count ?? 0
    })(),
    // top viewed live articles
    (async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from("news_articles")
        .select("id, title, slug, view_count, category, published_at")
        .eq("status", "APPROVED")
        .order("view_count", { ascending: false })
        .limit(5)
      return data ?? []
    })(),
  ])

  return {
    news:     { total: news.status     === "fulfilled" ? news.value.total     : 0, pending: pendingNews.status     === "fulfilled" ? pendingNews.value.total     : 0 },
    jobs:     { total: jobs.status     === "fulfilled" ? jobs.value.total     : 0, pending: pendingJobs.status     === "fulfilled" ? pendingJobs.value.total     : 0 },
    shops:    { total: shops.status    === "fulfilled" ? shops.value.total    : 0, pending: pendingShops.status    === "fulfilled" ? pendingShops.value.total    : 0 },
    property: { total: property.status === "fulfilled" ? property.value.total : 0, pending: pendingProperty.status === "fulfilled" ? pendingProperty.value.total : 0 },
    recentNews: recentNews.status === "fulfilled" ? recentNews.value : 0,
    topNews:    topNews.status    === "fulfilled" ? topNews.value    : [],
  }
}

function StatCard({
  href, icon: Icon, label, total, pending, color, bg,
}: {
  href: string; icon: React.ElementType; label: string
  total: number; pending: number; color: string; bg: string
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <p className="text-2xl font-bold">{total.toLocaleString()}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {pending > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-[11px] font-semibold text-amber-600">
            {pending} pending review
          </p>
        </div>
      )}
      <ArrowRight size={13} className="absolute right-4 top-4 text-muted-foreground/0 transition group-hover:text-muted-foreground/50" />
    </Link>
  )
}

export default async function AdminDashboardPage() {
  const stats = await getStats()
  const totalPending = stats.news.pending + stats.jobs.pending + stats.shops.pending + stats.property.pending

  const cards = [
    { href: "/admin/news",     icon: Newspaper,  label: "News",       total: stats.news.total,     pending: stats.news.pending,     color: "text-blue-600",    bg: "bg-blue-50" },
    { href: "/admin/jobs",     icon: Briefcase,  label: "Jobs",       total: stats.jobs.total,     pending: stats.jobs.pending,     color: "text-green-600",   bg: "bg-green-50" },
    { href: "/admin/shops",    icon: Store,      label: "Shops",      total: stats.shops.total,    pending: stats.shops.pending,    color: "text-amber-600",   bg: "bg-amber-50" },
    { href: "/admin/property", icon: Building2,  label: "Properties", total: stats.property.total, pending: stats.property.pending, color: "text-violet-600",  bg: "bg-violet-50" },
  ]

  const quickLinks = [
    { href: "/admin/news",     icon: Newspaper,     label: "News Queue" },
    { href: "/admin/ads",      icon: Megaphone,     label: "Ad Manager" },
    { href: "/admin/elections",icon: Vote,          label: "Elections" },
    { href: "/admin/users",    icon: Users,         label: "Users" },
    { href: "/admin/comments", icon: MessageSquare, label: "Comments" },
    { href: "/admin/settings", icon: Settings,      label: "Settings" },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topNews = stats.topNews as any[]

  return (
    <div className="container max-w-4xl py-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">NewMarket.co.in — Admin Overview</p>
      </div>

      {/* Urgent alert — pending items */}
      {totalPending > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30">
          <AlertCircle size={16} className="shrink-0 text-amber-600" />
          <p className="flex-1 text-sm font-medium text-amber-800 dark:text-amber-300">
            <strong>{totalPending}</strong> item{totalPending !== 1 ? "s" : ""} waiting for review across all queues.
          </p>
          <Link href="/admin/news" className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700">
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => <StatCard key={c.href} {...c} />)}
      </div>

      {/* Analytics Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">

        {/* Weekly submissions */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Last 7 Days</p>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.recentNews}</p>
          <p className="text-sm text-muted-foreground">new news submissions</p>
        </div>

        {/* Approval rate indicator */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Live Content</p>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.news.total}</p>
          <p className="text-sm text-muted-foreground">approved articles</p>
          {stats.news.pending > 0 && (
            <p className="mt-1 text-xs text-amber-600">+{stats.news.pending} pending</p>
          )}
        </div>

        {/* Directory size */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <BarChart2 size={14} className="text-violet-500" />
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Directory</p>
          </div>
          <p className="mt-2 text-3xl font-bold">{(stats.jobs.total + stats.shops.total + stats.property.total).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">jobs + shops + listings</p>
        </div>
      </div>

      {/* Top articles by views */}
      {topNews.length > 0 && (
        <div className="mb-8 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
            <Eye size={14} className="text-primary" />
            <h2 className="text-sm font-bold">Top Articles by Views</h2>
          </div>
          <ul className="divide-y">
            {topNews.map((article: { id: string; title: string; slug: string; view_count: number; category: string }) => (
              <li key={article.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{article.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{article.category.toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-sm font-bold text-primary">
                  <Eye size={12} className="text-muted-foreground" />
                  {article.view_count.toLocaleString()}
                </div>
                <Link
                  href={`/news/${article.slug}`}
                  target="_blank"
                  className="shrink-0 rounded border px-2 py-1 text-[11px] text-muted-foreground transition hover:text-foreground hover:bg-muted"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-muted"
            >
              <Icon size={15} className="text-primary" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Site Link */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          target="_blank"
          className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline"
        >
          View public site →
        </Link>
      </div>
    </div>
  )
}
