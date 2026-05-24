"use client"

import { useState, useRef } from "react"
import { Link2, Upload, X, ImageIcon } from "lucide-react"

interface Props {
  name: string
  label?: string
  optional?: boolean
  hint?: string
  lang?: "en" | "hi"
}

const inputClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

export function ImageUploadInput({ name, label, optional, hint, lang = "en" }: Props) {
  const [mode, setMode] = useState<"link" | "upload">("link")
  const [url, setUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const hi = lang === "hi"

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const data = new FormData()
    data.append("file", file)
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: data })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setUrl(json.url)
    } catch (err: unknown) {
      setUploadError(hi ? "अपलोड विफल" : (err instanceof Error ? err.message : "Upload failed"))
    } finally {
      setUploading(false)
    }
  }

  function clearFile() {
    setUrl("")
    if (fileRef.current) fileRef.current.value = ""
    setUploadError(null)
  }

  return (
    <div>
      {label && (
        <p className="mb-1 block text-sm font-medium">
          {label}{" "}
          {optional && <span className="text-muted-foreground">{hi ? "(वैकल्पिक)" : "(optional)"}</span>}
        </p>
      )}

      <div className="mb-2 flex w-fit rounded-lg border bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => { setMode("link"); setUrl(""); setUploadError(null) }}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
            mode === "link" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 size={12} />
          {hi ? "लिंक" : "Link"}
        </button>
        <button
          type="button"
          onClick={() => { setMode("upload"); setUrl(""); setUploadError(null) }}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
            mode === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload size={12} />
          {hi ? "अपलोड" : "Upload"}
        </button>
      </div>

      <input type="hidden" name={name} value={url} />

      {mode === "link" ? (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={hi ? "https://… (सीधा इमेज लिंक)" : "https://… (direct image link)"}
          className={inputClass}
        />
      ) : (
        <div>
          {url ? (
            <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
              <ImageIcon size={14} className="shrink-0 text-primary" />
              <span className="flex-1 truncate text-xs text-foreground/80">{hi ? "तस्वीर अपलोड हो गई" : "Image uploaded"}</span>
              <button type="button" onClick={clearFile} className="text-muted-foreground hover:text-destructive">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed bg-background px-4 py-3 text-sm transition hover:border-primary/50 hover:bg-primary/5 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
              <Upload size={15} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {uploading ? (hi ? "अपलोड हो रहा है…" : "Uploading…") : (hi ? "डिवाइस से फ़ोटो चुनें" : "Choose photo from device")}
              </span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
          )}
          {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
        </div>
      )}

      {hint && !url && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
