import type { Metadata } from "next"
import { Megaphone, Eye, EyeOff, Trash2, ExternalLink, Pencil } from "lucide-react"
import { adminListAds } from "@/lib/supabase/ads"
import { AD_SLOT_LABELS, AD_SLOTS } from "@/lib/supabase/ads-defs"
import { toggleAdActiveAction, deleteAdAction, editAdAction } from "./actions"
import { AdCreateForm } from "./ad-create-form"

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

      <AdCreateForm />

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
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${slotAds.some((a) => a.is_active) ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {slotAds.some((a) => a.is_active) ? "Active" : "Empty"}
                </span>
              </div>

              {slotAds.length === 0 ? (
                <p className="px-4 py-4 text-sm text-muted-foreground/60">No ads in this slot.</p>
              ) : (
                <ul className="divide-y">
                  {slotAds.map((ad) => (
                    <li key={ad.id} className={`${!ad.is_active ? "opacity-60" : ""}`}>
                      {/* Main row */}
                      <div className="flex items-start gap-3 px-4 py-3">
                        {/* Thumbnail with fallback */}
                        <div className="h-14 w-[90px] shrink-0 overflow-hidden rounded-md bg-muted border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget
                              target.style.display = "none"
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = `<div class="h-full w-full flex items-center justify-center text-[9px] text-muted-foreground font-medium p-1 text-center">No image</div>`
                              }
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{ad.title}</p>
                          {ad.link_url && (
                            <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-0.5 text-xs text-primary hover:underline mt-0.5">
                              <ExternalLink size={10} />{ad.link_url.replace(/^https?:\/\//, "").slice(0, 45)}
                            </a>
                          )}
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{AD_SLOT_LABELS[ad.slot as keyof typeof AD_SLOT_LABELS] ?? ad.slot}</span>
                            <span>Priority: {ad.priority}</span>
                            <span>Clicks: {ad.click_count}</span>
                            <span>{formatDate(ad.starts_at)} → {formatDate(ad.ends_at)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <form action={toggleAdActiveAction.bind(null, ad.id, !ad.is_active)}>
                            <button type="submit" title={ad.is_active ? "Deactivate" : "Activate"}
                              className={`rounded-lg p-1.5 transition ${ad.is_active ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                              {ad.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                          </form>
                          <form action={deleteAdAction.bind(null, ad.id)}>
                            <button type="submit" title="Delete ad"
                              className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 size={13} />
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Inline edit — collapsible */}
                      <details className="group border-t bg-muted/20">
                        <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors list-none">
                          <Pencil size={10} />
                          Edit Ad
                        </summary>
                        <form action={editAdAction.bind(null, ad.id)} className="px-4 pb-4 pt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Title</label>
                            <input name="title" defaultValue={ad.title}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Image URL</label>
                            <input name="image_url" defaultValue={ad.image_url} placeholder="https://..."
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Link URL</label>
                            <input name="link_url" defaultValue={ad.link_url ?? ""} placeholder="https://..."
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Slot</label>
                            <select name="slot" defaultValue={ad.slot}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30">
                              {AD_SLOTS.map((s) => <option key={s} value={s}>{AD_SLOT_LABELS[s]}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Priority</label>
                            <input name="priority" type="number" defaultValue={ad.priority} min={1} max={100}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Start</label>
                              <input name="starts_at" type="date" defaultValue={ad.starts_at?.slice(0, 10) ?? ""}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-muted-foreground">End</label>
                              <input name="ends_at" type="date" defaultValue={ad.ends_at?.slice(0, 10) ?? ""}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" />
                            </div>
                          </div>
                          <div className="flex items-end sm:col-span-2 lg:col-span-3">
                            <button type="submit"
                              className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </details>
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
