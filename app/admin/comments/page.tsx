import Link from "next/link"
import type { Metadata } from "next"
import { MessageSquare, Trash2, Inbox, ExternalLink } from "lucide-react"
import { adminListComments } from "@/lib/supabase/comments"
import { adminDeleteCommentAction } from "./actions"

export const metadata: Metadata = { title: "Newsroom — Comments" }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const { items, total, totalPages } = await adminListComments({
    page: currentPage,
    limit: 30,
  })

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare size={20} className="text-primary" />
        <h1 className="font-heading text-2xl font-bold">Comments</h1>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold text-muted-foreground">
          {total}
        </span>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        All community comments across news articles. Delete spam or abusive content here.
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Inbox size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No comments yet</p>
          <p className="text-sm text-muted-foreground/60">
            Comments will appear here once users start engaging.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((comment) => (
            <div key={comment.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {comment.user_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Header row */}
                  <div className="mb-1 flex flex-wrap items-start gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {comment.user_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      on{" "}
                      <Link
                        href={`/news/${comment.article_slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline"
                      >
                        {comment.article_title.length > 50
                          ? comment.article_title.slice(0, 50) + "…"
                          : comment.article_title}
                        <ExternalLink size={10} />
                      </Link>
                    </span>
                  </div>

                  {/* Comment text */}
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>

                {/* Delete */}
                <form action={adminDeleteCommentAction.bind(null, comment.id)} className="shrink-0">
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 transition hover:bg-red-50"
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/admin/comments?page=${currentPage - 1}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/comments?page=${currentPage + 1}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
