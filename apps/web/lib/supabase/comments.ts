import { createClient } from "./server"

export interface ReactionCounts {
  up: number
  down: number
  userReaction: "up" | "down" | null
}

export async function getArticleReactions(
  articleId: string,
  currentUserId?: string | null
): Promise<ReactionCounts> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("reactions")
    .select("reaction, user_id")
    .eq("target_type", "article")
    .eq("target_id", articleId)

  if (!data) return { up: 0, down: 0, userReaction: null }

  return {
    up:           data.filter((r) => r.reaction === "up").length,
    down:         data.filter((r) => r.reaction === "down").length,
    userReaction: currentUserId
      ? (data.find((r) => r.user_id === currentUserId)?.reaction as "up" | "down" | null) ?? null
      : null,
  }
}
