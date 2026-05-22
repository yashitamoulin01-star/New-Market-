import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { ShieldOff } from "lucide-react"
import { getArticleBySlug } from "@/lib/supabase/news"
import { getArticleComments, getArticleReactions } from "@/lib/supabase/comments"
import { createClient } from "@/lib/supabase/server"
import { ArticleReactions } from "@/components/news/article-reactions"
import { ArticleComments } from "@/components/news/article-comments"
import { T } from "@/components/ui/t"

const CATEGORY_LABELS_BI: Record<string, { en: string; hi: string }> = {
  GENERAL:   { en: "General",   hi: "सामान्य" },
  EVENTS:    { en: "Events",    hi: "इवेंट" },
  NOTICES:   { en: "Notices",   hi: "सूचनाएँ" },
  BUSINESS:  { en: "Business",  hi: "व्यापार" },
  COMMUNITY: { en: "Community", hi: "समुदाय" },
  SAFETY:    { en: "Safety",    hi: "सुरक्षा" },
  TRAFFIC:   { en: "Traffic",   hi: "यातायात" },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: "Article not found" }
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : [],
      type: "article",
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  // Fetch current user first (fast, from cookies), then all social data in parallel
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [commentsWithUser, reactionsWithUser] = await Promise.all([
    getArticleComments(article.id, user?.id ?? null),
    getArticleReactions(article.id, user?.id ?? null),
  ])

  const isAdmin = (user?.user_metadata?.role as string | undefined) === "admin"
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    null

  const currentUser = user && userName
    ? { id: user.id, name: userName, isAdmin }
    : null

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  const catLabel = CATEGORY_LABELS_BI[article.category]
  const loginHref = `/login?redirect=/news/${slug}`

  return (
    <article className="container max-w-3xl py-8">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <T en="← Back to News" hi="← समाचार पर वापस" />
      </Link>

      {/* Category + featured badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {catLabel
            ? <T en={catLabel.en} hi={catLabel.hi} />
            : article.category.charAt(0) + article.category.slice(1).toLowerCase()}
        </span>
        {article.is_featured && (
          <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-amber-800">
            <T en="Featured" hi="फ़ीचर्ड" />
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
        {article.title}
      </h1>

      {/* Meta row: author, date, views */}
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {article.is_anonymous ? (
            <>
              <ShieldOff size={13} className="text-muted-foreground/60" />
              <T en="Anonymous" hi="गुमनाम" />
            </>
          ) : (
            <><T en="By" hi="द्वारा" /> {article.submitter_name}</>
          )}
        </span>
        {publishedDate && <span>{publishedDate}</span>}
        <span>{article.view_count.toLocaleString()} <T en="views" hi="व्यूज़" /></span>
      </div>

      {/* Article-level reactions — subtle, right below the meta */}
      <div className="mb-6 flex items-center gap-3">
        <ArticleReactions
          targetType="article"
          targetId={article.id}
          initialUp={reactionsWithUser.up}
          initialDown={reactionsWithUser.down}
          initialUserReaction={reactionsWithUser.userReaction}
          isLoggedIn={!!user}
          loginHref={loginHref}
        />
      </div>

      {/* Cover image */}
      {article.cover_image_url && (
        <div className="relative mb-8 h-56 w-full overflow-hidden rounded-xl sm:h-72 lg:h-96">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Body */}
      <div className="space-y-4">
        {article.content.split(/\n\n+/).map((para, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-foreground/90 sm:text-base"
          >
            {para.trim()}
          </p>
        ))}
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments + per-comment reactions */}
      <ArticleComments
        articleId={article.id}
        articleSlug={slug}
        initialComments={commentsWithUser}
        currentUser={currentUser}
      />
    </article>
  )
}
