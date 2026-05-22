import { unstable_cache } from "next/cache"
import { supabasePublic } from "@/lib/supabase/public"
import type { NewsCardData, NewsCategory } from "@/lib/supabase/news"
import type { JobCardData, JobCategory, JobType } from "@/lib/supabase/jobs-defs"
import type { ShopCardData, ShopCategory } from "@/lib/supabase/shops-defs"
import type { PropertyCardData, ListingType } from "@/lib/supabase/property-defs"

const TTL = 60 // cache for 60 seconds

type ListResult<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number }

// ── News ──────────────────────────────────────────────────────────

export const getCachedNews = unstable_cache(
  async (p: { page?: number; limit?: number; category?: NewsCategory } = {}): Promise<ListResult<NewsCardData>> => {
    const { page = 1, limit = 12, category } = p
    const from = (page - 1) * limit
    const to   = from + limit - 1

    let q = supabasePublic
      .from("news_articles")
      .select(
        "id, title, slug, excerpt, cover_image_url, category, tags, is_featured, published_at, view_count",
        { count: "exact" }
      )
      .eq("status", "APPROVED")
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

// ── Jobs ──────────────────────────────────────────────────────────

export const getCachedJobs = unstable_cache(
  async (p: { page?: number; limit?: number; category?: JobCategory; jobType?: JobType } = {}): Promise<ListResult<JobCardData>> => {
    const { page = 1, limit = 12, category, jobType } = p
    const from = (page - 1) * limit
    const to   = from + limit - 1

    let q = supabasePublic
      .from("job_listings")
      .select(
        "id, title, job_type, category, shop_name, shop_address, salary_min, salary_max, salary_label, application_mode, openings, is_featured, view_count, created_at, expires_at",
        { count: "exact" }
      )
      .eq("status", "APPROVED")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
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
    const to   = from + limit - 1

    let q = supabasePublic
      .from("shops")
      .select(
        "id, name, category, address, phone, logo_url, cover_image_url, opening_hours, tags, is_verified, is_featured, view_count, created_at",
        { count: "exact" }
      )
      .eq("status", "APPROVED")
      .order("is_featured", { ascending: false })
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
    const to   = from + limit - 1

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
