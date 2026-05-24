import { createClient } from "./server"

export interface ArticleComment {
  id: string
  article_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  reactions: { up: number; down: number; userReaction: "up" | "down" | null }
}

export interface ReactionCounts {
  up: number
  down: number
  userReaction: "up" | "down" | null
}

export async function getArticleComments(
  articleId: string,
  currentUserId?: string | null
): Promise<ArticleComment[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from("article_comments")
    .select("id, article_id, user_id, user_name, content, created_at")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true })
    .limit(200)

  if (error || !rows?.length) return []

  const ids = rows.map((r) => r.id)
  const { data: rxRows } = await supabase
    .from("reactions")
    .select("target_id, reaction, user_id")
    .eq("target_type", "comment")
    .in("target_id", ids)

  return rows.map((row) => {
    const rx = rxRows?.filter((r) => r.target_id === row.id) ?? []
    return {
      ...row,
      reactions: {
        up:           rx.filter((r) => r.reaction === "up").length,
        down:         rx.filter((r) => r.reaction === "down").length,
        userReaction: currentUserId
          ? (rx.find((r) => r.user_id === currentUserId)?.reaction as "up" | "down" | null) ?? null
          : null,
      },
    }
  })
}

export interface CommentWithArticle {
  id: string
  article_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  article_title: string
  article_slug: string
}

export async function adminListComments(params: {
  page?: number
  limit?: number
} = {}): Promise<{ items: CommentWithArticle[]; total: number; totalPages: number }> {
  const { page = 1, limit = 30 } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from("article_comments")
    .select(
      `id, article_id, user_id, user_name, content, created_at,
       news_articles!inner(title, slug)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (error || !data) return { items: [], total: 0, totalPages: 0 }

  const items: CommentWithArticle[] = data.map((row: Record<string, unknown>) => {
    const article = row.news_articles as { title: string; slug: string } | null
    return {
      id:            row.id as string,
      article_id:    row.article_id as string,
      user_id:       row.user_id as string,
      user_name:     row.user_name as string,
      content:       row.content as string,
      created_at:    row.created_at as string,
      article_title: article?.title ?? "Unknown",
      article_slug:  article?.slug ?? "",
    }
  })

  return {
    items,
    total:      count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getArticleReactions(
  articleId: string,
  currentUserId?: string | null
): Promise<ReactionCounts> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("reactions")
    .select("reaction, user_id")
    .eq("target_type", "article")
    .eq("target_id", articleId)

  if (!data) return { up: 0, down: 0, userReaction: null }

  return {
    up:           data.filter((r) => r.reaction === "up").length,
    down:         data.filter((r) => r.reaction === "down").length,
    userReaction: currentUserId
      ? (data.find((r) => r.user_id === currentUserId)?.reaction as "up" | "down" | null) ?? null
      : null,
  }
}
