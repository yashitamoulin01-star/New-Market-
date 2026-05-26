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
  getCachedActiveElection, getCachedHomepageSettings,
} from "@/lib/data/cached"
import { NewsTicker } from "@/components/home/news-ticker"
import { AdBanner } from "@/components/home/ad-banner"
import { ElectionTeaser } from "@/components/home/election-teaser"
import { YouTubeSection } from "@/components/home/youtube-section"
import { MastheadBar } from "@/components/home/masthead-bar"
import { T } from "@/components/ui/t"
import type { NewsCardData } from "@/lib/supabase/news"
import type { JobCardData } from "@/lib/supabase/jobs-defs"
import type { HomepageSettings } from "@/lib/supabase/homepage-settings"

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

// ── Hero Feature Article (photo overlay style) ────────────────────

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
            <h2 className="editorial-headline text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-[34px] line-clamp-3">
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
          <h2 className="editorial-headline text-2xl font-bold leading-snug text-white sm:text-3xl">{article.title}</h2>
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

// ── Hero Feature (ET Retail text-split style) ─────────────────────

function HeroFeatureTextSplit({ article }: { article: NewsCardData }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card shadow-md transition hover:shadow-xl"
    >
      <div className="flex min-h-[240px] flex-col lg:flex-row lg:min-h-[300px]">
        {/* Text side */}
        <div className="flex flex-1 flex-col justify-between p-5 lg:p-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {article.is_breaking && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">⚡ Breaking</span>
              )}
              {article.is_pinned && !article.is_breaking && (
                <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Pinned</span>
              )}
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Top Story</span>
            </div>
            <h2 className="editorial-headline text-xl font-extrabold leading-tight text-foreground sm:text-2xl lg:text-[26px] line-clamp-4">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="mt-2.5 line-clamp-3 text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            {article.published_at && <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>}
            <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
            <span className="ml-auto text-[10px] font-semibold text-primary transition-colors group-hover:text-primary/70">Read Full Story →</span>
          </div>
        </div>
        {/* Image side */}
        {article.cover_image_url ? (
          <div className="relative h-[180px] overflow-hidden lg:h-auto lg:w-[42%] shrink-0">
            <SafeImage
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              hideOnError
            />
          </div>
        ) : (
          <div className={`hidden lg:block lg:w-[42%] shrink-0 ${CAT_BAR[article.category] ?? "bg-primary"} opacity-10`} />
        )}
      </div>
    </Link>
  )
}

// ── ETRetail Feature Story (below hero, text-left image-right) ────

function ETRetailFeatureStory({ article }: { article: NewsCardData }) {
  if (!article) return null
  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          {article.is_breaking && (
            <span className="mb-2 inline-block rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">⚡ Breaking</span>
          )}
          <h3 className="editorial-headline text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-4 sm:text-2xl lg:text-[28px]">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.excerpt}</p>
          )}
          <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
            {article.published_at && <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>}
            <span className="flex items-center gap-0.5"><Eye size={9} />{article.view_count.toLocaleString()}</span>
            <span className="ml-auto text-[10px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">Read more →</span>
          </div>
        </div>
        {article.cover_image_url && (
          <div className="relative hidden h-[145px] w-[190px] shrink-0 overflow-hidden rounded-sm bg-muted sm:block">
            <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" hideOnError />
          </div>
        )}
      </div>
    </Link>
  )
}

// ── ETRetail Compact Card (title left, thumbnail right) ───────────

function ETRetailCompactCard({ article }: { article: NewsCardData }) {
  return (
    <Link href={`/news/${article.slug}`} className="group flex items-start gap-4 border-b py-3.5 last:border-0 hover:bg-muted/20 px-1 transition-colors">
      <div className="min-w-0 flex-1">
        {article.is_breaking && (
          <span className="mb-1 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Breaking</span>
        )}
        <p className="line-clamp-3 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-[14px]">
          {article.title}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {article.published_at && timeAgo(article.published_at)}
        </p>
      </div>
      {article.cover_image_url && (
        <div className="relative h-[66px] w-[88px] shrink-0 overflow-hidden rounded bg-muted">
          <SafeImage src={article.cover_image_url} alt={article.title} fill className="object-cover" hideOnError />
        </div>
      )}
    </Link>
  )
}

// ── Side Story Card ───────────────────────────────────────────────

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

// ── Text Story Item ───────────────────────────────────────────────

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

