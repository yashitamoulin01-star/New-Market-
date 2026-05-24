"use server"

import { createClient } from "@/lib/supabase/server"

// ── Comments ──────────────────────────────────────────────────────

export async function postCommentAction(
  articleId: string,
  content: string
): Promise<{ error?: string }> {
  const text = content.replace(/<[^>]*>/g, "").trim()

  if (!text)         return { error: "Comment cannot be empty." }
  if (text.length > 500) return { error: "Comments must be under 500 characters." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in to comment." }

  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User"

  const { error } = await supabase.from("article_comments").insert({
    article_id: articleId,
    user_id:    user.id,
    user_name:  userName,
    content:    text,
  })

  if (error) return { error: "Could not post comment. Please try again." }
  return {}
}

export async function deleteCommentAction(
  commentId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated." }

  const { error } = await supabase
    .from("article_comments")
    .delete()
    .eq("id", commentId)

  if (error) return { error: "Could not delete comment." }
  return {}
}

// ── Reactions ─────────────────────────────────────────────────────

export async function toggleReactionAction(
  targetType: "article" | "comment",
  targetId:   string,
  reaction:   "up" | "down"
): Promise<{ up: number; down: number; userReaction: "up" | "down" | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: existing } = await supabase
    .from("reactions")
    .select("id, reaction")
    .eq("user_id",     user.id)
    .eq("target_type", targetType)
    .eq("target_id",   targetId)
    .maybeSingle()

  if (existing) {
    if (existing.reaction === reaction) {
      await supabase.from("reactions").delete().eq("id", existing.id)
    } else {
      await supabase.from("reactions").update({ reaction }).eq("id", existing.id)
    }
  } else {
    await supabase.from("reactions").insert({
      user_id:     user.id,
      target_type: targetType,
      target_id:   targetId,
      reaction,
    })
  }

  const { data: all } = await supabase
    .from("reactions")
    .select("reaction, user_id")
    .eq("target_type", targetType)
    .eq("target_id",   targetId)

  const up   = all?.filter((r) => r.reaction === "up").length   ?? 0
  const down = all?.filter((r) => r.reaction === "down").length ?? 0
  const userR = all?.find((r) => r.user_id === user.id)?.reaction

  return { up, down, userReaction: (userR as "up" | "down") ?? null }
}
