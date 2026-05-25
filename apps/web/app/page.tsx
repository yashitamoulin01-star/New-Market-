import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { Suspense } from "react"
import {
  ChevronRight, Briefcase, Store, Eye, Building2,
  Flame, Clock, Newspaper, Zap, Pin, Vote,
} from "lucide-react"
import {
  getCachedNews, getCachedBreakingNews, getCachedHomepageNews,
  getCachedJobs, getCachedShops, getCachedProperties,
  getCachedActiveElection,
} from "@/lib/data/cached"
import { NewsTicker } from "@/components/home/news-ticker"
import { AdBanner } from "@/components/home/ad-banner"
import { ElectionTeaser } from "@/components/home/election-teaser"
import { YouTubeSection } from "@/components/home/youtube-section"
import { MastheadBar } from "@/components/home/masthead-bar"
import { T } from "@/components/ui/t"
import type { NewsCardData } from "@/lib/supabase/news"
import type { JobCardData } from "@/lib/supabase/jobs-defs"
import type { ShopCardData } from "@/lib/supabase/shops-defs"

// ── Category colors ───────────────────────────────────────────────

const CAT_DOT: Record<string, string> = {
  GENERAL:   "bg-slate-400",
  EVENTS:    "bg-amber-500",
  NOTICES:   "bg-red-500",
  BUSINESS:  "bg-primary",
  COMMUNITY: "bg-green-500",
  SAFETY:    "bg-orange-500",
  TRAFFIC:   "bg-yellow-500",
}
const CAT_BAR: Record<string, string> = {
  GENERAL:   "bg-slate-400",
  EVENTS:    "bg-amber-500",
  NOTICES:   "bg-red-500",
  BUSINESS:  "bg-primary",
  COMMUNITY: "bg-green-500",
  SAFETY:    "bg-orange-500",
  TRAFFIC:   "bg-yellow-500",
}
const CAT_HI: Record<string, string> = {
  GENERAL: "जनरल", EVENTS: "इवेंट", NOTICES: "नोटिस",
  BUSINESS: "बिज़नेस", COMMUNITY: "कम्युनिटी", SAFETY: "सेफ्टी", TRAFFIC: "ट्रैफिक",
}
const CAT_EN: Record<string, string> = {
  GENERAL: "General", EVENTS: "Events", NOTICES: "Notices",
  BUSINESS: "Business", COMMUNITY: "Community", SAFETY: "Safety", TRAFFIC: "Traffic",
}

// ── Helpers ───────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return "अभी"
  if (h < 24) return `${h} घंटे पहले`
  if (d < 7) return `${d} दिन पहले`
  return new Date(iso).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })
}

// ── Ticker ────────────────────────────────────────────────────────

async function TickerSection() {
  let headlines: { title: string; slug: string }[] = []
  try {
    let breaking = await getCachedBreakingNews(12)
    if (breaking.length < 5) {
      const { items } = await getCachedNews({ page: 1, limit: 10 })
      const ids = new Set(breaking.map((b) => b.id))
      breaking = [...breaking, ...items.filter((a) => !ids.has(a.id))].slice(0, 12)
    }
    headlines = breaking.map((a) => ({ title: a.title, slug: a.slug }))
  } catch {
    headlines = [
      { title: "New Market Free Wi-Fi Launch Delayed to Next Month", slug: "demo-1" },
      { title: "Traffic Diversion near Gate No. 2 Due to Road Repair", slug: "demo-2" },
      { title: "Winter Festival 2025 Registrations Now Open for Shopkeepers", slug: "demo-3" },
    ]
  }
  return <NewsTicker headlines={headlines} />
}

// ── Masthead strip ────────────────────────────────────────────────