// ── Mini News Card (2×2 grid) ─────────────────────────────────────

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
        <p className="line-clamp-2 text-[12px] font-bold leading-snug text-white">
          {article.title}
        </p>
        {article.published_at && (
          <p className="mt-0.5 text-[9px] text-white/55">{timeAgo(article.published_at)}</p>
        )}
      </div>
    </Link>
  )
}

// ── Sidebar Fallback Panel ────────────────────────────────────────

function CommunitySidebarWidget({ wide }: { wide?: boolean }) {
  const w = wide ? "hidden lg:flex w-[260px]" : "hidden xl:flex w-[200px]"
  return (
    <div className={`${w} shrink-0 self-stretch flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="text-[13px] font-bold leading-tight text-foreground">
            <T en="Join the New Market community" hi="न्यू मार्केट कम्युनिटी जॉइन करें" />
          </p>
          <Newspaper size={18} className="mt-0.5 shrink-0 text-primary" />
        </div>
        <p className="mb-3 text-[11px] text-muted-foreground leading-snug">
          <T en="Subscribe for daily local updates, deals & news." hi="रोज़ की लोकल खबरें, डील्स और अपडेट पाएं।" />
        </p>
        <Link
          href="/news/submit"
          className="mb-2 block w-full rounded-lg bg-primary py-2 text-center text-[11px] font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <T en="Submit a Story" hi="खबर भेजें" />
        </Link>
        <Link
          href="/jobs/post"
          className="mb-2 block w-full rounded-lg border py-2 text-center text-[11px] font-semibold transition hover:bg-muted"
        >
          <T en="Post a Job" hi="नौकरी पोस्ट करें" />
        </Link>
        <Link
          href="/shops/add"
          className="block w-full rounded-lg border py-2 text-center text-[11px] font-semibold transition hover:bg-muted"
        >
          <T en="List Your Shop" hi="दुकान लिस्ट करें" />
        </Link>
      </div>
      <div className="border-t px-4 py-2.5 text-center">
        <p className="text-[9px] text-muted-foreground">
          <T en="Free · New Market's local platform" hi="मुफ्त · न्यू मार्केट का लोकल प्लेटफ़ॉर्म" />
        </p>
      </div>
    </div>
  )
}

function SidebarFallbackPanel({
  type,
  items,
  wide,
}: {
  type: "trending" | "latest" | "jobs" | "community" | "none"
  items: NewsCardData[]
  wide?: boolean
}) {
  if (type === "none") return null

  if (type === "community") return <CommunitySidebarWidget wide={wide} />

  const visibility = wide ? "hidden lg:flex" : "hidden xl:flex"
  const width = wide ? "w-[260px]" : "w-[120px]"

  if (type === "jobs") {
    return (
      <div className={`${visibility} ${width} shrink-0 self-stretch flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}>
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 p-3 text-center">
          <Briefcase size={20} className="text-primary" />
          <div>
            <p className="text-[11px] font-bold">Job Openings</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">Find jobs in New Market</p>
          </div>
          <Link href="/jobs" className="w-full rounded-lg bg-primary py-1.5 text-[10px] font-semibold text-white transition hover:bg-primary/90">
            Browse Jobs
          </Link>
          <Link href="/jobs/post" className="text-[9px] text-primary hover:underline">
            Post a Job
          </Link>
        </div>
      </div>
    )
  }

  const newsItems =
    type === "trending"
      ? [...items.filter((a) => a.is_trending), ...items.filter((a) => !a.is_trending)].slice(0, 7)
      : items.slice(0, 7)

  const textSize = wide ? "text-[11px]" : "text-[9px]"
  const timeSize = wide ? "text-[10px]" : "text-[8px]"
  const px = wide ? "px-3" : "px-2"

  return (
    <div className={`${visibility} ${width} shrink-0 self-stretch flex-col overflow-hidden rounded-xl border bg-card shadow-sm`}>
      <div className={`border-b bg-muted/30 ${px} py-1.5`}>
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {type === "trending" ? "🔥 Trending" : "⚡ Latest"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y">
        {newsItems.map((a) => (
          <Link
            key={a.id}
            href={`/news/${a.slug}`}
            className={`group flex items-start gap-2 ${px} py-2.5 transition hover:bg-muted/20`}
          >
            <div className="mt-1 flex flex-col gap-2 min-w-0 flex-1">
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${CAT_DOT[a.category] ?? "bg-primary"}`} />
              <p className={`line-clamp-3 ${textSize} font-medium leading-snug transition-colors group-hover:text-primary`}>
                {a.title}
              </p>
              {a.published_at && (
                <p className={`${timeSize} text-muted-foreground`}>{timeAgo(a.published_at)}</p>
              )}
            </div>
            {wide && a.cover_image_url && (
              <div className="relative h-[52px] w-[68px] shrink-0 overflow-hidden rounded bg-muted">
                <SafeImage src={a.cover_image_url} alt={a.title} fill className="object-cover" hideOnError />
              </div>
            )}
          </Link>
        ))}
      </div>
      <div className={`border-t ${px} py-1.5`}>
        <Link href="/news" className="text-[10px] font-semibold text-primary hover:underline">
          All News →
        </Link>
      </div>
    </div>
  )
}

// ── Local Updates Widget ──────────────────────────────────────────

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
    { href: "/news",     icon: Newspaper, labelEn: "NEWS",      labelHi: "समाचार",  subEn: `${stats.news}+ New Updates`,       subHi: `${stats.news}+ अपडेट`,      color: "text-primary",                                border: "border-l-primary" },
    { href: "/jobs",     icon: Briefcase, labelEn: "JOBS",      labelHi: "नौकरी",   subEn: `${stats.jobs} New Openings`,        subHi: `${stats.jobs} पद`,            color: "text-blue-600 dark:text-blue-400",             border: "border-l-blue-500" },
    { href: "/shops",    icon: Store,     labelEn: "SHOPS",     labelHi: "दुकानें", subEn: `${stats.shops}+ New Listings`,      subHi: `${stats.shops}+ दुकानें`,    color: "text-emerald-600 dark:text-emerald-400",      border: "border-l-emerald-500" },
    { href: "/property", icon: Building2, labelEn: "PROPERTY",  labelHi: "संपत्ति", subEn: `${stats.property}+ New Properties`, subHi: `${stats.property}+ संपत्ति`, color: "text-amber-600 dark:text-amber-400",          border: "border-l-amber-500" },
    { href: "/election", icon: Vote,      labelEn: "ELECTIONS", labelHi: "चुनाव",   subEn: "Latest Updates",                    subHi: "ताज़े अपडेट",                 color: "text-violet-600 dark:text-violet-400",        border: "border-l-violet-500" },
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

// ── Job Openings Panel ────────────────────────────────────────────

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

const DEMO_ITEMS: NewsCardData[] = [
  { id: "n-1", title: "New Market Association Announces Free Wi-Fi for Entire Market Premises", slug: "demo-1", category: "BUSINESS", cover_image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: true, is_trending: true, is_featured: false, published_at: new Date(Date.now()-432000000).toISOString(), view_count: 454, excerpt: "New Market Traders Association launches free Wi-Fi for all shops and customers.", homepage_slot: "headline" } as any,
  { id: "n-2", title: "Alert: Fake QR Code Scam Being Reported in New Market", slug: "demo-2", category: "SAFETY", cover_image_url: "https://images.unsplash.com/photo-1595054225515-d72b217dc3e3?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-172800000).toISOString(), view_count: 223 } as any,
  { id: "n-3", title: "Winter Festival at New Market: 3-Day Cultural Programme Starting Dec 20", slug: "demo-3", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1533174000273-e18fa1f7d235?auto=format&fit=crop&q=80&w=800", is_breaking: true, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date(Date.now()-518400000).toISOString(), view_count: 172 } as any,
  { id: "n-4", title: "Community Cleanliness Drive This Sunday at New Market", slug: "demo-4", category: "COMMUNITY", cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-1468800000).toISOString(), view_count: 145 } as any,
  { id: "n-5", title: "Special Food Mela This Weekend at New Market", slug: "demo-5", category: "EVENTS", cover_image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800", is_breaking: false, is_pinned: false, is_trending: true, is_featured: false, published_at: new Date(Date.now()-1382400000).toISOString(), view_count: 128 } as any,
  { id: "n-6", title: "बड़ी खबर: न्यू मार्केट रोड चौड़ीकरण परियोजना को मिली मंजूरी", slug: "demo-6", category: "GENERAL", cover_image_url: null, is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-345600000).toISOString(), view_count: 634 } as any,
  { id: "n-7", title: "Traffic Diversion Near New Market Due to Road Repair Work", slug: "demo-7", category: "TRAFFIC", cover_image_url: null, is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-432000000).toISOString(), view_count: 312 } as any,
  { id: "n-8", title: "Water Supply Disruption on May 26 Due to Pipeline Work", slug: "demo-8", category: "NOTICES", cover_image_url: null, is_breaking: false, is_pinned: false, is_trending: false, is_featured: false, published_at: new Date(Date.now()-518400000).toISOString(), view_count: 189 } as any,
]

async function MainNewsSection({ settings, density }: { settings: HomepageSettings; density: string }) {
  let items: NewsCardData[] = []
  try {
    items = await getCachedHomepageNews(16)
  } catch {
    items = DEMO_ITEMS
  }

  if (items.length === 0) return <EmptyNews />

  const headlineIdx = items.findIndex((a) => a.homepage_slot === "headline")
  const featured = headlineIdx >= 0 ? items[headlineIdx] : items[0]
  const rest = items.filter((a) => a.id !== featured.id)

  const withImages = rest.filter((a) => a.cover_image_url)
  const noImages   = rest.filter((a) => !a.cover_image_url)
  const sideStories  = [...withImages, ...noImages].slice(0, 4)
  const latestItems  = items.slice(0, 8)
  const textStories  = noImages.slice(0, 6)
  const trendingItems = (() => {
    const t = items.filter((a) => a.is_trending && a.cover_image_url)
    return t.length >= 3 ? t : withImages
  })().slice(0, 5)

  // Compute what's actually shown
  const showHero    = settings.show_hero_news
  const showMini    = settings.show_mini_grid && sideStories.length > 0
  const showLatest  = settings.show_latest_panel
  const showJobs    = settings.show_jobs_panel
  const showTrend   = settings.show_trending && trendingItems.length > 0
  const showTexts   = settings.show_text_stories && textStories.length > 0

  // Auto-adapt hero style: switch to text-split if hero image is missing
  const effectiveHeroStyle =
    settings.hero_style === "photo" && !featured.cover_image_url ? "text-split" : settings.hero_style

  const py = density === "compact" ? "py-3" : "py-4"

  return (
    <div className="section-base">
      {/* Top banner ad */}
      {settings.show_top_ad && (
        <Suspense fallback={null}>
          <AdBanner slot="homepage-top" size="leaderboard" className="border-b" />
        </Suspense>
      )}


      {/* Section header bar */}
      <div className="border-b">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-primary" />
            <span className="editorial-headline text-sm font-bold">
              <T en="Top Stories" hi="टॉप न्यूज़" />
            </span>
          </div>
          <Link href="/news" className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
            <T en="All News" hi="सभी खबरें" /> <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Main zone: [left-fallback-or-ad] [center] [right-fallback-or-ad] */}
      <div className={`container ${py}`}>
        <div className="flex items-start gap-3">

          {/* Left sidebar */}
          {settings.show_left_ad ? (
            <Suspense fallback={null}>
              <AdBanner slot="homepage-left" size="skyscraper" className="hidden xl:block shrink-0 rounded-lg overflow-hidden border" />
            </Suspense>
          ) : (
            <SidebarFallbackPanel type={settings.left_sidebar_fallback} items={items} />
          )}

          {/* Center content */}
          <div className="min-w-0 flex-1 space-y-3">

            {/* TOP STORIES — ETRetail layout: featured + 3×2 compact cards + scrollable sidebar */}
            {showLatest && (
              <div>
                {/* 2-column: [featured + 3×2 cards] | [scrollable news] */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">

                  {/* Left: featured story + compact grid */}
                  <div>
                    <ETRetailFeatureStory article={latestItems[1] ?? latestItems[0]} />
                    <div className="mt-4 grid grid-cols-1 gap-x-5 border-t pt-1 sm:grid-cols-2">
                      <div>
                        {latestItems.slice(2, 5).map((a) => (
                          <ETRetailCompactCard key={a.id} article={a} />
                        ))}
                      </div>
                      <div className="border-t sm:border-t-0">
                        {latestItems.slice(5, 8).map((a) => (
                          <ETRetailCompactCard key={a.id} article={a} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 border-t pt-2">
                      <Link href="/news" className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline">
                        <T en="View all stories" hi="सभी खबरें" /> <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Right: scrollable latest news */}
                  <div className="hidden lg:flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2 shrink-0">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Zap size={10} className="text-amber-500" />
                        <T en="Latest" hi="ताज़ा" />
                      </span>
                      <Link href="/news" className="text-[10px] font-semibold text-primary hover:underline">
                        <T en="View All" hi="सभी" />
                      </Link>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y" style={{ maxHeight: 460 }}>
                      {latestItems.map((a) => <LatestItem key={a.id} article={a} />)}
                    </div>
                    <div className="border-t px-3 py-2 shrink-0">
                      <Link href="/news" className="flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                        <T en="View all stories" hi="सभी खबरें" /> <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Jobs panel */}
            {showJobs && (
              <Suspense fallback={null}>
                <JobOpeningsPanel />
              </Suspense>
            )}

            {/* Section quick-links */}
            {settings.show_section_links && (
              <Suspense fallback={null}>
                <SectionLinksBar />
              </Suspense>
            )}

            {/* Trending + Text stories */}
            {(showTrend || showTexts) && (
              <div className={`grid grid-cols-1 gap-3 ${showTrend && showTexts ? "lg:grid-cols-[1fr_280px]" : ""}`}>
                {showTrend && (
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

                {showTexts && (
                  <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b bg-muted/40 px-3 py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <T en="Top Stories" hi="टॉप न्यूज़" />
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
            )}

          </div>
          {/* end center */}

          {/* Right sidebar — visible from lg, matches ETRetail right column */}
          {settings.show_right_ad ? (
            <Suspense fallback={null}>
              <AdBanner slot="homepage-right" size="skyscraper" className="hidden xl:block shrink-0 rounded-lg overflow-hidden border" />
            </Suspense>
          ) : (
            <SidebarFallbackPanel type={settings.right_sidebar_fallback} items={items} wide />
          )}

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

// ── Shops Strip ───────────────────────────────────────────────────

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

// ── Property Teaser ───────────────────────────────────────────────

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

// ── Sidebar Section (elections + property) ────────────────────────

async function SidebarSection({ settings }: { settings: HomepageSettings }) {
  const election = settings.show_elections
    ? await getCachedActiveElection().catch(() => null)
    : null
  return (
    <div className="flex flex-col gap-4">
      {settings.show_elections && <ElectionTeaser election={election} />}
      {settings.show_property_panel && (
        <Suspense fallback={null}>
          <PropertyTeaserSection />
        </Suspense>
      )}
    </div>
  )
}

// ── Community Strip ───────────────────────────────────────────────

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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="h-[300px] animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4].map(i=><div key={i} className="h-[145px] animate-pulse rounded-lg bg-muted"/>)}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default async function HomePage() {
  let settings = await getCachedHomepageSettings().catch(() => null)
  // Graceful fallback if table doesn't exist yet
  if (!settings) {
    const { DEFAULT_SETTINGS } = await import("@/lib/supabase/homepage-settings")
    settings = DEFAULT_SETTINGS
  }

  const density = settings.layout_density
  const showMidSection = settings.show_youtube || settings.show_local_updates
    || settings.show_elections || settings.show_property_panel

  return (
    <div className="section-alt">
      {settings.show_ticker && (
        <Suspense fallback={null}><TickerSection /></Suspense>
      )}
      <Suspense fallback={null}><MastheadStatStrip /></Suspense>

      <Suspense fallback={<NewsGridSkeleton />}>
        <MainNewsSection settings={settings} density={density} />
      </Suspense>

      {settings.show_mid_ad && (
        <Suspense fallback={null}>
          <AdBanner slot="homepage-mid-1" size="leaderboard" />
        </Suspense>
      )}

      {showMidSection && (
        <div className={`container ${density === "compact" ? "py-4" : "py-5"}`}>
          <div className={`grid grid-cols-1 gap-4 ${
            showMidSection && (settings.show_youtube || settings.show_local_updates) && (settings.show_elections || settings.show_property_panel)
              ? "lg:grid-cols-3"
              : ""
          }`}>
            {(settings.show_youtube || settings.show_local_updates) && (
              <div className={`flex flex-col gap-4 ${
                (settings.show_elections || settings.show_property_panel) ? "lg:col-span-2" : ""
              }`}>
                {settings.show_youtube && (
                  <Suspense fallback={null}><YouTubeSection /></Suspense>
                )}
                {settings.show_local_updates && (
                  <Suspense fallback={null}><LocalUpdatesWidget /></Suspense>
                )}
              </div>
            )}
            {(settings.show_elections || settings.show_property_panel) && (
              <Suspense fallback={null}>
                <SidebarSection settings={settings} />
              </Suspense>
            )}
          </div>
        </div>
      )}

      {settings.show_shops_strip && (
        <Suspense fallback={null}><ShopsStripSection /></Suspense>
      )}

      {settings.show_bottom_ad && (
        <Suspense fallback={null}>
          <AdBanner slot="homepage-bottom" size="strip" />
        </Suspense>
      )}

      {settings.show_community_strip && <CommunityStrip />}
    </div>
  )
}
