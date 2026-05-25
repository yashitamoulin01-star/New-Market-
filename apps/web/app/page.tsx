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

// ── Category config ───────────────────────────────────────────────

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
  let headlines: { title: string, slug: string }[] = []
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
          <div className="relative h-64 w-full sm:h-80 lg:h-[420px]">
            <SafeImage
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {article.is_breaking && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  ⚡ Breaking
                </span>
              )}
              {article.is_pinned && !article.is_breaking && (
                <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Pin size={8} className="inline" /> Pinned
                </span>
              )}
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Top Story
              </span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl line-clamp-3 editorial-headline">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm text-white/75">{article.excerpt}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
              {article.published_at && (
                <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>
              )}
              <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-[280px] flex-col justify-end bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <div className={`mb-3 h-1 w-12 rounded-full ${CAT_BAR[article.category] ?? "bg-primary"}`} />
          <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Top Story
          </span>
          <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl editorial-headline">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 text-sm text-white/70 line-clamp-3">{article.excerpt}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
            {article.published_at && <span>{timeAgo(article.published_at)}</span>}
            <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
          </div>
        </div>
      )}
    </Link>
  )
}

// ── Side Stories Column ───────────────────────────────────────────

function SideStoryCard({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 transition hover:bg-muted/30"
    >
      <div className="min-w-0 flex-1">
        {article.is_breaking && (
          <span className="mb-1 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            Breaking
          </span>
        )}
        <p className="line-clamp-3 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {article.published_at && <span>{timeAgo(article.published_at)}</span>}
          <span className="flex items-center gap-0.5"><Eye size={9} />{article.view_count.toLocaleString()}</span>
        </div>
      </div>
      {article.cover_image_url && (
        <div className="relative h-[68px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-muted">
          <SafeImage
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            hideOnError
          />
        </div>
      )}
    </Link>
  )
}

// ── Latest Panel ──────────────────────────────────────────────────

function LatestItem({ article }: { article: NewsCardData }) {
  const dot = CAT_DOT[article.category] ?? "bg-primary"
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-2.5 border-b border-border px-4 py-3 last:border-0 transition hover:bg-muted/30"
    >
      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </p>
        {article.published_at && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(article.published_at)}</p>
        )}
      </div>
      {article.cover_image_url && (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover" hideOnError />
        </div>
      )}
    </Link>
  )
}

// ── Trending Card ─────────────────────────────────────────────────

function TrendingCard({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group w-[160px] shrink-0 snap-start overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative h-28 w-full overflow-hidden bg-muted">
        {article.cover_image_url ? (
          <SafeImage
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            hideOnError
          />
        ) : (
          <div className={`h-full w-full ${CAT_BAR[article.category] ?? "bg-primary"} opacity-20`} />
        )}
      </div>
      <div className="p-2.5">
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </p>
        {article.published_at && (
          <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(article.published_at)}</p>
        )}
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

  return (
    <div className="my-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {[
        { href: "/news",     icon: Newspaper, label: "NEWS",      sublabel: `${stats.news}+ खबरें`,          color: "text-primary" },
        { href: "/jobs",     icon: Briefcase, label: "JOBS",      sublabel: `${stats.jobs} openings`,         color: "text-blue-600 dark:text-blue-400" },
        { href: "/shops",    icon: Store,     label: "SHOPS",     sublabel: `${stats.shops} listed`,          color: "text-emerald-600 dark:text-emerald-400" },
        { href: "/property", icon: Building2, label: "PROPERTY",  sublabel: `${stats.property} listings`,     color: "text-amber-600 dark:text-amber-400" },
        { href: "/election", icon: Vote,      label: "ELECTIONS", sublabel: "Latest Updates",                 color: "text-violet-600 dark:text-violet-400" },
      ].map(({ href, icon: Icon, label, sublabel, color }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm transition hover:shadow-md hover:border-primary/40"
        >
          <div className={`shrink-0 ${color}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-bold tracking-wide ${color}`}>{label}</p>
            <p className="text-[10px] text-muted-foreground truncate">{sublabel}</p>
          </div>
          <ChevronRight size={13} className="ml-auto shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </Link>
      ))}
    </div>
  )
}

