"use client"

import { useState, useRef, useCallback } from "react"
import { Link2, Upload, X, ImageIcon, AlertCircle, CheckCircle2, Plus } from "lucide-react"

interface ImageSlot {
  id: string
  url: string
  mode: "link" | "upload"
  uploading: boolean
  error: string | null
  loadError: boolean
}

interface Props {
  name: string
  label?: string
  lang?: "en" | "hi"
  maxImages?: number
  hint?: string
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

let slotCounter = 0
function newSlot(): ImageSlot {
  return { id: String(++slotCounter), url: "", mode: "link", uploading: false, error: null, loadError: false }
}

export function MultiImageGalleryInput({ name, label, lang = "en", maxImages = 8, hint }: Props) {
  const [slots, setSlots] = useState<ImageSlot[]>([newSlot()])
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const hi = lang === "hi"

  const update = useCallback((id: string, patch: Partial<ImageSlot>) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const removeSlot = useCallback((id: string) => {
    setSlots(prev => {
      const next = prev.filter(s => s.id !== id)
      return next.length === 0 ? [newSlot()] : next
    })
  }, [])

  const addSlot = useCallback(() => {
    setSlots(prev => prev.length < maxImages ? [...prev, newSlot()] : prev)
  }, [maxImages])

  async function handleFile(id: string, file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      update(id, { error: hi ? "केवल JPG, PNG, WebP या GIF मान्य हैं।" : "Only JPG, PNG, WebP, or GIF allowed." })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      update(id, { error: hi ? "फ़ाइल 5MB से बड़ी नहीं होनी चाहिए।" : "File must be 5MB or smaller." })
      return
    }

    update(id, { uploading: true, error: null, loadError: false })
    const data = new FormData()
    data.append("file", file)
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: data })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed")
      update(id, { url: json.url, uploading: false })
    } catch (err: unknown) {
      update(id, {
        uploading: false,
        error: hi
          ? `अपलोड विफल: ${err instanceof Error ? err.message : "पुनः प्रयास करें"}`
          : `Upload failed: ${err instanceof Error ? err.message : "Please try again"}`,
      })
    }
  }

  const filledSlots = slots.filter(s => s.url)

  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      )}

      <div className="space-y-3">
        {slots.map((slot, idx) => (
          <div key={slot.id} className="rounded-lg border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {hi ? `तस्वीर ${idx + 1}` : `Image ${idx + 1}`}
                {idx === 0 && <span className="ml-1 text-primary">{hi ? "(कवर)" : "(cover)"}</span>}
              </span>
              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <div className="flex rounded-md border bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => { update(slot.id, { mode: "link", url: "", error: null, loadError: false }) }}
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition ${
                      slot.mode === "link" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Link2 size={10} />{hi ? "लिंक" : "Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { update(slot.id, { mode: "upload", url: "", error: null, loadError: false }); if (fileRefs.current[slot.id]) fileRefs.current[slot.id]!.value = "" }}
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition ${
                      slot.mode === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Upload size={10} />{hi ? "अपलोड" : "Upload"}
                  </button>
                </div>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="rounded p-0.5 text-muted-foreground hover:text-destructive transition"
                    title={hi ? "हटाएं" : "Remove"}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Hidden input for form submission */}
            {slot.url && <input type="hidden" name={name} value={slot.url} />}

            {slot.mode === "link" ? (
              <input
                type="text"
                value={slot.url}
                onChange={e => update(slot.id, { url: e.target.value, loadError: false })}
                placeholder={hi ? "https://… (सीधा इमेज लिंक)" : "https://… (direct image link)"}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            ) : slot.url ? (
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                <span className="flex-1 truncate text-xs text-foreground/70">
                  {hi ? "तस्वीर अपलोड हो गई" : "Image uploaded"}
                </span>
                <button type="button" onClick={() => { update(slot.id, { url: "", error: null }); if (fileRefs.current[slot.id]) fileRefs.current[slot.id]!.value = "" }} className="text-muted-foreground hover:text-destructive transition">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed bg-background px-4 py-3 text-xs transition hover:border-primary/50 hover:bg-primary/5 ${slot.uploading ? "pointer-events-none opacity-50" : ""}`}>
                <Upload size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  {slot.uploading ? (hi ? "अपलोड हो रहा है…" : "Uploading…") : (hi ? "JPG, PNG, WebP — 5MB तक" : "JPG, PNG, WebP — max 5MB")}
                </span>
                <span className="rounded border bg-muted px-3 py-1 font-medium text-foreground">
                  {hi ? "फ़ाइल चुनें" : "Choose file"}
                </span>
                <input
                  ref={el => { fileRefs.current[slot.id] = el }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  disabled={slot.uploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(slot.id, f) }}
                />
              </label>
            )}

            {slot.error && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle size={10} /> {slot.error}
              </p>
            )}

            {/* Preview */}
            {slot.url && (
              <div className="mt-2 h-24 w-36 overflow-hidden rounded-md border bg-muted">
                {slot.loadError ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground/50">
                    <ImageIcon size={16} />
                    <span className="text-[9px]">{hi ? "लोड नहीं हुई" : "Failed"}</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slot.url}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={() => update(slot.id, { loadError: true })}
                    onLoad={() => update(slot.id, { loadError: false })}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add more */}
      {slots.length < maxImages && (
        <button
          type="button"
          onClick={addSlot}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Plus size={13} />
          {hi ? "और तस्वीर जोड़ें" : "Add More Images"}
        </button>
      )}

      {hint && filledSlots.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}

      {filledSlots.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {hi ? `${filledSlots.length} तस्वीर${filledSlots.length > 1 ? "ें" : ""} चुनी गई` : `${filledSlots.length} image${filledSlots.length > 1 ? "s" : ""} selected`}
        </p>
      )}
    </div>
  )
}
