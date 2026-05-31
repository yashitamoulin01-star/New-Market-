"use client"

import { useState, useRef } from "react"
import { Link2, Upload, X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"

interface Props {
  name: string
  label?: string
  optional?: boolean
  hint?: string
  lang?: "en" | "hi"
}

const inputClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export function ImageUploadInput({ name, label, optional, hint, lang = "en" }: Props) {
  const [mode, setMode] = useState<"link" | "upload">("link")
  const [url, setUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const hi = lang === "hi"

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(hi ? "केवल JPG, PNG, WebP या GIF फ़ाइलें मान्य हैं।" : "Only JPG, PNG, WebP, or GIF files are allowed.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(hi ? "फ़ाइल 5MB से बड़ी नहीं होनी चाहिए।" : "File must be 5MB or smaller.")
      return
    }

    setUploading(true)
    setUploadError(null)
    setPreviewError(false)

    const data = new FormData()
    data.append("file", file)
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: data })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed")
      setUrl(json.url)
    } catch (err: unknown) {
      setUploadError(
        hi
          ? `अपलोड विफल: ${err instanceof Error ? err.message : "कृपया पुनः प्रयास करें"}`
          : `Upload failed: ${err instanceof Error ? err.message : "Please try again"}`
      )
    } finally {
      setUploading(false)
    }
  }

  function clearImage() {
    setUrl("")
    setPreviewError(false)
    setUploadError(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value)
    setPreviewError(false)
  }

  return (
    <div>
      {label && (
        <p className="mb-1 block text-sm font-medium">
          {label}{" "}
          {optional && <span className="text-muted-foreground text-xs">{hi ? "(वैकल्पिक)" : "(optional)"}</span>}
        </p>
      )}

      {/* Mode switcher */}
      <div className="mb-2 flex w-fit rounded-lg border bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => { setMode("link"); clearImage() }}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
            mode === "link" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 size={12} />
          {hi ? "लिंक" : "Link"}
        </button>
        <button
          type="button"
          onClick={() => { setMode("upload"); clearImage() }}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
            mode === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload size={12} />
          {hi ? "अपलोड" : "Upload"}
        </button>
      </div>

      {/* Hidden field that carries the URL to the server action */}
      <input type="hidden" name={name} value={url} />

      {mode === "link" ? (
        <>
          <input
            type="url"
            value={url}
            onChange={handleLinkChange}
            placeholder={hi ? "https://… (सीधा इमेज लिंक)" : "https://… (direct image link)"}
            className={inputClass}
          />
          {url && !previewError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 size={11} /> {hi ? "इमेज URL सेट की गई" : "Image URL set"}
            </p>
          )}
          {url && previewError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle size={11} /> {hi ? "यह URL लोड नहीं हो सकी — जाँचें कि लिंक सही है।" : "This URL could not be loaded — check that the link is correct."}
            </p>
          )}
        </>
      ) : (
        <div>
          {url ? (
            <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span className="flex-1 truncate text-xs text-foreground/80">
                {hi ? "तस्वीर सफलतापूर्वक अपलोड हो गई" : "Image uploaded successfully"}
              </span>
              <button type="button" onClick={clearImage} className="text-muted-foreground hover:text-destructive transition">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed bg-background px-4 py-4 text-sm transition hover:border-primary/50 hover:bg-primary/5 ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <Upload size={18} className="text-muted-foreground" />
              <span className="text-center text-muted-foreground text-xs">
                {uploading
                  ? (hi ? "अपलोड हो रहा है…" : "Uploading…")
                  : (hi ? "JPG, PNG, WebP — अधिकतम 5MB" : "JPG, PNG, WebP — max 5MB")}
              </span>
              <span className="rounded-md border bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80">
                {hi ? "डिवाइस से चुनें" : "Choose from device"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleFile}
                disabled={uploading}
              />
            </label>
          )}
          {uploadError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle size={11} /> {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Image preview — shown when URL is set in either mode */}
      {url && (
        <div className="mt-2 flex items-start gap-2">
          <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-md border bg-muted">
            {previewError ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground/50">
                <ImageIcon size={18} />
                <span className="text-[9px]">{hi ? "लोड नहीं हुई" : "Not loaded"}</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt="preview"
                className="h-full w-full object-cover"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
            )}
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition"
          >
            <X size={12} />{hi ? "हटाएं" : "Remove"}
          </button>
        </div>
      )}

      {hint && !url && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
