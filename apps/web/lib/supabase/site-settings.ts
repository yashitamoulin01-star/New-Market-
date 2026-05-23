import { createClient } from "./server"
import { supabasePublic } from "./public"

export async function getSiteSetting(key: string): Promise<string | null> {
  const { data } = await supabasePublic
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()

  return data?.value ?? null
}

export async function setSiteSetting(key: string, value: string | null): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

  if (error) throw error
}

export async function getAllSiteSettings(): Promise<Record<string, string | null>> {
  const { data } = await supabasePublic
    .from("site_settings")
    .select("key, value")

  const result: Record<string, string | null> = {}
  for (const row of data ?? []) {
    result[row.key] = row.value
  }
  return result
}
