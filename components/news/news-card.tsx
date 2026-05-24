"use client"

import Link from "next/link"
import Image from "next/image"
import { Eye, Clock } from "lucide-react"
import type { NewsCardData } from "@/lib/supabase/news"
import { useLanguage } from "@/contexts/language-context"

const CATEGORY_STYLES: Record<string, { chip: string; bar: string }> = {
  GENERAL:   { chip: "bg-slate-100 text-slate-700",    bar: "bg-slate-400" },
  EVENTS:    { chip: "bg-amber-100 text-amber-800",    bar: "bg-amber-500" },
  NOTICES:   { chip: "bg-red-100 text-red-700",        bar: "bg-red-500" },
  BUSINESS:  { chip: "bg-primary/10 text-primary",     bar: "bg-primary" },
  COMMUNITY: { chip: "bg-green-100 text-green-800",    bar: "bg-green-500" },
  SAFETY:    { chip: "bg-orange-100 text-orange-800",  bar: "bg-orange-500" },
  TRAFFIC:   { chip: "bg-yellow-100 text-yellow-800",  bar: "bg-yellow-500" },
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
    month: "short",
    year: "numeric",
  })
}

export function NewsCard({ article }: { article: NewsCardData }) {
  const { lang } = useLanguage()
  const style    = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.GENERAL
  const catLabel = CATEGORY_LABELS_BI[article.category]?.[lang]
    ?? (article.category.charAt(0) + article.category.slice(1).toLowerCase())

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {article.cover_image_url ? (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm ${style.chip}`}>
            {catLabel}
          </span>
        </div>
      ) : (
        <div className={`h-1 w-full ${style.bar}`} />
      )}

      <div className="flex flex-1 flex-col p-4">
        {!article.cover_image_url && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style.chip}`}>
              {catLabel}
            </span>
            {article.is_featured && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
              </span>
            )}
          </div>
        )}

        <h2 className="mb-2 line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
          <span>{article.published_at ? formatDate(article.published_at, lang) : ""}</span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {article.view_count.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
