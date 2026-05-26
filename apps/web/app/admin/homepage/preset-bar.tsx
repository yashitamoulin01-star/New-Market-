"use client"

import type { HomepageSettings } from "@/lib/supabase/homepage-settings"

type Preset = Partial<HomepageSettings>

const PRESETS: { label: string; description: string; color: string; values: Preset }[] = [
  {
    label: "Classic Newsroom",
    description: "All widgets on, photo hero, spacious layout",
    color: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
    values: {
      show_ticker: true, show_top_ad: true, show_hero_news: true, show_mini_grid: true,
      show_latest_panel: true, show_trending: true, show_text_stories: true,
      show_jobs_panel: true, show_section_links: true, show_mid_ad: true,
      show_youtube: true, show_local_updates: true, show_elections: true,
      show_property_panel: true, show_shops_strip: true, show_community_strip: true,
      show_bottom_ad: true, show_left_ad: true, show_right_ad: true,
      hero_style: "photo", layout_density: "spacious",
      left_sidebar_fallback: "trending", right_sidebar_fallback: "community",
    },
  },
  {
    label: "Minimal Clean",
    description: "No ads, focus on news content only",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-400/30 hover:bg-emerald-500/20 dark:text-emerald-400",
    values: {
      show_ticker: true, show_top_ad: false, show_hero_news: true, show_mini_grid: true,
      show_latest_panel: true, show_trending: true, show_text_stories: true,
      show_jobs_panel: false, show_section_links: true, show_mid_ad: false,
      show_youtube: false, show_local_updates: true, show_elections: true,
      show_property_panel: false, show_shops_strip: false, show_community_strip: true,
      show_bottom_ad: false, show_left_ad: false, show_right_ad: false,
      hero_style: "photo", layout_density: "spacious",
      left_sidebar_fallback: "trending", right_sidebar_fallback: "community",
    },
  },
  {
    label: "Breaking News",
    description: "Big hero, no clutter, max focus on stories",
    color: "bg-red-500/10 text-red-700 border-red-400/30 hover:bg-red-500/20 dark:text-red-400",
    values: {
      show_ticker: true, show_top_ad: true, show_hero_news: true, show_mini_grid: false,
      show_latest_panel: true, show_trending: false, show_text_stories: true,
      show_jobs_panel: false, show_section_links: false, show_mid_ad: false,
      show_youtube: false, show_local_updates: false, show_elections: false,
      show_property_panel: false, show_shops_strip: false, show_community_strip: false,
      show_bottom_ad: false, show_left_ad: false, show_right_ad: false,
      hero_style: "photo", layout_density: "spacious",
      left_sidebar_fallback: "none", right_sidebar_fallback: "none",
    },
  },
  {
    label: "Heavy Ads",
    description: "All ad slots active, full sidebar ads",
    color: "bg-amber-500/10 text-amber-700 border-amber-400/30 hover:bg-amber-500/20 dark:text-amber-400",
    values: {
      show_ticker: true, show_top_ad: true, show_hero_news: true, show_mini_grid: true,
      show_latest_panel: true, show_trending: true, show_text_stories: false,
      show_jobs_panel: true, show_section_links: true, show_mid_ad: true,
      show_youtube: true, show_local_updates: false, show_elections: true,
      show_property_panel: true, show_shops_strip: true, show_community_strip: true,
      show_bottom_ad: true, show_left_ad: true, show_right_ad: true,
      hero_style: "photo", layout_density: "compact",
      left_sidebar_fallback: "trending", right_sidebar_fallback: "latest",
    },
  },
]

export function PresetBar() {
  function applyPreset(preset: Preset) {
    const form = document.getElementById("homepage-settings-form") as HTMLFormElement | null
    if (!form) return

    for (const [key, value] of Object.entries(preset)) {
      if (typeof value === "boolean") {
        const el = form.elements.namedItem(key) as HTMLInputElement | null
        if (el) el.checked = value
      } else if (typeof value === "string") {
        const el = form.elements.namedItem(key) as HTMLSelectElement | null
        if (el) el.value = value
        // handle radio buttons
        const radios = form.querySelectorAll<HTMLInputElement>(`input[name="${key}"]`)
        radios.forEach((r) => { r.checked = r.value === value })
      }
    }
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <span className="self-center text-xs font-semibold text-muted-foreground">Quick Presets:</span>
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => applyPreset(p.values)}
          title={p.description}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${p.color}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
