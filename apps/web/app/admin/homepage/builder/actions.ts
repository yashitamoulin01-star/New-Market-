"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import type { LayoutConfig } from "@/lib/supabase/layout-config"

export async function saveLayoutConfigAction(config: LayoutConfig): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const role = user.user_metadata?.role
    if (role !== "admin") return { error: "Not authorized — admin only" }

    const { error } = await supabase
      .from("homepage_settings")
      .upsert({
        id: 1,
        layout_config: config,
        updated_at: new Date().toISOString(),
      })

    if (error) return { error: error.message }

    revalidateTag("homepage-settings")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }
}
