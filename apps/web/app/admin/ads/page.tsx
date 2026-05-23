import type { Metadata } from "next"
import { Megaphone, Plus, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react"
import { adminListAds } from "@/lib/supabase/ads"
import { AD_SLOT_LABELS, AD_SLOTS } from "@/lib/supabase/ads-defs"
import { createAdAction, toggleAdActiveAction, deleteAdAction } from "./actions"

export const metadata: Metadata = { title: "Newsroom — Ad Manager" }

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminAdsPage() {
  const ads = await adminListAds()

  const grouped = AD_SLOTS.reduce<Record<string, typeof ads>>((acc, slot) => {
    acc[slot] = ads.filter((a) => a.slot === slot)
    return acc
  }, {})

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Ad Manager</h1>
          <p className="text-sm text-muted-foreground">
            {ads.length} advertisement{ads.length !== 1 ? "s" : ""} across {AD_SLOTS.length} slots
          </p>
        </div>
        <Megaphone size={24} className="text-muted-foreground/30" />
      </div>

      {/* Create form */}
      <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
          <Plus size={14} className="text-primary" />
          Create New Advertisement
        </h2>
        <form action={createAdAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Title *</label>
            <input
              name="title"
              required
              placeholder="Ad title / description"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Image URL *</label>
            <input
              name="image_url"
              required
              placeholder="https://example.com/banner.jpg"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Link URL</label>
            <input
              name="link_url"
              placeholder="https://business.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Placement Slot *</label>
            <select
              name="slot"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
              {AD_SLOTS.map((s) => (
                <option key={s} value={s}>{AD_SLOT_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Priority (higher = shown first)</label>
            <input
              name="priority"
              type="number"
              defaultValue={10}
              min={1}
              max={100}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Start Date</label>
            <input
              name="starts_at"
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">End Date</label>
            <input
              name="ends_at"
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Create Ad
            </button>
          </div>
        </form>
      </div>

      {/* Grouped by slot */}
      <div className="space-y-6">
        {AD_SLOTS.map((slot) => {
          const slotAds = grouped[slot]
          return (
            <div key={slot} className="rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <div>
                  <h3 className="text-sm font-bold">{AD_SLOT_LABELS[slot]}</h3>
                  <p className="text-xs text-muted-foreground">{slotAds.length} ad{slotAds.length !== 1 ? "s" : ""}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${slotAds.some((a) => a.is_active) ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                  {slotAds.some((a) => a.is_active) ? "Active" : "Empty"}
                </span>
              </div>

              {slotAds.length === 0 ? (
                <p className="px-4 py-4 text-sm text-muted-foreground/60">No ads in this slot.</p>
              ) : (
                <ul className="divide-y">
                  {slotAds.map((ad) => (
                    <li key={ad.id} className={`flex items-start gap-3 px-4 py-3 ${!ad.is_active ? "opacity-50" : ""}`}>
                      {/* Thumbnail */}
                      <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        <img src={ad.image_url} alt={ad.title} className="h-full w-full object-cover" />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{ad.title}</p>
                        {ad.link_url && (
                          <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-0.5 text-xs text-primary hover:underline">
                            <ExternalLink size={10} />{ad.link_url.replace(/^https?:\/\//, "").slice(0, 40)}
                          </a>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>Priority: {ad.priority}</span>
                          <span>Clicks: {ad.click_count}</span>
                          <span>{formatDate(ad.starts_at)} → {formatDate(ad.ends_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <form action={toggleAdActiveAction.bind(null, ad.id, !ad.is_active)}>
                          <button
                            type="submit"
                            title={ad.is_active ? "Deactivate" : "Activate"}
                            className={`rounded-lg p-1.5 transition ${ad.is_active ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                          >
                            {ad.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                        </form>
                        <form action={deleteAdAction.bind(null, ad.id)}>
                          <button
                            type="submit"
                            title="Delete ad"
                            className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
