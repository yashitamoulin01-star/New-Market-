import { Youtube, BellRing, Newspaper, CheckSquare, CheckCircle2, AlertCircle } from "lucide-react"
import { getAllSiteSettings } from "@/lib/supabase/site-settings"
import { updateYouTubeUrlAction, updateSiteNoticeAction, updateTickerEnabledAction } from "./actions"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { FontSizeToolbar } from "@/components/ui/font-size-toolbar"

export const metadata = { title: "Admin — Settings" }

const SAVED_MSG: Record<string, string> = {
  youtube: "YouTube video URLs saved successfully.",
  notice:  "Site notice saved successfully.",
  ticker:  "Ticker setting saved successfully.",
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error } = await searchParams

  let settings: Record<string, string | null> = {}
  try {
    settings = await getAllSiteSettings()
  } catch {
    // Table may not exist yet if migration hasn't run
  }

  const rawYoutubeUrl = settings["youtube_video_url"] ?? ""
  const youtubeUrls = rawYoutubeUrl.split(",").map(s => s.trim()).filter(Boolean)
  const siteNotice    = settings["site_notice"] ?? ""
  const tickerEnabled = settings["ticker_enabled"] !== "false"

  return (
    <div className="container max-w-2xl py-8">
      {/* Save / error banner */}
      {saved && SAVED_MSG[saved] && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 size={15} className="shrink-0" />
          {SAVED_MSG[saved]}
        </div>
      )}
      {error === "invalid_youtube" && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          No valid YouTube URLs found. Make sure URLs contain a full youtube.com/watch?v= or youtu.be/ link.
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure site-wide settings. Changes reflect live within 60 seconds.
        </p>
      </div>

      {/* Appearance Settings */}
      <section className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-50 p-2">
            <CheckSquare size={18} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold">Appearance Settings</h2>
            <p className="text-xs text-muted-foreground">
              Configure your local viewing experience.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 pl-12">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">Font Size</p>
            <FontSizeToolbar />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">Dark Theme</p>
            <div className="rounded-full bg-primary/10 p-1">
              <div className="[&>button]:bg-white [&>button]:text-primary [&>button]:border-primary/20 hover:[&>button]:bg-primary/5">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Video */}
      <section className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-red-50 p-2">
            <Youtube size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold">Featured YouTube Videos</h2>
            <p className="text-xs text-muted-foreground">
              Provide up to 3 videos to automatically loop on the homepage. Leave blank to skip.
            </p>
          </div>
        </div>
        <form action={updateYouTubeUrlAction} className="space-y-3">
          <p className="text-xs text-muted-foreground">Paste full YouTube URLs (youtube.com/watch?v=... or youtu.be/...). Invalid URLs are ignored on save.</p>
          <input
            name="youtube_url_1"
            type="text"
            defaultValue={youtubeUrls[0] || ""}
            placeholder="Video 1 URL — https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            name="youtube_url_2"
            type="text"
            defaultValue={youtubeUrls[1] || ""}
            placeholder="Video 2 URL (optional)"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            name="youtube_url_3"
            type="text"
            defaultValue={youtubeUrls[2] || ""}
            placeholder="Video 3 URL (optional)"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save Video URLs
          </button>
        </form>
        {rawYoutubeUrl && (
          <p className="mt-3 flex flex-col gap-1.5 text-[11px] text-emerald-600">
            <span className="flex items-center gap-1.5 font-bold"><CheckSquare size={12} /> Currently set:</span>
            {youtubeUrls.map((u, i) => u ? <span key={i} className="pl-4 text-emerald-600/80">{i+1}. {u}</span> : null)}
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
