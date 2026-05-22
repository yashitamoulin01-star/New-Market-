import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { signOutAction } from "@/lib/actions/auth"
import { adminListNews } from "@/lib/supabase/news"
import { adminListJobs } from "@/lib/supabase/jobs"
import { adminListShops } from "@/lib/supabase/shops"
import { adminListProperties } from "@/lib/supabase/property"
import { Newspaper, Briefcase, Store, Building2, Radio, MessageSquare } from "lucide-react"

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

function NavLink({
  href,
  icon: Icon,
  label,
  pending,
}: {
  href: string
  icon: React.ElementType
  label: string
  pending: number
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon size={14} className="shrink-0" />
      {label}
      {pending > 0 && (
        <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
          {pending}
        </span>
      )}
    </Link>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pending = user ? await getPendingCounts() : { news: 0, jobs: 0, shops: 0, property: 0 }
  const totalPending = pending.news + pending.jobs + pending.shops + pending.property

  return (
    <div>
      {user && (
        <div className="border-b bg-slate-900 text-white">
          <div className="container flex items-center justify-between py-2.5">
            {/* Brand + nav */}
            <div className="flex items-center gap-1">
              {/* Newsroom brand */}
              <div className="mr-3 flex items-center gap-1.5">
                <Radio size={14} className="text-primary" />
                <span className="text-sm font-bold tracking-tight text-white">Newsroom</span>
                {totalPending > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {totalPending}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5">
                <NavLink href="/admin/news"     icon={Newspaper}     label="News"     pending={pending.news} />
                <NavLink href="/admin/jobs"     icon={Briefcase}     label="Jobs"     pending={pending.jobs} />
                <NavLink href="/admin/shops"    icon={Store}         label="Shops"    pending={pending.shops} />
                <NavLink href="/admin/property" icon={Building2}     label="Property" pending={pending.property} />
                <NavLink href="/admin/comments" icon={MessageSquare} label="Comments" pending={0} />
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-white/50 sm:inline">{user.email}</span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-white/20 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
