import { createClient } from "./server"

export type AdPosition = "top" | "bottom" | "left" | "right" | "middle"

export interface Advertisement {
  id: string
  position: AdPosition
  title: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export async function getActiveAdsByPosition(position: AdPosition): Promise<Advertisement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .eq("position", position)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(1)

  if (error || !data) return []
  return data as Advertisement[]
}

export async function adminListAds(): Promise<Advertisement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .order("position", { ascending: true })
    .order("display_order", { ascending: true })

  if (error || !data) return []
  return data as Advertisement[]
}

export async function adminCreateAd(input: Omit<Advertisement, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()
  const { error } = await supabase.from("advertisements").insert(input)
  if (error) throw error
}

export async function adminUpdateAd(id: string, input: Partial<Omit<Advertisement, "id" | "created_at" | "updated_at">>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("advertisements")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function adminDeleteAd(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("advertisements").delete().eq("id", id)
  if (error) throw error
}

export async function adminToggleAd(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("advertisements")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}
