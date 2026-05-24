import Link from "next/link"
import { Suspense } from "react"
import { Newspaper, Briefcase, Store, ChevronRight, Zap, Clock, Eye } from "lucide-react"
import { getCachedNews, getCachedJobs, getCachedShops, getCachedProperties } from "@/lib/data/cached"
import { JobCard } from "@/components/jobs/job-card"
import { ShopCard } from "@/components/shops/shop-card"
import { NewsTicker } from "@/components/home/news-ticker"
import { HomeHero, HeroStats, HeroStatsSkeleton } from "@/components/home/hero"
import { ModuleCards } from "@/components/home/module-cards"
import { HomeCta } from "@/components/home/home-cta"
import { AdBanner } from "@/components/ads/ad-banner"
import { T } from "@/components/ui/t"
import Image from "next/image"

// ── Ticker ───────────────────────────────────────────────────────────
async function TickerSection() {
  try {
    const news = await getCachedNews({ page: 1, limit: 10 })
    const headlines = news.items.map((a) => ({ title: a.title, slug: a.slug }))
    return <NewsTicker headlines={headlines} />
  } catch {
    return null
  }
}

// ── Hero stats ────────────────────────────────────────────────────────
async function HeroCountsSection() {
  try {
    const [news, jobs, shops, property] = await Promise.all([
      getCachedNews({ page: 1, limit: 1 }),
      getCachedJobs({ page: 1, limit: 1 }),
      getCachedShops({ page: 1, limit: 1 }),
      getCachedProperties({ page: 1, limit: 1 }),
    ])
    return (
      <HeroStats
        counts={{ news: news.total, jobs: jobs.total, shops: shops.total, property: property.total }}
      />
    )
  } catch {
    return <HeroStats counts={{ news: 0, jobs: 0, shops: 0, property: 0 }} />
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "अभी"
  if (mins < 60)  return `${mins}म`
  if (hours < 24) return `${hours}घ पहले`
  return `${days}दि पहले`
}

// ── Top News Section (Featured + Latest panel) ────────────────────────
async function TopNewsSection() {
  try {
    const news = await getCachedNews({ page: 1, limit: 10 })
    if (news.items.length === 0) return null

    const [featured, ...rest] = news.items
    const latestItems = rest.slice(0, 6)

    return (
      <section className="section-alt py-8">
        {/* Section header */}
        <div className="container mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary" />
            <h2 className="font-heading text-lg font-extrabold uppercase tracking-wide">
              <T en="Top Stories" hi="मुख्य समाचार" />
            </h2>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <T en="All News" hi="सभी खबरें" />
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="container">
          {/* Sidebar ad (left) + main content + sidebar ad (right) */}
          <div className="flex gap-4 items-start">
            {/* Left ad — desktop only */}
            <div className="hidden xl:block shrink-0">
              <Suspense fallback={null}>
                          <AdBanner position="left" />
              </Suspense>
            </div>

            {/* Main 2-col layout */}
            <div className="flex-1 min-w-0 grid gap-4 lg:grid-cols-3">
              {/* Featured article — large */}
              <div className="lg:col-span-2">
                <Link
                  href={`/news/${featured.slug}`}
                  className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl border bg-card shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  {featured.cover_image_url ? (
                    <>
                      <div className="relative h-72 w-full overflow-hidden sm:h-80 lg:h-full lg:min-h-[340px]">
                        <Image
                          src={featured.cover_image_url}
                          alt={featured.title}
                          fill
                          priority
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                        <h2 className="mb-2 font-heading text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl drop-shadow-md">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="mb-3 line-clamp-2 text-sm text-white/80 drop-shadow-sm">
                            {featured.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-white/60">
                          {featured.published_at && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {timeAgo(featured.published_at)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye size={11} />
                            {featured.view_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="mb-3 font-heading text-2xl font-extrabold leading-tight text-card-foreground group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                      )}
                      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                        {featured.published_at && <span>{timeAgo(featured.published_at)}</span>}
                        <span>{featured.view_count.toLocaleString()} views</span>
                      </div>
                    </div>
                  )}
                </Link>
              </div>

              {/* LATEST panel — scrollable */}
              <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/40 shrink-0">
                  <Zap size={15} className="text-amber-500 fill-amber-500" />
                  <h3 className="font-heading text-sm font-extrabold uppercase tracking-widest text-foreground">
                    <T en="Latest" hi="ताज़ा" />
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y" style={{ maxHeight: 340 }}>
                  {latestItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 group"
                    >
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        {item.published_at && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(item.published_at)}</p>
                        )}
                      </div>
                      {item.cover_image_url && (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={item.cover_image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="border-t px-4 py-3 shrink-0">
                  <Link
                    href="/news"
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <T en="View all stories" hi="सभी खबरें देखें" />
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right ad — desktop only */}
            <div className="hidden xl:block shrink-0">
              <Suspense fallback={null}>
                          <AdBanner position="right" />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    )
  } catch {
    return null
  }
}

// ── More News Grid ─────────────────────────────────────────────────────
async function MoreNewsSection() {
  try {
    const news = await getCachedNews({ page: 1, limit: 9 })
    const moreNews = news.items.slice(3)
    if (moreNews.length === 0) return null

    return (
      <section className="section-base py-8">
        <div className="container">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-primary" />
              <h2 className="font-heading text-lg font-bold">
                <T en="More News" hi="और समाचार" />
              </h2>
            </div>
            <Link href="/news" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              <T en="View All" hi="सभी देखें" />
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moreNews.slice(0, 6).map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex gap-3 rounded-xl border bg-card p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {article.cover_image_url ? (
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={article.cover_image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                ) : (
                  <div className="h-20 w-24 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Newspaper size={20} className="text-primary/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="line-clamp-3 text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  {article.published_at && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{timeAgo(article.published_at)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  } catch {
    return null
  }
}

// ── Middle Ad ──────────────────────────────────────────────────────────
async function MiddleAdSection() {
  return (
    <div className="container py-2">
      <Suspense fallback={null}>
          <AdBanner position="middle" />
      </Suspense>
    </div>
  )
}

// ── Jobs ───────────────────────────────────────────────────────────────
async function JobsSection() {
  try {
    const jobs = await getCachedJobs({ page: 1, limit: 4 })
    if (jobs.items.length === 0) return (
      <section className="section-alt py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={17} className="text-primary" />
              <h2 className="font-heading text-xl font-bold"><T en="Latest Job Openings" hi="नई नौकरियाँ" /></h2>
            </div>
          </div>
          <div className="rounded-xl border border-dashed bg-card py-14 text-center">
            <p className="mb-1 font-medium text-muted-foreground"><T en="No job listings yet." hi="अभी कोई नौकरी नहीं।" /></p>
            <Link href="/jobs/post" className="text-sm text-primary hover:underline"><T en="Post the first job opening →" hi="पहली नौकरी पोस्ट करें →" /></Link>
          </div>
        </div>
      </section>
    )
    return (
      <section className="section-alt py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={17} className="text-primary" />
              <h2 className="font-heading text-xl font-bold"><T en="Latest Job Openings" hi="नई नौकरियाँ" /></h2>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              <T en="View All" hi="सभी देखें" /><ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {jobs.items.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </section>
    )
  } catch { return null }
}

// ── Shops ──────────────────────────────────────────────────────────────
async function ShopsSection() {
  try {
    const shops = await getCachedShops({ page: 1, limit: 4 })
    if (shops.items.length === 0) return null
    return (
      <section className="section-base py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store size={17} className="text-primary" />
              <h2 className="font-heading text-xl font-bold"><T en="Popular Shops" hi="लोकप्रिय दुकानें" /></h2>
            </div>
            <Link href="/shops" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              <T en="View All" hi="सभी देखें" /><ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shops.items.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        </div>
      </section>
    )
  } catch { return null }
}

// ── Modules ────────────────────────────────────────────────────────────
async function ModulesSection() {
  try {
    const [shops, property] = await Promise.all([
      getCachedShops({ page: 1, limit: 1 }),
      getCachedProperties({ page: 1, limit: 1 }),
    ])
    return (
      <section className="section-alt py-10">
        <div className="container">
          <h2 className="mb-6 font-heading text-xl font-bold"><T en="Explore New Market" hi="नई मार्केट जानें" /></h2>
          <ModuleCards shopCount={shops.total} propertyCount={property.total} />
        </div>
      </section>
    )
  } catch {
    return (
      <section className="section-alt py-10">
        <div className="container">
          <h2 className="mb-6 font-heading text-xl font-bold"><T en="Explore New Market" hi="नई मार्केट जानें" /></h2>
          <ModuleCards shopCount={0} propertyCount={0} />
        </div>
      </section>
    )
  }
}

// ── Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="section-base">
      {/* Top ad banner */}
      <Suspense fallback={null}>
          <AdBanner position="top" className="rounded-none border-x-0 border-t-0" />
      </Suspense>

      {/* Ticker */}
      <Suspense fallback={null}>
        <TickerSection />
      </Suspense>

      {/* Hero */}
      <HomeHero>
        <Suspense fallback={<HeroStatsSkeleton />}>
          <HeroCountsSection />
        </Suspense>
      </HomeHero>

      {/* Top Stories (featured + LATEST panel) */}
      <Suspense fallback={<SectionSkeleton />}>
        <TopNewsSection />
      </Suspense>

      {/* More News grid */}
      <Suspense fallback={null}>
        <MoreNewsSection />
      </Suspense>

      {/* Middle ad */}
      <Suspense fallback={null}>
        <MiddleAdSection />
      </Suspense>

      {/* Jobs */}
      <Suspense fallback={<SectionSkeleton alt />}>
        <JobsSection />
      </Suspense>

      {/* Shops */}
      <Suspense fallback={null}>
        <ShopsSection />
      </Suspense>

      {/* Modules */}
      <Suspense fallback={<SectionSkeleton alt />}>
        <ModulesSection />
      </Suspense>

      {/* Bottom ad */}
      <Suspense fallback={null}>
          <AdBanner position="bottom" className="rounded-none border-x-0 border-b-0 mx-0" />
      </Suspense>

      <HomeCta />
    </div>
  )
}

function SectionSkeleton({ alt }: { alt?: boolean }) {
  return (
    <section className={`py-10 ${alt ? "section-alt" : "section-base"}`} aria-hidden="true">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border bg-card" />
          ))}
        </div>
      </div>
    </section>
  )
}
