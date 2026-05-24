"use client"

import Link from "next/link"
import { Eye, Clock } from "lucide-react"
import type { NewsCardData } from "@/lib/supabase/news"
import { useLanguage } from "@/contexts/language-context"
import { SafeImage } from "@/components/ui/safe-image"

const CATEGORY_STYLES: Record<string, { chip: string }> = {
  GENERAL:   { chip: "bg-slate-100 text-slate-700" },
  EVENTS:    { chip: "bg-amber-100 text-amber-800" },
  NOTICES:   { chip: "bg-red-100 text-red-700" },
  BUSINESS:  { chip: "bg-primary/10 text-primary" },
  COMMUNITY: { chip: "bg-green-100 text-green-800" },
  SAFETY:    { chip: "bg-orange-100 text-orange-800" },
  TRAFFIC:   { chip: "bg-yellow-100 text-yellow-800" },
}

const CATEGORY_LABELS_BI: Record<string, { en: string; hi: string }> = {
  GENERAL:   { en: "General",   hi: "सामान्य" },
  EVENTS:    { en: "Events",    hi: "इवेंट" },
  NOTICES:   { en: "Notices",   hi: "सूचनाएँ" },
  BUSINESS:  { en: "Business",  hi: "व्यापार" },
  COMMUNITY: { en: "Community", hi: "समुदाय" },
  SAFETY:    { en: "Safety",    hi: "सुरक्षा" },
  TRAFFIC:   { en: "Traffic",   hi: "यातायात" },
}

function formatDate(iso: string, lang: "en" | "hi") {
  return new Date(iso).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function readingTime(text?: string | null, lang?: "en" | "hi") {
  if (!text) return null
  const mins = Math.max(1, Math.round(text.trim().split(/\s+/).length / 200))
  return lang === "hi" ? `${mins} मिनट` : `${mins} min read`
}

export function FeaturedNewsCard({ article }: { article: NewsCardData }) {
  const { lang } = useLanguage()
  const style    = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.GENERAL
  const catLabel = CATEGORY_LABELS_BI[article.category]?.[lang]
    ?? (article.category.charAt(0) + article.category.slice(1).toLowerCase())
  const rt = readingTime(article.excerpt, lang)

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {article.cover_image_url ? (
        <div className="relative h-56 w-full overflow-hidden sm:h-72">
          <SafeImage
            src={article.cover_image_url}
            alt={article.title}
            fill
            priority
            className="object-cover group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${style.chip}`}>
            {catLabel}
          </span>
          {article.is_featured && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
              {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
            </span>
          )}
        </div>
      ) : (
        <div className="h-2 w-full bg-primary" />
      )}

      <div className="flex flex-1 flex-col p-5">
        {!article.cover_image_url && (
          <div className="mb-3 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.chip}`}>
              {catLabel}
            </span>
            {article.is_featured && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
              </span>
            )}
          </div>
        )}

        <h2 className="mb-3 font-heading text-xl font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary sm:text-2xl">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>{article.published_at ? formatDate(article.published_at, lang) : ""}</span>
          <div className="flex items-center gap-3">
            {rt && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {rt}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {article.view_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
