import { createClient } from "./server"

export type NewsCategory =
  | "GENERAL"
  | "EVENTS"
  | "NOTICES"
  | "BUSINESS"
  | "COMMUNITY"
  | "SAFETY"
  | "TRAFFIC"

export type ContentStatus = "PENDING" | "EDITORIAL" | "APPROVED" | "REJECTED"

export type HomepageSlot = "headline" | "ticker" | "sidebar" | "featured"

export interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  category: NewsCategory
  tags: string[]
  submitter_name: string
  submitter_email: string
  submitter_phone: string | null
  is_anonymous: boolean
  status: ContentStatus
  rejection_note: string | null
  reviewed_at: string | null
  published_at: string | null
  is_featured: boolean
  is_breaking: boolean
  is_pinned: boolean
  is_trending: boolean
  priority_rank: number
  scheduled_publish_at: string | null
  homepage_slot: HomepageSlot | null
  view_count: number
  created_at: string
  updated_at: string
}

export type NewsCardData = Pick<
  NewsArticle,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "cover_image_url"
  | "category"
  | "tags"
  | "is_featured"
  | "is_breaking"
  | "is_pinned"
  | "is_trending"
  | "priority_rank"
  | "homepage_slot"
  | "published_at"
  | "view_count"
>

const NEWS_CARD_FIELDS =
  "id, title, slug, excerpt, cover_image_url, category, tags, is_featured, is_breaking, is_pinned, is_trending, priority_rank, homepage_slot, published_at, view_count"

export interface ListNewsParams {
  page?: number
  limit?: number
  category?: NewsCategory
}

export async function listApprovedNews(params: ListNewsParams = {}) {
  const { page = 1, limit = 12, category } = params
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createClient()

  let query = supabase
    .from("news_articles")
    .select(NEWS_CARD_FIELDS, { count: "exact" })
    .eq("status", "APPROVED")
    .order("priority_rank", { ascending: true })
    .order("published_at", { ascending: false })
    .range(from, to)

  if (category) query = query.eq("category", category)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as NewsCardData[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function listBreakingNews(limit = 10): Promise<NewsCardData[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("news_articles")
    .select(NEWS_CARD_FIELDS)
    .eq("status", "APPROVED")
    .eq("is_breaking", true)
    .order("priority_rank", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit)

  return (data ?? []) as NewsCardData[]
}

export async function listHomepagePinnedNews(limit = 12): Promise<NewsCardData[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("news_articles")
    .select(NEWS_CARD_FIELDS)
    .eq("status", "APPROVED")
    .or("is_pinned.eq.true,is_featured.eq.true,homepage_slot.not.is.null")
    .order("priority_rank", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(limit)

  return (data ?? []) as NewsCardData[]
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "APPROVED")
    .single()

  if (error || !data) return null

  supabase.rpc("increment_news_view", { article_id: data.id }).then(() => {})

  return data as NewsArticle
}

// ── Slug ──────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 180)
}

async function uniqueSlug(title: string): Promise<string> {
  const supabase = await createClient()
  const candidate = `${slugify(title)}-${Date.now().toString(36)}`
  const { data } = await supabase
    .from("news_articles")
    .select("id")
    .eq("slug", candidate)
    .maybeSingle()
  return data
    ? `${candidate}-${Math.random().toString(36).slice(2, 6)}`
    : candidate
}

// ── Public submit ─────────────────────────────────────────────────

export interface SubmitNewsInput {
  title: string
  excerpt?: string
  content: string
  cover_image_url?: string
  category: NewsCategory
  tags?: string[]
  submitter_name: string
  submitter_email: string
  submitter_phone?: string
  is_anonymous?: boolean
}

export async function submitNews(input: SubmitNewsInput) {
  const supabase = await createClient()
  const slug = await uniqueSlug(input.title)

  const { data, error } = await supabase
    .from("news_articles")
    .insert({
      ...input,
      slug,
      tags: input.tags ?? [],
      status: "PENDING",
      is_anonymous: input.is_anonymous ?? false,
    })
    .select("id, title, slug")
    .single()

  if (error) throw error
  return data
}

// ── Admin reads ───────────────────────────────────────────────────

export async function adminListNews(params: {
  status?: ContentStatus
  page?: number
  limit?: number
} = {}) {
  const { status, page = 1, limit = 20 } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("news_articles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq("status", status)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as NewsArticle[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

// ── Admin moderation ──────────────────────────────────────────────

export async function moderateNews(
  id: string,
  status: "EDITORIAL" | "APPROVED" | "REJECTED",
  rejectionNote?: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      rejection_note: rejectionNote ?? null,
      ...(status === "APPROVED" && { published_at: new Date().toISOString() }),
    })
    .eq("id", id)

  if (error) throw error
}

export async function adminSaveEditorialNotes(id: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({ editorial_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function adminDeleteNews(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("news_articles").delete().eq("id", id)
  if (error) throw error
}

// ── Admin editorial controls ──────────────────────────────────────

type EditorialFlag = "is_featured" | "is_breaking" | "is_pinned" | "is_trending"

export async function adminToggleNewsFlag(id: string, field: EditorialFlag, value: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function adminSetHomepageSlot(id: string, slot: HomepageSlot | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({ homepage_slot: slot, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function adminSetPriorityRank(id: string, rank: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({ priority_rank: rank, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function adminSchedulePublish(id: string, datetime: string | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({ scheduled_publish_at: datetime, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function adminEditNews(
  id: string,
  patch: {
    title?: string
    excerpt?: string
    content?: string
    category?: NewsCategory
    cover_image_url?: string
    tags?: string[]
  }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("news_articles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}
