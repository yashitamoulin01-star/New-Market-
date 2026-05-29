"use client"

import { Plus } from "lucide-react"
import { AD_SLOT_LABELS, AD_SLOTS } from "@/lib/supabase/ads-defs"
import { createAdAction } from "./actions"
import { ImageUploadInput } from "@/components/ui/image-upload-input"

export function AdCreateForm() {
  return (
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

        <div className="sm:col-span-2">
          <ImageUploadInput
            name="image_url"
            label="Ad Image *"
            hint="Upload a banner image or paste a direct image URL"
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
  )
}
