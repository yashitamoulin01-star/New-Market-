import { createClient } from "./server"
export * from "./property-defs"
import type { PropertyType, ListingType, ContentStatus, PropertyListing, PropertyCardData, SubmitPropertyInput } from "./property-defs"

// ── Public queries ─────────────────────────────────────────────────

export interface ListPropertyParams {
  page?: number
  limit?: number
  propertyType?: PropertyType
  listingType?: ListingType
}

export async function listApprovedProperties(params: ListPropertyParams = {}) {
  const { page = 1, limit = 12, propertyType, listingType } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("property_listings")
    .select(
      "id, title, property_type, listing_type, address, floor, area_sqft, price, price_label, is_furnished, amenities, images, is_featured, view_count, created_at, expires_at",
      { count: "exact" }
    )
    .eq("status", "APPROVED")
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (propertyType) query = query.eq("property_type", propertyType)
  if (listingType)  query = query.eq("listing_type", listingType)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as PropertyCardData[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getPropertyById(id: string): Promise<PropertyListing | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("property_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "APPROVED")
    .single()

  if (error || !data) return null

  supabase.rpc("increment_property_view", { property_id: id }).then(() => {})

  return data as PropertyListing
}

// ── Public submit ──────────────────────────────────────────────────

export async function submitProperty(input: SubmitPropertyInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("property_listings")
    .insert({ ...input, status: "PENDING" })
    .select("id, title")
    .single()

  if (error) throw error
  return data
}

// ── Admin ──────────────────────────────────────────────────────────

export async function adminListProperties(params: {
  status?: ContentStatus
  page?: number
  limit?: number
} = {}) {
  const { status, page = 1, limit = 20 } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("property_listings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq("status", status)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as PropertyListing[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function moderateProperty(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionNote?: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("property_listings")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      rejection_note: rejectionNote ?? null,
    })
    .eq("id", id)

  if (error) throw error
}

export async function adminUpdateProperty(
  id: string,
  patch: Partial<Pick<PropertyListing, "title" | "description" | "address" | "floor" | "area_sqft" | "price_label" | "contact_name" | "contact_phone" | "contact_email" | "is_featured">>
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("property_listings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function restoreProperty(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("property_listings")
    .update({ status: "PENDING", rejection_note: null })
    .eq("id", id)
  if (error) throw error
}

export async function adminDeleteProperty(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("property_listings").delete().eq("id", id)
  if (error) throw error
}
