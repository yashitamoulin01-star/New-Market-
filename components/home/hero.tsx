"use client"

import Link from "next/link"
import { MapPin, Newspaper, Briefcase } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// The base hero — no data dependency, renders immediately.
// Accepts children so the stats panel can be streamed in separately.
export function HomeHero({ children }: { children?: React.ReactNode }) {
  const { lang } = useLanguage()

  const headline = lang === "hi"
    ? "नई मार्केट की\nहर खबर, हर मौका।"
    : "New Market —\nnews, jobs & more."

  return (
    <section
      className="py-12 sm:py-16"
      style={{ background: "linear-gradient(160deg, hsl(350,80%,34%) 0%, hsl(350,75%,40%) 100%)" }}
    >
      <div className="container max-w-3xl">
        {/* Location badge */}
        <div className="mb-5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 opacity-90 shrink-0" />
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/60">
            <MapPin size={10} />
            {lang === "hi" ? "नई मार्केट, भोपाल" : "New Market, Bhopal"}
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-3 whitespace-pre-line font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
          {headline}
        </h1>

        {/* Subline */}
        <p className="mb-8 text-sm tracking-wide text-white/55">
          {lang === "hi" ? "समाचार · नौकरी · दुकानें · संपत्ति" : "News · Jobs · Shops · Property"}
        </p>

        {/* CTAs — immediately clickable, no async needed */}
        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors duration-150 hover:bg-white/90"
          >
            <Newspaper size={15} />
            {lang === "hi" ? "समाचार पढ़ें" : "Latest News"}
          </Link>
          <Link
            href="/jobs/post"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-white/60 hover:bg-white/20"
          >
            <Briefcase size={15} />
            {lang === "hi" ? "नौकरी पोस्ट करें" : "Post a Job"}
          </Link>
        </div>

        {/* Stats slot: parent passes either the real stats or a skeleton */}
        {children}
      </div>
    </section>
  )
}

// Stats panel rendered once counts have loaded
export function HeroStats({
  counts,
}: {
  counts: { news: number; jobs: number; shops: number; property: number }
}) {
  const { lang } = useLanguage()
  const stats = [
    { value: counts.news     > 0 ? `${counts.news}+`     : "New", en: "Stories",   hi: "समाचार" },
    { value: counts.jobs     > 0 ? `${counts.jobs}+`     : "Live", en: "Jobs",       hi: "नौकरियाँ" },
    { value: counts.shops    > 0 ? `${counts.shops}+`    : "Listed", en: "Shops",      hi: "दुकानें" },
    { value: counts.property > 0 ? `${counts.property}+` : "Listed", en: "Properties", hi: "संपत्तियाँ" },
  ]
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4">
      <div className="flex flex-wrap gap-6">
        {stats.map((s) => (
          <div key={s.en}>
            <p className="text-xl font-extrabold text-white">{s.value}</p>
            <p className="text-[11px] text-white/50">{lang === "hi" ? s.hi : s.en}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton while counts are loading — same size/shape as real stats
export function HeroStatsSkeleton() {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4" aria-hidden="true">
      <div className="flex flex-wrap gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="mb-1.5 h-6 w-7 animate-pulse rounded bg-white/20" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