// ── Main News Section ─────────────────────────────────────────────

async function MainNewsSection() {
  let items: NewsCardData[] = []
  try {
    items = await getCachedHomepageNews(14)
  } catch {
    items = [
      { id: "n-1", title: "New Market Association Announces Free Wi-Fi for Entire Market Premises", slug: "demo-1", category: "BUSINESS", cover_image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: true, is_trending: true, is_featured: false, published_at: new Date().toISOString(), view_count: 421, excerpt: "The New Market Traders Association has announced the rollout of free public Wi-Fi across the entire market complex to modernize the shopping experience.", homepage_slot: "headline" } as any,
      { id: "n-2", title: "न्यू मार्केट में नया पार्किंग प्लाज़ा बनेगा — 500 गाड़ियों की जगह", slug: "demo-2", category: "GENERAL", cover_image_url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date().toISOString(), view_count: 289 } as any,
      { id: "n-3", title: "Winter Festival at New Market: 3-Day Cultural Programme Starting Dec 20", slug: "demo-3", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1533174000273-e18fa1f7d235?auto=format&fit=crop&q=80&w=800", is_breaking: true, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date().toISOString(), view_count: 567 } as any,
      { id: "n-4", title: "Alert: Fake QR Code Scam Being Reported in New Market", slug: "demo-4", category: "SAFETY", cover_image_url: "https://images.unsplash.com/photo-1595054225515-d72b217dc3e3?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date().toISOString(), view_count: 892 } as any,
      { id: "n-5", title: "बड़ी खबर: न्यू मार्केट रोड चौड़ीकरण परियोजना को मिली मंजूरी", slug: "demo-5", category: "GENERAL", cover_image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date().toISOString(), view_count: 634 } as any,
      { id: "n-6", title: "Community Cleanliness Drive This Sunday at New Market", slug: "demo-6", category: "COMMUNITY", cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date().toISOString(), view_count: 298 } as any,
      { id: "n-7", title: "Special Food Mela This Weekend at New Market", slug: "demo-7", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date().toISOString(), view_count: 445 } as any,
    ]
  }

  if (items.length === 0) return <EmptyNews />

  const headlineIdx = items.findIndex((a) => a.homepage_slot === "headline")
  const featured = headlineIdx >= 0 ? items[headlineIdx] : items[0]
  const rest = items.filter((a) => a.id !== featured.id)

  const sideStories = rest.slice(0, 4)
  const latestItems = items.slice(0, 8)
  const trendingItems = (() => {
    const t = items.filter((a) => a.is_trending)
    return t.length >= 3 ? t : items
  })().slice(0, 6)

  return (
    <div className="section-base">
      {/* Top banner ad */}
      <Suspense fallback={null}>
        <AdBanner slot="homepage-top" size="leaderboard" className="border-b" />
      </Suspense>

      {/* Section header */}
      <div className="border-b">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <span className="text-sm font-bold editorial-headline">
              <T en="Top Stories" hi="प्रमुख समाचार" />
            </span>
          </div>
          <Link href="/news" className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
            <T en="All News" hi="सभी खबरें" />
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main news zone: [left-ad] [news grid] [right-ad] */}
      <div className="container py-4">
        <div className="flex items-start gap-3">
          {/* Left sidebar ad — collapses when no ad */}
          <Suspense fallback={null}>
            <AdBanner slot="homepage-left" size="skyscraper" className="hidden lg:block shrink-0 rounded-lg overflow-hidden border" />
          </Suspense>

          {/* Center news grid */}
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px_248px]">
              {/* Col 1: Hero feature */}
              <HeroFeature article={featured} />

              {/* Col 2: Side stories */}
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="border-b bg-muted/40 px-4 py-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <T en="Latest Stories" hi="ताज़ी खबरें" />
                  </span>
                </div>
                <div>
                  {sideStories.map((a) => <SideStoryCard key={a.id} article={a} />)}
                </div>
                <div className="border-t px-4 py-2.5">
                  <Link href="/news" className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <T en="View all stories" hi="सभी खबरें देखें" />
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Col 3: Latest scrollable panel */}
              <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="shrink-0 border-b bg-muted/40 px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <Zap size={11} className="text-amber-500" />
                      <T en="Latest" hi="ताज़ा" />
                    </span>
                    <Link href="/news" className="text-[10px] font-semibold text-primary hover:underline">
                      <T en="View All" hi="सभी" />
                    </Link>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 380 }}>
                  {latestItems.map((a) => <LatestItem key={a.id} article={a} />)}
                </div>
                <div className="shrink-0 border-t px-4 py-2.5">
                  <Link href="/news" className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <T en="All news" hi="सभी खबरें" />
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Section quick-links */}
            <Suspense fallback={null}>
              <SectionLinksBar />
            </Suspense>

            {/* Trending section */}
            {trendingItems.length > 0 && (
              <div className="mt-2 mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <Flame size={15} className="text-orange-500" />
                    <T en="Trending in New Market" hi="न्यू मार्केट में ट्रेंडिंग" />
                  </span>
                  <Link href="/news" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">
                    <T en="View All" hi="सभी" /> <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                  {trendingItems.map((a) => <TrendingCard key={a.id} article={a} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar ad — collapses when no ad */}
          <Suspense fallback={null}>
            <AdBanner slot="homepage-right" size="skyscraper" className="hidden lg:block shrink-0 rounded-lg overflow-hidden border" />
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

// ── Jobs section ──────────────────────────────────────────────────

async function JobsSection() {
  let items: any[] = []
  try {
    const res = await getCachedJobs({ page: 1, limit: 5 })
    items = res.items
  } catch {
    items = [
      { id: "demo-j1", title: "Cashier / Billing Executive", shop_name: "Radha Saree House", salary_min: 9000, salary_max: 12000, salary_label: null },
      { id: "demo-j2", title: "Smartphone Repair Technician", shop_name: "City Mobile", salary_min: 12000, salary_max: 20000, salary_label: null },
      { id: "demo-j3", title: "Salesperson — Footwear", shop_name: "Sharma Footwear", salary_min: 8000, salary_max: 10000, salary_label: null },
      { id: "demo-j4", title: "Jewellery Sales Executive", shop_name: "Geetanjali Jewellers", salary_min: 15000, salary_max: 22000, salary_label: null },
    ]
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-primary" />
          <span className="text-sm font-bold"><T en="Job Openings" hi="नई नौकरियाँ" /></span>
        </div>
        <Link href="/jobs" className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline">
          <T en="All Jobs" hi="सभी" /> <ChevronRight size={12} />
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          <Link href="/jobs/post" className="text-primary hover:underline">
            <T en="Post the first job →" hi="पहली नौकरी पोस्ट करें →" />
          </Link>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((job) => <JobRow key={job.id} job={job} />)}
        </ul>
      )}
      <div className="border-t px-4 py-3">
        <Link
          href="/jobs/post"
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          + <T en="Post a Job" hi="नौकरी पोस्ट करें" />
        </Link>
      </div>
    </div>
  )
}

