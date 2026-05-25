"use client"

import { useState } from "react"
import { Pencil, X } from "lucide-react"
import type { NewsArticle } from "@/lib/supabase/news"

interface Props {
  article: Pick<NewsArticle, "id" | "title" | "excerpt" | "content" | "cover_image_url">
  editAction: (id: string, fd: FormData) => Promise<void>
  defaultOpen?: boolean
}

export function EditNewsPanel({ article, editAction, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [pending, setPending] = useState(false)

  async function handleSubmit(fd: FormData) {
    setPending(true)
    await editAction(article.id, fd)
    setPending(false)
    setOpen(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
      >
        {open ? <X size={12} /> : <Pencil size={12} />}
        {open ? "Cancel" : "Edit"}
      </button>

      {open && (
        <form
          action={handleSubmit}
          className="mt-3 space-y-3 rounded-xl border bg-muted/30 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Title</label>
              <input
                name="title"
                defaultValue={article.title}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Excerpt</label>
              <textarea
                name="excerpt"
                defaultValue={article.excerpt ?? ""}
                rows={2}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Cover Image URL</label>
              <input
                name="cover_image_url"
                defaultValue={article.cover_image_url ?? ""}
                placeholder="https://..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Content</label>
              <textarea
                name="content"
                defaultValue={article.content}
                rows={6}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-y font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border px-4 py-1.5 text-xs font-medium transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
