"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { HOMEPAGE_BOOL_KEYS } from "@/lib/supabase/homepage-settings"

export async function saveHomepageSettingsAction(formData: FormData) {
  const supabase = await createClient()

  const settings: Record<string, unknown> = {
    id: 1,
    hero_style: formData.get("hero_style") ?? "photo",
    layout_density: formData.get("layout_density") ?? "spacious",
    left_sidebar_fallback: formData.get("left_sidebar_fallback") ?? "trending",
    right_sidebar_fallback: formData.get("right_sidebar_fallback") ?? "community",
    updated_at: new Date().toISOString(),
  }

  for (const key of HOMEPAGE_BOOL_KEYS) {
    settings[key] = formData.has(key as string)
  }

  const { error } = await supabase.from("homepage_settings").upsert(settings)
  if (error) {
    redirect(`/admin/homepage?error=${encodeURIComponent(error.message)}`)
  }

  revalidateTag("homepage-settings")
  redirect("/admin/homepage?saved=1")
}
