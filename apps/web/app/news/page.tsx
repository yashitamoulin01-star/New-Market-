import Link from "next/link"
import { Newspaper, Plus } from "lucide-react"
import { getCachedNews } from "@/lib/data/cached"
import type { NewsCategory } from "@/lib/supabase/news"
import { NewsCard } from "@/components/news/news-card"
import { T } from "@/components/ui/t"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Local News — New Market" }

const CATEGORIES: { en: string; hi: string; value: NewsCategory | "ALL" }[] = [
  { en: "All",       hi: "सभी",       value: "ALL" },
  { en: "General",   hi: "सामान्य",   value: "GENERAL" },
  { en: "Events",    hi: "इवेंट",     value: "EVENTS" },
  { en: "Notices",   hi: "सूचनाएँ",   value: "NOTICES" },
  { en: "Business",  hi: "व्यापार",   value: "BUSINESS" },
  { en: "Community", hi: "समुदाय",    value: "COMMUNITY" },
  { en: "Safety",    hi: "सुरक्षा",   value: "SAFETY" },
  { en: "Traffic",   hi: "यातायात",   value: "TRAFFIC" },
]

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category, page } = await searchParams
  const currentPage     = Math.max(1, Number(page) || 1)
  const currentCategory = category as NewsCategory | undefined

  const { items, totalPages, total } = await getCachedNews({
    page: currentPage,
    category: currentCategory,
  })

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold">
            <Newspaper size={22} className="text-primary" />
            <T en="Local News" hi="स्थानीय समाचार" />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? <T en={`${total} article${total !== 1 ? "s" : ""} in New Market`} hi={`नई मार्केट में ${total} समाचार`} />
              : <T en="News from New Market, Bhopal" hi="नई मार्केट, भोपाल के समाचार" />
            }
          </p>
        </div>
        <Link
          href="/news/submit"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus size={15} />
          <T en="Submit News" hi="समाचार भेजें" />
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const active = (cat.value === "ALL" && !currentCategory) || cat.value === currentCategory
          const href   = cat.value === "ALL" ? "/news" : `/news?category=${cat.value}`
          return (
            <Link
              key={cat.value}
              href={href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              <T en={cat.en} hi={cat.hi} />
            </Link>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card py-16 text-center">
          <Newspaper size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="mb-1 font-medium text-muted-foreground">
            <T en="No articles yet." hi="अभी कोई समाचार नहीं।" />
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            <Link href="/news/submit" className="text-primary hover:underline">
              <T en="Be the first to submit one." hi="पहले समाचार भेजें।" />
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/news?page=${currentPage - 1}${currentCategory ? `&category=${currentCategory}` : ""}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <T en="Previous" hi="पिछला" />
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            <T en={`Page ${currentPage} of ${totalPages}`} hi={`पृष्ठ ${currentPage} / ${totalPages}`} />
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/news?page=${currentPage + 1}${currentCategory ? `&category=${currentCategory}` : ""}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <T en="Next" hi="अगला" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
