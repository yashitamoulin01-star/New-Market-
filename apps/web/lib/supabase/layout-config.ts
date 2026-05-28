// Client-safe — no server imports. Types + defaults for the visual homepage builder.

export type SectionId =
  | "ticker"
  | "top_ad"
  | "hero"
  | "mini_grid"
  | "latest_panel"
  | "trending"
  | "text_stories"
  | "jobs_panel"
  | "section_links"
  | "mid_ad"
  | "youtube"
  | "local_updates"
  | "elections"
  | "property_panel"
  | "shops_strip"
  | "bottom_ad"
  | "community_strip"

// Out of 12 columns — maps to Tailwind col-span values
export type ColSpan = 3 | 4 | 6 | 8 | 9 | 12

export type SectionSize = "compact" | "normal" | "large"

export type SectionBlock = {
  id: SectionId
  enabled: boolean
  colSpan: ColSpan
  size: SectionSize
  variant?: string  // e.g. "photo" | "text-split" for hero
}

export type LayoutRow = {
  id: string
  enabled: boolean
  sections: SectionBlock[]
}

export type LayoutMeta = {
  auto_balance: boolean
  smart_healing: boolean
  auto_expand: boolean
  collision_prevention: boolean
  fallback_replacement: boolean
  ad_priority: "high" | "normal" | "low"
  content_priority: "image_first" | "text_first"
  trending_preference: "latest" | "trending"
}

export const DEFAULT_LAYOUT_META: LayoutMeta = {
  auto_balance: true,
  smart_healing: true,
  auto_expand: true,
  collision_prevention: true,
  fallback_replacement: true,
  ad_priority: "normal",
  content_priority: "image_first",
  trending_preference: "trending",
}

export type LayoutConfig = {
  rows: LayoutRow[]
  version: number
  meta?: Partial<LayoutMeta>
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  version: 1,
  rows: [
    {
      id: "r-ticker",
      enabled: true,
      sections: [{ id: "ticker", enabled: true, colSpan: 12, size: "compact" }],
    },
    {
      id: "r-top-ad",
      enabled: true,
      sections: [{ id: "top_ad", enabled: true, colSpan: 12, size: "normal" }],
    },
    {
      id: "r-hero",
      enabled: true,
      sections: [
        { id: "hero", enabled: true, colSpan: 8, size: "large", variant: "photo" },
        { id: "latest_panel", enabled: true, colSpan: 4, size: "normal" },
      ],
    },
    {
      id: "r-secondary",
      enabled: true,
      sections: [
        { id: "mini_grid", enabled: true, colSpan: 8, size: "normal" },
        { id: "jobs_panel", enabled: true, colSpan: 4, size: "normal" },
      ],
    },
    {
      id: "r-trending",
      enabled: true,
      sections: [
        { id: "trending", enabled: true, colSpan: 8, size: "normal" },
        { id: "text_stories", enabled: true, colSpan: 4, size: "normal" },
      ],
    },
    {
      id: "r-links",
      enabled: true,
      sections: [{ id: "section_links", enabled: true, colSpan: 12, size: "compact" }],
    },
    {
      id: "r-mid-ad",
      enabled: true,
      sections: [{ id: "mid_ad", enabled: true, colSpan: 12, size: "normal" }],
    },
    {
      id: "r-youtube",
      enabled: true,
      sections: [
        { id: "youtube", enabled: true, colSpan: 8, size: "normal" },
        { id: "elections", enabled: true, colSpan: 4, size: "normal" },
      ],
    },
    {
      id: "r-local",
      enabled: true,
      sections: [{ id: "local_updates", enabled: true, colSpan: 12, size: "normal" }],
    },
    {
      id: "r-property",
      enabled: false,
      sections: [{ id: "property_panel", enabled: false, colSpan: 12, size: "normal" }],
    },
    {
      id: "r-shops",
      enabled: true,
      sections: [{ id: "shops_strip", enabled: true, colSpan: 12, size: "normal" }],
    },
    {
      id: "r-bottom-ad",
      enabled: true,
      sections: [{ id: "bottom_ad", enabled: true, colSpan: 12, size: "normal" }],
    },
    {
      id: "r-community",
      enabled: true,
      sections: [{ id: "community_strip", enabled: true, colSpan: 12, size: "normal" }],
    },
  ],
}

// Helper: merge stored config with defaults (handles new rows added in future versions)
export function mergeLayoutConfig(stored: Partial<LayoutConfig>): LayoutConfig {
  if (!stored?.rows?.length) return DEFAULT_LAYOUT_CONFIG
  return { version: stored.version ?? 1, rows: stored.rows }
}
