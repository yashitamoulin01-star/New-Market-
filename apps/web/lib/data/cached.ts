import { unstable_cache } from "next/cache"
import { supabasePublic } from "@/lib/supabase/public"
import type { NewsCardData, NewsCategory } from "@/lib/supabase/news"
import type { JobCardData, JobCategory, JobType } from "@/lib/supabase/jobs-defs"
import type { ShopCardData, ShopCategory } from "@/lib/supabase/shops-defs"
import type { PropertyCardData, ListingType } from "@/lib/supabase/property-defs"
import type { Advertisement, AdSlot } from "@/lib/supabase/ads-defs"
import type { ElectionWithDetails } from "@/lib/supabase/elections-defs"

const TTL = 60

type ListResult<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number }

const NEWS_CARD_FIELDS =
  "id, title, slug, excerpt, cover_image_url, category, tags, is_featured, is_breaking, is_pinned, is_trending, priority_rank, homepage_slot, published_at, view_count"

// ── News ──────────────────────────────────────────────────────────

export const getCachedNews = unstable_cache(
  async (p: { page?: number; limit?: number; category?: NewsCategory } = {}): Promise<ListResult<NewsCardData>> => {
    const { page = 1, limit = 12, category } = p
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = supabasePublic
      .from("news_articles")
      .select(NEWS_CARD_FIELDS, { count: "exact" })
      .eq("status", "APPROVED")
      .order("priority_rank", { ascending: true })
      .order("published_at", { ascending: false })
      .range(from, to)

    if (category) q = q.eq("category", category)

    const { data, error, count } = await q
    if (error) throw error

    return { items: (data ?? []) as NewsCardData[], total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
  },
  ["news-approved"],
  { revalidate: TTL, tags: ["news"] }
)

export const getCachedBreakingNews = unstable_cache(
  async (limit = 12): Promise<NewsCardData[]> => {
    const { data } = await supabasePublic
      .from("news_articles")
      .select(NEWS_CARD_FIELDS)
      .eq("status", "APPROVED")
      .eq("is_breaking", true)
      .order("priority_rank", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(limit)

    return (data ?? []) as NewsCardData[]
  },
  ["news-breaking"],
  { revalidate: TTL, tags: ["news"] }
)

export const getCachedHomepageNews = unstable_cache(
  async (limit = 12): Promise<NewsCardData[]> => {
    // Prioritise pinned/featured/slotted articles first, then fall back to latest by priority_rank
    const { data } = await supabasePublic
      .from("news_articles")
      .select(NEWS_CARD_FIELDS)
      .eq("status", "APPROVED")
      .order("priority_rank", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(limit)

    return (data ?? []) as NewsCardData[]
  },
  ["news-homepage"],
  { revalidate: TTL, tags: ["news"] }
)

// ── Jobs ──────────────────────────────────────────────────────────

export const getCachedJobs = unstable_cache(
  async (p: { page?: number; limit?: number; category?: JobCategory; jobType?: JobType } = {}): Promise<ListResult<JobCardData>> => {
    const { page = 1, limit = 12, category, jobType } = p
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = supabasePublic
      .from("job_listings")
      .select(
        "id, title, job_type, category, shop_name, shop_address, salary_min, salary_max, salary_label, application_mode, openings, is_featured, is_sponsored, view_count, created_at, expires_at",
        { count: "exact" }
      )
      .eq("status", "APPROVED")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("is_sponsored", { ascending: false })
      .order("is_featured",  { ascending: false })
      .order("created_at",   { ascending: false })
      .range(from, to)

    if (category) q = q.eq("category", category)
    if (jobType)  q = q.eq("job_type", jobType)

    const { data, error, count } = await q
    if (error) throw error

    return { items: (data ?? []) as JobCardData[], total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
  },
  ["jobs-approved"],
  { revalidate: TTL, tags: ["jobs"] }
)

// ── Shops ─────────────────────────────────────────────────────────

export const getCachedShops = unstable_cache(
  async (p: { page?: number; limit?: number; category?: ShopCategory } = {}): Promise<ListResult<ShopCardData>> => {
    const { page = 1, limit = 12, category } = p
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = supabasePublic
      .from("shops")
      .select(
        "id, name, category, address, phone, logo_url, cover_image_url, opening_hours, tags, is_verified, is_featured, is_sponsored, view_count, created_at",
        { count: "exact" }
      )
      .eq("status", "APPROVED")
      .order("is_sponsored", { ascending: false })
      .order("is_featured",  { ascending: false })
      .order("is_verified",  { ascending: false })
      .order("created_at",   { ascending: false })
      .range(from, to)

    if (category) q = q.eq("category", category)

    const { data, error, count } = await q
    if (error) throw error

    return { items: (data ?? []) as ShopCardData[], total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
  },
  ["shops-approved"],
  { revalidate: TTL, tags: ["shops"] }
)

// ── Property ──────────────────────────────────────────────────────

export const getCachedProperties = unstable_cache(
  async (p: { page?: number; limit?: number; listingType?: ListingType; propertyType?: import("@/lib/supabase/property-defs").PropertyType } = {}): Promise<ListResult<PropertyCardData>> => {
    const { page = 1, limit = 12, listingType, propertyType } = p
    const from = (page - 1) * limit
    const to = from + limit - 1

    let q = supabasePublic
      .from("property_listings")
      .select(
        "id, title, property_type, listing_type, address, floor, area_sqft, price, price_label, is_furnished, amenities, images, is_featured, view_count, created_at, expires_at",
        { count: "exact" }
      )
      .eq("status", "APPROVED")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("created_at",  { ascending: false })
      .range(from, to)

    if (listingType)  q = q.eq("listing_type", listingType)
    if (propertyType) q = q.eq("property_type", propertyType)

    const { data, error, count } = await q
    if (error) throw error

    return { items: (data ?? []) as PropertyCardData[], total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) }
  },
  ["properties-approved"],
  { revalidate: TTL, tags: ["property"] }
)

// ── Advertisements ────────────────────────────────────────────────

export const getCachedAds = unstable_cache(
  async (slot: AdSlot): Promise<Advertisement[]> => {
    const now = new Date().toISOString()
    const { data } = await supabasePublic
      .from("advertisements")
      .select("*")
      .eq("slot", slot)
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("priority", { ascending: false })
      .limit(3)

    return (data ?? []) as Advertisement[]
  },
  ["ads"],
  { revalidate: TTL, tags: ["ads"] }
)

// ── Active election ───────────────────────────────────────────────

export const getCachedActiveElection = unstable_cache(
  async (): Promise<ElectionWithDetails | null> => {
    const { data: election } = await supabasePublic
      .from("elections")
      .select("*")
      .neq("phase", "DRAFT")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!election) return null

    const [posResult, canResult] = await Promise.all([
      supabasePublic
        .from("election_positions")
        .select("*")
        .eq("election_id", election.id)
        .order("sort_order"),
      supabasePublic
        .from("election_candidates")
        .select("*")
        .eq("election_id", election.id)
        .order("vote_count", { ascending: false }),
    ])

    return {
      ...election,
      positions: posResult.data ?? [],
      candidates: canResult.data ?? [],
    } as ElectionWithDetails
  },
  ["active-election"],
  { revalidate: TTL, tags: ["elections"] }
)
