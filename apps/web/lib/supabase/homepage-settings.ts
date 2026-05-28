// Client-safe types for homepage settings. Server write function is below.
// Public read goes through lib/data/cached.ts getCachedHomepageSettings.
import type { LayoutConfig } from "./layout-config"

export interface HomepageSettings {
  show_ticker: boolean
  show_top_ad: boolean
  show_hero_news: boolean
  show_mini_grid: boolean
  show_latest_panel: boolean
  show_trending: boolean
  show_text_stories: boolean
  show_jobs_panel: boolean
  show_section_links: boolean
  show_mid_ad: boolean
  show_youtube: boolean
  show_local_updates: boolean
  show_elections: boolean
  show_property_panel: boolean
  show_shops_strip: boolean
  show_community_strip: boolean
  show_bottom_ad: boolean
  show_left_ad: boolean
  show_right_ad: boolean
  left_sidebar_fallback: "trending" | "latest" | "jobs" | "community" | "none"
  right_sidebar_fallback: "trending" | "latest" | "jobs" | "community" | "none"
  hero_style: "photo" | "text-split"
  layout_density: "compact" | "spacious"
  layout_config?: LayoutConfig | null
}

export const DEFAULT_SETTINGS: HomepageSettings = {
  show_ticker: true,
  show_top_ad: true,
  show_hero_news: true,
  show_mini_grid: true,
  show_latest_panel: true,
  show_trending: true,
  show_text_stories: true,
  show_jobs_panel: true,
  show_section_links: true,
  show_mid_ad: true,
  show_youtube: true,
  show_local_updates: true,
  show_elections: true,
  show_property_panel: true,
  show_shops_strip: true,
  show_community_strip: true,
  show_bottom_ad: true,
  show_left_ad: true,
  show_right_ad: true,
  left_sidebar_fallback: "trending",
  right_sidebar_fallback: "community",
  hero_style: "photo",
  layout_density: "spacious",
}

export const HOMEPAGE_BOOL_KEYS: (keyof HomepageSettings)[] = [
  "show_ticker", "show_top_ad", "show_hero_news", "show_mini_grid",
  "show_latest_panel", "show_trending", "show_text_stories", "show_jobs_panel",
  "show_section_links", "show_mid_ad", "show_youtube", "show_local_updates",
  "show_elections", "show_property_panel", "show_shops_strip", "show_community_strip",
  "show_bottom_ad", "show_left_ad", "show_right_ad",
]

export async function adminUpdateHomepageSettings(
  settings: Partial<HomepageSettings>
): Promise<void> {
  const { createClient } = await import("./server")
  const supabase = await createClient()
  await supabase
    .from("homepage_settings")
    .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
}
