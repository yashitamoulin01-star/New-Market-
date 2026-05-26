import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { signOutAction } from "@/lib/actions/auth"
import { adminListNews } from "@/lib/supabase/news"
import { adminListJobs } from "@/lib/supabase/jobs"
import { adminListShops } from "@/lib/supabase/shops"
import { adminListProperties } from "@/lib/supabase/property"
import {
  Newspaper, Briefcase, Store, Building2,
  Megaphone, Vote, Users, Radio, LayoutDashboard, Settings, Home, Layers,
} from "lucide-react"

async function getPendingCounts() {
  const [news, jobs, shops, property] = await Promise.allSettled([
    adminListNews({ status: "PENDING", limit: 1 }),
    adminListJobs({ status: "PENDING", limit: 1 }),
    adminListShops({ status: "PENDING", limit: 1 }),
    adminListProperties({ status: "PENDING", limit: 1 }),
  ])
  return {
    news:     news.status     === "fulfilled" ? news.value.total     : 0,
    jobs:     jobs.status     === "fulfilled" ? jobs.value.total     : 0,
    shops:    shops.status    === "fulfilled" ? shops.value.total    : 0,
    property: property.status === "fulfilled" ? property.value.total : 0,
  }
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  )
}

function SideLink({
  href,
  icon: Icon,
  label,
  badge = 0,
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
    >
      <Icon size={14} className="shrink-0" />
      <span className="flex-1">{label}</span>
      <Badge count={badge} />
    </Link>
  )
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  badge = 0,
}: {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="relative flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white active:bg-slate-700 min-w-[56px]"
    >
      <Icon size={18} />
      <span className="leading-none">{label}</span>
      {badge > 0 && (
        <span className="absolute right-0.5 top-0.5 rounded-full bg-primary px-1 text-[9px] font-bold text-white leading-none py-0.5">
          {badge}
        </span>
      )}
    </Link>
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const pending = user ? await getPendingCounts() : { news: 0, jobs: 0, shops: 0, property: 0 }
  const totalPending = pending.news + pending.jobs + pending.shops + pending.property

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex h-11 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-primary" />
          <span className="text-sm font-bold tracking-tight text-white">Newsroom</span>
          {totalPending > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
              {totalPending}
            </span>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <Home size={11} />
              View Site
            </Link>
            <span className="hidden text-xs text-slate-500 sm:inline">{user.email}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-400 transition hover:border-slate-500 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* ── Sidebar (desktop) ───────────────────────────────── */}
        {user && (
          <aside className="hidden w-52 shrink-0 border-r border-slate-800 bg-slate-900 p-3 md:block">
            <SideSection title="Overview">
              <SideLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
            </SideSection>

            <SideSection title="Content">
              <SideLink href="/admin/news"     icon={Newspaper}  label="News"     badge={pending.news} />
              <SideLink href="/admin/jobs"     icon={Briefcase}  label="Jobs"     badge={pending.jobs} />
              <SideLink href="/admin/shops"    icon={Store}      label="Shops"    badge={pending.shops} />
              <SideLink href="/admin/property" icon={Building2}  label="Property" badge={pending.property} />
            </SideSection>

            <SideSection title="Advertising">
              <SideLink href="/admin/ads" icon={Megaphone} label="Ad Manager" />
            </SideSection>

            <SideSection title="Customize">
              <SideLink href="/admin/homepage" icon={Layers} label="Homepage" />
            </SideSection>

            <SideSection title="Platform">
              <SideLink href="/admin/elections" icon={Vote}     label="Elections" />
              <SideLink href="/admin/users"     icon={Users}    label="Users" />
              <SideLink href="/admin/settings"  icon={Settings} label="Settings" />
            </SideSection>
          </aside>
        )}

        {/* ── Content wrapper ──────────────────────────────────── */}
        <div className="flex flex-1 flex-col">
          {/* Mobile nav strip */}
          {user && (
            <nav className="overflow-x-auto border-b border-slate-800 bg-slate-900 px-2 py-2 md:hidden">
              <div className="flex min-w-max gap-1">
                <MobileNavLink href="/admin"           icon={LayoutDashboard} label="Dash" />
                <MobileNavLink href="/admin/news"      icon={Newspaper}       label="News"      badge={pending.news} />
                <MobileNavLink href="/admin/jobs"      icon={Briefcase}       label="Jobs"      badge={pending.jobs} />
                <MobileNavLink href="/admin/shops"     icon={Store}           label="Shops"     badge={pending.shops} />
                <MobileNavLink href="/admin/property"  icon={Building2}       label="Property"  badge={pending.property} />
                <MobileNavLink href="/admin/ads"       icon={Megaphone}       label="Ads" />
                <MobileNavLink href="/admin/homepage"  icon={Layers}          label="Layout" />
                <MobileNavLink href="/admin/elections" icon={Vote}            label="Elections" />
                <MobileNavLink href="/admin/users"     icon={Users}           label="Users" />
                <MobileNavLink href="/admin/settings"  icon={Settings}        label="Settings" />
              </div>
            </nav>
          )}

          {/* Page content */}
          <main className="flex-1 bg-background">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
