import { Youtube, BellRing, Newspaper, CheckSquare } from "lucide-react"
import { getAllSiteSettings } from "@/lib/supabase/site-settings"
import {
  updateYouTubeUrlAction,
  updateSiteNoticeAction,
  updateTickerEnabledAction,
} from "./actions"

export const metadata = { title: "Admin — Settings" }

export default async function AdminSettingsPage() {
  let settings: Record<string, string | null> = {}
  try {
    settings = await getAllSiteSettings()
  } catch {
    // Table may not exist yet if migration hasn't run
  }

  const youtubeUrl    = settings["youtube_video_url"] ?? ""
  const siteNotice    = settings["site_notice"] ?? ""
  const tickerEnabled = settings["ticker_enabled"] !== "false"

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure site-wide settings. Changes reflect live within 60 seconds.
        </p>
      </div>

      {/* YouTube Video */}
      <section className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-red-50 p-2">
            <Youtube size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold">Featured YouTube Video</h2>
            <p className="text-xs text-muted-foreground">
              Shown on the homepage beside the election section. Leave blank to hide.
            </p>
          </div>
        </div>
        <form action={updateYouTubeUrlAction} className="space-y-3">
          <input
            name="youtube_url"
            type="url"
            defaultValue={youtubeUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <p className="text-[11px] text-muted-foreground">
            Accepts any YouTube URL: youtube.com/watch?v=ID, youtu.be/ID, or youtube.com/embed/ID
          </p>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save Video URL
          </button>
        </form>
        {youtubeUrl && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600">
            <CheckSquare size={12} /> Currently set: {youtubeUrl}
          </p>
        )}
      </section>

      {/* Site Notice / Ticker Message */}
      <section className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-amber-50 p-2">
            <BellRing size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold">Site Notice</h2>
            <p className="text-xs text-muted-foreground">
              Pinned notice shown at the top of the site. Leave blank to hide.
            </p>
          </div>
        </div>
        <form action={updateSiteNoticeAction} className="space-y-3">
          <textarea
            name="site_notice"
            rows={2}
            defaultValue={siteNotice}
            placeholder="e.g. Market closed on Sunday for Republic Day..."
            className="w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save Notice
          </button>
        </form>
      </section>

      {/* News Ticker */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2">
            <Newspaper size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold">Breaking News Ticker</h2>
            <p className="text-xs text-muted-foreground">
              Show/hide the scrolling news ticker at the top of the homepage.
            </p>
          </div>
        </div>
        <form action={updateTickerEnabledAction} className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="ticker_enabled" value="false" />
            <input
              type="checkbox"
              name="ticker_enabled"
              value="true"
              defaultChecked={tickerEnabled}
              className="h-4 w-4 rounded border-gray-300 accent-primary"
            />
            <span className="text-sm font-medium">Ticker enabled</span>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save
          </button>
        </form>
      </section>
    </div>
  )
}
