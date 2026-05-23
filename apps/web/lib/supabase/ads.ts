import { createClient } from "./server"
export * from "./ads-defs"
import type { Advertisement, AdSlot } from "./ads-defs"

export async function getAdsForSlot(slot: AdSlot): Promise<Advertisement[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from("advertisements")
    .select("*")
    .eq("slot", slot)
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("priority", { ascending: false })
    .limit(3)

  return (data ?? []) as Advertisement[]
}

export async function adminListAds(): Promise<Advertisement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .order("slot")
    .order("priority", { ascending: false })

  if (error) throw error
  return (data ?? []) as Advertisement[]
}

export async function adminCreateAd(input: {
  title: string
  image_url: string
  link_url?: string
  slot: AdSlot
  is_active?: boolean
  priority?: number
  starts_at?: string
  ends_at?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("advertisements")
    .insert({ is_active: true, priority: 10, ...input })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function adminUpdateAd(
  id: string,
  patch: Partial<Omit<Advertisement, "id" | "click_count" | "created_at">>
) {
  const supabase = await createClient()
  const { error } = await supabase.from("advertisements").update(patch).eq("id", id)
  if (error) throw error
}

export async function adminDeleteAd(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("advertisements").delete().eq("id", id)
  if (error) throw error
}

export async function adminTrackAdClick(id: string) {
  const supabase = await createClient()
  await supabase.rpc("increment_ad_click", { ad_id: id })
}
