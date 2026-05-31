import { notFound } from "next/navigation"
import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import type { Metadata } from "next"
import { ShieldOff } from "lucide-react"
import { getArticleBySlug } from "@/lib/supabase/news"
import { getArticleReactions } from "@/lib/supabase/comments"
import { createClient } from "@/lib/supabase/server"
import { ArticleReactions } from "@/components/news/article-reactions"
import { T } from "@/components/ui/t"

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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const reactionsWithUser = await getArticleReactions(article.id, user?.id ?? null)

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  const loginHref = `/login?redirect=/news/${slug}`

  return (
    <article className="container max-w-3xl py-8">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <T en="← Back to News" hi="← समाचार पर वापस" />
      </Link>

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
        {article.title}
      </h1>

      {/* Meta row */}
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

      {/* Reactions */}
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
          <SafeImage
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
            style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
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
    </article>
  )
}