function JobRow({ job }: { job: JobCardData }) {
  const salaryLabel =
    job.salary_label
    || (job.salary_min && job.salary_max ? `₹${(job.salary_min/1000).toFixed(0)}k–${(job.salary_max/1000).toFixed(0)}k` : null)
    || (job.salary_min ? `₹${(job.salary_min/1000).toFixed(0)}k+` : null)

  return (
    <Link href={`/jobs/${job.id}`} className="group flex items-start gap-3 px-4 py-3 transition hover:bg-muted/30">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Briefcase size={13} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13px] font-semibold transition-colors group-hover:text-primary">
          {job.title}
        </p>
        <p className="text-[11px] text-muted-foreground">{job.shop_name}</p>
      </div>
      {salaryLabel && (
        <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          {salaryLabel}
        </span>
      )}
    </Link>
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
    <div className="border-t section-base py-6">
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
          {items.map((shop) => <ShopChip key={shop.id} shop={shop} />)}
        </div>
      </div>
    </div>
  )
}

function ShopChip({ shop }: { shop: ShopCardData }) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group flex items-center gap-2.5 overflow-hidden rounded-lg border bg-card px-3 py-2.5 shadow-sm transition hover:shadow hover:-translate-y-0.5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Store size={13} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="line-clamp-1 text-[12px] font-semibold transition-colors group-hover:text-primary">
          {shop.name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          <T en={CAT_EN[shop.category] ?? shop.category} hi={CAT_HI[shop.category] ?? shop.category} />
        </p>
      </div>
    </Link>
  )
}

