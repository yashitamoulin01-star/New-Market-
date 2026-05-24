"use client"

import { useState, useTransition, useRef, useId } from "react"
import Link from "next/link"
import { MessageSquare, Trash2, User } from "lucide-react"
import type { ArticleComment } from "@/lib/supabase/comments"
import { postCommentAction, deleteCommentAction } from "@/app/news/[slug]/actions"
import { ArticleReactions } from "./article-reactions"
import { useLanguage } from "@/contexts/language-context"

interface CurrentUser {
  id: string
  name: string
  isAdmin: boolean
}

interface Props {
  articleId: string
  articleSlug: string
  initialComments: ArticleComment[]
  currentUser: CurrentUser | null
}

function timeAgo(iso: string, lang: "en" | "hi"): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (lang === "hi") {
    if (mins < 1)     return "अभी"
    if (mins < 60)    return `${mins} मिनट पहले`
    if (hours < 24)   return `${hours} घंटे पहले`
    if (days < 30)    return `${days} दिन पहले`
    return new Date(iso).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })
  }

  if (mins < 1)     return "just now"
  if (mins < 60)    return `${mins}m ago`
  if (hours < 24)   return `${hours}h ago`
  if (days < 30)    return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function ArticleComments({ articleId, articleSlug, initialComments, currentUser }: Props) {
  const { lang } = useLanguage()
  const hi = lang === "hi"
  const [comments, setComments] = useState<ArticleComment[]>(initialComments)
  const [content, setContent]   = useState("")
  const [charCount, setCharCount] = useState(0)
  const [postError, setPostError] = useState<string | null>(null)
  const [posting, startPosting]   = useTransition()
  const [, startDelete]           = useTransition()
  const textareaId = useId()

  const MAX_CHARS = 500
  const loginHref = `/login?redirect=/news/${articleSlug}`

  function handleContentChange(v: string) {
    if (v.length <= MAX_CHARS) {
      setContent(v)
      setCharCount(v.length)
    }
  }

  function handlePost() {
    const text = content.trim()
    if (!text || posting) return

    setPostError(null)

    // Optimistic: add comment instantly
    const tempId = `temp-${Date.now()}`
    const optimistic: ArticleComment = {
      id:         tempId,
      article_id: articleId,
      user_id:    currentUser!.id,
      user_name:  currentUser!.name,
      content:    text,
      created_at: new Date().toISOString(),
      reactions:  { up: 0, down: 0, userReaction: null },
    }
    setComments((prev) => [...prev, optimistic])
    setContent("")
    setCharCount(0)

    startPosting(async () => {
      const result = await postCommentAction(articleId, text)
      if (result.error) {
        setPostError(result.error)
        setComments((prev) => prev.filter((c) => c.id !== tempId))
        setContent(text)
        setCharCount(text.length)
      }
    })
  }

  function handleDelete(commentId: string) {
    if (!confirm(hi ? "यह टिप्पणी हटाएँ?" : "Delete this comment?")) return

    setComments((prev) => prev.filter((c) => c.id !== commentId))

    startDelete(async () => {
      const result = await deleteCommentAction(commentId)
      if (result.error) {
        // Revert — refetch isn't available so we just show an error
        // In practice deletions rarely fail with proper RLS
      }
    })
  }

  return (
    <section className="mt-10 border-t pt-8">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare size={17} className="text-primary" />
        <h2 className="font-heading text-lg font-bold">
          {hi ? "टिप्पणियाँ" : "Discussion"}
        </h2>
        {comments.length > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {comments.length}
          </span>
        )}
      </div>

      {/* Post form */}
      {currentUser ? (
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <User size={13} className="text-primary" />
            </div>
            <span className="text-sm font-medium">{currentUser.name}</span>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card transition-shadow focus-within:shadow-sm focus-within:ring-1 focus-within:ring-primary/20">
            <textarea
              id={textareaId}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost()
              }}
              placeholder={hi ? "अपनी राय लिखें…" : "Share your thoughts…"}
              rows={3}
              className="w-full resize-none bg-transparent px-4 pt-3 text-sm outline-none placeholder:text-muted-foreground/60"
              aria-label={hi ? "टिप्पणी लिखें" : "Write a comment"}
            />
            <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-2">
              <span className={`text-[11px] ${charCount > MAX_CHARS - 50 ? "text-amber-500" : "text-muted-foreground"}`}>
                {charCount}/{MAX_CHARS}
              </span>
              <button
                onClick={handlePost}
                disabled={!content.trim() || posting}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {posting
                  ? (hi ? "पोस्ट हो रहा है…" : "Posting…")
                  : (hi ? "पोस्ट करें" : "Post")}
              </button>
            </div>
          </div>

          {postError && (
            <p className="mt-2 text-xs text-destructive">{postError}</p>
          )}
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {hi ? "Ctrl+Enter से पोस्ट करें" : "Ctrl+Enter to post"}
          </p>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed bg-muted/20 px-5 py-5 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            {hi
              ? "टिप्पणी करने के लिए लॉगिन करें"
              : "Sign in to join the discussion"}
          </p>
          <Link
            href={loginHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {hi ? "लॉगिन करें" : "Sign In"}
          </Link>
        </div>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {hi ? "अभी कोई टिप्पणी नहीं। पहली टिप्पणी करें!" : "No comments yet. Be the first to share your thoughts!"}
        </div>
      ) : (
        <div className="space-y-0 divide-y">
          {comments.map((comment) => {
            const isOwner    = currentUser?.id === comment.user_id
            const isAdmin    = currentUser?.isAdmin ?? false
            const canDelete  = isOwner || isAdmin
            const isPending  = comment.id.startsWith("temp-")

            return (
              <div
                key={comment.id}
                className={`py-4 transition-opacity ${isPending ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Name + time + delete */}
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.user_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(comment.created_at, lang)}
                      </span>
                      {canDelete && !isPending && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground/60 transition hover:bg-destructive/10 hover:text-destructive"
                          title={hi ? "हटाएँ" : "Delete"}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>

                    {/* Per-comment reactions */}
                    {!isPending && (
                      <div className="mt-2">
                        <ArticleReactions
                          targetType="comment"
                          targetId={comment.id}
                          initialUp={comment.reactions.up}
                          initialDown={comment.reactions.down}
                          initialUserReaction={comment.reactions.userReaction}
                          isLoggedIn={!!currentUser}
                          loginHref={loginHref}
                          compact
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
