import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DEFAULT_SETTINGS, type HomepageSettings } from "@/lib/supabase/homepage-settings"
import { saveHomepageSettingsAction } from "./actions"
import { PresetBar } from "./preset-bar"
import { LayoutDashboard } from "lucide-react"

async function getSettings(): Promise<HomepageSettings> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("homepage_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
    if (!data) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...data } as HomepageSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string
  label: string
  description: string
  defaultChecked: boolean
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 transition hover:bg-muted/30">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer h-4 w-4 cursor-pointer rounded border-border accent-primary"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold leading-tight text-foreground">{label}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{description}</p>
      </div>
    </label>
  )
}

function ToggleGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/40 px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      </div>
      <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

export default async function AdminHomepagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const s = await getSettings()

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-start gap-3">
        <LayoutDashboard size={24} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Homepage Layout</h1>
          <p className="text-sm text-muted-foreground">
            Control which widgets appear and how the homepage adapts. Empty slots auto-fill with content.
          </p>
        </div>
      </div>

      <PresetBar />

      <form id="homepage-settings-form" action={saveHomepageSettingsAction} className="space-y-5">

        {/* ── News Zone ────────────────────────────────────────────── */}
        <ToggleGroup title="News Zone">
          <Toggle name="show_hero_news"    label="Hero Story"          description="Featured article with image overlay"   defaultChecked={s.show_hero_news} />
          <Toggle name="show_mini_grid"    label="Mini Story Grid"     description="2×2 supporting articles grid"          defaultChecked={s.show_mini_grid} />
          <Toggle name="show_latest_panel" label="Latest News Panel"   description="Scrollable recent articles"            defaultChecked={s.show_latest_panel} />
          <Toggle name="show_trending"     label="Trending Section"    description="Horizontal scroll of trending stories" defaultChecked={s.show_trending} />
          <Toggle name="show_text_stories" label="Text Headlines"      description="No-image articles as compact list"     defaultChecked={s.show_text_stories} />
          <Toggle name="show_section_links" label="Section Quick-Links" description="News/Jobs/Shops/Property/Elections bar" defaultChecked={s.show_section_links} />
        </ToggleGroup>

        {/* ── Content Widgets ──────────────────────────────────────── */}
        <ToggleGroup title="Content Widgets">
          <Toggle name="show_jobs_panel"    label="Job Openings Panel"  description="Latest jobs in the news sidebar"      defaultChecked={s.show_jobs_panel} />
          <Toggle name="show_youtube"       label="YouTube Videos"      description="Video content section"                defaultChecked={s.show_youtube} />
          <Toggle name="show_local_updates" label="Local Updates Grid"  description="Compact news below YouTube"           defaultChecked={s.show_local_updates} />
          <Toggle name="show_elections"     label="Elections Widget"    description="Active election teaser card"          defaultChecked={s.show_elections} />
          <Toggle name="show_property_panel" label="Property Listings"  description="Property teaser in sidebar"           defaultChecked={s.show_property_panel} />
          <Toggle name="show_shops_strip"   label="Featured Shops"      description="4-shop strip near bottom"             defaultChecked={s.show_shops_strip} />
          <Toggle name="show_community_strip" label="Community CTA Strip" description="Submit news/jobs/shops banner"      defaultChecked={s.show_community_strip} />
          <Toggle name="show_ticker"        label="News Ticker"         description="Scrolling headline ticker at top"     defaultChecked={s.show_ticker} />
        </ToggleGroup>

        {/* ── Ad Slots ─────────────────────────────────────────────── */}
        <ToggleGroup title="Ad Slots">
          <Toggle name="show_top_ad"    label="Top Banner Ad"       description="Full-width leaderboard above stories"   defaultChecked={s.show_top_ad} />
          <Toggle name="show_left_ad"   label="Left Sidebar Ad"     description="Skyscraper ad (xl screens only)"        defaultChecked={s.show_left_ad} />
          <Toggle name="show_right_ad"  label="Right Sidebar Ad"    description="Skyscraper ad (xl screens only)"        defaultChecked={s.show_right_ad} />
          <Toggle name="show_mid_ad"    label="Mid-Page Ad"         description="Between news and YouTube section"       defaultChecked={s.show_mid_ad} />
          <Toggle name="show_bottom_ad" label="Bottom Strip Ad"     description="Narrow strip near page bottom"          defaultChecked={s.show_bottom_ad} />
        </ToggleGroup>

        {/* ── Sidebar Fallback ─────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/40 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Smart Sidebar Fallback</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">When sidebar ads are OFF, auto-fill with this content (xl screens)</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">Left Sidebar Fallback</label>
              <select
                name="left_sidebar_fallback"
                defaultValue={s.left_sidebar_fallback}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="trending">🔥 Trending Stories</option>
                <option value="latest">⚡ Latest News</option>
                <option value="jobs">💼 Jobs Teaser</option>
                <option value="community">🤝 Community Subscribe</option>
                <option value="none">✕ None (collapse)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">Right Sidebar Fallback</label>
              <select
                name="right_sidebar_fallback"
                defaultValue={s.right_sidebar_fallback}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="community">🤝 Community Subscribe</option>
                <option value="latest">⚡ Latest News</option>
                <option value="trending">🔥 Trending Stories</option>
                <option value="jobs">💼 Jobs Teaser</option>
                <option value="none">✕ None (collapse)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Hero Style ───────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/40 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Hero Layout Style</p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="hero_style" value="photo" defaultChecked={s.hero_style === "photo"} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-semibold">Photo Hero</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Full image with gradient overlay text — visually striking</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="hero_style" value="text-split" defaultChecked={s.hero_style === "text-split"} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-semibold">Text-Split (ET Retail)</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Large headline text left, clean image right — premium editorial feel</p>
              </div>
            </label>
          </div>
        </div>

        {/* ── Density ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/40 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Layout Density</p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="layout_density" value="spacious" defaultChecked={s.layout_density === "spacious"} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-semibold">Spacious</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Generous padding, breathing room between sections</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name="layout_density" value="compact" defaultChecked={s.layout_density === "compact"} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-semibold">Compact</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Tighter spacing, more content above the fold</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save Homepage Layout
          </button>
          <p className="text-xs text-muted-foreground">Changes go live within 30 seconds</p>
        </div>
      </form>
    </div>
  )
}