// ── Property teaser ───────────────────────────────────────────────

async function PropertyTeaserSection() {
  let items: any[] = []
  let total = 0
  try {
    const res = await getCachedProperties({ page: 1, limit: 2 })
    items = res.items
    total = res.total
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
          <Link
            key={p.id}
            href={`/property/${p.id}`}
            className="group flex items-center gap-3 px-4 py-3 transition hover:bg-muted/30"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 size={13} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[13px] font-semibold transition-colors group-hover:text-primary">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {p.listing_type === "RENT" ? <T en="For Rent" hi="किराये पर" /> :
                 p.listing_type === "SALE" ? <T en="For Sale" hi="बिक्री हेतु" /> :
                 <T en="Lease" hi="लीज़" />}
                {p.area_sqft ? ` · ${p.area_sqft} sqft` : ""}
              </p>
            </div>
            {p.price && (
              <span className="shrink-0 text-xs font-bold text-primary">
                ₹{(p.price / 1000).toFixed(0)}k
              </span>
            )}
          </Link>
        ))}
      </ul>
      <div className="border-t px-4 py-3">
        <Link
          href="/property/list"
          className="flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-xs font-semibold transition hover:bg-muted"
        >
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
            <T
              en="Share news, list your shop, post a job or property."
              hi="खबर भेजें, दुकान लिस्ट करें, नौकरी या संपत्ति पोस्ट करें।"
            />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/news/submit" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-white/90">
            <T en="Submit News" hi="खबर भेजें" />
          </Link>
          <Link href="/jobs/post" className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/70 hover:bg-white/10">
            <T en="Post Job" hi="नौकरी" />
          </Link>
          <Link href="/shops/add" className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/70 hover:bg-white/10">
            <T en="Add Shop" hi="दुकान" />
          </Link>
          <Link href="/property/list" className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-white/70 hover:bg-white/10">
            <T en="Property" hi="संपत्ति" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────

function NewsGridSkeleton() {
  return (
    <div className="container py-4" aria-hidden="true">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px_248px]">
        <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-0">
          {[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded bg-muted mb-2" />)}
        </div>
        <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="section-alt">
      <Suspense fallback={null}>
        <TickerSection />
      </Suspense>

      <Suspense fallback={null}>
        <MastheadStatStrip />
      </Suspense>

      <Suspense fallback={<NewsGridSkeleton />}>
        <MainNewsSection />
      </Suspense>

      <Suspense fallback={null}>
        <AdBanner slot="homepage-mid-1" size="leaderboard" />
      </Suspense>

      <div className="container py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Suspense fallback={null}>
              <JobsSection />
            </Suspense>
            <Suspense fallback={null}>
              <YouTubeSection />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <SidebarSection />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <ShopsStripSection />
      </Suspense>

      <Suspense fallback={null}>
        <AdBanner slot="homepage-bottom" size="strip" />
      </Suspense>

      <CommunityStrip />
    </div>
  )
}
