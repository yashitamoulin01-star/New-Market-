import Link from "next/link"
import Image from "next/image"
import { SafeImage } from "@/components/ui/safe-image"
import { Suspense } from "react"
import {
  ChevronRight, Briefcase, Store, Eye, Building2,
  Flame, Clock, Newspaper, Zap, Pin,
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

const CAT_CHIP: Record<string, string> = {
  GENERAL:   "bg-slate-100 text-slate-700",
  EVENTS:    "bg-amber-100 text-amber-800",
  NOTICES:   "bg-red-100 text-red-700",
  BUSINESS:  "bg-primary/10 text-primary",
  COMMUNITY: "bg-green-100 text-green-800",
  SAFETY:    "bg-orange-100 text-orange-800",
  TRAFFIC:   "bg-yellow-100 text-yellow-800",
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
  if (h < 24) return `${h}घ पहले`
  if (d < 7) return `${d}दि पहले`
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

// ── Masthead strip (client component for language-aware date) ────────────

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
    <div className="border-b bg-white">
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

// ── Main news grid ────────────────────────────────────────────────

async function MainNewsSection() {
  let items: any[] = []
  try {
    items = await getCachedHomepageNews(12)
  } catch {
    items = [
      { id: "n-1", title: "New Market Association Announces Free Wi-Fi for Entire Market Premises", slug: "demo-1", category: "BUSINESS", cover_image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: true, published_at: new Date().toISOString(), view_count: 421, excerpt: "The New Market Traders Association has announced the rollout of free public Wi-Fi across the entire market complex to modernize the shopping experience." },
      { id: "n-2", title: "न्यू मार्केट में नया पार्किंग प्लाज़ा बनेगा — 500 गाड़ियों की जगह", slug: "demo-2", category: "GENERAL", cover_image_url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, published_at: new Date().toISOString(), view_count: 289 },
      { id: "n-3", title: "Winter Festival at New Market: 3-Day Cultural Programme Starting Dec 20", slug: "demo-3", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1533174000273-e18fa1f7d235?auto=format&fit=crop&q=80&w=800", is_breaking: true, is_pinned: false, published_at: new Date().toISOString(), view_count: 567 },
      { id: "n-4", title: "Alert: Fake QR Code Scam Being Reported in New Market", slug: "demo-4", category: "SAFETY", cover_image_url: "https://images.unsplash.com/photo-1595054225515-d72b217dc3e3?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, published_at: new Date().toISOString(), view_count: 892 },
      { id: "n-5", title: "बड़ी खबर: न्यू मार्केट रोड चौड़ीकरण परियोजना को मिली मंजूरी", slug: "demo-5", category: "GENERAL", cover_image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, published_at: new Date().toISOString(), view_count: 634 },
    ]
  }

  if (items.length === 0) return <EmptyNews />

  const headlineIdx = items.findIndex((a) => a.homepage_slot === "headline")
  const featured = headlineIdx >= 0 ? items[headlineIdx] : items[0]
  const rest = items.filter((a) => a.id !== featured.id)
  const tickerItems = rest.filter((a) => a.homepage_slot === "ticker")
  const nonTicker   = rest.filter((a) => a.homepage_slot !== "ticker")
  const sideStack = [...tickerItems, ...nonTicker].slice(0, 4)
  const usedIds = new Set([featured.id, ...sideStack.map((a) => a.id)])
  const secondRow = rest.filter((a) => !usedIds.has(a.id)).slice(0, 3)

  return (
    <>
      <div className="border-b bg-white">
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

      <div className="container py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FeaturedArticle article={featured} />
          </div>
          <div className="flex flex-col gap-0 divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="bg-muted/40 px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Zap size={11} className="text-amber-500" />
                <T en="Latest" hi="ताज़ा" />
              </span>
            </div>
            {sideStack.map((a) => <SideHeadline key={a.id} article={a} />)}
            <div className="px-4 py-3">
              <Link href="/news" className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline">
                <T en="View all stories" hi="सभी खबरें देखें" />
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {secondRow.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {secondRow.map((a) => <SmallNewsCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </>
  )
}

function ArticleBadges({ article }: { article: NewsCardData }) {
  return (
    <>
      {article.is_breaking && (
        <span className="breaking-badge inline-block rounded-sm bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          ⚡ Breaking
        </span>
      )}
      {article.is_pinned && !article.is_breaking && (
        <span className="inline-block rounded-sm bg-blue-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          <Pin size={8} className="inline" /> Pinned
        </span>
      )}
      {article.is_trending && (
        <span className="inline-block rounded-sm bg-orange-500/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          <Flame size={8} className="inline" /> Trending
        </span>
      )}
    </>
  )
}

function FeaturedArticle({ article }: { article: NewsCardData }) {
  const cat = article.category
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md"
    >
      {article.cover_image_url ? (
        <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
          <SafeImage src={article.cover_image_url} alt={article.title} fill priority className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-bold ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
                <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
              </span>
              <ArticleBadges article={article} />
            </div>
            <h2 className="editorial-headline text-xl font-bold leading-snug text-white sm:text-2xl line-clamp-3">
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
        </div>
      ) : (
        <div className="p-6">
          <div className={`mb-3 h-1 w-12 rounded-full ${CAT_BAR[cat] ?? CAT_BAR.GENERAL}`} />
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-bold ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
              <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
            </span>
            <ArticleBadges article={article} />
          </div>
          <h2 className="editorial-headline text-2xl font-bold leading-snug transition-colors group-hover:text-primary">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">{article.excerpt}</p>
          )}
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            {article.published_at && <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>}
            <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
          </div>
        </div>
      )}
    </Link>
  )
}

function SideHeadline({ article }: { article: NewsCardData }) {
  const cat = article.category
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-start gap-3 px-4 py-3 transition hover:bg-muted/30"
    >
      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${CAT_BAR[cat] ?? "bg-primary"}`} />
      <div className="min-w-0 flex-1">
        {article.is_breaking && (
          <span className="breaking-badge mb-0.5 inline-block rounded-sm bg-red-500 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
            Breaking
          </span>
        )}
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {article.published_at ? timeAgo(article.published_at) : ""}
        </p>
      </div>
      {article.cover_image_url && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover" />
        </div>
      )}
    </Link>
  )
}

function SmallNewsCard({ article }: { article: NewsCardData }) {
  const cat = article.category
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
    >
      {article.cover_image_url ? (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold shadow ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
              <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
            </span>
            {article.is_breaking && (
              <span className="breaking-badge rounded-sm bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">⚡</span>
            )}
          </div>
        </div>
      ) : (
        <div className={`h-1 w-full ${CAT_BAR[cat] ?? "bg-primary"}`} />
      )}
      <div className="flex flex-1 flex-col p-4">
        {!article.cover_image_url && (
          <span className={`mb-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
            <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-muted-foreground">
          <span>{article.published_at ? timeAgo(article.published_at) : ""}</span>
          <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
        </div>
      </div>
    </Link>
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
    const res = await getCachedJobs({ page: 1, limit: 4 })
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
        <span className="shrink-0 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
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
      { id: "demo-s1", name: "Radha Saree House", category: "RETAIL" },
      { id: "demo-s2", name: "City Mobile & Accessories", category: "ELECTRONICS" },
      { id: "demo-s3", name: "Sharma Footwear", category: "RETAIL" },
      { id: "demo-s4", name: "Geetanjali Jewellers", category: "RETAIL" },
    ]
  }

  if (items.length === 0) return null
  return (
    <div className="border-t bg-white py-6">
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

// ── Sidebar with election + YouTube ─────────────────────────────────────

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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-80 animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-[#f7f4f0]">
      <Suspense fallback={null}>
        <TickerSection />
      </Suspense>

      <Suspense fallback={null}>
        <MastheadStatStrip />
      </Suspense>

      <div className="bg-white">
        <Suspense fallback={<NewsGridSkeleton />}>
          <MainNewsSection />
        </Suspense>
      </div>

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
