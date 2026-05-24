import Link from "next/link"
import { Suspense } from "react"
import { Newspaper, Briefcase, Store, ChevronRight } from "lucide-react"
import { getCachedNews, getCachedJobs, getCachedShops, getCachedProperties } from "@/lib/data/cached"
import { NewsCard } from "@/components/news/news-card"
import { FeaturedNewsCard } from "@/components/news/featured-news-card"
import { JobCard } from "@/components/jobs/job-card"
import { ShopCard } from "@/components/shops/shop-card"
import { NewsTicker } from "@/components/home/news-ticker"
import { HomeHero, HeroStats, HeroStatsSkeleton } from "@/components/home/hero"
import { ModuleCards } from "@/components/home/module-cards"
import { HomeCta } from "@/components/home/home-cta"
import { T } from "@/components/ui/t"

// ── Async server components (each cached, each streams independently) ──

async function TickerSection() {
  try {
    const news = await getCachedNews({ page: 1, limit: 10 })
    const headlines = news.items.map((a) => ({ title: a.title, slug: a.slug }))
    return <NewsTicker headlines={headlines} />
  } catch {
    return null
  }
}

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

async function NewsSection() {
  try {
    const news = await getCachedNews({ page: 1, limit: 7 })
    const [featuredArticle, ...restNews] = news.items
    const sideNews = restNews.slice(0, 2)

    return (
      <section className="bg-[#f7f3ef] py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper size={17} className="text-primary" />
              <h2 className="font-heading text-xl font-bold">
                <T en="Latest News" hi="ताज़ा समाचार" />
              </h2>
            </div>
            <Link href="/news" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <T en="View All" hi="सभी देखें" />
              <ChevronRight size={14} />
            </Link>
          </div>

          {news.items.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredArticle && (
                <div className="lg:col-span-2">
                  <FeaturedNewsCard article={featuredArticle} />
                </div>
              )}
              {sideNews.length > 0 && (
                <div className="flex flex-col gap-4">
                  {sideNews.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card py-14 text-center">
              <p className="mb-1 font-medium text-muted-foreground">
                <T en="No published news yet." hi="अभी कोई समाचार नहीं।" />
              </p>
              <Link href="/news/submit" className="text-sm text-primary hover:underline">
                <T en="Be the first to share what's happening →" hi="पहले शेयर करें →" />
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  } catch {
    return null
  }
}

async function JobsSection() {
  try {
    const jobs = await getCachedJobs({ page: 1, limit: 4 })
    return (
      <section className="bg-[#fdfcfb] py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={17} className="text-primary" />
              <h2 className="font-heading text-xl font-bold">
                <T en="Latest Job Openings" hi="नई नौकरियाँ" />
              </h2>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <T en="View All" hi="सभी देखें" />
              <ChevronRight size={14} />
            </Link>
          </div>

          {jobs.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {jobs.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-card py-14 text-center">
              <p className="mb-1 font-medium text-muted-foreground">
                <T en="No job listings yet." hi="अभी कोई नौकरी नहीं।" />
              </p>
              <Link href="/jobs/post" className="text-sm text-primary hover:underline">
                <T en="Post the first job opening →" hi="पहली नौकरी पोस्ट करें →" />
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  } catch {
    return null
  }
}

async function ShopsSection() {
  try {
    const shops = await getCachedShops({ page: 1, limit: 4 })
    if (shops.items.length === 0) return null
    return (
      <section className="bg-[#f7f3ef] py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store size={17} className="text-primary" />
              <h2 className="font-heading text-xl font-bold">
                <T en="Popular Shops" hi="लोकप्रिय दुकानें" />
              </h2>
            </div>
            <Link href="/shops" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <T en="View All" hi="सभी देखें" />
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shops.items.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      </section>
    )
  } catch {
    return null
  }
}

async function ModulesSection() {
  try {
    const [shops, property] = await Promise.all([
      getCachedShops({ page: 1, limit: 1 }),
      getCachedProperties({ page: 1, limit: 1 }),
    ])
    return (
      <section className="bg-[#fdfcfb] py-10">
        <div className="container">
          <h2 className="mb-6 font-heading text-xl font-bold">
            <T en="Explore New Market" hi="नई मार्केट जानें" />
          </h2>
          <ModuleCards shopCount={shops.total} propertyCount={property.total} />
        </div>
      </section>
    )
  } catch {
    return (
      <section className="bg-[#fdfcfb] py-10">
        <div className="container">
          <h2 className="mb-6 font-heading text-xl font-bold">
            <T en="Explore New Market" hi="नई मार्केट जानें" />
          </h2>
          <ModuleCards shopCount={0} propertyCount={0} />
        </div>
      </section>
    )
  }
}

function SectionSkeleton({ bg = "#f7f3ef" }: { bg?: string }) {
  return (
    <section className="py-10" style={{ background: bg }} aria-hidden="true">
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

// ── Page ──────────────────────────────────────────────────────────
// Render order:
//  1. Ticker      — optional, silent Suspense
//  2. HomeHero    — INSTANT (client component, no async)
//     └ HeroStats — streams in via inner Suspense (skeleton visible)
//  3. Sections    — each streams in independently with skeleton fallback

export default function HomePage() {
  return (
    <div className="bg-[#fdfcfb]">
      {/* Ticker: silent — renders nothing until data arrives */}
      <Suspense fallback={null}>
        <TickerSection />
      </Suspense>

      {/* Hero renders IMMEDIATELY. Only the stats numbers are in Suspense. */}
      <HomeHero>
        <Suspense fallback={<HeroStatsSkeleton />}>
          <HeroCountsSection />
        </Suspense>
      </HomeHero>

      {/* Content sections stream in independently */}
      <Suspense fallback={<SectionSkeleton bg="#f7f3ef" />}>
        <NewsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton bg="#fdfcfb" />}>
        <JobsSection />
      </Suspense>

      <Suspense fallback={null}>
        <ShopsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton bg="#fdfcfb" />}>
        <ModulesSection />
      </Suspense>

      <HomeCta />
    </div>
  )
}
