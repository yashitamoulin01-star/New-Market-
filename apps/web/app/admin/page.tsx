import Link from "next/link"
import {
  Newspaper, Briefcase, Store, Building2, MessageSquare,
  Megaphone, Vote, Users, Settings, TrendingUp,
} from "lucide-react"
import {
  adminListNews,
} from "@/lib/supabase/news"
import {
  adminListJobs,
} from "@/lib/supabase/jobs"
import {
  adminListShops,
} from "@/lib/supabase/shops"
import {
  adminListProperties,
} from "@/lib/supabase/property"

export const metadata = { title: "Admin — Dashboard" }

async function getStats() {
  const [news, jobs, shops, property] = await Promise.allSettled([
    adminListNews({ limit: 1 }),
    adminListJobs({ limit: 1 }),
    adminListShops({ limit: 1 }),
    adminListProperties({ limit: 1 }),
  ])

  const [pendingNews, pendingJobs, pendingShops, pendingProperty] = await Promise.allSettled([
    adminListNews({ status: "PENDING", limit: 1 }),
    adminListJobs({ status: "PENDING", limit: 1 }),
    adminListShops({ status: "PENDING", limit: 1 }),
    adminListProperties({ status: "PENDING", limit: 1 }),
  ])

  return {
    news:     { total: news.status     === "fulfilled" ? news.value.total     : 0,
                pending: pendingNews.status === "fulfilled" ? pendingNews.value.total : 0 },
    jobs:     { total: jobs.status     === "fulfilled" ? jobs.value.total     : 0,
                pending: pendingJobs.status === "fulfilled" ? pendingJobs.value.total : 0 },
    shops:    { total: shops.status    === "fulfilled" ? shops.value.total    : 0,
                pending: pendingShops.status === "fulfilled" ? pendingShops.value.total : 0 },
    property: { total: property.status === "fulfilled" ? property.value.total : 0,
                pending: pendingProperty.status === "fulfilled" ? pendingProperty.value.total : 0 },
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    { href: "/admin/news",     icon: Newspaper,  label: "News",       total: stats.news.total,     pending: stats.news.pending,     color: "text-blue-600",    bg: "bg-blue-50" },
    { href: "/admin/jobs",     icon: Briefcase,  label: "Jobs",       total: stats.jobs.total,     pending: stats.jobs.pending,     color: "text-green-600",   bg: "bg-green-50" },
    { href: "/admin/shops",    icon: Store,      label: "Shops",      total: stats.shops.total,    pending: stats.shops.pending,    color: "text-amber-600",   bg: "bg-amber-50" },
    { href: "/admin/property", icon: Building2,  label: "Properties", total: stats.property.total, pending: stats.property.pending, color: "text-violet-600",  bg: "bg-violet-50" },
  ]

  const quickLinks = [
    { href: "/admin/news",     icon: Newspaper,     label: "Manage News" },
    { href: "/admin/ads",      icon: Megaphone,     label: "Ad Manager" },
    { href: "/admin/elections",icon: Vote,          label: "Elections" },
    { href: "/admin/users",    icon: Users,         label: "Users" },
    { href: "/admin/comments", icon: MessageSquare, label: "Comments" },
    { href: "/admin/settings", icon: Settings,      label: "Settings" },
  ]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">NewMarket.co.in — Admin Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(({ href, icon: Icon, label, total, pending, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold">{total.toLocaleString()}</p>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {pending > 0 && (
              <p className="mt-1.5 text-[11px] font-semibold text-amber-600">
                {pending} pending review
              </p>
            )}
          </Link>
        ))}
      </div>

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