async function MastheadStatStrip() {
  let stats = { news: 145, jobs: 38, shops: 312 }
  try {
    const [news, jobs, shops] = await Promise.all([
      getCachedNews({ page: 1, limit: 1 }),
      getCachedJobs({ page: 1, limit: 1 }),
      getCachedShops({ page: 1, limit: 1 }),
    ])
    if (news.total > 0) stats.news = news.total
    if (jobs.total > 0) stats.jobs = jobs.total
    if (shops.total > 0) stats.shops = shops.total
  } catch {}

  return (
    <div className="border-b section-base">
      <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5">
        <MastheadBar />
        <div className="flex items-center gap-3 text-[11px]">
          <Link href="/news" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Newspaper size={10} />
            <span><strong className="text-foreground">{stats.news}</strong> <T en="stories" hi="खबरें" /></span>
          </Link>
          <Link href="/jobs" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Briefcase size={10} />
            <span><strong className="text-foreground">{stats.jobs}</strong> <T en="jobs" hi="जॉब्स" /></span>
          </Link>
          <Link href="/shops" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Store size={10} />
            <span><strong className="text-foreground">{stats.shops}</strong> <T en="shops" hi="शॉप्स" /></span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Hero Feature Article ──────────────────────────────────────────

function HeroFeature({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative block overflow-hidden rounded-xl bg-slate-900 shadow-md transition hover:shadow-xl"
    >
      {article.cover_image_url ? (
        <>
          <div className="relative h-60 w-full lg:h-[340px]">
            <SafeImage
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {article.is_breaking && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">⚡ Breaking</span>
              )}
              {article.is_pinned && !article.is_breaking && (
                <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"><Pin size={8} className="inline" /> Pinned</span>
              )}
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Top Story</span>
            </div>
            <h2 className="editorial-headline text-xl font-bold leading-snug text-white sm:text-2xl line-clamp-3">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-sm text-white/75">{article.excerpt}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
              {article.published_at && <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>}
              <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-[240px] flex-col justify-end bg-gradient-to-br from-slate-800 to-slate-900 p-5">
          <div className={`mb-3 h-1 w-10 rounded-full ${CAT_BAR[article.category] ?? "bg-primary"}`} />
          <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Top Story</span>
          <h2 className="editorial-headline text-xl font-bold leading-snug text-white sm:text-2xl">{article.title}</h2>
          {article.excerpt && <p className="mt-1.5 text-sm text-white/70 line-clamp-3">{article.excerpt}</p>}
          <div className="mt-2 flex items-center gap-3 text-xs text-white/50">
            {article.published_at && <span>{timeAgo(article.published_at)}</span>}
            <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
          </div>
        </div>
      )}
    </Link>
  )
}

// ── Side Story Card (thumbnail right, title left) ─────────────────

function SideStoryCard({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-3 border-b border-border last:border-0 px-3 py-3 transition hover:bg-muted/30"
    >
      <div className="min-w-0 flex-1">
        {article.is_breaking && (
          <span className="mb-1 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Breaking</span>
        )}
        <p className="line-clamp-3 text-[12px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          <span className="flex items-center gap-0.5"><Eye size={9} />{article.view_count.toLocaleString()}</span>
        </div>
      </div>
      {article.cover_image_url && (
        <div className="relative h-[62px] w-[82px] shrink-0 overflow-hidden rounded-md bg-muted">
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" hideOnError />
        </div>
      )}
    </Link>
  )
}

// ── Latest Item ───────────────────────────────────────────────────

function LatestItem({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-2 border-b border-border last:border-0 px-3 py-2.5 transition hover:bg-muted/30"
    >
      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CAT_DOT[article.category] ?? "bg-primary"}`} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{article.title}</p>
        {article.published_at && <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(article.published_at)}</p>}
      </div>
      {article.cover_image_url && (
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover" hideOnError />
        </div>
      )}
    </Link>
  )
}

// ── Top Stories (no image) panel ──────────────────────────────────

function TextStoryItem({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-2 border-b border-border last:border-0 px-3 py-2.5 transition hover:bg-muted/30"
    >
      <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${CAT_DOT[article.category] ?? "bg-primary"}`} />
      <div className="min-w-0">
        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">{article.title}</p>
        {article.published_at && <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(article.published_at)}</p>}
      </div>
    </Link>
  )
}

