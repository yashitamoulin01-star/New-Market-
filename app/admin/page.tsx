import Link from "next/link"
import { Newspaper, Briefcase, Store, Building2, Users, Megaphone, TrendingUp, Clock } from "lucide-react"
import { adminListNews } from "@/lib/supabase/news"
import { adminListJobs } from "@/lib/supabase/jobs"
import { adminListShops } from "@/lib/supabase/shops"
import { adminListProperties } from "@/lib/supabase/property"
import { adminListAds } from "@/lib/supabase/ads"
import { createAdminClient } from "@/lib/supabase/admin-client"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Dashboard" }

async function getStats() {
  const [news, jobs, shops, property, ads] = await Promise.allSettled([
    adminListNews({ limit: 1 }),
    adminListJobs({ limit: 1 }),
    adminListShops({ limit: 1 }),
    adminListProperties({ limit: 1 }),
    adminListAds(),
  ])

  const [pendingNews, pendingJobs, pendingShops, pendingProperty] = await Promise.allSettled([
    adminListNews({ status: "PENDING", limit: 1 }),
    adminListJobs({ status: "PENDING", limit: 1 }),
    adminListShops({ status: "PENDING", limit: 1 }),
    adminListProperties({ status: "PENDING", limit: 1 }),
  ])

  let userCount = 0
  try {
    const admin = createAdminClient()
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 })
    userCount = (data as { total?: number }).total ?? 0
  } catch { /* service key not configured */ }

  return {
    news:        news.status === "fulfilled" ? news.value.total : 0,
    jobs:        jobs.status === "fulfilled" ? jobs.value.total : 0,
    shops:       shops.status === "fulfilled" ? shops.value.total : 0,
    property:    property.status === "fulfilled" ? property.value.total : 0,
    activeAds:   ads.status === "fulfilled" ? ads.value.filter(a => a.is_active).length : 0,
    totalAds:    ads.status === "fulfilled" ? ads.value.length : 0,
    userCount,
    pendingNews:     pendingNews.status === "fulfilled" ? pendingNews.value.total : 0,
    pendingJobs:     pendingJobs.status === "fulfilled" ? pendingJobs.value.total : 0,
    pendingShops:    pendingShops.status === "fulfilled" ? pendingShops.value.total : 0,
    pendingProperty: pendingProperty.status === "fulfilled" ? pendingProperty.value.total : 0,
  }
}

export default async function AdminDashboardPage() {
  const s = await getStats()

  const totalPending = s.pendingNews + s.pendingJobs + s.pendingShops + s.pendingProperty

  const cards = [
    { label: "News Articles", count: s.news, pending: s.pendingNews, href: "/admin/news", icon: Newspaper, color: "text-blue-600" },
    { label: "Job Listings",  count: s.jobs, pending: s.pendingJobs, href: "/admin/jobs", icon: Briefcase, color: "text-emerald-600" },
    { label: "Shops",         count: s.shops, pending: s.pendingShops, href: "/admin/shops", icon: Store, color: "text-amber-600" },
    { label: "Properties",    count: s.property, pending: s.pendingProperty, href: "/admin/property", icon: Building2, color: "text-violet-600" },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          NewMarket.co.in — Full control panel
        </p>
      </div>

      {/* Urgent: pending items */}
      {totalPending > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Clock size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">
              {totalPending} submission{totalPending !== 1 ? "s" : ""} awaiting review
            </p>
            <p className="text-xs text-amber-700">
              {[
                s.pendingNews     > 0 && `${s.pendingNews} news`,
                s.pendingJobs     > 0 && `${s.pendingJobs} jobs`,
                s.pendingShops    > 0 && `${s.pendingShops} shops`,
                s.pendingProperty > 0 && `${s.pendingProperty} property`,
              ].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Overview cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Link key={c.href} href={c.href} className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <Icon size={20} className={c.color} />
                {c.pending > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {c.pending}
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-extrabold">{c.count.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              {c.pending > 0 && (
                <p className="mt-1 text-xs font-medium text-amber-600">{c.pending} pending</p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/users" className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <span className="text-sm font-semibold">Registered Users</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold">{s.userCount > 0 ? s.userCount.toLocaleString() : "—"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {s.userCount === 0 ? "Add SUPABASE_SERVICE_ROLE_KEY to view" : "Manage accounts, bans"}
          </p>
        </Link>

        <Link href="/admin/ads" className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-pink-600" />
            <span className="text-sm font-semibold">Advertisements</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold">{s.activeAds} <span className="text-lg font-medium text-muted-foreground">/ {s.totalAds}</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">Active ads / total slots</p>
        </Link>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="text-sm font-semibold">Total Listings</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold">
            {(s.news + s.jobs + s.shops + s.property).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Across all categories</p>
        </div>
      </div>
    </div>
  )
}
