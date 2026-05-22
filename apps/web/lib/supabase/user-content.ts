import { createClient } from "./server"
import type { ContentStatus } from "./news"

export interface UserNewsItem {
  id: string
  title: string
  slug: string
  category: string
  status: ContentStatus
  rejection_note: string | null
  created_at: string
  published_at: string | null
  is_anonymous: boolean
}

export interface UserJobItem {
  id: string
  title: string
  shop_name: string
  category: string
  status: ContentStatus
  rejection_note: string | null
  created_at: string
}

export interface UserShopItem {
  id: string
  name: string
  category: string
  status: ContentStatus
  rejection_note: string | null
  created_at: string
}

export interface UserPropertyItem {
  id: string
  title: string
  listing_type: string
  property_type: string
  status: ContentStatus
  rejection_note: string | null
  created_at: string
}

export interface UserCommentItem {
  id: string
  content: string
  created_at: string
  article_id: string
  article_title: string
  article_slug: string
}

export async function getUserNews(email: string): Promise<UserNewsItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("news_articles")
    .select("id, title, slug, category, status, rejection_note, created_at, published_at, is_anonymous")
    .eq("submitter_email", email)
    .order("created_at", { ascending: false })
    .limit(50)
  return (data ?? []) as UserNewsItem[]
}

export async function getUserJobs(email: string): Promise<UserJobItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("job_listings")
    .select("id, title, shop_name, category, status, rejection_note, created_at")
    .eq("contact_email", email)
    .order("created_at", { ascending: false })
    .limit(50)
  return (data ?? []) as UserJobItem[]
}

export async function getUserShops(email: string): Promise<UserShopItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("shops")
    .select("id, name, category, status, rejection_note, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(50)
  return (data ?? []) as UserShopItem[]
}

export async function getUserProperties(email: string): Promise<UserPropertyItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("property_listings")
    .select("id, title, listing_type, property_type, status, rejection_note, created_at")
    .eq("contact_email", email)
    .order("created_at", { ascending: false })
    .limit(50)
  return (data ?? []) as UserPropertyItem[]
}

export async function getUserComments(userId: string): Promise<UserCommentItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("article_comments")
    .select(`id, content, created_at, article_id, news_articles!inner(title, slug)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (!data) return []
  return data.map((row: Record<string, unknown>) => {
    const article = row.news_articles as { title: string; slug: string } | null
    return {
      id:            row.id as string,
      content:       row.content as string,
      created_at:    row.created_at as string,
      article_id:    row.article_id as string,
      article_title: article?.title ?? "Unknown article",
      article_slug:  article?.slug ?? "",
    }
  })
}
