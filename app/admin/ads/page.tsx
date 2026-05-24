import Image from "next/image"
import { Megaphone, Plus, Eye, EyeOff, Trash2 } from "lucide-react"
import { adminListAds, type AdPosition } from "@/lib/supabase/ads"
import { createAdAction, toggleAdAction, deleteAdAction } from "./actions"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Advertisements" }

const POSITIONS: { value: AdPosition; label: string; desc: string }[] = [
  { value: "top",    label: "Top Banner",     desc: "Full-width banner below header" },
  { value: "bottom", label: "Bottom Banner",  desc: "Full-width banner above footer" },
  { value: "middle", label: "Middle Banner",  desc: "Full-width banner between sections" },
  { value: "left",   label: "Left Sidebar",   desc: "Vertical panel on the left (desktop only)" },
  { value: "right",  label: "Right Sidebar",  desc: "Vertical panel on the right (desktop only)" },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminAdsPage() {
  const ads = await adminListAds()

  const grouped = POSITIONS.map((p) => ({
    ...p,
    ads: ads.filter((a) => a.position === p.value),
  }))

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone size={20} className="text-primary" />
          <h1 className="font-heading text-2xl font-bold">Advertisement Manager</h1>
        </div>
        <p className="text-sm text-muted-foreground">{ads.length} ad{ads.length !== 1 ? "s" : ""} total</p>
      </div>

      <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-heading text-base font-bold flex items-center gap-2">
          <Plus size={15} className="text-primary" />
          Add New Advertisement
        </h2>
        <form action={createAdAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Position *</label>
            <select name="position" required className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select position…</option>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Image URL *</label>
            <input name="image_url" type="url" required placeholder="https://…" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Click Link</label>
            <input name="link_url" type="url" placeholder="https://… (optional)" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title / Label</label>
            <input name="title" type="text" placeholder="Optional label" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Display Order</label>
            <input name="display_order" type="number" defaultValue={0} min={0} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition">
              Add Ad
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.value} className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b px-5 py-3">
              <h2 className="font-heading text-sm font-bold">{group.label}</h2>
              <span className="text-xs text-muted-foreground">{group.desc}</span>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {group.ads.length} ad{group.ads.length !== 1 ? "s" : ""}
              </span>
            </div>

            {group.ads.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No ads for this position yet.
              </div>
            ) : (
              <div className="divide-y">
                {group.ads.map((ad) => (
                  <div key={ad.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="relative h-16 w-28 overflow-hidden rounded-md border bg-muted shrink-0">
                      <Image src={ad.image_url} alt={ad.title ?? "Ad"} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ad.title ?? "(no title)"}</p>
                      <p className="text-xs text-muted-foreground truncate">{ad.link_url ?? "No link"}</p>
                      <p className="text-xs text-muted-foreground">Order: {ad.display_order} · Added {formatDate(ad.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        ad.is_active ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                      }`}>
                        {ad.is_active ? "LIVE" : "OFF"}
                      </span>

                      <form action={toggleAdAction.bind(null, ad.id, !ad.is_active)}>
                        <button
                          type="submit"
                          title={ad.is_active ? "Disable" : "Enable"}
                          className={`rounded-lg border p-1.5 text-xs transition ${
                            ad.is_active
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {ad.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </form>

                      <form action={deleteAdAction.bind(null, ad.id)}>
                        <button
                          type="submit"
                          title="Delete"
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
