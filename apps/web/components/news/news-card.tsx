"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import type { NewsCardData } from "@/lib/supabase/news"
import { useLanguage } from "@/contexts/language-context"
import { SafeImage } from "@/components/ui/safe-image"

const CAT_BAR: Record<string, string> = {
  GENERAL:   "bg-slate-400",
  EVENTS:    "bg-amber-500",
  NOTICES:   "bg-red-500",
  BUSINESS:  "bg-primary",
  COMMUNITY: "bg-green-500",
  SAFETY:    "bg-orange-500",
  TRAFFIC:   "bg-yellow-500",
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
  const bar = CAT_BAR[article.category] ?? "bg-primary"

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {article.cover_image_url ? (
        <div className="relative h-44 w-full overflow-hidden">
          <SafeImage
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      ) : (
        <div className={`h-1 w-full ${bar}`} />
      )}

      <div className="flex flex-1 flex-col p-4">
        {!article.cover_image_url && article.is_featured && (
          <div className="mb-2.5">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
            </span>
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
