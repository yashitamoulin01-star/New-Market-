import { createClient } from "./server"
export * from "./shops-defs"
import type { ShopCategory, ContentStatus, Shop, ShopCardData, SubmitShopInput } from "./shops-defs"

// ── Public queries ─────────────────────────────────────────────────

export interface ListShopsParams {
  page?: number
  limit?: number
  category?: ShopCategory
  search?: string
}

export async function listApprovedShops(params: ListShopsParams = {}) {
  const { page = 1, limit = 12, category, search } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("shops")
    .select(
      "id, name, category, address, phone, logo_url, cover_image_url, opening_hours, tags, is_verified, is_featured, view_count, created_at",
      { count: "exact" }
    )
    .eq("status", "APPROVED")
    .order("is_featured", { ascending: false })
    .order("is_verified", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (category) query = query.eq("category", category)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as ShopCardData[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getShopById(id: string): Promise<Shop | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", id)
    .eq("status", "APPROVED")
    .single()

  if (error || !data) return null

  supabase.rpc("increment_shop_view", { shop_id: id }).then(() => {})

  return data as Shop
}

// ── Public submit ──────────────────────────────────────────────────

export async function submitShop(input: SubmitShopInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("shops")
    .insert({ ...input, status: "APPROVED" })
    .select("id, name")
    .single()

  if (error) throw error
  return data
}

// ── Admin ──────────────────────────────────────────────────────────

export async function adminListShops(params: {
  status?: ContentStatus
  page?: number
  limit?: number
} = {}) {
  const { status, page = 1, limit = 20 } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("shops")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq("status", status)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as Shop[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function moderateShop(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionNote?: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("shops")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      rejection_note: rejectionNote ?? null,
    })
    .eq("id", id)

  if (error) throw error
}

export async function adminToggleVerified(id: string, is_verified: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from("shops").update({ is_verified }).eq("id", id)
  if (error) throw error
}

export async function adminDeleteShop(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("shops").delete().eq("id", id)
  if (error) throw error
}
