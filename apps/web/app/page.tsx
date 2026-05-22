import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import {
  ChevronRight, Briefcase, Store, Eye, Building2,
  Flame, Clock, Newspaper, MapPin, Zap,
} from "lucide-react"
import {
  getCachedNews, getCachedJobs, getCachedShops, getCachedProperties,
} from "@/lib/data/cached"
import { NewsTicker } from "@/components/home/news-ticker"
import { AdBanner } from "@/components/home/ad-banner"
import { ElectionTeaser } from "@/components/home/election-teaser"
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
  GENERAL: "सामान्य", EVENTS: "इवेंट", NOTICES: "सूचनाएँ",
  BUSINESS: "व्यापार", COMMUNITY: "समुदाय", SAFETY: "सुरक्षा", TRAFFIC: "यातायात",
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
  try {
    const news = await getCachedNews({ page: 1, limit: 10 })
    const headlines = news.items.map((a) => ({ title: a.title, slug: a.slug }))
    return <NewsTicker headlines={headlines} />
  } catch { return null }
}

// ── Masthead strip ────────────────────────────────────────────────

async function MastheadSection() {
  try {
    const [news, jobs, shops] = await Promise.all([
      getCachedNews({ page: 1, limit: 1 }),
      getCachedJobs({ page: 1, limit: 1 }),
      getCachedShops({ page: 1, limit: 1 }),
    ])
    const today = new Date().toLocaleDateString("hi-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })
    return (
      <div className="border-b bg-white">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin size={10} className="text-primary" />
            <span className="font-medium text-foreground">नई मार्केट, भोपाल</span>
            <span className="mx-1 text-border">|</span>
            <span>{today}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/news" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Newspaper size={10} />
              <span><strong className="text-foreground">{news.total}</strong> <T en="stories" hi="खबरें" /></span>
            </Link>
            <Link href="/jobs" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Briefcase size={10} />
              <span><strong className="text-foreground">{jobs.total}</strong> <T en="jobs" hi="नौकरियाँ" /></span>
            </Link>
            <Link href="/shops" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Store size={10} />
              <span><strong className="text-foreground">{shops.total}</strong> <T en="shops" hi="दुकानें" /></span>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch { return null }
}

// ── Main news grid ────────────────────────────────────────────────

async function MainNewsSection() {
  try {
    const { items } = await getCachedNews({ page: 1, limit: 12 })
    if (items.length === 0) return <EmptyNews />

    const [featured, ...rest] = items
    const sideStack = rest.slice(0, 4)
    const secondRow = rest.slice(4, 7)

    return (
      <>
        {/* Section header */}
        <div className="border-b bg-white">
          <div className="container flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <span className="text-sm font-bold">
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
          {/* ── Main grid: big featured + right stack ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Big featured article */}
            <div className="lg:col-span-2">
              <FeaturedArticle article={featured} />
            </div>

            {/* Right stack */}
            <div className="flex flex-col gap-0 divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="bg-muted/40 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Zap size={11} className="text-amber-500" />
                  <T en="Latest" hi="ताज़ा" />
                </span>
              </div>
              {sideStack.map((a) => (
                <SideHeadline key={a.id} article={a} />
              ))}
              <div className="px-4 py-3">
                <Link href="/news" className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <T en="View all stories" hi="सभी खबरें देखें" />
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Second row of 3 cards ── */}
          {secondRow.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {secondRow.map((a) => (
                <SmallNewsCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </>
    )
  } catch { return null }
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
          <Image src={article.cover_image_url} alt={article.title} fill priority className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className={`mb-2 inline-block rounded-sm px-2 py-0.5 text-[11px] font-bold ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
              <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
            </span>
            <h2 className="font-heading text-xl font-bold leading-snug text-white sm:text-2xl line-clamp-3">
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
          <span className={`mb-3 inline-block rounded-sm px-2 py-0.5 text-[11px] font-bold ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
            <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
          </span>
          <h2 className="font-heading text-2xl font-bold leading-snug transition-colors group-hover:text-primary">
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
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {article.published_at ? timeAgo(article.published_at) : ""}
        </p>
      </div>
      {article.cover_image_url && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
          <Image src={article.cover_image_url} alt={article.title} fill className="object-cover" />
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
        <div className="relative h-40 w-full overflow-hidden">
          <Image src={article.cover_image_url} alt={article.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className={`absolute left-3 top-3 rounded-sm px-2 py-0.5 text-[10px] font-bold shadow ${CAT_CHIP[cat] ?? CAT_CHIP.GENERAL}`}>
            <T en={CAT_EN[cat] ?? cat} hi={CAT_HI[cat] ?? cat} />
          </span>
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
  try {
    const { items } = await getCachedJobs({ page: 1, limit: 4 })
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
  } catch { return null }
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
  try {
    const { items } = await getCachedShops({ page: 1, limit: 4 })
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
  } catch { return null }
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
  try {
    const { items, total } = await getCachedProperties({ page: 1, limit: 2 })
    if (total === 0) return null
    return (
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-primary" />
            <span className="text-sm font-bold"><T en="Property" hi="संपत्ति" /></span>
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
                <p className="line-clamp-1 text-[13px] font-semibold transition-colors group-hover:text-primary">
                  {p.title}
                </p>
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
  } catch { return null }
}

// ── Community strip ───────────────────────────────────────────────

function CommunityStrip() {
  return (
    <div className="border-t bg-primary">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <p className="font-heading text-base font-bold text-primary-foreground">
            <T en="Something happening in New Market?" hi="नई मार्केट में कुछ हो रहा है?" />
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
      {/* Ticker — keep */}
      <Suspense fallback={null}>
        <TickerSection />
      </Suspense>

      {/* Masthead: date + stats strip */}
      <Suspense fallback={null}>
        <MastheadSection />
      </Suspense>

      {/* Main news grid — content hits first */}
      <div className="bg-white">
        <Suspense fallback={<NewsGridSkeleton />}>
          <MainNewsSection />
        </Suspense>
      </div>

      {/* Mid-page ad */}
      <AdBanner slot="homepage-mid-1" size="leaderboard" />

      {/* Jobs + Sidebar: 2/3 + 1/3 */}
      <div className="container py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Jobs column — 2/3 */}
          <div className="lg:col-span-2">
            <Suspense fallback={null}>
              <JobsSection />
            </Suspense>
          </div>
          {/* Sidebar — 1/3: Election + Property */}
          <div className="flex flex-col gap-4">
            <ElectionTeaser />
            <Suspense fallback={null}>
              <PropertyTeaserSection />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Shops strip */}
      <Suspense fallback={null}>
        <ShopsStripSection />
      </Suspense>

      {/* Bottom ad */}
      <AdBanner slot="homepage-bottom" size="strip" />

      {/* Community CTA */}
      <CommunityStrip />
    </div>
  )
}
