// Client-safe types and labels for advertisements. No server imports.

export type AdSlot =
  | "homepage-top"
  | "homepage-left"
  | "homepage-right"
  | "homepage-mid-1"
  | "homepage-mid-2"
  | "homepage-bottom"
  | "news-inline"
  | "sidebar"
  | "strip"
  | "article-top"

export interface Advertisement {
  id: string
  title: string
  image_url: string
  link_url: string | null
  slot: AdSlot
  is_active: boolean
  priority: number
  starts_at: string | null
  ends_at: string | null
  click_count: number
  created_at: string
}

export const AD_SLOTS: AdSlot[] = [
  "homepage-top",
  "homepage-left",
  "homepage-right",
  "homepage-mid-1",
  "homepage-mid-2",
  "homepage-bottom",
  "news-inline",
  "sidebar",
  "strip",
  "article-top",
]

export const AD_SLOT_LABELS: Record<AdSlot, string> = {
  "homepage-top":    "Homepage — Top Banner",
  "homepage-left":   "Homepage — Left Sidebar",
  "homepage-right":  "Homepage — Right Sidebar",
  "homepage-mid-1":  "Homepage — Mid 1",
  "homepage-mid-2":  "Homepage — Mid 2",
  "homepage-bottom": "Homepage — Bottom Strip",
  "news-inline":     "News — Inline",
  "sidebar":         "Sidebar",
  "strip":           "Strip / Footer",
  "article-top":     "Article — Top",
}
