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

// ── Article type for content placement ───────────────────────────

export type BuilderArticle = {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  published_at: string | null
  category: string
  is_featured: boolean
  is_trending: boolean
  is_breaking: boolean
  homepage_slot: string | null
}

// ── Fetch recent approved articles for the content picker ─────────

export async function fetchBuilderArticlesAction(): Promise<{
  items: BuilderArticle[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") return { items: [], error: "Not authorized" }

    const { data, error } = await supabase
      .from("news_articles")
      .select(
        "id, title, slug, cover_image_url, published_at, category, is_featured, is_trending, is_breaking, homepage_slot"
      )
      .eq("status", "APPROVED")
      .order("published_at", { ascending: false })
      .limit(24)

    if (error) return { items: [], error: error.message }
    return { items: (data ?? []) as BuilderArticle[] }
  } catch (err) {
    return { items: [], error: err instanceof Error ? err.message : "Unknown error" }
  }
}

// ── Assign/clear a homepage slot on one article ───────────────────
// clearOthers = true clears the same slot from all other articles first

export async function setBuilderHomepageSlotAction(
  articleId: string,
  slot: "headline" | "featured" | "sidebar" | "ticker" | null,
  clearOthers = true
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") return { error: "Not authorized" }

    if (clearOthers && slot) {
      await supabase
        .from("news_articles")
        .update({ homepage_slot: null })
        .eq("homepage_slot", slot)
        .neq("id", articleId)
    }

    const { error } = await supabase
      .from("news_articles")
      .update({ homepage_slot: slot, updated_at: new Date().toISOString() })
      .eq("id", articleId)

    if (error) return { error: error.message }

    revalidateTag("news")
    revalidateTag("homepage-settings")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }
}

// ── Toggle a boolean flag on an article ───────────────────────────

export async function toggleBuilderArticleFlagAction(
  articleId: string,
  flag: "is_featured" | "is_trending" | "is_breaking",
  value: boolean
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") return { error: "Not authorized" }

    const { error } = await supabase
      .from("news_articles")
      .update({ [flag]: value, updated_at: new Date().toISOString() })
      .eq("id", articleId)

    if (error) return { error: error.message }

    revalidateTag("news")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" }
  }
}