// ── Mini News Card (2×2 grid in hero zone) ───────────────────────

function MiniNewsCard({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative flex min-h-[152px] overflow-hidden rounded-lg bg-slate-900 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      {article.cover_image_url ? (
        <>
          <SafeImage
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            hideOnError
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 opacity-20 ${CAT_BAR[article.category] ?? "bg-primary"}`} />
      )}
      <div className="relative mt-auto w-full p-2.5">
        {article.is_breaking && (
          <span className="mb-1 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">⚡ Breaking</span>
        )}
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white">
          {article.title}
        </p>
        {article.published_at && (
          <p className="mt-0.5 text-[9px] text-white/55">{timeAgo(article.published_at)}</p>
        )}
      </div>
    </Link>
  )
}

// ── Local Updates Widget (fills empty space in YouTube column) ────

async function LocalUpdatesWidget() {
  let items: NewsCardData[] = []
  try {
    const { items: news } = await getCachedNews({ page: 1, limit: 6 })
    items = news
  } catch {}
  if (!items.length) return null
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-amber-500" />
          <span className="text-sm font-bold"><T en="Local Updates" hi="स्थानीय अपडेट" /></span>
        </div>
        <Link href="/news" className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
          <T en="All News" hi="सभी खबरें" /> <ChevronRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {items.slice(0, 6).map((a) => (
          <Link
            key={a.id}
            href={`/news/${a.slug}`}
            className="group flex items-start gap-2.5 border-b px-4 py-3 transition last:border-b-0 hover:bg-muted/20 sm:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CAT_DOT[a.category] ?? "bg-primary"}`} />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[12px] font-medium leading-snug transition-colors group-hover:text-primary">{a.title}</p>
              {a.published_at && <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(a.published_at)}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Trending Card ─────────────────────────────────────────────────

function TrendingCard({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group w-[155px] shrink-0 snap-start overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative h-24 w-full overflow-hidden bg-muted">
        {article.cover_image_url ? (
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" hideOnError />
        ) : (
          <div className={`h-full w-full opacity-20 ${CAT_BAR[article.category] ?? "bg-primary"}`} />
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{article.title}</p>
        {article.published_at && <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(article.published_at)}</p>}
      </div>
    </Link>
  )
}

// ── Section Quick-Links Bar ───────────────────────────────────────

async function SectionLinksBar() {
  let stats = { news: 0, jobs: 0, shops: 0, property: 0 }
  try {
    const [news, jobs, shops, prop] = await Promise.all([
      getCachedNews({ page: 1, limit: 1 }),
      getCachedJobs({ page: 1, limit: 1 }),
      getCachedShops({ page: 1, limit: 1 }),
      getCachedProperties({ page: 1, limit: 1 }),
    ])
    stats = { news: news.total, jobs: jobs.total, shops: shops.total, property: prop.total }
  } catch {}

  const sections = [
    { href: "/news",     icon: Newspaper, labelEn: "NEWS",      labelHi: "समाचार",  subEn: `${stats.news}+ New Updates`,      subHi: `${stats.news}+ अपडेट`,     color: "text-primary",                      border: "border-l-primary" },
    { href: "/jobs",     icon: Briefcase, labelEn: "JOBS",      labelHi: "नौकरी",   subEn: `${stats.jobs} New Openings`,       subHi: `${stats.jobs} पद`,           color: "text-blue-600 dark:text-blue-400",  border: "border-l-blue-500" },
    { href: "/shops",    icon: Store,     labelEn: "SHOPS",     labelHi: "दुकानें", subEn: `${stats.shops}+ New Listings`,     subHi: `${stats.shops}+ दुकानें`,   color: "text-emerald-600 dark:text-emerald-400", border: "border-l-emerald-500" },
    { href: "/property", icon: Building2, labelEn: "PROPERTY",  labelHi: "संपत्ति", subEn: `${stats.property}+ New Properties`,subHi: `${stats.property}+ संपत्ति`, color: "text-amber-600 dark:text-amber-400", border: "border-l-amber-500" },
    { href: "/election", icon: Vote,      labelEn: "ELECTIONS", labelHi: "चुनाव",   subEn: "Latest Updates",                   subHi: "ताज़े अपडेट",                color: "text-violet-600 dark:text-violet-400", border: "border-l-violet-500" },
  ]

  return (
    <div className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {sections.map(({ href, icon: Icon, labelEn, labelHi, subEn, subHi, color, border }) => (
        <Link
          key={href}
          href={href}
          className={`group flex items-center gap-2.5 rounded-lg border-l-[3px] bg-card px-3 py-2.5 shadow-sm transition hover:shadow-md ${border}`}
        >
          <Icon size={16} className={`shrink-0 ${color}`} />
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold tracking-wide ${color}`}>
              <T en={labelEn} hi={labelHi} />
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              <T en={subEn} hi={subHi} />
            </p>
            <p className={`mt-0.5 text-[10px] font-medium ${color} group-hover:underline`}>
              <T en={`View All ${labelEn} →`} hi={`सभी देखें →`} />
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ── Job Openings (compact, for right column) ──────────────────────

async function JobOpeningsPanel() {
  let items: JobCardData[] = []
  try {
    const res = await getCachedJobs({ page: 1, limit: 5 })
    items = res.items
  } catch {}

  return (
    <div className="mt-3 overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Briefcase size={12} className="text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wide"><T en="Job Openings" hi="नौकरियाँ" /></span>
        </div>
        <Link href="/jobs" className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline">
          <T en="All Jobs" hi="सभी" /> <ChevronRight size={10} />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="px-3 py-4 text-center text-xs text-muted-foreground">
          <Link href="/jobs/post" className="text-primary hover:underline"><T en="Post first job →" hi="पोस्ट करें →" /></Link>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((job) => {
            const salary = job.salary_label
              || (job.salary_min && job.salary_max ? `₹${(job.salary_min/1000).toFixed(0)}k–${(job.salary_max/1000).toFixed(0)}k` : null)
              || (job.salary_min ? `₹${(job.salary_min/1000).toFixed(0)}k+` : null)
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} className="group flex items-start gap-2 px-3 py-2.5 transition hover:bg-muted/30">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10">
                  <Briefcase size={10} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[11px] font-semibold transition-colors group-hover:text-primary">{job.title}</p>
                  <p className="text-[10px] text-muted-foreground">{job.shop_name}</p>
                </div>
                {salary && (
                  <span className="shrink-0 rounded bg-emerald-500/15 px-1 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">{salary}</span>
                )}
              </Link>
            )
          })}
        </ul>
      )}
      <div className="border-t px-3 py-2">
        <Link href="/jobs/post" className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-2 text-[11px] font-semibold text-primary-foreground transition hover:bg-primary/90">
          + <T en="Post a Job" hi="नौकरी पोस्ट करें" />
        </Link>
      </div>
    </div>
  )
}

// ── Main News Section ─────────────────────────────────────────────

async function MainNewsSection() {
  let items: NewsCardData[] = []
  try {
    items = await getCachedHomepageNews(16)
  } catch {
    items = [
      { id: "n-1", title: "New Market Association Announces Free Wi-Fi for Entire Market Premises", slug: "demo-1", category: "BUSINESS", cover_image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: true, is_trending: true, is_featured: false, published_at: new Date(Date.now()-432000000).toISOString(), view_count: 454, excerpt: "New Market Traders Association launches free Wi-Fi for all shops and customers. 100 Mbps, 45+ access points installed across the market.", homepage_slot: "headline" } as any,
      { id: "n-2", title: "Alert: Fake QR Code Scam Being Reported in New Market", slug: "demo-2", category: "SAFETY", cover_image_url: "https://images.unsplash.com/photo-1595054225515-d72b217dc3e3?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-172800000).toISOString(), view_count: 223 } as any,
      { id: "n-3", title: "Winter Festival at New Market: 3-Day Cultural Programme Starting Dec 20", slug: "demo-3", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1533174000273-e18fa1f7d235?auto=format&fit=crop&q=80&w=800", is_breaking: true, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date(Date.now()-518400000).toISOString(), view_count: 172 } as any,
      { id: "n-4", title: "Community Cleanliness Drive This Sunday at New Market", slug: "demo-4", category: "COMMUNITY", cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-1468800000).toISOString(), view_count: 145 } as any,
      { id: "n-5", title: "Special Food Mela This Weekend at New Market", slug: "demo-5", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date(Date.now()-1382400000).toISOString(), view_count: 128 } as any,
      { id: "n-6", title: "बड़ी खबर: न्यू मार्केट रोड चौड़ीकरण परियोजना को मिली मंजूरी", slug: "demo-6", category: "GENERAL", cover_image_url: null, is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-345600000).toISOString(), view_count: 634 } as any,
      { id: "n-7", title: "Traffic Diversion Near New Market Due to Road Repair Work", slug: "demo-7", category: "TRAFFIC", cover_image_url: null, is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-432000000).toISOString(), view_count: 312 } as any,
      { id: "n-8", title: "Water Supply Disruption on May 26 Due to Pipeline Work", slug: "demo-8", category: "NOTICES", cover_image_url: null, is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-518400000).toISOString(), view_count: 189 } as any,
    ]
  }

  if (items.length === 0) return <EmptyNews />

  const headlineIdx = items.findIndex((a) => a.homepage_slot === "headline")
  const featured = headlineIdx >= 0 ? items[headlineIdx] : items[0]
  const rest = items.filter((a) => a.id !== featured.id)

  // Side stories: prefer items with images for the thumbnail column
  const withImages = rest.filter((a) => a.cover_image_url)
  const noImages   = rest.filter((a) => !a.cover_image_url)
  const sideStories  = [...withImages, ...noImages].slice(0, 4)
  const latestItems  = items.slice(0, 8)
  const textStories  = noImages.slice(0, 6)
  const trendingItems = (() => {
    const t = items.filter((a) => a.is_trending && a.cover_image_url)
    return t.length >= 3 ? t : withImages
  })().slice(0, 5)

  return (
    <div className="section-base">
      {/* Top banner ad — full width, conditional */}
      <Suspense fallback={null}>
        <AdBanner slot="homepage-top" size="leaderboard" className="border-b" />
      </Suspense>

      {/* Section header */}
      <div className="border-b">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <span className="editorial-headline text-sm font-bold">
              <T en="Top Stories" hi="प्रमुख समाचार" />
            </span>
          </div>
          <Link href="/news" className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
            <T en="All News" hi="सभी खबरें" /> <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── MAIN ZONE: [left-ad] [center-grid] [right-ad] ── */}
      <div className="container py-4">
        <div className="flex items-start gap-3">

          {/* Left sidebar ad — disappears when no active ad */}
          <Suspense fallback={null}>
            <AdBanner slot="homepage-left" size="skyscraper" className="hidden xl:block shrink-0 rounded-lg overflow-hidden border" />
          </Suspense>

          {/* Center content */}
          <div className="min-w-0 flex-1">

            {/* Hero zone: 50/50 split */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {/* Left 50%: Featured story */}
              <HeroFeature article={featured} />

              {/* Right 50%: 2×2 mini card grid */}
              <div className="grid grid-cols-2 gap-2">
                {sideStories.slice(0, 4).map((a) => (
                  <MiniNewsCard key={a.id} article={a} />
                ))}
              </div>
            </div>

            {/* Below hero: Latest + Jobs side by side */}
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
              {/* Latest scrollable */}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Zap size={10} className="text-amber-500" />
                    <T en="Latest" hi="ताज़ा" />
                  </span>
                  <Link href="/news" className="text-[10px] font-semibold text-primary hover:underline">
                    <T en="View All" hi="सभी" />
                  </Link>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                  {latestItems.map((a) => <LatestItem key={a.id} article={a} />)}
                </div>
                <div className="border-t px-3 py-2">
                  <Link href="/news" className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                    <T en="View all stories" hi="सभी खबरें" /> <ChevronRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Job openings */}
              <Suspense fallback={null}>
                <JobOpeningsPanel />
              </Suspense>
            </div>

            {/* Section quick-links bar */}
            <Suspense fallback={null}>
              <SectionLinksBar />
            </Suspense>

            {/* Trending + Text stories row */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
              {/* Trending */}
              {trendingItems.length > 0 && (
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-bold">
                      <Flame size={14} className="text-orange-500" />
                      <T en="Trending in New Market" hi="न्यू मार्केट में ट्रेंडिंग" />
                    </span>
                    <Link href="/news" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">
                      <T en="View All" hi="सभी" /> <ChevronRight size={11} />
                    </Link>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                    {trendingItems.map((a) => <TrendingCard key={a.id} article={a} />)}
                  </div>
                </div>
              )}

              {/* Top stories no image */}
              {textStories.length > 0 && (
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="border-b bg-muted/40 px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <T en="Top Stories (No Image)" hi="प्रमुख खबरें" />
                    </span>
                  </div>
                  <div>
                    {textStories.map((a) => <TextStoryItem key={a.id} article={a} />)}
                  </div>
                  <div className="border-t px-3 py-2">
                    <Link href="/news" className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                      <T en="View All" hi="सभी खबरें" /> <ChevronRight size={11} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
          {/* end center content */}

          {/* Right sidebar ad — disappears when no active ad */}
          <Suspense fallback={null}>
            <AdBanner slot="homepage-right" size="skyscraper" className="hidden xl:block shrink-0 rounded-lg overflow-hidden border" />
          </Suspense>

        </div>
      </div>
    </div>
  )
}

function EmptyNews() {
  return (
    <div className="container py-10">
      <div className="rounded-xl border border-dashed bg-card py-16 text-center">
        <p className="mb-2 font-medium text-muted-foreground">
          <T en="No published news yet." hi="अभी कोई समाचार नहीं।" />
        </p>
        <Link href="/news/submit" className="text-sm text-primary hover:underline">
          <T en="Be the first to share a story →" hi="पहली खबर भेजें →" />
        </Link>
      </div>
    </div>
  )
}

// ── Shops strip ───────────────────────────────────────────────────

async function ShopsStripSection() {
  let items: any[] = []
  try {
    const res = await getCachedShops({ page: 1, limit: 4 })
    items = res.items
  } catch {
    items = [
      { id: "demo-s1", name: "Radha Saree House", category: "CLOTHING" },
      { id: "demo-s2", name: "City Mobile & Accessories", category: "ELECTRONICS" },
      { id: "demo-s3", name: "Sharma Footwear", category: "FOOTWEAR" },
      { id: "demo-s4", name: "Geetanjali Jewellers", category: "JEWELRY" },
    ]
  }

  if (items.length === 0) return null
  return (
    <div className="border-t section-base py-5">
      <div className="container">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <span className="text-sm font-bold"><T en="Featured Shops" hi="लोकप्रिय दुकानें" /></span>
          </div>
          <Link href="/shops" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">
            <T en="Directory" hi="डायरेक्टरी" /> <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((shop) => (
            <Link
              key={shop.id}
              href={`/shops/${shop.id}`}
              className="group flex items-center gap-2.5 overflow-hidden rounded-lg border bg-card px-3 py-2.5 shadow-sm transition hover:shadow hover:-translate-y-0.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Store size={13} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 text-[12px] font-semibold transition-colors group-hover:text-primary">{shop.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  <T en={CAT_EN[shop.category] ?? shop.category} hi={CAT_HI[shop.category] ?? shop.category} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Property teaser ───────────────────────────────────────────────

async function PropertyTeaserSection() {
  let items: any[] = []
  let total = 0
  try {
    const res = await getCachedProperties({ page: 1, limit: 2 })
    items = res.items; total = res.total
  } catch {
    items = [
      { id: "demo-p1", title: "Corner Kiosk Available — Food Court Area", listing_type: "RENT", price: 8000, area_sqft: 80 },
      { id: "demo-p2", title: "Showroom Space for Sale — Main Road", listing_type: "SALE", price: 7500000, area_sqft: 750 },
    ]
    total = 12
  }

  if (total === 0) return null
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-primary" />
          <span className="text-sm font-bold"><T en="Property" hi="प्रॉपर्टी" /></span>
        </div>
        <Link href="/property" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">
          <T en={`${total} listings`} hi={`${total} लिस्टिंग`} /> <ChevronRight size={12} />
        </Link>
      </div>
      <ul className="divide-y">
        {items.map((p) => (
          <Link key={p.id} href={`/property/${p.id}`} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/30">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 size={13} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[13px] font-semibold transition-colors group-hover:text-primary">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {p.listing_type === "RENT" ? <T en="For Rent" hi="किराये पर" /> : p.listing_type === "SALE" ? <T en="For Sale" hi="बिक्री हेतु" /> : <T en="Lease" hi="लीज़" />}
                {p.area_sqft ? ` · ${p.area_sqft} sqft` : ""}
              </p>
            </div>
            {p.price && <span className="shrink-0 text-xs font-bold text-primary">₹{(p.price/1000).toFixed(0)}k</span>}
          </Link>
        ))}
      </ul>
      <div className="border-t px-4 py-3">
        <Link href="/property/list" className="flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-xs font-semibold transition hover:bg-muted">
          + <T en="List a Property" hi="संपत्ति लिस्ट करें" />
        </Link>
      </div>
    </div>
  )
}

// ── Sidebar: election + property ─────────────────────────────────

async function SidebarSection() {
  const election = await getCachedActiveElection().catch(() => null)
  return (
    <div className="flex flex-col gap-4">
      <ElectionTeaser election={election} />
      <Suspense fallback={null}>
        <PropertyTeaserSection />
      </Suspense>
    </div>
  )
}

// ── Community strip ───────────────────────────────────────────────

function CommunityStrip() {
  return (
    <div className="border-t bg-primary">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <p className="editorial-headline text-base font-bold text-primary-foreground">
            <T en="Something happening in New Market?" hi="न्यू मार्केट में कुछ हो रहा है?" />
          </p>
          <p className="text-xs text-primary-foreground/60">
            <T en="Share news, list your shop, post a job or property." hi="खबर भेजें, दुकान लिस्ट करें, नौकरी या संपत्ति पोस्ट करें।" />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/news/submit" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-white/90"><T en="Submit News" hi="खबर भेजें" /></Link>
          <Link href="/jobs/post" className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/70 hover:bg-white/10"><T en="Post Job" hi="नौकरी" /></Link>
          <Link href="/shops/add" className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/70 hover:bg-white/10"><T en="Add Shop" hi="दुकान" /></Link>
          <Link href="/property/list" className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/70 hover:bg-white/10"><T en="Property" hi="संपत्ति" /></Link>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────

function NewsGridSkeleton() {
  return (
    <div className="container py-4" aria-hidden="true">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_270px_260px]">
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
        <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-20 animate-pulse rounded-lg bg-muted"/>)}</div>
        <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="section-alt">
      <Suspense fallback={null}><TickerSection /></Suspense>
      <Suspense fallback={null}><MastheadStatStrip /></Suspense>

      <Suspense fallback={<NewsGridSkeleton />}>
        <MainNewsSection />
      </Suspense>

      <Suspense fallback={null}>
        <AdBanner slot="homepage-mid-1" size="leaderboard" />
      </Suspense>

      <div className="container py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Suspense fallback={null}><YouTubeSection /></Suspense>
            <Suspense fallback={null}><LocalUpdatesWidget /></Suspense>
          </div>
          <Suspense fallback={null}><SidebarSection /></Suspense>
        </div>
      </div>

      <Suspense fallback={null}><ShopsStripSection /></Suspense>

      <Suspense fallback={null}>
        <AdBanner slot="homepage-bottom" size="strip" />
      </Suspense>

      <CommunityStrip />
    </div>
  )
}
